import React from 'react';

export default function PPTXPreviewSlideCanvas({ slide, selectedPreviewIndex }) {
  if (!slide) return null;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-6 bg-slate-100/60 font-times-new-roman" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      {/* 16:9 Preview Frame of Selected Slide */}
      <div className="w-full aspect-video bg-white rounded-xl shadow-md border border-slate-300 relative overflow-hidden flex items-center justify-center mb-6">
        <div
          className="absolute inset-0 pointer-events-none transform origin-top-left"
          style={{
            transform: 'scale(0.55)',
            width: '960px',
            height: '540px',
            backgroundColor: slide.background || '#ffffff',
          }}
        >
          {slide.elements?.map((el) => {
            if (el.type === 'text') {
              return (
                <div
                  key={el.id}
                  style={{
                    position: 'absolute',
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width}px`,
                    fontSize: `${Math.max(14, el.fontSize || 16)}px`,
                    fontFamily: el.fontFamily ? `"${el.fontFamily}", 'Times New Roman', Times, serif` : "'Times New Roman', Times, serif",
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
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#065f46', marginBottom: '4px' }}>
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
      {slide.notes && (
        <div className="mb-6 p-4 bg-amber-50/80 border border-amber-200 rounded-xl">
          <span className="text-[14px] font-bold text-amber-900 flex items-center gap-1.5 mb-1.5">
            <span>📝</span> Ghi Chú Lời Giảng Của Trang {selectedPreviewIndex + 1}:
          </span>
          <p className="text-[14px] text-amber-950 whitespace-pre-wrap leading-relaxed">
            {slide.notes}
          </p>
        </div>
      )}
    </div>
  );
}
