import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Maximize2,
  Download,
  Printer,
  Highlighter
} from 'lucide-react';
import { speechService } from '../../utils/speechService';
import SlideGameWidget from '../ArtGames/SlideGameWidget';
import { generateGameQuestionsByTheme } from '../../data/artGamesCurriculumBank';
import { classroomAudio } from '../../utils/classroomAudioService';
import { generateSlidePedagogyTips } from '../../utils/aiNaturalLanguageService';
import { exportSlideToStandaloneHtml, printSlideDeckToPdf } from '../../utils/htmlSlideExportService';
import PresentationToolbar from './PresentationToolbar';

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
  onClose,
  projectTitle = 'Bài Giảng Mĩ Thuật'
}) {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [scale, setScale] = useState(1);
  const [showNotesOverlay, setShowNotesOverlay] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [speechState, setSpeechState] = useState({ isSpeaking: false, isPaused: false });
  const containerRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  // === 1. ĐỒNG HỒ SƯ PHẠM 35 PHÚT (PEDAGOGY CLASSROOM TIMER) ===
  const [showTimerDock, setShowTimerDock] = useState(true);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(PEDAGOGY_PHASES[0].minutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // === 2. PHÍM TẮT ĐỨNG LỚP & CHẾ ĐỘ MÀN HÌNH TỐI / TRẮNG (BLACK / WHITE SCREEN) ===
  const [isBlackScreen, setIsBlackScreen] = useState(false);
  const [isWhiteScreen, setIsWhiteScreen] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // === 3. BẢNG VẼ THỊ PHẠM NHANH (WHITEBOARD & ANNOTATION) ===
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [whiteboardBackground, setWhiteboardBackground] = useState('transparent'); // 'transparent' | 'white'
  const [penColor, setPenColor] = useState('#ef4444'); // đỏ thị phạm nổi bật
  const [penSize, setPenSize] = useState(4);
  const [isHighlighter, setIsHighlighter] = useState(false);
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

  // Tự động tạm dừng toàn bộ Video & Audio khi chuyển slide (chống phát ngầm hao RAM/CPU)
  useEffect(() => {
    if (containerRef.current) {
      const mediaElements = containerRef.current.querySelectorAll('video, audio');
      mediaElements.forEach(media => {
        try {
          if (!media.paused) media.pause();
        } catch (_) {}
      });
    }
  }, [currentIndex]);

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

  // Helper trích xuất lời giảng phù hợp
  const getLectureTextToSpeak = (targetSlide = currentSlide) => {
    const s = targetSlide || currentSlide;
    const parts = [];
    if (s?.title && s.title.trim() && !s.title.startsWith('Trang ') && !isWatermark(s.title)) {
      parts.push(s.title.trim());
    }

    (s?.elements || []).forEach(el => {
      if ((el.type === 'text' || el.type === 'shape') && el.text?.trim()) {
        if (!isWatermark(el.text)) {
          parts.push(el.text.trim());
        }
      }
    });

    const slideText = parts.join('. ');

    if (s?.notes && s.notes.trim() && !isWatermark(s.notes)) {
      return s.notes.trim();
    }

    if (slideText) {
      return slideText;
    }

    const slideNum = slides.indexOf(s) >= 0 ? slides.indexOf(s) + 1 : currentIndex + 1;
    return `Trang ${slideNum}. Mời các em học sinh chú ý quan sát nội dung trên màn hình và làm theo hướng dẫn của Thầy Cô.`;
  };

  // Tự động đọc tiêu đề / nội dung mở đầu khi đổi trang slide
  useEffect(() => {
    setRevealCount(1);
    if (autoReadOnAdvance) {
      const slide = slides[currentIndex];
      if (!slide) return;
      if (!powerPointMode) {
        const fullLecture = getLectureTextToSpeak(slide);
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

  // === XỬ LÝ PHÍM TẮT ĐỨNG LỚP TOÀN DIỆN & CÔNG THÁI HỌC BÚT TRÌNH CHIẾU ===
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Chống xung đột nhập liệu: Vô hiệu hóa phím tắt nếu focus đang ở ô gõ chữ
      if (
        e.target.tagName === 'INPUT' || 
        e.target.tagName === 'TEXTAREA' || 
        e.target.isContentEditable || 
        (typeof e.target.closest === 'function' && e.target.closest('[contenteditable="true"]'))
      ) return;

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
        if (isWhiteScreen) {
          setIsWhiteScreen(false);
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

      // Phím B / b: Tắt màn hình đen (Blackout screen) để tập trung lớp
      if (e.key === 'b' || e.key === 'B') {
        setIsBlackScreen(prev => !prev);
        setIsWhiteScreen(false);
        return;
      }

      // Phím W / w: Tắt màn hình trắng (White screen) cho hoạt động thảo luận / vẽ bảng
      if (e.key === 'w' || e.key === 'W') {
        setIsWhiteScreen(prev => !prev);
        setIsBlackScreen(false);
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

      // Điều hướng slide & từng bước PowerPoint: Hỗ trợ cả Bàn phím & Bút trình chiếu USB (Clicker)
      // Tiến: ArrowRight, ArrowDown, Space, PageDown, Enter
      // Lùi: ArrowLeft, ArrowUp, PageUp, Backspace
      if (!showGameModal && !isWhiteboardOpen && !isBlackScreen && !isWhiteScreen) {
        if (
          e.key === 'ArrowRight' || 
          e.key === 'ArrowDown' || 
          e.key === ' ' || 
          e.key === 'PageDown' || 
          e.key === 'Enter'
        ) {
          handleAdvanceStep();
        } else if (
          e.key === 'ArrowLeft' || 
          e.key === 'ArrowUp' || 
          e.key === 'PageUp' || 
          e.key === 'Backspace'
        ) {
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
    isWhiteScreen,
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
    ctx.strokeStyle = isHighlighter ? 'rgba(250, 204, 21, 0.45)' : penColor;
    ctx.lineWidth = isHighlighter ? 24 : penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Hỗ trợ vẽ cảm ứng trên màn hình tương tác & Tablet
  const handleTouchDrawStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleTouchDrawMove = (e) => {
    if (!isDrawingRef.current || !e.touches || e.touches.length === 0) return;
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = isHighlighter ? 'rgba(250, 204, 21, 0.45)' : penColor;
    ctx.lineWidth = isHighlighter ? 24 : penSize;
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

  // === CỬ CHỈ CẢM ỨNG VUỐT TRANG (TOUCH SWIPE CHO BẢNG TƯƠNG TÁC / TABLET) ===
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e) => {
    if (e.changedTouches && e.changedTouches.length > 0) {
      const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
      const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
      // Nhận diện swipe ngang rõ ràng (ngưỡng > 50px và góc lệch ngang lớn hơn dọc)
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        if (deltaX < 0) {
          // Vuốt sang trái -> Tiến tới bước / slide tiếp theo
          handleAdvanceStep();
        } else {
          // Vuốt sang phải -> Lùi lại bước / slide trước
          handleStepBack();
        }
      }
    }
  };

  // Trích xuất chủ đề slide ổn định
  const slideTheme = (() => {
    const textEl = currentSlide?.elements?.find(e => e.type === 'text' && e.text?.trim());
    if (textEl) return textEl.text.split('\n')[0].slice(0, 40).trim();
    return 'Mĩ Thuật Sáng Tạo';
  })();

  const currentSlideGame = currentSlide?.elements?.find(e => e.type === 'game');

  // Khóa ổn định câu hỏi trò chơi theo trang slide hiện tại:
  // CHỈ sinh lại khi đổi trang slide (currentIndex / slide id), TUYỆT ĐỐI không sinh lại trên mỗi nhịp timer 1s
  // để các ô lựa chọn đáp án không bị xáo trộn, nhảy lung tung trước mắt học sinh.
  const fallbackGameQuestions = useMemo(() => {
    return generateGameQuestionsByTheme(1, slideTheme, 'all');
  }, [currentSlide?.id, currentIndex, slideTheme]);

  const activeGameElement = useMemo(() => {
    if (currentSlideGame) return currentSlideGame;
    return {
      id: `game-modal-${currentSlide?.id || currentIndex}`,
      title: `Trò Chơi Mĩ Thuật: ${slideTheme}`,
      grade: 1,
      questions: fallbackGameQuestions
    };
  }, [currentSlideGame, currentSlide?.id, currentIndex, slideTheme, fallbackGameQuestions]);

  const activePhase = PEDAGOGY_PHASES[currentPhaseIdx];

  const handleContainerClick = () => {
    if (showAiModal || showGameModal || isWhiteboardOpen || showShortcutsHelp || showNotesOverlay || isBlackScreen || isWhiteScreen) {
      return;
    }
    handleAdvanceStep();
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onClick={handleContainerClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
          transform: `scale(${scale}) translateZ(0)`,
          transformOrigin: 'center center',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
          imageRendering: 'crisp-edges',
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
                  className="absolute break-words select-none pointer-events-none animate-in fade-in zoom-in-95 duration-200 font-times-new-roman"
                  style={{
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width}px`,
                    fontSize: `${Math.max(14, el.fontSize || 16)}px`,
                    fontWeight: el.fontWeight || 'normal',
                    fontStyle: el.fontStyle || 'normal',
                    color: el.color || '#000000',
                    textAlign: el.textAlign || 'left',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    backgroundColor: el.background || 'transparent',
                    textDecoration: el.textDecoration || 'none',
                    fontFamily: el.fontFamily ? `"${el.fontFamily}", 'Times New Roman', Times, serif` : "'Times New Roman', Times, serif",
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

              {/* Brush Size & Highlighter */}
              <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
                {[3, 6, 12].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => {
                      setPenSize(sz);
                      setIsHighlighter(false);
                    }}
                    className={`px-2 py-0.5 rounded font-mono font-bold transition-all ${
                      penSize === sz && !isHighlighter ? 'bg-slate-700 text-amber-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {sz === 3 ? 'Nhỏ' : sz === 6 ? 'Vừa' : 'Đậm'}
                  </button>
                ))}

                {/* Nút Bút Dạ Quang Highlight (Yellow Optical) */}
                <button
                  onClick={() => setIsHighlighter(!isHighlighter)}
                  className={`px-2.5 py-0.5 rounded font-bold text-xs flex items-center gap-1 transition-all ${
                    isHighlighter ? 'bg-yellow-400 text-slate-900 shadow-sm font-extrabold' : 'text-slate-400 hover:text-white bg-slate-800'
                  }`}
                  title="Bút dạ quang highlight màu vàng trong suốt (nhấn mạnh ý chính trên slide)"
                >
                  <Highlighter className="w-3.5 h-3.5" />
                  <span>Dạ quang</span>
                </button>
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
            className="flex-1 w-full h-full relative cursor-crosshair touch-none"
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
              onTouchStart={handleTouchDrawStart}
              onTouchMove={handleTouchDrawMove}
              onTouchEnd={stopDrawing}
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
          className="fixed inset-0 bg-black z-50 flex items-center justify-center p-6 cursor-pointer animate-in fade-in duration-300 select-none"
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

      {/* =========================================================================
          4.2 MÀN HÌNH TRẮNG TẬP TRUNG LỚP (WHITE SCREEN - PHÍM W)
      ========================================================================= */}
      {isWhiteScreen && (
        <div 
          onClick={() => setIsWhiteScreen(false)}
          className="fixed inset-0 bg-white z-50 flex items-center justify-center p-6 cursor-pointer animate-in fade-in duration-300 select-none"
        >
          <div className="text-center space-y-4 max-w-lg">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-3xl shadow-xl">
              💡
            </div>
            <h2 className="text-xl font-extrabold text-slate-800">
              Màn Hình Trắng Sáng — Dành Cho Hoạt Động Thảo Luận & Luyện Tập
            </h2>
            <p className="text-xs text-slate-500">
              (Nhấn phím <kbd className="px-2 py-0.5 bg-slate-100 rounded border border-slate-300 text-slate-700 font-mono">W</kbd>, <kbd className="px-2 py-0.5 bg-slate-100 rounded border border-slate-300 text-slate-700 font-mono">Esc</kbd> hoặc nhấp chuột vào bất cứ đâu để trở lại slide)
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
          5. THANH ĐIỀU KHIỂN DỌC THEO CẠNH SLIDE HOẶC NGANG (PRESENTATION TOOLBAR)
      ========================================================================= */}
      <PresentationToolbar
        currentIndex={currentIndex}
        totalSlides={slides.length}
        powerPointMode={powerPointMode}
        onTogglePowerPointMode={() => {
          const nextMode = !powerPointMode;
          setPowerPointMode(nextMode);
          if (nextMode) {
            setRevealCount(1);
          }
        }}
        onPrev={powerPointMode ? handleStepBack : goToPrev}
        onNext={powerPointMode ? handleAdvanceStep : goToNext}
        canPrev={!(currentIndex === 0 && (!powerPointMode || revealCount <= 1))}
        canNext={!(currentIndex === slides.length - 1 && (!powerPointMode || revealCount >= ((currentSlide?.elements || []).filter(el => !isBgElement(el)).length)))}
        currentDismissedCount={currentDismissed.size}
        onResetDismissedShapes={handleResetDismissedShapes}
        isLaserActive={isLaserActive}
        onToggleLaser={() => setIsLaserActive(!isLaserActive)}
        autoReadOnAdvance={autoReadOnAdvance}
        onToggleAutoRead={() => {
          const next = !autoReadOnAdvance;
          setAutoReadOnAdvance(next);
          if (!next) speechService.stop();
        }}
        speechGender={speechState.gender}
        onToggleGender={() => {
          const nextGender = speechState.gender === 'female' ? 'male' : 'female';
          speechService.setGender(nextGender);
        }}
        isSpeaking={speechState.isSpeaking}
        isSpeakingPaused={speechState.isPaused}
        onToggleSpeak={handleToggleSpeak}
        onOpenAiTips={handleOpenAiTips}
        isWhiteboardOpen={isWhiteboardOpen}
        onToggleWhiteboard={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
        onBlackScreen={() => setIsBlackScreen(true)}
        onOpenGame={() => setShowGameModal(true)}
        onOpenSlidePicker={() => setShowSlidePickerModal(true)}
        onExportHtml={() => {
          try {
            exportSlideToStandaloneHtml(slides, projectTitle);
          } catch (err) {
            console.error('Lỗi xuất HTML:', err);
          }
        }}
        onPrintPdf={() => {
          try {
            printSlideDeckToPdf();
          } catch (err) {
            console.error('Lỗi in PDF:', err);
          }
        }}
        showNotesOverlay={showNotesOverlay}
        onToggleNotes={() => setShowNotesOverlay(!showNotesOverlay)}
        showShortcutsHelp={showShortcutsHelp}
        onToggleShortcutsHelp={() => setShowShortcutsHelp(!showShortcutsHelp)}
        onClose={() => {
          speechService.stop();
          classroomAudio.stopClassroomMusic();
          onClose();
        }}
        controlsVisible={controlsVisible}
      />

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
                <span className="text-slate-300">Tiến slide / bước (Bút USB Clicker)</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">Space / Enter / → / ↓ / PageDown</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-300">Lùi slide / bước (Bút USB Clicker)</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">Backspace / ← / ↑ / PageUp</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-300">Màn hình đen tập trung (Blackout)</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">Phím B</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-300">Màn hình trắng thảo luận (Whiteout)</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">Phím W</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-300">Bật/Tắt toàn màn hình</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">Phím F</kbd>
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
                <span className="text-slate-300">Chọn nhanh trang bài giảng (Sorter)</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">Phím G</kbd>
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
              element={activeGameElement} 
              isPresentationMode={true} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
