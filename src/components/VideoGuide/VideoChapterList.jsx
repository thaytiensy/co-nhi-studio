import React from 'react';
import { Play, CheckCircle2, Sparkles, Clock } from 'lucide-react';

export default function VideoChapterList({
  chapters,
  currentChapterIndex,
  onSelectChapter,
  isPlaying
}) {
  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800">
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black text-slate-200 tracking-wide uppercase">
            6 Phân Hệ Cốt Lõi (6 Phút)
          </span>
        </div>
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
          Neural Audio
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 no-scrollbar">
        {chapters.map((chapter, index) => {
          const isActive = currentChapterIndex === index;
          return (
            <button
              key={chapter.id}
              onClick={() => onSelectChapter(index)}
              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 group ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-500/60 shadow-md ring-1 ring-amber-500/40'
                  : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-black transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-700 text-slate-300 group-hover:bg-slate-600'
                }`}
              >
                {isActive && isPlaying ? (
                  <span className="flex gap-0.5 items-end h-3">
                    <span className="w-0.5 h-3 bg-slate-950 animate-pulse"></span>
                    <span className="w-0.5 h-2 bg-slate-950 animate-pulse delay-75"></span>
                    <span className="w-0.5 h-3.5 bg-slate-950 animate-pulse delay-150"></span>
                  </span>
                ) : (
                  index + 1
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`text-[10px] font-extrabold tracking-wider uppercase ${
                      isActive ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    {chapter.partNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {chapter.time}
                  </span>
                </div>

                <h4
                  className={`text-xs font-bold leading-snug line-clamp-2 ${
                    isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                  }`}
                >
                  {chapter.title}
                </h4>

                <div className="flex flex-wrap gap-1 mt-2">
                  {chapter.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-400 border border-slate-700/60"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
