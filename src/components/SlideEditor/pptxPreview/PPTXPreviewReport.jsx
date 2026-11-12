import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';

export default function PPTXPreviewReport({ retained = [], omitted = [] }) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-4 font-times-new-roman" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      {/* Retained components */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
        <h4 className="font-extrabold text-[14px] text-emerald-900 flex items-center gap-1.5 mb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Thành Phần Giữ Được:</span>
        </h4>
        <ul className="text-[14px] text-emerald-950 space-y-1.5">
          {retained?.map((item, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-emerald-600 font-bold">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Omitted / Simplified components */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <h4 className="font-extrabold text-[14px] text-slate-700 flex items-center gap-1.5 mb-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span>Giới Hạn Cần Lưu Ý:</span>
        </h4>
        <ul className="text-[14px] text-slate-600 space-y-1.5">
          {omitted?.map((item, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-slate-400 font-bold">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
