/**
 * Cọ Nhí Studio - Bộ quản lý lưu trữ LocalStorage tự động chuẩn SIÊU VIP PRO
 * Hỗ trợ Auto-save Debounce 300ms, Sao lưu (.json), Khôi phục (.json), và Dữ liệu mẫu chuẩn GDPT 2018.
 */

import { getScopedStorageKey } from '../utils/userWorkspaceService.js';

export interface TeachingPlanItem {
  id: string;
  week: number;
  period: number;
  title: string;
  grade: number;
  className: string;
  objectives: string;
  materials: string;
  status: 'Đã dạy' | 'Đang dạy' | 'Chưa dạy' | 'Sắp dạy';
  notes: string;
}

export interface StudentEvaluationItem {
  id: string;
  studentCode: string;
  name: string;
  className: string;
  week: number;
  level: 'T' | 'H' | 'C';
  comment: string;
}

export interface StudioProject {
  title: string;
  slides: any[];
  updatedAt: string;
}

export interface StudioSettings {
  teacherName: string;
  schoolName: string;
  agencyName: string;
  subject: string;
  academicYear: string;
  currentSemester: string;
}

export interface StudioKPIData {
  totalSlides: number;
  totalPlans: number;
  taughtPlans: number;
  totalStudents: number;
  levelTCount: number;
  levelHCount: number;
  levelCCount: number;
  completionRate: number;
}

export interface StudioStorageState {
  version: string;
  project: StudioProject;
  plans: TeachingPlanItem[];
  evaluations: StudentEvaluationItem[];
  settings: StudioSettings;
  lastSaved: string;
}

export const STORAGE_KEY = 'conhi_studio_vip_storage_v1';

export const DEFAULT_SETTINGS: StudioSettings = {
  teacherName: 'Giáo viên',
  schoolName: 'Trường Tiểu học',
  agencyName: 'Phòng Giáo dục và Đào tạo',
  subject: 'Mĩ thuật',
  academicYear: '2026-2027',
  currentSemester: 'Học kì I'
};

