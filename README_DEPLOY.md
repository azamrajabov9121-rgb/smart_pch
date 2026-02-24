# 🚀 SMART PCH - Internetga ulash (Deployment) bo'yicha qo'llanma

Loyihani internetga chiqarish uchun quyidagi qadamlarni bajaring:

## 1. Loyihani GitHub-ga yuklang
Serverlar loyihani GitHub orqali qabul qiladi.
1. [GitHub](https://github.com/)-dan ro'yxatdan o'ting.
2. Yangi repo (repository) oching.
3. Loyihangizni yuklang:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SIZNING_USER_NOMINGIZ/REPO_NOMI.git
   git push -u origin main
   ```

## 2. Variant A: Render.com orqali (Oson va Bepul boshlanishiga)
*Qo'llanma yuqorida keltirilgan.*

## 3. Variant B: Eskiz.uz (VPS) orqali (Professional va Tezkor) - TAVSIYA ETILADI
Bu usul O'zbekiston ichida eng tez ishlashini ta'minlaydi.

### Qadamlar:
1. **Eskiz.uz-dan VPS oling** (Ubuntu 22.04 OS tanlang).
2. **Serverga kiring** (Menda `Putty` yoki terminal orqali):
   ```bash
   ssh root@SERVER_IP_MANZILI
   ```
3. **Avtomatik skriptni ishga tushiring:**
   Men sizga bergan `scripts/setup_vps.sh` fayli ichidagi kodni nusxalab, serverda ishlating yoki loyihani yuklab olib, quyidagicha ishga tushiring:
   ```bash
   chmod +x scripts/setup_vps.sh
   ./scripts/setup_vps.sh
   ```
4. **Loyihani GitHub-dan nusxalab oling:**
   ```bash
   cd /var/www/smartpch
   git clone https://github.com/SIZING_USER/REPO .
   npm install
   ```
5. **Dasturni yoqing:**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   ```

### 🔐 SSL (HTTPS) o'rnatish (APK uchun shart!):
Domen ulanganidan keyin serverda quyidagi buyruqni bosing:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d smartpch.uz
```

---
**Tabriklayman!** Sizning tizimingiz endi:
- 🌐 **Web:** https://smartpch.uz
- 💻 **Desktop:** EXE (dist papkasida)
- 📱 **Mobile:** APK (PWABuilder orqali)
ko'rinishida to'liq ishlaydi!

---

### Endi APK-ni qanday olasiz?
Saytingiz internetda (HTTPS formatida) paydo bo'lgandan so'ng, men yuqorida aytgan **PWABuilder.com** saytiga kirib, saytingiz manzilini bersangiz kifoya — u sizga APK-ni tayyorlab beradi.
