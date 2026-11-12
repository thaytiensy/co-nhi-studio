import React, { useState } from 'react';
import { X, ExternalLink, FileText, Download } from 'lucide-react';
import { VIDEO_CHAPTERS } from './videoGuideData';
import VideoPlayerStage from './VideoPlayerStage';
import VideoChapterList from './VideoChapterList';
import { downloadAppDescriptionWordDoc } from '../../utils/appDescriptionWordService';

export default function VideoGuideModal({ isOpen, onClose, onNavigateTab }) {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen) return null;

  const currentChapter = VIDEO_CHAPTERS[currentChapterIndex] || VIDEO_CHAPTERS[0];

  const handleNextChapter = () => {
    setCurrentChapterIndex((prev) => (prev + 1) % VIDEO_CHAPTERS.length);
  };

  const handlePrevChapter = () => {
    setCurrentChapterIndex((prev) => (prev - 1 + VIDEO_CHAPTERS.length) % VIDEO_CHAPTERS.length);
  };

  const handleSelectChapter = (index) => {
    setCurrentChapterIndex(index);
    setIsPlaying(true);
  };

  const handleDownloadWordDoc = () => {
    downloadAppDescriptionWordDoc();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl h-[92vh] max-h-[850px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-4 py-3 bg-slate-800/95 border-b border-slate-700/80 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white text-base font-black shadow">
              🎬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm md:text-base text-slate-100">
                  Video Hướng Dẫn & Bộ Mô Tả Ứng Dụng (6 Phút)
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Chuẩn GDPT 2018
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Toàn diện 6 phân hệ: Soạn Slide 16:9, Trợ Giảng AI 3D, Bảng Vẽ 11 Khối 3D, Cam Chấm Tranh TT27 & SMAS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tải File Mô Tả App Word (.doc) Button */}
            <button
              onClick={handleDownloadWordDoc}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-sm transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer border border-indigo-400/30"
              title="Tải toàn bộ tài liệu mô tả ứng dụng và hướng dẫn sử dụng định dạng Microsoft Word (.doc)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tải Mô Tả App Word (.doc)</span>
              <span className="sm:hidden">Tải Word</span>
            </button>

            <a
              href="/video-guide/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-600 transition"
              title="Mở video trong tab trình duyệt riêng biệt"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Tab Riêng</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split view Player + Playlist */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          <div className="flex-1 flex flex-col min-w-0 h-full">
            <VideoPlayerStage
              chapter={currentChapter}
              onNextChapter={handleNextChapter}
              onPrevChapter={handlePrevChapter}
              onNavigateTab={(tab) => {
                if (onNavigateTab) onNavigateTab(tab);
                onClose();
              }}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
            />
          </div>

          <div className="w-full md:w-80 lg:w-96 h-56 md:h-full shrink-0">
            <VideoChapterList
              chapters={VIDEO_CHAPTERS}
              currentChapterIndex={currentChapterIndex}
              onSelectChapter={handleSelectChapter}
              isPlaying={isPlaying}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
