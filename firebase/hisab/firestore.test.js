const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const { test, before, after, beforeEach } = require("node:test");
const fs = require("node:fs");

let testEnv;
const PROJECT_ID = process.env.GCP_PROJECT || "demo-no-project";
const ALICE_UID = "alice_123";
const BOB_UID = "bob_456";

const [emulatorHost, emulatorPortStr] = (process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8085").split(":");
const emulatorPort = parseInt(emulatorPortStr, 10);

before(async () => {
  const rules = fs.readFileSync("./firestore.rules", "utf8");
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: emulatorHost,
      port: emulatorPort,
    },
  });
});

after(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
});

test("Unauthenticated user: cannot read user profile", async () => {
  const unauthDb = testEnv.unauthenticatedContext().firestore();
  await assertFails(unauthDb.collection("users").doc(ALICE_UID).get());
});

test("Authenticated user: cannot read another user's profile", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().collection("users").doc(BOB_UID).set({
      userId: BOB_UID,
      email: "bob@example.com",
      displayName: "Bob",
      subscriptionStatus: "free",
      subscriptionPlan: "free",
      subscriptionExpiryEpoch: 0,
      maxWorkers: 3,
      maxClients: 2,
    });
  });

  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
  await assertFails(aliceDb.collection("users").doc(BOB_UID).get());
});

test("Authenticated user: can create their own initial free profile", async () => {
  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
  await assertSucceeds(aliceDb.collection("users").doc(ALICE_UID).set({
    userId: ALICE_UID,
    email: "alice@example.com",
    displayName: "Alice",
    subscriptionStatus: "free",
    subscriptionPlan: "free",
    subscriptionExpiryEpoch: 0,
    validUntil: 0,
    maxWorkers: 3,
    maxClients: 2,
  }));

  await assertSucceeds(aliceDb.collection("users").doc(ALICE_UID).get());
});

test("Security invariant: client cannot create profile with paid or active subscription", async () => {
  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
  await assertFails(aliceDb.collection("users").doc(ALICE_UID).set({
    userId: ALICE_UID,
    email: "alice@example.com",
    displayName: "Alice Hacker",
    subscriptionStatus: "active", // FORBIDDEN: client cannot grant themselves active status
    subscriptionPlan: "business",
    subscriptionExpiryEpoch: 1890000000000,
    maxWorkers: 50,
    maxClients: 50,
  }));
});

test("Security invariant: client cannot update subscription or extend expiry on their profile", async () => {
  // Pre-seed legitimate free profile with rules disabled (simulating backend creation)
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().collection("users").doc(ALICE_UID).set({
      userId: ALICE_UID,
      email: "alice@example.com",
      displayName: "Alice",
      companyName: "Alice Carpentry",
      subscriptionStatus: "free",
      subscriptionPlan: "free",
      subscriptionExpiryEpoch: 0,
      validUntil: 0,
      maxWorkers: 3,
      maxClients: 2,
    });
  });

  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();

  // Attempting to self-grant 'active' status must FAIL
  await assertFails(aliceDb.collection("users").doc(ALICE_UID).update({
    subscriptionStatus: "active",
    subscriptionPlan: "professional",
    subscriptionExpiryEpoch: 1999999999999,
  }));

  // Updating profile details (displayName, companyName) must SUCCEED
  await assertSucceeds(aliceDb.collection("users").doc(ALICE_UID).update({
    displayName: "Alice Master Builder",
    companyName: "Alice Global Construction",
  }));
});

