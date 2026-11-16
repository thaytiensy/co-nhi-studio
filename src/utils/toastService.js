// Global Toast Notification Service for ART AI Studio
// Works in both Vite React client and Node.js test runners

class ToastEmitter {
  constructor() {
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  show(message, type = 'info', duration = 3500) {
    if (!message || typeof message !== 'string') return;
    const item = {
      id: `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      message: message.trim(),
      type,
      duration
    };
    this.listeners.forEach((fn) => {
      try {
        fn(item);
      } catch (err) {
        console.warn('[ToastEmitter] Listener error:', err);
      }
    });
  }

  success(message, duration) {
    this.show(message, 'success', duration);
  }

  error(message, duration) {
    this.show(message, 'error', duration);
  }

  warning(message, duration) {
    this.show(message, 'warning', duration);
  }

  info(message, duration) {
    this.show(message, 'info', duration);
  }
}

export const toastService = new ToastEmitter();

export function showToast(message, type = 'info', duration = 3500) {
  toastService.show(message, type, duration);
}
