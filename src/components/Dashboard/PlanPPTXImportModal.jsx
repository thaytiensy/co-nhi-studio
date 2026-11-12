import React, { useState, useRef } from 'react';
import {
  Upload,
  Sparkles,
  FileText,
  AlertCircle,
  X,
  Loader2,
  Presentation,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { parsePPTXFile } from '../../utils/pptxImportService';
import { buildStandardSlidesForPlan } from '../../utils/planSlideGenerator';

export default function PlanPPTXImportModal({
  plan,
  onConfirmImport,
  onClose
}) {
  const [isParsing, setIsParsing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  if (!plan) return null;

  const handleSelectFile = () => {
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pptx')) {
      setErrorMessage('Vui lòng chọn tệp định dạng PowerPoint (.pptx).');
      return;
    }

    setIsParsing(true);
    setErrorMessage('');

    try {
      const result = await parsePPTXFile(file);
      if (result.success && Array.isArray(result.slides) && result.slides.length > 0) {
        onConfirmImport(result.slides, plan.title);
        onClose();
      } else {
        setErrorMessage(result.error || 'Không trích xuất được slide từ tệp PowerPoint.');
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Lỗi khi phân tích tệp PowerPoint.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleGenerateStandardSlides = () => {
    try {
      const standardSlides = buildStandardSlidesForPlan(plan);
      onConfirmImport(standardSlides, plan.title);
      onClose();
    } catch (err) {
      setErrorMessage(err?.message || 'Không thể tạo slide mẫu.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col animate-in zoom-in-95 font-times-new-roman"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-black">
              📊
            </div>
            <div>
              <h3 className="text-base font-black tracking-wide">
                Nhập Giáo Án PowerPoint Bài Dạy
              </h3>
              <p className="text-[14px] text-amber-100 font-semibold">
                Lớp {plan.grade} • Tuần {plan.week} • Tiết {plan.period}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
            title="Đóng hộp thoại"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plan Summary Card */}
        <div className="p-5 bg-slate-50 border-b border-slate-200/80 space-y-1.5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
            <h4 className="text-base font-extrabold text-slate-800 line-clamp-2">
              {plan.title}
            </h4>
          </div>
          <p className="text-[14px] text-slate-700 leading-relaxed pl-6">
            🎯 <strong>Mục tiêu:</strong> {plan.objectives}
          </p>
        </div>

        {/* Error alert if any */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-[14px] text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Options Body */}
        <div className="p-5 space-y-3.5">
          <p className="text-[14px] font-bold text-slate-700 uppercase tracking-wider">
            Chọn phương thức nạp dữ liệu để chuyển sang tab Soạn Slide:
          </p>

          {/* Option 1: Upload PowerPoint File */}
          <div
            onClick={isParsing ? undefined : handleSelectFile}
            className="p-4 rounded-2xl border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 cursor-pointer transition-all group flex items-start gap-3.5 shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
              {isParsing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h5 className="text-base font-black text-amber-950">
                  {isParsing ? 'Đang phân tích tệp PowerPoint...' : '1. Tải Lên Tệp PowerPoint (.pptx)'}
                </h5>
                <span className="px-2 py-0.5 rounded-full text-[14px] font-black bg-amber-200 text-amber-900 uppercase">
                  Khuyên dùng
                </span>
              </div>
              <p className="text-[14px] text-slate-700 mt-1 leading-relaxed">
                Chọn tệp giáo án điện tử có sẵn trên máy tính. Hệ thống tự động trích xuất slide, văn bản, ảnh nhúng và mở ngay trong tab Soạn Slide.
              </p>
            </div>
          </div>

          {/* Option 2: Auto-generate Standard Slides */}
          <div
            onClick={isParsing ? undefined : handleGenerateStandardSlides}
            className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 bg-white hover:bg-purple-50/50 cursor-pointer transition-all group flex items-start gap-3.5 shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-base font-black text-slate-900 group-hover:text-purple-950">
                2. Tự Động Tạo Bộ Slide Chuẩn (Kết Nối Tri Thức)
              </h5>
              <p className="text-[14px] text-slate-600 mt-1 leading-relaxed">
                Chưa có file PowerPoint? Tự động tạo 4 slide chuẩn Công văn 2345 (Khởi động, Khám phá, Thực hành 4 bước, Trưng bày TT27) cho bài này.
              </p>
            </div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".pptx"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isParsing}
            className="px-4 py-2 text-[14px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
