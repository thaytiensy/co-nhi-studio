import React from 'react';
import { Layout, Palette, Trash2, Upload, FileUp, Sparkles, Check, MousePointer } from 'lucide-react';

export function DemoScreenPart1() {
  return (
    <div className="w-full h-full bg-slate-900/90 rounded-xl p-3 flex flex-col gap-2 select-none border border-slate-700/80 overflow-hidden text-left">
      {/* Top App Bar Mockup */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-700/80">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shadow">🎨</span>
          <span className="text-xs font-black text-white">Cọ Nhí Studio</span>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">16:9 GDPT 2018</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
          <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700">100% Cục Bộ Ngoại Tuyến</span>
        </div>
      </div>

      {/* Main Slide Workspace Mockup */}
      <div className="flex-1 flex gap-2 min-h-0">
        {/* Left Thumbnails */}
        <div className="w-16 sm:w-20 bg-slate-950/80 rounded-lg p-1.5 flex flex-col gap-1.5 border border-slate-800">
          <div className="aspect-video bg-white rounded border-2 border-amber-500 p-1 flex flex-col justify-between shadow">
            <span className="text-[8px] font-bold text-slate-800">Trang 1</span>
            <div className="w-full h-1 bg-amber-200 rounded"></div>
          </div>
          <div className="aspect-video bg-slate-800/80 rounded border border-slate-700 p-1 flex flex-col justify-between opacity-70">
            <span className="text-[8px] font-bold text-slate-400">Trang 2</span>
            <div className="w-3/4 h-1 bg-slate-600 rounded"></div>
          </div>
        </div>

        {/* Center 16:9 Canvas Stage */}
        <div className="flex-1 bg-slate-950/90 rounded-lg p-3 flex flex-col items-center justify-center relative border border-slate-800">
          <div className="w-full max-w-[340px] aspect-video bg-white rounded-lg shadow-xl border border-slate-200 p-3 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <span className="text-[10px] font-extrabold text-amber-800">CHỦ ĐỀ: SẮC MÀU THIÊN NHIÊN</span>
              <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">16:9 Chuẩn Tivi</span>
            </div>
            <div className="flex-1 flex items-center justify-center text-center p-2">
              <div className="border border-dashed border-amber-300 rounded-lg p-2 bg-amber-50/50 w-full">
                <p className="text-[10px] font-bold text-slate-700">Không gian làm việc sạch sẽ, trắng tinh</p>
                <p className="text-[8px] text-slate-500 mt-0.5">Sẵn sàng thêm chữ, vẽ hình, chèn tranh mẫu</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[8px] text-slate-400">
              <span>Công văn 2345/BGDĐT</span>
              <span>Bộ sách Kết nối tri thức</span>
            </div>
          </div>

          {/* Animated cursor pointer */}
          <div className="absolute bottom-5 right-10 flex items-center gap-1 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-1 rounded-full shadow-lg animate-bounce">
            <MousePointer className="w-3 h-3 fill-current" />
            <span>Thao tác trực tiếp trên màn hình</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DemoScreenPart2() {
  return (
    <div className="w-full h-full bg-slate-900/90 rounded-xl p-3 flex flex-col gap-2 select-none border border-slate-700/80 overflow-hidden text-left">
      {/* Action Toolbar Mockup */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-700/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-amber-400">Thao Tác Soạn Slide & PowerPoint</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-600/90 text-white rounded text-[10px] font-bold">
            <FileUp className="w-3 h-3" />
            <span>Tải PowerPoint Lên (.pptx)</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold">
            <Upload className="w-3 h-3" />
            <span>Xuất PowerPoint</span>
          </div>
        </div>
      </div>

      {/* Editing Stage with Visual Handlers */}
      <div className="flex-1 bg-slate-950/90 rounded-lg p-3 flex items-center justify-center relative border border-slate-800">
        <div className="w-full max-w-[360px] aspect-video bg-white rounded-lg shadow-xl border border-slate-200 p-3 flex flex-col justify-between relative">
          {/* Header element */}
          <div className="text-[11px] font-black text-slate-900 bg-amber-100/80 p-1.5 rounded border border-amber-300 flex items-center justify-between">
            <span>Tiết 1: Khám Phá Màu Sắc Cơ Bản</span>
            <span className="w-4 h-4 rounded bg-rose-500 text-white flex items-center justify-center cursor-pointer shadow-xs" title="Bấm xóa">
              <Trash2 className="w-2.5 h-2.5" />
            </span>
          </div>

          {/* Color Palettes Element */}
          <div className="flex items-center justify-center gap-3 py-2">
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-7 h-7 rounded-full bg-rose-500 shadow-md ring-2 ring-white"></div>
              <span className="text-[8px] font-bold text-slate-700">Màu Đỏ</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-7 h-7 rounded-full bg-amber-400 shadow-md ring-2 ring-white"></div>
              <span className="text-[8px] font-bold text-slate-700">Màu Vàng</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-7 h-7 rounded-full bg-blue-500 shadow-md ring-2 ring-white"></div>
              <span className="text-[8px] font-bold text-slate-700">Màu Lam</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="bg-slate-50 p-1 rounded border border-slate-200 flex items-center justify-between text-[8px] text-slate-600">
            <span>📌 Bấm vào phần tử để sửa, bấm icon thùng rác đỏ để xóa</span>
            <span className="font-bold text-indigo-700">Tỉ lệ 16:9 nét căng</span>
          </div>
        </div>
      </div>
    </div>
  );
}
