import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Square, Sparkles, AlertCircle, Info } from 'lucide-react';
import { speechService } from '../../utils/speechService';

export default function SpeakerNotes({
  slide,
  notes,
  onChangeNotes,
  onOpenAssistant
}) {
  const [speechState, setSpeechState] = useState({
    isSpeaking: false,
    isPaused: false,
    rate: 1.0,
    hasViVoice: true,
    voiceName: '',
    lastError: null
  });
  const [isExpanded, setIsExpanded] = useState(true);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    const unsubscribe = speechService.subscribe(setSpeechState);
    return () => {
      unsubscribe();
      speechService.stop();
    };
  }, []);

  // Lấy toàn bộ nội dung chữ trực quan đang hiển thị trên slide
  const getSlideTextContent = () => {
    if (!slide) return '';
    const parts = [];

    // Tiêu đề của slide (nếu có và không phải watermark)
    if (slide.title && slide.title.trim() && !slide.title.startsWith('Trang ') && !isTemplateWatermark(slide.title)) {
      parts.push(`Tiêu đề: ${slide.title.trim()}`);
    }

    if (slide.elements) {
      slide.elements.forEach(el => {
        if ((el.type === 'text' || el.type === 'shape') && el.text && el.text.trim()) {
          if (!isTemplateWatermark(el.text)) {
            parts.push(el.text.trim());
          }
        }
      });
    }

    return parts.join('. ');
  };

  // Nhận diện ghi chú chỉ là thông tin mẫu thiết kế/Zalo của bên thứ ba
  const isTemplateWatermark = (text) => {
    if (!text) return true;
    const lower = text.toLowerCase();
    return (
      lower.includes('thiết kế') || 
      lower.includes('zalo') || 
      lower.includes('097') || 
      lower.includes('098') || 
      lower.includes('090') || 
      lower.includes('091') || 
      lower.includes('096') || 
      lower.includes('086') || 
      lower.includes('hương thảo') ||
      lower.includes('sđt') ||
      lower.includes('template')
    );
  };

  const getBestTextToSpeak = (preferSlide = false) => {
    const slideText = getSlideTextContent();
    const cleanNotes = (notes || '').trim();

    if (preferSlide && slideText) {
      return slideText;
    }

    // Nếu ghi chú có nội dung sư phạm thật (không phải watermark), đọc ghi chú
    if (cleanNotes && !isTemplateWatermark(cleanNotes)) {
      return cleanNotes;
    }

    // Nếu ghi chú trống hoặc chỉ là watermark bản quyền mẫu, đọc nội dung trên slide
    if (slideText) {
      return slideText;
    }

    if (cleanNotes) {
      return cleanNotes;
    }

    return 'Trang slide này chưa có văn bản. Thầy Cô có thể nhập lời giảng vào ô bên dưới hoặc thêm tiêu đề cho slide nhé.';
  };

  const handleToggleSpeak = (preferSlide = false) => {
    setLocalError('');
    if (speechState.isSpeaking) {
      if (speechState.isPaused) {
        speechService.resume();
      } else {
        speechService.pause();
      }
    } else {
      const textToRead = getBestTextToSpeak(preferSlide);
      const res = speechService.speak(textToRead);
      if (res && !res.success) {
        setLocalError(res.error);
      }
    }
  };

  const handleStop = () => {
    speechService.stop();
    setLocalError('');
  };

  const handleRateChange = (rate) => {
    speechService.setRate(rate);
  };

  const errorMessage = localError || speechState.lastError;

  return (
    <div className="bg-white border-t border-slate-200 select-none shadow-xs transition-all">
      {/* Header bar of Speaker Notes */}
      <div className="px-4 py-2 bg-slate-50 flex items-center justify-between border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-700"
          >
            <span className="text-amber-600">📝</span>
            <span>Ghi Chú & Lời Giảng Của Giáo Viên</span>
            <span className="text-[10px] text-slate-400 font-normal">
              ({isExpanded ? 'Bấm để thu gọn' : 'Bấm để mở rộng'})
            </span>
          </button>
        </div>

        {/* Audio Speech Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Voice Gender Switcher: Thầy giáo (Nam) / Cô giáo (Nữ) */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-[11px] font-bold">
            <button
              onClick={() => speechService.setGender('male')}
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                speechState.gender === 'male' ? 'bg-amber-100 text-amber-900 font-extrabold shadow-2xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
              title="Chuyển sang giọng đọc Thầy giáo (Nam)"
            >
              <span>👨</span>
              <span>Thầy (Nam)</span>
            </button>
            <button
              onClick={() => speechService.setGender('female')}
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                speechState.gender === 'female' ? 'bg-pink-100 text-pink-900 font-extrabold shadow-2xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
              title="Chuyển sang giọng đọc Cô giáo (Nữ)"
            >
              <span>👩</span>
              <span>Cô (Nữ)</span>
            </button>
          </div>

          {/* Rate Selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-[11px] font-bold text-slate-600">
            <span className="px-1.5 text-slate-400">Tốc độ:</span>
            {[0.75, 1.0, 1.25].map((r) => (
              <button
                key={r}
                onClick={() => handleRateChange(r)}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  speechState.rate === r ? 'bg-amber-100 text-amber-900 font-extrabold' : 'hover:bg-slate-100'
                }`}
              >
                {r}x
              </button>
            ))}
          </div>

          {/* Voice indicator badge */}
          <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>🎙️ {speechState.voiceName || 'Giọng đọc Tiếng Việt'}</span>
          </span>

          {/* Nút Đọc Riêng Chữ Trên Slide */}
          <button
            onClick={() => handleToggleSpeak(true)}
            className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1 transition-all shadow-2xs"
            title="Đọc toàn bộ nội dung chữ, tiêu đề, câu hỏi đang hiển thị trên slide này"
          >
            <span>📢</span>
            <span>Đọc nội dung slide</span>
          </button>

          {/* Play / Pause Button - Luôn luôn hoạt động, không bị vô hiệu */}
          <button
            onClick={() => handleToggleSpeak(false)}
            className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-2xs ${
              speechState.isSpeaking && !speechState.isPaused
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
            }`}
            title="Đọc lời giảng bằng giọng tiếng Việt chuẩn của Thầy/Cô"
          >
            {speechState.isSpeaking && !speechState.isPaused ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Tạm dừng</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>{speechState.isPaused ? 'Tiếp tục đọc' : 'Đọc lời giảng'}</span>
              </>
            )}
          </button>

          {/* Stop Button */}
          {speechState.isSpeaking && (
            <button
              onClick={handleStop}
              className="p-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition-all"
              title="Dừng đọc"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Open Assistant Button */}
          <button
            onClick={onOpenAssistant}
            className="px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1 transition-all"
            title="Mở gợi ý lời dẫn sư phạm từ Trợ giảng"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Gợi Ý Lời Giảng</span>
          </button>
        </div>
      </div>

      {/* Warning / Error Message if device lacks vi-VN voice */}
      {errorMessage && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-start gap-2 text-xs text-amber-900 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{errorMessage}</span>
          </div>
          <button 
            onClick={() => setLocalError('')}
            className="text-amber-700 hover:text-amber-900 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Textarea for Notes */}
      {isExpanded && (
        <div className="p-3 bg-white">
          {notes && isTemplateWatermark(notes) && (
            <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-900 animate-in fade-in">
              <span className="flex items-center gap-1.5">
                <span>⚠️</span>
                <span>Ghi chú này chứa số điện thoại / thông tin mẫu thiết kế. Hệ thống tự động ưu tiên đọc câu chữ giáo dục trên slide khi bấm nghe.</span>
              </span>
              <button
                onClick={onOpenAssistant}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 ml-2 shadow-2xs"
              >
                ✨ Lấy Lời Giảng Mới
              </button>
            </div>
          )}
          <textarea
            value={notes || ''}
            onChange={(e) => {
              onChangeNotes(e.target.value);
              // Nếu đang đọc mà đổi ghi chú, dừng lượt cũ để chuẩn bị đọc nội dung mới
              if (speechState.isSpeaking) {
                speechService.stop();
              }
            }}
            placeholder="Nhập lời dẫn, câu hỏi gợi mở hoặc lời giảng của Thầy/Cô cho trang slide này. Sau đó bấm 'Đọc lời giảng' để nghe thử..."
            rows={3}
            className="w-full p-2.5 text-sm text-slate-700 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-y font-sans leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}
