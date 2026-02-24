/**
 * SMART PCH - Database Backup System
 * Ma'lumotlar bazasini avtomatik zaxiralash
 */
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'server', 'smart_pch.db');
const BACKUP_DIR = path.join(__dirname, '..', 'server', 'backups');

// Backup papkasini yaratish
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Ma'lumotlar bazasini zaxiralash
 */
function createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `smart_pch_backup_${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, backupName);

    try {
        if (!fs.existsSync(DB_PATH)) {
            console.warn('[Backup] DB fayl topilmadi:', DB_PATH);
            return null;
        }

        fs.copyFileSync(DB_PATH, backupPath);
        console.log(`[Backup] ✅ Zaxira yaratildi: ${backupName}`);

        // Eski backuplarni tozalash (7 kundan eski)
        cleanOldBackups(7);

        return backupPath;
    } catch (err) {
        console.error('[Backup] ❌ Xatolik:', err.message);
        return null;
    }
}

/**
 * Eski backuplarni tozalash
 * @param {number} daysToKeep - Necha kunlik backuplarni saqlash
 */
function cleanOldBackups(daysToKeep = 7) {
    try {
        const files = fs.readdirSync(BACKUP_DIR);
        const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

        files.forEach(file => {
            const filePath = path.join(BACKUP_DIR, file);
            const stats = fs.statSync(filePath);
            if (stats.mtimeMs < cutoff) {
                fs.unlinkSync(filePath);
                console.log(`[Backup] 🗑️ Eski zaxira o'chirildi: ${file}`);
            }
        });
    } catch (err) {
        console.error('[Backup] Cleanup error:', err.message);
    }
}

/**
 * Mavjud backuplar ro'yxati
 */
function listBackups() {
    try {
        if (!fs.existsSync(BACKUP_DIR)) return [];

        return fs.readdirSync(BACKUP_DIR)
            .filter(f => f.endsWith('.db'))
            .map(file => {
                const filePath = path.join(BACKUP_DIR, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    size: stats.size,
                    created: stats.birthtime,
                    sizeMB: (stats.size / (1024 * 1024)).toFixed(2) + ' MB'
                };
            })
            .sort((a, b) => b.created - a.created);
    } catch (err) {
        console.error('[Backup] List error:', err.message);
        return [];
    }
}

/**
 * Backupdan tiklash
 */
function restoreBackup(backupName) {
    const backupPath = path.join(BACKUP_DIR, backupName);

    if (!fs.existsSync(backupPath)) {
        throw new Error('Backup fayl topilmadi: ' + backupName);
    }

    try {
        // Avval joriy bazani zaxiralash
        const preRestoreBackup = `pre_restore_${new Date().toISOString().replace(/[:.]/g, '-')}.db`;
        if (fs.existsSync(DB_PATH)) {
            fs.copyFileSync(DB_PATH, path.join(BACKUP_DIR, preRestoreBackup));
        }

        // Tiklash
        fs.copyFileSync(backupPath, DB_PATH);
        console.log(`[Backup] ✅ Ma'lumotlar bazasi tiklandi: ${backupName}`);
        return true;
    } catch (err) {
        console.error('[Backup] ❌ Tiklash xatolik:', err.message);
        throw err;
    }
}

// Avtomatik backup — har 24 soatda
function startAutoBackup() {
    // Darhol birinchi backup
    createBackup();

    // Har 24 soatda
    setInterval(() => {
        createBackup();
    }, 24 * 60 * 60 * 1000);

    console.log('[Backup] 🔄 Avtomatik zaxiralash tizimi ishga tushdi (24 soatlik interval)');
}

module.exports = { createBackup, listBackups, restoreBackup, cleanOldBackups, startAutoBackup };
