// Metrology Department Content
function getMetrologyDashboardHTML() {
    // Initialize devices data if not exists
    if (!window.metrologyDevices) {
        window.metrologyDevices = JSON.parse(localStorage.getItem('metrologyDevices') || '[]');
    }

    if (!window.electricityData) {
        window.electricityData = JSON.parse(localStorage.getItem('electricityData') || JSON.stringify({
            currentMonth: 12450,
            limit: 16000,
            tariff: 450
        }));
    }

    const devices = window.metrologyDevices;
    const electricity = window.electricityData;
    const consumptionPercent = Math.round((electricity.currentMonth / electricity.limit) * 100);
    const costEstimate = Math.round(electricity.currentMonth * electricity.tariff);

    // Calculate device statuses
    const validDevices = devices.filter(d => getDeviceStatus(d.nextCalibration) === 'valid').length;
    const expiringDevices = devices.filter(d => getDeviceStatus(d.nextCalibration) === 'expiring').length;
    const expiredDevices = devices.filter(d => getDeviceStatus(d.nextCalibration) === 'expired').length;

    return `
        <style>
            .metrology-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .metrology-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; }
            .metrology-card h3 { color: #00c6ff; margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px; font-size: 1.1rem; }
            .progress-bar { height: 20px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; margin: 10px 0; }
            .progress-fill { height: 100%; background: linear-gradient(90deg, #00c6ff, #0072ff); transition: width 0.3s; }
            .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px; }
            .stat-box { text-align: center; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px; }
            .stat-box .number { font-size: 1.5rem; font-weight: bold; display: block; }
            .stat-box .label { font-size: 0.8rem; color: rgba(255,255,255,0.6); }
            .devices-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .devices-table th { background: rgba(0,198,255,0.1); padding: 10px; text-align: left; color: #00c6ff; font-size: 0.9rem; }
            .devices-table td { padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.9rem; }
            .device-status { padding: 3px 8px; border-radius: 5px; font-size: 0.75rem; font-weight: bold; }
            .status-valid { background: rgba(46,204,113,0.2); color: #2ecc71; }
            .status-expiring { background: rgba(241,196,15,0.2); color: #f1c40f; }
            .status-expired { background: rgba(231,76,60,0.2); color: #e74c3c; }
            .action-btn { background: rgba(0,198,255,0.2); border: none; color: #00c6ff; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 0.8rem; margin-right: 5px; }
            .action-btn:hover { background: rgba(0,198,255,0.3); }
            .add-btn { background: linear-gradient(135deg, #00c6ff, #0072ff); border: none; color: white; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; }
            .add-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,198,255,0.3); }
        </style>
        
        <div class="metrology-grid">
            <!-- Electricity Card -->
            <div class="metrology-card">
                <h3><i class="fas fa-bolt"></i> Elektr Iste'moli (bu oy)</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-size: 2rem; font-weight: bold; color: #00c6ff;">${electricity.currentMonth.toLocaleString()}</span>
                    <span style="font-size: 1rem; color: rgba(255,255,255,0.5);">/ ${electricity.limit.toLocaleString()} kWh</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${consumptionPercent}%; background: ${consumptionPercent > 90 ? '#e74c3c' : consumptionPercent > 75 ? '#f1c40f' : '#00c6ff'};"></div>
                </div>
                <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-top: 10px;">
                    💰 Taxminiy to'lov: <strong style="color: #ffd700;">${costEstimate.toLocaleString()} so'm</strong>
                </div>
            </div>
            
            <!-- Devices Summary Card -->
            <div class="metrology-card">
                <h3><i class="fas fa-tools"></i> O'lchov Vositalari</h3>
                <div class="stat-grid">
                    <div class="stat-box">
                        <span class="number" style="color: #2ecc71;">🟢 ${validDevices}</span>
                        <span class="label">Yaroqli</span>
                    </div>
                    <div class="stat-box">
                        <span class="number" style="color: #f1c40f;">🟡 ${expiringDevices}</span>
                        <span class="label">Tugaydi</span>
                    </div>
                    <div class="stat-box">
                        <span class="number" style="color: #e74c3c;">🔴 ${expiredDevices}</span>
                        <span class="label">Eskirgan</span>
                    </div>
                </div>
                <div style="margin-top: 15px; font-size: 0.9rem; color: rgba(255,255,255,0.7);">
                    Jami asboblar: <strong>${devices.length} ta</strong>
                </div>
            </div>
        </div>
        
        <!-- Devices Table -->
        <div class="metrology-card" style="grid-column: 1 / -1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0;"><i class="fas fa-list"></i> O'lchov Vositalari Registri</h3>
                <button class="add-btn" onclick="addMetrologyDevice()">
                    <i class="fas fa-plus"></i> Yangi Asbob
                </button>
            </div>
            
            ${devices.length === 0 ? `
                <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.3);">
                    <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 10px; display: block;"></i>
                    Hozircha asboblar yo'q. "Yangi Asbob" tugmasini bosing.
                </div>
            ` : `
                <table class="devices-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Asbob nomi</th>
                            <th>Zavod №</th>
                            <th>Kalibratsiya</th>
                            <th>Keyingi</th>
                            <th>Status</th>
                            <th>Harakatlar</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${devices.map(device => `
                            <tr>
                                <td>${device.id}</td>
                                <td><strong>${device.name}</strong></td>
                                <td>${device.serialNumber}</td>
                                <td>${formatDate(device.calibrationDate)}</td>
                                <td>${formatDate(device.nextCalibration)}</td>
                                <td>
                                    <span class="device-status status-${getDeviceStatus(device.nextCalibration)}">
                                        ${getDeviceStatusText(device.nextCalibration)}
                                    </span>
                                </td>
                                <td>
                                    <button class="action-btn" onclick="editMetrologyDevice('${device.id}')">
                                        <i class="fas fa-edit"></i> Tahrir
                                    </button>
                                    <button class="action-btn" onclick="deleteMetrologyDevice('${device.id}')" style="color: #e74c3c;">
                                        <i class="fas fa-trash"></i> O'chir
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `}
        </div>
    `;
}

// Helper functions
function getDeviceStatus(nextCalibrationDate) {
    const next = new Date(nextCalibrationDate);
    const now = new Date();
    const daysLeft = Math.floor((next - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 30) return 'expiring';
    return 'valid';
}

function getDeviceStatusText(nextCalibrationDate) {
    const status = getDeviceStatus(nextCalibrationDate);
    if (status === 'expired') return '🔴 Eskirgan';
    if (status === 'expiring') return '🟡 Tugaydi';
    return '🟢 Yaroqli';
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('uz-UZ');
}

// Render Metrology Section for Bo'linma
function renderMetrologySection(windowElement, bolinmaId) {
    // Hide file management
    const fileManagement = windowElement.querySelector('.file-management');
    if (fileManagement) fileManagement.style.display = 'none';

    const folderManagement = windowElement.querySelector('.folder-management');
    if (folderManagement) folderManagement.style.display = 'none';

    // Find or create metrology dashboard container
    const body = windowElement.querySelector('.window-content') || windowElement.querySelector('.department-body');
    if (!body) return;

    let metrologyView = body.querySelector('#metrology-dashboard-view');
    if (!metrologyView) {
        metrologyView = document.createElement('div');
        metrologyView.id = 'metrology-dashboard-view';
        body.insertBefore(metrologyView, body.firstChild);
    }

    // Render metrology dashboard
    metrologyView.innerHTML = getMetrologyDashboardHTML();
}

// Device Management Functions
window.addMetrologyDevice = function () {
    const name = prompt("Asbob nomi:");
    if (!name) return;

    const serialNumber = prompt("Zavod raqami:");
    if (!serialNumber) return;

    const calibrationDate = prompt("Kalibratsiya sanasi (YYYY-MM-DD):");
    if (!calibrationDate) return;

    const nextCalibration = prompt("Keyingi kalibratsiya (YYYY-MM-DD):");
    if (!nextCalibration) return;

    const device = {
        id: 'DEV' + Date.now(),
        name,
        serialNumber,
        calibrationDate,
        nextCalibration,
        location: 'Laboratoriya'
    };

    if (!window.metrologyDevices) window.metrologyDevices = [];
    window.metrologyDevices.push(device);
    localStorage.setItem('metrologyDevices', JSON.stringify(window.metrologyDevices));

    // Refresh all metrology views
    refreshMetrologyViews();
    alert("Asbob qo'shildi!");
};

window.editMetrologyDevice = function (deviceId) {
    const devices = window.metrologyDevices || [];
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    const name = prompt("Asbob nomi:", device.name);
    if (name) device.name = name;

    const serialNumber = prompt("Zavod raqami:", device.serialNumber);
    if (serialNumber) device.serialNumber = serialNumber;

    const calibrationDate = prompt("Kalibratsiya sanasi (YYYY-MM-DD):", device.calibrationDate);
    if (calibrationDate) device.calibrationDate = calibrationDate;

    const nextCalibration = prompt("Keyingi kalibratsiya (YYYY-MM-DD):", device.nextCalibration);
    if (nextCalibration) device.nextCalibration = nextCalibration;

    localStorage.setItem('metrologyDevices', JSON.stringify(window.metrologyDevices));

    refreshMetrologyViews();
    alert("O'zgartirishlar saqlandi!");
};

window.deleteMetrologyDevice = function (deviceId) {
    if (!confirm("Rostdan ham o'chirmoqchimisiz?")) return;

    window.metrologyDevices = (window.metrologyDevices || []).filter(d => d.id !== deviceId);
    localStorage.setItem('metrologyDevices', JSON.stringify(window.metrologyDevices));

    refreshMetrologyViews();
    alert("Asbob o'chirildi!");
};

// Helper to refresh all metrology views
function refreshMetrologyViews() {
    // Refresh all active metrology dashboard views
    document.querySelectorAll('#metrology-dashboard-view').forEach(view => {
        view.innerHTML = getMetrologyDashboardHTML();
    });

    // Also check top-level metrology window
    const metrologyWindow = document.getElementById('metrologiya-window');
    if (metrologyWindow) {
        const container = metrologyWindow.querySelector('.metrology-dashboard-container');
        if (container) container.innerHTML = getMetrologyDashboardHTML();
    }
}
