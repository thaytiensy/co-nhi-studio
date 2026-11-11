"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Volume2, ChevronUp, ChevronDown } from 'lucide-react';

export interface ClassroomTimerProps {
  onTimeUp?: () => void;
  className?: string;
}

export const ClassroomTimer: React.FC<ClassroomTimerProps> = ({ onTimeUp, className = '' }) => {
  const [totalSeconds, setTotalSeconds] = useState(120); // Mặc định 2 phút
  const [remainingSeconds, setRemainingSeconds] = useState(120);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playChime = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // Note D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // Note A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Bỏ qua lỗi âm thanh nếu thiết bị chặn AudioContext
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && remainingSeconds > 0) {
      timer = setInterval(() => {
        setRemainingSeconds(prev => prev - 1);
      }, 1000);
    } else if (remainingSeconds === 0 && isRunning) {
      setIsRunning(false);
      playChime();
      onTimeUp?.();
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, remainingSeconds, onTimeUp]);

  const setPresetTime = (minutes: number) => {
    setIsRunning(false);
    const secs = minutes * 60;
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
  };

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const isTimeUp = remainingSeconds === 0;

  return (
    <div
      className={`bg-neutral-900/95 backdrop-blur-md border border-amber-500/40 rounded-2xl shadow-2xl p-3 text-white select-none transition-all ${
        isTimeUp ? 'animate-pulse ring-4 ring-rose-500' : ''
      } ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-200">Đồng Hồ Thảo Luận Nhóm</span>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1 hover:bg-neutral-800 rounded-md text-neutral-400 hover:text-white"
        >
          {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!isMinimized && (
        <div className="space-y-3 pt-2">
          {/* Quick presets */}
          <div className="flex items-center justify-center gap-1.5">
            {[1, 2, 5, 10].map(m => (
              <button
                key={m}
                onClick={() => setPresetTime(m)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                  totalSeconds === m * 60 && !isRunning
                    ? 'bg-amber-500 text-neutral-950 shadow-xs'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                }`}
              >
                {m}p
              </button>
            ))}
          </div>

          {/* Main Display & Controls */}
          <div className="flex items-center justify-between gap-3 bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-800">
            <span
              className={`font-mono text-2xl font-black tracking-widest ${
                remainingSeconds <= 10 && remainingSeconds > 0
                  ? 'text-rose-400 animate-ping'
                  : isTimeUp
                  ? 'text-rose-500'
                  : 'text-amber-300'
              }`}
            >
              {timeFormatted}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsRunning(!isRunning)}
                disabled={remainingSeconds === 0}
                className={`p-2 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-neutral-950'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-30'
                }`}
                title={isRunning ? 'Tạm dừng' : 'Bắt đầu đếm ngược'}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <button
                onClick={handleReset}
                className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-all"
                title="Đặt lại đồng hồ"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomTimer;
