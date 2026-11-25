export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

export interface ToastEmitterAPI {
  subscribe(listener: (item: ToastItem) => void): () => void;
  show(message: string, type?: ToastType, duration?: number): void;
  success(message: string, duration?: number): void;
  error(message: string, duration?: number): void;
  warning(message: string, duration?: number): void;
  info(message: string, duration?: number): void;
}

export const toastService: ToastEmitterAPI;
export function showToast(message: string, type?: ToastType, duration?: number): void;
