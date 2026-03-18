const express = require('express');
const router = express.Router();
const db = require('../db');

// --- ELECTRICITY ---

// Get electricity data for a subunit
router.get('/electricity/:bolinmaId', (req, res) => {
    const { bolinmaId } = req.params;
    db.get('SELECT * FROM metrology_electricity WHERE bolinma_id = ? ORDER BY id DESC LIMIT 1', [bolinmaId], (err, row) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        res.json(row || { lastReading: 0, currentMonth: 0 });
    });
});

// Update electricity reading
router.post('/electricity', (req, res) => {
    const { bolinmaId, lastReading, currentMonth } = req.body;
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    db.run(`INSERT INTO metrology_electricity (bolinma_id, lastReading, currentMonth, date) 
            VALUES (?, ?, ?, ?) 
            ON CONFLICT(bolinma_id, date) DO UPDATE SET lastReading=excluded.lastReading, currentMonth=excluded.currentMonth`,
        [bolinmaId, lastReading, currentMonth, date], (err) => {
            if (err) return res.status(500).json({ message: 'Save error', error: err.message });
            res.json({ message: 'Electricity saved' });
        });
});

// --- DEVICES ---

// Get devices list
router.get('/devices', (req, res) => {
    const bolinmaId = req.query.bolinma_id;
    let query = 'SELECT * FROM metrology_devices';
    let params = [];

    if (bolinmaId && bolinmaId !== 'admin') {
        query += ' WHERE bolinma_id = ?';
        params.push(bolinmaId);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        res.json(rows);
    });
});

// Add device record
router.post('/devices', (req, res) => {
    const { bolinma_id, name, serial, stampDate } = req.body;
    db.run('INSERT INTO metrology_devices (bolinma_id, name, serial, stampDate) VALUES (?, ?, ?, ?)',
        [bolinma_id, name, serial, stampDate], function (err) {
            if (err) return res.status(500).json({ message: 'Save error' });
            res.json({ message: 'Device added', id: this.lastID });
        });
});

// Delete device
router.delete('/devices/:id', (req, res) => {
    db.run('DELETE FROM metrology_devices WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: 'Delete error' });
        res.json({ message: 'Device deleted' });
    });
});

module.exports = router;
