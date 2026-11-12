import React from 'react';

export default function SlideGameResult({ score, onRestart }) {
  return (
    <div className="text-center py-6 space-y-3 animate-in zoom-in-95 flex-1 flex flex-col justify-center items-center">
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-3xl shadow-sm">
        🏆
      </div>
      <h3 className="text-lg font-black text-slate-800">Hoan Hô Cả Lớp!</h3>
      <p className="text-xs text-slate-600 max-w-sm">
        Các em đã hoàn thành thử thách mĩ thuật xuất sắc với số điểm là <strong>{score} điểm</strong>!
      </p>
      <div className="pt-2">
        <button
          onClick={onRestart}
          className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          Chơi Lại Vòng Này
        </button>
      </div>
    </div>
  );
}
