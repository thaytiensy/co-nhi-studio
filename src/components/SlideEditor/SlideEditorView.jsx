import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Monitor, Download, ChevronLeft, ChevronRight, LayoutTemplate, RotateCcw, FileText, Upload } from 'lucide-react';
import SlideThumbnailList from './SlideThumbnailList';
import Toolbar from './Toolbar';
import SlideCanvas from './SlideCanvas';
import SpeakerNotes from './SpeakerNotes';
import PresentationModal from './PresentationModal';
const OfflinePedagogyAssistant = React.lazy(() => import('../Assistant/OfflinePedagogyAssistant'));
const MediaYouTubeModal = React.lazy(() => import('../Media/MediaYouTubeModal'));
import { SLIDE_TEMPLATES } from '../../data/slideTemplates';
import { openSlideInDesktopOffice } from '../../utils/desktopOfficeClient';

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
}) {
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [editorMode, setEditorMode] = useState('onlyoffice');

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

  const handleOpenOnlyOffice = async () => {
    const title = slides?.[0]?.title || 'BaiGiang_MiThuat_GDPT2018';
    await openSlideInDesktopOffice(title, slides, { silent: false });
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* 1. Left Thumbnail List */}
      {!isFocusMode && (
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
      {editorMode === 'onlyoffice' ? (
        <div className="flex-1 flex flex-col min-w-0 bg-slate-900/5 overflow-y-auto">
          {/* Top Bar Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-800/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-white shadow-md select-none shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-base shadow-sm border border-indigo-400/40 shrink-0">
                🖥️
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-xs sm:text-sm text-white tracking-wide">
                    Soạn Thảo PowerPoint (ONLYOFFICE Desktop)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Đã Thay Thế Hẳn Bằng ONLYOFFICE Trên Máy
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-300 truncate">
                  Đã thay thế hoàn toàn bộ công cụ cũ • Dùng ONLYOFFICE làm trình soạn thảo PowerPoint chính
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onUploadDocument && (
                <button
                  type="button"
                  onClick={onUploadDocument}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl border border-emerald-400/50 shadow-md flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
                  title="Đọc mọi tệp tài liệu Office (.pptx, .docx, .xlsx, .pdf) trực tiếp trong app mà không cần cài phần mềm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Mở File Office (.pptx, .docx, .xlsx)</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleOpenOnlyOffice}
                className="px-3.5 py-1.5 text-xs font-black text-indigo-950 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-200 hover:from-amber-200 hover:to-yellow-200 rounded-xl shadow-md flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer ring-2 ring-amber-400/60"
                title="Mở ứng dụng ONLYOFFICE Desktop trên máy tính để soạn bài giảng này với đầy đủ tính năng PowerPoint"
              >
                <Monitor className="w-4 h-4 text-indigo-900" />
                <span className="hidden sm:inline">Mở ONLYOFFICE Trên Máy</span>
                <span className="sm:hidden">ONLYOFFICE</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPresentationOpen(true)}
                className="px-3 py-1.5 text-xs font-black text-white bg-indigo-700 hover:bg-indigo-600 rounded-xl border border-indigo-500/60 shadow-md flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
                title="Trình chiếu toàn màn hình F5 với giọng đọc Thầy giáo"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span className="hidden sm:inline">Trình Chiếu F5</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorMode('canvas')}
                className="px-2.5 py-1.5 text-[11px] font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 flex items-center gap-1 transition-all cursor-pointer"
                title="Chuyển sang bảng vẽ Canvas phụ khi sử dụng trên máy chưa cài ONLYOFFICE"
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Bảng Vẽ Phụ</span>
              </button>
            </div>
          </div>

          {/* Main ONLYOFFICE Hub */}
          <div className="flex-1 p-3 md:p-5 flex flex-col items-center justify-between gap-3 max-w-5xl mx-auto w-full">
            {/* ONLYOFFICE Status Banner Card */}
            <div className="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 text-white border border-indigo-500/30 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-xl shadow-md border-2 border-white/40 shrink-0">
                  🖥️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm md:text-base font-black text-white">
                      Văn Phòng Office & PowerPoint Trực Tiếp Trong App
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                      100% Web • Đọc Mọi File
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 max-w-xl">
                    Đã tích hợp sẵn bộ đọc & soạn bài trực tiếp trong app: Tương thích 100% khi chia sẻ link dùng trên điện thoại, máy tính bảng hoặc máy tính khác. Đọc mọi file PowerPoint (.pptx), Word (.docx), Excel (.xlsx), PDF.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                {onUploadDocument && (
                  <button
                    type="button"
                    onClick={onUploadDocument}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Mở File Mới</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleOpenOnlyOffice}
                  className="px-3.5 py-1.5 text-xs font-black text-indigo-950 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-200 hover:from-amber-200 hover:to-yellow-200 rounded-xl shadow-md flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer ring-2 ring-amber-400"
                >
                  <Monitor className="w-4 h-4 text-indigo-900" />
                  <span>Mở Trên ONLYOFFICE</span>
                </button>
              </div>
            </div>

            {/* Slide Stage 16:9 Clean Viewer */}
            <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-full max-w-3xl aspect-video rounded-2xl shadow-xl overflow-hidden border-2 border-slate-700/40 relative flex flex-col"
                   style={{ backgroundColor: currentSlide?.background || '#ffffff' }}>
                {/* Slide Header Tag */}
                <div className="bg-slate-900/80 backdrop-blur-xs text-white px-3 py-1.5 flex items-center justify-between text-xs font-bold border-b border-white/10 select-none">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    <span>Slide {currentSlideIndex + 1} / {slides.length}: {currentSlide?.title || 'Hoạt Động Bài Giảng'}</span>
                  </span>
                  <span className="text-[10px] text-amber-300">Chuẩn 16:9 GDPT 2018</span>
                </div>

                {/* Slide Elements Preview */}
                <div className="flex-1 p-5 relative overflow-hidden flex flex-col justify-center">
                  {currentSlide?.elements && currentSlide.elements.length > 0 ? (
                    currentSlide.elements.map(el => {
                      if (el.type === 'text') {
                        return (
                          <div
                            key={el.id}
                            style={{
                              fontFamily: el.fontFamily || 'Times New Roman',
                              fontSize: `${Math.max(14, el.fontSize ? Math.round(el.fontSize * 0.75) : 18)}px`,
                              fontWeight: el.fontWeight || 'bold',
                              color: el.color || '#0f172a',
                              textAlign: el.textAlign || 'left'
                            }}
                            className="my-1.5 drop-shadow-xs whitespace-pre-wrap"
                          >
                            {el.text}
                          </div>
                        );
                      }
                      return null;
                    })
                  ) : (
                    <div className="text-center text-slate-400 font-bold text-sm">
                      Slide trống • Mở ONLYOFFICE để thêm nội dung bài giảng
                    </div>
                  )}
                </div>

                {/* Slide Navigation Controls */}
                <div className="bg-slate-900/80 backdrop-blur-xs text-white px-3 py-1.5 flex items-center justify-between text-xs select-none border-t border-white/10">
                  <button
                    type="button"
                    disabled={currentSlideIndex <= 0}
                    onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Trang Trước</span>
                  </button>

                  <span className="font-extrabold text-amber-300 text-xs">
                    Trang {currentSlideIndex + 1} / {slides.length}
                  </span>

                  <button
                    type="button"
                    disabled={currentSlideIndex >= slides.length - 1}
                    onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                  >
                    <span>Trang Tiếp</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Speaker Notes */}
            <div className="w-full">
              <SpeakerNotes
                slide={currentSlide}
                notes={currentSlide?.notes}
                onChangeNotes={handleChangeNotes}
                onOpenAssistant={() => setShowAssistant(prev => !prev)}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
          {/* Header Bảng Vẽ Phụ */}
          <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between text-xs font-bold select-none border-b border-slate-700">
            <span className="flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-amber-400" />
              <span>Chế Độ Bảng Vẽ Canvas Phụ (Dự phòng cho máy chưa cài ONLYOFFICE)</span>
            </span>
            <button
              type="button"
              onClick={() => setEditorMode('onlyoffice')}
              className="px-3 py-1 rounded-lg bg-amber-400 text-slate-900 font-extrabold hover:bg-amber-300 flex items-center gap-1 transition-all cursor-pointer"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Quay Về ONLYOFFICE Desktop (Mặc Định)</span>
            </button>
          </div>

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
        </div>
      )}

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
