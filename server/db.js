const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Production (Render.com) uchun DB_PATH env dan olinadi
// Development uchun server/ papkasidagi fayl ishlatiladi
const dbPath = process.env.DB_PATH || path.join(__dirname, 'smart_pch.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            full_name TEXT,
            departments TEXT, -- JSON array
            bolinmalar TEXT  -- JSON array
        )`);

        // Reports table
        db.run(`CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            bolinma_id TEXT,
            content TEXT,
            date TEXT,
            time TEXT,
            status TEXT DEFAULT 'received',
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // Tasks (Kanban) table
        db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            bolinma_id TEXT,
            title TEXT,
            deadline TEXT,
            status TEXT, -- 'todo', 'progress', 'done'
            is_urgent INTEGER DEFAULT 0,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // Map Defects table
        db.run(`CREATE TABLE IF NOT EXISTS defects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bolinma_id TEXT,
            pk INTEGER,
            issue TEXT,
            date TEXT,
            status TEXT DEFAULT 'active'
        )`);

        // Key-Value Storage table for flexible usage
        db.run(`CREATE TABLE IF NOT EXISTS kv_storage (
            key TEXT PRIMARY KEY,
            value TEXT
        )`);

        // Employees table (Core HR)
        db.run(`CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            department_id TEXT,
            bolinma_id TEXT,
            position TEXT,
            rank TEXT,
            birth_date TEXT,
            phone TEXT,
            hired_date TEXT,
            medical_checkup_date TEXT,
            last_training_date TEXT,
            status TEXT DEFAULT 'active',
            tabel_number TEXT,
            face_template TEXT,
            vacation_start_date TEXT,
            vacation_end_date TEXT
        )`);

        // Migration: Add columns if missing
        db.run("ALTER TABLE employees ADD COLUMN tabel_number TEXT", (err) => { });
        db.run("ALTER TABLE employees ADD COLUMN face_template TEXT", (err) => { });
        db.run("ALTER TABLE employees ADD COLUMN medical_checkup_date TEXT", (err) => { });
        db.run("ALTER TABLE employees ADD COLUMN last_training_date TEXT", (err) => { });
        db.run("ALTER TABLE employees ADD COLUMN vacation_start_date TEXT", (err) => { });
        db.run("ALTER TABLE employees ADD COLUMN vacation_end_date TEXT", (err) => { });

        // TNU-19 Records (Safety Briefing)
        db.run(`CREATE TABLE IF NOT EXISTS tnu19_records(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER,
            bolinma_id TEXT,
            date TEXT,
            time TEXT,
            instruction_type TEXT, --e.g., 'Kirish', 'Davriy'
            instructor_name TEXT,
            signature TEXT, --Base64 or reference
            FOREIGN KEY(employee_id) REFERENCES employees(id)
        )`);

        // TNU-20 Records (Knowledge Check)
        db.run(`CREATE TABLE IF NOT EXISTS tnu20_records(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER,
            bolinma_id TEXT,
            date TEXT,
            next_test_date TEXT,
            certificate_no TEXT,
            result TEXT, -- 'o'tdi', 'o'tmadi'
            signature TEXT,
            FOREIGN KEY(employee_id) REFERENCES employees(id)
        )`);

        // --- Vehicles Table (Mechanics) ---
        db.run(`CREATE TABLE IF NOT EXISTS vehicles(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            number TEXT UNIQUE,
            garage_number TEXT,
            fuel_type TEXT,
            fuel_norm REAL,
            start_fuel REAL,
            start_speedometer REAL,
            status TEXT DEFAULT 'free',
            bolinma_id TEXT
        )`);

        // --- Waybills Table (Mechanics) ---
        db.run(`CREATE TABLE IF NOT EXISTS waybills(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vehicle_id INTEGER,
            driver_id INTEGER,
            start_time TEXT,
            end_time TEXT,
            start_km REAL,
            end_km REAL,
            fuel_filled REAL,
            fuel_end REAL,
            date TEXT,
            FOREIGN KEY(vehicle_id) REFERENCES vehicles(id),
            FOREIGN KEY(driver_id) REFERENCES employees(id)
        )`);

        // --- Storage Items (Inventory) ---
        db.run(`CREATE TABLE IF NOT EXISTS storage_items(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            unit TEXT, --kg, dona, litr
            quantity REAL DEFAULT 0,
            category TEXT,
            min_alert_limit REAL DEFAULT 0
        )`);

        // --- Timesheet Table ---
        db.run(`CREATE TABLE IF NOT EXISTS timesheet(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id TEXT NOT NULL,
            year INTEGER NOT NULL,
            month INTEGER NOT NULL,
            day INTEGER NOT NULL,
            hours REAL DEFAULT 0,
            status TEXT DEFAULT 'manual', -- 'manual', 'face_id'
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(employee_id, year, month, day)
        )`);

        // --- M-29 Material Acts ---
        db.run(`CREATE TABLE IF NOT EXISTS material_acts(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dept_id TEXT,
            date TEXT,
            station TEXT,
            bolinma_num TEXT,
            master TEXT,
            brigadier1 TEXT,
            brigadier2 TEXT,
            year TEXT,
            day_month TEXT,
            dept_name TEXT,
            location_start TEXT,
            km TEXT,
            pk TEXT,
            misc_loc TEXT,
            work_desc TEXT,
            method TEXT,
            materials_summary TEXT, --String summary for display
            status TEXT DEFAULT 'pending'
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS act_items(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                act_id INTEGER,
                item_name TEXT,
                qty REAL,
                uom TEXT,
                status TEXT DEFAULT 'pending',
                FOREIGN KEY(act_id) REFERENCES material_acts(id)
            )`);

        // Auto-seed vehicles
        db.get('SELECT COUNT(*) as count FROM vehicles', (err, row) => {
            if (row && row.count === 0) {
                const vehicles = [
                    ['Ekskavator CAT-320', '01 777 AAA', 'G-105', 'Dizel', 35, 45, 12500, 'free', 'bolinma1'],
                    ['Isuzu Yuk Mashinasi', '01 888 BBB', 'G-106', 'Dizel', 18, 20, 45000, 'free', 'bolinma2'],
                    ['Howo Samosval', '01 999 CCC', 'G-107', 'Dizel', 40, 100, 5000, 'repair', 'bolinma1']
                ];
                const stmt = db.prepare('INSERT INTO vehicles (name, number, garage_number, fuel_type, fuel_norm, start_fuel, start_speedometer, status, bolinma_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
                vehicles.forEach(v => stmt.run(v));
                stmt.finalize();
            }
        });

        console.log('Database tables initialized.');

        // --- Audit Log Table ---
        db.run(`CREATE TABLE IF NOT EXISTS audit_logs(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            username TEXT,
            action TEXT NOT NULL,
            entity TEXT,
            entity_id INTEGER,
            details TEXT,
            ip_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // --- Files Table (for Approval Workflow) ---
        db.run(`CREATE TABLE IF NOT EXISTS files(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_type TEXT,
            file_size INTEGER,
            module TEXT, -- Qaysi modulga tegishli (hr, safety, etc.)
            bolinma_id TEXT,
            uploaded_by INTEGER, -- user_id
            status TEXT DEFAULT 'pending', -- pending, approved, rejected
            approved_by INTEGER,
            approved_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Auto-seed users
        const bcrypt = require('bcryptjs');
        const seedUsers = [
            {
                username: 'admin',
                password: 'admin123',
                role: 'admin',
                full_name: 'Administrator',
                departments: ['ishlab-chiqarish', 'xodimlar', 'bugalteriya', 'iqtisod', 'mexanika', 'mehnat-muhofazasi', 'dispetcher', 'metrologiya'],
                bolinmalar: ['bolinma1', 'bolinma2', 'bolinma3', 'bolinma4', 'bolinma5', 'bolinma6', 'bolinma7', 'bolinma8', 'bolinma9', 'bolinma10']
            },
            { username: 'ishlab', password: 'ishlab123', role: 'department', full_name: 'Ishlab Chiqarish Bo\'limi', departments: ['ishlab-chiqarish'], bolinmalar: [] },
            { username: 'xodimlar', password: 'xodimlar123', role: 'department', full_name: 'Xodimlar Bo\'limi', departments: ['xodimlar'], bolinmalar: [] },
            { username: 'bugalteriya', password: 'bugalteriya123', role: 'department', full_name: 'Bugalteriya Bo\'limi', departments: ['bugalteriya'], bolinmalar: [] },
            { username: 'iqtisod', password: 'iqtisod123', role: 'department', full_name: 'Iqtisod Bo\'limi', departments: ['iqtisod'], bolinmalar: [] },
            { username: 'mexanika', password: 'mexanika123', role: 'department', full_name: 'Mexanika Bo\'limi', departments: ['mexanika'], bolinmalar: [] },
            { username: 'mehnat', password: 'mehnat123', role: 'department', full_name: 'Mehnat Muhofazasi Bo\'limi', departments: ['mehnat-muhofazasi'], bolinmalar: [] },
            { username: 'dispetcher', password: 'dispetcher123', role: 'department', full_name: 'Dispetcher Bo\'limi', departments: ['dispetcher'], bolinmalar: [] },
            { username: 'metrologiya', password: 'metrologiya123', role: 'department', full_name: 'Metrologiya Bo\'limi', departments: ['metrologiya'], bolinmalar: [] }
        ];

        // Also add bolinma1-10
        for (let i = 1; i <= 10; i++) {
            seedUsers.push({
                username: `bolinma${i}`,
                password: `bolinma${i}`,
                role: 'bolinma',
                full_name: `${i}-Bo'linma`,
                departments: ['ishlab-chiqarish', 'xodimlar', 'bugalteriya', 'iqtisod', 'mexanika', 'mehnat-muhofazasi', 'metrologiya'],
                bolinmalar: [`bolinma${i}`]
            });
        }

        seedUsers.forEach(u => {
            db.get('SELECT id FROM users WHERE username = ?', [u.username], (err, row) => {
                if (!err && !row) {
                    const hashedPassword = bcrypt.hashSync(u.password, 10);
                    db.run(
                        `INSERT INTO users (username, password, role, full_name, departments, bolinmalar) VALUES (?, ?, ?, ?, ?, ?)`,
                        [u.username, hashedPassword, u.role, u.full_name, JSON.stringify(u.departments), JSON.stringify(u.bolinmalar)],
                        (err) => {
                            if (!err) console.log(`User seeded: ${u.username}`);
                        }
                    );
                }
            });
        });
    });
}

module.exports = db;
