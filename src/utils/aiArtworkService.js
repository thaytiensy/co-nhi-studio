import { resolveCurriculumTopic } from './aiNaturalLanguageService.js';

const STYLE_PROMPTS = {
  crayon: 'authentic child crayon drawing on white paper, vibrant wax pastel strokes, colorful naive art style, paper texture visible',
  watercolor: 'child watercolor painting on rough paper, soft translucent colorful watercolor washes, naive primary school art',
  paper: 'colorful handmade paper collage art, layered cut construction paper craft, naive shapes, charming scissors craft for kids',
  clay: 'cute handcrafted plasticine modeling clay art, 3D clay figures on paper background, colorful playdough creation by child',
  recycled: 'creative eco-friendly collage art made from autumn leaves, paper cups, buttons and recycled crafts by kid',
};

const TOPIC_ENGLISH_MAP = [
  { match: /gia\s*đình|bữa\s*cơm|ông\s*bà|cha\s*mẹ|tổ\s*ấm/i, desc: 'happy loving Vietnamese family gathering together at home, parents and children smiling, cozy dinner table, warm loving household' },
  { match: /cảnh\s*đẹp\s*quê\s*hương|quê\s*hương|làng\s*quê|đồng\s*lúa|phong\s*cảnh|sông\s*núi/i, desc: 'peaceful Vietnamese countryside landscape, lush green rice fields, winding river, distant hills, rustic village houses, bamboo trees, warm sunlight, scenic open nature with linear perspective depth' },
  { match: /trường|lớp\s*học|thầy\s*cô|bạn\s*bè|sân\s*trường/i, desc: 'vibrant Vietnamese primary school campus, cheerful pupils playing in the schoolyard, green trees, school gate' },
  { match: /biển|đại\s*dương|vịnh\s*hạ\s*long|thuyền|bãi\s*biển/i, desc: 'tropical Vietnamese sea coastline, ocean waves, wooden fishing boats, sandy beach, palm trees' },
  { match: /lễ\s*hội|trung\s*thu|ngày\s*tết|múa\s*lân/i, desc: 'traditional Vietnamese folk festival celebration, colorful lanterns, cheerful village community' },
  { match: /xe\s*cộ|ô\s*tô|giao\s*thông|phố\s*xá/i, desc: 'city street traffic, cars, bicycles, urban road' },
  { match: /mèo|chó|gà|vịt|chim|cá|con\s*vật|động\s*vật/i, desc: 'cute playful animal pet in nature' },
  { match: /hoa|vườn\s*hoa|cây\s*cối|hoa\s*quả|trái\s*cây|tĩnh\s*vật/i, desc: 'colorful blooming flower garden, nature plants and flowers' },
];

export function buildEnglishArtSubject(topic, genre = 'general') {
  const clean = String(topic || '').trim();
  let visualDesc = 'childhood art subject';
  for (const entry of TOPIC_ENGLISH_MAP) {
    if (entry.match.test(clean)) {
      visualDesc = entry.desc;
      break;
    }
  }
  return `Depict only this Vietnamese subject, preserving its specified objects, actions and setting: "${clean}" (${visualDesc}). Genre: ${genre}. Do not add unrelated subjects.`;
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

export async function generateAiArtwork({ topic, grade, style, genre = 'general', seed = null }, fetchImpl = globalThis.fetch) {
  const cleanTopic = String(topic || '').trim().slice(0, 500);
  if (!cleanTopic) throw new Error('Vui lòng nhập hoặc chọn chủ đề trước khi tạo tranh.');
  const safeGrade = /^[1-5]$/.test(String(grade)) ? String(grade) : '1';
  const safeStyle = ['crayon', 'watercolor', 'paper', 'clay', 'recycled'].includes(style) ? style : 'crayon';

  const resolved = resolveCurriculumTopic(cleanTopic, parseInt(safeGrade, 10));
  const effectiveTopic = resolved?.topic || cleanTopic;
  const effectiveGenre = genre !== 'general' ? genre : (resolved?.genre || 'general');

  const cleanVisualTopic = effectiveTopic.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim() || effectiveTopic;
  const englishSubject = buildEnglishArtSubject(cleanVisualTopic, effectiveGenre);
  const stylePrefix = STYLE_PROMPTS[safeStyle] || STYLE_PROMPTS.crayon;

  let negativeExclusions = 'no realistic photography, no 3D computer render, no adult style, no text, no watermark';
  const styleEmphasis = safeStyle === 'crayon'
    ? 'The entire image must be unmistakably a child’s wax-crayon drawing, with visible grainy wax strokes and uneven hand-colored areas, not a smooth digital painting.'
    : '';
  if (safeStyle === 'crayon') {
    negativeExclusions += ', no watercolor washes, no smooth digital airbrush, no vector-flat finish';
  }
  if ((effectiveGenre === 'landscape' || effectiveGenre === 'still_life' || effectiveGenre === 'animals') && !/người|bé|bạn|gia đình|bố|mẹ|ông|bà|cô|thầy/i.test(cleanTopic)) {
    negativeExclusions += ', strictly no people, no human face, no portraits, no girl, no boy, no person, no human drawing';
  }

  const imagePrompt = `${stylePrefix}, ${styleEmphasis} wide artwork of ${cleanTopic}: ${englishSubject}, vibrant cheerful colors, centered composition, charming artwork by a Vietnamese primary school student in grade ${safeGrade}, ${negativeExclusions}`;
  const randomSeed = seed !== null ? seed : Math.floor(Math.random() * 1000000);
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1024&height=576&nologo=true&seed=${randomSeed}`;

  if (typeof fetchImpl !== 'function') throw new Error('Cần kết nối mạng để tạo tranh AI; có thể tải tranh mẫu từ máy.');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetchImpl(pollinationsUrl, { signal: controller.signal });
    if (!response?.ok) throw new Error('Dịch vụ tạo tranh không dùng khóa hiện chưa khả dụng' + (response?.status ? ' (HTTP ' + response.status + ')' : '') + '. Tranh cũ được giữ nguyên; có thể tải ảnh từ máy.');
    const blob = await response.blob();
    if (!blob?.size || !/^image\/(?:png|jpe?g|webp|gif)$/i.test(blob.type)) throw new Error('Dịch vụ chưa trả về tệp ảnh hợp lệ; không ghi nhận đã tạo thành công.');
    if (blob.size > 10 * 1024 * 1024) throw new Error('Ảnh dịch vụ trả về vượt quá 10MB; chưa nhận ảnh để bảo vệ bộ nhớ.');
    const dataUrl = await imageBlobToDataUrl(blob);
    if (typeof Image !== 'undefined') {
      await new Promise((resolve, reject) => { const img = new Image(); img.onload = resolve; img.onerror = () => reject(new Error('Tệp ảnh trả về không giải mã được. Tranh cũ vẫn được giữ nguyên.')); img.src = dataUrl; });
    }
    return dataUrl;
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('Dịch vụ tạo tranh phản hồi quá lâu. Tranh cũ được giữ nguyên; hãy thử lại sau.');
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
