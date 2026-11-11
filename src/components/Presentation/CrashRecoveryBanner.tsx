"use client";

import React from 'react';
import { AlertTriangle, RotateCcw, X, Clock } from 'lucide-react';
import type { DraftRecord } from '../../types/presentation';

export interface CrashRecoveryBannerProps {
  draft: DraftRecord | null;
  onRestore: () => void;
  onDismiss: () => void;
}

export default function CrashRecoveryBanner({
  draft,
  onRestore,
  onDismiss,
}: CrashRecoveryBannerProps): React.JSX.Element | null {
  const formattedTime = React.useMemo(() => {
    if (!draft) return 'Gần đây';
    try {
      const d = new Date(draft.timestamp);
      return d.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return 'Gần đây';
    }
  }, [draft?.timestamp]);

  if (!draft) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 p-4 bg-amber-50 border border-amber-300 rounded-xl shadow-xl animate-in slide-in-from-bottom duration-300 flex flex-col gap-3"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-amber-900 leading-tight">
            Phát hiện bản nháp chưa lưu!
          </h4>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            Hệ thống phát hiện phiên làm việc chưa hoàn tất lúc{' '}
            <span className="font-semibold inline-flex items-center gap-1">
              <Clock className="w-3 h-3 inline" />
              {formattedTime}
            </span>
            . Thầy/Cô có muốn khôi phục lại không?
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-amber-500 hover:text-amber-800 p-1 rounded-md transition-colors"
          title="Bỏ qua bản nháp"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-200">
        <button
          type="button"
          onClick={onDismiss}
          className="px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
        >
          Bỏ qua
        </button>
        <button
          type="button"
          onClick={onRestore}
          className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Khôi phục dữ liệu</span>
        </button>
      </div>
    </div>
  );
}
