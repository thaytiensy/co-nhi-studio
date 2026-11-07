const AUTH_LOOKUP_URL = 'https://identitytoolkit.googleapis.com/v1/accounts:lookup';
const FIRESTORE_BASE_URL = 'https://firestore.googleapis.com/v1';
const GEMINI_MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
const GEMINI_MODEL = GEMINI_MODELS[0];
const NETWORK_TIMEOUT_MS = 30000;
const GEMINI_IMAGE_MODEL = 'gemini-nano-banana-2.1';
const IMAGE_NETWORK_TIMEOUT_MS = 120000;

const IMAGE_STYLES = {
  crayon: { material: 'sáp màu hoặc chì màu', style: 'nét vẽ sáp màu/chì màu rõ ràng, màu tươi sáng' },
  watercolor: { material: 'màu nước hoặc màu dạ', style: 'mảng màu nước trong trẻo, mềm mại trên giấy vẽ' },
  paper: { material: 'giấy màu xé dán và thủ công', style: 'tranh cắt/xé dán giấy nhiều lớp, hình khối rõ ràng' },
  clay: { material: 'đất nặn tạo khối', style: 'tạo hình đất nặn thân thiện, bề mặt có chất liệu thủ công' },
  recycled: { material: 'vật liệu tái chế an toàn', style: 'tranh ghép tạo hình từ lá cây, vỏ hộp và vật liệu tái sử dụng an toàn' },
};

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
    lessonTitle: { type: 'string' },
    differentiatedMissions: {
      type: 'object',
      properties: {
        tier1_basic: { type: 'string' },
        tier2_standard: { type: 'string' },
        tier3_advanced: { type: 'string' },
      },
    },
  },
  required: ['objectives', 'materialsNeeded', 'teachingProcess', 'rubricCriteria'],
};

const vectorSceneSchema = {
  type: 'object',
  properties: {
    background: { type: 'string', description: 'A six-digit hexadecimal color such as #DDF3FF.' },
    elements: {
      type: 'array', minItems: 8, maxItems: 80,
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['rect', 'circle', 'ellipse', 'line', 'polygon'] },
          x: { type: 'number' }, y: { type: 'number' }, width: { type: 'number' }, height: { type: 'number' },
          cx: { type: 'number' }, cy: { type: 'number' }, r: { type: 'number' }, rx: { type: 'number' }, ry: { type: 'number' },
          x1: { type: 'number' }, y1: { type: 'number' }, x2: { type: 'number' }, y2: { type: 'number' },
          fill: { type: 'string' }, stroke: { type: 'string' }, strokeWidth: { type: 'number' },
          points: {
            type: 'array', minItems: 3, maxItems: 20,
            items: { type: 'object', properties: { x: { type: 'number' }, y: { type: 'number' } }, required: ['x', 'y'] },
          },
        },
        required: ['type'],
      },
    },
  },
  required: ['background', 'elements'],
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
  const grantedEmail = typeof access.fields.email === 'string' ? access.fields.email.trim().toLowerCase() : '';
  if (grantedEmail !== email || access.fields.role !== 'teacher' || access.fields.active !== true) throw new Error('auth');
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
      ...(isLesson ? { responseMimeType: 'application/json', responseSchema: lessonSchema } : {}),
    },
  };

  let lastErrorDetail = '';
  for (const model of GEMINI_MODELS) {
    const timeout = withTimeout();
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify(body),
        signal: timeout.signal,
      });
      if (response.ok) {
        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
        if (text && !containsUnsafe(text)) {
          if (isLesson) {
            let parsed;
            try { parsed = JSON.parse(text); } catch { continue; }
            if (validLesson(parsed) && !containsUnsafe(parsed)) {
              return JSON.stringify(parsed);
            }
          } else {
            return text;
          }
        }
      } else {
        const errText = await response.text().catch(() => '');
        lastErrorDetail += ` [${model} HTTP ${response.status}: ${errText.slice(0, 150)}]`;
        console.warn(`Gemini model ${model} returned ${response.status}:`, errText.slice(0, 200));
      }
    } catch (err) {
      lastErrorDetail += ` [${model} network: ${err?.message}]`;
      console.warn(`Gemini model ${model} network error:`, err?.message);
    } finally {
      timeout.clear();
    }
  }

  throw new Error(lastErrorDetail || 'upstream');
}

