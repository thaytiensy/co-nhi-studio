import { getScopedStorageKey } from './userWorkspaceService.js';
import { TT27_COMMENTS_BANK, normalizeClassLabel } from './smasExcelService.js';

export { normalizeClassLabel };
export const BASE_SMAS_STORAGE_KEY = 'conhi_smas_evaluations_state_v2';
export const getSmasStorageKey = () => getScopedStorageKey(BASE_SMAS_STORAGE_KEY);
export const getTeachingClassesKey = () => getScopedStorageKey('conhi_teaching_classes');
export const DEFAULT_TEACHING_CLASSES = ['1A', '1B', '1C', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B'];

/**
 * Ngân hàng nhận xét định kỳ Giữa kỳ (GK) và Cuối kỳ (CK) môn Mĩ thuật Tiểu học
 * Chuẩn Thông tư 27/2020/TT-BGDĐT và Chương trình GDPT 2018
 */
export const PERIODIC_COMMENTS_BANK = {
  GK: {
    T: [
      'Giữa kì hoàn thành tốt các mục tiêu môn Mĩ thuật; năng khiếu tạo hình và phối màu nổi bật; tự tin và chủ động trong mọi hoạt động học tập.',
      'Nắm vững kiến thức mĩ thuật giữa kì; nét vẽ khỏe khoắn, bố cục sáng tạo, giàu cảm xúc; tích cực tham gia thảo luận cùng bạn bè.',
      'Giữa kì đạt kết quả xuất sắc; khả năng quan sát và cảm thụ thẩm mĩ tinh tế; thực hiện sản phẩm nhanh nhẹn, khéo léo và có ý tưởng riêng.',
      'Tiến bộ vượt trội trong nửa đầu năm học; đường nét dứt khoát, gam màu tươi sáng, hài hòa; luôn sẵn lòng chia sẻ và giúp đỡ các bạn trong nhóm.',
      'Tư duy thẩm mĩ nhạy bén; biết phối hợp hài hòa giữa các yếu tố đường nét và màu sắc; bài vẽ giữa kì có chiều sâu và bố cục chặt chẽ.'
    ],
    H: [
      'Giữa kì hoàn thành tốt các nội dung bài học; vẽ hình rõ ràng, biết phối màu theo mẫu; có ý thức giữ gìn đồ dùng học tập sạch sẽ.',
      'Nắm được các thao tác tạo hình cơ bản giữa kì; hoàn thành sản phẩm đúng thời gian quy định; chăm chỉ và tập trung trong giờ học.',
      'Có tiến bộ rõ rệt trong kỹ năng vẽ nét và tô màu; biết lắng nghe hướng dẫn của giáo viên và thể hiện bài học đầy đủ.',
      'Hoàn thành các yêu cầu cần đạt môn Mĩ thuật giữa kì; thái độ học tập tích cực, hòa đồng với bạn bè; cần tự tin hơn khi chia sẻ bài vẽ.',
      'Biết cách sử dụng sáp màu và đất nặn đúng kĩ thuật; hoàn thành đầy đủ các bài thực hành mĩ thuật giữa kì theo yêu cầu.'
    ],
    C: [
      'Giữa kì em cần cố gắng quan sát mẫu kĩ hơn; chú ý hoàn thiện các nét vẽ cơ bản và tô màu kín nền đúng thời gian quy định.',
      'Cần tập trung hơn trong giờ thực hành mĩ thuật giữa kì; chuẩn bị đầy đủ dụng cụ sáp màu, giấy vẽ khi đến lớp.',
      'Nét vẽ còn rụt rè, em hãy mạnh dạn phối màu tươi sáng hơn và chủ động nhờ Thầy/Cô hướng dẫn khi gặp khó khăn nhé.'
    ]
  },
  CK: {
    T: [
      'Cuối kì hoàn thành xuất sắc môn Mĩ thuật; tư duy thẩm mĩ và khả năng sáng tạo vượt trội; sản phẩm nghệ thuật giàu cảm xúc và tính nhân văn.',
      'Năng lực mĩ thuật nổi bật trong cả học kì; sử dụng linh hoạt các chất liệu tạo hình; nét vẽ tự tin, phối màu độc đáo, đạt chuẩn khen thưởng.',
      'Hoàn thành xuất sắc nhiệm vụ học tập môn Mĩ thuật; có nhiều tác phẩm ấn tượng được trưng bày; luôn gương mẫu, chủ động giúp đỡ bạn bè.',
      'Cả học kì thể hiện niềm đam mê hội họa sâu sắc; kỹ năng vẽ tranh, nặn và xé dán rất điêu luyện; thuyết trình tự tin và truyền cảm hứng trước lớp.',
      'Có phong cách tạo hình độc đáo, kỹ năng thẩm mĩ xuất sắc; luôn hoàn thành vượt mức yêu cầu cần đạt của môn học trong cả kỳ.'
    ],
    H: [
      'Cuối kì hoàn thành tốt các yêu cầu môn Mĩ thuật; nắm vững kỹ thuật vẽ nét và phối màu; sản phẩm thể hiện rõ chủ đề và sạch sẽ.',
      'Đạt đầy đủ các chuẩn kiến thức kĩ năng môn Mĩ thuật cả học kì; có ý thức tự giác rèn luyện, hoàn thành tốt các sản phẩm thực hành.',
      'Có nhiều tiến bộ trong học tập; biết phối hợp các gam màu hài hòa, bố cục tranh cân đối; tham gia tích cực hoạt động trưng bày cuối kì.',
      'Hoàn thành chương trình môn học đúng tiến độ; thái độ học tập nghiêm túc, chăm chỉ; biết yêu quý và gìn giữ vẻ đẹp của các tác phẩm nghệ thuật.',
      'Nắm chắc các kĩ năng tạo hình cơ bản cả học kì; tự tin chia sẻ cảm xúc về bài vẽ của mình và trân trọng sản phẩm của bạn bè.'
    ],
    C: [
      'Cuối kì em cần rèn luyện thêm kỹ năng vẽ nét và tô màu; cố gắng chuẩn bị đầy đủ đồ dùng học tập để hoàn thành sản phẩm kịp tiến độ.',
      'Cần tích cực và tập trung hơn trong các hoạt động mĩ thuật cuối kì; mạnh dạn trao đổi cùng Thầy/Cô để tự tin nâng cao tay nghề nhé.',
      'Em hãy dành thêm thời gian luyện tập phối màu và tạo khối cơ bản để đạt kết quả tốt hơn trong năm học tới.'
    ]
  },
  GK2: {
    T: [
      'Giữa kì II có nhiều tiến bộ nổi bật môn Mĩ thuật; tư duy tạo hình và sử dụng màu sắc rất tự tin, phong phú; tích cực chia sẻ cùng bạn bè.',
      'Hoàn thành xuất sắc mục tiêu mĩ thuật giữa kì 2; nét vẽ chững chạc, bố cục sáng tạo, thể hiện rõ tình cảm trong tác phẩm.',
      'Giữa kì II đạt kết quả rất tốt; kỹ năng phối hợp chất liệu màu sáp, đất nặn linh hoạt; luôn chủ động giúp đỡ bạn trong nhóm.',
      'Nửa đầu học kì 2 thể hiện niềm say mê hội họa; đường nét dứt khoát, gam màu tươi tắn, bài vẽ sinh động và độc đáo.',
      'Tư duy thẩm mĩ tiến bộ vượt trội ở giữa kì 2; tự tin thể hiện ý tưởng sáng tạo cá nhân trong mọi bài thực hành.'
    ],
    H: [
      'Giữa kì II hoàn thành tốt các nội dung bài học mĩ thuật; vẽ hình rõ ràng, màu sắc hài hòa; có ý thức giữ gìn góc học tập sạch sẽ.',
      'Nắm vững kiến thức kĩ năng mĩ thuật giữa kì 2; hoàn thành sản phẩm đúng tiến độ; tích cực tham gia các hoạt động nhóm.',
      'Có sự tiến bộ rõ rệt trong nửa đầu học kì II; nét vẽ mềm mại hơn, biết lắng nghe hướng dẫn của Thầy/Cô để hoàn thiện bài.',
      'Thực hiện tốt các yêu cầu bài học mĩ thuật giữa kì 2; chăm chỉ thực hành; cần mạnh dạn hơn khi chia sẻ ý tưởng trước lớp.',
      'Sử dụng màu sắc và tạo hình đúng kỹ thuật ở giữa kì II; hoàn thành đầy đủ các sản phẩm học tập theo chuẩn.'
    ],
    C: [
      'Giữa kì II em cần chú ý tập trung hoàn thiện bài vẽ đúng giờ; rèn luyện thêm kĩ năng tô màu đều tay và cẩn thận hơn.',
      'Cần chuẩn bị đầy đủ đồ dùng học tập mĩ thuật khi đến lớp; mạnh dạn nhờ Thầy/Cô hướng dẫn thêm khi thực hành nhé.',
      'Nét vẽ còn ngập ngừng, em hãy tự tin phối màu tươi sáng hơn và cố gắng hoàn thành sản phẩm kịp tiến độ bài học.'
    ]
  },
  CK2: {
    T: [
      'Cuối kì II hoàn thành xuất sắc môn Mĩ thuật; tư duy thẩm mĩ và khả năng sáng tạo vượt trội; sản phẩm nghệ thuật giàu cảm xúc và tính nhân văn.',
      'Năng lực mĩ thuật nổi bật trong học kì 2; sử dụng linh hoạt các chất liệu tạo hình; nét vẽ tự tin, phối màu độc đáo, đạt chuẩn khen thưởng.',
      'Hoàn thành xuất sắc nhiệm vụ học tập mĩ thuật cuối kì 2; có nhiều tác phẩm ấn tượng được trưng bày; luôn gương mẫu, chủ động giúp đỡ bạn bè.',
      'Học kì 2 thể hiện niềm đam mê hội họa sâu sắc; kỹ năng vẽ tranh, nặn và xé dán rất điêu luyện; thuyết trình tự tin và truyền cảm hứng trước lớp.',
      'Có phong cách tạo hình độc đáo, kỹ năng thẩm mĩ xuất sắc; luôn hoàn thành vượt mức yêu cầu cần đạt của môn học trong cả kỳ 2.'
    ],
    H: [
      'Cuối kì II hoàn thành tốt các yêu cầu môn Mĩ thuật; nắm vững kỹ thuật vẽ nét và phối màu; sản phẩm thể hiện rõ chủ đề và sạch sẽ.',
      'Đạt đầy đủ các chuẩn kiến thức kĩ năng môn Mĩ thuật học kì 2; có ý thức tự giác rèn luyện, hoàn thành tốt các sản phẩm thực hành.',
      'Có nhiều tiến bộ trong học kì 2; biết phối hợp các gam màu hài hòa, bố cục tranh cân đối; tham gia tích cực hoạt động trưng bày cuối kì.',
      'Hoàn thành chương trình môn học kì 2 đúng tiến độ; thái độ học tập nghiêm túc, chăm chỉ; biết yêu quý và gìn giữ vẻ đẹp của các tác phẩm nghệ thuật.',
      'Nắm chắc các kĩ năng tạo hình cơ bản trong học kì 2; tự tin chia sẻ cảm xúc về bài vẽ của mình và trân trọng sản phẩm của bạn bè.'
    ],
    C: [
      'Cuối kì II em cần rèn luyện thêm kỹ năng vẽ nét và tô màu; cố gắng chuẩn bị đầy đủ đồ dùng học tập để hoàn thành sản phẩm kịp tiến độ.',
      'Cần tích cực và tập trung hơn trong các hoạt động mĩ thuật cuối kì 2; mạnh dạn trao đổi cùng Thầy/Cô để tự tin nâng cao tay nghề nhé.',
      'Em hãy dành thêm thời gian luyện tập phối màu và tạo khối cơ bản để đạt kết quả tốt hơn trong năm học tới.'
    ]
  },
  CN: {
    T: [
      'Cả năm học hoàn thành xuất sắc môn Mĩ thuật; tư duy tạo hình và cảm thụ thẩm mỹ vượt trội; luôn tự tin, tích cực và sáng tạo độc đáo.',
      'Đạt thành tích nổi bật môn Mĩ thuật cả năm học; sử dụng thành thạo các chất liệu màu sáp, đất nặn, xé dán; nhiều bài vẽ đẹp được tuyên dương.',
      'Cả năm học thể hiện tình yêu nghệ thuật sâu sắc; kĩ năng vẽ và thuyết trình tranh xuất sắc; gương mẫu giúp đỡ bạn bè trong lớp.'
    ],
    H: [
      'Cả năm học hoàn thành tốt các mục tiêu môn Mĩ thuật; vẽ hình rõ ràng, tô màu đều tay; có ý thức giữ gìn dụng cụ học tập sạch sẽ.',
      'Đạt đầy đủ các chuẩn kiến thức kĩ năng môn Mĩ thuật trong cả năm học; tích cực tham gia các hoạt động thực hành và trưng bày sản phẩm.',
      'Có nhiều tiến bộ trong kỹ năng phối màu và tạo khối; hoàn thành tốt các bài thực hành mĩ thuật cả năm.'
    ],
    C: [
      'Cả năm học em cần cố gắng rèn luyện thêm kĩ năng vẽ nét và tô màu; chủ động chuẩn bị đồ dùng học vẽ đầy đủ hơn.',
      'Cần tập trung hơn trong giờ thực hành mĩ thuật; mạnh dạn trao đổi cùng Thầy/Cô để tự tin nâng cao tay nghề.'
    ]
  }
};

// Aliases cho các khóa chuẩn
PERIODIC_COMMENTS_BANK.GK1 = PERIODIC_COMMENTS_BANK.GK;
PERIODIC_COMMENTS_BANK.CK1 = PERIODIC_COMMENTS_BANK.CK;

/**
 * Tính toán mức đánh giá Thông tư 27 (T, H, C) từ 4 tiêu chí Rubric Cam Chấm Tranh
 * @param {Object} levels { requirement, technique, creativity, presentation }
 * @returns {'T' | 'H' | 'C'}
 */
export function calculateRubricLevel({ requirement = 3, technique = 3, creativity = 2, presentation = 2 } = {}) {
  const req = Number(requirement) || 1;
  const tech = Number(technique) || 1;
  const cre = Number(creativity) || 1;
  const pre = Number(presentation) || 1;
  const total = req + tech + cre + pre;

  // Chuẩn Thông tư 27 Bộ GD&ĐT:
  // - Mức T (Hoàn thành tốt): Yêu cầu bài học và Kỹ thuật tạo hình đều xuất sắc (>=3), tổng điểm >= 10
  // - Mức H (Hoàn thành): Đạt các yêu cầu cốt lõi (req >= 2, tech >= 2) và tổng điểm >= 7
  // - Mức C (Chưa hoàn thành): Thiếu hoặc chưa đạt yêu cầu cốt lõi (req === 1 hoặc tech === 1 hoặc total < 7)
  if (req >= 3 && tech >= 3 && total >= 10) {
    return 'T';
  }
  if (req >= 2 && tech >= 2 && total >= 7) {
    return 'H';
  }
  return 'C';
}

/**
 * Đọc dữ liệu sổ điểm SMAS hiện tại từ LocalStorage (đã phân vùng theo tài khoản)
 */
export function readSmasData() {
  if (typeof window === 'undefined') {
    return {
      hasUploadedOrSelected: false,
      className: '1A',
      classOptions: ['1A'],
      selectedClassFilter: 'all',
      semester: 'Học kì I',
      students: []
    };
  }
  try {
    const raw = localStorage.getItem(getSmasStorageKey());
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        hasUploadedOrSelected: Boolean(parsed.hasUploadedOrSelected),
        className: parsed.className || '1A',
        classOptions: Array.isArray(parsed.classOptions) ? parsed.classOptions : ['1A'],
        selectedClassFilter: parsed.selectedClassFilter || 'all',
        semester: parsed.semester || 'Học kì I',
        students: Array.isArray(parsed.students) ? parsed.students : []
      };
    }
  } catch (err) {
    console.warn('Lỗi đọc dữ liệu SMAS:', err);
  }
  return {
    hasUploadedOrSelected: false,
    className: '1A',
    classOptions: ['1A'],
    selectedClassFilter: 'all',
    semester: 'Học kì I',
    students: []
  };
}

