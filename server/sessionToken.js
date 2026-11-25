import crypto from 'crypto';

const AUTH_LOOKUP_URL = 'https://identitytoolkit.googleapis.com/v1/accounts:lookup';
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 giờ

function toBase64Url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(str) {
  const padded = String(str).replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  return Buffer.from(padded + '='.repeat(padLen), 'base64');
}

export function hashPassword(password, saltHex = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.scryptSync(String(password), saltHex, 64).toString('hex');
  return `scrypt$${saltHex}$${derived}`;
}

export function verifyPasswordHash(password, storedHash) {
  if (typeof password !== 'string' || typeof storedHash !== 'string') return false;
  const parts = storedHash.trim().split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, saltHex, expectedHex] = parts;
  if (!saltHex || !expectedHex) return false;
  try {
    const actualBuf = crypto.scryptSync(password, saltHex, 64);
    const expectedBuf = Buffer.from(expectedHex, 'hex');
    if (actualBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(actualBuf, expectedBuf);
  } catch {
    return false;
  }
}

export function signSessionToken(payload, secret, ttlMs = DEFAULT_TTL_MS) {
  if (!secret || typeof secret !== 'string') {
    throw new Error('Missing session signing secret');
  }
  const now = Date.now();
  const body = {
    uid: String(payload.uid || ''),
    email: String(payload.email || '').trim().toLowerCase(),
    role: String(payload.role || ''),
    iat: now,
    exp: now + ttlMs,
  };
  const encodedBody = toBase64Url(JSON.stringify(body));
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encodedBody)
    .digest();
  return `${encodedBody}.${toBase64Url(signature)}`;
}

export function verifySessionToken(token, secret) {
  if (!token || typeof token !== 'string' || !secret || typeof secret !== 'string') {
    return null;
  }
  const parts = token.trim().split('.');
  if (parts.length !== 2) return null;
  const [encodedBody, encodedSig] = parts;
  if (!encodedBody || !encodedSig) return null;
  try {
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(encodedBody)
      .digest();
    const actualSig = fromBase64Url(encodedSig);
    if (actualSig.length !== expectedSig.length || !crypto.timingSafeEqual(actualSig, expectedSig)) {
      return null;
    }
    const payload = JSON.parse(fromBase64Url(encodedBody).toString('utf8'));
    if (!payload || typeof payload.email !== 'string' || !payload.email) return null;
    if (typeof payload.exp !== 'number' || payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function verifyFirebaseIdToken(idToken, firebaseApiKey, fetchImpl = globalThis.fetch) {
  if (!idToken || typeof idToken !== 'string' || !firebaseApiKey || typeof fetchImpl !== 'function') {
    return null;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetchImpl(`${AUTH_LOOKUP_URL}?key=${encodeURIComponent(firebaseApiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const data = await response.json().catch(() => null);
    const user = data?.users?.[0];
    const email = typeof user?.email === 'string' ? user.email.trim().toLowerCase() : '';
    if (!user?.localId || !email) return null;
    return {
      uid: user.localId,
      email,
      emailVerified: Boolean(user.emailVerified),
      displayName: user.displayName || '',
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function extractBearerToken(req) {
  const raw = req?.headers?.authorization || req?.headers?.Authorization || '';
  if (typeof raw !== 'string') return '';
  const match = raw.match(/^Bearer\s+(\S+)$/i);
  return match ? match[1] : '';
}

export function getClientIp(req) {
  const xff = req?.headers?.['x-forwarded-for'] || req?.headers?.['X-Forwarded-For'];
  if (typeof xff === 'string' && xff.trim()) {
    return xff.split(',')[0].trim();
  }
  return req?.socket?.remoteAddress || '127.0.0.1';
}

export function parseEmailList(envValue) {
  if (!envValue || typeof envValue !== 'string') return [];
  return envValue
    .split(/[\s,;]+/)
    .map((item) => item.trim().toLowerCase())
    .filter((item) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item));
}
