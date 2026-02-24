const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// Fayl saqlash konfiguratsiyasi
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dept = req.body.department || 'general';
        const deptDir = path.join(uploadsDir, dept);
        if (!fs.existsSync(deptDir)) {
            fs.mkdirSync(deptDir, { recursive: true });
        }
        cb(null, deptDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/\s+/g, '_');
        const uniqueName = `${name}_${Date.now()}${ext}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

// Faylni saqlash (Helper)
function saveFileInfo(fileData) {
    return new Promise((resolve, reject) => {
        const { filename, originalname, path, size, mimetype, department, user_id, bolinma_id, module } = fileData;
        db.run(
            `INSERT INTO files (filename, original_name, file_path, file_type, file_size, module, bolinma_id, uploaded_by, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [filename, originalname, path, mimetype, size, module || department, bolinma_id || department, user_id],
            function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

// Bitta fayl yuklash
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Fayl tanlanmagan' });

    try {
        const fileId = await saveFileInfo({
            ...req.file,
            department: req.body.department,
            user_id: req.user.id,
            bolinma_id: req.user.bolinmalar ? JSON.parse(req.user.bolinmalar)[0] : null,
            module: req.body.module
        });

        res.json({ message: 'Fayl yuklandi va tasdiqlash uchun yuborildi', fileId });
    } catch (err) {
        res.status(500).json({ message: 'Bazaga yozishda xatolik: ' + err.message });
    }
});

// Tasdiqlashni kutayotgan fayllar
router.get('/pending', authMiddleware, (req, res) => {
    // Faqat admin yoki bo'lim boshliqlari ko'ra oladi
    const query = req.user.role === 'admin'
        ? "SELECT f.*, u.username as uploader FROM files f LEFT JOIN users u ON f.uploaded_by = u.id WHERE f.status = 'pending'"
        : "SELECT f.*, u.username as uploader FROM files f LEFT JOIN users u ON f.uploaded_by = u.id WHERE f.status = 'pending' AND f.bolinma_id = ?";

    const params = req.user.role === 'admin' ? [] : [req.user.bolinmalar ? JSON.parse(req.user.bolinmalar)[0] : null];

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// Tasdiqlash yoki rad etish
router.patch('/approve/:id', authMiddleware, (req, res) => {
    const { status } = req.body; // 'approved' yoki 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Noto\'g\'ri status' });
    }

    db.run(
        `UPDATE files SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [status, req.user.id, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            if (this.changes === 0) return res.status(404).json({ message: 'Fayl topilmadi' });
            res.json({ message: `Fayl ${status === 'approved' ? 'tasdiqlandi' : 'rad etildi'}` });
        }
    );
});

// Bo'lim bo'yicha tasdiqlangan fayllar
router.get('/list/:bolinma_id', authMiddleware, (req, res) => {
    db.all(
        "SELECT * FROM files WHERE bolinma_id = ? AND status = 'approved' ORDER BY created_at DESC",
        [req.params.bolinma_id],
        (err, rows) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(rows);
        }
    );
});

module.exports = router;

