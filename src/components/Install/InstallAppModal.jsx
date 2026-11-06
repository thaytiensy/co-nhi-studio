import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Monitor, 
  Smartphone, 
  Check, 
  X, 
  Sparkles, 
  Laptop, 
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function InstallAppModal({ isOpen, onClose, installPrompt, isInstalled }) {
  const [downloadNotice, setDownloadNotice] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  // Xử lý cài đặt PWA bản địa (Chrome, Edge, Android)
  const handleNativeInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } else {
      // Nếu trình duyệt chưa sẵn sàng prompt (ví dụ đã cài hoặc chưa hỗ trợ), tải shortcut desktop
      handleDownloadDesktopShortcut();
    }
  };

  // Tạo và tải file Lối tắt Desktop (.url) cho Windows
  const handleDownloadDesktopShortcut = () => {
    const appUrl = window.location.origin || 'https://co-nhi-studio.vercel.app';
    const fileContent = `[InternetShortcut]\r\nURL=${appUrl}\r\nIconIndex=0\r\nHotKey=0\r\nIDList=\r\n`;
    const blob = new Blob([fileContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Co_Nhi_Studio_Mi_Thuat.url';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 text-white rounded-xl shadow-md backdrop-blur-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span>Tải & Cài Đặt Cọ Nhí Studio</span>
                <span className="text-[10px] bg-white text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  Bản Máy Tính & Điện Thoại
                </span>
              </h3>
              <p className="text-xs text-amber-100">
                Sử dụng như một phần mềm chuyên nghiệp trên màn hình máy tính (Desktop App)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung bên trong Modal */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {installSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-3xl shadow-md">
                ✓
              </div>
              <h4 className="text-lg font-black text-slate-800">Cài Đặt Thành Công!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Biểu tượng Cọ Nhí Studio đã được tạo trên màn hình chính (Desktop) và thanh tác vụ. Thầy/Cô có thể mở app bất cứ lúc nào!
              </p>
            </div>
          ) : (
            <>
              {/* Thông báo tải lối tắt */}
              {downloadNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Đã tải file lối tắt về máy! Thầy/Cô hãy kéo file ra màn hình Desktop để mở nhanh.</span>
                </div>
              )}

              {/* Thẻ Lợi ích nổi bật */}
              <div className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Ưu điểm khi cài đặt ứng dụng vào máy tính:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-amber-950">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Mở độc lập toàn màn hình</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Hoạt động 100% Cục bộ Offline</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Không có thanh địa chỉ vướng víu</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Tự động cập nhật tính năng mới</span>
                  </div>
                </div>
              </div>

              {/* 2 Lựa chọn Cài Đặt */}
              <div className="space-y-2.5 pt-1">
                {/* Lựa chọn 1: Cài đặt trực tiếp (PWA) */}
                <button
                  type="button"
                  onClick={handleNativeInstall}
                  className="w-full p-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl shadow-md shadow-amber-200 flex items-center justify-between text-left transition-all transform active:scale-98 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-xl shrink-0">
                      💻
                    </div>
                    <div>
                      <div className="font-extrabold text-sm flex items-center gap-1.5">
                        <span>Cài Đặt App Trực Tiếp (Khuyên Dùng)</span>
                        <span className="text-[9px] bg-white text-amber-900 px-2 py-0.5 rounded-full font-black">
                          1 Chạm
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-100">
                        {installPrompt 
                          ? 'Bấm để cài đặt ứng dụng vào Start Menu & Desktop ngay lập tức' 
                          : 'Cài đặt tự động qua trình duyệt Chrome / Edge'}
                      </p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Lựa chọn 2: Tải lối tắt Desktop (.url) */}
                <button
                  type="button"
                  onClick={handleDownloadDesktopShortcut}
                  className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-amber-300 text-slate-800 rounded-xl flex items-center justify-between text-left transition-all shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl shrink-0">
                      🚀
                    </div>
                    <div>
                      <div className="font-extrabold text-xs md:text-sm text-slate-800">
                        Tải Phím Tắt Mở App Trên Desktop (.url)
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Dành cho mọi loại máy tính Windows: Tải về và nhấp đúp là mở ngay
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                </button>
              </div>

              {/* Hướng dẫn thao tác thủ công trên các trình duyệt */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Hướng dẫn cài đặt nhanh trên thanh địa chỉ:
                </span>
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p>
                    • <strong>Trên Microsoft Edge / Chrome:</strong> Nhìn lên góc phải thanh nhập địa chỉ web, bấm vào biểu tượng <strong>[Cài đặt ứng dụng]</strong> 💻 rồi chọn <em>"Cài đặt"</em>.
                  </p>
                  <p>
                    • <strong>Trên Cốc Cốc / Brave:</strong> Bấm vào menu 3 chấm (góc trên cùng bên phải) $\to$ chọn <strong>"Cài đặt Cọ Nhí Studio..."</strong>.
                  </p>
                  <p>
                    • <strong>Trên Điện Thoại / iPad:</strong> Bấm nút <em>Chia sẻ (Share)</em> $\to$ chọn <strong>"Thêm vào Màn hình chính" (Add to Home Screen)</strong>.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Cọ Nhí Studio • Phiên bản 1.0 Chuẩn GDPT 2018
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