/**
 * Ghi dữ liệu sổ điểm SMAS vào LocalStorage và phát sự kiện đồng bộ
 */
export function writeSmasData(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getSmasStorageKey(), JSON.stringify(data));
    if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent('conhi-smas-updated', { detail: data }));
    }
  } catch (err) {
    console.warn('Lỗi lưu dữ liệu SMAS:', err);
  }
}

/**
 * Lưu kết quả chấm từ Cam Chấm Tranh vào Sổ Điểm SMAS
 * @param {Object} params
 * @param {string} params.studentId Mã học sinh (nếu có)
 * @param {string} params.studentName Tên học sinh
 * @param {string} params.className Lớp học (ví dụ: '1A')
 * @param {'T' | 'H' | 'C'} params.level Mức đạt được
 * @param {string} params.comment Lời nhận xét
 * @param {string} [params.period] Kỳ đánh giá ('TX', 'GK', 'CK', 'GK1', 'CK1', 'GK2', 'CK2')
 * @param {Object} [params.rubricLevels] 4 tiêu chí rubric
 * @param {string[]} [params.improvementSteps] Các bước hoàn thiện tranh
 * @param {string} [params.artworkThumb] Ảnh thu nhỏ bài vẽ (base64)
 * @returns {{ success: boolean, student: Object, isNewStudent: boolean }}
 */
