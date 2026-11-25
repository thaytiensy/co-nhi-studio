import React from 'react';
import { Monitor, Box, Gamepad2 } from 'lucide-react';

export function DemoScreenPart3() {
  return (
    <div className="w-full h-full bg-slate-900/90 rounded-xl p-2.5 sm:p-3 flex flex-col gap-2 select-none border border-slate-700/80 overflow-hidden text-left">
      <div className="flex items-center justify-between pb-2 border-b border-slate-700/80">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black text-white">Trình Chiếu Toàn Màn Hình F5 Lớp Học & Bút Bấm USB</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Khung 16:9 Nét Căng
          </span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Tương Thích 100% Bút Bấm USB
          </span>
        </div>
      </div>

      <div className="flex-1 flex gap-2.5 min-h-0 items-center justify-center">
        {/* Fullscreen Stage Presentation Mockup */}
        <div className="flex-1 bg-slate-950 rounded-xl p-2.5 border border-slate-800 flex flex-col justify-between aspect-video max-w-[310px] shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-[8px] text-slate-400 border-b border-slate-800/80 pb-1">
            <span className="text-amber-400 font-bold">MĨ THUẬT TIỂU HỌC GDPT 2018</span>
            <span className="font-mono bg-black/80 px-1.5 py-0.5 rounded text-emerald-400 font-bold border border-emerald-800">⏱️ 35:00</span>
          </div>

          <div className="text-center py-2 relative">
            <span className="text-xs font-black text-white block" style={{ fontFamily: 'Times New Roman' }}>
              CHỦ ĐỀ: SẮC MÀU THIÊN NHIÊN QUANH EM
            </span>
            <span className="text-[9px] text-amber-300 mt-1 block">Tỉ lệ vàng 16:9 • Tối ưu máy chiếu & Tivi 55-85"</span>

            {/* Laser Pointer simulation */}
            <div className="absolute top-2 left-1/4 flex items-center gap-1 pointer-events-none">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/40 animate-ping"></div>
              <span className="text-[7px] text-rose-300 font-bold bg-black/80 px-1 rounded">Tia Laser (L)</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[7.5px] text-slate-400 border-t border-slate-800/80 pt-1">
            <span>Trang 1 / 4 • Sách Kết nối tri thức</span>
            <span className="text-amber-400 font-bold">Bút vẽ dạ quang trực tiếp lên slide</span>
          </div>
        </div>

        {/* Keyboard Shortcuts & Wireless USB Clicker Cheatsheet */}
        <div className="w-48 bg-slate-950 rounded-xl p-2.5 border border-slate-800 flex flex-col justify-between shadow-md">
          <span className="text-[9px] font-extrabold text-amber-400 uppercase">Phím Tắt Đứng Lớp Sư Phạm</span>
          <div className="space-y-1 text-[8px] my-1 text-slate-300">
            <div className="flex justify-between items-center bg-slate-900 p-1 rounded">
              <span className="font-bold text-white bg-slate-800 px-1 rounded">F5 / F11</span>
              <span>Trình chiếu toàn màn hình</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900 p-1 rounded">
              <span className="font-bold text-white bg-slate-800 px-1 rounded">B</span>
              <span>Màn hình đen tập trung</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900 p-1 rounded">
              <span className="font-bold text-white bg-slate-800 px-1 rounded">W</span>
              <span>Bảng trắng thị phạm nét</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900 p-1 rounded">
              <span className="font-bold text-white bg-slate-800 px-1 rounded">L</span>
              <span>Bật / Tắt con trỏ Laser</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900 p-1 rounded">
              <span className="font-bold text-white bg-slate-800 px-1 rounded">Space / ← →</span>
              <span>Chuyển trang mượt mà</span>
            </div>
          </div>
          <span className="text-[8px] text-emerald-400 font-bold">✓ Tương thích bút bấm không dây USB</span>
        </div>
      </div>
    </div>
  );
}

export function DemoScreenPart4() {
  return (
    <div className="w-full h-full bg-slate-900/90 rounded-xl p-2.5 sm:p-3 flex flex-col gap-2 select-none border border-slate-700/80 overflow-hidden text-left">
      <div className="flex items-center justify-between pb-2 border-b border-slate-700/80">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-black text-white">Bảng Vẽ Thị Phạm 11 Khối 3D & Trò Chơi Mĩ Thuật</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Nét vẽ Bézier mượt mà
          </span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            3 Mini-Game Hào Hứng
          </span>
        </div>
      </div>

      <div className="flex-1 flex gap-2 min-h-0 items-center justify-center">
        {/* 11 3D Shapes Bank Mockup */}
        <div className="w-36 bg-slate-950 rounded-xl p-2 border border-slate-800 flex flex-col gap-1 shadow-md">
          <span className="text-[9px] font-extrabold uppercase text-amber-400">11 Khối Không Gian 3D</span>
          <div className="grid grid-cols-2 gap-1 text-center text-[8px] font-bold">
            <div className="bg-slate-800/80 p-1 rounded border border-slate-700 text-slate-200">⚽ Khối Cầu</div>
            <div className="bg-slate-800/80 p-1 rounded border border-slate-700 text-slate-200">🧊 Khối Hộp</div>
            <div className="bg-slate-800/80 p-1 rounded border border-slate-700 text-slate-200">🥫 Khối Trụ</div>
            <div className="bg-slate-800/80 p-1 rounded border border-slate-700 text-slate-200">🍦 Khối Nón</div>
          </div>
          <button className="mt-1 w-full py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[8.5px] rounded shadow-xs">
            Chèn Vào Slide 1 Chạm
          </button>
        </div>

        {/* 4 Steps Demonstration Flow + Mini-games */}
        <div className="flex-1 bg-slate-950 rounded-xl p-2 border border-slate-800 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-extrabold text-amber-300">Quy Trình 4 Bước Vẽ Thị Phạm Chuẩn Sư Phạm</span>
            <span className="text-[8px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 rounded border border-emerald-800 font-bold">Bézier bậc 2</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[8.5px] my-1">
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="font-bold text-amber-400 block">Bước 1: Phác khung hình</span>
              <span className="text-slate-400 text-[7.5px]">Xác định tỉ lệ & đường tầm mắt</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="font-bold text-amber-400 block">Bước 2: Dựng nét chi tiết</span>
              <span className="text-slate-400 text-[7.5px]">Đường cong Bézier mượt mà</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="font-bold text-amber-400 block">Bước 3: Lên đậm nhạt</span>
              <span className="text-slate-400 text-[7.5px]">Tạo khối sáng, tối, bóng đổ</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="font-bold text-amber-400 block">Bước 4: Tô màu hoàn thiện</span>
              <span className="text-slate-400 text-[7.5px]">Phối màu sắc tươi sáng, sinh động</span>
            </div>
          </div>

          <div className="text-[8px] text-slate-300 flex items-center justify-between border-t border-slate-800 pt-1">
            <span className="flex items-center gap-1 text-indigo-300 font-bold">
              <Gamepad2 className="w-3 h-3 text-indigo-400" />
              <span>3 Trò chơi: Bánh xe màu, Đố khối, Ghép tranh</span>
            </span>
            <span className="text-emerald-400 font-bold">✓ Vẽ bằng chuột vẫn tròn nét</span>
          </div>
        </div>
      </div>
    </div>
  );
}