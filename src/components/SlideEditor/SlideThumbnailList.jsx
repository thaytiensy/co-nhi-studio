import React, { useState } from 'react';
import { Plus, Copy, Trash2, ArrowUp, ArrowDown, LayoutTemplate } from 'lucide-react';
import { SLIDE_TEMPLATES } from '../../data/slideTemplates';

export default function SlideThumbnailList({
  slides,
  currentSlideIndex,
  onSelectSlide,
  onAddSlide,
  onAddSlideFromTemplate,
  onDuplicateSlide,
  onDeleteSlide,
  onMoveSlide,
}) {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      onMoveSlide(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
  };

  return (
    <aside className="w-60 md:w-64 bg-slate-100/90 border-r border-slate-200 flex flex-col h-full select-none shrink-0 overflow-hidden">
      {/* Top action bar: Add slide & Templates */}
      <div className="p-3 border-b border-slate-200 bg-white flex items-center justify-between gap-2 shadow-2xs shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-extrabold text-xs text-slate-700 uppercase tracking-wider truncate">Slide</span>
          <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
            {slides.length}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="px-2 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1 transition-all"
            title="Thêm slide theo mẫu giáo án chuẩn"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Mẫu</span>
          </button>

          <button
            onClick={() => onAddSlide()}
            className="px-2 py-1 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg flex items-center gap-1 shadow-2xs transition-all"
            title="Thêm một trang slide mới trống"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm</span>
          </button>
        </div>
      </div>

      {/* Slide Thumbnails Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {slides.map((slide, index) => {
          const isSelected = index === currentSlideIndex;
          // Lấy tiêu đề slide tự nhiên không bị cắt
          const titleText = slide.elements?.find(e => e.type === 'text' && e.text?.trim())?.text?.split('\n')[0] || `Trang ${index + 1}`;

          return (
            <div
              key={slide.id || index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onClick={() => onSelectSlide(index)}
              className={`group relative rounded-xl transition-all cursor-pointer p-2 ${
                isSelected 
                  ? 'bg-amber-100/90 ring-2 ring-amber-500 shadow-sm' 
                  : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-300'
              }`}
            >
              {/* Header inside thumbnail: Slide number & Title & Actions */}
              <div className="flex items-center justify-between mb-1.5 px-0.5 gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className={`text-[11px] font-black shrink-0 px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {index + 1}
                  </span>
                  <span 
                    className={`text-xs font-bold truncate ${isSelected ? 'text-amber-900' : 'text-slate-800'}`}
                    title={titleText}
                  >
                    {titleText}
                  </span>
                </div>

                {/* Quick actions on hover */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {index > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onMoveSlide(index, index - 1); }}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600"
                      title="Chuyển lên trên"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                  )}
                  {index < slides.length - 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onMoveSlide(index, index + 1); }}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600"
                      title="Chuyển xuống dưới"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); onDuplicateSlide(index); }}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600"
                    title="Nhân bản slide này"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {slides.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteSlide(index); }}
                      className="p-1 hover:bg-rose-100 rounded text-rose-600"
                      title="Xóa slide này"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* 16:9 Thumbnail Canvas Preview using SVG viewBox - Auto Scale, 0 Clipping */}
              <div className="w-full aspect-video rounded-lg border border-slate-200/80 overflow-hidden shadow-2xs relative bg-white">
                <svg
                  viewBox="0 0 960 540"
                  className="w-full h-full block pointer-events-none select-none"
                  style={{ backgroundColor: slide.background || '#ffffff' }}
                >
                  {/* Background rect */}
                  <rect width="960" height="540" fill={slide.background || '#ffffff'} />

                  {/* Render elements in 960x540 coordinates */}
                  {slide.elements && slide.elements.map((el) => {
                    if (el.type === 'shape') {
                      if (el.shapeType === 'circle') {
                        return (
                          <ellipse
                            key={el.id}
                            cx={el.x + el.width / 2}
                            cy={el.y + el.height / 2}
                            rx={el.width / 2}
                            ry={el.height / 2}
                            fill={el.fill || '#cbd5e1'}
                            opacity={el.opacity ?? 1}
                          />
                        );
                      }
                      if (el.shapeType === 'triangle') {
                        const p1 = `${el.x + el.width / 2},${el.y}`;
                        const p2 = `${el.x + el.width},${el.y + el.height}`;
                        const p3 = `${el.x},${el.y + el.height}`;
                        return (
                          <polygon
                            key={el.id}
                            points={`${p1} ${p2} ${p3}`}
                            fill={el.fill || '#10b981'}
                            opacity={el.opacity ?? 1}
                          />
                        );
                      }
                      return (
                        <rect
                          key={el.id}
                          x={el.x}
                          y={el.y}
                          width={el.width}
                          height={el.height}
                          rx={el.shapeType === 'roundedRect' ? 16 : 4}
                          fill={el.fill || '#f1f5f9'}
                          stroke={el.stroke || 'none'}
                          strokeWidth={el.strokeWidth || 0}
                          opacity={el.opacity ?? 1}
                        />
                      );
                    }

                    if (el.type === 'text') {
                      const lines = (el.text || '').split('\n').slice(0, 4);
                      const fontSize = Math.max(14, el.fontSize || 16);
                      const lineHeight = fontSize * 1.25;

                      return (
                        <g key={el.id}>
                          {lines.map((line, lIdx) => (
                            <text
                              key={lIdx}
                              x={el.textAlign === 'center' ? el.x + el.width / 2 : el.x}
                              y={el.y + fontSize + lIdx * lineHeight}
                              fontSize={fontSize}
                              fontWeight={el.fontWeight || 'normal'}
                              fill={el.color || '#1e293b'}
                              textAnchor={el.textAlign === 'center' ? 'middle' : 'start'}
                            >
                              {line.length > 60 ? line.slice(0, 60) + '...' : line}
                            </text>
                          ))}
                        </g>
                      );
                    }

                    if (el.type === 'image' && el.src) {
                      return (
                        <image
                          key={el.id}
                          href={el.src}
                          x={el.x}
                          y={el.y}
                          width={el.width}
                          height={el.height}
                          preserveAspectRatio="none"
                        />
                      );
                    }

                    if (el.type === 'video') {
                      return (
                        <g key={el.id}>
                          <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="#090d16" rx="6" />
                          <circle cx={el.x + el.width / 2} cy={el.y + el.height / 2} r="22" fill="#ef4444" opacity="0.9" />
                          <polygon 
                            points={`${el.x + el.width / 2 - 6},${el.y + el.height / 2 - 10} ${el.x + el.width / 2 + 10},${el.y + el.height / 2} ${el.x + el.width / 2 - 6},${el.y + el.height / 2 + 10}`} 
                            fill="#ffffff" 
                          />
                        </g>
                      );
                    }

                    if (el.type === 'audio') {
                      return (
                        <g key={el.id}>
                          <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="#ecfdf5" stroke="#10b981" strokeWidth="2" rx="10" />
                          <text x={el.x + 14} y={el.y + el.height / 2 + 5} fontSize="15" fontWeight="bold" fill="#065f46">
                            🎵 {el.title || 'Nhạc Nền'}
                          </text>
                        </g>
                      );
                    }

                    return null;
                  })}
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <LayoutTemplate className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-800">Chọn Mẫu Slide Sư Phạm Mĩ Thuật</h3>
                  <p className="text-xs text-slate-500">Khung chương trình GDPT 2018 (Thiết kế chuẩn tỉ lệ 16:9)</p>
                </div>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 max-h-[60vh] overflow-y-auto p-1">
              {SLIDE_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    onAddSlideFromTemplate(tmpl);
                    setShowTemplateModal(false);
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 cursor-pointer transition-all group flex flex-col justify-between"
                  style={{ backgroundColor: tmpl.background }}
                >
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 group-hover:text-amber-800">
                      {tmpl.name}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {tmpl.description}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/50">
                    <span className="text-[11px] font-semibold text-amber-700">
                      {tmpl.elements.length} đối tượng mĩ thuật
                    </span>
                    <span className="text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                      Chọn mẫu →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
