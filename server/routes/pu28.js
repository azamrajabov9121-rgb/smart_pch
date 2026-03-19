const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all records (for admin/department) or specific bolinma
router.get('/:bolinma_id', (req, res) => {
    const { bolinma_id } = req.params;

    // IDOR Protection and department check
    if (bolinma_id !== 'all' && bolinma_id !== 'ishlab-chiqarish' && bolinma_id !== 'unknown') {
        if (!req.hasAccessToBolinma(bolinma_id) && !req.hasAccessToDepartment('ishlab-chiqarish')) {
            return res.status(403).json({ message: "Sizda bu bo'linma ma'lumotlarini ko'rish huquqi yo'q!" });
        }
    } else {
        if (!req.hasAccessToDepartment('ishlab-chiqarish') && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Sizda barcha bo'linmalar ma'lumotlarini ko'rish huquqi yo'q!" });
        }
    }

    let query = 'SELECT * FROM pu28_records';
    let params = [];

    if (bolinma_id !== 'all' && bolinma_id !== 'ishlab-chiqarish' && bolinma_id !== 'unknown') {
        query += ' WHERE bolinma_id = ?';
        params.push(bolinma_id);
    }

    query += ' ORDER BY id DESC';

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('PU-28 error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(rows);
    });
});

// 🔥 ADD RECORD + REALTIME
router.post('/', (req, res) => {
    console.log('PU-28 POST body:', req.body);

    const { bolinma_id, date, check_method, km, pk, zv, defect_desc } = req.body;

    if (!req.hasAccessToBolinma(bolinma_id)) {
        return res.status(403).json({ message: "Siz faqat o'z bo'linmangiz uchun ma'lumot kirita olasiz!" });
    }

    db.run(
        'INSERT INTO pu28_records (bolinma_id, date, check_method, km, pk, zv, defect_desc) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [bolinma_id, date || new Date().toISOString(), check_method, km, pk, zv, defect_desc],
        function (err) {
            if (err) {
                console.error('PU-28 add error:', err);
                return res.status(500).json({ message: 'Insert failed', error: err.message });
            }

            console.log('PU-28 Record added with ID:', this.lastID);

            // 🔥 ВОТ ЭТО ГЛАВНОЕ (REALTIME)
            const io = req.app.get('io');

            const newRecord = {
                id: this.lastID,
                bolinma_id,
                date,
                check_method,
                km,
                pk,
                zv,
                defect_desc
            };

            io.emit('new_report', newRecord);

            res.json({ message: 'Success', id: this.lastID });
        }
    );
});

// Resolve defect
router.put('/:id/resolve', (req, res) => {
    const { id } = req.params;

    db.get('SELECT bolinma_id FROM pu28_records WHERE id = ?', [id], (err, row) => {
        if (err || !row) return res.status(404).json({ message: 'Topilmadi' });

        if (!req.hasAccessToBolinma(row.bolinma_id) && !req.hasAccessToDepartment('ishlab-chiqarish')) {
            return res.status(403).json({ message: "Bunga ruxsat yo'q" });
        }

        const dateResolved = new Date().toISOString();

        db.run(
            'UPDATE pu28_records SET resolved_status = "resolved", date_resolved = ? WHERE id = ?',
            [dateResolved, id],
            function (err) {
                if (err) return res.status(500).json({ message: 'Update failed' });

                // 🔥 REALTIME обновление
                const io = req.app.get('io');
                io.emit('update_report', { id, status: 'resolved' });

                res.json({ message: 'Resolved' });
            }
        );
    });
});

// Delete record
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    if (req.user.role !== 'admin' && !req.hasAccessToDepartment('ishlab-chiqarish')) {
        return res.status(403).json({ message: "O'chirish faqat ruxsat etilgan bo'limlar roliga xos" });
    }

    db.run('DELETE FROM pu28_records WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ message: 'Delete failed' });

        // 🔥 REALTIME удаление
        const io = req.app.get('io');
        io.emit('delete_report', { id });

        res.json({ message: 'Deleted' });
    });
});

module.exports = router;