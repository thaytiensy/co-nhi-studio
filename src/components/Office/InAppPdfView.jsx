import React from 'react';
import { Upload, ExternalLink } from 'lucide-react';

export default function InAppPdfView({ docData, onUploadPdf }) {
  const pdfUrl = docData?.type === 'pdf' ? docData.url : null;
  const fileName = docData?.fileName || 'Tài Liệu Mĩ Thuật GDPT 2018 (PDF)';

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-hidden select-none">
      {/* Top Action Sub-Bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 text-white shadow-xs select-none shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center text-white text-xs font-black shadow-xs shrink-0">
            PDF
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-sm sm:max-w-md">
            {fileName}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-400/30 shrink-0">
            Trình Đọc PDF
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Mở PDF trong tab mới của trình duyệt"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mở Tab Mới</span>
            </a>
          )}

          {onUploadPdf && (
            <button
              type="button"
              onClick={onUploadPdf}
              className="px-3 py-1.5 text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-300 to-yellow-300 hover:from-amber-200 hover:to-yellow-200 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ring-1 ring-amber-400"
              title="Mở tệp PDF khác từ máy tính của Thầy/Cô"
            >
              <Upload className="w-3.5 h-3.5 text-amber-900" />
              <span>Mở File PDF Khác</span>
            </button>
          )}
        </div>
      </div>

      {/* Main PDF Frame / View */}
      <div className="flex-1 w-full h-full p-2 sm:p-4 flex items-center justify-center">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title={fileName}
            className="w-full h-full rounded-2xl border-2 border-slate-700 bg-white shadow-2xl"
          />
        ) : (
          <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-3xl p-8 text-center text-white shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-600/20 border-2 border-rose-500/40 flex items-center justify-center text-3xl mb-4 text-rose-400">
              📕
            </div>
            <h3 className="text-base font-black text-white mb-2">
              Trình Đọc Tài Liệu PDF Mĩ Thuật GDPT 2018
            </h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Hỗ trợ đọc trực tiếp Sách giáo khoa Mĩ thuật, Sách giáo viên, Thông tư 27, Công văn 2345 và mọi tài liệu tập huấn định dạng PDF ngay trong app.
            </p>
            {onUploadPdf && (
              <button
                type="button"
                onClick={onUploadPdf}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all transform active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Chọn File PDF Từ Máy Tính</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