export const DEFAULT_PLANS: TeachingPlanItem[] = [
  // --- LỚP 1: BỘ SÁCH KẾT NỐI TRI THỨC VỚI CUỘC SỐNG ---
  {
    id: 'plan-g1-1',
    week: 1,
    period: 1,
    title: 'Chủ đề 1: Mĩ thuật trong nhà trường (Chấm, Nét, Màu cơ bản)',
    grade: 1,
    className: '1A',
    objectives: 'Làm quen với mĩ thuật quanh em; nhận biết chấm, nét, 3 màu cơ bản: Đỏ, Vàng, Lam.',
    materials: 'Giấy A4, bút sáp màu, tranh ảnh mĩ thuật trong đời sống.',
    status: 'Đã dạy',
    notes: 'Học sinh hào hứng nhận biết màu sắc cơ bản và đồ dùng học vẽ.'
  },
  {
    id: 'plan-g1-2',
    week: 2,
    period: 2,
    title: 'Chủ đề 2: Sáng tạo từ những chấm màu',
    grade: 1,
    className: '1A',
    objectives: 'Biết dùng các chấm màu to, nhỏ, dày, thưa tạo hình hoa lá, con vật, pháo hoa sinh động.',
    materials: 'Màu sáp, màu nước, tăm bông, giấy vẽ Canson.',
    status: 'Đã dạy',
    notes: 'Rèn sự khéo léo của các ngón tay qua kỹ thuật chấm màu.'
  },
  {
    id: 'plan-g1-3',
    week: 3,
    period: 3,
    title: 'Chủ đề 3: Nét vẽ của em (Nét thẳng, nét cong, nét lượn sóng)',
    grade: 1,
    className: '1B',
    objectives: 'Thực hành các nét vẽ thẳng, nét cong, nét lượn sóng tạo hình con đường đến trường và hàng cây.',
    materials: 'Bút dạ màu, sáp màu dầu, bảng con, giấy vẽ.',
    status: 'Đã dạy',
    notes: 'Rèn luyện nét vẽ tự tin, dứt khoát không dùng thước kẻ.'
  },
  {
    id: 'plan-g1-4',
    week: 4,
    period: 4,
    title: 'Chủ đề 4: Sáng tạo từ những hình cơ bản (Hình vuông, tròn, tam giác, chữ nhật)',
    grade: 1,
    className: '1B',
    objectives: 'Nhận biết và phối hợp các hình cơ bản để vẽ hoặc cắt dán ngôi nhà, đồ vật thân quen.',
    materials: 'Giấy thủ công màu, hồ dán an toàn, kéo đầu tròn.',
    status: 'Đã dạy',
    notes: 'Phát triển tư duy không gian và khả năng liên tưởng hình học.'
  },
  {
    id: 'plan-g1-5',
    week: 5,
    period: 5,
    title: 'Chủ đề 5: Màu cơ bản trong mĩ thuật (Đỏ, Vàng, Lam)',
    grade: 1,
    className: '1A',
    objectives: 'Phân biệt và sử dụng thuần thục 3 màu gốc (Đỏ, Vàng, Lam) tô kín hình hoa quả, thiên nhiên.',
    materials: 'Sáp màu, giấy vẽ A4, hình mẫu quả dâu, mặt trời, biển cả.',
    status: 'Đã dạy',
    notes: '100% học sinh tô màu mịn, đều tay trong khuôn hình.'
  },
  {
    id: 'plan-g1-6',
    week: 6,
    period: 6,
    title: 'Chủ đề 6: Sáng tạo từ những khối cơ bản (Khối cầu, khối trụ, khối hộp)',
    grade: 1,
    className: '1A',
    objectives: 'Nhận biết các khối 3D qua đất nặn; thực hành vo tròn, lăn dài tạo hình trái cây và con vật.',
    materials: 'Đất nặn sinh học an toàn, bảng lăn, dao nhựa chia đất.',
    status: 'Đã dạy',
    notes: 'Học sinh tạo hình phong phú, giữ gìn vệ sinh lớp học.'
  },
  {
    id: 'plan-g1-7',
    week: 7,
    period: 7,
    title: 'Chủ đề 7: Hoa, quả quanh em',
    grade: 1,
    className: '1B',
    objectives: 'Quan sát và nhận biết đặc điểm hình dáng, màu sắc hoa quả; vẽ và xé dán vườn quả bốn mùa.',
    materials: 'Giấy màu, sáp màu, hồ dán.',
    status: 'Sắp dạy',
    notes: 'Chuẩn bị vật mẫu quả thật (cam, chuối, táo) cho học sinh quan sát.'
  },
  {
    id: 'plan-g1-8',
    week: 8,
    period: 8,
    title: 'Chủ đề 8: Người thân của em (Chân dung gia đình yêu thương)',
    grade: 1,
    className: '1B',
    objectives: 'Vẽ chân dung người thân (ông bà, cha mẹ, anh chị) thể hiện nét mặt biểu cảm ấm áp.',
    materials: 'Giấy vẽ A4, bút chì, màu sáp.',
    status: 'Sắp dạy',
    notes: 'Giáo dục tình cảm gia đình và lòng biết ơn.'
  },
  {
    id: 'plan-g1-9',
    week: 9,
    period: 9,
    title: 'Chủ đề 9: Em là học sinh lớp 1 (Trường học hạnh phúc)',
    grade: 1,
    className: '1A',
    objectives: 'Tái hiện không khí học tập, vui chơi cùng thầy cô và bạn bè trong ngày hội đến trường.',
    materials: 'Giấy vẽ A3, sáp màu dầu.',
    status: 'Sắp dạy',
    notes: 'Khích lệ tinh thần tự tin, gắn bó với trường lớp.'
  },

  // --- LỚP 2: BỘ SÁCH KẾT NỐI TRI THỨC VỚI CUỘC SỐNG ---
  {
    id: 'plan-g2-1',
    week: 10,
    period: 10,
    title: 'Chủ đề 1: Mĩ thuật trong cuộc sống (Đồ vật quanh em)',
    grade: 2,
    className: '2A',
    objectives: 'Quan sát và phát hiện vẻ đẹp mĩ thuật trong các đồ dùng sinh hoạt và thiên nhiên quanh em.',
    materials: 'Giấy A4, bút chì, sáp màu.',
    status: 'Đã dạy',
    notes: 'Học sinh nhận biết họa tiết trang trí đồ vật quen thuộc.'
  },
  {
    id: 'plan-g2-2',
    week: 11,
    period: 11,
    title: 'Chủ đề 2: Sự thú vị của nét (Nét thanh, nét đậm, nét lượn sóng)',
    grade: 2,
    className: '2A',
    objectives: 'Vận dụng sự phối hợp giữa nét thanh và nét đậm tạo nhịp điệu sinh động cho bài vẽ phong cảnh.',
    materials: 'Bút dạ, sáp màu, giấy vẽ Canson.',
    status: 'Đã dạy',
    notes: 'Tạo chiều sâu và cảm xúc qua độ dày mỏng của đường nét.'
  },
  {
    id: 'plan-g2-3',
    week: 12,
    period: 12,
    title: 'Chủ đề 3: Sự kết hợp của các hình cơ bản (Ngôi nhà và khu phố)',
    grade: 2,
    className: '2B',
    objectives: 'Kết hợp các hình vuông, tròn, tam giác, chữ nhật tạo hình dãy nhà phố hoặc nhà sàn truyền thống.',
    materials: 'Giấy thủ công màu, hồ dán, kéo đầu tròn.',
    status: 'Đã dạy',
    notes: 'Học sinh thực hành cắt dán bố cục cân đối, hài hòa.'
  },
  {
    id: 'plan-g2-4',
    week: 13,
    period: 13,
    title: 'Chủ đề 4: Những mảng màu yêu thích (Gam màu Nóng - Lạnh)',
    grade: 2,
    className: '2B',
    objectives: 'Nhận biết và phân biệt cảm giác ấm áp của màu nóng, mát dịu của màu lạnh trong tranh vẽ.',
    materials: 'Hộp màu sáp, giấy vẽ A4.',
    status: 'Sắp dạy',
    notes: 'Thị phạm phân mảng màu tương phản nổi bật.'
  },
  {
    id: 'plan-g2-5',
    week: 14,
    period: 14,
    title: 'Chủ đề 5: Sự kết hợp thú vị của khối (Mô hình phương tiện giao thông)',
    grade: 2,
    className: '2A',
    objectives: 'Lắp ghép, nặn từ khối hộp, khối trụ, khối cầu tạo hình ô tô, tàu thuyền, máy bay ngộ nghĩnh.',
    materials: 'Đất nặn, vỏ hộp tái chế, keo dán.',
    status: 'Sắp dạy',
    notes: 'Tích hợp giáo dục an toàn giao thông và bảo vệ môi trường.'
  },
  {
    id: 'plan-g2-6',
    week: 15,
    period: 15,
    title: 'Chủ đề 6: Sắc màu thiên nhiên (Cây cối, hoa lá và côn trùng)',
    grade: 2,
    className: '2A',
    objectives: 'Vẽ tranh thiên nhiên tươi đẹp với cỏ cây, hoa bướm khoe sắc rực rỡ.',
    materials: 'Sáp màu dầu, giấy A3.',
    status: 'Sắp dạy',
    notes: 'Nuôi dưỡng tình yêu thiên nhiên đất nước.'
  },
  {
    id: 'plan-g2-7',
    week: 16,
    period: 16,
    title: 'Chủ đề 7: Gương mặt thân quen (Chân dung biểu cảm)',
    grade: 2,
    className: '2B',
    objectives: 'Nắm tỉ lệ khuôn mặt, vẽ chân dung bạn bè hoặc thầy cô với nụ cười rạng rỡ.',
    materials: 'Chì 2B, màu sáp hoặc màu dạ.',
    status: 'Sắp dạy',
    notes: 'Chú ý thể hiện nét mặt qua khóe mắt và nụ cười.'
  },
  {
    id: 'plan-g2-8',
    week: 17,
    period: 17,
    title: 'Chủ đề 8: Bữa cơm gia đình (Ấm áp sum vầy)',
    grade: 2,
    className: '2B',
    objectives: 'Tái hiện khoảnh khắc gia đình quây quần bên mâm cơm ấm cúng bằng tranh vẽ hoặc nặn món ăn.',
    materials: 'Đất nặn nhiều màu hoặc sáp màu trên giấy A3.',
    status: 'Sắp dạy',
    notes: 'Giáo dục lòng hiếu thảo và tình yêu thương gia đình.'
  },

  // --- LỚP 3: BỘ SÁCH KẾT NỐI TRI THỨC VỚI CUỘC SỐNG ---
  {
    id: 'plan-g3-1',
    week: 18,
    period: 18,
    title: 'Chủ đề 1: Em yêu Mĩ thuật (Khám phá bảo tàng & Dụng cụ vẽ)',
    grade: 3,
    className: '3A',
    objectives: 'Tìm hiểu các hình thức mĩ thuật (hội họa, đồ họa, điêu khắc) và cách sử dụng dụng cụ học vẽ.',
    materials: 'Tranh ảnh mĩ thuật, bút chì, màu vẽ các loại.',
    status: 'Đã dạy',
    notes: 'Hình thành năng lực quan sát và cảm thụ thẩm mỹ.'
  },
  {
    id: 'plan-g3-2',
    week: 19,
    period: 19,
    title: 'Chủ đề 2: Hoa văn trên trang phục của một số dân tộc',
    grade: 3,
    className: '3A',
    objectives: 'Khám phá và mô phỏng lại hoa văn trang trí đối xứng trên thổ cẩm của các dân tộc Việt Nam.',
    materials: 'Thước kẻ hoa văn, bút chì, màu sáp nhũ.',
    status: 'Đã dạy',
    notes: 'Gìn giữ và tự hào về bản sắc văn hóa các dân tộc anh em.'
  },
  {
    id: 'plan-g3-3',
    week: 20,
    period: 20,
    title: 'Chủ đề 3: Màu sắc em yêu (Sắc độ Đậm - Nhạt)',
    grade: 3,
    className: '3B',
    objectives: 'Biết cách pha trộn và điều chỉnh sắc độ Đậm - Nhạt của màu sắc để tạo chiều sâu cho bức tranh.',
    materials: 'Màu nước hoặc sáp dầu, cọ vẽ, bảng pha màu.',
    status: 'Sắp dạy',
    notes: 'Học sinh phân biệt rõ các cấp độ sáng tối của màu.'
  },
  {
    id: 'plan-g3-4',
    week: 21,
    period: 21,
    title: 'Chủ đề 4: Vẻ đẹp của khối (Khối cầu, khối trụ, khối hộp)',
    grade: 3,
    className: '3B',
    objectives: 'Tạo hình không gian 3 chiều từ các khối cơ bản, thể hiện đồ vật và động vật sinh động.',
    materials: 'Đất nặn, bìa carton, que gỗ.',
    status: 'Sắp dạy',
    notes: 'Phát triển tư duy tạo hình điêu khắc ba chiều.'
  },
  {
    id: 'plan-g3-5',
    week: 22,
    period: 22,
    title: 'Chủ đề 10: An toàn giao thông (Em đi bộ an toàn, Đèn tín hiệu)',
    grade: 3,
    className: '3A',
    objectives: 'Vẽ tranh tuyên truyền chấp hành luật an toàn giao thông trên đường phố quê hương.',
    materials: 'Giấy A3, sáp màu dầu.',
    status: 'Sắp dạy',
    notes: 'Nâng cao ý thức văn hóa giao thông cho học sinh.'
  },

  // --- LỚP 4: BỘ SÁCH KẾT NỐI TRI THỨC VỚI CUỘC SỐNG ---
  {
    id: 'plan-g4-1',
    week: 23,
    period: 23,
    title: 'Chủ đề 1: Vẻ đẹp trong điêu khắc đình làng Việt Nam',
    grade: 4,
    className: '4A',
    objectives: 'Khám phá nghệ thuật chạm khắc gỗ đình làng; vẽ mô phỏng các họa tiết rồng, phượng, cảnh sinh hoạt.',
    materials: 'Giấy vẽ, bút chì 4B, sáp màu.',
    status: 'Đã dạy',
    notes: 'Tự hào về di sản văn hóa truyền thống cha ông.'
  },
  {
    id: 'plan-g4-2',
    week: 24,
    period: 24,
    title: 'Chủ đề 2: Một số dạng không gian trong tranh dân gian Việt Nam',
    grade: 4,
    className: '4A',
    objectives: 'Nhận biết cách sắp xếp không gian ước lệ trong tranh Đông Hồ, Hàng Trống; thực hành vẽ tranh dân gian.',
    materials: 'Màu bột, giấy dó hoặc giấy kraft nâu.',
    status: 'Sắp dạy',
    notes: 'Trải nghiệm nét đẹp mộc mạc của tranh khắc gỗ dân gian.'
  },
  {
    id: 'plan-g4-3',
    week: 25,
    period: 25,
    title: 'Chủ đề 3: Cảnh đẹp quê hương (Đồng bằng, miền núi, miền biển)',
    grade: 4,
    className: '4B',
    objectives: 'Vẽ tranh phong cảnh non sông gấm vóc Việt Nam, thể hiện tình yêu quê hương đất nước.',
    materials: 'Màu nước, sáp dầu, giấy A3.',
    status: 'Sắp dạy',
    notes: 'Phân lớp tiền cảnh, trung cảnh và hậu cảnh rõ ràng.'
  },

  // --- LỚP 5: BỘ SÁCH KẾT NỐI TRI THỨC VỚI CUỘC SỐNG ---
  {
    id: 'plan-g5-1',
    week: 26,
    period: 26,
    title: 'Chủ đề 1: Yếu tố tạo hình trong thực hành, sáng tạo theo chủ đề',
    grade: 5,
    className: '5A',
    objectives: 'Vận dụng tổng hợp các yếu tố chấm, nét, mảng, hình khối và đậm nhạt để sáng tạo tác phẩm hoàn chỉnh.',
    materials: 'Màu acrylic hoặc sáp dầu, giấy chuyên dụng.',
    status: 'Đã dạy',
    notes: 'Phát huy năng lực tự chủ và sáng tạo thẩm mỹ cá nhân.'
  },
  {
    id: 'plan-g5-2',
    week: 27,
    period: 27,
    title: 'Chủ đề 2: Hình tượng anh hùng dân tộc trong mĩ thuật tạo hình Việt Nam',
    grade: 5,
    className: '5A',
    objectives: 'Tạo hình tượng các vị anh hùng lịch sử dân tộc qua tượng tròn, phù điêu hoặc tranh vẽ truyền thần.',
    materials: 'Đất sét, bìa mô hình, màu vẽ.',
    status: 'Sắp dạy',
    notes: 'Giáo dục truyền thống yêu nước và lòng biết ơn thế hệ đi trước.'
  },
  {
    id: 'plan-g5-3',
    week: 28,
    period: 28,
    title: 'Chủ đề 8: Vì một thế giới hoà bình (Hữu nghị bốn phương)',
    grade: 5,
    className: '5B',
    objectives: 'Vẽ tranh cổ động hòa bình, tình hữu nghị giữa các dân tộc và trẻ em trên toàn thế giới.',
    materials: 'Giấy A3, bút dạ, sáp màu nhũ.',
    status: 'Sắp dạy',
    notes: 'Lan tỏa thông điệp yêu thương, bảo vệ hòa bình thế giới.'
  }
];

