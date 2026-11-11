"use client";

import React, { useState, useEffect } from 'react';
import type { Slide } from '../../types/presentation.ts';
import { Eye, Clock, ArrowRight, ArrowLeft, X } from 'lucide-react';

export interface PresenterViewModalProps {
  slides: Slide[];
  currentSlideIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigateSlide: (index: number) => void;
}

export const PresenterViewModal: React.FC<PresenterViewModalProps> = ({
  slides,
  currentSlideIndex,
  isOpen,
  onClose,
  onNavigateSlide
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentSlide = slides[currentSlideIndex] || null;
  const nextSlide = slides[currentSlideIndex + 1] || null;

  const formatTime = (total: number) => {
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex flex-col p-4 text-white select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-amber-200">Giao Diện Diễn Giả (Presenter View)</h2>
          <span className="text-xs bg-neutral-800 px-2.5 py-1 rounded-full text-neutral-300">
            Trang {currentSlideIndex + 1} / {slides.length}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg text-sm">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="font-mono font-bold text-emerald-300">{formatTime(elapsedSeconds)}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4 overflow-hidden">
        {/* Left Column: Current Slide */}
        <div className="lg:col-span-2 flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl p-4 overflow-hidden">
          <span className="text-xs font-bold text-neutral-400 mb-2 block">Màn Hình Chiếu Hiện Tại:</span>
          <div className="flex-1 bg-white rounded-xl overflow-hidden flex items-center justify-center relative p-4 text-neutral-800">
            {currentSlide ? (
              <div className="text-center space-y-2">
                <h3 className="text-lg font-black">{currentSlide.title || `Trang ${currentSlideIndex + 1}`}</h3>
                <p className="text-xs text-neutral-500">
                  {currentSlide.elements?.length || 0} đối tượng trên trang
                </p>
              </div>
            ) : (
              <span className="text-neutral-400 text-xs">Chưa có trang chiếu</span>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-800">
            <button
              onClick={() => onNavigateSlide(Math.max(0, currentSlideIndex - 1))}
              disabled={currentSlideIndex === 0}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Trang trước
            </button>
            <button
              onClick={() => onNavigateSlide(Math.min(slides.length - 1, currentSlideIndex + 1))}
              disabled={currentSlideIndex >= slides.length - 1}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-30 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              Trang sau <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Next Preview & Notes */}
        <div className="flex flex-col gap-4 overflow-hidden">
          {/* Next Slide Preview */}
          <div className="h-44 bg-neutral-900 border border-neutral-800 rounded-2xl p-3 flex flex-col">
            <span className="text-xs font-bold text-neutral-400 mb-1.5 block">Slide Kế Tiếp (Preview):</span>
            <div className="flex-1 bg-neutral-800/60 rounded-xl border border-neutral-700/50 p-3 flex items-center justify-center text-center">
              {nextSlide ? (
                <div>
                  <h4 className="text-sm font-bold text-neutral-200">{nextSlide.title || `Trang ${currentSlideIndex + 2}`}</h4>
                  <span className="text-[10px] text-neutral-400">Tiếp theo</span>
                </div>
              ) : (
                <span className="text-xs text-neutral-500">Đã hết bài giảng</span>
              )}
            </div>
          </div>

          {/* Speaker Notes */}
          <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl p-3 flex flex-col overflow-hidden">
            <span className="text-xs font-bold text-amber-400 mb-2 block">📝 Lời Giảng & Ghi Chú Diễn Giả:</span>
            <div className="flex-1 bg-neutral-950 p-3 rounded-xl border border-neutral-800 overflow-y-auto text-xs text-neutral-300 leading-relaxed font-sans">
              {currentSlide?.notes?.trim() ? (
                <p className="whitespace-pre-line">{currentSlide.notes}</p>
              ) : (
                <span className="text-neutral-500 italic">Trang này chưa có ghi chú lời giảng.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresenterViewModal;
