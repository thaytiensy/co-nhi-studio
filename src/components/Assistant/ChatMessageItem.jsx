"use client";

import React, { useState } from 'react';
import { Volume2, Copy, Check, FileText, Sparkles } from 'lucide-react';
import { speechService } from '../../utils/speechService';

export default function ChatMessageItem({
  message,
  onInsertToNotes,
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    speechService.speak(message.content);
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-3 animate-in fade-in slide-in-from-bottom-1 duration-150">
        <div className="max-w-[85%] flex flex-col items-end">
          <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium text-xs sm:text-[13px] rounded-2xl rounded-tr-xs shadow-sm leading-relaxed whitespace-pre-wrap select-text">
            {message.content}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-semibold pr-1">
            {message.time || 'Vừa xong'}
          </span>
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex items-start gap-2 mb-3.5 animate-in fade-in slide-in-from-bottom-1 duration-150">
      {/* Mini Avatar */}
      <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-400 shadow-2xs shrink-0 mt-0.5 bg-slate-900">
        <img
          src="/images/tro-giang-ai.jpg"
          alt="Cô Trợ Giảng"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-[88%] flex flex-col items-start min-w-0">
        <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-3.5 shadow-2xs text-slate-800 text-xs sm:text-[13px] leading-relaxed w-full select-text">
          {message.title && (
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-xs text-amber-800 flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{message.title}</span>
              </h4>
              {message.provider && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 shrink-0 ml-1">
                  {message.provider}
                </span>
              )}
            </div>
          )}

          <div className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed space-y-1">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-amber-500 animate-pulse align-middle" />
            )}
          </div>

          {/* Action Toolbar on Assistant Message */}
          {!message.isStreaming && message.id !== 'welcome' && (
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1 flex-wrap text-[11px]">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSpeak}
                  className="px-2 py-1 font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  title="Nghe Cô Trợ Giảng đọc câu này"
                >
                  <Volume2 className="w-3 h-3 text-emerald-600" />
                  <span>Nghe đọc</span>
                </button>

                {onInsertToNotes && (
                  <button
                    type="button"
                    onClick={() => onInsertToNotes(message.content)}
                    className="px-2 py-1 font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    title="Chèn nội dung này vào ghi chú bài giảng"
                  >
                    <FileText className="w-3 h-3 text-amber-700" />
                    <span>Vào bài giảng</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="px-2 py-1 font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                title="Sao chép nội dung câu trả lời"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Đã chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Chép</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <span className="text-[10px] text-slate-400 mt-1 font-medium pl-1">
          {message.time || 'Vừa xong'}
        </span>
      </div>
    </div>
  );
}
