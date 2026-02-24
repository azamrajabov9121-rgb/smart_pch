#!/bin/bash

# ========================================================
# SMART PCH - VPS AUTO SETUP SCRIPT (Ubuntu 22.04+)
# ========================================================

echo "🚀 Serverni sozlash boshlandi..."

# 1. Tizimni yangilash
sudo apt update && sudo apt upgrade -y

# 2. Node.js va npm o'rnatish (v20.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y node.js

# 3. Zaruriy paketlar (Git, Nginx, SQLite3)
sudo apt install -y git nginx sqlite3 build-essential

# 4. PM2 (Process Manager) o'rnatish
sudo npm install -g pm2

# 5. Papkani yaratish va huquqlarni sozlash
sudo mkdir -p /var/www/smartpch
sudo chown -R $USER:$USER /var/www/smartpch

echo "✅ Tizim paketlari tayyor."
echo "💡 Endi GitHub-dan loyihani yuklab oling:"
echo "   cd /var/www/smartpch"
echo "   git clone <Sizning_GitHub_Repo_Manzilingiz> ."
echo ""
echo "💡 Loyihani ishga tushirish uchun:"
echo "   npm install"
echo "   pm2 start ecosystem.config.js --env production"
echo "   pm2 save"
echo "   pm2 startup"

# 6. Nginx-ni sozlash (Reverse Proxy)
echo "🔧 Nginx sozlanmoqda..."
cat <<EOF | sudo tee /etc/nginx/sites-available/smartpch
server {
    listen 80;
    server_name _; # Bu yerga domen nomingizni yozing (masalan, smartpch.uz)

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        client_max_body_size 50M;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/smartpch /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo "🏁 TABRIKLAYMAN! Serveringiz saytni qabul qilishga tayyor."
