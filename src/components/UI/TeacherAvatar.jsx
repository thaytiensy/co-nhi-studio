import React from 'react';

/**
 * TeacherAvatar - Biểu tượng Trợ Giảng Mĩ Thuật Cọ Nhí
 * Thiết kế đồ họa vector nghệ thuật 100% sắc nét, chuẩn phong cách Mĩ thuật GDPT 2018.
 * Hoàn toàn không dùng ảnh raster AI người thực, hiển thị tức thì trên mọi độ phân giải.
 */
export default function TeacherAvatar({
  gender = 'male',
  size = 'md',
  className = '',
  showPulse = true,
  isSpeaking = false,
  isListening = false,
}) {
  const isFemale = gender === 'female';

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-7 h-7 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-2xl',
    xl: 'w-20 h-20 text-3xl',
  };

  const dim = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`relative rounded-full flex items-center justify-center shrink-0 shadow-md border-2 select-none transition-all duration-300 ${dim} ${
        isFemale
          ? 'bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-300 border-rose-300/80 shadow-rose-900/30'
          : 'bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 border-amber-300/80 shadow-amber-900/30'
      } ${isSpeaking ? 'ring-4 ring-amber-400/60 scale-105 animate-pulse' : ''} ${className}`}
      title={isFemale ? 'Cô Trợ Giảng Mĩ Thuật Cọ Nhí' : 'Thầy Trợ Giảng Mĩ Thuật Cọ Nhí'}
    >
      {/* Biểu tượng Bảng Màu Nghệ Thuật & Cọ Vẽ Vector */}
      <div className="flex items-center justify-center text-white drop-shadow-sm select-none">
        <span className="leading-none transform group-hover:scale-110 transition-transform select-none">
          🎨
        </span>
      </div>

      {/* Chấm trạng thái trực tuyến */}
      {showPulse && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-white shadow-xs ${
            size === 'sm' || size === 'xs' ? 'w-2 h-2' : 'w-2.5 h-2.5'
          } ${isListening ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'}`}
          title="Đang trực tuyến"
        />
      )}
    </div>
  );
}
