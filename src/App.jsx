import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import Header from './components/Header';
import SlideEditorView from './components/SlideEditor/SlideEditorView';
import IdeaWorkshop from './components/IdeaWorkshop/IdeaWorkshop';
import DrawingBoard from './components/DrawingBoard/DrawingBoard';
import ArtGames from './components/ArtGames/ArtGames';
import ArtCameraRubric from './components/ArtCamera/ArtCameraRubric';
import StudentEvaluationSMAS from './components/Evaluation/StudentEvaluationSMAS';
import OfflinePedagogyAssistant from './components/Assistant/OfflinePedagogyAssistant';
import PPTXPreviewModal from './components/SlideEditor/PPTXPreviewModal';
import VideoGuideModal from './components/VideoGuide/VideoGuideModal';
import AdminModal from './components/Admin/AdminModal';
import LoginGateModal from './components/Admin/LoginGateModal';
import InstallAppModal from './components/Install/InstallAppModal';
import { SLIDE_TEMPLATES } from './data/slideTemplates';
import { saveProjectToLocal, loadProjectFromLocal, importProjectFile } from './utils/storageService';
import { exportToPPTX } from './utils/pptxExportService';
import { parsePPTXFile } from './utils/pptxImportService';
import { getAccessErrorMessage, logoutAdmin, resolveCurrentSession, ROLES } from './utils/adminAuthService';
import { auth } from './utils/firebaseClient';
import { Sparkles, MessageCircle } from 'lucide-react';

// Khởi tạo trang slide trắng tinh (App hoàn toàn sạch, không chứa file mẫu có sẵn)
const BLANK_INITIAL_SLIDE = {
  id: 'slide-1',
  title: 'Trang 1',
  background: '#ffffff',
  elements: [],
  notes: '',
};

const INITIAL_SLIDES = [BLANK_INITIAL_SLIDE];

