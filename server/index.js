const path = require('path');
const dotenv = require('dotenv');

// MUHIM: .env faylni BIRINCHI yuklaymiz
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('---------------------------------------------------');
console.log('⚙️ LOYIHA SOZLAMALARI YUKLANMOQDA...');
if (process.env.JWT_SECRET) {
    console.log('✅ JWT_SECRET: Topildi');
} else {
    console.error('❌ JWT_SECRET: TOPILMADI! (.env faylni tekshiring)');
}
console.log(`🌍 MUHIT: ${process.env.NODE_ENV || 'development'}`);
console.log('---------------------------------------------------');

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Xavfsiz yuklash - paketlar yo'q bo'lsa ham server ishga tushsin
let helmet, morgan, rateLimit;
try { helmet = require('helmet'); } catch (e) { console.warn('[WARN] helmet paketi topilmadi, ularsiz davom etilmoqda'); }
try { morgan = require('morgan'); } catch (e) { console.warn('[WARN] morgan paketi topilmadi, ularsiz davom etilmoqda'); }
try { rateLimit = require('express-rate-limit'); } catch (e) { console.warn('[WARN] express-rate-limit paketi topilmadi'); }
const db = require('./db');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const taskRoutes = require('./routes/tasks');
const defectRoutes = require('./routes/defects');
const storageRoutes = require('./routes/storage');
const hrRoutes = require('./routes/hr');
const safetyRoutes = require('./routes/safety');
const mechanicsRoutes = require('./routes/mechanics');
const aiRoutes = require('./routes/ai');
const materialRoutes = require('./routes/materials');
const timesheetRoutes = require('./routes/timesheet');
const fileRoutes = require('./routes/files');
const pu80Routes = require('./routes/pu80');
const metrologyRoutes = require('./routes/metrology');
const pu28Routes = require('./routes/pu28');
const murojaatRoutes = require('./routes/murojaat');
const fs = require('fs');
const { startAutoBackup } = require('../scripts/backup');

// Avtomatik backupni ishga tushirish
startAutoBackup();

const app = express();
const server = http.createServer(app);

// Ruxsat etilgan domenlar ro'yxati
const allowedOrigins = [
    'http://localhost:5050',
    'http://localhost:3000',
    'http://127.0.0.1:5050',
    'http://127.0.0.1:3000',
    'https://smartpch.uz',
    'https://smart-pch.onrender.com', // ← ВОТ ЭТО ДОБАВИТЬ
    process.env.ALLOWED_ORIGIN || 'https://smartpch.uz'
];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});

// === XAVFSIZLIK MIDDLEWARE'LARI ===

// Helmet - security headers with proper CSP for CDN usage
if (helmet) {
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com", "stackpath.bootstrapcdn.com", "unpkg.com", "cdn.sheetjs.com", "code.jquery.com", "cdn.socket.io", "https://meet.jit.si"],
                scriptSrcAttr: ["'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com", "stackpath.bootstrapcdn.com", "fonts.googleapis.com", "unpkg.com", "at.alicdn.com"],
                fontSrc: ["'self'", "data:", "cdn.jsdelivr.net", "cdnjs.cloudflare.com", "stackpath.bootstrapcdn.com", "fonts.gstatic.com", "fonts.googleapis.com", "unpkg.com", "at.alicdn.com"],
                imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
                connectSrc: ["'self'", "ws:", "wss:", "http://127.0.0.1:5050", "https://smartpch.uz", "wss://smartpch.uz", "https://api.openweathermap.org"],
                frameSrc: ["'self'", "https://hrm.railway.uz", "https://obs.railwayinfra.uz", "https://kmo.railwayinfra.uz", "https://tt.railwayinfra.uz", "https://meet.jit.si"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'", "blob:", "data:", "https:"],
                frameAncestors: ["'none'"],
                formAction: ["'self'"],
                upgradeInsecureRequests: []
            }
        },
        crossOriginEmbedderPolicy: false
    }));
}

// CORS - faqat ruxsat etilgan domenlar
app.use(cors({
    origin: function (origin, callback) {
        // Ruxsat: Localhost, 127.0.0.1 yoki 192.168.x.x (Local Network)
        if (!origin ||
            origin.startsWith('http://localhost') ||
            origin.startsWith('http://127.0.0.1') ||
            origin.startsWith('http://192.168.') ||
            allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS blocked: ' + origin));
        }
    },
    credentials: true
}));

