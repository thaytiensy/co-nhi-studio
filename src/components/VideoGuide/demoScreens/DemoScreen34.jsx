import React from 'react';
import { Bot, Mic, Volume2, Sparkles, Box, Check, ArrowRight } from 'lucide-react';

export function DemoScreenPart3() {
  return (
    <div className="w-full h-full bg-slate-900/90 rounded-xl p-3 flex flex-col gap-2 select-none border border-slate-700/80 overflow-hidden text-left">
      <div className="flex items-center justify-between pb-2 border-b border-slate-700/80">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black text-white">Cô Trợ Giảng Sư Phạm AI 3D (Đàm Thoại Giọng Nói 0,3s)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Độ trễ 0.3s - 0.4s
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Giọng Thầy Nam & Cô Nữ
          </span>
        </div>
      </div>

      <div className="flex-1 flex gap-3 min-h-0 items-center justify-center p-2">
        {/* Robot Teacher 3D Avatar Card */}
        <div className="w-36 sm:w-44 bg-slate-950 rounded-xl border border-amber-500/40 p-2.5 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md relative group">
            <img src="/tro-giang-ai.jpg" alt="Cô Trợ Giảng AI" className="w-full h-full object-cover" />
            <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse"></div>
          </div>
          <span className="text-xs font-black text-amber-300 mt-2">Cô Trợ Giảng AI</span>
          <span className="text-[9px] text-slate-400">Tự động nói giọng Neural</span>

          {/* Dynamic soundwave animation */}
          <div className="flex items-end gap-1 h-4 mt-2">
            <div className="w-1 bg-amber-400 rounded-full h-2 animate-pulse"></div>
            <div className="w-1 bg-amber-400 rounded-full h-4 animate-pulse delay-75"></div>
            <div className="w-1 bg-amber-400 rounded-full h-3 animate-pulse delay-150"></div>
            <div className="w-1 bg-amber-400 rounded-full h-4 animate-pulse delay-100"></div>
            <div className="w-1 bg-amber-400 rounded-full h-2 animate-pulse"></div>
          </div>
        </div>

        {/* Real-time Dialogue Mockup */}
        <div className="flex-1 max-w-sm flex flex-col gap-2">
          {/* User query */}
          <div className="bg-slate-800 p-2 rounded-xl border border-slate-700 text-[10px] text-slate-200 self-end max-w-[90%]">
            <span className="font-bold text-amber-400">Thầy/Cô: </span>
            <span>Gợi ý hoạt động khởi động 5 phút cho Chủ đề 1 Lớp 5?</span>
          </div>

          {/* AI reply */}
          <div className="bg-amber-950/60 p-2.5 rounded-xl border border-amber-500/50 text-[10px] text-amber-100 max-w-[95%] shadow-md">
            <div className="flex items-center gap-1 font-bold text-amber-300 text-[11px] mb-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Phản hồi tức thì (0.3s):</span>
            </div>
            <p className="leading-relaxed">
              "Thầy Cô hãy tổ chức trò chơi 'Nhận Diện Chữ Trang Trí & Poster' - Chia 2 đội ghép nhanh biểu tượng bảo vệ môi trường, học sinh sẽ hào hứng ngay từ phút đầu tiên!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DemoScreenPart4() {
  return (
    <div className="w-full h-full bg-slate-900/90 rounded-xl p-3 flex flex-col gap-2 select-none border border-slate-700/80 overflow-hidden text-left">
      <div className="flex items-center justify-between pb-2 border-b border-slate-700/80">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black text-white">Bảng Vẽ Thị Phạm 11 Khối 3D & 4 Bước Vẽ Tranh</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Nét vẽ Bézier mượt mà
        </span>
      </div>

      <div className="flex-1 flex gap-2 min-h-0 items-center justify-center">
        {/* 11 3D Shapes Bank Mockup */}
        <div className="w-36 bg-slate-950 rounded-xl p-2 border border-slate-800 flex flex-col gap-1.5">
          <span className="text-[9px] font-extrabold uppercase text-amber-400">11 Khối Không Gian 3D</span>
          <div className="grid grid-cols-2 gap-1.5 text-center text-[8px] font-bold">
            <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700 text-slate-200">⚽ Khối Cầu</div>
            <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700 text-slate-200">🧊 Khối Hộp</div>
            <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700 text-slate-200">🥫 Khối Trụ</div>
            <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700 text-slate-200">🍦 Khối Nón</div>
          </div>
          <button className="mt-1 w-full py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[9px] rounded shadow">
            Chèn Vào Slide
          </button>
        </div>

        {/* 4 Steps Demonstration Flow */}
        <div className="flex-1 bg-slate-950 rounded-xl p-2.5 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-amber-300">Quy Trình 4 Bước Vẽ Thị Phạm Chuẩn Sư Phạm</span>
          <div className="grid grid-cols-2 gap-1.5 text-[9px] my-1">
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="font-bold text-amber-400 block">Bước 1: Phác khung hình</span>
              <span className="text-slate-400 text-[8px]">Xác định tỉ lệ & đường tầm mắt</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="font-bold text-amber-400 block">Bước 2: Dựng nét chi tiết</span>
              <span className="text-slate-400 text-[8px]">Đường cong Bézier mượt mà</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="font-bold text-amber-400 block">Bước 3: Lên đậm nhạt</span>
              <span className="text-slate-400 text-[8px]">Tạo khối sáng, tối, phản quang</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="font-bold text-amber-400 block">Bước 4: Tô màu hoàn thiện</span>
              <span className="text-slate-400 text-[8px]">Phối màu hài hòa, nổi bật</span>
            </div>
          </div>
          <div className="text-[8px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-1">
            <span>🎨 Tích hợp 3 Mini-Game thi đấu giữa các tổ</span>
            <span className="text-emerald-400 font-bold">✓ Vẽ bằng chuột vẫn tròn trịa</span>
          </div>
        </div>
      </div>
    </div>
  );
}
