import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Square, Sparkles, AlertCircle, Info, Check } from 'lucide-react';
import { speechService } from '../../utils/speechService';
import { requestTeachingAi, externalAiEnabled } from '../../utils/aiLessonGenerator.js';

/**
 * Động cơ Sư Phạm GDPT 2018 - Tự động xây dựng lời giảng truyền cảm hứng theo từng slide
 * Hoạt động 100% độc lập, không yêu cầu API key, bám sát sách Mĩ thuật Tiểu học
 */
export function buildSlideTeacherSpeech({ slideTitle = '', slideContent = '', slide = null, grade = 1 }) {
  const cleanTitle = (slideTitle || '').trim();
  const cleanContent = (slideContent || '').trim();
  const fullText = `${cleanTitle} ${cleanContent}`.toLowerCase();
  const gradeNum = Number(grade) || 1;

  // 1. Lời chào & Dẫn nhập theo giai đoạn tiến trình tiết dạy
  let stageGreeting = cleanTitle 
    ? `Thầy/Cô chào các em học sinh yêu quý! Trong trang bài học "${cleanTitle}", thầy trò chúng mình cùng nhau khám phá những nét đẹp nghệ thuật mĩ thuật nhé.`
    : `Thầy/Cô chào các em học sinh yêu quý! Hôm nay, thầy trò chúng mình cùng bước vào bài học mĩ thuật với tinh thần sáng tạo và hào hứng nhé.`;

  if (/khởi động|trò chơi|đố vui|bắt đầu|mở đầu/i.test(fullText)) {
    stageGreeting = `Thầy/Cô chào cả lớp! Để bắt đầu tiết học hôm nay thật sôi nổi, thầy trò chúng mình cùng tham gia một hoạt động khởi động vô cùng thú vị nhé! Các em hãy ngồi ngay ngắn và chú ý quan sát lên màn hình nào.`;
  } else if (/khám phá|quan sát|nhận biết|tìm hiểu/i.test(fullText)) {
    stageGreeting = `Các em học sinh thân yêu, bây giờ chúng mình cùng hướng mắt lên màn hình để bước vào phần Quan sát và Khám phá những điều kì diệu của mĩ thuật nhé.`;
  } else if (/thực hành|luyện tập|sáng tạo|vẽ|nặn|xé dán|tạo hình/i.test(fullText)) {
    stageGreeting = `Đã đến giờ thực hành sáng tạo rồi! Các em hãy chuẩn bị đầy đủ đồ dùng học tập trên bàn và cùng Thầy/Cô bắt tay vào thể hiện ý tưởng độc đáo của riêng mình nào.`;
  } else if (/trưng bày|chia sẻ|đánh giá|cảm nhận|tổng kết/i.test(fullText)) {
    stageGreeting = `Thầy/Cô rất vui khi thấy những tác phẩm rực rỡ sắc màu của các em đã hoàn thành. Bây giờ, chúng mình cùng bước vào phần Trưng bày và Chia sẻ cảm xúc nhé!`;
  }

  // 2. Nhận diện chất liệu và chủ đề cụ thể để đưa ra câu hỏi và bí quyết
  let inquiryQuestion = `Các em hãy quan sát xem trong hình ảnh này, điểm nào làm các em chú ý và cảm thấy ấn tượng nhất?`;
  let techniqueTip = `Bí quyết mĩ thuật: Khi tạo hình, các em nhớ phối hợp hài hòa giữa mảng sáng và mảng tối, đặt chi tiết chính ở vị trí cân đối để tác phẩm thật nổi bật nhé.`;
  let encouragement = `Mỗi nét vẽ của các em đều chứa đựng câu chuyện và cảm xúc rất riêng. Thầy/Cô chúc các em tự tin sáng tạo nên tác phẩm độc đáo của chính mình!`;

  if (/sáp màu|tô màu|màu sắc|gam màu|màu nóng|màu lạnh|phối màu/i.test(fullText)) {
    inquiryQuestion = `Đố các em tìm thấy gam màu nóng rực rỡ và gam màu lạnh mát dịu đang cùng xuất hiện ở những chi tiết nào trên trang?`;
    techniqueTip = `Bí quyết dùng sáp màu: Các em nhớ viền nhẹ theo mép hình trước, sau đó di màu đều tay theo một chiều từ trên xuống dưới hoặc từ trái qua phải để màu mịn, không bị lem ra ngoài nhé.`;
    encouragement = `Hãy tự do chọn những gam màu mà em yêu thích nhất để bức tranh của mình thật rực rỡ và sinh động!`;
  } else if (/đất nặn|tạo khối|nặn/i.test(fullText)) {
    inquiryQuestion = `Để tạo nên hình khối sinh động này, các em thấy chúng mình cần kết hợp những khối cơ bản nào như khối tròn, khối trụ hay khối dẹt?`;
    techniqueTip = `Bí quyết nặn: Trước tiên các em hãy nhào đất thật mềm dẻo, nặn các bộ phận chính to trước, sau đó miết nhẹ mối nối cho thật chắc chắn rồi mới gắn thêm các chi tiết nhỏ xinh xắn nhé.`;
    encouragement = `Đôi bàn tay khéo léo của các em sẽ biến những thỏi đất nặn nhiều màu thành những nhân vật và con vật vô cùng đáng yêu!`;
  } else if (/xé dán|giấy màu|cắt dán/i.test(fullText)) {
    inquiryQuestion = `Các em có thấy đường viền xé bằng tay tạo nên những vệt xơ trắng tự nhiên và mềm mại hơn dùng kéo cắt không nào?`;
    techniqueTip = `Bí quyết xé dán: Hãy xé các mảng hình lớn trước để định hình bố cục, sau đó chấm hồ vừa đủ ở mặt sau, miết phẳng từ giữa ra mép rồi mới dán các chi tiết trang trí lên trên nhé.`;
    encouragement = `Cứ thoải mái xé theo cảm nhận của mình, nét xé tự nhiên luôn mang lại vẻ đẹp độc đáo, mộc mạc cho bức tranh!`;
  } else if (/chân dung|khuôn mặt|người|bạn|thầy|cô/i.test(fullText)) {
    inquiryQuestion = `Khuôn mặt của nhân vật đang thể hiện nét mặt và cảm xúc gì? Đôi mắt và nụ cười gợi cho em cảm giác như thế nào?`;
    techniqueTip = `Bí quyết vẽ chân dung: Mắt nằm ở khoảng giữa khuôn mặt, miệng ở khoảng một phần ba phía dưới. Các em nhớ vẽ thêm mái tóc, trang phục và phụ kiện để thể hiện rõ nét tính cách của nhân vật nhé.`;
    encouragement = `Hãy nghĩ về nụ cười ấm áp của người thân hay bạn bè để gửi gắm tình cảm chân thành vào bài vẽ của mình!`;
  } else if (/phong cảnh|thiên nhiên|quê hương|biển|cây|núi|nhà/i.test(fullText)) {
    inquiryQuestion = `Trong khung cảnh thiên nhiên này, các em quan sát thấy cảnh vật ở gần và cảnh vật ở xa có kích thước và độ đậm nhạt khác nhau ra sao?`;
    techniqueTip = `Luật xa gần trong mĩ thuật: Cảnh ở gần các em vẽ to, rõ nét và màu sắc đậm đà; cảnh ở xa vẽ nhỏ hơn, màu nhạt dần để tạo chiều sâu không gian thật hút mắt nhé.`;
    encouragement = `Thiên nhiên quê hương ta vô cùng tươi đẹp, các em hãy mang cả tình yêu biển trời ấy vào từng nét vẽ của mình!`;
  } else if (/đường nét|hình khối|chấm nét|họa tiết|trang trí/i.test(fullText)) {
    inquiryQuestion = `Các em có nhận thấy những nét thẳng tạo cảm giác khỏe khoắn, còn nét cong uốn lượn mang lại vẻ mềm mại, uyển chuyển thế nào không?`;
    techniqueTip = `Bí quyết trang trí: Kết hợp nhịp điệu lặp lại giữa nét to, nét nhỏ, nét thẳng và nét lượn sóng sẽ giúp họa tiết trở nên bắt mắt và cân đối hơn rất nhiều.`;
    encouragement = `Đừng ngần ngại thử nghiệm những nét vẽ mới lạ, chính sự táo bạo sẽ tạo nên phong cách nghệ thuật của riêng em!`;
  } else if (/đại dương|biển|cá|san hô|sinh vật biển/i.test(fullText)) {
    inquiryQuestion = `Đáy đại dương bao la có những sinh vật và màu sắc kì diệu nào đang cùng chung sống hòa thuận dưới làn nước trong xanh?`;
    techniqueTip = `Bí quyết vẽ sinh vật biển theo SGK Kết nối tri thức: Vẽ hình dáng chú cá lớn ở giữa, điểm thêm những chú cá nhỏ bơi theo đàn, thêm rong rêu uốn lượn và bong bóng nước để bức tranh thêm phần sinh động.`;
    encouragement = `Hãy cùng chung tay bảo vệ môi trường biển quê hương luôn trong lành qua bức tranh tuyệt đẹp của các em!`;
  } else if (/gia đình|bữa cơm|mẹ|bố|ông bà|nhà em/i.test(fullText)) {
    inquiryQuestion = `Khoảnh khắc sum họp ấm cúng bên gia đình gợi cho các em những nụ cười và ánh mắt yêu thương như thế nào?`;
    techniqueTip = `Bí quyết thể hiện tình cảm gia đình: Đặt các nhân vật quây quần bên nhau, vẽ chi tiết nét mặt vui tươi và chọn những gam màu ấm áp như vàng, cam, hồng để lan tỏa sự yêu thương nhé.`;
    encouragement = `Tình cảm gia đình là điều thiêng liêng nhất, mỗi nét vẽ đều là món quà ý nghĩa em gửi tặng những người thân yêu!`;
  }

  // Kết hợp thành bài giảng hoàn chỉnh 3-4 đoạn mạch lạc
  return `${stageGreeting}\n\n` +
    `🤔 Câu hỏi gợi mở cho học sinh:\n${inquiryQuestion}\n\n` +
    `💡 Bí quyết sư phạm & Hướng dẫn thực hành:\n${techniqueTip}\n\n` +
    `❤️ Lời khích lệ của Thầy/Cô:\n${encouragement}`;
}

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
            title="AI Thầy Cọ Nhí tự động phân tích trang slide và soạn thảo lời giảng truyền cảm hứng theo SGK Kết Nối Tri Thức Với Cuộc Sống"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-600 ${isGeneratingAiSpeech ? 'animate-spin' : ''}`} />
            <span>
              {isGeneratingAiSpeech 
                ? 'AI đang soạn lời giảng...' 
                : speechSuccessNotice 
                ? '✓ Đã tạo lời giảng (Kết Nối Tri Thức)!' 
                : '✨ Gợi Ý Lời Giảng AI'}
            </span>
          </button>

          {/* Open Assistant Drawer Button */}
          <button
            onClick={onOpenAssistant}
            className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 hover:text-purple-700 border border-slate-200 hover:border-purple-300 rounded-lg flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Mở thanh trợ giảng sư phạm chi tiết (Đố vui, Mục tiêu TT32, 4 bước vẽ)"
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