test("Quota enforcement: Free user can create up to 3 workers with bounded slot documents", async () => {
  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();

  // Initialize Free profile
  await aliceDb.collection("users").doc(ALICE_UID).set({
    userId: ALICE_UID,
    email: "alice@example.com",
    displayName: "Alice",
    subscriptionStatus: "free",
    subscriptionPlan: "free",
    subscriptionExpiryEpoch: 0,
    validUntil: 0,
    maxWorkers: 3,
    maxClients: 2,
  });

  // Create Worker 1 in slot_0 via atomic batch
  const batch1 = aliceDb.batch();
  batch1.set(aliceDb.collection("users").doc(ALICE_UID).collection("worker_slots").doc("slot_0"), {
    id: "slot_0",
    slotIndex: 0,
    userId: ALICE_UID,
    workerId: "w1",
    active: true,
  });
  batch1.set(aliceDb.collection("users").doc(ALICE_UID).collection("workers").doc("w1"), {
    id: "w1",
    userId: ALICE_UID,
    name: "Worker One",
    dailyWage: 500.0,
    isActive: true,
    slotId: "slot_0",
    slotIndex: 0,
  });
  await assertSucceeds(batch1.commit());

  const occupiedSlot = aliceDb.collection("users").doc(ALICE_UID).collection("worker_slots").doc("slot_0");
  await assertFails(occupiedSlot.delete());
  await assertFails(occupiedSlot.update({active: false}));

  // Create Worker 2 in slot_1 via atomic batch
  const batch2 = aliceDb.batch();
  batch2.set(aliceDb.collection("users").doc(ALICE_UID).collection("worker_slots").doc("slot_1"), {
    id: "slot_1",
    slotIndex: 1,
    userId: ALICE_UID,
    workerId: "w2",
    active: true,
  });
  batch2.set(aliceDb.collection("users").doc(ALICE_UID).collection("workers").doc("w2"), {
    id: "w2",
    userId: ALICE_UID,
    name: "Worker Two",
    dailyWage: 600.0,
    isActive: true,
    slotId: "slot_1",
    slotIndex: 1,
  });
  await assertSucceeds(batch2.commit());

  // Create Worker 3 in slot_2 via atomic batch
  const batch3 = aliceDb.batch();
  batch3.set(aliceDb.collection("users").doc(ALICE_UID).collection("worker_slots").doc("slot_2"), {
    id: "slot_2",
    slotIndex: 2,
    userId: ALICE_UID,
    workerId: "w3",
    active: true,
  });
  batch3.set(aliceDb.collection("users").doc(ALICE_UID).collection("workers").doc("w3"), {
    id: "w3",
    userId: ALICE_UID,
    name: "Worker Three",
    dailyWage: 700.0,
    isActive: true,
    slotId: "slot_2",
    slotIndex: 2,
  });
  await assertSucceeds(batch3.commit());

  // Attempting to create Worker 4 in slot_3 MUST FAIL (exceeds Free limit of 3)
  const batch4 = aliceDb.batch();
  batch4.set(aliceDb.collection("users").doc(ALICE_UID).collection("worker_slots").doc("slot_3"), {
    id: "slot_3",
    slotIndex: 3,
    userId: ALICE_UID,
    workerId: "w4",
    active: true,
  });
  batch4.set(aliceDb.collection("users").doc(ALICE_UID).collection("workers").doc("w4"), {
    id: "w4",
    userId: ALICE_UID,
    name: "Worker Four",
    dailyWage: 800.0,
    isActive: true,
    slotId: "slot_3",
    slotIndex: 3,
  });
  await assertFails(batch4.commit());
});

test("Direct REST / bypass prevention: creating active worker without valid slot is rejected", async () => {
  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();

  // Direct worker write without any slot document
  await assertFails(aliceDb.collection("users").doc(ALICE_UID).collection("workers").doc("w_unbound").set({
    id: "w_unbound",
    userId: ALICE_UID,
    name: "Direct REST Hacker",
    dailyWage: 500.0,
    isActive: true,
  }));
});

