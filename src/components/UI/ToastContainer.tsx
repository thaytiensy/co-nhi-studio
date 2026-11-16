"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { toastService, ToastItem } from '../../utils/toastService';

export default function ToastContainer(): React.JSX.Element | null {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = toastService.subscribe((newToast) => {
      setToasts((prev) => [...prev.slice(-4), newToast]); // Giữ tối đa 5 toast gần nhất
      const duration = newToast.duration || 3500;
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, duration);
    });
    return () => unsubscribe();
  }, []);

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        const bgClass = isSuccess
          ? 'bg-emerald-800/95 border-emerald-500 text-emerald-50'
          : isError
          ? 'bg-rose-900/95 border-rose-500 text-rose-50'
          : isWarning
          ? 'bg-amber-800/95 border-amber-400 text-amber-50'
          : 'bg-slate-900/95 border-slate-700 text-slate-100';

        const Icon = isSuccess
          ? CheckCircle2
          : isError
          ? AlertCircle
          : isWarning
          ? AlertTriangle
          : Info;

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 fade-in ${bgClass}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs font-bold leading-relaxed whitespace-pre-line">
              {toast.message}
            </div>
            <button
              type="button"
              onClick={() => handleDismiss(toast.id)}
              className="p-1 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
