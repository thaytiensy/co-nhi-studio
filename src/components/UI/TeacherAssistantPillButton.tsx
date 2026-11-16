"use client";

import React, { useState } from 'react';
import { Sparkles, GripVertical } from 'lucide-react';

interface TeacherAssistantPillButtonProps {
  onClick: () => void;
  onDismiss?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

export default function TeacherAssistantPillButton({
  onClick,
  onDismiss,
  className = '',
  size = 'md',
}: TeacherAssistantPillButtonProps): React.JSX.Element {
  const isSm = size === 'sm';
  const [avatarSrc, setAvatarSrc] = useState('/teacher.jpg');

  return (
    <div className={`relative inline-flex items-center group/pill select-none ${className}`}>
      <button
        type="button"
        onClick={onClick}
        className={`rounded-full border-2 border-amber-400 shadow-xl hover:shadow-amber-500/40 flex items-center transition-all transform hover:scale-102 active:scale-95 group bg-gradient-to-r from-[#2c1504] via-[#3d1c06] to-[#1f0d02] text-white cursor-pointer ring-2 ring-amber-400/30 select-none ${
          isSm ? 'pl-1 pr-3 py-1 gap-2' : 'pl-1.5 pr-4 py-1.5 gap-2.5'
        }`}
        title="Mở Thầy Trợ Giảng AI Mĩ Thuật (GDPT 2018 - Giọng Nam Minh Neural)"
      >
        {/* Drag handle icon */}
        <span className="text-amber-400/60 hover:text-amber-300 cursor-grab pl-0.5" title="Kéo thả vị trí nút">
          <GripVertical className="w-3.5 h-3.5" />
        </span>

        {/* Real Teacher Portrait Avatar */}
        <div
          className={`relative rounded-full overflow-hidden border-2 border-amber-400 shadow-md shrink-0 bg-slate-900 ${
            isSm ? 'w-8 h-8' : 'w-10 h-10'
          }`}
        >
          <img
            src={avatarSrc}
            onError={() => {
              if (avatarSrc !== '/teacher_female.jpg' && avatarSrc !== '/images/tro-giang-ai.jpg') {
                setAvatarSrc('/teacher_female.jpg');
              } else if (avatarSrc === '/teacher_female.jpg') {
                setAvatarSrc('/images/tro-giang-ai.jpg');
              }
            }}
            alt="Thầy Trợ Giảng AI"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {/* Active Online Indicator */}
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-white rounded-full shadow-xs" />
        </div>

        {/* Label & Subtitle */}
        <div className="flex flex-col text-left justify-center pr-1">
          <div className="flex items-center gap-1 leading-none">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
            <span className="text-xs md:text-[13px] font-black tracking-wide text-amber-50 drop-shadow-xs">
              Thầy Trợ Giảng AI
            </span>
          </div>
          <span className="text-[10px] md:text-[10.5px] text-amber-300 font-bold tracking-tight mt-0.5 leading-none">
            Mĩ Thuật GDPT 2018
          </span>
        </div>
      </button>

      {/* Close / Dismiss button */}
      {onDismiss && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 hover:bg-rose-600 text-white text-[11px] font-black flex items-center justify-center border border-white shadow-md cursor-pointer transition-colors"
          title="Ẩn nút trợ giảng khỏi màn hình này"
        >
          ✕
        </button>
      )}
    </div>
  );
}
