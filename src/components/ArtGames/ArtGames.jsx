import React, { useState } from 'react';
import { 
  Gamepad2, 
  RotateCcw, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  HelpCircle, 
  Sparkles,
  Layers,
  Palette,
  Eye,
  Settings,
  Plus,
  Trash2,
  BookOpen,
  Check,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ART_CURRICULUM_THEMES, generateGameQuestionsByTheme } from '../../data/artGamesCurriculumBank';
import { generateNaturalArtGame, parseNaturalGamePrompt } from '../../utils/aiNaturalLanguageService';
import { buildAnswerFeedback } from '../../utils/gameFeedbackService';
import { classroomAudio } from '../../utils/classroomAudioService';

const DEFAULT_GAMES = {
  // Game 1: Color Mixing & Matching
  colorGame: [
    {
      id: 'color-1',
      grade: 1,
      question: 'Khi Thầy/Cô pha trộn màu ĐỎ và màu VÀNG với nhau, chúng mình sẽ thu được màu gì nhỉ?',
      options: ['Màu Cam', 'Màu Tím', 'Màu Xanh Lá', 'Màu Nâu'],
      correctAnswer: 0,
      color1: '#ef4444',
      color2: '#f59e0b',
      resultColor: '#f97316',
      explanation: 'Đúng rồi! Đỏ pha với Vàng tạo thành Màu Cam rực rỡ!'
    },
    {
      id: 'color-2',
      grade: 1,
      question: 'Khi pha màu XANH LAM và màu VÀNG, các em sẽ tạo ra màu gì của lá cây?',
      options: ['Màu Nâu', 'Màu Xanh Lá', 'Màu Cam', 'Màu Hồng'],
      correctAnswer: 1,
      color1: '#3b82f6',
      color2: '#eab308',
      resultColor: '#10b981',
      explanation: 'Chính xác! Xanh Lam pha Vàng tạo ra Màu Xanh Lá cây tươi mát!'
    },
    {
      id: 'color-3',
      grade: 2,
      question: 'Nhóm màu nào sau đây thuộc Gam Màu Nóng ấm áp như ánh mặt trời?',
      options: ['Xanh lam, Xanh lá, Tím', 'Đỏ, Vàng, Cam', 'Trắng, Đen, Xám', 'Xanh lục, Lam biếc'],
      correctAnswer: 1,
      color1: '#ef4444',
      color2: '#f59e0b',
      resultColor: '#f97316',
      explanation: 'Tuyệt vời! Đỏ, Vàng, Cam là những gam màu nóng mang lại cảm xúc ấm áp, nhiệt huyết!'
    }
  ],

  // Game 2: Shape Detective
  shapeGame: [
    {
      id: 'shape-1',
      grade: 1,
      question: 'Mái nhà che mưa che nắng trong bức tranh mĩ thuật thường có hình gì?',
      options: ['Hình Tam Giác', 'Hình Tròn', 'Hình Bầu Dục', 'Hình Ngôi Sao'],
      correctAnswer: 0,
      shapeIcon: '🔺',
      explanation: 'Đúng rồi! Mái nhà thường được phác bằng hình tam giác vững chãi!'
    },
    {
      id: 'shape-2',
      grade: 1,
      question: 'Ông mặt trời và bánh xe đạp của bé được vẽ từ hình học cơ bản nào?',
      options: ['Hình Vuông', 'Hình Tròn', 'Hình Chữ Nhật', 'Hình Thoi'],
      correctAnswer: 1,
      shapeIcon: '⭕',
      explanation: 'Chính xác! Mặt trời và bánh xe có hình tròn xinh xắn!'
    },
    {
      id: 'shape-3',
      grade: 2,
      question: 'Thân chú cá đang bơi dưới đại dương thường được phác bằng đường nét khép kín nào?',
      options: ['Hình Bầu Dục (Elip)', 'Hình Chữ Nhật dài', 'Hình Ngôi Sao', 'Hình Tam Giác'],
      correctAnswer: 0,
      shapeIcon: '🐟',
      explanation: 'Rất giỏi! Thân cá uốn lượn thường bắt đầu từ hình bầu dục mềm mại!'
    }
  ],

  // Game 3: Art Detective
  detailGame: [
    {
      id: 'detail-1',
      grade: 1,
      question: 'Trong bức tranh dân gian Đông Hồ "Gà Đàn", chú gà trống có bộ lông màu sắc rực rỡ mang ý nghĩa gì?',
      options: ['Tượng trưng cho sự may mắn, bình an và no đủ', 'Tượng trưng cho mưa gió', 'Tượng trưng cho ban đêm', 'Tượng trưng cho cái lạnh'],
      correctAnswer: 0,
      artTheme: 'Tranh Dân Gian Đông Hồ',
      explanation: 'Chính xác! Tranh gà dân gian mang thông điệp chúc phúc ấm no, sung túc cho mọi nhà!'
    },
    {
      id: 'detail-2',
      grade: 2,
      question: 'Quan sát tranh phong cảnh đồng quê: Con đường làng uốn lượn từ xa về gần sẽ trông như thế nào?',
      options: ['Ở gần thì to rộng, ở xa thì nhỏ hẹp dần', 'Ở xa to hơn ở gần', 'Hai đầu bằng nhau', 'Không nhìn thấy gì'],
      correctAnswer: 0,
      artTheme: 'Luật Xa Gần Trong Phong Cảnh',
      explanation: 'Đúng rồi! Theo luật xa gần, vật ở gần nhìn sẽ to và rõ, càng xa thì càng nhỏ và mờ dần!'
    }
  ]
};

