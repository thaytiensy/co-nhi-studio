import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  CheckCircle2, 
  Copy, 
  Volume2, 
  PlusCircle, 
  Info,
  HelpCircle,
  Lightbulb,
  Compass,
  ArrowRight,
  Bot,
  Globe,
  Key,
  Loader2
} from 'lucide-react';
import { PEDAGOGY_BANK } from '../../data/pedagogyBank';
import { speechService } from '../../utils/speechService';

export default function OfflinePedagogyAssistant({
  currentSlide = null,
  currentGrade = 1,
  onInsertToNotes,
  onAddNewSlideWithContent,
  onClose
}) {
  const [selectedGrade, setSelectedGrade] = useState(currentGrade);
  const [selectedThemeId, setSelectedThemeId] = useState(PEDAGOGY_BANK.themes[selectedGrade]?.[0]?.id || '');
  const [userQuery, setUserQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const [currentGender, setCurrentGender] = useState(() => speechService.gender || 'male');

  React.useEffect(() => {
    const unsub = speechService.subscribe((state) => {
      setCurrentGender(state.gender);
    });
    return () => unsub();
  }, []);

  // Đọc toàn bộ chữ trên slide hiện tại (loại bỏ watermark bản quyền mẫu)
  const handleReadCurrentSlide = () => {
    if (!currentSlide) {
      speechService.speak('Hiện chưa chọn trang slide nào.');
      return;
    }

    const isWatermark = (txt) => {
      if (!txt) return true;
      const lower = txt.toLowerCase();
      return (
        lower.includes('thiết kế') || 
        lower.includes('zalo') || 
        lower.includes('097') || 
        lower.includes('098') || 
        lower.includes('090') || 
        lower.includes('091') || 
        lower.includes('hương thảo') ||
        lower.includes('template')
      );
    };

    const parts = [];
    if (currentSlide.title && currentSlide.title.trim() && !currentSlide.title.startsWith('Trang ') && !isWatermark(currentSlide.title)) {
      parts.push(`Tiêu đề: ${currentSlide.title.trim()}`);
    }

    (currentSlide.elements || []).forEach(e => {
      if ((e.type === 'text' || e.type === 'shape') && e.text && e.text.trim()) {
        if (!isWatermark(e.text)) {
          parts.push(e.text.trim());
        }
      }
    });

    let textToRead = parts.join('. ');
    if (!textToRead && currentSlide.notes && !isWatermark(currentSlide.notes)) {
      textToRead = currentSlide.notes.trim();
    }
    if (!textToRead) {
      textToRead = 'Trang slide này hiện chưa có nội dung văn bản giáo khoa. Thầy/Cô hãy thêm tiêu đề hoặc lời giảng nhé.';
    }

    speechService.speak(textToRead);
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'assistant',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: '🎙️ Đang Đọc Nội Dung Slide',
        content: textToRead,
        provider: 'Trợ Giảng Cọ Nhí'
      }
    ]);
  };

  const handleGenderToggle = (gender) => {
    speechService.setGender(gender);
    setCurrentGender(gender);
  };

  // AI Provider state: 'offline' | 'pollinations' | 'gemini' (Mặc định Cọ Nhí Cục Bộ GDPT 2018 siêu tốc, 100% không nghẽn)
  const [aiProvider, setAiProvider] = useState('offline');
  const [geminiApiKey, setGeminiApiKey] = useState(
    typeof window !== 'undefined' ? (localStorage.getItem('co_nhi_gemini_api_key') || '') : ''
  );
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Hiệu ứng streaming/typewriter gõ chữ từng từ giống như AI thực thụ
  const streamAssistantMessage = (title, fullContent, providerName) => {
    const msgId = Date.now().toString();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [...prev, {
      id: msgId,
      sender: 'assistant',
      time,
      title,
      content: '',
      provider: providerName,
      isStreaming: true
    }]);

    const words = (fullContent || '').split(' ');
    let currentIdx = 0;
    let accumulated = '';

    const interval = setInterval(() => {
      if (currentIdx < words.length) {
        accumulated += (currentIdx > 0 ? ' ' : '') + words[currentIdx];
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: accumulated } : m));
        currentIdx++;
      } else {
        clearInterval(interval);
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isStreaming: false } : m));
        setIsLoading(false);
      }
    }, 28);
  };

  // Chat message history
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      time: 'Vừa xong',
      title: 'Chào Thầy/Cô Mĩ Thuật!',
      content: 'Em là Trợ Giảng Sư Phạm của Cọ Nhí Studio. Thầy/Cô có thể lựa chọn mô hình AI miễn phí phù hợp bên dưới (Cọ Nhí Cục Bộ GDPT 2018, Pollinations AI Miễn Phí không cần key, hoặc Gemini API cá nhân).\n\nEm sẵn sàng hỗ trợ soạn mục tiêu, hoạt động khởi động, câu hỏi gợi mở và lời giảng truyền cảm hứng theo đúng sách Kết nối tri thức với cuộc sống!',
      actions: true
    }
  ]);

  const themesForGrade = PEDAGOGY_BANK.themes[selectedGrade] || [];
  const currentTheme = themesForGrade.find(t => t.id === selectedThemeId) || themesForGrade[0];

  const handleGradeChange = (grade) => {
    setSelectedGrade(grade);
    const newThemes = PEDAGOGY_BANK.themes[grade] || [];
    if (newThemes.length > 0) {
      setSelectedThemeId(newThemes[0].id);
    }
  };

  const handleSaveGeminiKey = (key) => {
    setGeminiApiKey(key);
    localStorage.setItem('co_nhi_gemini_api_key', key.trim());
    setShowKeyInput(false);
  };

  // Call online AI (Pollinations hoặc Gemini)
  const queryOnlineAI = async (promptText) => {
    const systemPrompt = `Bạn là Trợ Giảng Sư Phạm Mĩ Thuật Tiểu Học chuyên sâu theo bộ sách "Kết nối tri thức với cuộc sống" (Chương trình GDPT 2018). Bạn đang hỗ trợ giáo viên dạy Lớp ${selectedGrade}. Hãy trả lời bằng tiếng Việt sư phạm ấm áp, dễ hiểu, khích lệ học sinh, chỉ rõ mục tiêu, câu hỏi gợi mở, bí quyết tạo hình nét - màu sắc - bố cục và lời dặn dò cụ thể. Không trả lời bằng tiếng Anh.`;

    if (aiProvider === 'gemini') {
      if (!geminiApiKey.trim()) {
        setShowKeyInput(true);
        throw new Error('Vui lòng nhập Gemini API Key miễn phí từ Google AI Studio hoặc chuyển sang Pollinations AI để dùng miễn phí không cần key.');
      }

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nYêu cầu của giáo viên: ${promptText}` }]
            }
          ]
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Lỗi Gemini API (${res.status})`);
      }

      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không nhận được phản hồi từ Gemini.';
    }

    // Default: Pollinations AI (100% Free, No Key Required)
    const encodedPrompt = encodeURIComponent(`${systemPrompt}\n\nThầy/Cô hỏi: ${promptText}`);
    const res = await fetch(`https://text.pollinations.ai/${encodedPrompt}?model=openai`);
    if (!res.ok) {
      throw new Error(`Lỗi kết nối Pollinations AI (${res.status}). Thầy/Cô có thể chuyển sang chế độ "Cọ Nhí Cục Bộ" nhé!`);
    }
    const text = await res.text();
    return text;
  };

  const handleQuickPrompt = async (type) => {
    if (!currentTheme) return;

    let title = '';
    let promptForAI = '';

    switch (type) {
      case 'objectives':
        title = `🎯 Mục Tiêu Chuẩn Kết Nối Tri Thức: ${currentTheme.title}`;
        promptForAI = `Hãy soạn mục tiêu bài học (Kiến thức, Kĩ năng, Phẩm chất) cho bài học: ${currentTheme.title} - Mĩ thuật Lớp ${selectedGrade} theo sách Kết nối tri thức.`;
        break;
      case 'warmup':
        title = `🌟 Hoạt Động Khởi Động: ${currentTheme.title}`;
        promptForAI = `Hãy thiết kế 1 trò chơi hoặc hoạt động đố vui khởi động vui nhộn (5 phút) cho bài học: ${currentTheme.title} - Mĩ thuật Lớp ${selectedGrade}.`;
        break;
      case 'questions':
        title = `🔍 Hệ Thống Câu Hỏi Gợi Mở: ${currentTheme.title}`;
        promptForAI = `Hãy soạn 3-4 câu hỏi gợi mở kích thích tư duy thẩm mĩ cho bài học: ${currentTheme.title} - Mĩ thuật Lớp ${selectedGrade}.`;
        break;
      case 'script':
        title = `🎙️ Lời Dẫn Giảng Sư Phạm Mẫu: ${currentTheme.title}`;
        promptForAI = `Hãy viết một đoạn lời giảng truyền cảm hứng (khoảng 3-4 câu) của Thầy/Cô giáo viên mĩ thuật để dẫn dắt học sinh vào bài: ${currentTheme.title} - Mĩ thuật Lớp ${selectedGrade}.`;
        break;
      case 'steps':
        title = `🎨 4 Bước Vẽ Tranh Thị Phạm: ${currentTheme.title}`;
        promptForAI = `Hãy chia nhỏ quy trình vẽ/tạo hình bài "${currentTheme.title}" thành 4 bước cơ bản từ phác nét đến hoàn thiện màu sắc.`;
        break;
      default:
        break;
    }

    // Nếu chọn Offline: lấy và tạo lời dẫn sư phạm thông minh từ ngân hàng GDPT 2018
    if (aiProvider === 'offline') {
      let content = '';
      if (type === 'objectives') {
        content = `🎯 Mục Tiêu Bài Dạy Chuẩn GDPT 2018 (Thông tư 32/2018/TT-BGDĐT):\n\n` +
          `1. Kiến Thức:\n${currentTheme.objectives.knowledge}\n\n` +
          `2. Kĩ Năng:\n${currentTheme.objectives.skills}\n\n` +
          `3. Phẩm Chất:\n${currentTheme.objectives.qualities}`;
      } else if (type === 'warmup') {
        content = `🌟 Hoạt Động Đố Vui Khởi Động (5-7 phút):\n\n${currentTheme.warmup}\n\n💡 Lời dẫn gợi ý cho Thầy/Cô: "Thầy/Cô chào các họa sĩ nhí! Trước khi bước vào giờ học vẽ hôm nay, Thầy/Cô có một câu đố vui nho nhỏ. Bạn nào nhanh mắt đoán đúng sẽ nhận được một tràng pháo tay thật lớn của cả lớp nhé!"`;
      } else if (type === 'questions') {
        content = `🔍 Hệ Thống Câu Hỏi Gợi Mở Khơi Dậy Tư Duy Thẩm Mĩ:\n\n` +
          currentTheme.questions.map((q, idx) => `• Câu hỏi ${idx + 1}: ${q}`).join('\n\n') +
          `\n\n💡 Gợi ý Thầy/Cô: Đặt câu hỏi mở, khích lệ các em tự do bày tỏ quan điểm về màu sắc, đường nét và cảm xúc của riêng mình.`;
      } else if (type === 'script') {
        content = `Thầy/Cô chào tất cả các em học sinh yêu quý! Hôm nay, lớp chúng ta sẽ cùng bước vào một tiết mĩ thuật tràn ngập niềm vui với bài học: "${currentTheme.title}". Các em hãy mở rộng tầm mắt, cùng ngắm nhìn những sắc màu tươi sáng và nét vẽ ngộ nghĩnh trên màn hình nhé. Thầy/Cô tin rằng với đôi bàn tay khéo léo và trí tưởng tượng phong phú, mỗi em sẽ tạo nên một tác phẩm nghệ thuật thật rực rỡ mang dấu ấn của riêng mình! Bạn nào đã sẵn sàng cùng Thầy/Cô sáng tạo rồi nào?`;
      } else if (type === 'steps') {
        content = `🎨 4 Bước Vẽ Tranh Thị Phạm Chuẩn Sư Phạm:\n\n` +
          currentTheme.fourSteps.map((st) => `• ${st}`).join('\n\n') +
          `\n\n💡 Lưu ý cho học sinh: Dùng nét chì mờ phác khung hình trước, chỉnh sửa chi tiết rồi mới tô màu tươi sáng để bức tranh thật hài hòa.`;
      }

      setIsLoading(true);
      setTimeout(() => {
        streamAssistantMessage(title, content, '🤖 AI Thầy Cọ Nhí (GDPT 2018)');
      }, 150);
      return;
    }

    // Nếu chọn Online AI (Pollinations hoặc Gemini)
    setIsLoading(true);
    try {
      const aiResponse = await queryOnlineAI(promptForAI);
      streamAssistantMessage(title, aiResponse, aiProvider === 'gemini' ? '✨ Gemini AI' : '🌸 Pollinations AI');
    } catch (err) {
      // Tự động chuyển mượt mà về câu trả lời chuẩn cục bộ mà không báo lỗi làm gián đoạn bài giảng
      let fallbackContent = currentTheme.teacherScript;
      if (type === 'objectives') fallbackContent = `${currentTheme.objectives.knowledge}\n\n${currentTheme.objectives.skills}`;
      else if (type === 'steps') fallbackContent = currentTheme.fourSteps.join('\n\n');
      streamAssistantMessage(title, fallbackContent, '🤖 AI Thầy Cọ Nhí (Cục Bộ)');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSearch = async (e) => {
    e.preventDefault();
    if (!userQuery.trim() || isLoading) return;

    const query = userQuery.trim();
    setUserQuery('');

    // Add user message
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString() + '-user',
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: query,
      }
    ]);

    if (aiProvider === 'offline') {
      const qLower = query.toLowerCase();
      let foundResults = [];

      Object.keys(PEDAGOGY_BANK.themes).forEach(grade => {
        PEDAGOGY_BANK.themes[grade].forEach(theme => {
          const text = `${theme.title} ${theme.objectives.knowledge} ${theme.objectives.skills} ${theme.teacherScript} ${theme.questions.join(' ')}`.toLowerCase();
          if (text.includes(qLower)) {
            foundResults.push({ grade, theme });
          }
        });
      });

      let content = '';
      let title = `Gợi ý sư phạm cho: "${query}"`;

      if (foundResults.length > 0) {
        const match = foundResults[0].theme;
        content = `Gợi ý theo bộ sách Kết nối tri thức (Lớp ${foundResults[0].grade} - ${match.title}):\n\n` +
                  `• Lời giảng mở đầu: "${match.teacherScript}"\n\n` +
                  `• Câu hỏi gợi mở: ${match.questions[0]}\n\n` +
                  `• Tiến trình vẽ: ${match.fourSteps[0]} -> ${match.fourSteps[1]}`;
      } else {
        content = `Gợi ý sư phạm mĩ thuật chung cho Thầy/Cô:\n` +
                  `• Đối với lớp 1-2: Chú trọng chấm, nét cơ bản, nhận diện màu nóng - lạnh và hình vuông, tròn, tam giác.\n` +
                  `• Đối với lớp 3-5: Rèn luyện luật xa - gần, ánh sáng và ứng dụng vật liệu tái chế, đất nặn.`;
      }

      setIsLoading(true);
      setTimeout(() => {
        streamAssistantMessage(title, content, '🤖 AI Thầy Cọ Nhí (GDPT 2018)');
      }, 150);
      return;
    }

    // Online AI Query
    setIsLoading(true);
    try {
      const aiResponse = await queryOnlineAI(query);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + '-resp',
          sender: 'assistant',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: `Gợi ý sư phạm: "${query}"`,
          content: aiResponse,
          provider: aiProvider === 'gemini' ? '✨ Gemini AI' : '🌸 Pollinations AI'
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + '-resp',
          sender: 'assistant',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: '⚠️ Lỗi Kết Nối AI',
          content: `${err.message}`,
          provider: 'Hệ thống'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border-l border-slate-200 select-none">
      {/* Assistant Header */}
      <div className="p-3.5 bg-white border-b border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              🤖
            </div>
            <div>
              <h3 className="font-extrabold text-xs md:text-sm text-slate-800">Trợ Giảng Mĩ Thuật AI</h3>
              <p className="text-[10px] font-bold text-slate-500">Chuẩn SGK Kết nối tri thức với cuộc sống</p>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-600 p-1 text-sm font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Chọn Giọng Đọc Thầy (Nam) / Cô (Nữ) & Nút Đọc Slide */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => handleGenderToggle('male')}
              className={`px-2 py-1 rounded transition-all flex items-center gap-1 ${
                currentGender === 'male' ? 'bg-amber-500 text-white shadow-2xs font-extrabold' : 'text-slate-600 hover:bg-white'
              }`}
              title="Giọng đọc Thầy giáo (Nam - Nam Minh)"
            >
              <span>👨</span>
              <span>Thầy</span>
            </button>
            <button
              type="button"
              onClick={() => handleGenderToggle('female')}
              className={`px-2 py-1 rounded transition-all flex items-center gap-1 ${
                currentGender === 'female' ? 'bg-pink-500 text-white shadow-2xs font-extrabold' : 'text-slate-600 hover:bg-white'
              }`}
              title="Giọng đọc Cô giáo (Nữ - Hoài My)"
            >
              <span>👩</span>
              <span>Cô</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleReadCurrentSlide}
            className="flex-1 py-1.5 px-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98"
            title="Trợ giảng đọc toàn bộ câu chữ, tiêu đề đang có trên slide hiện tại"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Đọc Chữ Trên Slide</span>
          </button>
        </div>

        {/* AI Provider Switcher Bar - THAY BẰNG CÁC AI MIỄN PHÍ DO NGƯỜI DÙNG CHỌN */}
        <div className="mt-2.5 p-1 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between gap-1">
          <button
            onClick={() => setAiProvider('pollinations')}
            className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1 ${
              aiProvider === 'pollinations'
                ? 'bg-white text-pink-700 shadow-2xs border border-pink-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Pollinations AI: 100% Miễn phí, không cần đăng nhập hay API key"
          >
            <span>🌸</span>
            <span>Pollinations (Free)</span>
          </button>

          <button
            onClick={() => setAiProvider('offline')}
            className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1 ${
              aiProvider === 'offline'
                ? 'bg-white text-amber-800 shadow-2xs border border-amber-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Ngân hàng sư phạm mĩ thuật 100% Cục bộ offline không cần mạng"
          >
            <span>🤖</span>
            <span>Cục Bộ Offline</span>
          </button>

          <button
            onClick={() => {
              setAiProvider('gemini');
              if (!geminiApiKey) setShowKeyInput(true);
            }}
            className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1 ${
              aiProvider === 'gemini'
                ? 'bg-white text-indigo-700 shadow-2xs border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Google Gemini: Dùng API Key cá nhân miễn phí từ AI Studio"
          >
            <span>✨</span>
            <span>Gemini API</span>
          </button>
        </div>

        {/* Gemini Key Input Drawer */}
        {showKeyInput && (
          <div className="mt-2 p-2 bg-indigo-50 border border-indigo-200 rounded-lg text-xs animate-in fade-in">
            <div className="flex items-center justify-between font-bold text-indigo-900 mb-1">
              <span>Nhập Google Gemini API Key:</span>
              <button onClick={() => setShowKeyInput(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <input
              type="password"
              defaultValue={geminiApiKey}
              placeholder="Dán AI Studio key (AIzaSy...)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveGeminiKey(e.target.value);
              }}
              onBlur={(e) => handleSaveGeminiKey(e.target.value)}
              className="w-full px-2 py-1 text-xs bg-white border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
            />
            <p className="text-[10px] text-indigo-700 mt-1">Lưu an toàn tại trình duyệt của bạn, không gửi lên bất kỳ máy chủ nào.</p>
          </div>
        )}

        {/* Grade and Theme Selection Filter */}
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase">Khối Lớp:</label>
            <select
              value={selectedGrade}
              onChange={(e) => handleGradeChange(Number(e.target.value))}
              className="w-full mt-0.5 px-2 py-1 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {PEDAGOGY_BANK.grades.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase">Chủ Đề Kết Nối:</label>
            <select
              value={selectedThemeId}
              onChange={(e) => setSelectedThemeId(e.target.value)}
              className="w-full mt-0.5 px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 truncate"
            >
              {themesForGrade.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <button
            onClick={() => handleQuickPrompt('objectives')}
            disabled={isLoading}
            className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md flex items-center gap-1 transition-all"
          >
            <span>🎯</span> Mục tiêu bài học
          </button>
          <button
            onClick={() => handleQuickPrompt('warmup')}
            disabled={isLoading}
            className="px-2 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md flex items-center gap-1 transition-all"
          >
            <span>🌟</span> Đố vui khởi động
          </button>
          <button
            onClick={() => handleQuickPrompt('questions')}
            disabled={isLoading}
            className="px-2 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md flex items-center gap-1 transition-all"
          >
            <span>🔍</span> Câu hỏi gợi mở
          </button>
          <button
            onClick={() => handleQuickPrompt('script')}
            disabled={isLoading}
            className="px-2 py-1 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md flex items-center gap-1 transition-all"
          >
            <span>🎙️</span> Lời giảng mẫu
          </button>
          <button
            onClick={() => handleQuickPrompt('steps')}
            disabled={isLoading}
            className="px-2 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md flex items-center gap-1 transition-all"
          >
            <span>🎨</span> 4 bước vẽ tranh
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-xl border transition-all ${
              msg.sender === 'user' 
                ? 'bg-amber-50 border-amber-200 ml-6 text-right' 
                : 'bg-white border-slate-200 mr-2 shadow-2xs'
            }`}
          >
            {msg.title && (
              <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-slate-100">
                <h4 className="font-extrabold text-xs text-amber-800 flex items-center gap-1">
                  <span>✨</span> {msg.title}
                </h4>
                {msg.provider && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {msg.provider}
                  </span>
                )}
              </div>
            )}

            <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
              {msg.content}
            </p>

            {/* Action Buttons for Assistant Message */}
            {msg.sender === 'assistant' && msg.id !== 'welcome' && (
              <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                {/* Insert to notes */}
                <button
                  onClick={() => onInsertToNotes(msg.content)}
                  className="px-2 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md flex items-center gap-1 transition-all"
                  title="Chèn nội dung này vào ô ghi chú slide"
                >
                  <span>📝</span> Chèn vào ghi chú
                </button>

                {/* Speak via Web Speech */}
                <button
                  onClick={() => speechService.speak(msg.content)}
                  className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md flex items-center gap-1 transition-all"
                  title="Nghe đọc nội dung này bằng giọng tiếng Việt"
                >
                  <Volume2 className="w-3 h-3 text-emerald-600" />
                  <span>Nghe đọc</span>
                </button>

                {/* Copy to clipboard */}
                <button
                  onClick={() => handleCopy(msg.id, msg.content)}
                  className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded-md flex items-center gap-1 transition-all"
                  title="Sao chép nội dung"
                >
                  {copiedId === msg.id ? (
                    <span className="text-emerald-600 font-bold">Đã chép!</span>
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
        ))}

        {isLoading && (
          <div className="p-3 bg-white border border-slate-200 rounded-xl mr-2 shadow-2xs flex items-center gap-2 text-xs font-bold text-indigo-700 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Trợ giảng AI đang suy nghĩ và biên soạn lời giảng...</span>
          </div>
        )}
      </div>

      {/* Input query box */}
      <form onSubmit={handleCustomSearch} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={userQuery}
          disabled={isLoading}
          onChange={(e) => setUserQuery(e.target.value)}
          placeholder={`Hỏi trợ giảng ${aiProvider === 'pollinations' ? 'Pollinations' : aiProvider === 'gemini' ? 'Gemini' : 'Cục bộ'}...`}
          className="flex-1 px-3 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          type="submit"
          disabled={isLoading || !userQuery.trim()}
          className={`p-2 rounded-xl shadow-xs transition-all ${
            isLoading || !userQuery.trim() ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-white'
          }`}
          title="Gửi câu hỏi cho Trợ giảng AI"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
