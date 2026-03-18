@echo off
Title Smart PCH Server - Doimiy Ishlovchi Dastur
Color 0A

:: Joriy papkani ko'rsatish
cd /d "%~dp0"

echo =======================================================
echo          SMART PCH SERVERNI ISHGA TUSHIRISH
echo =======================================================
echo.
echo Diks: Qora oyna (Terminal) ni yopmamaslik tavsiya etiladi.
echo Lekin server xato bersa ham, o'zi avtomatik qayta tushadi.
echo.

:loop
echo [ %time% ] - Server ishga tushirilmoqda...
node server/index.js

:: Agar server o'chib qolsa yoki xato bersa, pastdagi kod ishlaydi
echo.
echo [!] Server to'xtab qoldi! 3 soniyadan so'ng qayta ishga tushadi.
timeout /t 3 > nul
goto loop
