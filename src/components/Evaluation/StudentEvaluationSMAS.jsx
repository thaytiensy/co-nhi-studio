import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ClipboardCheck,
  Edit3,
  X, 
  Upload, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  Info,
  RotateCcw,
  Camera,
  Sparkles,
  Award,
  ChevronDown,
  Calendar,
  Eye,
  Image as ImageIcon
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { parseSmasWorkbook, exportSmasExcel, shuffleClassComments, parseLevel } from '../../utils/smasExcelService';
import { getScopedStorageKey } from '../../utils/userWorkspaceService';
import { 
  batchSynthesizeClassEvaluations, 
  PERIODIC_COMMENTS_BANK 
} from '../../utils/smasEvaluationBridge';

// Ngân hàng nhận xét môn Mĩ thuật chuẩn Thông tư 27/2020/TT-BGDĐT
const TT27_COMMENTS_BANK = {
  // Mức Hoàn Thành Tốt (T)
  T: [
    'Có năng khiếu mĩ thuật nổi bật, phối màu hài hòa, đường nét giàu cảm xúc, sáng tạo độc đáo.',
    'Nhận biết và sử dụng màu sắc rất tốt, ý tưởng vẽ tranh phong phú, tự tin chia sẻ trước lớp.',
    'Nắm vững kĩ thuật tạo hình, bố cục tranh cân đối, thể hiện sinh động cảm xúc về cuộc sống.',
    'Chủ động, tích cực trong giờ học, hoàn thành sản phẩm đẹp mắt và biết giúp đỡ bạn bè.',
    'Tư duy thẩm mĩ sáng tạo, khéo léo kết hợp các chất liệu mĩ thuật tạo nên sản phẩm ấn tượng.'
  ],
  // Mức Hoàn Thành (H)
  H: [
    'Hoàn thành bài vẽ đúng yêu cầu chủ đề, đường nét rõ ràng, màu sắc tươi sáng.',
    'Biết cách pha trộn và tô màu đều tay, bố cục tranh tương đối hợp lý.',
    'Có ý thức rèn luyện kĩ năng tạo hình, hoàn thành sản phẩm đúng thời gian quy định.',
    'Nắm được các bước vẽ tranh cơ bản, biết chia sẻ cảm nhận về bài vẽ của mình và của bạn.',
    'Chăm chỉ, tích cực tham gia các hoạt động thực hành sáng tạo mĩ thuật trong lớp.'
  ],
  // Mức Chưa Hoàn Thành (C)
  C: [
    'Em cần chú ý quan sát mẫu kĩ hơn, tô màu cẩn thận và hoàn thiện bài vẽ đúng hạn.',
    'Nét vẽ còn ngập ngừng, em cần mạnh dạn hơn khi phác hình và phối màu tươi sáng.',
    'Cần tập trung hơn trong giờ thực hành mĩ thuật, cố gắng hoàn thành sản phẩm theo hướng dẫn của Thầy/Cô.',
    'Em cần rèn luyện thêm kĩ năng sử dụng sáp màu, tránh để màu lem ra ngoài nét vẽ.'
  ]
};

const INITIAL_STUDENTS = [
  { id: 'HS001', name: 'Nguyễn Văn An', className: '1A', level: 'T', gkLevel: 'T', ckLevel: 'T', cnLevel: 'T', weeklyLevels: { 1: 'T', 2: 'T', 3: 'T', 4: 'T', 5: 'H', 6: 'T', 7: 'T', 8: 'T', 9: 'T' }, comment: 'Có năng khiếu mĩ thuật nổi bật, phối màu hài hòa, đường nét giàu cảm xúc, sáng tạo độc đáo.' },
  { id: 'HS002', name: 'Trần Thị Bình', className: '1A', level: 'T', gkLevel: 'T', ckLevel: 'T', cnLevel: 'T', weeklyLevels: { 1: 'T', 2: 'H', 3: 'T', 4: 'T', 5: 'T', 6: 'T', 7: 'H', 8: 'T', 9: 'T' }, comment: 'Nhận biết và sử dụng màu sắc rất tốt, ý tưởng vẽ tranh phong phú, tự tin chia sẻ trước lớp.' },
  { id: 'HS003', name: 'Lê Hoàng Cường', className: '1A', level: 'H', gkLevel: 'H', ckLevel: 'H', cnLevel: 'H', weeklyLevels: { 1: 'H', 2: 'H', 3: 'H', 4: 'T', 5: 'H', 6: 'H', 7: 'H', 8: 'T', 9: 'H' }, comment: 'Hoàn thành bài vẽ đúng yêu cầu chủ đề, đường nét rõ ràng, màu sắc tươi sáng.' },
  { id: 'HS004', name: 'Phạm Minh Đức', className: '1A', level: 'H', gkLevel: 'H', ckLevel: 'H', cnLevel: 'H', weeklyLevels: { 1: 'H', 2: 'H', 3: 'H', 4: 'H', 5: 'H', 6: 'T', 7: 'H', 8: 'H', 9: 'H' }, comment: 'Biết cách pha trộn và tô màu đều tay, bố cục tranh tương đối hợp lý.' },
  { id: 'HS005', name: 'Vũ Ngọc Hân', className: '1A', level: 'H', gkLevel: 'H', ckLevel: 'H', cnLevel: 'H', weeklyLevels: { 1: 'H', 2: 'T', 3: 'H', 4: 'H', 5: 'H', 6: 'H', 7: 'H', 8: 'H', 9: 'H' }, comment: 'Nắm được các bước vẽ tranh cơ bản, biết chia sẻ cảm nhận về bài vẽ của mình và của bạn.' },
  { id: 'HS006', name: 'Đỗ Quốc Khánh', className: '1A', level: 'C', gkLevel: 'C', ckLevel: 'C', cnLevel: 'C', weeklyLevels: { 1: 'C', 2: 'H', 3: 'C', 4: 'H', 5: 'C', 6: 'H', 7: 'H', 8: 'C', 9: 'C' }, comment: 'Em cần chú ý quan sát mẫu kĩ hơn, tô màu cẩn thận và hoàn thiện bài vẽ đúng hạn.' },
];

