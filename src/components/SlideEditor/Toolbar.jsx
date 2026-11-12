import React, { useRef } from 'react';
import { 
  Type, 
  Square, 
  Circle, 
  Triangle, 
  Star, 
  ArrowRight, 
  Minus,
  Underline,
  Copy,
  Image as ImageIcon, 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Trash2, 
  Undo2, 
  Redo2, 
  Layers
} from 'lucide-react';

export default function Toolbar({
  selectedElement,
  onUpdateElement,
  onAddText,
  onAddShape,
  onAddImage,
  onDeleteElement,
  onDuplicateElement,
  onReorderElement,
  slideBackground,
  onChangeBackground,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenMediaModal,
  onEnlargeSlideText,
  isFocusMode,
  onToggleFocusMode
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

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 select-none shadow-2xs">
      {/* Left section: Insert Items */}
      <div className="flex items-center gap-2 border-r border-slate-200 pr-3">
        <span className="text-[13px] font-black text-slate-500 uppercase tracking-wider mr-1">Chèn:</span>

        {/* Text Buttons */}
        <button
          onClick={() => onAddText('Tiêu Đề Mới (Chữ To)', 36, 'bold')}
          className="px-3 py-1.5 text-[14px] md:text-[15px] font-black text-slate-800 bg-slate-50 hover:bg-amber-100 hover:text-amber-950 border border-slate-300 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
          title="Thêm hộp chữ tiêu đề (cỡ chữ 36pt chuẩn to rõ)"
        >
          <Type className="w-4 h-4 text-amber-600" />
          <span>Tiêu Đề (36pt)</span>
        </button>

        <button
          onClick={() => onAddText('Nội dung hướng dẫn bài học...', 24, 'bold')}
          className="px-3 py-1.5 text-[14px] md:text-[15px] font-black text-slate-800 bg-slate-50 hover:bg-amber-100 hover:text-amber-950 border border-slate-300 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
          title="Thêm đoạn văn bản (cỡ chữ 24pt chuẩn to rõ)"
        >
          <span className="font-serif font-black text-slate-700">T</span>
          <span>Văn Bản (24pt)</span>
        </button>

        {/* Shapes & Art Strokes Buttons */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => onAddShape('roundedRect')}
            className="p-1 hover:bg-white hover:text-amber-600 rounded text-slate-600 transition-all"
            title="Thêm khung chữ nhật bo góc"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAddShape('circle')}
            className="p-1 hover:bg-white hover:text-amber-600 rounded text-slate-600 transition-all"
            title="Thêm hình tròn / nét cong kín"
          >
            <Circle className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAddShape('line')}
            className="p-1 hover:bg-white hover:text-sky-600 rounded text-slate-600 transition-all"
            title="Thêm nét thẳng"
          >
            <Minus className="w-4 h-4 text-sky-600" />
          </button>
          <button
            onClick={() => onAddShape('wave')}
            className="p-1 hover:bg-white hover:text-amber-600 rounded text-slate-600 transition-all"
            title="Thêm nét lượn sóng"
          >
            <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M 2,12 Q 5,4 8,12 T 14,12 T 20,12" />
            </svg>
          </button>
          <button
            onClick={() => onAddShape('zigzag')}
            className="p-1 hover:bg-white hover:text-rose-600 rounded text-slate-600 transition-all"
            title="Thêm nét gấp khúc"
          >
            <svg className="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2,16 6,8 10,16 14,8 18,16 22,8" />
            </svg>
          </button>
          <button
            onClick={() => onAddShape('arc')}
            className="p-1 hover:bg-white hover:text-purple-600 rounded text-slate-600 transition-all"
            title="Thêm nét cong hở"
          >
            <svg className="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M 4,18 Q 12,6 20,18" />
            </svg>
          </button>
          <button
            onClick={() => onAddShape('triangle')}
            className="p-1 hover:bg-white hover:text-emerald-600 rounded text-slate-600 transition-all"
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
            className="p-1 hover:bg-white hover:text-indigo-600 rounded text-slate-600 transition-all"
            title="Thêm mũi tên"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Insert Image */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 text-[14px] md:text-[15px] font-black text-slate-800 bg-slate-50 hover:bg-emerald-100 hover:text-emerald-950 border border-slate-300 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
          title="Chèn ảnh tranh mẫu từ máy tính"
        >
          <ImageIcon className="w-4 h-4 text-emerald-600" />
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
            className="px-3 py-1.5 text-[14px] md:text-[15px] font-black text-slate-800 bg-slate-50 hover:bg-rose-100 hover:text-rose-950 border border-slate-300 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
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
          <span className="text-[13px] font-black text-amber-700 uppercase tracking-wider mr-1">
            {selectedElement.type === 'text' ? 'Định Dạng Chữ' : 'Định Dạng Hình'}
          </span>

          {selectedElement.type === 'text' && (
            <>
              {/* Font Family Dropdown */}
              <select
                value={selectedElement.fontFamily || 'Times New Roman'}
                onChange={(e) => onUpdateElement({ fontFamily: e.target.value })}
                className="text-[15px] font-black text-slate-800 bg-white border border-slate-300 rounded-xl px-3 py-1.5 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-times-new-roman shadow-2xs"
                title="Chọn phông chữ hiển thị"
              >
                <option value="Times New Roman">Trang trọng (Times New Roman)</option>
                <option value="Nunito">Tiêu chuẩn (Nunito)</option>
                <option value="Playpen Sans">Viết tay tiểu học (Playpen)</option>
                <option value="Patrick Hand">Bút lông mĩ thuật (Patrick)</option>
                <option value="Comfortaa">Vui nhộn tròn trịa (Comfortaa)</option>
              </select>

              {/* Font Size */}
              <div className="flex items-center bg-white border border-slate-300 rounded-xl px-2 py-0.5 font-times-new-roman shadow-2xs">
                <button
                  onClick={() => onUpdateElement({ fontSize: Math.max(14, (selectedElement.fontSize || 22) - 2) })}
                  className="px-2 py-0.5 text-[16px] font-black text-slate-700 hover:text-amber-600 cursor-pointer"
                  title="Giảm cỡ chữ (nhỏ nhất là 14)"
                >
                  -
                </button>
                <span className="text-[16px] font-black text-slate-900 w-9 text-center">
                  {Math.max(14, selectedElement.fontSize || 22)}
                </span>
                <button
                  onClick={() => onUpdateElement({ fontSize: Math.min(96, (selectedElement.fontSize || 22) + 2) })}
                  className="px-2 py-0.5 text-[16px] font-black text-slate-700 hover:text-amber-600 cursor-pointer"
                  title="Tăng cỡ chữ"
                >
                  +
                </button>
              </div>

              {/* Bold, Italic & Underline */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                <button
                  onClick={() => onUpdateElement({ fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                  className={`p-1 rounded text-xs transition-all ${selectedElement.fontWeight === 'bold' ? 'bg-amber-200 text-amber-900 font-bold' : 'text-slate-600 hover:bg-white'}`}
                  title="In đậm (Bold)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUpdateElement({ fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })}
                  className={`p-1 rounded text-xs transition-all ${selectedElement.fontStyle === 'italic' ? 'bg-amber-200 text-amber-900 font-bold' : 'text-slate-600 hover:bg-white'}`}
                  title="In nghiêng (Italic)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUpdateElement({ textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline' })}
                  className={`p-1 rounded text-xs transition-all ${selectedElement.textDecoration === 'underline' ? 'bg-amber-200 text-amber-900 font-bold' : 'text-slate-600 hover:bg-white'}`}
                  title="Gạch chân (Underline)"
                >
                  <Underline className="w-3.5 h-3.5" />
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
              {/* Shape Fill Color & Transparent Toggle */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500 font-bold">Nền:</span>
                <input
                  type="color"
                  value={selectedElement.fill && selectedElement.fill !== 'transparent' ? selectedElement.fill : '#ffffff'}
                  onChange={(e) => onUpdateElement({ fill: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-slate-300 p-0"
                  title="Đổi màu nền hình"
                />
                <button
                  onClick={() => onUpdateElement({ fill: selectedElement.fill === 'transparent' ? '#fde68a' : 'transparent' })}
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded border transition-all ${
                    selectedElement.fill === 'transparent'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Chuyển sang nền trong suốt để chỉ giữ viền nét vẽ"
                >
                  {selectedElement.fill === 'transparent' ? 'Trong suốt' : 'Có nền'}
                </button>
              </div>

              {/* Shape Stroke Color */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500 font-bold">Nét/Viền:</span>
                <input
                  type="color"
                  value={selectedElement.stroke || '#0284c7'}
                  onChange={(e) => onUpdateElement({ stroke: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-slate-300 p-0"
                  title="Đổi màu viền hoặc nét vẽ"
                />
              </div>

              {/* Stroke Width Selector */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500 font-bold">Độ dày:</span>
                <select
                  value={selectedElement.strokeWidth ?? 3}
                  onChange={(e) => onUpdateElement({ strokeWidth: Number(e.target.value) })}
                  className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none"
                  title="Độ dày nét vẽ hoặc đường viền"
                >
                  <option value={0}>0px (Không viền)</option>
                  <option value={2}>2px (Mảnh)</option>
                  <option value={4}>4px (Vừa)</option>
                  <option value={6}>6px (Dày)</option>
                  <option value={10}>10px (Đậm)</option>
                </select>
              </div>

              {/* Stroke Dash Toggle */}
              <button
                onClick={() => onUpdateElement({ strokeDash: selectedElement.strokeDash ? undefined : '10 6' })}
                className={`px-2 py-0.5 text-xs font-bold rounded border transition-all ${
                  selectedElement.strokeDash
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="Bấm để đổi giữa nét liền và nét đứt"
              >
                {selectedElement.strokeDash ? 'Nét đứt --' : 'Nét liền —'}
              </button>
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

          {/* Duplicate, Layer order & Delete */}
          <div className="flex items-center gap-1 ml-1">
            {onDuplicateElement && (
              <button
                onClick={() => onDuplicateElement(selectedElement.id)}
                className="px-2 py-1 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1 font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                title="Nhân đôi đối tượng đang chọn (Ctrl+D)"
              >
                <Copy className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Nhân đôi</span>
              </button>
            )}

            <button
              onClick={() => onReorderElement('front')}
              className="p-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              title="Đưa lên trên cùng"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDeleteElement?.(selectedElement.id)}
              className="px-2.5 py-1 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1 font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
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

      {/* Right section: Enlarge Text, Focus Mode & Undo / Redo */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {onEnlargeSlideText && (
          <button
            type="button"
            onClick={onEnlargeSlideText}
            className="px-2.5 py-1 text-[13px] font-black text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl flex items-center gap-1 transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Tăng cỡ chữ toàn bộ bài giảng trên trang này thêm 4pt cho dễ đọc"
          >
            <span className="text-amber-700">🗚</span>
            <span className="hidden sm:inline">Cỡ Chữ Slide (+4pt)</span>
          </button>
        )}

        {onToggleFocusMode && (
          <button
            type="button"
            onClick={onToggleFocusMode}
            className={`px-2.5 py-1 text-[13px] font-black rounded-xl flex items-center gap-1 transition-all shadow-2xs cursor-pointer active:scale-95 border ${
              isFocusMode
                ? 'bg-amber-500 text-white border-amber-600'
                : 'text-slate-700 bg-white hover:bg-slate-50 border-slate-300'
            }`}
            title="Mở rộng 100% không gian làm việc soạn thảo slide"
          >
            <span>⛶</span>
            <span className="hidden sm:inline">{isFocusMode ? 'Hiện DS Slide' : 'Mở Rộng Không Gian'}</span>
          </button>
        )}

        <div className="h-5 w-px bg-slate-200 mx-1" />

        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded-lg flex items-center gap-1 text-xs font-bold transition-all ${
            canUndo ? 'text-slate-700 hover:bg-slate-100 cursor-pointer' : 'text-slate-300 cursor-not-allowed'
          }`}
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-1.5 rounded-lg flex items-center gap-1 text-xs font-bold transition-all ${
            canRedo ? 'text-slate-700 hover:bg-slate-100 cursor-pointer' : 'text-slate-300 cursor-not-allowed'
          }`}
          title="Làm lại (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
