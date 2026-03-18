const jwt = require('jsonwebtoken');
const db = require('../db');
const JWT_SECRET = process.env.JWT_SECRET;

// Validate JWT_SECRET on startup
if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set!');
    console.error('Please set JWT_SECRET in your .env file');
    process.exit(1);
}

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Avtorizatsiya talab qilinadi' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        db.get('SELECT * FROM users WHERE id = ?', [decoded.id], (err, user) => {
            if (err || !user) {
                return res.status(401).json({ message: 'Foydalanuvchi topilmadi o\'chirilgan bo\'lishi mumkin' });
            }
            
            req.user = {
                id: user.id,
                username: user.username,
                role: user.role,
                departments: JSON.parse(user.departments || '[]'),
                bolinmalar: JSON.parse(user.bolinmalar || '[]'),
                employee_id: user.employee_id
            };
            
            // Helpful function for IDOR checks
            req.hasAccessToBolinma = (bId) => {
                if (req.user.role === 'admin') return true;
                if (!bId) return false;
                return req.user.bolinmalar.includes(bId);
            };

            req.hasAccessToDepartment = (dId) => {
                if (req.user.role === 'admin') return true;
                if (!dId) return false;
                return req.user.departments.includes(dId) || req.user.role === 'department';
            };

            next();
        });
    } catch (err) {
        res.status(401).json({ message: 'Token noto\'g\'ri yoki muddati o\'tgan' });
    }
};

module.exports = authMiddleware;
