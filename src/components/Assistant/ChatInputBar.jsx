"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles } from 'lucide-react';

const SUGGESTION_CHIPS = [
  { label: '🌟 Trò chơi khởi động 5p', prompt: 'Gợi ý 1 trò chơi khởi động vui nhộn 5 phút cho tiết học mĩ thuật này.' },
  { label: '🎨 Bé sợ sai, vẽ chậm thì sao?', prompt: 'Làm sao để giúp học sinh sợ vẽ sai, vẽ quá chậm tự tin cầm bút và hoàn thành bài?' },
  { label: '🎙️ Lời giảng mở đầu truyền cảm hứng', prompt: 'Hãy soạn lời dẫn mở đầu hấp dẫn, gần gũi để giáo viên nói với học sinh trước khi vẽ.' },
  { label: '🔍 Câu hỏi gợi mở tư duy', prompt: 'Gợi ý 3 câu hỏi gợi mở đa giác quan giúp học sinh khám phá và sáng tạo.' },
  { label: '📝 Nhận xét nhanh chuẩn TT27', prompt: 'Gợi ý các mẫu nhận xét học sinh mức T, H, C theo Thông tư 27 cho bài vẽ này.' },
  { label: '🎨 4 bước vẽ tranh thị phạm', prompt: 'Chia nhỏ quy trình vẽ bài này thành 4 bước cơ bản từ phác nét đến hoàn thiện màu sắc.' },
];

export default function ChatInputBar({
  userQuery,
  onQueryChange,
  onSubmit,
  isLoading,
  onSelectSuggestion,
}) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

  // Khởi tạo nhận diện giọng nói Web Speech API tiếng Việt
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'vi-VN';

        recognition.onresult = (event) => {
          const transcript = event.results[0]?.[0]?.transcript || '';
          if (transcript) {
            onQueryChange(prev => (prev ? `${prev} ${transcript}` : transcript));
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [onQueryChange]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt hiện tại chưa hỗ trợ nhận diện giọng nói trực tiếp. Thầy/Cô hãy dùng Chrome hoặc Edge nhé!');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && userQuery.trim()) {
        onSubmit(e);
      }
    }
  };

  return (
    <div className="p-3 bg-white border-t border-slate-200/90 shrink-0 space-y-2 select-none">
      {/* Horizontally scrollable quick suggestions */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar text-[11px]">
        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
          <Sparkles className="w-2.5 h-2.5" /> Gợi ý:
        </span>
        {SUGGESTION_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => onSelectSuggestion(chip.prompt)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 text-slate-700 font-bold rounded-full border border-slate-200 whitespace-nowrap transition-all shrink-0 cursor-pointer text-[11px] active:scale-95"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input query field with voice button and send button */}
      <form onSubmit={onSubmit} className="flex items-end gap-1.5">
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:bg-white focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all flex items-center gap-1">
          <textarea
            ref={textareaRef}
            rows={1}
            value={userQuery}
            disabled={isLoading}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Đang lắng nghe Thầy/Cô nói bằng tiếng Việt..." : "Nhắn tin với Cô Trợ Giảng (Enter để gửi)..."}
            className="flex-1 px-2 py-1 text-xs sm:text-[13px] text-slate-800 bg-transparent resize-none focus:outline-none placeholder:text-slate-400 max-h-24 leading-relaxed font-sans"
          />

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md ring-2 ring-rose-400/50'
                : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
            }`}
            title={isListening ? "Đang nghe... bấm để dừng" : "Bấm để nói bằng giọng nói tiếng Việt"}
          >
            {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoading || !userQuery.trim()}
          className={`p-2.5 rounded-2xl shadow-md transition-all flex items-center justify-center shrink-0 cursor-pointer ${
            isLoading || !userQuery.trim()
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white active:scale-95'
          }`}
          title="Gửi câu hỏi"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
