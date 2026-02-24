const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/chat', async (req, res) => {
    const { message } = req.body;
    const lowerMsg = message.toLowerCase();

    try {
        if (lowerMsg.includes('xodim') || lowerMsg.includes('soni')) {
            db.get('SELECT COUNT(*) as count FROM employees', (err, row) => {
                if (err) return res.json({ response: "Xodimlar sonini aniqlashda xatolik." });
                res.json({ response: `Hozirgi vaqtda tizimda jami ${row.count} ta xodim ro'yxatdan o'tgan.` });
            });
        }
        else if (lowerMsg.includes('texnika') || lowerMsg.includes('mashina')) {
            db.all('SELECT status, COUNT(*) as count FROM vehicles GROUP BY status', (err, rows) => {
                if (err) return res.json({ response: "Texnikalar holatini aniqlashda xatolik." });
                const stats = rows.map(r => `${r.status === 'free' ? 'Bo\'sh' : (r.status === 'busy' ? 'Ishda' : 'Ta\'mirda')}: ${r.count}`).join(', ');
                res.json({ response: `Texnikalar holati: ${stats}.` });
            });
        }
        else if (lowerMsg.includes('kamchilik') || lowerMsg.includes('nuqson')) {
            db.get('SELECT COUNT(*) as count FROM defects WHERE status = "active"', (err, row) => {
                if (err) return res.json({ response: "Kamchiliklarni aniqlashda xatolik." });
                res.json({ response: `Harita bo'yicha jami ${row.count} ta bartaraf etilmagan kamchilik mavjud.` });
            });
        }
        else if (lowerMsg.includes('salom') || lowerMsg.includes('assalom')) {
            res.json({ response: "Vaalaykum assalom! Men Smart PCH sun'iy intellekt yordamchisiman. Sizga tizim ko'rsatkichlari bo'yicha ma'lumot bera olaman." });
        }
        else {
            res.json({ response: "Kechirasiz, hozircha faqat xodimlar, texnikalar va kamchiliklar bo'yicha ma'lumot bera olaman. Savolingizni aniqlashtiring." });
        }
    } catch (e) {
        res.status(500).json({ response: "Serverda xatolik yuz berdi." });
    }
});

module.exports = router;
