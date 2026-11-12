import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, SkipForward, SkipBack, ExternalLink } from 'lucide-react';
import VideoVisualDemoStage from './VideoVisualDemoStage';

export default function VideoPlayerStage({
  chapter,
  onNextChapter,
  onPrevChapter,
  onNavigateTab,
  isPlaying,
  setIsPlaying
}) {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(chapter.durationSec || 60);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [chapter]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
    else audioRef.current.pause();
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    setCurrentTime(cur);
    const dur = audioRef.current.duration || chapter.durationSec || 60;
    setDuration(dur);
    const sCount = chapter.sentences.length;
    if (sCount > 0 && dur > 0) {
      setActiveSentenceIndex(Math.min(sCount - 1, Math.floor((cur / dur) * sCount)));
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const seekRelative = (sec) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + sec));
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
      <audio
        ref={audioRef}
        src={chapter.audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onNextChapter}
        muted={isMuted}
      />
      {/* 16:9 Video Canvas / Visual Demo Stage */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden bg-gradient-to-b from-slate-900 to-black">
        <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 flex flex-col items-center justify-center text-center p-2 group">
          {/* Top badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
            <span className="bg-rose-600/90 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
              {chapter.partNumber}
            </span>
            <span className="bg-slate-900/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700">
              {chapter.time}
            </span>
          </div>

          <div className="absolute top-3 right-3 z-20">
            <button
              onClick={() => onNavigateTab && onNavigateTab(chapter.targetTab)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>🚀 Thử Tính Năng Này</span>
            </button>
          </div>

          {/* Visual Concrete Demonstration Screen */}
          <div className="w-full h-full pt-8 pb-12 px-1 flex items-center justify-center">
            <VideoVisualDemoStage chapterId={chapter.id} />
          </div>

          {/* Subtitles Teleprompter */}
          <div className="absolute bottom-2.5 inset-x-4 z-20 flex justify-center">
            <div className="bg-black/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl max-w-2xl text-center shadow-xl">
              <p className="text-amber-300 font-bold text-xs sm:text-sm leading-relaxed drop-shadow">
                {chapter.sentences[activeSentenceIndex] || chapter.sentences[0]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-col gap-2">
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            if (audioRef.current) audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
          }}
          className="relative w-full h-2 bg-slate-800 rounded-full cursor-pointer overflow-hidden group"
        >
          <div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <button onClick={onPrevChapter} className="p-1.5 hover:text-white rounded-lg cursor-pointer" title="Phần trước">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={() => seekRelative(-5)} className="p-1.5 hover:text-white rounded-lg cursor-pointer" title="Lùi 5s">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition shadow cursor-pointer">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button onClick={() => seekRelative(5)} className="p-1.5 hover:text-white rounded-lg cursor-pointer" title="Tiến 5s">
              <RotateCw className="w-4 h-4" />
            </button>
            <button onClick={onNextChapter} className="p-1.5 hover:text-white rounded-lg cursor-pointer" title="Phần tiếp theo">
              <SkipForward className="w-4 h-4" />
            </button>
            <span className="font-mono text-[11px] text-slate-400 ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setIsMuted(!isMuted)} className="p-1.5 hover:text-white rounded-lg cursor-pointer" title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}>
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
