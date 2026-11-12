import React from 'react';
import {
  ChevronLeft, ChevronRight, Columns, ChevronDown, Volume2, Sparkles,
  Edit3, EyeOff, Gamepad2, Maximize2, Download, Printer, FileText, HelpCircle, X
} from 'lucide-react';

export default function PresentationHorizontalToolbar(props) {
  const {
    currentIndex, totalSlides, powerPointMode, onTogglePowerPointMode,
    onPrev, onNext, canPrev, canNext, currentDismissedCount, onResetDismissedShapes,
    isLaserActive, onToggleLaser, autoReadOnAdvance, onToggleAutoRead,
    speechGender, onToggleGender, isSpeaking, isSpeakingPaused, onToggleSpeak,
    onOpenAiTips, isWhiteboardOpen, onToggleWhiteboard, onBlackScreen,
    onOpenGame, onOpenSlidePicker, onExportHtml, onPrintPdf,
    showNotesOverlay, onToggleNotes, showShortcutsHelp, onToggleShortcutsHelp,
    onToggleOrientation, onCollapse, onClose
  } = props;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-full px-4 py-2 flex items-center gap-2 text-white shadow-2xl z-40 max-w-[96vw] overflow-x-auto no-scrollbar"
    >
      {/* Nút chuyển sang thanh dọc theo slide */}
      <button onClick={onToggleOrientation} className="p-1.5 rounded-full hover:bg-slate-800 text-amber-300 border border-amber-400/40" title="Chuyển thanh điều khiển dọc theo cạnh slide (không che chữ)">
        <Columns className="w-4 h-4" />
      </button>

      {/* Slide Counter */}
      <span className="text-xs font-bold text-slate-300 pr-1 border-r border-slate-700 whitespace-nowrap">
        {currentIndex + 1} / {totalSlides}
      </span>

      {/* Prev / Next */}
      <div className="flex items-center gap-0.5">
        <button onClick={onPrev} disabled={!canPrev} className={`p-1.5 rounded-full ${!canPrev ? 'text-slate-600' : 'hover:bg-slate-700 text-white cursor-pointer'}`} title="Lùi lại một bước">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={onNext} disabled={!canNext} className={`p-1.5 rounded-full ${!canNext ? 'text-slate-600' : 'hover:bg-slate-700 text-white cursor-pointer'}`} title="Tiến lên một bước">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Bật/Tắt PowerPoint Mode */}
      <button onClick={onTogglePowerPointMode} className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${powerPointMode ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:text-white'}`} title="Bật/Tắt chế độ trình chiếu từng bước">
        <span>🎬 {powerPointMode ? 'Từng Bước' : 'Chiếu Trọn Vẹn'}</span>
      </button>

      {/* Khôi phục hình đã che */}
      {currentDismissedCount > 0 && (
        <button onClick={onResetDismissedShapes} className="px-2 py-1 text-xs font-bold rounded-full bg-amber-500/30 text-amber-300 border border-amber-400/50 hover:bg-amber-500/50 flex items-center gap-1" title="Khôi phục các hình che">
          <span>🔄 Hiện lại ({currentDismissedCount})</span>
        </button>
      )}

      {/* Laser & Tự đọc */}
      <button onClick={onToggleLaser} className={`px-2 py-1 text-xs font-bold rounded-full flex items-center gap-1 border ${isLaserActive ? 'bg-red-500/20 text-red-400 border-red-500/60 ring-2 ring-red-500/40' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`} title="Bật/Tắt con trỏ Laser (Phím L)">
        <span>🔴 Laser</span>
      </button>

      <button onClick={onToggleAutoRead} className={`px-2 py-1 text-xs font-bold rounded-full flex items-center gap-1 border ${autoReadOnAdvance ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' : 'bg-slate-800 text-slate-400 border-slate-700'}`} title="Bật/Tắt tự động đọc chữ khi chuyển bước">
        <span>{autoReadOnAdvance ? '🔊 Tự Đọc' : '🔇 Tắt Đọc'}</span>
      </button>

      {/* Giọng Thầy/Cô */}
      <button onClick={onToggleGender} className="px-2 py-1 text-xs font-bold rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center gap-1" title="Đổi giọng đọc Thầy/Cô">
        <span>{speechGender === 'female' ? '👩 Cô' : '👨 Thầy'}</span>
      </button>

      {/* Đọc Lời Giảng */}
      <button onClick={onToggleSpeak} className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${isSpeaking && !isSpeakingPaused ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`} title="Đọc lời giảng trang slide">
        <Volume2 className="w-3.5 h-3.5" />
        <span>{isSpeaking && !isSpeakingPaused ? 'Tạm dừng' : 'Đọc lời giảng'}</span>
      </button>

      {/* Gợi Ý AI & Vẽ Thị Phạm */}
      <button onClick={onOpenAiTips} className="px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white" title="Gợi ý AI (Phím A)">
        <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
        <span>Gợi Ý AI</span>
      </button>

      <button onClick={onToggleWhiteboard} className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${isWhiteboardOpen ? 'bg-emerald-600 text-white ring-2 ring-emerald-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`} title="Mở bảng vẽ thị phạm nhanh (Phím W)">
        <Edit3 className="w-3.5 h-3.5 text-amber-300" />
        <span>Vẽ thị phạm</span>
      </button>

      {/* Màn hình đen & Trò chơi */}
      <button onClick={onBlackScreen} className="p-1.5 rounded-full hover:bg-slate-700 text-slate-300" title="Tắt màn hình tập trung (Phím B)">
        <EyeOff className="w-4 h-4" />
      </button>

      <button onClick={onOpenGame} className="px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white" title="Mở trò chơi mĩ thuật">
        <Gamepad2 className="w-3.5 h-3.5 text-amber-300" />
        <span>Trò Chơi</span>
      </button>

      {/* Slide Picker & Fullscreen */}
      <button onClick={onOpenSlidePicker} className="px-2 py-1 text-xs font-bold rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700" title="Chọn nhanh slide (Phím G)">
        <span>🖼️ Slide</span>
      </button>

      <button onClick={toggleFullscreen} className="p-1.5 rounded-full hover:bg-slate-700 text-slate-300" title="Toàn màn hình (Phím F)">
        <Maximize2 className="w-4 h-4" />
      </button>

      {/* HTML USB & Print PDF */}
      <button onClick={onExportHtml} className="px-2 py-1 text-xs font-bold rounded-full bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 flex items-center gap-1" title="Xuất HTML cắm USB offline">
        <Download className="w-3.5 h-3.5 text-sky-400" />
        <span>HTML USB</span>
      </button>

      <button onClick={onPrintPdf} className="p-1.5 rounded-full hover:bg-slate-700 text-emerald-400" title="In / Lưu PDF 16:9">
        <Printer className="w-4 h-4" />
      </button>

      {/* Ghi chú & Phím tắt */}
      <button onClick={onToggleNotes} className={`p-1.5 rounded-full ${showNotesOverlay ? 'text-amber-400 bg-slate-800' : 'text-slate-300 hover:bg-slate-700'}`} title="Xem ghi chú sư phạm">
        <FileText className="w-4 h-4" />
      </button>

      <button onClick={onToggleShortcutsHelp} className="p-1.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-amber-300" title="Phím tắt đứng lớp (?)">
        <HelpCircle className="w-4 h-4" />
      </button>

      {/* Thu gọn & Thoát */}
      <button onClick={onCollapse} className="p-1.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white" title="Thu gọn thanh điều khiển">
        <ChevronDown className="w-4 h-4" />
      </button>

      <button onClick={onClose} className="p-1.5 rounded-full hover:bg-rose-600 text-slate-300 hover:text-white ml-1" title="Thoát trình chiếu (Esc)">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
