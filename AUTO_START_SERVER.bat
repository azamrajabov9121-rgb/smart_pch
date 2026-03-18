@echo off
title SMART PCH SERVER - ALWAYS ONLINE
cd /d "%~dp0"
echo ==================================================
echo [ %date% %time% ] - Serverni tekshirish va ishga tushirish...
echo ==================================================

:: PM2 o'rnatilganligini tekshirish
call pm2 -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ ERROR ] PM2 topilmadi! Oddiy rejimda ishga tushirilmoqda...
    :loop
    node server/index.js
    echo [ WARNING ] Server kutilmaganda to'xtadi! 3 soniyadan so'ng qayta yuklanadi...
    timeout /t 3
    goto loop
) else (
    echo [ OK ] PM2 topildi.
    echo [ INFO ] Eski jarayonlarni tiklash...
    call pm2 resurrect
    if %errorlevel% neq 0 (
        echo [ INFO ] Resurrect muvaffaqiyatsiz bo'ldi. Ecosystem bilan ishga tushiriladi...
        call pm2 start ecosystem.config.js --env production
    )
    call pm2 save
    echo [ SUCCESS ] Server "Always Online" rejimida faol.
    echo [ INFO ] Jurnalni ko'rish: pm2 logs smart-pch-server
)

pause
