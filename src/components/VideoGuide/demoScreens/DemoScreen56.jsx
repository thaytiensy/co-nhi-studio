import React from 'react';
import { Camera, FileSpreadsheet, Sparkles, Filter } from 'lucide-react';

export function DemoScreenPart5() {
  return (
    <div className="w-full h-full bg-slate-900/90 rounded-xl p-2.5 sm:p-3 flex flex-col gap-2 select-none border border-slate-700/80 overflow-hidden text-left">
      <div className="flex items-center justify-between pb-2 border-b border-slate-700/80">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-black text-white">Cam Chấm Tranh Mắt Thần AI (Rubric TT27) & Trợ Giảng Cọ Nhí</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px]">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            Quy Đổi TT27 (T, H, C)
          </span>
          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
            Webcam & Tải Ảnh
          </span>
        </div>
      </div>

      <div className="flex-1 flex gap-2 min-h-0 items-center justify-center">
        {/* Camera Scanner Simulation */}
        <div className="w-40 sm:w-48 bg-slate-950 rounded-xl p-2.5 border border-slate-800 flex flex-col justify-between shadow-md">
          <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">
            {/* Painting being scanned */}
            <div className="w-20 h-14 bg-gradient-to-tr from-amber-200 via-rose-200 to-sky-200 rounded border border-white/40 flex items-center justify-center text-xl shadow">
              🖼️
            </div>
            {/* Scanner bounding box */}
            <div className="absolute inset-2 border-2 border-dashed border-emerald-400 rounded flex items-center justify-center">
              <span className="bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow">
                AI Thẩm Định Rubric
              </span>
            </div>
          </div>
          <div className="mt-1.5 space-y-1 text-[8px]">
            <div className="flex justify-between text-slate-300">
              <span>1. Sáng tạo & Ý tưởng:</span>
              <span className="font-bold text-emerald-400">Độc đáo (T)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>2. Bố cục & Không gian:</span>
              <span className="font-bold text-emerald-400">Cân đối, rõ trọng tâm</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>3. Kỹ thuật nét & Màu sắc:</span>
              <span className="font-bold text-emerald-400">Tươi sáng, hài hòa</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>4. Cảm xúc & Hoàn thiện:</span>
              <span className="font-bold text-emerald-400">Giàu cảm xúc</span>
            </div>
          </div>
        </div>

        {/* AI Pedagogical Feedback & Conversion Result */}
        <div className="flex-1 bg-slate-950 rounded-xl p-2.5 border border-slate-800 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <span className="text-[10px] font-black text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Đánh Giá Mĩ Thuật GDPT 2018</span>
            </span>
            <span className="text-[9px] px-2 py-0.5 bg-emerald-600 text-white font-black rounded shadow">
              Mức Đạt: T (Hoàn thành tốt)
            </span>
          </div>

          <div className="bg-amber-950/40 border border-amber-500/40 rounded-lg p-2 my-1 text-[9px] text-amber-100">
            <span className="font-bold text-amber-300 block mb-0.5">💬 Lời nhận xét khích lệ sư phạm:</span>
            <p className="leading-relaxed text-[8.5px]">
              "Em vẽ bức tranh rất sinh động, màu sắc tươi vui! Hãy nhấn thêm một chút bóng đậm ở gốc cây để bức tranh có chiều sâu hơn nhé!"
            </p>
          </div>

          <div className="text-[8px] text-slate-300 border-t border-slate-800 pt-1 flex items-center justify-between">
            <span className="text-emerald-400 font-bold">✓ Tự động đồng bộ thẳng vào Sổ Điểm SMAS</span>
            <span className="text-amber-400 font-bold">Không chê bai tiêu cực</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DemoScreenPart6() {
  return (
    <div className="w-full h-full bg-slate-900/90 rounded-xl p-2.5 sm:p-3 flex flex-col gap-2 select-none border border-slate-700/80 overflow-hidden text-left">
      <div className="flex items-center justify-between pb-2 border-b border-slate-700/80">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-black text-white">Sổ Điểm SMAS 35 Tuần, Lọc Lớp Dạy & Xuất Excel / Word</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px]">
          <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
            Xuất Excel SMAS Viettel/vnEdu
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
            Xuất Word CV 2345
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between bg-slate-950 rounded-xl p-2.5 border border-slate-800 shadow-md">
        {/* Class Filter & Synthesis Action Bar */}
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 gap-2 flex-wrap text-[9px]">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-amber-400" />
            <span className="font-bold text-slate-300">Lớp phân công dạy:</span>
            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded">Lớp 1A</span>
            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded">Lớp 1B</span>
            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded">Lớp 2A</span>
            <span className="text-[8px] text-slate-500">(Đã loại bỏ lớp không dạy)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-2 py-0.5 bg-indigo-600 text-white font-bold rounded shadow-xs">
              ⚡ Tổng hợp định kỳ 1 chạm
            </span>
          </div>
        </div>

        {/* Table Mockup */}
        <table className="w-full text-[8px] text-slate-300 my-1">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="text-left pb-1">STT</th>
              <th className="text-left pb-1">Họ và tên học sinh</th>
              <th className="text-center pb-1">T1</th>
              <th className="text-center pb-1">T2</th>
              <th className="text-center pb-1">T3</th>
              <th className="text-center pb-1">Đánh giá GK/CK</th>
              <th className="text-left pb-1">Nội dung nhận xét sư phạm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            <tr>
              <td className="py-1 text-slate-400">1</td>
              <td className="py-1 font-bold text-white">Kpuih Chai</td>
              <td className="text-center"><span className="px-1 bg-emerald-900/60 text-emerald-300 rounded font-bold">T</span></td>
              <td className="text-center"><span className="px-1 bg-emerald-900/60 text-emerald-300 rounded font-bold">T</span></td>
              <td className="text-center"><span className="px-1 bg-emerald-900/60 text-emerald-300 rounded font-bold">T</span></td>
              <td className="text-center"><span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded font-bold">T</span></td>
              <td className="text-slate-300 truncate max-w-[120px]">Hoàn thành tốt, biết phối màu hài hòa</td>
            </tr>
            <tr>
              <td className="py-1 text-slate-400">2</td>
              <td className="py-1 font-bold text-white">Siu Phôn</td>
              <td className="text-center"><span className="px-1 bg-blue-900/60 text-blue-300 rounded font-bold">H</span></td>
              <td className="text-center"><span className="px-1 bg-emerald-900/60 text-emerald-300 rounded font-bold">T</span></td>
              <td className="text-center"><span className="px-1 bg-emerald-900/60 text-emerald-300 rounded font-bold">T</span></td>
              <td className="text-center"><span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded font-bold">T</span></td>
              <td className="text-slate-300 truncate max-w-[120px]">Nét vẽ tự tin, màu sắc tươi sáng đều tay</td>
            </tr>
            <tr>
              <td className="py-1 text-slate-400">3</td>
              <td className="py-1 font-bold text-white">Rơ Mah Lan</td>
              <td className="text-center"><span className="px-1 bg-blue-900/60 text-blue-300 rounded font-bold">H</span></td>
              <td className="text-center"><span className="px-1 bg-blue-900/60 text-blue-300 rounded font-bold">H</span></td>
              <td className="text-center"><span className="px-1 bg-emerald-900/60 text-emerald-300 rounded font-bold">T</span></td>
              <td className="text-center"><span className="px-1.5 py-0.5 bg-blue-600 text-white rounded font-bold">H</span></td>
              <td className="text-slate-300 truncate max-w-[120px]">Hoàn thành bài vẽ đúng thời gian quy định</td>
            </tr>
          </tbody>
        </table>

        {/* Footer Export & Persistence Bar */}
        <div className="text-[8px] text-slate-400 border-t border-slate-800 pt-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="text-teal-400 font-bold">✓ Tải trực tiếp lên SMAS Viettel & vnEdu</span>
            <span className="text-slate-500">•</span>
            <span className="text-blue-400 font-bold">Xuất giáo án Word chuẩn Nghị định 30</span>
          </span>
          <span className="text-amber-400 font-bold">Đảo ngẫu nhiên nhận xét chống trùng lặp</span>
        </div>
      </div>
    </div>
  );
}