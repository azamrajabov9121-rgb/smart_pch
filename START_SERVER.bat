@echo off
title SMART PCH SERVER - DOIMIY ISHCHI HOLAT
:start
echo [%date% %time%] Server ishga tushirilmogda...
cd /d "%~dp0server"
node index.js
echo [%date% %time%] Server xatolik tufayli to'xtadi. 5 soniyadan so'ng qayta ishga tushadi...
timeout /t 5
goto start