export const DEFAULT_EVALUATIONS: StudentEvaluationItem[] = [
  { id: 'ev-1', studentCode: '64631313-00-2598', name: 'Kpuih Chai', className: '1A', week: 9, level: 'H', comment: 'Hoàn thành bài vẽ đúng yêu cầu chủ đề, đường nét rõ ràng, màu sắc tươi sáng.' },
  { id: 'ev-2', studentCode: '64631313-00-2436', name: 'Kpuih Chuyên', className: '1A', week: 9, level: 'H', comment: 'Biết cách pha trộn và tô màu đều tay, bố cục tranh tương đối hợp lý.' },
  { id: 'ev-3', studentCode: '64631313-00-2449', name: 'Siu Dưng', className: '1A', week: 9, level: 'H', comment: 'Có ý thức chuẩn bị đồ dùng học tập đầy đủ, tích cực tham gia các hoạt động thực hành.' },
  { id: 'ev-4', studentCode: '64631313-00-2438', name: 'Kpuih Hậu', className: '1A', week: 9, level: 'T', comment: 'Có năng khiếu mĩ thuật nổi bật, phối màu hài hòa, đường nét giàu cảm xúc, sáng tạo độc đáo.' },
  { id: 'ev-5', studentCode: '64631313-00-2601', name: 'Rơ Mah Hồng', className: '1A', week: 9, level: 'T', comment: 'Nhận biết và sử dụng màu sắc rất tốt, ý tưởng vẽ tranh phong phú, tự tin chia sẻ trước lớp.' },
  { id: 'ev-6', studentCode: '64631313-00-2445', name: 'Rơ Mah Kiên', className: '1A', week: 9, level: 'T', comment: 'Kỹ thuật vẽ nét và xé dán rất khéo léo, thể hiện rõ chủ đề bài học, hoàn thành bài xuất sắc.' },
  { id: 'ev-7', studentCode: '64631313-00-2547', name: 'Kpuih Mỹ Liên', className: '1A', week: 9, level: 'T', comment: 'Bố cục tranh cân đối, màu sắc sinh động, có nhiều ý tưởng sáng tạo vượt trội so với yêu cầu.' },
  { id: 'ev-8', studentCode: '64631313-00-2602', name: 'Rơ Châm Huấn', className: '1A', week: 9, level: 'H', comment: 'Nắm được các bước vẽ cơ bản, vẽ hình cân đối, màu sắc hài hòa theo chủ đề.' },
  { id: 'ev-9', studentCode: '64631313-00-2448', name: 'Siu Đăng Khôi', className: '1A', week: 9, level: 'H', comment: 'Sản phẩm mĩ thuật rõ ràng, sạch sẽ, hoàn thành đúng tiến độ bài học trên lớp.' },
  { id: 'ev-10', studentCode: '64631313-00-2555', name: 'Kpuih H’ Lan', className: '2A', week: 9, level: 'T', comment: 'Tích cực tham gia các hoạt động mĩ thuật, thể hiện cảm xúc thẩm mỹ rất tốt qua từng bài vẽ.' },
  { id: 'ev-11', studentCode: '64631313-00-2556', name: 'Rơ Lan Minh', className: '2A', week: 9, level: 'H', comment: 'Biết lắng nghe và tiếp thu hướng dẫn của thầy cô, vẽ hình có tiến bộ rõ rệt.' },
  { id: 'ev-12', studentCode: '64631313-00-2557', name: 'Siu Siu Thảo', className: '2A', week: 9, level: 'C', comment: 'Em cần chú ý quan sát mẫu kĩ hơn, tô màu cẩn thận và hoàn thiện bài vẽ đúng hạn.' },
  { id: 'ev-13', studentCode: '64631313-00-2558', name: 'Kpuih Bri', className: '3A', week: 9, level: 'T', comment: 'Khả năng quan sát tinh tế, thể hiện hình khối và chi tiết rất sinh động, nét vẽ tự tin.' },
  { id: 'ev-14', studentCode: '64631313-00-2559', name: 'Rơ Mah Hùng', className: '3A', week: 9, level: 'H', comment: 'Tự tin chia sẻ cảm xúc về bức tranh của mình và bạn bè sau giờ thực hành.' },
  { id: 'ev-15', studentCode: '64631313-00-2560', name: 'Siu Ksor Doan', className: '4A', week: 9, level: 'T', comment: 'Sử dụng vật liệu đa dạng, tạo hình sáng tạo, sản phẩm mĩ thuật có tính thẩm mỹ rất cao.' },
  { id: 'ev-16', studentCode: '64631313-00-2561', name: 'Đỗ Tiến Khôi', className: '5A', week: 9, level: 'T', comment: 'Tư duy tạo hình xuất sắc, phối màu Tây Nguyên đặc trưng và có tính ứng dụng cao.' }
];

