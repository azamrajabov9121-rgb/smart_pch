const express = require('express');
const router = express.Router();
const db = require('../db');

// --- TNU-19 ---
router.get('/tnu19', (req, res) => {
    const { bolinma_id } = req.query;
    let query = 'SELECT t.*, e.full_name as employee_name FROM tnu19_records t JOIN employees e ON t.employee_id = e.id';
    let params = [];

    if (bolinma_id) {
        query += ' WHERE t.bolinma_id = ?';
        params.push(bolinma_id);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

router.post('/tnu19', (req, res) => {
    const { employee_id, bolinma_id, date, time, instruction_type, instructor_name, signature } = req.body;
    db.run(
        `INSERT INTO tnu19_records (employee_id, bolinma_id, date, time, instruction_type, instructor_name, signature) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [employee_id, bolinma_id, date, time, instruction_type, instructor_name, signature],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ id: this.lastID, message: 'TNU-19 record added' });
        }
    );
});

// --- TNU-20 ---
router.get('/tnu20', (req, res) => {
    const { bolinma_id } = req.query;
    let query = 'SELECT t.*, e.full_name as employee_name FROM tnu20_records t JOIN employees e ON t.employee_id = e.id';
    let params = [];

    if (bolinma_id) {
        query += ' WHERE t.bolinma_id = ?';
        params.push(bolinma_id);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

router.post('/tnu20', (req, res) => {
    const { employee_id, bolinma_id, date, next_test_date, certificate_no, result, signature } = req.body;
    db.run(
        `INSERT INTO tnu20_records (employee_id, bolinma_id, date, next_test_date, certificate_no, result, signature) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [employee_id, bolinma_id, date, next_test_date, certificate_no, result, signature],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ id: this.lastID, message: 'TNU-20 record added' });
        }
    );
});

router.delete('/tnu19/:id', (req, res) => {
    db.run('DELETE FROM tnu19_records WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'TNU-19 record deleted' });
    });
});

router.delete('/tnu20/:id', (req, res) => {
    db.run('DELETE FROM tnu20_records WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'TNU-20 record deleted' });
    });
});

module.exports = router;
