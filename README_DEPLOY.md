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

## 2. Render.com orqali bepul joylashtiring
Render.com loyihangizni avtomatik ravishda GitHub-dan olib, bir necha daqiqada internetga chiqaradi.

1. [Render.com](https://render.com/) saytiga kiring va GitHub orqali kiring.
2. **"New +"** -> **"Web Service"** tugmasini bosing.
3. GitHub-dagi o'sha loyihangizni tanlang.
4. Quyidagi sozlamalarni kiriting:
   - **Language:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. **Advanced** bo'limida **"Add Environment Variable"** ni tanlang:
   - `JWT_SECRET`: (o'zingiz xohlagan murakkab kod)
   - `NODE_ENV`: `production`
6. **"Deploy Web Service"** tugmasini bosing.

## 3. SQLite ma'lumotlar bazasini saqlab qolish (Muhim!)
Render-da bepul versiyada disk har o'chib-yonadi. Ma'lumotlar yo'qolmasligi uchun "Disk" (Storage) ulab qo'yishingiz kerak (Render dashboard-da "Disks" bo'limida):
- **Mount Path:** `/opt/render/project/src/server/data`
- **Size:** `1GB`

Ushbu amallardan so'ng loyihangiz `https://smart-pch.onrender.com` kabi manzilga ega bo'ladi.

## 4. O'zingizning domeningizni ulash (`smartpch.uz`)
Agar sizda `smartpch.uz` domeni bo'lsa:
1. Render dashboard -> **Settings** -> **Custom Domains**.
2. Domen nomingizni yozing.
3. Sizga berilgan CNAME va A recordlarini domeningiz boshqaruv panelida (masalan, `regis.uz` yoki `cpanel`-da) o'rnating.

---

### Endi APK-ni qanday olasiz?
Saytingiz internetda (HTTPS formatida) paydo bo'lgandan so'ng, men yuqorida aytgan **PWABuilder.com** saytiga kirib, saytingiz manzilini bersangiz kifoya — u sizga APK-ni tayyorlab beradi.
