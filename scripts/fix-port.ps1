# Port 5000 ni bo'shatish uchun skript
$port = 5000
$processId = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess

if ($processId) {
    Write-Host "Port $port da ishlayotgan jarayon topildi (PID: $processId). O'chirilmoqda..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force
    Write-Host "Port muvaffaqiyatli bo'shatildi." -ForegroundColor Green
} else {
    Write-Host "Port $port bo'sh. Hech qanday jarayon topilmadi." -ForegroundColor Cyan
}
