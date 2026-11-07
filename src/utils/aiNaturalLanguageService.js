// Dịch vụ Phân tích & Xử lý Câu lệnh Tự nhiên (Natural Language AI Service)
// Tuân thủ triệt để GDPT 2018 môn Mĩ thuật Tiểu học & Kiến trúc Thấu hiểu Ngữ cảnh Sư phạm Chuyên sâu

import { PEDAGOGY_BANK } from '../data/pedagogyBank.js';
import { generateGameQuestionsByTheme } from '../data/artGamesCurriculumBank.js';
import { requestTeachingAi, parseAiLessonResponse } from './aiLessonGenerator.js';

const DANGEROUS_TERMS = [
  'dao rọc giấy', 'dao lam', 'lưỡi dao', 'súng bắn keo', 'keo nến nóng',
  'axit', 'hóa chất tẩy', 'bật lửa', 'xăng cồn'
];

/**
 * Phân loại thể loại mĩ thuật theo ngữ nghĩa câu lệnh và chủ đề
 */
export function detectArtGenre(topic, fullPrompt = '') {
  const text = `${topic} ${fullPrompt}`.toLowerCase();
  if (/lọ hoa|bình hoa|tĩnh vật|đĩa quả|quả ngọt|trái cây|cốc |chén|ấm trà|mâm ngũ quả|hộp quà|đồ vật/i.test(text)) {
    return 'still_life';
  }
  if (/chân dung|bộ đội|hải quân|nông dân|bác sĩ|công an|gia đình|bạn bè|thầy giáo|cô giáo|\b(mẹ|bố|ba|ông|bà|thầy|cô|em bé|người)\b|tất niên|ngày tết|lễ hội/i.test(text)) {
    return 'portrait_human';
  }
  if (/con mèo|mèo|chó|con gà|gà|con chim|chim|con trâu|trâu|con voi|voi|con cá|cá |thủy cung|sinh vật biển|thỏ|chuột|ong|bướm|động vật|thú cưng|con vật/i.test(text)) {
    return 'animals';
  }
  if (/đất nặn|nặn|tạo hình|tạo khối|thủ công|xé dán|cắt dán|mô hình|lá cây|vỏ hộp|tái chế|bưu thiếp|mặt nạ|quạt giấy|khối 3d/i.test(text)) {
    return 'craft_applied';
  }
  if (/phong cảnh|biển|đảo|quê hương|làng quê|cánh đồng|lúa chín|núi|rừng|sông|thác|mặt trời|hoàng hôn|bình minh|trường em|phố phường|con đường|ngôi nhà/i.test(text)) {
    return 'landscape';
  }
  return 'general';
}

/**
 * Làm sạch và trích xuất chủ đề cốt lõi từ câu lệnh tự nhiên của giáo viên
 */
