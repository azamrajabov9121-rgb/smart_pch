const { contextBridge, ipcRenderer } = require('electron');

const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('electron', {
    openExternal: (path) => ipcRenderer.invoke('open-external', path),
    showItemInFolder: (path) => ipcRenderer.invoke('show-item-in-folder', path),
    platform: process.platform,
    readExcel: (fileName) => {
        try {
            // Try __dirname first
            let filePath = path.join(__dirname, fileName);
            if (fs.existsSync(filePath)) {
                return fs.readFileSync(filePath);
            }

            // Try process.cwd() as fallback
            filePath = path.join(process.cwd(), fileName);
            if (fs.existsSync(filePath)) {
                return fs.readFileSync(filePath);
            }

            // Hardcoded fallback for this user's specific desktop path (Debug)
            filePath = path.join('c:\\Users\\user\\Desktop\\расм', fileName);
            if (fs.existsSync(filePath)) {
                return fs.readFileSync(filePath);
            }

            console.error("File not found in:", __dirname, "or", process.cwd());
            return null;
        } catch (e) {
            console.error("Read error:", e);
            return null;
        }
    },
    saveData: (fileName, data) => ipcRenderer.invoke('save-data', { fileName, data }),
    loadData: (fileName) => ipcRenderer.invoke('load-data', fileName)
});
