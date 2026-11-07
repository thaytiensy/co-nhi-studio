import React, { useState, useEffect } from 'react';
import SlideThumbnailList from './SlideThumbnailList';
import Toolbar from './Toolbar';
import SlideCanvas from './SlideCanvas';
import SpeakerNotes from './SpeakerNotes';
const OfflinePedagogyAssistant = React.lazy(() => import('../Assistant/OfflinePedagogyAssistant'));
const PresentationModal = React.lazy(() => import('./PresentationModal'));
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
}) {
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [showMediaModal, setShowMediaModal] = useState(false);

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
    if (newHistory.length > 30) newHistory.shift(); // Limit to 30 steps
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

  // Add text element
  const handleAddText = (text = 'Văn bản mới', fontSize = 24, fontWeight = 'normal') => {
    const newEl = {
      id: 'text-' + Date.now(),
      type: 'text',
      x: 100,
      y: 150,
      width: 400,
      height: 70,
      text,
      fontSize,
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
    const newEl = {
      id: 'shape-' + Date.now(),
      type: 'shape',
      shapeType,
      x: 200,
      y: 150,
      width: shapeType === 'circle' ? 140 : 160,
      height: shapeType === 'circle' ? 140 : 100,
      fill: shapeType === 'triangle' ? '#10b981' : shapeType === 'star' ? '#f59e0b' : shapeType === 'arrow' ? '#6366f1' : '#fde68a',
      stroke: '#d97706',
      strokeWidth: 0,
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

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* 1. Left Thumbnail List */}
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

      {/* 2. Middle Editor Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
        {/* Ribbon Toolbar */}
        <Toolbar
          selectedElement={selectedElement}
          onUpdateElement={handleUpdateElement}
          onAddText={handleAddText}
          onAddShape={handleAddShape}
          onAddImage={handleAddImage}
          onDeleteElement={handleDeleteElement}
          onReorderElement={handleReorderElement}
          slideBackground={currentSlide?.background}
          onChangeBackground={handleChangeBackground}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onOpenMediaModal={() => setShowMediaModal(true)}
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
          onOpenAssistant={() => setShowAssistant(true)}
        />
      </div>

      {/* 3. Right Collapsible Offline Assistant Sidebar */}
      {showAssistant && (
        <div className="w-80 shrink-0 h-full">
          <React.Suspense fallback={<div className="p-6 text-sm text-slate-400 text-center">Đang tải Trợ giảng...</div>}>
            <OfflinePedagogyAssistant
              currentSlide={currentSlide}
              currentGrade={1}
              onInsertToNotes={handleInsertToNotes}
              onClose={() => setShowAssistant(false)}
            />
          </React.Suspense>
        </div>
      )}

      {/* 4. Fullscreen Presentation Modal */}
      {isPresentationOpen && (
        <React.Suspense fallback={null}>
          <PresentationModal
            slides={slides}
            initialSlideIndex={currentSlideIndex}
            onClose={() => setIsPresentationOpen(false)}
          />
        </React.Suspense>
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