function boundedNumber(value, min, max) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function safeSvgColor(value) {
  if (value === 'none') return 'none';
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : null;
}

function svgNumber(value) {
  return String(Number(value.toFixed(2)));
}

function renderVectorElement(element) {
  if (!element || typeof element !== 'object' || Array.isArray(element)) return null;
  const fill = safeSvgColor(element.fill) || 'none';
  const stroke = safeSvgColor(element.stroke) || 'none';
  const strokeWidth = boundedNumber(element.strokeWidth, 0.5, 24) ? svgNumber(element.strokeWidth) : '2';
  const paint = `fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"`;

  if (element.type === 'rect'
    && boundedNumber(element.x, 0, 960) && boundedNumber(element.y, 0, 540)
    && boundedNumber(element.width, 1, 960) && boundedNumber(element.height, 1, 540)
    && element.x + element.width <= 960 && element.y + element.height <= 540
    && (fill !== 'none' || stroke !== 'none')) {
    return `<rect x="${svgNumber(element.x)}" y="${svgNumber(element.y)}" width="${svgNumber(element.width)}" height="${svgNumber(element.height)}" ${paint}/>`;
  }
  if (element.type === 'circle'
    && boundedNumber(element.cx, 0, 960) && boundedNumber(element.cy, 0, 540)
    && boundedNumber(element.r, 1, 270) && (fill !== 'none' || stroke !== 'none')) {
    return `<circle cx="${svgNumber(element.cx)}" cy="${svgNumber(element.cy)}" r="${svgNumber(element.r)}" ${paint}/>`;
  }
  if (element.type === 'ellipse'
    && boundedNumber(element.cx, 0, 960) && boundedNumber(element.cy, 0, 540)
    && boundedNumber(element.rx, 1, 480) && boundedNumber(element.ry, 1, 270)
    && (fill !== 'none' || stroke !== 'none')) {
    return `<ellipse cx="${svgNumber(element.cx)}" cy="${svgNumber(element.cy)}" rx="${svgNumber(element.rx)}" ry="${svgNumber(element.ry)}" ${paint}/>`;
  }
  if (element.type === 'line'
    && boundedNumber(element.x1, 0, 960) && boundedNumber(element.y1, 0, 540)
    && boundedNumber(element.x2, 0, 960) && boundedNumber(element.y2, 0, 540)
    && stroke !== 'none') {
    return `<line x1="${svgNumber(element.x1)}" y1="${svgNumber(element.y1)}" x2="${svgNumber(element.x2)}" y2="${svgNumber(element.y2)}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`;
  }
  if (element.type === 'polygon' && Array.isArray(element.points)
    && element.points.length >= 3 && element.points.length <= 20
    && element.points.every(point => point && boundedNumber(point.x, 0, 960) && boundedNumber(point.y, 0, 540))
    && (fill !== 'none' || stroke !== 'none')) {
    const points = element.points.map(point => `${svgNumber(point.x)},${svgNumber(point.y)}`).join(' ');
    return `<polygon points="${points}" ${paint}/>`;
  }
  return null;
}