export const DEFAULT_STUDIO_DATA: StudioStorageState = {
  version: '2.1-ket-noi-tri-thuc',
  project: {
    title: 'Kế Hoạch & Bài Giảng Mĩ Thuật GDPT 2018',
    slides: [
      {
        id: 'slide-vip-1',
        title: 'Chào mừng các em đến với lớp học Mĩ thuật!',
        background: '#ffffff',
        elements: [
          {
            id: 'el-vip-1',
            type: 'text',
            text: 'MĨ THUẬT TIỂU HỌC GDPT 2018\nPhần Mềm Soạn Giảng & Trình Chiếu Mĩ Thuật\nChuẩn Chương Trình GDPT 2018',
            x: 100,
            y: 80,
            width: 760,
            height: 180,
            fontSize: 26,
            fontWeight: 'bold',
            color: '#b45309',
            textAlign: 'center'
          }
        ],
        notes: 'Giáo viên giới thiệu mục tiêu bài học, khởi động với bài hát sắc màu quê hương.'
      }
    ],
    updatedAt: new Date().toISOString()
  },
  plans: DEFAULT_PLANS,
  evaluations: DEFAULT_EVALUATIONS,
  settings: DEFAULT_SETTINGS,
  lastSaved: new Date().toISOString()
};

function cloneDefaultData(): StudioStorageState {
  return JSON.parse(JSON.stringify(DEFAULT_STUDIO_DATA));
}

