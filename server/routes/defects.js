const express = require('express');
const router = express.Router();
const db = require('../db');

// Get defects for bolinma
router.get('/:bolinma_id', (req, res) => {
    const { bolinma_id } = req.params;
    db.all('SELECT * FROM defects WHERE bolinma_id = ? AND status = "active"', [bolinma_id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

// Add defect
router.post('/', (req, res) => {
    const { bolinma_id, pk, issue } = req.body;
    const date = new Date().toLocaleDateString();
    db.run(
        'INSERT INTO defects (bolinma_id, pk, issue, date) VALUES (?, ?, ?, ?)',
        [bolinma_id, pk, issue, date],
        function (err) {
            if (err) return res.status(500).json({ message: 'Insert failed' });
            res.json({ message: 'Defect added', id: this.lastID });
        }
    );
});

// Mark as fixed (inactive)
router.put('/:id/fix', (req, res) => {
    const { id } = req.params;
    db.run('UPDATE defects SET status = "fixed" WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ message: 'Update failed' });
        res.json({ message: 'Defect marked as fixed' });
    });
});

module.exports = router;
