import assert from 'node:assert/strict';
import { test } from 'node:test';
import authHandler, { resetAuthRateLimits } from '../api/auth.js';
import {
  hashPassword,
  verifyPasswordHash,
  signSessionToken,
  verifySessionToken,
} from '../server/sessionToken.js';

const SECRET = 'unit-test-hmac-secret-32-chars-minimum-ok';
const ADMIN_EMAIL = 'admin.demo@example.com';
const SUB_ADMIN_EMAIL = 'subadmin.demo@example.com';
const TEACHER_EMAIL = 'teacher.demo@example.com';
const ADMIN_PASSWORD = 'StrongTestPassword!99';

function createResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    end(body) {
      this.body = body;
    },
  };
}

async function withEnv(overrides, fn) {
  const prev = {};
  for (const [k, v] of Object.entries(overrides)) {
    prev[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  resetAuthRateLimits();
  try {
    await fn();
  } finally {
    for (const [k, v] of Object.entries(prev)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    resetAuthRateLimits();
  }
}

async function withMockFetch(fetchImpl, fn) {
  const prev = globalThis.fetch;
  globalThis.fetch = fetchImpl;
  try {
    await fn();
  } finally {
    globalThis.fetch = prev;
  }
}

async function callAuth(body, { method = 'POST', ip = '203.0.113.10' } = {}) {
  const res = createResponse();
  await authHandler({ method, body, headers: { 'x-forwarded-for': ip } }, res);
  return { status: res.statusCode, headers: res.headers, body: JSON.parse(res.body) };
}

test('Password hashing and HMAC session tokens validate and reject tampering', () => {
  const storedHash = hashPassword(ADMIN_PASSWORD);
  assert.equal(verifyPasswordHash(ADMIN_PASSWORD, storedHash), true);
  assert.equal(verifyPasswordHash('wrong-pass', storedHash), false);
  assert.equal(verifyPasswordHash(ADMIN_PASSWORD, 'plain$bad'), false);

  const token = signSessionToken({ uid: 'u1', email: ADMIN_EMAIL, role: 'super_admin' }, SECRET, 60_000);
  const decoded = verifySessionToken(token, SECRET);
  assert.equal(decoded?.email, ADMIN_EMAIL);
  assert.equal(decoded?.role, 'super_admin');

  assert.equal(verifySessionToken(`${token}tampered`, SECRET), null);
  assert.equal(verifySessionToken(token, 'wrong-secret'), null);

  const expired = signSessionToken({ uid: 'u1', email: ADMIN_EMAIL, role: 'super_admin' }, SECRET, -1000);
  assert.equal(verifySessionToken(expired, SECRET), null);
});

test('POST /api/auth admin_password verifies scrypt hash on server and rejects wrong credentials', async () => {
  const passwordHash = hashPassword(ADMIN_PASSWORD);
  await withEnv({
    CONHI_SESSION_SECRET: SECRET,
    CONHI_ADMIN_EMAILS: ADMIN_EMAIL,
    CONHI_ADMIN_PASSWORD_HASH: passwordHash,
  }, async () => {
    const wrongPass = await callAuth({ mode: 'admin_password', email: ADMIN_EMAIL, password: 'wrong' });
    assert.equal(wrongPass.status, 401);

    const wrongEmail = await callAuth({ mode: 'admin_password', email: 'other@example.com', password: ADMIN_PASSWORD });
    assert.equal(wrongEmail.status, 401);

    const ok = await callAuth({ mode: 'admin_password', email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.session.role, 'super_admin');
    assert.equal(ok.body.session.authMethod, 'admin_password');
    assert.equal(ok.body.session.isAnonymous, true);
    const verified = verifySessionToken(ok.body.token, SECRET);
    assert.equal(verified?.email, ADMIN_EMAIL);
  });
});

test('POST /api/auth google verifies Firebase ID token and maps allowlisted roles', async () => {
  await withEnv({
    CONHI_SESSION_SECRET: SECRET,
    VITE_FIREBASE_API_KEY: 'fake-firebase-api-key',
    CONHI_ADMIN_EMAILS: ADMIN_EMAIL,
    CONHI_SUB_ADMIN_EMAILS: SUB_ADMIN_EMAIL,
    CONHI_ALLOWED_TEACHER_EMAILS: TEACHER_EMAIL,
  }, async () => {
    await withMockFetch(async (_url, options) => {
      const parsed = JSON.parse(options.body);
      if (parsed.idToken === 'valid-sub-token') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ users: [{ localId: 'fb-sub', email: SUB_ADMIN_EMAIL, emailVerified: true }] }),
        };
      }
      if (parsed.idToken === 'valid-teacher-token') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ users: [{ localId: 'fb-teacher', email: TEACHER_EMAIL, emailVerified: true }] }),
        };
      }
      if (parsed.idToken === 'valid-unlisted-token') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ users: [{ localId: 'fb-stranger', email: 'stranger@example.com', emailVerified: true }] }),
        };
      }
      return { ok: false, status: 400, json: async () => ({ error: { message: 'INVALID_ID_TOKEN' } }) };
    }, async () => {
      const invalid = await callAuth({ mode: 'google', idToken: 'bad-token' });
      assert.equal(invalid.status, 401);

      const forbidden = await callAuth({ mode: 'google', idToken: 'valid-unlisted-token' });
      assert.equal(forbidden.status, 403);

      const subOk = await callAuth({ mode: 'google', idToken: 'valid-sub-token' });
      assert.equal(subOk.status, 200);
      assert.equal(subOk.body.session.role, 'sub_admin');
      assert.equal(subOk.body.session.isAnonymous, false);

      const teacherOk = await callAuth({ mode: 'google', idToken: 'valid-teacher-token' });
      assert.equal(teacherOk.status, 200);
      assert.equal(teacherOk.body.session.role, 'teacher');
      assert.ok(verifySessionToken(teacherOk.body.token, SECRET));
    });
  });
});

test('POST /api/auth rejects non-POST methods and rate limits brute force', async () => {
  await withEnv({
    CONHI_SESSION_SECRET: SECRET,
    CONHI_ADMIN_EMAILS: ADMIN_EMAIL,
    CONHI_ADMIN_PASSWORD_HASH: hashPassword(ADMIN_PASSWORD),
  }, async () => {
    const getRes = await callAuth({}, { method: 'GET' });
    assert.equal(getRes.status, 405);

    for (let i = 0; i < 15; i += 1) {
      const attempt = await callAuth(
        { mode: 'admin_password', email: ADMIN_EMAIL, password: `guess-${i}` },
        { ip: '203.0.113.99' }
      );
      assert.equal(attempt.status, 401);
    }
    const throttled = await callAuth(
      { mode: 'admin_password', email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      { ip: '203.0.113.99' }
    );
    assert.equal(throttled.status, 429);
    assert.ok(Number(throttled.headers['retry-after']) >= 1);
  });
});
