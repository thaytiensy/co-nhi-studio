import React from 'react';
import { Presentation, Upload, Check, FolderOpen, Database } from 'lucide-react';

export function DemoScreenPart1() {
  return (
    <div className="w-full h-full bg-slate-900/90 rounded-xl p-2.5 sm:p-3 flex flex-col gap-2 select-none border border-slate-700/80 overflow-hidden text-left">
      {/* Top App Bar Mockup */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-700/80">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black flex items-center justify-center text-xs shadow">🎨</span>
          <span className="text-xs font-black text-white">Cọ Nhí Studio</span>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">Bento Dashboard</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-500/40 flex items-center gap-1">
            <Database className="w-2.5 h-2.5" />
            <span>Dữ Liệu Lưu Cục Bộ</span>
          </span>
          <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">35/35 Tuần GDPT 2018</span>
        </div>
      </div>

      {/* Grade & Status Filter Pills */}
      <div className="flex items-center justify-between gap-1 flex-wrap bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
        <div className="flex items-center gap-1 text-[9px] font-bold">
          <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 shadow-xs">Tất cả khối</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white">Lớp 1</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white">Lớp 2</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white">Lớp 3</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white">Lớp 4</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white">Lớp 5</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-bold">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300">Tất cả trạng thái</span>
          <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300">Đã dạy</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">Sắp dạy</span>
        </div>
      </div>

      {/* Lesson Plans Cards List */}
      <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
        {/* Card 1 */}
        <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-800 flex items-center justify-between gap-2 shadow-xs">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 rounded font-bold">Lớp 1</span>
              <span className="text-[8px] text-slate-400">Tuần 1 • Tiết 1</span>
              <span className="text-[8px] bg-emerald-950 text-emerald-400 px-1 rounded font-bold border border-emerald-800">Đã dạy</span>
            </div>
            <div className="text-[10px] font-extrabold text-white truncate mt-0.5">
              Chủ đề 1: Mĩ thuật trong nhà trường (Chấm, Nét, Màu cơ bản)
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="px-2 py-1 bg-amber-600 text-white rounded text-[9px] font-black shadow-xs flex items-center gap-1">
              <Upload className="w-2.5 h-2.5" />
              <span>Nhập Giáo Án PP</span>
            </span>
            <span className="p-1 bg-emerald-950 text-emerald-300 rounded border border-emerald-800" title="Đã dạy">
              <Check className="w-2.5 h-2.5" />
            </span>
            <span className="p-1 bg-indigo-950 text-indigo-300 rounded border border-indigo-800" title="Trình chiếu">
              <Presentation className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-800 flex items-center justify-between gap-2 shadow-xs">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 rounded font-bold">Lớp 1</span>
              <span className="text-[8px] text-slate-400">Tuần 2 • Tiết 2</span>
              <span className="text-[8px] bg-emerald-950 text-emerald-400 px-1 rounded font-bold border border-emerald-800">Đã dạy</span>
            </div>
            <div className="text-[10px] font-extrabold text-white truncate mt-0.5">
              Chủ đề 2: Sáng tạo từ những chấm màu sắc tươi sáng
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="px-2 py-1 bg-amber-600 text-white rounded text-[9px] font-black shadow-xs flex items-center gap-1">
              <Upload className="w-2.5 h-2.5" />
              <span>Nhập Giáo Án PP</span>
            </span>
            <span className="p-1 bg-emerald-950 text-emerald-300 rounded border border-emerald-800">
              <Check className="w-2.5 h-2.5" />
            </span>
            <span className="p-1 bg-indigo-950 text-indigo-300 rounded border border-indigo-800">
              <Presentation className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-800 flex items-center justify-between gap-2 opacity-80 shadow-xs">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 rounded font-bold">Lớp 1</span>
              <span className="text-[8px] text-slate-400">Tuần 3 • Tiết 3</span>
              <span className="text-[8px] bg-slate-800 text-slate-400 px-1 rounded font-bold">Sắp dạy</span>
            </div>
            <div className="text-[10px] font-extrabold text-white truncate mt-0.5">
              Chủ đề 3: Nét vẽ của em (Nét thẳng, nét cong, lượn sóng)
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="px-2 py-1 bg-amber-600/80 text-white rounded text-[9px] font-black shadow-xs flex items-center gap-1">
              <Upload className="w-2.5 h-2.5" />
              <span>Nhập Giáo Án PP</span>
            </span>
            <span className="p-1 bg-indigo-950 text-indigo-300 rounded border border-indigo-800">
              <Presentation className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DemoScreenPart2() {
  return (
    <div className="w-full h-full bg-slate-900/90 rounded-xl p-2.5 sm:p-3 flex flex-col gap-2 select-none border border-slate-700/80 overflow-hidden text-left">
      {/* Action Toolbar Mockup */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-700/80">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black text-white">Bộ Nhận Diện Thông Minh Mọi Tệp Office & Lưu IndexedDB</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] px-2 py-0.5 bg-emerald-950 text-emerald-300 font-bold rounded border border-emerald-500/40 flex items-center gap-1">
            <Database className="w-2.5 h-2.5" />
            <span>Lưu Vĩnh Viễn IndexedDB</span>
          </span>
          <span className="text-[9px] px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded border border-amber-500/30">
            Chữ To (GV 50+)
          </span>
        </div>
      </div>

      {/* Universal Format Support Banner */}
      <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2 text-[9px]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-extrabold text-amber-400">Đọc Mọi Định Dạng:</span>
          <span className="px-1.5 py-0.5 bg-rose-950 text-rose-300 font-bold rounded border border-rose-800">.pptx</span>
          <span className="px-1.5 py-0.5 bg-amber-950 text-amber-300 font-bold rounded border border-amber-800">.ppt cũ 97-2003 (Tự bóc tách)</span>
          <span className="px-1.5 py-0.5 bg-blue-950 text-blue-300 font-bold rounded border border-blue-800">.docx / .doc</span>
          <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 font-bold rounded border border-emerald-800">.xlsx / .pdf</span>
        </div>
        <span className="text-slate-400 text-[8px] shrink-0 font-medium">Không bao giờ mất bài khi F5</span>
      </div>

      {/* Editing Stage with Visual Handlers */}
      <div className="flex-1 bg-slate-950/90 rounded-lg p-2 flex items-center justify-center relative border border-slate-800">
        <div className="w-full max-w-[370px] aspect-video bg-white rounded-lg shadow-xl border border-slate-200 p-2.5 flex flex-col justify-between relative">
          {/* Header element */}
          <div className="text-[11px] font-black text-slate-900 bg-amber-100/90 p-1.5 rounded border border-amber-300 flex items-center justify-between">
            <span style={{ fontFamily: 'Times New Roman' }}>TIẾT 1: KHÁM PHÁ MÀU SẮC CƠ BẢN</span>
            <span className="text-[8px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">Times New Roman &ge; 14pt</span>
          </div>

          {/* Color Palettes Element */}
          <div className="flex items-center justify-center gap-4 py-1.5">
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
            <span>📌 Tự động chuẩn hóa 4 hoạt động CV 2345</span>
            <span className="font-bold text-indigo-700">Tỉ lệ vàng 16:9 nét căng</span>
          </div>
        </div>
      </div>
    </div>
  );
}
