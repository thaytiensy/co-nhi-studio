const AUTH_LOOKUP_URL = 'https://identitytoolkit.googleapis.com/v1/accounts:lookup';
const FIRESTORE_BASE_URL = 'https://firestore.googleapis.com/v1';
const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const NETWORK_TIMEOUT_MS = 30000;

const AUTH_ERROR = 'Không thể xác thực hoặc tài khoản chưa được cấp quyền.';
const UPSTREAM_ERROR = 'Dịch vụ AI hiện không khả dụng. Vui lòng thử lại sau.';
const CONFIG_ERROR = 'Máy chủ AI chưa được cấu hình đầy đủ.';

const unsafeTerms = [
  /\bknife\b/i, /\bknives\b/i, /\brazor\b/i, /\bblade\b/i,
  /\bhot\s*glue\b/i, /\bchemical/i, /\bacid\b/i,
  /\bsolvent/i, /\bgasoline\b/i, /\bdao\b/i, /\bkeo\s*nến/i,
  /\bsúng\s*bắn\s*keo/i, /\blưỡi\s*dao/i, /\blửa\b/i, /\bhóa\s*chất/i,
  /\baxit\b/i, /\bxăng\b/i,
];

const lessonSchema = {
  type: 'object',
  properties: {
    objectives: {
      type: 'object', properties: {
        knowledge: { type: 'string' }, skills: { type: 'string' }, qualities: { type: 'string' },
      }, required: ['knowledge', 'skills', 'qualities'],
    },
    materialsNeeded: {
      type: 'object', properties: { teacher: { type: 'string' }, student: { type: 'string' } },
      required: ['teacher', 'student'],
    },
    teachingProcess: {
      type: 'array', minItems: 4, maxItems: 4,
      items: {
        type: 'object', properties: {
          name: { type: 'string' }, activity: { type: 'string' }, teacherNote: { type: 'string' }, rubricNote: { type: 'string' },
          fourSteps: { type: 'array', minItems: 4, maxItems: 4, items: { type: 'string' } },
          guidingQuestions: { type: 'array', items: { type: 'string' } },
        }, required: ['name', 'activity'],
      },
    },
    rubricCriteria: { type: 'array', minItems: 3, items: { type: 'string' } },
  },
  required: ['objectives', 'materialsNeeded', 'teachingProcess', 'rubricCriteria'],
};

function json(res, status, body) {
  res.statusCode = status;
  if (typeof res.setHeader === 'function') res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify(body));
}

function withTimeout() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NETWORK_TIMEOUT_MS);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

async function fetchJson(url, options) {
  const timeout = withTimeout();
  try {
    return await fetch(url, { ...options, signal: timeout.signal });
  } finally {
    timeout.clear();
  }
}

function firestoreValue(value) {
  if (!value || typeof value !== 'object') return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  return undefined;
}

function documentFields(document) {
  const result = {};
  for (const [key, value] of Object.entries(document?.fields || {})) result[key] = firestoreValue(value);
  return result;
}

async function readRole(projectId, collection, email, idToken) {
  const path = encodeURIComponent(email);
  const url = `${FIRESTORE_BASE_URL}/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${collection}/${path}`;
  try {
    const response = await fetchJson(url, { headers: { Authorization: `Bearer ${idToken}` } });
    if (response.status === 404) return { kind: 'missing' };
    if (!response.ok) return { kind: 'denied' };
    const body = await response.json();
    return { kind: 'found', fields: documentFields(body) };
  } catch {
    return { kind: 'denied' };
  }
}

