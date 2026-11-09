/**
 * Cọ Nhí Studio - Bộ phân tích câu lệnh tiếng Việt tự nhiên chuẩn SIÊU VIP PRO
 * Phân tích trực tiếp 100% trong trình duyệt (Offline 100%, Zero-API Key required)
 * Nhận diện: tìm kiếm, lọc theo tuần/lớp/trạng thái/mức đạt, thêm nhanh, xuất Word/Excel, sao lưu/khôi phục.
 */

export interface SmartFilterCriteria {
  className?: string;
  week?: number;
  status?: 'Đã dạy' | 'Đang dạy' | 'Chưa dạy';
  level?: 'T' | 'H' | 'C';
}

export interface SmartCommandResult {
  type: 
    | 'search' 
    | 'filter' 
    | 'add_plan' 
    | 'export_word' 
    | 'export_excel' 
    | 'backup_json' 
    | 'restore_json' 
    | 'load_sample' 
    | 'navigate_tab'
    | 'help';
  query?: string;
  filters?: SmartFilterCriteria;
  payload?: any;
  targetTab?: 'dashboard' | 'editor' | 'drawing' | 'games' | 'camera' | 'evaluation';
  message: string;
  confidence: number;
}

export interface QuickActionChip {
  id: string;
  label: string;
  command: string;
  description: string;
  category: 'action' | 'filter' | 'export' | 'system';
  badgeColor: string;
}

export const QUICK_ACTION_CHIPS: QuickActionChip[] = [
  {
    id: 'chip-add-plan',
    label: '➕ Thêm bài dạy mới',
    command: 'thêm bài dạy mới',
    description: 'Tạo nhanh một bài học mĩ thuật theo chuẩn GDPT 2018',
    category: 'action',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300'
  },
  {
    id: 'chip-filter-1a',
    label: '🔍 Lớp 1A',
    command: 'lọc lớp 1A',
    description: 'Hiển thị bài giảng và học sinh lớp 1A',
    category: 'filter',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-300'
  },
  {
    id: 'chip-filter-2a',
    label: '🎨 Lớp 2A',
    command: 'lọc lớp 2A',
    description: 'Hiển thị bài giảng và học sinh lớp 2A',
    category: 'filter',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-300'
  },
  {
    id: 'chip-filter-level-t',
    label: '⭐ Mức Tốt (T)',
    command: 'lọc học sinh mức T',
    description: 'Lọc các học sinh đạt mức Hoàn thành tốt môn Mĩ thuật',
    category: 'filter',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-300'
  },
  {
    id: 'chip-export-word',
    label: '📝 Xuất Báo Cáo Word',
    command: 'xuất word',
    description: 'Tải văn bản Word (.doc) có Quốc hiệu Tiêu ngữ và chữ ký Đỗ Tiến Sỹ',
    category: 'export',
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-300'
  },
  {
    id: 'chip-export-excel',
    label: '📊 Xuất Bảng Tính Excel',
    command: 'xuất excel',
    description: 'Tải file Excel (.csv) chuẩn tiếng Việt UTF-8 BOM',
    category: 'export',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-300'
  },
  {
    id: 'chip-backup-json',
    label: '💾 Sao Lưu Dữ Liệu',
    command: 'sao lưu dữ liệu',
    description: 'Xuất toàn bộ giáo án và sổ điểm ra file .json an toàn',
    category: 'system',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300'
  },
  {
    id: 'chip-restore-json',
    label: '📥 Khôi Phục (.json)',
    command: 'khôi phục dữ liệu',
    description: 'Nhập lại file sao lưu vào ứng dụng',
    category: 'system',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-300'
  },
  {
    id: 'chip-load-sample',
    label: '⚡ Nạp Dữ Liệu Mẫu',
    command: 'nạp dữ liệu mẫu',
    description: 'Phục hồi bộ dữ liệu mẫu trường TH Lê Quý Đôn',
    category: 'system',
    badgeColor: 'bg-yellow-50 text-yellow-900 border-yellow-300'
  }
];

