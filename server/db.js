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
        // Enable WAL mode for better concurrency
        db.run('PRAGMA journal_mode = WAL');
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
            bolinmalar TEXT,  -- JSON array
            employee_id INTEGER,
            avatar TEXT,
            phone TEXT,
            settings TEXT -- JSON for theme, notifications
        )`);

        db.run("ALTER TABLE users ADD COLUMN employee_id INTEGER", (err) => {
            if (err && !err.message.includes('duplicate column name')) console.warn('Migration warning:', err.message);
        });
        db.run("ALTER TABLE users ADD COLUMN avatar TEXT", (err) => {
            if (err && !err.message.includes('duplicate column name')) console.warn('Migration warning:', err.message);
        });
        db.run("ALTER TABLE users ADD COLUMN phone TEXT", (err) => {
            if (err && !err.message.includes('duplicate column name')) console.warn('Migration warning:', err.message);
        });
        db.run("ALTER TABLE users ADD COLUMN settings TEXT", (err) => {
            if (err && !err.message.includes('duplicate column name')) console.warn('Migration warning:', err.message);
        });
        db.run("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'", (err) => {
            if (err && !err.message.includes('duplicate column name')) console.warn('Migration warning:', err.message);
        });

        // Reports table
        db.run(`CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            bolinma_id TEXT,
            content TEXT,
            structuredData TEXT, -- JSON data for KM, PK, Obxod, etc.
            date TEXT,
            time TEXT,
            status TEXT DEFAULT 'received',
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        db.run("ALTER TABLE reports ADD COLUMN structuredData TEXT", (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.warn('Migration warning: structuredData column:', err.message);
            }
        });

        // Metrology Devices table
        db.run(`CREATE TABLE IF NOT EXISTS metrology_devices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bolinma_id TEXT,
            name TEXT NOT NULL,
            serial TEXT,
            stampDate TEXT, -- LGM Birka sanasi
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Metrology Electricity table
        db.run(`CREATE TABLE IF NOT EXISTS metrology_electricity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bolinma_id TEXT,
            lastReading REAL DEFAULT 0,
            currentMonth REAL DEFAULT 0,
            date TEXT,
            UNIQUE(bolinma_id, date)
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
        db.run("ALTER TABLE employees ADD COLUMN tabel_number TEXT", (err) => {
            if (err && !err.message.includes('duplicate column name')) console.warn('Migration warning:', err.message);
        });
        db.run("ALTER TABLE employees ADD COLUMN face_template TEXT", (err) => {
            if (err && !err.message.includes('duplicate column name')) console.warn('Migration warning:', err.message);
        });
        db.run("ALTER TABLE employees ADD COLUMN medical_checkup_date TEXT", (err) => {
            if (err && !err.message.includes('duplicate column name')) console.warn('Migration warning:', err.message);
        });
        db.run("ALTER TABLE employees ADD COLUMN last_training_date TEXT", (err) => {
            if (err && !err.message.includes('duplicate column name')) console.warn('Migration warning:', err.message);
        });
        db.run("ALTER TABLE employees ADD COLUMN vacation_start_date TEXT", (err) => {
            if (err && !err.message.includes('duplicate column name')) console.warn('Migration warning:', err.message);
        });
        db.run("ALTER TABLE employees ADD COLUMN vacation_end_date TEXT", (err) => {
            if (err && !err.message.includes('duplicate column name')) console.warn('Migration warning:', err.message);
        });

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

        // --- Timesheet Signatures Table ---
        db.run(`CREATE TABLE IF NOT EXISTS timesheet_signatures(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year INTEGER NOT NULL,
            month INTEGER NOT NULL,
            bolinma_id TEXT NOT NULL,
            tuzuvchi_uid INTEGER,
            tuzuvchi_name TEXT,
            tuzuvchi_at DATETIME,
            tuzuvchi_hash TEXT,
            tekshiruvchi_uid INTEGER,
            tekshiruvchi_name TEXT,
            tekshiruvchi_at DATETIME,
            tekshiruvchi_hash TEXT,
            UNIQUE(year, month, bolinma_id)
        )`);

        // Migration: Hash ustunlarini qo'shish (agar mavjud bo'lmasa)
        db.run('ALTER TABLE timesheet_signatures ADD COLUMN tuzuvchi_hash TEXT', (err) => {
            if (err && !err.message.includes('duplicate column name')) console.warn('Migration warning:', err.message);
        });
        db.run('ALTER TABLE timesheet_signatures ADD COLUMN tekshiruvchi_hash TEXT', (err) => {
            if (err && !err.message.includes('duplicate column name')) console.warn('Migration warning:', err.message);
        });


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

        // --- Repair Logs (Mechanics) ---
        db.run(`CREATE TABLE IF NOT EXISTS repair_logs(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vehicle_id INTEGER,
            date TEXT,
            description TEXT,
            parts_replaced TEXT,
            total_cost REAL DEFAULT 0,
            mechanic_name TEXT,
            status TEXT DEFAULT 'completed',
            FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
        )`);

        // --- Technical Maintenance (TO-1, TO-2, TO-3) ---
        db.run(`CREATE TABLE IF NOT EXISTS technical_maintenance(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vehicle_id INTEGER,
            to_type TEXT,
            date TEXT,
            inspector TEXT,
            notes TEXT,
            status TEXT DEFAULT 'completed',
            completed_at DATETIME,
            FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
        )`);

        // --- Mechanic Specific Spare Parts ---
        db.run(`CREATE TABLE IF NOT EXISTS mechanic_parts(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            part_number TEXT,
            quantity INTEGER DEFAULT 0,
            unit TEXT DEFAULT 'dona',
            min_limit INTEGER DEFAULT 5,
            price REAL DEFAULT 0
        )`);

        // --- Vehicle Orders (Transport requests) ---
        db.run(`CREATE TABLE IF NOT EXISTS vehicle_orders(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vehicle_id INTEGER,
            vehicle_name TEXT,
            task TEXT,
            dept_name TEXT,
            date TEXT,
            status TEXT DEFAULT 'pending',
            FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
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

        // --- Broadcast Messages (Admin Tezkor Xabar) ---
        db.run(`CREATE TABLE IF NOT EXISTS broadcast_messages(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER,
            sender_name TEXT,
            title TEXT,
            message TEXT NOT NULL,
            priority TEXT DEFAULT 'normal', -- normal, important, urgent
            target TEXT DEFAULT 'all', -- all, department_id, bolinma_id
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

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

        // Create indexes for better query performance
        db.run('CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(date)', (err) => { if (err) console.warn('Index creation warning:', err.message); });
        db.run('CREATE INDEX IF NOT EXISTS idx_reports_bolinma ON reports(bolinma_id)', (err) => { if (err) console.warn('Index creation warning:', err.message); });
        db.run('CREATE INDEX IF NOT EXISTS idx_employees_bolinma ON employees(bolinma_id)', (err) => { if (err) console.warn('Index creation warning:', err.message); });
        db.run('CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id)', (err) => { if (err) console.warn('Index creation warning:', err.message); });
        db.run('CREATE INDEX IF NOT EXISTS idx_timesheet_employee ON timesheet(employee_id, year, month)', (err) => { if (err) console.warn('Index creation warning:', err.message); });
        db.run('CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)', (err) => { if (err) console.warn('Index creation warning:', err.message); });
        db.run('CREATE INDEX IF NOT EXISTS idx_defects_bolinma ON defects(bolinma_id)', (err) => { if (err) console.warn('Index creation warning:', err.message); });
        db.run('CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id)', (err) => { if (err) console.warn('Index creation warning:', err.message); });
        db.run('CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at)', (err) => { if (err) console.warn('Index creation warning:', err.message); });
        db.run('CREATE INDEX IF NOT EXISTS idx_material_acts_dept ON material_acts(dept_id)', (err) => { if (err) console.warn('Index creation warning:', err.message); });
        db.run('CREATE INDEX IF NOT EXISTS idx_files_module ON files(module, bolinma_id)', (err) => { if (err) console.warn('Index creation warning:', err.message); });

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

        // --- PU-80 Records Table ---
        db.run(`CREATE TABLE IF NOT EXISTS pu80_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dept_id TEXT NOT NULL,
            tool_name TEXT NOT NULL,
            tool_number TEXT,
            responsible TEXT NOT NULL,
            taken_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            return_time DATETIME,
            status TEXT DEFAULT 'active', -- active, returned
            verification_type TEXT, -- sign, face
            face_take TEXT, 
            face_return TEXT,
            sign_take TEXT,
            sign_return TEXT
        )`);

        // --- PU-80 Tools Inventory Table ---
        db.run(`CREATE TABLE IF NOT EXISTS department_tools (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bolinma_id TEXT NOT NULL,
            tool_name TEXT NOT NULL,
            tool_number TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // --- PU-28 Records (Yo'l tekshiruv jurnali) ---
        db.run(`CREATE TABLE IF NOT EXISTS pu28_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bolinma_id TEXT,
            date TEXT,
            check_method TEXT,
            km TEXT,
            pk TEXT,
            zv TEXT,
            defect_desc TEXT,
            resolved_status TEXT DEFAULT 'active',
            date_resolved TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // --- Murojaat (Xodimlar murojaatlari / Rahbar vizasi) ---
        db.run(`CREATE TABLE IF NOT EXISTS murojaat (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER,
            employee_name TEXT,
            employee_position TEXT,
            bolinma_id TEXT,
            murojaat_type TEXT,
            murojaat_text TEXT NOT NULL,
            signature_data TEXT,
            face_verified INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending',
            manager_name TEXT,
            manager_comment TEXT,
            approved_date TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // PU-28 va Murojaat indekslari
        db.run('CREATE INDEX IF NOT EXISTS idx_pu28_bolinma ON pu28_records(bolinma_id)', (err) => { if (err && !err.message.includes('already exists')) console.warn('Index warning:', err.message); });
        db.run('CREATE INDEX IF NOT EXISTS idx_murojaat_status ON murojaat(status)', (err) => { if (err && !err.message.includes('already exists')) console.warn('Index warning:', err.message); });
        db.run('CREATE INDEX IF NOT EXISTS idx_murojaat_bolinma ON murojaat(bolinma_id)', (err) => { if (err && !err.message.includes('already exists')) console.warn('Index warning:', err.message); });

        // Auto-seed PU-80 Tools
        db.get('SELECT COUNT(*) as count FROM department_tools', (err, row) => {
            if (row && row.count === 0) {
                const tools = [
                    ['bolinma1', 'Elektr Drel', '№ 101'], ['bolinma1', 'Bolg\'a (Urda)', '№ 20'],
                    ['bolinma2', 'Benzorez', '№ BR-05'], ['bolinma2', 'Lom', '№ L-15'],
                    ['bolinma3', 'Perforator Bosch', '№ P-88'], ['bolinma3', 'Shurupovert', '№ SH-12'],
                    ['bolinma4', 'Bolgarka', '№ B-44'], ['bolinma4', 'Svarochniy apparat', '№ S-01'],
                ];
                // Add default tools for all 10 departments if not listed
                for (let i = 1; i <= 10; i++) {
                    const bId = `bolinma${i}`;
                    if (!tools.some(t => t[0] === bId)) {
                        tools.push([bId, 'Universal kalitlar jamlanmasi', `№ UK-${i}01`]);
                        tools.push([bId, 'Fonus (Projector)', `№ F-${i}05`]);
                    }
                }
                const stmt = db.prepare('INSERT INTO department_tools (bolinma_id, tool_name, tool_number) VALUES (?, ?, ?)');
                tools.forEach(t => stmt.run(t));
                stmt.finalize();
            }
        });

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
                departments: [], // Bo'linma role should NOT have access to global departments
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
