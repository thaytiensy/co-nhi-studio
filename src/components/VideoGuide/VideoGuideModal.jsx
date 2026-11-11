import React from 'react';
import { X, ExternalLink, Film, Download } from 'lucide-react';

export default function VideoGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white text-base font-black shadow">
              🎬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm md:text-base text-slate-100">
                  Video Giới Thiệu & Hướng Dẫn Sử Dụng (6 Phút)
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Thuyết Minh Neural Nam Minh
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Toàn diện: Soạn slide 16:9, Trợ giảng AI, Bảng vẽ 11 khối 3D, Chấm tranh TT27 & SMAS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/video-guide/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-600 transition"
              title="Mở video trong tab trình duyệt riêng"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mở Tab Riêng</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
              title="Đóng modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Embedded Video Guide Engine */}
        <div className="flex-1 w-full h-full bg-black relative">
          <iframe
            src="/video-guide/index.html"
            title="Video Giới Thiệu & Hướng Dẫn Cọ Nhí Studio"
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; microphone; camera"
          />
        </div>
      </div>
    </div>
  );
}
