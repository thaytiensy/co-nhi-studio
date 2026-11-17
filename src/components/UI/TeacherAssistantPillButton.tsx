"use client";

import React from 'react';
import { Sparkles, GripVertical } from 'lucide-react';
import TeacherAvatar from './TeacherAvatar';

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

        {/* Nghệ Thuật Cọ Nhí Vector Avatar */}
        <TeacherAvatar size={isSm ? 'sm' : 'md'} />

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
          data-dismiss="true"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 hover:bg-rose-600 text-white text-[11px] font-black flex items-center justify-center border border-white shadow-md cursor-pointer transition-colors z-20"
          title="Ẩn nút trợ giảng khỏi màn hình này"
        >
          ✕
        </button>
      )}
    </div>
  );
}
