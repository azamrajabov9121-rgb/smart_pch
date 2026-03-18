#!/bin/bash

# Smart PCH Avtomatik O'rnatish Skripti (Ubuntu 20.04/22.04 uchun)

echo "Smart PCH o'rnatilmoqda..."

# 1. Tizimni yangilash
echo "Tizim yangilanmoqda..."
sudo apt update && sudo apt upgrade -y

# 2. Node.js o'rnatish
echo "Node.js (LTS version) o'rnatilmoqda..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Nginx o'rnatish
echo "Nginx o'rnatilmoqda..."
sudo apt install -y nginx

# 4. PM2 o'rnatish
echo "PM2 o'rnatilmoqda..."
sudo npm install -g pm2

# 5. Loyiha qaramliklarini (dependencies) o'rnatish
echo "Loyiha yuklanmoqda (npm install)..."
npm install

# 6. PM2 orqali ilovani ishga tushirish
echo "Loyiha PM2 orqali ishga tushmoqda..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup | sudo bash

echo "NGNIX konfiguratsiyasi namunasini '/etc/nginx/sites-available/default' ichiga kiritishingiz va SSL o'rnatishingiz qoldi."
echo "Certbot o'rnatish uchun komanda: sudo snap install --classic certbot && sudo certbot --nginx"
echo "Muvaffaqiyatli yakunlandi!"
