@echo off
title SMART PCH - RESTART AND START SERVER
cd /d "%~dp0"
color 0b

echo ====================================================
echo     SMART PCH TIZIMNI TIKLASH VA ISHGA TUSHIRISH
echo ====================================================
echo.

:: .env faylini tekshiramiz
if not exist ".env" (
    echo [!] DIQQAT: .env fayli topilmadi!
    echo Iltimos, .env.example faylini .env deb qayta nomlang va sozlamalarni kiriting.
    pause
    exit /b
)

:: Birinchi navbatda eski port va node jarayonlarini o'chiramiz
echo [1/3] Eski jarayonlarni tozalash (Cleanup)...
node scripts/cleanup.js

echo.
echo [2/3] Port muvaffaqiyatli bo'shatildi.
echo.

echo [3/3] Server ishga tushirilmoqda (Node.js)...
echo.
echo [ INFO ] Agar PM2 ishlatmoqchi bo'lsangiz: npm run pm2:start
echo [ INFO ] Chiqish uchun: Ctrl + C bosib 'Y' deng.
echo.

:loop
echo [ %time% ] Server ishlamoqda...
node server/index.js

:: Agar nodejs kutilmaganda xato qilsa (crashing), u yana 2 soniyadan so'ng avtomatik qayta tushadi
echo.
echo [!] Server to'xtadi (CRASH). 2 soniyadan so'ng qayta yuklanadi...
timeout /t 2 > nul
goto loop