// Rate Limiting olib tashlandi (Foydalanuvchi so'roviga ko'ra)
/*
const apiLimiter = rateLimit({ ... });
const loginLimiter = rateLimit({ ... });
*/

// app.use('/api', apiLimiter);
// app.use('/api/auth/login', loginLimiter);

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
if (morgan) {
    if (process.env.NODE_ENV === 'production') {
        // Production: fayl ga yozish
        const logDir = path.join(__dirname, 'logs');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
        const logStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });
        app.use(morgan('combined', { stream: logStream }));
    } else {
        // Development: konsolga yozish
        app.use(morgan('dev'));
    }
}

const authMiddleware = require('./middleware/auth');
const { auditLog, router: auditRoutes } = require('./middleware/auditLog');

const broadcastRoutes = require('./routes/broadcast');

// Attach io to app for use in routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes); // Login is public
app.use('/api/broadcast', authMiddleware, broadcastRoutes);
app.use('/api/reports', authMiddleware, auditLog('report', 'reports'), reportRoutes);
app.use('/api/tasks', authMiddleware, auditLog('task', 'tasks'), taskRoutes);
app.use('/api/defects', authMiddleware, auditLog('defect', 'defects'), defectRoutes);
app.use('/api/storage', authMiddleware, storageRoutes);
app.use('/api/hr', authMiddleware, auditLog('hr', 'employees'), hrRoutes);
app.use('/api/safety', authMiddleware, auditLog('safety', 'safety'), safetyRoutes);
app.use('/api/mechanics', authMiddleware, auditLog('mechanics', 'vehicles'), mechanicsRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/materials', authMiddleware, auditLog('materials', 'material_acts'), materialRoutes);
app.use('/api/timesheet', authMiddleware, auditLog('timesheet', 'timesheet'), timesheetRoutes);
app.use('/api/files', authMiddleware, auditLog('files', 'uploads'), fileRoutes);
app.use('/api/pu80', authMiddleware, auditLog('pu80', 'inventory'), pu80Routes);
app.use('/api/metrology', authMiddleware, auditLog('metrology', 'metrology_devices'), metrologyRoutes);
app.use('/api/pu28', authMiddleware, auditLog('pu28', 'pu28_entries'), pu28Routes);
app.use('/api/murojaat', authMiddleware, auditLog('murojaat', 'murojaat'), murojaatRoutes);
app.use('/api/audit', auditRoutes); // Admin audit log API

// Health Check Endpoint - Tizim holatini tekshirish uchun
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: '2.2.0'
    });
});

// Weather Proxy (API kaliti faqat .env dan)
app.get('/api/weather', async (req, res) => {
    const { lat, lon } = req.query;
    const API_KEY = process.env.WEATHER_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'Weather API key is not configured' });
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=uz`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Weather fetch failed' });
    }
});

// Serve static files from the public directory
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// Handle SPAs - redirection to index.html if route not found
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join_bolinma', (bolinmaId) => {
        socket.join(bolinmaId);
        console.log(`User joined bolinma: ${bolinmaId}`);
    });

    socket.on('send_report', (data) => {
        // Broadcast to dispatcher
        io.emit('new_report', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 5050;

server.listen(PORT)
    .on('listening', () => {
        const addr = server.address();
        const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
        console.log(`🚀 Server running on port ${addr.port}`);
        console.log(`📅 SANA: ${new Date().toLocaleString('uz-UZ')}`);
        console.log(`💻 HOLAT: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔌 API: http://localhost:${addr.port}/api`);
        console.log('---------------------------------------------------\n');
    })
    .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`\n❌ [ERROR] ${PORT}-port band!`);
            console.error(`Diks: Bu portda boshqa server ishlayapti.`);
            console.error(`Tavsiya: "START_STABLE_SERVER.bat" orqali ishga tushiring.`);
            console.error('---------------------------------------------------\n');
            process.exit(1); // Batch file loops this
        } else {
            console.error('\n❌ SERVER XATOLIGI:', err.message);
            console.error(err);
            process.exit(1);
        }
    });

// === GLOBAL ERROR HANDLER ===
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({
        message: process.env.NODE_ENV === 'production'
            ? 'Serverda ichki xatolik yuz berdi'
            : err.message
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
