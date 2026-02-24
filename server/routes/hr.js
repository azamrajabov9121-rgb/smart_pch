const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all employees (with optional filters)
router.get('/employees', (req, res) => {
    const { bolinma_id, department_id, status, search } = req.query;
    let query = 'SELECT * FROM employees';
    let conditions = [];
    let params = [];

    if (bolinma_id) {
        conditions.push('bolinma_id = ?');
        params.push(bolinma_id);
    }
    if (department_id) {
        conditions.push('department_id = ?');
        params.push(department_id);
    }
    if (status) {
        conditions.push('status = ?');
        params.push(status);
    }
    if (search) {
        conditions.push('full_name LIKE ?');
        params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY full_name ASC';

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// Add employee
router.post('/employees', (req, res) => {
    const { full_name, department_id, bolinma_id, position, rank, birth_date, phone, hired_date, medical_checkup_date, last_training_date, status } = req.body;
    db.run(
        `INSERT INTO employees (full_name, department_id, bolinma_id, position, rank, birth_date, phone, hired_date, medical_checkup_date, last_training_date, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [full_name, department_id, bolinma_id, position, rank, birth_date, phone, hired_date, medical_checkup_date, last_training_date, status || 'active'],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ id: this.lastID, message: 'Employee added successfully' });
        }
    );
});

// Update employee
router.put('/employees/:id', (req, res) => {
    const { full_name, department_id, bolinma_id, position, rank, birth_date, phone, hired_date, medical_checkup_date, last_training_date, status, tabel_number, face_template } = req.body;
    db.run(
        `UPDATE employees SET full_name=?, department_id=?, bolinma_id=?, position=?, rank=?, birth_date=?, phone=?, hired_date=?, medical_checkup_date=?, last_training_date=?, status=?, tabel_number=?, face_template=? 
         WHERE id = ?`,
        [full_name, department_id, bolinma_id, position, rank, birth_date, phone, hired_date, medical_checkup_date, last_training_date, status, tabel_number, face_template, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: 'Employee updated successfully' });
        }
    );
});

// Update Face ID template (Automatic on first scan)
router.patch('/employees/:id/face', (req, res) => {
    const { face_template } = req.body;
    db.run(
        `UPDATE employees SET face_template = ? WHERE id = ?`,
        [face_template, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: 'Face ID template updated' });
        }
    );
});

// Delete employee
router.delete('/employees/:id', (req, res) => {
    db.run('DELETE FROM employees WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Xodim topilmadi' });
        res.json({ message: 'Xodim muvaffaqiyatli o\'chirildi' });
    });
});

// Update vacation dates
router.patch('/employees/:id/vacation', (req, res) => {
    const { vacation_start_date, vacation_end_date } = req.body;
    db.run(
        'UPDATE employees SET vacation_start_date = ?, vacation_end_date = ? WHERE id = ?',
        [vacation_start_date, vacation_end_date, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: 'Ta\'til ma\'lumotlari yangilandi' });
        }
    );
});

// Get employee statistics
router.get('/stats', (req, res) => {
    db.get(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN status = 'vacation' THEN 1 ELSE 0 END) as on_vacation,
            SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
        FROM employees
    `, [], (err, row) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(row);
    });
});

// Bulk import from E-Xodim
router.post('/import-exodim', (req, res) => {
    const { employees, clearFirst } = req.body;
    if (!employees || !Array.isArray(employees)) {
        return res.status(400).json({ message: 'Invalid data format' });
    }

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        if (clearFirst) {
            db.run('DELETE FROM employees');
        }

        const stmt = db.prepare(`
            INSERT INTO employees (
                full_name, position, department_id, bolinma_id, 
                phone, birth_date, hired_date, status, tabel_number,
                medical_checkup_date, vacation_start_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        employees.forEach(emp => {
            stmt.run([
                emp.name || emp.full_name,
                emp.position || 'Xodim',
                emp.department || emp.department_id,
                emp.department || emp.bolinma_id,
                emp.phone || '',
                emp.birthday || emp.birth_date,
                emp.hireDate || emp.hire_date || emp.hired_date,
                emp.status || 'active',
                emp.tabelNumber || emp.tabel_number || '',
                emp.medicalDate || emp.medical_checkup_date || '',
                emp.vacationStart || emp.vacation_start_date || ''
            ]);
        });

        stmt.finalize((err) => {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ message: err.message });
            }
            db.run('COMMIT', (err) => {
                if (err) return res.status(500).json({ message: err.message });
                res.json({ message: `${employees.length} employees imported successfully` });
            });
        });
    });
});

module.exports = router;