/**
 * Chuẩn hóa chuỗi tiếng Việt để tìm kiếm không dấu
 */
function normalizeText(text: string): string {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim();
}

/**
 * Hàm phân tích câu lệnh tự nhiên tiếng Việt không cần API ngoài
 */
export function parseSmartCommand(rawInput: string): SmartCommandResult {
  const text = String(rawInput || '').trim();
  const norm = normalizeText(text);

  if (!norm) {
    return {
      type: 'help',
      message: 'Vui lòng nhập từ khóa hoặc chọn thao tác gợi ý nhanh phía dưới.',
      confidence: 1.0
    };
  }

  // 1. Phân tích lệnh Xuất Word
  if (/(?:xuat|tai|in|export).*(?:word|doc|van ban|bao cao doc)|^(?:word|doc)$/i.test(norm)) {
    return {
      type: 'export_word',
      message: 'Đang tiến hành xuất báo cáo ra file Word (.doc) chuẩn Times New Roman...',
      confidence: 0.95
    };
  }

  // 2. Phân tích lệnh Xuất Excel
  if (/(?:xuat|tai|in|export).*(?:excel|csv|bang tinh|bang diem|smas)|^(?:excel|csv)$/i.test(norm)) {
    return {
      type: 'export_excel',
      message: 'Đang tiến hành xuất bảng tính Excel (.csv) có Quốc hiệu Tiêu ngữ...',
      confidence: 0.95
    };
  }

  // 3. Phân tích lệnh Sao Lưu (.json)
  if (/(?:sao luu|backup|luu file|xuat json|tai backup)/i.test(norm)) {
    return {
      type: 'backup_json',
      message: 'Đang tạo bản sao lưu toàn bộ dữ liệu Cọ Nhí Studio ra tệp .json...',
      confidence: 0.95
    };
  }

  // 4. Phân tích lệnh Khôi Phục (.json)
  if (/(?:khoi phuc|restore|nhap file|nap json|mo backup)/i.test(norm)) {
    return {
      type: 'restore_json',
      message: 'Sẵn sàng nạp file sao lưu .json để phục hồi dữ liệu.',
      confidence: 0.95
    };
  }

  // 5. Phân tích lệnh Nạp Dữ Liệu Mẫu
  if (/(?:du lieu mau|nap mau|khoi phuc mac dinh|reset mau|le quy don)/i.test(norm)) {
    return {
      type: 'load_sample',
      message: 'Khôi phục dữ liệu mẫu thực tế Trường PTDTBT TH Lê Quý Đôn.',
      confidence: 0.95
    };
  }

  // 6. Phân tích lệnh Điều Hướng Màn Hình (Navigation)
  if (/(?:bang ve|thi pham|ve tranh|ve net|mau ve)/i.test(norm)) {
    return {
      type: 'navigate_tab',
      targetTab: 'drawing',
      message: 'Chuyển sang Bảng Vẽ Thị Phạm 4 Bước.',
      confidence: 0.9
    };
  }
  if (/(?:tro choi|game|quiz|cau hoi|trac nghiem)/i.test(norm)) {
    return {
      type: 'navigate_tab',
      targetTab: 'games',
      message: 'Chuyển sang khu vực Trò Chơi Mĩ Thuật GDPT 2018.',
      confidence: 0.9
    };
  }
  if (/(?:cham tranh|camera|cam|chup anh|nhan dien mau|rubric)/i.test(norm)) {
    return {
      type: 'navigate_tab',
      targetTab: 'camera',
      message: 'Chuyển sang Cam Chấm Tranh & Phân Tích Cảm Biến Màu.',
      confidence: 0.9
    };
  }
  if (/(?:smas|nhan xet|so diem|tt27|danh gia hoc sinh)/i.test(norm)) {
    return {
      type: 'navigate_tab',
      targetTab: 'evaluation',
      message: 'Chuyển sang Sổ Đánh Giá Học Sinh Thông Tư 27 & Xuất SMAS.',
      confidence: 0.9
    };
  }
  if (/(?:soan slide|trinh chieu|bai giang|slide)/i.test(norm)) {
    return {
      type: 'navigate_tab',
      targetTab: 'editor',
      message: 'Chuyển sang màn hình Soạn Thảo Slide Bài Giảng.',
      confidence: 0.9
    };
  }
  if (/(?:tong quan|dashboard|bento|kpi|trang chu)/i.test(norm)) {
    return {
      type: 'navigate_tab',
      targetTab: 'dashboard',
      message: 'Chuyển về Tổng Quan & Bento Grid Dashboard.',
      confidence: 0.9
    };
  }

  // 7. Phân tích Thêm Nhanh Bài Học
  const addMatch = text.match(/(?:thêm|tao|them|tạo)\s+(?:bài|kế hoạch|tiết|bai|ke hoach)?\s*(.+)/i);
  if (addMatch && addMatch[1] && !norm.includes('lop') && !norm.includes('tuan') && !norm.includes('hoc sinh')) {
    const titleCandidate = addMatch[1].trim();
    return {
      type: 'add_plan',
      payload: {
        title: titleCandidate,
        week: 1,
        className: '1A'
      },
      message: `Thêm bài học mới: "${titleCandidate}"`,
      confidence: 0.85
    };
  }

  // 8. Phân tích Bộ Lọc (Lớp, Tuần, Mức, Trạng thái)
  const filters: SmartFilterCriteria = {};
  let hasFilter = false;

  // Lọc Lớp: ví dụ "lớp 1A", "lop 2B", "3C", "khối 1"
  const classMatch = text.match(/(?:lớp|lop|khoi|khối)\s*([1-5]\s*[a-zA-Z]?)|(?:\b([1-5][a-zA-Z])\b)/i);
  if (classMatch) {
    const rawCls = (classMatch[1] || classMatch[2]).replace(/\s+/g, '').toUpperCase();
    filters.className = rawCls;
    hasFilter = true;
  }

  // Lọc Tuần: ví dụ "tuần 5", "tuan 12", "w3"
  const weekMatch = norm.match(/(?:tuan|w)\s*(\d{1,2})/i);
  if (weekMatch) {
    filters.week = parseInt(weekMatch[1], 10);
    hasFilter = true;
  }

  // Lọc Trạng Thái
  if (norm.includes('da day')) {
    filters.status = 'Đã dạy';
    hasFilter = true;
  } else if (norm.includes('dang day')) {
    filters.status = 'Đang dạy';
    hasFilter = true;
  } else if (norm.includes('chua day')) {
    filters.status = 'Chưa dạy';
    hasFilter = true;
  }

  // Lọc Mức Đánh Giá TT27
  if (norm.includes('muc tot') || norm.includes('muc t') || norm.includes('hoan thanh tot')) {
    filters.level = 'T';
    hasFilter = true;
  } else if (norm.includes('muc dat') || norm.includes('muc h') || (norm.includes('hoan thanh') && !norm.includes('tot') && !norm.includes('chua'))) {
    filters.level = 'H';
    hasFilter = true;
  } else if (norm.includes('chua hoan thanh') || norm.includes('muc c') || norm.includes('can co gang')) {
    filters.level = 'C';
    hasFilter = true;
  }

  if (hasFilter) {
    const filterDesc = [
      filters.className ? `Lớp ${filters.className}` : '',
      filters.week ? `Tuần ${filters.week}` : '',
      filters.status ? `Trạng thái "${filters.status}"` : '',
      filters.level ? `Mức "${filters.level}"` : ''
    ].filter(Boolean).join(' • ');

    return {
      type: 'filter',
      filters,
      message: `Đang lọc theo: ${filterDesc}`,
      confidence: 0.9
    };
  }

  // 9. Mặc định: Tìm kiếm toàn diện trong kế hoạch và học sinh
  return {
    type: 'search',
    query: text,
    message: `Tìm kiếm nội dung theo từ khóa: "${text}"`,
    confidence: 0.75
  };
}
