import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon, 
  Presentation, 
  X, 
  Check, 
  Info,
  Clock,
  Layers
} from 'lucide-react';

export default function PPTXPreviewModal({
  importResult,
  onConfirmOpen,
  onClose
}) {
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);

  if (!importResult) return null;

  const { fileName, fileSize, slides, stats, retained, omitted, success, error } = importResult;

  // Format bytes to KB or MB
  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!success) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-3 text-rose-600 mb-4 pb-3 border-b border-slate-100">
            <AlertCircle className="w-6 h-6" />
            <h3 className="font-extrabold text-base text-slate-800">Không Thể Nhập Tệp PowerPoint</h3>
          </div>
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 leading-relaxed mb-6">
            <strong>Chi tiết lỗi:</strong> {error}
          </div>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
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
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-md text-white font-black text-lg">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-800">Bản Xem Trước Giáo Án PowerPoint</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  100% Cục Bộ Trên Máy
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tệp: <strong className="text-slate-700">{fileName}</strong> ({formatSize(fileSize)}) • <strong>{slides.length} slide</strong> được trích xuất
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 font-bold text-lg">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Thumbnail & Details column */}
          <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-200 bg-white">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                Danh Sách Trang Slide ({slides.length})
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {slides.map((s, idx) => {
                const isSelected = idx === selectedPreviewIndex;
                const titleText = s.elements?.find(e => e.type === 'text')?.text || `Slide ${idx + 1}`;
                const hasImg = s.elements?.some(e => e.type === 'image');
                const hasVideo = s.elements?.some(e => e.type === 'video');
                const hasAudio = s.elements?.some(e => e.type === 'audio');
                const hasNote = Boolean(s.notes && s.notes.trim());

                return (
                  <div
                    key={s.id || idx}
                    onClick={() => setSelectedPreviewIndex(idx)}
                    className={`p-2 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-amber-100/70 border-amber-500 ring-2 ring-amber-400 shadow-xs' 
                        : 'bg-white border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                      <span className={isSelected ? 'text-amber-800' : 'text-slate-700'}>
                        Trang {idx + 1}
                      </span>
                      <div className="flex items-center gap-1 text-[10px]">
                        {hasVideo && <span title="Có video nhúng">🎬</span>}
                        {hasAudio && <span title="Có nhạc/âm thanh">🎵</span>}
                        {hasImg && <span title="Có ảnh">🖼️</span>}
                        {hasNote && <span title="Có ghi chú">📝</span>}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight font-medium">
                      {titleText}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Preview Canvas & Analysis Report */}
          <div className="flex-1 flex flex-col overflow-y-auto p-6 bg-slate-100/60">
            {/* 16:9 Preview Frame of Selected Slide */}
            <div className="w-full aspect-video bg-white rounded-xl shadow-md border border-slate-300 relative overflow-hidden flex items-center justify-center mb-6">
              <div
                className="absolute inset-0 pointer-events-none transform origin-top-left"
                style={{
                  transform: 'scale(0.55)',
                  width: '960px',
                  height: '540px',
                  backgroundColor: currentPreviewSlide.background || '#ffffff',
                }}
              >
                {currentPreviewSlide.elements?.map((el) => {
                  if (el.type === 'text') {
                    return (
                      <div
                        key={el.id}
                        style={{
                          position: 'absolute',
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                          fontSize: `${el.fontSize}px`,
                          fontWeight: el.fontWeight || 'normal',
                          color: el.color || '#000000',
                          textAlign: el.textAlign || 'left',
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.25,
                        }}
                      >
                        {el.text}
                      </div>
                    );
                  }
                  if (el.type === 'shape') {
                    return (
                      <div
                        key={el.id}
                        style={{
                          position: 'absolute',
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                          height: `${el.height}px`,
                          backgroundColor: el.fill || '#cbd5e1',
                          borderRadius: el.shapeType === 'circle' ? '50%' : '8px',
                        }}
                      />
                    );
                  }
                  if (el.type === 'image') {
                    return (
                      <img
                        key={el.id}
                        src={el.src}
                        alt=""
                        style={{
                          position: 'absolute',
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                          height: `${el.height}px`,
                          objectFit: el.isBackground ? 'cover' : 'fill',
                        }}
                      />
                    );
                  }
                  if (el.type === 'video') {
                    return (
                      <div
                        key={el.id}
                        style={{
                          position: 'absolute',
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                          height: `${el.height}px`,
                          backgroundColor: '#000000',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <video controls src={el.src} poster={el.poster} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    );
                  }
                  if (el.type === 'audio') {
                    return (
                      <div
                        key={el.id}
                        style={{
                          position: 'absolute',
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                          height: `${el.height}px`,
                          backgroundColor: '#ecfdf5',
                          border: '2px solid #6ee7b7',
                          borderRadius: '12px',
                          padding: '6px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#065f46', marginBottom: '4px' }}>
                          🎵 {el.title || 'Nhạc Nền'}
                        </div>
                        <audio controls src={el.src} style={{ width: '100%', height: '32px' }} />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Speaker Notes of this slide if any */}
            {currentPreviewSlide.notes && (
              <div className="mb-6 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                  <span>📝</span> Ghi Chú Lời Giảng Của Trang {selectedPreviewIndex + 1}:
                </span>
                <p className="text-xs text-amber-950 whitespace-pre-wrap leading-relaxed">
                  {currentPreviewSlide.notes}
                </p>
              </div>
            )}

            {/* Analysis Report: Retained vs Omitted */}
            <div className="grid grid-cols-2 gap-4">
              {/* Retained components */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <h4 className="font-extrabold text-xs text-emerald-900 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Thành Phần Giữ Được:</span>
                </h4>
                <ul className="text-xs text-emerald-950 space-y-1.5">
                  {retained?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Omitted / Simplified components */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-extrabold text-xs text-slate-700 flex items-center gap-1.5 mb-2">
                  <Info className="w-4 h-4 text-slate-500" />
                  <span>Giới Hạn Cần Lưu Ý:</span>
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5">
                  {omitted?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-slate-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            * Nhấn "Mở Để Tiếp Tục Chỉnh Sửa" để nạp toàn bộ slide này vào Cọ Nhí Studio.
          </span>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Hủy Bỏ
            </button>

            <button
              onClick={() => onConfirmOpen(slides, fileName)}
              className="px-5 py-2 text-xs font-black text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl shadow-md flex items-center gap-2 transition-all transform active:scale-98"
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
