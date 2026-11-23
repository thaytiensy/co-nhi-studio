import React, { useState } from 'react';
import { X, ExternalLink, FileText, Download, Presentation, Globe, BookOpen } from 'lucide-react';
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

  const handleOpenCanva = () => {
    window.open('https://canva.link/eci6lflrsyyf8ke', '_blank', 'noopener,noreferrer');
  };

  const handleDownloadPptx = () => {
    const link = document.createElement('a');
    link.href = '/Huong_Dan_Su_Dung_Co_Nhi_Studio.pptx';
    link.download = 'Huong_Dan_Su_Dung_Co_Nhi_Studio.pptx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadWordDoc = () => {
    const link = document.createElement('a');
    link.href = '/Ban_Mo_Ta_Phan_Mem_Va_Huong_Dan_Su_Dung_Co_Nhi_Studio.doc';
    link.download = 'Ban_Mo_Ta_Phan_Mem_Va_Huong_Dan_Su_Dung_Co_Nhi_Studio.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl h-[92vh] max-h-[850px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-4 py-3 bg-slate-800/95 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white text-lg font-black shadow">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm md:text-base text-slate-100">
                  Cẩm Nang & Hướng Dẫn Sử Dụng Cọ Nhí Studio
                </h3>
                <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  GDPT 2018
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Đầy đủ 6 phân hệ • Slide Canva Online • Tệp PowerPoint (.pptx) • Văn bản Word (.doc) & Video giọng đọc AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* 1. Mở Slide Canva Online */}
            <button
              onClick={handleOpenCanva}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-sm transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer border border-teal-400/30"
              title="Mở xem & trình chiếu bộ slide hướng dẫn trực tuyến trên Canva"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Slide Canva Online</span>
            </button>

            {/* 2. Tải Tệp PowerPoint PPTX */}
            <button
              onClick={handleDownloadPptx}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-sm transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer border border-amber-400/30"
              title="Tải bộ slide PowerPoint hướng dẫn chuẩn 16:9 về máy tính"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Tải Slide PPTX</span>
            </button>

            {/* 3. Tải File Mô Tả App Word (.doc) Button */}
            <button
              onClick={handleDownloadWordDoc}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-sm transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer border border-indigo-400/30"
              title="Tải toàn bộ tài liệu mô tả ứng dụng và hướng dẫn sử dụng định dạng Microsoft Word (.doc chuẩn Nghị định 30)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Hướng Dẫn Word (.doc)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer ml-1"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resource Shortcut Bar */}
        <div className="bg-slate-800/60 border-b border-slate-700/60 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">💡 Tài liệu đi kèm:</span>
            <span>Slide Canva trực tuyến, Tệp PowerPoint 16:9, Văn bản Word chuẩn NĐ 30/2020/NĐ-CP & Audio giọng đọc AI Nam Minh.</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <span>🔒 Bảo mật: Đã giấu thông tin cá nhân</span>
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
