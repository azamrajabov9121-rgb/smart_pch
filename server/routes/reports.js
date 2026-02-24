const express = require('express');
const router = express.Router();
const db = require('../db');

// Get reports for today
router.get('/today', (req, res) => {
    const today = new Date().toLocaleDateString();
    db.all('SELECT * FROM reports WHERE date = ?', [today], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

// Submit/Update report
router.post('/', (req, res) => {
    const { bolinma_id, content, user_id } = req.body;
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    // Check if report exists for today
    db.get('SELECT id FROM reports WHERE bolinma_id = ? AND date = ?', [bolinma_id, date], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (row) {
            // Update
            db.run(
                'UPDATE reports SET content = ?, time = ? WHERE id = ?',
                [content, time, row.id],
                function (err) {
                    if (err) return res.status(500).json({ message: 'Update failed' });
                    res.json({ message: 'Report updated', id: row.id });
                }
            );
        } else {
            // Insert
            db.run(
                'INSERT INTO reports (user_id, bolinma_id, content, date, time) VALUES (?, ?, ?, ?, ?)',
                [user_id, bolinma_id, content, date, time],
                function (err) {
                    if (err) return res.status(500).json({ message: 'Insert failed' });
                    res.json({ message: 'Report submitted', id: this.lastID });
                }
            );
        }
    });
});

// Get history
router.get('/history', (req, res) => {
    db.all('SELECT * FROM reports ORDER BY date DESC, time DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

module.exports = router;
