const express = require('express');
const router = express.Router();
const db = require('../db');

// Get M-29 acts for a department
router.get('/acts', (req, res) => {
    const { dept_id } = req.query;
    let query = 'SELECT * FROM material_acts';
    let params = [];

    if (dept_id && dept_id !== 'all') {
        query += ' WHERE dept_id = ?';
        params.push(dept_id);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// Create new M-29 act
router.post('/acts', (req, res) => {
    const {
        dept_id, date, station, bolinma_num, master, brigadier1, brigadier2,
        year, day_month, dept_name, location_start, km, pk, misc_loc,
        work_desc, method, materials_summary, items
    } = req.body;

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run(
            `INSERT INTO material_acts (
                dept_id, date, station, bolinma_num, master, brigadier1, brigadier2,
                year, day_month, dept_name, location_start, km, pk, misc_loc,
                work_desc, method, materials_summary, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [
                dept_id, date, station, bolinma_num, master, brigadier1, brigadier2,
                year, day_month, dept_name, location_start, km, pk, misc_loc,
                work_desc, method, materials_summary
            ],
            function (err) {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ message: err.message });
                }

                const actId = this.lastID;

                if (items && items.length > 0) {
                    const stmt = db.prepare('INSERT INTO act_items (act_id, item_name, qty, uom) VALUES (?, ?, ?, ?)');
                    items.forEach(item => {
                        stmt.run([actId, item.name, item.qty, item.uom]);
                    });
                    stmt.finalize();
                }

                db.run('COMMIT', (err) => {
                    if (err) return res.status(500).json({ message: err.message });
                    res.json({ id: actId, message: 'Material act created and pending approval' });
                });
            }
        );
    });
});

// Approve M-29 act (Accounting)
router.post('/acts/:id/approve', (req, res) => {
    const { id } = req.params;

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // 1. Get items to deduct from stock
        db.all('SELECT * FROM act_items WHERE act_id = ?', [id], (err, items) => {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ message: err.message });
            }

            // 2. Update stock for each item
            const updateStmt = db.prepare('UPDATE storage_items SET quantity = quantity - ? WHERE name = ?');
            items.forEach(item => {
                updateStmt.run([item.qty, item.item_name]);
            });
            updateStmt.finalize();

            // 3. Update act status
            db.run('UPDATE material_acts SET status = "approved" WHERE id = ?', [id], (err) => {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ message: err.message });
                }

                db.run('COMMIT', (err) => {
                    if (err) return res.status(500).json({ message: err.message });
                    res.json({ success: true, message: 'Act approved and stock updated' });
                });
            });
        });
    });
});

module.exports = router;
