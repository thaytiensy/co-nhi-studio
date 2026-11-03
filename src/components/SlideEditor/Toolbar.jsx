import React, { useRef } from 'react';
import { 
  Type, 
  Square, 
  Circle, 
  Triangle, 
  Star, 
  ArrowRight, 
  Image as ImageIcon, 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Trash2, 
  Undo2, 
  Redo2, 
  Layers, 
  ChevronDown,
  Palette,
  Maximize2
} from 'lucide-react';

export default function Toolbar({
  selectedElement,
  onUpdateElement,
  onAddText,
  onAddShape,
  onAddImage,
  onDeleteElement,
  onReorderElement,
  slideBackground,
  onChangeBackground,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenMediaModal
}) {
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onAddImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const paletteColors = [
    '#ffffff', '#f8fafc', '#fef3c7', '#dcfce7', '#e0e7ff', '#fce7f3', '#f3e8ff',
    '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6',
    '#1e293b', '#475569', '#94a3b8'
  ];

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 select-none shadow-2xs">
      {/* Left section: Insert Items */}
      <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Chèn</span>

        {/* Text Buttons */}
        <button
          onClick={() => onAddText('Tiêu Đề Mới', 32, 'bold')}
          className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-amber-50 hover:text-amber-800 border border-slate-200 rounded-lg flex items-center gap-1 transition-all"
          title="Thêm hộp chữ tiêu đề"
        >
          <Type className="w-3.5 h-3.5 text-amber-600" />
          <span>Tiêu Đề</span>
        </button>

        <button
          onClick={() => onAddText('Nội dung hướng dẫn hoặc câu hỏi thảo luận...', 18, 'normal')}
          className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-amber-50 hover:text-amber-800 border border-slate-200 rounded-lg flex items-center gap-1 transition-all"
          title="Thêm đoạn văn bản"
        >
          <span className="font-serif font-bold text-slate-500">T</span>
          <span>Văn Bản</span>
        </button>

        {/* Shapes Dropdown / Buttons */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
          <button
            onClick={() => onAddShape('roundedRect')}
            className="p-1 hover:bg-white hover:text-amber-600 rounded text-slate-600 transition-all"
            title="Thêm khung bo góc"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAddShape('circle')}
            className="p-1 hover:bg-white hover:text-amber-600 rounded text-slate-600 transition-all"
            title="Thêm hình tròn"
          >
            <Circle className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAddShape('triangle')}
            className="p-1 hover:bg-white hover:text-amber-600 rounded text-slate-600 transition-all"
            title="Thêm hình tam giác"
          >
            <Triangle className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAddShape('star')}
            className="p-1 hover:bg-white hover:text-amber-600 rounded text-slate-600 transition-all"
            title="Thêm ngôi sao"
          >
            <Star className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAddShape('arrow')}
            className="p-1 hover:bg-white hover:text-amber-600 rounded text-slate-600 transition-all"
            title="Thêm mũi tên"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Insert Image */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-all"
          title="Chèn ảnh tranh mẫu từ máy tính"
        >
          <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
          <span>Chèn Ảnh</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={handleImageUpload} 
        />

        {/* Media & YouTube */}
        {onOpenMediaModal && (
          <button
            onClick={onOpenMediaModal}
            className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-rose-50 hover:text-rose-800 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-all"
            title="Thêm nhạc, video từ máy hoặc tìm video YouTube"
          >
            <span className="text-rose-600">▶️</span>
            <span>Media & YouTube</span>
          </button>
        )}
      </div>

      {/* Center section: Formatting options for Selected Element */}
      {selectedElement ? (
        <div className="flex items-center gap-2 border-r border-slate-200 pr-3 animate-in fade-in duration-150">
          <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider mr-1">
            {selectedElement.type === 'text' ? 'Định Dạng Chữ' : 'Định Dạng Hình'}
          </span>

          {selectedElement.type === 'text' && (
            <>
              {/* Font Size */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-0.5">
                <button
                  onClick={() => onUpdateElement({ fontSize: Math.max(12, (selectedElement.fontSize || 16) - 2) })}
                  className="px-1 text-xs font-bold text-slate-600 hover:text-amber-600"
                >
                  -
                </button>
                <span className="text-xs font-bold text-slate-800 w-7 text-center">
                  {selectedElement.fontSize || 16}
                </span>
                <button
                  onClick={() => onUpdateElement({ fontSize: Math.min(96, (selectedElement.fontSize || 16) + 2) })}
                  className="px-1 text-xs font-bold text-slate-600 hover:text-amber-600"
                >
                  +
                </button>
              </div>

              {/* Bold & Italic */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                <button
                  onClick={() => onUpdateElement({ fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                  className={`p-1 rounded text-xs transition-all ${selectedElement.fontWeight === 'bold' ? 'bg-amber-200 text-amber-900 font-bold' : 'text-slate-600 hover:bg-white'}`}
                  title="In đậm"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUpdateElement({ fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })}
                  className={`p-1 rounded text-xs transition-all ${selectedElement.fontStyle === 'italic' ? 'bg-amber-200 text-amber-900 font-bold' : 'text-slate-600 hover:bg-white'}`}
                  title="In nghiêng"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Alignments */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                <button
                  onClick={() => onUpdateElement({ textAlign: 'left' })}
                  className={`p-1 rounded transition-all ${selectedElement.textAlign === 'left' ? 'bg-amber-200 text-amber-900' : 'text-slate-600 hover:bg-white'}`}
                  title="Căn trái"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUpdateElement({ textAlign: 'center' })}
                  className={`p-1 rounded transition-all ${selectedElement.textAlign === 'center' ? 'bg-amber-200 text-amber-900' : 'text-slate-600 hover:bg-white'}`}
                  title="Căn giữa"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUpdateElement({ textAlign: 'right' })}
                  className={`p-1 rounded transition-all ${selectedElement.textAlign === 'right' ? 'bg-amber-200 text-amber-900' : 'text-slate-600 hover:bg-white'}`}
                  title="Căn phải"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Text Color Picker */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500 font-bold">Màu:</span>
                <input
                  type="color"
                  value={selectedElement.color || '#000000'}
                  onChange={(e) => onUpdateElement({ color: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-slate-300 p-0"
                  title="Đổi màu chữ"
                />
              </div>
            </>
          )}

          {selectedElement.type === 'shape' && (
            <>
              {/* Shape Fill Color */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500 font-bold">Màu nền:</span>
                <input
                  type="color"
                  value={selectedElement.fill || '#3b82f6'}
                  onChange={(e) => onUpdateElement({ fill: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-slate-300 p-0"
                  title="Đổi màu nền hình"
                />
              </div>

              {/* Shape Stroke Color */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500 font-bold">Viền:</span>
                <input
                  type="color"
                  value={selectedElement.stroke || '#1d4ed8'}
                  onChange={(e) => onUpdateElement({ stroke: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-slate-300 p-0"
                  title="Đổi màu viền"
                />
              </div>
            </>
          )}

          {/* Tùy chọn định dạng cho Hình Ảnh */}
          {selectedElement.type === 'image' && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onUpdateElement({ isBackground: !selectedElement.isBackground })}
                className={`px-2 py-1 text-xs font-bold rounded-lg border transition-all ${
                  selectedElement.isBackground 
                    ? 'bg-amber-100 text-amber-900 border-amber-300' 
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                title="Đặt ảnh này phủ kín nền của slide"
              >
                {selectedElement.isBackground ? '✓ Đang làm ảnh nền' : 'Đặt làm ảnh nền'}
              </button>

              <button
                onClick={() => onUpdateElement({ x: 0, y: 0, width: 960, height: 540 })}
                className="px-2 py-1 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all"
                title="Phóng ảnh vừa khít toàn bộ slide 16:9"
              >
                Phóng toàn slide
              </button>
            </div>
          )}

          {/* Layer order & Delete */}
          <div className="flex items-center gap-1 ml-1">
            <button
              onClick={() => onReorderElement('front')}
              className="p-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              title="Đưa lên trên cùng"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteElement?.(selectedElement.id)}
              className="px-2.5 py-1 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1 font-bold transition-all shadow-2xs active:scale-95"
              title="Xóa đối tượng đang chọn (Phím Delete hoặc Backspace)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{selectedElement.type === 'image' ? 'Xóa Ảnh' : 'Xóa'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 border-r border-slate-200 pr-3">
          {/* Slide Background Color */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Nền Slide</span>
            <div className="flex items-center gap-1">
              {['#ffffff', '#fffbeb', '#f0fdf4', '#eff6ff', '#faf5ff', '#fff7ed', '#1e293b'].map((color) => (
                <button
                  key={color}
                  onClick={() => onChangeBackground(color)}
                  className={`w-5 h-5 rounded-full border border-slate-300 shadow-2xs transition-transform ${slideBackground === color ? 'scale-125 ring-2 ring-amber-500' : 'hover:scale-110'}`}
                  style={{ backgroundColor: color }}
                  title={`Màu nền: ${color}`}
                />
              ))}
              <input
                type="color"
                value={slideBackground || '#ffffff'}
                onChange={(e) => onChangeBackground(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer border border-slate-300 p-0 ml-1"
                title="Tự chọn màu nền"
              />
            </div>
          </div>
        </div>
      )}

      {/* Right section: Undo / Redo */}
      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded-lg flex items-center gap-1 text-xs font-bold transition-all ${
            canUndo ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 cursor-not-allowed'
          }`}
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-1.5 rounded-lg flex items-center gap-1 text-xs font-bold transition-all ${
            canRedo ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 cursor-not-allowed'
          }`}
          title="Làm lại (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