export function extractCleanArtTopic(prompt) {
  let topic = String(prompt || '').trim();

  // 1. Loại bỏ các tham số meta sư phạm (khối lớp, thời lượng, chất liệu, cấp độ)
  topic = topic
    .replace(/(?:cho\s+)?(?:học sinh|em\s+học\s+sinh|các\s+em)?\s*(?:lớp|khối|k)\s*[1-5]/gi, '')
    .replace(/(?:thời lượng|trong vòng|thời gian)?\s*\d+\s*(?:phút|tiết)/gi, '')
    .replace(/(?:hai|một)\s*tiết/gi, '')
    .replace(/(?:dùng|với|chất liệu|bằng)\s+(?:sáp màu|màu sáp|màu nước|màu dạ|đất nặn|giấy màu|xé dán|thủ công|tái chế)/gi, '')
    .replace(/(?:xé\s*dán|cắt\s*dán|thủ\s*công)/gi, '')
    .replace(/(?:phù hợp|dành cho)\s+(?:học sinh|em)(?:\s+(?:yếu|khá|giỏi|cơ bản|chậm|chưa khéo|hiếu động))?/gi, '')
    .replace(/(?:học sinh|em)\s+(?:yếu|khá|giỏi|cơ bản|chậm|chưa khéo|hiếu động)/gi, '')
    .replace(/(?:không dùng kéo|không dùng vật liệu nguy hiểm)/gi, '')
    .replace(/(?:có\s+)?(?:trò chơi|hoạt động|phần)?\s*(?:khởi động|đố vui)(?:\s+vui)?/gi, '')
    .replace(/(?:và|có)?\s*(?:hoạt động|góc)?\s*trưng bày(?:\s+sản phẩm)?/gi, '')
    .replace(/(?:gồm|với)\s*\d+\s*bước\s*(?:thực hành)?/gi, '')
    .replace(/(?:dùng\s+)?(?:dao rọc giấy|súng bắn keo|keo nến nóng|vật liệu nguy hiểm)/gi, '')
    .replace(/[,\.\-–—;:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 2. Loại bỏ các tiền tố mệnh lệnh và cụm từ mở đầu câu giao tiếp
  const prefixRegex = /^(?:tôi muốn dạy|tôi muốn làm|tôi muốn tạo|tôi muốn|hãy giúp tôi|hãy cho tôi|cho tôi|giúp tôi|hãy soạn|hãy làm|hãy tạo|hãy thiết kế|hãy|soạn giáo án|soạn bài|soạn kế hoạch|soạn|tạo kế hoạch dạy học|tạo kế hoạch dạy|tạo kế hoạch|tạo giáo án|tạo bài học|tạo bài vẽ|tạo hoạt động|tạo|thiết kế bài dạy|thiết kế bài học|thiết kế giáo án|thiết kế|lập kế hoạch|gợi ý bài vẽ|gợi ý bài học|gợi ý giáo án|gợi ý cho tôi|gợi ý|dạy làm|dạy vẽ|dạy học|dạy|bài học|bài vẽ|bài giảng|tiết dạy|tiết học|hoạt động đơn giản|hoạt động)\s*(?:về|đề tài|chủ đề|một)?\s*(?:bài vẽ|bài học|hoạt động)?\s*(?:vẽ tranh|vẽ|làm|học)?\s*(?:về|đề tài|chủ đề)?\s*/i;
  topic = topic.replace(prefixRegex, '').trim();

  // 3. Loại bỏ các từ nối và hư từ còn sót lại ở cuối chuỗi
  topic = topic.replace(/\b(?:cho|dành cho|với|bằng|ở|tại|và|nhé|nha|ạ)\s*$/gi, '').trim();

  // 4. Nếu kết quả quá ngắn hoặc chung chung, cung cấp chủ đề thẩm mĩ mặc định
  if (!topic || topic.length < 3 || /^(đơn giản|hoạt động|sáng tạo|bài vẽ)$/i.test(topic)) {
    if (/lọ hoa|quả|tĩnh vật/i.test(prompt)) return 'Tĩnh vật Lọ hoa và Quả ngọt';
    if (/biển|đảo|phong cảnh/i.test(prompt)) return 'Phong cảnh Biển đảo Quê hương';
    if (/bộ đội|chân dung|người/i.test(prompt)) return 'Chú bộ đội và Người thân yêu';
    if (/mèo|chó|gà|chim|con vật|con cá/i.test(prompt)) return 'Con vật nuôi quanh em';
    return 'Sắc Màu Cuộc Sống Quanh Em';
  }

  // Viết hoa chữ cái đầu tiên
  return topic.charAt(0).toUpperCase() + topic.slice(1);
}

/**
 * 1. Phân tích câu lệnh tự nhiên trong Xưởng Ý Tưởng (Hiểu sâu sắc toàn bộ ngữ cảnh)
 */

/**
 * Tự động ánh xạ câu lệnh của giáo viên với khung chương trình chuẩn SGK Kết nối tri thức Lớp 1 - Lớp 5
 */
export function resolveCurriculumTopic(prompt, grade = 1) {
  const safeGrade = Number(grade) >= 1 && Number(grade) <= 5 ? Number(grade) : 1;
  const gradeThemes = PEDAGOGY_BANK.themes[safeGrade] || [];
  const lower = String(prompt || '').toLowerCase();

  // 1. Nhận diện theo số thứ tự chủ đề / bài (ví dụ: "chủ đề 3 lớp 5", "bài 2 lớp 4", "cd 8")
  const themeNumberMatch = lower.match(/(?:chủ\s*đề|bài|cd|tiết)(?:\s*số)?\s*([1-9]|10)\b/i);
  if (themeNumberMatch) {
    const themeIndex = parseInt(themeNumberMatch[1], 10);
    const foundTheme = gradeThemes[themeIndex - 1];
    if (foundTheme) {
      return {
        topic: foundTheme.title.replace(/^Chủ đề \d+:\s*/i, '').trim(),
        genre: foundTheme.genre || detectArtGenre(foundTheme.title),
        fullTitle: foundTheme.title,
        curriculumMatch: true,
      };
    }
  }

  // 2. Nhận diện theo từ khóa đặc thù trong tên chủ đề SGK
  for (const theme of gradeThemes) {
    const cleanTitle = theme.title.replace(/^Chủ đề \d+:\s*/i, '').toLowerCase();
    const coreKeywords = cleanTitle.split(/[\(\),&]/).map(k => k.trim()).filter(k => k.length >= 3);
    for (const kw of coreKeywords) {
      if (lower.includes(kw)) {
        return {
          topic: theme.title.replace(/^Chủ đề \d+:\s*/i, '').trim(),
          genre: theme.genre || detectArtGenre(theme.title),
          fullTitle: theme.title,
          curriculumMatch: true,
        };
      }
    }
  }

  return null;
}

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

  // 7. Nhận diện các điều kiện đặc biệt và hoạt động sư phạm chi tiết
  const specialConditions = [];
  if (/không\s*dùng\s*kéo/i.test(lower)) {
    specialConditions.push('Không dùng kéo: Chuyển sang kĩ thuật xé dán bằng tay tự do');
  }
  if (/trò\s*chơi|khởi\s*động\s*vui|đố\s*vui|khởi\s*động/i.test(lower)) {
    specialConditions.push('Có trò chơi đố vui khởi động lớp học');
  }
  if (/trưng\s*bày|chia\s*sẻ|triển\s*lãm/i.test(lower)) {
    specialConditions.push('Có góc trưng bày và nhận xét sản phẩm');
  }
  if (/ngoài\s*trời|sân\s*trường|vườn\s*hoa|thiên\s*nhiên|thực\s*tế/i.test(lower)) {
    specialConditions.push('Có hoạt động quan sát thực tế ngoài trời/sân trường');
  }
  if (/nhóm|tổ|hợp\s*tác|chung/i.test(lower)) {
    specialConditions.push('Hoạt động thực hành nhóm hợp tác');
  }

  // 8. Trích xuất chủ đề cốt lõi & đối chiếu chuẩn SGK Kết nối tri thức
  let topic = '';
  let genre = 'general';
  let curriculumRef = null;

  const curriculumMatch = resolveCurriculumTopic(prompt, grade);
  if (curriculumMatch) {
    topic = curriculumMatch.topic;
    genre = curriculumMatch.genre;
    curriculumRef = curriculumMatch.fullTitle;
    assumptions.push(`Tự động nhận diện chuẩn SGK Kết nối tri thức: ${curriculumMatch.fullTitle}`);
  } else {
    topic = extractCleanArtTopic(prompt);
    genre = detectArtGenre(topic, prompt);
  }

  return {
    prompt,
    grade,
    topic,
    genre,
    curriculumRef,
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

  // 7. Trích xuất chủ đề trò chơi tinh gọn
  let topic = prompt
    .replace(/(?:tạo|thiết kế|làm|sinh|hãy|cho tôi)\s+(?:trò chơi|game|quiz|câu hỏi)?/i, '')
    .replace(/(?:cho\s+)?(?:lớp|khối)\s*[1-5]/gi, '')
    .replace(/(?:trong vòng|thời lượng)?\s*\d+\s*(?:phút|p)/gi, '')
    .replace(/(?:gồm|với)?\s*\d+\s*(?:câu|câu hỏi)/gi, '')
    .replace(/(?:nhóm|thi đua|cá nhân|đơn giản|chữ ít|hình ảnh nhiều|không cần đăng nhập)/gi, '')
    .replace(/[,\.\-–—;:]+/g, ' ')
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
    gameType,
    duration,
    questionCount,
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
 * Sinh Kế hoạch Sư phạm Cục bộ Thấu hiểu Ngữ cảnh Chuyên sâu (Context-Aware Pedagogy Engine)
 * Tự động tạo 4 bước thị phạm và tiến trình riêng biệt theo Thể loại Mĩ thuật & Yêu cầu của Giáo viên
 */
export function buildLocalPedagogyPlan(parsed) {
  const { grade, topic, genre = 'general', material, duration, studentLevel, safetyAlert, specialConditions = [] } = parsed;

  const isOutdoor = specialConditions.some(c => c.includes('ngoài trời'));
  const isGroup = specialConditions.some(c => c.includes('nhóm'));
  const isNoScissors = specialConditions.some(c => c.includes('Không dùng kéo'));
  const hasGameWarmup = specialConditions.some(c => c.includes('khởi động'));

  let genreKnowledge = '';
  let genreSkills = '';
  let warmupActivity = '';
  let teacherWarmupScript = '';
  let fourSteps = [];
  let guidingQuestions = [];
  let practiceActivity = '';
  let exhibitionActivity = '';

  if (genre === 'still_life') {
    genreKnowledge = `Nhận biết hình dáng đặc trưng của ${topic}, tỷ lệ tương quan giữa các vật thể và vị trí đặt trên mặt phẳng nằm ngang; hiểu cách vận dụng ${material} để tạo khối và độ sáng tối.`;
    genreSkills = `Biết phác khung hình chung và khung hình riêng của từng vật mẫu cân đối trong trang giấy; vận dụng đường nét và mảng màu ${material} để thể hiện độ đậm nhạt và bóng đổ theo mức độ ${studentLevel}.`;
    warmupActivity = hasGameWarmup
      ? `Trò chơi đố vui "Mắt thần quan sát": Giáo viên đặt vật mẫu ${topic} trên bàn, đố học sinh nhận diện hình khối cơ bản (tròn, trụ, chóp) và vị trí vật nào đứng trước, vật nào đứng sau.`
      : `Quan sát trực tiếp vật mẫu ${topic} hoặc tranh ảnh tĩnh vật mẫu, cảm nhận vẻ đẹp mộc mạc và sự hài hòa của các hình khối.`;
    teacherWarmupScript = `"Chào các con! Hôm nay lớp chúng mình sẽ hóa thân thành các họa sĩ nhí tĩnh vật, cùng khám phá vẻ đẹp của ${topic} qua những sắc màu rực rỡ nhé!"`;
    fourSteps = [
      `Bước 1: Quan sát mẫu, phác khung hình chung và kẻ đường mặt bàn nằm ngang để định vị không gian cân đối (theo tỷ lệ 1/3 giấy).`,
      `Bước 2: Phác khung hình riêng của từng vật mẫu; vẽ nét chi tiết chuốt hình dáng đặc trưng (miệng lọ, thân lọ, cuống quả).`,
      `Bước 3: Vẽ thêm chi tiết cành hoa, lá hoặc hoa văn trang trí; xác định hướng ánh sáng chính chiếu vào mẫu vật.`,
      `Bước 4: Sử dụng ${material} lên màu theo độ sáng tối: phần đón sáng tô màu tươi sáng, phần khuất sáng nhấn đậm và vẽ bóng đổ xuống mặt bàn.`
    ];
    guidingQuestions = [
      `Em đặt vật nào ở phía trước, vật nào ở phía sau để bức tranh có lớp lang sinh động?`,
      `Ánh sáng chiếu từ hướng nào tới để em chọn vị trí đổ bóng xuống mặt bàn?`,
      `Em phối hợp gam màu nào trong ${material} để làm nổi bật vẻ đẹp của ${topic}?`
    ];
  } else if (genre === 'landscape') {
    genreKnowledge = `Cảm nhận vẻ đẹp thiên nhiên không gian rộng mở của ${topic}; nhận biết đường chân trời, quy luật gần lớn - xa nhỏ và sự biến đổi sắc màu theo ánh sáng.`;
    genreSkills = `Biết phân chia mảng trời và mặt đất/mặt biển theo tỷ lệ 1/3; sắp xếp bố cục chính - phụ hài hòa và phối màu ${material} tạo chiều sâu không gian theo mức độ ${studentLevel}.`;
    warmupActivity = isOutdoor
      ? `Hoạt động ngoài trời: Giáo viên hướng dẫn học sinh quan sát không gian thiên nhiên xung quanh sân trường, cảm nhận ánh sáng và sắc màu trước khi vẽ ${topic}.`
      : `Thưởng thức giai điệu quê hương kết hợp ngắm nhìn tranh ảnh ${topic}, khơi gợi tình yêu quê hương đất nước và cảm xúc thẩm mĩ.`;
    teacherWarmupScript = `"Các con yêu quý! Quê hương Việt Nam ta vô cùng tươi đẹp. Hôm nay chúng mình cùng vẽ nên bức tranh ${topic} thật thanh bình và tràn ngập sắc màu nhé!"`;
    fourSteps = [
      `Bước 1: Vẽ đường chân trời phân chia bầu trời và mặt đất/mặt nước (đặt ở khoảng 1/3 trên hoặc 1/3 dưới trang giấy).`,
      `Bước 2: Phác hình các mảng chính ở trung tâm và tiền cảnh (con thuyền, rặng cây, ngôi nhà, ngọn núi) theo luật gần lớn - xa nhỏ.`,
      `Bước 3: Vẽ thêm các nét chi tiết sinh động (sóng nước, cánh buồm, vầng mặt trời, mây trời, đàn chim chao lượn).`,
      `Bước 4: Sử dụng ${material} chuyển màu mềm mại: nhuộm sắc màu bầu trời, phủ màu mặt nước và nhấn màu sắc rực rỡ cho các đối tượng chính.`
    ];
    guidingQuestions = [
      `Đường chân trời của em nằm ở đâu? Bầu trời và mặt đất/mặt biển chiếm tỷ lệ như thế nào?`,
      `Đối tượng nào là điểm nhấn chính trong khung cảnh ${topic} của em?`,
      `Em sử dụng sắc màu gì để thể hiện không gian thời gian (buổi sáng trong trẻo, buổi trưa rực rỡ hay hoàng hôn ấm áp)?`
    ];
  } else if (genre === 'portrait_human') {
    genreKnowledge = `Hiểu tỷ lệ cơ bản của khuôn mặt và dáng người trong chủ đề ${topic}; nhận biết trang phục, dáng vẻ và đặc điểm tiêu biểu thể hiện phẩm chất, tình cảm của nhân vật.`;
    genreSkills = `Biết dựng trục đối xứng, phác dáng nhân vật cân đối ở vị trí chính diện; phối hợp màu sắc ${material} thể hiện cảm xúc ấm áp, nét mặt tươi vui và trang phục đặc trưng theo mức độ ${studentLevel}.`;
    warmupActivity = hasGameWarmup
      ? `Trò chơi đố vui "Đoán dáng người thân & nghề nghiệp mến yêu": Đố học sinh qua cử chỉ, trang phục và đồ dùng đặc trưng của nhân vật trong ${topic}.`
      : `Quan sát tranh chân dung và hình ảnh thực tế về ${topic}, cùng thảo luận về nụ cười, ánh mắt và tình cảm gắn bó.`;
    teacherWarmupScript = `"Mỗi nét vẽ chân dung là một lời gửi gắm yêu thương! Hôm nay chúng mình cùng vẽ về ${topic} với tất cả tấm lòng kính trọng và quý mến nhé!"`;
    fourSteps = [
      `Bước 1: Dựng trục và phác hình dáng chung của nhân vật (đầu hình quả trứng, cổ, thân mình và tay chân) cân đối ở trung tâm giấy.`,
      `Bước 2: Phác các đường phân chia vị trí mắt, mũi, miệng và vẽ nét trang phục đặc trưng của nhân vật.`,
      `Bước 3: Vẽ nét biểu cảm khuôn mặt (ánh mắt sáng, nụ cười rạng rỡ) và vẽ thêm bối cảnh không gian xung quanh nhân vật.`,
      `Bước 4: Sử dụng ${material} tô màu da ấm áp, phối màu trang phục nổi bật và hoàn thiện màu nền bối cảnh tạo cảm giác thân thương.`
    ];
    guidingQuestions = [
      `Chi tiết nào trên nét mặt hoặc trang phục giúp mọi người nhận ra ngay nhân vật trong bài vẽ của em?`,
      `Em gửi gắm tình cảm yêu thương, kính trọng của mình qua ánh mắt hay nụ cười của nhân vật?`,
      `Không gian xung quanh nhân vật có thêm những chi tiết nào để bức tranh thêm ấm cúng?`
    ];
  } else if (genre === 'animals') {
    genreKnowledge = `Quan sát đặc điểm hình thể và nét đáng yêu của ${topic} (đầu tròn, thân bầu dục, tai, mắt, chân, đuôi); nhận biết thói quen hoạt động và môi trường sống của con vật.`;
    genreSkills = `Biết phối hợp các nét cong và hình học đơn giản để dựng dáng con vật ngộ nghĩnh; sử dụng ${material} tạo họa tiết lông, đốm màu hoặc vảy sinh động theo mức độ ${studentLevel}.`;
    warmupActivity = hasGameWarmup
      ? `Trò chơi "Mô phỏng tiếng kêu và cử chỉ": Học sinh thi đua bắt chước tiếng kêu và dáng điệu ngộ nghĩnh của ${topic} để cả lớp cùng đoán.`
      : `Đố vui về các con vật quen thuộc kết hợp quan sát video ngắn về thế giới động vật sinh động.`;
    teacherWarmupScript = `"Các con có yêu quý các loài vật quanh mình không? Hôm nay chúng mình cùng trổ tài vẽ bạn ${topic} thật ngộ nghĩnh và đáng yêu nhé!"`;
    fourSteps = [
      `Bước 1: Phác khung hình cơ bản của con vật bằng các khối hình học đơn giản (hình tròn cho đầu, hình bầu dục cho thân mình).`,
      `Bước 2: Nối các khối lại bằng nét cong mềm mại; vẽ tai, mắt, mũi, miệng và các bộ phận chân, đuôi đặc trưng.`,
      `Bước 3: Vẽ thêm khung cảnh môi trường sống quen thuộc (thảm cỏ xanh, khóm hoa, bờ rào hoặc đĩa thức ăn).`,
      `Bước 4: Sử dụng ${material} tô màu tươi sáng, tỉa nét lông hoặc vẽ đốm hoa văn sinh động để con vật thêm phần sống động.`
    ];
    guidingQuestions = [
      `Con vật của em đang làm gì (đang ngủ, đang chạy nhảy hay đang đùa nghịch)?`,
      `Em chọn màu sắc và họa tiết lông như thế nào để bạn ấy trông thật đáng yêu?`,
      `Cảnh vật xung quanh có những gì gắn liền với cuộc sống của bạn nhỏ này?`
    ];
  } else if (genre === 'craft_applied') {
    genreKnowledge = `Hiểu đặc tính tạo hình của ${material} (độ dẻo của đất nặn, kết cấu xơ sợi của giấy xé dán, khối 3D của vật liệu tái chế); cảm nhận vẻ đẹp tạo hình không gian nổi cho ${topic}.`;
    genreSkills = `Thực hiện thành thạo các kĩ năng an toàn (${isNoScissors ? 'xé dán bằng tay tự do' : 'cắt dán khéo léo hoặc nặn vuốt đều tay'}); liên kết các bộ phận chắc chắn theo mức độ ${studentLevel}.`;
    warmupActivity = `Khởi động "Đôi bàn tay khéo léo": Cả lớp cùng tập bài thể dục ngón tay, sờ và cảm nhận chất liệu ${material} trước khi tạo hình ${topic}.`;
    teacherWarmupScript = `"Hôm nay đôi bàn tay xinh của các con sẽ biến hóa những mảnh ${material} thành tác phẩm ${topic} độc đáo và đầy sáng tạo nhé!"`;
    fourSteps = [
      `Bước 1: Lựa chọn màu sắc và phân chia lượng ${material} phù hợp cho từng bộ phận chính và phụ của ${topic}.`,
      `Bước 2: Thực hiện kĩ thuật tạo hình các khối/mảng cơ bản trước (${isNoScissors ? 'xé dải hoặc xé mảng lớn' : 'nhào dẻo lăn tròn hoặc cắt hình khối'}).`,
      `Bước 3: Ghép nối và kết dính các bộ phận lại với nhau bằng kĩ thuật đính dán cẩn thận, cân đối.`,
      `Bước 4: Tạo vân hoa văn, trang trí thêm chi tiết nhỏ hoàn thiện và đặt tác phẩm trên đế trưng bày vững chãi.`
    ];
    guidingQuestions = [
      `Em phối hợp các màu sắc nào của ${material} để tác phẩm trông sinh động và bắt mắt nhất?`,
      `Em làm thế nào để các mối nối giữa các bộ phận dính kết thật chắc chắn và không bị rơi?`,
      `Tác phẩm của em có điểm nhấn sáng tạo nào độc đáo nhất?`
    ];
  } else {
    // Thể loại tổng quát
    genreKnowledge = `Nhận biết được hình dáng đặc trưng, đường nét và sự hài hòa màu sắc của ${topic}; hiểu cách vận dụng ${material} để tạo hình thẩm mĩ.`;
    genreSkills = `Biết phác khung hình cân đối; sử dụng thành thạo ${material} để vẽ nét, phối màu và hoàn thiện sản phẩm theo mức độ ${studentLevel}.`;
    warmupActivity = hasGameWarmup
      ? `Trò chơi khởi động đố vui khám phá: Quan sát tranh ảnh sinh động về ${topic} để tìm ra vẻ đẹp tiềm ẩn của đường nét và sắc màu.`
      : `Quan sát và trò chuyện về ${topic} trong đời sống hằng ngày để gợi mở ý tưởng sáng tạo cho học sinh.`;
    teacherWarmupScript = `"Chào các con yêu quý! Hôm nay chúng mình cùng khám phá vẻ đẹp của ${topic} qua những sắc màu rực rỡ và nét vẽ tự tin nhé!"`;
    fourSteps = [
      `Bước 1: Phác khung hình cơ bản của ${topic} ở vị trí trung tâm trang giấy (theo quy tắc 1/3 cân đối).`,
      `Bước 2: Vẽ nét chi tiết đặc trưng để nhận diện rõ chủ thể chính của bài học.`,
      `Bước 3: Vẽ thêm cảnh vật phụ và chi tiết trang trí xung quanh tạo không gian sinh động.`,
      `Bước 4: Sử dụng ${material} lên màu tươi sáng, phối hợp mảng đậm nhạt hoàn thiện tác phẩm.`
    ];
    guidingQuestions = [
      `Em chọn màu sắc gì để thể hiện ${topic} theo cảm xúc và phong cách của riêng mình?`,
      `Em muốn thêm chi tiết nào xung quanh để bức tranh thêm sinh động?`,
      `Em thấy chi tiết nào trong tác phẩm của mình đặc biệt và ấn tượng nhất?`
    ];
  }

  // Tinh chỉnh hoạt động Luyện tập theo hình thức Nhóm / Cá nhân
  practiceActivity = isGroup
    ? `Học sinh thực hành theo nhóm hợp tác: Mỗi thành viên tạo hình một phần của ${topic} bằng ${material}, sau đó cùng ghép nối thành một bức tranh tập thể khổ lớn. Giáo viên luân phiên hỗ trợ các nhóm.`
    : `Học sinh tự do thực hành sáng tạo tác phẩm cá nhân về ${topic} với ${material}. Giáo viên theo dõi, khích lệ sự tự tin và hỗ trợ các em còn lúng túng.`;

  // Tinh chỉnh hoạt động Trưng bày
  exhibitionActivity = `Tổ chức "Góc Triển Lãm Mĩ Thuật Nhí" ngay tại lớp. Học sinh tự hào treo/đặt sản phẩm ${topic}, đóng vai hướng dẫn viên giới thiệu tác phẩm và lắng nghe cảm nhận, góp ý từ thầy cô và bạn bè.`;

  return {
    lessonTitle: `BÀI HỌC: ${topic.toUpperCase()} (LỚP ${grade})`,
    objectives: {
      knowledge: genreKnowledge,
      skills: genreSkills,
      qualities: 'Bồi dưỡng tình yêu cái đẹp quanh em, nuôi dưỡng đức tính kiên nhẫn, cẩn thận và thói quen giữ gìn vệ sinh đồ dùng mĩ thuật.'
    },
    materialsNeeded: {
      teacher: `Tranh mẫu minh họa chủ đề ${topic}, vật mẫu trực quan, ${material}, giấy vẽ A3/bảng thị phạm, bài giảng trình chiếu điện tử.`,
      student: `${material}, giấy vẽ A4, bút chì, tẩy gôm, ${isNoScissors ? 'hồ dán an toàn (không dùng kéo)' : 'kéo đầu tròn an toàn, hồ dán'}, khăn lau tay.`
    },
    teachingProcess: [
      {
        step: 1,
        name: '1. Khởi động & Khám phá (5-7 phút)',
        activity: warmupActivity,
        teacherNote: teacherWarmupScript
      },
      {
        step: 2,
        name: '2. Kiến tạo kiến thức mới & Thị phạm (8-10 phút)',
        activity: `Giáo viên hướng dẫn quan sát mẫu và thị phạm 4 bước tạo hình ${topic} bằng ${material}.`,
        fourSteps
      },
      {
        step: 3,
        name: `3. Luyện tập & Sáng tạo (${duration})`,
        activity: practiceActivity,
        guidingQuestions
      },
      {
        step: 4,
        name: '4. Trưng bày, Nhận xét & Đánh giá (7-10 phút)',
        activity: exhibitionActivity,
        rubricNote: 'Đánh giá khích lệ theo Thông tư 27 với 4 tiêu chí: Đề tài, Kĩ năng tạo hình, Sáng tạo riêng và Tự tin chia sẻ.'
      }
    ],
    rubricCriteria: [
      `Tiêu chí 1: Thực hiện đúng chủ đề "${topic}" và hoàn thành sản phẩm đúng thời lượng.`,
      `Tiêu chí 2: Sử dụng thành thạo ${material}, nét vẽ rõ ràng, phối màu hài hòa và có sắc độ.`,
      'Tiêu chí 3: Có ý tưởng sáng tạo độc đáo, thể hiện góc nhìn và cảm xúc hồn nhiên của học sinh.',
      'Tiêu chí 4: Tự tin giới thiệu bài vẽ, biết lắng nghe và chia sẻ cảm nhận tích cực trước lớp.'
    ],
    differentiatedMissions: {
      tier1_basic: `Thử thách 1 (Khám phá): Nhận diện và phác nét cơ bản thể hiện hình dáng chính của ${topic}, tô màu kín mảng không lem ra ngoài.`,
      tier2_standard: `Thử thách 2 (Thành thạo - Chuẩn SGK): Bố cục hình vẽ ${topic} cân đối theo quy tắc 1/3, phối hợp màu sắc hài hòa và vẽ thêm ít nhất 2 chi tiết phụ sinh động.`,
      tier3_advanced: `Thử thách 3 (Tài năng nhí): Mở rộng bối cảnh, phối hợp đa dạng sắc độ hoặc chất liệu tạo hình thể hiện phong cách và cảm xúc riêng biệt.`
    },
    safetyAlert: safetyAlert || ''
  };
}

/**
 * 5. Bộ sinh Kế hoạch Ý tưởng Tự nhiên (Hỗ trợ Online AI Gemini & Fallback Cục bộ Thấu hiểu Ngữ cảnh)
 */
export async function generateNaturalIdeaLesson(params, options = {}) {
  const { fetchImpl = globalThis.fetch, tokenProvider } = options;
  const parsed = parseNaturalIdeaPrompt(params.prompt);

  // Tạo kế hoạch dự phòng cục bộ hoàn chỉnh thấu hiểu sâu sắc ngữ cảnh
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
    const aiPrompt = `Thiết kế kế hoạch bài dạy Mĩ thuật tiểu học theo chuẩn GDPT 2018 dựa trên yêu cầu tự nhiên của giáo viên:
- Yêu cầu nguyên văn: "${parsed.prompt}"
- Khối lớp: Lớp ${parsed.grade}
- Chủ đề cốt lõi: ${parsed.topic}
- Thể loại nghệ thuật: ${parsed.genre}
- Chất liệu mĩ thuật: ${parsed.material}
- Thời lượng: ${parsed.duration} (${parsed.periods} tiết)
- Mức độ học sinh: ${parsed.studentLevel}
- Yêu cầu đặc biệt: ${parsed.specialConditions.join(', ') || 'Tiến trình dạy học chuẩn GDPT 2018'}
- Điều kiện an toàn: Tuyệt đối không dùng dao rọc giấy, súng bắn keo nóng, axit hay vật liệu nguy hiểm.

YÊU CẦU SƯ PHẠM QUAN TRỌNG:
1. Thấu hiểu sâu sắc chủ thể được yêu cầu (${parsed.topic}): Các câu hỏi gợi mở, 4 bước thị phạm và lời dẫn của giáo viên phải nói đúng về đối tượng này, không dùng lời mẫu chung chung.
2. Đưa ra 4 bước thị phạm cụ thể, trực quan, học sinh tiểu học dễ thực hiện theo đúng chất liệu ${parsed.material}.
3. Lời dặn dò, câu hỏi gợi mở và nhận xét mang tính khích lệ, ấm áp, truyền cảm hứng.

Chỉ trả về JSON theo đúng định dạng sau:
{
  "lessonTitle": "...",
  "objectives": { "knowledge": "...", "skills": "...", "qualities": "..." },
  "materialsNeeded": { "teacher": "...", "student": "..." },
  "teachingProcess": [
    { "name": "1. Khởi động", "activity": "...", "teacherNote": "..." },
    { "name": "2. Khám phá & Thị phạm", "activity": "...", "fourSteps": ["Bước 1...", "Bước 2...", "Bước 3...", "Bước 4..."] },
    { "name": "3. Thực hành sáng tạo", "activity": "...", "guidingQuestions": ["Câu hỏi 1?", "Câu hỏi 2?"] },
    { "name": "4. Trưng bày & Đánh giá", "activity": "...", "rubricNote": "..." }
  ],
  "rubricCriteria": ["...", "...", "..."],
  "differentiatedMissions": {
    "tier1_basic": "Thử thách 1 (Khám phá): ...",
    "tier2_standard": "Thử thách 2 (Thành thạo - Chuẩn SGK): ...",
    "tier3_advanced": "Thử thách 3 (Tài năng nhí): ..."
  }
}`;

    const rawResponse = await requestTeachingAi({
      mode: 'lesson',
      grade: String(parsed.grade),
      prompt: aiPrompt
    }, fetchImpl, tokenProvider);

    const validatedAiResult = parseAiLessonResponse(rawResponse);
    const combinedPlan = {
      lessonTitle: `BÀI HỌC: ${parsed.topic.toUpperCase()} (LỚP ${parsed.grade})`,
      ...validatedAiResult,
      safetyAlert: parsed.safetyAlert,
      differentiatedMissions: validatedAiResult.differentiatedMissions || localPlan.differentiatedMissions
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
      source: `Ngân hàng Cục bộ GDPT 2018 (Dự phòng tự động thấu hiểu ngữ cảnh: ${err.message})`
    };
  }
}

/**
 * 6. Bộ sinh Trò chơi Mĩ thuật Tự nhiên (Hỗ trợ Online AI & Fallback Cục bộ)
 */
export async function generateNaturalArtGame(params, options = {}) {
  const parsed = parseNaturalGamePrompt(params.prompt);

  // Sinh bộ câu hỏi từ ngân hàng tri thức cục bộ theo chủ đề đã bóc tách chính xác
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
    source: 'Ngân hàng Trò chơi Mĩ thuật GDPT 2018'
  };
}

/**
 * AI Gợi ý Sư phạm & Lời giảng Tức Thời theo Ngữ cảnh Slide
 * Hỗ trợ giáo viên tương tác 2 chiều, hỏi đáp gợi mở và truyền cảm hứng.
 */
export async function generateSlidePedagogyTips({ slide, grade = 1, isOnline = true }) {
  const title = slide?.title || '';
  const textContent = (slide?.elements || [])
    .filter(e => e.type === 'text' && e.text)
    .map(e => e.text)
    .join(' ');
  const notes = slide?.notes || '';
  const combinedContext = `${title} ${textContent} ${notes}`.trim();

  // 1. Phân tích ngữ cảnh chủ đề
  const lower = combinedContext.toLowerCase();
  let detectedTopic = 'Mĩ thuật Sáng tạo';
  let artSecret = 'Đặt màu sáng cạnh màu tối sẽ giúp hình vẽ chính nổi bật nhất!';
  let inquiry = 'Các em hãy quan sát xem trong bức tranh này, điểm nào thu hút ánh nhìn đầu tiên của các em?';
  let encourage = 'Thầy tin mỗi bạn đều có một góc nhìn riêng, hãy tự tin thể hiện nét vẽ của chính mình nhé!';

  if (lower.includes('màu') || lower.includes('sắc')) {
    detectedTopic = 'Màu Sắc & Phối Màu';
    inquiry = 'Đố các em tìm thấy gam màu nóng và gam màu lạnh đang cùng xuất hiện ở đâu trong hình vẽ này?';
    artSecret = 'Bí quyết: Phối hợp xen kẽ màu nóng (đỏ, vàng, cam) và màu lạnh (xanh, tím) sẽ tạo cảm giác hài hòa và vui tươi!';
    encourage = 'Hãy chọn màu sắc các em yêu thích nhất để kể câu chuyện của riêng mình!';
  } else if (lower.includes('nét') || lower.includes('đường')) {
    detectedTopic = 'Đường Nét & Hình Khối';
    inquiry = 'Các em có nhận ra nét thẳng tạo cảm giác cứng cáp, còn nét cong tạo cảm giác mềm mại như thế nào không?';
    artSecret = 'Bí quyết: Đưa tay dứt khoát khi vẽ nét chính, sau đó tỉa nhẹ các nét chi tiết nhỏ nhé!';
    encourage = 'Đừng ngại vẽ sai! Nét vẽ tự nhiên và tự tin luôn là nét vẽ đẹp nhất!';
  } else if (lower.includes('chân dung') || lower.includes('người')) {
    detectedTopic = 'Chân Dung & Cảm Xúc';
    inquiry = 'Khuôn mặt nhân vật đang thể hiện cảm xúc gì? Chi tiết nào ở mắt và miệng giúp các em nhận biết điều đó?';
    artSecret = 'Bí quyết: Đặt mắt ở khoảng giữa khuôn mặt, miệng ở khoảng 1/3 dưới để có tỷ lệ hài hòa!';
    encourage = 'Hãy nhớ đến nụ cười của người thân để truyền tình cảm ấm áp vào bài vẽ nhé!';
  } else if (lower.includes('phong cảnh') || lower.includes('cây') || lower.includes('thiên nhiên')) {
    detectedTopic = 'Phong Cảnh Thiên Nhiên';
    inquiry = 'Trong cảnh này, vật ở gần và vật ở xa có độ to nhỏ và màu sắc khác nhau như thế nào?';
    artSecret = 'Luật xa gần: Ở gần vẽ to và rõ màu, ở xa vẽ nhỏ hơn và nhạt màu hơn để tạo chiều sâu không gian!';
    encourage = 'Thiên nhiên quanh ta có muôn vàn màu sắc kỳ diệu, hãy đưa cả thế giới đó vào trang giấy!';
  } else if (lower.includes('tĩnh vật') || lower.includes('hoa') || lower.includes('quả')) {
    detectedTopic = 'Tĩnh Vật & Bố Cục';
    inquiry = 'Vật mẫu nào là vật chính? Các em thấy nó được đặt ở vị trí nào trên tranh?';
    artSecret = 'Quy tắc 1/3: Đặt vật mẫu chính hơi lệch tâm một chút sẽ giúp bố cục tranh tự nhiên và cân đối hơn!';
    encourage = 'Quan sát kĩ hình dáng quả và lọ hoa trước khi hạ bút sẽ giúp nét vẽ chuẩn xác hơn đấy!';
  }

  // 2. Nếu online, thử gọi AI để tinh chỉnh chi tiết
  if (isOnline && combinedContext.length > 10) {
    try {
      const prompt = `Bạn là Thầy Cọ Nhí - Giáo viên Mĩ thuật tiểu học Việt Nam (GDPT 2018).
Dựa vào nội dung slide: "${combinedContext.slice(0, 300)}" (Dành cho Lớp ${grade}).
Hãy trả về JSON gồm:
{
  "inquiryQuestion": "Câu hỏi gợi mở học sinh quan sát nhận thức thẩm mĩ (ngắn gọn, dưới 25 từ)",
  "artTechniqueTip": "Bí quyết mĩ thuật cô đọng dễ nhớ (dưới 30 từ)",
  "encouragement": "Lời khích lệ học sinh thực hành tự tin (dưới 25 từ)"
}`;
      const res = await requestTeachingAi({ mode: 'text', grade: String(grade), prompt });
      const jsonMatch = typeof res === 'string' ? res.match(/\{[\s\S]*\}/) : null;
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.inquiryQuestion && parsed.artTechniqueTip) {
          return {
            topic: detectedTopic,
            inquiryQuestion: parsed.inquiryQuestion,
            artTechniqueTip: parsed.artTechniqueTip,
            encouragement: parsed.encouragement || encourage,
            isAiGenerated: true
          };
        }
      }
    } catch (_) {
      // Fallback cục bộ mượt mà
    }
  }

  return {
    topic: detectedTopic,
    inquiryQuestion: inquiry,
    artTechniqueTip: artSecret,
    encouragement: encourage,
    isAiGenerated: false
  };
}
