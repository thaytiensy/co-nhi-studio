import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Volume2, 
  Clock, 
  FileText,
  Play,
  Pause,
  RotateCcw,
  Gamepad2,
  Sparkles,
  Music,
  Edit3,
  Trash2,
  HelpCircle,
  EyeOff,
  Maximize2
} from 'lucide-react';
import { speechService } from '../../utils/speechService';
import SlideGameWidget from '../ArtGames/SlideGameWidget';
import { generateGameQuestionsByTheme } from '../../data/artGamesCurriculumBank';
import { classroomAudio } from '../../utils/classroomAudioService';
import { generateSlidePedagogyTips } from '../../utils/aiNaturalLanguageService';

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

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

const isBgElement = (el) => {
  if (!el) return false;
  if (el.isBackground) return true;
  if ((el.type === 'image' || el.type === 'shape') && el.x <= 0 && el.y <= 0 && el.width >= 900 && el.height >= 500) return true;
  return false;
};

// Khung 4 chặng tiến trình 35 phút chuẩn GDPT 2018 môn Mĩ thuật
const PEDAGOGY_PHASES = [
  { id: 'warmup', name: '1. Khởi động', minutes: 5, color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-400/40' },
  { id: 'explore', name: '2. Thị phạm', minutes: 8, color: 'text-sky-400', bg: 'bg-sky-500/20', border: 'border-sky-400/40' },
  { id: 'practice', name: '3. Sáng tạo', minutes: 17, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-400/40' },
  { id: 'evaluate', name: '4. Đánh giá', minutes: 5, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-400/40' }
];

export default function PresentationModal({
  slides,
  initialSlideIndex = 0,
  onClose
}) {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [scale, setScale] = useState(1);
  const [showNotesOverlay, setShowNotesOverlay] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [speechState, setSpeechState] = useState({ isSpeaking: false, isPaused: false });
  const containerRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  // === 1. ĐỒNG HỒ SƯ PHẠM 35 PHÚT (PEDAGOGY CLASSROOM TIMER) ===
  const [showTimerDock, setShowTimerDock] = useState(true);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(PEDAGOGY_PHASES[0].minutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // === 2. PHÍM TẮT ĐỨNG LỚP & CHẾ ĐỘ MÀN HÌNH TỐI (BLACK SCREEN) ===
  const [isBlackScreen, setIsBlackScreen] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // === 3. BẢNG VẼ THỊ PHẠM NHANH (WHITEBOARD & ANNOTATION) ===
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [whiteboardBackground, setWhiteboardBackground] = useState('transparent'); // 'transparent' | 'white'
  const [penColor, setPenColor] = useState('#ef4444'); // đỏ thị phạm nổi bật
  const [penSize, setPenSize] = useState(4);
  const whiteboardCanvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  // === 4. TRỢ LÝ SƯ PHẠM AI TỨC THỜI (AI PEDAGOGY SUGGESTIONS) ===
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTips, setAiTips] = useState(null);
  const [isLoadingAiTips, setIsLoadingAiTips] = useState(false);

  // === 5. TRÌNH CHIẾU TỪNG BƯỚC KIỂU POWERPOINT & TỰ ĐỘNG ĐỌC CHỮ ===
  const [powerPointMode, setPowerPointMode] = useState(false); // Mặc định: Chiếu trọn vẹn toàn bộ nội dung rõ ràng
  const [revealCount, setRevealCount] = useState(1);
  const [autoReadOnAdvance, setAutoReadOnAdvance] = useState(true);
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [showSlidePickerModal, setShowSlidePickerModal] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: -100, y: -100 });
  const [dismissedBySlide, setDismissedBySlide] = useState({});

  const currentDismissed = dismissedBySlide[currentIndex] || new Set();

  const handleToggleShapeDismiss = (shapeId) => {
    setDismissedBySlide(prev => {
      const slideSet = new Set(prev[currentIndex] || []);
      if (slideSet.has(shapeId)) {
        slideSet.delete(shapeId);
      } else {
        slideSet.add(shapeId);
        try { classroomAudio.playSuccessSound(); } catch (_) {}
      }
      return { ...prev, [currentIndex]: slideSet };
    });
  };

  const handleResetDismissedShapes = () => {
    setDismissedBySlide(prev => ({ ...prev, [currentIndex]: new Set() }));
  };

  // Định dạng mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Vòng lặp đếm ngược đồng hồ sư phạm
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev <= 1) {
          // Báo chuông sư phạm nhẹ nhàng khi hết chặng
          classroomAudio.playPhaseChime();
          // Tự động chuyển sang chặng tiếp theo nếu chưa phải chặng cuối
          if (currentPhaseIdx < PEDAGOGY_PHASES.length - 1) {
            const nextIdx = currentPhaseIdx + 1;
            setCurrentPhaseIdx(nextIdx);
            return PEDAGOGY_PHASES[nextIdx].minutes * 60;
          } else {
            setIsTimerRunning(false);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, currentPhaseIdx]);

  // Chọn chặng thủ công
  const handleSelectPhase = (idx) => {
    setCurrentPhaseIdx(idx);
    setPhaseSecondsLeft(PEDAGOGY_PHASES[idx].minutes * 60);
    classroomAudio.playPhaseChime();
  };

  // Reset đồng hồ về đầu chặng hiện tại
  const handleResetPhaseTimer = () => {
    setPhaseSecondsLeft(PEDAGOGY_PHASES[currentPhaseIdx].minutes * 60);
  };

  // Bật/tắt nhạc nền êm dịu (Web Audio API Pentatonic Lofi)
  const handleToggleClassroomMusic = () => {
    const newState = classroomAudio.toggleMusic();
    setIsMusicPlaying(newState);
  };

  // Subscribe to speech state
  useEffect(() => {
    const unsubscribe = speechService.subscribe(setSpeechState);
    return () => {
      unsubscribe();
      speechService.stop();
      classroomAudio.stopClassroomMusic();
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, []);

  // Tính toán scale 16:9 responsive
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

  const currentSlide = slides[currentIndex] || slides[0];

  const goToNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      speechService.stop();
      setCurrentIndex(prev => prev + 1);
      setShowAiModal(false);
    }
  }, [currentIndex, slides.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      speechService.stop();
      setCurrentIndex(prev => prev - 1);
      setShowAiModal(false);
    }
  }, [currentIndex]);

  // Helper đọc chữ của ô nội dung hoặc video
  const speakElementText = useCallback((el) => {
    if (!el || !autoReadOnAdvance) return;
    let textToSpeak = '';
    if ((el.type === 'text' || el.type === 'shape') && el.text?.trim()) {
      if (!isWatermark(el.text)) {
        textToSpeak = el.text.trim();
      }
    } else if (el.type === 'video') {
      textToSpeak = `Mời các em theo dõi video: ${el.title || 'bài học'}`;
    }
    if (textToSpeak) {
      speechService.stop();
      speechService.speak(textToSpeak);
    }
  }, [autoReadOnAdvance]);

  // Chuyển bước kế tiếp kiểu PowerPoint: chuyển ô chữ, hình -> khi hết thì chuyển slide
  const handleAdvanceStep = useCallback(() => {
    if (!powerPointMode) {
      goToNext();
      return;
    }

    const buildEls = (currentSlide?.elements || []).filter(el => !isBgElement(el));
    if (revealCount < buildEls.length) {
      const nextCount = revealCount + 1;
      setRevealCount(nextCount);
      const nextEl = buildEls[nextCount - 1];
      if (nextEl) {
        speakElementText(nextEl);
      }
    } else {
      if (currentIndex < slides.length - 1) {
        speechService.stop();
        setCurrentIndex(prev => prev + 1);
        setRevealCount(1);
        setShowAiModal(false);
      }
    }
  }, [powerPointMode, currentSlide, revealCount, currentIndex, slides.length, goToNext, speakElementText]);

  // Lùi lại một bước: lùi ô chữ, hình -> khi về đầu slide thì lùi slide trước
  const handleStepBack = useCallback(() => {
    if (!powerPointMode) {
      goToPrev();
      return;
    }
    if (revealCount > 1) {
      speechService.stop();
      setRevealCount(prev => prev - 1);
    } else {
      if (currentIndex > 0) {
        speechService.stop();
        const prevSlide = slides[currentIndex - 1];
        const prevBuildEls = (prevSlide?.elements || []).filter(el => !isBgElement(el));
        setCurrentIndex(prev => prev - 1);
        setRevealCount(Math.max(1, prevBuildEls.length));
        setShowAiModal(false);
      }
    }
  }, [powerPointMode, revealCount, currentIndex, slides, goToPrev]);

  // Tự động đọc tiêu đề / nội dung mở đầu khi đổi trang slide
  useEffect(() => {
    setRevealCount(1);
    if (autoReadOnAdvance) {
      const slide = slides[currentIndex];
      if (!slide) return;
      if (!powerPointMode) {
        const fullLecture = getLectureTextToSpeak();
        if (fullLecture) {
          speechService.stop();
          speechService.speak(fullLecture);
        }
      } else {
        const buildEls = (slide.elements || []).filter(el => !isBgElement(el));
        if (buildEls.length > 0) {
          speakElementText(buildEls[0]);
        } else if (slide.title && !slide.title.startsWith('Trang ') && !isWatermark(slide.title)) {
          speechService.stop();
          speechService.speak(slide.title);
        } else if (slide.notes && !isWatermark(slide.notes)) {
          speechService.stop();
          speechService.speak(slide.notes);
        }
      }
    }
  }, [currentIndex, autoReadOnAdvance, powerPointMode, slides, speakElementText]);

  // Mở AI Gợi Ý Sư Phạm & Lời Giảng Tức Thời
  const handleOpenAiTips = useCallback(async () => {
    setShowAiModal(true);
    setIsLoadingAiTips(true);
    try {
      const tips = await generateSlidePedagogyTips({
        slide: currentSlide,
        grade: 1,
        isOnline: navigator.onLine
      });
      setAiTips(tips);
    } catch (e) {
      console.warn('Lỗi lấy gợi ý AI:', e);
    } finally {
      setIsLoadingAiTips(false);
    }
  }, [currentSlide]);

  // === XỬ LÝ PHÍM TẮT ĐỨNG LỚP TOÀN DIỆN ===
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Bỏ qua nếu đang gõ chữ trong input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Phím Esc: Đóng các modal/overlay theo thứ tự ưu tiên
      if (e.key === 'Escape') {
        if (showSlidePickerModal) {
          setShowSlidePickerModal(false);
          return;
        }
        if (showShortcutsHelp) {
          setShowShortcutsHelp(false);
          return;
        }
        if (showAiModal) {
          setShowAiModal(false);
          return;
        }
        if (showGameModal) {
          setShowGameModal(false);
          return;
        }
        if (isWhiteboardOpen) {
          setIsWhiteboardOpen(false);
          return;
        }
        if (isBlackScreen) {
          setIsBlackScreen(false);
          return;
        }
        if (showNotesOverlay) {
          setShowNotesOverlay(false);
          return;
        }
        speechService.stop();
        classroomAudio.stopClassroomMusic();
        onClose();
        return;
      }

      // Phím B / b: Tạm tắt màn hình máy chiếu (Black screen) để học sinh dừng vẽ, chú ý nhìn Thầy
      if (e.key === 'b' || e.key === 'B') {
        setIsBlackScreen(prev => !prev);
        return;
      }

      // Phím W / w: Bật/Tắt bảng vẽ trắng thị phạm nhanh (Whiteboard)
      if (e.key === 'w' || e.key === 'W') {
        setIsWhiteboardOpen(prev => !prev);
        return;
      }

      // Phím T / t: Bật/Tắt hiển thị thanh Đồng hồ sư phạm 35 phút
      if (e.key === 't' || e.key === 'T') {
        setShowTimerDock(prev => !prev);
        return;
      }

      // Phím A / a: Bật/Tắt Trợ lý gợi ý câu hỏi & bí quyết mĩ thuật AI
      if (e.key === 'a' || e.key === 'A') {
        handleOpenAiTips();
        return;
      }

      // Phím L / l: Bật/Tắt con trỏ Laser đỏ phát sáng
      if (e.key === 'l' || e.key === 'L') {
        setIsLaserActive(prev => !prev);
        return;
      }

      // Phím G / g: Mở danh sách chọn nhanh slide (Slide Sorter)
      if (e.key === 'g' || e.key === 'G') {
        setShowSlidePickerModal(prev => !prev);
        return;
      }

      // Phím F / f: Bật/Tắt toàn màn hình
      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {});
        } else {
          document.exitFullscreen?.().catch(() => {});
        }
        return;
      }

      // Phím H / ? : Xem danh mục phím tắt
      if (e.key === 'h' || e.key === 'H' || e.key === '?') {
        setShowShortcutsHelp(prev => !prev);
        return;
      }

      // Điều hướng slide & từng bước PowerPoint: Phím cách, Enter, Mũi tên phải/trái, PageUp/PageDown
      if (!showGameModal && !isWhiteboardOpen && !isBlackScreen) {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown' || e.key === 'Enter') {
          handleAdvanceStep();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'Backspace') {
          handleStepBack();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    showShortcutsHelp, 
    showAiModal, 
    showGameModal, 
    isWhiteboardOpen, 
    isBlackScreen, 
    showNotesOverlay, 
    handleAdvanceStep, 
    handleStepBack, 
    onClose
  ]);

  const handleMouseMove = (e) => {
    if (e) {
      setLaserPos({ x: e.clientX, y: e.clientY });
    }
    setControlsVisible(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 4000);
  };

  // Helper trích xuất lời giảng phù hợp
  const getLectureTextToSpeak = () => {
    const parts = [];
    if (currentSlide?.title && currentSlide.title.trim() && !currentSlide.title.startsWith('Trang ') && !isWatermark(currentSlide.title)) {
      parts.push(currentSlide.title.trim());
    }

    (currentSlide?.elements || []).forEach(el => {
      if ((el.type === 'text' || el.type === 'shape') && el.text?.trim()) {
        if (!isWatermark(el.text)) {
          parts.push(el.text.trim());
        }
      }
    });

    const slideText = parts.join('. ');

    if (currentSlide?.notes && currentSlide.notes.trim() && !isWatermark(currentSlide.notes)) {
      return currentSlide.notes.trim();
    }

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

  // Đọc riêng từng mục gợi ý của AI
  const handleSpeakSnippet = (text) => {
    speechService.stop();
    speechService.speak(text);
  };

  // === VẼ THỊ PHẠM TRÊN BẢNG VẼ NHANH (CANVAS) ===
  const startDrawing = (e) => {
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const handleClearWhiteboard = () => {
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Trích xuất chủ đề slide
  const getSlideTheme = () => {
    const textEl = currentSlide?.elements?.find(e => e.type === 'text' && e.text?.trim());
    if (textEl) return textEl.text.split('\n')[0].slice(0, 40).trim();
    return 'Mĩ Thuật Sáng Tạo';
  };

  const currentSlideGame = currentSlide?.elements?.find(e => e.type === 'game');
  const fallbackGameQuestions = generateGameQuestionsByTheme(1, getSlideTheme(), 'all');
  const activePhase = PEDAGOGY_PHASES[currentPhaseIdx];

  const handleContainerClick = () => {
    if (showAiModal || showGameModal || isWhiteboardOpen || showShortcutsHelp || showNotesOverlay || isBlackScreen) {
      return;
    }
    handleAdvanceStep();
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onClick={handleContainerClick}
      className={`fixed inset-0 bg-black z-50 flex items-center justify-center select-none overflow-hidden ${
        isLaserActive ? 'cursor-none' : 'cursor-pointer'
      }`}
    >
      {/* =========================================================================
          1. THANH ĐỒNG HỒ SƯ PHẠM 35 PHÚT (PEDAGOGY TIMER DOCK - TOP)
      ========================================================================= */}
      {showTimerDock && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className={`fixed top-3 left-1/2 -translate-x-1/2 z-45 transition-all duration-300 ${
            controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl px-4 py-2 shadow-2xl flex items-center gap-3 text-white text-xs">
            {/* Phase Selector Pills */}
            <div className="flex items-center gap-1">
              {PEDAGOGY_PHASES.map((phase, idx) => {
                const isActive = idx === currentPhaseIdx;
                return (
                  <button
                    key={phase.id}
                    onClick={() => handleSelectPhase(idx)}
                    className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                      isActive 
                        ? `${phase.bg} ${phase.color} border ${phase.border} shadow-sm scale-105` 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>{phase.name}</span>
                    <span className="text-[10px] opacity-75">({phase.minutes}p)</span>
                  </button>
                );
              })}
            </div>

            {/* Countdown Clock Display */}
            <div className="pl-3 border-l border-slate-700 flex items-center gap-2">
              <div className={`font-mono font-black text-sm px-2.5 py-0.5 rounded-lg bg-black/50 border border-slate-800 ${activePhase.color}`}>
                ⏱️ {formatTime(phaseSecondsLeft)}
              </div>

              {/* Play / Pause Timer */}
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
                title={isTimerRunning ? 'Tạm dừng đồng hồ' : 'Tiếp tục tính giờ'}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              {/* Reset Phase */}
              <button
                onClick={handleResetPhaseTimer}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                title="Đặt lại giờ cho chặng này"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Nút Nhạc Nền Sáng Tạo (Pentatonic Lofi) */}
              <button
                onClick={handleToggleClassroomMusic}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                  isMusicPlaying 
                    ? 'bg-emerald-600 text-white animate-pulse shadow-xs' 
                    : 'bg-slate-800 text-slate-400 hover:text-emerald-300'
                }`}
                title="Bật/Tắt nhạc nền êm dịu không lời cho các em tập trung vẽ"
              >
                <Music className="w-3.5 h-3.5" />
                <span>{isMusicPlaying ? 'Đang phát nhạc' : 'Nhạc sáng tạo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. SLIDE CANVAS 16:9 CHÍNH (CÓ HIỆU ỨNG CHUYỂN SLIDE POWERPOINT)
      ========================================================================= */}
      <div
        key={`slide-${currentIndex}-${currentSlide?.id}`}
        className={`relative overflow-hidden shadow-2xl transition-all ${
          currentSlide?.transition === 'slide'
            ? 'animate-in slide-in-from-right-8 duration-300'
            : currentSlide?.transition === 'zoom'
              ? 'animate-in zoom-in-90 duration-300'
              : currentSlide?.transition === 'none'
                ? 'animate-none'
                : 'animate-in fade-in duration-250'
        }`}
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          backgroundColor: currentSlide?.background || '#ffffff',
        }}
      >
        {(() => {
          const buildElements = (currentSlide?.elements || []).filter(el => !isBgElement(el));
          return currentSlide?.elements?.map((el) => {
            const isBg = isBgElement(el);
            const buildIdx = isBg ? -1 : buildElements.indexOf(el);
            const isVisible = isBg || !powerPointMode || buildIdx < revealCount;
            if (!isVisible) return null;

            if (el.type === 'text') {
              return (
                <div
                  key={el.id}
                  className="absolute break-words select-none pointer-events-none animate-in fade-in zoom-in-95 duration-200"
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
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    backgroundColor: el.background || 'transparent',
                    textDecoration: el.textDecoration || 'none',
                    fontFamily: el.fontFamily ? `"${el.fontFamily}", 'Playpen Sans', cursive, sans-serif` : undefined,
                    lineHeight: 1.25,
                  }}
                >
                  {el.text}
                </div>
              );
            }

            if (el.type === 'shape') {
              const isDismissed = currentDismissed.has(el.id);
              if (isDismissed) return null;

              return (
                <div
                  key={el.id}
                  onClick={(e) => {
                    if (el.shapeType !== 'line') {
                      e.stopPropagation();
                      handleToggleShapeDismiss(el.id);
                    }
                  }}
                  className={`absolute animate-in fade-in zoom-in-95 duration-200 ${
                    el.shapeType === 'line' ? 'pointer-events-none' : 'cursor-pointer pointer-events-auto hover:opacity-85 active:scale-95 transition-all'
                  }`}
                  style={{
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                  }}
                  title={el.shapeType !== 'line' ? 'Nhấp vào hình này để lật mở / ẩn hình che bài' : undefined}
                >
                  {el.customPath ? (
                    <svg className="w-full h-full" viewBox={el.customPath.viewBox} preserveAspectRatio="none">
                      <path
                        d={el.customPath.d}
                        fill={el.fill && el.fill !== 'transparent' ? el.fill : 'none'}
                        stroke={el.stroke || el.fill || '#1e293b'}
                        strokeWidth={Math.max(2, el.strokeWidth || 3)}
                        strokeDasharray={el.strokeDash}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={el.opacity ?? 1}
                      />
                    </svg>
                  ) : el.shapeType === 'circle' ? (
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="44"
                        fill={el.fill && el.fill !== 'transparent' ? el.fill : 'none'}
                        stroke={el.stroke || '#06b6d4'}
                        strokeWidth={Math.max(2, el.strokeWidth || 4)}
                        strokeDasharray={el.strokeDash}
                        opacity={el.opacity ?? 1}
                      />
                    </svg>
                  ) : el.shapeType === 'wave' ? (
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path
                        d="M 5,50 Q 16.25,12 27.5,50 T 50,50 T 72.5,50 T 95,50"
                        fill="none"
                        stroke={el.stroke || el.fill || '#eab308'}
                        strokeWidth={Math.max(3, el.strokeWidth || 5)}
                        strokeDasharray={el.strokeDash}
                        strokeLinecap="round"
                        opacity={el.opacity ?? 1}
                      />
                    </svg>
                  ) : el.shapeType === 'zigzag' ? (
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polyline
                        points="5,82 20,18 35,82 50,18 65,82 80,18 95,82"
                        fill="none"
                        stroke={el.stroke || el.fill || '#ef4444'}
                        strokeWidth={Math.max(3, el.strokeWidth || 5)}
                        strokeDasharray={el.strokeDash}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={el.opacity ?? 1}
                      />
                    </svg>
                  ) : el.shapeType === 'arc' ? (
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path
                        d="M 10,85 Q 50,15 90,85"
                        fill="none"
                        stroke={el.stroke || el.fill || '#f59e0b'}
                        strokeWidth={Math.max(3, el.strokeWidth || 5)}
                        strokeDasharray={el.strokeDash}
                        strokeLinecap="round"
                        opacity={el.opacity ?? 1}
                      />
                    </svg>
                  ) : el.shapeType === 'triangle' ? (
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polygon
                        points="50,5 95,95 5,95"
                        fill={el.fill && el.fill !== 'transparent' ? el.fill : 'none'}
                        stroke={el.stroke || (el.fill ? 'none' : '#10b981')}
                        strokeWidth={el.strokeWidth || (el.fill ? 0 : 3)}
                        strokeDasharray={el.strokeDash}
                        opacity={el.opacity ?? 1}
                      />
                    </svg>
                  ) : el.shapeType === 'star' ? (
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polygon
                        points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36"
                        fill={el.fill && el.fill !== 'transparent' ? el.fill : 'none'}
                        stroke={el.stroke || (el.fill ? 'none' : '#f59e0b')}
                        strokeWidth={el.strokeWidth || (el.fill ? 0 : 3)}
                        strokeDasharray={el.strokeDash}
                        opacity={el.opacity ?? 1}
                      />
                    </svg>
                  ) : el.shapeType === 'arrow' ? (
                    <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
                      <polygon
                        points="0,20 60,20 60,0 100,30 60,60 60,40 0,40"
                        fill={el.fill && el.fill !== 'transparent' ? el.fill : 'none'}
                        stroke={el.stroke || (el.fill ? 'none' : '#6366f1')}
                        strokeWidth={el.strokeWidth || (el.fill ? 0 : 3)}
                        strokeDasharray={el.strokeDash}
                        opacity={el.opacity ?? 1}
                      />
                    </svg>
                  ) : el.shapeType === 'line' ? (
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <line
                        x1={el.width >= el.height ? 0 : 50}
                        y1={el.width >= el.height ? 50 : 0}
                        x2={el.width >= el.height ? 100 : 50}
                        y2={el.width >= el.height ? 50 : 100}
                        stroke={el.stroke || el.fill || '#1e293b'}
                        strokeWidth={Math.max(3, el.strokeWidth || 4)}
                        strokeDasharray={el.strokeDash}
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundColor: el.fill || 'transparent',
                        borderRadius: el.shapeType === 'roundedRect' ? '16px' : '4px',
                        border: el.stroke ? `${el.strokeWidth || 2}px ${el.strokeDash ? 'dashed' : 'solid'} ${el.stroke}` : 'none',
                        opacity: el.opacity ?? 1,
                      }}
                    />
                  )}

                  {el.text && (
                    <div
                      className="absolute inset-0 flex items-center justify-center p-2 text-center break-words select-none pointer-events-none"
                      style={{
                        fontSize: `${el.fontSize || 16}px`,
                        fontWeight: el.fontWeight || 'normal',
                        color: el.color || '#000000',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.25,
                      }}
                    >
                      {el.text}
                    </div>
                  )}
                </div>
              );
            }

            if (el.type === 'image') {
              return (
                <img
                  key={el.id}
                  src={el.src}
                  alt="Hình minh họa"
                  className="absolute object-contain pointer-events-none animate-in fade-in zoom-in-95 duration-200"
                  style={{
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                  }}
                />
              );
            }

            if (el.type === 'video') {
              return (
                <div
                  key={el.id}
                  className="absolute bg-black rounded-xl overflow-hidden shadow-2xl flex items-center justify-center animate-in fade-in zoom-in-95 duration-200 z-10"
                  style={{
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <video
                    controls
                    playsInline
                    src={el.src}
                    poster={el.poster}
                    className="w-full h-full object-contain"
                  />
                </div>
              );
            }

            if (el.type === 'youtube') {
              return (
                <div
                  key={el.id}
                  className="absolute bg-black rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-10"
                  style={{
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                  }}
                  onClick={(e) => e.stopPropagation()}
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

            if (el.type === 'audio') {
              return (
                <div
                  key={el.id}
                  className="absolute bg-slate-900/90 border border-slate-700 p-2 rounded-xl flex items-center gap-2 shadow-lg animate-in fade-in duration-200 z-10"
                  style={{
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <audio controls src={el.src} className="w-full h-full" />
                </div>
              );
            }

            if (el.type === 'game') {
              return (
                <div
                  key={el.id}
                  className="absolute flex items-center justify-center p-4 bg-indigo-50/90 rounded-2xl border-2 border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-all shadow-md group animate-in fade-in zoom-in-95 duration-200"
                  style={{
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowGameModal(true);
                  }}
                >
                  <div className="text-center space-y-2 pointer-events-none">
                    <div className="w-12 h-12 mx-auto rounded-full bg-indigo-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Gamepad2 className="w-6 h-6 text-amber-300" />
                    </div>
                    <div className="font-extrabold text-sm text-indigo-900">{el.title || 'Trò Chơi Mĩ Thuật'}</div>
                    <div className="text-[11px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full inline-block">
                      🎮 Bấm để phóng to trò chơi cho cả lớp
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          });
        })()}
      </div>

      {/* =========================================================================
          3. BẢNG VẼ THỊ PHẠM NHANH (WHITEBOARD OVERLAY)
      ========================================================================= */}
      {isWhiteboardOpen && (
        <div className="fixed inset-0 z-40 flex flex-col pointer-events-auto">
          {/* Top Whiteboard Controls */}
          <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700 px-4 py-2 flex items-center justify-between text-white text-xs shadow-xl">
            <div className="flex items-center gap-3">
              <span className="font-black text-amber-400 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4" />
                <span>Bảng Vẽ Thị Phạm Nhanh</span>
              </span>

              {/* Mode Toggle: Vẽ đè lên Slide vs Bảng Trắng Toàn Phần */}
              <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                <button
                  onClick={() => setWhiteboardBackground('transparent')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                    whiteboardBackground === 'transparent' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Vẽ đè lên Slide
                </button>
                <button
                  onClick={() => setWhiteboardBackground('white')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                    whiteboardBackground === 'white' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Bảng trắng tinh
                </button>
              </div>

              {/* Color Palette */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
                {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#0f172a', '#ffffff'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setPenColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      penColor === c ? 'scale-125 border-white shadow-md' : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              {/* Brush Size */}
              <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
                {[3, 6, 12].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setPenSize(sz)}
                    className={`px-2 py-0.5 rounded font-mono font-bold ${
                      penSize === sz ? 'bg-slate-700 text-amber-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {sz === 3 ? 'Nhỏ' : sz === 6 ? 'Vừa' : 'Đậm'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearWhiteboard}
                className="px-3 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-bold flex items-center gap-1 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa nét vẽ</span>
              </button>
              <button
                onClick={() => setIsWhiteboardOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                title="Trở về trình chiếu slide (Phím W hoặc Esc)"
              >
                <RotateCcw className="w-4 h-4" />
                <span>↩ Trở Về Slide (W / Esc)</span>
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div 
            className="flex-1 w-full h-full relative cursor-crosshair"
            style={{
              backgroundColor: whiteboardBackground === 'white' ? '#ffffff' : 'rgba(0, 0, 0, 0.05)'
            }}
          >
            <canvas
              ref={whiteboardCanvasRef}
              width={window.innerWidth || 1920}
              height={window.innerHeight || 1080}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          4. MÀN HÌNH TỐI TẬP TRUNG LỚP (BLACK SCREEN - PHÍM B)
      ========================================================================= */}
      {isBlackScreen && (
        <div 
          onClick={() => setIsBlackScreen(false)}
          className="fixed inset-0 bg-black z-50 flex items-center justify-center p-6 cursor-pointer animate-in fade-in duration-300"
        >
          <div className="text-center space-y-4 max-w-lg">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-3xl shadow-2xl">
              ⏸️
            </div>
            <h2 className="text-xl font-extrabold text-amber-400">
              Lớp Tạm Dừng Bút — Cùng Ngước Nhìn Thầy Hướng Dẫn Nhé!
            </h2>
            <p className="text-xs text-slate-400">
              (Nhấn phím <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-600 text-white font-mono">B</kbd> hoặc nhấp chuột vào bất cứ đâu để tiếp tục bài giảng)
            </p>
          </div>
        </div>
      )}

      {/* Con trỏ Laser VIP phát sáng */}
      {isLaserActive && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${laserPos.x}px`, top: `${laserPos.y}px` }}
        >
          <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_16px_5px_rgba(239,68,68,0.95)] animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}

      {/* =========================================================================
          5. THANH ĐIỀU KHIỂN DƯỚI ĐÁY MÀN HÌNH (FLOATING CONTROL BAR - BOTTOM)
      ========================================================================= */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-full px-5 py-2.5 flex items-center gap-2.5 text-white shadow-2xl z-40 transition-all duration-300 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Slide Counter */}
        <span className="text-xs font-bold text-slate-300 pr-2 border-r border-slate-700">
          {currentIndex + 1} / {slides.length}
        </span>

        {/* Prev / Next buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={powerPointMode ? handleStepBack : goToPrev}
            disabled={currentIndex === 0 && (!powerPointMode || revealCount <= 1)}
            className={`p-1.5 rounded-full transition-all ${
              currentIndex === 0 && (!powerPointMode || revealCount <= 1) ? 'text-slate-600 cursor-not-allowed' : 'hover:bg-slate-700 text-white cursor-pointer'
            }`}
            title="Lùi lại một bước (Mũi tên Trái / Backspace)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={powerPointMode ? handleAdvanceStep : goToNext}
            disabled={currentIndex === slides.length - 1 && (!powerPointMode || revealCount >= ((currentSlide?.elements || []).filter(el => !isBgElement(el)).length))}
            className={`p-1.5 rounded-full transition-all ${
              currentIndex === slides.length - 1 && (!powerPointMode || revealCount >= ((currentSlide?.elements || []).filter(el => !isBgElement(el)).length)) ? 'text-slate-600 cursor-not-allowed' : 'hover:bg-slate-700 text-white cursor-pointer'
            }`}
            title="Tiến lên một bước (Mũi tên Phải, Phím Cách hoặc Click chuột)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Nút Bật/Tắt Trình Chiếu Kiểu PowerPoint */}
        <button
          onClick={() => {
            const nextMode = !powerPointMode;
            setPowerPointMode(nextMode);
            if (nextMode) {
              setRevealCount(1);
            }
          }}
          className={`px-3 py-1.5 text-xs font-black rounded-full flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
            powerPointMode ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
          title="Bật/Tắt chế độ trình chiếu từng bước kiểu PowerPoint: Mỗi lần bấm chuột sẽ chuyển ô chữ, hình và tự động đọc nếu có chữ"
        >
          <span>🎬 {powerPointMode ? 'Từng Bước' : 'Chiếu Trọn Vẹn'}</span>
        </button>

        {/* Nút Khôi Phục Thẻ Che nếu có hình đã ẩn */}
        {currentDismissed.size > 0 && (
          <button
            onClick={handleResetDismissedShapes}
            className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/30 text-amber-300 border border-amber-400/50 hover:bg-amber-500/50 transition-all flex items-center gap-1 cursor-pointer animate-in fade-in"
            title="Khôi phục lại các hình che / mảnh ghép đã lật mở trên trang này"
          >
            <span>🔄 Hiện lại ({currentDismissed.size})</span>
          </button>
        )}

        {/* Nút Bật/Tắt Con Trỏ Laser VIP */}
        <button
          onClick={() => setIsLaserActive(!isLaserActive)}
          className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1 transition-all border cursor-pointer ${
            isLaserActive ? 'bg-red-500/20 text-red-400 border-red-500/60 ring-2 ring-red-500/40' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
          title="Bật/Tắt con trỏ Laser đỏ phát sáng để chỉ vào tranh khi giảng bài (Phím L)"
        >
          <span>🔴 Laser</span>
        </button>

        {/* Nút Bật/Tắt Tự Động Đọc Chữ Khi Chuyển Bước */}
        <button
          onClick={() => {
            const next = !autoReadOnAdvance;
            setAutoReadOnAdvance(next);
            if (!next) speechService.stop();
          }}
          className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1 transition-all border cursor-pointer ${
            autoReadOnAdvance ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
          title="Bật/Tắt tự động đọc ô chữ khi chuyển bước"
        >
          <span>{autoReadOnAdvance ? '🔊 Tự Đọc' : '🔇 Tắt Đọc'}</span>
        </button>

        {/* Giọng Thầy / Cô */}
        <button
          onClick={() => {
            const nextGender = speechState.gender === 'female' ? 'male' : 'female';
            speechService.setGender(nextGender);
          }}
          className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 transition-all border border-slate-700 flex items-center gap-1 cursor-pointer"
          title="Bấm để đổi giữa giọng đọc Thầy giáo (Nam) và Cô giáo (Nữ)"
        >
          <span>{speechState.gender === 'female' ? '👩 Cô' : '👨 Thầy'}</span>
        </button>

        {/* Nút Đọc Lời Giảng */}
        <button
          onClick={handleToggleSpeak}
          className={`px-3 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
            speechState.isSpeaking && !speechState.isPaused
              ? 'bg-amber-500 text-white animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
          title="Đọc lời giảng trang slide này"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>{speechState.isSpeaking && !speechState.isPaused ? 'Tạm dừng' : 'Đọc lời giảng'}</span>
        </button>

        {/* Nút Trợ Lý AI Sư Phạm Tức Thời */}
        <button
          onClick={handleOpenAiTips}
          className="px-3 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-xs transition-all cursor-pointer"
          title="Gợi ý câu hỏi tương tác & bí quyết mĩ thuật AI (Phím A)"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
          <span>✨ Gợi Ý AI</span>
        </button>

        {/* Nút Bảng Vẽ Thị Phạm Nhanh */}
        <button
          onClick={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
            isWhiteboardOpen ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
          title="Mở bảng vẽ thị phạm nhanh (Phím W)"
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-300" />
          <span>{isWhiteboardOpen ? '↩ Trở Về Slide' : 'Vẽ thị phạm'}</span>
        </button>

        {/* Nút Màn Hình Tối (Black Screen) */}
        <button
          onClick={() => setIsBlackScreen(true)}
          className="p-1.5 rounded-full hover:bg-slate-700 text-slate-300 transition-all"
          title="Tạm tắt màn hình tập trung học sinh (Phím B)"
        >
          <EyeOff className="w-4 h-4" />
        </button>

        {/* Nút Mở Trò Chơi Mĩ Thuật */}
        <button
          onClick={() => setShowGameModal(true)}
          className="px-3 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all"
          title="Mở trò chơi mĩ thuật tương tác cho cả lớp"
        >
          <Gamepad2 className="w-3.5 h-3.5 text-amber-300" />
          <span>Trò Chơi</span>
        </button>

        {/* Nút Mở Danh Sách Chọn Nhanh Slide (Slide Sorter) */}
        <button
          onClick={() => setShowSlidePickerModal(true)}
          className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 flex items-center gap-1 cursor-pointer"
          title="Chọn nhanh trang slide bất kỳ (Phím G)"
        >
          <span>🖼️ Slide</span>
        </button>

        {/* Nút Toàn Màn Hình */}
        <button
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen?.().catch(() => {});
            } else {
              document.exitFullscreen?.().catch(() => {});
            }
          }}
          className="p-1.5 rounded-full hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
          title="Bật/Tắt toàn màn hình (Phím F)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Nút Ghi Chú Sư Phạm */}
        <button
          onClick={() => setShowNotesOverlay(!showNotesOverlay)}
          className={`p-1.5 rounded-full hover:bg-slate-700 transition-all ${
            showNotesOverlay ? 'text-amber-400 bg-slate-800' : 'text-slate-300'
          }`}
          title="Xem ghi chú sư phạm trang này"
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Hướng Dẫn Phím Tắt */}
        <button
          onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
          className="p-1.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-amber-300 transition-all"
          title="Danh mục phím tắt đứng lớp (Phím ?)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Nút Thoát */}
        <button
          onClick={() => {
            speechService.stop();
            classroomAudio.stopClassroomMusic();
            onClose();
          }}
          className="p-1.5 rounded-full hover:bg-rose-600 text-slate-300 hover:text-white transition-all ml-1"
          title="Thoát trình chiếu (Phím Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* =========================================================================
          5.5 MODAL DANH SÁCH CHỌN SLIDE (POWERPOINT SLIDE SORTER / PICKER)
      ========================================================================= */}
      {showSlidePickerModal && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-6 animate-in fade-in"
          onClick={() => setShowSlidePickerModal(false)}
        >
          <div 
            className="w-full max-w-4xl max-h-[85vh] bg-slate-900 border border-slate-700 rounded-3xl p-6 text-white shadow-2xl flex flex-col space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🖼️</span>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Danh Sách Slide Bài Dạy</h3>
                  <p className="text-xs text-slate-400 font-medium">Bấm vào slide để chuyển nhanh tới trang đó (Phím tắt G)</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSlidePickerModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕ Đóng (Esc)
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
              {slides.map((slide, sIdx) => {
                const isCurr = sIdx === currentIndex;
                const sTitle = slide.elements?.find(e => e.type === 'text' && e.text?.trim())?.text?.split('\n')[0] || `Trang ${sIdx + 1}`;
                return (
                  <button
                    key={slide.id || sIdx}
                    onClick={() => {
                      speechService.stop();
                      setCurrentIndex(sIdx);
                      setShowSlidePickerModal(false);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                      isCurr 
                        ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 text-white' 
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                        isCurr ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                      }`}>
                        Trang ${sIdx + 1}
                      </span>
                      {isCurr && <span className="text-[10px] text-amber-300 font-bold">● Đang chiếu</span>}
                    </div>
                    <p className="text-xs font-bold line-clamp-2 mt-2 text-slate-200">
                      {sTitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. MODAL GỢI Ý SƯ PHẠM & LỜI GIẢNG AI (SMART AI ASSISTANT)
      ========================================================================= */}
      {showAiModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-6 animate-in fade-in"
          onClick={() => setShowAiModal(false)}
        >
          <div 
            className="w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-3xl p-5 text-white shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Gợi Ý Sư Phạm AI — Thầy Cọ Nhí</h3>
                  <p className="text-[11px] text-amber-300/80 font-medium">Chủ đề nhận diện: {aiTips?.topic || 'Mĩ Thuật GDPT 2018'}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg hover:bg-slate-800"
              >
                ✕ Đóng (Esc)
              </button>
            </div>

            {isLoadingAiTips ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Thầy Cọ Nhí đang đọc nội dung slide và chuẩn bị câu hỏi...</p>
              </div>
            ) : aiTips ? (
              <div className="space-y-3">
                {/* 1. Câu hỏi khơi gợi */}
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-sky-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-sky-400 flex items-center gap-1">
                      <span>💡</span> 1. Câu Hỏi Khơi Gợi Quan Sát (Năng lực nhận thức):
                    </span>
                    <button
                      onClick={() => handleSpeakSnippet(aiTips.inquiryQuestion)}
                      className="text-[11px] font-bold text-sky-300 hover:text-white px-2 py-0.5 rounded bg-sky-600/30 hover:bg-sky-600 flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" /> Đọc cho lớp
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    "{aiTips.inquiryQuestion}"
                  </p>
                </div>

                {/* 2. Bí quyết mĩ thuật cô đọng */}
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
                      <span>🖌️</span> 2. Bí Quyết Mĩ Thuật Cô Đọng (Kĩ năng & Bố cục):
                    </span>
                    <button
                      onClick={() => handleSpeakSnippet(aiTips.artTechniqueTip)}
                      className="text-[11px] font-bold text-amber-300 hover:text-white px-2 py-0.5 rounded bg-amber-600/30 hover:bg-amber-600 flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" /> Đọc cho lớp
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    "{aiTips.artTechniqueTip}"
                  </p>
                </div>

                {/* 3. Lời khích lệ thực hành */}
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-emerald-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                      <span>🌟</span> 3. Lời Động Viên Sáng Tạo Tự Tin:
                    </span>
                    <button
                      onClick={() => handleSpeakSnippet(aiTips.encouragement)}
                      className="text-[11px] font-bold text-emerald-300 hover:text-white px-2 py-0.5 rounded bg-emerald-600/30 hover:bg-emerald-600 flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" /> Đọc cho lớp
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    "{aiTips.encouragement}"
                  </p>
                </div>
              </div>
            ) : null}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Chuẩn GDPT 2018 môn Mĩ thuật Tiểu học • Phím tắt [A]
              </span>
              <button
                onClick={() => {
                  if (aiTips) {
                    const fullText = `${aiTips.inquiryQuestion}. ${aiTips.artTechniqueTip}. ${aiTips.encouragement}`;
                    handleSpeakSnippet(fullText);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Đọc toàn bộ gợi ý</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. MODAL DANH MỤC PHÍM TẮT ĐỨNG LỚP (SHORTCUTS CHEAT SHEET)
      ========================================================================= */}
      {showShortcutsHelp && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-6 animate-in fade-in"
          onClick={() => setShowShortcutsHelp(false)}
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 text-white shadow-2xl space-y-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-extrabold text-sm text-amber-400 flex items-center gap-1.5">
                <span>⌨️</span> Phím Tắt Đứng Lớp Chuyên Dụng
              </h3>
              <button 
                onClick={() => setShowShortcutsHelp(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-0.5 rounded hover:bg-slate-800"
              >
                ✕ Đóng
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-300">Chuyển sang slide tiếp theo</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">Space / Mũi tên phải</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-300">Quay lại slide trước</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">Mũi tên trái</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-300">Tạm tắt màn hình (tập trung lớp)</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">Phím B</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-300">Mở bảng vẽ thị phạm nhanh</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">Phím W</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-300">Bật/Tắt con trỏ Laser đỏ phát sáng</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">Phím L</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-300">Bật/Tắt thanh Đồng hồ 35 phút</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">Phím T</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-300">Mở Gợi ý Sư phạm AI</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">Phím A</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-300">Thoát trình chiếu / Đóng cửa sổ</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">Phím Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          8. GHI CHÚ LỜI GIẢNG SƯ PHẠM (NOTES OVERLAY)
      ========================================================================= */}
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
            {currentSlide?.notes || '(Trang này chưa có ghi chú riêng. Thầy/Cô có thể bấm ✨ Gợi Ý AI để lấy câu hỏi và bí quyết dạy học ngay nhé!)'}
          </p>
        </div>
      )}

      {/* =========================================================================
          9. MODAL TRÒ CHƠI PHÓNG TO
      ========================================================================= */}
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
