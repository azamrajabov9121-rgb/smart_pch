const express = require('express');
const router = express.Router();
const db = require('../db');

// Get timesheet for a specific month and year
router.get('/:year/:month', (req, res) => {
    const { year, month } = req.params;
    const departmentId = req.query.departmentId;

    let query = 'SELECT * FROM timesheet WHERE year = ? AND month = ?';
    let params = [year, month];

    // If departmentId is provided, we might need to filter by employees in that department
    // But for simplicity, we can fetch all and let frontend handle filter, 
    // or join with employees table.

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });

        // Convert rows to a key-value object { "empId_day": hours } for easy frontend use
        const data = {};
        rows.forEach(row => {
            data[`${row.employee_id}_${row.day}`] = row.hours;
        });

        res.json(data);
    });
});

// Update single cell or bulk update
router.post('/save', (req, res) => {
    const { year, month, data } = req.body;
    // data is { "empId_day": hours }

    if (!data || typeof data !== 'object') {
        return res.status(400).json({ message: 'Invalid data format' });
    }

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const stmt = db.prepare(`
            INSERT INTO timesheet (employee_id, year, month, day, hours, status)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(employee_id, year, month, day) DO UPDATE SET
            hours = excluded.hours,
            status = excluded.status
        `);

        Object.keys(data).forEach(key => {
            const [empId, day] = key.split('_');
            const hours = data[key];
            stmt.run([empId, year, month, day, hours, 'manual']);
        });

        stmt.finalize((err) => {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ message: err.message });
            }
            db.run('COMMIT', (err) => {
                if (err) return res.status(500).json({ message: err.message });
                res.json({ message: 'Tabel muvaffaqiyatli saqlandi' });
            });
        });
    });
});

// Face ID record (Automatic entry)
router.post('/attendance', (req, res) => {
    const { employee_id, hours = 8 } = req.body;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const day = now.getDate();

    db.run(`
        INSERT INTO timesheet (employee_id, year, month, day, hours, status)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(employee_id, year, month, day) DO UPDATE SET
        hours = excluded.hours,
        status = 'face_id'
    `, [employee_id, year, month, day, hours, 'face_id'], function (err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Face ID davomat qayd etildi', employee_id, day });
    });
});

module.exports = router;
