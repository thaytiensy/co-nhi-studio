import React, { useState } from 'react';
import { Presentation, AlertCircle } from 'lucide-react';
import PPTXPreviewSidebar from './pptxPreview/PPTXPreviewSidebar';
import PPTXPreviewSlideCanvas from './pptxPreview/PPTXPreviewSlideCanvas';
import PPTXPreviewReport from './pptxPreview/PPTXPreviewReport';

export default function PPTXPreviewModal({
  importResult,
  onConfirmOpen,
  onClose
}) {
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);

  if (!importResult) return null;

  const { fileName, fileSize, slides, retained, omitted, success, error } = importResult;

  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!success) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
        <div 
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 font-times-new-roman"
          style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >
          <div className="flex items-center gap-3 text-rose-600 mb-4 pb-3 border-b border-slate-100">
            <AlertCircle className="w-6 h-6" />
            <h3 className="font-extrabold text-base text-slate-800">Không Thể Nhập Tệp PowerPoint</h3>
          </div>
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-[14px] text-rose-900 leading-relaxed mb-6">
            <strong>Chi tiết lỗi:</strong> {error}
          </div>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-[14px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPreviewSlide = slides[selectedPreviewIndex] || slides[0];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 font-times-new-roman"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-md text-white font-black text-lg">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-800">Bản Xem Trước Giáo Án PowerPoint</h3>
                <span className="text-[14px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  100% Cục Bộ Trên Máy
                </span>
              </div>
              <p className="text-[14px] text-slate-600 mt-0.5">
                Tệp: <strong className="text-slate-800">{fileName}</strong> ({formatSize(fileSize)}) • <strong>{slides.length} slide</strong> được trích xuất
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 font-bold text-lg cursor-pointer">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          <PPTXPreviewSidebar
            slides={slides}
            selectedPreviewIndex={selectedPreviewIndex}
            onSelectIndex={setSelectedPreviewIndex}
          />

          <div className="flex-1 flex flex-col overflow-y-auto">
            <PPTXPreviewSlideCanvas
              slide={currentPreviewSlide}
              selectedPreviewIndex={selectedPreviewIndex}
            />
            <div className="px-6 pb-6 bg-slate-100/60">
              <PPTXPreviewReport retained={retained} omitted={omitted} />
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-[14px] text-slate-600 font-medium">
            * Nhấn "Mở Để Tiếp Tục Chỉnh Sửa" để nạp toàn bộ slide này vào Cọ Nhí Studio.
          </span>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[14px] font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Hủy Bỏ
            </button>

            <button
              onClick={() => onConfirmOpen(slides, fileName)}
              className="px-5 py-2 text-[14px] font-black text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl shadow-md flex items-center gap-2 transition-all transform active:scale-98 cursor-pointer"
            >
              <Presentation className="w-4 h-4" />
              <span>Mở Giáo Án Để Tiếp Tục Chỉnh Sửa & Trình Chiếu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
