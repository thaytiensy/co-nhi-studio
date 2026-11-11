"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

export interface PresenterControlsOptions {
  totalSlides: number;
  initialSlideIndex?: number;
  onSlideChange?: (index: number) => void;
  enabled?: boolean;
}

export interface PresenterControlsResult {
  currentSlideIndex: number;
  isBlackout: boolean;
  isWhiteout: boolean;
  isFullscreen: boolean;
  nextSlide: () => void;
  prevSlide: () => void;
  goToSlide: (index: number) => void;
  toggleBlackout: () => void;
  toggleWhiteout: () => void;
  toggleFullscreen: () => void;
  touchHandlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
}

export function usePresenterControls({
  totalSlides,
  initialSlideIndex = 0,
  onSlideChange,
  enabled = true
}: PresenterControlsOptions): PresenterControlsResult {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlideIndex);
  const [isBlackout, setIsBlackout] = useState(false);
  const [isWhiteout, setIsWhiteout] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const touchStartXRef = useRef<number | null>(null);

  const goToSlide = useCallback((index: number) => {
    const nextIdx = Math.max(0, Math.min(index, totalSlides - 1));
    setCurrentSlideIndex(nextIdx);
    setIsBlackout(false);
    setIsWhiteout(false);
    onSlideChange?.(nextIdx);
  }, [totalSlides, onSlideChange]);

  const nextSlide = useCallback(() => {
    if (currentSlideIndex < totalSlides - 1) {
      goToSlide(currentSlideIndex + 1);
    }
  }, [currentSlideIndex, totalSlides, goToSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      goToSlide(currentSlideIndex - 1);
    }
  }, [currentSlideIndex, goToSlide]);

  const toggleBlackout = useCallback(() => {
    setIsWhiteout(false);
    setIsBlackout(prev => !prev);
  }, []);

  const toggleWhiteout = useCallback(() => {
    setIsBlackout(false);
    setIsWhiteout(prev => !prev);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Focus Guard: Bỏ qua khi người dùng đang nhập văn bản
      const activeEl = document.activeElement;
      if (activeEl) {
        const tag = activeEl.tagName.toUpperCase();
        const isEditable = (activeEl as HTMLElement).isContentEditable;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || isEditable) {
          return;
        }
      }

      // 2. Thoát màn hình đen / trắng khi nhấn phím bất kỳ
      if (isBlackout || isWhiteout) {
        if (e.code === 'KeyB') { toggleBlackout(); return; }
        if (e.code === 'KeyW') { toggleWhiteout(); return; }
        setIsBlackout(false);
        setIsWhiteout(false);
        return;
      }

      // 3. Phím tắt diễn giả chuẩn quốc tế & Bút trình chiếu Laser USB
      switch (e.code) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'Space':
        case 'PageDown':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'KeyB':
          e.preventDefault();
          toggleBlackout();
          break;
        case 'KeyW':
          e.preventDefault();
          toggleWhiteout();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, isBlackout, isWhiteout, nextSlide, prevSlide, toggleBlackout, toggleWhiteout, toggleFullscreen]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (deltaX < -50) {
      nextSlide();
    } else if (deltaX > 50) {
      prevSlide();
    }
  }, [nextSlide, prevSlide]);

  return {
    currentSlideIndex,
    isBlackout,
    isWhiteout,
    isFullscreen,
    nextSlide,
    prevSlide,
    goToSlide,
    toggleBlackout,
    toggleWhiteout,
    toggleFullscreen,
    touchHandlers: {
      onTouchStart,
      onTouchEnd
    }
  };
}
