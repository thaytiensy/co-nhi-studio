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
  if (!blob.type.toLowerCase().startsWith('image/svg+xml')) return readBlobAsDataUrl(blob);
  let objectUrl;
  try {
    objectUrl = URL.createObjectURL(blob);
    const image = new Image();
    image.src = objectUrl;
    if (typeof image.decode === 'function') {
      await image.decode();
    } else {
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });
    }
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 540;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('canvas_unavailable');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const png = canvas.toDataURL('image/png');
    if (!png.startsWith('data:image/png')) throw new Error('png_conversion_failed');
    return png;
  } catch {
    throw new Error('Không thể chuyển tranh vector AI thành ảnh PNG để sử dụng.');
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

export async function generateAiArtwork({ topic, grade, style }, fetchImpl = globalThis.fetch, tokenProvider) {
  const cleanTopic = String(topic || '').trim().slice(0, 500);
  if (!cleanTopic) throw new Error('Vui lòng nhập hoặc chọn chủ đề trước khi tạo tranh.');
  if (!/^[1-5]$/.test(String(grade))) throw new Error('Vui lòng chọn khối lớp từ 1 đến 5.');
  if (!['crayon', 'watercolor', 'paper', 'clay', 'recycled'].includes(style)) {
    throw new Error('Chất liệu tạo tranh không hợp lệ.');
  }
  if (typeof fetchImpl !== 'function') throw new Error('Trình duyệt hiện không hỗ trợ kết nối tạo ảnh AI.');

  const token = await getAuthToken(tokenProvider);
  const controller = new AbortController();
  // Máy chủ tự dừng Gemini sau 120 giây; chừa thêm thời gian nhận response/ảnh về trình duyệt.
  const timeoutId = setTimeout(() => controller.abort(), 150_000);
  try {
    const response = await fetchImpl('/api/teaching-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ mode: 'image', grade: String(grade), prompt: cleanTopic, style }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Dịch vụ tạo ảnh AI phản hồi lỗi ${response.status}.`);
    }

    const blob = await response.blob();
    if (!blob.size || !blob.type.startsWith('image/')) {
      throw new Error('AI chưa trả về tệp ảnh hợp lệ. Thầy/Cô có thể thử lại.');
    }
    return await imageBlobToDataUrl(blob);
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('AI tạo ảnh quá lâu. Thầy/Cô có thể thử lại sau.');
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