/**
 * Đọc toàn bộ dữ liệu Studio từ LocalStorage theo từng không gian người dùng.
 */
export function getStoredData(userScope?: string): StudioStorageState {
  if (typeof window === 'undefined') return cloneDefaultData();
  const key = getScopedStorageKey(STORAGE_KEY, userScope);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const initial = cloneDefaultData();
      saveStoredData(initial, userScope);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.plans || !parsed.settings) {
      const initial = cloneDefaultData();
      saveStoredData(initial, userScope);
      return initial;
    }
    // Tự động nâng cấp nếu phát hiện tiêu đề bài giảng cũ chưa khớp chuẩn SGK Kết Nối Tri Thức
    const hasLegacyTitles = Array.isArray(parsed.plans) && parsed.plans.some((p: { title?: string }) =>
      p?.title?.includes('Mỹ thuật và Cuộc sống - Sắc màu thiên nhiên') ||
      p?.title?.includes('Nét vẽ kỳ diệu') ||
      p?.title?.includes('Ngôi nhà thân yêu - Tạo hình từ hình học cơ bản') ||
      p?.title?.includes('Khu vườn tuổi thơ')
    );
    if (hasLegacyTitles || parsed.version !== '2.1-ket-noi-tri-thuc') {
      parsed.plans = DEFAULT_PLANS;
      parsed.version = '2.1-ket-noi-tri-thuc';
      saveStoredData(parsed, userScope);
    }
    return parsed as StudioStorageState;
  } catch (err) {
    console.warn('[Studio Storage] Lỗi đọc LocalStorage, khôi phục mặc định:', err);
    return cloneDefaultData();
  }
}

