const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// Get reports for today
router.get('/today', authMiddleware, (req, res) => {
    const today = new Date().toLocaleDateString();
    db.all('SELECT * FROM reports WHERE date = ?', [today], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

// Submit/Update report (Strictly for 'bolinma' role)
router.post('/', authMiddleware, (req, res) => {
    const { bolinma_id, content, structuredData, user_id } = req.body;

    // Check if user has 'bolinma' role
    if (req.user.role !== 'bolinma') {
        return res.status(403).json({ message: 'Faqat bo‘linma xodimlari hisobot yubora oladi.' });
    }

    // Optional: Check if the user is assigned to this bolinma_id
    if (req.user.bolinmalar && !req.user.bolinmalar.includes(bolinma_id)) {
        return res.status(403).json({ message: 'Ushbu bo‘linma uchun hisobot yuborish huquqingiz yo‘q.' });
    }

    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    const sData = structuredData ? JSON.stringify(structuredData) : null;

    // Check if report exists for today
    db.get('SELECT id FROM reports WHERE bolinma_id = ? AND date = ?', [bolinma_id, date], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (row) {
            // Update
            db.run(
                'UPDATE reports SET content = ?, time = ?, structuredData = ? WHERE id = ?',
                [content, time, sData, row.id],
                function (err) {
                    if (err) return res.status(500).json({ message: 'Update failed' });
                    res.json({ message: 'Report updated', id: row.id });
                }
            );
        } else {
            // Insert
            db.run(
                'INSERT INTO reports (user_id, bolinma_id, content, date, time, structuredData) VALUES (?, ?, ?, ?, ?, ?)',
                [user_id, bolinma_id, content, date, time, sData],
                function (err) {
                    if (err) return res.status(500).json({ message: 'Insert failed', error: err.message });
                    res.json({ message: 'Report submitted', id: this.lastID });
                }
            );
        }
    });
});

// Get history
router.get('/history', authMiddleware, (req, res) => {
    db.all('SELECT * FROM reports ORDER BY date DESC, time DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

module.exports = router;
