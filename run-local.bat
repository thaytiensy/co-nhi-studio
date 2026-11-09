@echo off
chcp 65001 >nul
title Cọ Nhí Studio - Phần Mềm Soạn Giảng Mĩ Thuật Tiểu Học (SIÊU VIP PRO)
color 0E

echo ======================================================================
echo    🎨 CỌ NHÍ STUDIO - PHẦN MỀM SOẠN GIẢNG MĨ THUẬT TIỂU HỌC GDPT 2018
echo       UBND XÃ IA KRÊL - TRƯỜNG PTDTBT TH LÊ QUÝ ĐÔN
echo       Tác giả / Giáo viên: Đỗ Tiến Sỹ
echo ======================================================================
echo.
echo [1/3] Đang kiểm tra môi trường Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [LỖI] Chưa tìm thấy Node.js trên máy tính! Vui lòng cài đặt Node.js từ https://nodejs.org
    pause
    exit /b
)

echo [2/3] Đang kiểm tra thư viện dependencies...
if not exist "node_modules\" (
    echo Đang tự động cài đặt thư viện cho lần đầu chạy...
    call npm install
)

echo [3/3] Đang khởi chạy máy chủ Cọ Nhí Studio tại http://localhost:3100 ...
echo.
echo ======================================================================
echo  Ứng dụng đang hoạt động. Thầy/Cô mở trình duyệt tại:
echo  >>> http://localhost:3100 <<<
echo  Nhấn Ctrl + C để dừng máy chủ.
echo ======================================================================
echo.

call npm run dev

pause
