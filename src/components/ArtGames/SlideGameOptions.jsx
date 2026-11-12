import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function SlideGameOptions({
  options = [],
  currentIdx,
  selectedOpt,
  isAnswered,
  correctAnswer,
  onSelectOption
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 my-2">
      {options.map((opt, oIdx) => {
        const isSelected = selectedOpt === oIdx;
        const isCorrect = oIdx === correctAnswer;

        let btnClass = 'bg-white border-slate-300 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/50';
        if (isAnswered) {
          if (isCorrect) {
            btnClass = 'bg-emerald-500 text-white border-emerald-600 shadow-sm';
          } else if (isSelected) {
            btnClass = 'bg-rose-500 text-white border-rose-600 shadow-sm';
          } else {
            btnClass = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
          }
        }

        return (
          <button
            key={`${currentIdx}-${oIdx}`}
            disabled={isAnswered}
            onClick={(e) => onSelectOption(oIdx, e)}
            className={`p-3 rounded-xl border-2 text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${btnClass}`}
          >
            <span className="leading-snug">{opt}</span>
            {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-white shrink-0 ml-1.5" />}
            {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-white shrink-0 ml-1.5" />}
          </button>
        );
      })}
    </div>
  );
}
