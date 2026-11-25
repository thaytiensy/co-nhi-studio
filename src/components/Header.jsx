import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Save,
  Download,
  Upload,
  Presentation,
  Check,
  FileCode2,
  Sparkles,
  FilePlus,
  BookOpen,
  ShieldCheck,
  LogOut,
  FolderOpen,
  ChevronDown,
  User,
  Smartphone
} from 'lucide-react';
import { exportProjectFile } from '../utils/storageService';

export default function Header({ 
  projectTitle, 
  setProjectTitle, 
  activeTab: _activeTab, 
  setActiveTab: _setActiveTab, 
  onSave, 
  isSaved,
  onStartPresentation,
  projectData,
  onImportProject,
  onExportPPTX,
  onUploadPPTX,
  onNewProject,
  onOpenVideoGuide,
  onOpenAdminModal: _onOpenAdminModal,
  onOpenInstallModal,
  userSession,
  onLogout,
  onOpenDesktopOffice: _onOpenDesktopOffice,
  desktopOfficeInfo: _desktopOfficeInfo,
  onToggleAssistant
}) {
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const fileMenuRef = useRef(null);
  const toolsMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  const [isSeniorMode, setIsSeniorMode] = useState(() => {
    return localStorage.getItem('co_nhi_senior_mode') === 'true';
  });

  useEffect(() => {
    if (isSeniorMode) {
      document.body.classList.add('senior-friendly-app');
    } else {
      document.body.classList.remove('senior-friendly-app');
    }
  }, [isSeniorMode]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target)) setShowFileMenu(false);
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target)) setShowToolsMenu(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSeniorMode = () => {
    const next = !isSeniorMode;
    setIsSeniorMode(next);
    try {
      localStorage.setItem('co_nhi_senior_mode', String(next));
    } catch {}
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImportProject(file);
    }
  };

  const maskedEmail = userSession?.email
    ? `${userSession.email.slice(0, 2)}***@${userSession.email.split('@')[1] || 'gmail.com'}`
    : 'Giáo viên';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 select-none shadow-xs">
      <div className="px-3 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-xs text-white font-black text-lg">
            🎨
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg text-slate-800 tracking-tight">Cọ Nhí Studio</span>
              <span className="hidden sm:inline-block text-[9.5px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                Mĩ Thuật GDPT 2018
              </span>
              <span className="hidden xl:flex text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Dữ liệu lưu cục bộ
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden md:block leading-none mt-0.5">
              Phần mềm soạn giảng & trình chiếu mĩ thuật chuyên biệt
            </p>
          </div>
        </div>

        {/* Center: Project Title Input */}
        <div className="flex-1 max-w-xs md:max-w-md mx-2">
          <input 
            type="text" 
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="Nhập tên bài giảng..."
            className="w-full px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:border-amber-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-2xs"
            title="Bấm để đổi tên bài giảng"
          />
        </div>

        {/* Right: Consolidated Action Toolbar (Gọn gàng, tiết kiệm diện tích) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* 1. Menu TỆP & DỮ LIỆU (Consolidated File Operations) */}
          <div className="relative" ref={fileMenuRef}>
            <button
              onClick={() => {
                setShowFileMenu(!showFileMenu);
                setShowToolsMenu(false);
                setShowUserMenu(false);
              }}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Mở hoặc quản lý tệp bài giảng, Office (.pptx, .ppt, .docx, .xlsx, .pdf, .conhi)"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Tệp</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showFileMenu && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs"
                onClick={() => setShowFileMenu(false)}
              >
                <button
                  onClick={onUploadPPTX}
                  className="w-full px-3.5 py-2 text-left font-bold text-amber-900 hover:bg-amber-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <div className="font-extrabold">Mở Mọi File Office</div>
                    <div className="text-[10px] text-amber-700/80 font-normal">.pptx, .ppt cũ 97-2003, .docx, .xlsx, .pdf</div>
                  </div>
                </button>

                <button
                  onClick={onUploadPPTX}
                  className="w-full px-3.5 py-2 text-left font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <Presentation className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Tải giáo án PowerPoint (.pptx)</span>
                </button>

                <label className="w-full px-3.5 py-2 text-left font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer">
                  <FileCode2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Mở tệp từ máy (.conhi, .pptx, .ppt)</span>
                  <input type="file" accept=".conhi,.json,.pptx,.ppt" className="hidden" onChange={handleFileInput} />
                </label>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  onClick={() => exportProjectFile(projectData, `${projectTitle.replace(/\s+/g, '_')}.conhi`)}
                  className="w-full px-3.5 py-2 text-left font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Lưu tệp về máy (.conhi)</span>
                </button>

                <button
                  onClick={onExportPPTX}
                  className="w-full px-3.5 py-2 text-left font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2.5 cursor-pointer"
                >
                  <Presentation className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Xuất PowerPoint (.pptx)</span>
                </button>

                {onNewProject && (
                  <>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={onNewProject}
                      className="w-full px-3.5 py-2 text-left font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer"
                    >
                      <FilePlus className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Tạo bài mới (Xóa trắng)</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 2. Menu TIỆN ÍCH & TRỢ GIẢNG (Consolidated Tools & Guides) */}
          <div className="relative" ref={toolsMenuRef}>
            <button
              onClick={() => {
                setShowToolsMenu(!showToolsMenu);
                setShowFileMenu(false);
                setShowUserMenu(false);
              }}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Mở Tiện ích: Hướng dẫn sử dụng, Chữ to GV 50+, Cài đặt app, Trợ giảng AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Tiện Ích</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showToolsMenu && (
              <div 
                className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs"
                onClick={() => setShowToolsMenu(false)}
              >
                {onOpenVideoGuide && (
                  <button
                    onClick={onOpenVideoGuide}
                    className="w-full px-3.5 py-2 text-left font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-rose-500 shrink-0" />
                    <div>
                      <div>Hướng Dẫn Sử Dụng</div>
                      <div className="text-[10px] text-slate-400 font-normal">Cẩm nang 6 phân hệ & Video thuyết minh</div>
                    </div>
                  </button>
                )}

                <button
                  onClick={toggleSeniorMode}
                  className="w-full px-3.5 py-2 text-left font-semibold text-slate-700 hover:bg-amber-50 flex items-center justify-between gap-2.5 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">👓</span>
                    <span>Chữ To (GV 50+)</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isSeniorMode ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isSeniorMode ? 'Bật' : 'Tắt'}
                  </span>
                </button>

                {onOpenInstallModal && (
                  <button
                    onClick={onOpenInstallModal}
                    className="w-full px-3.5 py-2 text-left font-semibold text-slate-700 hover:bg-emerald-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div>Tải & Cài Đặt App</div>
                      <div className="text-[10px] text-slate-400 font-normal">Tạo lối tắt trên máy tính & điện thoại</div>
                    </div>
                  </button>
                )}

                {onToggleAssistant && (
                  <button
                    onClick={onToggleAssistant}
                    className="w-full px-3.5 py-2 text-left font-semibold text-slate-700 hover:bg-amber-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Trợ Giảng AI Cọ Nhí</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 3. Nút Chữ To 1-Chạm Nhanh (GV 50+) */}
          <button
            onClick={toggleSeniorMode}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-black rounded-xl border flex items-center gap-1 transition-all cursor-pointer shadow-2xs ${
              isSeniorMode 
                ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300' 
                : 'bg-white text-slate-700 hover:bg-amber-50 border-slate-200'
            }`}
            title="Bật/Tắt chế độ chữ to, tương phản cao hỗ trợ giáo viên trên 50 tuổi đọc rõ ràng"
          >
            <span>👓</span>
            <span className="hidden xl:inline text-[11px]">{isSeniorMode ? 'Chữ To: Bật' : 'Chữ To'}</span>
          </button>

          {/* 4. Menu TÀI KHOẢN & KHÔNG GIAN RIÊNG (Sleek Compact Pill) */}
          {userSession?.email && (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowFileMenu(false);
                  setShowToolsMenu(false);
                }}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  userSession?.role === 'super_admin'
                    ? 'bg-rose-50 border-rose-200 text-rose-950 hover:bg-rose-100'
                    : userSession?.role === 'sub_admin'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-950 hover:bg-indigo-100'
                    : 'bg-amber-50 border-amber-200 text-amber-950 hover:bg-amber-100'
                }`}
                title="Tài khoản & Không gian làm việc"
              >
                {userSession?.role === 'super_admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                ) : (
                  <User className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span className="hidden sm:inline font-mono text-[11px]">{maskedEmail}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="px-3.5 py-1.5 border-b border-slate-100">
                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                      {userSession?.role === 'super_admin' ? '🛡️ Super Admin' : userSession?.role === 'sub_admin' ? '🛡️ Quản trị viên' : '🏫 Không gian giáo viên'}
                    </div>
                    <div className="font-bold text-slate-800 text-[11px] truncate mt-0.5">{maskedEmail}</div>
                  </div>

                  {onOpenInstallModal && (
                    <button
                      onClick={onOpenInstallModal}
                      className="w-full px-3.5 py-2 text-left font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Cài đặt ứng dụng vào máy</span>
                    </button>
                  )}

                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="w-full px-3.5 py-2 text-left font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Đăng xuất</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 5. Nút LƯU NHANH (Ctrl+S) */}
          <button
            onClick={onSave}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
              isSaved 
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200' 
                : 'bg-amber-500 text-white hover:bg-amber-600 border border-amber-600 shadow-xs'
            }`}
            title="Lưu bài giảng vào bộ nhớ máy tính (Ctrl+S)"
          >
            {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isSaved ? 'Đã lưu' : 'Lưu'}</span>
          </button>

          {/* 6. Nút TRÌNH CHIẾU F5 (Main Primary CTA) */}
          <button
            onClick={onStartPresentation}
            className="px-3.5 sm:px-4 py-1.5 text-xs font-black text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl shadow-sm hover:shadow flex items-center gap-1.5 sm:gap-2 transition-all transform active:scale-95 cursor-pointer ring-2 ring-amber-400/30"
            title="Bắt đầu trình chiếu bài giảng toàn màn hình lớp học (Phím tắt F5 / F11)"
          >
            <Play className="w-3.5 h-3.5 fill-white shrink-0" />
            <span className="whitespace-nowrap">Trình Chiếu</span>
          </button>
        </div>
      </div>
    </header>
  );
}
