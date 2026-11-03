import React, { useRef, useState, useEffect } from 'react';
import { 
  Brush, 
  Eraser, 
  Trash2, 
  Undo, 
  Download, 
  Plus, 
  Square, 
  Circle, 
  Minus, 
  Triangle, 
  Star,
  Heart,
  ArrowRight,
  Box,
  Cylinder,
  Presentation,
  CheckCircle,
  Palette
} from 'lucide-react';

const SHAPE_LIST = [
  { id: 'rect', name: 'Hình Chữ Nhật', icon: '⬛' },
  { id: 'circle', name: 'Hình Tròn', icon: '⭕' },
  { id: 'ellipse', name: 'Hình Elip (Bầu dục)', icon: '🥚' },
  { id: 'triangle', name: 'Hình Tam Giác', icon: '🔺' },
  { id: 'diamond', name: 'Hình Thoi', icon: '🔷' },
  { id: 'star', name: 'Ngôi Sao 5 Cánh', icon: '⭐' },
  { id: 'heart', name: 'Hình Trái Tim', icon: '💖' },
  { id: 'arrow', name: 'Mũi Tên', icon: '➡️' },
  { id: 'cylinder', name: 'Hình Trụ 3D', icon: '🛢️' },
  { id: 'cube', name: 'Hình Hộp 3D', icon: '📦' },
  { id: 'line', name: 'Đoạn Thẳng', icon: '➖' },
];

