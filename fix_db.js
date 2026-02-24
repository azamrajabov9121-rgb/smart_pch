const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'server', 'smart_pch.db');
const db = new sqlite3.Database(dbPath);

const users = [
    {
        username: 'mexanika',
        password: 'mexanika123',
        role: 'department',
        full_name: 'Mexanika Bo\'limi',
        departments: JSON.stringify(['mexanika']),
        bolinmalar: JSON.stringify([])
    },
    {
        username: 'bugalteriya',
        password: 'bugalteriya123',
        role: 'department',
        full_name: 'Bugalteriya Bo\'limi',
        departments: JSON.stringify(['bugalteriya']),
        bolinmalar: JSON.stringify([])
    },
    {
        username: 'ishlab',
        password: 'ishlab123',
        role: 'department',
        full_name: 'Ishlab Chiqarish Bo\'limi',
        departments: JSON.stringify(['ishlab-chiqarish']),
        bolinmalar: JSON.stringify([])
    }
];

db.serialize(() => {
    users.forEach(u => {
        const hashedPassword = bcrypt.hashSync(u.password, 10);
        db.run(
            `INSERT OR IGNORE INTO users (username, password, role, full_name, departments, bolinmalar) VALUES (?, ?, ?, ?, ?, ?)`,
            [u.username, hashedPassword, u.role, u.full_name, u.departments, u.bolinmalar],
            function (err) {
                if (err) {
                    console.error(`Error seeding ${u.username}:`, err.message);
                } else if (this.changes > 0) {
                    console.log(`User seeded successfully: ${u.username}`);
                } else {
                    console.log(`User ${u.username} already exists.`);
                }
            }
        );
    });
});

db.close(() => {
    console.log('Database fix completed.');
});
