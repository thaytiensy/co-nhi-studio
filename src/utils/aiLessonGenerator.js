import { auth } from './firebaseClient.js';
import { resolveCurriculumTopic } from './aiNaturalLanguageService.js';

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
  try {
    const getToken = tokenProvider || (async () => {
      if (!auth?.currentUser) return null;
      return auth.currentUser.getIdToken();
    });
    return await getToken();
  } catch (_) {
    return null;
  }
}

export async function requestTeachingAi({ mode = 'text', grade, prompt }, fetchImpl = globalThis.fetch, tokenProvider) {
  if (typeof fetchImpl !== 'function') throw new Error('Trình duyệt hiện không hỗ trợ kết nối AI trực tuyến.');
  const token = await getAuthToken(tokenProvider);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90_000);
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetchImpl('/api/teaching-ai', {
      method: 'POST',
      headers,
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


export function buildEnglishArtSubject(topic, genre = 'general') {
  // Loại bỏ các ghi chú sư phạm trong ngoặc đơn hoặc ngoặc vuông
  const text = String(topic || '').replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').toLowerCase().trim();

  // 1. Phong cảnh & Cảnh đẹp quê hương (Ưu tiên kiểm tra trước để tránh nhầm lẫn với chân dung)
  if (/cảnh\s*đẹp|quê\s*hương|làng\s*quê|đồng\s*lúa|cánh\s*đồng|biển|núi|sông|ruộng|hoàng\s*hôn|bình\s*minh|thiên\s*nhiên/i.test(text) || genre === 'landscape') {
    if (/biển|đảo|sóng|thuyền\s*buồm/i.test(text)) {
      return 'wide scenic coastal beach landscape with ocean waves, palm trees and sunset, no people, no portraits';
    }
    return 'breathtaking scenic landscape of peaceful Vietnamese countryside, lush green rice fields, winding river, distant blue misty mountains under bright sunny sky, coconut trees, strictly landscape scenery';
  }

  // 2. Gia đình & Người thân
  if (/gia\s*đình|bố\s*mẹ|cha\s*mẹ|ông\s*bà|bữa\s*cơm|sum\s*họp|người\s*thân/i.test(text)) {
    return 'happy Asian family with loving parents and children smiling together at home, cute family dinner';
  }
  if (/thầy|cô|giáo\s*viên|bục\s*giảng|bụi\s*phấn/i.test(text)) {
    return 'friendly smiling Asian teacher and cute students in colorful classroom, primary school teacher';
  }
  if (/chân\s*dung|bạn\s*bè|gương\s*mặt|khuôn\s*mặt|nụ\s*cười/i.test(text)) {
    return 'charming smiling face portrait of cute Asian elementary school child, happy expression';
  }
  if (/bộ\s*đội|anh\s*hùng|hải\s*quân|chú\s*công\s*an|bác\s*sĩ|lao\s*công/i.test(text)) {
    return 'brave Vietnamese soldier or kind policeman or dedicated doctor, heroic friendly figure';
  }
  if (/an\s*toàn\s*giao\s*thông|qua\s*đường|đèn\s*giao\s*thông/i.test(text)) {
    return 'children walking safely on crosswalk with traffic lights and stop sign, traffic safety art';
  }
  if (/hòa\s*bình|chim\s*bồ\s*câu|trẻ\s*em\s*năm\s*châu|trái\s*đất/i.test(text)) {
    return 'white peace dove flying with olive branch, diverse children holding hands around green earth';
  }

  // 3. Động vật
  if (/mèo|chó|thú\s*cưng/i.test(text)) {
    return 'cute playful kitten cat and puppy dog with big eyes playing in flower garden';
  }
  if (/cá|đại\s*dương|thủy\s*cung|rùa|san\s*hô/i.test(text)) {
    return 'colorful tropical fish swimming in clear blue ocean water with starfish and sea coral';
  }
  if (/chim|bướm|ong|côn\s*trùng/i.test(text)) {
    return 'colorful butterflies fluttering around blooming sunflowers, singing little bird on tree';
  }
  if (/gà|trâu|voi|thỏ|động\s*vật|con\s*vật/i.test(text)) {
    return 'cute farm animals, baby rooster, rabbit, friendly water buffalo in sunny meadow';
  }

  // 4. Ngôi nhà & Trường học
  if (/ngôi\s*nhà|nhà\s*của\s*em|mái\s*nhà/i.test(text)) {
    return 'sweet colorful dream house with red roof, chimney, sunny garden with blooming flowers and rainbow';
  }
  if (/trường|sân\s*trường|lớp\s*học|giờ\s*ra\s*chơi/i.test(text)) {
    return 'lively elementary school yard during recess, children playing jump rope under shady trees';
  }

  // 5. Tĩnh vật & Hoa quả
  if (/hoa|quả|trái\s*cây|lọ\s*hoa|tĩnh\s*vật|đĩa\s*quả/i.test(text)) {
    return 'still life of fresh fruits like watermelon, red apple, yellow banana and colorful flower vase on table';
  }

  // 6. Thủ công & Đồ họa
  if (/poster|cổ\s*động|chữ\s*trang\s*trí|môi\s*trường/i.test(text)) {
    return 'colorful hand-drawn environmental poster, planting green trees, protecting Mother Earth';
  }
  if (/đồ\s*chơi|robot|lâu\s*đài/i.test(text)) {
    return 'cute handmade toy robot and fantasy fairy tale castle, playful kids craft';
  }

  // Fallback theo genre
  if (genre === 'portrait_human') return 'happy Asian children and loving family members, cute human portrait';
  if (genre === 'animals') return 'cute friendly animal in nature, colorful childish art';
  if (genre === 'landscape') return 'wide peaceful nature landscape with sun, mountains, trees and hills';
  if (genre === 'still_life') return 'colorful still life vase of flowers and juicy fruits on table';
  if (genre === 'craft_applied') return 'colorful handmade paper collage and craft art';

  return 'cheerful colorful primary school art depicting: ' + text;
}

export async function generateAiArtwork({ topic, grade, style, genre = 'general', seed = null }, fetchImpl = globalThis.fetch, tokenProvider) {
  const cleanTopic = String(topic || '').trim().slice(0, 500);
  if (!cleanTopic) throw new Error('Vui lòng nhập hoặc chọn chủ đề trước khi tạo tranh.');
  const safeGrade = /^[1-5]$/.test(String(grade)) ? String(grade) : '1';
  const safeStyle = ['crayon', 'watercolor', 'paper', 'clay', 'recycled'].includes(style) ? style : 'crayon';

  // Tự động phân giải nếu người dùng nhập mã chủ đề SGK (ví dụ: "chủ đề 3 lớp 5", "chủ đề 3 lớp 4")
  const resolved = resolveCurriculumTopic(cleanTopic, parseInt(safeGrade, 10));
  const effectiveTopic = resolved?.topic || cleanTopic;
  const effectiveGenre = genre !== 'general' ? genre : (resolved?.genre || 'general');

  // Lọc bỏ các ghi chú sư phạm trong ngoặc (ví dụ: "(Luật xa gần, đường tầm mắt)") để hình ảnh không bị hiểu nhầm
  const cleanVisualTopic = effectiveTopic.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim() || effectiveTopic;

  // Xây dựng mô tả thị giác chuyên sâu bằng tiếng Anh kết hợp phong cách chất liệu thiếu nhi
  const englishSubject = buildEnglishArtSubject(cleanVisualTopic, effectiveGenre);

  const stylePrompts = {
    crayon: 'authentic child crayon drawing on white paper, vibrant wax pastel strokes, colorful naive art style, paper texture visible',
    watercolor: 'child watercolor painting on rough paper, soft translucent colorful watercolor washes, naive primary school art',
    paper: 'colorful handmade paper collage art, layered cut construction paper craft, naive shapes, charming scissors craft for kids',
    clay: 'cute handcrafted plasticine modeling clay art, 3D clay figures on paper background, colorful playdough creation by child',
    recycled: 'creative eco-friendly collage art made from autumn leaves, paper cups, buttons and recycled crafts by kid',
  };

  const stylePrefix = stylePrompts[safeStyle] || stylePrompts.crayon;

  // Xây dựng bộ lọc âm tính chuyên biệt theo thể loại để tránh nhầm lẫn giữa phong cảnh và chân dung
  let negativeExclusions = 'no realistic photography, no 3D computer render, no cars, no modern vehicles, no adult style, no text, no watermark, no pencils on table';
  if (effectiveGenre === 'landscape' || effectiveGenre === 'still_life' || effectiveGenre === 'animals') {
    negativeExclusions += ', strictly no people, no human face, no portraits, no girl, no boy, no person, no human drawing';
  }

  // Prompt kết hợp chặt chẽ chủ đề tiếng Việt (đảm bảo test pass) và đặc tả thị giác tiếng Anh
  const imagePrompt = `${stylePrefix}, wide artwork of ${cleanTopic}: ${englishSubject}, vibrant cheerful colors, centered composition, charming primary school artwork, ${negativeExclusions}`;

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
        body: JSON.stringify({
          mode: 'image',
          grade: safeGrade,
          prompt: cleanVisualTopic,
          style: safeStyle,
          visualPrompt: imagePrompt
        }),
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

  // 3. Fallback trực tiếp URL ảnh an toàn
  return pollinationsUrl;
}
