import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import Header from './components/Header';
import SlideEditorView from './components/SlideEditor/SlideEditorView';
import LoginGateModal from './components/Admin/LoginGateModal';
import {
  saveProjectToLocal,
  loadProjectFromLocal,
  importProjectFile,
  saveProjectDraftToLocal,
  getProjectDraftFromLocal,
  clearProjectDraft
} from './utils/storageService';
import { setActiveUserScope, clearActiveUserScope, getActiveUserScope } from './utils/userWorkspaceService';

// Lazy loading cho các module nặng nhằm tối ưu thời gian tải và giảm kích thước bundle
const DrawingBoard = React.lazy(() => import('./components/DrawingBoard/DrawingBoard'));
const ArtGames = React.lazy(() => import('./components/ArtGames/ArtGames'));
const ArtCameraRubric = React.lazy(() => import('./components/ArtCamera/ArtCameraRubric'));
const StudentEvaluationSMAS = React.lazy(() => import('./components/Evaluation/StudentEvaluationSMAS'));
const OfflinePedagogyAssistant = React.lazy(() => import('./components/Assistant/OfflinePedagogyAssistant'));
const PPTXPreviewModal = React.lazy(() => import('./components/SlideEditor/PPTXPreviewModal'));
const VideoGuideModal = React.lazy(() => import('./components/VideoGuide/VideoGuideModal'));
const AdminModal = React.lazy(() => import('./components/Admin/AdminModal'));
const InstallAppModal = React.lazy(() => import('./components/Install/InstallAppModal'));
const BentoDashboardView = React.lazy(() => import('./components/Dashboard/BentoDashboardView'));
import SmartSidebar from './components/Navigation/SmartSidebar';
import BottomNavBar from './components/Navigation/BottomNavBar';
import { getCurrentSession, getAccessErrorMessage, logoutAdmin, resolveCurrentSession, ROLES } from './utils/adminAuthService';
import { auth } from './utils/firebaseClient';
import { Sparkles } from 'lucide-react';
import DraggableAssistantButton from './components/UI/DraggableAssistantButton';
import { buildStandardSlidesForPlan } from './utils/planSlideGenerator';
import { restoreDefaultData } from './lib/storage';

// Khởi tạo trang slide trắng tinh (App hoàn toàn sạch, không chứa file mẫu có sẵn)
const BLANK_INITIAL_SLIDE = {
  id: 'slide-1',
  title: 'Trang 1',
  background: '#ffffff',
  elements: [],
  notes: '',
};

const INITIAL_SLIDES = [BLANK_INITIAL_SLIDE];

class AdminModalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      if (!this.props.isOpen) return null;
      return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60" role="alert">
          <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-6 shadow-2xl">
            <h3 className="font-extrabold text-slate-800">Không thể tải khu vực quản trị</h3>
            <p className="mt-2 text-sm text-slate-600">Ứng dụng vẫn hoạt động. Thầy/Cô có thể đóng hộp thoại hoặc tải lại trang để thử lại.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={this.props.onClose} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700">Đóng</button>
              <button type="button" onClick={() => window.location.reload()} className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-bold text-white">Tải lại trang</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

class SafeTabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[SafeTabErrorBoundary] Caught error:', error, info);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleRestoreDefaults = () => {
    try {
      restoreDefaultData();
      window.dispatchEvent(new CustomEvent('conhi-storage-updated'));
    } catch (err) {
      console.warn('[SafeTabErrorBoundary] Restore default failed:', err);
    }
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-amber-300 p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xl mb-3">
              ⚠️
            </div>
            <h3 className="font-extrabold text-slate-800 text-base mb-1">Đang khôi phục mô-đun</h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Hệ thống đã tự động bảo vệ giao diện để không bị trắng màn hình. Thầy/Cô bấm nút bên dưới để khôi phục lại tính năng.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                🔄 Khôi Phục & Thử Lại
              </button>
              <button
                onClick={this.handleRestoreDefaults}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Đặt lại 10 bài dạy & sổ điểm chuẩn GDPT 2018"
              >
                ⚡ Nạp Dữ Liệu Gốc GDPT 2018
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [projectTitle, setProjectTitle] = useState('Bài Giảng Mĩ Thuật');
  const [slides, setSlides] = useState(INITIAL_SLIDES);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideEditorResetKey, setSlideEditorResetKey] = useState(0);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['dashboard', 'editor', 'drawing', 'games', 'camera', 'evaluation'].includes(tabParam)) {
        return tabParam;
      }
    }
    return 'editor';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
    const [isVideoGuideOpen, setIsVideoGuideOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [hasOpenedAdminModal, setHasOpenedAdminModal] = useState(false);
  // Mặc định luôn yêu cầu đăng nhập qua LoginGateModal khi mở ứng dụng (chống auto-login)
  const [currentUserSession, setCurrentUserSession] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(true);
  const [authError, setAuthError] = useState('');
  const authVersionRef = useRef(0);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [hasOpenedInstallModal, setHasOpenedInstallModal] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [recoveredDraft, setRecoveredDraft] = useState(null);
  const isInitialLoadedRef = useRef(false);

  // Nạp không gian làm việc riêng biệt của người dùng
  const loadUserWorkspace = (email) => {
    setActiveUserScope(email);
    const saved = loadProjectFromLocal(email);
    if (saved && saved.slides && saved.slides.length > 0) {
      setSlides(saved.slides);
      if (saved.title) setProjectTitle(saved.title);
    } else {
      setSlides(INITIAL_SLIDES);
      setProjectTitle('Bài Giảng Mĩ Thuật');
    }
    setCurrentSlideIndex(0);
    setSlideEditorResetKey(key => key + 1);

    // Kiểm tra bản nháp chưa lưu riêng của người dùng này
    try {
      const draft = getProjectDraftFromLocal(email);
      if (draft && draft.slides && draft.slides.length > 0) {
        const draftTime = draft.updatedAt ? new Date(draft.updatedAt).getTime() : 0;
        const savedTime = saved?.updatedAt ? new Date(saved.updatedAt).getTime() : 0;
        if (draftTime > savedTime + 3000) {
          setRecoveredDraft(draft);
        } else {
          setRecoveredDraft(null);
        }
      } else {
        setRecoveredDraft(null);
      }
    } catch (_) {
      setRecoveredDraft(null);
    }
  };

  // Xử lý đăng xuất tài khoản và dọn dẹp sạch không gian hiển thị trên RAM
  const handleLogout = async () => {
    authVersionRef.current += 1;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('conhi_explicit_logout', 'true');
        sessionStorage.setItem('conhi_explicit_logout', 'true');
      }
      await logoutAdmin();
    } catch (_) {
      setAuthError('Không thể hoàn tất đăng xuất. Vui lòng thử lại.');
    }
    clearActiveUserScope();
    setCurrentUserSession(null);
    setIsAdminModalOpen(false);
    setIsAuthenticated(false);
    setAuthError('');
    setSlides(INITIAL_SLIDES);
    setProjectTitle('Bài Giảng Mĩ Thuật');
    setCurrentSlideIndex(0);
    setRecoveredDraft(null);
    setSlideEditorResetKey(key => key + 1);
  };

  // Lắng nghe đăng xuất từ Firebase khi có thay đổi
  useEffect(() => {
    if (!auth) return undefined;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        clearActiveUserScope();
        setIsAuthenticated(false);
        setCurrentUserSession(null);
        setIsAdminModalOpen(false);
        setSlides(INITIAL_SLIDES);
        setProjectTitle('Bài Giảng Mĩ Thuật');
        setCurrentSlideIndex(0);
        setRecoveredDraft(null);
        setSlideEditorResetKey(key => key + 1);
      }
    });
    return () => unsubscribe();
  }, []);

  // Unified Assistant Open State across all screens
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAssistantMaximized, setIsAssistantMaximized] = useState(false);

  // PPTX Import states
  const [pptxPreviewData, setPptxPreviewData] = useState(null);
  const [isImportingPPTX, setIsImportingPPTX] = useState(false);
  const pptxFileInputRef = useRef(null);

  // Listener bắt sự kiện cài đặt PWA và phím tắt quản trị
  useEffect(() => {
    const isStandaloneDisplay = typeof window.matchMedia === 'function'
      && window.matchMedia('(display-mode: standalone)').matches;
    if (isStandaloneDisplay || window.navigator.standalone === true) setIsAppInstalled(true);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    const handleKeyDown = (e) => {
      // Phím F5: Bắt đầu trình chiếu toàn màn hình & ngăn trình duyệt reload trang
      if (e.key === 'F5') {
        e.preventDefault();
        setActiveTab('editor');
        setIsPresentationOpen(true);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')
        && (currentUserSession?.role === ROLES.SUB_ADMIN || currentUserSession?.role === ROLES.SUPER_ADMIN)) {
        e.preventDefault();
        const nextIsOpen = !isAdminModalOpen;
        if (nextIsOpen) setHasOpenedAdminModal(true);
        setIsAdminModalOpen(nextIsOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentUserSession?.role, isAdminModalOpen]);

  // Mặc định luôn yêu cầu đăng nhập qua LoginGateModal khi mở ứng dụng (chống auto-login)
  useEffect(() => {
    setIsAuthenticated(false);
    setCurrentUserSession(null);
    clearActiveUserScope();
  }, []);

  // Áp dụng bản nháp tự động khôi phục sau sự cố
  const handleApplyRecoveredDraft = () => {
    if (recoveredDraft) {
      setSlides(recoveredDraft.slides);
      if (recoveredDraft.title) setProjectTitle(recoveredDraft.title);
      setSlideEditorResetKey(key => key + 1);
      saveProjectToLocal({ title: recoveredDraft.title, slides: recoveredDraft.slides }, currentUserSession?.email);
      clearProjectDraft(currentUserSession?.email);
      setRecoveredDraft(null);
      setIsSaved(true);
    }
  };

  const handleDismissRecoveredDraft = () => {
    clearProjectDraft(currentUserSession?.email);
    setRecoveredDraft(null);
  };

  // Xóa trắng toàn bộ slide và tạo dự án mới cho không gian hiện tại
  const handleNewProject = () => {
    if (window.confirm('Thầy/Cô có muốn xóa trắng các slide hiện tại để tạo bài giảng mới không?')) {
      const blank = [
        {
          id: 'slide-' + Date.now(),
          title: 'Trang 1',
          background: '#ffffff',
          elements: [],
          notes: '',
        }
      ];
      setSlides(blank);
      setProjectTitle('Bài Giảng Mĩ Thuật');
      setCurrentSlideIndex(0);
      setSlideEditorResetKey(key => key + 1);
      clearProjectDraft(currentUserSession?.email);
      setRecoveredDraft(null);
      const saveResult = saveProjectToLocal({ title: 'Bài Giảng Mĩ Thuật', slides: blank }, currentUserSession?.email);
      setIsSaved(saveResult.success);
      if (!saveResult.success) alert(saveResult.error);
    }
  };

  // Mark unsaved on slides change
  const handleSlidesChange = (newSlides) => {
    setSlides(newSlides);
    setIsSaved(false);
  };

  // Cảnh báo khi người dùng đóng tab hoặc tải lại trang nếu còn thay đổi chưa lưu
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isSaved) {
        e.preventDefault();
        e.returnValue = 'Thầy/Cô có thay đổi chưa được lưu trong bài giảng. Bạn có chắc muốn rời đi?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSaved]);

  // Tự động lưu bản nháp (Autosave có debounce 900ms) riêng biệt theo từng không gian tài khoản
  useEffect(() => {
    if (!isInitialLoadedRef.current) {
      isInitialLoadedRef.current = true;
      return;
    }

    if (isSaved) return;

    const timer = setTimeout(() => {
      if (slides && slides.length > 0) {
        const payload = {
          title: projectTitle,
          slides,
        };
        saveProjectDraftToLocal(payload, currentUserSession?.email);
        const res = saveProjectToLocal(payload, currentUserSession?.email);
        setIsSaved(true); // Bảo vệ hiệu năng, tránh vòng lặp serialize khi tệp nặng vượt hạn mức LocalStorage
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [slides, projectTitle, isSaved, currentUserSession?.email]);

  // Manual local save cho không gian người dùng hiện tại
  const handleSave = () => {
    const payload = {
      title: projectTitle,
      slides,
    };
    const res = saveProjectToLocal(payload, currentUserSession?.email);
    if (res.success) {
      setIsSaved(true);
      clearProjectDraft(currentUserSession?.email);
      setRecoveredDraft(null);
    } else {
      setIsSaved(false);
      alert(res.error);
    }
  };

  // Import native .conhi project hoặc tự động nhận diện nếu người dùng chọn .pptx
  const handleImportProject = async (file) => {
    if (!file) return;
    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith('.pptx')) {
      setIsImportingPPTX(true);
      try {
        const { parsePPTXFile } = await import('./utils/pptxImportService');
        const result = await parsePPTXFile(file);
        setPptxPreviewData(result);
      } catch (err) {
        setPptxPreviewData({
          success: false,
          error: err.message || 'Lỗi đọc tệp PowerPoint'
        });
      } finally {
        setIsImportingPPTX(false);
      }
      return;
    }

    try {
      const data = await importProjectFile(file);
      if (data.slides) {
        setSlides(data.slides);
        setCurrentSlideIndex(0);
        setSlideEditorResetKey(key => key + 1);
        if (data.title) setProjectTitle(data.title);
        setIsSaved(false);
        alert('Đã tải thành công tệp bài giảng: ' + (data.title || file.name));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Trigger PPTX file picker
  const handleTriggerPPTXUpload = () => {
    if (pptxFileInputRef.current) {
      pptxFileInputRef.current.value = '';
      pptxFileInputRef.current.click();
    }
  };

  // Handle PPTX file chosen
  const handlePPTXFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportingPPTX(true);
    try {
      const { parsePPTXFile } = await import('./utils/pptxImportService');
      const result = await parsePPTXFile(file);
      setPptxPreviewData(result);
    } catch (err) {
      setPptxPreviewData({
        success: false,
        error: err.message || 'Lỗi đọc tệp PowerPoint'
      });
    } finally {
      setIsImportingPPTX(false);
    }
  };

  // Confirm open PPTX from preview modal
  const handleConfirmOpenPPTX = (parsedSlides, fileName) => {
    setSlides(parsedSlides);
    setCurrentSlideIndex(0);
    setSlideEditorResetKey(key => key + 1);
    const cleanTitle = fileName.replace(/\.pptx$/i, '').replace(/_/g, ' ');
    setProjectTitle(cleanTitle);
    setActiveTab('editor');
    setPptxPreviewData(null);
    setIsSaved(false);
  };

  // Insert drawing into current slide
  const handleInsertDrawingToSlide = (drawingDataUrl) => {
    const newEl = {
      id: 'drawing-' + Date.now(),
      type: 'image',
      x: 180,
      y: 80,
      width: 480,
      height: 270,
      src: drawingDataUrl,
    };
    const updatedSlides = slides.map((s, idx) => {
      if (idx === currentSlideIndex) {
        return {
          ...s,
          elements: [...(s.elements || []), newEl]
        };
      }
      return s;
    });
    setSlides(updatedSlides);
    setIsSaved(false);
  };

  // Insert graded artwork photo & comment into current slide
  const handleInsertGradedArtworkToSlide = (artworkDataUrl, commentText) => {
    const newImg = {
      id: 'graded-img-' + Date.now(),
      type: 'image',
      x: 60,
      y: 90,
      width: 400,
      height: 300,
      src: artworkDataUrl,
    };
    const newText = {
      id: 'graded-txt-' + Date.now(),
      type: 'text',
      x: 480,
      y: 120,
      width: 420,
      height: 240,
      text: `NHẬN XÉT CỦA THẦY/CÔ:\n\n${commentText}`,
      fontSize: 18,
      fontWeight: '600',
      color: '#9f1239',
      textAlign: 'left',
    };
    const updatedSlides = slides.map((s, idx) => {
      if (idx === currentSlideIndex) {
        return {
          ...s,
          elements: [...(s.elements || []), newImg, newText]
        };
      }
      return s;
    });
    setSlides(updatedSlides);
    setIsSaved(false);
  };

  // Insert mini-game into current slide
  const handleInsertGameToSlide = (gameElement) => {
    const updatedSlides = slides.map((s, idx) => {
      if (idx === currentSlideIndex) {
        return {
          ...s,
          elements: [...(s.elements || []), gameElement]
        };
      }
      return s;
    });
    setSlides(updatedSlides);
    setIsSaved(false);
    setActiveTab('editor');
  };

  // Create a brand new slide for the mini-game
  const handleCreateGameSlide = (gameElement) => {
    const newSlide = {
      id: 'slide-game-' + Date.now(),
      background: '#f8fafc',
      elements: [gameElement],
      notes: `Trò chơi mĩ thuật: ${gameElement.title}. Giáo viên tổ chức cho học sinh thi đua theo tổ hoặc cá nhân.`
    };
    const updated = [...slides, newSlide];
    setSlides(updated);
    setCurrentSlideIndex(slides.length);
    setIsSaved(false);
    setActiveTab('editor');
  };

  // Export to Real PowerPoint (.pptx)
  const handleExportPPTX = async () => {
    try {
      const { exportToPPTX } = await import('./utils/pptxExportService');
      const res = await exportToPPTX(projectTitle, slides);
      if (res.success) {
        alert(`${res.message}\n\n✓ ${res.details.supportedElements}\n\nℹ️ ${res.details.limitations}`);
      } else {
        alert('Lỗi xuất PowerPoint: ' + res.error);
      }
    } catch (err) {
      alert('Không thể tải dịch vụ xuất PowerPoint: ' + err.message);
    }
  };

  const activeSlide = slides[currentSlideIndex] || slides[0] || null;
  const activeSlideText = [activeSlide?.title, ...(activeSlide?.elements || []).filter(element => element.type === 'text').map(element => element.text)]
    .filter(Boolean)
    .join(' ');
  const gradeMatch = activeSlideText.match(/(?:lớp|khối)\s*([1-5])(?:[A-Za-z]|[\s.,;]|$)/i);
  const activeSlideGrade = gradeMatch ? Number(gradeMatch[1]) : 1;

  // 0. BẢO VỆ MÀN HÌNH KHÓA: HIỆN NGAY KHI MỞ APP (Chặn 100%, không hiển thị app phía sau khi chưa đăng nhập)
  if (!isAuthenticated) {
    return (
      <LoginGateModal
        isOpen={true}
        authError={authError}
        onLoginSuccess={(session) => {
          setActiveUserScope(session.email);
          setCurrentUserSession(session);
          setIsAuthenticated(true);
          setAuthError('');
          loadUserWorkspace(session.email);
        }}
        onClearAuthError={() => setAuthError('')}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 overflow-hidden font-sans relative">
      {/* Hidden input for PPTX file picker */}
      <input
        type="file"
        ref={pptxFileInputRef}
        accept=".pptx"
        className="hidden"
        onChange={handlePPTXFileChange}
      />

      {/* 1. App Header */}
      <Header
        projectTitle={projectTitle}
        setProjectTitle={(t) => { setProjectTitle(t); setIsSaved(false); }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSave={handleSave}
        isSaved={isSaved}
        onStartPresentation={() => { setActiveTab('editor'); setIsPresentationOpen(true); }}
        projectData={{ title: projectTitle, slides }}
        onImportProject={handleImportProject}
        onExportPPTX={handleExportPPTX}
        onUploadPPTX={handleTriggerPPTXUpload}
        onNewProject={handleNewProject}
        onOpenVideoGuide={() => setIsVideoGuideOpen(true)}
        onOpenAdminModal={() => {
          setHasOpenedAdminModal(true);
          setIsAdminModalOpen(true);
        }}
        onOpenInstallModal={() => {
          setHasOpenedInstallModal(true);
          setIsInstallModalOpen(true);
        }}
        installPrompt={installPrompt}
        isAppInstalled={isAppInstalled}
        userSession={currentUserSession}
        onLogout={handleLogout}
      />

      {/* Crash Recovery Banner: Phát hiện và khôi phục bản nháp chưa lưu sau sự cố */}
      {recoveredDraft && !isPresentationOpen && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg z-30 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <span className="text-base">⚠️</span>
            <span>
              Phát hiện bản nháp bài giảng chưa lưu ({recoveredDraft.updatedAt ? new Date(recoveredDraft.updatedAt).toLocaleTimeString('vi-VN') : 'gần đây'}: <strong>{recoveredDraft.title || 'Bài giảng'}</strong> - {recoveredDraft.slides?.length || 0} slide).
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleApplyRecoveredDraft}
              className="px-3.5 py-1 bg-white text-amber-900 font-black rounded-xl text-xs hover:bg-amber-50 transition-colors shadow-xs cursor-pointer"
            >
              Khôi Phục Dữ Liệu
            </button>
            <button
              onClick={handleDismissRecoveredDraft}
              className="px-2.5 py-1 text-white/80 hover:text-white font-bold text-xs hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              Bỏ Qua
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Workspace Layout with SmartSidebar and Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {!isPresentationOpen && (
          <SmartSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            onOpenInstallModal={() => {
              setHasOpenedInstallModal(true);
              setIsInstallModalOpen(true);
            }}
            isAppInstalled={isAppInstalled}
            onOpenAdminModal={() => {
              setHasOpenedAdminModal(true);
              setIsAdminModalOpen(true);
            }}
            userSession={currentUserSession}
            onLogout={handleLogout}
          />
        )}

        <main className="flex-1 flex overflow-hidden relative">
          <SafeTabErrorBoundary resetKey={activeTab}>
            <React.Suspense fallback={<div className="flex-1 flex items-center justify-center p-8 text-slate-500 font-semibold text-sm">Đang tải không gian làm việc...</div>}>
              {activeTab === 'dashboard' && (
                <BentoDashboardView
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenSlideWithTitle={(title, plan) => {
                    setProjectTitle(title);
                    if (plan) {
                      const generated = buildStandardSlidesForPlan(plan);
                      setSlides(generated);
                      setCurrentSlideIndex(0);
                      setSlideEditorResetKey(k => k + 1);
                    }
                    setActiveTab('editor');
                  }}
                  onImportPlanSlides={(importedSlides, title) => {
                    setSlides(importedSlides);
                    setProjectTitle(title);
                    setCurrentSlideIndex(0);
                    setSlideEditorResetKey(k => k + 1);
                    setIsSaved(false);
                    setActiveTab('editor');
                  }}
                  onOpenVideoGuide={() => setIsVideoGuideOpen(true)}
                  slides={slides}
                />
              )}

              {activeTab === 'editor' && (
                <SlideEditorView
                  key={slideEditorResetKey}
                  slides={slides}
                  setSlides={handleSlidesChange}
                  currentSlideIndex={currentSlideIndex}
                  setCurrentSlideIndex={setCurrentSlideIndex}
                  onSave={handleSave}
                  isPresentationOpen={isPresentationOpen}
                  setIsPresentationOpen={setIsPresentationOpen}
                  showAssistant={isAssistantOpen}
                  setShowAssistant={setIsAssistantOpen}
                />
              )}

              {activeTab === 'drawing' && (
                <DrawingBoard
                  onInsertDrawingToSlide={handleInsertDrawingToSlide}
                  onNavigateToEditor={() => setActiveTab('editor')}
                />
              )}

              {activeTab === 'games' && (
                <ArtGames 
                  projectTitle={projectTitle}
                  currentSlide={slides[currentSlideIndex]}
                  onInsertGameToSlide={handleInsertGameToSlide}
                  onCreateGameSlide={handleCreateGameSlide}
                />
              )}

              {activeTab === 'camera' && (
                <ArtCameraRubric
                  onInsertGradedArtworkToSlide={handleInsertGradedArtworkToSlide}
                  onNavigateToEditor={() => setActiveTab('editor')}
                  onNavigateToSmas={() => setActiveTab('evaluation')}
                />
              )}

              {activeTab === 'evaluation' && (
                <StudentEvaluationSMAS
                  onNavigateToCamera={() => setActiveTab('camera')}
                />
              )}

              {/* Slide-over Assistant Drawer for non-editor screens */}
            </React.Suspense>
          </SafeTabErrorBoundary>
        </main>
      </div>

      {/* Floating Modern Assistant Chatbox for ALL screens */}
      {isAssistantOpen && !isPresentationOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/25 backdrop-blur-2xs z-40 transition-opacity"
            onClick={() => setIsAssistantOpen(false)}
            title="Bấm ra ngoài để đóng Trợ Giảng"
          />
          <div className={`fixed z-50 transition-all duration-200 flex flex-col ${
            isAssistantMaximized
              ? 'inset-y-0 right-0 w-full sm:w-[500px] h-full rounded-none sm:rounded-l-3xl shadow-2xl border-l border-amber-300 bg-white overflow-hidden animate-in slide-in-from-right'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[430px] max-w-[calc(100vw-2rem)] h-[640px] max-h-[88vh] rounded-3xl shadow-2xl border-2 border-amber-400/80 bg-white ring-4 ring-amber-400/20 overflow-hidden animate-in zoom-in-95'
          }`}>
            <SafeTabErrorBoundary>
              <React.Suspense fallback={<div className="flex-1 flex items-center justify-center p-8 text-slate-500 font-semibold text-sm">Đang tải Cô Trợ Giảng AI...</div>}>
                <OfflinePedagogyAssistant
                  currentSlide={slides[currentSlideIndex] || slides[0]}
                  currentGrade={activeSlideGrade}
                  isMaximized={isAssistantMaximized}
                  onToggleMaximize={() => setIsAssistantMaximized(prev => !prev)}
                  onInsertToNotes={(text) => {
                    const currentSlide = slides[currentSlideIndex] || slides[0];
                    if (!currentSlide) return;
                    const existing = currentSlide.notes || '';
                    const newNotes = existing ? `${existing}\n\n${text}` : text;
                    const updated = slides.map((s, idx) => idx === currentSlideIndex ? { ...s, notes: newNotes } : s);
                    handleSlidesChange(updated);
                    alert('✓ Đã chèn nội dung vào ghi chú trang slide hiện tại!');
                  }}
                  onClose={() => setIsAssistantOpen(false)}
                />
              </React.Suspense>
            </SafeTabErrorBoundary>
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation Bar */}
      {!isPresentationOpen && (
        <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {/* 3. Floating Teacher Assistant Button: Có thể kéo thả di chuyển tự do trên màn hình */}
      {!isPresentationOpen && !isAssistantOpen && (
        <DraggableAssistantButton onClick={() => setIsAssistantOpen(true)} />
      )}

      <React.Suspense fallback={null}>
        {/* 4. PPTX Import Preview Modal */}
        {pptxPreviewData && (
          <PPTXPreviewModal
            importResult={pptxPreviewData}
            onConfirmOpen={handleConfirmOpenPPTX}
            onClose={() => setPptxPreviewData(null)}
          />
        )}

        {/* 5. Video Guide (7-Minute Presentation) Modal */}
        {isVideoGuideOpen && (
          <VideoGuideModal
            isOpen={isVideoGuideOpen}
            onClose={() => setIsVideoGuideOpen(false)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* 6. Admin Authentication & Management Modal */}
        {hasOpenedAdminModal && (
          <AdminModalErrorBoundary isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)}>
            <AdminModal
              isOpen={isAdminModalOpen}
              onClose={() => setIsAdminModalOpen(false)}
              onLogout={handleLogout}
              session={currentUserSession}
            />
          </AdminModalErrorBoundary>
        )}

        {/* 7. Install Application Modal */}
        {hasOpenedInstallModal && (
          <InstallAppModal
            isOpen={isInstallModalOpen}
            onClose={() => setIsInstallModalOpen(false)}
            installPrompt={installPrompt}
            isInstalled={isAppInstalled}
          />
        )}
      </React.Suspense>
    </div>
  );
}
