"use client";

import React from 'react';
import { Loader2, AlertCircle, CheckCircle2, Inbox, RefreshCw } from 'lucide-react';

export type FeedbackState = 'loading' | 'empty' | 'error' | 'success';

export interface StateFeedbackProps {
  state: FeedbackState;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function StateFeedback({
  state,
  title,
  message,
  actionLabel,
  onAction,
  className = '',
}: StateFeedbackProps): React.JSX.Element {
  if (state === 'loading') {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
        <h4 className="text-sm font-bold text-slate-700">
          {title || 'Đang xử lý dữ liệu sư phạm...'}
        </h4>
        {message && <p className="text-xs text-slate-500 mt-1 max-w-sm">{message}</p>}
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">
          {title || 'Chưa có nội dung'}
        </h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          {message || 'Thầy/Cô có thể bắt đầu tạo mới hoặc tải nội dung lên hệ thống.'}
        </p>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-rose-900">
          {title || 'Đã xảy ra lỗi'}
        </h4>
        <p className="text-xs text-rose-600 mt-1 max-w-sm">
          {message || 'Không thể hoàn tất thao tác. Vui lòng kiểm tra lại.'}
        </p>
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{actionLabel || 'Thử lại'}</span>
          </button>
        )}
      </div>
    );
  }

  // success state
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3">
        <CheckCircle2 className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-slate-800">
        {title || 'Thao tác thành công!'}
      </h4>
      {message && <p className="text-xs text-slate-500 mt-1 max-w-sm">{message}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
