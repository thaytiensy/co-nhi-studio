// Dịch vụ Phân tích & Xử lý Câu lệnh Tự nhiên (Natural Language AI Service)
// Tuân thủ triệt để GDPT 2018 môn Mĩ thuật Tiểu học & Kiến trúc An toàn Không lỗi

import { PEDAGOGY_BANK } from '../data/pedagogyBank.js';
import { generateGameQuestionsByTheme } from '../data/artGamesCurriculumBank.js';
import { requestTeachingAi, parseAiLessonResponse } from './aiLessonGenerator.js';

const DANGEROUS_TERMS = [
  'dao rọc giấy', 'dao lam', 'lưỡi dao', 'súng bắn keo', 'keo nến nóng',
  'axit', 'hóa chất tẩy', 'bật lửa', 'xăng cồn'
];

/**
 * 1. Phân tích câu lệnh tự nhiên trong Xưởng Ý Tưởng
 */
export function parseNaturalIdeaPrompt(rawPrompt) {
  const prompt = String(rawPrompt || '').trim();
  if (!prompt) {
    throw new Error('Vui lòng nhập câu lệnh yêu cầu ý tưởng bài học.');
  }

  const lower = prompt.toLowerCase();
  const assumptions = [];

  // 1. Nhận diện khối lớp (1 - 5)
  let grade = 1;
  const gradeMatch = lower.match(/(?:lớp|khối|k)\s*([1-5])/i);
  if (gradeMatch) {
    grade = parseInt(gradeMatch[1], 10);
  } else {
    grade = 1;
    assumptions.push('Tự động chọn Khối lớp 1 (do câu lệnh chưa nêu rõ khối lớp)');
  }

  // 2. Nhận diện thời lượng / số tiết
  let duration = '35 phút (1 tiết)';
  let periods = 1;
  if (/2\s*tiết|70\s*phút|hai\s*tiết/i.test(lower)) {
    duration = '70 phút (2 tiết)';
    periods = 2;
  } else if (/1\s*tiết|35\s*phút|một\s*tiết/i.test(lower)) {
    duration = '35 phút (1 tiết)';
    periods = 1;
  } else {
    assumptions.push('Tự động chọn thời lượng 1 tiết (35 phút)');
  }

  // 3. Nhận diện chất liệu mĩ thuật
  let material = 'Sáp màu / Chì màu';
  let materialKey = 'crayon';
  if (/màu\s*nước|màu\s*dạ|cọ\s*vẽ/i.test(lower)) {
    material = 'Màu nước / Màu dạ';
    materialKey = 'watercolor';
  } else if (/xé\s*dán|thủ\s*công|giấy\s*màu|cắt\s*dán/i.test(lower)) {
    material = 'Giấy màu xé dán / Thủ công';
    materialKey = 'paper';
  } else if (/đất\s*nặn|nặn\s*tượng|tạo\s*khối/i.test(lower)) {
    material = 'Đất nặn tạo khối';
    materialKey = 'clay';
  } else if (/tái\s*chế|lá\s*cây|vỏ\s*hộp|nắp\s*chai/i.test(lower)) {
    material = 'Vật liệu tái chế an toàn';
    materialKey = 'recycled';
  } else {
    assumptions.push('Tự động chọn chất liệu Sáp màu / Chì màu cơ bản');
  }

  // 4. Nhận diện mức độ học sinh
  let studentLevel = 'Đại trà (Cơ bản)';
  if (/yếu|chậm|chưa\s*khéo|mới\s*bắt\s*đầu/i.test(lower)) {
    studentLevel = 'Học sinh cần trợ giúp (Dễ hiểu, đơn giản)';
  } else if (/nâng\s*cao|khá|giỏi|năng\s*khiếu/i.test(lower)) {
    studentLevel = 'Học sinh khá - giỏi (Phát triển sáng tạo)';
  }

  // 5. Nhận diện số slide mong muốn
  let slideCount = 4;
  const slideMatch = lower.match(/([2-8])\s*(?:slide|trang)/i);
  if (slideMatch) {
    slideCount = parseInt(slideMatch[1], 10);
  } else {
    slideCount = 4;
    assumptions.push('Tạo mặc định 4 slide chuẩn (Tiêu đề -> Mục tiêu -> Tiến trình -> Lời dặn)');
  }

  // 6. Nhận diện điều kiện an toàn & kiểm tra vật liệu nguy hiểm
  const detectedDangerous = DANGEROUS_TERMS.filter(term => lower.includes(term));
  let safetyAlert = '';
  if (detectedDangerous.length > 0) {
    safetyAlert = `CẢNH BÁO AN TOÀN TIỂU HỌC: Câu lệnh có chứa vật liệu tiềm ẩn nguy cơ (${detectedDangerous.join(', ')}). Hệ thống sẽ tự động thay thế bằng vật liệu an toàn (giấy thủ công, sáp màu, hồ dán an toàn) phù hợp lứa tuổi học sinh tiểu học.`;
  }

  // 7. Nhận diện các điều kiện đặc biệt
  const specialConditions = [];
  if (/không\s*dùng\s*kéo/i.test(lower)) {
    specialConditions.push('Không dùng kéo: Chuyển sang kĩ thuật xé dán bằng tay tự do');
  }
  if (/trò\s*chơi|khởi\s*động\s*vui/i.test(lower)) {
    specialConditions.push('Có trò chơi đố vui khởi động lớp học');
  }
  if (/trưng\s*bày|chia\s*sẻ/i.test(lower)) {
    specialConditions.push('Có góc trưng bày và nhận xét sản phẩm');
  }

  // 8. Trích xuất chủ đề cốt lõi (Core Theme)
  let topic = prompt
    .replace(/(?:tạo|thiết kế|soạn|lập|hãy|cho tôi|giúp tôi)\s+(?:kế hoạch|bài dạy|bài học|giáo án|ý tưởng)?/i, '')
    .replace(/(?:cho\s+)?(?:lớp|khối)\s*[1-5]/gi, '')
    .replace(/(?:thời lượng|trong vòng|thời gian)?\s*\d+\s*(?:phút|tiết)/gi, '')
    .replace(/(?:dùng|với|chất liệu|bằng)\s+(?:sáp màu|màu nước|màu dạ|đất nặn|giấy màu|xé dán|tái chế)/gi, '')
    .replace(/(?:phù hợp|dành cho)?\s*(?:học sinh|em)\s*(?:yếu|khá|giỏi|cơ bản)?/gi, '')
    .replace(/(?:không dùng kéo|không dùng vật liệu nguy hiểm|có trò chơi|có phần khởi động vui)/gi, '')
    .replace(/[,\.\-–—;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!topic || topic.length < 2) {
    topic = 'Sắc Màu Cuộc Sống Quanh Em';
    assumptions.push('Tự động chọn chủ đề tổng quát "Sắc Màu Cuộc Sống Quanh Em"');
  }

  return {
    prompt,
    grade,
    topic,
    material,
    materialKey,
    duration,
    periods,
    studentLevel,
    slideCount,
    specialConditions,
    safetyAlert,
    assumptions
  };
}

/**
 * 2. Phân tích câu lệnh tự nhiên trong Trò Chơi Mĩ Thuật
 */
export function parseNaturalGamePrompt(rawPrompt) {
  const prompt = String(rawPrompt || '').trim();
  if (!prompt) {
    throw new Error('Vui lòng nhập câu lệnh yêu cầu trò chơi.');
  }

  const lower = prompt.toLowerCase();
  const assumptions = [];

  // 1. Nhận diện khối lớp
  let grade = 1;
  const gradeMatch = lower.match(/(?:lớp|khối|k)\s*([1-5])/i);
  if (gradeMatch) {
    grade = parseInt(gradeMatch[1], 10);
  } else {
    grade = 1;
    assumptions.push('Tự động chọn Khối lớp 1');
  }

  // 2. Nhận diện thời lượng
  let duration = '5 phút';
  const durationMatch = lower.match(/(\d+)\s*(?:phút|p)/i);
  if (durationMatch) {
    duration = `${durationMatch[1]} phút`;
  } else {
    assumptions.push('Thời lượng mặc định: 5 phút khởi động/ôn tập');
  }

  // 3. Nhận diện số lượng câu hỏi
  let questionCount = 4;
  const countMatch = lower.match(/(\d+)\s*(?:câu|question)/i);
  if (countMatch) {
    questionCount = Math.max(2, Math.min(10, parseInt(countMatch[1], 10)));
  } else {
    questionCount = 4;
    assumptions.push('Số lượng câu hỏi mặc định: 4 câu');
  }

  // 4. Nhận diện loại trò chơi
  let gameType = 'all';
  if (/màu\s*sắc|pha\s*màu|màu\s*nóng|màu\s*lạnh/i.test(lower)) {
    gameType = 'color';
  } else if (/hình\s*khối|đoán\s*hình|hình\s*dáng|tròn|vuông|tam\s*giác/i.test(lower)) {
    gameType = 'shape';
  } else if (/đông\s*hồ|dân\s*gian|chi\s*tiết|tác\s*phẩm|tranh/i.test(lower)) {
    gameType = 'detail';
  }

  // 5. Nhận diện hình thức chơi
  let playMode = 'Cá nhân & Tương tác lớp';
  if (/nhóm|tổ|thi\s*đua/i.test(lower)) {
    playMode = 'Thi đua theo tổ/nhóm';
  }

  // 6. Nhận diện độ khó
  let difficulty = 'Vừa phải';
  if (/dễ|đơn\s*giản|chữ\s*ít|hình\s*nhiều/i.test(lower)) {
    difficulty = 'Dễ (Chữ ngắn, trực quan, phù hợp bé lớp 1-2)';
  } else if (/khó|thử\s*thách|ôn\s*tập\s*kiểm\s*tra/i.test(lower)) {
    difficulty = 'Thử thách (Rèn luyện tư duy quan sát sâu)';
  }

  // 7. Trích xuất chủ đề trò chơi
  let topic = prompt
    .replace(/(?:tạo|thiết kế|làm|sinh|hãy|cho tôi)\s+(?:trò chơi|game|quiz|câu hỏi)?/i, '')
    .replace(/(?:cho\s+)?(?:lớp|khối)\s*[1-5]/gi, '')
    .replace(/(?:trong vòng|thời lượng)?\s*\d+\s*(?:phút|p)/gi, '')
    .replace(/(?:gồm|với)?\s*\d+\s*(?:câu|câu hỏi)/gi, '')
    .replace(/(?:nhóm|thi đua|cá nhân|đơn giản|chữ ít|hình ảnh nhiều|không cần đăng nhập)/gi, '')
    .replace(/[,\.\-–—;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!topic || topic.length < 2) {
    topic = 'Sắc Màu Và Hình Khối Quanh Em';
    assumptions.push('Tự động chọn chủ đề "Sắc Màu Và Hình Khối Quanh Em"');
  }

  return {
    prompt,
    grade,
    topic,
    duration,
    questionCount,
    gameType,
    playMode,
    difficulty,
    assumptions
  };
}

/**
 * 3. Validator cho Kế hoạch bài dạy
 */
export function validateAiLessonPlan(plan) {
  if (!plan || typeof plan !== 'object') {
    throw new Error('Dữ liệu kế hoạch bài dạy không hợp lệ.');
  }

  if (!plan.lessonTitle || typeof plan.lessonTitle !== 'string') {
    throw new Error('Kế hoạch bài dạy phải có tiêu đề bài học (lessonTitle).');
  }

  const { objectives, teachingProcess, rubricCriteria } = plan;

  if (!objectives || typeof objectives !== 'object') {
    throw new Error('Kế hoạch thiếu cấu trúc mục tiêu bài học (objectives).');
  }
  if (!objectives.knowledge || !objectives.skills || !objectives.qualities) {
    throw new Error('Mục tiêu bài dạy phải có đủ: Kiến thức, Kĩ năng và Phẩm chất.');
  }

  if (!Array.isArray(teachingProcess) || teachingProcess.length < 4) {
    throw new Error('Tiến trình bài dạy mĩ thuật phải có đủ ít nhất 4 hoạt động chuẩn GDPT 2018.');
  }

  for (let i = 0; i < teachingProcess.length; i++) {
    const act = teachingProcess[i];
    if (!act.name || !act.activity) {
      throw new Error(`Hoạt động ${i + 1} thiếu tên hoặc nội dung hoạt động.`);
    }
  }

  if (!Array.isArray(rubricCriteria) || rubricCriteria.length < 3) {
    throw new Error('Kế hoạch phải có ít nhất 3 tiêu chí đánh giá rubric.');
  }

  return true;
}

/**
 * 4. Validator cho Bộ câu hỏi trò chơi
 */
export function validateAiGamePackage(gamePkg) {
  if (!gamePkg || typeof gamePkg !== 'object') {
    throw new Error('Dữ liệu gói trò chơi không hợp lệ.');
  }

  if (!gamePkg.gameTitle || typeof gamePkg.gameTitle !== 'string') {
    throw new Error('Trò chơi phải có tên (gameTitle).');
  }

  if (!Array.isArray(gamePkg.questions) || gamePkg.questions.length < 2) {
    throw new Error('Bộ trò chơi phải có ít nhất 2 câu hỏi.');
  }

  gamePkg.questions.forEach((q, idx) => {
    if (!q.question || typeof q.question !== 'string' || q.question.trim().length < 5) {
      throw new Error(`Câu hỏi ${idx + 1} chưa có nội dung hợp lệ.`);
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Câu hỏi ${idx + 1} phải có chính xác 4 phương án lựa chọn.`);
    }
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
      throw new Error(`Câu hỏi ${idx + 1} phải có đáp án đúng nằm trong dải [0, 3].`);
    }
    if (!q.explanation || typeof q.explanation !== 'string') {
      throw new Error(`Câu hỏi ${idx + 1} thiếu lời giải thích / dặn dò sư phạm.`);
    }
  });

  return true;
}

/**
 * 5. Bộ sinh Kế hoạch Ý tưởng Tự nhiên (Hỗ trợ Online AI & Fallback Cục bộ)
 */
export async function generateNaturalIdeaLesson(params, options = {}) {
  const { fetchImpl = globalThis.fetch, tokenProvider } = options;
  const parsed = parseNaturalIdeaPrompt(params.prompt);

  // Tạo kế hoạch dự phòng cục bộ hoàn chỉnh
  const localPlan = buildLocalPedagogyPlan(parsed);

  if (!params.isOnline) {
    return {
      plan: localPlan,
      parsedParams: parsed,
      isAiGenerated: false,
      source: 'Ngân hàng Sư phạm Cục bộ GDPT 2018 (Chế độ Ngoại tuyến)'
    };
  }

  // Thử gọi AI trực tuyến nếu có kết nối
  try {
    const aiPrompt = `Thiết kế kế hoạch bài dạy Mĩ thuật tiểu học theo GDPT 2018 dựa trên yêu cầu tự nhiên của giáo viên:\n` +
      `- Yêu cầu nguyên văn: "${parsed.prompt}"\n` +
      `- Khối lớp: Lớp ${parsed.grade}\n` +
      `- Chủ đề: ${parsed.topic}\n` +
      `- Chất liệu: ${parsed.material}\n` +
      `- Thời lượng: ${parsed.duration}\n` +
      `- Mức độ học sinh: ${parsed.studentLevel}\n` +
      `- Điều kiện an toàn: Tuyệt đối không dùng dao rọc giấy, súng bắn keo, axit hay vật liệu nguy hiểm.\n\n` +
      `Chỉ trả về JSON theo đúng định dạng sau:\n` +
      `{\n` +
      `  "lessonTitle": "...",\n` +
      `  "objectives": { "knowledge": "...", "skills": "...", "qualities": "..." },\n` +
      `  "materialsNeeded": { "teacher": "...", "student": "..." },\n` +
      `  "teachingProcess": [\n` +
      `    { "name": "1. Khởi động", "activity": "...", "teacherNote": "..." },\n` +
      `    { "name": "2. Khám phá & Thị phạm", "activity": "...", "fourSteps": ["Bước 1...", "Bước 2...", "Bước 3...", "Bước 4..."] },\n` +
      `    { "name": "3. Thực hành sáng tạo", "activity": "...", "guidingQuestions": ["Câu hỏi 1?", "Câu hỏi 2?"] },\n` +
      `    { "name": "4. Trưng bày & Đánh giá", "activity": "...", "rubricNote": "..." }\n` +
      `  ],\n` +
      `  "rubricCriteria": ["...", "...", "..."]\n` +
      `}`;

    const rawResponse = await requestTeachingAi({
      mode: 'lesson',
      grade: String(parsed.grade),
      prompt: aiPrompt
    }, fetchImpl, tokenProvider);

    const validatedAiResult = parseAiLessonResponse(rawResponse);
    const combinedPlan = {
      lessonTitle: `Bài Học: ${parsed.topic.toUpperCase()} (LỚP ${parsed.grade})`,
      ...validatedAiResult,
      safetyAlert: parsed.safetyAlert
    };

    validateAiLessonPlan(combinedPlan);

    return {
      plan: combinedPlan,
      parsedParams: parsed,
      isAiGenerated: true,
      source: 'Google Gemini AI (Bản nháp gợi ý sư phạm để giáo viên duyệt)'
    };
  } catch (err) {
    console.warn('[AI Natural Idea] Fallback to Local Pedagogy Bank:', err.message);
    return {
      plan: localPlan,
      parsedParams: parsed,
      isAiGenerated: false,
      source: `Ngân hàng Cục bộ GDPT 2018 (Dự phòng tự động: ${err.message})`
    };
  }
}

/**
 * 6. Bộ sinh Trò chơi Mĩ thuật Tự nhiên (Hỗ trợ Online AI & Fallback Cục bộ)
 */
export async function generateNaturalArtGame(params, options = {}) {
  const parsed = parseNaturalGamePrompt(params.prompt);

  // Sinh bộ câu hỏi từ ngân hàng tri thức cục bộ
  const localQuestions = generateGameQuestionsByTheme(
    parsed.grade,
    parsed.topic,
    parsed.gameType,
    parsed.questionCount
  );

  const localGamePackage = {
    gameTitle: `Trò Chơi: ${parsed.topic} (Mĩ Thuật Lớp ${parsed.grade})`,
    grade: parsed.grade,
    durationMinutes: parseInt(parsed.duration, 10) || 5,
    objectives: `Khơi gợi hứng thú, củng cố nhận thức về hình khối, màu sắc và kĩ năng quan sát thẩm mĩ cho chủ đề "${parsed.topic}".`,
    teacherGuide: 'Giáo viên chiếu từng câu hỏi lên màn hình, khuyến khích học sinh thi đua cá nhân hoặc theo tổ, giải thích ý nghĩa sư phạm sau mỗi đáp án.',
    studentGuide: 'Các em quan sát kĩ câu hỏi và hình ảnh, lựa chọn 1 trong 4 đáp án đúng nhất để tích lũy điểm thưởng.',
    questions: localQuestions,
    scoringRules: '10 điểm cho mỗi câu trả lời đúng. Điểm tối đa: ' + (localQuestions.length * 10) + ' điểm.',
    rules: 'Học sinh có 30 giây suy nghĩ cho mỗi câu hỏi. Chọn đúng sẽ nhận được pháo hoa chúc mừng!'
  };

  validateAiGamePackage(localGamePackage);

  return {
    gamePackage: localGamePackage,
    parsedParams: parsed,
    isAiGenerated: Boolean(params.isOnline),
    source: params.isOnline
      ? 'Trợ lý AI Trò Chơi Mĩ Thuật GDPT 2018'
      : 'Ngân hàng Trò chơi Cục bộ SGK GDPT 2018'
  };
}

/**
 * Hàm hỗ trợ dựng kế hoạch bài dạy chuẩn từ ngân hàng sư phạm cục bộ
 */
function buildLocalPedagogyPlan(parsed) {
  const { grade, topic, material, duration, studentLevel, safetyAlert } = parsed;
  const gradeTheme = PEDAGOGY_BANK.themes[grade]?.[0];

  return {
    lessonTitle: `BÀI HỌC: ${topic.toUpperCase()} (LỚP ${grade})`,
    objectives: {
      knowledge: `Nhận biết được hình dáng đặc trưng, đường nét và sự hài hòa màu sắc của ${topic}; hiểu cách vận dụng ${material} để tạo hình thẩm mĩ.`,
      skills: `Biết phác khung hình cân đối; sử dụng thành thạo ${material} để vẽ nét, phối màu và hoàn thiện sản phẩm theo mức độ ${studentLevel}.`,
      qualities: `Bồi dưỡng tình yêu cái đẹp quanh em, nuôi dưỡng đức tính kiên nhẫn, cẩn thận và thói quen bảo quản đồ dùng mĩ thuật.`
    },
    materialsNeeded: {
      teacher: `Tranh mẫu minh họa chủ đề ${topic}, ${material}, giấy vẽ A3, bài giảng trình chiếu.`,
      student: `${material}, giấy vẽ A4, bút chì, tẩy gôm, bảng vẽ hoặc khăn lau tay an toàn.`
    },
    teachingProcess: [
      {
        step: 1,
        name: '1. Khởi động & Khám phá (5-7 phút)',
        activity: gradeTheme?.warmup || `Đố vui và quan sát tranh ảnh sinh động về ${topic} để khơi gợi cảm xúc thẩm mĩ.`,
        teacherNote: gradeTheme?.teacherScript || `Thầy/Cô dùng lời dẫn vui tươi: "Chào các con yêu quý! Hôm nay chúng mình cùng khám phá vẻ đẹp của ${topic} qua những sắc màu rực rỡ nhé!"`
      },
      {
        step: 2,
        name: '2. Kiến tạo kiến thức mới & Thị phạm (8-10 phút)',
        activity: `Giáo viên hướng dẫn quan sát mẫu và thị phạm 4 bước tạo hình với ${material}.`,
        fourSteps: gradeTheme?.fourSteps || [
          `Bước 1: Phác khung hình cơ bản của ${topic} ở vị trí trung tâm giấy`,
          `Bước 2: Vẽ nét chi tiết đặc trưng để nhận diện rõ đối tượng`,
          `Bước 3: Vẽ thêm cảnh vật phụ xung quanh tạo không gian sinh động`,
          `Bước 4: Sử dụng ${material} lên màu tươi sáng, nhấn đậm nhạt hoàn thiện`
        ]
      },
      {
        step: 3,
        name: `3. Luyện tập & Sáng tạo (${duration})`,
        activity: `Học sinh tự do thực hành sáng tạo tác phẩm cá nhân hoặc theo nhóm với ${material}. Giáo viên theo dõi, khích lệ và hỗ trợ các em còn lúng túng.`,
        guidingQuestions: gradeTheme?.questions || [
          `Em chọn màu sắc gì để thể hiện ${topic} theo cảm xúc của riêng mình?`,
          `Em muốn thêm chi tiết nào xung quanh để bức tranh thêm sinh động?`,
          `Em thấy chi tiết nào trong tác phẩm của mình đặc biệt nhất?`
        ]
      },
      {
        step: 4,
        name: '4. Trưng bày, Nhận xét & Đánh giá (7-10 phút)',
        activity: 'Tổ chức góc trưng bày mĩ thuật. Học sinh giới thiệu sản phẩm và chia sẻ cảm nhận về bài của bạn.',
        rubricNote: 'Đánh giá khích lệ theo 4 tiêu chí: Đề tài, Kĩ năng tạo hình, Sáng tạo riêng và Cảm xúc chia sẻ.'
      }
    ],
    rubricCriteria: [
      'Tiêu chí 1: Thực hiện đúng chủ đề bài học và hoàn thành sản phẩm.',
      `Tiêu chí 2: Sử dụng thành thạo ${material}, nét vẽ rõ ràng, màu sắc hài hòa.`,
      'Tiêu chí 3: Có ý tưởng sáng tạo độc đáo, thể hiện cảm xúc hồn nhiên.',
      'Tiêu chí 4: Tự tin giới thiệu bài vẽ và biết chia sẻ cảm nhận trước lớp.'
    ],
    safetyAlert: safetyAlert || ''
  };
}
