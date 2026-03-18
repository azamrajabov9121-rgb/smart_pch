const express = require('express');
const router = express.Router();
const db = require('../db');

// Yangi broadcast xabar yuborish (Admin only)
router.post('/', (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Faqat admin xabar yuborishi mumkin' });
    }

    const { title, message, priority, target } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({ message: 'Xabar matni bo\'sh bo\'lmasligi kerak' });
    }

    db.run(
        `INSERT INTO broadcast_messages (sender_id, sender_name, title, message, priority, target) VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.id, req.user.username, title || '', message.trim(), priority || 'normal', target || 'all'],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });

            const broadcastData = {
                id: this.lastID,
                sender_name: req.user.username,
                title: title || '',
                message: message.trim(),
                priority: priority || 'normal',
                target: target || 'all',
                created_at: new Date().toISOString()
            };

            // Socket.io orqali barcha foydalanuvchilarga yuborish
            const io = req.app.get('io');
            if (io) {
                io.emit('broadcast_message', broadcastData);
            }

            res.json({ message: 'Xabar yuborildi', id: this.lastID });
        }
    );
});

// Oxirgi broadcast xabarlarni olish
router.get('/', (req, res) => {
    const limit = parseInt(req.query.limit) || 20;

    db.all(
        'SELECT * FROM broadcast_messages ORDER BY created_at DESC LIMIT ?',
        [limit],
        (err, rows) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(rows || []);
        }
    );
});

// Broadcast xabarni o'chirish (Admin only)
router.delete('/:id', (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Ruxsat berilmagan' });
    }

    db.run('DELETE FROM broadcast_messages WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Xabar topilmadi' });
        res.json({ message: 'Xabar o\'chirildi' });
    });
});

module.exports = router;