/**
 * Ghi dữ liệu đồng bộ vào LocalStorage theo từng không gian người dùng ngay lập tức.
 */
export function saveStoredData(data: StudioStorageState, userScope?: string): void {
  if (typeof window === 'undefined') return;
  const key = getScopedStorageKey(STORAGE_KEY, userScope);
  try {
    const payload = {
      ...data,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('conhi-storage-updated', { detail: payload }));
  } catch (err) {
    console.error('[Studio Storage] Lỗi lưu LocalStorage:', err);
  }
}

/**
 * Tự động lưu với cơ chế Debounce 300ms chuẩn VIP PRO.
 */
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
export function autoSaveData(
  patch: Partial<StudioStorageState>,
  onSaved?: (saved: StudioStorageState) => void,
  userScope?: string
): () => void {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }

  autoSaveTimer = setTimeout(() => {
    const current = getStoredData(userScope);
    const updated: StudioStorageState = {
      ...current,
      ...patch,
      project: patch.project ? { ...current.project, ...patch.project } : current.project,
      settings: patch.settings ? { ...current.settings, ...patch.settings } : current.settings,
      lastSaved: new Date().toISOString()
    };
    saveStoredData(updated, userScope);
    if (onSaved) onSaved(updated);
    autoSaveTimer = null;
  }, 300);

  return () => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = null;
    }
  };
}