const BASE_SMAS_STORAGE_KEY = 'conhi_smas_evaluations_state_v2';
const getSmasStorageKey = () => getScopedStorageKey(BASE_SMAS_STORAGE_KEY);
const getTeachingClassesKey = () => getScopedStorageKey('conhi_teaching_classes');
const DEFAULT_TEACHING_CLASSES = ['1A', '1B', '1C', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B'];

export default function StudentEvaluationSMAS({ onNavigateToCamera }) {
  // Trạng thái: Chỉ hiện lớp và học kỳ khi giáo viên đã tải danh sách hoặc đã chọn lớp dạy
  const [hasUploadedOrSelected, setHasUploadedOrSelected] = useState(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(getSmasStorageKey()) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        return Boolean(parsed.hasUploadedOrSelected && (parsed.students?.length > 0 || parsed.className));
      }
    } catch (_) {}
    return false;
  });

  const [className, setClassName] = useState(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(getSmasStorageKey()) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.className || '';
      }
    } catch (_) {}
    return '';
  });

  const [classOptions, setClassOptions] = useState(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(getSmasStorageKey()) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed.classOptions) ? parsed.classOptions : [];
      }
    } catch (_) {}
    return [];
  });

  const [selectedClassFilter, setSelectedClassFilter] = useState(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(getSmasStorageKey()) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.selectedClassFilter || 'all';
      }
    } catch (_) {}
    return 'all';
  });

  const [semester, setSemester] = useState(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(getSmasStorageKey()) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.semester || 'Học kì I';
      }
    } catch (_) {}
    return 'Học kì I';
  });

  const [students, setStudents] = useState(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(getSmasStorageKey()) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.students)) {
          return parsed.students;
        }
      }
    } catch (_) {}
    return [];
  });

  // Quản lý danh sách lớp dạy có thể chỉnh sửa theo ý muốn giáo viên theo không gian riêng (Khai báo trước allClasses)
  const [teachingClasses, setTeachingClasses] = useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(getTeachingClassesKey()) : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return DEFAULT_TEACHING_CLASSES;
  });

  const saveTeachingClasses = (newClasses) => {
    const cleaned = Array.from(new Set(newClasses.map(c => String(c).trim().replace(/^Lớp\s+/i, '')).filter(Boolean)));
    setTeachingClasses(cleaned);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(getTeachingClassesKey(), JSON.stringify(cleaned));
      }
    } catch (_) {}
  };

  // Chế độ xem sổ điểm thống nhất (không tách tab riêng biệt):
  // 'weekly' (35 Tuần Thường Xuyên - Không nhận xét) | 'periodic' (Tổng Hợp Định Kỳ & Nhận Xét TT27) | 'all' (Xem Toàn Diện)
  const [viewMode, setViewMode] = useState('weekly');
  const [periodicPeriod, setPeriodicPeriod] = useState('GK'); // 'GK' | 'CK' | 'CN'

  // Đổi nhanh mức đánh giá Tuần (T -> H -> C -> xóa)
  const handleToggleWeeklyLevel = (studentId, weekNum) => {
    setStudents(prev => prev.map(st => {
      if (st.id !== studentId) return st;
      const weekly = st.weeklyLevels || {};
      const cur = weekly[weekNum] || weekly[String(weekNum)] || '';
      let next = 'T';
      if (cur === 'T') next = 'H';
      else if (cur === 'H') next = 'C';
      else if (cur === 'C') next = '';
      else next = 'T';

      const updated = { ...weekly };
      if (next) updated[weekNum] = next;
      else delete updated[weekNum];

      return {
        ...st,
        weeklyLevels: updated
      };
    }));
  };

  // Tab lọc xem theo kỳ: 'TX' (Thường xuyên), 'GK' (Giữa kì), 'CK' (Cuối kì), 'CN' (Cả năm)
  const [activePeriodTab, setActivePeriodTab] = useState('TX');
  const [showSynthesisModal, setShowSynthesisModal] = useState(false);
  const [synthesisTargetPeriod, setSynthesisTargetPeriod] = useState('GK');
  const [selectedStudentForCamModal, setSelectedStudentForCamModal] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const [copiedIndex, setCopiedIndex] = useState(null);
  const [exportNotice, setExportNotice] = useState('');
  const fileInputRef = useRef(null);

  // Lắng nghe sự kiện đồng bộ từ Cam Chấm Tranh
  useEffect(() => {
    const handleSmasUpdated = (e) => {
      if (e.detail && Array.isArray(e.detail.students)) {
        setStudents(e.detail.students);
        if (e.detail.className) setClassName(e.detail.className);
        if (Array.isArray(e.detail.classOptions)) setClassOptions(e.detail.classOptions);
        setHasUploadedOrSelected(true);
      }
    };
    window.addEventListener('conhi-smas-updated', handleSmasUpdated);
    return () => window.removeEventListener('conhi-smas-updated', handleSmasUpdated);
  }, []);

  // Tự động lưu LocalStorage bảo toàn 100% dữ liệu thực khi giáo viên chỉnh sửa hoặc tải lại trang F5
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(getSmasStorageKey(), JSON.stringify({
          hasUploadedOrSelected,
          className,
          classOptions,
          selectedClassFilter,
          semester,
          students
        }));
      } catch (_) {}
    }, 300);
    return () => clearTimeout(timer);
  }, [hasUploadedOrSelected, className, classOptions, selectedClassFilter, semester, students]);

  // Danh sách các lớp được trích xuất (kết hợp danh sách lớp dạy của GV và dữ liệu học sinh)
  const allClasses = Array.from(new Set([
    ...teachingClasses.map(c => (String(c).startsWith('Lớp') ? String(c) : `Lớp ${c}`)),
    ...(className ? [className] : []),
    ...classOptions,
    ...students.map(s => s.className).filter(Boolean)
  ])).filter(Boolean);

  // Danh sách học sinh hiển thị theo bộ lọc lớp
  const displayedStudents = selectedClassFilter === 'all'
    ? students
    : students.filter(s => (s.className || className || '').trim() === selectedClassFilter.trim());

  // Thống kê số liệu KPI linh hoạt theo chế độ xem (35 tuần thường xuyên hoặc tổng hợp định kỳ)
  const currentKpi = useMemo(() => {
    const totalStudents = displayedStudents.length;
    if (viewMode === 'weekly') {
      let t = 0, h = 0, c = 0;
      displayedStudents.forEach(st => {
        const wMap = st.weeklyLevels || {};
        for (let w = 1; w <= 35; w++) {
          const lvl = wMap[w] || wMap[String(w)];
          if (lvl === 'T') t++;
          else if (lvl === 'H') h++;
          else if (lvl === 'C') c++;
        }
      });
      const totalMarks = t + h + c;
      return {
        mode: 'weekly',
        labelSuffix: 'lượt',
        t,
        h,
        c,
        tPercent: totalMarks > 0 ? Math.round((t / totalMarks) * 100) : 0,
        hPercent: totalMarks > 0 ? Math.round((h / totalMarks) * 100) : 0,
        cPercent: totalMarks > 0 ? Math.round((c / totalMarks) * 100) : 0,
      };
    } else {
      let t = 0, h = 0, c = 0;
      displayedStudents.forEach(s => {
        const lvl = periodicPeriod === 'GK'
          ? (s.gkLevel || s.level)
          : periodicPeriod === 'CK'
          ? (s.ckLevel || s.level)
          : (s.cnLevel || s.ckLevel || s.level);
        if (lvl === 'T') t++;
        else if (lvl === 'H') h++;
        else if (lvl === 'C') c++;
      });
      return {
        mode: 'periodic',
        labelSuffix: 'em',
        t,
        h,
        c,
        tPercent: totalStudents > 0 ? Math.round((t / totalStudents) * 100) : 0,
        hPercent: totalStudents > 0 ? Math.round((h / totalStudents) * 100) : 0,
        cPercent: totalStudents > 0 ? Math.round((c / totalStudents) * 100) : 0,
      };
    }
  }, [displayedStudents, viewMode, periodicPeriod]);

  const [showClassManagerModal, setShowClassManagerModal] = useState(false);
  const [editingClassList, setEditingClassList] = useState([]);
  const [newClassInput, setNewClassInput] = useState('');

  const handleOpenClassManager = () => {
    setEditingClassList(teachingClasses.map(c => ({ id: Math.random().toString(), name: c })));
    setNewClassInput('');
    setShowClassManagerModal(true);
  };

  const handleAddClassInManager = (e) => {
    e?.preventDefault();
    if (!newClassInput.trim()) return;
    const cleanName = newClassInput.trim().replace(/^Lớp\s+/i, '');
    if (editingClassList.some(c => c.name.toLowerCase() === cleanName.toLowerCase())) {
      alert('Lớp này đã có trong danh sách!');
      return;
    }
    setEditingClassList(prev => [...prev, { id: Math.random().toString(), name: cleanName }]);
    setNewClassInput('');
  };

  const handleSaveClassManager = () => {
    const updatedNames = editingClassList.map(c => c.name.trim().replace(/^Lớp\s+/i, '')).filter(Boolean);
    if (updatedNames.length === 0) {
      alert('Danh sách lớp dạy không được để trống.');
      return;
    }
    saveTeachingClasses(updatedNames);
    const formatted = updatedNames.map(c => `Lớp ${c}`);
    setClassOptions(formatted);

    // Nếu lớp đang chọn bị xóa, đổi sang lớp đầu tiên
    if (className && !formatted.includes(className)) {
      setClassName(formatted[0] || '');
      if (selectedClassFilter !== 'all') {
        setSelectedClassFilter(formatted[0] || 'all');
      }
    }

    setShowClassManagerModal(false);
    setExportNotice('✅ Đã cập nhật danh sách lớp dạy theo ý muốn!');
    setTimeout(() => setExportNotice(''), 3000);
  };

  const handleResetDefaultClasses = () => {
    if (window.confirm('Khôi phục danh sách lớp dạy mặc định (1A đến 5B)?')) {
      setEditingClassList(DEFAULT_TEACHING_CLASSES.map(c => ({ id: Math.random().toString(), name: c })));
    }
  };

  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteInputText, setPasteInputText] = useState('');

  // Hành động: Giáo viên chọn một lớp dạy cụ thể
  const handleSelectTeachingClass = (targetClass) => {
    if (!targetClass) return;
    const cleanClass = targetClass.trim();
    setClassName(cleanClass);
    setSelectedClassFilter(cleanClass);
    setClassOptions(prev => Array.from(new Set([...prev, cleanClass])));
    setHasUploadedOrSelected(true);
  };

  // Hành động: Giáo viên thêm lớp mới
  const handleAddNewClass = () => {
    const newCls = prompt('Nhập tên lớp dạy mới (ví dụ: 1A1, 2C, 3D, 4E, 5G):');
    if (newCls && newCls.trim()) {
      const clean = newCls.trim().replace(/^Lớp\s+/i, '');
      const full = `Lớp ${clean}`;
      if (!teachingClasses.includes(clean)) {
        saveTeachingClasses([...teachingClasses, clean]);
      }
      handleSelectTeachingClass(full);
      setExportNotice(`✅ Đã thêm ${full} vào danh sách lớp dạy!`);
      setTimeout(() => setExportNotice(''), 3000);
    }
  };

  // Nạp dữ liệu mẫu thử nghiệm
  const handleLoadSampleData = () => {
    setStudents(INITIAL_STUDENTS);
    setClassName('Lớp 1A');
    setClassOptions(['Lớp 1A']);
    setSelectedClassFilter('all');
    setHasUploadedOrSelected(true);
    setExportNotice('✅ Đã nạp danh sách mẫu 6 em để thử nghiệm tính năng!');
    setTimeout(() => setExportNotice(''), 3000);
  };

  // Xóa danh sách để nạp lại từ đầu
  const handleResetData = () => {
    if (students.length > 0 && !window.confirm('Thầy/Cô có chắc chắn muốn làm mới sổ nhận xét để nạp danh sách lớp khác?')) {
      return;
    }
    setStudents([]);
    setClassName('');
    setClassOptions([]);
    setSelectedClassFilter('all');
    setHasUploadedOrSelected(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SMAS_STORAGE_KEY);
    }
  };

  // Mở cửa sổ chọn tệp danh sách học sinh
  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Helper bóc tách danh sách TXT/dán văn bản: nhận tên, mã, lớp, mức và nhận xét.
  const parseRawTextLines = (text) => {
    const source = String(text || '').replace(/^\uFEFF/, '');
    const sampleLines = source.split(/\r?\n/).filter(line => line.trim()).slice(0, 20);
    const delimiters = ['\t', ',', ';', '|'];
    const delimiter = delimiters
      .map(value => ({ value, count: sampleLines.reduce((total, line) => total + line.split(value).length - 1, 0) }))
      .sort((a, b) => b.count - a.count)[0];
    const separator = delimiter?.count > 0 ? delimiter.value : null;
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;

    for (let index = 0; index < source.length; index += 1) {
      const character = source[index];
      if (character === '"') {
        if (quoted && source[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = !quoted;
        }
      } else if (!quoted && separator && character === separator) {
        row.push(cell.trim());
        cell = '';
      } else if (!quoted && (character === '\n' || character === '\r')) {
        if (character === '\r' && source[index + 1] === '\n') index += 1;
        row.push(cell.trim());
        if (row.some(value => value)) rows.push(row);
        row = [];
        cell = '';
      } else {
        cell += character;
      }
    }
    row.push(cell.trim());
    if (row.some(value => value)) rows.push(row);

    const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();
    const headerIndex = rows.findIndex(cells => cells.some(value => {
      const label = normalize(value);
      return label.includes('ho va ten') || label === 'ho ten' || label.includes('ten hoc sinh') || label === 'stt';
    }));
    let nameIndex = -1;
    let familyIndex = -1;
    let givenIndex = -1;
    let idIndex = -1;
    let classIndex = -1;
    let levelIndex = -1;
    let commentIndex = -1;
    if (headerIndex >= 0) {
      const headers = rows[headerIndex].map(normalize);
      nameIndex = headers.findIndex(label => label.includes('ho va ten') || label === 'ho ten' || label.includes('ten hoc sinh'));
      familyIndex = headers.findIndex(label => label.includes('ho dem') || label === 'ho');
      givenIndex = headers.findIndex(label => label === 'ten' || label === 'ten hs');
      idIndex = headers.findIndex(label => (label.includes('ma hs') || label.includes('ma hoc sinh') || label.includes('ma dinh danh') || label === 'ma' || label === 'id') && !label.includes('stt'));
      classIndex = headers.findIndex(label => label.includes('lop'));
      levelIndex = headers.findIndex(label => !label.includes('nhan xet') && !label.includes('noi dung') && (label.includes('muc') || label.includes('dat') || label.includes('ket qua') || label.includes('xep loai') || label.includes('hoc ky') || label.includes('hoc ki') || label.includes('giua') || label.includes('cuoi') || label.includes('danh gia') || label.includes('mi thuat') || label.includes('my thuat')));
      commentIndex = headers.findIndex(label => label.includes('nhan xet') || label.includes('ghi chu') || label.includes('noi dung') || label.includes('y kien') || label.includes('nx'));
    }

    const generatedId = index => `HS${String(index + 1).padStart(3, '0')}`;
    const parsed = [];

    rows.forEach((cells, rowIndex) => {
      if (headerIndex >= 0 && rowIndex <= headerIndex) return;
      const values = cells.map(value => String(value || '').trim());
      let id = '';
      let name = '';
      let targetCls = '';
      let level = 'H';
      let comment = '';
      let used = new Set();

      if (headerIndex >= 0) {
        name = nameIndex >= 0 ? values[nameIndex] : `${values[familyIndex] || ''} ${values[givenIndex] || ''}`.trim();
        if (nameIndex >= 0) used.add(nameIndex);
        if (familyIndex >= 0) used.add(familyIndex);
        if (givenIndex >= 0) used.add(givenIndex);
        if (idIndex >= 0) { id = values[idIndex]; used.add(idIndex); }
        if (classIndex >= 0) { targetCls = values[classIndex]; used.add(classIndex); }
        if (levelIndex >= 0) { level = parseLevel(values[levelIndex]); used.add(levelIndex); }
        if (commentIndex >= 0) { comment = values[commentIndex]; used.add(commentIndex); }
      } else {
        const candidateNameIndex = values.findIndex(value => value.replace(/^\d+[.\s-]+/, '').trim().split(/\s+/).length >= 2 && /[a-zA-ZÀ-ỹ]/.test(value));
        if (candidateNameIndex < 0) return;
        nameIndex = candidateNameIndex;
        name = values[nameIndex].replace(/^\d+[.\s-]+/, '').trim();
        used.add(nameIndex);
        const idCandidate = values.findIndex((value, index) => index !== nameIndex && /^(HS[- ]?\d+|\d{6,})$/i.test(value));
        if (idCandidate >= 0) { id = values[idCandidate]; used.add(idCandidate); }
        const classCandidate = values.findIndex((value, index) => index !== nameIndex && /^(?:lớp\s*\d{1,2}[a-z]{0,2}|\d{1,2}[a-z]{1,2})$/i.test(value));
        if (classCandidate >= 0) { targetCls = values[classCandidate].replace(/^lớp\s*/i, '').trim(); used.add(classCandidate); }
        const ordinalCandidate = values.findIndex((value, index) => index !== nameIndex && /^\d{1,3}$/.test(value));
        if (ordinalCandidate >= 0 && ordinalCandidate !== classCandidate) used.add(ordinalCandidate);
        const levelCandidate = values.findIndex((value, index) => index !== nameIndex && ['T', 'H', 'C'].includes(value.toUpperCase()));
        if (levelCandidate >= 0) { level = parseLevel(values[levelCandidate]); used.add(levelCandidate); }
        const commentCandidate = values.findIndex((value, index) => index !== nameIndex && !used.has(index) && value.length > 0);
        if (commentCandidate >= 0) { comment = values[commentCandidate]; used.add(commentCandidate); }
      }

      if (!name || /^(stt|danh sach|ho va ten|ho ten)$/i.test(normalize(name))) return;
      const hasProvidedComment = Boolean(comment);
      if (!comment) {
        const bank = TT27_COMMENTS_BANK[level] || TT27_COMMENTS_BANK.H;
        comment = bank[parsed.length % bank.length];
      }
      parsed.push({ id: id || generatedId(parsed.length), name, className: targetCls || className || '', level, comment, commentSource: hasProvidedComment ? 'provided' : 'generated' });
    });

    return parsed;
  };

  // Tải danh sách học sinh lên làm điểm (Linh hoạt cho mọi định dạng: .xlsx, .xls, .csv, .txt, .tsv)
  const handleUploadExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileName = file.name.toLowerCase();

      // Tệp .txt có thể là danh sách tên mỗi dòng; CSV/TSV được đọc theo cột ở bên dưới.
      if (fileName.endsWith('.txt')) {
        const text = await file.text();
        const parsed = parseRawTextLines(text);
        if (parsed.length > 0) {
          const detectedClasses = Array.from(new Set(parsed.map(student => student.className).filter(Boolean)));
          setStudents(parsed);
          setClassOptions(detectedClasses);
          if (detectedClasses.length === 1) setClassName(detectedClasses[0]);
          setHasUploadedOrSelected(true);
          setExportNotice(`✅ Đã đọc thành công ${parsed.length} học sinh từ tệp!`);
          setTimeout(() => setExportNotice(''), 4000);
          return;
        }
      }

      // TRƯỜNG HỢP 2: Tệp bảng tính Excel (.xlsx, .xls, .csv)
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const { students: parsedStudents, detectedClasses } = parseSmasWorkbook(workbook, { semester });

      if (!parsedStudents || parsedStudents.length === 0) {
        alert('Không tìm thấy danh sách học sinh hợp lệ trong tệp Excel. Thầy/Cô có thể bấm "Dán Danh Sách" để copy-paste trực tiếp cực nhanh nhé!');
        return;
      }

      setStudents(parsedStudents);
      setClassOptions(detectedClasses);
      if (detectedClasses.length > 0) {
        setClassName(detectedClasses[0]);
        setSelectedClassFilter('all');
      }
      setHasUploadedOrSelected(true);

      if (/giua|ghk/i.test(fileName)) {
        setSemester('Giữa kì I');
      } else if (/cuoi|chk/i.test(fileName)) {
        setSemester('Học kì I');
      }

      const tCount = parsedStudents.filter(s => s.level === 'T').length;
      const hCount = parsedStudents.filter(s => s.level === 'H').length;
      const cCount = parsedStudents.filter(s => s.level === 'C').length;
      setExportNotice(`✅ Đã nạp thành công toàn bộ ${parsedStudents.length} học sinh (${tCount} T, ${hCount} H, ${cCount} C) từ "${file.name}"!`);
      setTimeout(() => setExportNotice(''), 4000);
    } catch (err) {
      console.error('Lỗi nạp tệp học sinh:', err);
      alert('Lỗi đọc tệp danh sách học sinh: ' + err.message + '\nThầy/Cô có thể dùng tính năng Dán Danh Sách (Copy-Paste) để nạp ngay.');
    }
  };

  // Nạp danh sách qua dán văn bản (Copy - Paste)
  const handleApplyPastedStudents = () => {
    if (!pasteInputText.trim()) return;
    const parsed = parseRawTextLines(pasteInputText).map(student => ({
      ...student,
      className: student.className || className || ''
    }));
    if (parsed.length > 0) {
      setStudents(parsed);
      const detectedClasses = Array.from(new Set(parsed.map(student => student.className).filter(Boolean)));
      setClassOptions(detectedClasses);
      if (detectedClasses.length === 1) setClassName(detectedClasses[0]);
      setHasUploadedOrSelected(true);
      setShowPasteModal(false);
      setPasteInputText('');
      setExportNotice(`✅ Đã thêm ${parsed.length} học sinh từ văn bản dán!`);
      setTimeout(() => setExportNotice(''), 4000);
    } else {
      alert('Chưa nhận diện được tên học sinh. Vui lòng dán mỗi em trên một dòng.');
    }
  };

  // Thay đổi mức đánh giá (T, H, C) -> gợi ý nhận xét chuẩn TT27 tương ứng
  const handleLevelChange = (id, newLevel) => {
    setStudents(prev => prev.map(student => {
      if (student.id !== id) return student;
      const bank = TT27_COMMENTS_BANK[newLevel] || TT27_COMMENTS_BANK.H;
      const comment = (!student.comment?.trim() || student.commentSource === 'generated') ? bank[0] : student.comment;
      return { ...student, level: newLevel, comment, commentSource: student.commentSource || 'generated' };
    }));
  };

  // Sửa trực tiếp nội dung nhận xét
  const handleCommentChange = (id, newComment) => {
    setStudents(prev => prev.map(student => student.id === id ? { ...student, comment: newComment, commentSource: 'custom' } : student));
  };

  // Sửa trường thông tin học sinh (tên, lớp, mã)
  const handleUpdateStudent = (id, field, value) => {
    setStudents(prev => prev.map(student => student.id === id ? { ...student, [field]: value } : student));
  };

  // Thêm học sinh mới
  const handleAddStudent = () => {
    const newId = `HS${(students.length + 1).toString().padStart(3, '0')}`;
    const targetClass = selectedClassFilter === 'all' ? (className || '1A') : selectedClassFilter;
    const newStudent = {
      id: newId,
      name: `Học sinh mới ${students.length + 1}`,
      className: targetClass,
      level: 'H',
      gkLevel: 'H',
      ckLevel: 'H',
      cnLevel: 'H',
      weeklyLevels: {},
      comment: TT27_COMMENTS_BANK.H[0],
      commentSource: 'generated',
    };
    setStudents([...students, newStudent]);
    setHasUploadedOrSelected(true);
  };

  // Xóa học sinh
  const handleDeleteStudent = (id) => {
    setStudents(prev => prev.filter(student => student.id !== id));
  };

  // Sao chép 1 dòng nhận xét để dán vào Web SMAS
  const handleCopySingle = (index, text) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Đổi nhận xét tránh trùng cho lớp đang chọn
  const handleShuffleComments = () => {
    const updated = shuffleClassComments(students, selectedClassFilter);
    setStudents(updated);
    setExportNotice('🎲 Đã tạo mới gợi ý nhận xét đa dạng cho học sinh!');
    setTimeout(() => setExportNotice(''), 3000);
  };

  // Gán nhanh mức T, H, C cho lớp đang chọn
  const handleBatchSetLevel = (lvl) => {
    const bank = TT27_COMMENTS_BANK[lvl] || TT27_COMMENTS_BANK.H;
    const updated = students.map((st, idx) => {
      if (selectedClassFilter !== 'all' && (st.className || className || '').trim() !== selectedClassFilter.trim()) {
        return st;
      }
      return {
        ...st,
        level: lvl,
        comment: bank[idx % bank.length],
        commentSource: 'generated'
      };
    });
    setStudents(updated);
    setExportNotice(`⚡ Đã gán nhanh mức ${lvl} cho danh sách!`);
    setTimeout(() => setExportNotice(''), 3000);
  };

  // Thay đổi mức đánh giá định kỳ (Giữa kỳ hoặc Cuối kỳ)
  const handlePeriodicLevelChange = (id, periodKey, newLevel) => {
    setStudents(prev => prev.map(student => {
      if (student.id !== id) return student;
      const bank = PERIODIC_COMMENTS_BANK[periodKey]?.[newLevel] || PERIODIC_COMMENTS_BANK[periodKey]?.H;
      const hash = String(student.id || student.name).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const newComment = bank[hash % bank.length] || '';
      
      if (periodKey === 'GK') {
        return {
          ...student,
          gkLevel: newLevel,
          gkComment: (!student.gkComment || student.commentSource === 'periodic_synthesized') ? newComment : student.gkComment
        };
      }
      if (periodKey === 'CK') {
        return {
          ...student,
          ckLevel: newLevel,
          ckComment: (!student.ckComment || student.commentSource === 'periodic_synthesized') ? newComment : student.ckComment
        };
      }
      if (periodKey === 'CN') {
        return {
          ...student,
          cnLevel: newLevel,
          cnComment: (!student.cnComment || student.commentSource === 'periodic_synthesized') ? newComment : student.cnComment
        };
      }
      return student;
    }));
  };

  // Sửa trực tiếp nhận xét định kỳ (Giữa kỳ, Cuối kỳ hoặc Cả năm)
  const handlePeriodicCommentChange = (id, periodKey, newComment) => {
    setStudents(prev => prev.map(student => {
      if (student.id !== id) return student;
      if (periodKey === 'GK') {
        return { ...student, gkComment: newComment };
      }
      if (periodKey === 'CK') {
        return { ...student, ckComment: newComment };
      }
      if (periodKey === 'CN') {
        return { ...student, cnComment: newComment };
      }
      return student;
    }));
  };

  // Tổng hợp tự động điểm và nhận xét định kỳ (Giữa kỳ hoặc Cuối kỳ)
  const handleSynthesizePeriodic = (targetPeriod = 'GK') => {
    if (students.length === 0) {
      alert('Chưa có học sinh nào trong sổ điểm để tổng hợp.');
      return;
    }
    const result = batchSynthesizeClassEvaluations({
      students,
      targetClass: selectedClassFilter,
      targetPeriod
    });
    setStudents(result.students);
    const periodTitle = targetPeriod === 'CN' ? 'Cả năm' : targetPeriod === 'CK' ? 'Cuối kì I' : 'Giữa kì I';
    const targetClassText = selectedClassFilter === 'all' ? 'Tất cả các lớp' : selectedClassFilter;
    setExportNotice(`⚡ Đã tổng hợp điểm & nhận xét ${periodTitle} cho ${result.summary.total} học sinh lớp ${targetClassText} (${result.summary.tCount} T, ${result.summary.hCount} H, ${result.summary.cCount} C)!`);
    setShowSynthesisModal(false);
    setTimeout(() => setExportNotice(''), 6000);
  };

  // Xuất bảng nhận xét ra tệp Excel chuẩn SMAS (Hỗ trợ Thường xuyên, Giữa kỳ, Cuối kỳ & Toàn diện)
  const handleExportExcel = (multiSheet = false, exportMode = 'standard') => {
    if (students.length === 0) {
      alert('Chưa có học sinh nào để xuất tệp Excel.');
      return;
    }
    if (students.some(student => !(student.className?.trim() || className.trim()))) {
      alert('Vui lòng nhập lớp mặc định ở phía trên hoặc điền lớp cho từng học sinh trước khi xuất.');
      return;
    }

    try {
      const targetClass = selectedClassFilter === 'all' ? (className || '1A') : selectedClassFilter;
      const fileName = exportSmasExcel({ 
        students, 
        className: targetClass, 
        semester, 
        multiSheet,
        exportMode
      });
      setShowExportDropdown(false);
      setExportNotice(`✅ Đã xuất tệp Excel: ${fileName}`);
      setTimeout(() => setExportNotice(''), 5000);
    } catch (err) {
      alert('Lỗi xuất Excel: ' + err.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 select-none overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
            <ClipboardCheck className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-extrabold text-base text-slate-800">Nhận Xét Học Sinh & Xuất Bảng SMAS</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                Bộ Sách Kết Nối Tri Thức Với Cuộc Sống
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
                Thông tư 27/2020/TT-BGDĐT
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Môn Mĩ thuật Tiểu học (Lớp 1 - 5) • Bộ sách Kết nối tri thức với cuộc sống • Chuẩn Thông tư 27 & Xuất Excel SMAS Viettel
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Lớp và Học Kỳ: CHỈ HIỆN KHI ĐÃ TẢI DANH SÁCH HOẶC ĐÃ CHỌN LỚP DẠY */}
          {hasUploadedOrSelected && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 animate-in fade-in">
              <input
                type="text"
                list="student-class-options"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-24 text-xs font-bold text-slate-800 bg-transparent border-0 focus:outline-none"
                placeholder="Lớp dạy..."
                title="Có thể nhập lớp bất kỳ; danh sách lớp đã đọc từ tệp sẽ được gợi ý"
              />
              <datalist id="student-class-options">
                {classOptions.map(option => <option key={option} value={option} />)}
              </datalist>
              <span className="text-slate-300">|</span>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-0 focus:outline-none cursor-pointer"
              >
                <option value="Học kì I">Học kì I</option>
                <option value="Giữa kì I">Giữa kì I</option>
                <option value="Học kì II">Học kì II</option>
                <option value="Cuối năm">Cả năm</option>
              </select>
            </div>
          )}

          {/* Hidden File Input for Excel/CSV/TXT upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv, .txt, .tsv"
            onChange={handleUploadExcel}
            className="hidden"
          />

          {/* Upload Student List Button */}
          <button
            onClick={handleTriggerUpload}
            className="px-3 py-1.5 text-xs font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="Tải tệp danh sách học sinh từ SMAS hoặc sổ điểm của Thầy/Cô (hỗ trợ .xlsx, .xls, .csv, .txt)"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Tải Danh Sách (.xlsx, .csv, .txt)</span>
          </button>

          {/* Quick Paste Button */}
          <button
            onClick={() => setShowPasteModal(true)}
            className="px-2.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            title="Dán nhanh danh sách học sinh từ Zalo, Word hoặc bảng tính"
          >
            <span>📋</span>
            <span>Dán Danh Sách</span>
          </button>

          {/* Add Student Button (Chỉ hiện khi đã kích hoạt lớp) */}
          {hasUploadedOrSelected && (
            <button
              onClick={handleAddStudent}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
              title="Thêm học sinh thủ công vào danh sách"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Em</span>
            </button>
          )}

          {/* Nút Tổng Hợp Định Kỳ Giữa Kỳ & Cuối Kỳ */}
          {students.length > 0 && (
            <button
              onClick={() => setShowSynthesisModal(true)}
              className="px-3 py-1.5 text-xs font-black text-amber-900 bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-200 hover:from-amber-300 hover:to-yellow-300 border border-amber-400 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer transform active:scale-95"
              title="Tổng hợp tự động mức xếp loại T/H/C và nhận xét giữa kì / cuối kì theo Thông tư 27"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-800" />
              <span>⚡ Tổng Hợp Định Kỳ</span>
            </button>
          )}

          {/* Nút Cam Chấm Tranh liên kết */}
          {onNavigateToCamera && (
            <button
              onClick={onNavigateToCamera}
              className="px-2.5 py-1.5 text-xs font-black text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title="Chuyển sang Cam Chấm Tranh để chấm bài vẽ bằng webcam và lưu điểm vào sổ"
            >
              <Camera className="w-3.5 h-3.5 text-rose-600" />
              <span>Cam Chấm Tranh</span>
            </button>
          )}

          {/* Export Excel Dropdown Menu */}
          {students.length > 0 && (
            <div className="relative flex items-center gap-1 animate-in fade-in">
              <button
                onClick={() => handleExportExcel(false, 'standard')}
                className="px-3 py-1.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                title="Xuất bảng nhận xét của lớp đang chọn ra tệp Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{exportNotice || `Xuất ${selectedClassFilter === 'all' ? 'Excel SMAS' : selectedClassFilter}`}</span>
              </button>

              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="p-1.5 text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all cursor-pointer"
                title="Tùy chọn xuất file Excel khác (Giữa kỳ, Cuối kỳ, Toàn diện, Tất cả các lớp)"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              {showExportDropdown && (
                <div 
                  className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in"
                  onClick={() => setShowExportDropdown(false)}
                >
                  <button
                    onClick={() => handleExportExcel(false, 'weekly')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 font-black text-amber-700 cursor-pointer"
                  >
                    <span>📅</span>
                    <span>Xuất Sổ Thường Xuyên (35 Tuần .xlsx)</span>
                  </button>
                  <button
                    onClick={() => handleExportExcel(false, 'standard')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 font-bold text-slate-700 cursor-pointer"
                  >
                    <span>📊</span>
                    <span>Xuất Bảng Chuẩn SMAS Hiện Tại</span>
                  </button>
                  <button
                    onClick={() => handleExportExcel(false, 'gk')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 font-bold text-blue-700 cursor-pointer"
                  >
                    <span>📘</span>
                    <span>Xuất Bảng Tổng Hợp Giữa Kỳ (GK)</span>
                  </button>
                  <button
                    onClick={() => handleExportExcel(false, 'ck')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 font-bold text-purple-700 cursor-pointer"
                  >
                    <span>🏆</span>
                    <span>Xuất Bảng Tổng Hợp Cuối Kỳ (CK)</span>
                  </button>
                  <button
                    onClick={() => handleExportExcel(false, 'comprehensive')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 font-bold text-emerald-700 cursor-pointer"
                  >
                    <span>📑</span>
                    <span>Xuất Bảng Toàn Diện (GK & CK)</span>
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => handleExportExcel(true, 'standard')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 font-black text-indigo-700 cursor-pointer"
                  >
                    <span>📂</span>
                    <span>Xuất Tất Cả Các Lớp (Multi-sheet)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Dán Danh Sách Nhanh */}
      {showPasteModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowPasteModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <span>📋</span> Dán Danh Sách Học Sinh (Copy - Paste)
              </h3>
              <button 
                onClick={() => setShowPasteModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Thầy/Cô hãy sao chép danh sách học sinh từ Zalo, Word, hoặc Excel rồi dán vào ô bên dưới. Mỗi em trên một dòng.
            </p>
            <textarea
              rows={8}
              value={pasteInputText}
              onChange={(e) => setPasteInputText(e.target.value)}
              placeholder="Ví dụ:&#10;1. Nguyễn Văn An&#10;2. Trần Thị Bình&#10;3. Lê Hoàng Cường&#10;4. Phạm Minh Đức..."
              className="w-full p-3 text-xs text-slate-700 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleApplyPastedStudents}
                className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
              >
                Nạp Vào Sổ Điểm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legal Reference & Disclosure Bar */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Căn cứ pháp lý chính thức:</strong> Thông tư số 27/2020/TT-BGDĐT ngày 04/9/2020 của Bộ GD&ĐT quy định đánh giá học sinh tiểu học (Mức T: Hoàn thành tốt, H: Hoàn thành, C: Chưa hoàn thành).
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] text-amber-800 font-semibold">
            Nguồn: Cổng TTĐT Bộ GD&ĐT (moet.gov.vn)
          </span>
          <span className="text-[11px] font-bold bg-white text-amber-900 px-2 py-0.5 rounded border border-amber-300">
            Dữ liệu lưu an toàn trên máy
          </span>
        </div>
      </div>

      {/* Thanh Chọn Lớp & Công Cụ Đổi Nhận Xét Hàng Loạt */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        {hasUploadedOrSelected ? (
          <>
            {/* Bộ nút chọn từng lớp */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">
                Lớp:
              </span>
              <button
                onClick={() => setSelectedClassFilter('all')}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  selectedClassFilter === 'all'
                    ? 'bg-purple-600 text-white border-purple-700 shadow-xs font-black'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Tất Cả ({students.length})
              </button>
              {allClasses.map((cls) => {
                const count = students.filter(s => (s.className || className || '').trim() === cls.trim()).length;
                return (
                  <button
                    key={cls}
                    onClick={() => {
                      setSelectedClassFilter(cls);
                      setClassName(cls);
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedClassFilter === cls
                        ? 'bg-purple-600 text-white border-purple-700 shadow-xs font-black'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cls}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      selectedClassFilter === cls ? 'bg-purple-800 text-purple-200' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}

              <button
                onClick={handleAddNewClass}
                className="px-2 py-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg flex items-center gap-1 cursor-pointer"
                title="Thêm một lớp học mới vào danh sách"
              >
                <Plus className="w-3 h-3" />
                <span>Thêm Lớp</span>
              </button>
              <button
                onClick={handleOpenClassManager}
                className="px-2 py-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg flex items-center gap-1 cursor-pointer ml-1"
                title="Chỉnh sửa hoặc xóa lớp dạy"
              >
                <Edit3 className="w-3 h-3 text-purple-600" />
                <span>Sửa Lớp</span>
              </button>
            </div>

            {/* Công cụ thao tác nhanh cho lớp đang chọn */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShuffleComments}
                className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                title="Tự động đổi nhận xét phong phú tránh trùng lặp giữa các học sinh"
              >
                <span>🎲</span>
                <span>Đổi Nhận Xét Tránh Trùng</span>
              </button>
              <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                <span className="text-[10px] font-bold text-slate-400">Gán nhanh:</span>
                <button
                  onClick={() => handleBatchSetLevel('T')}
                  className="px-2 py-0.5 text-[11px] font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded cursor-pointer"
                  title="Gán tất cả học sinh đang hiển thị đạt mức T"
                >
                  Mức T
                </button>
                <button
                  onClick={() => handleBatchSetLevel('H')}
                  className="px-2 py-0.5 text-[11px] font-black text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded cursor-pointer"
                  title="Gán tất cả học sinh đang hiển thị đạt mức H"
                >
                  Mức H
                </button>
                <button
                  onClick={() => handleBatchSetLevel('C')}
                  className="px-2 py-0.5 text-[11px] font-black text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded cursor-pointer"
                  title="Gán tất cả học sinh đang hiển thị đạt mức C"
                >
                  Mức C
                </button>
              </div>

              {/* Nút Làm Mới / Nạp lại danh sách khác */}
              <button
                onClick={handleResetData}
                className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-all ml-1 cursor-pointer flex items-center gap-1"
                title="Làm mới sổ nhận xét để nạp danh sách lớp khác"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Nạp Lớp Khác</span>
              </button>
            </div>
          </>
        ) : (
          /* Khi CHƯA tải tệp hoặc CHƯA chọn lớp: Hiện danh sách chọn nhanh lớp dạy thực tế */
          <div className="flex items-center justify-between w-full flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <span>🏫</span> Chọn Lớp Dạy:
              </span>
              {teachingClasses.map((cls) => (
                <button
                  key={cls}
                  onClick={() => handleSelectTeachingClass(cls.startsWith('Lớp') ? cls : `Lớp ${cls}`)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                >
                  {cls.startsWith('Lớp') ? cls : `Lớp ${cls}`}
                </button>
              ))}
              <button
                onClick={handleAddNewClass}
                className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg flex items-center gap-1 cursor-pointer"
                title="Nhập tên lớp khác nếu ngoài danh sách trên"
              >
                <Plus className="w-3.5 h-3.5 text-purple-600" />
                <span>Thêm Lớp Khác</span>
              </button>
              <button
                onClick={handleOpenClassManager}
                className="px-2.5 py-1 text-xs font-bold text-purple-800 bg-purple-100 hover:bg-purple-200 border border-purple-300 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Chỉnh sửa tên lớp, xóa bớt lớp không dạy hoặc thêm lớp mới"
              >
                <Edit3 className="w-3.5 h-3.5 text-purple-700" />
                <span>Sửa Danh Sách Lớp</span>
              </button>
            </div>
            <div className="text-xs text-slate-400 italic">
              Bấm chọn lớp dạy hoặc tải tệp danh sách để bắt đầu nhận xét
            </div>
          </div>
        )}
      </div>

      {/* Main Student List Table OR Empty Setup Screen */}
      {!hasUploadedOrSelected || students.length === 0 ? (
        <div className="flex-1 p-6 flex items-center justify-center overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-xl w-full p-8 text-center flex flex-col items-center animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 shadow-xs">
              <ClipboardCheck className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800 mb-1.5">
              {hasUploadedOrSelected ? `Lớp ${className || 'Đang Chọn'} Chưa Có Học Sinh` : 'Sổ Đánh Giá Học Sinh Mĩ Thuật Chuẩn TT27'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6 max-w-md">
              {hasUploadedOrSelected
                ? `Thầy/Cô có thể bấm "Thêm Học Sinh Mới" để nhập học sinh cho lớp này, hoặc tải tệp Excel danh sách học sinh từ máy tính.`
                : `Ứng dụng sẵn sàng ghi nhận số liệu thực tế. Thầy/Cô hãy tải danh sách học sinh (.xlsx, .csv, .txt) hoặc chọn một lớp dạy ở trên để bắt đầu.`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <button
                onClick={handleTriggerUpload}
                className="p-3 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Tải Tệp Excel / SMAS</span>
              </button>
              <button
                onClick={() => setShowPasteModal(true)}
                className="p-3 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>📋</span>
                <span>Dán Nhanh Danh Sách</span>
              </button>
              {hasUploadedOrSelected ? (
                <button
                  onClick={handleAddStudent}
                  className="p-3 text-xs font-bold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Học Sinh Mới</span>
                </button>
              ) : (
                <button
                  onClick={() => handleSelectTeachingClass('Lớp 1A')}
                  className="p-3 text-xs font-bold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>🏫</span>
                  <span>Bắt Đầu Với Lớp 1A</span>
                </button>
              )}
              <button
                onClick={handleLoadSampleData}
                className="p-3 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>🧪</span>
                <span>Thử Nghiệm Mẫu (6 Em)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Render Bảng danh sách học sinh đầy đủ */
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {/* Thanh Điều Khiển Chế Độ Sổ Điểm & KPI Thống Kê */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              {/* Bộ Chuyển Chế Độ Xem (Sổ Thường Xuyên 35 Tuần | Sổ Tổng Hợp Định Kỳ & Nhận Xét | Xem Tất Cả) */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('weekly')}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'weekly'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                  title="Sổ theo dõi thường xuyên 35 tuần học (chỉ ghi nhận mức T/H/C, không cần nhận xét)"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>📅 Sổ Thường Xuyên (Tuần 1 - 35)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('periodic')}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'periodic'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                  title="Sổ tổng hợp định kỳ Giữa kỳ, Cuối kỳ, Cả năm và Lời nhận xét chuẩn Thông tư 27 & SMAS"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>🏆 Sổ Tổng Hợp Định Kỳ & Nhận Xét (TT27)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('all')}
                  className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    viewMode === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                  title="Xem đồng thời cả 35 tuần thường xuyên và cột nhận xét tổng hợp định kỳ trên cùng một bảng"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>👁️ Xem Toàn Diện</span>
                </button>
              </div>

              {/* Các nút chức năng ngữ cảnh tùy theo viewMode */}
              <div className="flex items-center gap-2 flex-wrap">
                {(viewMode === 'periodic' || viewMode === 'all') && (
                  <>
                    <div className="flex items-center gap-1 bg-purple-50 border border-purple-200 p-1 rounded-xl">
                      <span className="text-[11px] font-black text-purple-900 uppercase px-2">Kỳ:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPeriodicPeriod('GK');
                          setActivePeriodTab('GK');
                        }}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          periodicPeriod === 'GK' ? 'bg-blue-600 text-white font-black shadow-xs' : 'text-purple-800 hover:bg-purple-100'
                        }`}
                      >
                        Giữa Kì I (GK1)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPeriodicPeriod('CK');
                          setActivePeriodTab('CK');
                        }}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          periodicPeriod === 'CK' ? 'bg-indigo-600 text-white font-black shadow-xs' : 'text-purple-800 hover:bg-purple-100'
                        }`}
                      >
                        Cuối Kì I (CK1)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPeriodicPeriod('CN');
                          setActivePeriodTab('CN');
                        }}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          periodicPeriod === 'CN' ? 'bg-purple-700 text-white font-black shadow-xs' : 'text-purple-800 hover:bg-purple-100'
                        }`}
                      >
                        Cả Năm (CN)
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSynthesisTargetPeriod(periodicPeriod);
                        setShowSynthesisModal(true);
                      }}
                      className="px-3 py-1.5 text-xs font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
                      title="Tự động tổng hợp điểm mức T/H/C và sinh lời nhận xét từ 35 tuần học thường xuyên"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>⚡ Tổng Hợp Từ 35 Tuần</span>
                    </button>
                  </>
                )}

                {(viewMode === 'weekly' || viewMode === 'all') && onNavigateToCamera && (
                  <button
                    type="button"
                    onClick={onNavigateToCamera}
                    className="px-3 py-1.5 text-xs font-black text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5 text-rose-600" />
                    <span>Mở Cam Chấm Bài</span>
                  </button>
                )}
              </div>
            </div>

            {/* Chú thích nhanh quy chuẩn */}
            {viewMode === 'weekly' && (
              <div className="text-[11px] text-amber-900 bg-amber-50/80 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center justify-between">
                <span>💡 <strong>Quy chuẩn sư phạm:</strong> Sổ theo dõi thường xuyên 35 tuần chỉ ghi nhận mức <strong>T</strong> (Tốt) / <strong>H</strong> (Hoàn thành) / <strong>C</strong> (Cần cố gắng), không cần viết nhận xét theo tuần. Bấm vào từng ô để đổi nhanh <strong>T ➜ H ➜ C ➜ —</strong>.</span>
                <span className="font-bold text-amber-800 shrink-0 ml-2">Tuần 1 ➔ Tuần 35</span>
              </div>
            )}

            {/* Dải Thống Kê KPI Tỷ Lệ Đạt (T, H, C) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sĩ số lớp</span>
                <span className="text-base font-black text-slate-800">{displayedStudents.length} học sinh</span>
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Mức Tốt (T) {currentKpi.mode === 'weekly' ? '(35 tuần)' : `(${periodicPeriod})`}
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-black text-emerald-900">
                    {currentKpi.t} {currentKpi.labelSuffix}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700">
                    {currentKpi.tPercent}%
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex flex-col">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                  Mức Hoàn Thành (H) {currentKpi.mode === 'weekly' ? '(35 tuần)' : `(${periodicPeriod})`}
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-black text-blue-900">
                    {currentKpi.h} {currentKpi.labelSuffix}
                  </span>
                  <span className="text-[11px] font-bold text-blue-700">
                    {currentKpi.hPercent}%
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex flex-col">
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                  Cần Cố Gắng (C) {currentKpi.mode === 'weekly' ? '(35 tuần)' : `(${periodicPeriod})`}
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-black text-rose-900">
                    {currentKpi.c} {currentKpi.labelSuffix}
                  </span>
                  <span className="text-[11px] font-bold text-rose-700">
                    {currentKpi.cPercent}%
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl flex flex-col">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Đã Chấm Cam</span>
                <span className="text-base font-black text-purple-900">
                  {displayedStudents.filter(s => s.camHistory && s.camHistory.length > 0).length} bài vẽ
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-2 w-10 text-center sticky left-0 bg-slate-50 z-10">STT</th>
                    <th className="py-2.5 px-2 w-24">Mã HS</th>
                    <th className="py-2.5 px-3 min-w-36 sticky left-10 bg-slate-50 z-10">Họ và Tên</th>
                    <th className="py-2.5 px-2 w-16 text-center">Lớp</th>
                    <th className="py-2.5 px-2 w-20 text-center">Cam Chấm</th>

                    {/* 35 Cột Tuần (T1 -> T35) - Không có nhận xét tuần */}
                    {(viewMode === 'weekly' || viewMode === 'all') && (
                      <>
                        {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                          <th
                            key={w}
                            className={`py-2 px-1 text-center w-8 min-w-8 text-[11px] border-l border-slate-200 ${
                              w % 2 === 0 ? 'bg-amber-50/50 text-amber-900' : 'bg-slate-50 text-slate-700'
                            }`}
                            title={`Tuần ${w}`}
                          >
                            T{w}
                          </th>
                        ))}
                      </>
                    )}

                    {/* Sổ Tổng Hợp Định Kỳ & Lời Nhận Xét (Chuẩn TT27 & SMAS) */}
                    {(viewMode === 'periodic' || viewMode === 'all') && (
                      <>
                        <th className="py-2.5 px-2 w-28 text-center bg-purple-50/50 text-purple-900 border-l border-slate-200">
                          Tiến Độ 35 Tuần
                        </th>
                        <th className="py-2.5 px-2 w-32 text-center bg-purple-50/70 text-purple-900 border-l border-slate-200">
                          Mức {periodicPeriod === 'GK' ? 'Giữa Kì (GK1)' : periodicPeriod === 'CK' ? 'Cuối Kì (CK1)' : 'Cả Năm (CN)'}
                        </th>
                        <th className="py-2.5 px-4 min-w-96 border-l border-slate-200">
                          Lời Nhận Xét Tổng Hợp Định Kỳ (Chuẩn TT27 & SMAS)
                        </th>
                      </>
                    )}

                    <th className="py-2.5 px-2 w-20 text-center border-l border-slate-200">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {displayedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={viewMode === 'weekly' ? 41 : viewMode === 'periodic' ? 9 : 44} className="py-12 text-center text-slate-500">
                        <p className="font-bold text-sm text-slate-700">Lớp {selectedClassFilter} chưa có học sinh nào</p>
                        <p className="text-xs text-slate-400 mt-1">Bấm nút "Thêm Em" ở phía trên để thêm học sinh hoặc "Tải Danh Sách" để nạp từ tệp Excel</p>
                        <button
                          onClick={handleAddStudent}
                          className="mt-3 px-3.5 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Thêm Học Sinh Đầu Tiên</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    displayedStudents.map((st, idx) => {
                      const currentPeriodLevel = periodicPeriod === 'GK'
                        ? (st.gkLevel || st.level || 'H')
                        : periodicPeriod === 'CK'
                        ? (st.ckLevel || st.level || 'H')
                        : (st.cnLevel || st.ckLevel || st.level || 'H');

                      const currentPeriodComment = periodicPeriod === 'GK'
                        ? (st.gkComment || st.comment || '')
                        : periodicPeriod === 'CK'
                        ? (st.ckComment || st.comment || '')
                        : (st.cnComment || st.ckComment || st.comment || '');

                      const hasCamHistory = Array.isArray(st.camHistory) && st.camHistory.length > 0;
                      const weekly = st.weeklyLevels || {};

                      // Thống kê nhanh tiến độ các tuần
                      let tCount = 0, hCount = 0, cCount = 0;
                      for (let w = 1; w <= 35; w++) {
                        const lvl = weekly[w] || weekly[String(w)];
                        if (lvl === 'T') tCount++;
                        else if (lvl === 'H') hCount++;
                        else if (lvl === 'C') cCount++;
                      }
                      const totalWeekly = tCount + hCount + cCount;

                      return (
                        <tr key={st.id || idx} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
                          <td className="py-2 px-2 text-center font-bold text-slate-400 sticky left-0 bg-white">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-2 font-mono font-bold text-slate-600 text-[11px]">
                            {st.id}
                          </td>
                          <td className="py-2 px-2 sticky left-10 bg-white">
                            <input
                              type="text"
                              value={st.name}
                              onChange={(e) => handleUpdateStudent(st.id, 'name', e.target.value)}
                              className="w-full px-1.5 py-0.5 font-bold text-slate-800 bg-transparent hover:bg-white hover:border hover:border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-xs"
                            />
                          </td>
                          <td className="py-2 px-1 text-center">
                            <input
                              type="text"
                              value={st.className || className}
                              onChange={(e) => handleUpdateStudent(st.id, 'className', e.target.value)}
                              className="w-14 text-center px-1 py-0.5 text-xs text-slate-700 bg-transparent hover:bg-white hover:border hover:border-slate-200 rounded focus:bg-white focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-1 text-center">
                            {hasCamHistory ? (
                              <button
                                type="button"
                                onClick={() => setSelectedStudentForCamModal(st)}
                                className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                title="Bấm để xem lại ảnh và điểm các bài vẽ đã chấm qua camera"
                              >
                                <Camera className="w-3 h-3 text-rose-600" />
                                <span>{st.camHistory.length}</span>
                              </button>
                            ) : onNavigateToCamera ? (
                              <button
                                type="button"
                                onClick={onNavigateToCamera}
                                className="text-[10px] font-bold text-slate-300 hover:text-rose-600 cursor-pointer"
                                title="Chấm bài vẽ cho em này bằng Camera"
                              >
                                <Camera className="w-3 h-3 inline" />
                              </button>
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </td>

                          {/* 35 Cột Tuần (T1 -> T35) */}
                          {(viewMode === 'weekly' || viewMode === 'all') && (
                            <>
                              {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => {
                                const lvl = weekly[w] || weekly[String(w)] || '';
                                return (
                                  <td
                                    key={w}
                                    className="py-1 px-0.5 text-center border-l border-slate-100 w-8 min-w-8"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => handleToggleWeeklyLevel(st.id, w)}
                                      className={`w-7 h-7 rounded-md font-black text-xs transition-all cursor-pointer flex items-center justify-center mx-auto active:scale-90 ${
                                        lvl === 'T'
                                          ? 'bg-emerald-600 text-white shadow-xs font-black'
                                          : lvl === 'H'
                                          ? 'bg-blue-600 text-white shadow-xs font-black'
                                          : lvl === 'C'
                                          ? 'bg-rose-600 text-white shadow-xs font-black'
                                          : 'text-slate-300 hover:text-slate-700 hover:bg-slate-100 hover:border-slate-300 border border-dashed border-slate-200 text-[11px]'
                                      }`}
                                      title={`Tuần ${w}: ${lvl ? `Mức ${lvl}` : 'Chưa nhập'}. Bấm để đổi (T ➔ H ➔ C ➔ —)`}
                                    >
                                      {lvl || '—'}
                                    </button>
                                  </td>
                                );
                              })}
                            </>
                          )}

                          {/* Cột Sổ Tổng Hợp Định Kỳ & Nhận Xét */}
                          {(viewMode === 'periodic' || viewMode === 'all') && (
                            <>
                              {/* Tiến độ 35 tuần */}
                              <td className="py-2 px-2 text-center border-l border-slate-100 bg-purple-50/20">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 whitespace-nowrap">
                                  {totalWeekly > 0 ? `${tCount}T • ${hCount}H${cCount > 0 ? ` • ${cCount}C` : ''}` : 'Chưa có điểm'}
                                </span>
                              </td>

                              {/* Mức Định Kỳ (GK, CK, CN) */}
                              <td className="py-2 px-2 border-l border-slate-100 bg-purple-50/20">
                                <div className="flex items-center justify-center gap-1">
                                  {[
                                    { key: 'T', activeCls: 'bg-emerald-600 text-white border-emerald-700 shadow-sm' },
                                    { key: 'H', activeCls: 'bg-blue-600 text-white border-blue-700 shadow-sm' },
                                    { key: 'C', activeCls: 'bg-rose-600 text-white border-rose-700 shadow-sm' },
                                  ].map(lvl => (
                                    <button
                                      key={lvl.key}
                                      type="button"
                                      onClick={() => handlePeriodicLevelChange(st.id, periodicPeriod, lvl.key)}
                                      className={`px-1.5 py-0.5 text-[11px] font-black rounded border transition-all cursor-pointer ${
                                        currentPeriodLevel === lvl.key
                                          ? `${lvl.activeCls} scale-105`
                                          : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-100'
                                      }`}
                                      title={`Mức ${lvl.key}`}
                                    >
                                      {lvl.key}
                                    </button>
                                  ))}
                                </div>
                              </td>

                              {/* Lời Nhận Xét Tổng Hợp Định Kỳ Chuẩn TT27 & SMAS */}
                              <td className="py-2 px-3 border-l border-slate-100">
                                <textarea
                                  value={currentPeriodComment}
                                  onChange={(e) => handlePeriodicCommentChange(st.id, periodicPeriod, e.target.value)}
                                  rows={2}
                                  placeholder="Lời nhận xét định kỳ chuẩn TT27 (bấm '⚡ Tổng Hợp Từ 35 Tuần' để tự động điền)..."
                                  className="w-full p-2 text-xs text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 resize-y font-sans leading-relaxed"
                                />
                              </td>
                            </>
                          )}

                          {/* Thao tác */}
                          <td className="py-2 px-2 text-center border-l border-slate-100">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleCopySingle(idx, currentPeriodComment || `${st.name}: ${st.level || 'H'}`)}
                                className="p-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 rounded-lg transition-all cursor-pointer"
                                title="Sao chép thông tin/lời nhận xét"
                              >
                                {copiedIndex === idx ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStudent(st.id)}
                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                                title="Xóa học sinh này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL QUẢN LÝ & CHỈNH SỬA DANH SÁCH LỚP DẠY */}
      {showClassManagerModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowClassManagerModal(false)}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🏫</span>
                <div>
                  <h3 className="font-extrabold text-sm">Chỉnh Sửa Danh Sách Lớp Dạy</h3>
                  <p className="text-[11px] text-purple-100">Đổi tên lớp, xóa bớt lớp không dạy hoặc thêm lớp theo phân công</p>
                </div>
              </div>
              <button 
                onClick={() => setShowClassManagerModal(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Thêm nhanh lớp mới */}
              <form onSubmit={handleAddClassInManager} className="flex gap-2">
                <input
                  type="text"
                  value={newClassInput}
                  onChange={(e) => setNewClassInput(e.target.value)}
                  placeholder="Nhập tên lớp mới (vd: 1A1, 2C, 3D, 5E...)"
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                />
                <button
                  type="submit"
                  disabled={!newClassInput.trim()}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl flex items-center gap-1 cursor-pointer transition-all shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm</span>
                </button>
              </form>

              {/* Danh sách lớp hiện tại với ô nhập sửa trực tiếp & nút xóa */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  Danh Sách Lớp Dạy Hiện Tại ({editingClassList.length} lớp):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                  {editingClassList.map((item, idx) => (
                    <div 
                      key={item.id}
                      className="flex items-center gap-1.5 p-1.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl transition-all shadow-2xs"
                    >
                      <span className="text-[10px] font-bold text-slate-400 w-5 text-center">{idx + 1}</span>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingClassList(prev => prev.map(c => c.id === item.id ? { ...c, name: val } : c));
                        }}
                        className="flex-1 px-2 py-1 text-xs font-bold text-purple-950 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400"
                        title="Bấm vào để đổi tên lớp theo ý muốn"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEditingClassList(prev => prev.filter(c => c.id !== item.id));
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa lớp này khỏi danh sách dạy"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleResetDefaultClasses}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl cursor-pointer"
              >
                ↺ Mặc định (1A - 5B)
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowClassManagerModal(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveClassManager}
                  className="px-4 py-1.5 text-xs font-black text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  ✓ Lưu Thay Đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TỔNG HỢP ĐIỂM & NHẬN XÉT ĐỊNH KỲ (GIỮA KỲ & CUỐI KỲ) */}
      {showSynthesisModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowSynthesisModal(false)}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-gradient-to-r from-amber-600 to-yellow-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 bg-white/20 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </span>
                <div>
                  <h3 className="font-extrabold text-sm md:text-base">Tổng Hợp Đánh Giá Định Kỳ (TT27)</h3>
                  <p className="text-[11px] text-amber-100">Tự động tổng hợp điểm mức T, H, C & sinh lời nhận xét giữa kì / cuối kì</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSynthesisModal(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Info className="w-4 h-4 text-amber-700" />
                  <span>Nguyên tắc tổng hợp Thông tư 27/2020/TT-BGDĐT:</span>
                </div>
                <p className="leading-relaxed">
                  Hệ thống căn cứ vào các lần chấm qua Cam, điểm thường xuyên (TX) và năng lực tạo hình thực tế của từng em để tự động tính mức đánh giá chung (T, H, C) và đưa ra lời nhận xét sư phạm toàn diện, không trùng lặp.
                </p>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1.5">
                  Chọn Kỳ Cần Tổng Hợp:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSynthesisTargetPeriod('GK')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      synthesisTargetPeriod === 'GK'
                        ? 'bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-400/30 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-black text-sm flex items-center gap-1.5">
                      <span>📘</span>
                      <span>Giữa Học Kì (GK)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Đánh giá tiến độ hình thành kĩ năng, màu sắc và thái độ học tập nửa đầu kỳ.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSynthesisTargetPeriod('CK')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      synthesisTargetPeriod === 'CK'
                        ? 'bg-purple-50 border-purple-400 text-purple-900 ring-2 ring-purple-400/30 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-black text-sm flex items-center gap-1.5">
                      <span>🏆</span>
                      <span>Cuối Học Kì (CK)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Tổng hợp toàn diện năng lực thẩm mĩ, sản phẩm thực tế và sự sáng tạo cả học kì.
                    </p>
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <span>Phạm vi áp dụng:</span>
                <span className="font-extrabold text-purple-700">
                  {selectedClassFilter === 'all' ? 'Tất Cả Các Lớp' : `Lớp ${selectedClassFilter}`} ({displayedStudents.length} học sinh)
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSynthesisModal(false)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => handleSynthesizePeriodic(synthesisTargetPeriod)}
                className="px-5 py-2 text-xs font-black text-white bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 rounded-xl shadow-md transition-all cursor-pointer transform active:scale-95 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Thực Hiện Tổng Hợp Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM LỊCH SỬ BÀI VẼ ĐÃ CHẤM QUA CAMERA CỦA HỌC SINH */}
      {selectedStudentForCamModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedStudentForCamModal(null)}
        >
          <div 
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-gradient-to-r from-rose-600 to-amber-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 bg-white/20 rounded-lg">
                  <Camera className="w-5 h-5 text-white" />
                </span>
                <div>
                  <h3 className="font-extrabold text-sm md:text-base">
                    Lịch Sử Chấm Tranh: {selectedStudentForCamModal.name}
                  </h3>
                  <p className="text-[11px] text-rose-100">
                    Lớp {selectedStudentForCamModal.className} • {selectedStudentForCamModal.camHistory?.length || 0} bài vẽ đã chấm bằng Camera
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudentForCamModal(null)}
                className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {!selectedStudentForCamModal.camHistory || selectedStudentForCamModal.camHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  Chưa có bài vẽ nào được chấm bằng Camera cho học sinh này.
                </div>
              ) : (
                selectedStudentForCamModal.camHistory.map((item, idx) => {
                  const r = item.rubricLevels || {};
                  const total = (r.requirement || 0) + (r.technique || 0) + (r.creativity || 0) + (r.presentation || 0);

                  return (
                    <div 
                      key={item.id || idx}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row gap-4 items-start shadow-2xs"
                    >
                      {item.artworkThumb ? (
                        <div className="w-full sm:w-36 h-28 bg-black/10 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                          <img
                            src={item.artworkThumb}
                            alt="Bài vẽ"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full sm:w-36 h-28 bg-slate-200 rounded-xl flex items-center justify-center shrink-0 text-slate-400">
                          <ImageIcon className="w-8 h-8 opacity-40" />
                        </div>
                      )}

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                              item.level === 'T'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : item.level === 'H'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              Mức {item.level} ({item.level === 'T' ? 'Tốt' : item.level === 'H' ? 'Đạt' : 'Cố gắng'})
                            </span>
                            <span className="text-[11px] font-bold text-slate-500">
                              {item.dateStr || 'Gần đây'}
                            </span>
                          </div>

                          <span className="text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                            Điểm Rubric: <strong>{total}/12</strong>
                          </span>
                        </div>

                        {/* Chi tiết 4 tiêu chí */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] text-slate-600">
                          <div className="p-1 bg-white rounded border border-slate-200">
                            Yêu cầu: <strong>{r.requirement || '—'}/3</strong>
                          </div>
                          <div className="p-1 bg-white rounded border border-slate-200">
                            Kỹ thuật: <strong>{r.technique || '—'}/3</strong>
                          </div>
                          <div className="p-1 bg-white rounded border border-slate-200">
                            Sáng tạo: <strong>{r.creativity || '—'}/3</strong>
                          </div>
                          <div className="p-1 bg-white rounded border border-slate-200">
                            Trình bày: <strong>{r.presentation || '—'}/3</strong>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                          <strong>Nhận xét:</strong> {item.comment}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {onNavigateToCamera ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudentForCamModal(null);
                    onNavigateToCamera();
                  }}
                  className="px-4 py-1.5 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Chấm Thêm Bài Vẽ Bằng Cam</span>
                </button>
              ) : <div></div>}

              <button
                type="button"
                onClick={() => setSelectedStudentForCamModal(null)}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200/60 rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
