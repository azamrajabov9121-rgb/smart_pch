const express = require('express');
const router = express.Router();
const db = require('../db');

// --- Vehicles ---

// Get all vehicles
router.get('/vehicles', (req, res) => {
    const { bolinma_id } = req.query;
    let query = 'SELECT * FROM vehicles';
    let params = [];
    if (bolinma_id) {
        query += ' WHERE bolinma_id = ?';
        params.push(bolinma_id);
    }
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// Add vehicle
router.post('/vehicles', (req, res) => {
    const { name, number, garage_number, fuel_type, fuel_norm, start_fuel, start_speedometer, bolinma_id } = req.body;
    db.run(
        `INSERT INTO vehicles (name, number, garage_number, fuel_type, fuel_norm, start_fuel, start_speedometer, bolinma_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, number, garage_number, fuel_type, fuel_norm, start_fuel, start_speedometer, bolinma_id],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ id: this.lastID, message: 'Vehicle added successfully' });
        }
    );
});

// Update vehicle status
router.put('/vehicles/:id/status', (req, res) => {
    const { status } = req.body;
    db.run('UPDATE vehicles SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Vehicle status updated' });
    });
});

// Delete vehicle
router.delete('/vehicles/:id', (req, res) => {
    db.run('DELETE FROM vehicles WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Vehicle deleted' });
    });
});

// --- Waybills ---

// Get waybills
router.get('/waybills', (req, res) => {
    const query = `
        SELECT w.*, v.name as vehicle_name, v.number as vehicle_number, e.full_name as driver_name 
        FROM waybills w
        JOIN vehicles v ON w.vehicle_id = v.id
        JOIN employees e ON w.driver_id = e.id
        ORDER BY w.date DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// Save waybill
router.post('/waybills', (req, res) => {
    const { vehicle_id, driver_id, start_time, end_time, start_km, end_km, fuel_filled, fuel_end, date } = req.body;
    db.run(
        `INSERT INTO waybills (vehicle_id, driver_id, start_time, end_time, start_km, end_km, fuel_filled, fuel_end, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [vehicle_id, driver_id, start_time, end_time, start_km, end_km, fuel_filled, fuel_end, date],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            // Update vehicle stats as well
            db.run('UPDATE vehicles SET start_speedometer = ?, start_fuel = ? WHERE id = ?', [end_km, fuel_end, vehicle_id]);
            res.json({ id: this.lastID, message: 'Waybill saved successfully' });
        }
    );
});

// --- Repair Logs ---

// Get all repair logs
router.get('/repairs', (req, res) => {
    const { vehicle_id } = req.query;
    let query = 'SELECT r.*, v.name as vehicle_name FROM repair_logs r JOIN vehicles v ON r.vehicle_id = v.id';
    let params = [];
    if (vehicle_id) {
        query += ' WHERE r.vehicle_id = ?';
        params.push(vehicle_id);
    }
    query += ' ORDER BY r.date DESC';
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// Add repair log
router.post('/repairs', (req, res) => {
    const { vehicle_id, date, description, parts_replaced, total_cost, mechanic_name, status } = req.body;
    db.run(
        `INSERT INTO repair_logs (vehicle_id, date, description, parts_replaced, total_cost, mechanic_name, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [vehicle_id, date, description, parts_replaced, total_cost, mechanic_name, status || 'completed'],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ id: this.lastID, message: 'Repair log added' });
        }
    );
});

// Delete repair log
router.delete('/repairs/:id', (req, res) => {
    db.run('DELETE FROM repair_logs WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Repair log deleted' });
    });
});

// --- Spare Parts ---

// Get all parts
router.get('/parts', (req, res) => {
    db.all('SELECT * FROM mechanic_parts', [], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// Update part quantity
router.patch('/parts/:id', (req, res) => {
    const { quantity } = req.body;
    db.run('UPDATE mechanic_parts SET quantity = ? WHERE id = ?', [quantity, req.params.id], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Part quantity updated' });
    });
});

// Add new part
router.post('/parts', (req, res) => {
    const { name, part_number, quantity, unit, min_limit, price } = req.body;
    db.run(
        'INSERT INTO mechanic_parts (name, part_number, quantity, unit, min_limit, price) VALUES (?, ?, ?, ?, ?, ?)',
        [name, part_number, quantity, unit, min_limit, price],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ id: this.lastID, message: 'Part added' });
        }
    );
});

// Delete part
router.delete('/parts/:id', (req, res) => {
    db.run('DELETE FROM mechanic_parts WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Part deleted' });
    });
});

// --- Technical Maintenance (TO) ---

// Get all maintenance records
router.get('/maintenance', (req, res) => {
    const { to_type } = req.query;
    let query = 'SELECT m.*, v.name as vehicle_name, v.number as vehicle_number FROM technical_maintenance m JOIN vehicles v ON m.vehicle_id = v.id';
    let params = [];
    if (to_type) {
        query += ' WHERE m.to_type = ?';
        params.push(to_type);
    }
    query += ' ORDER BY m.date DESC';
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// Add maintenance record
router.post('/maintenance', (req, res) => {
    const { vehicle_id, to_type, date, inspector, notes, status } = req.body;
    db.run(
        `INSERT INTO technical_maintenance (vehicle_id, to_type, date, inspector, notes, status, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [vehicle_id, to_type, date, inspector, notes, status || 'completed', new Date().toISOString()],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ id: this.lastID, message: 'Maintenance record added successfully' });
        }
    );
});

// Update maintenance status
router.patch('/maintenance/:id', (req, res) => {
    const { status } = req.body;
    db.run('UPDATE technical_maintenance SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Status updated' });
    });
});

// Delete maintenance record
router.delete('/maintenance/:id', (req, res) => {
    db.run('DELETE FROM technical_maintenance WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Record deleted' });
    });
});

// --- Vehicle Orders ---

// Get all orders
router.get('/orders', (req, res) => {
    db.all('SELECT * FROM vehicle_orders ORDER BY date DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// Add order
router.post('/orders', (req, res) => {
    const { vehicle_id, vehicle_name, task, dept_name, date } = req.body;
    db.run(
        `INSERT INTO vehicle_orders (vehicle_id, vehicle_name, task, dept_name, date) VALUES (?, ?, ?, ?, ?)`,
        [vehicle_id, vehicle_name, task, dept_name, date],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ id: this.lastID, message: 'Order created' });
        }
    );
});

// Update order status
router.patch('/orders/:id', (req, res) => {
    const { status } = req.body;
    db.run('UPDATE vehicle_orders SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Order status updated' });
    });
});

// Delete order
router.delete('/orders/:id', (req, res) => {
    db.run('DELETE FROM vehicle_orders WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Order deleted' });
    });
});

module.exports = router;