/**
 * Xuất toàn bộ cơ sở dữ liệu ra file sao lưu JSON chuẩn (.json).
 */
export function exportBackupJson(customData?: StudioStorageState, filename?: string): void {
  if (typeof window === 'undefined') return;
  const data = customData || getStoredData();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = filename || `Sao_Luu_Co_Nhi_Studio_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Nhập file sao lưu (.json) và khôi phục vào hệ thống.
 */
export function importRestoreJson(file: File): Promise<StudioStorageState> {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('Chưa chọn file sao lưu'));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Định dạng tệp sao lưu không hợp lệ');
        }
        const restored: StudioStorageState = {
          version: parsed.version || '2.0-vip-pro',
          project: parsed.project || DEFAULT_STUDIO_DATA.project,
          plans: Array.isArray(parsed.plans) ? parsed.plans : DEFAULT_PLANS,
          evaluations: Array.isArray(parsed.evaluations) ? parsed.evaluations : DEFAULT_EVALUATIONS,
          settings: parsed.settings || DEFAULT_SETTINGS,
          lastSaved: new Date().toISOString()
        };
        saveStoredData(restored);
        resolve(restored);
      } catch (err: any) {
        reject(new Error('Không thể đọc file sao lưu: ' + (err.message || 'Lỗi cú pháp JSON')));
      }
    };
    reader.onerror = () => reject(new Error('Lỗi khi đọc tệp từ thiết bị'));
    reader.readAsText(file, 'utf-8');
  });
}

/**
 * Khôi phục dữ liệu mẫu mặc định ban đầu cho không gian người dùng.
 */
export function restoreDefaultData(userScope?: string): StudioStorageState {
  const fresh = cloneDefaultData();
  saveStoredData(fresh, userScope);
  return fresh;
}

/**
 * Tính toán thống kê KPI thời gian thực.
 */
export function computeKPI(state?: StudioStorageState): StudioKPIData {
  const plans = state?.plans || [];
  const evaluations = state?.evaluations || [];
  const slides = state?.project?.slides || [];

  const totalPlans = plans.length;
  const taughtPlans = plans.filter(p => p.status === 'Đã dạy').length;
  const totalStudents = evaluations.length;
  const levelTCount = evaluations.filter(e => e.level === 'T').length;
  const levelHCount = evaluations.filter(e => e.level === 'H').length;
  const levelCCount = evaluations.filter(e => e.level === 'C').length;
  const completionRate = totalPlans > 0 ? Math.round((taughtPlans / totalPlans) * 100) : 100;

  return {
    totalSlides: slides.length,
    totalPlans,
    taughtPlans,
    totalStudents,
    levelTCount,
    levelHCount,
    levelCCount,
    completionRate
  };
}

/**
 * Đăng ký lắng nghe sự kiện thay đổi dữ liệu từ các tab hoặc component khác.
 */
export function subscribeToStorage(listener: (data: StudioStorageState) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const custom = e as CustomEvent<StudioStorageState>;
    if (custom.detail) {
      listener(custom.detail);
    } else {
      listener(getStoredData());
    }
  };
  window.addEventListener('conhi-storage-updated', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('conhi-storage-updated', handler);
    window.removeEventListener('storage', handler);
  };
}
