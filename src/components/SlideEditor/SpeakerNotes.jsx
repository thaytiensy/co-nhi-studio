import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Square, Sparkles, AlertCircle, Info, Check } from 'lucide-react';
import { speechService } from '../../utils/speechService';
import { requestTeachingAi, externalAiEnabled } from '../../utils/aiLessonGenerator.js';
import TeacherAssistantPillButton from '../UI/TeacherAssistantPillButton';

/**
 * Động cơ Sư Phạm GDPT 2018 - Tự động xây dựng lời giảng truyền cảm hứng theo từng slide
 * SGK Kết Nối Tri Thức Với Cuộc Sống, bám sát phương pháp sư phạm
 */
export function buildSlideTeacherSpeech({ slideTitle = '', slideContent = '', slide = null, grade = 1 }) {
  const cleanTitle = (slideTitle || '').trim();
  const cleanContent = (slideContent || '').trim();
  const fullText = `${cleanTitle} ${cleanContent}`.toLowerCase();

  let stageGreeting = cleanTitle 
    ? `Thầy/Cô chào các em học sinh yêu quý! Trong bài học "${cleanTitle}" theo SGK Kết Nối Tri Thức Với Cuộc Sống, thầy trò chúng mình cùng nhau khám phá nhé.`
    : `Thầy/Cô chào các em học sinh yêu quý! Hôm nay chúng mình cùng bước vào bài học mĩ thuật với tinh thần sáng tạo và hào hứng nhé.`;

  if (/khởi động|trò chơi|đố vui|bắt đầu|mở đầu/i.test(fullText)) {
    stageGreeting = `Thầy/Cô chào cả lớp! Để bắt đầu tiết học thật sôi nổi, chúng mình cùng tham gia hoạt động khởi động thú vị nhé!`;
  } else if (/khám phá|quan sát|nhận biết|tìm hiểu/i.test(fullText)) {
    stageGreeting = `Các em thân yêu, bây giờ chúng mình cùng quan sát để khám phá những điều kì diệu của mĩ thuật nhé.`;
  } else if (/thực hành|luyện tập|sáng tạo|vẽ|nặn|xé dán|tạo hình/i.test(fullText)) {
    stageGreeting = `Đã đến giờ thực hành sáng tạo rồi! Các em hãy chuẩn bị đầy đủ đồ dùng học tập để tạo nên tác phẩm nhé.`;
  } else if (/trưng bày|chia sẻ|đánh giá|cảm nhận|tổng kết/i.test(fullText)) {
    stageGreeting = `Thầy/Cô rất vui khi thấy những tác phẩm rực rỡ đã hoàn thành. Bây giờ chúng mình cùng trưng bày và chia sẻ nào!`;
  }

  let inquiryQuestion = `Các em hãy quan sát xem trong hình ảnh này, điểm nào làm các em chú ý nhất?`;
  let techniqueTip = `Bí quyết mĩ thuật SGK Kết Nối Tri Thức: Phối hợp hài hòa giữa mảng sáng và tối, đặt chi tiết chính ở vị trí cân đối.`;
  let encouragement = `Mỗi nét vẽ của các em đều chứa đựng cảm xúc riêng. Chúc các em tự tin sáng tạo!`;

  if (/sáp màu|tô màu|màu sắc|gam màu|màu nóng|màu lạnh|phối màu/i.test(fullText)) {
    inquiryQuestion = `Đố các em tìm thấy gam màu nóng và gam màu lạnh đang cùng xuất hiện ở đâu?`;
    techniqueTip = `Bí quyết dùng sáp màu: Viền nhẹ mép hình trước rồi di màu đều tay theo một chiều.`;
    encouragement = `Hãy tự do chọn gam màu em yêu thích nhất!`;
  } else if (/đất nặn|tạo khối|nặn/i.test(fullText)) {
    inquiryQuestion = `Để tạo nên hình khối này, các em cần kết hợp những khối cơ bản nào?`;
    techniqueTip = `Bí quyết nặn: Nhào đất mềm dẻo, nặn bộ phận to trước rồi miết nhẹ mối nối.`;
    encouragement = `Đôi bàn tay khéo léo sẽ biến đất nặn thành tác phẩm đáng yêu!`;
  } else if (/xé dán|giấy màu|cắt dán/i.test(fullText)) {
    inquiryQuestion = `Đường viền xé bằng tay tạo nên nét tự nhiên và mềm mại ra sao?`;
    techniqueTip = `Bí quyết xé dán: Xé mảng lớn định hình bố cục rồi chấm hồ vừa đủ.`;
    encouragement = `Nét xé tự nhiên luôn mang lại vẻ đẹp độc đáo!`;
  } else if (/chân dung|khuôn mặt|người|bạn|thầy|cô/i.test(fullText)) {
    inquiryQuestion = `Khuôn mặt nhân vật đang thể hiện cảm xúc gì?`;
    techniqueTip = `Bí quyết vẽ chân dung: Mắt ở khoảng giữa khuôn mặt, miệng ở khoảng 1/3 phía dưới.`;
    encouragement = `Hãy gửi gắm tình cảm chân thành vào bài vẽ!`;
  } else if (/phong cảnh|thiên nhiên|quê hương|biển|cây|núi|nhà/i.test(fullText)) {
    inquiryQuestion = `Cảnh vật ở gần và ở xa có kích thước, độ đậm nhạt khác nhau ra sao?`;
    techniqueTip = `Luật xa gần: Cảnh ở gần vẽ to rõ, cảnh ở xa vẽ nhỏ và nhạt dần.`;
    encouragement = `Mang tình yêu quê hương vào từng nét vẽ của mình!`;
  } else if (/đại dương|biển|cá|san hô/i.test(fullText)) {
    inquiryQuestion = `Đáy đại dương bao la có những sinh vật và màu sắc kì diệu nào?`;
    techniqueTip = `Bí quyết vẽ đại dương SGK Kết Nối Tri Thức: Vẽ cá lớn ở giữa, điểm thêm cá nhỏ bơi theo đàn và rong rêu uốn lượn.`;
    encouragement = `Cùng chung tay bảo vệ môi trường biển quê hương luôn trong lành!`;
  } else if (/gia đình|bữa cơm|mẹ|bố/i.test(fullText)) {
    inquiryQuestion = `Khoảnh khắc sum họp ấm cúng bên gia đình gợi cho em cảm xúc gì?`;
    techniqueTip = `Bí quyết thể hiện tình cảm gia đình: Đặt các nhân vật quây quần bên nhau, chọn gam màu ấm áp như vàng, cam.`;
    encouragement = `Tình cảm gia đình là điều thiêng liêng nhất, mỗi nét vẽ là món quà gửi tặng người thân!`;
  }

  return `${stageGreeting}\n\n🤔 Câu hỏi gợi mở cho học sinh:\n${inquiryQuestion}\n\n💡 Bí quyết sư phạm (SGK Kết Nối Tri Thức):\n${techniqueTip}\n\n❤️ Lời khích lệ của Thầy/Cô:\n${encouragement}`;
}

