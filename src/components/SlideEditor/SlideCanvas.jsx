import React, { useRef, useState, useEffect } from 'react';
import { 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Image as ImageIcon, 
  Maximize2, 
  Minimize2,
  Layers,
  Sparkles 
} from 'lucide-react';
import SlideGameWidget from '../ArtGames/SlideGameWidget';

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

export default function SlideCanvas({
  slide,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onReorderElement,
  onDeselect,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const replaceImageInputRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [editingTextId, setEditingTextId] = useState(null);

  // Dragging / Resizing states
  const [isDragging, setIsDragging] = useState(false);
  const [dragAction, setDragAction] = useState(null); // 'move' or 'resize-se', etc.
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [originalElement, setOriginalElement] = useState(null);

  // Dynamic responsive scale calculation with ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const { clientWidth, clientHeight } = container;
      const paddingX = 24;
      const paddingY = 24;
      const availableWidth = Math.max(100, clientWidth - paddingX);
      const availableHeight = Math.max(100, clientHeight - paddingY);

      const scaleX = availableWidth / CANVAS_WIDTH;
      const scaleY = availableHeight / CANVAS_HEIGHT;
      // Bảo đảm vừa khít trong khung, tỉ lệ 16:9, không bao giờ tràn ngang
      const calculatedScale = Math.min(scaleX, scaleY, 1.15);
      setScale(Math.max(calculatedScale, 0.15));
    };

    updateScale();
    const ro = new ResizeObserver(() => updateScale());
    ro.observe(container);
    window.addEventListener('resize', updateScale);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  const selectedElement = slide?.elements?.find(el => el.id === selectedElementId);

  // Mouse Down for moving element
  const handleElementMouseDown = (e, el) => {
    e.stopPropagation();
    onSelectElement(el.id);
    if (editingTextId === el.id) return; // Don't drag while editing text

    setIsDragging(true);
    setDragAction('move');
    setStartPos({ x: e.clientX, y: e.clientY });
    setOriginalElement({ ...el });
  };

  // Mouse Down for resize handles
  const handleResizeMouseDown = (e, handleType) => {
    e.stopPropagation();
    if (!selectedElement) return;

    setIsDragging(true);
    setDragAction(`resize-${handleType}`);
    setStartPos({ x: e.clientX, y: e.clientY });
    setOriginalElement({ ...selectedElement });
  };

  // Global Mouse Move
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !originalElement || !selectedElementId) return;

      const deltaX = (e.clientX - startPos.x) / scale;
      const deltaY = (e.clientY - startPos.y) / scale;

      if (dragAction === 'move') {
        onUpdateElement({
          x: Math.round(originalElement.x + deltaX),
          y: Math.round(originalElement.y + deltaY),
        });
      } else if (dragAction?.startsWith('resize-')) {
        const handle = dragAction.replace('resize-', '');
        let newWidth = originalElement.width;
        let newHeight = originalElement.height;
        let newX = originalElement.x;
        let newY = originalElement.y;

        if (handle.includes('e')) {
          newWidth = Math.max(30, originalElement.width + deltaX);
        }
        if (handle.includes('s')) {
          newHeight = Math.max(30, originalElement.height + deltaY);
        }
        if (handle.includes('w')) {
          const possibleWidth = originalElement.width - deltaX;
          if (possibleWidth > 30) {
            newWidth = possibleWidth;
            newX = originalElement.x + deltaX;
          }
        }
        if (handle.includes('n')) {
          const possibleHeight = originalElement.height - deltaY;
          if (possibleHeight > 30) {
            newHeight = possibleHeight;
            newY = originalElement.y + deltaY;
          }
        }

        onUpdateElement({
          width: Math.round(newWidth),
          height: Math.round(newHeight),
          x: Math.round(newX),
          y: Math.round(newY),
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragAction(null);
        setOriginalElement(null);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragAction, startPos, originalElement, scale, selectedElementId]);

  const renderShape = (el) => {
    // 1. Hình vẽ tự do / Vector Path trích xuất từ PowerPoint (custGeom)
    if (el.customPath) {
      return (
        <svg className="w-full h-full" viewBox={el.customPath.viewBox} preserveAspectRatio="none">
          <path
            d={el.customPath.d}
            fill={el.fill && el.fill !== 'transparent' ? el.fill : 'none'}
            stroke={el.stroke || el.fill || '#1e293b'}
            strokeWidth={Math.max(2, el.strokeWidth || 3)}
            strokeDasharray={el.strokeDash}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={el.opacity ?? 1}
          />
        </svg>
      );
    }

    switch (el.shapeType) {
      case 'circle':
        return (
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              fill={el.fill && el.fill !== 'transparent' ? el.fill : 'none'}
              stroke={el.stroke || '#06b6d4'}
              strokeWidth={Math.max(2, el.strokeWidth || 4)}
              strokeDasharray={el.strokeDash}
              opacity={el.opacity ?? 1}
            />
          </svg>
        );
      case 'wave':
        return (
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M 5,50 Q 16.25,12 27.5,50 T 50,50 T 72.5,50 T 95,50"
              fill="none"
              stroke={el.stroke || el.fill || '#eab308'}
              strokeWidth={Math.max(3, el.strokeWidth || 5)}
              strokeDasharray={el.strokeDash}
              strokeLinecap="round"
              opacity={el.opacity ?? 1}
            />
          </svg>
        );
      case 'zigzag':
        return (
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              points="5,82 20,18 35,82 50,18 65,82 80,18 95,82"
              fill="none"
              stroke={el.stroke || el.fill || '#ef4444'}
              strokeWidth={Math.max(3, el.strokeWidth || 5)}
              strokeDasharray={el.strokeDash}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={el.opacity ?? 1}
            />
          </svg>
        );
      case 'arc':
        return (
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M 10,85 Q 50,15 90,85"
              fill="none"
              stroke={el.stroke || el.fill || '#f59e0b'}
              strokeWidth={Math.max(3, el.strokeWidth || 5)}
              strokeDasharray={el.strokeDash}
              strokeLinecap="round"
              opacity={el.opacity ?? 1}
            />
          </svg>
        );
      case 'triangle':
        return (
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon
              points="50,5 95,95 5,95"
              fill={el.fill && el.fill !== 'transparent' ? el.fill : 'none'}
              stroke={el.stroke || (el.fill ? 'none' : '#10b981')}
              strokeWidth={el.strokeWidth || (el.fill ? 0 : 3)}
              strokeDasharray={el.strokeDash}
              opacity={el.opacity ?? 1}
            />
          </svg>
        );
      case 'star':
        return (
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon
              points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36"
              fill={el.fill && el.fill !== 'transparent' ? el.fill : 'none'}
              stroke={el.stroke || (el.fill ? 'none' : '#f59e0b')}
              strokeWidth={el.strokeWidth || (el.fill ? 0 : 3)}
              strokeDasharray={el.strokeDash}
              opacity={el.opacity ?? 1}
            />
          </svg>
        );
      case 'arrow':
        return (
          <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
            <polygon
              points="0,20 60,20 60,0 100,30 60,60 60,40 0,40"
              fill={el.fill && el.fill !== 'transparent' ? el.fill : 'none'}
              stroke={el.stroke || (el.fill ? 'none' : '#6366f1')}
              strokeWidth={el.strokeWidth || (el.fill ? 0 : 3)}
              strokeDasharray={el.strokeDash}
              opacity={el.opacity ?? 1}
            />
          </svg>
        );
      case 'line':
        return (
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line
              x1={el.width >= el.height ? 0 : 50}
              y1={el.width >= el.height ? 50 : 0}
              x2={el.width >= el.height ? 100 : 50}
              y2={el.width >= el.height ? 50 : 100}
              stroke={el.stroke || el.fill || '#1e293b'}
              strokeWidth={Math.max(3, el.strokeWidth || 4)}
              strokeDasharray={el.strokeDash}
              strokeLinecap="round"
            />
          </svg>
        );
      case 'roundedRect':
      default:
        return (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: el.fill || 'transparent',
              borderRadius: el.shapeType === 'roundedRect' ? '16px' : '4px',
              border: el.stroke ? `${el.strokeWidth || 2}px ${el.strokeDash ? 'dashed' : 'solid'} ${el.stroke}` : 'none',
              opacity: el.opacity ?? 1,
            }}
          />
        );
    }
  };

  return (
    <div 
      ref={containerRef}
      onClick={onDeselect}
      className="flex-1 bg-slate-200/70 overflow-hidden flex items-center justify-center p-4 relative cursor-default"
    >
      {/* 16:9 Canvas Frame */}
      <div
        ref={canvasRef}
        onClick={(e) => {
          if (e.target === canvasRef.current) {
            onDeselect();
            setEditingTextId(null);
          }
        }}
        className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-300 transition-all select-none"
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          backgroundColor: slide?.background || '#ffffff',
        }}
      >
        {/* Render Slide Elements */}
        {slide?.elements?.map((el) => {
          const isSelected = el.id === selectedElementId;
          const isEditing = el.id === editingTextId;

          return (
            <div
              key={el.id}
              onMouseDown={(e) => handleElementMouseDown(e, el)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (el.type === 'text') {
                  setEditingTextId(el.id);
                }
              }}
              className={`absolute cursor-move transition-shadow ${
                isSelected ? 'ring-2 ring-amber-500 ring-offset-1 z-30' : 'hover:ring-1 hover:ring-amber-300 z-10'
              }`}
              style={{
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: `${el.width}px`,
                height: `${el.height}px`,
              }}
            >
              {/* Text Element */}
              {el.type === 'text' && (
                <div className="w-full h-full flex flex-col justify-start">
                  {isEditing ? (
                    <textarea
                      autoFocus
                      value={el.text}
                      onChange={(e) => onUpdateElement({ text: e.target.value })}
                      onBlur={() => setEditingTextId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setEditingTextId(null);
                      }}
                      className="w-full h-full p-1 bg-white/95 border-2 border-amber-500 rounded focus:outline-none resize-none"
                      style={{
                        fontSize: `${el.fontSize || 16}px`,
                        fontWeight: el.fontWeight || 'normal',
                        fontStyle: el.fontStyle || 'normal',
                        color: el.color || '#000000',
                        textAlign: el.textAlign || 'left',
                        lineHeight: 1.25,
                      }}
                    />
                  ) : (
                    <div
                      className="w-full h-full p-1 select-none pointer-events-none break-words"
                      style={{
                        fontSize: `${el.fontSize || 16}px`,
                        fontWeight: el.fontWeight || 'normal',
                        fontStyle: el.fontStyle || 'normal',
                        textDecoration: el.textDecoration || 'none',
                        fontFamily: el.fontFamily ? `"${el.fontFamily}", 'Playpen Sans', cursive, sans-serif` : undefined,
                        color: el.color || '#000000',
                        textAlign: el.textAlign || 'left',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.25,
                      }}
                    >
                      {el.text}
                    </div>
                  )}
                </div>
              )}

              {/* Shape Element */}
              {el.type === 'shape' && (
                <div className="w-full h-full pointer-events-none">
                  {renderShape(el)}
                </div>
              )}

              {/* Image Element */}
              {el.type === 'image' && (
                <div className="relative w-full h-full group">
                  <img
                    src={el.src}
                    alt="Ảnh mĩ thuật"
                    className={`w-full h-full ${el.isBackground ? 'object-cover' : 'object-fill'} pointer-events-none select-none rounded`}
                  />
                  {/* Nút Xóa Nhanh Hiện Khi Rê Chuột Qua Ảnh Dù Chưa Chọn */}
                  {!isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteElement?.(el.id);
                      }}
                      className="absolute top-1 right-1 w-6 h-6 bg-rose-600 hover:bg-rose-700 text-white rounded-md flex items-center justify-center shadow-md border border-white opacity-0 group-hover:opacity-100 transition-opacity z-30"
                      title="Bấm để xóa ảnh này khỏi slide"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Audio Element */}
              {el.type === 'audio' && (
                <div className="w-full h-full bg-emerald-50 border-2 border-emerald-300 rounded-xl p-2 flex flex-col justify-center items-center shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 truncate mb-1">
                    <span>🎵</span>
                    <span className="truncate">{el.title || 'Nhạc Nền Tiết Học'}</span>
                  </div>
                  <audio controls src={el.src} className="w-full h-8" />
                </div>
              )}

              {/* Video Element */}
              {el.type === 'video' && (
                <div className="w-full h-full bg-black rounded-lg overflow-hidden shadow-sm flex items-center justify-center">
                  <video controls src={el.src} className="w-full h-full object-contain" />
                </div>
              )}

              {/* YouTube Element */}
              {el.type === 'youtube' && (
                <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden shadow-sm relative">
                  <iframe
                    src={el.src}
                    title="YouTube Video"
                    className="w-full h-full border-0"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Game Element on Slide */}
              {el.type === 'game' && (
                <div className="w-full h-full overflow-hidden rounded-xl shadow-lg">
                  <SlideGameWidget element={el} isPresentationMode={false} />
                </div>
              )}

              {/* Resize Handles (Only on Selected Element) */}
              {isSelected && !isEditing && (
                <>
                  {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((handle) => {
                    const positions = {
                      nw: '-top-1.5 -left-1.5 cursor-nwse-resize',
                      n: '-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize',
                      ne: '-top-1.5 -right-1.5 cursor-nesw-resize',
                      e: 'top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize',
                      se: '-bottom-1.5 -right-1.5 cursor-nwse-resize',
                      s: '-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize',
                      sw: '-bottom-1.5 -left-1.5 cursor-nesw-resize',
                      w: 'top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize',
                    };
                    return (
                      <div
                        key={handle}
                        onMouseDown={(e) => handleResizeMouseDown(e, handle)}
                        className={`absolute w-3 h-3 bg-white border-2 border-amber-600 rounded-full shadow-xs z-40 ${positions[handle]}`}
                      />
                    );
                  })}

                  {/* Nút Xóa Nhanh Ngay Góc Trên Của Ảnh Hoặc Đối Tượng (Nằm gọn bên trong để không bao giờ bị cắt ngoài mép) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteElement?.(el.id);
                    }}
                    className="absolute top-1 right-1 w-6 h-6 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-md flex items-center justify-center shadow-lg border border-white z-50 transition-all cursor-pointer"
                    title="Xóa đối tượng này khỏi slide (Phím Delete hoặc Backspace)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Thanh Công Cụ Nhanh Nổi Ngay Trên Đối Tượng Được Chọn (Tự động tránh mép trên canvas) */}
                  <div
                    className={`absolute ${el.y < 48 ? 'top-2 left-2' : '-top-11 left-0'} bg-slate-900/95 text-white rounded-xl shadow-2xl px-2.5 py-1 flex items-center gap-2 z-50 backdrop-blur-md select-none border border-slate-700/80 animate-in fade-in zoom-in-95 duration-100`}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Nút Xóa Đối Tượng */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteElement?.(el.id);
                      }}
                      className="px-2 py-0.5 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg transition-colors text-[11px] flex items-center gap-1 font-bold"
                      title="Xóa đối tượng này (Phím Delete hoặc Backspace)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>

                    <span className="w-px h-3.5 bg-slate-700" />

                    {/* Lớp hiển thị: Lên trên / Xuống dưới */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorderElement?.('front');
                      }}
                      className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                      title="Đưa lên trên cùng"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorderElement?.('back');
                      }}
                      className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                      title="Đưa xuống dưới cùng"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>

                    {/* Tùy chọn riêng cho Ảnh */}
                    {el.type === 'image' && (
                      <>
                        <span className="w-px h-3.5 bg-slate-700" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            replaceImageInputRef.current?.click();
                          }}
                          className="px-1.5 py-0.5 hover:bg-slate-700 text-emerald-300 rounded text-[11px] font-bold flex items-center gap-1"
                          title="Thay thế bằng ảnh khác từ máy tính"
                        >
                          <ImageIcon className="w-3 h-3" />
                          <span>Đổi ảnh</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateElement({ isBackground: !el.isBackground });
                          }}
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                            el.isBackground ? 'bg-amber-500 text-white' : 'hover:bg-slate-700 text-slate-300'
                          }`}
                          title="Đặt ảnh này làm nền toàn slide"
                        >
                          {el.isBackground ? 'Bỏ làm nền' : 'Làm ảnh nền'}
                        </button>
                      </>
                    )}

                    {/* Tùy chọn riêng cho Chữ */}
                    {el.type === 'text' && (
                      <>
                        <span className="w-px h-3.5 bg-slate-700" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTextId(el.id);
                          }}
                          className="px-1.5 py-0.5 hover:bg-amber-600 text-amber-300 hover:text-white rounded text-[11px] font-bold flex items-center gap-1"
                          title="Nhấp đúp hoặc bấm vào đây để sửa nội dung chữ"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Sửa chữ</span>
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Input ẩn để thay thế hình ảnh từ máy tính */}
      <input
        type="file"
        ref={replaceImageInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              onUpdateElement({ src: ev.target.result });
            };
            reader.readAsDataURL(file);
          }
        }}
      />
    </div>
  );
}
