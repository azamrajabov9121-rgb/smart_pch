const express = require('express');
const router = express.Router();
const db = require('../db');

// Get timesheet for a specific month and year
router.get('/:year/:month', (req, res) => {
    const { year, month } = req.params;
    const bolinma_id = req.query.bolinmaId || '';

    if (bolinma_id && !req.hasAccessToBolinma(bolinma_id) && 
        !req.hasAccessToDepartment('xodimlar') && 
        !req.hasAccessToDepartment('iqtisod') && 
        !req.hasAccessToDepartment('rahbar')) {
        return res.status(403).json({ message: "Sizga ruxsat yo'q" });
    }

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

// Get signatures for a specific month and bolinma
router.get('/signatures/:year/:month/:bolinmaId', (req, res) => {
    const { year, month, bolinmaId } = req.params;

    if (!req.hasAccessToBolinma(bolinmaId) && 
        !req.hasAccessToDepartment('xodimlar') && 
        !req.hasAccessToDepartment('iqtisod') && 
        !req.hasAccessToDepartment('rahbar')) {
        return res.status(403).json({ message: "Ruxsat yo'q" });
    }

    db.get('SELECT * FROM timesheet_signatures WHERE year = ? AND month = ? AND bolinma_id = ?', [year, month, bolinmaId], (err, row) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(row || {});
    });
});

// Sign timesheet
router.post('/sign', (req, res) => {
    const { year, month, bolinmaId, role, userId, userName } = req.body;
    // role: 'tuzuvchi', 'xodimlar', 'iqtisod', 'rahbar' (need to support all these strings)

    const validRoles = ['tuzuvchi', 'xodimlar', 'iqtisod', 'rahbar'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role for signing' });
    }

    if (role === 'tuzuvchi' && !req.hasAccessToBolinma(bolinmaId)) {
        return res.status(403).json({ message: "Siz bu bo'linmaga tegishli emassiz" });
    }
    
    if (role !== 'tuzuvchi' && !req.hasAccessToDepartment(role)) {
        return res.status(403).json({ message: 'Ruxsat etilmagan imzo huquqi' });
    }

    const fieldPrefix = role === 'tuzuvchi' ? 'tuzuvchi' : 'tekshiruvchi';
    const hash = Math.random().toString(36).substring(2, 10).toUpperCase() + (role === 'tekshiruvchi' ? '-HR' : userId);

    const query = `
        INSERT INTO timesheet_signatures (year, month, bolinma_id, ${fieldPrefix}_uid, ${fieldPrefix}_name, ${fieldPrefix}_at, ${fieldPrefix}_hash)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
        ON CONFLICT(year, month, bolinma_id) DO UPDATE SET
        ${fieldPrefix}_uid = excluded.${fieldPrefix}_uid,
        ${fieldPrefix}_name = excluded.${fieldPrefix}_name,
        ${fieldPrefix}_at = excluded.${fieldPrefix}_at,
        ${fieldPrefix}_hash = excluded.${fieldPrefix}_hash
    `;

    db.run(query, [year, month, bolinmaId, userId, userName, hash], function (err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Tabel imzolandi', role, hash });
    });
});

// Update single cell or bulk update
router.post('/save', (req, res) => {
    const { year, month, data, bolinmaId } = req.body;
    // data is { "empId_day": hours }

    if (!data || typeof data !== 'object') {
        return res.status(400).json({ message: 'Invalid data format' });
    }

    if (bolinmaId && !req.hasAccessToBolinma(bolinmaId)) {
        return res.status(403).json({ message: "Sizga ruxsat yo'q" });
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
