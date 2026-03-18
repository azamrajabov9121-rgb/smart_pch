@echo off
Title Serverni To'xtatish
Color 4F

echo =======================================================
echo          SMART PCH SERVERNI TO'XTATISH
echo =======================================================
echo.
echo Bu barcha ishlayotgan Node.js jarayonlarini va avtomatik tiklashni to'xtatadi.
echo.

:: Dastlab CMD dan avtomatik tiklovchi qora oynalarni o'chiramiz
taskkill /f /im cmd.exe /fi "windowtitle eq Smart PCH Server*" >nul 2>&1

:: Keyin Nodejs serverlarini o'ldiramiz (faol)
taskkill /f /im node.exe >nul 2>&1

echo Barcha server xizmatlari to'xtatildi!
echo.
pause
