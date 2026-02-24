FROM node:20-slim

# Ishchi papka
WORKDIR /app

# Paketlar ro'yxatni ko'chirish (cache uchun avval)
COPY package*.json ./

# Faqat production dependencies o'rnatish
RUN npm install --omit=dev

# Barcha fayllarni ko'chirish (.dockerignore da istisnolar bor)
COPY . .

# Port ochish
EXPOSE 5000

# Production muhiti
ENV NODE_ENV=production
ENV PORT=5000

# Ishga tushirish
CMD ["node", "server/index.js"]
