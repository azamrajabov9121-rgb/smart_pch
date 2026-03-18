const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Get list of predefined tools for a specific department (bolinma)
 */
router.get('/tools/:bolinma_id', (req, res) => {
    const { bolinma_id } = req.params;
    db.all('SELECT * FROM department_tools WHERE bolinma_id = ?', [bolinma_id], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

/**
 * Add a new tool to a department's inventory
 */
router.post('/tools', (req, res) => {
    const { bolinma_id, tool_name, tool_number } = req.body;
    if (!bolinma_id || !tool_name) {
        return res.status(400).json({ message: 'Bolinma ID va asbob nomi shart!' });
    }

    db.run(
        'INSERT INTO department_tools (bolinma_id, tool_name, tool_number) VALUES (?, ?, ?)',
        [bolinma_id, tool_name, tool_number || ''],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ id: this.lastID, message: 'Asbob muvaffaqiyatli saqlandi' });
        }
    );
});

/**
 * Delete a tool from inventory
 */
router.delete('/tools/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM department_tools WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ success: true, message: 'Asbob o\'chirildi' });
    });
});

/**
 * Get all PU-80 records for a specific dept/bolinma
 */
router.get('/records/:dept_id', (req, res) => {
    const { dept_id } = req.params;
    db.all(
        'SELECT * FROM pu80_records WHERE dept_id = ? ORDER BY taken_time DESC',
        [dept_id],
        (err, rows) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(rows);
        }
    );
});

/**
 * Add a new checkout record
 */
router.post('/records', (req, res) => {
    const { deptId, toolName, toolNumber, responsible, takenTime, status, verificationType, faceTake, signTake } = req.body;
    db.run(
        `INSERT INTO pu80_records 
         (dept_id, tool_name, tool_number, responsible, taken_time, status, verification_type, face_take, sign_take)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [deptId, toolName, toolNumber, responsible, takenTime || new Date().toISOString(), status || 'active', verificationType, faceTake, signTake],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ id: this.lastID, message: 'Muvaffaqiyatli saqlandi' });
        }
    );
});

/**
 * Update an existing record (return tool)
 */
router.patch('/records/:id/return', (req, res) => {
    const { id } = req.params;
    const { returnTime, status, faceReturn, signReturn } = req.body;
    db.run(
        `UPDATE pu80_records 
         SET return_time = ?, status = ?, face_return = ?, sign_return = ? 
         WHERE id = ?`,
        [returnTime || new Date().toISOString(), status || 'returned', faceReturn, signReturn, id],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ success: true, message: 'Topshirildi' });
        }
    );
});

module.exports = router;
