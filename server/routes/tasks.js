const express = require('express');
const router = express.Router();
const db = require('../db');

// Get tasks for bolinma
router.get('/:bolinma_id', (req, res) => {
    const { bolinma_id } = req.params;
    db.all('SELECT * FROM tasks WHERE bolinma_id = ?', [bolinma_id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

// Add task
router.post('/', (req, res) => {
    const { bolinma_id, user_id, title, deadline, status, is_urgent } = req.body;
    db.run(
        'INSERT INTO tasks (bolinma_id, user_id, title, deadline, status, is_urgent) VALUES (?, ?, ?, ?, ?, ?)',
        [bolinma_id, user_id, title, deadline, status || 'todo', is_urgent ? 1 : 0],
        function (err) {
            if (err) return res.status(500).json({ message: 'Insert failed' });
            res.json({ message: 'Task added', id: this.lastID });
        }
    );
});

// Update task status/content
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { status, title, deadline } = req.body;

    let query = 'UPDATE tasks SET status = ?';
    let params = [status];

    if (title) {
        query += ', title = ?';
        params.push(title);
    }
    if (deadline) {
        query += ', deadline = ?';
        params.push(deadline);
    }

    query += ' WHERE id = ?';
    params.push(id);

    db.run(query, params, function (err) {
        if (err) return res.status(500).json({ message: 'Update failed' });
        res.json({ message: 'Task updated' });
    });
});

// Delete task
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ message: 'Delete failed' });
        res.json({ message: 'Task deleted' });
    });
});

module.exports = router;
