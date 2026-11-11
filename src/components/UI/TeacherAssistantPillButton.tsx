"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';

interface TeacherAssistantPillButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

export default function TeacherAssistantPillButton({
  onClick,
  className = '',
  size = 'md',
}: TeacherAssistantPillButtonProps): React.JSX.Element {
  const isSm = size === 'sm';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border-2 border-amber-400 shadow-lg hover:shadow-amber-500/40 flex items-center transition-all transform hover:scale-105 active:scale-95 group bg-gradient-to-r from-[#2c1504] via-[#3d1c06] to-[#1f0d02] text-white cursor-pointer ring-2 ring-amber-400/30 select-none ${
        isSm ? 'pl-1 pr-3 py-1 gap-2' : 'pl-1.5 pr-4 py-1.5 gap-2.5'
      } ${className}`}
      title="Mở Cô Trợ Giảng AI 3D (Cục bộ & SGK Kết Nối Tri Thức)"
    >
      {/* 3D Robot Teacher Avatar */}
      <div
        className={`relative rounded-full overflow-hidden border-2 border-amber-400 shadow-md shrink-0 bg-slate-950 ${
          isSm ? 'w-8 h-8' : 'w-10 h-10'
        }`}
      >
        <img
          src="/images/tro-giang-ai.jpg"
          alt="Cô Trợ Giảng AI 3D"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {/* Active Online Indicator */}
        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-white rounded-full shadow-xs" />
      </div>

      {/* Label & Subtitle */}
      <div className="flex flex-col text-left justify-center">
        <div className="flex items-center gap-1 leading-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
          <span className="text-xs md:text-[13px] font-black tracking-wide text-amber-50 drop-shadow-xs">
            Trợ Giảng AI
          </span>
        </div>
        <span className="text-[10px] md:text-[10.5px] text-amber-300 font-bold tracking-tight mt-0.5 leading-none">
          Bài Học 3D • Sư Phạm
        </span>
      </div>
    </button>
  );
}
