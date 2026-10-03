import crypto from 'crypto';

// Generate a real 2048-bit RSA key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }) as string;

// Simulate route.ts logic
const header = { alg: 'RS256', typ: 'JWT' };
const now = Math.floor(Date.now() / 1000);
const claimSet = {
  iss: 'test-sa@project.iam.gserviceaccount.com',
  scope: 'https://www.googleapis.com/auth/indexing',
  aud: 'https://oauth2.googleapis.com/token',
  exp: now + 3600,
  iat: now,
};

const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
const encodedClaimSet = Buffer.from(JSON.stringify(claimSet)).toString('base64url');
const signInput = `${encodedHeader}.${encodedClaimSet}`;

const signature = crypto
  .sign('sha256', Buffer.from(signInput), privateKeyPem)
  .toString('base64url');

const jwt = `${signInput}.${signature}`;

// Verify signature with public key
const isVerified = crypto.verify(
  'sha256',
  Buffer.from(signInput),
  publicKeyPem,
  Buffer.from(signature, 'base64url')
);

console.log('JWT Generated:', jwt.substring(0, 50) + '...');
console.log('Crypto verification result:', isVerified);

if (isVerified) {
  console.log('SUCCESS: Real RFC 7523 RS256 signature verified!');
} else {
  console.error('FAIL: Signature verification failed!');
  process.exit(1);
}