test("Double-create / slot-stealing prevention: cannot overwrite an active worker's slot", async () => {
  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();

  // Create legitimate Worker 1 in slot_0
  const batch1 = aliceDb.batch();
  batch1.set(aliceDb.collection("users").doc(ALICE_UID).collection("worker_slots").doc("slot_0"), {
    id: "slot_0",
    slotIndex: 0,
    userId: ALICE_UID,
    workerId: "w1",
    active: true,
  });
  batch1.set(aliceDb.collection("users").doc(ALICE_UID).collection("workers").doc("w1"), {
    id: "w1",
    userId: ALICE_UID,
    name: "Worker One",
    dailyWage: 500.0,
    isActive: true,
    slotId: "slot_0",
    slotIndex: 0,
  });
  await assertSucceeds(batch1.commit());

  // Attempt to overwrite slot_0 with Worker 2 while Worker 1 is still active MUST FAIL
  const batch2 = aliceDb.batch();
  batch2.set(aliceDb.collection("users").doc(ALICE_UID).collection("worker_slots").doc("slot_0"), {
    id: "slot_0",
    slotIndex: 0,
    userId: ALICE_UID,
    workerId: "w2",
    active: true,
  });
  batch2.set(aliceDb.collection("users").doc(ALICE_UID).collection("workers").doc("w2"), {
    id: "w2",
    userId: ALICE_UID,
    name: "Worker Two Stolen",
    dailyWage: 600.0,
    isActive: true,
    slotId: "slot_0",
    slotIndex: 0,
  });
  await assertFails(batch2.commit());
});

test("Reactivation & deactivation: deactivating a worker frees the slot for another worker", async () => {
  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();

  // 1. Create Worker 1 in slot_0
  const batch1 = aliceDb.batch();
  batch1.set(aliceDb.collection("users").doc(ALICE_UID).collection("worker_slots").doc("slot_0"), {
    id: "slot_0",
    slotIndex: 0,
    userId: ALICE_UID,
    workerId: "w1",
    active: true,
  });
  batch1.set(aliceDb.collection("users").doc(ALICE_UID).collection("workers").doc("w1"), {
    id: "w1",
    userId: ALICE_UID,
    name: "Worker One",
    dailyWage: 500.0,
    isActive: true,
    slotId: "slot_0",
    slotIndex: 0,
  });
  await assertSucceeds(batch1.commit());

  // 2. Deactivate Worker 1
  await assertSucceeds(aliceDb.collection("users").doc(ALICE_UID).collection("workers").doc("w1").update({
    isActive: false,
  }));

  // 3. Now reassigning slot_0 to Worker 2 SUCCEEDS because Worker 1 is deactivated
  const batch2 = aliceDb.batch();
  batch2.set(aliceDb.collection("users").doc(ALICE_UID).collection("worker_slots").doc("slot_0"), {
    id: "slot_0",
    slotIndex: 0,
    userId: ALICE_UID,
    workerId: "w2",
    active: true,
  });
  batch2.set(aliceDb.collection("users").doc(ALICE_UID).collection("workers").doc("w2"), {
    id: "w2",
    userId: ALICE_UID,
    name: "Worker Two",
    dailyWage: 600.0,
    isActive: true,
    slotId: "slot_0",
    slotIndex: 0,
  });
  await assertSucceeds(batch2.commit());
});

