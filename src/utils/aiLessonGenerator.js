import { auth } from './firebaseClient.js';

const MAX_TOPIC_LENGTH = 240;

function readText(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`AI trả về thiếu nội dung mục ${field}.`);
  }
  return value.trim();
}

function parseJsonPayload(rawText) {
  const text = String(rawText || '').trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : text;
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  if (firstBrace < 0 || lastBrace <= firstBrace) {
    throw new Error('AI chưa trả về kế hoạch đúng định dạng. Thầy/Cô có thể thử lại.');
  }
  try {
    return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
  } catch {
    throw new Error('AI trả về dữ liệu chưa đọc được. Thầy/Cô có thể thử lại.');
  }
}

export function parseAiLessonResponse(rawText) {
  const result = parseJsonPayload(rawText);
  const objectives = result.objectives || {};
  const materialsNeeded = result.materialsNeeded || {};
  const teachingProcess = result.teachingProcess;
  const rubricCriteria = Array.isArray(result.rubricCriteria)
    ? result.rubricCriteria.filter(item => typeof item === 'string' && item.trim()).slice(0, 6).map(item => item.trim())
    : [];

  if (!Array.isArray(teachingProcess) || teachingProcess.length < 4) {
    throw new Error('AI chưa tạo đủ bốn hoạt động dạy học. Thầy/Cô có thể thử lại.');
  }
  if (rubricCriteria.length < 3) {
    throw new Error('AI chưa tạo đủ tiêu chí nhận xét. Thầy/Cô có thể thử lại.');
  }

  const normalizedMaterials = {
    teacher: readText(materialsNeeded.teacher, 'đồ dùng của giáo viên'),
    student: readText(materialsNeeded.student, 'đồ dùng của học sinh'),
  };
  if (/(lưỡi dao|dao rọc giấy|dao lam|súng bắn keo|keo nến|axit|a-xít)/iu.test(Object.values(normalizedMaterials).join(' '))) {
    throw new Error('AI đề xuất đồ dùng chưa phù hợp học sinh tiểu học. Bản nháp hiện tại được giữ nguyên; hãy thử lại.');
  }

  return {
    objectives: {
      knowledge: readText(objectives.knowledge, 'kiến thức'),
      skills: readText(objectives.skills, 'kĩ năng'),
      qualities: readText(objectives.qualities, 'phẩm chất'),
    },
    materialsNeeded: normalizedMaterials,
    teachingProcess: teachingProcess.slice(0, 4).map((phase, index) => {
      if (!phase || typeof phase !== 'object') {
        throw new Error(`AI trả về hoạt động ${index + 1} chưa đúng định dạng.`);
      }
      const normalized = {
        step: index + 1,
        name: readText(phase.name, `tên hoạt động ${index + 1}`),
        activity: readText(phase.activity, `nội dung hoạt động ${index + 1}`),
      };
      for (const key of ['teacherNote', 'rubricNote']) {
        if (typeof phase[key] === 'string' && phase[key].trim()) normalized[key] = phase[key].trim();
      }
      for (const key of ['fourSteps', 'guidingQuestions']) {
        if (Array.isArray(phase[key])) {
          normalized[key] = phase[key].filter(item => typeof item === 'string' && item.trim()).map(item => item.trim());
        }
      }
      return normalized;
    }),
    rubricCriteria,
  };
}

async function getAuthToken(tokenProvider) {
  const getToken = tokenProvider || (async () => {
    if (!auth?.currentUser) throw new Error('Vui lòng đăng nhập Google trước khi dùng AI.');
    return auth.currentUser.getIdToken();
  });
  const token = await getToken();
  if (!token) throw new Error('Chưa xác thực được phiên Google. Vui lòng đăng nhập lại.');
  return token;
}

export async function requestTeachingAi({ mode = 'text', grade, prompt }, fetchImpl = globalThis.fetch, tokenProvider) {
  if (typeof fetchImpl !== 'function') throw new Error('Trình duyệt hiện không hỗ trợ kết nối AI trực tuyến.');
  const token = await getAuthToken(tokenProvider);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90_000);
  try {
    const response = await fetchImpl('/api/teaching-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ mode, grade: String(grade), prompt }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `AI trực tuyến phản hồi lỗi ${response.status}.`);
    if (typeof data.text !== 'string' || !data.text.trim()) throw new Error('AI chưa trả về nội dung. Thầy/Cô có thể thử lại.');
    return data.text.trim();
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('AI phản hồi quá lâu. Bản nháp hiện tại vẫn được giữ nguyên.');
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateAiLesson({ topic, grade, material, duration, referenceTheme = '' }, fetchImpl = globalThis.fetch, tokenProvider) {
  const cleanTopic = String(topic || '').trim().slice(0, MAX_TOPIC_LENGTH);
  if (!cleanTopic) throw new Error('Vui lòng nhập hoặc chọn một chủ đề trước.');
  if (typeof fetchImpl !== 'function') throw new Error('Trình duyệt hiện không hỗ trợ kết nối AI trực tuyến.');

  const prompt = `Bạn là chuyên gia thiết kế hoạt động Mĩ thuật tiểu học tại Việt Nam. Hãy tự suy nghĩ và viết một kế hoạch cụ thể, giàu hình ảnh, có tính sư phạm cho đúng chủ đề — không sao chép lời mẫu chung chung.\n\n` +
    `Ngữ cảnh: học sinh lớp ${grade}; chủ đề "${cleanTopic}"; chất liệu "${material}"; thời lượng "${duration}"; chủ đề sách tham chiếu (nếu phù hợp): "${String(referenceTheme || '').slice(0, 160)}".\n` +
    `Yêu cầu: dùng tiếng Việt tự nhiên, lời giáo viên có thể nói trực tiếp; điều chỉnh thao tác và vốn từ theo lứa tuổi; đưa ra lựa chọn sáng tạo chứ không ép học sinh làm sản phẩm giống hệt nhau; tính thời gian hợp lý với thời lượng đã cho; gắn mọi bước tạo hình với chính chủ đề và chất liệu. Không bịa số trang, nội dung sách, quy định hay chuẩn đầu ra chính thức. Nội dung là gợi ý dự thảo để giáo viên xem lại.\n\n` +
    `Chỉ trả về JSON hợp lệ, không dùng Markdown, theo cấu trúc: {"objectives":{"knowledge":"...","skills":"...","qualities":"..."},"materialsNeeded":{"teacher":"...","student":"..."},"teachingProcess":[{"name":"Khởi động","activity":"...","teacherNote":"Lời dẫn cụ thể có thể nói với học sinh."},{"name":"Quan sát và khám phá","activity":"...","fourSteps":["Bước 1...","Bước 2...","Bước 3...","Bước 4..."]},{"name":"Thực hành sáng tạo","activity":"...","guidingQuestions":["Câu hỏi gợi mở 1?","Câu hỏi gợi mở 2?","Câu hỏi gợi mở 3?"]},{"name":"Trưng bày và chia sẻ","activity":"...","rubricNote":"..."}],"rubricCriteria":["...","...","..."]}. Mỗi hoạt động phải khác nhau và gắn riêng với chủ đề; lời dẫn không dùng câu rập khuôn kiểu 'các họa sĩ nhí' nếu không tự nhiên.`;

  const body = await requestTeachingAi({ mode: 'lesson', grade, prompt }, fetchImpl, tokenProvider);
  return parseAiLessonResponse(body);
}

function readBlobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Không đọc được ảnh AI vừa tạo.'));
    reader.readAsDataURL(blob);
  });
}