export default function App() {
  const [projectTitle, setProjectTitle] = useState('Bài Giảng Mĩ Thuật');
  const [slides, setSlides] = useState(INITIAL_SLIDES);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideEditorResetKey, setSlideEditorResetKey] = useState(0);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'ideas', 'drawing', 'games', 'camera', 'evaluation'
  const [isSaved, setIsSaved] = useState(true);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
    const [isVideoGuideOpen, setIsVideoGuideOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserSession, setCurrentUserSession] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(!auth);
  const [authError, setAuthError] = useState('');
  const authVersionRef = useRef(0);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // Xử lý đăng xuất tài khoản
  const handleLogout = () => {
    authVersionRef.current += 1;
    void logoutAdmin().catch(() => setAuthError('Không thể hoàn tất đăng xuất Google. Vui lòng thử lại.'));
    setCurrentUserSession(null);
    setIsAdminModalOpen(false);
    setIsAuthenticated(false);
  };

  // Khôi phục phiên Google và xác thực quyền truy cập từ Firestore.
  useEffect(() => {
    if (!auth) {
      return undefined;
    }

    let isActive = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const requestVersion = ++authVersionRef.current;
      const isCurrentRequest = () => isActive
        && requestVersion === authVersionRef.current
        && auth.currentUser?.uid === user?.uid;
      if (!isActive) return;
      if (!user) {
        setIsAuthenticated(false);
        setCurrentUserSession(null);
        setIsAdminModalOpen(false);
        setIsAuthReady(true);
        return;
      }

      setIsAuthReady(false);
      setIsAuthenticated(false);
      setCurrentUserSession(null);
      setIsAdminModalOpen(false);
      try {
        const session = await resolveCurrentSession(user);
        if (!isCurrentRequest()) return;
        if (!session) {
          const email = (user.email || '').trim().toLowerCase();
          throw new Error(`Tài khoản Google ${email || 'đang chọn'} chưa có quyền hoạt động trong Cọ Nhí Studio. Quản trị viên cần cấp đúng địa chỉ này.`);
        }
        setAuthError('');
        setCurrentUserSession(session);
        setIsAuthenticated(true);
        setIsAuthReady(true);
        if (session.role === ROLES.SUB_ADMIN || session.role === ROLES.SUPER_ADMIN) {
          setIsAdminModalOpen(true);
        }
      } catch (error) {
        if (!isCurrentRequest()) return;
        setAuthError(getAccessErrorMessage(error));
        setCurrentUserSession(null);
        setIsAuthenticated(false);
        setIsAuthReady(true);
        await logoutAdmin().catch(() => {});
      }
    });

    return () => {
      isActive = false;
      authVersionRef.current += 1;
      unsubscribe();
    };
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
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')
        && (currentUserSession?.role === ROLES.SUB_ADMIN || currentUserSession?.role === ROLES.SUPER_ADMIN)) {
        e.preventDefault();
        setIsAdminModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentUserSession?.role]);

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

  // Import native .conhi project
  const handleImportProject = async (file) => {
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

  // Generate slides from Idea Workshop
  const handleGenerateSlidesFromIdea = (idea) => {
    const newSlide1 = {
      id: 'slide-idea-1-' + Date.now(),
      background: '#fffbeb',
      elements: [
        {
          id: 't-1',
          type: 'text',
          x: 80,
          y: 120,
          width: 800,
          height: 90,
          text: idea.lessonTitle.toUpperCase(),
          fontSize: 34,
          fontWeight: 'bold',
          color: '#92400e',
          textAlign: 'center'
        },
        {
          id: 't-2',
          type: 'text',
          x: 100,
          y: 230,
          width: 760,
          height: 50,
          text: `Mĩ Thuật Lớp ${idea.grade} • Thời lượng: ${idea.duration} • Vật liệu: ${idea.material}`,
          fontSize: 20,
          fontWeight: 'bold',
          color: '#b45309',
          textAlign: 'center'
        }
      ],
      notes: idea.teachingProcess[0]?.teacherNote || 'Khởi động tiết học vui tươi!',
    };

    const newSlide2 = {
      id: 'slide-idea-2-' + Date.now(),
      background: '#f0fdf4',
      elements: [
        {
          id: 't-obj-h',
          type: 'text',
          x: 60,
          y: 40,
          width: 840,
          height: 45,
          text: 'MỤC TIÊU BÀI HỌC (GDPT 2018)',
          fontSize: 26,
          fontWeight: 'bold',
          color: '#065f46',
          textAlign: 'left'
        },
        {
          id: 't-obj-b',
          type: 'text',
          x: 60,
          y: 110,
          width: 840,
          height: 380,
          text: `• KIẾN THỨC: ${idea.objectives.knowledge}\n\n• KĨ NĂNG: ${idea.objectives.skills}\n\n• PHẨM CHẤT: ${idea.objectives.qualities}`,
          fontSize: 20,
          fontWeight: 'normal',
          color: '#1f2937',
          textAlign: 'left'
        }
      ],
      notes: 'Thầy/Cô đọc rõ yêu cầu cần đạt cho học sinh nắm rõ trước khi bắt đầu thực hành.'
    };

    const newSlide3 = {
      id: 'slide-idea-3-' + Date.now(),
      background: '#faf5ff',
      elements: [
        {
          id: 't-proc-h',
          type: 'text',
          x: 60,
          y: 40,
          width: 840,
          height: 45,
          text: 'TIẾN TRÌNH THỰC HÀNH SÁNG TẠO',
          fontSize: 26,
          fontWeight: 'bold',
          color: '#581c87',
          textAlign: 'left'
        },
        {
          id: 't-proc-b',
          type: 'text',
          x: 60,
          y: 110,
          width: 840,
          height: 380,
          text: idea.teachingProcess.map(p => `${p.name}\n${p.activity}`).join('\n\n'),
          fontSize: 16,
          fontWeight: 'normal',
          color: '#334155',
          textAlign: 'left'
        }
      ],
      notes: 'Hướng dẫn các em thao tác đúng kĩ thuật với chất liệu đã chuẩn bị.'
    };

    const updated = [...slides, newSlide1, newSlide2, newSlide3];
    setSlides(updated);
    setCurrentSlideIndex(slides.length);
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
    const res = await exportToPPTX(projectTitle, slides);
    if (res.success) {
      alert(`${res.message}\n\n✓ ${res.details.supportedElements}\n\nℹ️ ${res.details.limitations}`);
    } else {
      alert('Lỗi xuất PowerPoint: ' + res.error);
    }
  };

  const activeSlide = slides[currentSlideIndex] || slides[0] || null;
  const activeSlideText = [activeSlide?.title, ...(activeSlide?.elements || []).filter(element => element.type === 'text').map(element => element.text)]
    .filter(Boolean)
    .join(' ');
  const gradeMatch = activeSlideText.match(/(?:lớp|khối)\s*([1-5])(?:[A-Za-z]|[\s.,;]|$)/i);
  const activeSlideGrade = gradeMatch ? Number(gradeMatch[1]) : 1;

  // 0. BẢO VỆ MÀN HÌNH KHÓA: HIỆN NGAY KHI MỞ APP (Chặn 100%, không hiển thị app phía sau khi chưa đăng nhập)
  if (!isAuthReady) {
    return <div className="fixed inset-0 flex items-center justify-center bg-slate-950 text-sm font-semibold text-white">Đang kiểm tra phiên đăng nhập…</div>;
  }

  if (!isAuthenticated) {
    return (
      <LoginGateModal
        isOpen={true}
        authError={authError}
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
        onStartPresentation={() => setIsPresentationOpen(true)}
        projectData={{ title: projectTitle, slides }}
        onImportProject={handleImportProject}
        onExportPPTX={handleExportPPTX}
        onUploadPPTX={handleTriggerPPTXUpload}
        onNewProject={handleNewProject}
                onOpenVideoGuide={() => setIsVideoGuideOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        installPrompt={installPrompt}
        isAppInstalled={isAppInstalled}
        userSession={currentUserSession}
        onLogout={handleLogout}
      />

      {/* 2. Main Tab Body */}
      <main className="flex-1 flex overflow-hidden relative">
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

        {activeTab === 'ideas' && (
          <IdeaWorkshop
            onGenerateSlidesFromIdea={handleGenerateSlidesFromIdea}
            onInsertDrawingToSlide={handleInsertDrawingToSlide}
            onNavigateToEditor={() => setActiveTab('editor')}
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
      </main>

      {/* 3. Floating Teacher Assistant Bubble Button (Bottom Right) */}
      {!isPresentationOpen && (
        <button
          onClick={() => setIsAssistantOpen(!isAssistantOpen)}
          className={`fixed bottom-6 right-6 z-40 p-3 md:px-4 md:py-2.5 rounded-full shadow-xl hover:shadow-2xl border-2 border-white flex items-center gap-2 transition-all transform active:scale-95 group ${
            isAssistantOpen 
              ? 'bg-amber-600 text-white ring-2 ring-amber-300' 
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white'
          }`}
          title={isAssistantOpen ? 'Thu gọn khung Trợ Giảng' : 'Mở Trợ Giảng Sư Phạm Mĩ Thuật (Cục bộ GDPT 2018)'}
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 fill-white text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></span>
          </div>
          <span className="text-xs font-black tracking-wide hidden sm:inline">
            {isAssistantOpen ? 'Thu Gọn Trợ Giảng' : 'Trợ Giảng'}
          </span>
        </button>
      )}

      {/* 4. PPTX Import Preview Modal */}
      {pptxPreviewData && (
        <PPTXPreviewModal
          importResult={pptxPreviewData}
          onConfirmOpen={handleConfirmOpenPPTX}
          onClose={() => setPptxPreviewData(null)}
        />
      )}

      {/* 5. Video Guide (7-Minute Presentation) Modal */}
      <VideoGuideModal
        isOpen={isVideoGuideOpen}
        onClose={() => setIsVideoGuideOpen(false)}
      />

      {/* 6. Admin Authentication & Management Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLogout={handleLogout}
        session={currentUserSession}
      />

      {/* 7. Install Application Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        installPrompt={installPrompt}
        isInstalled={isAppInstalled}
      />
    </div>
  );
}
