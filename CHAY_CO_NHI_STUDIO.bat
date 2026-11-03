@echo off
chcp 65001 >nul
title Cọ Nhí Studio - Phần Mềm Mĩ Thuật Tiểu Học
echo ===============================================================================
echo            CỌ NHÍ STUDIO - PHẦN MỀM SOẠN GIẢNG & TRÌNH CHIẾU MĨ THUẬT
echo               (Chuẩn GDPT 2018 & Thông tư 27/2020 - 100%% Miễn Phí)
echo ===============================================================================
echo.
echo [1/2] Đang khởi động máy chủ cục bộ offline...
cd /d "%~dp0"
start "" http://localhost:3100
npm run dev
pause
