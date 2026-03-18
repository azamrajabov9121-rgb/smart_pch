const express = require('express');
const router = express.Router();
const db = require('../db');

// Yangi murojaat yuborish
router.post('/', (req, res) => {
    const { employee_id, employee_name, employee_position, bolinma_id, murojaat_type, murojaat_text, signature_data, face_verified } = req.body;

    if (!employee_name || !murojaat_text) {
        return res.status(400).json({ message: 'Xodim va murojaat matni kiritilishi shart' });
    }

    db.run(
        `INSERT INTO murojaat (employee_id, employee_name, employee_position, bolinma_id, murojaat_type, murojaat_text, signature_data, face_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [employee_id, employee_name, employee_position, bolinma_id, murojaat_type, murojaat_text, signature_data, face_verified ? 1 : 0],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ id: this.lastID, message: 'Murojaat muvaffaqiyatli yuborildi!' });
        }
    );
});

// Barcha murojaatlarni olish (rahbar uchun)
router.get('/', (req, res) => {
    const { status, bolinma_id } = req.query;
    let query = 'SELECT * FROM murojaat';
    let conditions = [];
    let params = [];

    if (status) {
        conditions.push('status = ?');
        params.push(status);
    }
    if (bolinma_id) {
        conditions.push('bolinma_id = ?');
        params.push(bolinma_id);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// Bitta murojaatni olish
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM murojaat WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!row) return res.status(404).json({ message: 'Murojaat topilmadi' });
        res.json(row);
    });
});

// Murojaatni tasdiqlash (VIZA qo'yish)
router.patch('/:id/approve', (req, res) => {
    const { manager_name, manager_comment } = req.body;
    db.run(
        `UPDATE murojaat SET status = 'approved', manager_name = ?, manager_comment = ?, approved_date = datetime('now','localtime') WHERE id = ?`,
        [manager_name || 'Rahbar', manager_comment || '', req.params.id],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            if (this.changes === 0) return res.status(404).json({ message: 'Murojaat topilmadi' });
            res.json({ message: 'Murojaat tasdiqlandi (VIZA qo\'yildi)' });
        }
    );
});

// Murojaatni rad etish
router.patch('/:id/reject', (req, res) => {
    const { manager_name, manager_comment } = req.body;
    db.run(
        `UPDATE murojaat SET status = 'rejected', manager_name = ?, manager_comment = ?, approved_date = datetime('now','localtime') WHERE id = ?`,
        [manager_name || 'Rahbar', manager_comment || '', req.params.id],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            if (this.changes === 0) return res.status(404).json({ message: 'Murojaat topilmadi' });
            res.json({ message: 'Murojaat rad etildi' });
        }
    );
});

// Murojaatni o'chirish
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM murojaat WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Murojaat topilmadi' });
        res.json({ message: 'Murojaat o\'chirildi' });
    });
});

// Statistika
router.get('/stats/summary', (req, res) => {
    db.get(`
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
            SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM murojaat
    `, [], (err, row) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(row);
    });
});

module.exports = router;