export default function DrawingBoard({
  onInsertDrawingToSlide,
  onNavigateToEditor
}) {
  const canvasRef = useRef(null);
  const pointsRef = useRef([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('brush'); // 'brush', 'highlighter', 'eraser', 'rect', 'circle', 'line'
  const [strokeColor, setStrokeColor] = useState('#1e293b');
  const [lineWidth, setLineWidth] = useState(6);
  const [smoothMode, setSmoothMode] = useState('ultra'); // 'natural', 'ultra', 'calligraphy'
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [shapeStart, setShapeStart] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [notice, setNotice] = useState('');

  // Art Palette
  const artColors = [
    '#000000', '#475569', '#ffffff',
    '#ef4444', '#f97316', '#f59e0b', '#eab308', // Gam nóng
    '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', // Gam lạnh
    '#ec4899', '#78350f', '#065f46', '#1e3a8a'
  ];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state to history
    saveState();
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(dataUrl);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      const img = new Image();
      img.src = history[prevStep];
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHistoryStep(prevStep);
      };
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e) => {
    const coords = getCanvasCoordinates(e);
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (tool === 'brush' || tool === 'highlighter' || tool === 'eraser') {
      pointsRef.current = [coords];

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = lineWidth;

      if (tool === 'eraser') {
        ctx.strokeStyle = '#ffffff';
        ctx.fillStyle = '#ffffff';
      } else if (tool === 'highlighter') {
        ctx.strokeStyle = strokeColor + '80'; // 50% opacity
        ctx.fillStyle = strokeColor + '80';
        ctx.lineWidth = lineWidth * 2.5;
      } else {
        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = strokeColor;
      }

      // Vẽ ngay điểm chấm ban đầu để phản hồi tức thì
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Shape tool: take snapshot of current canvas to preview rubber-banding
      setShapeStart(coords);
      setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const coords = getCanvasCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (tool === 'brush' || tool === 'highlighter' || tool === 'eraser') {
      pointsRef.current.push(coords);

      // Thuật toán làm mượt nét vẽ bằng đường cong Bézier bậc 2 (Quadratic Bézier Spline)
      if (pointsRef.current.length >= 3) {
        const len = pointsRef.current.length;
        const p0 = pointsRef.current[len - 3];
        const p1 = pointsRef.current[len - 2];
        const p2 = pointsRef.current[len - 1];

        const midPrev = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
        const midNext = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

        ctx.beginPath();
        ctx.moveTo(midPrev.x, midPrev.y);
        ctx.quadraticCurveTo(p1.x, p1.y, midNext.x, midNext.y);
        ctx.stroke();
      } else if (pointsRef.current.length === 2) {
        const p0 = pointsRef.current[0];
        const p1 = pointsRef.current[1];
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    } else if (shapeStart && snapshot) {
      // Restore snapshot then draw preview of shape
      ctx.putImageData(snapshot, 0, 0);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = strokeColor;
      ctx.fillStyle = strokeColor + '20'; // light fill preview

      const x1 = shapeStart.x;
      const y1 = shapeStart.y;
      const x2 = coords.x;
      const y2 = coords.y;

      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      const w = Math.max(1, maxX - minX);
      const h = Math.max(1, maxY - minY);
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;

      ctx.beginPath();

      if (tool === 'rect') {
        ctx.rect(x1, y1, x2 - x1, y2 - y1);
        ctx.fill();
        ctx.stroke();
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 2;
        ctx.arc(cx, cy, Math.max(1, radius), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (tool === 'ellipse') {
        ctx.ellipse(cx, cy, Math.max(1, w / 2), Math.max(1, h / 2), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (tool === 'triangle') {
        ctx.moveTo(cx, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x1, y2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (tool === 'diamond') {
        ctx.moveTo(cx, minY);
        ctx.lineTo(maxX, cy);
        ctx.lineTo(cx, maxY);
        ctx.lineTo(minX, cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (tool === 'star') {
        const outerR = Math.max(w, h) / 2;
        const innerR = outerR * 0.42;
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          const r = i % 2 === 0 ? outerR : innerR;
          const sx = cx + r * Math.cos(angle);
          const sy = cy + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (tool === 'heart') {
        const topCurveHeight = h * 0.3;
        ctx.moveTo(cx, minY + topCurveHeight);
        ctx.bezierCurveTo(cx, minY, minX, minY, minX, minY + topCurveHeight);
        ctx.bezierCurveTo(minX, minY + (h + topCurveHeight) / 2, cx, maxY - h * 0.1, cx, maxY);
        ctx.bezierCurveTo(cx, maxY - h * 0.1, maxX, minY + (h + topCurveHeight) / 2, maxX, minY + topCurveHeight);
        ctx.bezierCurveTo(maxX, minY, cx, minY, cx, minY + topCurveHeight);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (tool === 'arrow') {
        const headLen = Math.min(30, Math.hypot(x2 - x1, y2 - y1) * 0.35);
        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = strokeColor;
        ctx.fill();
      } else if (tool === 'cylinder') {
        const rx = Math.max(1, w / 2);
        const ry = Math.max(1, h * 0.15);
        ctx.ellipse(cx, minY + ry, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(minX, minY + ry);
        ctx.lineTo(minX, maxY - ry);
        ctx.ellipse(cx, maxY - ry, rx, ry, 0, 0, Math.PI);
        ctx.lineTo(maxX, minY + ry);
        ctx.stroke();
      } else if (tool === 'cube') {
        const depth = Math.min(w, h) * 0.3;
        ctx.rect(minX, minY + depth, w - depth, h - depth);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(minX, minY + depth);
        ctx.lineTo(minX + depth, minY);
        ctx.lineTo(maxX, minY);
        ctx.lineTo(maxX - depth, minY + depth);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(maxX - depth, minY + depth);
        ctx.lineTo(maxX, minY);
        ctx.lineTo(maxX, maxY - depth);
        ctx.lineTo(maxX - depth, maxY);
        ctx.closePath();
        ctx.stroke();
      } else if (tool === 'line') {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      pointsRef.current = [];
      setShapeStart(null);
      setSnapshot(null);
      saveState();
    }
  };

  // Insert drawn artwork to current slide
  const handleInsertToSlide = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onInsertDrawingToSlide(dataUrl);
    setNotice('Đã chèn tranh vẽ vào Slide thành công!');
    setTimeout(() => {
      setNotice('');
      onNavigateToEditor();
    }, 1200);
  };

  // Download artwork as PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Tranh_Thi_Pham_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 select-none overflow-hidden">
      {/* Top Controls Ribbon */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-4 shadow-2xs">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Dụng Cụ</span>
          
          <button
            onClick={() => setTool('brush')}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              tool === 'brush' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
            title="Bút vẽ nét tự do"
          >
            <Brush className="w-3.5 h-3.5" />
            <span>Bút Vẽ</span>
          </button>

          <button
            onClick={() => setTool('highlighter')}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              tool === 'highlighter' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
            title="Bút dạ quang nét trong suốt"
          >
            <span>🖍️</span>
            <span>Dạ Quang</span>
          </button>

          <button
            onClick={() => setTool('eraser')}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              tool === 'eraser' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
            title="Tẩy nét vẽ"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Tẩy</span>
          </button>
        </div>

        {/* Shapes Tools - Đầy đủ 11 hình học và khối 3D cho Giáo viên Mĩ thuật thị phạm */}
        <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Hình Khối</span>
          
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
            {SHAPE_LIST.map((shp) => (
              <button
                key={shp.id}
                onClick={() => setTool(shp.id)}
                className={`px-1.5 py-1 text-xs rounded transition-all flex items-center gap-0.5 ${
                  tool === shp.id 
                    ? 'bg-amber-500 text-white font-extrabold shadow-xs scale-105' 
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
                title={`Vẽ ${shp.name}`}
              >
                <span className="text-sm leading-none">{shp.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stroke Width Selector */}
        <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Nét:</span>
          {[2, 6, 12, 24].map(w => (
            <button
              key={w}
              onClick={() => setLineWidth(w)}
              className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                lineWidth === w ? 'bg-amber-100 border-amber-500 font-bold text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
              title={`Độ dày nét: ${w}px`}
            >
              <span className="rounded-full bg-slate-700" style={{ width: Math.max(3, w / 2), height: Math.max(3, w / 2) }} />
            </button>
          ))}
        </div>

        {/* Art Palette Colors */}
        <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Bảng Màu</span>
          <div className="flex items-center gap-1">
            {artColors.slice(0, 10).map(c => (
              <button
                key={c}
                onClick={() => setStrokeColor(c)}
                className={`w-5 h-5 rounded-full border border-slate-300 shadow-2xs transition-transform ${
                  strokeColor === c ? 'scale-125 ring-2 ring-amber-500' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
                title={`Màu ${c}`}
              />
            ))}
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-5 h-5 rounded cursor-pointer border border-slate-300 p-0 ml-1"
              title="Tự chọn màu khác"
            />
          </div>
        </div>

        {/* Undo & Clear */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={historyStep <= 0}
            className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
              historyStep > 0 ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'text-slate-300 border-transparent cursor-not-allowed'
            }`}
            title="Hoàn tác nét vẽ (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
            title="Xóa trắng bảng vẽ"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right Action: Insert to Slide & Download */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-all"
            title="Tải ảnh vẽ PNG về máy"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Tải Ảnh (PNG)</span>
          </button>

          <button
            onClick={handleInsertToSlide}
            className="px-4 py-1.5 text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            title="Chèn ảnh thị phạm vào Slide bài giảng hiện tại"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>{notice || 'Chèn Tranh Vào Slide'}</span>
          </button>
        </div>
      </div>

      {/* Canvas Drawing Surface (16:9 ratio 960 x 540) */}
      <div className="flex-1 flex items-center justify-center p-4 bg-slate-200/70">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-300 cursor-crosshair">
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="touch-none"
            style={{ width: '960px', height: '540px' }}
          />
        </div>
      </div>
    </div>
  );
}
