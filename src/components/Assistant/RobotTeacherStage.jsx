"use client";

import React from 'react';
import { Volume2, VolumeX, Mic, Sparkles, MessageSquare } from 'lucide-react';

export default function RobotTeacherStage({
  isSpeaking,
  isListening,
  currentSpokenText,
  onStopSpeech,
  onReplaySpeech,
  onCharacterClick,
  onToggleViewMode,
  activeTopicLabel = '',
  currentGender = 'female',
}) {
  return (
    <div className="relative flex-1 bg-slate-950 flex flex-col items-center justify-center overflow-hidden select-none">
      {/* 1. Background Futuristic Pedagogical Ambient Lighting */}
      <div className="absolute inset-0 bg-radial from-amber-500/10 via-slate-950/80 to-slate-950 pointer-events-none" />
      <div className={`absolute w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
        isSpeaking
          ? 'bg-amber-400/25 scale-110'
          : isListening
          ? 'bg-rose-500/25 scale-105'
          : 'bg-cyan-500/10 scale-95'
      }`} />

      {/* 2. Main Robot Teacher Visual Character with Gestures */}
      <div 
        onClick={onCharacterClick}
        className={`relative z-10 w-full max-w-[380px] h-[340px] sm:h-[380px] flex items-center justify-center cursor-pointer group transition-all duration-300 ${
          isSpeaking ? 'animate-robot-speak' : ''
        }`}
        title="Bấm vào Cô Giáo Robot để chào hỏi hoặc nghe lại bài giảng"
      >
        {/* Holographic Sound Wave Aura when speaking */}
        {isSpeaking && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="w-64 h-64 rounded-full border border-cyan-400/40 animate-holo-aura" />
            <span className="w-52 h-52 rounded-full border-2 border-amber-400/60 animate-ping duration-1000" />
          </div>
        )}

        {/* The Robot Teacher Image with Interactive Speaking Gesture */}
        <div className={`relative w-full h-full rounded-2xl overflow-hidden border-2 shadow-2xl transition-all duration-300 ${
          isSpeaking
            ? 'border-amber-400 shadow-amber-500/40 scale-[1.02] -translate-y-1'
            : isListening
            ? 'border-rose-400 shadow-rose-500/40 scale-[1.01]'
            : 'border-slate-700 shadow-slate-950/80 hover:border-amber-400/80'
        }`}>
          <img
            src="/images/tro-giang-ai.jpg"
            alt="Cô Giáo Robot AI 3D"
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isSpeaking
                ? 'scale-105 filter brightness-105'
                : 'group-hover:scale-102'
            }`}
          />

          {/* Interactive Floating Status Badge */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
            {isSpeaking ? (
              <span className="px-2.5 py-1 bg-amber-500/90 text-slate-950 font-black text-[11px] rounded-full shadow-lg backdrop-blur-md flex items-center gap-1.5 animate-bounce">
                <Volume2 className="w-3.5 h-3.5" />
                <span>{currentGender === 'male' ? 'Thầy giáo đang giảng...' : 'Cô giáo đang giảng...'}</span>
              </span>
            ) : isListening ? (
              <span className="px-2.5 py-1 bg-rose-600/90 text-white font-black text-[11px] rounded-full shadow-lg backdrop-blur-md flex items-center gap-1.5 animate-pulse ring-2 ring-rose-400">
                <Mic className="w-3.5 h-3.5" />
                <span>Đang lắng nghe Thầy/Cô...</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-slate-900/80 text-amber-300 font-extrabold text-[10px] rounded-full shadow-md backdrop-blur-md border border-amber-400/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Sẵn sàng đàm thoại</span>
              </span>
            )}
          </div>

          {/* Switch to Text History Mode Toggle Button */}
          {onToggleViewMode && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleViewMode(); }}
              className="absolute top-3 right-3 z-20 px-2 py-1 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-[10px] font-bold rounded-lg border border-slate-700 backdrop-blur-md flex items-center gap-1 shadow-md transition-all cursor-pointer"
              title="Chuyển sang xem lịch sử văn bản nếu cần sao chép vào giáo án"
            >
              <MessageSquare className="w-3 h-3 text-amber-400" />
              <span>Xem văn bản</span>
            </button>
          )}

          {/* Holographic Glowing Sound Waves / Voice Visualizer at bottom of character */}
          {isSpeaking && (
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1 z-20 bg-slate-950/60 backdrop-blur-xs py-1.5">
              <span className="w-1 h-3 bg-cyan-400 rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" />
              <span className="w-1 h-6 bg-amber-400 rounded-full animate-[bounce_0.5s_ease-in-out_infinite_0.1s]" />
              <span className="w-1 h-4 bg-emerald-400 rounded-full animate-[bounce_0.7s_ease-in-out_infinite_0.2s]" />
              <span className="w-1 h-7 bg-amber-300 rounded-full animate-[bounce_0.5s_ease-in-out_infinite_0.15s]" />
              <span className="w-1 h-5 bg-cyan-300 rounded-full animate-[bounce_0.6s_ease-in-out_infinite_0.25s]" />
              <span className="w-1 h-3 bg-emerald-400 rounded-full animate-[bounce_0.4s_ease-in-out_infinite_0.05s]" />
            </div>
          )}
        </div>
      </div>

      {/* 3. Floating Spoken Speech Banner (Chỉ hiện khi đang nói hoặc vừa nói xong) */}
      <div className="w-full max-w-[390px] px-3.5 pb-2 z-20">
        {currentSpokenText ? (
          <div className="bg-slate-900/90 border border-amber-400/40 rounded-2xl p-3 shadow-xl backdrop-blur-md text-amber-50 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between text-[11px] text-amber-300 font-extrabold pb-1 border-b border-amber-500/20">
              <span className="flex items-center gap-1">
                <span>🎙️ Lời {currentGender === 'male' ? 'Thầy Giáo' : 'Cô Giáo'}:</span>
                {activeTopicLabel && <span className="text-amber-100 font-normal truncate max-w-[180px]">({activeTopicLabel})</span>}
              </span>
              <div className="flex items-center gap-1">
                {isSpeaking ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onStopSpeech(); }}
                    className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] rounded-lg transition-all flex items-center gap-0.5 cursor-pointer shadow-xs"
                    title="Dừng giọng nói"
                  >
                    <VolumeX className="w-3 h-3" />
                    <span>Dừng</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onReplaySpeech(); }}
                    className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] rounded-lg transition-all flex items-center gap-0.5 cursor-pointer shadow-xs"
                    title="Nghe lại lời giảng này"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Nghe lại</span>
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs sm:text-[13px] leading-relaxed text-amber-100 font-medium select-text line-clamp-3">
              "{currentSpokenText}"
            </p>
          </div>
        ) : (
          <div className="text-center py-2 text-slate-400 text-xs font-semibold">
            <span>💡 Chạm vào {currentGender === 'male' ? 'thầy giáo' : 'cô giáo'} hoặc bấm Micro bên dưới để đàm thoại tức thì (độ trễ 0,3s)</span>
          </div>
        )}
      </div>
    </div>
  );
}
