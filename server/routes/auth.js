const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set!');
    process.exit(1);
}

const authMiddleware = require('../middleware/auth');

// Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Login va parol kiritilishi shart' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username.trim()], async (err, user) => {
        if (err) return res.status(500).json({ message: 'Ma\'lumotlar bazasida xatolik' });
        if (!user) return res.status(401).json({ message: 'Bunday foydalanuvchi topilmadi' });

        if (user.status === 'inactive') return res.status(403).json({ message: 'Profilingiz bloklangan. Administratorga murojaat qiling.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Parol noto\'g\'ri' });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                full_name: user.full_name,
                departments: JSON.parse(user.departments || '[]'),
                bolinmalar: JSON.parse(user.bolinmalar || '[]'),
                avatar: user.avatar,
                phone: user.phone,
                employee_id: user.employee_id,
                settings: JSON.parse(user.settings || '{}')
            }
        });
    });
});


// Token yangilash (refresh)
router.post('/refresh', authMiddleware, (req, res) => {
    const token = jwt.sign(
        { id: req.user.id, username: req.user.username, role: req.user.role },
        JWT_SECRET,
        { expiresIn: '30d' }
    );
    res.json({ token });
});

// Parol o'zgartirish
router.post('/change-password', authMiddleware, (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Joriy va yangi parolni kiriting' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak' });
    }

    db.get('SELECT * FROM users WHERE id = ?', [req.user.id], async (err, user) => {
        if (err) return res.status(500).json({ message: 'Ma\'lumotlar bazasida xatolik' });
        if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Joriy parol noto\'g\'ri' });

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id], (err) => {
            if (err) return res.status(500).json({ message: 'Parolni o\'zgartirishda xatolik' });
            res.json({ message: 'Parol muvaffaqiyatli o\'zgartirildi' });
        });
    });
});

// Get all users (Admin only)
router.get('/users', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Ruxsat berilmagan' });
    }

    db.all('SELECT id, username, role, full_name, departments, bolinmalar, employee_id, avatar, phone, settings, status FROM users', [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Ma\'lumotlar bazasida xatolik' });

        const users = rows.map(user => ({
            ...user,
            departments: JSON.parse(user.departments || '[]'),
            bolinmalar: JSON.parse(user.bolinmalar || '[]'),
            settings: JSON.parse(user.settings || '{}'),
            status: user.status || 'active'
        }));

        res.json(users);
    });
});

// Yangi foydalanuvchi yaratish (Admin only)
router.post('/users', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Ruxsat berilmagan' });
    }

    const { username, password, role, full_name, departments, bolinmalar, employee_id, phone } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Login, parol va roli kiritilishi shart' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    db.run(
        `INSERT INTO users (username, password, role, full_name, departments, bolinmalar, employee_id, phone, settings, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [username.trim(), hashedPassword, role, full_name || '', JSON.stringify(departments || []), JSON.stringify(bolinmalar || []), employee_id || null, phone || '', '{}', 'active'],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ message: 'Bu foydalanuvchi nomi allaqachon mavjud' });
                }
                return res.status(500).json({ message: err.message });
            }
            res.json({ id: this.lastID, message: 'Foydalanuvchi yaratildi' });
        }
    );
});

// Update profile
router.put('/profile', authMiddleware, (req, res) => {
    const { full_name, phone, avatar, settings } = req.body;
    let query = 'UPDATE users SET ';
    const params = [];

    if (full_name !== undefined) { query += 'full_name = ?, '; params.push(full_name); }
    if (phone !== undefined) { query += 'phone = ?, '; params.push(phone); }
    if (avatar !== undefined) { query += 'avatar = ?, '; params.push(avatar); }
    if (settings !== undefined) { query += 'settings = ?, '; params.push(JSON.stringify(settings)); }

    if (params.length === 0) return res.status(400).json({ message: 'Tahrirlash uchun ma\'lumot kerak' });

    query = query.slice(0, -2) + ' WHERE id = ?';
    params.push(req.user.id);

    db.run(query, params, function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Profil muvaffaqiyatli yangilandi' });
    });
});


// Foydalanuvchi parolini tiklash (Admin only)
router.post('/users/:id/reset-password', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Ruxsat berilmagan' });
    }

    const { password } = req.body;
    if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.params.id], function (err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
        res.json({ message: 'Parol muvaffaqiyatli yangilandi' });
    });
});

// Foydalanuvchini holatini o'zgartirish (Deaktivatsiya / Aktivatsiya)
router.patch('/users/:id/status', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Ruxsat berilmagan' });
    }

    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ message: 'Noto\'g\'ri holat' });
    }

    // Admin o'zini bloklay olmaydi
    if (parseInt(req.params.id) === req.user.id && status === 'inactive') {
        return res.status(400).json({ message: 'O\'z hisobingizni bloklay olmaysiz' });
    }

    db.run('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id], function (err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
        res.json({ message: `Foydalanuvchi ${status === 'active' ? 'faollashtirildi' : 'bloklandi'}` });
    });
});

// Foydalanuvchini o'chirish (Admin only) - Aslida bu butunlay o'chirish, lekin UI da bloklash ishlatiladi
router.delete('/users/:id', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Ruxsat berilmagan' });
    }

    if (parseInt(req.params.id) === req.user.id) {
        return res.status(400).json({ message: 'O\'zingizni o\'chira olmaysiz' });
    }

    db.run('DELETE FROM users WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Foydalanuvchi bazadan o\'chirildi' });
    });
});

module.exports = router;
