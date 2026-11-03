import React, { useState, useRef } from 'react';
import { 
  Music, 
  Video, 
  Upload, 
  Search, 
  ExternalLink, 
  Plus, 
  Check, 
  Info, 
  Play 
} from 'lucide-react';

const YouTubeIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function MediaYouTubeModal({
  currentThemeTitle = 'Sắc màu thiên nhiên',
  onInsertAudio,
  onInsertVideo,
  onInsertYouTube,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('youtube'); // 'youtube', 'audio', 'video'
  const [searchKeyword, setSearchKeyword] = useState(`Mĩ thuật tiểu học ${currentThemeTitle}`);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [audioName, setAudioName] = useState('');
  const [videoName, setVideoName] = useState('');

  const audioFileRef = useRef(null);
  const videoFileRef = useRef(null);

  // Suggested keywords for Art Teachers
  const suggestedKeywords = [
    `Hướng dẫn vẽ ${currentThemeTitle}`,
    'Mĩ thuật lớp 1 sắc màu em yêu',
    'Cách pha màu cơ bản mĩ thuật',
    'Hướng dẫn xé dán giấy mĩ thuật tiểu học',
    'Hướng dẫn nặn con vật đất nặn lớp 2',
    'Bài hát khởi động tiết mĩ thuật'
  ];

  // Open YouTube search in safe new tab (No API key needed!)
  const handleOpenYouTubeSearch = (query) => {
    const q = encodeURIComponent(query || searchKeyword);
    window.open(`https://www.youtube.com/results?search_query=${q}`, '_blank', 'noopener,noreferrer');
  };

  // Convert standard YouTube watch/share URL into clean embed URL
  const getEmbedUrl = (url) => {
    try {
      if (url.includes('embed/')) return url;
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes('watch?v=')) {
        const id = url.split('watch?v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const handleInsertYouTubeEmbed = (e) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;
    const embedUrl = getEmbedUrl(youtubeUrl.trim());
    onInsertYouTube(embedUrl);
    onClose();
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onInsertAudio(url, file.name);
      onClose();
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onInsertVideo(url, file.name);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <YouTubeIcon className="w-5 h-5 text-rose-600" />
            </span>
            <div>
              <h3 className="font-black text-base text-slate-800">Âm Thanh, Video & Tìm YouTube</h3>
              <p className="text-xs text-slate-500">Chèn nhạc nền, video minh họa từ thiết bị hoặc tìm video YouTube an toàn</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
            ✕
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 mt-4 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('youtube')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'youtube' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <YouTubeIcon className="w-4 h-4 text-rose-600" />
            <span>Tìm Kiếm YouTube</span>
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'audio' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Music className="w-4 h-4 text-emerald-600" />
            <span>Nhạc Từ Máy (MP3)</span>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'video' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-4 h-4 text-blue-600" />
            <span>Video Từ Máy (MP4)</span>
          </button>
        </div>

        {/* Tab 1: YouTube Search & Embed */}
        {activeTab === 'youtube' && (
          <div className="mt-4 space-y-4">
            {/* Safe Search Button (No API Key Required!) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="text-xs font-extrabold text-slate-700 block">
                1. Tìm video trên YouTube theo từ khóa:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Nhập từ khóa mĩ thuật cần tìm..."
                  className="flex-1 px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={() => handleOpenYouTubeSearch(searchKeyword)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Mở YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Suggestions chips */}
              <div className="pt-1 flex flex-wrap gap-1">
                <span className="text-[10px] font-bold text-slate-400 py-0.5">Gợi ý:</span>
                {suggestedKeywords.slice(0, 3).map((kw, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setSearchKeyword(kw); handleOpenYouTubeSearch(kw); }}
                    className="text-[10px] bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300 px-2 py-0.5 rounded-full transition-all"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>

            {/* Embed link input */}
            <form onSubmit={handleInsertYouTubeEmbed} className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl space-y-2">
              <label className="text-xs font-extrabold text-rose-900 block">
                2. Dán link video YouTube để nhúng vào slide:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="Ví dụ: https://www.youtube.com/watch?v=..."
                  className="flex-1 px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <button
                  type="submit"
                  disabled={!youtubeUrl.trim()}
                  className={`px-4 py-1.5 font-bold text-xs rounded-lg flex items-center gap-1 transition-all ${
                    youtubeUrl.trim() ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nhúng Vào Slide</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Video được nhúng theo chuẩn iframe chính thức của YouTube và không tự động phát khi chưa bấm.
              </p>
            </form>
          </div>
        )}

        {/* Tab 2: Local Audio Upload */}
        {activeTab === 'audio' && (
          <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
              🎵
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-800">Thêm Nhạc Nền / Âm Thanh Từ Thiết Bị</h4>
              <p className="text-xs text-slate-500 mt-1">
                Tải tệp âm thanh (MP3, WAV) từ máy để phát nhạc êm dịu lúc học sinh vẽ tranh
              </p>
            </div>
            <button
              onClick={() => audioFileRef.current?.click()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Chọn Tệp Âm Thanh Từ Máy</span>
            </button>
            <input
              type="file"
              ref={audioFileRef}
              accept="audio/*"
              className="hidden"
              onChange={handleAudioUpload}
            />
            <p className="text-[11px] text-slate-400">
              * Âm thanh chỉ phát khi Thầy/Cô bấm nút Play, không tự động phát gây ồn lớp học.
            </p>
          </div>
        )}

        {/* Tab 3: Local Video Upload */}
        {activeTab === 'video' && (
          <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-xl">
              🎬
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-800">Thêm Video Minh Họa Từ Thiết Bị</h4>
              <p className="text-xs text-slate-500 mt-1">
                Tải tệp video (MP4, WebM) từ máy tính để phát trong giờ dạy mĩ thuật
              </p>
            </div>
            <button
              onClick={() => videoFileRef.current?.click()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Chọn Tệp Video Từ Máy</span>
            </button>
            <input
              type="file"
              ref={videoFileRef}
              accept="video/*"
              className="hidden"
              onChange={handleVideoUpload}
            />
            <p className="text-[11px] text-slate-400">
              * Video được nhúng trực tiếp vào slide và có đầy đủ nút điều khiển phát/dừng.
            </p>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
