import React from 'react';
import {
  ChevronUp, ChevronDown, Rows, PanelRight, Volume2, Sparkles,
  Edit3, EyeOff, Gamepad2, Maximize2, Download, Printer, FileText, HelpCircle, X
} from 'lucide-react';

export default function PresentationVerticalToolbar(props) {
  const {
    currentIndex, totalSlides, powerPointMode, onTogglePowerPointMode,
    onPrev, onNext, canPrev, canNext, currentDismissedCount, onResetDismissedShapes,
    isLaserActive, onToggleLaser, autoReadOnAdvance, onToggleAutoRead,
    speechGender, onToggleGender, isSpeaking, isSpeakingPaused, onToggleSpeak,
    onOpenAiTips, isWhiteboardOpen, onToggleWhiteboard, onBlackScreen,
    onOpenGame, onOpenSlidePicker, onExportHtml, onPrintPdf,
    showNotesOverlay, onToggleNotes, showShortcutsHelp, onToggleShortcutsHelp,
    onToggleOrientation, onCollapse, onClose, dockSide = 'right'
  } = props;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`fixed ${dockSide === 'left' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-1.5 flex flex-col items-center gap-1.5 text-white shadow-2xl z-40 max-h-[92vh] overflow-y-auto no-scrollbar`}
    >
      {/* Header: Đếm slide & nút thu gọn */}
      <div className="flex flex-col items-center pb-1 border-b border-slate-800 w-full gap-1">
        <button onClick={onCollapse} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-300" title="Thu gọn thanh công cụ">
          <PanelRight className="w-3.5 h-3.5" />
        </button>
        <span className="text-[11px] font-black text-amber-300 tracking-wider">{currentIndex + 1}/{totalSlides}</span>
      </div>

      {/* Điều hướng Trước / Sau */}
      <div className="flex flex-col items-center gap-0.5 pb-1 border-b border-slate-800 w-full">
        <button onClick={onPrev} disabled={!canPrev} className={`p-1.5 rounded-lg transition-colors ${!canPrev ? 'text-slate-600 cursor-not-allowed' : 'hover:bg-slate-800 text-white cursor-pointer'}`} title="Trang trước (Mũi tên Trái / Lên)">
          <ChevronUp className="w-4 h-4" />
        </button>
        <button onClick={onNext} disabled={!canNext} className={`p-1.5 rounded-lg transition-colors ${!canNext ? 'text-slate-600 cursor-not-allowed' : 'hover:bg-slate-800 text-white cursor-pointer'}`} title="Trang kế tiếp (Mũi tên Phải / Xuống / Phím Cách)">
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Chế độ Chiếu PowerPoint */}
      <button onClick={onTogglePowerPointMode} className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all ${powerPointMode ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`} title={`Chế độ chiếu: ${powerPointMode ? 'Từng bước' : 'Chiếu trọn vẹn'}`}>
        <span>{powerPointMode ? '🎬' : '🎞️'}</span>
      </button>

      {/* Khôi phục thẻ che nếu có */}
      {currentDismissedCount > 0 && (
        <button onClick={onResetDismissedShapes} className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/30 text-amber-300 border border-amber-400/50 hover:bg-amber-500/50 text-xs font-bold" title={`Khôi phục ${currentDismissedCount} hình đã mở`}>
          🔄{currentDismissedCount}
        </button>
      )}

      {/* Con trỏ Laser */}
      <button onClick={onToggleLaser} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isLaserActive ? 'bg-red-500/30 text-red-400 ring-2 ring-red-500/60' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`} title="Con trỏ Laser đỏ (Phím L)">
        <span className="text-sm">🔴</span>
      </button>

      {/* Tự Đọc & Giọng Thầy/Cô */}
      <button onClick={onToggleAutoRead} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all text-xs ${autoReadOnAdvance ? 'bg-emerald-500/30 text-emerald-300 ring-1 ring-emerald-400/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`} title={`Tự đọc chữ: ${autoReadOnAdvance ? 'BẬT' : 'TẮT'}`}>
        <span>{autoReadOnAdvance ? '🔊' : '🔇'}</span>
      </button>
      <button onClick={onToggleGender} className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-xs border border-slate-700/60" title={`Đổi giọng: ${speechGender === 'female' ? 'Cô giáo' : 'Thầy giáo'}`}>
        <span>{speechGender === 'female' ? '👩' : '👨'}</span>
      </button>

      {/* Đọc lời giảng trang slide */}
      <button onClick={onToggleSpeak} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isSpeaking && !isSpeakingPaused ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`} title="Đọc lời giảng trang slide này">
        <Volume2 className="w-4 h-4" />
      </button>

      {/* Gợi Ý AI & Bảng vẽ thị phạm */}
      <button onClick={onOpenAiTips} className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 text-white shadow-md" title="Gợi ý câu hỏi & bí quyết AI (Phím A)">
        <Sparkles className="w-4 h-4 text-yellow-200" />
      </button>
      <button onClick={onToggleWhiteboard} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isWhiteboardOpen ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`} title="Mở bảng vẽ thị phạm nhanh (Phím W)">
        <Edit3 className="w-4 h-4 text-amber-300" />
      </button>

      {/* Trò chơi & Màn hình đen */}
      <button onClick={onOpenGame} className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm" title="Trò chơi mĩ thuật cho cả lớp">
        <Gamepad2 className="w-4 h-4 text-amber-300" />
      </button>
      <button onClick={onBlackScreen} className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300" title="Tắt màn hình tập trung (Phím B)">
        <EyeOff className="w-4 h-4" />
      </button>

      {/* Danh sách chọn Slide & Toàn màn hình */}
      <button onClick={onOpenSlidePicker} className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700" title="Chọn nhanh slide (Phím G)">
        <span className="text-xs">🖼️</span>
      </button>
      <button onClick={toggleFullscreen} className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300" title="Toàn màn hình (Phím F)">
        <Maximize2 className="w-4 h-4" />
      </button>

      {/* Xuất USB HTML & In PDF */}
      <button onClick={onExportHtml} className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700" title="Xuất file HTML USB offline">
        <Download className="w-4 h-4 text-sky-400" />
      </button>
      <button onClick={onPrintPdf} className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-emerald-300" title="In / Lưu PDF 16:9">
        <Printer className="w-4 h-4 text-emerald-400" />
      </button>

      {/* Ghi chú & Phím tắt */}
      <button onClick={onToggleNotes} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${showNotesOverlay ? 'text-amber-400 bg-slate-800 ring-1 ring-amber-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`} title="Ghi chú sư phạm">
        <FileText className="w-4 h-4" />
      </button>
      <button onClick={onToggleShortcutsHelp} className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-300" title="Phím tắt đứng lớp (?)">
        <HelpCircle className="w-4 h-4" />
      </button>

      {/* Footer: Chuyển sang thanh ngang & Thoát */}
      <div className="flex flex-col items-center pt-1 border-t border-slate-800 w-full gap-1">
        <button onClick={onToggleOrientation} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white" title="Chuyển sang thanh ngang đáy màn hình">
          <Rows className="w-4 h-4" />
        </button>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-rose-600 text-slate-300 hover:text-white" title="Thoát trình chiếu (Esc)">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
