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

module.exports = router;