export default function ArtGames({ 
  projectTitle = '', 
  currentSlide = null,
  onInsertGameToSlide,
  onCreateGameSlide
}) {
  const [activeGameTab, setActiveGameTab] = useState('color'); // 'color', 'shape', 'detail', 'custom'
  const [gamesData, setGamesData] = useState(DEFAULT_GAMES);
  const [customGameTitle, setCustomGameTitle] = useState('Trò Chơi Theo Chủ Đề Bài Học');
  const [customQuestions, setCustomQuestions] = useState([]);
  
  // Game Play States
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  // Generator Modal States
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [genGrade, setGenGrade] = useState(1);
  const [selectedCurriculumTheme, setSelectedCurriculumTheme] = useState('');
  const [customThemeInput, setCustomThemeInput] = useState('');
  const [genGameType, setGenGameType] = useState('all'); // 'all', 'color', 'shape', 'sequence', 'composition', 'technique'
  const [genQuestionCount, setGenQuestionCount] = useState(5); // 3, 5, 8, 10 câu
  const [generationToast, setGenerationToast] = useState('');

  // Question Editor Drawer States
  const [isEditingQuestions, setIsEditingQuestions] = useState(false);
  const [gameGeneratorMode, setGameGeneratorMode] = useState("natural");
  const [naturalGamePrompt, setNaturalGamePrompt] = useState("");
  const [isAiGeneratingGame, setIsAiGeneratingGame] = useState(false);
  const [naturalGameAnalysis, setNaturalGameAnalysis] = useState(null);

  // Get current active questions
  const getActiveQuestionList = () => {
    if (activeGameTab === 'custom') return customQuestions.length > 0 ? customQuestions : DEFAULT_GAMES.colorGame;
    if (activeGameTab === 'color') return gamesData.colorGame;
    if (activeGameTab === 'shape') return gamesData.shapeGame;
    return gamesData.detailGame;
  };

  const questionList = getActiveQuestionList();
  const currentQ = questionList[currentQuestionIdx] || questionList[0] || {
    question: 'Chưa có câu hỏi nào.',
    options: ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D'],
    correctAnswer: 0,
    explanation: 'Hãy tạo hoặc thêm câu hỏi mới.'
  };

  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctAnswer) {
      setScore(prev => prev + 10);
      try { classroomAudio.playSuccessSound(); } catch (_) {}
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 }
        });
      } catch (_) {}
    } else {
      try { classroomAudio.playFailureSound(); } catch (_) {}
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < questionList.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
      try {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.6 }
        });
      } catch (_) {}
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
  };

  // Chèn trò chơi vào slide đang soạn
  const handleInsertCurrentGame = () => {
    if (onInsertGameToSlide) {
      const gameEl = {
        id: `game-${Date.now()}`,
        type: 'game',
        title: activeGameTab === 'custom' ? customGameTitle : 'Trò Chơi Mĩ Thuật',
        grade: genGrade,
        questions: questionList,
        x: 60,
        y: 40,
        width: 840,
        height: 460,
      };
      onInsertGameToSlide(gameEl);
      setGenerationToast('✅ Đã chèn trò chơi vào slide đang soạn thành công!');
      setTimeout(() => setGenerationToast(''), 3000);
    }
  };

  // Tạo một slide trò chơi mới
  const handleCreateNewGameSlide = () => {
    if (onCreateGameSlide) {
      const gameEl = {
        id: `game-${Date.now()}`,
        type: 'game',
        title: activeGameTab === 'custom' ? customGameTitle : 'Trò Chơi Mĩ Thuật',
        grade: genGrade,
        questions: questionList,
        x: 60,
        y: 40,
        width: 840,
        height: 460,
      };
      onCreateGameSlide(gameEl);
      setGenerationToast('🎉 Đã tạo một slide trò chơi mới vào bài giảng!');
      setTimeout(() => setGenerationToast(''), 3000);
    }
  };

  // Tự động trích xuất tên bài học từ Slide hiện tại hoặc tiêu đề bài giảng
  const handleExtractThemeFromSlide = () => {
    let extracted = '';
    if (currentSlide) {
      const textEl = currentSlide.elements?.find(e => e.type === 'text' && e.text?.trim());
      if (textEl) {
        extracted = textEl.text.split('\n')[0].trim();
      }
    }
    if (!extracted && projectTitle) {
      extracted = projectTitle.replace(/^(bài|chủ đề)\s*\d*[:\-]?\s*/i, '').trim();
    }
    if (extracted) {
      setCustomThemeInput(extracted);
      setSelectedCurriculumTheme('');
    } else {
      setCustomThemeInput('Sắc Màu Quanh Em');
    }
  };

  // Xử lý tạo trò chơi bằng câu lệnh tự nhiên AI (Giai đoạn 3)
  const handleGenerateNaturalGame = async (promptOverride = null) => {
    const promptText = promptOverride || naturalGamePrompt;
    if (!promptText.trim()) return;
    setIsAiGeneratingGame(true);
    try {
      const result = await generateNaturalArtGame({
        prompt: promptText,
        isOnline: navigator.onLine
      });
      setNaturalGameAnalysis(result.parsedParams);
      setCustomQuestions(result.gamePackage.questions);
      setCustomGameTitle(result.gamePackage.gameTitle);
      setGenGrade(result.parsedParams.grade);
      setActiveGameTab('custom');
      setIsEditingQuestions(true); // Tự động mở khung chỉnh sửa để giáo viên xem trước & duyệt từng câu
      setIsGeneratorOpen(false);
      handleRestart();
      setGenerationToast(`🎉 Đã tạo thành công "${result.gamePackage.gameTitle}"! Thầy/Cô có thể xem trước & chỉnh sửa bên dưới.`);
      setTimeout(() => setGenerationToast(''), 5000);
    } catch (err) {
      alert('Không thể tạo trò chơi: ' + err.message);
    } finally {
      setIsAiGeneratingGame(false);
    }
  };

  // Tạo bộ trò chơi mới theo chủ đề nội dung bài học
  const handleGenerateNewGame = () => {
    const finalTheme = customThemeInput.trim() || selectedCurriculumTheme || 'Sắc Màu Cuộc Sống';
    const newQuestions = generateGameQuestionsByTheme(genGrade, finalTheme, genGameType, genQuestionCount);

    setCustomQuestions(newQuestions);
    setCustomGameTitle(`Trò Chơi: ${finalTheme} (Lớp ${genGrade})`);
    setActiveGameTab('custom');
    handleRestart();
    setIsGeneratorOpen(false);

    setGenerationToast(`🎉 Đã tạo thành công bộ trò chơi mới cho chủ đề "${finalTheme}"!`);
    setTimeout(() => setGenerationToast(''), 4000);
  };

  // Lưu chỉnh sửa câu hỏi từ giáo viên
  const handleUpdateQuestion = (qIdx, field, value) => {
    const updated = [...questionList];
    if (field === 'option') {
      const { optIdx, text } = value;
      const opts = [...updated[qIdx].options];
      opts[optIdx] = text;
      updated[qIdx].options = opts;
    } else {
      updated[qIdx][field] = value;
    }

    if (activeGameTab === 'custom') {
      setCustomQuestions(updated);
    } else if (activeGameTab === 'color') {
      setGamesData({ ...gamesData, colorGame: updated });
    } else if (activeGameTab === 'shape') {
      setGamesData({ ...gamesData, shapeGame: updated });
    } else {
      setGamesData({ ...gamesData, detailGame: updated });
    }
  };

  // Thêm một câu hỏi mới vào bộ trò chơi hiện tại
  const handleAddNewQuestion = () => {
    const newQ = {
      id: `q-custom-${Date.now()}`,
      grade: genGrade,
      question: 'Nhập câu hỏi mĩ thuật mới cho học sinh...',
      options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
      correctAnswer: 0,
      explanation: 'Lời dặn dò giải thích của Thầy/Cô khi học sinh trả lời đúng.'
    };
    const updated = [...questionList, newQ];
    if (activeGameTab === 'custom') {
      setCustomQuestions(updated);
    } else if (activeGameTab === 'color') {
      setGamesData({ ...gamesData, colorGame: updated });
    } else if (activeGameTab === 'shape') {
      setGamesData({ ...gamesData, shapeGame: updated });
    } else {
      setGamesData({ ...gamesData, detailGame: updated });
    }
  };

  // Xóa một câu hỏi
  const handleDeleteQuestion = (qIdx) => {
    if (questionList.length <= 1) {
      alert('Bộ trò chơi cần có ít nhất 1 câu hỏi.');
      return;
    }
    const updated = questionList.filter((_, idx) => idx !== qIdx);
    if (activeGameTab === 'custom') {
      setCustomQuestions(updated);
    } else if (activeGameTab === 'color') {
      setGamesData({ ...gamesData, colorGame: updated });
    } else if (activeGameTab === 'shape') {
      setGamesData({ ...gamesData, shapeGame: updated });
    } else {
      setGamesData({ ...gamesData, detailGame: updated });
    }
    if (qIdx < currentQuestionIdx) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    } else if (qIdx === currentQuestionIdx) {
      setCurrentQuestionIdx(Math.min(qIdx, updated.length - 1));
    }
    setSelectedOption(null);
    setIsAnswered(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 select-none overflow-hidden relative">
      {/* Game Header Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-2xs gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl shadow-2xs">
            <Gamepad2 className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base text-slate-800">Trò Chơi Mĩ Thuật Tương Tác Cục Bộ</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                100% Cục Bộ Offline
              </span>
            </div>
            <p className="text-xs text-slate-500">Tạo trò chơi theo đúng chủ đề bài học • Chơi trực tiếp trên lớp học • Không cần tài khoản</p>
          </div>
        </div>

        {/* Action: Generate Game Button & Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* NÚT TẠO TRÒ CHƠI MỚI THEO CHỦ ĐỀ NỘI DUNG BÀI HỌC */}
          <button
            onClick={() => setIsGeneratorOpen(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all transform active:scale-95"
            title="Bấm để tạo bộ trò chơi đố vui mới bám sát chủ đề bài dạy của Thầy/Cô"
          >
            <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
            <span>✨ Tạo Trò Chơi Theo Chủ Đề</span>
          </button>

          {/* Nút Chèn Vào Slide */}
          {onInsertGameToSlide && (
            <button
              onClick={handleInsertCurrentGame}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1 transition-all active:scale-95"
              title="Đưa trò chơi này trực tiếp vào trang slide đang soạn"
            >
              <span>📌</span>
              <span>Chèn Vào Slide Đang Soạn</span>
            </button>
          )}

          {/* Nút Tạo Slide Trò Chơi Mới */}
          {onCreateGameSlide && (
            <button
              onClick={handleCreateNewGameSlide}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1 transition-all active:scale-95"
              title="Tạo thêm 1 slide mới chứa trò chơi này trong bài giảng"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo Slide Trò Chơi</span>
            </button>
          )}

          {/* Nút sửa câu hỏi */}
          <button
            onClick={() => setIsEditingQuestions(!isEditingQuestions)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all ${
              isEditingQuestions ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Chỉnh sửa câu hỏi, đáp án hoặc thêm câu hỏi mới"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingQuestions ? 'Đóng Trình Sửa' : 'Sửa Câu Hỏi'}</span>
          </button>

          {/* Game Selection Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {customQuestions.length > 0 && (
              <button
                onClick={() => { setActiveGameTab('custom'); handleRestart(); }}
                className={`px-3 py-1 text-xs font-black rounded-lg flex items-center gap-1.5 transition-all ${
                  activeGameTab === 'custom' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <span>⭐</span>
                <span className="truncate max-w-[140px]">{customGameTitle}</span>
              </button>
            )}
            <button
              onClick={() => { setActiveGameTab('color'); handleRestart(); }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${
                activeGameTab === 'color' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🎨</span>
              <span>1. Ghép Màu</span>
            </button>
            <button
              onClick={() => { setActiveGameTab('shape'); handleRestart(); }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${
                activeGameTab === 'shape' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🔺</span>
              <span>2. Hình Khối</span>
            </button>
            <button
              onClick={() => { setActiveGameTab('detail'); handleRestart(); }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${
                activeGameTab === 'detail' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🔍</span>
              <span>3. Tìm Chi Tiết</span>
            </button>
          </div>

          {/* Score & Restart */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 font-extrabold text-xs">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Điểm: {score}</span>
            </div>

            <button
              onClick={handleRestart}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
              title="Chơi lại từ đầu"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {generationToast && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-6 py-2.5 shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{generationToast}</span>
          </div>
          <button onClick={() => setGenerationToast('')} className="text-white hover:text-emerald-100 font-black">
            ✕
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Main: Game Screen */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
          <div className="max-w-2xl w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 relative">
            {!showResult ? (
              <div>
                {/* Progress counter */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-4 pb-2 border-b border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-black">
                      Câu {currentQuestionIdx + 1} / {questionList.length}
                    </span>
                    <span className="text-slate-500 truncate max-w-[280px]">
                      {activeGameTab === 'custom' ? customGameTitle : 'Bộ Đề Mẫu Chuẩn'}
                    </span>
                  </span>
                  <span className="text-indigo-600 font-extrabold">Môn Mĩ Thuật Tiểu Học</span>
                </div>

                {/* Graphic Feature based on Game Type */}
                {currentQ.color1 && (
                  <div className="flex items-center justify-center gap-4 py-4 mb-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-14 h-14 rounded-full shadow-md border-2 border-white" style={{ backgroundColor: currentQ.color1 }} />
                    <span className="text-2xl font-black text-slate-400">+</span>
                    <div className="w-14 h-14 rounded-full shadow-md border-2 border-white" style={{ backgroundColor: currentQ.color2 }} />
                    <span className="text-2xl font-black text-slate-400">=</span>
                    <div 
                      className="w-16 h-16 rounded-full shadow-lg border-2 border-dashed border-amber-400 flex items-center justify-center text-xl font-bold transition-all"
                      style={{ backgroundColor: isAnswered ? currentQ.resultColor : '#f1f5f9' }}
                    >
                      {isAnswered ? '✨' : '?'}
                    </div>
                  </div>
                )}

                {currentQ.shapeIcon && (
                  <div className="text-center py-4 mb-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="text-5xl">{currentQ.shapeIcon}</span>
                  </div>
                )}

                {currentQ.artTheme && (
                  <div className="text-center py-2.5 mb-4 bg-purple-50 rounded-xl border border-purple-100">
                    <span className="text-xs font-black text-purple-700 uppercase tracking-wider">
                      🖼️ {currentQ.artTheme}
                    </span>
                  </div>
                )}

                {/* Question Text */}
                <h3 className="text-lg font-black text-slate-800 text-center mb-6 leading-relaxed">
                  {currentQ.question}
                </h3>

                {/* Options Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {currentQ.options?.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentQ.correctAnswer;

                    let btnStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300';
                    if (isAnswered) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-sm';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-500 text-white border-rose-600 shadow-sm';
                      } else {
                        btnStyle = 'bg-slate-50 text-slate-400 border-slate-100 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(idx)}
                        className={`p-4 rounded-xl border-2 text-sm font-bold text-left transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
                        {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation & Next Button */}
                {isAnswered && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-in fade-in flex items-center justify-between gap-4">
                    <p className="text-xs text-amber-950 font-semibold leading-relaxed">
                      💡 <strong>Lời Thầy/Cô:</strong> {buildAnswerFeedback(currentQ, selectedOption)}
                    </p>
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all shrink-0"
                    >
                      {currentQuestionIdx < questionList.length - 1 ? 'Câu Tiếp Theo →' : 'Xem Kết Quả 🎉'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Result Screen */
              <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-4xl mx-auto shadow-md">
                  🏆
                </div>
                <h2 className="text-2xl font-black text-slate-800">Hoan Hô Cả Lớp!</h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Các em đã hoàn thành xuất sắc trò chơi mĩ thuật với tổng số điểm là <strong>{score} điểm</strong>!
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={handleRestart}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-sm transition-all"
                  >
                    Chơi Lại Trò Này
                  </button>
                  <button
                    onClick={() => setIsGeneratorOpen(true)}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-sm transition-all"
                  >
                    Tạo Trò Chơi Bài Khác ✨
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Drawer: Question Editor (When Open) */}
        {isEditingQuestions && (
          <div className="w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-xl animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                  Chỉnh Sửa Bộ Câu Hỏi ({questionList.length})
                </h4>
              </div>
              <button
                onClick={() => setIsEditingQuestions(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {questionList.map((q, qIdx) => (
                <div key={q.id || qIdx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-indigo-700">Câu hỏi #{qIdx + 1}</span>
                    <button
                      onClick={() => handleDeleteQuestion(qIdx)}
                      className="p-1 text-rose-500 hover:bg-rose-100 rounded"
                      title="Xóa câu hỏi này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Nội dung câu hỏi:</label>
                    <textarea
                      value={q.question}
                      onChange={(e) => handleUpdateQuestion(qIdx, 'question', e.target.value)}
                      rows={2}
                      className="w-full p-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">4 Lựa chọn (Tích chọn đáp án đúng):</label>
                    <div className="space-y-1.5">
                      {q.options?.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={q.correctAnswer === optIdx}
                            onChange={() => handleUpdateQuestion(qIdx, 'correctAnswer', optIdx)}
                            className="text-emerald-600 focus:ring-emerald-500"
                            title="Tích để chọn đây là đáp án đúng"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleUpdateQuestion(qIdx, 'option', { optIdx, text: e.target.value })}
                            className="flex-1 px-2 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Lời giải thích của Thầy/Cô:</label>
                    <input
                      type="text"
                      value={q.explanation}
                      onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                      className="w-full px-2 py-1 text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded focus:outline-none"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddNewQuestion}
                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 border-2 border-dashed border-indigo-300 rounded-xl text-xs font-extrabold text-indigo-700 flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Thêm Câu Hỏi Mới</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: TẠO TRÒ CHƠI MỚI THEO CHỦ ĐỀ NỘI DUNG BÀI HỌC */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">Tạo Trò Chơi Mĩ Thuật Theo Chủ Đề</h3>
                  <p className="text-xs text-slate-500">Chuẩn khung chương trình GDPT 2018 Mĩ thuật Lớp 1 - 5</p>
                </div>
              </div>
              <button
                onClick={() => setIsGeneratorOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-4">
              {/* BỘ CHỌN CHẾ ĐỘ: CÂU LỆNH TỰ NHIÊN AI VS CHỌN NHANH SGK */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setGameGeneratorMode('natural')}
                  className={`flex-1 py-1.5 text-xs font-black rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    gameGeneratorMode === 'natural'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>💬 Câu Lệnh Tự Nhiên AI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGameGeneratorMode('form')}
                  className={`flex-1 py-1.5 text-xs font-black rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    gameGeneratorMode === 'form'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>📋 Chọn Nhanh Theo SGK</span>
                </button>
              </div>

              {/* CHẾ ĐỘ 1: NHẬP CÂU LỆNH TỰ NHIÊN */}
              {gameGeneratorMode === 'natural' && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Nhập Yêu Cầu Trò Chơi (Tự Do Bằng Tiếng Việt):
                    </label>
                    <textarea
                      rows={3}
                      value={naturalGamePrompt}
                      onChange={(e) => setNaturalGamePrompt(e.target.value)}
                      placeholder="Ví dụ: Tạo trò chơi 5 phút về màu nóng và màu lạnh cho lớp 2..."
                      className="w-full p-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium leading-relaxed"
                    />

                    {/* Ví Dụ Câu Lệnh Mẫu 1 Chạm */}
                    <div className="mt-2 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 block">Ví dụ gợi ý (Bấm để thử ngay):</span>
                      <div className="flex flex-col gap-1">
                        {[
                          { icon: '🎨', text: 'Tạo trò chơi 5 phút về màu nóng và màu lạnh cho lớp 2.' },
                          { icon: '🔺', text: 'Tạo trò chơi đoán hình khối cho lớp 1, gồm 8 câu hỏi.' },
                          { icon: '🏛️', text: 'Tạo trò chơi theo chủ đề tranh Đông Hồ cho lớp 4.' },
                          { icon: '🏆', text: 'Tạo trò chơi nhóm, không cần đăng nhập học sinh, có tính điểm.' },
                          { icon: '👶', text: 'Tạo trò chơi đơn giản cho học sinh lớp 1, chữ ít, hình ảnh nhiều.' }
                        ].map((sug, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setNaturalGamePrompt(sug.text);
                              handleGenerateNaturalGame(sug.text);
                            }}
                            className="text-left px-2 py-1 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-lg text-[11px] text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span>{sug.icon}</span>
                            <span className="truncate">{sug.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerateNaturalGame()}
                      disabled={isAiGeneratingGame || !naturalGamePrompt.trim()}
                      className="mt-3 w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 fill-white" />
                      <span>{isAiGeneratingGame ? 'Đang phân tích & tạo câu hỏi...' : '⚡ Tạo Trò Chơi AI Theo Câu Lệnh'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CHẾ ĐỘ 2: CHỌN THEO BIỂU MẪU SGK */}
              {gameGeneratorMode === 'form' && (
                <div className="space-y-4 animate-in fade-in">
              {/* 1. Chọn Khối Lớp */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  1. Chọn Khối Lớp Học Sinh:
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        setGenGrade(g);
                        setSelectedCurriculumTheme('');
                      }}
                      className={`py-2 rounded-xl text-xs font-black border transition-all ${
                        genGrade === g
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      Lớp {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Chọn Chủ Đề Chuẩn SGK GDPT 2018 */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  2. Chọn Chủ Đề Chuẩn SGK (Mĩ thuật Lớp {genGrade}):
                </label>
                <select
                  value={selectedCurriculumTheme}
                  onChange={(e) => {
                    setSelectedCurriculumTheme(e.target.value);
                    if (e.target.value) setCustomThemeInput('');
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">-- Chọn chủ đề trong ngân hàng SGK --</option>
                  {ART_CURRICULUM_THEMES[genGrade]?.map((t) => (
                    <option key={t.id} value={t.title}>
                      {t.title} - {t.description.slice(0, 45)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Hoặc Tự Nhập Tên Bài Học / Lấy từ Slide */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-slate-700">
                    3. Hoặc Tự Nhập Chủ Đề / Bài Học Của Thầy Cô:
                  </label>
                  <button
                    onClick={handleExtractThemeFromSlide}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 underline"
                  >
                    <span>🎯 Lấy tên từ Slide đang soạn</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={customThemeInput}
                  onChange={(e) => {
                    setCustomThemeInput(e.target.value);
                    if (e.target.value) setSelectedCurriculumTheme('');
                  }}
                  placeholder="Ví dụ: Động vật dưới đại dương, Ngày Tết quê em, Ngôi nhà xinh..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* 4. Chọn Số Lượng Câu Hỏi */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  4. Số Lượng Câu Hỏi Trong Trò Chơi:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { count: 3, label: '3 câu (Nhanh)' },
                    { count: 5, label: '5 câu (Chuẩn)' },
                    { count: 8, label: '8 câu (Sâu)' },
                    { count: 10, label: '10 câu (Thử thách)' }
                  ].map((item) => (
                    <button
                      key={item.count}
                      type="button"
                      onClick={() => setGenQuestionCount(item.count)}
                      className={`py-1.5 px-1 rounded-xl text-xs font-bold border transition-all ${
                        genQuestionCount === item.count
                          ? 'bg-amber-500 text-white border-amber-600 shadow-2xs font-black'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Chọn Thể Loại Trò Chơi */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  5. Chọn Thể Loại Thử Thách Mĩ Thuật:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                  <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
                    <input
                      type="radio"
                      name="genGameType"
                      value="all"
                      checked={genGameType === 'all'}
                      onChange={() => setGenGameType('all')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>🧩 Tổng hợp 6 dạng thử thách</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
                    <input
                      type="radio"
                      name="genGameType"
                      value="color"
                      checked={genGameType === 'color'}
                      onChange={() => setGenGameType('color')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>🎨 Pha màu & Gam nóng/lạnh</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
                    <input
                      type="radio"
                      name="genGameType"
                      value="shape"
                      checked={genGameType === 'shape'}
                      onChange={() => setGenGameType('shape')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>🔺 Hình khối & Đường nét</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
                    <input
                      type="radio"
                      name="genGameType"
                      value="sequence"
                      checked={genGameType === 'sequence'}
                      onChange={() => setGenGameType('sequence')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>👣 Thứ tự 4 bước vẽ tranh</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
                    <input
                      type="radio"
                      name="genGameType"
                      value="composition"
                      checked={genGameType === 'composition'}
                      onChange={() => setGenGameType('composition')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>🔍 Bố cục & Luật xa gần</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
                    <input
                      type="radio"
                      name="genGameType"
                      value="technique"
                      checked={genGameType === 'technique'}
                      onChange={() => setGenGameType('technique')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>🖍️ Chất liệu & Kĩ thuật sáng tạo</span>
                  </label>
                </div>
              </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsGeneratorOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleGenerateNewGame}
                disabled={!selectedCurriculumTheme && !customThemeInput.trim()}
                className={`px-5 py-2 text-xs font-black rounded-xl shadow-sm flex items-center gap-1.5 transition-all ${
                  !selectedCurriculumTheme && !customThemeInput.trim()
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Tạo Trò Chơi Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