export default function SpeakerNotes({
  slide,
  notes,
  onChangeNotes,
  onOpenAssistant
}) {
  const [speechState, setSpeechState] = useState(() => speechService.getState());
  const [isExpanded, setIsExpanded] = useState(true);
  const [notesFontSize, setNotesFontSize] = useState(() => {
    return Number(localStorage.getItem('co_nhi_notes_font_size')) || 20;
  });
  const [localError, setLocalError] = useState('');
  const [isGeneratingAiSpeech, setIsGeneratingAiSpeech] = useState(false);
  const [speechSuccessNotice, setSpeechSuccessNotice] = useState(false);
  const streamIntervalRef = useRef(null);

  const handleSetNotesFontSize = (size) => {
    setNotesFontSize(size);
    try {
      localStorage.setItem('co_nhi_notes_font_size', String(size));
    } catch {}
  };

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

  // Generate slide-specific teacher speech through local & online pedagogy engine
  const handleGenerateAiSpeech = async () => {
    if (isGeneratingAiSpeech) return;
    setIsGeneratingAiSpeech(true);
    setSpeechSuccessNotice(false);
    setLocalError('');

    if (speechState.isSpeaking) {
      speechService.stop();
    }

    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    streamIntervalRef.current = null;

    try {
      setLocalError('');
      const slideTitle = String(slide?.title || '').trim().slice(0, 200);
      const slideContent = getSlideTextContent().slice(0, 4000);
      const grade = `${slideTitle} ${slideContent}`.match(/(?:lớp|khối)\s*([1-5])/i)?.[1] || '1';

      let targetSpeech = '';

      // 1. Thử gọi AI trực tuyến nếu có cấu hình
      if (externalAiEnabled) {
        try {
          const prompt = `Hãy tự viết lời giảng mới, riêng cho trang trình chiếu dưới đây; không dùng lời mẫu chung. Lời giảng cần tự nhiên để giáo viên có thể nói trực tiếp, phù hợp học sinh tiểu học lớp ${grade}, giải thích đúng nội dung nhìn thấy, có câu hỏi gợi mở cụ thể và một câu chuyển tiếp/khích lệ vừa phải. Không tự thêm kiến thức, hoạt động hay vật liệu không có căn cứ trong trang. Nếu nội dung trang quá ngắn, chỉ đặt câu hỏi quan sát phù hợp với phần có thật. Viết thành 2–4 đoạn ngắn, không thêm tiêu đề, ghi chú hay nhãn vai người nói. Đây là bản nháp để giáo viên xem lại.\n\nTiêu đề trang: ${slideTitle || '(không có)'}\nNội dung chữ trên trang: ${slideContent || '(không có chữ ngoài tiêu đề)'}`;
          targetSpeech = await requestTeachingAi({ mode: 'text', grade, prompt });
        } catch (_) {
          // Bỏ qua lỗi và chuyển sang động cơ Sư phạm Cọ Nhí Cục bộ
        }
      }

      // 2. Động cơ Sư phạm GDPT 2018 Cục bộ (Chuẩn xác, sâu sắc, 100% hoạt động)
      if (!targetSpeech) {
        targetSpeech = buildSlideTeacherSpeech({ slideTitle, slideContent, slide, grade });
      }

      // Tự động mở rộng khung ghi chú để giáo viên theo dõi
      setIsExpanded(true);

      const words = targetSpeech.split(/\s+/);
      let currentIdx = 0;
      let accumulated = '';

      onChangeNotes('');
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
      }, 20);
    } catch (error) {
      setLocalError(error?.message || 'Không thể tạo lời giảng. Vui lòng thử lại.');
      setIsGeneratingAiSpeech(false);
    }
  };

  const errorMessage = localError || speechState.lastError;

  return (
    <div className="bg-white border-t border-slate-200 select-none shadow-xs transition-all">
      {/* Header bar of Speaker Notes */}
      <div className="px-4 py-2 bg-slate-50 flex items-center justify-between border-b border-slate-200 flex-wrap gap-2 font-times-new-roman">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-[14px] md:text-[15px] font-black text-amber-950 bg-amber-100/90 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-xl cursor-pointer shadow-2xs transition-all active:scale-95"
            title="Bấm để thu gọn lời giảng, giúp khung hình slide tự động phóng to tối đa"
          >
            <span className="text-amber-700">📝</span>
            <span>{isExpanded ? '🔽 Thu gọn lời giảng (Để phóng to Slide)' : '🔼 Mở rộng lời giảng (GV)'}</span>
          </button>

          {/* Senior Teacher Font Size Selector (Cỡ chữ to rõ cho GV 50+) */}
          {isExpanded && (
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-[13px] font-black text-slate-700 shadow-2xs">
              <span className="text-amber-800">👓 Cỡ chữ:</span>
              <button
                type="button"
                onClick={() => handleSetNotesFontSize(18)}
                className={`px-2 py-0.5 rounded-lg text-[13px] font-black transition-all cursor-pointer ${
                  notesFontSize === 18 ? 'bg-amber-500 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
                }`}
                title="Cỡ chữ 18px"
              >
                18px
              </button>
              <button
                type="button"
                onClick={() => handleSetNotesFontSize(21)}
                className={`px-2 py-0.5 rounded-lg text-[13px] font-black transition-all cursor-pointer ${
                  notesFontSize === 21 ? 'bg-amber-500 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
                }`}
                title="Cỡ chữ 21px - Rõ ràng"
              >
                21px (Rõ)
              </button>
              <button
                type="button"
                onClick={() => handleSetNotesFontSize(24)}
                className={`px-2 py-0.5 rounded-lg text-[13px] font-black transition-all cursor-pointer ${
                  notesFontSize === 24 ? 'bg-amber-500 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
                }`}
                title="Cỡ chữ 24px - Cực lớn cho giáo viên 50+"
              >
                24px (GV 50+)
              </button>
            </div>
          )}
        </div>

        {/* Audio Speech Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Voice Gender Switcher: Thầy giáo (Nam) / Cô giáo (Nữ) */}
          <div className="flex items-center bg-white border border-slate-300 rounded-xl p-0.5 text-[13px] font-bold shadow-2xs">
            <button
              onClick={() => speechService.setGender('male')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                speechState.gender === 'male' ? 'bg-amber-100 text-amber-950 font-black shadow-2xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
              title="Chuyển sang giọng đọc Thầy giáo (Nam)"
            >
              <span>👨</span>
              <span>Thầy (Nam)</span>
            </button>
            <button
              onClick={() => speechService.setGender('female')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                speechState.gender === 'female' ? 'bg-pink-100 text-pink-950 font-black shadow-2xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
              title="Chuyển sang giọng đọc Cô giáo (Nữ)"
            >
              <span>👩</span>
              <span>Cô (Nữ)</span>
            </button>
          </div>

          {/* Rate Selector */}
          <div className="flex items-center bg-white border border-slate-300 rounded-xl p-0.5 text-[13px] font-bold text-slate-600 shadow-2xs">
            <span className="px-1.5 text-slate-400">Tốc độ:</span>
            {[0.75, 1.0, 1.25].map((r) => (
              <button
                key={r}
                onClick={() => handleRateChange(r)}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  speechState.rate === r ? 'bg-amber-100 text-amber-950 font-black' : 'hover:bg-slate-100'
                }`}
              >
                {r}x
              </button>
            ))}
          </div>

          {/* Voice indicator badge */}
          <span className={`text-[13px] px-3 py-1 rounded-full border font-bold flex items-center gap-1.5 shadow-2xs transition-colors ${
            speechState.gender === 'female' 
              ? 'bg-pink-50 text-pink-800 border-pink-300' 
              : 'bg-amber-50 text-amber-900 border-amber-300'
          }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              speechState.gender === 'female' ? 'bg-pink-500' : 'bg-amber-500'
            }`}></span>
            <span>🎙️ {speechState.gender === 'female' ? 'Cô giáo (Hoài My)' : 'Thầy giáo (Nam Minh)'}</span>
          </span>

          {/* Nút Đọc Riêng Chữ Trên Slide */}
          <button
            onClick={() => handleToggleSpeak(true)}
            className="px-3 py-1.5 text-[14px] font-black text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Đọc toàn bộ nội dung chữ, tiêu đề, câu hỏi đang hiển thị trên slide này"
          >
            <span>📢</span>
            <span>Đọc nội dung slide</span>
          </button>

          {/* Play / Pause Button */}
          <button
            onClick={() => handleToggleSpeak(false)}
            className={`px-3.5 py-1.5 text-[14px] font-black rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
              speechState.isSpeaking && !speechState.isPaused
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
            }`}
            title="Đọc lời giảng bằng giọng tiếng Việt chuẩn của Thầy/Cô"
          >
            {speechState.isSpeaking && !speechState.isPaused ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Tạm dừng</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>{speechState.isPaused ? 'Tiếp tục đọc' : 'Đọc lời giảng'}</span>
              </>
            )}
          </button>

          {/* Stop Button */}
          {speechState.isSpeaking && (
            <button
              onClick={handleStop}
              className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl transition-all cursor-pointer"
              title="Dừng đọc"
            >
              <Square className="w-4 h-4" />
            </button>
          )}

          {/* Direct AI Speech Generation Button */}
          <button
            onClick={handleGenerateAiSpeech}
            disabled={isGeneratingAiSpeech}
            className={`px-3 py-1.5 text-[14px] font-black rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
              isGeneratingAiSpeech
                ? 'bg-amber-100 text-amber-950 border border-amber-400 animate-pulse'
                : 'text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 active:scale-95'
            }`}
            title="AI Thầy Cọ Nhí tự động phân tích trang slide và soạn thảo lời giảng truyền cảm hứng theo SGK Kết Nối Tri Thức Với Cuộc Sống"
          >
            <Sparkles className={`w-4 h-4 text-amber-600 ${isGeneratingAiSpeech ? 'animate-spin' : ''}`} />
            <span>
              {isGeneratingAiSpeech 
                ? 'AI đang soạn lời giảng...' 
                : speechSuccessNotice 
                ? '✓ Đã tạo lời giảng!' 
                : '✨ Gợi Ý Lời Giảng AI'}
            </span>
          </button>

          {/* Open Assistant Drawer Button */}
          <TeacherAssistantPillButton
            size="sm"
            onClick={onOpenAssistant}
          />
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
        <div className="p-3 bg-white font-times-new-roman" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
          {notes && isTemplateWatermark(notes) && (
            <div className="mb-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-[14px] text-amber-900 animate-in fade-in">
              <span className="flex items-center gap-1.5">
                <span>⚠️</span>
                <span>Ghi chú này chứa số điện thoại / thông tin mẫu thiết kế. Hệ thống tự động ưu tiên đọc câu chữ giáo dục trên slide khi bấm nghe.</span>
              </span>
              <button
                onClick={onOpenAssistant}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[14px] font-bold shrink-0 ml-2 shadow-2xs cursor-pointer"
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
            rows={4}
            className="w-full p-3 font-semibold text-slate-900 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/20 resize-y font-times-new-roman leading-relaxed shadow-xs"
            style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: `${notesFontSize}px`, lineHeight: 1.6 }}
          />
        </div>
      )}
    </div>
  );
}
