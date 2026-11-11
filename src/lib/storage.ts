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
  status: 'Đã dạy' | 'Đang dạy' | 'Chưa dạy';
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
  {
    id: 'plan-1',
    week: 1,
    period: 1,
    title: 'Chủ đề 1: Mỹ thuật và Cuộc sống - Sắc màu thiên nhiên',
    grade: 1,
    className: '1A',
    objectives: 'Nhận biết 3 màu cơ bản: Đỏ, Vàng, Lam. Biết phối màu tươi sáng tạo hình bông hoa.',
    materials: 'Giấy A4, sáp màu dầu, tranh ảnh thiên nhiên Tây Nguyên.',
    status: 'Đã dạy',
    notes: 'Học sinh hào hứng, 100% hoàn thành sản phẩm tại lớp.'
  },
  {
    id: 'plan-2',
    week: 2,
    period: 2,
    title: 'Chủ đề 1: Nét vẽ kỳ diệu - Những con đường em đến trường',
    grade: 1,
    className: '1B',
    objectives: 'Thực hành các nét vẽ thẳng, cong, lượn sóng tạo hình con đường và hàng cây.',
    materials: 'Bút dạ màu, bảng con, giấy vẽ Canson.',
    status: 'Đã dạy',
    notes: 'Rèn luyện nét vẽ tự tin, không dùng thước kẻ.'
  },
  {
    id: 'plan-3',
    week: 3,
    period: 3,
    title: 'Chủ đề 2: Ngôi nhà thân yêu - Tạo hình từ hình học cơ bản',
    grade: 2,
    className: '2A',
    objectives: 'Vẽ và cắt dán ngôi nhà sàn truyền thống từ các hình vuông, tam giác, chữ nhật.',
    materials: 'Giấy thủ công màu, hồ dán an toàn, kéo đầu tròn.',
    status: 'Đã dạy',
    notes: 'Liên hệ văn hóa nhà rông truyền thống địa phương.'
  },
  {
    id: 'plan-4',
    week: 4,
    period: 4,
    title: 'Chủ đề 2: Khu vườn tuổi thơ - Kỹ thuật xé dán không dùng kéo',
    grade: 2,
    className: '2B',
    objectives: 'Rèn sự khéo léo của đôi tay qua kỹ thuật xé viền giấy tạo mảng màu biểu cảm.',
    materials: 'Giấy báo cũ, họa báo màu, hồ nước.',
    status: 'Đã dạy',
    notes: 'Giáo dục ý thức tái chế và bảo vệ môi trường.'
  },
  {
    id: 'plan-5',
    week: 5,
    period: 5,
    title: 'Chủ đề 3: Động vật quanh em - Nặn con mèo ngộ nghĩnh',
    grade: 3,
    className: '3A',
    objectives: 'Tạo hình khối tròn, trụ, vuốt nhọn đất nặn để tạo dáng con mèo đang nằm vươn vai.',
    materials: 'Đất nặn sinh học an toàn, bảng lăn, dao nhựa chia đất.',
    status: 'Đã dạy',
    notes: 'Học sinh tạo hình phong phú, biết thêm chi tiết vòng cổ, đĩa sữa.'
  },
  {
    id: 'plan-6',
    week: 6,
    period: 6,
    title: 'Chủ đề 3: Trang trí đồ vật - Họa tiết hoa văn thổ cẩm',
    grade: 3,
    className: '3B',
    objectives: 'Quan sát và sao chép đối xứng hoa văn dệt thổ cẩm truyền thống Gia Rai.',
    materials: 'Bút chì, thước kẻ hoa văn, sáp màu nhũ.',
    status: 'Đang dạy',
    notes: 'Tích hợp giáo dục gìn giữ bản sắc văn hóa địa phương.'
  },
  {
    id: 'plan-7',
    week: 7,
    period: 7,
    title: 'Chủ đề 4: Chân dung bạn bè - Biểu cảm gương mặt vui vẻ',
    grade: 4,
    className: '4A',
    objectives: 'Nắm tỉ lệ khuôn mặt người, vẽ chân dung bạn cùng bàn thể hiện nét mặt tươi vui.',
    materials: 'Giấy A3, chì 2B, màu sáp hoặc màu nước.',
    status: 'Chưa dạy',
    notes: 'Chuẩn bị gương nhỏ cho học sinh quan sát cảm xúc.'
  },
  {
    id: 'plan-8',
    week: 8,
    period: 8,
    title: 'Chủ đề 4: Lễ hội mùa xuân - Bố cục tranh nhiều nhân vật',
    grade: 4,
    className: '4B',
    objectives: 'Sắp xếp nhóm người chính phụ trong không gian ngày hội cồng chiêng.',
    materials: 'Giấy vẽ chuyên dụng, màu bột pha sẵn.',
    status: 'Chưa dạy',
    notes: 'Thị phạm phân lớp không gian gần - xa, to - nhỏ.'
  },
  {
    id: 'plan-9',
    week: 9,
    period: 9,
    title: 'Chủ đề 5: Thiết kế thời trang thiếu nhi từ lá cây và hoa khô',
    grade: 5,
    className: '5A',
    objectives: 'Thu gom lá rụng trong sân trường, dán tạo hình trang phục biểu diễn nghệ thuật.',
    materials: 'Lá cây khô, cánh hoa, keo sữa, bìa carton.',
    status: 'Chưa dạy',
    notes: 'Phát huy tư duy thẩm mỹ ứng dụng và tạo hình không gian.'
  },
  {
    id: 'plan-10',
    week: 10,
    period: 10,
    title: 'Chủ đề 5: Triển lãm mĩ thuật nhí - Tổng kết học kỳ',
    grade: 5,
    className: '5B',
    objectives: 'Học sinh tự trưng bày, thuyết trình cảm nhận và đánh giá sản phẩm của bạn bè.',
    materials: 'Dây treo tranh, kẹp gỗ, bảng nhãn tên tác giả.',
    status: 'Chưa dạy',
    notes: 'Đánh giá năng lực tự chủ và giao tiếp thẩm mỹ theo TT27.'
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
  version: '2.0-vip-pro',
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
export function computeKPI(state: StudioStorageState): StudioKPIData {
  const plans = state.plans || [];
  const evaluations = state.evaluations || [];
  const slides = state.project?.slides || [];

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
