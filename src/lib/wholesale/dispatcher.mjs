import {createHash, randomUUID} from 'node:crypto';
import {FieldValue, Timestamp} from 'firebase-admin/firestore';
const hash = s => createHash('sha256').update(s).digest('hex');
const active = m => m?.active === true && ['ADMIN','STAFF'].includes(m.role);
export function eventTitle(collection, status) {
  if (collection === 'orders') return ({SUBMITTED:'New order',ACCEPTED:'Order confirmed',DELIVERED:'Order delivered',CANCELLED:'Order cancelled'})[status];
  if (collection === 'attendance') return status === 'PENDING' ? 'Attendance requested' : ['PRESENT','ABSENT','HOLIDAY'].includes(status) ? 'Attendance updated' : undefined;
  if (collection === 'issues' && status === 'OPEN') return 'An issue was reported';
}
export function createDispatcher({db, auth, messaging, now = () => Date.now()}) {
  const base = db.collection('businesses').doc('vicky-wholesale');
  return async function dispatch(request) {
    const reply = (status, body) => Response.json(body, {status,headers:{'Cache-Control':'no-store'}});
    const match = /^Bearer ([^\s]{20,8192})$/.exec(request.headers.get('authorization') ?? '');
    if (!match) return reply(401,{error:'Sign in required.'});
    let user;
    try { user = await auth.verifyIdToken(match[1], true); } catch { return reply(401,{error:'Sign in required.'}); }
    if (!user.email_verified) return reply(403,{error:'Verify your email first.'});
    const actor = await base.collection('members').doc(user.uid).get();
    if (!active(actor.data())) return reply(403,{error:'Active membership required.'});
    // One field query; no composite index required. Work remains durable between requests.
    const pending = await base.collection('_pushRequests').where('status','==','PENDING').limit(10).get();
    let delivered = 0;
    const deadline = now() + 45000;
    for (const job of pending.docs) {
      if (now() >= deadline) break;
      const data = job.data();
      const title = eventTitle(data.collection, data.eventStatus);
      if (!title || !data.createdAt) continue;
      // Same atomic commit cannot broadcast twice by inserting duplicate queue documents.
      const eventId = hash(`${data.collection}/${data.documentId}/${data.eventStatus}/${data.createdAt.seconds}/${data.createdAt.nanoseconds}`);
      const event = base.collection('_pushDeliveries').doc(eventId);
      const owner = randomUUID();
      const lease = await db.runTransaction(async tx => {
        const saved = await tx.get(event);
        if (saved.data()?.done) { tx.update(job.ref,{status:'DONE'}); return false; }
        if ((saved.data()?.leaseUntil?.toMillis() ?? 0) > now()) return false;
        tx.set(event,{owner,leaseUntil:Timestamp.fromMillis(now()+90000)},{merge:true}); return true;
      });
      if (!lease) continue;
      try {
        const members = await base.collection('members').where('active','==',true).get();
        let complete = true;
        for (const m of members.docs) {
          if (!active(m.data())) continue;
          const devices = await m.ref.collection('devices').get();
          for (const device of devices.docs) {
            if (now() >= deadline) { complete = false; break; }
            const d = device.data();
            if (typeof d.token !== 'string' || !['android','ios'].includes(d.platform)) continue;
            const receipt = event.collection('devices').doc(hash(m.id+':'+d.token));
            if ((await receipt.get()).exists) continue;
            const [freshMember,freshDevice] = await Promise.all([m.ref.get(),device.ref.get()]);
            if (!active(freshMember.data()) || freshDevice.data()?.token !== d.token) continue;
            try {
              await messaging.send({token:d.token,data:{eventId,recipientUid:m.id,title},android:{priority:'high',ttl:3600000},
                apns:{headers:{'apns-priority':'10','apns-expiration':String(Math.floor(now()/1000)+3600)},payload:{aps:{alert:{title:'Vicky Wholesale',body:title},sound:'default'}}}});
              await receipt.set({sentAt:FieldValue.serverTimestamp()});
            } catch (e) {
              if (!['messaging/registration-token-not-registered','messaging/invalid-registration-token'].includes(e.code)) throw e;
              await db.runTransaction(async tx => {const saved=await tx.get(device.ref);if(saved.data()?.token===d.token)tx.delete(device.ref);});
            }
          }
          if (!complete) break;
        }
        if (complete) {
          await db.runTransaction(async tx => {const saved=await tx.get(event);if(saved.data()?.owner===owner){tx.set(event,{done:true,leaseUntil:FieldValue.delete()},{merge:true});tx.update(job.ref,{status:'DONE'});}});
          delivered++;
        } else await event.set({leaseUntil:Timestamp.fromMillis(0)},{merge:true});
      } catch {
        await event.set({leaseUntil:Timestamp.fromMillis(0)},{merge:true});
        return reply(503,{error:'Delivery pending; retry later.'});
      }
    }
    return reply(200,{processed:delivered,pending:(await base.collection('_pushRequests').where('status','==','PENDING').limit(1).get()).size>0});
  };
}
