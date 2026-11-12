import React from 'react';

export default function PPTXPreviewSidebar({
  slides = [],
  selectedPreviewIndex = 0,
  onSelectIndex,
}) {
  return (
    <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden font-times-new-roman" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <div className="p-3 border-b border-slate-200 bg-white">
        <span className="text-[14px] font-black text-slate-700 uppercase tracking-wider">
          Danh Sách Trang Slide ({slides.length})
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {slides.map((s, idx) => {
          const isSelected = idx === selectedPreviewIndex;
          const titleText = s.elements?.find(e => e.type === 'text')?.text || `Slide ${idx + 1}`;
          const hasImg = s.elements?.some(e => e.type === 'image');
          const hasVideo = s.elements?.some(e => e.type === 'video');
          const hasAudio = s.elements?.some(e => e.type === 'audio');
          const hasNote = Boolean(s.notes && s.notes.trim());

          return (
            <div
              key={s.id || idx}
              onClick={() => onSelectIndex(idx)}
              className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-amber-100/70 border-amber-500 ring-2 ring-amber-400 shadow-xs' 
                  : 'bg-white border-slate-200 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center justify-between text-[14px] font-bold mb-1">
                <span className={isSelected ? 'text-amber-900 font-extrabold' : 'text-slate-800'}>
                  Trang {idx + 1}
                </span>
                <div className="flex items-center gap-1 text-[14px]">
                  {hasVideo && <span title="Có video nhúng">🎬</span>}
                  {hasAudio && <span title="Có nhạc/âm thanh">🎵</span>}
                  {hasImg && <span title="Có ảnh">🖼️</span>}
                  {hasNote && <span title="Có ghi chú">📝</span>}
                </div>
              </div>
              <p className="text-[14px] text-slate-700 line-clamp-2 leading-tight font-medium">
                {titleText}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