async function authorize(idToken, firebaseApiKey, projectId) {
  let authResponse;
  try {
    authResponse = await fetchJson(`${AUTH_LOOKUP_URL}?key=${encodeURIComponent(firebaseApiKey)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }),
    });
  } catch { throw new Error('auth'); }
  if (!authResponse.ok) throw new Error('auth');
  let authBody;
  try { authBody = await authResponse.json(); } catch { throw new Error('auth'); }
  const user = authBody?.users?.[0];
  const email = typeof user?.email === 'string' ? user.email.trim().toLowerCase() : '';
  if (user?.emailVerified !== true || !email || typeof user.localId !== 'string' || !user.localId) throw new Error('auth');

  const admin = await readRole(projectId, 'adminRoles', email, idToken);
  if (admin.kind === 'found') {
    const { role, active } = admin.fields;
    if (active === true && (role === 'super_admin' || role === 'sub_admin')) return { email };
    throw new Error('auth');
  }
  if (admin.kind === 'denied') throw new Error('auth');

  const access = await readRole(projectId, 'userAccess', email, idToken);
  if (access.kind !== 'found') throw new Error('auth');
  if (access.fields.email !== email || access.fields.role !== 'teacher' || access.fields.active !== true) throw new Error('auth');
  return { email };
}

function containsUnsafe(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return unsafeTerms.some((term) => term.test(text));
}

function validLesson(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    && value.objectives && typeof value.objectives.knowledge === 'string'
    && typeof value.objectives.skills === 'string' && typeof value.objectives.qualities === 'string'
    && value.materialsNeeded && typeof value.materialsNeeded.teacher === 'string' && typeof value.materialsNeeded.student === 'string'
    && Array.isArray(value.teachingProcess) && value.teachingProcess.length === 4
    && value.teachingProcess.every((item) => item && typeof item.name === 'string' && typeof item.activity === 'string'
      && (item.fourSteps === undefined || (Array.isArray(item.fourSteps) && item.fourSteps.length === 4))
      && (item.guidingQuestions === undefined || Array.isArray(item.guidingQuestions)))
    && Array.isArray(value.rubricCriteria) && value.rubricCriteria.length >= 3;
}

function systemInstruction(mode) {
  const safety = 'Bạn là giáo viên Mỹ thuật tiểu học Việt Nam. Nội dung phải an toàn, phù hợp lứa tuổi, dùng vật liệu phổ biến. Tuyệt đối không yêu cầu trẻ dùng dao rọc giấy, lưỡi dao, dao cạo, keo nến/súng bắn keo, lửa thật, vật nóng, hóa chất, axit, dung môi hoặc xăng; dùng giấy, bút sáp, màu nước, hồ dán nguội và vật liệu tái chế an toàn. Nếu cần cắt giấy, chỉ dùng kéo đầu tròn an toàn dưới sự hướng dẫn của giáo viên; với xé dán chỉ cần xé bằng tay. Chỉ tạo bản nháp để giáo viên duyệt. Không bịa số trang hay nội dung sách giáo khoa.';
  const voice = 'Khi giáo viên chưa yêu cầu cách xưng hô cụ thể, dùng chúng mình/các em; không tự suy đoán tên hay giới tính của giáo viên.';
  return mode === 'lesson' ? `${safety} ${voice} Trả về đúng JSON theo schema; mọi hoạt động cần giáo viên quan sát và hướng dẫn.` : `${safety} ${voice} Viết lời gợi ý nói tự nhiên, cụ thể theo bối cảnh, bằng tiếng Việt; không trả về JSON, không dùng tiêu đề máy móc.`;
}

async function generate(mode, grade, prompt, apiKey) {
  const isLesson = mode === 'lesson';
  const body = {
    systemInstruction: { parts: [{ text: systemInstruction(mode) }] },
    contents: [{ role: 'user', parts: [{ text: `Lớp ${grade}. Yêu cầu của giáo viên: ${prompt}` }] }],
    generationConfig: {
      maxOutputTokens: isLesson ? 4500 : 1800,
      ...(isLesson ? { responseFormat: { text: { mimeType: 'APPLICATION_JSON', schema: lessonSchema } } } : {}),
    },
  };
  const timeout = withTimeout();
  let response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey }, body: JSON.stringify(body), signal: timeout.signal,
    });
  } catch { throw new Error('upstream'); } finally { timeout.clear(); }
  if (!response.ok) throw new Error('upstream');
  let result;
  try { result = await response.json(); } catch { throw new Error('upstream'); }
  const text = result?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
  if (!text || containsUnsafe(text)) throw new Error('upstream');
  if (isLesson) {
    let parsed;
    try { parsed = JSON.parse(text); } catch { throw new Error('upstream'); }
    if (!validLesson(parsed) || containsUnsafe(parsed)) throw new Error('upstream');
    return JSON.stringify(parsed);
  }
  return text;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Phương thức không được hỗ trợ.' });
  const { GEMINI_API_KEY, VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID } = process.env;
  if (!GEMINI_API_KEY || !VITE_FIREBASE_API_KEY || !VITE_FIREBASE_PROJECT_ID) return json(res, 503, { error: CONFIG_ERROR });

  const authorization = req.headers?.authorization || req.headers?.Authorization;
  if (typeof authorization !== 'string' || !/^Bearer\s+\S+$/.test(authorization)) return json(res, 401, { error: AUTH_ERROR });
  const idToken = authorization.replace(/^Bearer\s+/i, '');
  let input;
  try { input = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch { return json(res, 400, { error: 'Dữ liệu yêu cầu không hợp lệ.' }); }
  if (!input || !['lesson', 'text'].includes(input.mode) || typeof input.grade !== 'string' || !/^[1-5]$/.test(input.grade)
    || typeof input.prompt !== 'string' || input.prompt.trim().length === 0 || input.prompt.length > 8000) {
    return json(res, 400, { error: 'Dữ liệu yêu cầu không hợp lệ.' });
  }
  try {
    await authorize(idToken, VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID);
  } catch { return json(res, 403, { error: AUTH_ERROR }); }
  try {
    const text = await generate(input.mode, input.grade, input.prompt.trim(), GEMINI_API_KEY);
    return json(res, 200, { text });
  } catch { return json(res, 502, { error: UPSTREAM_ERROR }); }
}
