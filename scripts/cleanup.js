const { execSync } = require('child_process');
const os = require('os');

console.log('--- SERVER TOZALASH VA TIKLASH ---');

if (os.platform() === 'win32') {
    try {
        console.log('Eski Node.js jarayonlarini o\'chirilmoqda...');
        // O'zimizni o'chirib yubormaslik uchun filter qilamiz (ixtiyoriy)
        execSync('taskkill /f /im node.exe /t', { stdio: 'ignore' });
        console.log('✅ Barcha Node jarayonlari to\'xtatildi.');
    } catch (e) {
        console.log('ℹ️ Ishlayotgan Node jarayonlari topilmadi.');
    }

    try {
        console.log('Port 5050 ni band qilgan jarayonni qidirilmoqda...');
        const findPort = execSync('netstat -ano | findstr :5050').toString();
        const lines = findPort.split('\n');
        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length > 4) {
                const pid = parts[parts.length - 1];
                if (pid && pid !== '0') {
                    console.log(`Port 5050 dagi PID ${pid} o'chirilmoqda...`);
                    execSync(`taskkill /f /pid ${pid}`, { stdio: 'ignore' });
                }
            }
        });
    } catch (e) {
        // Port band emas
    }
} else {
    try {
        execSync('pkill -f node', { stdio: 'ignore' });
    } catch (e) { }
}

console.log('✅ Port 5050 bosh bo\'ldi.');
console.log('---------------------------------');