function renderVectorScene(scene) {
  const background = safeSvgColor(scene?.background);
  if (!background || background === 'none' || !Array.isArray(scene?.elements)) throw new Error('vector_invalid');
  const elements = scene.elements.map(renderVectorElement).filter(Boolean);
  if (elements.length < 8 || elements.length > 80) throw new Error('vector_invalid');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><rect x="0" y="0" width="960" height="540" fill="${background}"/>${elements.join('')}</svg>`;
}

async function generateVectorArtwork({ grade, prompt, style }, apiKey) {
  const topic = prompt.trim();
  const styleDetails = IMAGE_STYLES[style];
  if (!styleDetails || containsUnsafe(topic)) throw new Error('invalid_image_request');
  const vectorPrompt = `Tạo bản vẽ vector ngang 16:9 cho học sinh lớp ${grade}. Đề tài giáo viên yêu cầu (giữ đúng các chủ thể, hành động và bối cảnh được nêu): "${topic}". Gợi ý chất liệu/phong cách: ${styleDetails.material}; ${styleDetails.style}. Hãy tự thiết kế bố cục có tiền cảnh, trung cảnh hoặc hậu cảnh khi phù hợp; dùng nhiều hình cơ bản nhiều màu để chủ thể nhận ra rõ, sinh động, thân thiện với trẻ em. Chỉ trả scene graph theo JSON Schema. Không tạo chữ, số, URL, mã SVG, CSS, script, gradient hay thuộc tính ngoài schema.`;
  let response;
  try {
    response = await fetchJson(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: 'Bạn thiết kế tranh vector an toàn cho học sinh tiểu học Việt Nam. Hãy giữ đúng chủ đề giáo viên yêu cầu; đầu ra chỉ là dữ liệu hình học, không có chữ hay mã có thể thực thi.' }] },
        contents: [{ role: 'user', parts: [{ text: vectorPrompt }] }],
        generationConfig: {
          maxOutputTokens: 3000,
          responseFormat: { text: { mimeType: 'APPLICATION_JSON', schema: vectorSceneSchema } },
        },
      }),
    });
  } catch {
    throw new Error('vector_upstream');
  }
  if (response.status === 429) throw new Error('vector_quota_exhausted');
  if (!response.ok) throw new Error('vector_upstream');
  let result;
  try { result = await response.json(); } catch { throw new Error('vector_invalid'); }
  const text = result?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim();
  if (!text || containsUnsafe(text)) throw new Error('vector_invalid');
  let scene;
  try { scene = JSON.parse(text); } catch { throw new Error('vector_invalid'); }
  return renderVectorScene(scene);
}

async function generateImage({ grade, prompt, style }, apiKey) {
  const topic = prompt.trim();
  const styleDetails = IMAGE_STYLES[style];
  if (!styleDetails || containsUnsafe(topic)) throw new Error('invalid_image_request');

  const imagePrompt = `Tạo một tranh minh họa Mĩ thuật tiểu học Việt Nam, khung ngang 16:9, phù hợp học sinh lớp ${grade}. Bám sát đúng chủ đề: "${topic}". Chất liệu: ${styleDetails.material}. Phong cách: ${styleDetails.style}. Hình ảnh trong sáng, nét vẽ ngây thơ của học sinh tiểu học, không chữ, không số, không watermark.`;

  // 1. Thử gọi Pollinations.ai API chất lượng cao (100% Free, bám sát nội dung đã nhập)
  try {
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1024&height=576&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
    const pollResp = await fetch(pollinationsUrl);
    if (pollResp && pollResp.ok) {
      const buffer = Buffer.from(await pollResp.arrayBuffer());
      if (buffer && buffer.length > 2000) {
        return { buffer, mimeType: 'image/jpeg' };
      }
    }
  } catch (e) {
    console.warn('Pollinations fetch failed in backend:', e);
  }

  // 2. Thử gọi qua Gemini nếu có apiKey
  if (apiKey) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20000);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: imagePrompt }] }]
        }),
        signal: controller.signal
      });
      clearTimeout(timer);
      if (response && response.ok) {
        const result = await response.json().catch(() => ({}));
        const imagePart = result?.candidates?.[0]?.content?.parts?.find(part =>
          typeof part?.inlineData?.data === 'string' && part.inlineData.mimeType?.startsWith('image/')
        );
        if (imagePart) {
          const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
          return { buffer, mimeType: imagePart.inlineData.mimeType };
        }
      }
    } catch (_) {}
  }

  throw new Error('image_upstream');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Phương thức không được hỗ trợ.' });
  let input;
  try { input = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch { return json(res, 400, { error: 'Dữ liệu yêu cầu không hợp lệ.' }); }
  const { GEMINI_API_KEY, VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID } = process.env;
  const effectiveApiKey = (typeof input?.apiKey === 'string' && input.apiKey.startsWith('AIzaSy')) ? input.apiKey.trim() : GEMINI_API_KEY;
  if (!effectiveApiKey || !VITE_FIREBASE_API_KEY || !VITE_FIREBASE_PROJECT_ID) return json(res, 503, { error: CONFIG_ERROR });

  if (input?.mode === 'debug_models') {
    try {
      const resModels = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(effectiveApiKey)}`);
      const data = await resModels.json();
      return json(res, 200, { models: data.models?.map(m => m.name) || data });
    } catch (e) {
      return json(res, 500, { error: e.message });
    }
  }
  const validTextRequest = ['lesson', 'text'].includes(input?.mode)
    && typeof input.prompt === 'string' && input.prompt.trim().length > 0 && input.prompt.length <= 8000;
  const validImageRequest = input?.mode === 'image'
    && typeof input.prompt === 'string' && input.prompt.trim().length > 0 && input.prompt.length <= 500
    && typeof input.style === 'string' && Object.hasOwn(IMAGE_STYLES, input.style)
    && !containsUnsafe(input.prompt);
  if (!input || !['lesson', 'text', 'image'].includes(input.mode) || typeof input.grade !== 'string' || !/^[1-5]$/.test(input.grade)
    || (!validTextRequest && !validImageRequest)) {
    return json(res, 400, { error: 'Dữ liệu yêu cầu không hợp lệ.' });
  }

  // Tùy chọn xác thực nâng cao nếu người dùng cung cấp token
  const authorization = req.headers?.authorization || req.headers?.Authorization;
  if (typeof authorization === 'string' && /^Bearer\s+\S+$/.test(authorization)) {
    const idToken = authorization.replace(/^Bearer\s+/i, '');
    if (idToken && idToken !== 'null' && idToken !== 'undefined' && VITE_FIREBASE_API_KEY && VITE_FIREBASE_PROJECT_ID) {
      try {
        await authorize(idToken, VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID);
      } catch (err) {
        console.warn('Firebase token authorization warning:', err.message);
      }
    }
  }

  if (input.mode === 'image') {
    try {
      const image = await generateImage(input, GEMINI_API_KEY);
      res.statusCode = 200;
      if (typeof res.setHeader === 'function') {
        res.setHeader('Content-Type', image.mimeType);
        res.setHeader('Content-Length', image.buffer.length);
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('X-Content-Type-Options', 'nosniff');
      }
      return res.end(image.buffer);
    } catch (error) {
      if (error?.message === 'image_quota_exhausted') {
        try {
          const svg = Buffer.from(await generateVectorArtwork(input, GEMINI_API_KEY), 'utf8');
          res.statusCode = 200;
          if (typeof res.setHeader === 'function') {
            res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
            res.setHeader('Content-Length', svg.length);
            res.setHeader('Cache-Control', 'no-store');
            res.setHeader('X-Content-Type-Options', 'nosniff');
          }
          return res.end(svg);
        } catch (fallbackError) {
          if (fallbackError?.message === 'vector_quota_exhausted') {
            return json(res, 429, { error: 'Gemini đang giới hạn cả lượt tạo tranh và tạo tranh vector AI. Tranh chưa được tạo; vui lòng thử lại sau hoặc nhờ quản trị viên kiểm tra hạn mức.' });
          }
          return json(res, 502, { error: 'Chưa tạo được tranh ảnh hoặc tranh vector AI lần này. Vui lòng thử lại sau.' });
        }
      }
      return json(res, 502, { error: 'Chưa tạo được tranh AI. Hãy thử lại sau hoặc kiểm tra kết nối AI của ứng dụng.' });
    }
  }

  try {
    const text = await generate(input.mode, input.grade, input.prompt.trim(), effectiveApiKey);
    return json(res, 200, { text });
  } catch (err) { return json(res, 502, { error: UPSTREAM_ERROR, detail: err?.message }); }
}
