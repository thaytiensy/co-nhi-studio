import React, { useState, useEffect, useRef } from 'react';
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
import { isUserAuthenticated, logoutAdmin } from './utils/adminAuthService';
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
  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'ideas', 'drawing', 'games', 'camera', 'evaluation'
  const [isSaved, setIsSaved] = useState(true);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
    const [isVideoGuideOpen, setIsVideoGuideOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // Unified Assistant Open State across all screens
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // PPTX Import states
  const [pptxPreviewData, setPptxPreviewData] = useState(null);
  const [isImportingPPTX, setIsImportingPPTX] = useState(false);
  const pptxFileInputRef = useRef(null);

  // Listener bắt sự kiện cài đặt PWA và phím tắt quản trị
  useEffect(() => {
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
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
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
  }, []);

  // Load from local storage on initial mount (loại bỏ dữ liệu mẫu cũ nếu có để app luôn trắng)
  useEffect(() => {
    const saved = loadProjectFromLocal();
    if (saved && saved.slides && saved.slides.length > 0) {
      const isOldSample = saved.slides.some(s => s.id && String(s.id).startsWith('slide-init-'));
      if (!isOldSample) {
        setSlides(saved.slides);
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
      saveProjectToLocal({ title: 'Bài Giảng Mĩ Thuật', slides: blank });
      setIsSaved(true);
    }
  };

  // Mark unsaved on slides change
  const handleSlidesChange = (newSlides) => {
    setSlides(newSlides);
    setIsSaved(false);
  };

  // Manual & Auto Save
  const handleSave = () => {
    const payload = {
      title: projectTitle,
      slides,
    };
    const res = saveProjectToLocal(payload);
    if (res.success) {
      setIsSaved(true);
    }
  };

  // Import native .conhi project
  const handleImportProject = async (file) => {
    try {
      const data = await importProjectFile(file);
      if (data.slides) {
        setSlides(data.slides);
        setCurrentSlideIndex(0);
        if (data.title) setProjectTitle(data.title);
        setIsSaved(true);
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

  // 0. BẢO VỆ MÀN HÌNH KHÓA: HIỆN NGAY KHI MỞ APP (Chặn 100%, không hiển thị app phía sau khi chưa đăng nhập)
  if (!isAuthenticated) {
    return (
      <LoginGateModal
        isOpen={true}
        onLoginSuccess={() => {
          setIsAuthenticated(true);
        }}
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
      />

      {/* 2. Main Tab Body */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeTab === 'editor' && (
          <SlideEditorView
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
              currentGrade={1}
              onInsertToNotes={(text) => {
                const currentSlide = slides[currentSlideIndex];
                const existing = currentSlide.notes || '';
                const newNotes = existing ? `${existing}\n\n${text}` : text;
                const updated = slides.map((s, idx) => idx === currentSlideIndex ? { ...s, notes: newNotes } : s);
                setSlides(updated);
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
            {isAssistantOpen ? 'Thu Gọn Trợ Giảng' : 'Trợ Giảng (Offline)'}
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
        onLogout={() => {
          setIsAdminModalOpen(false);
          setIsAuthenticated(false);
        }}
      />

      {/* 7. Install Application Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        installPrompt={installPrompt}
        isInstalled={isAppInstalled}
      />

      {/* 8. Full-screen Login Gate (Hiện ngay lập tức khi mở app nếu chưa đăng nhập) */}
      <LoginGateModal
        isOpen={!isAuthenticated}
        onLoginSuccess={() => {
          setIsAuthenticated(true);
        }}
      />
    </div>
  );
}
