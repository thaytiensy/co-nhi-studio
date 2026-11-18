import React, { useState } from 'react';
import { 
  FileText, 
  Presentation, 
  Table, 
  FileCode, 
  Download, 
  Volume2, 
  VolumeX, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  Share2,
  Sparkles,
  Check
} from 'lucide-react';
import { speechService } from '../../utils/speechService';

export default function UniversalOfficeViewerModal({
  docData,
  onClose,
  onOpenInEditor
}) {
  const [activeSheet, setActiveSheet] = useState(docData?.sheetNames?.[0] || '');
  const [selectedSlideIdx, setSelectedSlideIdx] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!docData || !docData.success) return null;

  const { type, fileName, fileSize } = docData;

  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleSpeakText = (textToRead) => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
    } else {
      if (!textToRead) return;
      speechService.speak(textToRead);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 select-none animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-800/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-xl shadow-md border border-indigo-400/40 shrink-0">
              {type === 'pptx' && '📊'}
              {type === 'docx' && '📝'}
              {type === 'xlsx' && '📈'}
              {type === 'pdf' && '📕'}
              {type === 'txt' && '📄'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-sm sm:text-base text-white truncate max-w-md">
                  {fileName}
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {type === 'pptx' && 'PowerPoint Presentation'}
                  {type === 'docx' && 'Word Document'}
                  {type === 'xlsx' && 'Excel Spreadsheet'}
                  {type === 'pdf' && 'Tài Liệu PDF'}
                  {type === 'txt' && 'Văn Bản Thuần'}
                </span>
                <span className="text-[10px] text-slate-300 font-semibold">
                  ({formatSize(fileSize)})
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate mt-0.5">
                Đọc trực tiếp 100% trên trình duyệt • Không cần cài đặt phần mềm • Chia sẻ dùng được mọi nơi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {type === 'docx' && (
              <button
                type="button"
                onClick={() => handleSpeakText(docData.fullText)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSpeaking 
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/40'
                }`}
                title="Nghe Thầy Cọ Nhí đọc to toàn bộ văn bản giáo án"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isSpeaking ? 'Dừng Đọc' : 'Thầy Cọ Nhí Đọc'}</span>
              </button>
            )}

            {type === 'pptx' && onOpenInEditor && (
              <button
                type="button"
                onClick={() => {
                  onOpenInEditor(docData.data.slides, fileName);
                  onClose();
                }}
                className="px-3.5 py-1.5 text-xs font-black text-indigo-950 bg-gradient-to-r from-amber-300 to-yellow-300 hover:from-amber-200 hover:to-yellow-200 rounded-xl shadow-md flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer ring-2 ring-amber-400"
              >
                <Presentation className="w-4 h-4 text-indigo-900" />
                <span>Nạp Vào Trình Chiếu F5</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (isSpeaking) speechService.stop();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-lg font-bold"
              title="Đóng cửa sổ"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden bg-slate-50 flex flex-col">
          {/* 1. VIEW CHO POWERPOINT (.pptx) */}
          {type === 'pptx' && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Slide Thumbnails List */}
              <div className="w-full md:w-64 bg-slate-100 border-r border-slate-200 overflow-y-auto p-3 space-y-2 shrink-0">
                <div className="text-[12px] font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Danh Sách Slide ({docData.data.slides?.length})</span>
                </div>
                {docData.data.slides?.map((slide, idx) => (
                  <button
                    key={slide.id || idx}
                    type="button"
                    onClick={() => setSelectedSlideIdx(idx)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      selectedSlideIdx === idx
                        ? 'bg-amber-100/80 border-amber-500 shadow-sm ring-2 ring-amber-400/50'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {slide.title || `Slide ${idx + 1}`}
                    </span>
                  </button>
                ))}
              </div>

              {/* Main Slide 16:9 Stage */}
              <div className="flex-1 p-4 md:p-6 flex flex-col items-center justify-between overflow-y-auto">
                <div className="w-full max-w-3xl aspect-video rounded-2xl shadow-xl border-2 border-slate-700/30 overflow-hidden flex flex-col relative"
                     style={{ backgroundColor: docData.data.slides?.[selectedSlideIdx]?.background || '#ffffff' }}>
                  <div className="bg-slate-900/80 text-white px-3 py-1.5 flex items-center justify-between text-xs font-bold">
                    <span>Trang {selectedSlideIdx + 1} / {docData.data.slides?.length}</span>
                    <span className="text-amber-300">Chuẩn 16:9 GDPT 2018</span>
                  </div>
                  <div className="flex-1 p-6 relative flex flex-col justify-center overflow-hidden">
                    {docData.data.slides?.[selectedSlideIdx]?.elements?.map(el => {
                      if (el.type === 'text') {
                        return (
                          <div 
                            key={el.id}
                            style={{
                              fontFamily: el.fontFamily || 'Times New Roman',
                              fontSize: `${Math.max(14, el.fontSize ? Math.round(el.fontSize * 0.8) : 18)}px`,
                              fontWeight: el.fontWeight || 'normal',
                              color: el.color || '#0f172a',
                              textAlign: el.textAlign || 'left'
                            }}
                            className="my-1 whitespace-pre-wrap leading-relaxed"
                          >
                            {el.text}
                          </div>
                        );
                      }
                      if (el.type === 'image' && el.src) {
                        return (
                          <img key={el.id} src={el.src} alt="Slide media" className="max-h-48 object-contain my-2 rounded-lg mx-auto shadow-sm" />
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>

                {/* Slide Nav Buttons */}
                <div className="flex items-center gap-3 mt-4">
                  <button
                    type="button"
                    disabled={selectedSlideIdx <= 0}
                    onClick={() => setSelectedSlideIdx(Math.max(0, selectedSlideIdx - 1))}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Slide Trước</span>
                  </button>

                  <span className="text-sm font-extrabold text-slate-800">
                    {selectedSlideIdx + 1} / {docData.data.slides?.length}
                  </span>

                  <button
                    type="button"
                    disabled={selectedSlideIdx >= (docData.data.slides?.length || 1) - 1}
                    onClick={() => setSelectedSlideIdx(Math.min((docData.data.slides?.length || 1) - 1, selectedSlideIdx + 1))}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Slide Sau</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. VIEW CHO WORD (.docx) */}
          {type === 'docx' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/60">
              <div className="bg-white max-w-3xl w-full p-8 md:p-12 shadow-xl rounded-xl border border-slate-300 min-h-full font-times-new-roman leading-relaxed text-slate-900 text-[15px]">
                <h1 className="text-2xl font-black text-center text-slate-900 mb-6 uppercase tracking-wide border-b pb-4">
                  {docData.title || fileName}
                </h1>

                <div className="space-y-4">
                  {docData.items?.map((item, idx) => {
                    if (item.type === 'heading') {
                      return (
                        <h2 key={idx} className="text-lg font-black text-amber-900 mt-6 mb-2 uppercase tracking-wide">
                          {item.text}
                        </h2>
                      );
                    }
                    if (item.type === 'paragraph') {
                      return (
                        <p key={idx} className={`text-slate-800 text-[15px] leading-relaxed ${item.isBold ? 'font-bold' : ''}`}>
                          {item.text}
                        </p>
                      );
                    }
                    if (item.type === 'table') {
                      return (
                        <div key={idx} className="my-4 overflow-x-auto border border-slate-300 rounded-lg">
                          <table className="w-full text-xs text-left border-collapse">
                            <tbody>
                              {item.rows?.map((row, rIdx) => (
                                <tr key={rIdx} className={rIdx === 0 ? 'bg-amber-100/70 font-bold' : 'border-t border-slate-200'}>
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-2.5 border-r border-slate-200 last:border-r-0">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. VIEW CHO EXCEL (.xlsx) */}
          {type === 'xlsx' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Sheet selector tabs */}
              <div className="bg-slate-200 px-4 pt-2 border-b border-slate-300 flex items-center gap-2 overflow-x-auto shrink-0">
                {docData.sheetNames?.map(name => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setActiveSheet(name)}
                    className={`px-4 py-2 rounded-t-xl text-xs font-bold transition-all cursor-pointer ${
                      activeSheet === name 
                        ? 'bg-white text-emerald-800 border-t-2 border-emerald-600 shadow-xs' 
                        : 'bg-slate-300/60 hover:bg-slate-300 text-slate-700'
                    }`}
                  >
                    📊 {name}
                  </button>
                ))}
              </div>

              {/* Table Data */}
              <div className="flex-1 overflow-auto p-4 bg-white">
                {docData.sheets?.[activeSheet] ? (
                  <table className="w-full text-xs border-collapse border border-slate-300 text-slate-800">
                    <tbody>
                      {docData.sheets[activeSheet].map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx === 0 ? 'bg-emerald-50 font-black text-emerald-950 sticky top-0 border-b-2 border-emerald-300' : 'hover:bg-slate-50 border-b border-slate-200'}>
                          <td className="p-2 text-center bg-slate-100 font-bold border-r border-slate-300 w-12 text-slate-500">
                            {rIdx + 1}
                          </td>
                          {Array.isArray(row) && row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2 border-r border-slate-200 whitespace-nowrap">
                              {String(cell || '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center p-8 text-slate-400">Sheet trống hoặc không có dữ liệu.</div>
                )}
              </div>
            </div>
          )}

          {/* 4. VIEW CHO PDF (.pdf) */}
          {type === 'pdf' && (
            <div className="flex-1 w-full h-full bg-slate-800 flex items-center justify-center p-2">
              <iframe 
                src={docData.url} 
                title="Tài liệu PDF" 
                className="w-full h-full rounded-xl border border-slate-600 bg-white" 
              />
            </div>
          )}

          {/* 5. VIEW CHO TEXT (.txt) */}
          {type === 'txt' && (
            <div className="flex-1 overflow-auto p-6 bg-slate-900 text-slate-100 font-mono text-xs">
              <pre className="whitespace-pre-wrap">{docData.text}</pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            💡 Trình xem văn phòng Office Web tích hợp 100% miễn phí • Tương thích mọi hệ điều hành
          </span>

          <button
            type="button"
            onClick={() => {
              if (isSpeaking) speechService.stop();
              onClose();
            }}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
