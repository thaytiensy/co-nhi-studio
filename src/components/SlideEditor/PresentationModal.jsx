import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Volume2, 
  Maximize, 
  Minimize, 
  Clock, 
  FileText,
  Play,
  Pause,
  Gamepad2,
  Sparkles
} from 'lucide-react';
import { speechService } from '../../utils/speechService';
import SlideGameWidget from '../ArtGames/SlideGameWidget';
import { generateGameQuestionsByTheme } from '../../data/artGamesCurriculumBank';

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

export default function PresentationModal({
  slides,
  initialSlideIndex = 0,
  onClose
}) {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [scale, setScale] = useState(1);
  const [showNotesOverlay, setShowNotesOverlay] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [speechState, setSpeechState] = useState({ isSpeaking: false, isPaused: false });
  const containerRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  // Timer for lesson duration
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Subscribe to speech state
  useEffect(() => {
    const unsubscribe = speechService.subscribe(setSpeechState);
    return () => {
      unsubscribe();
      speechService.stop();
    };
  }, []);

  // Calculate 16:9 responsive scale
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const scaleX = clientWidth / CANVAS_WIDTH;
      const scaleY = clientHeight / CANVAS_HEIGHT;
      setScale(Math.min(scaleX, scaleY));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Keyboard Navigation: Esc, ArrowLeft, ArrowRight, Space
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showGameModal) {
          setShowGameModal(false);
          return;
        }
        speechService.stop();
        onClose();
      } else if (!showGameModal) {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
          goToNext();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          goToPrev();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, slides.length, showGameModal]);

  const goToNext = () => {
    if (currentIndex < slides.length - 1) {
      speechService.stop();
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      speechService.stop();
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleMouseMove = () => {
    setControlsVisible(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3500);
  };

  const currentSlide = slides[currentIndex] || slides[0];

  // Helper trích xuất lời giảng phù hợp nhất để đọc (ưu tiên nội dung sư phạm, loại bỏ thông tin bản quyền mẫu)
  const getLectureTextToSpeak = () => {
    const isWatermark = (txt) => {
      if (!txt) return true;
      const lower = txt.toLowerCase();
      return (
        lower.includes('thiết kế') || 
        lower.includes('zalo') || 
        lower.includes('097') || 
        lower.includes('098') || 
        lower.includes('090') || 
        lower.includes('091') || 
        lower.includes('096') || 
        lower.includes('086') || 
        lower.includes('hương thảo') ||
        lower.includes('template')
      );
    };

    const parts = [];
    if (currentSlide?.title && currentSlide.title.trim() && !currentSlide.title.startsWith('Trang ') && !isWatermark(currentSlide.title)) {
      parts.push(`Tiêu đề: ${currentSlide.title.trim()}`);
    }

    (currentSlide?.elements || []).forEach(el => {
      if ((el.type === 'text' || el.type === 'shape') && el.text?.trim()) {
        if (!isWatermark(el.text)) {
          parts.push(el.text.trim());
        }
      }
    });

    const slideText = parts.join('. ');

    // Nếu ghi chú có nội dung thực thụ (không phải watermark), đọc ghi chú
    if (currentSlide?.notes && currentSlide.notes.trim() && !isWatermark(currentSlide.notes)) {
      return currentSlide.notes.trim();
    }

    // Nếu ghi chú trống hoặc là watermark mẫu, đọc nội dung câu chữ trên slide
    if (slideText) {
      return slideText;
    }

    return `Trang ${currentIndex + 1}. Mời các em học sinh chú ý quan sát nội dung trên màn hình và làm theo hướng dẫn của Thầy Cô.`;
  };

  const handleToggleSpeak = () => {
    if (speechState.isSpeaking) {
      if (speechState.isPaused) {
        speechService.resume();
      } else {
        speechService.pause();
      }
    } else {
      const text = getLectureTextToSpeak();
      const res = speechService.speak(text);
      if (res && !res.success) {
        console.warn('Lỗi đọc lời giảng:', res.error);
      }
    }
  };

  // Trích xuất chủ đề từ slide hiện tại để tạo trò chơi tức thời nếu cần
  const getSlideTheme = () => {
    const textEl = currentSlide?.elements?.find(e => e.type === 'text' && e.text?.trim());
    if (textEl) return textEl.text.split('\n')[0].slice(0, 40).trim();
    return 'Mĩ Thuật Sáng Tạo';
  };

  const currentSlideGame = currentSlide?.elements?.find(e => e.type === 'game');
  const fallbackGameQuestions = generateGameQuestionsByTheme(1, getSlideTheme(), 'all');

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center select-none overflow-hidden cursor-default"
    >
      {/* 16:9 Presentation Slide Canvas */}
      <div
        className="relative overflow-hidden shadow-2xl transition-all"
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          backgroundColor: currentSlide?.background || '#ffffff',
        }}
      >
        {currentSlide?.elements?.map((el) => {
          if (el.type === 'text') {
            return (
              <div
                key={el.id}
                className="absolute break-words select-none pointer-events-none"
                style={{
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  width: `${el.width}px`,
                  fontSize: `${el.fontSize || 16}px`,
                  fontWeight: el.fontWeight || 'normal',
                  fontStyle: el.fontStyle || 'normal',
                  color: el.color || '#000000',
                  textAlign: el.textAlign || 'left',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.25,
                }}
              >
                {el.text}
              </div>
            );
          }

          if (el.type === 'shape') {
            return (
              <div
                key={el.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  width: `${el.width}px`,
                  height: `${el.height}px`,
                }}
              >
                {el.shapeType === 'circle' ? (
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      backgroundColor: el.fill || '#3b82f6',
                      border: el.stroke ? `${el.strokeWidth || 2}px solid ${el.stroke}` : 'none',
                      opacity: el.opacity ?? 1,
                    }}
                  />
                ) : el.shapeType === 'triangle' ? (
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polygon
                      points="50,5 95,95 5,95"
                      fill={el.fill || '#10b981'}
                      stroke={el.stroke || 'none'}
                      strokeWidth={el.strokeWidth || 0}
                      opacity={el.opacity ?? 1}
                    />
                  </svg>
                ) : el.shapeType === 'star' ? (
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polygon
                      points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36"
                      fill={el.fill || '#f59e0b'}
                      stroke={el.stroke || 'none'}
                      strokeWidth={el.strokeWidth || 0}
                      opacity={el.opacity ?? 1}
                    />
                  </svg>
                ) : el.shapeType === 'arrow' ? (
                  <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
                    <polygon
                      points="0,20 60,20 60,0 100,30 60,60 60,40 0,40"
                      fill={el.fill || '#6366f1'}
                      stroke={el.stroke || 'none'}
                      strokeWidth={el.strokeWidth || 0}
                      opacity={el.opacity ?? 1}
                    />
                  </svg>
                ) : (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundColor: el.fill || '#f1f5f9',
                      borderRadius: el.shapeType === 'roundedRect' ? '16px' : '4px',
                      border: el.stroke ? `${el.strokeWidth || 2}px solid ${el.stroke}` : 'none',
                      opacity: el.opacity ?? 1,
                    }}
                  />
                )}
              </div>
            );
          }

          if (el.type === 'image') {
            return (
              <img
                key={el.id}
                src={el.src}
                alt=""
                className={`absolute ${el.isBackground ? 'object-cover' : 'object-fill'} pointer-events-none select-none rounded`}
                style={{
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  width: `${el.width}px`,
                  height: `${el.height}px`,
                }}
              />
            );
          }

          if (el.type === 'audio') {
            return (
              <div
                key={el.id}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute bg-emerald-50/95 border-2 border-emerald-400 rounded-xl p-2.5 flex flex-col justify-center items-center shadow-lg z-30 pointer-events-auto backdrop-blur-xs"
                style={{
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  width: `${el.width}px`,
                  height: `${el.height}px`,
                }}
              >
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 truncate mb-1">
                  <span>🎵</span>
                  <span className="truncate">{el.title || 'Nhạc Nền Tiết Học'}</span>
                </div>
                <audio controls src={el.src} className="w-full h-8" />
              </div>
            );
          }

          if (el.type === 'video') {
            return (
              <div
                key={el.id}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute bg-black rounded-xl overflow-hidden shadow-2xl z-30 pointer-events-auto flex items-center justify-center group"
                style={{
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  width: `${el.width}px`,
                  height: `${el.height}px`,
                }}
              >
                <video 
                  controls 
                  playsInline
                  poster={el.poster}
                  src={el.src} 
                  className="w-full h-full object-contain" 
                />
              </div>
            );
          }

          if (el.type === 'youtube') {
            return (
              <div
                key={el.id}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute bg-slate-900 rounded-xl overflow-hidden shadow-2xl z-30 pointer-events-auto"
                style={{
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  width: `${el.width}px`,
                  height: `${el.height}px`,
                }}
              >
                <iframe
                  src={el.src}
                  title="YouTube Video"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            );
          }

          // Trình hiển thị TRÒ CHƠI MĨ THUẬT ngay trong slide
          if (el.type === 'game') {
            return (
              <div
                key={el.id}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute z-35 pointer-events-auto"
                style={{
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  width: `${el.width}px`,
                  height: `${el.height}px`,
                }}
              >
                <SlideGameWidget element={el} isPresentationMode={true} />
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Floating Side Arrow Buttons - Đặt ở rìa màn hình ngoài Canvas, KHÔNG che Canvas và KHÔNG cướp click của Video */}
      <button
        onClick={goToPrev}
        disabled={currentIndex === 0}
        className={`fixed left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md shadow-2xl z-40 transition-all ${
          currentIndex === 0 ? 'opacity-20 cursor-not-allowed pointer-events-none' : 'opacity-70 hover:opacity-100 hover:scale-110'
        }`}
        title="Lùi về slide trước (Phím Mũi Tên Trái)"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={goToNext}
        disabled={currentIndex === slides.length - 1}
        className={`fixed right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md shadow-2xl z-40 transition-all ${
          currentIndex === slides.length - 1 ? 'opacity-20 cursor-not-allowed pointer-events-none' : 'opacity-70 hover:opacity-100 hover:scale-110'
        }`}
        title="Sang slide kế tiếp (Phím Mũi Tên Phải hoặc Phím Cách)"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Floating Presentation Control Bar */}
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-3.5 z-40 transition-all duration-300 border border-slate-700/60 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Lesson Timer */}
        <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono font-bold pr-2 border-r border-slate-700">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTime(elapsedSeconds)}</span>
        </div>

        {/* Slide Counter */}
        <span className="text-xs font-bold text-slate-300">
          {currentIndex + 1} / {slides.length}
        </span>

        {/* Prev / Next buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className={`p-1.5 rounded-full transition-all ${
              currentIndex === 0 ? 'text-slate-600 cursor-not-allowed' : 'hover:bg-slate-700 text-white'
            }`}
            title="Lùi lại (Mũi tên Trái)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex === slides.length - 1}
            className={`p-1.5 rounded-full transition-all ${
              currentIndex === slides.length - 1 ? 'text-slate-600 cursor-not-allowed' : 'hover:bg-slate-700 text-white'
            }`}
            title="Tiến lên (Mũi tên Phải hoặc Phím Cách)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Chuyển đổi Giọng Thầy giáo / Cô giáo */}
        <button
          onClick={() => {
            const nextGender = speechState.gender === 'female' ? 'male' : 'female';
            speechService.setGender(nextGender);
          }}
          className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 transition-all border border-slate-700 flex items-center gap-1"
          title="Bấm để đổi giữa giọng đọc Thầy giáo (Nam) và Cô giáo (Nữ)"
        >
          <span>{speechState.gender === 'female' ? '👩 Cô (Nữ)' : '👨 Thầy (Nam)'}</span>
        </button>

        {/* Audio Teacher Speech Button - KHÔNG BAO GIỜ BỊ VÔ HIỆU */}
        <button
          onClick={handleToggleSpeak}
          className={`px-3 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 transition-all shadow-xs ${
            speechState.isSpeaking && !speechState.isPaused
              ? 'bg-amber-500 text-white animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
          title="Đọc lời giảng của trang slide này"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>{speechState.isSpeaking && !speechState.isPaused ? 'Tạm dừng' : 'Đọc lời giảng'}</span>
        </button>

        {/* Nút Mở Trò Chơi Mĩ Thuật Trực Tiếp Trong Tiết Học */}
        <button
          onClick={() => setShowGameModal(true)}
          className="px-3 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all"
          title="Mở trò chơi mĩ thuật tương tác cho cả lớp cùng tham gia"
        >
          <Gamepad2 className="w-3.5 h-3.5 text-amber-300" />
          <span>🎮 Trò Chơi</span>
        </button>

        {/* Toggle Notes Overlay */}
        <button
          onClick={() => setShowNotesOverlay(!showNotesOverlay)}
          className={`p-1.5 rounded-full hover:bg-slate-700 transition-all ${
            showNotesOverlay ? 'text-amber-400 bg-slate-800' : 'text-slate-300'
          }`}
          title="Xem ghi chú sư phạm của trang này"
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Close Presentation (Esc) */}
        <button
          onClick={() => {
            speechService.stop();
            onClose();
          }}
          className="p-1.5 rounded-full hover:bg-rose-600 text-slate-300 hover:text-white transition-all ml-1"
          title="Thoát trình chiếu (Phím Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Speaker Notes Floating Overlay (Optional for Teacher) */}
      {showNotesOverlay && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 max-w-xl w-full bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-4 text-white shadow-2xl z-45 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <span>📝</span> Lời Giảng Sư Phạm Trang {currentIndex + 1}
            </span>
            <button 
              onClick={() => setShowNotesOverlay(false)}
              className="text-slate-400 hover:text-white text-xs font-bold px-2 py-0.5 rounded hover:bg-slate-800"
            >
              ✕ Đóng
            </button>
          </div>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
            {currentSlide?.notes || '(Trang này chưa có ghi chú lời giảng riêng. Hệ thống sẽ đọc tiêu đề và nội dung chữ hiển thị trên slide)'}
          </p>
        </div>
      )}

      {/* Modal Trò Chơi Nổi Trong Giờ Trình Chiếu */}
      {showGameModal && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in"
          onClick={() => setShowGameModal(false)}
        >
          <div 
            className="w-full max-w-3xl h-[560px] bg-white rounded-2xl shadow-2xl overflow-hidden relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-3 right-3 z-50">
              <button
                onClick={() => setShowGameModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-900 text-white flex items-center justify-center text-sm font-bold shadow-md transition-all"
                title="Đóng trò chơi, quay lại bài giảng"
              >
                ✕
              </button>
            </div>
            <SlideGameWidget 
              element={currentSlideGame || {
                title: `Trò Chơi Mĩ Thuật: ${getSlideTheme()}`,
                grade: 1,
                questions: fallbackGameQuestions
              }} 
              isPresentationMode={true} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