export function saveCameraEvaluationToSmas({
  studentId = '',
  studentName = '',
  className = '1A',
  level = 'H',
  comment = '',
  period = 'TX',
  week = 1,
  rubricLevels = { requirement: 3, technique: 3, creativity: 2, presentation: 2 },
  improvementSteps = [],
  artworkThumb = ''
}) {
  const currentData = readSmasData();
  const cleanName = String(studentName || '').trim() || 'Học sinh';
  const cleanClass = String(className || '').trim().replace(/^Lớp\s+/i, '') || '1A';
  const formattedClass = `Lớp ${cleanClass}`;
  const normLevel = ['T', 'H', 'C'].includes(String(level).toUpperCase()) ? String(level).toUpperCase() : 'H';
  const timestamp = new Date().toISOString();
  const dateStr = new Date().toLocaleDateString('vi-VN');
  const targetWeek = Math.max(1, Math.min(35, Number(week) || 1));

  const evalRecord = {
    id: `cam_${Date.now()}`,
    timestamp,
    dateStr,
    period,
    week: targetWeek,
    level: normLevel,
    comment: comment.trim(),
    rubricLevels: { ...rubricLevels },
    improvementSteps: Array.isArray(improvementSteps) ? [...improvementSteps] : [],
    artworkThumb: artworkThumb ? String(artworkThumb).slice(0, 150000) : ''
  };

  let studentIndex = -1;
  const studentsList = [...currentData.students];

  const normCleanName = cleanName.toLowerCase().normalize('NFC').replace(/\s+/g, ' ');
  const normCleanClass = normalizeClassLabel(cleanClass).toLowerCase();

  // 1. Tìm theo ID
  if (studentId) {
    studentIndex = studentsList.findIndex(s => s.id === studentId);
  }

  // 2. Tìm theo Tên chính xác (chuẩn hóa NFC) + Lớp
  if (studentIndex === -1 && cleanName) {
    studentIndex = studentsList.findIndex(s => {
      const sName = String(s.name || '').trim().toLowerCase().normalize('NFC').replace(/\s+/g, ' ');
      const sClass = normalizeClassLabel(s.className || '').toLowerCase();
      const matchClass = !normCleanClass || !sClass || sClass === normCleanClass;
      return sName === normCleanName && matchClass;
    });
  }

  // 3. Tìm theo Tên không dấu + Lớp (chống lệch Unicode NFD/NFC hoặc lỗi font)
  if (studentIndex === -1 && cleanName) {
    const asciiCleanName = normCleanName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
    studentIndex = studentsList.findIndex(s => {
      const sAscii = String(s.name || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/\s+/g, ' ');
      const sClass = normalizeClassLabel(s.className || '').toLowerCase();
      const matchClass = !normCleanClass || !sClass || sClass === normCleanClass;
      return sAscii === asciiCleanName && matchClass;
    });
  }

  // 4. Nếu vẫn chưa thấy, tìm tên duy nhất trong toàn bộ danh sách
  if (studentIndex === -1 && cleanName) {
    const matches = studentsList.filter(s => {
      const sName = String(s.name || '').trim().toLowerCase().normalize('NFC').replace(/\s+/g, ' ');
      return sName === normCleanName;
    });
    if (matches.length === 1) {
      studentIndex = studentsList.findIndex(s => s.id === matches[0].id);
    }
  }

  let isNewStudent = false;
  let targetStudent = null;

  const isMidTerm = /giữa|gk|ghk/i.test(period);
  const isFinalTerm = /cuối|ck|chk/i.test(period);
  const isGk2 = /gk2|giữa.*2|gk.*2/i.test(period);
  const isCk2 = /ck2|cuối.*2|ck.*2/i.test(period);
  const isWeekly = !isMidTerm && !isFinalTerm;

  if (studentIndex >= 0) {
    const existing = studentsList[studentIndex];
    const existingHistory = Array.isArray(existing.camHistory) ? existing.camHistory : [];
    const currentWeekly = { ...(existing.weeklyLevels || {}) };

    // Cập nhật Sổ Điểm Thường Xuyên theo đúng cột Tuần (1 - 35)
    if (isWeekly) {
      currentWeekly[targetWeek] = normLevel;
      currentWeekly[String(targetWeek)] = normLevel;
    }

    // Đồng bộ sang kỳ tương ứng (GK1, CK1, GK2, CK2) để Thầy/Cô xem ở cả 2 sổ đều cập nhật tức thì
    const autoPeriodicUpdates = isWeekly ? {
      ...(targetWeek <= 9 ? { gkLevel: normLevel, gk1Level: normLevel, ...(comment.trim() ? { gkComment: comment.trim() } : {}) } : {}),
      ...(targetWeek > 9 && targetWeek <= 18 ? { ckLevel: normLevel, ck1Level: normLevel, ...(comment.trim() ? { ckComment: comment.trim() } : {}) } : {}),
      ...(targetWeek > 18 && targetWeek <= 27 ? { gk2Level: normLevel, ...(comment.trim() ? { gk2Comment: comment.trim() } : {}) } : {}),
      ...(targetWeek > 27 ? { ck2Level: normLevel, ...(comment.trim() ? { ck2Comment: comment.trim() } : {}) } : {})
    } : {};

    targetStudent = {
      ...existing,
      level: normLevel,
      weeklyLevels: currentWeekly,
      comment: comment.trim() || existing.comment,
      commentSource: 'cam_rubric',
      lastEvaluatedAt: timestamp,
      camHistory: [evalRecord, ...existingHistory.slice(0, 19)],
      ...autoPeriodicUpdates,
      ...(isMidTerm ? { gkLevel: normLevel, gk1Level: normLevel, gkComment: comment.trim(), ...(isGk2 ? { gk2Level: normLevel, gk2Comment: comment.trim() } : {}) } : {}),
      ...(isFinalTerm ? { ckLevel: normLevel, ck1Level: normLevel, ckComment: comment.trim(), ...(isCk2 ? { ck2Level: normLevel, ck2Comment: comment.trim() } : {}) } : {})
    };
    studentsList[studentIndex] = targetStudent;
  } else {
    isNewStudent = true;
    const newId = studentId || `HS${String(studentsList.length + 1).padStart(3, '0')}`;
    const initialWeekly = {};
    if (isWeekly) {
      initialWeekly[targetWeek] = normLevel;
      initialWeekly[String(targetWeek)] = normLevel;
    }

    targetStudent = {
      id: newId,
      name: cleanName,
      className: formattedClass,
      level: normLevel,
      weeklyLevels: initialWeekly,
      comment: comment.trim() || TT27_COMMENTS_BANK[normLevel][0],
      commentSource: 'cam_rubric',
      lastEvaluatedAt: timestamp,
      camHistory: [evalRecord],
      gkLevel: normLevel,
      gk1Level: normLevel,
      gkComment: isMidTerm ? comment.trim() : (PERIODIC_COMMENTS_BANK.GK[normLevel]?.[0] || ''),
      ckLevel: normLevel,
      ck1Level: normLevel,
      ckComment: isFinalTerm ? comment.trim() : (PERIODIC_COMMENTS_BANK.CK[normLevel]?.[0] || ''),
      ...(isGk2 ? { gk2Level: normLevel, gk2Comment: comment.trim() } : {}),
      ...(isCk2 ? { ck2Level: normLevel, ck2Comment: comment.trim() } : {})
    };
    studentsList.push(targetStudent);
  }

  // Cập nhật danh sách lớp nếu có lớp mới
  const classOptionsSet = new Set(currentData.classOptions || []);
  classOptionsSet.add(formattedClass);
  classOptionsSet.add(cleanClass);

  const updatedData = {
    ...currentData,
    hasUploadedOrSelected: true,
    className: currentData.className || formattedClass,
    classOptions: Array.from(classOptionsSet),
    students: studentsList
  };

  writeSmasData(updatedData);

  return {
    success: true,
    student: targetStudent,
    isNewStudent
  };
}

