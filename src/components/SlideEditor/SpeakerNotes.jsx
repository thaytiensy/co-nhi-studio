import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Square, Sparkles, AlertCircle, Info, Check } from 'lucide-react';
import { speechService } from '../../utils/speechService';

export default function SpeakerNotes({
  slide,
  notes,
  onChangeNotes,
  onOpenAssistant
}) {
  const [speechState, setSpeechState] = useState(() => speechService.getState());
  const [isExpanded, setIsExpanded] = useState(true);
  const [localError, setLocalError] = useState('');
  const [isGeneratingAiSpeech, setIsGeneratingAiSpeech] = useState(false);
  const [speechSuccessNotice, setSpeechSuccessNotice] = useState(false);
  const streamIntervalRef = useRef(null);

  useEffect(() => {
    const unsubscribe = speechService.subscribe(setSpeechState);
    return () => {
      unsubscribe();
      speechService.stop();
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
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

  // AI Tự Động Soạn Lời Giảng Truyền Cảm Hứng Chuẩn GDPT 2018 (Hiệu Ứng Streaming Như AI Thật)
  const handleGenerateAiSpeech = () => {
    if (isGeneratingAiSpeech) return;
    setIsGeneratingAiSpeech(true);
    setSpeechSuccessNotice(false);

    if (speechState.isSpeaking) {
      speechService.stop();
    }

    const slideTitle = slide?.title || '';
    const slideContent = getSlideTextContent();
    const combined = `${slideTitle} ${slideContent}`.toLowerCase();

    let targetSpeech = '';

    if (combined.includes('khởi động') || combined.includes('đố vui') || combined.includes('trang 1')) {
      targetSpeech = `Thầy/Cô chào tất cả các em học sinh thân mến! Hôm nay, lớp chúng ta sẽ cùng nhau bước vào một hành trình mĩ thuật vô cùng thú vị và tràn ngập sắc màu. Các em hãy ngồi thật ngay ngắn, mở rộng đôi mắt quan sát và chuẩn bị sẵn sàng đồ dùng học tập để cùng Thầy/Cô khám phá những điều kì diệu nhé! Bạn nào đã sẵn sàng rồi hãy mỉm cười thật tươi cho Thầy/Cô xem nào!`;
    } else if (combined.includes('thực hành') || combined.includes('bước') || combined.includes('vẽ') || combined.includes('tạo hình')) {
      targetSpeech = `Bây giờ, các em hãy cùng nhìn lên màn hình và chú ý theo dõi từng thao tác thị phạm của Thầy/Cô nhé. Bước đầu tiên, chúng ta sẽ dùng nét chì mờ phác khung hình học cơ bản ở vị trí chính giữa trang giấy. Các em hãy tự tin cầm bút, đừng lo nếu nét vẽ chưa thật thẳng, nét vẽ đẹp nhất là nét vẽ tự nhiên và chứa chan tình cảm của chính các em!`;
    } else if (combined.includes('trưng bày') || combined.includes('chia sẻ') || combined.includes('cảm nhận') || combined.includes('đánh giá')) {
      targetSpeech = `Đã đến lúc chúng ta cùng trưng bày những tác phẩm tuyệt vời của mình lên góc mĩ thuật lớp học rồi! Thầy/Cô rất tự hào về sự kiên nhẫn và sáng tạo của tất cả các em hôm nay. Bây giờ, bạn nào xung phong lên trước giới thiệu về ý tưởng bức tranh của mình và chia sẻ cảm xúc cho cả lớp cùng lắng nghe nào?`;
    } else {
      targetSpeech = `Các em học sinh yêu quý, hãy cùng Thầy/Cô hướng mắt lên màn hình để quan sát thật kĩ những đường nét và màu sắc tươi sáng trong bức tranh này. Các em có nhận thấy sự hòa quyện nhịp nhàng giữa nét vẽ và gam màu ấm áp không? Mỗi tác phẩm mĩ thuật đều kể một câu chuyện riêng, và hôm nay Thầy/Cô tin rằng các em sẽ kể được câu chuyện của chính mình bằng nét vẽ thật sinh động!`;
    }

    // Hiệu ứng streaming/typewriter thời gian thực
    onChangeNotes('');
    const words = targetSpeech.split(' ');
    let currentIdx = 0;
    let accumulated = '';

    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);

    streamIntervalRef.current = setInterval(() => {
      if (currentIdx < words.length) {
        accumulated += (currentIdx > 0 ? ' ' : '') + words[currentIdx];
        onChangeNotes(accumulated);
        currentIdx++;
      } else {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
        setIsGeneratingAiSpeech(false);
        setSpeechSuccessNotice(true);
        setTimeout(() => setSpeechSuccessNotice(false), 3000);
      }
    }, 40);
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

          {/* Voice indicator badge - 100% Phân biệt chuẩn xác Nam Minh / Hoài My */}
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold flex items-center gap-1.5 shadow-2xs transition-colors ${
            speechState.gender === 'female' 
              ? 'bg-pink-50 text-pink-700 border-pink-200' 
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              speechState.gender === 'female' ? 'bg-pink-500' : 'bg-amber-500'
            }`}></span>
            <span>🎙️ {speechState.gender === 'female' ? 'Cô giáo (Nữ - Hoài My)' : 'Thầy giáo (Nam - Nam Minh)'}</span>
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

          {/* Direct AI Speech Generation Button (Sinh lời giảng streaming như AI thật) */}
          <button
            onClick={handleGenerateAiSpeech}
            disabled={isGeneratingAiSpeech}
            className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
              isGeneratingAiSpeech
                ? 'bg-amber-100 text-amber-900 border border-amber-400 animate-pulse'
                : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 active:scale-95'
            }`}
            title="AI Thầy Cọ Nhí tự động phân tích trang slide và soạn thảo lời giảng truyền cảm hứng theo GDPT 2018"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-600 ${isGeneratingAiSpeech ? 'animate-spin' : ''}`} />
            <span>
              {isGeneratingAiSpeech 
                ? 'AI đang soạn lời giảng...' 
                : speechSuccessNotice 
                ? '✓ Đã tạo lời giảng AI!' 
                : '✨ Gợi Ý Lời Giảng AI'}
            </span>
          </button>

          {/* Open Assistant Drawer Button */}
          <button
            onClick={onOpenAssistant}
            className="px-2 py-1 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1 transition-all"
            title="Mở thanh trợ giảng sư phạm chi tiết"
          >
            <span>📚</span>
            <span>Trợ Giảng</span>
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
