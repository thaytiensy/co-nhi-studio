import React, { useState, useEffect } from 'react';
import { Gamepad2, Trophy, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import SlideGameResult from './SlideGameResult';
import SlideGameOptions from './SlideGameOptions';

export default function SlideGameWidget({ element }) {
  // Cố định danh sách câu hỏi trong suốt phiên chơi của slide hiện tại,
  // ngăn chặn tình trạng component cha re-render làm hoán đổi vị trí các ô đáp án
  const [questions, setQuestions] = useState(() => element?.questions || []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const elementKey = element?.id || element?.title || '';

  useEffect(() => {
    if (element?.questions && element.questions.length > 0) {
      setQuestions(element.questions);
      setCurrentIdx(0);
      setSelectedOpt(null);
      setIsAnswered(false);
      setScore(0);
      setShowResult(false);
    }
  }, [elementKey]);

  const currentQ = questions[currentIdx] || {
    question: 'Chưa có câu hỏi nào trong trò chơi này.',
    options: ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D'],
    correctAnswer: 0,
    explanation: 'Giáo viên có thể thiết lập câu hỏi trong Xưởng Trò Chơi.'
  };

  const handleSelectOption = (idx, e) => {
    if (e) e.stopPropagation();
    if (isAnswered) return;

    setSelectedOpt(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctAnswer) {
      setScore(prev => prev + 10);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (err) {}
    }
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
      try {
        confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
      } catch (err) {}
    }
  };

  const handleRestart = (e) => {
    if (e) e.stopPropagation();
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
  };

  return (
    <div 
      className="w-full h-full bg-white rounded-2xl border-2 border-indigo-200 shadow-xl flex flex-col overflow-hidden select-none pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Widget Header Bar */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 text-white px-5 py-2.5 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="p-1.5 bg-white/20 rounded-lg text-amber-300">
            <Gamepad2 className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h4 className="font-black text-xs md:text-sm truncate">
              {element?.title || 'Trò Chơi Mĩ Thuật Tương Tác'}
            </h4>
            <span className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider">
              Môn Mĩ Thuật Lớp {element?.grade || 1} • {questions.length} Thử Thách
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-400 text-amber-950 font-black text-xs rounded-full shadow-2xs">
            <Trophy className="w-3.5 h-3.5 text-amber-900" />
            <span>{score} điểm</span>
          </div>
          <button
            onClick={handleRestart}
            className="p-1 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
            title="Chơi lại từ đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget Body */}
      <div className="flex-1 p-5 flex flex-col justify-between overflow-y-auto bg-slate-50/60">
        {!showResult ? (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Question Index Badge */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-black text-[11px]">
                  Câu hỏi {currentIdx + 1} / {questions.length}
                </span>
                {currentQ.artTheme && (
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 truncate max-w-[250px]">
                    🖼️ {currentQ.artTheme}
                  </span>
                )}
              </div>

              {/* Graphic Feature if Color mixing or Shape */}
              {currentQ.color1 && (
                <div className="flex items-center justify-center gap-3 py-2 mb-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="w-10 h-10 rounded-full shadow border-2 border-white" style={{ backgroundColor: currentQ.color1 }} />
                  <span className="text-xl font-black text-slate-400">+</span>
                  <div className="w-10 h-10 rounded-full shadow border-2 border-white" style={{ backgroundColor: currentQ.color2 }} />
                  <span className="text-xl font-black text-slate-400">=</span>
                  <div 
                    className="w-12 h-12 rounded-full shadow-md border-2 border-dashed border-amber-400 flex items-center justify-center text-lg font-bold"
                    style={{ backgroundColor: isAnswered ? currentQ.resultColor : '#f1f5f9' }}
                  >
                    {isAnswered ? '✨' : '?'}
                  </div>
                </div>
              )}

              {currentQ.shapeIcon && !currentQ.color1 && (
                <div className="text-center py-1.5 mb-2 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-3xl">{currentQ.shapeIcon}</span>
                </div>
              )}

              {/* Question Text */}
              <h3 className="text-sm md:text-base font-black text-slate-800 text-center mb-3 leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* Options Grid */}
            <SlideGameOptions
              options={currentQ.options}
              currentIdx={currentIdx}
              selectedOpt={selectedOpt}
              isAnswered={isAnswered}
              correctAnswer={currentQ.correctAnswer}
              onSelectOption={handleSelectOption}
            />

            {/* Explanation & Next Button */}
            {isAnswered && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
                <p className="text-[11px] text-amber-950 font-semibold leading-relaxed line-clamp-2">
                  💡 <strong>Lời Thầy/Cô:</strong> {currentQ.explanation}
                </p>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
                >
                  {currentIdx < questions.length - 1 ? 'Câu Tiếp →' : 'Kết Quả 🎉'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <SlideGameResult score={score} onRestart={handleRestart} />
        )}
      </div>
    </div>
  );
}
