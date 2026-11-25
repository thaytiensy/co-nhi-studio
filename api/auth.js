import {
  getClientIp,
  parseEmailList,
  signSessionToken,
  verifyFirebaseIdToken,
  verifyPasswordHash,
} from '../server/sessionToken.js';

const MAX_BODY_BYTES = 16 * 1024;
const AUTH_WINDOW_MS = 5 * 60 * 1000; // 5 phút
const MAX_AUTH_ATTEMPTS_PER_IP = 15;
const FIRESTORE_TIMEOUT_MS = 6000;

const authAttemptStore = new Map();

export function resetAuthRateLimits() {
  authAttemptStore.clear();
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader?.('Content-Type', 'application/json; charset=utf-8');
  res.setHeader?.('Cache-Control', 'no-store');
  return res.end(JSON.stringify(body));
}

function checkRateLimit(key, now = Date.now()) {
  const cutoff = now - AUTH_WINDOW_MS;
  const timestamps = (authAttemptStore.get(key) || []).filter((ts) => ts > cutoff);
  if (timestamps.length >= MAX_AUTH_ATTEMPTS_PER_IP) {
    authAttemptStore.set(key, timestamps);
    const oldest = timestamps[0] || now;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + AUTH_WINDOW_MS - now) / 1000));
    return { allowed: false, retryAfterSec };
  }
  timestamps.push(now);
  authAttemptStore.set(key, timestamps);
  if (authAttemptStore.size > 2000) {
    for (const [k, list] of authAttemptStore.entries()) {
      if (!list.some((ts) => ts > cutoff)) authAttemptStore.delete(k);
    }
  }
  return { allowed: true, retryAfterSec: 0 };
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    const serialized = JSON.stringify(req.body);
    if (Buffer.byteLength(serialized || '', 'utf8') > MAX_BODY_BYTES) {
      throw Object.assign(new Error('too_large'), { statusCode: 413 });
    }
    return req.body;
  }
  if (typeof req.body === 'string') {
    if (Buffer.byteLength(req.body, 'utf8') > MAX_BODY_BYTES) {
      throw Object.assign(new Error('too_large'), { statusCode: 413 });
    }
    try {
      return JSON.parse(req.body);
    } catch {
      throw Object.assign(new Error('invalid_json'), { statusCode: 400 });
    }
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    size += buffer.length;
    if (size > MAX_BODY_BYTES) {
      throw Object.assign(new Error('too_large'), { statusCode: 413 });
    }
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw Object.assign(new Error('invalid_json'), { statusCode: 400 });
  }
}

function makeSession({ uid, email, role, title = '', isAnon = false, authMethod = 'google' }) {
  const isOwner = role === 'super_admin';
  const isSubAdmin = role === 'sub_admin';
  return {
    uid: uid || `usr-${Date.now()}`,
    email,
    name: email,
    role,
    adminTitle: title || (isOwner ? 'Admin 1' : isSubAdmin ? 'Admin Phụ' : ''),
    isAnonymous: isAnon,
    authMethod,
    canShareGmail: isOwner || isSubAdmin,
    canManageRoles: isOwner,
    canEditApp: isOwner,
  };
}

function decodeFirestoreDocFields(fields) {
  if (!fields || typeof fields !== 'object') return {};
  const result = {};
  for (const [key, val] of Object.entries(fields)) {
    if (!val || typeof val !== 'object') continue;
    if ('stringValue' in val) result[key] = val.stringValue;
    else if ('booleanValue' in val) result[key] = val.booleanValue;
    else if ('integerValue' in val) result[key] = Number(val.integerValue);
    else if ('doubleValue' in val) result[key] = Number(val.doubleValue);
  }
  return result;
}

