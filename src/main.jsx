import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[GlobalErrorBoundary] Bắt lỗi cấp ứng dụng:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-slate-100 flex items-center justify-center p-4 font-sans selection:bg-amber-100">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-3xl mx-auto shadow-md">
              🎨
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-slate-800">
                Cọ Nhí Studio
              </h2>
              <p className="text-[14px] text-slate-600 leading-relaxed">
                Hệ thống đã tự động bảo vệ dữ liệu giảng dạy của Thầy/Cô. Vui lòng bấm nút bên dưới để tiếp tục sử dụng.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black rounded-xl text-[14px] transition-all cursor-pointer shadow-sm"
              >
                🔄 Tải Lại Trang (F5)
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold rounded-xl text-[14px] transition-all cursor-pointer border border-slate-300"
              >
                Vào Lại Ứng Dụng
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>,
)
