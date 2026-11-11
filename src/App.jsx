import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import Header from './components/Header';
import SlideEditorView from './components/SlideEditor/SlideEditorView';
import LoginGateModal from './components/Admin/LoginGateModal';
import { saveProjectToLocal, loadProjectFromLocal, importProjectFile } from './utils/storageService';

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
  const isInitialLoadedRef = useRef(false);

  // Xử lý đăng xuất tài khoản
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
    setCurrentUserSession(null);
    setIsAdminModalOpen(false);
    setIsAuthenticated(false);
    setAuthError('');
  };

  // Lắng nghe đăng xuất từ Firebase khi có thay đổi
  useEffect(() => {
    if (!auth) return undefined;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setIsAuthenticated(false);
        setCurrentUserSession(null);
        setIsAdminModalOpen(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Unified Assistant Open State across all screens
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

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

  // Load from local storage on initial mount (loại bỏ dữ liệu mẫu cũ nếu có để app luôn trắng)
  useEffect(() => {
    const saved = loadProjectFromLocal();
    if (saved && saved.slides && saved.slides.length > 0) {
      const isOldSample = saved.slides.some(s => s.id && String(s.id).startsWith('slide-init-'));
      if (!isOldSample) {
        setSlides(saved.slides);
        setSlideEditorResetKey(key => key + 1);
        if (saved.title) setProjectTitle(saved.title);
      } else {
        // Xóa dữ liệu mẫu cũ để giữ ứng dụng trắng tinh
        try {
          localStorage.removeItem('co_nhi_studio_project_v1');
        } catch (e) {}
      }
    }
  }, []);

  // Xóa trắng toàn bộ slide và tạo dự án mới
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
      const saveResult = saveProjectToLocal({ title: 'Bài Giảng Mĩ Thuật', slides: blank });
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

  // Tự động lưu (Autosave có debounce 1.5s) khi slides hoặc projectTitle thay đổi
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
        const res = saveProjectToLocal(payload);
        setIsSaved(true); // Bảo vệ hiệu năng, tránh vòng lặp serialize 1.5s khi tệp nặng vượt hạn mức LocalStorage
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [slides, projectTitle, isSaved]);

  // Manual local save
  const handleSave = () => {
    const payload = {
      title: projectTitle,
      slides,
    };
    const res = saveProjectToLocal(payload);
    if (res.success) {
      setIsSaved(true);
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
          setCurrentUserSession(session);
          setIsAuthenticated(true);
          setAuthError('');
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
          <React.Suspense fallback={<div className="flex-1 flex items-center justify-center p-8 text-slate-500 font-semibold text-sm">Đang tải không gian làm việc...</div>}>
            {activeTab === 'dashboard' && (
              <BentoDashboardView
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenSlideWithTitle={(title) => {
                  setProjectTitle(title);
                  setActiveTab('editor');
                }}
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
              />
            )}

            {activeTab === 'evaluation' && (
              <StudentEvaluationSMAS />
            )}

            {/* Slide-over Assistant Drawer for non-editor screens */}
            {isAssistantOpen && activeTab !== 'editor' && !isPresentationOpen && (
              <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-white shadow-2xl z-40 border-l border-slate-200 animate-in slide-in-from-right duration-200">
                <OfflinePedagogyAssistant
                  currentSlide={activeSlide}
                  currentGrade={activeSlideGrade}
                  onInsertToNotes={(text) => {
                    const currentSlide = slides[currentSlideIndex] || slides[0];
                    if (!currentSlide) return;
                    const existing = currentSlide.notes || '';
                    const newNotes = existing ? `${existing}\n\n${text}` : text;
                    const updated = slides.map((s, idx) => idx === currentSlideIndex ? { ...s, notes: newNotes } : s);
                    handleSlidesChange(updated);
                    alert('Đã chèn nội dung vào ghi chú slide hiện tại!');
                  }}
                  onClose={() => setIsAssistantOpen(false)}
                />
              </div>
            )}
          </React.Suspense>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {!isPresentationOpen && (
        <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {/* 3. Floating Teacher Assistant Bubble Button (Bottom Right) */}
      {!isPresentationOpen && !isAssistantOpen && (
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-3 md:px-4 md:py-2.5 rounded-full shadow-xl hover:shadow-2xl border-2 border-white flex items-center gap-2 transition-all transform active:scale-95 group bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white cursor-pointer"
          title="Mở Trợ Giảng Sư Phạm Mĩ Thuật (Cục bộ GDPT 2018)"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 fill-white text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></span>
          </div>
          <span className="text-xs font-black tracking-wide hidden sm:inline">
            Trợ Giảng
          </span>
        </button>
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