async function lookupFirestoreDoc(projectId, collectionName, docId, idToken, fetchImpl) {
  if (!projectId || !idToken || typeof fetchImpl !== 'function') return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FIRESTORE_TIMEOUT_MS);
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${encodeURIComponent(collectionName)}/${encodeURIComponent(docId)}`;
    const response = await fetchImpl(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${idToken}` },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const data = await response.json().catch(() => null);
    if (!data?.fields) return null;
    return decodeFirestoreDocFields(data.fields);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function resolveRoleForVerifiedUser({ email, uid, idToken, fetchImpl }) {
  const adminEmails = parseEmailList(process.env.CONHI_ADMIN_EMAILS);
  if (adminEmails.includes(email)) {
    return makeSession({ uid, email, role: 'super_admin', title: 'Admin 1', isAnon: true, authMethod: 'google' });
  }

  const subAdminEmails = parseEmailList(process.env.CONHI_SUB_ADMIN_EMAILS);
  if (subAdminEmails.includes(email)) {
    return makeSession({ uid, email, role: 'sub_admin', title: 'Admin Phụ', isAnon: false, authMethod: 'google' });
  }

  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || '';
  if (projectId && idToken) {
    const adminDoc = await lookupFirestoreDoc(projectId, 'adminRoles', email, idToken, fetchImpl);
    if (adminDoc && adminDoc.active !== false && ['super_admin', 'sub_admin'].includes(adminDoc.role)) {
      return makeSession({
        uid,
        email,
        role: adminDoc.role,
        title: adminDoc.title || (adminDoc.role === 'super_admin' ? 'Admin 1' : 'Admin Phụ'),
        isAnon: adminDoc.role === 'super_admin',
        authMethod: 'google',
      });
    }
    const accessDoc = await lookupFirestoreDoc(projectId, 'userAccess', email, idToken, fetchImpl);
    if (accessDoc && accessDoc.active !== false) {
      return makeSession({
        uid,
        email,
        role: accessDoc.role || 'teacher',
        title: '',
        isAnon: false,
        authMethod: 'google',
      });
    }
  }

  const teacherEmails = parseEmailList(process.env.CONHI_ALLOWED_TEACHER_EMAILS);
  if (teacherEmails.includes(email)) {
    return makeSession({ uid, email, role: 'teacher', title: '', isAnon: false, authMethod: 'google' });
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Chỉ hỗ trợ POST.' });
  }

  const ip = getClientIp(req);
  const rate = checkRateLimit(`auth:${ip}`);
  if (!rate.allowed) {
    res.setHeader?.('Retry-After', String(rate.retryAfterSec));
    return sendJson(res, 429, { error: 'Quá nhiều yêu cầu xác thực. Vui lòng thử lại sau vài phút.' });
  }

  const sessionSecret = (process.env.CONHI_SESSION_SECRET || '').trim();
  if (!sessionSecret) {
    return sendJson(res, 503, { error: 'Máy chủ chưa cấu hình khóa phiên đăng nhập (CONHI_SESSION_SECRET).' });
  }

  let input;
  try {
    input = await readJsonBody(req);
  } catch (error) {
    return sendJson(res, error.statusCode || 400, { error: 'Dữ liệu đăng nhập không hợp lệ.' });
  }

  const mode = typeof input?.mode === 'string' ? input.mode.trim() : '';

  if (mode === 'google') {
    const idToken = typeof input?.idToken === 'string' ? input.idToken.trim() : '';
    if (!idToken) {
      return sendJson(res, 400, { error: 'Thiếu mã xác thực Google.' });
    }
    const firebaseApiKey = (process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || '').trim();
    if (!firebaseApiKey) {
      return sendJson(res, 503, { error: 'Máy chủ chưa cấu hình xác thực Google Firebase.' });
    }

    const verified = await verifyFirebaseIdToken(idToken, firebaseApiKey);
    if (!verified || !verified.email) {
      return sendJson(res, 401, { error: 'Phiên Google không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.' });
    }

    const session = await resolveRoleForVerifiedUser({
      email: verified.email,
      uid: verified.uid,
      idToken,
      fetchImpl: globalThis.fetch,
    });
    if (!session) {
      return sendJson(res, 403, {
        error: `Tài khoản Google ${verified.email} chưa được cấp quyền truy cập Cọ Nhí Studio. Vui lòng liên hệ quản trị viên.`,
      });
    }

    const token = signSessionToken(
      { uid: session.uid, email: session.email, role: session.role },
      sessionSecret
    );
    return sendJson(res, 200, { session, token });
  }

  if (mode === 'admin_password') {
    const email = typeof input?.email === 'string' ? input.email.trim().toLowerCase() : '';
    const password = typeof input?.password === 'string' ? input.password : '';
    if (!email || !password) {
      return sendJson(res, 400, { error: 'Vui lòng nhập đầy đủ email và mật khẩu quản trị viên.' });
    }

    const adminEmails = parseEmailList(process.env.CONHI_ADMIN_EMAILS);
    const passwordHash = (process.env.CONHI_ADMIN_PASSWORD_HASH || '').trim();
    if (!adminEmails.length || !passwordHash) {
      return sendJson(res, 503, { error: 'Máy chủ chưa cấu hình thông tin xác thực quản trị viên.' });
    }

    const passwordMatches = verifyPasswordHash(password, passwordHash);
    const emailMatches = adminEmails.includes(email);
    if (!emailMatches || !passwordMatches) {
      return sendJson(res, 401, { error: 'Email hoặc mật khẩu quản trị viên không chính xác.' });
    }

    const session = makeSession({
      uid: `admin-${Buffer.from(email).toString('base64url').slice(0, 16)}`,
      email,
      role: 'super_admin',
      title: 'Admin 1',
      isAnon: true,
      authMethod: 'admin_password',
    });
    const token = signSessionToken(
      { uid: session.uid, email: session.email, role: session.role },
      sessionSecret
    );
    return sendJson(res, 200, { session, token });
  }

  return sendJson(res, 400, { error: 'Phương thức xác thực không được hỗ trợ.' });
}
