const db = require('../db');

/**
 * Audit Log Middleware
 * Muhim API amaliyotlarini (POST, PUT, DELETE) kuzatadi
 */
function auditLog(action, entity) {
    return (req, res, next) => {
        // Javob yuborilgandan keyin log yozish
        const originalJson = res.json.bind(res);
        res.json = function (data) {
            // Faqat muvaffaqiyatli amaliyotlarni loglash
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const logEntry = {
                    user_id: req.user?.id || null,
                    username: req.user?.username || 'anonymous',
                    action: action || req.method,
                    entity: entity || req.baseUrl,
                    entity_id: req.params?.id || data?.id || null,
                    details: JSON.stringify({
                        method: req.method,
                        url: req.originalUrl,
                        body: sanitizeBody(req.body),
                        response_message: data?.message || null
                    }),
                    ip_address: req.ip || req.connection?.remoteAddress
                };

                db.run(
                    `INSERT INTO audit_logs (user_id, username, action, entity, entity_id, details, ip_address)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [logEntry.user_id, logEntry.username, logEntry.action, logEntry.entity,
                    logEntry.entity_id, logEntry.details, logEntry.ip_address],
                    (err) => {
                        if (err) console.error('Audit log error:', err.message);
                    }
                );
            }
            return originalJson(data);
        };
        next();
    };
}

/**
 * Parol va maxfiy ma'lumotlarni logdan olib tashlash
 */
function sanitizeBody(body) {
    if (!body) return {};
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'currentPassword', 'newPassword', 'token', 'face_template'];
    sensitiveFields.forEach(field => {
        if (sanitized[field]) sanitized[field] = '***HIDDEN***';
    });
    return sanitized;
}

/**
 * Audit loglarni olish (Admin API)
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('./auth');

// So'nggi loglar
router.get('/logs', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Ruxsat berilmagan' });
    }

    const { limit = 100, offset = 0, username, action, entity } = req.query;
    let query = 'SELECT * FROM audit_logs';
    let conditions = [];
    let params = [];

    if (username) {
        conditions.push('username = ?');
        params.push(username);
    }
    if (action) {
        conditions.push('action = ?');
        params.push(action);
    }
    if (entity) {
        conditions.push('entity LIKE ?');
        params.push(`%${entity}%`);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// Log statistikasi
router.get('/stats', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Ruxsat berilmagan' });
    }

    db.all(`
        SELECT 
            username,
            action,
            COUNT(*) as count,
            MAX(created_at) as last_activity
        FROM audit_logs
        WHERE created_at > datetime('now', '-7 days')
        GROUP BY username, action
        ORDER BY count DESC
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

module.exports = { auditLog, router };
