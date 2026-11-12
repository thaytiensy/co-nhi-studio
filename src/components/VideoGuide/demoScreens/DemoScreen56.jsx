import React from 'react';
import { Camera, FileSpreadsheet, Monitor, Sparkles, CheckCircle2 } from 'lucide-react';

export function DemoScreenPart5() {
  return (
    <div className="w-full h-full bg-slate-900/90 rounded-xl p-3 flex flex-col gap-2 select-none border border-slate-700/80 overflow-hidden text-left">
      <div className="flex items-center justify-between pb-2 border-b border-slate-700/80">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-black text-white">Cam Chấm Tranh Rubric TT27 & Xuất Sổ Điểm SMAS 35 Tuần</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            Xuất Excel Viettel SMAS
          </span>
        </div>
      </div>

      <div className="flex-1 flex gap-2 min-h-0 items-center justify-center">
        {/* Camera Scanner Simulation */}
        <div className="w-40 sm:w-48 bg-slate-950 rounded-xl p-2.5 border border-slate-800 flex flex-col justify-between shadow-md">
          <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">
            {/* Painting being scanned */}
            <div className="w-20 h-14 bg-gradient-to-tr from-amber-200 to-rose-200 rounded border border-white/40 flex items-center justify-center text-xl shadow">
              🖼️
            </div>
            {/* Scanner bounding box */}
            <div className="absolute inset-2 border-2 border-dashed border-emerald-400 rounded flex items-center justify-center">
              <span className="bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow">
                Quét Rubric TT27
              </span>
            </div>
          </div>
          <div className="mt-1.5 space-y-1 text-[8px]">
            <div className="flex justify-between text-slate-300">
              <span>Bố cục & Nét vẽ:</span>
              <span className="font-bold text-emerald-400">95% (T)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Màu sắc thẩm mĩ:</span>
              <span className="font-bold text-emerald-400">Tươi sáng</span>
            </div>
          </div>
        </div>

        {/* SMAS 35 Weeks Table Mockup */}
        <div className="flex-1 bg-slate-950 rounded-xl p-2.5 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <span className="text-[10px] font-black text-amber-300">Bảng Điểm SMAS (35 Tuần & Tổng Hợp)</span>
            <span className="text-[9px] px-2 py-0.5 bg-teal-600 text-white font-bold rounded shadow">
              Xuất Excel (.xlsx)
            </span>
          </div>

          <table className="w-full text-[8px] text-slate-300 my-1">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="text-left pb-1">Họ và tên</th>
                <th className="text-center pb-1">Tuần 1</th>
                <th className="text-center pb-1">Tuần 2</th>
                <th className="text-center pb-1">Đánh giá TT27</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-1 font-bold text-white">Kpuih Chai</td>
                <td className="text-center"><span className="px-1 bg-emerald-900/60 text-emerald-300 rounded font-bold">T</span></td>
                <td className="text-center"><span className="px-1 bg-emerald-900/60 text-emerald-300 rounded font-bold">T</span></td>
                <td className="text-slate-400">Hoàn thành tốt, vẽ sáng tạo</td>
              </tr>
              <tr>
                <td className="py-1 font-bold text-white">Siu Phôn</td>
                <td className="text-center"><span className="px-1 bg-blue-900/60 text-blue-300 rounded font-bold">H</span></td>
                <td className="text-center"><span className="px-1 bg-emerald-900/60 text-emerald-300 rounded font-bold">T</span></td>
                <td className="text-slate-400">Màu sắc đều tay, bố cục gọn gàng</td>
              </tr>
            </tbody>
          </table>

          <div className="text-[8px] text-slate-400 border-t border-slate-800 pt-1 flex items-center justify-between">
            <span>✓ 2 Sổ: Thường xuyên 35 tuần & Tổng hợp định kỳ</span>
            <span className="text-amber-400 font-bold">Không trùng lặp nhận xét</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DemoScreenPart6() {
  return (
    <div className="w-full h-full bg-slate-900/90 rounded-xl p-3 flex flex-col gap-2 select-none border border-slate-700/80 overflow-hidden text-left">
      <div className="flex items-center justify-between pb-2 border-b border-slate-700/80">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-black text-white">Trình Chiếu F5 Lớp Học & Bảng Phím Tắt Sư Phạm</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
          Chuyên biệt cho Tivi & Máy chiếu
        </span>
      </div>

      <div className="flex-1 flex gap-2 min-h-0 items-center justify-center">
        {/* Fullscreen Stage Presentation Mockup */}
        <div className="flex-1 bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col justify-between aspect-video max-w-[280px] shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-[8px] text-slate-400">
            <span className="text-amber-400 font-bold">TIẾT HỌC MĨ THUẬT</span>
            <span className="font-mono bg-black/60 px-1.5 py-0.5 rounded text-emerald-400 font-bold">⏱️ 35:00</span>
          </div>

          <div className="text-center py-2">
            <span className="text-xs font-black text-white block">CHỦ ĐỀ: SẮC MÀU THIÊN NHIÊN</span>
            <span className="text-[9px] text-amber-300 mt-1 block">Khung hình 16:9 toàn màn hình sắc nét</span>
          </div>

          {/* Laser Pointer simulation */}
          <div className="absolute top-1/2 left-1/3 flex items-center gap-1 pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/40 animate-ping"></div>
            <span className="text-[7px] text-rose-300 font-bold bg-black/80 px-1 rounded">Tia Laser (L)</span>
          </div>

          <div className="flex justify-between items-center text-[7px] text-slate-500 border-t border-slate-800/80 pt-1">
            <span>Trang 1 / 4</span>
            <span>Bấm F5 hoặc nút Trình Chiếu</span>
          </div>
        </div>

        {/* Keyboard Shortcuts Cheatsheet */}
        <div className="w-44 bg-slate-950 rounded-xl p-2.5 border border-slate-800 flex flex-col justify-between">
          <span className="text-[9px] font-extrabold text-amber-400 uppercase">Phím Tắt Đứng Lớp</span>
          <div className="space-y-1 text-[8px] my-1 text-slate-300">
            <div className="flex justify-between items-center bg-slate-900 p-1 rounded">
              <span className="font-bold text-white bg-slate-800 px-1 rounded">F5</span>
              <span>Trình chiếu toàn màn hình</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900 p-1 rounded">
              <span className="font-bold text-white bg-slate-800 px-1 rounded">B</span>
              <span>Màn hình đen tập trung</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900 p-1 rounded">
              <span className="font-bold text-white bg-slate-800 px-1 rounded">W</span>
              <span>Bảng trắng thị phạm vẽ</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900 p-1 rounded">
              <span className="font-bold text-white bg-slate-800 px-1 rounded">L</span>
              <span>Bật / Tắt con trỏ Laser</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900 p-1 rounded">
              <span className="font-bold text-white bg-slate-800 px-1 rounded">Space</span>
              <span>Chuyển sang slide kế tiếp</span>
            </div>
          </div>
          <span className="text-[8px] text-emerald-400 font-bold">✓ Tương thích bút trình chiếu USB</span>
        </div>
      </div>
    </div>
  );
}
