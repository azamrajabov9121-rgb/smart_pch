const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { fork } = require('child_process');

let backendProcess;

function startBackend() {
    const appPath = app.getAppPath();
    const serverPath = path.join(appPath, 'server', 'index.js');
    const serverDir = path.join(appPath, 'server');

    console.log('Starting backend...');

    if (!fs.existsSync(serverPath)) {
        const fallbackPath = path.join(__dirname, 'server', 'index.js');
        if (fs.existsSync(fallbackPath)) {
            backendProcess = fork(fallbackPath, [], {
                cwd: path.join(__dirname, 'server'),
                env: { ...process.env, PORT: 5000 }
            });
            return;
        }
        return;
    }

    backendProcess = fork(serverPath, [], {
        cwd: serverDir,
        env: { ...process.env, PORT: 5000, NODE_ENV: 'production' }
    });

    backendProcess.on('exit', (code, signal) => {
        console.log(`Backend process exited with code ${code} and signal ${signal}. Restarting...`);
        setTimeout(startBackend, 2000); // Restart after 2 seconds
    });

    backendProcess.on('error', (err) => {
        console.error('Backend process error:', err);
    });
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1400,
        height: 900,
        icon: path.join(__dirname, 'public/img/logo.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        }
    });

    win.loadFile('public/index.html');
    win.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
    // Check if backend is already running? 
    // For now, let's just try to start it.
    startBackend();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('will-quit', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers
ipcMain.handle('open-external', async (event, filePath) => {
    try {
        const result = await shell.openPath(filePath);
        return { success: true, message: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('show-item-in-folder', async (event, filePath) => {
    shell.showItemInFolder(filePath);
});

ipcMain.handle('save-data', async (event, { fileName, data }) => {
    try {
        const userDataPath = app.getPath('userData');
        const filePath = path.join(userDataPath, fileName);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-data', async (event, fileName) => {
    try {
        const userDataPath = app.getPath('userData');
        const filePath = path.join(userDataPath, fileName);
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        return null;
    }
});