async function imageBlobToDataUrl(blob) {
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Lỗi chuyển đổi ảnh sang dữ liệu.'));
      reader.readAsDataURL(blob);
    });
  }
  if (typeof Buffer !== 'undefined' && typeof blob.arrayBuffer === 'function') {
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mime = blob.type || 'image/jpeg';
    return `data:${mime};base64,${buffer.toString('base64')}`;
  }
  return URL.createObjectURL(blob);
}

export async function generateAiArtwork({ topic, grade, style, seed = null }, fetchImpl = globalThis.fetch, tokenProvider) {
  const cleanTopic = String(topic || '').trim().slice(0, 500);
  if (!cleanTopic) throw new Error('Vui lòng nhập hoặc chọn chủ đề trước khi tạo tranh.');
  const safeGrade = /^[1-5]$/.test(String(grade)) ? String(grade) : '1';
  const safeStyle = ['crayon', 'watercolor', 'paper', 'clay', 'recycled'].includes(style) ? style : 'crayon';

  // Xây dựng prompt thị giác chuẩn mĩ thuật tiểu học bám sát nội dung đã nhập
  const styleDescriptions = {
    crayon: 'tranh vẽ sáp màu ngây thơ tươi sáng, nét sáp dầu đậm đà của học sinh tiểu học Việt Nam',
    watercolor: 'tranh vẽ màu nước trong trẻo, mảng màu mềm mại nghệ thuật, loang màu nhẹ nhàng',
    paper: 'tranh xé dán giấy màu thủ công, các mảng giấy ghép nhiều lớp, phong cách cắt dán sinh động',
    clay: 'tác phẩm tạo hình đất nặn sinh động, khối 3D thủ công đắp nổi trên nền giấy',
    recycled: 'tranh ghép sáng tạo từ vật liệu tự nhiên lá cây, que kem, vỏ hộp tái chế an toàn'
  };
  const stylePrompt = styleDescriptions[safeStyle] || 'tranh vẽ mĩ thuật học sinh tiểu học Việt Nam';
  const imagePrompt = `Tranh vẽ mĩ thuật học sinh tiểu học Việt Nam lớp ${safeGrade}: ${cleanTopic}, chất liệu ${stylePrompt}, khung cảnh sinh động ấm áp, hình vẽ rõ ràng ở trung tâm, màu sắc tươi sáng, tỉ lệ 16:9, không chữ, không số, không watermark, tranh vẽ tay hồn nhiên`;

  const randomSeed = seed !== null ? seed : Math.floor(Math.random() * 1000000);
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1024&height=576&nologo=true&seed=${randomSeed}`;

  // 1. Thử gọi qua fetchImpl nếu được cung cấp (cho cả test mock và browser fetch)
  if (typeof fetchImpl === 'function') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      const res = await fetchImpl(pollinationsUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res && res.ok) {
        const blob = await res.blob();
        if (blob && blob.size && blob.type && blob.type.startsWith('image/')) {
          return await imageBlobToDataUrl(blob);
        }
      }
    } catch (_) {
      // Tiếp tục fallback
    }
  }

  // 2. Thử gọi qua /api/teaching-ai nếu có kết nối và token
  try {
    const token = await getAuthToken(tokenProvider);
    if (token && typeof fetchImpl === 'function') {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const response = await fetchImpl('/api/teaching-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode: 'image', grade: safeGrade, prompt: cleanTopic, style: safeStyle }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (response && response.ok) {
        const blob = await response.blob();
        if (blob && blob.size && blob.type && blob.type.startsWith('image/')) {
          return await imageBlobToDataUrl(blob);
        }
      }
    }
  } catch (_) {}

  // 3. Fallback trực tiếp bằng URL Pollinations (trình duyệt tự tải qua thẻ <img> mượt mà không vướng CORS)
  return pollinationsUrl;
}
