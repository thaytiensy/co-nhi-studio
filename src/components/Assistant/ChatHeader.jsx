"use client";

import React from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, RotateCcw, X, Sparkles } from 'lucide-react';

export default function ChatHeader({
  currentGender,
  onGenderChange,
  isAutoSpeak,
  onToggleAutoSpeak,
  isMaximized,
  onToggleMaximize,
  onResetChat,
  onReadCurrentSlide,
  onClose,
  aiProvider,
  onProviderChange,
  viewMode = 'stage',
  onToggleViewMode,
}) {
  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-700 text-white p-3.5 shadow-md shrink-0 border-b border-amber-500/40 select-none">
      <div className="flex items-center justify-between gap-2">
        {/* Avatar & Persona Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-300 shadow-md shrink-0 bg-slate-950">
            <img
              src="/images/tro-giang-ai.jpg"
              alt="Cô Trợ Giảng AI"
              className="w-full h-full object-cover"
            />
            {/* Live Green Pulse Online Dot */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full shadow-xs animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-black text-xs sm:text-sm text-white tracking-wide truncate flex items-center gap-1">
                <span>{currentGender === 'male' ? 'Thầy Trợ Giảng AI 3D' : 'Cô Trợ Giảng AI 3D'}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
              </h3>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-white/20 text-amber-100 border border-white/30">
                GDPT 2018
              </span>
            </div>
            <p className="text-[10px] text-amber-100/90 font-medium truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block" />
              <span>Trực tuyến • Đàm thoại sư phạm Kết Nối Tri Thức</span>
            </p>
          </div>
        </div>

        {/* Action Window Controls (Reset, Maximize, Close) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onResetChat}
            className="p-1.5 text-amber-100 hover:text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer"
            title="Làm mới cuộc trò chuyện"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onToggleMaximize}
            className="p-1.5 text-amber-100 hover:text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer hidden sm:block"
            title={isMaximized ? "Thu nhỏ cửa sổ" : "Phóng to toàn chiều cao"}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-amber-100 hover:text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer"
              title="Đóng hộp thoại Trợ Giảng"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sub-bar: Audio Toggle & Quick AI Mode Switcher */}
      <div className="mt-2.5 pt-2 border-t border-amber-500/30 flex items-center justify-between gap-1.5 flex-wrap text-xs">
        {/* Voice Gender & Auto Speak Toggle */}
        <div className="flex items-center gap-1">
          <div className="flex items-center bg-black/20 rounded-lg p-0.5 border border-white/20 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => onGenderChange('male')}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                currentGender === 'male' ? 'bg-amber-400 text-slate-900 font-black shadow-xs' : 'text-amber-100 hover:text-white'
              }`}
              title="Giọng Thầy giáo (Nam Minh)"
            >
              👨 Thầy
            </button>
            <button
              type="button"
              onClick={() => onGenderChange('female')}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                currentGender === 'female' ? 'bg-amber-400 text-slate-900 font-black shadow-xs' : 'text-amber-100 hover:text-white'
              }`}
              title="Giọng Cô giáo (Hoài My)"
            >
              👩 Cô
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleAutoSpeak}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
              isAutoSpeak
                ? 'bg-emerald-500/90 text-white border-emerald-300 shadow-xs'
                : 'bg-white/15 text-amber-100 border-white/20 hover:bg-white/25'
            }`}
            title="Tự động đọc phản hồi bằng giọng nói tiếng Việt"
          >
            {isAutoSpeak ? <Volume2 className="w-3 h-3 text-white" /> : <VolumeX className="w-3 h-3 text-amber-200" />}
            <span>{isAutoSpeak ? 'Tự đọc: Bật' : 'Tự đọc: Tắt'}</span>
          </button>
        </div>

        {/* AI Provider Switcher */}
        <div className="flex items-center bg-black/20 rounded-lg p-0.5 border border-white/20 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => onProviderChange('online')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              aiProvider === 'online' ? 'bg-white text-amber-900 font-black shadow-xs' : 'text-amber-100 hover:text-white'
            }`}
            title="Đàm thoại qua Groq Free siêu nhanh"
          >
            ⚡ Trực Tuyến
          </button>
          <button
            type="button"
            onClick={() => onProviderChange('offline')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              aiProvider === 'offline' ? 'bg-white text-amber-900 font-black shadow-xs' : 'text-amber-100 hover:text-white'
            }`}
            title="Bộ nhớ sư phạm cục bộ 100% không cần mạng"
          >
            📦 Cục Bộ
          </button>
        </div>

        {/* Chế độ xem: Robot 3D hay Văn bản */}
        {onToggleViewMode && (
          <button
            type="button"
            onClick={onToggleViewMode}
            className="px-2 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer bg-black/30 hover:bg-black/50 text-amber-200 border border-amber-400/40"
            title={viewMode === 'stage' ? "Chuyển sang xem văn bản" : "Chuyển sang Cô Giáo Robot 3D"}
          >
            <span>{viewMode === 'stage' ? '💬 Văn Bản' : '🤖 Robot 3D'}</span>
          </button>
        )}

        {/* Đọc chữ trên slide */}
        {onReadCurrentSlide && (
          <button
            type="button"
            onClick={onReadCurrentSlide}
            className="px-2 py-1 bg-white/15 hover:bg-white/25 text-amber-50 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-white/20 transition-all cursor-pointer"
            title="Đọc toàn bộ câu chữ trên trang slide hiện tại"
          >
            <Volume2 className="w-3 h-3 text-amber-200" />
            <span>Đọc Slide</span>
          </button>
        )}
      </div>
    </div>
  );
}