/**
 * Tổng hợp đánh giá định kỳ (Giữa kỳ hoặc Cuối kỳ) cho 1 học sinh dựa trên lịch sử chấm
 * @param {Object} student Đối tượng học sinh
 * @param {'GK' | 'CK' | 'GK1' | 'CK1' | 'GK2' | 'CK2' | 'CN'} [targetPeriod] Kỳ đánh giá
 * @returns {{ level: 'T' | 'H' | 'C', comment: string }}
 */
export function synthesizePeriodicEvaluation(student, targetPeriod = 'GK') {
  if (!student) return { level: 'H', comment: '' };

  const normPeriod = String(targetPeriod || 'GK').toUpperCase();
  const periodKey = normPeriod === 'CN' ? 'CN'
    : normPeriod === 'GK2' ? 'GK2'
    : normPeriod === 'CK2' ? 'CK2'
    : normPeriod === 'CK' || normPeriod === 'CK1' ? 'CK'
    : 'GK';

  const history = Array.isArray(student.camHistory) ? student.camHistory : [];
  const weekly = student.weeklyLevels || {};

  // Xác định khoảng tuần tính toán theo tiến trình GDPT 2018 (35 tuần)
  let startWeek = 1;
  let endWeek = 35;
  if (normPeriod === 'GK' || normPeriod === 'GK1') {
    startWeek = 1;
    endWeek = 9;
  } else if (normPeriod === 'CK' || normPeriod === 'CK1') {
    startWeek = 1;
    endWeek = 18;
  } else if (normPeriod === 'GK2') {
    startWeek = 19;
    endWeek = 27;
  } else if (normPeriod === 'CK2') {
    startWeek = 19;
    endWeek = 35;
  } else {
    startWeek = 1;
    endWeek = 35;
  }

  let weeklyRecords = [];
  for (let w = startWeek; w <= endWeek; w++) {
    const lvl = weekly[w] || weekly[String(w)];
    if (lvl) weeklyRecords.push({ level: lvl });
  }

  // Nếu là GK2 hoặc CK2 mà Thầy/Cô chưa nhập tuần 19+, lấy điểm tổng thể các tuần đã nhập
  if (weeklyRecords.length === 0 && startWeek > 1) {
    for (let w = 1; w <= endWeek; w++) {
      const lvl = weekly[w] || weekly[String(w)];
      if (lvl) weeklyRecords.push({ level: lvl });
    }
  }

  const allRecords = [...history, ...weeklyRecords];

  // 1. Tính toán mức đạt được tổng hợp từ các tuần thường xuyên & lịch sử chấm
  let finalLevel = student.level || 'H';

  if (allRecords.length > 0) {
    const tCount = allRecords.filter(h => h.level === 'T').length;
    const hCount = allRecords.filter(h => h.level === 'H').length;
    const cCount = allRecords.filter(h => h.level === 'C').length;
    const total = allRecords.length;

    // Quy tắc tổng hợp sư phạm GDPT 2018:
    // - Nếu đa số bài (>= 50%) đạt T và không có bài nào đạt C -> Mức T
    // - Nếu có bài C nhưng đa số là H hoặc T -> Mức H
    // - Nếu đa số bài (>= 50%) đạt C -> Mức C
    if (tCount / total >= 0.5 && cCount === 0) {
      finalLevel = 'T';
    } else if (cCount / total >= 0.5) {
      finalLevel = 'C';
    } else {
      finalLevel = 'H';
    }
  } else if ((normPeriod === 'GK' || normPeriod === 'GK1') && (student.gk1Level || student.gkLevel)) {
    finalLevel = student.gk1Level || student.gkLevel;
  } else if ((normPeriod === 'CK' || normPeriod === 'CK1') && (student.ck1Level || student.ckLevel)) {
    finalLevel = student.ck1Level || student.ckLevel;
  } else if (normPeriod === 'GK2' && (student.gk2Level || student.gkLevel)) {
    finalLevel = student.gk2Level || student.gkLevel;
  } else if (normPeriod === 'CK2' && (student.ck2Level || student.ckLevel)) {
    finalLevel = student.ck2Level || student.ckLevel;
  } else if (normPeriod === 'CN' && (student.cnLevel || student.ck2Level || student.ckLevel || student.gkLevel)) {
    finalLevel = student.cnLevel || student.ck2Level || student.ckLevel || student.gkLevel;
  }

  // 2. Chọn lời nhận xét định kỳ chuẩn TT27 đa dạng, không trùng lặp
  const bank = PERIODIC_COMMENTS_BANK[normPeriod]?.[finalLevel] || 
               PERIODIC_COMMENTS_BANK[periodKey]?.[finalLevel] || 
               PERIODIC_COMMENTS_BANK.GK[finalLevel] || 
               PERIODIC_COMMENTS_BANK.GK.H;
  const hash = String(student.id || student.name).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const comment = bank[hash % bank.length] || '';

  return {
    level: finalLevel,
    comment
  };
}

