const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'smart_pch.db');
const db = new sqlite3.Database(dbPath);

const defaultUsers = [
    { username: 'admin', password: 'admin123' },
    { username: 'ishlab', password: 'ishlab123' },
    { username: 'xodimlar', password: 'xodimlar123' },
    { username: 'bugalteriya', password: 'bugalteriya123' },
    { username: 'iqtisod', password: 'iqtisod123' },
    { username: 'mexanika', password: 'mexanika123' },
    { username: 'mehnat', password: 'mehnat123' },
    { username: 'dispetcher', password: 'dispetcher123' },
    { username: 'metrologiya', password: 'metrologiya123' }
];

// Add bolinma1-10
for (let i = 1; i <= 10; i++) {
    defaultUsers.push({
        username: `bolinma${i}`,
        password: `bolinma${i}`
    });
}

db.serialize(() => {
    console.log('Resetting user passwords...');

    defaultUsers.forEach(u => {
        const hashedPassword = bcrypt.hashSync(u.password, 10);
        db.run(
            `UPDATE users SET password = ? WHERE username = ?`,
            [hashedPassword, u.username],
            function (err) {
                if (err) {
                    console.error(`Error updating ${u.username}:`, err.message);
                } else if (this.changes > 0) {
                    console.log(`Password updated for: ${u.username}`);
                } else {
                    // If user doesn't exist, maybe we should insert them?
                    // But for now let's just log.
                    console.log(`User ${u.username} not found, skipping update.`);
                }
            }
        );
    });
});

db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Database password reset completed.');
});
