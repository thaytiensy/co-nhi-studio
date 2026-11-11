import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  Presentation,
  Users,
  Database,
  Plus,
  FileText,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Check,
  AlertCircle,
  School,
  User,
  Calendar,
  Cloud,
  CloudOff,
  RefreshCw,
  Trash2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  getStoredData,
  saveStoredData,
  restoreDefaultData,
  computeKPI,
  exportBackupJson,
  importRestoreJson
} from '../../lib/storage';
import { exportWordReport, exportExcelReport, exportCsvReport } from '../../lib/export-engine';
import {
  getFirebaseDatabaseStatus,
  syncStorageToFirebase,
  fetchStorageFromFirebase,
  subscribeToFirebaseStatus
} from '../../utils/firebaseDatabaseService';
import PlanPPTXImportModal from './PlanPPTXImportModal';

export default function BentoDashboardView({
  onNavigateTab,
  onOpenSlideWithTitle,
  onImportPlanSlides,
  slides = []
}) {
  const [data, setData] = useState(() => getStoredData());
  const [selectedPlanForImport, setSelectedPlanForImport] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState(() => getFirebaseDatabaseStatus());
  const [toast, setToast] = useState(null); // { message: '', type: 'success' | 'info' | 'error' }
  const fileInputRef = useRef(null);

  // Form thêm bài dạy mới
  const [newPlan, setNewPlan] = useState({
    title: '',
    grade: 'Lớp 1',
    topic: 'Chủ đề: Sắc màu quê hương',
    lessonNumber: 1,
    week: 1,
    objectives: 'Biết cách phối các màu cơ bản và vẽ bức tranh chủ đề.',
    materials: 'Sáp màu, giấy vẽ A4, kéo thủ công.',
    status: 'Sắp dạy',
    notes: 'Khuyến khích học sinh thỏa sức sáng tạo đường nét.'
  });

  // Form cài đặt thông tin giáo viên & trường học
  const [settingsForm, setSettingsForm] = useState(() => ({
    teacherName: data.settings?.teacherName || 'Giáo viên',
    schoolName: data.settings?.schoolName || 'Trường Tiểu học',
    agencyName: data.settings?.agencyName || 'Phòng Giáo dục và Đào tạo',
    academicYear: data.settings?.academicYear || '2026 - 2027',
    currentSemester: data.settings?.currentSemester || 'Học kì I'
  }));

  // Đăng ký lắng nghe trạng thái Firebase Database
  useEffect(() => {
    const unsubscribe = subscribeToFirebaseStatus(setFirebaseStatus);
    return () => unsubscribe();
  }, []);

  // Đăng ký lắng nghe thay đổi LocalStorage và chuyển đổi không gian tài khoản
  useEffect(() => {
    const handleStorageUpdate = () => {
      setData(getStoredData());
    };
    window.addEventListener('conhi_storage_updated', handleStorageUpdate);
    window.addEventListener('conhi-storage-updated', handleStorageUpdate);
    window.addEventListener('conhi-workspace-changed', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('conhi_storage_updated', handleStorageUpdate);
      window.removeEventListener('conhi-storage-updated', handleStorageUpdate);
      window.removeEventListener('conhi-workspace-changed', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  // Hiển thị thông báo Toast mượt mà
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Tính toán chỉ số KPI thời gian thực
  const kpi = useMemo(() => {
    return computeKPI(data);
  }, [data]);

  // Lọc danh sách bài dạy theo khối lớp và trạng thái
  const filteredPlans = useMemo(() => {
    return (data.plans || []).filter((p) => {
      const matchGrade = selectedGrade === 'all' || p.grade.toLowerCase().includes(selectedGrade.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchGrade && matchStatus;
    });
  }, [data.plans, selectedGrade, statusFilter]);

  // Nạp lại dữ liệu mẫu mặc định
  const handleRestoreDefaults = () => {
    setIsLoading(true);
    setTimeout(() => {
      const restored = restoreDefaultData();
      setData(restored);
      setIsLoading(false);
      showToast('Đã khôi phục 10 kế hoạch bài dạy và 10 học sinh mẫu chuẩn GDPT 2018!', 'success');
    }, 300);
  };

  // Đổi trạng thái bài dạy (Đã dạy <-> Sắp dạy)
  const handleTogglePlanStatus = (planId) => {
    const updatedPlans = (data.plans || []).map((p) => {
      if (p.id === planId) {
        const nextStatus = p.status === 'Đã dạy' ? 'Sắp dạy' : 'Đã dạy';
        return { ...p, status: nextStatus };
      }
      return p;
    });

    const nextData = { ...data, plans: updatedPlans };
    saveStoredData(nextData);
    setData(nextData);
    showToast('Đã cập nhật trạng thái bài dạy!', 'success');
  };

  // Xóa một bài dạy
  const handleDeletePlan = (planId, planTitle) => {
    if (window.confirm(`Thầy/Cô có chắc chắn muốn xóa bài dạy "${planTitle}" không?`)) {
      const updatedPlans = (data.plans || []).filter((p) => p.id !== planId);
      const nextData = { ...data, plans: updatedPlans };
      saveStoredData(nextData);
      setData(nextData);
      showToast(`Đã xóa bài dạy "${planTitle}".`, 'info');
    }
  };

  // Thêm bài dạy mới từ form
  const handleCreateNewPlan = (e) => {
    e.preventDefault();
    if (!newPlan.title.trim()) {
      showToast('Vui lòng nhập tên bài dạy!', 'error');
      return;
    }

    const createdItem = {
      id: `plan-${Date.now()}`,
      title: newPlan.title.trim(),
      grade: newPlan.grade,
      topic: newPlan.topic.trim() || 'Chủ đề mĩ thuật',
      lessonNumber: Number(newPlan.lessonNumber) || 1,
      week: Number(newPlan.week) || 1,
      objectives: newPlan.objectives.trim() || 'Đạt mục tiêu bài học mĩ thuật GDPT 2018.',
      materials: newPlan.materials.trim() || 'Sáp màu, giấy vẽ A4.',
      status: newPlan.status,
      notes: newPlan.notes.trim()
    };

    const nextPlans = [createdItem, ...(data.plans || [])];
    const nextData = { ...data, plans: nextPlans };
    saveStoredData(nextData);
    setData(nextData);
    setIsAddingPlan(false);
    setNewPlan({
      title: '',
      grade: 'Lớp 1',
      topic: 'Chủ đề: Sắc màu quê hương',
      lessonNumber: 1,
      week: 1,
      objectives: 'Biết cách phối các màu cơ bản và vẽ bức tranh chủ đề.',
      materials: 'Sáp màu, giấy vẽ A4, kéo thủ công.',
      status: 'Sắp dạy',
      notes: ''
    });
    showToast(`Đã thêm bài dạy "${createdItem.title}" vào lịch báo giảng!`, 'success');
  };

  // Khôi phục dữ liệu từ tệp .json tải lên
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const restored = await importRestoreJson(file);
      setData(restored);
      setIsLoading(false);
      showToast(`Đã khôi phục dữ liệu thành công từ tệp ${file.name}!`, 'success');
    } catch (err) {
      setIsLoading(false);
      showToast(err.message || 'Không thể đọc tệp .json khôi phục.', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Lưu thông tin thiết lập trường học và giáo viên
  const handleSaveSettings = (e) => {
    e.preventDefault();
    const updatedSettings = {
      ...data.settings,
      teacherName: settingsForm.teacherName.trim() || 'Giáo viên',
      schoolName: settingsForm.schoolName.trim() || 'Trường Tiểu học',
      agencyName: settingsForm.agencyName.trim() || 'Phòng Giáo dục và Đào tạo',
      academicYear: settingsForm.academicYear.trim() || '2026 - 2027',
      currentSemester: settingsForm.currentSemester.trim() || 'Học kì I'
    };

    const nextData = { ...data, settings: updatedSettings };
    saveStoredData(nextData);
    setData(nextData);
    showToast('Đã lưu thông tin trường và giáo viên thành công!', 'success');
  };

  // Đồng bộ lên Firebase Cloud Firestore
  const handleSyncToFirebase = async () => {
    setIsLoading(true);
    const result = await syncStorageToFirebase(data);
    setIsLoading(false);
    if (result.success) {
      showToast(result.message || 'Đồng bộ đám mây thành công!', 'success');
    } else {
      showToast(result.message || result.error || 'Chưa thể đồng bộ lên đám mây.', 'error');
    }
  };

  // Tải dữ liệu từ Firebase Cloud Firestore
  const handleFetchFromFirebase = async () => {
    setIsLoading(true);
    const result = await fetchStorageFromFirebase();
    setIsLoading(false);
    if (result.success) {
      setData(result.data);
      showToast(result.message || 'Đã cập nhật dữ liệu từ đám mây!', 'success');
    } else {
      showToast(result.message || result.error || 'Không thể tải từ đám mây.', 'error');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-800 p-4 md:p-6 lg:p-8 no-scrollbar relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/20'
              : toast.type === 'error'
              ? 'bg-rose-600 text-white border-rose-500 shadow-rose-900/20'
              : 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-900/20'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
          {toast.type === 'info' && <Sparkles className="w-5 h-5 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Tệp input ẩn để khôi phục JSON */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        className="hidden"
      />

      <div className="max-w-7xl mx-auto space-y-6 pb-20 md:pb-8">
        {/* 1. Header Banner & Status Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> SIÊU VIP PRO
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
                Bộ Sách Kết Nối Tri Thức Với Cuộc Sống
              </span>
              <span className="text-xs font-bold text-slate-500">Mĩ Thuật GDPT 2018</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
              Bảng Tổng Quan Quản Trị Sư Phạm & Dữ Liệu
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống quản lý giáo án, theo dõi sổ điểm TT27 và đồng bộ tự động chuẩn chuyên nghiệp
            </p>
          </div>

          {/* Database Connection Pill */}
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                firebaseStatus.isConfigured
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
              title={firebaseStatus.message}
            >
              {firebaseStatus.isConfigured ? (
                <>
                  <Cloud className="w-4 h-4 text-emerald-600" />
                  <span>Cloud Firestore</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>LocalStorage Tự Động (Offline)</span>
                </>
              )}
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <button
              onClick={handleSyncToFirebase}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold cursor-pointer transition-colors"
              title="Đồng bộ dữ liệu"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
              <span>Đồng Bộ</span>
            </button>
          </div>
        </div>

        {/* 2. Top Bento Grid: Realtime KPI Dashboard Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Kế Hoạch Bài Dạy */}
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Bài Dạy Mĩ Thuật</span>
              <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{kpi.totalPlans}</span>
              <span className="text-xs font-semibold text-slate-500">kế hoạch</span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Tiến độ đã dạy</span>
                <span className="text-amber-700 font-bold">{kpi.completionRate}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${kpi.completionRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* KPI 2: Trang Trình Chiếu Slide */}
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Slide Giảng Dạy</span>
              <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                <Presentation className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{slides.length || 1}</span>
              <span className="text-xs font-semibold text-slate-500">trang slide</span>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('editor')}
              className="mt-3 w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Vào soạn slide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* KPI 3: Đánh Giá Học Sinh TT27 */}
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sổ Điểm TT27</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{kpi.totalStudents}</span>
              <span className="text-xs font-semibold text-slate-500">học sinh</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                T: {kpi.levelTCount}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                H: {kpi.levelHCount}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                C: {kpi.levelCCount}
              </span>
            </div>
          </div>

          {/* KPI 4: Trạng Thái Lưu Trữ */}
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Lưu Trữ An Toàn</span>
              <div className="w-9 h-9 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">Auto-Save</span>
              <span className="text-xs font-semibold text-emerald-600">300ms</span>
            </div>
            <p className="mt-3 text-[11px] text-slate-500 line-clamp-2">
              Dữ liệu tự động bảo toàn khi F5 tải lại trang hoặc mở trình duyệt mới.
            </p>
          </div>
        </div>

        {/* 4. Bento Grid Main Content: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Teaching Plans (Kế Hoạch Bài Dạy) */}
          <div className="lg:col-span-7 bg-white/80 backdrop-blur-md p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                  Kế Hoạch Bài Dạy & Lịch Báo Giảng
                </h2>
                <p className="text-xs text-slate-500">
                  Hiển thị {filteredPlans.length} / {(data.plans || []).length} bài dạy theo chương trình GDPT 2018
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddingPlan(!isAddingPlan)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Bài Dạy</span>
                </button>
              </div>
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {['all', 'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'].map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                      selectedGrade === grade
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {grade === 'all' ? 'Tất cả khối' : grade}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {['all', 'Đã dạy', 'Sắp dạy'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'all' ? 'Tất cả trạng thái' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal / Form thêm bài dạy mới */}
            {isAddingPlan && (
              <form
                onSubmit={handleCreateNewPlan}
                className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl space-y-3 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <span className="text-xs font-bold text-amber-900 uppercase">
                    Thêm Kế Hoạch Bài Dạy Mới
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingPlan(false)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Tên Bài Dạy *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPlan.title}
                      onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                      placeholder="VD: Bài 11: Em vẽ ngôi trường hạnh phúc"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Khối Lớp
                    </label>
                    <select
                      value={newPlan.grade}
                      onChange={(e) => setNewPlan({ ...newPlan, grade: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl outline-none"
                    >
                      <option value="Lớp 1">Lớp 1</option>
                      <option value="Lớp 2">Lớp 2</option>
                      <option value="Lớp 3">Lớp 3</option>
                      <option value="Lớp 4">Lớp 4</option>
                      <option value="Lớp 5">Lớp 5</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Chủ Đề
                    </label>
                    <input
                      type="text"
                      value={newPlan.topic}
                      onChange={(e) => setNewPlan({ ...newPlan, topic: e.target.value })}
                      placeholder="VD: Chủ đề 4: Trường học thân yêu"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Tuần
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="35"
                        value={newPlan.week}
                        onChange={(e) => setNewPlan({ ...newPlan, week: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Tiết
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="70"
                        value={newPlan.lessonNumber}
                        onChange={(e) => setNewPlan({ ...newPlan, lessonNumber: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Yêu Cầu Cần Đạt (Mục Tiêu)
                  </label>
                  <input
                    type="text"
                    value={newPlan.objectives}
                    onChange={(e) => setNewPlan({ ...newPlan, objectives: e.target.value })}
                    placeholder="Mục tiêu bài dạy chuẩn phẩm chất, năng lực..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingPlan(false)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl cursor-pointer"
                  >
                    Lưu Bài Dạy
                  </button>
                </div>
              </form>
            )}

            {/* List of Plans */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 no-scrollbar">
              {filteredPlans.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-medium text-xs">
                  Không tìm thấy bài dạy nào phù hợp với bộ lọc.
                </div>
              ) : (
                filteredPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-3.5 rounded-2xl bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-900">
                          {plan.grade}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          Tuần {plan.week} • Tiết {plan.lessonNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                            plan.status === 'Đã dạy'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {plan.status}
                        </span>
                      </div>
                      <h3 className="text-xs md:text-sm font-bold text-slate-800">
                        {plan.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        🎯 {plan.objectives}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
                      {/* Nút Nhập Giáo Án PP chuyên biệt cho từng chủ đề */}
                      <button
                        type="button"
                        onClick={() => setSelectedPlanForImport(plan)}
                        className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-extrabold text-[11px] md:text-xs flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer border border-amber-400/50"
                        title={`Nhập dữ liệu giáo án PowerPoint (.pptx) cho "${plan.title}" và chuyển sang tab Soạn Slide`}
                      >
                        <Upload className="w-3.5 h-3.5 shrink-0 text-amber-100" />
                        <span className="whitespace-nowrap">Nhập Giáo Án PP</span>
                      </button>

                      <button
                        onClick={() => handleTogglePlanStatus(plan.id)}
                        className={`p-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                          plan.status === 'Đã dạy'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                        title={plan.status === 'Đã dạy' ? 'Đổi sang Sắp dạy' : 'Đánh dấu Đã dạy'}
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (onOpenSlideWithTitle) onOpenSlideWithTitle(plan.title, plan);
                          else if (onNavigateTab) onNavigateTab('editor');
                        }}
                        className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-colors cursor-pointer"
                        title="Chuyển sang tab Soạn Slide bài học này"
                      >
                        <Presentation className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeletePlan(plan.id, plan.title)}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                        title="Xóa bài dạy"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Actions, Exports, & Settings */}
          <div className="lg:col-span-5 space-y-6">
            {/* Bento Card 2: Trung Tâm Xuất Báo Cáo & Dữ Liệu */}
            <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Xuất Báo Cáo & Sao Lưu Dữ Liệu
              </h2>
              <p className="text-xs text-slate-500">
                Xuất file văn bản chuẩn phông Times New Roman và bảng tính SMAS
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    exportWordReport();
                    showToast('Đã tải file Word (.doc) có Quốc hiệu Tiêu ngữ chuẩn!', 'success');
                  }}
                  className="p-3 rounded-2xl bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 text-left transition-all cursor-pointer group active:scale-95"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xs font-black text-indigo-950 block">Xuất Báo Cáo Word</span>
                    <span className="text-[10px] text-indigo-700 block">Định dạng .doc chuẩn</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    exportExcelReport();
                    showToast('Đã tải bảng điểm Excel (.xlsx) chuẩn SMAS!', 'success');
                  }}
                  className="p-3 rounded-2xl bg-teal-50/80 hover:bg-teal-100 border border-teal-200 text-left transition-all cursor-pointer group active:scale-95"
                >
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xs font-black text-teal-950 block">Xuất Bảng Excel</span>
                    <span className="text-[10px] text-teal-700 block">Định dạng .xlsx chuẩn SMAS</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    exportBackupJson(data);
                    showToast('Đã xuất bản sao lưu .json an toàn!', 'success');
                  }}
                  className="p-3 rounded-2xl bg-amber-50/80 hover:bg-amber-100 border border-amber-200 text-left transition-all cursor-pointer group active:scale-95"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Download className="w-4 h-4" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xs font-black text-amber-950 block">Sao Lưu Dữ Liệu</span>
                    <span className="text-[10px] text-amber-700 block">Tệp .json toàn bộ</span>
                  </div>
                </button>

                <button
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="p-3 rounded-2xl bg-rose-50/80 hover:bg-rose-100 border border-rose-200 text-left transition-all cursor-pointer group active:scale-95"
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xs font-black text-rose-950 block">Khôi Phục (.json)</span>
                    <span className="text-[10px] text-rose-700 block">Nạp lại tệp đã lưu</span>
                  </div>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={handleRestoreDefaults}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-800 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Phục hồi dữ liệu mẫu gốc GDPT 2018</span>
                </button>

                <button
                  onClick={() => onNavigateTab && onNavigateTab('evaluation')}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  <span>Sổ điểm TT27</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bento Card 3: Thiết Lập Trường Học & Giáo Viên (Tùy Chỉnh Linh Hoạt) */}
            <form
              onSubmit={handleSaveSettings}
              className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <School className="w-5 h-5 text-amber-600" />
                  Thông Tin Trường & Giáo Viên
                </h2>
                <span className="text-[11px] text-slate-400 font-semibold">Tự chỉnh theo ý Thầy/Cô</span>
              </div>
              <p className="text-xs text-slate-500">
                Thông tin này sẽ tự động xuất hiện trên đầu các bản báo cáo Word và bảng điểm Excel
              </p>

              <div className="space-y-2.5 pt-1 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Cơ Quan Quản Lý / Phòng GD&ĐT
                  </label>
                  <input
                    type="text"
                    value={settingsForm.agencyName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, agencyName: e.target.value })}
                    placeholder="VD: Phòng Giáo dục và Đào tạo..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tên Trường Học
                  </label>
                  <input
                    type="text"
                    value={settingsForm.schoolName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, schoolName: e.target.value })}
                    placeholder="VD: Trường Tiểu học..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Tên Giáo Viên
                    </label>
                    <input
                      type="text"
                      value={settingsForm.teacherName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, teacherName: e.target.value })}
                      placeholder="VD: Giáo viên Mĩ thuật..."
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Năm Học & Học Kì
                    </label>
                    <input
                      type="text"
                      value={settingsForm.academicYear}
                      onChange={(e) => setSettingsForm({ ...settingsForm, academicYear: e.target.value })}
                      placeholder="VD: 2026 - 2027"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors shadow-2xs"
                  >
                    Lưu Thiết Lập
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Nhập Giáo Án PowerPoint Bài Dạy Cho Từng Chủ Đề */}
      {selectedPlanForImport && (
        <PlanPPTXImportModal
          plan={selectedPlanForImport}
          onConfirmImport={(slides, title) => {
            if (onImportPlanSlides) {
              onImportPlanSlides(slides, title);
            } else if (onOpenSlideWithTitle) {
              onOpenSlideWithTitle(title);
            } else if (onNavigateTab) {
              onNavigateTab('editor');
            }
            showToast(`✓ Đã nạp thành công giáo án cho bài ${title}! Đang chuyển sang tab Soạn Slide.`, 'success');
          }}
          onClose={() => setSelectedPlanForImport(null)}
        />
      )}
    </div>
  );
}
