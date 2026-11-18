import React, { useState, useEffect } from 'react';
import { Play, Upload, ChevronLeft, ChevronRight, FileText, Table, FileSpreadsheet, Presentation } from 'lucide-react';
import SlideThumbnailList from './SlideThumbnailList';
import Toolbar from './Toolbar';
import SlideCanvas from './SlideCanvas';
import SpeakerNotes from './SpeakerNotes';
import PresentationModal from './PresentationModal';
import InAppWordView from '../Office/InAppWordView';
import InAppExcelView from '../Office/InAppExcelView';
import InAppPdfView from '../Office/InAppPdfView';
const OfflinePedagogyAssistant = React.lazy(() => import('../Assistant/OfflinePedagogyAssistant'));
const MediaYouTubeModal = React.lazy(() => import('../Media/MediaYouTubeModal'));
import { SLIDE_TEMPLATES } from '../../data/slideTemplates';

export default function SlideEditorView({
  slides,
  setSlides,
  currentSlideIndex,
  setCurrentSlideIndex,
  onSave,
  isPresentationOpen,
  setIsPresentationOpen,
  showAssistant,
  setShowAssistant,
  onUploadDocument,
  officeSubTab = 'pptx',
  onChangeOfficeSubTab,
  officeDocData,
}) {
  const [internalOfficeTab, setInternalOfficeTab] = useState('pptx');
  const activeOfficeTab = officeSubTab || internalOfficeTab;
  const setOfficeTab = (tab) => {
    setInternalOfficeTab(tab);
    onChangeOfficeSubTab?.(tab);
  };

  const [selectedElementId, setSelectedElementId] = useState(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // History stack for Undo/Redo
  const [history, setHistory] = useState([JSON.stringify(slides)]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const currentSlide = slides[currentSlideIndex] || slides[0];

  // Helper to push history
  const updateSlidesWithHistory = (newSlides) => {
    setSlides(newSlides);
    const serialized = JSON.stringify(newSlides);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(serialized);
    const maxSteps = newSlides.length > 10 ? 8 : 20;
    if (newHistory.length > maxSteps) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (canUndo) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setSlides(JSON.parse(history[prevIndex]));
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setSlides(JSON.parse(history[nextIndex]));
    }
  };

  // Keyboard shortcut for F5 (Presentation), Ctrl+Z (Undo), Ctrl+Y (Redo), Ctrl+S (Save), Delete/Backspace (Delete element)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInputActive = activeTag === 'input' || activeTag === 'textarea';

      if (e.key === 'F5') {
        e.preventDefault();
        setIsPresentationOpen(true);
      } else if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        onSave();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId && !isInputActive) {
        e.preventDefault();
        handleDeleteElement();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedElementId && !isInputActive) {
        e.preventDefault();
        handleDuplicateElement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, historyIndex, history, selectedElementId, currentSlideIndex]);

  // Selected element
  const selectedElement = currentSlide?.elements?.find(el => el.id === selectedElementId);

  // Update selected element
  const handleUpdateElement = (updates) => {
    if (!selectedElementId) return;
    const updatedElements = currentSlide.elements.map(el => {
      if (el.id === selectedElementId) {
        return { ...el, ...updates };
      }
      return el;
    });

    const updatedSlides = slides.map((s, idx) => {
      if (idx === currentSlideIndex) {
        return { ...s, elements: updatedElements };
      }
      return s;
    });

    updateSlidesWithHistory(updatedSlides);
  };

  // Add text element (chuẩn phông chữ Times New Roman và cỡ chữ nhỏ nhất 14)
  const handleAddText = (text = 'Văn bản mới', fontSize = 24, fontWeight = 'normal') => {
    const newEl = {
      id: 'text-' + Date.now(),
      type: 'text',
      x: 100,
      y: 150,
      width: 400,
      height: 70,
      text,
      fontSize: Math.max(14, fontSize),
      fontFamily: 'Times New Roman',
      fontWeight,
      color: '#1e293b',
      textAlign: 'left',
    };

    const updatedElements = [...(currentSlide.elements || []), newEl];
    const updatedSlides = slides.map((s, idx) => {
      if (idx === currentSlideIndex) {
        return { ...s, elements: updatedElements };
      }
      return s;
    });

    updateSlidesWithHistory(updatedSlides);
    setSelectedElementId(newEl.id);
  };

  // Add shape element
  const handleAddShape = (shapeType = 'roundedRect') => {
    const isLine = shapeType === 'line';
    const isWave = shapeType === 'wave';
    const isZigzag = shapeType === 'zigzag';
    const isArc = shapeType === 'arc';
    const isStrokeShape = isLine || isWave || isZigzag || isArc;

    let defaultFill = '#fde68a';
    let defaultStroke = '#d97706';
    let defaultStrokeWidth = 0;
    let defaultW = 160;
    let defaultH = 100;

    if (shapeType === 'circle') {
      defaultFill = 'transparent';
      defaultStroke = '#06b6d4';
      defaultStrokeWidth = 4;
      defaultW = 140;
      defaultH = 140;
    } else if (isStrokeShape) {
      defaultFill = 'transparent';
      defaultStrokeWidth = 5;
      defaultW = 260;
      defaultH = shapeType === 'line' ? 40 : 70;
      if (shapeType === 'line') defaultStroke = '#0284c7';
      else if (shapeType === 'wave') defaultStroke = '#eab308';
      else if (shapeType === 'zigzag') defaultStroke = '#ef4444';
      else if (shapeType === 'arc') defaultStroke = '#a855f7';
    } else if (shapeType === 'triangle') {
      defaultFill = '#10b981';
      defaultStroke = '#059669';
      defaultStrokeWidth = 0;
      defaultW = 150;
      defaultH = 120;
    } else if (shapeType === 'star') {
      defaultFill = '#f59e0b';
      defaultStroke = '#d97706';
      defaultStrokeWidth = 0;
      defaultW = 140;
      defaultH = 140;
    } else if (shapeType === 'arrow') {
      defaultFill = '#6366f1';
      defaultStroke = '#4f46e5';
      defaultStrokeWidth = 0;
      defaultW = 180;
      defaultH = 80;
    }

    const newEl = {
      id: 'shape-' + Date.now(),
      type: 'shape',
      shapeType,
      x: 200,
      y: 150,
      width: defaultW,
      height: defaultH,
      fill: defaultFill,
      stroke: defaultStroke,
      strokeWidth: defaultStrokeWidth,
      strokeDash: undefined,
      opacity: 1,
    };

    const updatedElements = [...(currentSlide.elements || []), newEl];
    const updatedSlides = slides.map((s, idx) => {
      if (idx === currentSlideIndex) {
        return { ...s, elements: updatedElements };
      }
      return s;
    });

    updateSlidesWithHistory(updatedSlides);
    setSelectedElementId(newEl.id);
  };

  // Add image element
  const handleAddImage = (imageSrc) => {
    const newEl = {
      id: 'img-' + Date.now(),
      type: 'image',
      x: 150,
      y: 100,
      width: 320,
      height: 240,
      src: imageSrc,
    };

    const updatedElements = [...(currentSlide.elements || []), newEl];
    const updatedSlides = slides.map((s, idx) => {
      if (idx === currentSlideIndex) {
        return { ...s, elements: updatedElements };
      }
      return s;
    });

    updateSlidesWithHistory(updatedSlides);
    setSelectedElementId(newEl.id);
  };

  // Add Audio
  const handleAddAudio = (audioUrl, fileName) => {
    const newEl = {
      id: 'audio-' + Date.now(),
      type: 'audio',
      x: 100,
      y: 150,
      width: 320,
      height: 80,
      src: audioUrl,
      title: fileName || 'Nhạc Nền Mĩ Thuật',
    };
    const updatedElements = [...(currentSlide.elements || []), newEl];
    const updatedSlides = slides.map((s, idx) => {
      if (idx === currentSlideIndex) {
        return { ...s, elements: updatedElements };
      }
      return s;
    });
    updateSlidesWithHistory(updatedSlides);
    setSelectedElementId(newEl.id);
  };

  // Add Video
  const handleAddVideo = (videoUrl, fileName) => {
    const newEl = {
      id: 'video-' + Date.now(),
      type: 'video',
      x: 120,
      y: 90,
      width: 480,
      height: 270,
      src: videoUrl,
      title: fileName || 'Video Minh Họa',
    };
    const updatedElements = [...(currentSlide.elements || []), newEl];
    const updatedSlides = slides.map((s, idx) => {
      if (idx === currentSlideIndex) {
        return { ...s, elements: updatedElements };
      }
      return s;
    });
    updateSlidesWithHistory(updatedSlides);
    setSelectedElementId(newEl.id);
  };

  // Add YouTube
  const handleAddYouTube = (embedUrl) => {
    const newEl = {
      id: 'yt-' + Date.now(),
      type: 'youtube',
      x: 120,
      y: 90,
      width: 480,
      height: 270,
      src: embedUrl,
    };
    const updatedElements = [...(currentSlide.elements || []), newEl];
    const updatedSlides = slides.map((s, idx) => {
      if (idx === currentSlideIndex) {
        return { ...s, elements: updatedElements };
      }
      return s;
    });
    updateSlidesWithHistory(updatedSlides);
    setSelectedElementId(newEl.id);
  };

  // Duplicate element (PowerPoint Ctrl+D)
  const handleDuplicateElement = (idToDup) => {
    const targetId = idToDup || selectedElementId;
    if (!targetId || !currentSlide?.elements) return;
    const el = currentSlide.elements.find(e => e.id === targetId);
    if (!el) return;

    const duplicated = {
      ...JSON.parse(JSON.stringify(el)),
      id: `${el.type || 'el'}-${Date.now()}`,
      x: Math.min(CANVAS_WIDTH - (el.width || 100), (el.x || 0) + 24),
      y: Math.min(CANVAS_HEIGHT - (el.height || 100), (el.y || 0) + 24),
    };

    const updatedElements = [...currentSlide.elements, duplicated];
    const updatedSlides = slides.map((s, idx) => {
      if (idx === currentSlideIndex) {
        return { ...s, elements: updatedElements };
      }
      return s;
    });

    updateSlidesWithHistory(updatedSlides);
    setSelectedElementId(duplicated.id);
  };

  // Delete element
  const handleDeleteElement = (idToDelete) => {
    const targetId = idToDelete || selectedElementId;
    if (!targetId || !currentSlide?.elements) return;
    const updatedElements = currentSlide.elements.filter(el => el.id !== targetId);
    const updatedSlides = slides.map((s, idx) => {
      if (idx === currentSlideIndex) {
        return { ...s, elements: updatedElements };
      }
      return s;
    });

    updateSlidesWithHistory(updatedSlides);
    if (selectedElementId === targetId) {
      setSelectedElementId(null);
    }
  };

  // Reorder element (front / back)
  const handleReorderElement = (direction = 'front') => {
    if (!selectedElementId) return;
    const el = currentSlide.elements.find(e => e.id === selectedElementId);
    if (!el) return;

    const remaining = currentSlide.elements.filter(e => e.id !== selectedElementId);
    const updatedElements = direction === 'front' ? [...remaining, el] : [el, ...remaining];

    const updatedSlides = slides.map((s, idx) => {
      if (idx === currentSlideIndex) {
        return { ...s, elements: updatedElements };
      }
      return s;
    });

    updateSlidesWithHistory(updatedSlides);
  };

  // Change background of current slide
  const handleChangeBackground = (newBackground) => {
    const updatedSlides = slides.map((s, idx) => {
      if (idx === currentSlideIndex) {
        return { ...s, background: newBackground };
      }
      return s;
    });

    updateSlidesWithHistory(updatedSlides);
  };

  // Update speaker notes
  const handleChangeNotes = (notes) => {
    const updatedSlides = slides.map((s, idx) => {
      if (idx === currentSlideIndex) {
        return { ...s, notes };
      }
      return s;
    });
    setSlides(updatedSlides);
  };

  // Add blank slide
  const handleAddSlide = () => {
    const newSlide = {
      id: 'slide-' + Date.now(),
      background: '#ffffff',
      elements: [
        {
          id: 'title-' + Date.now(),
          type: 'text',
          x: 80,
          y: 40,
          width: 800,
          height: 60,
          text: 'Tiêu Đề Trang Bài Học',
          fontSize: 28,
          fontWeight: 'bold',
          color: '#1e293b',
          textAlign: 'left',
        }
      ],
      notes: '',
    };

    const newSlides = [...slides, newSlide];
    updateSlidesWithHistory(newSlides);
    setCurrentSlideIndex(newSlides.length - 1);
  };

  // Add slide from template
  const handleAddSlideFromTemplate = (template) => {
    const newSlide = {
      id: 'slide-' + Date.now(),
      background: template.background || '#ffffff',
      elements: JSON.parse(JSON.stringify(template.elements)),
      notes: template.notes || '',
    };

    const newSlides = [...slides, newSlide];
    updateSlidesWithHistory(newSlides);
    setCurrentSlideIndex(newSlides.length - 1);
  };

  // Duplicate slide
  const handleDuplicateSlide = (index) => {
    const target = slides[index];
    const duplicated = {
      ...JSON.parse(JSON.stringify(target)),
      id: 'slide-' + Date.now(),
    };

    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, duplicated);
    updateSlidesWithHistory(newSlides);
    setCurrentSlideIndex(index + 1);
  };

  // Delete slide
  const handleDeleteSlide = (index) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, idx) => idx !== index);
    updateSlidesWithHistory(newSlides);
    const nextIndex = index < currentSlideIndex
      ? currentSlideIndex - 1
      : index === currentSlideIndex
        ? Math.min(currentSlideIndex, newSlides.length - 1)
        : currentSlideIndex;
    setCurrentSlideIndex(nextIndex);
  };

  // Move slide (reorder)
  const handleMoveSlide = (fromIndex, toIndex) => {
    const newSlides = [...slides];
    const [moved] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, moved);
    updateSlidesWithHistory(newSlides);
    setCurrentSlideIndex(toIndex);
  };

  // Insert text into notes from Assistant
  const handleInsertToNotes = (text) => {
    const existing = currentSlide.notes || '';
    const newNotes = existing ? `${existing}\n\n${text}` : text;
    handleChangeNotes(newNotes);
  };

  // Enlarge all text elements in current slide by +4pt
  const handleEnlargeSlideText = () => {
    if (!currentSlide?.elements) return;
    const updatedElements = currentSlide.elements.map(el => {
      if (el.type === 'text') {
        const currentSize = el.fontSize || 22;
        return { ...el, fontSize: Math.min(currentSize + 4, 72) };
      }
      return el;
    });
    const updatedSlides = slides.map((s, idx) => {
      if (idx === currentSlideIndex) {
        return { ...s, elements: updatedElements };
      }
      return s;
    });
    updateSlidesWithHistory(updatedSlides);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* 1. Left Thumbnail List (only visible in PowerPoint mode) */}
      {!isFocusMode && activeOfficeTab === 'pptx' && (
        <SlideThumbnailList
          slides={slides}
          currentSlideIndex={currentSlideIndex}
          onSelectSlide={(idx) => {
            setCurrentSlideIndex(idx);
            setSelectedElementId(null);
          }}
          onAddSlide={handleAddSlide}
          onAddSlideFromTemplate={handleAddSlideFromTemplate}
          onDuplicateSlide={handleDuplicateSlide}
          onDeleteSlide={handleDeleteSlide}
          onMoveSlide={handleMoveSlide}
        />
      )}

      {/* 2. Middle Editor Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100 overflow-hidden">
        {/* Top Control Bar: Compact & Neat Office Suite Switcher */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 text-white shadow-xs select-none shrink-0">
          {/* Office Suite Tabs Switcher */}
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setOfficeTab('pptx')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeOfficeTab === 'pptx'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
              title="Trình Soạn Giảng & Chiếu PowerPoint 16:9"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>PowerPoint</span>
            </button>
            <button
              type="button"
              onClick={() => setOfficeTab('docx')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeOfficeTab === 'docx'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
              title="Kế Hoạch Bài Dạy Word (Chuẩn CV 2345)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Giáo Án Word</span>
            </button>
            <button
              type="button"
              onClick={() => setOfficeTab('xlsx')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeOfficeTab === 'xlsx'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
              title="Bảng Tính Excel & Sổ Điểm SMAS (Chuẩn TT27)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Sổ Điểm Excel</span>
            </button>
            <button
              type="button"
              onClick={() => setOfficeTab('pdf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeOfficeTab === 'pdf'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
              title="Trình Đọc Tài Liệu & Sách Giáo Khoa PDF"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tài Liệu PDF</span>
            </button>
          </div>

          {/* Context Controls */}
          {activeOfficeTab === 'pptx' ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
                <button
                  type="button"
                  disabled={currentSlideIndex <= 0}
                  onClick={() => {
                    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
                    setSelectedElementId(null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2.5 py-0.5 text-xs font-black text-amber-300 tracking-wide select-none">
                  Trang {currentSlideIndex + 1} / {slides.length}
                </span>
                <button
                  type="button"
                  disabled={currentSlideIndex >= slides.length - 1}
                  onClick={() => {
                    setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1));
                    setSelectedElementId(null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Trang tiếp"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs font-bold text-slate-200 truncate max-w-[200px] sm:max-w-xs" title={currentSlide?.title}>
                {currentSlide?.title || `Trang ${currentSlideIndex + 1}`}
              </span>

              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                16:9 GDPT 2018
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">
                {activeOfficeTab === 'docx' && 'Soạn & Xem Giáo Án Word (CV 2345)'}
                {activeOfficeTab === 'xlsx' && 'Bảng Tính Excel & Nhập Điểm SMAS (TT 27)'}
                {activeOfficeTab === 'pdf' && 'Tài Liệu Mĩ Thuật GDPT 2018 (PDF)'}
              </span>
            </div>
          )}
        </div>

        {/* Workspace Display Based on Active Office Tab */}
        {activeOfficeTab === 'pptx' && (
          <>
            {/* Ribbon Toolbar */}
            <Toolbar
              selectedElement={selectedElement}
              onUpdateElement={handleUpdateElement}
              onAddText={handleAddText}
              onAddShape={handleAddShape}
              onAddImage={handleAddImage}
              onDeleteElement={handleDeleteElement}
              onDuplicateElement={handleDuplicateElement}
              onReorderElement={handleReorderElement}
              slideBackground={currentSlide?.background}
              onChangeBackground={handleChangeBackground}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onOpenMediaModal={() => setShowMediaModal(true)}
              onEnlargeSlideText={handleEnlargeSlideText}
              isFocusMode={isFocusMode}
              onToggleFocusMode={() => setIsFocusMode(prev => !prev)}
            />

            {/* 16:9 Canvas Area */}
            <SlideCanvas
              slide={currentSlide}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              onUpdateElement={handleUpdateElement}
              onDeleteElement={handleDeleteElement}
              onReorderElement={handleReorderElement}
              onDeselect={() => setSelectedElementId(null)}
            />

            {/* Speaker Notes Bar */}
            <SpeakerNotes
              slide={currentSlide}
              notes={currentSlide?.notes}
              onChangeNotes={handleChangeNotes}
              onOpenAssistant={() => setShowAssistant(prev => !prev)}
            />
          </>
        )}

        {activeOfficeTab === 'docx' && (
          <InAppWordView
            docData={officeDocData}
            onUploadDocx={onUploadDocument}
          />
        )}

        {activeOfficeTab === 'xlsx' && (
          <InAppExcelView
            docData={officeDocData}
            onUploadExcel={onUploadDocument}
          />
        )}

        {activeOfficeTab === 'pdf' && (
          <InAppPdfView
            docData={officeDocData}
            onUploadPdf={onUploadDocument}
          />
        )}
      </div>

      {/* 4. Fullscreen Presentation Modal */}
      {isPresentationOpen && (
        <PresentationModal
          slides={slides}
          initialSlideIndex={currentSlideIndex}
          projectTitle={slides?.[0]?.title || 'Bài Giảng Mĩ Thuật'}
          onClose={() => setIsPresentationOpen(false)}
        />
      )}
      {/* 5. Media & YouTube Modal */}
      {showMediaModal && (
        <React.Suspense fallback={null}>
          <MediaYouTubeModal
            currentThemeTitle={currentSlide?.elements?.find(e => e.type === 'text')?.text || 'Mĩ Thuật'}
            onInsertAudio={handleAddAudio}
            onInsertVideo={handleAddVideo}
            onInsertYouTube={handleAddYouTube}
            onClose={() => setShowMediaModal(false)}
          />
        </React.Suspense>
      )}
    </div>
  );
}