/**
 * Tổng hợp hàng loạt điểm và nhận xét định kỳ (Giữa kỳ / Cuối kỳ) cho cả lớp hoặc toàn bộ học sinh
 * @param {Object} params
 * @param {Array} params.students Danh sách học sinh
 * @param {string} [params.targetClass] Lớp cần tổng hợp ('all' hoặc tên lớp)
 * @param {'GK' | 'CK' | 'GK1' | 'CK1' | 'GK2' | 'CK2' | 'CN'} [params.targetPeriod] Kỳ đánh giá
 * @returns {{ students: Array, summary: { total: number, tCount: number, hCount: number, cCount: number } }}
 */
export function batchSynthesizeClassEvaluations({
  students = [],
  targetClass = 'all',
  targetPeriod = 'GK'
}) {
  const normPeriod = String(targetPeriod || 'GK').toUpperCase();
  let tCount = 0;
  let hCount = 0;
  let cCount = 0;
  let updatedCount = 0;

  const isGk1 = normPeriod === 'GK' || normPeriod === 'GK1';
  const isCk1 = normPeriod === 'CK' || normPeriod === 'CK1';
  const isGk2 = normPeriod === 'GK2';
  const isCk2 = normPeriod === 'CK2';
  const isCn = normPeriod === 'CN';

  const updatedStudents = students.map((student) => {
    const isTarget = targetClass === 'all' || 
      normalizeClassLabel(student.className) === normalizeClassLabel(targetClass);

    if (!isTarget) {
      return student;
    }

    const { level, comment } = synthesizePeriodicEvaluation(student, normPeriod);

    if (level === 'T') tCount++;
    else if (level === 'H') hCount++;
    else if (level === 'C') cCount++;
    updatedCount++;

    return {
      ...student,
      level, // Cập nhật mức chung
      comment,
      commentSource: 'periodic_synthesized',
      ...(isGk1 ? { gkLevel: level, gkComment: comment, gk1Level: level, gk1Comment: comment } : {}),
      ...(isCk1 ? { ckLevel: level, ckComment: comment, ck1Level: level, ck1Comment: comment } : {}),
      ...(isGk2 ? { gk2Level: level, gk2Comment: comment } : {}),
      ...(isCk2 ? { ck2Level: level, ck2Comment: comment } : {}),
      ...(isCn ? { cnLevel: level, cnComment: comment } : {})
    };
  });

  return {
    students: updatedStudents,
    summary: {
      total: updatedCount,
      tCount,
      hCount,
      cCount
    }
  };
}
