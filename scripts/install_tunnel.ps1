# ========================================================
# SMART PCH - Cloudflare Tunnel Installer (Windows)
# ========================================================

$TOKEN = "SIZNING_CLOUDFLARE_TOKENINGIZ_BU_YERDA"

Write-Host "🚀 Cloudflare Tunnel o'rnatilmoqda..." -ForegroundColor Cyan

# 1. Cloudflared ni yuklab olish
$url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.msi"
$output = "$PSScriptRoot\cloudflared.msi"
Invoke-WebRequest -Uri $url -OutFile $output

# 2. O'rnatish
Write-Host "📦 O'rnatish boshlandi..."
Start-Process msiexec.exe -ArgumentList "/i `"$output`" /quiet" -Wait

# 3. Servisni sozlash
Write-Host "🔧 Tunnelni servis sifatida ro'yxatdan o'tkazish..."
& "C:\Program Files (x86)\cloudflared\cloudflared.exe" service install $TOKEN

# 4. Saytni (5000-port) tunnelga bog'lash (Bu Cloudflare Dashboardda qilinadi)
Write-Host "✅ Hammasi tayyor! Endi Cloudflare Dashboard-dan saytni 5000-portga yo'naltiring." -ForegroundColor Green
Write-Host "🌐 Saytingiz: https://smartpch.uz" -ForegroundColor Yellow
