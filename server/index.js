const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
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
const path = require('path');
const fs = require('fs');
const { startAutoBackup } = require('../scripts/backup');

dotenv.config();

// Avtomatik backupni ishga tushirish
startAutoBackup();

const app = express();
const server = http.createServer(app);

// Ruxsat etilgan domenlar ro'yxati
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.ALLOWED_ORIGIN || 'https://smartpch.uz']
    : ['http://localhost:5000', 'http://localhost:3000', 'http://127.0.0.1:5000'];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});

// === XAVFSIZLIK MIDDLEWARE'LARI ===

// Helmet - security headers (CDN va inline scriptlar uchun moslashtirilgan)
app.use(helmet({
    contentSecurityPolicy: false, // CDN lar ishlatilgani uchun
    crossOriginEmbedderPolicy: false
}));

// CORS - faqat ruxsat etilgan domenlar
app.use(cors({
    origin: function (origin, callback) {
        // Server-side requests (no origin) yoki ruxsat etilgan domenlar
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('CORS ruxsat berilmagan'));
        }
    },
    credentials: true
}));

// Rate Limiting - API himoyasi
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 daqiqa
    max: 200, // Har 15 daqiqada 200 ta so'rov
    message: { message: 'Juda ko\'p so\'rov yuborildi. Iltimos, keyinroq urinib ko\'ring.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Login uchun qattiqroq limit (brute-force himoya)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // 15 daqiqada faqat 10 ta urinish
    message: { message: 'Juda ko\'p login urinishi. 15 daqiqadan keyin urinib ko\'ring.' }
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', loginLimiter);

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
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

const authMiddleware = require('./middleware/auth');
const { auditLog, router: auditRoutes } = require('./middleware/auditLog');

// Routes
app.use('/api/auth', authRoutes); // Login is public
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
app.use('/api/audit', auditRoutes); // Admin audit log API

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
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
