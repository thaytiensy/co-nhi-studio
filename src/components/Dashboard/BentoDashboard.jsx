import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  Plus,
  FileText,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Clock,
  BookOpen,
  Users,
  Award,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  Presentation,
  Brush,
  Gamepad2,
  Camera,
  ClipboardCheck,
  Building,
  UserCheck,
  Wifi,
  WifiOff,
  Check,
  X,
  Trash2,
  Tag
} from 'lucide-react';
import {
  getStoredData,
  saveStoredData,
  autoSaveData,
  exportBackupJson,
  importRestoreJson,
  restoreDefaultData,
  computeKPI,
  subscribeToStorage
} from '../../lib/storage';
import { exportWordReport, exportCsvReport } from '../../lib/export-engine';
import { parseSmartCommand, QUICK_ACTION_CHIPS } from '../../lib/smart-command';
import { TT27_COMMENTS_BANK } from '../../utils/smasExcelService';

export default function BentoDashboard({
  onNavigateTab,
  onStartPresentation,
  onOpenInstallModal,
  isAppInstalled,
  installPrompt,
  userSession
}) {
  const [studioState, setStudioState] = useState(() => getStoredData());
  const [commandInput, setCommandInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('all');

  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [toastMessage, setToastMessage] = useState(null);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);

  // Form state cho thêm bài học mới
  const [newPlanForm, setNewPlanForm] = useState({
    title: '',
    grade: 1,
    className: '1A',
    week: 1,
    period: 1,
    objectives: '',
    materials: '',
    status: 'Chưa dạy',
    notes: ''
  });

  const fileRestoreInputRef = useRef(null);

  // Hiển thị thông báo Toast góc màn hình
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(prev => (prev?.message === message ? null : prev));
    }, 3800);
  };

  // Đồng bộ trạng thái mạng trực tuyến / ngoại tuyến
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Đã kết nối Internet thành công!', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Đang hoạt động ở chế độ Ngoại Tuyến (Offline PWA).', 'info');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Hiệu ứng Skeleton loading ban đầu (400ms)
    const timer = setTimeout(() => setIsLoading(false), 400);

    // Lắng nghe thay đổi dữ liệu từ storage
    const unsubscribe = subscribeToStorage((updated) => {
      setStudioState(updated);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // Tính toán KPI
  const kpi = useMemo(() => computeKPI(studioState), [studioState]);

  // Danh sách các lớp học có trong hệ thống
  const availableClasses = useMemo(() => {
    const classes = new Set(['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B']);
    studioState.plans.forEach(p => p.className && classes.add(p.className));
    studioState.evaluations.forEach(e => e.className && classes.add(e.className));
    return Array.from(classes).sort();
  }, [studioState]);

  // Bộ lọc kế hoạch dạy học
  const filteredPlans = useMemo(() => {
    return studioState.plans.filter(plan => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = plan.title.toLowerCase().includes(q);
        const matchObj = plan.objectives.toLowerCase().includes(q);
        const matchMat = plan.materials.toLowerCase().includes(q);
        const matchCls = plan.className.toLowerCase().includes(q);
        if (!matchTitle && !matchObj && !matchMat && !matchCls) return false;
      }
      if (selectedClassFilter !== 'all' && plan.className !== selectedClassFilter) return false;
      if (selectedWeekFilter !== 'all' && plan.week !== Number(selectedWeekFilter)) return false;
      if (selectedStatusFilter !== 'all' && plan.status !== selectedStatusFilter) return false;
      return true;
    });
  }, [studioState.plans, searchQuery, selectedClassFilter, selectedWeekFilter, selectedStatusFilter]);

  // Bộ lọc học sinh
  const filteredEvaluations = useMemo(() => {
    return studioState.evaluations.filter(ev => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = ev.name.toLowerCase().includes(q);
        const matchCode = ev.studentCode.toLowerCase().includes(q);
        const matchComment = ev.comment.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchComment) return false;
      }
      if (selectedClassFilter !== 'all' && ev.className !== selectedClassFilter) return false;
      if (selectedLevelFilter !== 'all' && ev.level !== selectedLevelFilter) return false;
      return true;
    });
  }, [studioState.evaluations, searchQuery, selectedClassFilter, selectedLevelFilter]);

  // Thực thi câu lệnh tự nhiên từ Thanh Lệnh Thông Minh
  const handleExecuteCommand = (commandToRun) => {
    const text = commandToRun || commandInput;
    if (!text.trim()) return;

    const result = parseSmartCommand(text);

    switch (result.type) {
      case 'export_word': {
        const filename = exportWordReport({ filterClass: selectedClassFilter });
        showToast(`Đã xuất văn bản Word: ${filename}`);
        break;
      }
      case 'export_excel': {
        const filename = exportCsvReport({ filterClass: selectedClassFilter });
        showToast(`Đã xuất bảng tính Excel: ${filename}`);
        break;
      }
      case 'backup_json': {
        exportBackupJson(studioState);
        showToast('Đã tải tệp sao lưu .json về máy tính an toàn!');
        break;
      }
      case 'restore_json': {
        if (fileRestoreInputRef.current) {
          fileRestoreInputRef.current.value = '';
          fileRestoreInputRef.current.click();
        }
        break;
      }
      case 'load_sample': {
        const restored = restoreDefaultData();
        setStudioState(restored);
        showToast('Đã khôi phục dữ liệu mẫu Trường PTDTBT TH Lê Quý Đôn thành công!');
        break;
      }
      case 'navigate_tab': {
        if (result.targetTab && onNavigateTab) {
          showToast(result.message, 'info');
          onNavigateTab(result.targetTab);
        }
        break;
      }
      case 'add_plan': {
        setNewPlanForm(prev => ({
          ...prev,
          title: result.payload?.title || prev.title,
          className: result.payload?.className || prev.className
        }));
        setShowAddPlanModal(true);
        showToast('Mời Thầy/Cô hoàn thiện thông tin bài dạy mới.');
        break;
      }
      case 'filter': {
        if (result.filters?.className) setSelectedClassFilter(result.filters.className);
        if (result.filters?.week) setSelectedWeekFilter(String(result.filters.week));
        if (result.filters?.status) setSelectedStatusFilter(result.filters.status);
        if (result.filters?.level) setSelectedLevelFilter(result.filters.level);
        showToast(result.message, 'info');
        break;
      }
      case 'search':
      default: {
        setSearchQuery(result.query || text);
        showToast(result.message, 'info');
        break;
      }
    }
  };

  // Reset toàn bộ bộ lọc
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedClassFilter('all');
    setSelectedWeekFilter('all');
    setSelectedStatusFilter('all');
    setSelectedLevelFilter('all');
    setCommandInput('');
    showToast('Đã xóa tất cả bộ lọc, hiển thị toàn bộ số liệu.', 'info');
  };

  // Xử lý chuyển trạng thái bài học (Đã dạy <-> Chưa dạy)
  const handleTogglePlanStatus = (planId) => {
    const updatedPlans = studioState.plans.map(p => {
      if (p.id !== planId) return p;
      const nextStatus = p.status === 'Đã dạy' ? 'Chưa dạy' : p.status === 'Chưa dạy' ? 'Đang dạy' : 'Đã dạy';
      return { ...p, status: nextStatus };
    });
    const nextState = { ...studioState, plans: updatedPlans };
    setStudioState(nextState);
    saveStoredData(nextState);
    autoSaveData({ plans: updatedPlans });
    showToast('Đã cập nhật trạng thái bài dạy!');
  };

  // Xóa bài học
  const handleDeletePlan = (planId) => {
    if (!window.confirm('Thầy/Cô có chắc chắn muốn xóa bài dạy này khỏi kế hoạch?')) return;
    const updatedPlans = studioState.plans.filter(p => p.id !== planId);
    const nextState = { ...studioState, plans: updatedPlans };
    setStudioState(nextState);
    saveStoredData(nextState);
    autoSaveData({ plans: updatedPlans });
    showToast('Đã xóa bài học khỏi kế hoạch.');
  };

  // Thêm bài học mới từ Modal
  const handleSaveNewPlan = (e) => {
    e.preventDefault();
    if (!newPlanForm.title.trim()) {
      alert('Vui lòng nhập tên bài dạy.');
      return;
    }
    const newPlan = {
      id: 'plan-' + Date.now(),
      week: Number(newPlanForm.week) || 1,
      period: Number(newPlanForm.period) || 1,
      title: newPlanForm.title.trim(),
      grade: Number(newPlanForm.grade) || 1,
      className: newPlanForm.className.trim() || '1A',
      objectives: newPlanForm.objectives.trim() || 'Đạt chuẩn kiến thức kỹ năng mĩ thuật theo bài học.',
      materials: newPlanForm.materials.trim() || 'Sáp màu, giấy vẽ, bảng con.',
      status: newPlanForm.status || 'Chưa dạy',
      notes: newPlanForm.notes.trim()
    };
    const updatedPlans = [newPlan, ...studioState.plans];
    const nextState = { ...studioState, plans: updatedPlans };
    setStudioState(nextState);
    saveStoredData(nextState);
    autoSaveData({ plans: updatedPlans });
    setShowAddPlanModal(false);
    setNewPlanForm({
      title: '',
      grade: 1,
      className: '1A',
      week: 1,
      period: 1,
      objectives: '',
      materials: '',
      status: 'Chưa dạy',
      notes: ''
    });
    showToast(`Đã thêm bài dạy "${newPlan.title}" vào kế hoạch!`);
  };

  // Xử lý đổi mức đánh giá học sinh nhanh ngay trên Bento Grid
  const handleChangeEvaluationLevel = (id, newLevel) => {
    const bank = TT27_COMMENTS_BANK[newLevel] || TT27_COMMENTS_BANK.H;
    const updatedEvaluations = studioState.evaluations.map((ev, idx) => {
      if (ev.id !== id) return ev;
      const comment = bank[idx % bank.length];
      return { ...ev, level: newLevel, comment };
    });
    const nextState = { ...studioState, evaluations: updatedEvaluations };
    setStudioState(nextState);
    saveStoredData(nextState);
    autoSaveData({ evaluations: updatedEvaluations });
    showToast(`Đã cập nhật mức ${newLevel} và nhận xét chuẩn TT27!`);
  };

  // Khôi phục từ file .json
  const handleFileRestore = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const restored = await importRestoreJson(file);
      setStudioState(restored);
      showToast(`Đã khôi phục thành công từ file: ${file.name}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const hasActiveFilter = searchQuery || selectedClassFilter !== 'all' || selectedWeekFilter !== 'all' || selectedStatusFilter !== 'all' || selectedLevelFilter !== 'all';

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-y-auto select-none pb-24 md:pb-10 font-sans relative">
      {/* Input File ẩn cho Khôi phục sao lưu */}
      <input
        type="file"
        ref={fileRestoreInputRef}
        accept=".json"
        className="hidden"
        onChange={handleFileRestore}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300 pointer-events-none">
          <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-3 max-w-md">
            <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <span className="text-xs font-semibold leading-relaxed">{toastMessage.message}</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 1: HEADER & REAL-TIME KPI CARDS */}
      {/* ========================================================= */}
      <div className="px-4 md:px-8 pt-6 pb-4">
        {/* Tiêu đề & Thông tin đơn vị */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-200/50 text-white font-black text-2xl shrink-0">
              🎨
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-black text-xl md:text-2xl text-slate-800 tracking-tight">
                  Cọ Nhí Studio • Hub Tổng Quan Sư Phạm
                </h1>
                <span className="text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                  SIÊU VIP PRO
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  isOnline 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}>
                  {isOnline ? <Wifi className="w-3 h-3 text-emerald-600" /> : <WifiOff className="w-3 h-3 text-rose-600" />}
                  {isOnline ? 'Trực tuyến' : 'Ngoại tuyến (Offline)'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{studioState.settings.agencyName}</span>
                <span>•</span>
                <span className="font-bold text-slate-700">{studioState.settings.schoolName}</span>
                <span>•</span>
                <span className="text-amber-800 font-bold">GV: {studioState.settings.teacherName}</span>
              </p>
            </div>
          </div>

          {/* Quick System Action Group */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleExecuteCommand('xuất word')}
              className="px-3 py-1.5 text-xs font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="Xuất báo cáo kế hoạch và học sinh ra văn bản Word (.doc)"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Xuất Word</span>
            </button>
            <button
              onClick={() => handleExecuteCommand('xuất excel')}
              className="px-3 py-1.5 text-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="Xuất bảng tính Excel (.csv) có Quốc hiệu Tiêu ngữ"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Xuất Excel</span>
            </button>
            <button
              onClick={() => handleExecuteCommand('sao lưu')}
              className="px-3 py-1.5 text-xs font-black text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="Sao lưu toàn bộ dữ liệu ra tệp .json"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Sao Lưu</span>
            </button>
            {onOpenInstallModal && !isAppInstalled && (
              <button
                onClick={onOpenInstallModal}
                className="px-3 py-1.5 text-xs font-black text-amber-950 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 hover:from-amber-400 hover:to-amber-300 border border-amber-400 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                title="Cài đặt Cọ Nhí Studio như ứng dụng máy tính/điện thoại"
              >
                <Download className="w-4 h-4 text-amber-900" />
                <span>Cài Đặt App</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 THẺ KPI DASHBOARD THỜI GIAN THỰC */}
        {isLoading ? (
          /* Skeleton Loading Effect */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-white/70 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between">
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Bài Giảng & Slide */}
            <div className="bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bài Giảng Đang Soạn</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Presentation className="w-4 h-4" />
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-slate-800">{kpi.totalSlides} <span className="text-xs font-normal text-slate-400">trang slide</span></div>
                <p className="text-xs text-slate-600 font-medium truncate mt-0.5" title={studioState.project?.title}>
                  {studioState.project?.title || 'Chưa đặt tên bài giảng'}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onNavigateTab && onNavigateTab('editor')}
                  className="text-[11px] font-black text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Mở Soạn Slide</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                {onStartPresentation && (
                  <button
                    onClick={onStartPresentation}
                    className="ml-auto text-[11px] font-black bg-amber-50 hover:bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg border border-amber-200 cursor-pointer"
                  >
                    Trình Chiếu F5
                  </button>
                )}
              </div>
            </div>

            {/* KPI 2: Kế Hoạch Bài Dạy GDPT 2018 */}
            <div className="bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tiến Độ Kế Hoạch Bài Dạy</span>
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <BookOpen className="w-4 h-4" />
                </span>
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-800">{kpi.taughtPlans}/{kpi.totalPlans}</span>
                  <span className="text-xs font-bold text-emerald-600">{kpi.completionRate}% hoàn thành</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, kpi.completionRate))}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-100">
                <span>Khối 1 đến Khối 5</span>
                <button
                  onClick={() => setShowAddPlanModal(true)}
                  className="font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm Bài</span>
                </button>
              </div>
            </div>

            {/* KPI 3: Học Sinh & Đánh Giá TT27 */}
            <div className="bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Học Sinh Theo Dõi TT27</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-slate-800">{kpi.totalStudents} <span className="text-xs font-normal text-slate-400">học sinh</span></div>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    T: {kpi.levelTCount}
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                    H: {kpi.levelHCount}
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                    C: {kpi.levelCCount}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-100">
                <span>{availableClasses.length} lớp học</span>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('evaluation')}
                  className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Sổ Điểm SMAS</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* KPI 4: Trạng Thái Lưu Trữ & An Toàn */}
            <div className="bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lưu Trữ & Khôi Phục</span>
                <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <Award className="w-4 h-4" />
                </span>
              </div>
              <div className="my-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Auto-save Debounce 300ms</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Dữ liệu tự động lưu trữ cục bộ trên trình duyệt. Không lo mất bài khi F5 tải lại trang.
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleExecuteCommand('khôi phục')}
                  className="font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                  title="Khôi phục dữ liệu từ tệp .json"
                >
                  <Upload className="w-3 h-3" />
                  <span>Nhập File</span>
                </button>
                <button
                  onClick={() => handleExecuteCommand('nạp mẫu')}
                  className="font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                  title="Nạp lại dữ liệu mẫu Lê Quý Đôn"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Dữ Liệu Mẫu</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SECTION 2: SMART COMMAND BAR & QUICK ACTION CHIPS */}
      {/* ========================================================= */}
      <div className="px-4 md:px-8 py-2">
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-3.5 shadow-sm">
          {/* Thanh nhập lệnh tự nhiên */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <span className="absolute left-3.5 text-amber-500 pointer-events-none">
                <Sparkles className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleExecuteCommand();
                }}
                placeholder="Nhập câu lệnh tự nhiên (ví dụ: 'xuất word', 'lọc lớp 1A', 'mức tốt', 'thêm bài nặn con mèo')..."
                className="w-full pl-10 pr-24 py-2 text-xs md:text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
              />
              {commandInput && (
                <button
                  onClick={() => setCommandInput('')}
                  className="absolute right-20 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => handleExecuteCommand()}
                className="absolute right-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-black transition-all cursor-pointer shadow-2xs"
              >
                Thực Thi
              </button>
            </div>
            {hasActiveFilter && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1 transition-all cursor-pointer shrink-0"
                title="Bỏ toàn bộ bộ lọc và từ khóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xóa Lọc</span>
              </button>
            )}
          </div>

          {/* Dải nút gợi ý nhanh 1 chạm (Quick Action Chips) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-0.5 no-scrollbar">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1">
              Gợi Ý Nhanh:
            </span>
            {QUICK_ACTION_CHIPS.map(chip => (
              <button
                key={chip.id}
                onClick={() => handleExecuteCommand(chip.command)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-3xs ${chip.badgeColor}`}
                title={chip.description}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 3: BENTO GRID CARDS LAYOUT */}
      {/* ========================================================= */}
      <div className="px-4 md:px-8 py-3 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* BENTO CARD 1: KẾ HOẠCH DẠY HỌC (8 Cột) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base text-slate-800">
                  Lịch Báo Giảng & Kế Hoạch Bài Dạy (GDPT 2018)
                </h2>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  {filteredPlans.length} bài
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý tiến độ giảng dạy mĩ thuật từng tuần, tích hợp đồ dùng và yêu cầu cần đạt
              </p>
            </div>

            {/* Bộ chọn lớp nhanh & nút thêm */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                <option value="all">Tất cả lớp ({studioState.plans.length})</option>
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>Lớp {cls}</option>
                ))}
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                <option value="all">Trạng thái: Tất cả</option>
                <option value="Đã dạy">Đã dạy</option>
                <option value="Đang dạy">Đang dạy</option>
                <option value="Chưa dạy">Chưa dạy</option>
              </select>

              <button
                onClick={() => setShowAddPlanModal(true)}
                className="px-3 py-1.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Bài</span>
              </button>
            </div>
          </div>

          {/* Bảng Kế Hoạch */}
          <div className="flex-1 overflow-x-auto mt-3">
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3 w-16 text-center">Tuần</th>
                  <th className="py-2.5 px-3 w-16 text-center">Lớp</th>
                  <th className="py-2.5 px-3">Tên Bài Dạy (GDPT 2018)</th>
                  <th className="py-2.5 px-3 w-40">Yêu Cầu / Đồ Dùng</th>
                  <th className="py-2.5 px-3 w-28 text-center">Trạng Thái</th>
                  <th className="py-2.5 px-3 w-16 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredPlans.length > 0 ? (
                  filteredPlans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                        T.{plan.week}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-[11px]">
                          {plan.className}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-800 leading-snug">{plan.title}</div>
                        {plan.notes && <div className="text-[11px] text-slate-400 mt-0.5">{plan.notes}</div>}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-500 leading-tight">
                        <div className="truncate max-w-[150px]" title={plan.objectives}>{plan.objectives}</div>
                        <div className="text-amber-800 truncate max-w-[150px] mt-0.5" title={plan.materials}>📦 {plan.materials}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleTogglePlanStatus(plan.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                            plan.status === 'Đã dạy'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : plan.status === 'Đang dạy'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                          title="Bấm để đổi trạng thái"
                        >
                          {plan.status}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Xóa bài dạy này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400 font-normal">
                      Không tìm thấy bài học nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BENTO CARD 2: TRUY CẬP NHANH CÁC KHÔNG GIAN (4 Cột) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Card: Các tính năng sáng tạo */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-black text-sm text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Không Gian Sáng Tạo Mĩ Thuật</span>
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onNavigateTab && onNavigateTab('drawing')}
                className="p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl flex flex-col items-start gap-1 text-left transition-all cursor-pointer group"
              >
                <Brush className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-xs text-emerald-950 mt-1">Bảng Vẽ Thị Phạm</span>
                <span className="text-[10px] text-emerald-700">4 bước mẫu, vẽ nét</span>
              </button>

              <button
                onClick={() => onNavigateTab && onNavigateTab('games')}
                className="p-3 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 rounded-xl flex flex-col items-start gap-1 text-left transition-all cursor-pointer group"
              >
                <Gamepad2 className="w-5 h-5 text-indigo-700 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-xs text-indigo-950 mt-1">Trò Chơi Mĩ Thuật</span>
                <span className="text-[10px] text-indigo-700">Rung chuông vàng</span>
              </button>

              <button
                onClick={() => onNavigateTab && onNavigateTab('camera')}
                className="p-3 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl flex flex-col items-start gap-1 text-left transition-all cursor-pointer group"
              >
                <Camera className="w-5 h-5 text-rose-700 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-xs text-rose-950 mt-1">Cam Chấm Tranh</span>
                <span className="text-[10px] text-rose-700">Cảm biến màu & Rubric</span>
              </button>

              <button
                onClick={() => onNavigateTab && onNavigateTab('evaluation')}
                className="p-3 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 rounded-xl flex flex-col items-start gap-1 text-left transition-all cursor-pointer group"
              >
                <ClipboardCheck className="w-5 h-5 text-purple-700 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-xs text-purple-950 mt-1">Sổ Điểm SMAS</span>
                <span className="text-[10px] text-purple-700">TT27 • 17 lớp</span>
              </button>
            </div>
          </div>

          {/* Card: Hồ sơ báo cáo & Chữ ký */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-2xl border border-amber-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-amber-900 uppercase tracking-wider">Hồ Sơ Sư Phạm Chuẩn</span>
              <span className="text-[10px] font-bold bg-white text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                Lê Quý Đôn
              </span>
            </div>
            <p className="text-xs text-amber-950/80 leading-relaxed mb-4">
              Xuất báo cáo định kỳ đầy đủ Quốc hiệu Tiêu ngữ, trường PTDTBT TH Lê Quý Đôn và chữ ký giáo viên Đỗ Tiến Sỹ.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleExecuteCommand('xuất word')}
                className="w-full py-2 px-3 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <FileText className="w-4 h-4" />
                <span>Xuất Báo Cáo Word (.doc)</span>
              </button>
              <button
                onClick={() => handleExecuteCommand('xuất excel')}
                className="w-full py-2 px-3 text-xs font-black text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
                <span>Xuất Bảng Tính Excel (.csv)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 4: BẢNG THEO DÕI ĐÁNH GIÁ HỌC SINH TT27 */}
      {/* ========================================================= */}
      <div className="px-4 md:px-8 py-2">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base text-slate-800">
                  Đánh Giá Thường Xuyên Học Sinh (Thông tư 27/2020/TT-BGDĐT)
                </h2>
                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
                  {filteredEvaluations.length} học sinh
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Chấm điểm nhanh mức T, H, C và tự động sinh lời nhận xét chuyên biệt môn Mĩ thuật
              </p>
            </div>

            {/* Bộ lọc mức & xem toàn diện */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                <button
                  onClick={() => setSelectedLevelFilter('all')}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    selectedLevelFilter === 'all' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setSelectedLevelFilter('T')}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    selectedLevelFilter === 'T' ? 'bg-emerald-600 text-white shadow-2xs font-black' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Mức T
                </button>
                <button
                  onClick={() => setSelectedLevelFilter('H')}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    selectedLevelFilter === 'H' ? 'bg-blue-600 text-white shadow-2xs font-black' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Mức H
                </button>
                <button
                  onClick={() => setSelectedLevelFilter('C')}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    selectedLevelFilter === 'C' ? 'bg-rose-600 text-white shadow-2xs font-black' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Mức C
                </button>
              </div>

              <button
                onClick={() => onNavigateTab && onNavigateTab('evaluation')}
                className="px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <span>Xem Sổ Điểm 17 Lớp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bảng Danh Sách Học Sinh */}
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3 w-12 text-center">STT</th>
                  <th className="py-2.5 px-3 w-36">Mã Học Sinh</th>
                  <th className="py-2.5 px-3 w-44">Họ và Tên</th>
                  <th className="py-2.5 px-3 w-20 text-center">Lớp</th>
                  <th className="py-2.5 px-3 w-32 text-center">Mức Đạt Được</th>
                  <th className="py-2.5 px-3">Lời Nhận Xét Mĩ Thuật (Thầy/Cô Duyệt)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredEvaluations.slice(0, 10).map((ev, idx) => (
                  <tr key={ev.id || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-600">
                      {ev.studentCode}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      {ev.name}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 font-bold text-[11px] border border-purple-200">
                        {ev.className}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {['T', 'H', 'C'].map(lvl => (
                          <button
                            key={lvl}
                            onClick={() => handleChangeEvaluationLevel(ev.id, lvl)}
                            className={`w-7 h-7 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                              ev.level === lvl
                                ? lvl === 'T'
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : lvl === 'H'
                                  ? 'bg-blue-600 text-white shadow-2xs'
                                  : 'bg-rose-600 text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                            title={`Chuyển sang mức ${lvl}`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-normal leading-relaxed">
                      {ev.comment}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredEvaluations.length > 10 && (
            <div className="pt-3 text-center border-t border-slate-100">
              <button
                onClick={() => onNavigateTab && onNavigateTab('evaluation')}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1"
              >
                <span>Xem thêm {filteredEvaluations.length - 10} học sinh khác trong Sổ Điểm SMAS...</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL THÊM BÀI DẠY MỚI (100% THỰC THI HOÀN CHỈNH) */}
      {/* ========================================================= */}
      {showAddPlanModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowAddPlanModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                <span>Thêm Kế Hoạch Bài Dạy Mới (GDPT 2018)</span>
              </h3>
              <button
                onClick={() => setShowAddPlanModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewPlan} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên bài dạy / Chủ đề *</label>
                <input
                  type="text"
                  required
                  value={newPlanForm.title}
                  onChange={(e) => setNewPlanForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ví dụ: Chủ đề 4: Vẽ tranh phong cảnh buôn làng Tây Nguyên"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối</label>
                  <select
                    value={newPlanForm.grade}
                    onChange={(e) => setNewPlanForm(prev => ({ ...prev, grade: Number(e.target.value) }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl font-bold"
                  >
                    {[1, 2, 3, 4, 5].map(g => (
                      <option key={g} value={g}>Khối {g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lớp</label>
                  <input
                    type="text"
                    value={newPlanForm.className}
                    onChange={(e) => setNewPlanForm(prev => ({ ...prev, className: e.target.value }))}
                    placeholder="1A"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tuần dạy</label>
                  <input
                    type="number"
                    min="1"
                    max="35"
                    value={newPlanForm.week}
                    onChange={(e) => setNewPlanForm(prev => ({ ...prev, week: Number(e.target.value) }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái</label>
                  <select
                    value={newPlanForm.status}
                    onChange={(e) => setNewPlanForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Chưa dạy">Chưa dạy</option>
                    <option value="Đang dạy">Đang dạy</option>
                    <option value="Đã dạy">Đã dạy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Yêu cầu cần đạt</label>
                <textarea
                  rows={2}
                  value={newPlanForm.objectives}
                  onChange={(e) => setNewPlanForm(prev => ({ ...prev, objectives: e.target.value }))}
                  placeholder="Học sinh biết phối màu cơ bản, hoàn thành bài vẽ đúng chủ đề..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Đồ dùng dạy học</label>
                <input
                  type="text"
                  value={newPlanForm.materials}
                  onChange={(e) => setNewPlanForm(prev => ({ ...prev, materials: e.target.value }))}
                  placeholder="Sáp màu dầu, giấy A4, tranh mẫu..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú sư phạm</label>
                <input
                  type="text"
                  value={newPlanForm.notes}
                  onChange={(e) => setNewPlanForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Phân hóa học sinh khéo tay, chuẩn bị đồ dùng thay thế..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlanModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm cursor-pointer"
                >
                  Lưu Vào Kế Hoạch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