test("Client quota: Free user can create 2 clients, 3rd is rejected", async () => {
  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();

  // Client 1 in slot_0
  const batch1 = aliceDb.batch();
  batch1.set(aliceDb.collection("users").doc(ALICE_UID).collection("client_slots").doc("slot_0"), {
    id: "slot_0",
    slotIndex: 0,
    userId: ALICE_UID,
    clientId: "c1",
    active: true,
  });
  batch1.set(aliceDb.collection("users").doc(ALICE_UID).collection("clients").doc("c1"), {
    id: "c1",
    userId: ALICE_UID,
    clientName: "Client One",
    projectName: "Project One",
    totalBudget: 10000.0,
    status: "ACTIVE",
    slotId: "slot_0",
    slotIndex: 0,
  });
  await assertSucceeds(batch1.commit());

  // Client 2 in slot_1
  const batch2 = aliceDb.batch();
  batch2.set(aliceDb.collection("users").doc(ALICE_UID).collection("client_slots").doc("slot_1"), {
    id: "slot_1",
    slotIndex: 1,
    userId: ALICE_UID,
    clientId: "c2",
    active: true,
  });
  batch2.set(aliceDb.collection("users").doc(ALICE_UID).collection("clients").doc("c2"), {
    id: "c2",
    userId: ALICE_UID,
    clientName: "Client Two",
    projectName: "Project Two",
    totalBudget: 20000.0,
    status: "ACTIVE",
    slotId: "slot_1",
    slotIndex: 1,
  });
  await assertSucceeds(batch2.commit());

  // Client 3 in slot_2 MUST FAIL on Free tier (maxClients == 2)
  const batch3 = aliceDb.batch();
  batch3.set(aliceDb.collection("users").doc(ALICE_UID).collection("client_slots").doc("slot_2"), {
    id: "slot_2",
    slotIndex: 2,
    userId: ALICE_UID,
    clientId: "c3",
    active: true,
  });
  batch3.set(aliceDb.collection("users").doc(ALICE_UID).collection("clients").doc("c3"), {
    id: "c3",
    userId: ALICE_UID,
    clientName: "Client Three",
    projectName: "Project Three",
    totalBudget: 30000.0,
    status: "ACTIVE",
    slotId: "slot_2",
    slotIndex: 2,
  });
  await assertFails(batch3.commit());
});

test("Stale-expiry / downgrade: expired subscription defaults to Free limits (rejects higher slots)", async () => {
  // Pre-seed an EXPIRED professional plan
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().collection("users").doc(ALICE_UID).set({
      userId: ALICE_UID,
      email: "alice@example.com",
      displayName: "Alice",
      subscriptionStatus: "active",
      subscriptionPlan: "professional",
      validUntil: 1000, // Long expired in the past!
      subscriptionExpiryEpoch: 1000,
      maxWorkers: 25,
      maxClients: 15,
    });
  });

  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();

  // Trying to use slot_5 (which would be valid for active Pro) MUST FAIL because subscription is expired!
  const batch = aliceDb.batch();
  batch.set(aliceDb.collection("users").doc(ALICE_UID).collection("worker_slots").doc("slot_5"), {
    id: "slot_5",
    slotIndex: 5,
    userId: ALICE_UID,
    workerId: "w_expired_pro",
    active: true,
  });
  batch.set(aliceDb.collection("users").doc(ALICE_UID).collection("workers").doc("w_expired_pro"), {
    id: "w_expired_pro",
    userId: ALICE_UID,
    name: "Expired Pro Worker",
    dailyWage: 500.0,
    isActive: true,
    slotId: "slot_5",
    slotIndex: 5,
  });
  await assertFails(batch.commit());
});

test("Cross-account writes: Bob cannot read or write Alice's workers or slots", async () => {
  const bobDb = testEnv.authenticatedContext(BOB_UID).firestore();

  // Bob tries to read Alice's slot
  await assertFails(bobDb.collection("users").doc(ALICE_UID).collection("worker_slots").doc("slot_0").get());

  // Bob tries to write to Alice's worker_slots
  await assertFails(bobDb.collection("users").doc(ALICE_UID).collection("worker_slots").doc("slot_0").set({
    id: "slot_0",
    slotIndex: 0,
    userId: ALICE_UID,
    workerId: "w_bob",
    active: true,
  }));
});

test("Schema validation: rejects worker with negative daily wage", async () => {
  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
  await assertFails(aliceDb.collection("users").doc(ALICE_UID).collection("workers").doc("w_invalid").set({
    id: "w_invalid",
    userId: ALICE_UID,
    name: "Bad Data",
    dailyWage: -100.0,
    isActive: true,
  }));
});
