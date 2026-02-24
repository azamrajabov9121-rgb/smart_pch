# 📱 SMART PCH - APK Yaratish Qo'llanmasi

Ushbu loyiha **PWA (Progressive Web App)** texnologiyasi asosida qurilgan. Uni APK holatiga keltirish uchun eng oson va sifatli yo'l - **Google Bubblewrap** yoki **PWABuilder** dan foydalanishdir.

## 1-usul: PWABuilder (Eng oson)
1. Dasturni internetga (serverga) yuklang (masalan: `https://smartpch.uz`).
2. [PWABuilder.com](https://www.pwabuilder.com/) saytiga kiring.
3. Sayt manzilingizni kiriting va "Start" tugmasini bosing.
4. Tizim `manifest.json` va `sw.js` fayllaringizni tekshiradi (biz ularni allaqachon to'g'ri sozlaganmiz).
5. "Package for Stores" tugmasini bosing va "Android (Google Play)" bandini tanlab, APK/AAB faylini yuklab oling.

## 2-usul: Bubblewrap (Professional)
Agar kompyuteringizda NodeJS bo'lsa:
1. Bubblewrap-ni o'rnating:
   ```bash
   npm install -g @bubblewrap/cli
   ```
2. Loyihani init qiling:
   ```bash
   bubblewrap init --manifest=https://smartpch.uz/manifest.json
   ```
3. APK-ni build qiling:
   ```bash
   bubblewrap build
   ```

## Nega aynan PWA-to-APK?
- **Yengillik:** APK hajmi juda kichik bo'ladi (1-2 MB).
- **Avtomatik yangilanish:** Siz saytdagi kodni o'zgartirsangiz, ilova foydalanuvchida avtomatik yangilanadi (APK-ni qayta o'rnatish shart emas).
- **Offline rejim:** Biz o'rnatgan Service Worker tufayli internet yo'q bo'lsa ham ilova ochiladi.

---
*Eslatma: APK yaratish uchun loyiha HTTPS protokoli bilan ishlaydigan haqiqiy domenda bo'lishi shart.*
