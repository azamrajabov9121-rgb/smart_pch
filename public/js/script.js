

// GLOBAL REFERENCES - Auth moduldan olingan
const defaultUsers = (window.Auth && window.Auth.roleStructure) || {};

// HRM TIZIMI FUNKSIYALARI
function openHRMNewTab() {
    window.open('https://hrm.railway.uz/hrm/dashboard', '_blank');
}

function refreshHRM() {
    const iframe = document.getElementById('hrmFrame');
    if (iframe) {
        iframe.src = iframe.src;
    }
}

function handleHRMError() {
    const fallback = document.getElementById('hrmFallback');
    const iframe = document.getElementById('hrmFrame');
    if (fallback && iframe) {
        iframe.style.display = 'none';
        fallback.style.display = 'flex';
    }
}

// Iframe yuklangandan keyin tekshirish (faqat HRM sahifasida)
setTimeout(() => {
    const iframe = document.getElementById('hrmFrame');
    if (!iframe) return; // Login sahifasida ishlamaydi
    iframe.onerror = handleHRMError;
    // Cross-origin xatosini tekshirish
    try {
        if (iframe.contentWindow && iframe.contentWindow.length === 0) {
            // handleHRMError();
        }
    } catch (e) {
        // Cross-origin xatosi - bu normal holat
    }
}, 3000);

// ============ GLOBAL DATA STORE ============
window.roadManagementData = window.roadManagementData || JSON.parse(localStorage.getItem('roadManagementData')) || {};
window.monitoringData = window.monitoringData || JSON.parse(localStorage.getItem('monitoringData')) || {};

// ============ SOCKET.IO INITIALIZATION ============
if (typeof io !== 'undefined') {
    window.socket = io(window.CONFIG?.API_URL?.replace('/api', '') || 'http://127.0.0.1:5000');

    window.socket.on('connect', () => {
        console.log('Connected to real-time server');
    });

    window.socket.on('new_report', (data) => {
        showToast(`${data.bolinma_name} dan yangi ish rejasi keldi!`, 'info');
        // Refresh local report cache
        if (typeof loadReportsFromServer === 'function') {
            loadReportsFromServer();
        }
    });
} else {
    console.warn('Socket.IO client not loaded. Real-time features will be disabled.');
}

// ============ RAQOBAT GRAFIGI ============
let competitionChartInstance = null;
let xSpreadsheet = null;

const bolinmaData = window.INITIAL_DATA.bolinmaData;

async function fetchWeatherData() {
    const weatherContainer = document.querySelector('.weather-container');
    if (!weatherContainer) return;

    weatherContainer.innerHTML = '<div class="weather-loading"><i class="fas fa-spinner fa-spin"></i> Havo ma\'lumotlari yuklanmoqda...</div>';

    try {
        const response = await fetch(
            `${window.CONFIG.API_URL}/weather?lat=${window.CONFIG.BUKHARA_COORDS.lat}&lon=${window.CONFIG.BUKHARA_COORDS.lon}`
        );

        if (!response.ok) throw new Error('API xatosi');

        const data = await response.json();
        displayCurrentWeather(data);
    } catch (error) {
        console.error('Ob-havo xatosi:', error);
        displayFallbackWeather();
    }
}

function displayCurrentWeather(data) {
    const weatherContainer = document.querySelector('.weather-container');
    if (!weatherContainer) return;

    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    weatherContainer.innerHTML = `
                                    <div class="weather-current">
                                        <div class="weather-main">
                                            <img src="${iconUrl}" alt="Ob-havo" class="weather-icon-img">
                                            <div class="weather-temp">${Math.round(data.main.temp)}°C</div>
                                        </div>
                                        <div class="weather-details">
                                            <div class="weather-desc">${data.weather[0].description}</div>
                                            <div class="weather-info-grid">
                                                <div class="weather-info-item">
                                                    <i class="fas fa-temperature-high"></i>
                                                    <span>Seziladi: ${Math.round(data.main.feels_like)}°C</span>
                                                </div>
                                                <div class="weather-info-item">
                                                    <i class="fas fa-tint"></i>
                                                    <span>Namlik: ${data.main.humidity}%</span>
                                                </div>
                                                <div class="weather-info-item">
                                                    <i class="fas fa-wind"></i>
                                                    <span>Shamol: ${data.wind.speed} m/s</span>
                                                </div>
                                                <div class="weather-info-item">
                                                    <i class="fas fa-compress-arrows-alt"></i>
                                                    <span>Bosim: ${data.main.pressure} hPa</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="weather-location">
                                        <i class="fas fa-map-marker-alt"></i> Buxoro shahri
                                        <span class="weather-update-time">Yangilangan: ${new Date().toLocaleTimeString('uz-UZ')}</span>
                                    </div>
                                `;
}

function displayFallbackWeather() {
    const weatherContainer = document.querySelector('.weather-container');
    if (!weatherContainer) return;

    // Offline holat uchun taxminiy ma'lumot
    const now = new Date();
    const month = now.getMonth();
    let temp, desc, icon;

    if (month >= 5 && month <= 8) { // Yoz
        temp = 35 + Math.floor(Math.random() * 5);
        desc = 'Issiq va ochiq havo';
        icon = 'fa-sun';
    } else if (month >= 11 || month <= 1) { // Qish
        temp = 2 + Math.floor(Math.random() * 5);
        desc = 'Sovuq va bulutli';
        icon = 'fa-cloud';
    } else { // Bahor/Kuz
        temp = 18 + Math.floor(Math.random() * 8);
        desc = 'Mo\'tadil havo';
        icon = 'fa-cloud-sun';
    }

    weatherContainer.innerHTML = `
                                    <div class="weather-current">
                                        <div class="weather-main">
                                            <i class="fas ${icon} weather-icon"></i>
                                            <div class="weather-temp">${temp}°C</div>
                                        </div>
                                        <div class="weather-details">
                                            <div class="weather-desc">${desc}</div>
                                            <div class="weather-info-grid">
                                                <div class="weather-info-item">
                                                    <i class="fas fa-temperature-high"></i>
                                                    <span>Seziladi: ${temp - 2}°C</span>
                                                </div>
                                                <div class="weather-info-item">
                                                    <i class="fas fa-tint"></i>
                                                    <span>Namlik: 45%</span>
                                                </div>
                                                <div class="weather-info-item">
                                                    <i class="fas fa-wind"></i>
                                                    <span>Shamol: 3 m/s</span>
                                                </div>
                                                <div class="weather-info-item">
                                                    <i class="fas fa-compress-arrows-alt"></i>
                                                    <span>Bosim: 1015 hPa</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="weather-location">
                                        <i class="fas fa-map-marker-alt"></i> Buxoro shahri
                                        <span class="weather-offline">(Offline rejim)</span>
                                    </div>
                                `;
}

// Ob-havo yangilash tugmasi
document.addEventListener('click', function (e) {
    if (e.target.closest('.refresh-weather')) {
        fetchWeatherData();
    }
});

// Dashboard yuklanganda grafik va ob-havo ishga tushirish
function initDashboardWidgets() {
    setTimeout(() => {
        createCompetitionChart();
        fetchWeatherData();
    }, 500);
}

// Ma'lumotlar bazasi (LocalStorage bilan ishlaydi)
const DB_NAME = 'smart_pch_db';

// Foydalanuvchilar bazasi
let users = {};

function saveUsers() {
    localStorage.setItem('smart_pch_users', JSON.stringify(users));
}

function initUserSystem() {
    const saved = localStorage.getItem('smart_pch_users');
    if (saved) {
        users = JSON.parse(saved);
        // Ensure admin always exists (failsafe)
        if (!users.admin) {
            users.admin = defaultUsers.admin;
            saveUsers();
        }
    } else {
        // Deep copy defaultUsers
        users = JSON.parse(JSON.stringify(defaultUsers));
        saveUsers();
    }
}

initUserSystem();

// Poyezdlar ma'lumotlari
let trainsData = [...window.INITIAL_DATA.trains];

// Xodimlar (har bir bo'linmadan)
let workersData = [...window.INITIAL_DATA.workers];

// Stansiyalar (temir yo'l bekatlar)
let stationsData = [...window.INITIAL_DATA.stations];

// Poyezd yo'nalishi (stansiyalar orasida)
let trainRoutePoints = stationsData.map(s => [s.lat, s.lng]);

// LocalStorage'dan ma'lumotlarni yuklash (Server API orqali)
async function loadDataFromStorage() {
    workersData = await SmartUtils.load('smart_pch_workers', workersData);
    trainsData = await SmartUtils.load('smart_pch_trains', trainsData);
    stationsData = await SmartUtils.load('smart_pch_stations', stationsData);
    trainRoutePoints = stationsData.map(s => [s.lat, s.lng]);
}

// Ma'lumotlarni LocalStorage'ga saqlash (Server API orqali)
async function saveDataToStorage() {
    await SmartUtils.save('smart_pch_workers', workersData);
    await SmartUtils.save('smart_pch_trains', trainsData);
    await SmartUtils.save('smart_pch_stations', stationsData);
}

// Sahifa yuklanganida ma'lumotlarni yuklash
document.addEventListener('DOMContentLoaded', async () => {
    await loadDataFromStorage();
});

// Xodimlar harakat yo'llari (polylines)
let workerRoutes = {};
workersData.forEach(worker => {
    workerRoutes[worker.id] = [
        [worker.lat, worker.lng],
        [worker.lat + 0.05, worker.lng + 0.03],
        [worker.lat + 0.08, worker.lng - 0.02],
        [worker.lat + 0.12, worker.lng + 0.05]
    ];
});

let trainLiveMap = null;
let workerMarkers = [];
let trainMarkers = [];
let routePolylines = [];

// Bo'limlar ma'lumotlari
const departments = window.INITIAL_DATA.departments;

// Har bir bo'linma uchun ichki bo'limlar
// Generate sections data dynamically or from data.js
const sectionsData = {};
departments.forEach(dept => {
    if (dept.id !== 'dashboard') {
        sectionsData[dept.id] = [
            { id: 1, name: 'Ishlab chiqarish', icon: 'fas fa-industry', description: 'Mahsulot ishlab chiqarish va sifati nazorati' },
            { id: 2, name: 'Xodimlar', icon: 'fas fa-users', description: 'Xodimlar boshqaruvi va mehnat shartnomalari' },
            { id: 3, name: 'Bugalteriya', icon: 'fas fa-calculator', description: 'Moliya hisoboti va byudjet rejalashtirish' },
            { id: 4, name: 'Mexanika', icon: 'fas fa-cog', description: "Texnika texnik xizmat ko'rsatish va ta'mirlash", integrations: ['mexanika-monitor'] },
            { id: 5, name: 'Iqtisod', icon: 'fas fa-chart-line', description: 'Iqtisodiy tahlil, PU-74 va narxlar siyosati' },
            { id: 6, name: 'Dispetcher', icon: 'fas fa-tower-broadcast', description: 'Transport harakatini boshqarish' },
            { id: 7, name: 'Metrologiya', icon: 'fas fa-ruler-combined', description: "O'lchov asboblarini kalibrlash" },
            { id: 8, name: 'Mehnat muhofazasi', icon: 'fas fa-hard-hat', description: 'Ish xavfsizligi va atrof-muhit' }
        ];
    }
});

// Dispatcher Daily Work System Logic (Subdivision -> Dispatcher)
let subdivisionReports = {};
let reportsHistory = {};
let roadManagementData = {};

async function initPersistentData() {
    subdivisionReports = await SmartUtils.load('subdivisionReports', {});
    reportsHistory = await SmartUtils.load('subdivisionReportsHistory', {});
    roadManagementData = await SmartUtils.load('roadManagementData', {});

    // Cleanup reports for old dates and Archive them
    const todayStr = new Date().toLocaleDateString();
    let dataChanged = false;

    for (const bId in subdivisionReports) {
        const report = subdivisionReports[bId];
        const reportDate = report.date;

        if (!reportsHistory[reportDate]) {
            reportsHistory[reportDate] = {};
        }
        reportsHistory[reportDate][bId] = report;

        if (report.date !== todayStr) {
            delete subdivisionReports[bId];
            dataChanged = true;
        }
    }

    if (dataChanged) {
        await SmartUtils.save('subdivisionReportsHistory', reportsHistory);
        await SmartUtils.save('subdivisionReports', subdivisionReports);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await initPersistentData();
});

function getReportSubmissionPanelHTML(bolinmaId) {
    const report = subdivisionReports[bolinmaId];
    const isSent = report && report.date === new Date().toLocaleDateString();
    const isSubUser = currentUser.role === 'bolinma' && currentUser.bolinmalar.includes(bolinmaId);

    if (!isSubUser) {
        return `
                                        <div class="dispatcher-control-panel">
                                            <div class="dispatcher-control-header">
                                                <i class="fas fa-info-circle"></i> Bo'linma ish rejasi (Ko'rish rejimida)
                                            </div>
                                            <div style="padding: 20px; text-align: center; background: rgba(0,0,0,0.2); border-radius: 0 0 15px 15px;">
                                                ${isSent ? `
                                                    <div style="color: #2ecc71; margin-bottom: 15px;">
                                                        <i class="fas fa-check-circle" style="font-size: 2.5rem;"></i>
                                                        <div style="margin-top: 10px; font-weight: bold; font-size: 1.1rem;">Bugungi reja yuborilgan</div>
                                                        <div style="font-size: 0.8rem; opacity: 0.6;">Yuborilgan vaqt: ${report.time}</div>
                                                    </div>
                                                    <div id="print-area-${bolinmaId}" style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; font-size: 1rem; color: rgba(255,255,255,0.9); line-height: 1.6; text-align: left; border-left: 4px solid #2ecc71; margin-bottom: 10px;">
                                                        "${report.text}"
                                                    </div>
                                                    <button onclick="SmartUtils.exportToPDF('print-area-${bolinmaId}', 'Hisobot_${bolinmaId}', {title: 'KUNLIK ISH REJASI', subtitle: '${bolinmaId} - ' + new Date().toLocaleDateString()})" 
                                                            style="background: rgba(231, 76, 60, 0.2); border: 1px solid rgba(231, 76, 60, 0.5); color: #e74c3c; padding: 8px 15px; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">
                                                        <i class="fas fa-file-pdf"></i> Hisobotni PDF qilish
                                                    </button>
                                                ` : `
                                                    <div style="color: #f1c40f; padding: 20px;">
                                                        <i class="fas fa-hourglass-half" style="font-size: 2.5rem; animation: pulse 2s infinite;"></i>
                                                        <div style="margin-top: 15px; font-weight: bold; font-size: 1.1rem;">Reja hali yuborilmagan</div>
                                                        <p style="font-size: 0.85rem; opacity: 0.7; margin-top: 10px;">Bo'linma tomonidan ma'lumot kiritilishi kutilmoqda.</p>
                                                    </div>
                                                `}
                                            </div>
                                        </div>
                                    `;
    }

    return `
                                    <div class="dispatcher-control-panel" id="report-panel-${bolinmaId}">
                                        <div class="dispatcher-control-header">
                                            <i class="fas fa-file-alt"></i> Dispetcerga kunlik ish rejasini yuborish
                                        </div>
                                        <div class="dispatcher-form" style="display: ${isSent ? 'none' : 'grid'}">
                                            <div class="form-group" style="grid-column: span 2;">
                                                <label style="display: block; margin-bottom: 5px; font-size: 0.8rem; color: rgba(255,255,255,0.6);">Bugungi ish rejasi:</label>
                                                <textarea id="report-content-input-${bolinmaId}" placeholder="Bugungi rejalashtirilgan ishlar haqida yozing..." style="width: 100%; min-height: 120px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; padding: 12px; outline: none; transition: border-color 0.3s;"></textarea>
                                            </div>
                                            <button class="send-task-btn" onclick="submitSubdivisionReport('${bolinmaId}')" style="background: linear-gradient(45deg, #2ecc71, #27ae60); border: none; padding: 12px; border-radius: 10px; color: white; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: transform 0.2s;">
                                                <i class="fas fa-paper-plane"></i> Yuborish
                                            </button>
                                        </div>
                                        <div class="report-sent-status" style="display: ${isSent ? 'flex' : 'none'}; flex-direction: column; align-items: center; gap: 15px; color: #2ecc71; padding: 20px; background: rgba(46, 204, 113, 0.05); border-radius: 0 0 15px 15px;">
                                            <div style="display: flex; align-items: center; gap: 10px; font-weight: bold;">
                                                <i class="fas fa-check-double"></i> Bugungi hisobot dispetcerga yuborildi.
                                            </div>
                                            <div style="display: flex; gap: 10px;">
                                                <button class="control-btn" style="padding: 8px 15px; font-size: 0.8rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 8px;" onclick="editSubdivisionReport('${bolinmaId}')">Tahrirlash</button>
                                                <button class="control-btn" style="padding: 8px 15px; font-size: 0.8rem; background: rgba(231, 76, 60, 0.2); border: 1px solid rgba(231, 76, 60, 0.5); color: #e74c3c; border-radius: 8px;" onclick="SmartUtils.exportToPDF('print-area-${bolinmaId}', 'Hisobot_${bolinmaId}', {title: 'KUNLIK ISH REJASI', subtitle: '${bolinmaId} - ' + new Date().toLocaleDateString()})">
                                                    <i class="fas fa-file-pdf"></i> PDF Yuklash
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `;
}

async function submitSubdivisionReport(bolinmaId) {
    const input = document.getElementById(`report-content-input-${bolinmaId}`);
    const content = input.value.trim();

    if (!content) {
        showToast('Iltimos, ish rejasini kiriting!', 'warning');
        return;
    }

    try {
        const result = await SmartUtils.fetchAPI('/reports', {
            method: 'POST',
            body: JSON.stringify({
                bolinma_id: bolinmaId,
                content: content,
                user_id: currentUser.id
            })
        });

        if (result) {
            // Update local state for immediate UI feedback
            subdivisionReports[bolinmaId] = {
                text: content,
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
                status: 'received'
            };

            // Notify via Socket if available
            if (window.socket) {
                window.socket.emit('send_report', {
                    bolinma_id: bolinmaId,
                    bolinma_name: subdivisions.find(s => s.id === bolinmaId)?.name || bolinmaId,
                    content: content,
                    time: subdivisionReports[bolinmaId].time
                });
            }

            showToast("Ish rejasi dispetcerga muvaffaqiyatli yuborildi!", 'success');

            // Refresh current window view
            const panel = document.getElementById(`report-panel-${bolinmaId}`);
            if (panel) {
                panel.querySelector('.dispatcher-form').style.display = 'none';
                panel.querySelector('.report-sent-status').style.display = 'flex';
                // Update text in print area
                const printArea = document.getElementById(`print-area-${bolinmaId}`);
                if (printArea) printArea.innerText = content;
                startConfetti();
            }
        }
    } catch (error) {
        showToast('Hisobotni yuborishda xatolik: ' + error.message, 'error');
    }
}

async function loadReportsFromServer() {
    try {
        const reports = await SmartUtils.fetchAPI('/reports/today');
        if (reports) {
            reports.forEach(r => {
                subdivisionReports[r.bolinma_id] = {
                    text: r.content,
                    time: r.time,
                    date: r.date,
                    status: 'received'
                };
            });
            // Update UI if on dispatcher dashboard
            if (currentUser.departments.includes('dispetcher')) {
                renderMainContent(); // Refresh dashboard to show new counts
            }
        }
    } catch (error) {
        console.error('Reports load failed:', error);
    }
}

function getDispatcherDashboardHTML() {
    // Security check: Only allow Dispatcher or Admin
    if (!currentUser || (!currentUser.departments.includes('dispetcher') && currentUser.role !== 'admin')) {
        return '';
    }

    const totalSub = subdivisions.length;
    const reports = subdivisionReports || {};
    const sentCount = Object.keys(reports).filter(id => reports[id].date === new Date().toLocaleDateString()).length;
    const pendingCount = totalSub - sentCount;

    return `
                                    <div class="dispatcher-dashboard" style="background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid rgba(0, 198, 255, 0.2); padding: 25px; margin-bottom: 25px; box-shadow: 0 15px 35px rgba(0,0,0,0.4);">
                                        <!-- Dashboard Header -->
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px;">
                                            <div>
                                                <h2 style="margin: 0; font-size: 1.8rem; background: linear-gradient(45deg, #00c6ff, #0072ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; display: flex; align-items: center; gap: 15px;">
                                                    <i class="fas fa-satellite-dish"></i> Markaziy Dispetcher Nazorati
                                                </h2>
                                                <div style="display: flex; align-items: center; gap: 15px; margin-top: 8px;">
                                                    <span style="font-size: 0.9rem; color: rgba(255,255,255,0.6);">
                                                        <i class="far fa-calendar-alt"></i> ${new Date().toLocaleDateString()}
                                                    </span>
                                                    <span class="pulse-badge" style="background: rgba(46, 204, 113, 0.2); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.3); padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: bold; letter-spacing: 1px;">
                                                        <i class="fas fa-circle" style="font-size: 0.5rem; vertical-align: middle; margin-right: 5px;"></i> LIVE TRACKING
                                                    </span>
                                                </div>
                                            </div>

                                            <div style="display: flex; gap: 20px;">
                                                <div style="background: rgba(46, 204, 113, 0.1); border: 1px solid rgba(46, 204, 113, 0.2); padding: 12px 20px; border-radius: 15px; min-width: 120px; text-align: center;">
                                                    <div style="color: #2ecc71; font-size: 0.75rem; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">Qabul qilindi</div>
                                                    <div style="color: #fff; font-size: 1.5rem; font-weight: 800;">${sentCount}</div>
                                                </div>
                                                <div style="background: rgba(241, 196, 15, 0.1); border: 1px solid rgba(241, 196, 15, 0.2); padding: 12px 20px; border-radius: 15px; min-width: 120px; text-align: center;">
                                                    <div style="color: #f1c40f; font-size: 0.75rem; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">Kutilmoqda</div>
                                                    <div style="color: #fff; font-size: 1.5rem; font-weight: 800;">${pendingCount}</div>
                                                </div>
                                                <button onclick="openHistoryModal()" style="background: rgba(52, 152, 219, 0.1); border: 1px solid rgba(52, 152, 219, 0.2); padding: 0 20px; border-radius: 15px; cursor: pointer; color: #3498db; transition: all 0.3s; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                                    <i class="fas fa-history" style="font-size: 1.2rem; margin-bottom: 5px;"></i>
                                                    <span style="font-size: 0.8rem; font-weight: bold;">Tarix</span>
                                                </button>
                                            </div>
                                        </div>

                                        <!-- Reports Grid -->
                                        <div class="reports-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px;">
                                            ${subdivisions.map(s => {
        const report = reports[s.id];
        const isSent = report && report.date === new Date().toLocaleDateString();

        return `
                                    <div class="report-card" onclick="openAdminSubdivisionView('${s.id}')" style="background: rgba(255,255,255,0.03); border: 1px solid ${isSent ? 'rgba(46, 204, 113, 0.2)' : 'rgba(255,255,255,0.05)'}; border-radius: 18px; padding: 22px; position: relative; transition: transform 0.3s ease, box-shadow 0.3s ease; cursor: pointer;">
                                                        ${isSent ? `
                                                            <div style="position: absolute; top: -10px; right: 20px; background: #2ecc71; color: white; padding: 4px 12px; border-radius: 10px; font-size: 0.7rem; font-weight: bold; box-shadow: 0 4px 10px rgba(46, 204, 113, 0.3);">
                                                                <i class="fas fa-check-double"></i> QABUL QILINDI
                                                            </div>
                                                        ` : ''}

                                                        <div style="display: flex; gap: 15px; align-items: flex-start; margin-bottom: 20px;">
                                                            <div style="width: 50px; height: 50px; border-radius: 14px; background: ${isSent ? 'linear-gradient(135deg, #2ecc71, #27ae60)' : 'rgba(255,255,255,0.05)'}; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: ${isSent ? 'white' : 'rgba(255,255,255,0.2)'};">
                                                                <i class="fas fa-hard-hat"></i>
                                                            </div>
                                                            <div style="flex: 1;">
                                                                <h4 style="margin: 0; font-size: 1.1rem; color: #fff; font-weight: 700;">${s.name}</h4>
                                                                <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px;">
                                                                    <i class="fas fa-user-tie" style="font-size: 0.75rem; color: rgba(255,255,255,0.4);"></i>
                                                                    <span style="font-size: 0.8rem; color: rgba(255,255,255,0.5);">${s.manager || 'Ma\'sul xodim'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 18px; border-left: 3px solid ${isSent ? '#2ecc71' : 'rgba(255,255,255,0.1)'}; min-height: 90px;">
                                                            <div style="font-size: 0.95rem; line-height: 1.6; color: ${isSent ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)'}; font-style: ${isSent ? 'normal' : 'italic'};">
                                                                ${isSent ? report.text : 'Ushbu bo\'linma tomonidan hali ish rejasi taqdim etilmadi...'}
                                                            </div>
                                                        </div>

                                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
                                                            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.4);">
                                                                <i class="far fa-clock"></i> ${isSent ? report.time : '--:--'}
                                                            </div>
                                                            <div style="display: flex; align-items: center; gap: 10px;">
                                                                <button onclick="openTrainScheduleModal('${s.id}', event)" style="background: rgba(0, 198, 255, 0.1); border: 1px solid rgba(0, 198, 255, 0.3); color: #00c6ff; padding: 5px 10px; border-radius: 8px; cursor: pointer; font-size: 0.75rem; transition: all 0.2s;" onmouseover="this.style.background='rgba(0,198,255,0.2)'" onmouseout="this.style.background='rgba(0,198,255,0.1)'">
                                                                    <i class="fas fa-train"></i> Poyezdlar
                                                                </button>
                                                                <div style="font-size: 0.75rem; font-weight: 600; color: ${isSent ? '#2ecc71' : '#f1c40f'}; text-transform: uppercase; letter-spacing: 0.5px;">
                                                                    ${isSent ? 'Barcha ma\'lumotlar joyida' : 'KIRISH KUTILMOQDA'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                `;
    }).join('')}
                                        </div>
                                    </div>
                                `;
}

// --- SMART SUBDIVISION DASHBOARD START ---
function getSmartSubdivisionDashboardHTML(user) {
    return `
                                <style>
                                    /* Smart Dashboard Styles */
                                    .smart-dashboard-grid { display: grid; grid-template-columns: 1fr 350px; gap: 25px; margin-bottom: 30px; }
                                    .announcement-ticker { background: rgba(0, 198, 255, 0.1); border: 1px solid rgba(0, 198, 255, 0.3); border-radius: 10px; padding: 10px 20px; display: flex; align-items: center; gap: 15px; margin-bottom: 25px; color: #00c6ff; overflow: hidden; }
                                    .ticker-wrapper { flex: 1; overflow: hidden; }
                                    .ticker-text { display: inline-block; white-space: nowrap; animation: ticker 30s linear infinite; color: white; }
                                    @keyframes ticker { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
                                    
                                    .digital-twin-map { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(10px); border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1); padding: 25px; min-height: 400px; display: flex; flex-direction: column; position: relative; }
                                    .map-viz { flex: 1; position: relative; background: rgba(0,0,0,0.2); border-radius: 15px; margin-top: 15px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
                                    .track-main { width: 90%; height: 8px; background: #34495e; position: relative; border-radius: 4px; }
                                    .track-defect { position: absolute; width: 24px; height: 24px; background: #e74c3c; border-radius: 50%; top: -8px; box-shadow: 0 0 15px #e74c3c; animation: pulse-red 1.5s infinite; cursor: pointer; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.6rem; color: white; z-index: 2; transition: transform 0.2s; }
                                    .track-defect:hover { transform: scale(1.2); z-index: 10; }
                                    .track-ok { position: absolute; width: 16px; height: 16px; background: #2ecc71; border-radius: 50%; top: -4px; box-shadow: 0 0 10px #2ecc71; cursor: pointer; }
                                    @keyframes pulse-red { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }

                                    .smart-sidebar { display: flex; flex-direction: column; gap: 20px; }
                                    .smart-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                                    .advice-card { background: linear-gradient(135deg, rgba(243, 156, 18, 0.1), rgba(241, 196, 15, 0.1)); border-color: rgba(241, 196, 15, 0.3); }
                                    .countdown-display { display: flex; justify-content: space-around; margin-top: 10px; font-family: monospace; font-size: 1.5rem; color: #00c6ff; }
                                    
                                    .kanban-board { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 30px; }
                                    .kanban-col { background: rgba(255,255,255,0.03); border-radius: 15px; padding: 15px; min-height: 200px; transition: background 0.3s; }
                                    .kanban-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; }
                                    .add-task-btn { background: none; border: none; color: white; cursor: pointer; opacity: 0.7; transition: opacity 0.2s; font-size: 1.1rem; }
                                    .add-task-btn:hover { opacity: 1; color: #2ecc71; }
                                    .task-card { background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid #2ecc71; transition: transform 0.2s; cursor: grab; font-size: 0.9rem; position: relative; user-select: none; }
                                    .task-card:active { cursor: grabbing; }
                                    .task-card:hover { transform: translateY(-3px); background: rgba(255,255,255,0.08); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
                                    .task-card.urgent { border-left-color: #e74c3c; }
                                    .task-actions { position: absolute; top: 5px; right: 5px; display: none; }
                                    .task-card:hover .task-actions { display: flex; gap: 5px; }
                                    .edit-btn, .delete-btn { background: rgba(0,0,0,0.3); border: none; color: white; border-radius: 3px; padding: 2px 5px; cursor: pointer; font-size: 0.7rem; }
                                    .delete-btn:hover { background: #e74c3c; }
                                    .edit-btn:hover { background: #3498db; }
                                    
                                    /* Map Controls */
                                    .map-controls { position: absolute; top: 15px; right: 25px; display: flex; gap: 10px; }
                                    .map-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 5px; padding: 5px 10px; cursor: pointer; backdrop-filter: blur(5px); transition: all 0.2s; }
                                    .map-btn:hover { background: rgba(255,255,255,0.2); }
                                </style>

                                <div class="announcement-ticker">
                                    <i class="fas fa-bullhorn" style="font-size: 1.2rem;"></i>
                                    <div class="ticker-wrapper">
                                        <div class="ticker-text">
                                            📢 DIQQAT: Buxoro mintaqaviy temir yo'l uzeli rahbariyati xabar qiladi: Ertaga soat 10:00 da barcha bo'linma rahbarlari ishtirokida video-selektor yig'ilishi bo'lib o'tadi. Hisobotlarni tayyorlang! &nbsp;&nbsp;&nbsp;&nbsp; /// &nbsp;&nbsp;&nbsp;&nbsp; 🛠️ Yangi "Smart Diagnostika" uskunalari tarqatilmoqda, qabul qilib olishni unutmang.
                                        </div>
                                    </div>
                                </div>

                                <div class="smart-dashboard-grid">
                                    <!-- Left: Digital Twin Map -->
                                    <div class="digital-twin-map">
                                        <div style="display: flex; justify-content: space-between; align-items: start;">
                                            <div>
                                                <h3 style="margin: 0; color: white;"><i class="fas fa-map-marked-alt"></i> Mening Hududim (Raqamli Egizak)</h3>
                                                <span id="pk-range-display" onclick="editPKRange()" style="cursor: pointer; background: rgba(46, 204, 113, 0.2); color: #2ecc71; padding: 3px 10px; border-radius: 10px; font-size: 0.8rem; display: inline-block; margin-top: 5px;" title="Tahrirlash uchun bosing">PK 145 - PK 165</span>
                                            </div>
                                            <div class="map-controls">
                                                <button class="map-btn" onclick="addDefectPrompt()" title="Nuqson qo'shish"><i class="fas fa-plus-circle"></i> Nuqson</button>
                                                <button class="map-btn" onclick="refreshMap()" title="Yangilash"><i class="fas fa-sync-alt"></i></button>
                                            </div>
                                        </div>
                                        <div class="map-viz" id="subdivisionMap">
                                            <!-- JS will render map here -->
                                            <div class="track-main" id="track-line">
                                                <!-- Dynamic defects will be injected here -->
                                            </div>
                                            <div style="position: absolute; bottom: 10px; left: 10px; font-size: 0.8rem; color: rgba(255,255,255,0.5);">
                                                Simulyatsiya rejimi: Tahrirlash
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Right: Smart Sidebars -->
                                    <div class="smart-sidebar">
                                        <!-- Smart Advice -->
                                        <div class="smart-card advice-card">
                                            <h4 style="margin: 0 0 10px 0; color: #f1c40f;"><i class="fas fa-lightbulb"></i> Smart Tavsiya</h4>
                                            <div id="smart-advice-text" style="font-size: 0.9rem; line-height: 1.4; color: rgba(255,255,255,0.9);">
                                                <i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...
                                            </div>
                                        </div>

                                        <!-- Countdown -->
                                        <div class="smart-card">
                                            <h4 style="margin: 0 0 10px 0; color: #00c6ff;"><i class="fas fa-stopwatch"></i> Oylik hisobotgacha</h4>
                                            <div class="countdown-display">
                                                <div style="text-align: center;">
                                                    <div id="cnt-days">--</div>
                                                    <div style="font-size: 0.7rem; color: #888;">Kun</div>
                                                </div>
                                                <div>:</div>
                                                <div style="text-align: center;">
                                                    <div id="cnt-hours">--</div>
                                                    <div style="font-size: 0.7rem; color: #888;">Soat</div>
                                                </div>
                                                <div>:</div>
                                                <div style="text-align: center;">
                                                    <div id="cnt-minutes">--</div>
                                                    <div style="font-size: 0.7rem; color: #888;">Daqiqa</div>
                                                </div>
                                            </div>
                                            <div style="margin-top: 10px; font-size: 0.8rem; text-align: center; color: rgba(255,255,255,0.5);">
                                                Oylik hisobot muddati
                                            </div>
                                        </div>
                                        
                                        <!-- MONITORING CARDS -->
                                        <div id="homepage-monitoring-container">
                                            <!-- Will be populated by JavaScript -->
                                        </div>
                                    </div>
                                </div>


                                <!-- Train Radar Widget -->
                                <div id="trainRadarContainer" style="margin-bottom: 30px; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(10px); border-radius: 20px; border: 1px solid rgba(0,242,255,0.2); padding: 20px;">
                                    <!-- Dynamic Content will be loaded by initTrainRadar() -->
                                    <div style="text-align: center; color: rgba(255,255,255,0.3);">
                                        <i class="fas fa-spinner fa-spin"></i> Poyezdlar jadvali yuklanmoqda...
                                    </div>
                                </div>

                                <!-- Bottom: Kanban Tasks -->
                                <h3 style="margin: 0; color: white;"><i class="fas fa-tasks"></i> Bugungi Vazifalar (Tahrirlash: 2 marta bosing)</h3>
                                <div class="kanban-board">
                                    <div class="kanban-col" id="col-todo" ondrop="drop(event)" ondragover="allowDrop(event)">
                                        <div class="kanban-header">
                                            <span style="color: #f1c40f;">Bajarish kerak (To Do)</span>
                                            <button class="add-task-btn" onclick="addNewTask('todo')"><i class="fas fa-plus"></i></button>
                                        </div>
                                        <!-- Dynamic tasks -->
                                    </div>

                                    <div class="kanban-col" id="col-progress" ondrop="drop(event)" ondragover="allowDrop(event)">
                                        <div class="kanban-header">
                                            <span style="color: #3498db;">Jarayonda (In Progress)</span>
                                            <button class="add-task-btn" onclick="addNewTask('progress')"><i class="fas fa-plus"></i></button>
                                        </div>
                                        <!-- Dynamic tasks -->
                                    </div>

                                    <div class="kanban-col" id="col-done" ondrop="drop(event)" ondragover="allowDrop(event)">
                                        <div class="kanban-header">
                                            <span style="color: #2ecc71;">Bajarildi (Done)</span>
                                            <button class="add-task-btn" onclick="addNewTask('done')"><i class="fas fa-plus"></i></button>
                                        </div>
                                        <!-- Dynamic tasks -->
                                    </div>
                                </div>

                                <!-- ADDED: Chart, Weather, News for Subdivision -->
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;">
                                    
                                    <!-- Weather -->
                                    <div class="weather-section" style="margin: 0;">
                                        <div class="weather-header">
                                            <h3 class="weather-title">
                                                <i class="fas fa-cloud-sun"></i> Buxoro ob-havo
                                            </h3>
                                            <button class="refresh-weather">
                                                <i class="fas fa-sync-alt"></i>
                                            </button>
                                        </div>
                                        <div class="weather-container">
                                            <div class="weather-loading">
                                                <i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Chart -->
                                    <div class="competition-section" style="margin: 0;">
                                        <div class="chart-header">
                                            <h3 class="chart-title">
                                                <i class="fas fa-chart-bar"></i> Raqobat Grafigi
                                            </h3>
                                        </div>
                                        <div class="chart-container">
                                            <canvas id="competitionChart"></canvas>
                                        </div>
                                    </div>
                                </div>

                                <!-- News -->
                                <div class="news-section" style="margin-top: 20px;">
                                    <div class="news-header">
                                        <h3 class="news-title">
                                            <i class="fas fa-newspaper"></i> So'nggi yangiliklar
                                        </h3>
                                        <button class="refresh-news">
                                            <i class="fas fa-sync-alt"></i> Yangilash
                                        </button>
                                    </div>
                                    <div class="news-container">
                                        <div class="loading-news">
                                            <i class="fas fa-spinner fa-spin"></i> Yangiliklarni yuklanmoqda...
                                        </div>
                                    </div>
                                </div>
                            `;
}

// Global helper functions for inline calls
window.allowDrop = function (ev) {
    ev.preventDefault();
}

window.drop = async function (ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var draggedElement = document.getElementById(data);
    if (draggedElement) {
        var target = ev.target;
        // Need to find the closest column if dropped on a child
        while (target && !target.classList.contains('kanban-col')) {
            target = target.parentElement;
        }
        if (target) {
            const newStatus = target.id.replace('col-', '');
            const taskId = draggedElement.id.split('-').pop();

            try {
                await SmartUtils.fetchAPI(`/tasks/${taskId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: newStatus })
                });
                target.appendChild(draggedElement);
                showToast('Vazifa holati yangilandi', 'success');
            } catch (error) {
                showToast('Holatni yangilashda xatolik: ' + error.message, 'error');
            }
        }
    }
}

// Persisting map defects
// Persisting map defects
window.addDefectPrompt = function () {
    const range = getPKRange();
    const pk = prompt(`PK raqamini kiriting (${range.start}-${range.end} oralig'ida):`, Math.floor((range.start + range.end) / 2));
    if (!pk) return;
    const issue = prompt("Nuqson nomini kiriting:", "Bolt bo'shashi");
    if (!issue) return;

    addDefectToMap(pk, issue);
}

window.refreshMap = function () {
    renderMapDefects();
    alert('Xarita yangilandi');
}

window.editPKRange = function () {
    const current = getPKRange();
    const newStart = prompt("Boshlanish PK raqamini kiriting:", current.start);
    if (!newStart) return;
    const newEnd = prompt("Tugash PK raqamini kiriting:", current.end);
    if (!newEnd) return;

    const range = { start: parseInt(newStart), end: parseInt(newEnd) };
    localStorage.setItem(getDataKeys().PK_RANGE, JSON.stringify(range));
    renderPKRange(); // Update UI
    renderMapDefects(); // Re-render map with new scale
}

window.addNewTask = async function (columnId) {
    const title = prompt("Vazifa nomini kiriting:");
    if (!title) return;
    const deadline = prompt("Muddatni kiriting (Masalan: 18:00):", "18:00");

    const bolinmaId = currentUser.bolinmalar ? currentUser.bolinmalar[0] : null;
    if (!bolinmaId) return;

    try {
        const result = await SmartUtils.fetchAPI('/tasks', {
            method: 'POST',
            body: JSON.stringify({
                bolinma_id: bolinmaId,
                user_id: currentUser.id,
                title: title,
                deadline: deadline || '18:00',
                status: columnId,
                is_urgent: false
            })
        });

        if (result) {
            renderTask({
                id: result.id,
                title: title,
                deadline: deadline || '18:00',
                column: columnId,
                urgent: false
            });
            showToast('Yangi vazifa qo\'shildi', 'success');
        }
    } catch (error) {
        showToast('Vazifa qo\'shishda xatolik: ' + error.message, 'error');
    }
}


function initSubdivisionFeatures() {
    // 0. Render PK Range
    renderPKRange();

    // 1. Load and Render Tasks
    loadTasks();

    // 2. Load and Render Map
    renderMapDefects();

    // 2.5 Render Homepage Monitoring Cards
    renderHomepageMonitoring();

    // 2.6 Show Defectoscope Button
    const defectBtn = document.getElementById('openDefectoscopeBtn');
    if (defectBtn) {
        defectBtn.style.display = 'flex';
    }

    // 3. Countdown — Oylik hisobot muddati (har oyning oxirgi kuni)
    function updateCountdown() {
        const now = new Date();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const distance = endOfMonth - now;

        if (distance < 0) return;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        const dEl = document.getElementById('cnt-days');
        const hEl = document.getElementById('cnt-hours');
        const mEl = document.getElementById('cnt-minutes');
        if (dEl) dEl.innerText = String(days).padStart(2, '0');
        if (hEl) hEl.innerText = String(hours).padStart(2, '0');
        if (mEl) mEl.innerText = String(minutes).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 60000);

    // 4. Smart Tavsiya (dinamik)
    updateSmartAdvice();
}

// Dinamik Smart Tavsiya generatori
function updateSmartAdvice() {
    const el = document.getElementById('smart-advice-text');
    if (!el) return;

    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth(); // 0-11

    let advices = [];

    // Fasl bo'yicha tavsiyalar
    if (month >= 5 && month <= 8) { // Yoz: iyun-sentyabr
        advices.push('🌡️ <strong>Yozgi ogohlantirish:</strong> Havo harorati yuqori. Rels harorati 50°C dan oshmasligi uchun 12:00–16:00 oralig\'ida tezlikni kamaytiring va haroratni o\'lchash jurnalini yuritish maj buriy.');
        advices.push('💧 <strong>Yozgi nazorat:</strong> Rels kengayishi kuzatilishi lozim. Geometrik o\'lchovlarni kundalik rejada bajarishni unutmang.');
    } else if (month >= 11 || month <= 1) { // Qish: dekabr-fevral
        advices.push('❄️ <strong>Qishki ogohlantirish:</strong> Past harorat relslarda sinish xavfini oshiradi. Rel birikmalari va strelkalar har kuni tekshirilsin. Strelka isitish moslamalari faolligi nazorat qilinsin.');
        advices.push('🌨️ <strong>Qorli havo:</strong> Yo\'llarni qordan tozalash dasturini kechiktirmang. Strelkalar o\'tkazuvchanligi tekshirilsin.');
    } else if (month >= 2 && month <= 4) { // Bahor: mart-may
        advices.push('🌸 <strong>Bahorgi nazorat:</strong> Qor erishi natijasida yer cho\'kishi va yon bag\'ir harakati kuzatilishi mumkin. Gidrologik nuqtalarni kuchaytiring.');
        advices.push('🔧 <strong>Bahorgi TA:</strong> Rels va balast holati bahorgi tekshiruvdan o\'tkazilsin. Geometrik o\'lchov rejasini bajaring.');
    } else { // Kuz: oktyabr-noyabr
        advices.push('🍂 <strong>Kuzgi nazorat:</strong> Barglar yo\'lda siqilmasligini nazorat qiling. Tormozlash masofasi uzayishi mumkin. Signalizatsiya tizimlarini tekshiring.');
        advices.push('🌧️ <strong>Yomg\'irli mavsim:</strong> Namlik tufayli to\'siqlar va ko\'priklar holati kuzatilsin. Vodootvedenie tizimini tozalang.');
    }

    // Kun vaqti bo'yicha tavsiya
    if (hour >= 6 && hour < 12) {
        advices.push('🌅 <strong>Ertalabki vazifa:</strong> Navbat boshida yo\'l holatini vizyual tekshiring. Strelka va signalizatsiya ishini tekshiring.');
    } else if (hour >= 12 && hour < 18) {
        advices.push('☀️ <strong>Kunduzi:</strong> Intensiv harakat vaqtida intervalni oshiring. Poyezd o\'tishidan so\'ng darhol tekshiruv bajaring.');
    } else {
        advices.push('🌙 <strong>Kechki navorat:</strong> Tungi nazorat rejimini yoqing. Belgilash chiroqlari va svetoforlar ishlashini tekshiring.');
    }

    // Tasodifiy tavsiya tanlash
    const chosen = advices[Math.floor(Math.random() * advices.length)];
    el.innerHTML = chosen;
}

// --- CORE LOGIC FOR SMART INTERACTIVITY ---

// Dynamic Keys based on logged in user
function getDataKeys() {
    // Use 'currentUser' available in scope
    const uid = (typeof currentUser !== 'undefined' && currentUser.username) ? currentUser.username : 'guest';
    return {
        TASKS: `smart_tasks_${uid}`,
        DEFECTS: `smart_defects_${uid}`,
        PK_RANGE: `smart_pk_range_${uid}`
    };
}

// Default PK Range
function getPKRange() {
    const key = getDataKeys().PK_RANGE;
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    return { start: 145, end: 165 };
}

function renderPKRange() {
    const range = getPKRange();
    const el = document.getElementById('pk-range-display');
    if (el) el.innerText = `PK ${range.start} - PK ${range.end}`;
}

// Initial Dummy Data if empty
function getInitialTasks() {
    return []; // Start empty so users have their own space
}

function getInitialDefects() {
    return []; // Start empty
}

async function loadTasks() {
    const bolinmaId = window.viewingSubdivisionId || (currentUser.bolinmalar ? currentUser.bolinmalar[0] : null);
    if (!bolinmaId) return;

    // Clear columns
    const colTodo = document.getElementById('col-todo');
    const colProgress = document.getElementById('col-progress');
    const colDone = document.getElementById('col-done');

    if (colTodo) colTodo.innerHTML = `<div class="kanban-header"><span style="color: #f1c40f;">Bajarish kerak (To Do)</span><button class="add-task-btn" onclick="addNewTask('todo')"><i class="fas fa-plus"></i></button></div>`;
    if (colProgress) colProgress.innerHTML = `<div class="kanban-header"><span style="color: #3498db;">Jarayonda (In Progress)</span><button class="add-task-btn" onclick="addNewTask('progress')"><i class="fas fa-plus"></i></button></div>`;
    if (colDone) colDone.innerHTML = `<div class="kanban-header"><span style="color: #2ecc71;">Bajarildi (Done)</span><button class="add-task-btn" onclick="addNewTask('done')"><i class="fas fa-plus"></i></button></div>`;

    try {
        const tasks = await SmartUtils.fetchAPI(`/tasks/${bolinmaId}`);
        if (tasks) {
            tasks.forEach(t => renderTask({
                id: t.id,
                title: t.title,
                deadline: t.deadline,
                column: t.status,
                urgent: t.is_urgent === 1
            }));
        }
    } catch (error) {
        console.error('Task load failed:', error);
    }
}

function saveTasks() {
    const tasks = [];
    ['todo', 'progress', 'done'].forEach(colId => {
        const col = document.getElementById('col-' + colId);
        if (!col) return; // Ustun topilmasa skip qil
        const cards = col.querySelectorAll('.task-card');
        cards.forEach(card => {
            const strongEl = card.querySelector('strong');
            const metaEl = card.querySelector('.task-meta');
            tasks.push({
                id: card.id,
                title: strongEl ? strongEl.innerText : '',
                deadline: metaEl ? metaEl.innerText : '',
                column: colId,
                urgent: card.classList.contains('urgent')
            });
        });
    });
    localStorage.setItem(getDataKeys().TASKS, JSON.stringify(tasks));
}

function renderTask(task) {
    const col = document.getElementById('col-' + task.column);
    if (!col) return;

    const div = document.createElement('div');
    div.className = `task-card ${task.urgent ? 'urgent' : ''}`;
    div.id = task.id;
    div.draggable = true;
    div.innerHTML = `
                                <strong>${task.title}</strong>
                                <div class="task-meta" style="font-size: 0.8rem; color: #aaa; margin-top: 5px;">${task.deadline}</div>
                                <div class="task-actions">
                                    <button class="delete-btn" onclick="deleteTask(this, event)" title="O'chirish">&times;</button>
                                </div>
                            `;

    div.addEventListener('dragstart', function (ev) {
        ev.dataTransfer.setData("text", ev.target.id);
        this.style.opacity = '0.4';
    });
    div.addEventListener('dragend', function (ev) {
        this.style.opacity = '1';
    });

    div.ondblclick = function () {
        const newTitle = prompt("Topshiriqni tahrirlash:", task.title);
        if (newTitle) {
            this.querySelector('strong').innerText = newTitle;
            saveTasks();
        }
    };

    // Insert after header
    col.appendChild(div);
}

window.deleteTask = async function (btn, event) {
    if (event) event.stopPropagation();
    const card = btn.closest('.task-card');
    const taskId = card.id.split('-').pop();

    if (confirm("Ushbu vazifani o'chirmoqchimisiz?")) {
        try {
            await SmartUtils.fetchAPI(`/tasks/${taskId}`, { method: 'DELETE' });
            card.remove();
            showToast('Vazifa o\'chirildi', 'success');
        } catch (error) {
            showToast('O\'chirishda xatolik: ' + error.message, 'error');
        }
    }
}

// --- MAP LOGIC ---
// --- MAP LOGIC ---
async function renderMapDefects() {
    const bolinmaId = window.viewingSubdivisionId || (currentUser.bolinmalar ? currentUser.bolinmalar[0] : null);
    if (!bolinmaId) return;

    const track = document.getElementById('track-line');
    if (!track) return;
    track.innerHTML = '';

    const range = getPKRange();

    try {
        const defects = await SmartUtils.fetchAPI(`/defects/${bolinmaId}`);
        if (defects) {
            defects.forEach(d => {
                const totalDist = range.end - range.start;
                let percent = ((d.pk - range.start) / totalDist) * 100;

                if (percent >= 0 && percent <= 100) {
                    const el = document.createElement('div');
                    el.className = d.status === 'active' ? 'track-defect' : 'track-ok';
                    el.style.left = percent + '%';
                    el.title = `PK ${d.pk}: ${d.issue}`;
                    if (d.status === 'active') el.innerText = '!';

                    el.onclick = async function () {
                        if (d.status === 'active') {
                            if (confirm(`PK ${d.pk} dagi "${d.issue}" muammosi bartaraf etildimi?`)) {
                                try {
                                    await SmartUtils.fetchAPI(`/defects/${d.id}/fix`, { method: 'PUT' });
                                    showToast('Nuqson bartaraf etildi', 'success');
                                    renderMapDefects();
                                } catch (e) {
                                    showToast('Xatolik: ' + e.message, 'error');
                                }
                            }
                        }
                    };
                    track.appendChild(el);
                }
            });
        }
    } catch (error) {
        console.error('Defects load failed:', error);
    }
}

async function addDefectToMap(pk, issue) {
    const bolinmaId = currentUser.bolinmalar ? currentUser.bolinmalar[0] : null;
    if (!bolinmaId) return;

    try {
        const result = await SmartUtils.fetchAPI('/defects', {
            method: 'POST',
            body: JSON.stringify({
                bolinma_id: bolinmaId,
                pk: parseInt(pk),
                issue: issue
            })
        });

        if (result) {
            showToast('Nuqson xaritaga qo\'shildi', 'success');
            renderMapDefects();
        }
    } catch (error) {
        showToast('Nuqson qo\'shishda xatolik: ' + error.message, 'error');
    }
}

// Homepage Monitoring Cards Render
function renderHomepageMonitoring() {
    const container = document.getElementById('homepage-monitoring-container');
    if (!container) return;

    // Get current user's subdivision ID
    const bolinmaId = currentUser.bolinmalar ? currentUser.bolinmalar[0] : null;
    if (!bolinmaId) return;

    // Get monitoring data
    const roadData = window.roadManagementData[bolinmaId] || {
        switches: { "1/11": 0, "1/9": 0 },
        tracks: { main: 0, reception: 0, other: 0 }
    };

    let monitorData = window.monitoringData[bolinmaId];
    if (!monitorData) {
        monitorData = {
            temp: Math.floor(Math.random() * (55 - 20) + 20),
            defects: 0,
            wearV: 0.0,
            wearH: 0.0
        };
        window.monitoringData[bolinmaId] = monitorData;
    }

    // Check edit permission
    const canEdit = currentUser && currentUser.role === 'bolinma';

    // Render cards
    container.innerHTML = `
        <div class="smart-card" style="background: rgba(0, 198, 255, 0.08); border-color: rgba(0, 198, 255, 0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h4 style="margin: 0; color: #00c6ff; font-size: 1rem;">
                    <i class="fas fa-thermometer-half"></i> Holat Monitoringi
                </h4>
                ${canEdit ? `
                    <button onclick="editRoadManagement('${bolinmaId}')" style="background:none; border:none; color:#ffd700; cursor:pointer; font-size: 1.1rem;" title="Tahrirlash">
                        <i class="fas fa-edit"></i>
                    </button>
                ` : ''}
            </div>
            <div style="display: grid; gap: 8px; font-size: 0.9rem;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.7);">Rels Harorati:</span>
                    <span style="color: ${monitorData.temp > 50 ? '#e74c3c' : (monitorData.temp > 40 ? '#f1c40f' : '#2ecc71')}; font-weight: bold;">
                        +${monitorData.temp}°C
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.7);">Nuqsonlar:</span>
                    <span style="color: ${monitorData.defects > 0 ? '#e74c3c' : '#2ecc71'}; font-weight: bold;">
                        ${monitorData.defects} ta
                    </span>
                </div>
            </div>
        </div>
        
        <div class="smart-card" style="background: rgba(46, 204, 113, 0.08); border-color: rgba(46, 204, 113, 0.3);">
            <h4 style="margin: 0 0 12px 0; color: #2ecc71; font-size: 1rem;">
                <i class="fas fa-code-branch"></i> Strelkalar
            </h4>
            <div style="display: grid; gap: 8px; font-size: 0.9rem;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.7);">1/11 marka:</span>
                    <span style="color: #ffd700; font-weight: bold;">${(roadData.switches && roadData.switches["1/11"]) || 0}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.7);">1/9 marka:</span>
                    <span style="color: #ffd700; font-weight: bold;">${(roadData.switches && roadData.switches["1/9"]) || 0}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; margin-top: 4px;">
                    <span style="color: rgba(255,255,255,0.9);"><strong>Jami:</strong></span>
                    <span style="color: white; font-weight: bold;">${((roadData.switches && roadData.switches["1/11"]) || 0) + ((roadData.switches && roadData.switches["1/9"]) || 0)}</span>
                </div>
            </div>
        </div>
        
        <div class="smart-card" style="background: rgba(155, 89, 182, 0.08); border-color: rgba(155, 89, 182, 0.3);">
            <h4 style="margin: 0 0 12px 0; color: #9b59b6; font-size: 1rem;">
                <i class="fas fa-ruler"></i> Yo'llar Uzunligi (km)
            </h4>
            <div style="display: grid; gap: 8px; font-size: 0.9rem;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.7);">Asosiy:</span>
                    <span style="color: #ffd700; font-weight: bold;">${(roadData.tracks && roadData.tracks.main) || 0}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.7);">Qabul:</span>
                    <span style="color: #ffd700; font-weight: bold;">${(roadData.tracks && roadData.tracks.reception) || 0}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.7);">Boshqa:</span>
                    <span style="color: #ffd700; font-weight: bold;">${(roadData.tracks && roadData.tracks.other) || 0}</span>
                </div>
            </div>
        </div>
        
        <div class="smart-card" style="background: rgba(255, 159, 64, 0.08); border-color: rgba(255, 159, 64, 0.3);">
            <h4 style="margin: 0 0 12px 0; color: #f39c12; font-size: 1rem;">
                <i class="fas fa-search-location"></i> Defektaskop Nazorati
            </h4>
            <div style="display: grid; gap: 8px; font-size: 0.9rem;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.7);">Faol aravachalar:</span>
                    <span style="color: #2ecc71; font-weight: bold;">4/4</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.7);">Bugun tekshirildi:</span>
                    <span style="color: #ffd700; font-weight: bold;">95 km</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.7);">Aniqlangan nuqsonlar:</span>
                    <span style="color: #e74c3c; font-weight: bold;">8 ta</span>
                </div>
            </div>
            <button onclick="openDefectoscopeTracker()" style="width: 100%; margin-top: 15px; padding: 8px; background: linear-gradient(135deg, #f39c12, #e67e22); border: none; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 0.9rem;">
                <i class="fas fa-eye"></i> Batafsil Ko'rish
            </button>
        </div>
    `;
}

// --- ADMIN MODAL FOR SUBDIVISION VIEW ---
window.openAdminSubdivisionView = function (subdivisionId) {
    if (typeof currentUser !== 'undefined' && currentUser.role !== 'admin' && !currentUser.departments.includes('dispetcher')) return;

    // Create or get modal
    let modal = document.getElementById('admin-sub-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'admin-sub-modal';
        modal.innerHTML = `
                                    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 2000; display: flex; align-items: center; justify-content: center;">
                                        <div style="background: #1e293b; width: 90%; height: 90%; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 0 50px rgba(0,0,0,0.5);">
                                            <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: rgba(30, 41, 59, 1);">
                                                <h2 style="margin: 0; color: white;" id="admin-sub-title">Bo'linma Ko'rinishi</h2>
                                                <button onclick="document.getElementById('admin-sub-modal').style.display='none'" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
                                            </div>
                                            <div id="admin-sub-content" style="flex: 1; overflow-y: auto; padding: 30px; background: #0f172a;">
                                                <!-- Content here -->
                                            </div>
                                        </div>
                                    </div>
                                `;
        document.body.appendChild(modal);
    }

    modal.style.display = 'flex';

    // Mock a user object for that subdivision to reuse render function
    const subUser = { role: 'bolinma', username: subdivisionId };

    // Need to temporarily override getDataKeys context or pass context
    // Let's modify getDataKeys to accept an optional override or just swap currentUser context in a hacky but effective way for read-only view?
    // Better: Update getDataKeys to look at a global 'viewingSubdivision' variable if set.

    window.viewingSubdivisionId = subdivisionId;

    const content = document.getElementById('admin-sub-content');
    content.innerHTML = getSmartSubdivisionDashboardHTML(subUser);

    // Update Title
    const subName = subdivisions.find(s => s.id === subdivisionId)?.name || subdivisionId;
    document.getElementById('admin-sub-title').innerText = `${subName} - Smart Boshqaruv Paneli (Kuzatuv)`;

    // Initialize features
    setTimeout(() => {
        initSubdivisionFeatures(); // This will load data based on viewingSubdivisionId because we updated getDataKeys below
    }, 100);
}

// Update getDataKeys to support Admin viewing mode
const originalGetDataKeys = getDataKeys;
window.getDataKeys = function () {
    const uid = window.viewingSubdivisionId || ((typeof currentUser !== 'undefined' && currentUser.username) ? currentUser.username : 'guest');
    // If admin is viewing, reset viewingSubdivisionId after call? No, keep it while modal is open?
    // Best approach: check if modal is open, but simpler is just use the global override
    return {
        TASKS: `smart_tasks_${uid}`,
        DEFECTS: `smart_defects_${uid}`,
        PK_RANGE: `smart_pk_range_${uid}`
    };
}

// Close modal cleanup
const originalClose = window.closeAllWindows || function () { };
window.closeAllWindows = function () {
    const modal = document.getElementById('admin-sub-modal');
    if (modal) modal.style.display = 'none';
    window.viewingSubdivisionId = null; // Reset context
    originalClose();
}

// --- HISTORY MODAL ---
window.openHistoryModal = async function () {
    let modal = document.getElementById('history-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'history-modal';
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 2000; display: flex; align-items: center; justify-content: center;">
                <div style="background: #1e293b; width: 90%; max-width: 800px; height: 80%; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 0 50px rgba(0,0,0,0.5);">
                    <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: rgba(30, 41, 59, 1);">
                        <h2 style="margin: 0; color: white;"><i class="fas fa-history"></i> Topshiriqlar Tarixi</h2>
                        <button onclick="document.getElementById('history-modal').style.display='none'" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    <div id="history-content" style="flex: 1; overflow-y: auto; padding: 20px; background: #0f172a;">
                        <div style="text-align:center; padding:50px; color:white;"><i class="fas fa-spinner fa-spin"></i> Tarix yuklanmoqda...</div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';

    try {
        const historyDataRaw = await SmartUtils.fetchAPI('/reports/history');
        const content = document.getElementById('history-content');

        if (!historyDataRaw || historyDataRaw.length === 0) {
            content.innerHTML = `<div style="text-align:center; padding: 50px; color: rgba(255,255,255,0.3);">Tarix bo'sh...</div>`;
            return;
        }

        // Group by Date
        const historyData = {};
        historyDataRaw.forEach(r => {
            if (!historyData[r.date]) historyData[r.date] = {};
            historyData[r.date][r.bolinma_id] = { text: r.content, time: r.time };
        });

        const dates = Object.keys(historyData).sort((a, b) => new Date(b) - new Date(a));

        content.innerHTML = dates.map(date => {
            const dayReports = historyData[date];
            const subIds = Object.keys(dayReports);

            return `
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #3498db; border-bottom: 1px solid rgba(52, 152, 219, 0.3); padding-bottom: 10px; margin-bottom: 15px;">
                        <i class="far fa-calendar-alt"></i> ${date}
                    </h3>
                    <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                        ${subIds.map(sid => {
                const rep = dayReports[sid];
                const subName = subdivisions.find(s => s.id === sid)?.name || sid;
                return `
                                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; border-left: 3px solid #2ecc71;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <strong style="color: white; font-size: 1rem;">${subName}</strong>
                                        <span style="font-size: 0.8rem; color: rgba(255,255,255,0.5);"><i class="far fa-clock"></i> ${rep.time}</span>
                                    </div>
                                    <div style="color: rgba(255,255,255,0.8); line-height: 1.5; font-size: 0.9rem;">
                                        ${rep.text}
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        document.getElementById('history-content').innerHTML = `<div style="color:red; text-align:center; padding:20px;">Xatolik: ${error.message}</div>`;
    }
}


// --- SMART SUBDIVISION DASHBOARD END ---

function startConfetti() {
    const container = document.getElementById('confetti-container') || (() => {
        const c = document.createElement('div');
        c.id = 'confetti-container';
        c.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:10000;';
        document.body.appendChild(c);
        return c;
    })();

    container.style.display = 'block';
    const colors = ['#fce18a', '#ff726d', '#b48def', '#f4306d', '#00c6ff'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
                                        position: absolute; width: 8px; height: 8px;
                                        background-color: ${colors[Math.floor(Math.random() * colors.length)]};
                                        left: ${Math.random() * 100}vw; top: -10px;
                                        opacity: ${Math.random()}; transform: rotate(${Math.random() * 360}deg);
                                        animation: confettiFall ${Math.random() * 2 + 2}s linear forwards;
                                    `;
        container.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
    }
    setTimeout(() => container.style.display = 'none', 4000);
}


const functionalDepartments = [
    {
        id: 'ishlab-chiqarish',
        name: 'Ishlab chiqarish bo\'limi',
        manager: 'Turobov H.H',
        icon: 'fas fa-industry',
        description: 'Ishlab chiqarish jarayonlari va mahsulot sifati nazorati',
        integrations: ['obs', 'kmo']
    },
    {
        id: 'xodimlar',
        name: 'Xodimlar bo\'limi',
        manager: 'Sattorov M.M',
        icon: 'fas fa-users',
        description: 'Xodimlar ro\'yxati, mehnat shartnomalari va malaka oshirish',
        integrations: ['exodim']
    },
    {
        id: 'bugalteriya',
        name: 'Bugalteriya bo\'limi',
        manager: 'Bozorov F.',
        icon: 'fas fa-calculator',
        description: 'Moliya hisoboti, byudjet rejalashtirish va soliq hisobi'
    },
    {
        id: 'iqtisod',
        name: 'Iqtisod bo\'limi',
        manager: 'Nosirov S.',
        icon: 'fas fa-chart-line',
        description: 'Iqtisodiy tahlil, narxlar siyosati va bozor tadqiqotlari'
    },
    {
        id: 'mexanika',
        name: 'Mexanika bo\'limi',
        manager: 'Xudoyberdiyev J.',
        icon: 'fas fa-cog',
        description: 'Texnika texnik xizmat ko\'rsatish, ta\'mirlash va modernizatsiya',
        integrations: ['mexanika-monitor']
    },
    {
        id: 'mehnat-muhofazasi',
        name: 'Mehnat muhofazasi bo\'limi',
        manager: 'Olimov O.',
        icon: 'fas fa-hard-hat',
        description: 'Ish xavfsizligi, sog\'liqni saqlash va atrof-muhit muhofazasi'
    },
    {
        id: 'dispetcher',
        name: 'Dispetcher bo\'limi',
        manager: 'Sharopov X',
        icon: 'fas fa-tower-broadcast',
        description: 'Transport harakatini boshqarish va monitoring qilish',
        integrations: ['obs']
    },
    {
        id: 'metrologiya',
        name: 'Metrologiya bo\'limi',
        manager: 'Juzgenov M.',
        icon: 'fas fa-ruler-combined',
        description: 'O\'lchov asboblarini kalibrlash va metrologik nazorat'
    }
];



// Yuklangan fayllar ma'lumotlari
let uploadedFiles = [];
let currentEditingFile = null;
let currentUser = null;
let newsData = [];
let weatherData = null;
let competitionChart = null;
let currentSelectedCell = null;
let currentWeatherView = 'current';
let currentPreviewFile = null;
let chartEditor = null;
let currentChartData = null;
let liveMap = null;
let subdivisionMarkers = [];
let competitionData = {
    type: 'bar',
    colors: ['rgba(52, 152, 219, 0.7)', 'rgba(46, 204, 113, 0.7)'],
    textColor: 'white',
    borderWidth: 1,
    height: 400,
    values: {}
};
let folders = [];

// Bo'linmalar ma'lumotlari
const subdivisions = [
    { id: 'bolinma1', name: '1-bo\'linma', manager: 'Rajabov E', department: 'Navbahor(4020km pk1-4050km pk10)', location: { lat: 39.7, lng: 64.4 } },
    { id: 'bolinma2', name: '2-bo\'linma', manager: 'Rustamov A', department: 'Yaxshilik(4051km pk1-4083km pk10)', location: { lat: 39.8, lng: 64.5 } },
    { id: 'bolinma3', name: '3-bo\'linma', manager: 'Islomov S.', department: 'Parvoz(4084km pk1-4117km pk10)', location: { lat: 39.6, lng: 64.3 } },
    { id: 'bolinma4', name: '4-bo\'linma', manager: 'Atadjanov J.', department: 'Qorlitog(4118km pk1-4150km pk10)', location: { lat: 39.9, lng: 64.6 } },
    { id: 'bolinma5', name: '5-bo\'linma', manager: 'Choriyev Y.', department: 'Kiyikli(4151km pk1-4183km pk10)', location: { lat: 39.5, lng: 64.2 } },
    { id: 'bolinma6', name: '6-bo\'linma', manager: 'Islomov F.', department: 'Xizirbobo(4184km pk1-4205km pk10)', location: { lat: 40.0, lng: 64.7 } },
    { id: 'bolinma7', name: '7-bo\'linma', manager: 'Mambetov A', department: 'Jayxun', location: { lat: 39.4, lng: 64.1 } },
    { id: 'bolinma8', name: '8-bo\'linma', manager: 'Qutimov R.', department: 'Dautepa peregon', location: { lat: 40.1, lng: 64.8 } },
    { id: 'bolinma9', name: '9-bo\'linma', manager: 'Kerimov U', department: 'Dautepa(4261km pk1-4289km pk10)', location: { lat: 39.3, lng: 64.0 } },
    { id: 'bolinma10', name: '10-bo\'linma', manager: 'Davletov Sh', department: 'Turon(4290km pk1-4303km pk10)', location: { lat: 40.2, lng: 64.9 } }
];



// Global monitoring data
let monitoringData = {};

// Ma'lumotlar bazasini yuklash
async function loadDatabase() {
    const data = await SmartUtils.load(DB_NAME);
    if (data) {
        uploadedFiles = data.files || [];
        folders = data.folders || [];
        if (data.competitionData) competitionData = data.competitionData;
        monitoringData = data.monitoringData || {};
    } else {
        initializeDatabase();
    }
}

// Ma'lumotlar bazasini saqlash
function saveDatabase() {
    const data = {
        files: uploadedFiles,
        folders: folders,
        competitionData: competitionData,
        monitoringData: monitoringData,
        lastUpdate: new Date().toISOString()
    };
    localStorage.setItem(DB_NAME, JSON.stringify(data));
}

// Dastlabki ma'lumotlarni yaratish
function initializeDatabase() {
    // Namuna fayllar
    const sampleFiles = [
        {
            id: '1',
            name: 'Hisobot-noyabr.docx',
            size: 24576,
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            content: 'Noyabr oyi hisoboti mazmuni...',
            department: 'ishlab-chiqarish',
            uploadDate: new Date('2023-11-15').toISOString(),
            status: 'approved',
            uploader: 'admin',
            folder: 'hisobotlar'
        },
        {
            id: '2',
            name: 'Reja-dekabr.xlsx',
            size: 18432,
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            content: '',
            department: 'ishlab-chiqarish',
            uploadDate: new Date('2023-11-20').toISOString(),
            status: 'pending',
            uploader: 'turobov',
            folder: 'reja'
        }
    ];

    uploadedFiles = sampleFiles;
    saveDatabase();
}

// Raqobat grafigini yaratish (1-10 bo'linmalar uchun)
function createCompetitionChart() {
    const ctx = document.getElementById('competitionChart');
    if (!ctx) return;

    // Avvalgi chartni yo'q qilish
    if (competitionChart) {
        competitionChart.destroy();
    }

    const subdivisionNames = subdivisions.map(sub => sub.name);
    const performanceData = subdivisions.map(sub => {
        return competitionData.values[sub.id]?.performance || 50;
    });

    const efficiencyData = subdivisions.map(sub => {
        return competitionData.values[sub.id]?.efficiency || 30;
    });

    competitionChart = new Chart(ctx, {
        type: competitionData.type || 'bar',
        data: {
            labels: subdivisionNames,
            datasets: [
                {
                    label: 'PS-126,PS-106 bergan bal',
                    data: performanceData,
                    backgroundColor: competitionData.colors?.[0] || 'rgba(52, 152, 219, 0.7)',
                    borderColor: competitionData.colors?.[0] || 'rgba(52, 152, 219, 1)',
                    borderWidth: competitionData.borderWidth || 1
                },
                {
                    label: 'Hisobotlarning samaradorligi (%)',
                    data: efficiencyData,
                    backgroundColor: competitionData.colors?.[1] || 'rgba(46, 204, 113, 0.7)',
                    borderColor: competitionData.colors?.[1] || 'rgba(46, 204, 113, 1)',
                    borderWidth: competitionData.borderWidth || 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: competitionData.textColor || 'white'
                    }
                },
                title: {
                    display: true,
                    text: 'Bo\'linmalar o\'rtasidagi raqobat (1-10 bo\'linmalar)',
                    color: competitionData.textColor || 'white',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 150,
                    ticks: {
                        color: competitionData.textColor || 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: competitionData.textColor || 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Live xaritani yaratish
function createLiveMap() {
    const mapContainer = document.getElementById('live-map');
    if (!mapContainer) return;

    // Xaritani yaratish
    liveMap = L.map('live-map').setView([41.3111, 69.2797], 6); // O'zbekiston markazi

    // Xarita qatlami
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(liveMap);
    // Bo'linmalarni xaritada ko'rsatish
    updateMapMarkers();

    // 10 soniyada bir yangilash (simulyatsiya)
    setInterval(() => {
        updateSubdivisionLocations();
        updateMapMarkers();
    }, 10000);
}

// Xarita markerlarini yangilash
function updateMapMarkers() {
    // Avvalgi markerlarni o'chirish
    subdivisionMarkers.forEach(marker => liveMap.removeLayer(marker));
    subdivisionMarkers = [];

    // Har bir bo'linma uchun marker qo'shish
    subdivisions.forEach(sub => {
        const marker = L.marker([sub.location.lat, sub.location.lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: `<div style="background: ${getDepartmentColor(sub.department)}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white;">${sub.name.substring(0, 1)}</div>`
            })
        }).addTo(liveMap);

        marker.bindPopup(`
                    <div style="color: #333;">
                        <strong>${sub.name}</strong><br>
                        <strong>Mas'ul:</strong> ${sub.manager}<br>
                        <strong>Bo'lim:</strong> ${getDepartmentName(sub.department)}<br>
                        <strong>Holat:</strong> Faol<br>
                        <strong>Oxirgi faollik:</strong> ${new Date().toLocaleTimeString('uz-UZ')}
                    </div>
                `);

        subdivisionMarkers.push(marker);
    });
}

// Bo'linma lokatsiyasini yangilash (simulyatsiya)
function updateSubdivisionLocations() {
    subdivisions.forEach(sub => {
        // Kichik o'zgarishlar kiritish (harakatlanayotgandek ko'rinish)
        sub.location.lat += (Math.random() - 0.5) * 0.01;
        sub.location.lng += (Math.random() - 0.5) * 0.01;

        // Chegaralarni belgilash
        sub.location.lat = Math.max(36, Math.min(45, sub.location.lat));
        sub.location.lng = Math.max(56, Math.min(73, sub.location.lng));
    });
}

// Bo'lim nomini olish
function getDepartmentName(departmentId) {
    const dept = functionalDepartments.find(d => d.id === departmentId);
    return dept ? dept.name : departmentId;
}

// Bo'lim rangi
function getDepartmentColor(departmentId) {
    const colors = {
        '1-bolinma': '#e74c3c',
        '2-bolinma': '#3498db',
        '3-bolinma': '#2ecc71',
        '4-bolinma': '#9b59b6',
        '5-bolinma': '#f1c40f',
        '6-bolinma': '#e67e22',
        '7-bolinma': '#1abc9c',
        '8-bolinma': '#34495e',
        '9-bolinma': '#34497e',
        '10-bolinma': '#7f8c8d'
    };
    return colors[departmentId] || '#3498db';
}

// Injecting the goal into the dispatcher content whenever department is opened
function injectDailyGoalToDispatcher() {
    // 1. Main 'Dispetcher' Department
    const mainDispatcher = document.getElementById('dispetcher-window');
    if (mainDispatcher) {
        const body = mainDispatcher.querySelector('.department-body');
        if (body && !body.querySelector('.daily-goal-card')) {
            body.insertAdjacentHTML('afterbegin', getDailyGoalHTML());
        }
    }

    // 2. Subdivision Dispatcher Sections (e.g., bolinma1-6-window or 1-bolinma-6-window)
    // The ID logic seems to be `${bolinmaId}-${sectionId}-window`.
    // Dispatcher section ID is 6.
    // We'll look for any open window that corresponds to a dispatcher section.

    const openWindows = document.querySelectorAll('.department-window.active');
    openWindows.forEach(win => {
        // Check if this window is a Dispatcher window (ID contains 'dispetcher' or ends with '-6-window')
        if ((win.id.includes('dispetcher') || win.id.endsWith('-6-window')) && !win.querySelector('.daily-goal-card')) {
            const body = win.querySelector('.department-body');
            if (body) {
                body.insertAdjacentHTML('afterbegin', getDailyGoalHTML());
            }
        }
    });
}

// Add this to your department switching logic or call intervally
// Faqat asosiy tizim ochiq bo'lganda ishlaydi (performance uchun)
setInterval(() => {
    const mainSystem = document.getElementById('mainSystem');
    if (mainSystem && mainSystem.style.display !== 'none') {
        injectDailyGoalToDispatcher();
    }
}, 1000);

// Havo ma'lumotlarini yuklash
async function loadWeatherData() {
    try {
        const weatherContainer = document.querySelector('.weather-container');
        weatherContainer.innerHTML = `
            <div class="weather-loading">
                <i class="fas fa-spinner fa-spin"></i> Havo ma'lumotlari yuklanmoqda...
            </div>
        `;

        // Yangibozor, Buxoro viloyati uchun havo ma'lumotlari
        // Yangibozor koordinatalari: 39.7075° N, 64.0900° E
        const lat = 39.7075;
        const lon = 64.0900;

        // Agar API kalit bo'lmasa, namuna ma'lumotlarni ko'rsatamiz
        const WEATHER_API_KEY = (window.CONFIG && window.CONFIG.WEATHER_API_KEY) || '';
        if (!WEATHER_API_KEY || WEATHER_API_KEY === 'your_api_key_here') {
            // Yangibozor uchun namuna ma'lumotlar (qishki mavsum uchun)
            weatherData = {
                current: {
                    main: {
                        temp: 8,
                        feels_like: 5,
                        humidity: 70,
                        pressure: 1015
                    },
                    wind: {
                        speed: 12,
                        deg: 320
                    },
                    weather: [{
                        description: 'qisman bulutli',
                        icon: '02d',
                        main: 'Clouds'
                    }],
                    dt: Math.floor(Date.now() / 1000)
                },
                hourly: Array.from({ length: 8 }, (_, i) => ({
                    dt: Math.floor((Date.now() + i * 3600000) / 1000),
                    main: {
                        temp: 6 + Math.random() * 4,
                        feels_like: 4 + Math.random() * 3
                    },
                    weather: [{
                        icon: i > 16 ? '02n' : '02d',
                        description: i % 2 === 0 ? 'qisman bulutli' : 'osmon ochiq'
                    }]
                })),
                daily: Array.from({ length: 5 }, (_, i) => ({
                    dt: Math.floor((Date.now() + i * 86400000) / 1000),
                    temp: {
                        day: 7 + Math.random() * 5,
                        night: 2 + Math.random() * 3,
                        max: 9 + Math.random() * 4,
                        min: 1 + Math.random() * 2
                    },
                    weather: [{
                        icon: i === 0 ? '02d' : i === 2 ? '10d' : '01d',
                        description: i === 0 ? 'qisman bulutli' : i === 2 ? 'yomg\'ir' : 'osmon ochiq'
                    }]
                }))
            };

            renderWeather();
            return;
        }

        // Haqiqiy API orqali ma'lumot olish (OpenWeatherMap)
        const currentResponse = await fetch(
            `${window.CONFIG.API_URL}/weather?lat=${lat}&lon=${lon}`
        );

        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=uz`
        );

        const oneCallResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&appid=${WEATHER_API_KEY}&units=metric&lang=uz`
        );

        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error('Havo ma\'lumotlarini olishda xatolik');
        }

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        weatherData = {
            current: currentData,
            hourly: forecastData.list.slice(0, 8), // Keyingi 8 soat
            daily: forecastData.list.filter((_, index) => index % 8 === 0).slice(0, 5) // Keyingi 5 kun
        };

        // Agar OneCall API mavjud bo'lsa, undan ham foydalanish
        try {
            if (oneCallResponse.ok) {
                const oneCallData = await oneCallResponse.json();
                if (oneCallData.daily) {
                    weatherData.daily = oneCallData.daily.slice(0, 5);
                }
            }
        } catch (e) {
            console.log('OneCall API dan ma\'lumot olishda xatolik:', e);
        }

        renderWeather();

    } catch (error) {
        console.error('Havo ma\'lumotlarini yuklashda xatolik:', error);

        const weatherContainer = document.querySelector('.weather-container');
        weatherContainer.innerHTML = `
            <div class="weather-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Havo ma'lumotlarini yuklab bo'lmadi</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">Yangibozor (Buxoro viloyati) uchun ob-havo ma'lumotlari</p>
                <button class="control-btn" onclick="loadWeatherData()" style="margin-top: 10px;">
                    <i class="fas fa-sync-alt"></i> Qayta urinish
                </button>
            </div>
        `;
    }
}


// Havo ma'lumotlarini ko'rsatish
function renderWeather() {
    const weatherContainer = document.querySelector('.weather-container');

    if (!weatherData) {
        weatherContainer.innerHTML = `
                    <div class="weather-error">
                        <p>Havo ma'lumotlari mavjud emas</p>
                    </div>
                `;
        return;
    }

    if (currentWeatherView === 'current') {
        renderCurrentWeather();
    } else if (currentWeatherView === 'hourly') {
        renderHourlyForecast();
    } else if (currentWeatherView === 'daily') {
        renderDailyForecast();
    }
}

// Hozirgi ob-havo
function renderCurrentWeather() {
    const weatherContainer = document.querySelector('.weather-container');
    const data = weatherData.current;

    const weatherIcon = getWeatherIcon(data.weather[0].icon);
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const humidity = data.main.humidity;
    const pressure = data.main.pressure;
    const windSpeed = Math.round(data.wind.speed * 3.6); // m/s to km/h
    const description = data.weather[0].description;

    weatherContainer.innerHTML = `
                <div class="weather-card">
                    <div class="weather-icon">
                        <i class="${weatherIcon}"></i>
                    </div>
                    <div class="weather-temp">${temp}°C</div>
                    <div class="weather-desc">${description}</div>
                    <div class="weather-details">
                        <div class="weather-detail">
                            <span class="detail-label">Hissiyot</span>
                            <span class="detail-value">${feelsLike}°C</span>
                        </div>
                        <div class="weather-detail">
                            <span class="detail-label">Namlik</span>
                            <span class="detail-value">${humidity}%</span>
                        </div>
                        <div class="weather-detail">
                            <span class="detail-label">Bosim</span>
                            <span class="detail-value">${pressure} hPa</span>
                        </div>
                        <div class="weather-detail">
                            <span class="detail-label">Shamol</span>
                            <span class="detail-value">${windSpeed} km/h</span>
                        </div>
                    </div>
                </div>
                <div class="weather-card">
                    <h4 style="color: #ffd700; margin-bottom: 1rem; text-align: center;">
                        <i class="fas fa-info-circle"></i> Qo'shimcha ma'lumot
                    </h4>
                    <div style="color: rgba(255,255,255,0.9); font-size: 0.9rem; line-height: 1.6;">
                        <p><i class="fas fa-map-marker-alt"></i> <strong>Joy:</strong> Buxoro viloyati</p>
                        <p><i class="fas fa-clock"></i> <strong>Yangilangan:</strong> ${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p><i class="fas fa-temperature-low"></i> <strong>Tavsiya:</strong> ${getWeatherAdvice(data.weather[0].main, temp)}</p>
                        <p><i class="fas fa-wind"></i> <strong>Shamol yo'nalishi:</strong> ${getWindDirection(data.wind.deg)}</p>
                    </div>
                </div>
            `;
}

// Soatlik prognoz
function renderHourlyForecast() {
    const weatherContainer = document.querySelector('.weather-container');
    const hourlyData = weatherData.hourly || [];

    let hourlyHTML = '';

    hourlyData.forEach((hour, index) => {
        const time = new Date(hour.dt * 1000);
        const hourString = time.getHours().toString().padStart(2, '0') + ':00';
        const temp = Math.round(hour.main?.temp || hour.temp);
        const icon = getWeatherIcon(hour.weather[0].icon);

        hourlyHTML += `
                    <div class="hourly-item">
                        <div class="hourly-time">${hourString}</div>
                        <div class="hourly-icon"><i class="${icon}"></i></div>
                        <div class="hourly-temp">${temp}°C</div>
                    </div>
                `;
    });

    weatherContainer.innerHTML = `
                <div style="grid-column: 1 / -1;">
                    <h4 style="color: #ffd700; margin-bottom: 1rem;">Soatlik ob-havo prognozi (Buxoro)</h4>
                    <div class="hourly-forecast">
                        ${hourlyHTML}
                    </div>
                </div>
            `;
}

// Soatlik prognoz ko'rsatish funksiyasini yangilash
function renderHourlyForecast() {
    const weatherContainer = document.querySelector('.weather-container');
    const hourlyData = weatherData.hourly || [];

    let hourlyHTML = '';

    hourlyData.forEach((hour, index) => {
        const time = new Date(hour.dt * 1000);
        const hourString = time.getHours().toString().padStart(2, '0') + ':00';
        const temp = Math.round(hour.main?.temp || hour.temp);
        const icon = getWeatherIcon(hour.weather[0].icon);
        const description = hour.weather[0].description || 'osmon ochiq';

        hourlyHTML += `
            <div class="hourly-item">
                <div class="hourly-time">${hourString}</div>
                <div class="hourly-icon"><i class="${icon}"></i></div>
                <div class="hourly-temp">${temp}°C</div>
                <div class="hourly-desc" style="font-size: 0.8rem; color: rgba(255,255,255,0.8);">
                    ${description}
                </div>
            </div>
        `;
    });

    weatherContainer.innerHTML = `
        <div style="grid-column: 1 / -1;">
            <h4 style="color: #ffd700; margin-bottom: 1rem;">
                <i class="fas fa-clock"></i> Yangibozor uchun soatlik ob-havo prognozi
            </h4>
            <p style="color: rgba(255,255,255,0.8); margin-bottom: 1rem;">
                Keyingi 8 soat davomida ob-havo holati
            </p>
            <div class="hourly-forecast">
                ${hourlyHTML}
            </div>
        </div>
    `;
}

// Kunlik prognoz ko'rsatish funksiyasini yangilash
function renderDailyForecast() {
    const weatherContainer = document.querySelector('.weather-container');
    const dailyData = weatherData.daily || [];

    let dailyHTML = '';

    dailyData.forEach((day, index) => {
        const date = new Date(day.dt * 1000);
        const dayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
        const dayName = index === 0 ? 'Bugun' : dayNames[date.getDay()];
        const maxTemp = Math.round(day.temp?.max || day.temp?.day || day.main?.temp_max);
        const minTemp = Math.round(day.temp?.min || day.temp?.night || day.main?.temp_min);
        const icon = getWeatherIcon(day.weather[0].icon);
        const description = day.weather[0].description || 'osmon ochiq';

        dailyHTML += `
            <div class="daily-item">
                <div class="daily-day">${dayName}</div>
                <div class="daily-icon"><i class="${icon}"></i></div>
                <div class="daily-temp">${maxTemp}°/${minTemp}°</div>
                <div class="daily-desc" style="font-size: 0.8rem; color: rgba(255,255,255,0.8);">
                    ${description}
                </div>
            </div>
        `;
    });

    weatherContainer.innerHTML = `
        <div style="grid-column: 1 / -1;">
            <h4 style="color: #ffd700; margin-bottom: 1rem;">
                <i class="fas fa-calendar-alt"></i> Yangibozor uchun 5 kunlik ob-havo prognozi
            </h4>
            <p style="color: rgba(255,255,255,0.8); margin-bottom: 1rem;">
                Keyingi 5 kun davomida kutilayotgan ob-havo
            </p>
            <div class="daily-forecast">
                ${dailyHTML}
            </div>
        </div>
    `;
}

// Havo holati ikonasini aniqlash
function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'fas fa-sun',
        '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun',
        '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud',
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud',
        '04n': 'fas fa-cloud',
        '09d': 'fas fa-cloud-rain',
        '09n': 'fas fa-cloud-rain',
        '10d': 'fas fa-cloud-showers-heavy',
        '10n': 'fas fa-cloud-showers-heavy',
        '11d': 'fas fa-bolt',
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake',
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',
        '50n': 'fas fa-smog'
    };

    return iconMap[iconCode] || 'fas fa-cloud';
}

// Havo holati bo'yicha tavsiya
function getWeatherAdvice(condition, temp) {
    if (condition === 'Rain' || condition === 'Thunderstorm') {
        return 'Soyabon oling, yomg\'ir yogishi mumkin';
    } else if (condition === 'Snow') {
        return 'Issiq kiyining, qor yogishi mumkin';
    } else if (temp > 30) {
        return 'Issiq, ko\'proq suv iching';
    } else if (temp < 5) {
        return 'Sovuq, issiq kiyining';
    } else {
        return 'Ob-havo qulay, tashqariga chiqing';
    }
}

// Shamol yo'nalishi
function getWindDirection(degrees) {
    if (degrees === undefined) return 'Noma\'lum';
    if (degrees >= 337.5 || degrees < 22.5) return 'Shimol';
    if (degrees >= 22.5 && degrees < 67.5) return 'Shimoli-sharq';
    if (degrees >= 67.5 && degrees < 112.5) return 'Sharq';
    if (degrees >= 112.5 && degrees < 157.5) return 'Janubi-sharq';
    if (degrees >= 157.5 && degrees < 202.5) return 'Janub';
    if (degrees >= 202.5 && degrees < 247.5) return 'Janubi-gʻarb';
    if (degrees >= 247.5 && degrees < 292.5) return 'Gʻarb';
    if (degrees >= 292.5 && degrees < 337.5) return 'Shimoli-gʻarb';
    return 'Noma\'lum';
}

// Temir yo'l yangiliklari
const railwayNews = [
    {
        title: "O'zbekistonda yangi tezyurar poyezdlar ishga tushirildi",
        description: "Toshkent-Samarqand-Buxoro yo'nalishida yangi tezyurar poyezdlar qatnovi boshlandi. Poyezdlar Yevropa standartlariga mos keladi va yo'lovchilarga qulaylik yaratadi.",
        category: "Transport",
        image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        date: new Date(Date.now() - 86400000)
    },
    {
        title: "Temir yo'l xodimlari uchun malaka oshirish kurslari",
        description: "Xalqaro standartlar asosida temir yo'l xodimlari uchun malaka oshirish kurslari tashkil etildi. Kurslar xavfsizlik va zamonaviy texnologiyalarga qaratilgan.",
        category: "Ta'lim",
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        date: new Date(Date.now() - 172800000)
    },
    {
        title: "Yangi temir yo'l loyihalari uchun investitsiyalar jalb qilindi",
        description: "Xalqaro investorlar O'zbekiston temir yo'l infratuzilmasini rivojlantirishga 500 million dollar sarmoya kiritishdi. Loyihalar 2024-yilda boshlanadi.",
        category: "Investitsiyalar",
        image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        date: new Date(Date.now() - 259200000)
    }
];

// Yangiliklarni yuklash
async function loadNews() {
    try {
        newsData = railwayNews;
    } catch (error) {
        console.error('Yangiliklarni yuklashda xatolik:', error);
        newsData = railwayNews;
    }

    renderNews();
}

// Yangiliklarni ko'rsatish
function renderNews() {
    const newsContainer = document.querySelector('.news-container');
    if (!newsContainer) return;

    newsContainer.innerHTML = '';

    if (newsData.length === 0) {
        newsContainer.innerHTML = `
                    <div class="loading-news">
                        <i class="fas fa-spinner fa-spin"></i> Yangiliklarni yuklanmoqda...
                    </div>
                `;
        return;
    }

    newsData.forEach(news => {
        const newsCard = document.createElement('div');
        newsCard.className = 'news-card';

        const formattedDate = news.date.toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        newsCard.innerHTML = `
                    <div class="news-image" style="background-image: url('${news.image}')">
                        <i class="fas fa-newspaper"></i>
                    </div>
                    <div class="news-content">
                        <span class="news-category">${news.category}</span>
                        <h3 class="news-title-card">${news.title}</h3>
                        <p class="news-excerpt">${news.description}</p>
                        <div class="news-meta">
                            <span class="news-date">
                                <i class="far fa-clock"></i> ${formattedDate}
                            </span>
                            <span>Kun.uz</span>
                        </div>
                    </div>
                `;

        newsContainer.appendChild(newsCard);
    });
}

// Excel jadvalini yaratish (Google Sheets style)
function createExcelTable(data = null) {
    const sheetsGrid = document.getElementById('sheetsGrid');
    sheetsGrid.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'sheets-table';

    // Jadval sarlavhasi
    const headerRow = document.createElement('tr');
    const cornerHeader = document.createElement('th');
    cornerHeader.className = 'corner-header';
    cornerHeader.innerHTML = '';
    headerRow.appendChild(cornerHeader);

    // Ustun sarlavhalari (A, B, C, ...)
    for (let i = 0; i < 10; i++) {
        const th = document.createElement('th');
        th.textContent = String.fromCharCode(65 + i); // A, B, C, ...
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    // Jadval tarkibi
    for (let row = 0; row < 15; row++) {
        const tr = document.createElement('tr');

        // Qator sarlavhasi
        const rowHeader = document.createElement('th');
        rowHeader.className = 'row-header';
        rowHeader.textContent = row + 1;
        tr.appendChild(rowHeader);

        for (let col = 0; col < 10; col++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.className = 'cell-input';
            input.type = 'text';

            // Agar ma'lumot mavjud bo'lsa
            if (data && data[row] && data[row][col]) {
                input.value = data[row][col];
            }

            input.addEventListener('focus', function () {
                if (currentSelectedCell) {
                    currentSelectedCell.classList.remove('selected');
                }
                td.classList.add('selected');
                currentSelectedCell = td;
            });

            td.appendChild(input);
            tr.appendChild(td);
        }

        table.appendChild(tr);
    }

    sheetsGrid.appendChild(table);
}
// Chart editor funksiyalari
function openChartEditor() {
    const editorWindow = document.getElementById('chart-editor-window');

    // Chart editorni yaratish
    createChartEditor();

    editorWindow.classList.add('active');
    document.getElementById('department-overlay').classList.add('active');
}

function createChartEditor() {
    const previewCanvas = document.getElementById('chart-editor-preview-canvas');

    if (chartEditor) {
        chartEditor.destroy();
    }

    const subdivisionNames = subdivisions.map(sub => sub.name);
    const performanceData = subdivisions.map(sub => {
        return competitionData.values[sub.id]?.performance || 50;
    });
    const efficiencyData = subdivisions.map(sub => {
        return competitionData.values[sub.id]?.efficiency || 30;
    });

    chartEditor = new Chart(previewCanvas, {
        type: competitionData.type || 'bar',
        data: {
            labels: subdivisionNames,
            datasets: [
                {
                    label: 'PS-126,PS-106 bergan bal',
                    data: performanceData,
                    backgroundColor: competitionData.colors?.[0] || 'rgba(52, 152, 219, 0.7)',
                    borderColor: competitionData.colors?.[0] || 'rgba(52, 152, 219, 1)',
                    borderWidth: competitionData.borderWidth || 1
                },
                {
                    label: 'Hisobotlarning samaradorligi (%)',
                    data: efficiencyData,
                    backgroundColor: competitionData.colors?.[1] || 'rgba(46, 204, 113, 0.7)',
                    borderColor: competitionData.colors?.[1] || 'rgba(46, 204, 113, 1)',
                    borderWidth: competitionData.borderWidth || 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: competitionData.textColor || 'white'
                    }
                },
                title: {
                    display: true,
                    text: 'Bo\'linmalar o\'rtasidagi raqobat',
                    color: competitionData.textColor || 'white',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 150,
                    ticks: {
                        color: competitionData.textColor || 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: competitionData.textColor || 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });

    setupChartControls();
}

function setupChartControls() {
    // Diagramma turi
    const chartTypeSelect = document.getElementById('chart-type-select');
    chartTypeSelect.value = competitionData.type || 'bar';
    chartTypeSelect.addEventListener('change', function () {
        chartEditor.config.type = this.value;
        competitionData.type = this.value;
        chartEditor.update();
    });

    // Diagramma balandligi
    const chartHeight = document.getElementById('chart-height');
    const heightValue = document.getElementById('height-value');
    chartHeight.value = competitionData.height || 400;
    heightValue.textContent = (competitionData.height || 400) + 'px';

    chartHeight.addEventListener('input', function () {
        previewCanvas.style.height = this.value + 'px';
        heightValue.textContent = this.value + 'px';
        competitionData.height = parseInt(this.value);
        chartEditor.update();
    });

    // Chegara qalinligi
    const borderWidth = document.getElementById('border-width');
    const borderValue = document.getElementById('border-value');
    borderWidth.value = competitionData.borderWidth || 1;
    borderValue.textContent = (competitionData.borderWidth || 1) + 'px';

    borderWidth.addEventListener('input', function () {
        chartEditor.data.datasets.forEach(dataset => {
            dataset.borderWidth = parseInt(this.value);
        });
        borderValue.textContent = this.value + 'px';
        competitionData.borderWidth = parseInt(this.value);
        chartEditor.update();
    });

    // Matn rangi
    const textColor = document.getElementById('chart-text-color');
    textColor.value = competitionData.textColor || 'white';
    textColor.addEventListener('change', function () {
        chartEditor.options.plugins.legend.labels.color = this.value;
        chartEditor.options.scales.x.ticks.color = this.value;
        chartEditor.options.scales.y.ticks.color = this.value;
        competitionData.textColor = this.value;
        chartEditor.update();
    });

    // Rang tanlash
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-color') === competitionData.colors?.[0]) {
            option.classList.add('active');
        }

        option.addEventListener('click', function () {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');

            const color = this.getAttribute('data-color');
            chartEditor.data.datasets[0].backgroundColor = color;
            chartEditor.data.datasets[0].borderColor = color;

            if (!competitionData.colors) {
                competitionData.colors = [color, competitionData.colors?.[1] || '#2ecc71'];
            } else {
                competitionData.colors[0] = color;
            }

            chartEditor.update();
        });
    });

    // Qiymatlarni tahrirlash
    updateChartValueInputs();
}

function updateChartValueInputs() {
    const valueInputs = document.getElementById('chart-value-inputs');
    valueInputs.innerHTML = '';

    subdivisions.forEach((sub, index) => {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'chart-value-input';

        const performance = competitionData.values[sub.id]?.performance || 50;
        const efficiency = competitionData.values[sub.id]?.efficiency || 30;

        inputGroup.innerHTML = `
                    <label>${sub.name}</label>
                    <input type="number" class="performance-value" value="${performance}" 
                           data-id="${sub.id}" data-type="performance" min="0" max="200"
                           onchange="updateChartValue(this)">
                    <input type="number" class="efficiency-value" value="${efficiency}" 
                           data-id="${sub.id}" data-type="efficiency" min="0" max="100"
                           onchange="updateChartValue(this)">
                `;

        valueInputs.appendChild(inputGroup);
    });
}

function updateChartValue(input) {
    const subId = input.getAttribute('data-id');
    const type = input.getAttribute('data-type');
    const value = parseInt(input.value);

    if (!competitionData.values[subId]) {
        competitionData.values[subId] = {};
    }

    competitionData.values[subId][type] = value;

    // Chartni yangilash
    const index = subdivisions.findIndex(sub => sub.id === subId);
    if (index !== -1) {
        if (type === 'performance') {
            chartEditor.data.datasets[0].data[index] = value;
        } else if (type === 'efficiency') {
            chartEditor.data.datasets[1].data[index] = value;
        }
        chartEditor.update();
    }
}

function applyChartChanges() {

    // Chart ma'lumotlarini saqlash
    saveDatabase();

    // Asosiy chartni yangilash
    if (competitionChart) {
        competitionChart.destroy();
        createCompetitionChart();
    }

    showToast('Raqobat grafigi yangilandi va saqlandi!', 'success');
    closeChartEditor();
}

function closeChartEditor() {
    document.getElementById('chart-editor-window').classList.remove('active');
    document.getElementById('department-overlay').classList.remove('active');
}

// Ilovani ishga tushirish
document.addEventListener('DOMContentLoaded', async function () {
    await loadDatabase();
    setupEventListeners();

    // Agar avval login qilingan bo'lsa
    if (window.Auth && window.Auth.isLoggedIn()) {
        currentUser = window.Auth.currentUser;
        showMainSystem();
    }
});

function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', function (e) {
        e.preventDefault();
        login();
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', function () {
        logout();
    });

    // Admin controls
    document.getElementById('adminChartBtn')?.addEventListener('click', () => {
        openCompetitionAdminModal();
    });

    document.getElementById('showMapBtn')?.addEventListener('click', () => {
        openRailwayMapModal();
    });

    // Admin modal yopish
    document.querySelectorAll('.admin-modal .close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('competitionAdminModal').classList.remove('active');
        });
    });

    // Map modal yopish
    document.querySelectorAll('.map-modal .close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('railwayMapModal').classList.remove('active');
        });
    });

    // Admin tablar
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchAdminTab(tabId);
        });
    });

    // Bekat qo'shish
    document.getElementById('addStationBtn')?.addEventListener('click', addNewStation);

    // Chart sozlamalarini saqlash
    document.getElementById('applyChartSettings')?.addEventListener('click', saveChartSettings);

    // Tahrirlash oynasini yopish
    document.getElementById('closeTextEditorBtn')?.addEventListener('click', () => {
        document.getElementById('text-editor-window')?.classList.remove('active');
    });

    document.getElementById('cancelTextEditBtn')?.addEventListener('click', () => {
        document.getElementById('text-editor-window')?.classList.remove('active');
    });

    // Excel tahrirlash oynasini yopish
    document.getElementById('closeExcelEditorBtn')?.addEventListener('click', () => {
        document.getElementById('excel-editor-window')?.classList.remove('active');
    });

    document.getElementById('cancelExcelEditBtn')?.addEventListener('click', () => {
        document.getElementById('excel-editor-window')?.classList.remove('active');
    });

    // Fayl ko'rish oynasini yopish
    document.getElementById('closePreviewBtn')?.addEventListener('click', () => {
        document.getElementById('file-preview-window')?.classList.remove('active');
    });

    // Faylni saqlash
    document.getElementById('saveTextFileBtn')?.addEventListener('click', () => {
        saveTextFile();
    });

    // Excel faylni saqlash
    document.getElementById('saveExcelFileBtn')?.addEventListener('click', () => {
        saveExcelFile();
    });

    // Faylni tahrirlash
    document.getElementById('editPreviewFileBtn')?.addEventListener('click', () => {
        editCurrentFile();
    });

    // Faylni yuklab olish
    document.getElementById('downloadPreviewFileBtn')?.addEventListener('click', () => {
        downloadCurrentFile();
    });

    // Google Docs style editor uchun toolbar tugmalari
    document.addEventListener('click', function (e) {
        if (e.target.closest('.docs-btn')) {
            const btn = e.target.closest('.docs-btn');
            const command = btn.getAttribute('data-command');
            document.execCommand(command, false, null);
            document.getElementById('docsEditor').focus();
        }

        if (e.target.closest('.toolbar-btn')) {
            const btn = e.target.closest('.toolbar-btn');
            const command = btn.getAttribute('data-command');
            if (command) {
                document.execCommand(command, false, null);
                document.getElementById('docsEditor').focus();
            }
        }
    });

    // Font o'zgarishi
    document.getElementById('fontSize')?.addEventListener('change', function () {
        document.execCommand('fontSize', false, this.value);
        document.getElementById('docsEditor')?.focus();
    });

    document.getElementById('fontFamily')?.addEventListener('change', function () {
        document.execCommand('fontName', false, this.value);
        document.getElementById('docsEditor')?.focus();
    });

    // Chart turini o'zgartirish
    document.addEventListener('click', function (e) {
        if (e.target.closest('.chart-btn')) {
            const btn = e.target.closest('.chart-btn');
            const chartType = btn.getAttribute('data-chart');

            // Barcha tugmalarni faollashtirish
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Chartni yangilash
            updateChartType(chartType);
        }

        // Havo ma'lumotlarini yangilash
        if (e.target.closest('.refresh-weather')) {
            loadWeatherData();
        }

        // Havo ko'rinishini o'zgartirish
        if (e.target.closest('.weather-btn')) {
            const btn = e.target.closest('.weather-btn');
            const viewType = btn.getAttribute('data-time');

            // Barcha tugmalarni faollashtirish
            document.querySelectorAll('.weather-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Ko'rinishni o'zgartirish
            currentWeatherView = viewType;
            renderWeather();
        }
    });
    // Admin functions - UPDATED WITH USER MANAGEMENT
    function openCompetitionAdminModal() {
        // Create Enhanced Modal dynamically if not exists
        let modal = document.getElementById('admin-panel-overlay');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'admin-panel-overlay';
            modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9000; display:flex; justify-content:center; align-items:center;';

            modal.innerHTML = `
                <div style="background:#1e293b; width:90%; max-width:1200px; height:85vh; border-radius:15px; display:flex; flex-direction:column; overflow:hidden; border:1px solid rgba(255,255,255,0.1); box-shadow:0 0 50px rgba(0,0,0,0.5);">
                    <div style="padding:20px; background:linear-gradient(90deg, #2c3e50, #34495e); display:flex; justify-content:space-between; align-items:center; color:white;">
                        <h2 style="margin:0;"><i class="fas fa-cogs"></i> Tizim Administratori Paneli</h2>
                        <button onclick="document.getElementById('admin-panel-overlay').style.display='none'" style="background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">&times;</button>
                    </div>
                    <div style="display:flex; border-bottom:1px solid rgba(255,255,255,0.1);">
                        <button onclick="switchAdminPanelTab('users')" class="admin-tab-btn active" style="flex:1; padding:15px; background:transparent; color:white; border:none; cursor:pointer; border-bottom:3px solid #3498db; font-weight:bold;">Foydalanuvchilar</button>
                        <button onclick="switchAdminPanelTab('competition')" class="admin-tab-btn" style="flex:1; padding:15px; background:transparent; color:#aaa; border:none; cursor:pointer; font-weight:bold;">Musobaqa & Reyting</button>
                        <button onclick="switchAdminPanelTab('stations')" class="admin-tab-btn" style="flex:1; padding:15px; background:transparent; color:#aaa; border:none; cursor:pointer; font-weight:bold;">Bekatlar & Xarita</button>
                        <button onclick="switchAdminPanelTab('backup')" class="admin-tab-btn" style="flex:1; padding:15px; background:transparent; color:#aaa; border:none; cursor:pointer; font-weight:bold;">Tizim & Arxiv</button>
                    </div>
                    <div style="flex:1; overflow:hidden; position:relative; background: #0f172a;">
                        <!-- USERS TAB -->
                        <div id="admin-tab-users" class="admin-tab-content" style="padding:20px; height:100%; overflow-y:auto; display:block;">
                            <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                                <h3 style="color:#3498db; margin:0;">Foydalanuvchilar Ro'yxati</h3>
                                <button onclick="openUserEditModal()" style="background:#2ecc71; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; font-weight:bold;"><i class="fas fa-user-plus"></i> Yangi Foydalanuvchi</button>
                            </div>
                            <div id="admin-users-list"></div>
                        </div>

                        <!-- COMPETITION TAB -->
                        <div id="admin-tab-competition" class="admin-tab-content" style="padding:20px; height:100%; overflow-y:auto; display:none;">
                            <h3 style="color:#f39c12;">Bo'limlar Reytingini Boshqarish</h3>
                            <div id="departmentScoresEditor" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;"></div>
                        </div>

                        <!-- STATIONS TAB -->
                        <div id="admin-tab-stations" class="admin-tab-content" style="padding:20px; height:100%; overflow-y:auto; display:none;">
                            <h3 style="color:#e67e22;">Bekatlar Ro'yxati</h3>
                            <div style="margin-bottom:20px; background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; display:flex; gap:10px;">
                                <input type="text" id="newStationName" placeholder="Bekat nomi" style="padding:10px; border-radius:5px; border:none; flex:2;">
                                <input type="text" id="newStationCode" placeholder="Kod" style="padding:10px; border-radius:5px; border:none; width:80px;">
                                <button onclick="addNewStation()" style="padding:10px 20px; background:#f1c40f; border:none; cursor:pointer; border-radius:5px; font-weight:bold;">Qo'shish</button>
                            </div>
                            <div id="stationsList" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;"></div>
                        </div>
                        
                         <!-- BACKUP TAB -->
                        <div id="admin-tab-backup" class="admin-tab-content" style="padding:20px; height:100%; overflow-y:auto; display:none;">
                           <h3 style="color:#9b59b6;">Tizim Ma'lumotlari</h3>
                           <div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:10px;">
                               <p style="color:#aaa;">Barcha foydalanuvchilar, stansiyalar va reyting ma'lumotlarini JSON formatida yuklab olish.</p>
                               <button onclick="exportFullSystemBackup()" style="padding:15px 30px; background:#e67e22; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold; font-size:1rem;"><i class="fas fa-download"></i> Tizimni To'liq Zaxiralash (Backup)</button>
                           </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        } else {
            modal.style.display = 'flex';
        }

        // Initialize Data
        renderAdminUserList();
        loadDepartmentScores();
        loadStationsList();
    }

    // --- Tab Switcher ---
    window.switchAdminPanelTab = function (tabName) {
        document.querySelectorAll('.admin-tab-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.admin-tab-btn').forEach(el => {
            el.style.borderBottom = 'none';
            el.style.color = '#aaa';
            el.classList.remove('active');
        });

        document.getElementById('admin-tab-' + tabName).style.display = 'block';
        const activeBtn = document.querySelector(`.admin-tab-btn[onclick*="${tabName}"]`);
        if (activeBtn) {
            activeBtn.style.borderBottom = '3px solid #3498db';
            activeBtn.style.color = 'white';
            activeBtn.classList.add('active');
        }
    };

    // --- User Management Logic ---
    window.renderAdminUserList = function () {
        const container = document.getElementById('admin-users-list');
        if (!container) return;

        let html = '<table style="width:100%; border-collapse:collapse; color:white;"><thead><tr style="background:rgba(255,255,255,0.1); text-align:left;"><th style="padding:15px;">Login</th><th style="padding:15px;">Ism</th><th style="padding:15px;">Rol</th><th style="padding:15px;">Bo\'limlar</th><th style="padding:15px; text-align:center;">Amallar</th></tr></thead><tbody>';

        Object.keys(users).forEach(key => {
            const u = users[key];
            html += `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                    <td style="padding:15px; font-family:monospace; color:#3498db;">${key}</td>
                    <td style="padding:15px; font-weight:bold;">${u.name}</td>
                    <td style="padding:15px;"><span style="background:${u.role === 'admin' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(52, 152, 219, 0.2)'}; color:${u.role === 'admin' ? '#e74c3c' : '#3498db'}; padding:5px 10px; border-radius:20px; font-size:0.85em; border:1px solid ${u.role === 'admin' ? 'rgba(231, 76, 60, 0.5)' : 'rgba(52, 152, 219, 0.5)'};">${u.role.toUpperCase()}</span></td>
                    <td style="padding:15px; font-size:0.85em; color:#aaa;">${u.role === 'admin' ? 'Barchasi' : (u.departments ? u.departments.join(', ') : '-')}</td>
                    <td style="padding:15px; text-align:center;">
                        <button onclick="openUserEditModal('${key}')" title="Tahrirlash" style="background:rgba(243, 156, 18, 0.2); border:1px solid #f39c12; padding:8px 12px; border-radius:5px; cursor:pointer; color:#f39c12;"><i class="fas fa-edit"></i></button>
                        ${key !== 'admin' ? `<button onclick="deleteAdminUser('${key}')" title="O'chirish" style="background:rgba(231, 76, 60, 0.2); border:1px solid #e74c3c; padding:8px 12px; border-radius:5px; cursor:pointer; color:#e74c3c; margin-left:5px;"><i class="fas fa-trash"></i></button>` : ''}
                    </td>
                </tr>
            `;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    };

    window.openUserEditModal = function (username = null) {
        const user = username ? users[username] : { name: '', password: '', role: 'bolinma' };
        const isEdit = !!username;
        const exists = document.getElementById('user-edit-modal');
        if (exists) exists.remove();

        const formHtml = `
            <div id="user-edit-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9100; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(5px);">
                <div style="background:#2c3e50; padding:30px; border-radius:15px; width:450px; color:white; border:1px solid rgba(255,255,255,0.1); box-shadow:0 10px 40px rgba(0,0,0,0.5);">
                    <h3 style="margin-top:0; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:15px; margin-bottom:20px;">${isEdit ? 'Foydalanuvchini Tahrirlash' : 'Yangi Foydalanuvchi'}</h3>
                    
                    <label style="display:block; margin-bottom:5px; color:#aaa; font-size:0.9em;">Login (ID)*</label>
                    <input type="text" id="edit-user-login" value="${username || ''}" ${isEdit ? 'readonly' : ''} style="width:100%; padding:12px; margin-bottom:15px; background:${isEdit ? '#34495e' : 'rgba(0,0,0,0.2)'}; color:${isEdit ? '#bdc3c7' : 'white'}; border:1px solid rgba(255,255,255,0.1); border-radius:5px;">
                    
                    <label style="display:block; margin-bottom:5px; color:#aaa; font-size:0.9em;">Ism (F.I.Sh)*</label>
                    <input type="text" id="edit-user-name" value="${user.name}" style="width:100%; padding:12px; margin-bottom:15px; background:rgba(0,0,0,0.2); color:white; border:1px solid rgba(255,255,255,0.1); border-radius:5px;">
                    
                    <label style="display:block; margin-bottom:5px; color:#aaa; font-size:0.9em;">Parol*</label>
                    <input type="text" id="edit-user-pass" value="${user.password}" style="width:100%; padding:12px; margin-bottom:15px; background:rgba(0,0,0,0.2); color:white; border:1px solid rgba(255,255,255,0.1); border-radius:5px;">
                    
                    <label style="display:block; margin-bottom:5px; color:#aaa; font-size:0.9em;">Rol</label>
                    <select id="edit-user-role" style="width:100%; padding:12px; margin-bottom:20px; background:#1e293b; color:white; border:1px solid rgba(255,255,255,0.1); border-radius:5px;">
                        <option value="bolinma" ${user.role === 'bolinma' ? 'selected' : ''}>Bo'linma</option>
                        <option value="department" ${user.role === 'department' ? 'selected' : ''}>Bo'lim (Boshqarma)</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                    
                    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:10px;">
                        <button onclick="document.getElementById('user-edit-modal').remove()" style="padding:10px 20px; background:transparent; border:1px solid #95a5a6; color:#aaa; border-radius:5px; cursor:pointer;">Bekor qilish</button>
                        <button onclick="saveAdminUser('${isEdit ? username : ''}')" style="padding:10px 25px; background:linear-gradient(135deg, #2ecc71, #27ae60); border:none; color:white; border-radius:5px; cursor:pointer; font-weight:bold;">Saqlash</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', formHtml);
    };

    window.saveAdminUser = function (oldLogin) {
        const login = document.getElementById('edit-user-login').value.trim();
        const name = document.getElementById('edit-user-name').value.trim();
        const pass = document.getElementById('edit-user-pass').value.trim();
        const role = document.getElementById('edit-user-role').value;

        if (!login || !name || !pass) {
            alert("Barcha maydonlarni to'ldiring!");
            return;
        }

        if (!oldLogin && users[login]) {
            alert("Bunday login mavjud! Boshqa login tanlang.");
            return;
        }

        // Agar yangi login bo'lsa va eski login bo'lsa (rename is not supported nicely without delete, so we assume ID is immutable or handled)
        // Actually simplest is: if oldLogin exists and != login, delete old one.
        // But here input is readonly if edit. So rename impossible. Good.

        // Departments logic placeholder (defaulting based on role)
        let depts = [];
        let bols = [];

        if (role === 'bolinma') {
            bols = [login]; // Assume login is 'bolinmaX'
            // Default departments for bolinma
            depts = ['ishlab-chiqarish', 'xodimlar', 'bugalteriya', 'mexanika', 'mehnat-muhofazasi'];
        } else if (role === 'department') {
            depts = [login]; // Assume login is 'xodimlar', etc.
        } else {
            // Admin
            depts = defaultUsers.admin.departments;
            bols = defaultUsers.admin.bolinmalar;
        }

        // Preserve existing extra data if editing
        if (oldLogin && users[oldLogin]) {
            depts = users[oldLogin].departments || depts;
            bols = users[oldLogin].bolinmalar || bols;
        }

        users[login] = {
            password: pass,
            name: name,
            role: role,
            departments: depts,
            bolinmalar: bols
        };

        saveUsers();
        renderAdminUserList();
        document.getElementById('user-edit-modal').remove();
    };

    window.deleteAdminUser = function (login) {
        if (confirm(login + " foydalanuvchisini o'chirishni tasdiqlaysizmi?")) {
            delete users[login];
            saveUsers();
            renderAdminUserList();
        }
    };

    window.exportFullSystemBackup = function () {
        const backup = {
            users: users,
            savedWorkers: JSON.parse(localStorage.getItem('smart_pch_workers') || '[]'),
            savedTrains: JSON.parse(localStorage.getItem('smart_pch_trains') || '[]'),
            savedStations: JSON.parse(localStorage.getItem('smart_pch_stations') || '[]'),
            date: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'smart_pch_backup_' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
    };


    function loadDepartmentScores() {
        const container = document.getElementById('departmentScoresEditor');
        container.innerHTML = '';

        competitionData.departments.forEach(dept => {
            const item = document.createElement('div');
            item.className = 'department-score-item';
            item.innerHTML = `
                    <label>${dept.name}</label>
                    <input type="number" min="0" max="100" value="${dept.score}" 
                           data-dept="${dept.id}" class="score-input">
                    <input type="color" value="${dept.color}" 
                           data-dept="${dept.id}" class="color-input" style="margin-top: 5px;">
                `;
            container.appendChild(item);
        });

        // Input o'zgarishlarini kuzatish
        document.querySelectorAll('.score-input').forEach(input => {
            input.addEventListener('change', updateDepartmentScore);
        });

        document.querySelectorAll('.color-input').forEach(input => {
            input.addEventListener('change', updateDepartmentColor);
        });
    }

    function updateDepartmentScore(e) {
        const deptId = e.target.getAttribute('data-dept');
        const score = parseInt(e.target.value);

        const dept = competitionData.departments.find(d => d.id === deptId);
        if (dept) {
            dept.score = score;
            saveDatabase();
            updateCompetitionChart();
        }
    }

    function updateDepartmentColor(e) {
        const deptId = e.target.getAttribute('data-dept');
        const color = e.target.value;

        const dept = competitionData.departments.find(d => d.id === deptId);
        if (dept) {
            dept.color = color;
            saveDatabase();
            updateCompetitionChart();
        }
    }

    function loadStationsList() {
        const container = document.getElementById('stationsList');
        container.innerHTML = '';

        competitionData.stations.forEach(station => {
            const item = document.createElement('div');
            item.className = 'station-item';
            item.innerHTML = `
                    <div>
                        <strong>${station.name}</strong> (${station.code})
                        <br>
                        <small>Yo'lovchilar: ${station.passengers} kuniga</small>
                    </div>
                    <div>
                        <button class="edit-station" data-id="${station.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-station" data-id="${station.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
            container.appendChild(item);
        });

        // Bekatlarni tahrirlash va o'chirish
        document.querySelectorAll('.edit-station').forEach(btn => {
            btn.addEventListener('click', editStation);
        });

        document.querySelectorAll('.delete-station').forEach(btn => {
            btn.addEventListener('click', deleteStation);
        });
    }

    function addNewStation() {
        const nameInput = document.getElementById('newStationName');
        const codeInput = document.getElementById('newStationCode');

        const name = nameInput.value.trim();
        const code = codeInput.value.trim().toUpperCase();

        if (name && code) {
            const newStation = {
                id: Date.now(),
                name: name,
                code: code,
                x: Math.random() * 80 + 10,
                y: Math.random() * 80 + 10,
                passengers: Math.floor(Math.random() * 1000) + 500
            };

            competitionData.stations.push(newStation);
            saveDatabase();
            loadStationsList();

            nameInput.value = '';
            codeInput.value = '';
            alert('Yangi bekat qo\'shildi!');
        } else {
            alert('Iltimos, bekat nomi va kodini kiriting!');
        }
    }

    function editStation(e) {
        const stationId = parseInt(e.target.closest('button').getAttribute('data-id'));
        const station = competitionData.stations.find(s => s.id === stationId);

        if (station) {
            const newName = prompt('Bekat nomini kiriting:', station.name);
            if (newName) station.name = newName;

            const newCode = prompt('Bekat kodini kiriting:', station.code);
            if (newCode) station.code = newCode.toUpperCase();

            const newPassengers = prompt('Kunlik yo\'lovchilar soni:', station.passengers);
            if (newPassengers) station.passengers = parseInt(newPassengers);

            saveDatabase();
            loadStationsList();
        }
    }

    function deleteStation(e) {
        const stationId = parseInt(e.target.closest('button').getAttribute('data-id'));

        if (confirm('Bu bekatni o\'chirishni istaysizmi?')) {
            competitionData.stations = competitionData.stations.filter(s => s.id !== stationId);
            saveDatabase();
            loadStationsList();
        }
    }

    function loadChartSettings() {
        document.getElementById('chartTypeSelect').value = competitionData.chartSettings.type;
        document.getElementById('chartBgColor').value = competitionData.chartSettings.backgroundColor;
        document.getElementById('showValues').checked = competitionData.chartSettings.showValues;
    }

    function saveChartSettings() {
        competitionData.chartSettings.type = document.getElementById('chartTypeSelect').value;
        competitionData.chartSettings.backgroundColor = document.getElementById('chartBgColor').value;
        competitionData.chartSettings.showValues = document.getElementById('showValues').checked;

        saveDatabase();
        updateCompetitionChart();
        alert('Chart sozlamalari saqlandi!');
    }

    function switchAdminTab(tabId) {
        // Barcha tablarni yopish
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Faol tabni ochish
        document.querySelector(`.admin-tab[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }

    function openRailwayMapModal() {
        const modal = document.getElementById('railwayMapModal');
        modal.classList.add('active');
        document.getElementById('department-overlay').classList.add('active');
        drawRailwayMap();
    }

    function drawRailwayMap() {
        const mapContainer = document.getElementById('railwayMap');
        mapContainer.innerHTML = '';

        // Harita fonini chizish
        const mapWidth = mapContainer.clientWidth;
        const mapHeight = mapContainer.clientHeight;

        // Yo'l chizish
        const stations = competitionData.stations;

        for (let i = 0; i < stations.length - 1; i++) {
            const from = stations[i];
            const to = stations[i + 1];

            const line = document.createElement('div');
            line.className = 'railway-line';

            // Chiziq uzunligi va burchagini hisoblash
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;

            line.style.cssText = `
                    position: absolute;
                    left: ${from.x}%;
                    top: ${from.y}%;
                    width: ${length}%;
                    height: 4px;
                    background: linear-gradient(to right, #ffd700, #ff8c00);
                    transform-origin: 0 0;
                    transform: rotate(${angle}deg);
                    z-index: 10;
                `;

            mapContainer.appendChild(line);
        }

        // Bekatlarni chizish
        competitionData.stations.forEach(station => {
            const marker = document.createElement('div');
            marker.className = 'station-marker';
            marker.style.cssText = `
                    left: ${station.x}%;
                    top: ${station.y}%;
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                `;
            marker.innerHTML = `<span>${station.code}</span>`;
            marker.setAttribute('data-station', station.id);

            // Tooltip yaratish
            const tooltip = document.createElement('div');
            tooltip.className = 'station-tooltip';
            tooltip.innerHTML = `
                    <strong>${station.name}</strong><br>
                    Kodi: ${station.code}<br>
                    Yo'lovchilar: ${station.passengers}/kun<br>
                    Status: Faol
                `;
            marker.appendChild(tooltip);

            // Tooltip ko'rsatish
            marker.addEventListener('mouseenter', function (e) {
                const tooltip = this.querySelector('.station-tooltip');
                tooltip.style.display = 'block';
                tooltip.style.left = '40px';
                tooltip.style.top = '0';
            });

            marker.addEventListener('mouseleave', function (e) {
                this.querySelector('.station-tooltip').style.display = 'none';
            });

            // Marker bosilganda
            marker.addEventListener('click', function () {
                showStationDetails(station);
            });

            mapContainer.appendChild(marker);
        });

        // Bekatlar ma'lumotlarini ko'rsatish
        showStationsInfo();
    }

    function showStationDetails(station) {
        alert(`
                Bekat: ${station.name}
                Kodi: ${station.code}
                Yo'lovchilar: ${station.passengers} kuniga
                Joylashuvi: X=${station.x}%, Y=${station.y}%
                
                Qo'shimcha ma'lumotlar:
                - Barcha poezdlar to'xtaydi
                - Elektron bilet sotuvi mavjud
                - Kutubxona va kafe xizmatlari
                - Wi-Fi mavjud
            `);
    }

    function showStationsInfo() {
        const container = document.getElementById('stationsInfo');
        container.innerHTML = '';

        competitionData.stations.forEach(station => {
            const info = document.createElement('div');
            info.className = 'station-info-item';
            info.innerHTML = `
                    <h5>${station.name} (${station.code})</h5>
                    <p><i class="fas fa-users"></i> Kunlik yo'lovchilar: ${station.passengers}</p>
                    <p><i class="fas fa-map-marker-alt"></i> Pozitsiya: ${station.x}%, ${station.y}%</p>
                    <hr>
                `;
            container.appendChild(info);
        });
    }

    // Database functions - tashqi (global) saveDatabase() va loadDatabase() funksiyalaridan foydalanamiz
    // Ular DB_NAME ('smart_pch_db') kaliti bilan ishlaydi

    // Chart functions
    function createCompetitionChart() {
        const ctx = document.getElementById('competitionChart').getContext('2d');

        const deptNames = competitionData.departments.map(d => d.name);
        const deptScores = competitionData.departments.map(d => d.score);
        const deptColors = competitionData.departments.map(d => d.color);

        competitionChart = new Chart(ctx, {
            type: competitionData.chartSettings.type,
            data: {
                labels: deptNames,
                datasets: [{
                    label: 'Bo\'limlar ballari',
                    data: deptScores,
                    backgroundColor: deptColors,
                    borderColor: deptColors.map(c => c.replace('0.8', '1')),
                    borderWidth: 2,
                    hoverBackgroundColor: deptColors.map(c => c + 'CC')
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: competitionData.chartSettings.type === 'pie' ||
                            competitionData.chartSettings.type === 'doughnut',
                        position: 'top',
                        labels: {
                            color: '#fff',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: '#fff'
                        },
                        grid: {
                            color: 'rgba(255,255,255,0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#fff'
                        },
                        grid: {
                            color: 'rgba(255,255,255,0.1)'
                        }
                    }
                }
            }
        });
    }

    function updateCompetitionChart() {
        if (!competitionChart) return;

        const deptNames = competitionData.departments.map(d => d.name);
        const deptScores = competitionData.departments.map(d => d.score);
        const deptColors = competitionData.departments.map(d => d.color);

        competitionChart.data.labels = deptNames;
        competitionChart.data.datasets[0].data = deptScores;
        competitionChart.data.datasets[0].backgroundColor = deptColors;
        competitionChart.data.datasets[0].borderColor = deptColors.map(c => c.replace('0.8', '1'));
        competitionChart.config.type = competitionData.chartSettings.type;

        competitionChart.update();
    }

    function updateChartType(type) {
        if (!competitionChart) return;

        competitionChart.config.type = type;
        competitionChart.update();
    }


    // Excel toolbar tugmalari
    document.getElementById('boldBtn')?.addEventListener('click', function () {
        document.execCommand('bold', false, null);
    });

    document.getElementById('italicBtn')?.addEventListener('click', function () {
        document.execCommand('italic', false, null);
    });

    document.getElementById('underlineBtn')?.addEventListener('click', function () {
        document.execCommand('underline', false, null);
    });

    document.getElementById('alignLeftBtn')?.addEventListener('click', function () {
        document.execCommand('justifyLeft', false, null);
    });

    document.getElementById('alignCenterBtn')?.addEventListener('click', function () {
        document.execCommand('justifyCenter', false, null);
    });

    document.getElementById('alignRightBtn')?.addEventListener('click', function () {
        document.execCommand('justifyRight', false, null);
    });

    // Excel qator/ustun qo'shish
    document.getElementById('insertRowBtn')?.addEventListener('click', function () {
        // Qator qo'shish logikasi
        alert('Yangi qator qo\'shildi!');
    });

    document.getElementById('insertColumnBtn')?.addEventListener('click', function () {
        // Ustun qo'shish logikasi
        alert('Yangi ustun qo\'shildi!');
    });

    // Yangiliklarni yangilash
    document.addEventListener('click', function (e) {
        if (e.target.closest('.refresh-news')) {
            loadNews();
        }
    });
}

function updateChartType(type) {
    if (!competitionChart) return;

    competitionChart.config.type = type;
    competitionChart.update();
}

async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('loginError');

    // Mantiqiy validatsiya
    if (!SmartUtils.validateInput(username)) {
        showToast('Iltimos, foydalanuvchi nomini kiriting!', 'warning');
        return;
    }
    if (!SmartUtils.validateInput(password)) {
        showToast('Iltimos, parolni kiriting!', 'warning');
        return;
    }

    showToast('Tizimga kirilmoqda...', 'info');

    const result = await window.Auth.login(username, password);

    if (result && result.success) {
        // Use currentUser from Auth module
        currentUser = window.Auth.currentUser;

        showMainSystem();
        errorDiv.style.display = 'none';

        // Premium Feedback
        showToast(`Xush kelibsiz, ${currentUser.name}!`, 'success');
    } else {
        errorDiv.style.display = 'block';
        const msg = (result && result.message) || 'Login yoki parol noto\'g\'ri!';
        showToast(msg, 'error');
    }
}

function logout() {
    window.Auth.logout();
}

function showLoginPage() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('mainSystem').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function showMainSystem() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainSystem').style.display = 'block';

    // Foydalanuvchi ma'lumotlarini yangilash
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userAvatar').textContent = currentUser.name.charAt(0);

    // Tizimni ishga tushirish
    initializeSystem();
}

// --- DASHBOARD DATA FUNCTIONS (NEW) ---

function loadNews() {
    const newsContainer = document.querySelector('.news-container');
    if (!newsContainer) return;

    const newsData = [
        { title: "Yangi tezyurar poyezdlar qatnovi yo'lga qo'yildi", date: "25 Yanvar, 2026", icon: "fas fa-train" },
        { title: "Buxoro-Toshkent yo'nalishi bo'yicha qo'shimcha reyslar", date: "24 Yanvar, 2026", icon: "fas fa-route" },
        { title: "Temir yo'l xodimlari uchun yangi imtiyozlar tasdiqlandi", date: "22 Yanvar, 2026", icon: "fas fa-user-shield" },
        { title: "Raqamli tizimga o'tish bo'yicha yangi ko'rsatmalar", date: "20 Yanvar, 2026", icon: "fas fa-laptop-code" }
    ];

    newsContainer.innerHTML = newsData.map(news => `
                                    <div class="news-item" style="display:flex; align-items:center; margin-bottom:15px; padding:15px; background:rgba(255,255,255,0.05); border-radius:12px; border-left: 3px solid #00f2ff; transition:all 0.3s ease;">
                                        <div class="news-icon" style="min-width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:rgba(0, 242, 255, 0.1); margin-right:15px; font-size:1.2rem; color:#00f2ff; box-shadow: 0 0 10px rgba(0,242,255,0.2);"><i class="${news.icon}"></i></div>
                                        <div class="news-content">
                                            <h4 style="margin:0 0 5px 0; color:#e0f7ff; font-size:1rem; font-weight:600; text-shadow:0 0 5px rgba(0,198,255,0.3);">${news.title}</h4>
                                            <span style="font-size:0.8rem; color:rgba(255,255,255,0.6);"><i class="far fa-clock"></i> ${news.date}</span>
                                        </div>
                                    </div>
                                `).join('');

    // Add hover effects via JS since inline css hover is hard
    document.querySelectorAll('.news-item').forEach(item => {
        item.addEventListener('mouseenter', e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.transform = 'translateX(5px)';
        });
        item.addEventListener('mouseleave', e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.transform = 'translateX(0)';
        });
    });
}

function loadWeatherData() {
    const weatherContainer = document.querySelector('.weather-container');
    if (!weatherContainer) return;

    // Mock data for Bukhara - Modern Glass Style
    const weatherHTML = `
                                    <div style="display:flex; justify-content:space-between; align-items:center; color:white; padding: 10px;">
                                        <div style="text-align:center; position:relative;">
                                            <i class="fas fa-sun" style="font-size:4rem; color:#ffd700; filter:drop-shadow(0 0 20px gold); animation: pulse 3s infinite;"></i>
                                            <div style="font-size:3rem; font-weight:bold; margin-top:10px; background:linear-gradient(to bottom, #fff, #a1c4fd); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">+12°</div>
                                            <div style="color:#00f2ff; font-weight:500;">Buxoro, Quyoshli</div>
                                        </div>
                                        <div style="display:grid; grid-template-columns:1fr; gap:12px; font-size:0.95rem; background:rgba(0,0,0,0.2); padding:15px; border-radius:15px; border:1px solid rgba(255,255,255,0.1);">
                                            <div style="display:flex; align-items:center;"><i class="fas fa-wind" style="color:#00f2ff; width:25px;"></i> <span>Shamol: <b>14 km/s</b></span></div>
                                            <div style="display:flex; align-items:center;"><i class="fas fa-tint" style="color:#00f2ff; width:25px;"></i> <span>Namlik: <b>45%</b></span></div>
                                            <div style="display:flex; align-items:center;"><i class="fas fa-compress-arrows-alt" style="color:#00f2ff; width:25px;"></i> <span>Bosim: <b>760 mm</b></span></div>
                                        </div>
                                    </div>
                                `;
    weatherContainer.innerHTML = weatherHTML;
}

// Initialize default competition data if missing or corrupted
if (typeof competitionData === 'undefined' || !competitionData || !competitionData.departments) {
    competitionData = {
        departments: [
            { name: '1-bo\'linma', score: 95, color: '#3498db' },
            { name: '2-bo\'linma', score: 88, color: '#2ecc71' },
            { name: '3-bo\'linma', score: 72, color: '#e74c3c' },
            { name: '4-bo\'linma', score: 91, color: '#9b59b6' },
            { name: '5-bo\'linma', score: 84, color: '#f1c40f' },
            { name: '6-bo\'linma', score: 79, color: '#e67e22' }
        ],
        chartSettings: { type: 'bar' },
        stations: [],
        values: {}
    };
}

function initializeSystem() {
    renderSidebar();
    renderMainContent();
    loadNews(); // Yangiliklarni yuklash
    loadWeatherData(); // Havo ma'lumotlarini yuklash
    createCompetitionChart(); // Raqobat grafigini yaratish
    createExcelTable(); // Excel jadvalini yaratish
    showAdminButton(); // Admin tugmasini ko'rsatish (faqat admin uchun)
    showDispatcherElements(); // Dispetcher elementlarini ko'rsatish

    // Load initial data from server
    if (typeof loadReportsFromServer === 'function') loadReportsFromServer();
    // Tasks and Defects are loaded inside subdivision dashboard render logic, 
    // but we can trigger a pre-fetch if needed.
}

function showDispatcherElements() {
    const btn = document.getElementById('openDispatcherIntegrationBtn');
    if (btn) {
        if (currentUser && (currentUser.role === 'admin' || currentUser.departments.includes('dispetcher'))) {
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    }

    // Defektaskop button - show for all logged-in users
    const defectBtn = document.getElementById('openDefectoscopeBtn');
    if (defectBtn && currentUser) {
        defectBtn.style.display = 'flex';
    }
}

function renderSidebar() {
    const sidebarMenu = document.getElementById('sidebarMenu');
    sidebarMenu.innerHTML = '';

    // Dashboard har doim ko'rsatiladi
    const dashboardLi = document.createElement('li');
    dashboardLi.setAttribute('data-target', 'dashboard');
    dashboardLi.innerHTML = `
                <i class="fas fa-tachometer-alt"></i>
                <span>Bosh sahifa</span>
            `;
    sidebarMenu.appendChild(dashboardLi);



    // Bo'linmalarni filtrlash
    const userBolinmalar = currentUser.bolinmalar || [];
    const userRole = currentUser.role;

    // Faqat foydalanuvchiga tegishli bo'limlarni ko'rsatish
    departments.slice(1).forEach(dept => {
        // Bo'linma ekanligini tekshirish
        const isBolinma = dept.id.startsWith('bolinma');

        // Agar foydalanuvchi bo'linma role'ida bo'lsa, faqat o'z bo'linmasini ko'rsin
        if (userRole === 'bolinma' && isBolinma) {
            if (!userBolinmalar.includes(dept.id)) {
                return; // Bu bo'linmani ko'rsatmaslik
            }
        }

        // Bo'lim (department) foydalanuvchilari barcha bo'linmalarni ko'rishi mumkin

        const li = document.createElement('li');
        li.setAttribute('data-target', dept.id);
        li.innerHTML = `
                    <i class="${dept.icon}"></i>
                    <span>${dept.name}</span>
                `;
        sidebarMenu.appendChild(li);
    });

    // Sidebar navigatsiya
    document.querySelectorAll("[data-target]").forEach(item => {
        item.addEventListener("click", () => {
            const target = item.getAttribute("data-target");
            document.querySelectorAll(".sidebar-menu li").forEach(li => li.classList.remove("active"));
            item.classList.add("active");

            document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
            const section = document.getElementById(target);
            if (section) section.classList.add("active");
        });
    });

    // Faol bo'limni belgilash
    if (currentUser.departments && currentUser.departments.includes('mexanika')) {
        const mexLink = sidebarMenu.querySelector('[data-target="mexanika"]');
        if (mexLink) {
            mexLink.classList.add('active');
            // Contentni ham active qilish kerak
            document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
            const section = document.getElementById('mexanika');
            if (section) section.classList.add("active");
        } else {
            if (sidebarMenu.firstElementChild) sidebarMenu.firstElementChild.classList.add('active');
        }
    } else {
        if (sidebarMenu.firstElementChild) sidebarMenu.firstElementChild.classList.add('active');
    }
}

function createDashboardSection() {
    const section = document.createElement('section');
    section.id = 'dashboard';
    section.className = 'content-section active';

    const userFiles = uploadedFiles.filter(f => currentUser.departments.includes(f.department));
    const totalFiles = userFiles.length;
    const approvedFiles = userFiles.filter(f => f.status === 'approved').length;
    const pendingFiles = userFiles.filter(f => f.status === 'pending').length;

    // HRM bo'limi - faqat admin va xodimlar bo'limi uchun
    let hrmSection = '';
    if (currentUser.role === 'admin' || currentUser.departments.includes('xodimlar')) {
        if (typeof renderHRDashboard === 'function') {
            hrmSection = renderHRDashboard();
            // Chartlarni ishga tushirish
            setTimeout(() => {
                if (typeof initHRCharts === 'function') initHRCharts();
            }, 500);
        } else {
            hrmSection = `
                <div class="hrm-section">
                    <div class="hrm-header">
                        <h2><i class="fas fa-users"></i> HRM - Xodimlar Boshqaruv Tizimi</h2>
                        <div class="hrm-controls">
                            <button class="hrm-btn" onclick="refreshHRM()">
                                <i class="fas fa-sync-alt"></i> Yangilash
                            </button>
                            <button class="hrm-btn primary" onclick="openHRMNewTab()">
                                <i class="fas fa-external-link-alt"></i> Yangi oynada ochish
                            </button>
                        </div>
                    </div>
                    <div class="hrm-container">
                        <iframe 
                            id="hrmFrame"
                            src="https://hrm.railway.uz/hrm/dashboard" 
                            frameborder="0" 
                            allowfullscreen
                            style="width: 100%; height: 800px; border-radius: 15px; background: white;"
                            onerror="handleHRMError()"
                        ></iframe>
                        <div id="hrmFallback" class="hrm-fallback" style="display: none;">
                            <div class="hrm-fallback-content">
                                <i class="fas fa-exclamation-triangle"></i>
                                <h3>HRM tizimini iframe ichida ochib bo'lmadi</h3>
                                <p>Xavfsizlik sababli tashqi sayt bu yerda ko'rsatilmayapti.</p>
                                <button class="hrm-open-btn" onclick="openHRMNewTab()">
                                    <i class="fas fa-external-link-alt"></i> HRM tizimini ochish
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Dashboard Content Logic
    let dashboardContent = '';

    if (currentUser.departments.includes('dispetcher')) {
        dashboardContent = `
            <div style="margin-bottom: 30px;">
                ${getDispatcherDashboardHTML()}
            </div>
        `;
    } else if (currentUser.role === 'bolinma') {
        dashboardContent = getSmartSubdivisionDashboardHTML(currentUser);
        // Initialize functionality after render
        setTimeout(initSubdivisionFeatures, 500);
    } else if (currentUser.departments.includes('mexanika')) {
        // SPECIAL: Render Mechanics Management for Mechanics user dashboard
        setTimeout(() => {
            const container = section.querySelector('#mechanics-dashboard-container');
            if (container && typeof renderMechanicsSection === 'function') {
                renderMechanicsSection(container, 'mexanika');
            }
        }, 100);
        dashboardContent = `<div id="mechanics-dashboard-container">Mexanika tizimi yuklanmoqda...</div>`;
    } else {
        dashboardContent = hrmSection;
    }

    section.innerHTML = `
                ${dashboardContent}
                
                ${(currentUser.role === 'admin' || currentUser.departments.includes('mehnat-muhofazasi')) && typeof getCentralSafetyMonitorHTML === 'function' ?
            getCentralSafetyMonitorHTML() : ''}

                ${currentUser.role !== 'bolinma' ? `
                <!-- Ob-havo bo'limi (Standart) -->
                <div class="weather-section">
                    <div class="weather-header">
                        <h3 class="weather-title">
                            <i class="fas fa-cloud-sun"></i> Buxoro viloyati ob-havo ma'lumoti
                        </h3>
                        <div class="weather-controls">
                            <button class="weather-btn active" data-time="current">Hozirgi</button>
                            <button class="weather-btn" data-time="hourly">Soatlik</button>
                            <button class="weather-btn" data-time="daily">Kunlik</button>
                            <button class="refresh-weather">
                                <i class="fas fa-sync-alt"></i> Yangilash
                            </button>
                        </div>
                    </div>
                    <div class="weather-container">
                        <div class="weather-loading">
                            <i class="fas fa-spinner fa-spin"></i> Havo ma'lumotlari yuklanmoqda...
                        </div>
                    </div>
                </div>
                
                <!-- Raqobat grafigi -->
                <div class="competition-section">
                    <div class="chart-header">
                        <h3 class="chart-title">
                            <i class="fas fa-chart-bar"></i> Bo'limlar o'rtasidagi raqobat (1-10 bo'limlar)
                        </h3>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-chart="bar">Stolbchali</button>
                            <button class="chart-btn" data-chart="line">Chiziqli</button>
                            <button class="chart-btn" data-chart="pie">Pasta</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="competitionChart"></canvas>
                    </div>
                </div>
                
                <!-- Yangiliklar bo'limi -->
                <div class="news-section">
                    <div class="news-header">
                        <h3 class="news-title">
                            <i class="fas fa-newspaper"></i> So'nggi temir yo'l yangiliklari
                        </h3>
                        <button class="refresh-news">
                            <i class="fas fa-sync-alt"></i> Yangilash
                        </button>
                    </div>
                    <div class="news-container">
                        <div class="loading-news">
                            <i class="fas fa-spinner fa-spin"></i> Yangiliklarni yuklanmoqda...
                        </div>
                    </div>
                </div>
                
                <!-- Sizga tegishli bo'limlar - Collapsible -->
                <div class="collapsible-section">
                    <div class="collapsible-header" onclick="toggleDepartments()">
                        <h3 class="section-title" style="margin: 0; cursor: pointer;">
                            <i class="fas fa-building"></i> Sizga tegishli bo'limlar
                            <i class="fas fa-chevron-down toggle-icon" id="deptToggleIcon"></i>
                        </h3>
                    </div>
                    <div class="collapsible-content" id="departmentsContent" style="display: none;">
                        <div class="journal-list" id="functionalDepartmentsList">
                            ${functionalDepartments
                .filter(dept => currentUser.departments.includes(dept.id))
                .map(dept => `
                                <div class="journal-card" data-department="${dept.id}">
                                    <h4><i class="${dept.icon}"></i> ${dept.name}</h4>
                                    <p>Mas'ul: ${dept.manager}</p>
                                    <p style="margin-top: 10px; font-size: 0.9rem; color: rgba(255,255,255,0.7)">${dept.description}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            ` : ''}`;

    return section;
}

function renderMainContent() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = '';

    // Dashboard
    const dashboardSection = createDashboardSection();
    mainContent.appendChild(dashboardSection);

    // New Sections
    if (typeof createTasksSection === 'function') mainContent.appendChild(createTasksSection());
    if (typeof createMaintenanceSection === 'function') mainContent.appendChild(createMaintenanceSection());

    // Bo'linmalar uchun section yaratish
    departments.slice(1).forEach(dept => {
        const section = createDepartmentSection(dept);
        mainContent.appendChild(section);
    });

    // AI Development section

    // Bo'lim oynalarini ochish
    document.addEventListener('click', function (e) {
        if (e.target.closest('.journal-card[data-department]')) {
            const card = e.target.closest('.journal-card[data-department]');
            const departmentId = card.getAttribute('data-department');

            // Bo'linma ichidagi bo'lim ekanligini tekshirish
            if (departmentId.includes('-section-')) {
                // Bo'linma ichidagi bo'lim - bolinma1-section-1 formatida
                const parts = departmentId.split('-section-');
                const bolinmaId = parts[0]; // bolinma1
                const sectionId = parts[1]; // 1

                // Admin har qanday bo'limga kirishi mumkin
                if (currentUser.role === 'admin') {
                    openBolinmaSectionWindow(bolinmaId, sectionId);
                } else {
                    // Boshqa foydalanuvchilar uchun
                    openBolinmaSectionWindow(bolinmaId, sectionId);
                }
            } else {
                // Oddiy functional department
                if (currentUser.role === 'admin' || currentUser.departments.includes(departmentId)) {
                    openDepartmentWindow(departmentId);
                } else {
                    alert('Sizga bu bo\'limga kirish ruxsati berilmagan!');
                }
            }
        }
    });

    // Bo'lim oynalarini yopish
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('close-window')) {
            closeAllWindows();
        }
    });

    // Overlay orqali yopish
    document.getElementById('department-overlay').addEventListener('click', () => {
        closeAllWindows();
    });

    // Integratsiya tablari
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('integration-tab')) {
            const tab = e.target;
            const tabId = tab.getAttribute('data-tab');
            const parentWindow = tab.closest('.integration-window');

            // Barcha tablarni yopish
            parentWindow.querySelectorAll('.integration-tab').forEach(t => t.classList.remove('active'));
            parentWindow.querySelectorAll('.integration-frame, .integration-panel').forEach(content => {
                content.style.display = 'none';
            });

            // Faol tabni ochish
            tab.classList.add('active');
            const activeContent = parentWindow.querySelector(`#${tabId}`);
            if (activeContent) {
                activeContent.style.display = activeContent.classList.contains('integration-frame') ? 'block' : 'block';
            }
        }
    });

    // Dashboard widgetlarini ishga tushirish
    initDashboardWidgets();
}

function createDepartmentSection(department) {
    const section = document.createElement('section');
    section.id = department.id;
    section.className = 'content-section';

    // SPECIAL: Mexanika Dashboard Render
    if (department.id === 'mexanika') {
        section.innerHTML = '';
        if (typeof renderMechanicsSection === 'function') {
            renderMechanicsSection(section, 'mexanika');
        } else {
            section.innerHTML = 'Mexanika boshqaruvi yuklanmoqda...';
        }
        return section;
    }

    const deptFiles = uploadedFiles.filter(f => f.department === department.id);

    // Bo'limlarni aniqlash va filtrlash
    let displaySectionsList = [];
    if (sectionsData[department.id]) {
        displaySectionsList = [...sectionsData[department.id]];

        // Agar foydalanuvchi bo'lim (department) role'ida bo'lsa, 
        // faqat o'ziga tegishli bo'limni ko'rsatish
        if (currentUser.role === 'department') {
            const userDeptId = currentUser.departments[0];
            const userDept = functionalDepartments.find(d => d.id === userDeptId);
            if (userDept) {
                const cleanName = userDept.name.replace(" bo'limi", "").toLowerCase();
                displaySectionsList = displaySectionsList.filter(s => s.name.toLowerCase().includes(cleanName));
            }
        }
    } else {
        displaySectionsList = functionalDepartments.filter(dept => currentUser.departments.includes(dept.id));
    }

    section.innerHTML = `
                <h2><i class="${department.icon}"></i> ${department.name}</h2>
                <p>${department.name} ma'lumotlari va hisobotlari</p>

                ${department.id.includes('mexanika') || (department.name && department.name.toLowerCase().includes('mexanika')) ? `
                <div class="content-card" style="background: linear-gradient(135deg, rgba(230, 126, 34, 0.2), rgba(211, 84, 0, 0.2));">
                    <h3><i class="fas fa-tools"></i> Texnika Holati</h3>
                    <div style="display: flex; align-items: center; gap: 15px; margin-top: 10px;">
                        <div style="font-size: 2rem; color: #e67e22;"><i class="fas fa-cogs"></i></div>
                        <div>
                            <div style="font-size: 1.2rem; font-weight: bold;">88%</div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">Ishchi tayyorgarlik</div>
                        </div>
                    </div>
                    <div style="margin-top: 10px; font-size: 0.85rem;">
                        <span style="color: #2ecc71;">● 24 Faol</span> | 
                        <span style="color: #e67e22;">● 5 Ta'mir</span>
                    </div>
                </div>
                ` : ''}

                <h3 class="section-title">Bo'limlar</h3>

                <div style="display: flex; gap: 15px; align-items: flex-start;">
                    <div class="journal-list" style="flex: 1; min-width: 0;">
                        ${displaySectionsList.map(s => `
                            <div class="journal-card" data-department="${sectionsData[department.id] ? department.id + '-section-' + s.id : s.id}">
                                <h4><i class="${s.icon}"></i> ${s.name}</h4>
                                <p>${s.description || ''}</p>
                            </div>
                        `).join('')}
                    </div>
                    
                    ${department.id.startsWith('bolinma') ? `
                    <div class="road-management-sidebar">
                        ${getRoadSidebarHTML(department.id)}
                    </div>
                    ` : ''}
                </div>
            `;

    return section;
}

// Bo'linma ichidagi bo'lim uchun oyna ochish
function openBolinmaSectionWindow(bolinmaId, sectionId) {
    const bolinmaSections = sectionsData[bolinmaId];
    if (!bolinmaSections) return;

    const section = bolinmaSections.find(s => s.id == sectionId);
    if (!section) return;

    // Kompozit ID yaratish
    const compositeId = `${bolinmaId}-${sectionId}`;

    // Mavjud oynani tekshirish
    let existingWindow = document.getElementById(`${compositeId}-window`);

    if (!existingWindow) {
        // Yangi oyna yaratish
        const template = document.getElementById('departmentWindowTemplate');
        const clone = template.content.cloneNode(true);
        existingWindow = clone.querySelector('.department-window');
        existingWindow.id = `${compositeId}-window`;

        // Bo'linma va bo'lim nomini ko'rsatish
        const bolinmaNum = bolinmaId.replace('bolinma', '');
        existingWindow.querySelector('.department-name').textContent = `${bolinmaNum}-bo'linma: ${section.name}`;

        // Integratsiya tugmasini sozlash
        const integrateBtn = existingWindow.querySelector('.integrate-btn');
        if (section.integrations && section.integrations.length > 0) {
            integrateBtn.style.display = 'flex';
            integrateBtn.addEventListener('click', () => {
                openIntegrationWindow(section.integrations[0], compositeId);
            });
        } else {
            integrateBtn.style.display = 'none';
        }

        // Elektron Tabel tugmasini sozlash (Xodimlar bo'limi uchun)
        const timesheetBtn = existingWindow.querySelector('.timesheet-btn');
        if (timesheetBtn) {
            const isXodimlar = section.name.toLowerCase().includes('xodimlar') || section.name.toLowerCase().includes('kadrlar');
            if (isXodimlar) {
                timesheetBtn.style.display = 'inline-flex';
                timesheetBtn.onclick = () => {
                    const bolinmaNum = bolinmaId.replace('bolinma', '');
                    openTimesheet(`${bolinmaNum}-bo'linma`);
                };

                // Xodimlar bo'limiga faqat tabel kerak, TNU-19/TNU-20/TO jurnallari kerak emas
            } else {
                timesheetBtn.style.display = 'none';
            }
        }

        document.body.appendChild(existingWindow);

        // Event listener'lar
        setupDepartmentWindowEvents(existingWindow, compositeId);
    }

    // 0. Update Upload Button Visibility
    const uploadBtn = existingWindow.querySelector('.upload-file-btn');
    if (uploadBtn) {
        if (currentUser.role === 'bolinma') {
            uploadBtn.style.display = 'inline-flex';
        } else {
            uploadBtn.style.display = 'none';
        }
    }

    // 1. Always update files for all sections (Restored functionality)
    // EXCEPTION: Safety (Mehnat) section handles its own view exclusively.
    if (!section.name.toLowerCase().includes('mehnat')) {
        updateFilesTable(existingWindow, compositeId);
    }

    // 2. Check for Special Sections
    const sName = section.name.toLowerCase();

    // B) Ishlab Chiqarish Section (Production)
    const isIshlab = sName.includes('ishlab') || section.id == 1;
    if (isIshlab) {
        console.log('Production section detected:', section.name);
        renderProductionSection(existingWindow, bolinmaId);
    } else {
        // Cleanup production view
        const existingView = existingWindow.querySelector('#production-journals-view');
        if (existingView) existingView.remove();
    }

    // --- Nom asosida bo'lim turini aniqlash (magic number emas!) ---
    const isIqtisod = sName.includes('iqtisod');
    const isDispetcher = sName.includes('dispetcher');
    const isMetrology = sName.includes('metrologiya');
    const isBugalter = sName.includes('bugalteriya');
    const isMehnat = sName.includes('mehnat');
    const isMexanika = sName.includes('mexanika');

    // C) Iqtisod Section (Economy - PU-74)
    if (isIqtisod) {
        renderEconomySection(existingWindow, bolinmaId);
    } else {
        existingWindow.querySelector('#economy-journals-view')?.remove();
    }

    // D) Dispatcher Section
    if (isDispetcher) {
        renderSubdivisionReportSection(existingWindow, bolinmaId);
    } else {
        existingWindow.querySelector('#dispatcher-assignment-view')?.remove();
    }

    // E) Metrology Section
    if (isMetrology) {
        renderMetrologySection(existingWindow, bolinmaId);
    } else {
        existingWindow.querySelector('#metrology-dashboard-view')?.remove();
    }

    // F) Accounting Section (Bugalteriya)
    if (isBugalter) {
        renderAccountingSection(existingWindow, bolinmaId);
    } else {
        existingWindow.querySelector('#accounting-journals-view')?.remove();
    }

    // G) Safety Section (Mehnat Muhofazasi)
    if (isMehnat) {
        // Faqat safety ko'rinishi — fayl panellarini yashiramiz
        const fileMgmt = existingWindow.querySelector('.file-management');
        if (fileMgmt) fileMgmt.style.display = 'none';
        existingWindow.querySelector('.files-table')?.style && (existingWindow.querySelector('.files-table').style.display = 'none');
        existingWindow.querySelectorAll('.section-title').forEach(el => el.style.display = 'none');
        renderMehnatSection(existingWindow, bolinmaId);
    } else {
        // Mehnat bo'limi yopilganda elementlarni tiklash
        existingWindow.querySelector('#safety-dashboard-view')?.remove();
        const fileMgmt = existingWindow.querySelector('.file-management');
        if (fileMgmt) fileMgmt.style.display = '';
    }

    // H) Mechanics Section
    if (isMexanika) {
        if (window.injectMexanikaButtons) {
            window.injectMexanikaButtons(existingWindow, bolinmaId);
        }
        renderMexanikaSection(existingWindow, bolinmaId);
    } else {
        existingWindow.querySelector('#mechanics-section-view')?.remove();
        existingWindow.querySelector('.mexanika-injected-buttons')?.remove();
    }

    // Oynani ko'rsatish
    existingWindow.classList.add('active');
    document.getElementById('department-overlay').classList.add('active');
}

// ─────────────────────────────────────────────────────────────────
// Accounting Section render (Bugalteriya bo'limi uchun)
// ─────────────────────────────────────────────────────────────────
function renderAccountingSection(winEl, bolinmaId) {
    const contentDiv = winEl.querySelector('.window-content') || winEl.querySelector('.department-body') || winEl;
    if (!contentDiv) return;

    let accView = contentDiv.querySelector('#accounting-journals-view');
    if (!accView) {
        accView = document.createElement('div');
        accView.id = 'accounting-journals-view';
        accView.style.marginTop = '10px';
        accView.style.marginBottom = '20px';

        // Always place it at the VERY TOP of content area
        if (contentDiv.firstChild) {
            contentDiv.insertBefore(accView, contentDiv.firstChild);
        } else {
            contentDiv.appendChild(accView);
        }

        // Toolbar tugmalarini sozlash
        const fileControls = contentDiv.querySelector('.file-management');
        if (fileControls) {
            // Eskilarini tozalash (agar bo'lsa)
            fileControls.querySelectorAll('.accounting-open-btn, .incoming-open-btn, .archive-open-btn').forEach(b => b.remove());

            if (!fileControls.querySelector('.m29-toolbar-btn')) {
                const btnCfg = [
                    {
                        label: '<i class="fas fa-file-signature"></i> M-29',
                        cls: 'm29-toolbar-btn',
                        fn: () => window.openMaterialsWindow && window.openMaterialsWindow(bolinmaId)
                    },
                    {
                        label: '<i class="fas fa-boxes"></i> Materiallar',
                        cls: 'materials-toolbar-btn',
                        fn: () => window.openAccountingJournal && window.openAccountingJournal('MaterialReport', bolinmaId)
                    }
                ];
                btnCfg.forEach(cfg => {
                    const btn = document.createElement('button');
                    btn.className = `control-btn ${cfg.cls}`;
                    btn.style.cssText = 'background:linear-gradient(45deg,#1abc9c,#16a085); border:none; color:white; padding:8px 14px; border-radius:8px; cursor:pointer; font-size:0.85rem; font-weight:600; display:inline-flex; align-items:center; gap:6px; margin-right:5px;';
                    btn.innerHTML = cfg.label;
                    btn.onclick = cfg.fn;
                    fileControls.appendChild(btn);
                });
            }
        }
    } else {
        // Ensure it's still at the top if it was moved
        if (contentDiv.firstChild !== accView) {
            contentDiv.insertBefore(accView, contentDiv.firstChild);
        }
    }

    accView.innerHTML = `
        <div style="padding:20px; background:rgba(26,188,152,0.12); border:1px solid rgba(26,188,152,0.4); border-radius:12px; box-shadow: 0 8px 25px rgba(0,0,0,0.4); border-left: 5px solid #1abc9c;">
            <h3 style="color:#1abc9c; margin-top:0; margin-bottom:15px; display:flex; align-items:center; gap:10px; font-size:1.3rem;">
                <i class="fas fa-calculator"></i> Bugalteriya — Tezkor Amallar va Jurnallar
            </h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px,1fr)); gap:15px;">
                <div class="acc-card" onclick="window.openMaterialsWindow && window.openMaterialsWindow('${bolinmaId}')" 
                    style="background:rgba(0,0,0,0.5); padding:15px; border-radius:10px; cursor:pointer; border:1px solid rgba(255,255,255,0.1); transition:all 0.3s; text-align:center;">
                    <i class="fas fa-file-signature" style="font-size:1.8rem; color:#f1c40f; margin-bottom:8px; display:block;"></i>
                    <div style="font-weight:bold; color:white; font-size:1rem;">M-29</div>
                    <div style="font-size:0.75rem; color:rgba(255,255,255,0.5);">Materiallar Dalolatnomasi</div>
                </div>
                <div class="acc-card" onclick="window.openAccountingJournal \u0026\u0026 window.openAccountingJournal('MaterialReport','${bolinmaId}')" 
                    style="background:rgba(0,0,0,0.5); padding:15px; border-radius:10px; cursor:pointer; border:1px solid rgba(255,255,255,0.1); transition:all 0.3s; text-align:center;">
                    <i class="fas fa-boxes" style="font-size:1.8rem; color:#3498db; margin-bottom:8px; display:block;"></i>
                    <div style="font-weight:bold; color:white; font-size:1rem;">Materiallar</div>
                    <div style="font-size:0.75rem; color:rgba(255,255,255,0.5);">Materiallar qoldig'i va hisoboti</div>
                </div>
                <div class="acc-card" onclick="alert('Arxiv bo\\'limi tez orada ishga tushadi!')" 
                    style="background:rgba(0,0,0,0.5); padding:15px; border-radius:10px; cursor:pointer; border:1px solid rgba(255,255,255,0.1); transition:all 0.3s; text-align:center;">
                    <i class="fas fa-archive" style="font-size:1.8rem; color:#8e44ad; margin-bottom:8px; display:block;"></i>
                    <div style="font-weight:bold; color:white; font-size:1rem;">Arxiv</div>
                    <div style="font-size:0.75rem; color:rgba(255,255,255,0.5);">Hujjatlar Arxivi</div>
                </div>
            </div>
        </div>
        <style>
            .acc-card:hover { 
                border-color: #1abc9c !important; 
                transform: translateY(-5px);
                background: rgba(26, 188, 156, 0.15) !important;
                box-shadow: 0 10px 20px rgba(0,0,0,0.4);
            }
        </style>
    `;
}

function renderSubdivisionReportSection(winEl, bolinmaId) {
    const contentDiv = winEl.querySelector('.window-content');
    if (!contentDiv) return;

    // 1. Find or create container
    let reportView = contentDiv.querySelector('#dispatcher-assignment-view');
    if (!reportView) {
        reportView = document.createElement('div');
        reportView.id = 'dispatcher-assignment-view';
        reportView.style.display = 'none'; // Hidden by default
        reportView.style.marginTop = '15px';

        // Insert after file controls
        const fileControls = contentDiv.querySelector('.file-management');
        if (fileControls && fileControls.nextElementSibling) {
            contentDiv.insertBefore(reportView, fileControls.nextElementSibling);
        } else {
            contentDiv.appendChild(reportView);
        }

        reportView.innerHTML = getReportSubmissionPanelHTML(bolinmaId);

        // Add Toggle Button to File Controls
        if (fileControls) {
            if (!fileControls.querySelector('.toggle-assignment-btn')) {
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'control-btn toggle-assignment-btn';
                toggleBtn.style.background = 'linear-gradient(45deg, #2ecc71, #27ae60)';
                toggleBtn.innerHTML = '<i class="fas fa-file-export"></i> Kunlik ish rejasi';
                toggleBtn.onclick = () => {
                    // winEl ishlatiladi (global window emas!)
                    const view = winEl.querySelector('#dispatcher-assignment-view');
                    if (view.style.display === 'none') {
                        view.style.display = 'block';
                        toggleBtn.innerHTML = '<i class="fas fa-times"></i> Yopish';
                    } else {
                        view.style.display = 'none';
                        toggleBtn.innerHTML = '<i class="fas fa-file-export"></i> Kunlik ish rejasi';
                    }
                };
                fileControls.appendChild(toggleBtn);
            }
        }
    }
}

// --- PRODUCTION SECTION RENDERER ---
function renderProductionSection(winEl, bolinmaId) {
    console.log('Rendering Production Section Content for', bolinmaId);
    const contentDiv = winEl.querySelector('.window-content') || winEl.querySelector('.department-body') || winEl;
    if (!contentDiv) {
        console.error('Content container not found for Production section!');
        return;
    }

    let prodView = contentDiv.querySelector('#production-journals-view');
    if (!prodView) {
        prodView = document.createElement('div');
        prodView.id = 'production-journals-view';
        prodView.style.marginTop = '15px';
        prodView.style.marginBottom = '25px';
        prodView.style.width = '100%';
        prodView.style.display = 'block';

        // Ensure it stays at the very TOP
        if (contentDiv.firstChild) {
            contentDiv.insertBefore(prodView, contentDiv.firstChild);
        } else {
            contentDiv.appendChild(prodView);
        }
    } else {
        prodView.style.display = 'block';
    }

    prodView.innerHTML = `
        <div style="padding:20px; background:rgba(52,152,219,0.12); border:1px solid rgba(52,152,219,0.4); border-radius:12px; box-shadow: 0 8px 25px rgba(0,0,0,0.4); border-left: 5px solid #3498db;">
            <h3 style="color:#3498db; margin-top:0; margin-bottom:15px; display:flex; align-items:center; gap:10px; font-size:1.4rem;">
                <i class="fas fa-industry"></i> Ishlab Chiqarish — Elektron Jurnallar
            </h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px,1fr)); gap:20px;">
                <div class="production-journal-card" onclick="openJournal('PU-28','${bolinmaId}')" 
                    style="background:rgba(0,0,0,0.6); padding:20px; border-radius:12px; cursor:pointer; border:1px solid rgba(255,255,255,0.15); transition:all 0.3s; text-align:center;">
                    <i class="fas fa-clipboard-check" style="font-size:2.2rem; color:#3498db; margin-bottom:12px; display:block;"></i>
                    <div style="font-weight:bold; color:white; font-size:1.1rem; margin-bottom:4px;">PU-28</div>
                    <div style="font-size:0.85rem; color:rgba(255,255,255,0.6);">Yo'l Ko'rik Kitobi</div>
                </div>
                <div class="production-journal-card" onclick="openJournal('PU-29','${bolinmaId}')" 
                    style="background:rgba(0,0,0,0.6); padding:20px; border-radius:12px; cursor:pointer; border:1px solid rgba(255,255,255,0.15); transition:all 0.3s; text-align:center;">
                    <i class="fas fa-ruler-combined" style="font-size:2.2rem; color:#2ecc71; margin-bottom:12px; display:block;"></i>
                    <div style="font-weight:bold; color:white; font-size:1.1rem; margin-bottom:4px;">PU-29</div>
                    <div style="font-size:0.85rem; color:rgba(255,255,255,0.6);">Yo'l O'lchash Kitobi</div>
                </div>
                <div class="production-journal-card" onclick="openPU74New('1','${bolinmaId}')" 
                    style="background:rgba(0,0,0,0.6); padding:20px; border-radius:12px; cursor:pointer; border:1px solid rgba(255,255,255,0.15); transition:all 0.3s; text-align:center;">
                    <i class="fas fa-file-invoice-dollar" style="font-size:2.2rem; color:#f1c40f; margin-bottom:12px; display:block;"></i>
                    <div style="font-weight:bold; color:white; font-size:1.1rem; margin-bottom:4px;">PU-74</div>
                    <div style="font-size:0.85rem; color:rgba(255,255,255,0.6);">Ish Dalolatnomasi</div>
                </div>
                <div class="production-journal-card" onclick="openJournal('PU-80','${bolinmaId}')" 
                    style="background:rgba(0,0,0,0.6); padding:20px; border-radius:12px; cursor:pointer; border:1px solid rgba(255,255,255,0.15); transition:all 0.3s; text-align:center;">
                    <i class="fas fa-wrench" style="font-size:2.2rem; color:#e67e22; margin-bottom:12px; display:block;"></i>
                    <div style="font-weight:bold; color:white; font-size:1.1rem; margin-bottom:4px;">PU-80</div>
                    <div style="font-size:0.85rem; color:rgba(255,255,255,0.6);">Ish Qurollari</div>
                </div>
            </div>
        </div>
        <style>
            .production-journal-card:hover { 
                border-color: #3498db !important; 
                transform: translateY(-8px) scale(1.02);
                background: rgba(52, 152, 219, 0.25) !important;
                box-shadow: 0 12px 25px rgba(0,0,0,0.5);
            }
        </style>
    `;
}

// --- DIGITAL JOURNAL LOGIC ---
function openJournal(type, bolinmaId) {
    console.log(`Opening Journal: ${type} for ${bolinmaId}`);

    if (type === 'PU-28') {
        openPU28Modal(bolinmaId);
    } else if (type === 'PU-29') {
        openPU29Modal(bolinmaId);
    } else if (type === 'PU-80') {
        openPU80Window(bolinmaId);
    } else if (type === 'M-29') {
        openMaterialsWindow(bolinmaId);
    } else {
        alert(`"${type}" elektron jurnali hozirda tayyorlanmoqda.Tez orada ishga tushadi!`);
    }
}

// --- PU-28: Yo'l Ko'rik Kitobi ---
function openPU28Modal(bolinmaId) {
    // 1. Create Modal — har bo'linma uchun alohida ID
    const modalId = `pu28 - modal - ${bolinmaId} `;
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'journal-modal';
        modal.innerHTML = `
    < div class="journal-window" >
                                            <div class="journal-header">
                                                <h3><i class="fas fa-clipboard-check"></i> PU-28: Yo'l Ko'rik Kitobi</h3>
                                                <button class="close-btn" onclick="closeJournalModal('pu28-modal-${bolinmaId}')"><i class="fas fa-times"></i></button>
                                            </div>
                                            <div class="journal-body">
                                                <div class="journal-controls">
                                                    <button class="action-btn" onclick="addPU28Entry('${bolinmaId}')"><i class="fas fa-plus"></i> Yangi Kamchilik Qo'shish</button>
                                                    <button class="action-btn export" onclick="exportPU28('${bolinmaId}')"><i class="fas fa-file-excel"></i> Excelga Yuklash</button>
                                                </div>
                                                <div class="journal-table-container">
                                                    <table class="journal-table" id="pu28-table-${bolinmaId}">
                                                        <thead>
                                                            <tr>
                                                                <th>Sana</th>
                                                                <th>Joyi (km/pk)</th>
                                                                <th>Aniqlangan Kamchilik</th>
                                                                <th>Muddati</th>
                                                                <th>Mas'ul</th>
                                                                <th>Holati</th>
                                                                <th>Amallar</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody id="pu28-tbody">
                                                            <!-- JS renders rows here -->
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div >
    `;
        document.body.appendChild(modal);
    }

    // 2. Load Data
    renderPU28Table(bolinmaId);

    // 3. Show Modal
    modal.classList.add('active');
}

function closeJournalModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function renderPU28Table(bolinmaId) {
    // tbody ID — har bo'linma uchun alohida
    const tbody = document.getElementById(`pu28 - tbody - ${bolinmaId} `) || document.getElementById('pu28-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const data = JSON.parse(localStorage.getItem(`pu28_data_${bolinmaId} `)) || [];

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px;">Hozircha yozuvlar yo\'q.</td></tr>';
        return;
    }

    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.location}</td>
            <td>${item.defect}</td>
            <td>${item.deadline}</td>
            <td>${item.responsible}</td>
            <td>
                <span class="status-badge ${item.status === 'done' ? 'done' : 'pending'}">
                    ${item.status === 'done' ? 'Bajarildi' : 'Jarayonda'}
                </span>
            </td>
            <td>
                <button class="icon-btn delete" onclick="deletePU28Entry('${bolinmaId}', ${index})"><i class="fas fa-trash"></i></button>
                <button class="icon-btn check" onclick="togglePU28Status('${bolinmaId}', ${index})" title="Holatni o'zgartirish">
                    <i class="fas fa-check-circle"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function addPU28Entry(bolinmaId) {
    // Simple prompt-based add for MVP (can be upgraded to modal form later)
    const date = new Date().toLocaleDateString();
    const location = prompt("Joyi (km/pk):");
    if (!location) return;
    const defect = prompt("Aniqlangan kamchilik:");
    const deadline = prompt("Muddati (sana):");
    const responsible = prompt("Mas'ul shaxs:");

    if (location && defect) {
        const newItem = {
            date, location, defect, deadline, responsible,
            status: 'pending'
        };

        const data = JSON.parse(localStorage.getItem(`pu28_data_${bolinmaId} `)) || [];
        data.push(newItem);
        localStorage.setItem(`pu28_data_${bolinmaId} `, JSON.stringify(data));

        renderPU28Table(bolinmaId);
    }
}

function deletePU28Entry(bolinmaId, index) {
    if (confirm("O'chirilsinmi?")) {
        const data = JSON.parse(localStorage.getItem(`pu28_data_${bolinmaId} `)) || [];
        data.splice(index, 1);
        localStorage.setItem(`pu28_data_${bolinmaId} `, JSON.stringify(data));
        renderPU28Table(bolinmaId);
    }
}

function togglePU28Status(bolinmaId, index) {
    const data = JSON.parse(localStorage.getItem(`pu28_data_${bolinmaId} `)) || [];
    if (data[index]) {
        data[index].status = data[index].status === 'done' ? 'pending' : 'done';
        localStorage.setItem(`pu28_data_${bolinmaId} `, JSON.stringify(data));
        renderPU28Table(bolinmaId);
    }
}

// --- PU-29: Yo'l O'lchash Kitobi ---
function openPU29Modal(bolinmaId) {
    let modal = document.getElementById('pu29-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pu29-modal';
        modal.className = 'journal-modal';
        modal.innerHTML = `
        <div class="journal-window">
                                            <div class="journal-header" style="background: rgba(46, 204, 113, 0.1);">
                                                <h3><i class="fas fa-ruler-combined"></i> PU-29: Yo'l O'lchash Kitobi</h3>
                                                <button class="close-btn" onclick="closeJournalModal('pu29-modal')"><i class="fas fa-times"></i></button>
                                            </div>
                                            <div class="journal-body">
                                                <div class="journal-controls">
                                                    <button class="action-btn" onclick="addPU29Entry('${bolinmaId}')"><i class="fas fa-plus"></i> Yangi O'lchov</button>
                                                    <button class="action-btn export" onclick="exportPU28('${bolinmaId}')"><i class="fas fa-file-excel"></i> Excelga Yuklash</button>
                                                </div>
                                                <div class="journal-table-container">
                                                    <table class="journal-table" id="pu29-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Sana</th>
                                                                <th>Piket (PK)</th>
                                                                <th>Sath (Uroven)</th>
                                                                <th>Shablon (mm)</th>
                                                                <th>Izoh</th>
                                                                <th>Amallar</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody id="pu29-tbody">
                                                            <!-- JS renders rows here -->
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div >
    `;
        document.body.appendChild(modal);
    }
    renderPU29Table(bolinmaId);
    modal.classList.add('active');
}

function renderPU29Table(bolinmaId) {
    const tbody = document.getElementById('pu29-tbody');
    tbody.innerHTML = '';
    const data = JSON.parse(localStorage.getItem(`pu29_data_${bolinmaId}`)) || [];

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Hozircha yozuvlar yo\'q.</td></tr>';
        return;
    }

    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.picket}</td>
            <td>${item.level}</td>
            <td>${item.width}</td>
            <td>${item.note || '-'}</td>
            <td>
                <button class="icon-btn delete" onclick="deletePU29Entry('${bolinmaId}', ${index})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function addPU29Entry(bolinmaId) {
    const date = new Date().toLocaleDateString();
    const picket = prompt("Piket (PK):");
    if (!picket) return;
    const level = prompt("Sath (Uroven) (+/- mm):");
    const width = prompt("Shablon (mm):");
    const note = prompt("Izoh:");

    if (width) {
        const newItem = { date, picket, level, width, note };
        const data = JSON.parse(localStorage.getItem(`pu29_data_${bolinmaId} `)) || [];
        data.push(newItem);
        localStorage.setItem(`pu29_data_${bolinmaId} `, JSON.stringify(data));
        renderPU29Table(bolinmaId);
    }
}

function deletePU29Entry(bolinmaId, index) {
    if (confirm("O'chirilsinmi?")) {
        const data = JSON.parse(localStorage.getItem(`pu29_data_${bolinmaId} `)) || [];
        data.splice(index, 1);
        localStorage.setItem(`pu29_data_${bolinmaId} `, JSON.stringify(data));
        renderPU29Table(bolinmaId);
    }
}

function exportPU28(bolinmaId) {
    // Simple alert for now, real export requires XLSX logic similar to PU-74
    alert("Excelga yuklash funksiyasi keyingi bosqichda qo'shiladi.");
}

// Redundant economy and accounting section old code removed.

function openPU74(brigadaNum, bolinmaId) {
    // 1. Fayl nomini aniqlash
    const filename = `PU -74_Brigada_${brigadaNum}.xlsx`;

    // 2. Fayl mavjudligini tekshirish (uploadFiles global massividan)
    // Biz faylni "department" nomi bo'yicha qidiramiz. Oddiylik uchun bolinmaId ishlatiladi.
    let file = uploadedFiles.find(f => f.name === filename && f.department === bolinmaId);

    if (file) {
        // Fayl bor bo'lsa, Excel tahrirchini ochish
        openExcelEditor(file);
    } else {
        // 3. Fayl yo'q bo'lsa, yangi shablon yaratish
        const confirmCreate = confirm(`"${filename}" topilmadi.Yangi Excel shablon yaratilsinmi ? `);
        if (confirmCreate) {
            // PU-74 uchun boshlang'ich ma'lumotlar
            const headers = ['Sana', 'Ish Turi', 'O\'lchov Birligi', 'Hajmi', 'Joyi (KM/PK)', 'Mas\'ul'];
            const defaultData = [headers];

            // XLSX kutubxonasi yordamida buffer yaratish
            try {
                const workbook = XLSX.utils.book_new();
                const worksheet = XLSX.utils.aoa_to_sheet(defaultData);

                // Ustun kengliklarini sozlash
                const wscols = [
                    { wch: 12 }, // Sana
                    { wch: 30 }, // Ish Turi
                    { wch: 15 }, // O'lchov
                    { wch: 10 }, // Hajm
                    { wch: 20 }, // Joyi
                    { wch: 20 }  // Mas'ul
                ];
                worksheet['!cols'] = wscols;

                XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
                const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

                // Yangi fayl obyekti
                const newFile = {
                    id: Date.now().toString(),
                    name: filename,
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    size: 2048,
                    department: bolinmaId,
                    uploadDate: new Date().toLocaleDateString(),
                    content: excelBuffer,
                    status: 'new'
                };

                // Faylni saqlash
                uploadedFiles.push(newFile);
                saveDatabase();

                // Interfeysni yangilash
                updateAllDepartmentWindows();

                // Tahrirchini ochish
                openExcelEditor(newFile);

            } catch (e) {
                console.error("Excel yaratishda xatolik:", e);
                alert("Excel fayl yaratib bo'lmadi. Tizim xatosi.");
            }
        }
    }
}

function openPU74New(brigadaNum, bolinmaId) {
    try {
        console.log("PU-74 Clicked:", brigadaNum, bolinmaId);

        // Create or show PU-74 modal
        let modal = document.getElementById('pu74-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'pu74-modal';
            modal.className = 'journal-modal';
            modal.innerHTML = getPU74ModalHTML();
            document.body.appendChild(modal);
        }

        // Update modal title and store context
        modal.setAttribute('data-brigada', brigadaNum);
        modal.setAttribute('data-bolinma', bolinmaId);

        const bolinmaNum = bolinmaId.replace('bolinma', '');
        modal.querySelector('.journal-header h3').innerHTML = `
    < i class="fas fa-file-invoice-dollar" ></i > PU - 74: Ish Bajarilganlik Dalolatnomasi
        < span style = "font-size: 0.8rem; opacity: 0.8; margin-left: 10px;" >
            (${bolinmaNum} -bo'linma, ${brigadaNum}-Brigada)
            </span >
    `;

        // Render table data
        renderPU74Table(brigadaNum, bolinmaId);

        // Show modal
        modal.classList.add('active');

    } catch (e) {
        console.error("PU-74 Error:", e);
        alert("Xatolik yuz berdi: " + e.message);
    }
}

function getPU74ModalHTML() {
    return `
    < div class="journal-window" style = "max-width: 1200px; width: 95%;" >
            <div class="journal-header" style="background: linear-gradient(135deg, rgba(241, 196, 15, 0.2), rgba(211, 84, 0, 0.2));">
                <h3><i class="fas fa-file-invoice-dollar"></i> PU-74: Ish Bajarilganlik Dalolatnomasi</h3>
                <button class="close-btn" onclick="closePU74Modal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="journal-body">
                <!-- Ma'lumot qo'shish formasi -->
                <div class="pu74-form-section" style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 15px 0; color: #f1c40f;"><i class="fas fa-plus-circle"></i> Yangi Ish Qo'shish</h4>
                    <div class="pu74-form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px;">
                        <div class="form-group">
                            <label>Sana</label>
                            <input type="date" id="pu74-date" class="pu74-input">
                        </div>
                        <div class="form-group">
                            <label>Ish Turi</label>
                            <select id="pu74-work-type" class="pu74-input">
                                <option value="">-- Tanlang --</option>
                                <option value="Rels almashtirish">Rels almashtirish</option>
                                <option value="Shpal almashtirish">Shpal almashtirish</option>
                                <option value="Balast to'ldirish">Balast to'ldirish</option>
                                <option value="Yo'l tekislash">Yo'l tekislash</option>
                                <option value="Strelka ta'mirlash">Strelka ta'mirlash</option>
                                <option value="Boshqa">Boshqa</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>O'lchov Birligi</label>
                            <select id="pu74-unit" class="pu74-input">
                                <option value="metr">metr</option>
                                <option value="dona">dona</option>
                                <option value="m³">m³</option>
                                <option value="km">km</option>
                                <option value="soat">soat</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Hajmi</label>
                            <input type="number" id="pu74-quantity" class="pu74-input" placeholder="0" min="0">
                        </div>
                        <div class="form-group">
                            <label>Joyi (KM+PK)</label>
                            <input type="text" id="pu74-location" class="pu74-input" placeholder="Masalan: 45+200">
                        </div>
                        <div class="form-group">
                            <label>Mas'ul</label>
                            <input type="text" id="pu74-responsible" class="pu74-input" placeholder="Xodim ismi">
                        </div>
                    </div>
                    <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="action-btn" onclick="addPU74Entry()" style="background: linear-gradient(45deg, #2ecc71, #27ae60);">
                            <i class="fas fa-plus"></i> Qo'shish
                        </button>
                        <button class="action-btn" onclick="clearPU74Form()" style="background: linear-gradient(45deg, #95a5a6, #7f8c8d);">
                            <i class="fas fa-eraser"></i> Tozalash
                        </button>
                    </div>
                </div>
                
                <!-- Amallar paneli -->
                <div class="journal-controls" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
                    <button class="action-btn export" onclick="exportPU74ToExcel()">
                        <i class="fas fa-file-excel"></i> Excelga Yuklash
                    </button>
                    <button class="action-btn" onclick="importPU74FromExcel()" style="background: linear-gradient(45deg, #3498db, #2980b9);">
                        <i class="fas fa-file-import"></i> Exceldan Import
                    </button>
                    <div style="flex: 1;"></div>
                    <span id="pu74-total-info" style="align-self: center; color: #f1c40f; font-weight: bold;"></span>
                </div>
                
                <!-- Jadval -->
                <div class="journal-table-container" style="max-height: 400px; overflow-y: auto;">
                    <table class="journal-table" id="pu74-table">
                        <thead>
                            <tr>
                                <th style="width: 30px;">#</th>
                                <th>Sana</th>
                                <th>Ish Turi</th>
                                <th>O'lchov</th>
                                <th>Hajmi</th>
                                <th>Joyi</th>
                                <th>Mas'ul</th>
                                <th style="width: 100px;">Amallar</th>
                            </tr>
                        </thead>
                        <tbody id="pu74-tbody">
                            <!-- JS renders rows here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    `;
}

function closePU74Modal() {
    const modal = document.getElementById('pu74-modal');
    if (modal) modal.classList.remove('active');
}

function getPU74StorageKey(brigadaNum, bolinmaId) {
    return `pu74_data_${bolinmaId}_brigada_${brigadaNum} `;
}

function getPU74Data(brigadaNum, bolinmaId) {
    const key = getPU74StorageKey(brigadaNum, bolinmaId);
    return JSON.parse(localStorage.getItem(key)) || [];
}

function savePU74Data(brigadaNum, bolinmaId, data) {
    const key = getPU74StorageKey(brigadaNum, bolinmaId);
    localStorage.setItem(key, JSON.stringify(data));
}

function renderPU74Table(brigadaNum, bolinmaId) {
    const tbody = document.getElementById('pu74-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const data = getPU74Data(brigadaNum, bolinmaId);

    if (data.length === 0) {
        tbody.innerHTML = `
    < tr >
    <td colspan="8" style="text-align: center; padding: 30px; color: rgba(255,255,255,0.5);">
        <i class="fas fa-inbox" style="font-size: 2rem; display: block; margin-bottom: 10px;"></i>
        Hozircha yozuvlar yo'q. Yuqoridagi formadan yangi ish qo'shing.
    </td>
            </tr >
    `;
        updatePU74TotalInfo(data);
        return;
    }

    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
    < td style = "text-align: center; color: #888;" > ${index + 1}</td >
            <td>${item.date || '-'}</td>
            <td>${item.workType || '-'}</td>
            <td>${item.unit || '-'}</td>
            <td style="font-weight: bold; color: #f1c40f;">${item.quantity || 0}</td>
            <td>${item.location || '-'}</td>
            <td>${item.responsible || '-'}</td>
            <td>
                <div style="display: flex; gap: 5px; justify-content: center;">
                    <button class="icon-btn edit" onclick="editPU74Entry(${index})" title="Tahrirlash" style="background: rgba(52, 152, 219, 0.3);">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn delete" onclick="deletePU74Entry(${index})" title="O'chirish">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
`;
        tbody.appendChild(row);
    });

    updatePU74TotalInfo(data);
}

function updatePU74TotalInfo(data) {
    const info = document.getElementById('pu74-total-info');
    if (!info) return;

    const totalQuantity = data.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
    info.innerHTML = `< i class="fas fa-chart-bar" ></i > Jami: ${data.length} ta yozuv | Umumiy hajm: ${totalQuantity.toFixed(2)} `;
}

function addPU74Entry() {
    const modal = document.getElementById('pu74-modal');
    const brigadaNum = modal.getAttribute('data-brigada');
    const bolinmaId = modal.getAttribute('data-bolinma');

    const dateInput = document.getElementById('pu74-date');
    const workTypeInput = document.getElementById('pu74-work-type');
    const unitInput = document.getElementById('pu74-unit');
    const quantityInput = document.getElementById('pu74-quantity');
    const locationInput = document.getElementById('pu74-location');
    const responsibleInput = document.getElementById('pu74-responsible');

    // Validation
    if (!dateInput.value) {
        alert("Iltimos, sanani kiriting!");
        dateInput.focus();
        return;
    }
    if (!workTypeInput.value) {
        alert("Iltimos, ish turini tanlang!");
        workTypeInput.focus();
        return;
    }
    if (!quantityInput.value || parseFloat(quantityInput.value) <= 0) {
        alert("Iltimos, hajmni kiriting!");
        quantityInput.focus();
        return;
    }

    const newEntry = {
        id: Date.now().toString(),
        date: dateInput.value,
        workType: workTypeInput.value,
        unit: unitInput.value,
        quantity: parseFloat(quantityInput.value),
        location: locationInput.value,
        responsible: responsibleInput.value,
        createdAt: new Date().toISOString()
    };

    const data = getPU74Data(brigadaNum, bolinmaId);
    data.push(newEntry);
    savePU74Data(brigadaNum, bolinmaId, data);

    // Clear form and refresh table
    clearPU74Form();
    renderPU74Table(brigadaNum, bolinmaId);

    // Visual feedback
    showPU74Notification("Yangi ish muvaffaqiyatli qo'shildi!", "success");
}

function clearPU74Form() {
    document.getElementById('pu74-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('pu74-work-type').value = '';
    document.getElementById('pu74-unit').value = 'metr';
    document.getElementById('pu74-quantity').value = '';
    document.getElementById('pu74-location').value = '';
    document.getElementById('pu74-responsible').value = '';
}

function editPU74Entry(index) {
    const modal = document.getElementById('pu74-modal');
    const brigadaNum = modal.getAttribute('data-brigada');
    const bolinmaId = modal.getAttribute('data-bolinma');

    const data = getPU74Data(brigadaNum, bolinmaId);
    const item = data[index];
    if (!item) return;

    // Fill form with existing data
    document.getElementById('pu74-date').value = item.date || '';
    document.getElementById('pu74-work-type').value = item.workType || '';
    document.getElementById('pu74-unit').value = item.unit || 'metr';
    document.getElementById('pu74-quantity').value = item.quantity || '';
    document.getElementById('pu74-location').value = item.location || '';
    document.getElementById('pu74-responsible').value = item.responsible || '';

    // Remove old entry
    data.splice(index, 1);
    savePU74Data(brigadaNum, bolinmaId, data);
    renderPU74Table(brigadaNum, bolinmaId);

    // Scroll to form
    document.querySelector('.pu74-form-section').scrollIntoView({ behavior: 'smooth' });

    showPU74Notification("Ma'lumot formaga yuklandi. Tahrirlang va qayta qo'shing.", "info");
}

function deletePU74Entry(index) {
    if (!confirm("Bu yozuvni o'chirishni xohlaysizmi?")) return;

    const modal = document.getElementById('pu74-modal');
    const brigadaNum = modal.getAttribute('data-brigada');
    const bolinmaId = modal.getAttribute('data-bolinma');

    const data = getPU74Data(brigadaNum, bolinmaId);
    data.splice(index, 1);
    savePU74Data(brigadaNum, bolinmaId, data);
    renderPU74Table(brigadaNum, bolinmaId);

    showPU74Notification("Yozuv o'chirildi!", "warning");
}

function exportPU74ToExcel() {
    const modal = document.getElementById('pu74-modal');
    const brigadaNum = modal.getAttribute('data-brigada');
    const bolinmaId = modal.getAttribute('data-bolinma');

    const data = getPU74Data(brigadaNum, bolinmaId);

    if (data.length === 0) {
        alert("Eksport qilish uchun ma'lumotlar yo'q!");
        return;
    }

    try {
        // Prepare data for Excel
        const headers = ['#', 'Sana', 'Ish Turi', "O'lchov Birligi", 'Hajmi', 'Joyi (KM+PK)', "Mas'ul"];
        const rows = data.map((item, index) => [
            index + 1,
            item.date || '',
            item.workType || '',
            item.unit || '',
            item.quantity || 0,
            item.location || '',
            item.responsible || ''
        ]);

        const worksheetData = [headers, ...rows];

        // Create workbook
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Set column widths
        worksheet['!cols'] = [
            { wch: 5 },  // #
            { wch: 12 }, // Sana
            { wch: 25 }, // Ish Turi
            { wch: 12 }, // O'lchov
            { wch: 10 }, // Hajmi
            { wch: 15 }, // Joyi
            { wch: 20 }  // Mas'ul
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, 'PU-74');

        // Generate filename
        const bolinmaNum = bolinmaId.replace('bolinma', '');
        const today = new Date().toISOString().split('T')[0];
        const filename = `PU -74_${bolinmaNum} -bolinma_${brigadaNum} -brigada_${today}.xlsx`;

        // Download
        XLSX.writeFile(workbook, filename);

        showPU74Notification(`"${filename}" muvaffaqiyatli yuklandi!`, "success");

    } catch (e) {
        console.error("Excel export error:", e);
        alert("Excel faylni yaratishda xatolik: " + e.message);
    }
}

function importPU74FromExcel() {
    const modal = document.getElementById('pu74-modal');
    const brigadaNum = modal.getAttribute('data-brigada');
    const bolinmaId = modal.getAttribute('data-bolinma');

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.onchange = function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Read first sheet
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                if (jsonData.length < 2) {
                    alert("Excel faylda ma'lumotlar topilmadi!");
                    return;
                }

                // Skip header row, parse data
                const existingData = getPU74Data(brigadaNum, bolinmaId);
                let importedCount = 0;

                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (!row || row.length < 3) continue;

                    // Try to map columns intelligently
                    const entry = {
                        id: Date.now().toString() + i,
                        date: parseExcelDate(row[1]) || row[0] || '',
                        workType: row[2] || row[1] || '',
                        unit: row[3] || 'metr',
                        quantity: parseFloat(row[4]) || parseFloat(row[3]) || 0,
                        location: row[5] || row[4] || '',
                        responsible: row[6] || row[5] || '',
                        createdAt: new Date().toISOString(),
                        imported: true
                    };

                    if (entry.workType || entry.quantity > 0) {
                        existingData.push(entry);
                        importedCount++;
                    }
                }

                if (importedCount > 0) {
                    savePU74Data(brigadaNum, bolinmaId, existingData);
                    renderPU74Table(brigadaNum, bolinmaId);
                    showPU74Notification(`${importedCount} ta yozuv muvaffaqiyatli import qilindi!`, "success");
                } else {
                    alert("Excel fayldan hech qanday mos ma'lumot topilmadi.");
                }

            } catch (err) {
                console.error("Import error:", err);
                alert("Excel faylni o'qishda xatolik: " + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
        document.body.removeChild(input);
    };

    input.click();
}

function parseExcelDate(value) {
    if (!value) return '';

    // If it's already a date string
    if (typeof value === 'string' && value.includes('-')) {
        return value;
    }

    // If it's an Excel serial number
    if (typeof value === 'number') {
        const date = new Date((value - 25569) * 86400 * 1000);
        return date.toISOString().split('T')[0];
    }

    return String(value);
}

function showPU74Notification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'pu74-notification';
    notification.style.cssText = `
position: fixed;
top: 20px;
right: 20px;
padding: 15px 25px;
border - radius: 10px;
color: white;
font - weight: bold;
z - index: 10001;
animation: slideIn 0.3s ease;
box - shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
`;

    const colors = {
        success: 'linear-gradient(45deg, #2ecc71, #27ae60)',
        warning: 'linear-gradient(45deg, #e67e22, #d35400)',
        error: 'linear-gradient(45deg, #e74c3c, #c0392b)',
        info: 'linear-gradient(45deg, #3498db, #2980b9)'
    };

    notification.style.background = colors[type] || colors.info;
    notification.innerHTML = `< i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'}" ></i > ${message} `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Legacy function - redirect to new system
function createDefaultPU74New(filename, headers, bolinmaId) {
    // Extract brigada number from filename
    const match = filename.match(/Brigada_(\d+)/);
    const brigadaNum = match ? match[1] : '1';
    openPU74New(brigadaNum, bolinmaId);
}


// --- EMPLOYEE MANAGEMENT FUNCTIONS ---

function renderEmployeeManagement(window, bolinmaId) {
    const contentDiv = window.querySelector('.window-content');
    if (!contentDiv) return;

    // 1. Find or create container
    let empView = contentDiv.querySelector('#employee-management-view');
    if (!empView) {
        empView = document.createElement('div');
        empView.id = 'employee-management-view';
        empView.style.display = 'none'; // Hidden by default

        // Insert after the file controls (.file-management)
        // The template structure: .window-content > .file-management(controls) > h3 > .files-table
        const fileControls = contentDiv.querySelector('.file-management');
        if (fileControls && fileControls.nextElementSibling) {
            contentDiv.insertBefore(empView, fileControls.nextElementSibling);
        } else {
            contentDiv.appendChild(empView);
        }

        // Add Toggle Button to File Controls
        if (fileControls) {
            if (!fileControls.querySelector('.toggle-employees-btn')) {
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'control-btn toggle-employees-btn';
                toggleBtn.style.background = 'linear-gradient(45deg, #2ecc71, #27ae60)';
                toggleBtn.innerHTML = '<i class="fas fa-users"></i> Xodimlar Jadvali';
                toggleBtn.onclick = () => {
                    const view = window.querySelector('#employee-management-view');
                    if (view.style.display === 'none') {
                        view.style.display = 'block';
                        toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Yopish';
                    } else {
                        view.style.display = 'none';
                        toggleBtn.innerHTML = '<i class="fas fa-users"></i> Xodimlar Jadvali';
                    }
                };
                fileControls.appendChild(toggleBtn);
            }
        }
    }

    // 2. Filter workers
    // Assuming bolinmaId is like 'bolinma1' and workersData has 'bolinma' property like "1-bo'linma"
    const bolinmaNumber = bolinmaId.replace('bolinma', ''); // "1"
    const bolinmaName = `${bolinmaNumber} -bo'linma`; // "1-bo'linma"

    const workers = workersData.filter(w => w.bolinma === bolinmaName);

    // 3. Get Employee Stats (Attendance & Medical) from LocalStorage
    const statsKey = `employee_stats_${bolinmaId}`;
    let stats = JSON.parse(localStorage.getItem(statsKey)) || {};

    // 4. Build HTML
    let html = `
                                    <div class="employee-management" style="margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; margin-bottom: 20px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                            <h3 class="section-title" style="margin: 0;"><i class="fas fa-users-cog"></i> Xodimlar Jadvali (Elektron Tabel)</h3>
                                            <div style="color: rgba(255,255,255,0.6); font-size: 0.8rem;">
                                                <i class="fas fa-info-circle"></i> Tahrirlash: "Xodimlar bo'limi"
                                            </div>
                                        </div>
                                        
                                        <div style="overflow-x: auto; max-height: 400px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
                                            <table class="employee-table" style="margin-top: 0;">
                                                <thead style="position: sticky; top: 0; background: #2c3e50; z-index: 10;">
                                                    <tr>
                                                        <th>F.I.SH</th>
                                                        <th>Lavozim</th>
                                                        <th>Davomat / Smena</th>
                                                        <th>Tibbiy Ko'rik</th>
                                                        <th>Amallar</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                `;

    if (workers.length === 0) {
        html += `<tr><td colspan="5" style="text-align: center; padding: 20px; color: rgba(255,255,255,0.5);">Xodimlar topilmadi</td></tr>`;
    } else {
        workers.forEach(worker => {
            const wStats = stats[worker.id] || {
                attendance: { status: 'rest', checkIn: null },
                medical: { lastCheck: '2023-01-01', nextCheck: '2024-01-01' }
            };

            // Status Badge Logic
            let statusBadge = '';
            if (wStats.attendance.status === 'shift') {
                statusBadge = `<span class="status-badge status-shift"><i class="fas fa-clock"></i> Smenada (${wStats.attendance.checkIn || '08:00'})</span>`;
            } else if (wStats.attendance.status === 'vacation') {
                statusBadge = `<span class="status-badge status-vacation"><i class="fas fa-plane"></i> Ta'tilda</span>`;
            } else {
                statusBadge = `<span class="status-badge status-rest"><i class="fas fa-home"></i> Dam olish</span>`;
            }

            // Medical Badge Logic
            const nextCheckDate = new Date(wStats.medical.nextCheck);
            const today = new Date();
            const warningDate = new Date();
            warningDate.setMonth(today.getMonth() + 1);

            let medicalClass = 'valid';
            let medicalIcon = 'check-circle';
            let medicalText = `Navbatdagi: ${wStats.medical.nextCheck}`;

            if (nextCheckDate < today) {
                medicalClass = 'expired';
                medicalIcon = 'exclamation-circle';
                medicalText = 'MUDDATI O\'TGAN!';
            } else if (nextCheckDate < warningDate) {
                medicalClass = 'warning';
                medicalIcon = 'exclamation-triangle';
                medicalText = `Oz qoldi: ${wStats.medical.nextCheck}`;
            }

            const medicalBadge = `
                                            <span class="medical-badge ${medicalClass}">
                                                <i class="fas fa-${medicalIcon}"></i> ${medicalText}
                                            </span>
                                        `;

            // Edit Button Permission Check
            const canEdit = currentUser.role === 'admin' ||
                currentUser.role === 'xodimlar' ||
                (currentUser.role === 'department' && currentUser.departments.includes('xodimlar')) ||
                (currentUser.role === 'bolinma' && currentUser.departments.includes('xodimlar'));

            const editBtn = canEdit ? `
                                            <button class="action-btn edit" onclick="editEmployeeStats('${bolinmaId}', ${worker.id})">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                        ` : `<span style="opacity: 0.3; font-size: 0.8rem;">---</span>`;

            html += `
                                            <tr>
                                                <td><strong>${worker.name}</strong></td>
                                                <td style="font-size: 0.9rem; opacity: 0.8;">${worker.role}</td>
                                                <td>${statusBadge}</td>
                                                <td>${medicalBadge}</td>
                                                <td>${editBtn}</td>
                                            </tr>
                                        `;
        });
    }

    html += `
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                `;

    empView.innerHTML = html;
}

function editEmployeeStats(bolinmaId, workerId) {
    // 1. Get Data
    const statsKey = `employee_stats_${bolinmaId}`;
    const stats = JSON.parse(localStorage.getItem(statsKey)) || {};
    const wStats = stats[workerId] || {
        attendance: { status: 'rest', checkIn: '' },
        medical: { lastCheck: '', nextCheck: '' }
    };

    // Find worker name for display
    const bolinmaNumber = bolinmaId.replace('bolinma', '');
    const bolinmaName = `${bolinmaNumber}-bo'linma`;
    const worker = workersData.find(w => w.id === workerId); // Global search is safer if ID is unique, otherwise filter by bolinma
    const workerName = worker ? worker.name : "Xodim";

    // 2. Create Modal
    const modalId = 'employee-stats-modal';
    let modal = document.getElementById(modalId);
    if (modal) modal.remove(); // Clean up old instances

    modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'integration-window active'; // Use existing class for styling
    modal.style.zIndex = "10001";
    modal.style.display = "flex"; // Override

    modal.innerHTML = `
                                    <div class="window-header">
                                        <h2><i class="fas fa-user-edit"></i> ${workerName}: Ma'lumotlarni Tahrirlash</h2>
                                        <button class="close-window" onclick="document.getElementById('${modalId}').remove()">&times;</button>
                                    </div>
                                    <div class="integration-content" style="padding: 20px;">
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                            <!-- Attendance Section -->
                                            <div class="content-card">
                                                <h3 style="color: #3498db; margin-bottom: 15px;"><i class="fas fa-clock"></i> Davomat / Smena</h3>
                                                
                                                <div class="form-group" style="margin-bottom: 15px;">
                                                    <label style="display: block; margin-bottom: 5px;">Holat:</label>
                                                    <select id="emp-status" style="width: 100%; padding: 8px; border-radius: 5px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white;">
                                                        <option value="rest" ${wStats.attendance.status === 'rest' ? 'selected' : ''}>Dam olish (Uyda)</option>
                                                        <option value="shift" ${wStats.attendance.status === 'shift' ? 'selected' : ''}>Ishda (Smenada)</option>
                                                        <option value="vacation" ${wStats.attendance.status === 'vacation' ? 'selected' : ''}>Ta'tilda</option>
                                                    </select>
                                                </div>

                                                <div class="form-group" style="margin-bottom: 15px;">
                                                    <label style="display: block; margin-bottom: 5px;">Kelgan vaqti (agar ishda bo'lsa):</label>
                                                    <input type="time" id="emp-checkin" value="${wStats.attendance.checkIn || ''}" style="width: 100%; padding: 8px; border-radius: 5px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white;">
                                                </div>
                                            </div>

                                            <!-- Medical Section -->
                                            <div class="content-card">
                                                <h3 style="color: #2ecc71; margin-bottom: 15px;"><i class="fas fa-heartbeat"></i> Tibbiy Ko'rik</h3>
                                                
                                                <div class="form-group" style="margin-bottom: 15px;">
                                                    <label style="display: block; margin-bottom: 5px;">Oxirgi ko'rik sanasi:</label>
                                                    <input type="date" id="emp-lastcheck" value="${wStats.medical.lastCheck || ''}" style="width: 100%; padding: 8px; border-radius: 5px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white;">
                                                </div>

                                                <div class="form-group" style="margin-bottom: 15px;">
                                                    <label style="display: block; margin-bottom: 5px;">Keyingi ko'rik sanasi:</label>
                                                    <input type="date" id="emp-nextcheck" value="${wStats.medical.nextCheck || ''}" style="width: 100%; padding: 8px; border-radius: 5px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white;">
                                                </div>
                                            </div>
                                        </div>

                                        <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
                                            <button class="control-btn" onclick="document.getElementById('${modalId}').remove()">Bekor qilish</button>
                                            <button class="control-btn green" onclick="saveEmployeeStats('${bolinmaId}', ${workerId})"><i class="fas fa-save"></i> Saqlash</button>
                                        </div>
                                    </div>
                                `;

    document.body.appendChild(modal);
    document.getElementById('department-overlay').classList.add('active'); // Ensure overlay is on
}

function saveEmployeeStats(bolinmaId, workerId) {
    const status = document.getElementById('emp-status').value;
    const checkIn = document.getElementById('emp-checkin').value;
    const lastCheck = document.getElementById('emp-lastcheck').value;
    const nextCheck = document.getElementById('emp-nextcheck').value;

    const statsKey = `employee_stats_${bolinmaId}`;
    let stats = JSON.parse(localStorage.getItem(statsKey)) || {};

    stats[workerId] = {
        attendance: { status, checkIn },
        medical: { lastCheck, nextCheck }
    };

    localStorage.setItem(statsKey, JSON.stringify(stats));

    alert("Ma'lumotlar saqlandi!");
    document.getElementById('employee-stats-modal').remove();

    // Refresh view
    // We need to find the window and call renderEmployeeManagement again
    const compositeId = `${bolinmaId}-xodimlar`; // Assuming section ID is 'xodimlar' but loop is cleaner
    // Since we are inside the window, we can just re-render.
    // Or find the active window for this bolinma.
    const activeWindow = document.querySelector('.department-window.active');
    if (activeWindow) {
        // Verify it's the right one? 
        // Ideally we pass window ref, but simple refresh works:
        renderEmployeeManagement(activeWindow, bolinmaId);
    }
}

function openDepartmentWindow(departmentId) {
    const department = functionalDepartments.find(d => d.id === departmentId);
    if (!department) return;

    // Mavjud oynani tekshirish
    let window = document.getElementById(`${departmentId}-window`);

    if (!window) {
        // Yangi oyna yaratish
        const template = document.getElementById('departmentWindowTemplate');
        const clone = template.content.cloneNode(true);
        window = clone.querySelector('.department-window');
        window.id = `${departmentId}-window`;

        // Oynani sozlash
        window.querySelector('.department-name').textContent = department.name;

        // Integratsiya tugmasini sozlash
        const integrateBtn = window.querySelector('.integrate-btn');
        if (department.integrations && department.integrations.length > 0) {
            integrateBtn.style.display = 'flex';
            integrateBtn.addEventListener('click', () => {
                openIntegrationWindow(department.integrations[0], departmentId);
            });
        } else {
            integrateBtn.style.display = 'none';
        }

        document.body.appendChild(window);

        // Yangi oyna uchun event listener'lar
        setupDepartmentWindowEvents(window, departmentId);
    }

    // Fayl yuklash tugmasini boshqarish
    // Bo'linmalar va Admin yuklashi mumkin, Bo'limlar faqat ko'radi
    const uploadBtn = window.querySelector('.upload-file-btn');
    if (uploadBtn) {
        if (currentUser.role === 'bolinma' || currentUser.role === 'admin') {
            uploadBtn.style.display = 'inline-flex';
        } else {
            // Bo'limlar (department) fayl yuklamaydi — faqat tekshiradi
            uploadBtn.style.display = 'none';
        }
    }

    // Papka yaratish va muddat belgilash tugmalarini boshqarish
    const createFolderBtn = window.querySelector('.create-folder-btn');
    const setDeadlineBtn = window.querySelector('.set-deadline-btn');
    if (currentUser.role === 'department') {
        // Bo'limlar papka yaratishi va muddat belgilashi mumkin
        if (createFolderBtn) createFolderBtn.style.display = 'inline-flex';
        if (setDeadlineBtn) setDeadlineBtn.style.display = 'inline-flex';
    }

    // PU-74 Button Logic
    let pu74Btn = window.querySelector('.pu74-btn');

    // Auto-inject button if missing (Hotfix for no-refresh update)
    if (!pu74Btn) {
        const controls = window.querySelector('.file-controls');
        if (controls) {
            pu74Btn = document.createElement('button');
            pu74Btn.className = 'control-btn pu74-btn';
            pu74Btn.style.background = 'linear-gradient(135deg, #00c6ff, #0072ff)';
            pu74Btn.style.marginLeft = '5px';
            pu74Btn.style.display = 'none';
            pu74Btn.innerHTML = '<i class="fas fa-clipboard-list"></i> PU-74';
            controls.appendChild(pu74Btn);
        }
    }

    if (pu74Btn) {
        // Allow for Subdivisions, Admin, and Economy (Iqtisod) Department
        if (currentUser.role === 'bolinma' || currentUser.role === 'admin' || departmentId === 'iqtisod' || (currentUser.role === 'department' && currentUser.departments.includes('iqtisod'))) {
            pu74Btn.style.display = 'inline-flex';
            pu74Btn.onclick = () => {
                openPU74Window(departmentId);
            };
        } else {
            pu74Btn.style.display = 'none';
        }
    }

    // Mexanika Department Buttons Injection
    if (departmentId === 'mexanika' || (department && department.departments && department.departments.includes('mexanika'))) {
        // Use self.injectMexanikaButtons because 'window' variable is shadowed by local DOM element
        if (self.injectMexanikaButtons) {
            self.injectMexanikaButtons(window, departmentId);
        } else {
            console.warn("injectMexanikaButtons function not found. Ensure mexanika.js is loaded.");
        }
    }

    const controls = window.querySelector('.file-controls');

    // --- KIRIM (INCOMING) BUTTON ---
    // Bo'linmalar va Bugalteriya uchun
    if (controls && (departmentId.startsWith('bolinma') || departmentId === 'bugalteriya' || departmentId === 'iqtisod')) {
        let incomingBtn = window.querySelector('.incoming-btn');
        if (!incomingBtn) {
            incomingBtn = document.createElement('button');
            incomingBtn.className = 'control-btn incoming-btn';
            incomingBtn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            incomingBtn.style.marginLeft = '5px';
            incomingBtn.innerHTML = '<i class="fas fa-truck-loading"></i> Kirim';
            incomingBtn.title = "Material Kirim Qilish (FMU-25)";
            incomingBtn.onclick = () => {
                if (window.openIncomingWindow) window.openIncomingWindow(departmentId);
                else alert("Kirim moduli yuklanmagan!");
            };
            controls.appendChild(incomingBtn);
        }
    }

    // --- TABEL (TIMESHEET) BUTTON ---
    // Bo'linmalar va Xodimlar bo'limi uchun
    if (controls && (departmentId.startsWith('bolinma') || departmentId === 'xodimlar')) {
        let timesheetBtn = window.querySelector('.timesheet-btn');
        if (!timesheetBtn) {
            timesheetBtn = document.createElement('button');
            timesheetBtn.className = 'control-btn timesheet-btn';
            timesheetBtn.style.background = 'linear-gradient(135deg, #8e44ad, #9b59b6)';
            timesheetBtn.style.marginLeft = '5px';
            timesheetBtn.innerHTML = '<i class="fas fa-calendar-alt"></i> Tabel';
            timesheetBtn.title = "Elektron Tabel (T-13)";
            timesheetBtn.onclick = () => {
                if (window.openTimesheet) window.openTimesheet(departmentId);
                else alert("Tabel moduli yuklanmagan!");
            };
            controls.appendChild(timesheetBtn);
        }
    }

    // --- TEXNIK O'QISH (TECHNICAL TRAINING) ---
    // Barcha bo'linmalar, Xodimlar va Mexanika uchun
    if (controls && (departmentId.startsWith('bolinma') || departmentId === 'xodimlar' || departmentId === 'mexanika')) {
        let trainingBtn = controls.querySelector('.training-btn');
        if (!trainingBtn) {
            trainingBtn = document.createElement('button');
            trainingBtn.className = 'control-btn training-btn';
            trainingBtn.style.background = 'linear-gradient(135deg, #e67e22, #d35400)';
            trainingBtn.style.marginLeft = '5px';
            trainingBtn.innerHTML = '<i class="fas fa-chalkboard-teacher"></i> O\'qish';
            trainingBtn.title = "Texnik O'quv Mashg'ulotlari";
            trainingBtn.onclick = () => {
                if (window.openTechTrainingWindow) window.openTechTrainingWindow(departmentId);
                else alert("Texnik o'qish moduli yuklanmagan!");
            };
            controls.appendChild(trainingBtn);
        }
    }

    // --- M-29 DALOLATNOMA ---
    // Faqat Bo'linmalar uchun
    if (controls && departmentId.startsWith('bolinma')) {
        let m29Btn = controls.querySelector('.m29-btn');
        if (!m29Btn) {
            m29Btn = document.createElement('button');
            m29Btn.className = 'control-btn m29-btn';
            m29Btn.style.background = 'linear-gradient(135deg, #7f8c8d, #2c3e50)';
            m29Btn.style.marginLeft = '5px';
            m29Btn.innerHTML = '<i class="fas fa-file-signature"></i> M-29';
            m29Btn.title = "M-29 Dalolatnoma";
            m29Btn.onclick = () => {
                if (window.openMaterialsWindow) window.openMaterialsWindow(departmentId);
                else alert("M-29 moduli yuklanmagan!");
            };
            controls.appendChild(m29Btn);
        }
    }

    // Marketplace Button Logic (Bugalteriya)
    if (departmentId.includes('bugalteriya') || (department && department.departments && department.departments.includes('bugalteriya'))) {
        // Try to find the button first
        let mpBtn = window.querySelector('.marketplace-btn');

        // Strategy 1: Add to file-controls (top row)
        const controls = window.querySelector('.file-controls');
        // Strategy 2: Add below inputs (folder-selector) - This matches the user's "Bugalteriya Jurnallari" placement description
        const folderSelector = window.querySelector('.folder-selector');

        if (!mpBtn) {
            mpBtn = document.createElement('button');
            mpBtn.className = 'control-btn marketplace-btn';
            mpBtn.style.background = 'linear-gradient(135deg, #16a085, #1abc9c)';
            mpBtn.style.color = 'white';
            mpBtn.style.marginLeft = '5px';
            mpBtn.style.marginTop = '10px'; // Add spacing if it wraps or is on new line
            mpBtn.innerHTML = '<i class="fas fa-handshake"></i> Birja';
            mpBtn.onclick = () => {
                if (window.openMarketplaceWindow) window.openMarketplaceWindow(departmentId);
                else alert("Birja moduli yuklanmagan!");
            };

            // Prefer placing it in folder-selector to match "below inputs" description if possible, 
            // or file-management wrapper to be distinct.
            if (folderSelector) {
                // Check if we want it inline with inputs or below.
                // If the user wants it "here too" pointing to the "Bugalteriya Jurnallari" button which is likely below inputs.
                folderSelector.appendChild(mpBtn);
            } else if (controls) {
                controls.appendChild(mpBtn);
            }
        } else {
            mpBtn.style.display = 'inline-flex';
            mpBtn.onclick = () => {
                if (window.openMarketplaceWindow) window.openMarketplaceWindow(departmentId);
                else alert("Birja moduli yuklanmagan!");
            };
        }
    }

    // Fayllar ro'yxatini yangilash
    updateFilesTable(window, departmentId);

    // Mexanika Department - Inject Special Buttons
    // Check if ID is 'mexanika' OR if it has 'mexanika-monitor' integration (for Subdivisions)
    const isMexanika = departmentId === 'mexanika' || (department && department.integrations && department.integrations.includes('mexanika-monitor'));

    if (isMexanika) {
        if (typeof renderMechanicsSection === 'function') {
            // Dashboardni chizish
            renderMechanicsSection(window, departmentId);
        }
        if (typeof injectMexanikaButtons === 'function') {
            injectMexanikaButtons(window);
        }
    }

    // Oynani ko'rsatish
    window.classList.add('active');
    document.getElementById('department-overlay').classList.add('active');

    // Dispatcher Dashboard (Receiving side ONLY)
    if (departmentId === 'dispetcher') {
        const body = window.querySelector('.department-body') || window.querySelector('.window-content');
        if (body) {
            // Hide file management purely for dispatcher dashboard
            const fileManagement = body.querySelector('.file-management');
            if (fileManagement) fileManagement.style.display = 'none';

            const folderManagement = body.querySelector('.folder-management');
            if (folderManagement) folderManagement.style.display = 'none';

            // Set content to ONLY the dashboard
            let dashboard = body.querySelector('.dispatcher-dashboard-container');
            if (!dashboard) {
                dashboard = document.createElement('div');
                dashboard.className = 'dispatcher-dashboard-container';
                body.insertBefore(dashboard, body.firstChild);
            }
            dashboard.innerHTML = getDispatcherDashboardHTML();
        }
    } else if (departmentId === 'metrologiya') {
        // Metrology Dashboard
        const body = window.querySelector('.department-body') || window.querySelector('.window-content');
        if (body) {
            // Hide file management
            const fileManagement = body.querySelector('.file-management');
            if (fileManagement) fileManagement.style.display = 'none';

            const folderManagement = body.querySelector('.folder-management');
            if (folderManagement) folderManagement.style.display = 'none';

            // Set content to metrology dashboard
            let dashboard = body.querySelector('.metrology-dashboard-container');
            if (!dashboard) {
                dashboard = document.createElement('div');
                dashboard.className = 'metrology-dashboard-container';
                body.insertBefore(dashboard, body.firstChild);
            }
            dashboard.innerHTML = getMetrologyDashboardHTML();
        }
    } else if (departmentId === 'mehnat-muhofazasi' || departmentId === 'mehnat') {
        // SAFETY / MEHNAT MUHOFAZASI DASHBOARD
        // This ensures the custom buttons (TNU-19, TNU-20, Worker List) appear
        if (typeof renderSafetyDashboard === 'function') {
            // Determine context: Admin sees all, Bolinma sees their own
            let contextBolinma = 'all';
            if (currentUser && currentUser.role === 'bolinma' && currentUser.bolinmalar && currentUser.bolinmalar.length > 0) {
                contextBolinma = currentUser.bolinmalar[0];
            }

            // Render the dashboard which replaces window content
            renderSafetyDashboard(window, contextBolinma);
        }
    } else {
        // STANDARD SUBDIVISION VIEW - Add Road Management Sidebar
        const body = window.querySelector('.window-content');
        if (body) {
            // Check if already restructured to avoid duplicates
            if (!body.querySelector('.files-area-wrapper')) {
                // 1. Restructure standard content into a wrapper
                const wrapper = document.createElement('div');
                wrapper.className = 'files-area-wrapper';

                // Move all existing children to wrapper
                while (body.firstChild) {
                    wrapper.appendChild(body.firstChild);
                }

                body.appendChild(wrapper);

                // 2. Create Sidebar
                const sidebar = document.createElement('div');
                sidebar.className = 'road-management-sidebar';
                sidebar.innerHTML = getRoadSidebarHTML(departmentId);
                body.appendChild(sidebar);
            } else {
                // Update sidebar content if it exists
                const sidebar = body.querySelector('.road-management-sidebar');
                if (sidebar) sidebar.innerHTML = getRoadSidebarHTML(departmentId);
            }
        }
    }
}

function setupDepartmentWindowEvents(window, departmentId) {
    // Fayl yuklash
    window.querySelector('.upload-file-btn').addEventListener('click', () => {
        window.querySelector('.file-input').click();
    });

    // Papka yaratish
    window.querySelector('.create-folder-btn').addEventListener('click', () => {
        const folderName = window.querySelector('.new-folder-name').value;
        if (folderName) {
            // Papkani ma'lumotlar bazasiga qo'shish
            const newFolder = {
                id: Date.now().toString(),
                name: folderName,
                department: departmentId,
                createdBy: currentUser.username,
                createdAt: new Date().toISOString()
            };

            // Papkani selectga qo'shish
            const select = window.querySelector('.folder-select');
            const newOption = document.createElement('option');
            newOption.value = folderName.toLowerCase().replace(/\s+/g, '-');
            newOption.textContent = folderName;
            select.appendChild(newOption);

            alert(`"${folderName}" papkasi yaratildi!`);
            window.querySelector('.new-folder-name').value = '';
        } else {
            alert('Iltimos, papka nomini kiriting!');
        }
    });

    // Muddat belgilash
    window.querySelector('.set-deadline-btn').addEventListener('click', () => {
        const deadline = window.querySelector('.deadline-date').value;
        if (deadline) {
            // Muddatni saqlash
            const deadlineData = {
                department: departmentId,
                deadline: deadline,
                setBy: currentUser.username,
                setAt: new Date().toISOString()
            };

            alert(`Hisobot topshirish muddati: ${deadline} belgilandi!`);

            // Eslatma yuborish (simulyatsiya)
            setTimeout(() => {
                alert(`ESLATMA: ${departmentId} bo'limi uchun hisobot topshirish muddati yaqinlashmoqda!`);
            }, 2000);
        } else {
            alert('Iltimos, muddatni tanlang!');
        }
    });

    // Fayl yuklashni boshqarish
    window.querySelector('.file-input').addEventListener('change', function (e) {
        const files = e.target.files;
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                uploadFile(file, departmentId, window);
            }

            // Fayl ro'yxatini yangilash
            updateFilesTable(window, departmentId);

            // Fayl inputini tozalash
            this.value = '';
        }
    });

    // Papka tanlanganda uning tarkibini ko'rsatish
    window.querySelector('.folder-select').addEventListener('change', function () {
        const folderContents = window.querySelector('.folder-contents');
        if (this.value) {
            folderContents.classList.add('active');
            // Papka tarkibini yangilash
            updateFolderContents(window, departmentId, this.value);
        } else {
            folderContents.classList.remove('active');
        }
    });

    // Fayl amallari
    window.addEventListener('click', function (e) {
        // Faylni ko'rish
        if (e.target.closest('.action-btn.view')) {
            const btn = e.target.closest('.action-btn.view');
            const row = btn.closest('tr');
            const fileName = row.cells[0].textContent;
            const file = uploadedFiles.find(f => f.name === fileName && f.department === departmentId);
            if (file) {
                previewFile(file);
            }
        }

        // Faylni tahrirlash
        if (e.target.closest('.action-btn.edit')) {
            const btn = e.target.closest('.action-btn.edit');
            const row = btn.closest('tr');
            const fileName = row.cells[0].textContent;
            const file = uploadedFiles.find(f => f.name === fileName && f.department === departmentId);
            if (file) {
                editFile(file);
            }
        }

        // Faylni tasdiqlash/rad etish
        if (e.target.closest('.action-btn.check')) {
            const btn = e.target.closest('.action-btn.check');
            const row = btn.closest('tr');
            const statusCell = row.querySelector('.status-badge');

            if (btn.style.backgroundColor === 'rgb(46, 204, 113)') {
                // Tasdiqlash
                statusCell.textContent = 'Tasdiqlangan';
                statusCell.className = 'status-badge status-approved';
                btn.innerHTML = '<i class="fas fa-times"></i> Rad etish';
                btn.style.backgroundColor = '#e74c3c';
            } else {
                // Rad etish
                statusCell.textContent = 'Rad etilgan';
                statusCell.className = 'status-badge status-rejected';
                btn.innerHTML = '<i class="fas fa-check"></i> Tasdiqlash';
                btn.style.backgroundColor = '#2ecc71';
            }
        }

        // Faylni o'chirish
        if (e.target.closest('.action-btn.delete')) {
            if (confirm('Haqiqatan ham bu faylni o\'chirmoqchimisiz?')) {
                const row = e.target.closest('tr');
                const fileName = row.cells[0].textContent;

                // Faylni ma'lumotlar bazasidan o'chirish
                uploadedFiles = uploadedFiles.filter(f => !(f.name === fileName && f.department === departmentId));
                saveDatabase();

                // Jadvaldan o'chirish
                if (row) row.remove();
                alert('Fayl muvaffaqiyatli o\'chirildi!');
            }
        }
    }); // End of window.addEventListener
} // End of setupDepartmentWindowEvents

function uploadFile(file, departmentId, window) {
    const reader = new FileReader();
    const selectedFolder = window.querySelector('.folder-select').value || 'umumiy';

    reader.onload = function (e) {
        const fileData = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            path: file.path || null, // Capture Electron path
            content: e.target.result,
            department: departmentId,
            uploadDate: new Date().toISOString(),
            status: 'pending',
            uploader: currentUser.username,
            folder: selectedFolder
        };

        uploadedFiles.push(fileData);
        saveDatabase();
        alert(`"${file.name}" fayli muvaffaqiyatli yuklandi!`);
        updateFilesTable(window, departmentId);
    };

    const fileName = file.name.toLowerCase();
    if (file.type.includes('text') && !fileName.endsWith('.docx')) {
        reader.readAsText(file);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.docx') || fileName.endsWith('.pdf')) {
        reader.readAsArrayBuffer(file);
    } else {
        reader.readAsDataURL(file);
    }
}

// ...

function editFile(file) {
    currentEditingFile = file;
    const fileName = file.name.toLowerCase();

    // ELECTRON MODE: Open with default OS app (WPS / Office)
    if (window.electron && file.path) {
        window.electron.openExternal(file.path)
            .then(result => {
                if (result.success) {
                    console.log("Fayl tashqi dasturda ochildi:", file.path);
                } else {
                    alert("Faylni ochishda xatolik: " + result.error);
                }
            });
        return;
    }

    // BROWSER MODE: Fallback to local editors
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        editExcelFile(file);
    } else if (file.type.includes('text') || fileName.endsWith('.txt') || fileName.endsWith('.docx')) {
        editTextFile(file);
    } else {
        alert('Ushbu turdagi faylni tahrirlab bo\'lmaydi');
    }
}

// Helper functions for file actions (ID based)
function downloadFileById(id) {
    const file = uploadedFiles.find(f => f.id == id);
    if (!file) {
        alert('Fayl topilmadi!');
        return;
    }

    // Use the existing download logic (adapting from downloadCurrentFile)
    // We temporarily set currentEditingFile to this file so we can reuse logic, 
    // or better, just replicate logic locally to avoid side effects.

    let blob;
    let filename = file.name;
    const lowerName = filename.toLowerCase();

    if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
        blob = new Blob([file.content], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    } else if (file.type.includes('text') && !lowerName.endsWith('.docx')) {
        blob = new Blob([file.content], { type: 'text/plain' });
    } else {
        if (file.content instanceof ArrayBuffer) {
            blob = new Blob([file.content]);
        } else {
            blob = new Blob([file.content], { type: file.type });
        }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Optional: notify user
    // alert(`"${filename}" fayli yuklab olindi!`);
}

function viewFileById(id) {
    const file = uploadedFiles.find(f => f.id == id);
    if (file) previewFile(file);
    else alert('Fayl topilmadi!');
}

function editFileById(id) {
    const file = uploadedFiles.find(f => f.id == id);
    if (file) editFile(file);
    else alert('Fayl topilmadi!');
}

function approveFileById(id) {
    const file = uploadedFiles.find(f => f.id == id);
    if (file) {
        if (confirm(`"${file.name}" faylini tasdiqlaysizmi?`)) {
            file.status = 'approved';

            // --- SINXRONIZATSIYA: Agar M-29 bo'lsa, ikkala nusxani ham yangilash ---
            if (file.virtualType === 'm29' && file.virtualDataId) {
                // Barcha bir xil virtualDataId li fayllarni topish (bo'linma + bugalteriya nusxalari)
                uploadedFiles.forEach(f => {
                    if (f.virtualType === 'm29' && f.virtualDataId == file.virtualDataId) {
                        f.status = 'approved';
                    }
                });

                // Find original act data
                const allActs = JSON.parse(localStorage.getItem('materialActs')) || [];
                const actIndex = allActs.findIndex(a => a.id == file.virtualDataId);

                if (actIndex !== -1) {
                    const act = allActs[actIndex];
                    // Ikki marta chiqim bo'lmasligi uchun tekshirish
                    if (act.status !== 'approved') {
                        let deductedCount = 0;
                        const items = act.items || [];

                        // Deduct materials
                        items.forEach(item => {
                            if (typeof window.deductMaterialStock === 'function') {
                                if (window.deductMaterialStock(item.name, item.qty)) {
                                    deductedCount++;
                                }
                            }
                        });

                        // Update Act Status
                        act.status = 'approved';
                        act.approvedDate = new Date().toISOString();
                        allActs[actIndex] = act;
                        localStorage.setItem('materialActs', JSON.stringify(allActs));

                        // Log Transaction
                        if (typeof window.logTransaction === 'function') {
                            window.logTransaction('M-29', {
                                id: act.id,
                                summary: `M-29 Tasdiqlandi: ${act.matSummary}`,
                                items: items
                            });
                        }

                        alert(`✅ Dalolatnoma tasdiqlandi! ${deductedCount} xil material ombordan chiqim qilindi.`);
                    } else {
                        alert("✅ Fayl tasdiqlandi! (Materiallar allaqachon chiqim qilingan)");
                    }
                } else {
                    alert("✅ Fayl tasdiqlandi!");
                }
            } else {
                alert("✅ Fayl tasdiqlandi!");
            }

            saveDatabase();

            // UI ni yangilash - barcha ochiq oynalarni refresh qilish
            document.querySelectorAll('.department-window.active').forEach(win => {
                const deptId = win.id.replace('-window', '');
                updateFilesTable(win, deptId);
            });
        }
    } else {
        alert('Fayl topilmadi!');
    }
}

function rejectFileById(id) {
    const file = uploadedFiles.find(f => f.id == id);
    if (file) {
        const reason = prompt(`"${file.name}" faylini rad etish sababini kiriting:`);
        if (reason !== null) { // Cancel bosilmasa
            file.status = 'rejected';
            file.feedback = reason;

            // --- SINXRONIZATSIYA: M-29 bo'lsa ikkala nusxani ham yangilash ---
            if (file.virtualType === 'm29' && file.virtualDataId) {
                uploadedFiles.forEach(f => {
                    if (f.virtualType === 'm29' && f.virtualDataId == file.virtualDataId) {
                        f.status = 'rejected';
                        f.feedback = reason;
                    }
                });

                // materialActs dagi aktni ham yangilash
                const allActs = JSON.parse(localStorage.getItem('materialActs')) || [];
                const actIndex = allActs.findIndex(a => a.id == file.virtualDataId);
                if (actIndex !== -1) {
                    allActs[actIndex].status = 'rejected';
                    allActs[actIndex].rejectedDate = new Date().toISOString();
                    allActs[actIndex].rejectionReason = reason;
                    localStorage.setItem('materialActs', JSON.stringify(allActs));
                }
            }

            saveDatabase();

            // UI ni yangilash - barcha ochiq oynalarni refresh
            document.querySelectorAll('.department-window.active').forEach(win => {
                const deptId = win.id.replace('-window', '');
                updateFilesTable(win, deptId);
            });

            alert("❌ Fayl rad etildi!");
        }
    } else {
        alert('Fayl topilmadi!');
    }
}

function viewRejectionReason(id) {
    const file = uploadedFiles.find(f => f.id == id);
    if (file && file.feedback) {
        alert(`Rad etish sababi:\n${file.feedback}`);
    } else {
        alert('Sabab ko\'rsatilmagan');
    }
}

function deleteFileById(id) {
    const file = uploadedFiles.find(f => f.id == id);
    if (file) deleteFile(file);
    else alert('Fayl topilmadi!');
}

function updateFilesTable(window, departmentId) {
    const tableBody = window.querySelector('.files-table-body');
    tableBody.innerHTML = '';

    const departmentFiles = uploadedFiles.filter(f => f.department === departmentId);

    departmentFiles.forEach(file => {
        const sizeInKB = (file.size / 1024).toFixed(2);
        const fileType = file.name.split('.').pop().toUpperCase();
        const uploadDate = new Date(file.uploadDate).toLocaleDateString('uz-UZ');

        // Status Badge Logic
        let statusHtml = '';
        let statusTitle = '';

        if (file.status === 'approved') {
            statusHtml = '<span class="status-badge status-approved"><i class="fas fa-check-circle"></i> Tasdiqlandi</span>';
        } else if (file.status === 'rejected') {
            statusTitle = file.feedback ? `Sabab: ${file.feedback}` : 'Sabab ko\'rsatilmagan';
            // Make badge clickable to see reason calling helper function
            statusHtml = `<span class="status-badge status-rejected" onclick="viewRejectionReason('${file.id}')" title="Sababni ko'rish uchun bosing" style="cursor: pointer;"><i class="fas fa-times-circle"></i> Rad etildi <i class="fas fa-info-circle" style="font-size: 0.8em; margin-left: 5px;"></i></span>`;
        } else {
            statusHtml = '<span class="status-badge status-pending"><i class="fas fa-hourglass-half"></i> Kutilmoqda</span>';
        }

        // ===== ROL ASOSIDA RUXSATLAR =====
        // Rollar:
        //   'bolinma'    -> Fayl yuklash, tahrirlash, o'chirish (o'znikini). Tasdiqlash YO'Q.
        //   'department' -> Fayllarni ko'rish, tasdiqlash, rad etish. Tahrirlash/O'chirish YO'Q.
        //   'admin'      -> Hammasi mumkin.
        const userRole = currentUser ? currentUser.role : 'guest';
        const isAdmin = userRole === 'admin';
        const isBolinma = userRole === 'bolinma';
        const isDepartment = userRole === 'department';
        const isOwner = currentUser && currentUser.username === file.uploader;

        // Action Buttons Logic
        let actionsHtml = `
            <button class="action-btn view" onclick="downloadFileById('${file.id}')" title="Yuklab olish"><i class="fas fa-download"></i></button>
        `;

        // --- TAHRIRLASH: Faqat bo'linma (o'z faylini) yoki admin ---
        if (isAdmin || (isBolinma && isOwner)) {
            actionsHtml += `<button class="action-btn edit" onclick="editFileById('${file.id}')" title="Tahrirlash" style="margin-left: 5px;"><i class="fas fa-edit"></i></button>`;
        }

        // --- TASDIQLASH / RAD ETISH: Faqat bo'limlar (department) yoki admin ---
        if (isDepartment || isAdmin) {
            const showApprove = !file.status || file.status === 'pending' || file.status === 'rejected';
            const showReject = !file.status || file.status === 'pending' || file.status === 'approved';

            if (showApprove) {
                actionsHtml += `<button class="action-btn check" onclick="approveFileById('${file.id}')" title="Tasdiqlash" style="background-color: #2ecc71; color: white; margin-left: 5px;"><i class="fas fa-check"></i></button>`;
            }
            if (showReject) {
                actionsHtml += `<button class="action-btn reject" onclick="rejectFileById('${file.id}')" title="Rad etish" style="background-color: #e74c3c; color: white; margin-left: 5px;"><i class="fas fa-times"></i></button>`;
            }
        }

        // --- O'CHIRISH: Faqat bo'linma (o'z faylini) yoki admin ---
        if (isAdmin || (isBolinma && isOwner)) {
            actionsHtml += `<button class="action-btn delete" onclick="deleteFileById('${file.id}')" title="O'chirish" style="background-color: #95a5a6; color: white; margin-left: 5px;"><i class="fas fa-trash"></i></button>`;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${file.name}</td>
                    <td>${sizeInKB} KB</td>
                    <td>${fileType}</td>
                    <td>${uploadDate}</td>
                    <td>${statusHtml}</td>
                    <td class="file-actions" style="display: flex; gap: 5px;">
                        ${actionsHtml}
                    </td>
                `;

        tableBody.appendChild(row);
    });
}


function updateSmartMonitoring(section, departmentId) {
    if (!section) return;

    // Load data from storage or generate default randoms if first time
    let data = monitoringData[departmentId];

    if (!data) {
        // Initialize default random data for this department if not exists
        data = {
            temp: Math.floor(Math.random() * (55 - 20) + 20),
            defects: Math.floor(Math.random() * 4)
        };
        monitoringData[departmentId] = data;
        saveDatabase(); // Save immediately so it persists
    }

    // Update UI
    const tempEl = section.querySelector('#rail-temp-value');
    const fillEl = section.querySelector('.gauge-fill');
    const statusEl = section.querySelector('.temperature-card .status-text');

    if (tempEl) tempEl.textContent = `+${data.temp}°C`;
    if (fillEl) fillEl.style.width = `${((data.temp - 20) / (60 - 20)) * 100}%`;

    if (statusEl) {
        if (data.temp > 50) {
            statusEl.textContent = "Xavfli harorat";
            statusEl.className = "status-text danger";
        } else if (data.temp > 40) {
            statusEl.textContent = "Yuqori harorat";
            statusEl.className = "status-text warning";
        } else {
            statusEl.textContent = "Normal";
            statusEl.className = "status-text success";
        }
    }

    // Defects
    const defectCountEl = section.querySelector('.defect-stat strong');
    const defectStatusEl = section.querySelector('.defect-card .status-text');

    if (defectCountEl) defectCountEl.textContent = data.defects;
    if (defectStatusEl) {
        if (data.defects > 0) {
            defectStatusEl.textContent = `${data.defects} ta nuqson`;
            defectStatusEl.className = "status-text danger";
        } else {
            defectStatusEl.textContent = "Nuqsonlar yo'q";
            defectStatusEl.className = "status-text success";
        }
    }

    // Wear
    const wearVEl = section.querySelector('.wear-item:nth-child(1) .wear-val');
    const wearHEl = section.querySelector('.wear-item:nth-child(2) .wear-val');
    const wearVBar = section.querySelector('.wear-item:nth-child(1) .progress-bar-fill');
    const wearHBar = section.querySelector('.wear-item:nth-child(2) .progress-bar-fill');

    if (wearVEl) wearVEl.textContent = `${data.wearV}mm`;
    if (wearHEl) wearHEl.textContent = `${data.wearH}mm`;
    if (wearVBar) wearVBar.style.width = `${(data.wearV / 5) * 100}%`;
    if (wearHBar) wearHBar.style.width = `${(data.wearH / 5) * 100}%`;
}

function openSmartMonitoringEdit(deptId) {
    try {
        const modal = document.getElementById('monitoring-edit-modal');

        if (!modal) {
            console.error('CRITICAL ERROR: Modal element #monitoring-edit-modal NOT FOUND in DOM!');
            return;
        }

        let data = monitoringData[deptId];

        // Auto-initialize if missing
        if (!data) {
            data = {
                temp: Math.floor(Math.random() * (55 - 20) + 20),
                defects: 0,
                wearV: 0.0,
                wearH: 0.0
            };
            monitoringData[deptId] = data;
        }

        document.getElementById('edit-dept-id').value = deptId;
        document.getElementById('edit-rail-temp').value = data.temp;
        document.getElementById('edit-defect-count').value = data.defects;
        document.getElementById('edit-wear-v').value = data.wearV;
        document.getElementById('edit-wear-h').value = data.wearH;

        modal.classList.add('active');
        modal.style.display = 'flex'; // FORCE VISIBILITY
        modal.style.zIndex = '99999'; // FORCE ON TOP

    } catch (error) {
        console.error('Error inside openSmartMonitoringEdit: ' + error.message);
    }
}

function closeSmartMonitoringEdit() {
    document.getElementById('monitoring-edit-modal').classList.remove('active');
}

function saveSmartMonitoringData(e) {
    e.preventDefault();
    const deptId = document.getElementById('edit-dept-id').value;

    const newData = {
        temp: parseInt(document.getElementById('edit-rail-temp').value),
        defects: parseInt(document.getElementById('edit-defect-count').value),
        wearV: parseFloat(parseFloat(document.getElementById('edit-wear-v').value).toFixed(1)),
        wearH: parseFloat(parseFloat(document.getElementById('edit-wear-h').value).toFixed(1))
    };

    monitoringData[deptId] = newData;
    saveDatabase();

    // Refresh current UI
    const activeSection = document.getElementById(deptId);
    if (activeSection) {
        const smSection = activeSection.querySelector('.smart-monitoring-section');
        if (smSection) updateSmartMonitoring(smSection, deptId);
    }

    closeSmartMonitoringEdit();
    // alert('Ma\'lumotlar saqlandi!');
}

// Expose functions to global scope for HTML inline events
window.openSmartMonitoringEdit = openSmartMonitoringEdit;
window.closeSmartMonitoringEdit = closeSmartMonitoringEdit;
window.saveSmartMonitoringData = saveSmartMonitoringData;

function updateFolderContents(window, departmentId, folderName) {
    const folderContents = window.querySelector('.folder-contents');
    folderContents.innerHTML = '';

    const folderFiles = uploadedFiles.filter(f => f.department === departmentId && f.folder === folderName);

    if (folderFiles.length === 0) {
        folderContents.innerHTML = '<div class="folder-item">Bu papka bo\'sh</div>';
    } else {
        folderFiles.forEach(file => {
            const folderItem = document.createElement('div');
            folderItem.className = 'folder-item';
            folderItem.setAttribute('data-file', file.name);

            let fileIcon = 'fas fa-file';
            if (file.name.endsWith('.docx')) fileIcon = 'fas fa-file-word';
            else if (file.name.endsWith('.xlsx')) fileIcon = 'fas fa-file-excel';
            else if (file.name.endsWith('.pdf')) fileIcon = 'fas fa-file-pdf';

            folderItem.innerHTML = `
                        <i class="${fileIcon}"></i>
                        <span>${file.name}</span>
                    `;

            folderContents.appendChild(folderItem);
        });
    }
}

function openIntegrationWindow(integrationType, departmentId) {
    let integrationWindow;

    if (integrationType === 'obs' || integrationType === 'kmo') {
        integrationWindow = document.getElementById('obs-integration-window');
    } else if (integrationType === 'exodim') {
        integrationWindow = document.getElementById('exodim-integration-window');
    } else if (integrationType === 'mexanika-monitor') {
        integrationWindow = document.getElementById('mexanika-monitor-window');
        updateMexanikaMonitor(departmentId);
    }

    if (integrationWindow) {
        integrationWindow.classList.add('active');
        document.getElementById('department-overlay').classList.add('active');
    }
}

// Mexanika ma'lumotlarini dinamik yangilash
function updateMexanikaMonitor(departmentId) {
    const window = document.getElementById('mexanika-monitor-window');
    if (!window) return;

    // Departman ID sini saqlash
    window.setAttribute('data-dept-id', departmentId);

    // Departman nomini olish
    let deptName = departmentId;
    if (departmentId.includes('bolinma')) {
        const parts = departmentId.split('-');
        const bNum = parts[0].replace('bolinma', '');
        deptName = `${bNum}-bo'linma Mexanikasi`;
    } else {
        const dept = functionalDepartments.find(d => d.id === departmentId);
        deptName = dept ? dept.name : "Mexanika bo'limi";
    }

    window.querySelector('h2').innerHTML = `<i class="fas fa-cog"></i> ${deptName} Monitoringi`;

    // Ma'lumotlarni localStorage'dan olish yoki standart yaratish
    const seed = departmentId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    let technics = JSON.parse(localStorage.getItem('mex_technics_' + departmentId));
    if (!technics) {
        technics = [
            { name: 'Ekskavator Komatsu', ref: 'EX-' + (200 + (seed % 100)), status: seed % 3 === 0 ? 'Ta\'mir' : 'Faol', fuel: 70 + (seed % 30), insurance: '2024-12-' + (10 + (seed % 15)), inspection: '2024-06-' + (5 + (seed % 20)) },
            { name: 'Buldozer CAT', ref: 'BD-' + (100 + (seed % 50)), status: 'Faol', fuel: 40 + (seed % 50), insurance: '2025-01-' + (15 + (seed % 10)), inspection: '2024-07-' + (10 + (seed % 15)) },
            { name: 'Avtokran XCMG', ref: 'CR-' + (300 + (seed % 80)), status: seed % 4 === 0 ? 'Zaxira' : 'Faol', fuel: 90 - (seed % 20), insurance: '2024-11-' + (20 + (seed % 10)), inspection: '2024-05-' + (12 + (seed % 18)) },
            { name: 'Samosval HOWO', ref: 'TR-' + (500 + (seed % 120)), status: 'Faol', fuel: 65 + (seed % 25), insurance: '2024-10-' + ('0' + (1 + (seed % 9))).slice(-2), inspection: '2024-08-' + (22 + (seed % 8)) }
        ];
        localStorage.setItem('mex_technics_' + departmentId, JSON.stringify(technics));
    }

    // Texnika jadvalini to'ldirish (sug'urta va ko'rik bilan)
    const panel = window.querySelector('#mex-monitor');
    const tableContainer = panel.querySelector('.content-card');

    tableContainer.innerHTML = `
                                    <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
                                        <button onclick="openAddTechnicModal()" style="background: #3498db; color: white; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                                            <i class="fas fa-plus"></i> Texnika qo'shish
                                        </button>
                                    </div>
                                    <table style="width: 100%; border-collapse: collapse; color: white;">
                                        <thead>
                                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                                                <th style="padding: 10px; text-align: left;">Texnika nomi</th>
                                                <th style="padding: 10px; text-align: left;">Raqami</th>
                                                <th style="padding: 10px; text-align: left;">Holati</th>
                                                <th style="padding: 10px; text-align: left;">Yoqilg'i</th>
                                                <th style="padding: 10px; text-align: left;">Sug'urta</th>
                                                <th style="padding: 10px; text-align: left;">Ko'rik</th>
                                                <th style="padding: 10px; text-align: center;">Amallar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${technics.map((t, index) => `
                                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                                    <td style="padding: 10px;">${t.name}</td>
                                                    <td style="padding: 10px;">${t.ref}</td>
                                                    <td style="padding: 10px;"><span class="status-badge" style="background: ${t.status === 'Faol' ? '#2ecc71' : (t.status === 'Ta\'mir' ? '#e67e22' : '#3498db')}">${t.status}</span></td>
                                                    <td style="padding: 10px;">${t.fuel}%</td>
                                                    <td style="padding: 10px; font-size: 0.85rem; color: ${new Date(t.insurance) < new Date() ? '#e74c3c' : '#bdc3c7'}">${t.insurance}</td>
                                                    <td style="padding: 10px; font-size: 0.85rem;">${t.inspection}</td>
                                                    <td style="padding: 10px; text-align: center; display: flex; justify-content: center; gap: 5px;">
                                                        <button onclick="editTechnic(${index}, '${departmentId}')" style="background: none; border: none; color: #3498db; cursor: pointer; padding: 5px;" title="Tahrirlash">
                                                            <i class="fas fa-edit"></i>
                                                        </button>
                                                        <button onclick="deleteTechnic(${index})" style="background: none; border: none; color: #e74c3c; cursor: pointer; padding: 5px;" title="O'chirish">
                                                            <i class="fas fa-trash-alt"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                `;

    // Statistika kartalarini yangilash
    const activeCount = technics.filter(t => t.status === 'Faol').length;
    const repairCount = technics.filter(t => t.status === 'Ta\'mir').length;
    const reserveCount = technics.filter(t => t.status === 'Zaxira').length;

    const statCards = window.querySelectorAll('.stat-number');
    if (statCards.length >= 3) {
        statCards[0].textContent = activeCount;
        statCards[1].textContent = repairCount;
        statCards[2].textContent = reserveCount;
    }

    // RTX Jadvalini yangilash
    const maintenanceList = window.querySelector('#mex-maintenance ul');
    maintenanceList.innerHTML = technics.slice(0, 3).map(t => `
                                    <li style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between;">
                                        <span>${t.name} ${t.ref} (${(technics.indexOf(t) + seed) % 2 === 0 ? 'Moy almashtirish' : 'Profilaktika'})</span>
                                        <span style="color: #ffd700;">${new Date(t.inspection).toLocaleDateString()}</span>
                                    </li>
                                `).join('');
    if (technics.length === 0) maintenanceList.innerHTML = '<li style="padding: 10px; text-align: center; color: rgba(255,255,255,0.5);">Ma\'lumot yo\'q</li>';
}

// Texnika qo'shish modalini ochish
function openAddTechnicModal() {
    const deptId = document.getElementById('mexanika-monitor-window').getAttribute('data-dept-id');
    const modal = document.createElement('div');
    modal.id = 'add-technic-modal';
    modal.style = `
                                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                                    background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center;
                                    z-index: 10000; backdrop-filter: blur(5px);
                                `;
    modal.innerHTML = `
                                    <div style="background: rgba(30, 39, 46, 0.95); width: 400px; padding: 25px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.5); color: white;">
                                        <h3 style="margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;"><i class="fas fa-plus"></i> Yangi texnika qo'shish</h3>
                                        <div style="display: flex; flex-direction: column; gap: 15px;">
                                            <div>
                                                <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Nomi:</label>
                                                <input type="text" id="t-name" placeholder="Masalan: Ekskavator Komatsu" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                            </div>
                                            <div>
                                                <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Raqami:</label>
                                                <input type="text" id="t-ref" placeholder="Masalan: EX-204" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                            </div>
                                            <div>
                                                <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Holati:</label>
                                                <select id="t-status" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                                    <option value="Faol">Faol</option>
                                                    <option value="Ta'mir">Ta'mirlashda</option>
                                                    <option value="Zaxira">Zaxirada</option>
                                                </select>
                                            </div>
                                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                                <div>
                                                    <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Sug'urta muddati:</label>
                                                    <input type="date" id="t-insurance" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                                </div>
                                                <div>
                                                    <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Keyingi ko'rik:</label>
                                                    <input type="date" id="t-inspection" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                                </div>
                                            </div>
                                            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                                                <button onclick="document.getElementById('add-technic-modal').remove()" style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">Bekor qilish</button>
                                                <button onclick="saveNewTechnic('${deptId}')" style="background: #2ecc71; color: white; border: none; padding: 8px 20px; border-radius: 5px; cursor: pointer;">Saqlash</button>
                                            </div>
                                        </div>
                                    </div>
                                `;
    document.body.appendChild(modal);
}

// Yangi texnikani saqlash
function saveNewTechnic(deptId) {
    const name = document.getElementById('t-name').value;
    const ref = document.getElementById('t-ref').value;
    const status = document.getElementById('t-status').value;
    const insurance = document.getElementById('t-insurance').value;
    const inspection = document.getElementById('t-inspection').value;

    if (!name || !ref) {
        showNotification('Nomi va raqami majburiy!', 'error');
        return;
    }

    const technics = JSON.parse(localStorage.getItem('mex_technics_' + deptId)) || [];
    technics.push({
        name,
        ref,
        status,
        fuel: Math.floor(Math.random() * 100),
        insurance: insurance || 'Noma\'lum',
        inspection: inspection || 'Noma\'lum'
    });

    localStorage.setItem('mex_technics_' + deptId, JSON.stringify(technics));
    document.getElementById('add-technic-modal').remove();
    updateMexanikaMonitor(deptId);
    showNotification('Yangi texnika qo\'shildi', 'success');
}

// Texnikani o'chirish
function deleteTechnic(index) {
    const deptId = document.getElementById('mexanika-monitor-window').getAttribute('data-dept-id');
    if (confirm('Haqiqatan ham o\'chirmoqchimisiz?')) {
        const technics = JSON.parse(localStorage.getItem('mex_technics_' + deptId)) || [];
        technics.splice(index, 1);
        localStorage.setItem('mex_technics_' + deptId, JSON.stringify(technics));
        updateMexanikaMonitor(deptId);
        showNotification('Texnika o\'chirildi', 'info');
    }
}

// Texnikani tahrirlash
function editTechnic(index, deptId) {
    const technics = JSON.parse(localStorage.getItem('mex_technics_' + deptId)) || [];
    const t = technics[index];
    if (!t) return;

    const modal = document.createElement('div');
    modal.id = 'edit-technic-modal';
    modal.style = `
                                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                                    background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center;
                                    z-index: 10000; backdrop-filter: blur(5px);
                                `;
    modal.innerHTML = `
                                    <div style="background: rgba(30, 39, 46, 0.95); width: 400px; padding: 25px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.5); color: white;">
                                        <h3 style="margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;"><i class="fas fa-edit"></i> Texnikani tahrirlash</h3>
                                        <div style="display: flex; flex-direction: column; gap: 15px;">
                                            <div>
                                                <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Nomi:</label>
                                                <input type="text" id="edit-t-name" value="${t.name}" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                            </div>
                                            <div>
                                                <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Raqami:</label>
                                                <input type="text" id="edit-t-ref" value="${t.ref}" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                            </div>
                                            <div>
                                                <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Holati:</label>
                                                <select id="edit-t-status" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                                    <option value="Faol" ${t.status === 'Faol' ? 'selected' : ''}>Faol</option>
                                                    <option value="Ta'mir" ${t.status === 'Ta\'mir' ? 'selected' : ''}>Ta'mirlashda</option>
                                                    <option value="Zaxira" ${t.status === 'Zaxira' ? 'selected' : ''}>Zaxirada</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Yoqilg'i (%):</label>
                                                <input type="number" id="edit-t-fuel" value="${t.fuel}" min="0" max="100" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                            </div>
                                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                                <div>
                                                    <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Sug'urta muddati:</label>
                                                    <input type="date" id="edit-t-insurance" value="${t.insurance}" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                                </div>
                                                <div>
                                                    <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Keyingi ko'rik:</label>
                                                    <input type="date" id="edit-t-inspection" value="${t.inspection}" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 5px; color: white;">
                                                </div>
                                            </div>
                                            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                                                <button onclick="document.getElementById('edit-technic-modal').remove()" style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">Bekor qilish</button>
                                                <button onclick="saveEditedTechnic(${index}, '${deptId}')" style="background: #3498db; color: white; border: none; padding: 8px 20px; border-radius: 5px; cursor: pointer;">Saqlash</button>
                                            </div>
                                        </div>
                                    </div>
                                `;
    document.body.appendChild(modal);
}

// Tahrirlangan texnikani saqlash
function saveEditedTechnic(index, deptId) {
    const name = document.getElementById('edit-t-name').value;
    const ref = document.getElementById('edit-t-ref').value;
    const status = document.getElementById('edit-t-status').value;
    const fuel = document.getElementById('edit-t-fuel').value;
    const insurance = document.getElementById('edit-t-insurance').value;
    const inspection = document.getElementById('edit-t-inspection').value;

    if (!name || !ref) {
        showNotification('Nomi va raqami majburiy!', 'error');
        return;
    }

    const technics = JSON.parse(localStorage.getItem('mex_technics_' + deptId)) || [];
    technics[index] = {
        name,
        ref,
        status,
        fuel: parseInt(fuel) || 0,
        insurance: insurance || 'Noma\'lum',
        inspection: inspection || 'Noma\'lum'
    };

    localStorage.setItem('mex_technics_' + deptId, JSON.stringify(technics));
    document.getElementById('edit-technic-modal').remove();
    updateMexanikaMonitor(deptId);
    showNotification('Texnika ma\'lumotlari yangilandi', 'success');
}

let quillEditor = null; // Global Quill instance

// Word Ribbon Actions
window.execQuill = function (command, value = null) {
    if (!quillEditor) return;
    if (command === 'align') {
        quillEditor.format('align', value);
    } else {
        const currentFormat = quillEditor.getFormat();
        quillEditor.format(command, !currentFormat[command]);
    }
};

function previewFile(file) {
    // M-29 Virtual File (Custom Viewer)
    if (file.isVirtual && file.virtualType === 'm29') {
        if (typeof viewMaterialAct === 'function') {
            viewMaterialAct(file.virtualDataId, file.department);
        } else {
            console.error("viewMaterialAct function is missing");
            alert("M-29 dalolatnomasini ochishda xatolik yuz berdi. Sahifani yangilab qayta urinib ko'ring.");
        }
        return;
    }

    currentEditingFile = file;
    const previewWindow = document.getElementById('file-preview-window');
    const previewContent = document.getElementById('filePreview');
    const fileName = file.name.toLowerCase();

    previewContent.innerHTML = '';

    if ((file.type.includes('text') || fileName.endsWith('.txt')) && !fileName.endsWith('.docx')) {
        // Matn fayllari
        const textContent = document.createElement('div');
        textContent.className = 'word-preview';
        textContent.innerHTML = `<pre>${file.content}</pre>`;
        previewContent.appendChild(textContent);
    } else if (fileName.endsWith('.docx')) {
        // Word fayllari (Mammoth orqali)
        if (file.content) {
            mammoth.convertToHtml({ arrayBuffer: file.content })
                .then(result => {
                    previewContent.innerHTML = `<div class="word-preview" style="background:white; color:black; padding:20px;">${result.value}</div>`;
                })
                .catch(err => {
                    previewContent.innerHTML = `<p>Xatolik: ${err.message}</p>`;
                });
        }
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        // Excel fayllari
        try {
            const data = new Uint8Array(file.content);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const html = XLSX.utils.sheet_to_html(firstSheet);
            previewContent.innerHTML = `<div style="background:white; color:black; overflow:auto;">${html}</div>`;
        } catch (e) {
            previewContent.innerHTML = `<p>Excel faylni ko'rsatib bo'lmadi: ${e.message}</p>`;
        }
    } else if (fileName.endsWith('.pdf')) {
        // PDF fayllari
        const blob = new Blob([file.content], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        previewContent.innerHTML = `<iframe src="${url}" width="100%" height="500px" style="border:none;"></iframe>`;
    } else {
        previewContent.innerHTML = `<p>Ushbu fayl turi ko'rsatilmaydi. Yuklab olish uchun "Yuklab olish" tugmasini bosing.</p>`;
    }

    previewWindow.classList.add('active');
    document.getElementById('department-overlay').classList.add('active');
}

function editFile(file) {
    currentEditingFile = file;
    const fileName = file.name.toLowerCase();

    // ELECTRON MODE: Open with default OS app (WPS / Office)
    if (window.electron && file.path) {
        window.electron.openExternal(file.path)
            .then(result => {
                if (result.success) {
                    console.log("Fayl tashqi dasturda ochildi:", file.path);
                } else {
                    alert("Faylni ochishda xatolik: " + result.error);
                }
            });
        return;
    }

    // BROWSER MODE: Fallback to local editors
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        editExcelFile(file);
    } else if (file.type.includes('text') || fileName.endsWith('.txt') || fileName.endsWith('.docx')) {
        editTextFile(file);
    } else {
        alert('Ushbu turdagi faylni tahrirlab bo\'lmaydi');
    }
}

// ============ CUSTOM "OFFLINE" WORD EDITOR ============
function editTextFile(file) {
    const editorWindow = document.getElementById('text-editor-window');

    // Find the wrapper for the editor area
    let wrapper = document.getElementById('docsEditor');
    if (!wrapper) {
        // Create it if missing logic
        wrapper = document.createElement('div');
        wrapper.id = 'docsEditor';
        document.querySelector('#text-editor-window .editor-body').appendChild(wrapper);
    }

    // Reset wrapper styles to be simple
    wrapper.innerHTML = "";
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.height = '60vh';
    wrapper.style.border = '1px solid #444';
    wrapper.style.background = 'white';
    wrapper.style.color = 'black';

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.style.padding = '10px';
    toolbar.style.background = '#f1f1f1';
    toolbar.style.borderBottom = '1px solid #ccc';
    toolbar.innerHTML = `
        <button onmousedown="event.preventDefault(); document.execCommand('bold', false, null)" style="font-weight:bold">B</button>
        <button onmousedown="event.preventDefault(); document.execCommand('italic', false, null)" style="font-style:italic">I</button>
        <button onmousedown="event.preventDefault(); document.execCommand('underline', false, null)" style="text-decoration:underline">U</button>
        <span style="border-left:1px solid #ccc; margin:0 5px;"></span>
        <button onmousedown="event.preventDefault(); document.execCommand('justifyLeft', false, null)">Left</button>
        <button onmousedown="event.preventDefault(); document.execCommand('justifyCenter', false, null)">Center</button>
        <button onmousedown="event.preventDefault(); document.execCommand('justifyRight', false, null)">Right</button>
        <span style="border-left:1px solid #ccc; margin:0 5px;"></span>
        <button onmousedown="event.preventDefault(); document.execCommand('insertUnorderedList', false, null)">List</button>
    `;

    // Editable Content
    const contentArea = document.createElement('div');
    contentArea.id = 'simple-content-area';
    contentArea.contentEditable = true;
    contentArea.style.flex = '1';
    contentArea.style.padding = '20px';
    contentArea.style.overflowY = 'auto';
    contentArea.style.outline = 'none';

    // Load Content
    // Try Mammoth if available, else plain text
    try {
        if (typeof mammoth !== 'undefined' && file.name.endsWith('.docx') && file.content) {
            mammoth.convertToHtml({ arrayBuffer: file.content })
                .then(res => contentArea.innerHTML = res.value)
                .catch(e => contentArea.innerText = "DOCX o'qib bo'lmadi, matn kiritishingiz mumkin.");
        } else {
            // Plain text
            contentArea.innerText = typeof file.content === 'string' ? file.content : "";
        }
    } catch (e) {
        contentArea.innerText = typeof file.content === 'string' ? file.content : "";
    }

    wrapper.appendChild(toolbar);
    wrapper.appendChild(contentArea);

    editorWindow.classList.add('active');
    editorWindow.style.display = 'block';
    document.getElementById('department-overlay').classList.add('active');

    // Remove old listeners to prevent duplication? 
    // Usually okay since we replace onclick
    document.getElementById('saveTextFileBtn').onclick = saveTextFile;
    document.getElementById('closeTextEditorBtn').onclick = closeTextEditor;
    document.getElementById('cancelTextEditBtn').onclick = closeTextEditor;
}

function closeTextEditor() {
    const editorWindow = document.getElementById('text-editor-window');
    editorWindow.classList.remove('active');
    editorWindow.style.display = 'none';
    document.getElementById('department-overlay').classList.remove('active');
}

// ============ CUSTOM "OFFLINE" EXCEL EDITOR ============
function editExcelFile(file) {
    const editorWindow = document.getElementById('excel-editor-window');
    const container = document.getElementById('x-spreadsheet-demo');

    // Clear and prepare container
    container.innerHTML = `
        <div style="height: 100%; display: flex; flex-direction: column;">
            <div style="padding: 5px; background: #eee; border-bottom: 1px solid #ccc;">
                <button onclick="document.execCommand('bold')"><b>B</b></button>
                <button onclick="document.execCommand('italic')"><i>I</i></button>
                <span style="margin-left: 10px; font-size: 12px; color: #666;">Oddiy Jadval Rejimi (Internet talab qilinmaydi)</span>
            </div>
            <div style="flex: 1; overflow: auto;">
                <table id="simple-excel-table" border="1" style="border-collapse: collapse; width: 100%; min-width: 800px;">
                    <!-- Table content will be generated here -->
                </table>
            </div>
        </div>
    `;

    // Generate Table
    const table = document.getElementById('simple-excel-table');
    let html = '';

    // Headers (A, B, C...)
    html += '<thead><tr><th style="background:#f0f0f0; width: 40px;">#</th>';
    for (let c = 0; c < 10; c++) {
        html += `<th style="background:#f0f0f0; min-width: 100px;">${String.fromCharCode(65 + c)}</th>`;
    }
    html += '</tr></thead><tbody>';

    // Rows
    // Try to load data if XLSX library works, otherwise empty
    let existingData = [];
    try {
        if (file.content && typeof XLSX !== 'undefined') {
            const data = new Uint8Array(file.content);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            existingData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        }
    } catch (e) { console.error("XLSX parse error", e); }

    for (let r = 0; r < 50; r++) { // 50 rows default
        html += `<tr><td style="background:#f0f0f0; text-align: center;">${r + 1}</td>`;
        for (let c = 0; c < 10; c++) {
            let val = "";
            if (existingData[r] && existingData[r][c]) val = existingData[r][c];
            html += `<td contenteditable="true" style="padding: 5px; border: 1px solid #ccc;">${val}</td>`;
        }
        html += '</tr>';
    }
    html += '</tbody>';
    table.innerHTML = html;

    editorWindow.style.display = 'block';
    editorWindow.classList.add('active');
    document.getElementById('department-overlay').classList.add('active');

    // Button Listeners
    const saveBtn = document.getElementById('saveExcelBtn');
    saveBtn.onclick = () => saveExcelContent(file.id);

    document.getElementById('closeExcelEditorBtn').onclick = closeExcelEditor;
}

function saveExcelContent(fileId) {
    try {
        const table = document.getElementById('simple-excel-table');
        const rows = table.querySelectorAll('tbody tr');
        const data = [];

        rows.forEach(tr => {
            const rowData = [];
            const cells = tr.querySelectorAll('td');
            // Skip first cell (row number)
            for (let i = 1; i < cells.length; i++) {
                rowData.push(cells[i].innerText); // Just text for now
            }
            data.push(rowData);
        });

        // Convert back to XLSX if possible
        if (typeof XLSX !== 'undefined') {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

            const fileIndex = uploadedFiles.findIndex(f => f.id == fileId);
            if (fileIndex > -1) {
                uploadedFiles[fileIndex].content = wbout;
                uploadedFiles[fileIndex].lastModified = new Date().toISOString();
                saveDatabase();
            }
        } else {
            alert("Saqlash uchun XLSX kutubxonasi ishlamayapti, lekin ma'lumotlar xotirada qoladi.");
        }

        alert("Saqlandi!");
        closeExcelEditor();

        // Refresh UI
        const file = uploadedFiles.find(f => f.id == fileId);
        if (file) {
            const win = document.getElementById(`${file.department}-window`);
            if (win) updateFilesTable(win, file.department);
        }

    } catch (e) {
        alert("Xatolik: " + e.message);
    }
}

function saveExcelContent(fileId) {
    if (!xSpreadsheet) return;

    const data = xSpreadsheet.getData()[0]; // Get the first sheet
    const rows = data.rows;

    // Convert x-spreadsheet -> SheetJS AOA
    const aoa = [];

    // Find max row/col
    const rowKeys = Object.keys(rows).map(k => parseInt(k)).filter(k => !isNaN(k));
    if (rowKeys.length === 0) {
        alert("Fayl bo'sh!");
        return;
    }

    const maxRow = Math.max(...rowKeys);

    for (let r = 0; r <= maxRow; r++) {
        const row = [];
        const rowData = rows[r];
        if (rowData && rowData.cells) {
            const colKeys = Object.keys(rowData.cells).map(k => parseInt(k)).filter(k => !isNaN(k));
            if (colKeys.length > 0) {
                const maxCol = Math.max(...colKeys);
                for (let c = 0; c <= maxCol; c++) {
                    const cell = rowData.cells[c];
                    row.push(cell ? cell.text : "");
                }
            }
        }
        aoa.push(row);
    }

    // Create new Workbook
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, data.name || "Sheet1");

    // Write to ArrayBuffer
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Update global file storage
    const fileIndex = uploadedFiles.findIndex(f => f.id == fileId);
    if (fileIndex > -1) {
        uploadedFiles[fileIndex].content = wbout;
        uploadedFiles[fileIndex].lastModified = new Date().toISOString();
        saveDatabase();

        alert("Fayl muvaffaqiyatli saqlandi!");
        closeExcelEditor();

        // Refresh valid active window if open
        const activeDeptId = uploadedFiles[fileIndex].department;
        const activeWindow = document.getElementById(`${activeDeptId}-window`);
        if (activeWindow) {
            updateFilesTable(activeWindow, activeDeptId);
        }
    } else {
        alert("Xatolik: Fayl topilmadi!");
    }
}

function closeExcelEditor() {
    const editorWindow = document.getElementById('excel-editor-window');
    const container = document.getElementById('x-spreadsheet-demo');

    editorWindow.style.display = 'none';
    editorWindow.classList.remove('active');
    // Don't remove overlay if other windows are open, checking...
    // Simply removing plain active might close others if stacked, but currently we have 1 active modal usually
    // Let's check if department window is active
    const deptWindows = document.querySelectorAll('.department-window.active');
    if (deptWindows.length === 0) {
        document.getElementById('department-overlay').classList.remove('active');
    }

    container.innerHTML = '';
    xSpreadsheet = null;
}

async function saveTextFile() {
    if (!currentEditingFile) return;

    // Use TinyMCE
    const editor = tinymce.activeEditor;
    if (editor) {
        const html = editor.getContent();
        const fileName = currentEditingFile.name.toLowerCase();

        if (fileName.endsWith('.docx')) {
            try {
                if (typeof htmlDocx !== 'undefined') {
                    // html-docx-js accepts html string and valid HTML document structure
                    // Let's wrap it in a basic page
                    const content = `<!DOCTYPE html><html><head></head><body>${html}</body></html>`;

                    const convertedBlob = htmlDocx.asBlob(content);
                    currentEditingFile.content = await convertedBlob.arrayBuffer();
                    currentEditingFile.lastModified = new Date().toISOString();
                } else {
                    alert("DOCX konvertatsiya kutubxonasi yuklanmadi!");
                    return;
                }
            } catch (e) {
                console.error("Docx save error", e);
                alert("Xatolik: " + e.message);
                return;
            }
        } else {
            // Plain text
            currentEditingFile.content = editor.getContent({ format: 'text' });
        }
    } else {
        alert("Tahrirlovchi topilmadi!");
        return;
    }

    currentEditingFile.status = 'approved';
    saveDatabase();

    alert('Fayl muvaffaqiyatli saqlandi!');

    // UI Cleanup
    const editorWindow = document.getElementById('text-editor-window');
    if (editorWindow) {
        editorWindow.classList.remove('active');
        editorWindow.style.display = 'none';

        // Remove TinyMCE to clean up
        if (tinymce && tinymce.activeEditor) {
            tinymce.activeEditor.remove();
        }
    }

    // Update active department window if exists
    const deptId = currentEditingFile.department;
    const activeWindow = document.getElementById(`${deptId}-window`);
    if (activeWindow) {
        updateFilesTable(activeWindow, deptId);
    }

    // General cleanup
    const deptWindows = document.querySelectorAll('.department-window.active');
    if (deptWindows.length === 0) {
        document.getElementById('department-overlay').classList.remove('active');
    }
}

function saveExcelFile() {
    if (!currentEditingFile) return;
    if (!xSpreadsheet) return;

    try {
        const sdata = xSpreadsheet.getData();
        const rows = [];

        // Convert x-spreadsheet -> AOA (SheetJS)
        if (sdata.length > 0) {
            const sheetData = sdata[0];
            const xRows = sheetData.rows;
            // Simple logic: find max row/col
            let maxRow = -1;
            Object.keys(xRows).forEach(k => {
                if (!isNaN(k)) maxRow = Math.max(maxRow, parseInt(k));
            });

            for (let ri = 0; ri <= maxRow; ri++) {
                const row = [];
                if (xRows[ri] && xRows[ri].cells) {
                    const cells = xRows[ri].cells;
                    let maxCol = -1;
                    Object.keys(cells).forEach(k => {
                        if (!isNaN(k)) maxCol = Math.max(maxCol, parseInt(k));
                    });

                    for (let ci = 0; ci <= maxCol; ci++) {
                        row[ci] = cells[ci] ? cells[ci].text : "";
                    }
                }
                rows.push(row);
            }
        }

        // Create Workbook
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        currentEditingFile.content = excelBuffer;
        currentEditingFile.status = 'approved';
        saveDatabase();

        alert('Excel fayl muvaffaqiyatli saqlandi!');
        document.getElementById('excel-editor-window').classList.remove('active');
        document.getElementById('department-overlay').classList.remove('active');
        updateAllDepartmentWindows();

    } catch (e) {
        alert('Excel faylni saqlashda xatolik: ' + e.message);
    }
}

function createExcelTable(data) {
    // Deprecated for x-spreadsheet, but kept empty/minimal if referenced elsewhere
}

function editCurrentFile() {
    if (!currentEditingFile) return;

    document.getElementById('file-preview-window').classList.remove('active');
    editFile(currentEditingFile);
}

function downloadCurrentFile() {
    if (!currentEditingFile) return;


    let blob;
    let filename = currentEditingFile.name;
    const lowerName = filename.toLowerCase();

    if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
        // Excel fayl
        blob = new Blob([currentEditingFile.content], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    } else if (currentEditingFile.type.includes('text') && !lowerName.endsWith('.docx')) {
        // Matn fayli
        blob = new Blob([currentEditingFile.content], { type: 'text/plain' });
    } else {
        // Boshqa fayllar (DOCX ham shu yerga tushadi agar text/plain bo'lmasa)
        // Aslida DOCX ArrayBuffer bo'lsa uni Blob qilish kerak
        if (currentEditingFile.content instanceof ArrayBuffer) {
            blob = new Blob([currentEditingFile.content]);
        } else {
            blob = new Blob([currentEditingFile.content], { type: currentEditingFile.type });
        }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`"${filename}" fayli yuklab olindi!`);
}


function printCurrentFile() {
    if (!currentEditingFile) return;

    const previewContent = document.getElementById('filePreview');
    if (!previewContent) return;

    // PDF Handlers
    const iframe = previewContent.querySelector('iframe');
    if (iframe) {
        try {
            iframe.contentWindow.print();
        } catch (e) {
            // Agar iframe orqali bo'lmasa, yangi oynada ochib chop etamiz
            const blob = new Blob([currentEditingFile.content], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const win = window.open(url, '_blank');
            if (win) {
                // User manual print usually needed for opened PDF
            } else {
                alert("Chop etish uchun pop-up oynalarni yoqing.");
            }
        }
        return;
    }

    // HTML Content (Word, Excel, Text)
    const printWindow = window.open('', '_blank', 'height=600,width=800');
    if (!printWindow) {
        alert("Pop-up bloklangan. Chop etish uchun ruxsat bering.");
        return;
    }

    printWindow.document.write('<html><head><title>' + currentEditingFile.name + '</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: sans-serif; padding: 20px; }');
    printWindow.document.write('table { border-collapse: collapse; width: 100%; }');
    printWindow.document.write('td, th { border: 1px solid black; padding: 8px; text-align: left; }');
    printWindow.document.write('img { max-width: 100%; }');
    printWindow.document.write('.word-preview { white-space: pre-wrap; }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');

    // Get content
    let content = previewContent.innerHTML;

    // Agar Excel formati bo'lsa (inputlar bilan)
    if (previewContent.querySelector('input')) {
        // Input qiymatlarini textga aylantirish (chop etish uchun)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        tempDiv.querySelectorAll('input').forEach(input => {
            const span = document.createElement('span');
            span.textContent = input.value;
            input.parentNode.replaceChild(span, input);
        });
        content = tempDiv.innerHTML;
    }

    printWindow.document.write(content);
    printWindow.document.write('</body></html>');

    printWindow.document.close();
    printWindow.focus();

    setTimeout(function () {
        printWindow.print();
        printWindow.close();
    }, 500);
}

function updateAllDepartmentWindows() {
    functionalDepartments.forEach(dept => {
        const window = document.getElementById(`${dept.id}-window`);
        if (window) {
            updateFilesTable(window, dept.id);
        }
    });
}

function closeAllWindows() {
    document.querySelectorAll('.department-window, .integration-window, .editor-window').forEach(window => {
        window.classList.remove('active');
    });
    document.getElementById('department-overlay').classList.remove('active');
    currentEditingFile = null;
    currentSelectedCell = null;
}

// ========== VIDEO CHAT FUNKSIYALARI ==========

let localStream = null;
let isCameraOn = false;
let isMicOn = false;
let isScreenSharing = false;

// Navbar video chat tugmasi - panelni ochish/yopish
document.getElementById('openVideoChatBtn').addEventListener('click', function () {
    const panel = document.getElementById('videoChatPanel');
    const content = document.getElementById('mainContent');
    const navBtn = this;

    panel.classList.toggle('hidden');
    navBtn.classList.toggle('active');

    if (!panel.classList.contains('hidden')) {
        content.classList.add('with-video-chat');
    } else {
        content.classList.remove('with-video-chat');
    }
});

// Video chat panelini yashirish/ko'rsatish (ichki tugma)
document.getElementById('videoChatToggle').addEventListener('click', function () {
    const panel = document.getElementById('videoChatPanel');
    const content = document.getElementById('mainContent');
    const navBtn = document.getElementById('openVideoChatBtn');

    panel.classList.add('hidden');
    content.classList.remove('with-video-chat');
    navBtn.classList.remove('active');
});

// Defektaskop Tracker tugmasi
document.getElementById('openDefectoscopeBtn').addEventListener('click', function () {
    openDefectoscopeTracker();
});

// Kamerani yoqish/o'chirish
document.getElementById('toggleCameraBtn').addEventListener('click', async function () {
    const videoEl = document.getElementById('localVideo');
    const placeholder = document.getElementById('videoPlaceholder');
    const icon = this.querySelector('i');

    if (!isCameraOn) {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: isMicOn });
            videoEl.srcObject = localStream;
            videoEl.style.display = 'block';
            placeholder.style.display = 'none';
            icon.classList.remove('fa-video-slash');
            icon.classList.add('fa-video');
            this.classList.add('active');
            isCameraOn = true;
        } catch (err) {
            alert('Kameraga kirish imkoni yo\'q: ' + err.message);
        }
    } else {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => track.stop());
        }
        videoEl.style.display = 'none';
        placeholder.style.display = 'flex';
        icon.classList.remove('fa-video');
        icon.classList.add('fa-video-slash');
        this.classList.remove('active');
        isCameraOn = false;
    }
});

// Mikrofonni yoqish/o'chirish
document.getElementById('toggleMicBtn').addEventListener('click', async function () {
    const icon = this.querySelector('i');

    if (!isMicOn) {
        try {
            if (!localStream) {
                localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            }
            icon.classList.remove('fa-microphone-slash');
            icon.classList.add('fa-microphone');
            this.classList.add('active');
            isMicOn = true;
        } catch (err) {
            alert('Mikrofonga kirish imkoni yo\'q: ' + err.message);
        }
    } else {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => track.stop());
        }
        icon.classList.remove('fa-microphone');
        icon.classList.add('fa-microphone-slash');
        this.classList.remove('active');
        isMicOn = false;
    }
});

// Ekranni ulashish
document.getElementById('shareScreenBtn').addEventListener('click', async function () {
    const videoEl = document.getElementById('localVideo');
    const placeholder = document.getElementById('videoPlaceholder');
    const icon = this.querySelector('i');

    if (!isScreenSharing) {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            videoEl.srcObject = screenStream;
            videoEl.style.display = 'block';
            placeholder.style.display = 'none';
            this.classList.add('active');
            isScreenSharing = true;

            screenStream.getVideoTracks()[0].onended = () => {
                videoEl.style.display = 'none';
                placeholder.style.display = 'flex';
                this.classList.remove('active');
                isScreenSharing = false;
            };
        } catch (err) {
            console.log('Ekran ulashish bekor qilindi');
        }
    } else {
        if (videoEl.srcObject) {
            videoEl.srcObject.getTracks().forEach(track => track.stop());
        }
        videoEl.style.display = 'none';
        placeholder.style.display = 'flex';
        this.classList.remove('active');
        isScreenSharing = false;
    }
});

// Qo'ng'iroqni tugatish
document.getElementById('endCallBtn').addEventListener('click', function () {
    const videoEl = document.getElementById('localVideo');
    const placeholder = document.getElementById('videoPlaceholder');

    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }

    if (videoEl.srcObject) {
        videoEl.srcObject.getTracks().forEach(track => track.stop());
        videoEl.srcObject = null;
    }

    videoEl.style.display = 'none';
    placeholder.style.display = 'flex';

    // Barcha tugmalarni boshlang'ich holatga qaytarish
    document.getElementById('toggleCameraBtn').classList.remove('active');
    document.getElementById('toggleCameraBtn').querySelector('i').classList.replace('fa-video', 'fa-video-slash');
    document.getElementById('toggleMicBtn').classList.remove('active');
    document.getElementById('toggleMicBtn').querySelector('i').classList.replace('fa-microphone', 'fa-microphone-slash');
    document.getElementById('shareScreenBtn').classList.remove('active');

    isCameraOn = false;
    isMicOn = false;
    isScreenSharing = false;

    alert('Qo\'ng\'iroq tugadi!');
});

// Qo'ng'iroq boshlash
document.getElementById('startCallBtn').addEventListener('click', function () {
    alert('Video qo\'ng\'iroq boshlanmoqda...\n\nKamera va mikrofonni yoqing!');
    document.getElementById('toggleCameraBtn').click();
});

// Taklif qilish
document.getElementById('inviteBtn').addEventListener('click', function () {
    const link = window.location.href;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
            alert('Taklif havolasi nusxalandi!\n\n' + link);
        });
    } else {
        prompt('Taklif havolasini nusxalang:', link);
    }
});

// ============ ADMIN PANEL FUNKSIYALARI ============

// Admin tugmasini ko'rsatish (faqat admin uchun)
function showAdminButton() {
    if (currentUser && currentUser.role === 'admin') {
        // Admin panel tugmasi
        document.getElementById('openAdminPanelBtn').style.display = 'flex';
        // Xarita tugmasi
        document.getElementById('openTrainMapBtn').style.display = 'flex';
    } else {
        // Boshqalar uchun yashirish
        document.getElementById('openAdminPanelBtn').style.display = 'none';
        document.getElementById('openTrainMapBtn').style.display = 'none';
    }
}

// Admin panelini ochish
document.getElementById('openAdminPanelBtn').addEventListener('click', function () {
    document.getElementById('adminPanelModal').classList.add('active');
    loadAdminPanelData();
});

// Admin panelini yopish
document.getElementById('closeAdminPanel').addEventListener('click', function () {
    document.getElementById('adminPanelModal').classList.remove('active');
});

// Admin panel tablarini almashtirish
document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const tabId = this.getAttribute('data-admin-tab');

        // Barcha tablarni o'chirish
        document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));

        // Faol tabni yoqish
        this.classList.add('active');
        document.getElementById(`admin-${tabId}-tab`).classList.add('active');
    });
});

// Admin panel ma'lumotlarini yuklash
function loadAdminPanelData() {
    loadAdminBolinmaScores();
    loadAdminTrainsList();
    loadAdminWorkersList();
    loadAdminStationsList();
    loadAdminBolinmalarList();
    loadAdminUsersList();
}

async function loadAdminUsersList() {
    const container = document.getElementById('adminUsersList');
    if (!container) return;

    container.innerHTML = '<div style="text-align:center; padding:20px; color:rgba(255,255,255,0.5);"><i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...</div>';

    try {
        const users = await SmartUtils.api('/auth/users');
        container.innerHTML = '';

        users.forEach(user => {
            const roleIcons = {
                admin: 'fa-user-shield',
                department: 'fa-building',
                bolinma: 'fa-map-pin'
            };

            container.innerHTML += `
                <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 1rem; border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                    <div style="width: 45px; height: 45px; border-radius: 12px; background: rgba(0, 198, 255, 0.15); display: flex; align-items: center; justify-content: center; color: #00c6ff; font-size: 1.2rem;">
                        <i class="fas ${roleIcons[user.role] || 'fa-user'}"></i>
                    </div>
                    <div style="flex: 1;">
                        <div style="color: white; font-weight: 600;">${user.full_name || user.username}</div>
                        <div style="display: flex; gap: 10px; font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-top: 4px;">
                            <span><i class="fas fa-user"></i> @${user.username}</span>
                            <span><i class="fas fa-tag"></i> ${user.role}</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="editUserProfile(${user.id})" style="background: rgba(0, 198, 255, 0.1); border: 1px solid rgba(0, 198, 255, 0.3); color: #00c6ff; width: 32px; height: 32px; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteUserProfile(${user.id})" style="background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.3); color: #e74c3c; width: 32px; height: 32px; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = '<div style="color:#e74c3c; padding:20px; text-align:center;">Yuklashda xatolik yuz berdi</div>';
    }
}

// User Profile Actions for Admin
window.deleteUserProfile = function (userId) {
    if (confirm('Haqiqatan ham ushbu foydalanuvchini o\'chirmoqchimisiz?')) {
        SmartUtils.showToast('Bu funksiya hozircha cheklangan (demo)', 'info');
    }
}

window.editUserProfile = function (userId) {
    SmartUtils.showToast('Tahrirlash oynasi ochilmoqda...', 'info');
}

// Bo'linmalar ballarini yuklash
function loadAdminBolinmaScores() {
    const container = document.getElementById('adminBolinmaScores');
    container.innerHTML = '';

    for (let i = 1; i <= 10; i++) {
        const score = competitionData.values[`bolinma${i}`]?.performance || 50;
        container.innerHTML += `
                                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                            <span style="color: white; width: 100px;">${i}-bo'linma:</span>
                                            <input type="number" id="bolinma${i}Score" value="${score}" 
                                                   min="0" max="200" style="flex: 1; padding: 8px; border-radius: 5px;">
                                        </div>
                                    `;
    }
}

// Poyezdlar ro'yxatini yuklash
function loadAdminTrainsList() {
    const container = document.getElementById('adminTrainsList');
    container.innerHTML = '';

    trainsData.forEach(train => {
        container.innerHTML += `
                                        <div class="train-item" style="position: relative;">
                                            <button onclick="deleteTrain(${train.id})" style="position: absolute; top: 5px; right: 5px; background: #e74c3c; border: none; color: white; width: 25px; height: 25px; border-radius: 50%; cursor: pointer;">
                                                <i class="fas fa-times"></i>
                                            </button>
                                            <div class="train-number">${train.number}</div>
                                            <div class="train-route">${train.route}</div>
                                            <div class="train-time">
                                                <span>Jo'nash: ${train.departure}</span>
                                                <span>Kelish: ${train.arrival}</span>
                                            </div>
                                            <span class="train-status ${train.status}">
                                                ${train.status === 'moving' ? 'Yo\'lda' : train.status === 'station' ? 'Bekatda' : 'Kutilmoqda'}
                                            </span>
                                        </div>
                                    `;
    });
}

// Xodimlar ro'yxatini yuklash
function loadAdminWorkersList() {
    const container = document.getElementById('adminWorkersList');
    container.innerHTML = '';

    workersData.forEach(worker => {
        container.innerHTML += `
                                        <div style="background: rgba(255,255,255,0.1); padding: 0.75rem; border-radius: 10px; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.75rem;">
                                            <div style="width: 35px; height: 35px; border-radius: 50%; background: ${worker.color}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.9rem;">
                                                ${worker.name.charAt(0)}
                                            </div>
                                            <div style="flex: 1;">
                                                <div style="color: white; font-weight: 500; font-size: 0.9rem;">${worker.name}</div>
                                                <div style="color: rgba(255,255,255,0.7); font-size: 0.75rem;">${worker.bolinma} - ${worker.role}</div>
                                            </div>
                                            <button onclick="deleteWorker(${worker.id})" style="background: #e74c3c; border: none; color: white; width: 28px; height: 28px; border-radius: 50%; cursor: pointer;">
                                                <i class="fas fa-trash" style="font-size: 0.75rem;"></i>
                                            </button>
                                        </div>
                                    `;
    });
}

// Stansiyalar ro'yxatini yuklash
function loadAdminStationsList() {
    const container = document.getElementById('adminStationsList');
    if (!container) return;
    container.innerHTML = '';

    stationsData.forEach(station => {
        container.innerHTML += `
                                        <div style="background: rgba(255,255,255,0.1); padding: 0.75rem; border-radius: 10px; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.75rem;">
                                            <div style="width: 35px; height: 35px; border-radius: 50%; background: #e74c3c; display: flex; align-items: center; justify-content: center; color: white;">
                                                <i class="fas fa-map-marker-alt"></i>
                                            </div>
                                            <div style="flex: 1;">
                                                <div style="color: white; font-weight: 500; font-size: 0.9rem;">${station.name}</div>
                                                <div style="color: rgba(255,255,255,0.7); font-size: 0.75rem;">${station.bolinma}-bo'linma | ${station.lat.toFixed(2)}, ${station.lng.toFixed(2)}</div>
                                            </div>
                                            <button onclick="deleteStation(${station.id})" style="background: #e74c3c; border: none; color: white; width: 28px; height: 28px; border-radius: 50%; cursor: pointer;">
                                                <i class="fas fa-trash" style="font-size: 0.75rem;"></i>
                                            </button>
                                        </div>
                                    `;
    });
}

// Yangi poyezd qo'shish
function addNewTrain() {
    const number = document.getElementById('newTrainNumber').value;
    const route = document.getElementById('newTrainRoute').value;
    const departure = document.getElementById('newTrainDeparture').value;
    const arrival = document.getElementById('newTrainArrival').value;

    if (!number || !route) {
        alert('Poyezd raqami va yo\'nalishini kiriting!');
        return;
    }

    const newTrain = {
        id: Date.now(),
        number: number,
        route: route,
        departure: departure || '00:00',
        arrival: arrival || '00:00',
        status: 'waiting',
        lat: stationsData[0]?.lat || 39.9,
        lng: stationsData[0]?.lng || 65.8
    };

    trainsData.push(newTrain);
    saveDataToStorage();
    loadAdminTrainsList();

    // Inputlarni tozalash
    document.getElementById('newTrainNumber').value = '';
    document.getElementById('newTrainRoute').value = '';
    document.getElementById('newTrainDeparture').value = '';
    document.getElementById('newTrainArrival').value = '';

    alert('Yangi poyezd qo\'shildi!');
}

// Yangi xodim qo'shish
function addNewWorker() {
    const name = document.getElementById('newWorkerName').value;
    const bolinma = document.getElementById('newWorkerBolinma').value;
    const role = document.getElementById('newWorkerRole').value;
    const color = document.getElementById('newWorkerColor').value;

    if (!name || !bolinma) {
        alert('Xodim ismi va bo\'linmasini kiriting!');
        return;
    }

    // Bo'linma stansiyasini topish
    const bolinmaNum = parseInt(bolinma.replace('-bo\'linma', ''));
    const station = stationsData.find(s => s.bolinma === bolinmaNum);

    const newWorker = {
        id: Date.now(),
        name: name,
        bolinma: bolinma,
        role: role || 'Xodim',
        lat: station?.lat || 39.9 + Math.random() * 0.5,
        lng: station?.lng || 65.5 + Math.random() * 0.5,
        color: color
    };

    workersData.push(newWorker);
    workerRoutes[newWorker.id] = [[newWorker.lat, newWorker.lng]];
    saveDataToStorage();
    loadAdminWorkersList();

    // Inputlarni tozalash
    document.getElementById('newWorkerName').value = '';
    document.getElementById('newWorkerBolinma').value = '';
    document.getElementById('newWorkerRole').value = '';

    alert('Yangi xodim qo\'shildi!');
}

// Yangi stansiya qo'shish
function addNewStation() {
    const name = document.getElementById('newStationName').value;
    const lat = parseFloat(document.getElementById('newStationLat').value);
    const lng = parseFloat(document.getElementById('newStationLng').value);
    const bolinma = parseInt(document.getElementById('newStationBolinma').value);

    if (!name || isNaN(lat) || isNaN(lng)) {
        alert('Stansiya nomi va koordinatlarini kiriting!');
        return;
    }

    const newStation = {
        id: Date.now(),
        name: name,
        lat: lat,
        lng: lng,
        bolinma: bolinma || 0
    };

    stationsData.push(newStation);
    trainRoutePoints = stationsData.map(s => [s.lat, s.lng]);
    saveDataToStorage();
    loadAdminStationsList();

    // Inputlarni tozalash
    document.getElementById('newStationName').value = '';
    document.getElementById('newStationLat').value = '';
    document.getElementById('newStationLng').value = '';
    document.getElementById('newStationBolinma').value = '';

    alert('Yangi stansiya qo\'shildi!');
}

// Poyezdni o'chirish
function deleteTrain(id) {
    if (confirm('Bu poyezdni o\'chirishni istaysizmi?')) {
        trainsData = trainsData.filter(t => t.id !== id);
        saveDataToStorage();
        loadAdminTrainsList();
    }
}

// Xodimni o'chirish
function deleteWorker(id) {
    if (confirm('Bu xodimni o\'chirishni istaysizmi?')) {
        workersData = workersData.filter(w => w.id !== id);
        delete workerRoutes[id];
        saveDataToStorage();
        loadAdminWorkersList();
    }
}

// Stansiyani o'chirish
function deleteStation(id) {
    if (confirm('Bu stansiyani o\'chirishni istaysizmi?')) {
        stationsData = stationsData.filter(s => s.id !== id);
        trainRoutePoints = stationsData.map(s => [s.lat, s.lng]);
        saveDataToStorage();
        loadAdminStationsList();
    }
}

// Event listenerlar
document.getElementById('addNewTrainBtn')?.addEventListener('click', addNewTrain);
document.getElementById('addNewWorkerBtn')?.addEventListener('click', addNewWorker);
document.getElementById('addNewStationBtn')?.addEventListener('click', addNewStation);

// Bo'linmalar statistikasini yuklash
function loadAdminBolinmalarList() {
    const container = document.getElementById('adminBolinmalarList');
    container.innerHTML = '';

    for (let i = 1; i <= 10; i++) {
        const workerCount = workersData.filter(w => w.bolinma === `${i}-bo'linma`).length;
        container.innerHTML += `
                                        <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 10px; margin-bottom: 0.5rem;">
                                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                                <div style="color: #ffd700; font-weight: bold;">${i}-bo'linma</div>
                                                <div style="color: white;">Xodimlar: ${workerCount}</div>
                                            </div>
                                            <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
                                                <span style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">Bo'limlar: 8</span>
                                                <span style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">Fayllar: ${Math.floor(Math.random() * 20) + 5}</span>
                                            </div>
                                        </div>
                                    `;
    }
}

// Admin grafik sozlamalarini saqlash
document.getElementById('saveAdminChartBtn').addEventListener('click', function () {
    // Bo'linmalar ballarini saqlash
    for (let i = 1; i <= 10; i++) {
        const score = parseInt(document.getElementById(`bolinma${i}Score`).value) || 50;
        if (!competitionData.values[`bolinma${i}`]) {
            competitionData.values[`bolinma${i}`] = {};
        }
        competitionData.values[`bolinma${i}`].performance = score;
    }

    // Grafik turini saqlash
    competitionData.chartSettings.type = document.getElementById('adminChartType').value;

    saveDatabase();

    // Grafikni yangilash
    if (competitionChart) {
        competitionChart.destroy();
        createCompetitionChart();
    }

    alert('Sozlamalar saqlandi!');
});

// ============ XARITA FUNKSIYALARI ============

// Xaritani ochish
document.getElementById('openTrainMapBtn').addEventListener('click', function () {
    document.getElementById('trainMapModal').classList.add('active');
    setTimeout(() => {
        initTrainLiveMap();
    }, 100);
});

// Xaritani yopish
document.getElementById('closeTrainMap').addEventListener('click', function () {
    document.getElementById('trainMapModal').classList.remove('active');
});

// Live xaritani ishga tushirish
function initTrainLiveMap() {
    if (trainLiveMap) {
        trainLiveMap.remove();
    }

    // Xarita yaratish - Buxoro viloyati
    trainLiveMap = L.map('trainLiveMap').setView([39.9, 65.8], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(trainLiveMap);

    // Stansiyalarni qo'shish
    addStationMarkers();

    // Temir yo'l chizish (stansiyalar orasida)
    if (trainRoutePoints.length > 1) {
        L.polyline(trainRoutePoints, {
            color: '#ffd700',
            weight: 4,
            opacity: 0.8
        }).addTo(trainLiveMap);
    }

    // Poyezdlarni qo'shish
    addTrainMarkers();

    // Xodimlarni qo'shish
    addWorkerMarkers();

    // Poyezdlar jadvalini yuklash
    loadTrainSchedule();

    // Online xodimlarni yuklash
    loadWorkersOnline();

    // Harakatni simulyatsiya qilish
    setInterval(() => {
        updatePositions();
    }, 3000);
}

// Stansiya markerlarini qo'shish
function addStationMarkers() {
    stationsData.forEach(station => {
        const marker = L.marker([station.lat, station.lng], {
            icon: L.divIcon({
                className: 'station-marker',
                html: `<div style="background: #e74c3c; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);">
                                                <i class="fas fa-map-marker-alt" style="color: white; font-size: 12px;"></i>
                                            </div>`
            })
        }).addTo(trainLiveMap);

        marker.bindPopup(`
                                        <div style="text-align: center;">
                                            <strong style="color: #1a2a3a;">${station.name}</strong><br>
                                            <span>${station.bolinma}-bo'linma</span><br>
                                            <small>Koordinatalar: ${station.lat.toFixed(2)}, ${station.lng.toFixed(2)}</small>
                                        </div>
                                    `);
    });
}

// Poyezd markerlarini qo'shish
function addTrainMarkers() {
    trainMarkers.forEach(m => trainLiveMap.removeLayer(m));
    trainMarkers = [];

    trainsData.forEach(train => {
        const marker = L.marker([train.lat, train.lng], {
            icon: L.divIcon({
                className: 'train-marker',
                html: `<div style="background: #ffd700; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);">
                                                <i class="fas fa-train" style="color: #1a2a3a;"></i>
                                            </div>`
            })
        }).addTo(trainLiveMap);

        marker.bindPopup(`
                                        <div style="text-align: center;">
                                            <strong style="color: #1a2a3a;">${train.number}</strong><br>
                                            <span>${train.route}</span><br>
                                            <small>Jo'nash: ${train.departure} | Kelish: ${train.arrival}</small>
                                        </div>
                                    `);

        trainMarkers.push(marker);
    });
}

// Xodim markerlarini qo'shish
function addWorkerMarkers() {
    workerMarkers.forEach(m => trainLiveMap.removeLayer(m));
    routePolylines.forEach(p => trainLiveMap.removeLayer(p));
    workerMarkers = [];
    routePolylines = [];

    workersData.forEach(worker => {
        // Xodim markeri
        const marker = L.marker([worker.lat, worker.lng], {
            icon: L.divIcon({
                className: 'worker-marker-icon',
                html: `<div class="worker-marker" style="background: ${worker.color};">${worker.name.charAt(0)}</div>`
            })
        }).addTo(trainLiveMap);

        marker.bindPopup(`
                                        <div style="text-align: center;">
                                            <strong style="color: #1a2a3a;">${worker.name}</strong><br>
                                            <span>${worker.bolinma}</span><br>
                                            <small>${worker.role}</small>
                                        </div>
                                    `);

        workerMarkers.push(marker);

        // Xodim yo'lini chizish
        const route = workerRoutes[worker.id];
        if (route) {
            const polyline = L.polyline(route, {
                color: worker.color,
                weight: 3,
                opacity: 0.7,
                dashArray: '5, 10'
            }).addTo(trainLiveMap);
            routePolylines.push(polyline);
        }
    });
}

// Poyezdlar jadvalini yuklash
function loadTrainSchedule() {
    const container = document.getElementById('trainScheduleList');
    container.innerHTML = '';

    trainsData.forEach(train => {
        container.innerHTML += `
                                        <div class="train-item">
                                            <div class="train-number"><i class="fas fa-train"></i> ${train.number}</div>
                                            <div class="train-route">${train.route}</div>
                                            <div class="train-time">
                                                <span><i class="fas fa-clock"></i> ${train.departure}</span>
                                                <span><i class="fas fa-flag-checkered"></i> ${train.arrival}</span>
                                            </div>
                                            <span class="train-status ${train.status}">
                                                ${train.status === 'moving' ? 'Yo\'lda' : train.status === 'station' ? 'Bekatda' : 'Kutilmoqda'}
                                            </span>
                                        </div>
                                    `;
    });
}

// Online xodimlarni yuklash
function loadWorkersOnline() {
    const container = document.getElementById('workersOnlineList');
    container.innerHTML = '';

    workersData.forEach(worker => {
        container.innerHTML += `
                                        <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 8px; margin-bottom: 8px;">
                                            <div style="width: 30px; height: 30px; border-radius: 50%; background: ${worker.color}; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">
                                                ${worker.name.charAt(0)}
                                            </div>
                                            <div style="flex: 1;">
                                                <div style="color: white; font-size: 0.85rem;">${worker.name}</div>
                                                <div style="color: rgba(255,255,255,0.6); font-size: 0.75rem;">${worker.bolinma}</div>
                                            </div>
                                            <span style="color: #2ecc71; font-size: 0.7rem;"><i class="fas fa-circle"></i></span>
                                        </div>
                                    `;
    });
}

// Pozitsiyalarni yangilash (simulyatsiya)
function updatePositions() {
    // Poyezdlarni harakatlantirish
    trainsData.forEach((train, index) => {
        if (train.status === 'moving') {
            train.lat += (Math.random() - 0.5) * 0.02;
            train.lng += (Math.random() - 0.5) * 0.02;
        }
    });

    // Xodimlarni harakatlantirish
    workersData.forEach((worker, index) => {
        worker.lat += (Math.random() - 0.5) * 0.01;
        worker.lng += (Math.random() - 0.5) * 0.01;

        // Yangi pozitsiyani yo'lga qo'shish
        workerRoutes[worker.id].push([worker.lat, worker.lng]);
        if (workerRoutes[worker.id].length > 10) {
            workerRoutes[worker.id].shift();
        }
    });

    // Markerlarni yangilash
    if (trainLiveMap) {
        addTrainMarkers();
        addWorkerMarkers();
    }
}

// Panel yashirilgan holatda boshlanadi

// === NEW FEATURES JS ===

// Notification System
function showNotification(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    let icon = 'info-circle';
    let color = '#3498db';

    if (type === 'success') { icon = 'check-circle'; color = '#2ecc71'; }
    if (type === 'warning') { icon = 'exclamation-triangle'; color = '#f39c12'; }
    if (type === 'error') { icon = 'times-circle'; color = '#e74c3c'; }

    toast.style.borderLeftColor = color;
    toast.innerHTML = `<i class="fas fa-${icon}" style="color: ${color}; font-size: 1.2rem;"></i> ${msg}`;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'all 0.5s ease';
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// Chat Bot
function toggleChat() {
    document.getElementById('chat-window').classList.toggle('active');
}

function sendChat() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    addChatMsg(text, 'user');
    input.value = '';

    // Simulate response
    const typing = document.createElement('div');
    typing.className = 'chat-msg bot';
    typing.innerHTML = '<i class="fas fa-ellipsis-h fa-beat"></i>';
    typing.id = 'typing-indicator';
    document.getElementById('chat-messages').appendChild(typing);
    document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;

    setTimeout(() => {
        document.getElementById('typing-indicator').remove();
        let reply = "Kechirasiz, men hali o'rganish jarayonidaman.";
        const low = text.toLowerCase();

        if (low.includes('salom') || low.includes('assalom')) reply = "Vaalaykum assalom! PCh-Qorlitog' tizimiga xush kelibsiz.";
        else if (low.includes('qanday') && low.includes('ishlar')) reply = "Rahmat, tizim barqaror ishlamoqda.";
        else if (low.includes('poyezd')) reply = "Poyezdlar harakatini 'Poyezdlar kuzatuvi' bo'limida jonli ko'rishingiz mumkin.";
        else if (low.includes('bo\'lim') || low.includes('bolim')) reply = "Chap tomondagi menyu orqali bo'limlarni tanlashingiz mumkin.";
        else if (low.includes('admin')) reply = "Admin panelga kirish uchun maxsus huquq talab qilinadi.";
        else if (low.includes('ob-havo')) reply = "Ob-havo ma'lumotlari Dashboard sahifasida yangilanib turadi.";

        addChatMsg(reply, 'bot');
    }, 1500);
}

function addChatMsg(text, type) {
    const msgs = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `chat-msg ${type}`;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

// Kanban Board
let kanbanTasks = {
    todo: [{ id: 1, text: "Yangi hisobotni tekshirish" }, { id: 2, text: "Xodimlar ro'yxatini yangilash" }],
    inprogress: [{ id: 3, text: "Server profilaktikasi" }],
    done: [{ id: 4, text: "Ob-havo vidjetini o'rnatish" }]
};

function createTasksSection() {
    const section = document.createElement('section');
    section.id = 'tasks-section';
    section.className = 'content-section';
    section.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                <h2><i class="fas fa-tasks"></i> Vazifalar Boshqaruvi</h2>
                <button class="action-btn" style="background:transparent; border:1px solid rgba(255,255,255,0.3); color:white;" onclick="initKanban()"><i class="fas fa-sync"></i></button>
            </div>
            <div class="kanban-board">
                <div class="kanban-column">
                    <div class="kanban-header">
                        <span>BAJARILISHI KERAK</span>
                        <button onclick="addTask('todo')" class="action-btn view" style="padding:4px 8px; font-size:0.8rem;"><i class="fas fa-plus"></i></button>
                    </div>
                    <div id="kanban-todo" class="kanban-items" ondrop="drop(event, 'todo')" ondragover="allowDrop(event)"></div>
                </div>
                <div class="kanban-column">
                    <div class="kanban-header">
                        <span>JARAYONDA</span>
                        <button onclick="addTask('inprogress')" class="action-btn check" style="padding:4px 8px; font-size:0.8rem;"><i class="fas fa-plus"></i></button>
                    </div>
                    <div id="kanban-inprogress" class="kanban-items" ondrop="drop(event, 'inprogress')" ondragover="allowDrop(event)"></div>
                </div>
                <div class="kanban-column">
                    <div class="kanban-header">
                        <span>BAJARILDI</span>
                        <button onclick="addTask('done')" class="action-btn delete" style="padding:4px 8px; font-size:0.8rem;"><i class="fas fa-plus"></i></button>
                    </div>
                    <div id="kanban-done" class="kanban-items" ondrop="drop(event, 'done')" ondragover="allowDrop(event)"></div>
                </div>
            </div>
        `;
    setTimeout(initKanban, 100);
    return section;
}

function initKanban() {
    renderKanbanList('todo');
    renderKanbanList('inprogress');
    renderKanbanList('done');
}

function renderKanbanList(status) {
    const el = document.getElementById(`kanban-${status}`);
    if (!el) return;
    el.innerHTML = '';
    kanbanTasks[status].forEach(task => {
        const div = document.createElement('div');
        div.className = 'kanban-item';
        div.draggable = true;
        div.id = `task-${task.id}`;
        div.innerHTML = `
                <div>${task.text}</div>
                <div style="margin-top:0.5rem; display:flex; justify-content:flex-end;">
                    <i class="fas fa-trash" style="color:#e74c3c; cursor:pointer; font-size:0.8rem;" onclick="deleteTask(${task.id}, '${status}')"></i>
                </div>
            `;
        div.ondragstart = (event) => drag(event, task.id, status);
        el.appendChild(div);
    });
}

function allowDrop(ev) { ev.preventDefault(); }

function drag(ev, id, status) {
    ev.dataTransfer.setData("text", JSON.stringify({ id: id, origin: status }));
}

function drop(ev, targetStatus) {
    ev.preventDefault();
    try {
        const data = JSON.parse(ev.dataTransfer.getData("text"));
        if (data.origin !== targetStatus) {
            // Move logic
            const idx = kanbanTasks[data.origin].findIndex(t => t.id === data.id);
            if (idx > -1) {
                const task = kanbanTasks[data.origin].splice(idx, 1)[0];
                kanbanTasks[targetStatus].push(task);
                initKanban();
                showNotification("Vazifa ko'chirildi!", "success");
            }
        }
    } catch (e) { }
}

function addTask(status) {
    const text = prompt("Vazifa matnini kiriting:");
    if (text) {
        kanbanTasks[status].push({ id: Date.now(), text: text });
        initKanban();
        showNotification("Vazifa qo'shildi", "success");
    }
}

function deleteTask(id, status) {
    if (confirm("Vazifani o'chirmoqchimisiz?")) {
        kanbanTasks[status] = kanbanTasks[status].filter(t => t.id !== id);
        initKanban();
    }
}

// Maintenance Data Management
let maintenanceLogs = JSON.parse(localStorage.getItem('maintenance_logs')) || [
    { id: 1, object: 'Lokomotiv #2024', task: 'Dvigatel moyini almashtirish', status: 'repair', person: 'Azimov B.', date: '2026-01-20' },
    { id: 2, object: 'Stansiya A-1 transformator', task: 'Kuchlanishni barqarorlashtirish', status: 'check', person: 'Karimov S.', date: '2026-01-25' },
    { id: 3, object: 'Videokuzatuv tizimi', task: 'Kamera #4 signal yo\'qolishi', status: 'ok', person: 'IT Bo\'lim', date: '2026-01-24' }
];

function saveMaintenanceData() {
    localStorage.setItem('maintenance_logs', JSON.stringify(maintenanceLogs));
    initMaintenanceTable();
}

function createMaintenanceSection() {
    const section = document.createElement('section');
    section.id = 'maintenance-section';
    section.className = 'content-section';
    section.innerHTML = `
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                                        <h2><i class="fas fa-tools"></i> Texnik Xizmat Ko'rsatish</h2>
                                        <button class="action-btn view" onclick="openMaintModal()"><i class="fas fa-plus"></i> Yangi yozuv</button>
                                    </div>
                                    
                                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-bottom:1.5rem;">
                                        <div class="stat-card" style="padding:1rem;">
                                            <div id="maint-repair-count" style="font-size:1.5rem; font-weight:bold; color:white;">0</div>
                                            <div style="font-size:0.8rem;">Ta'mirlashda</div>
                                        </div>
                                        <div class="stat-card" style="padding:1rem; background:linear-gradient(135deg, #f39c12, #e67e22);">
                                            <div id="maint-check-count" style="font-size:1.5rem; font-weight:bold; color:white;">0</div>
                                            <div style="font-size:0.8rem;">Rejali Tekshiruv</div>
                                        </div>
                                        <div class="stat-card" style="padding:1rem; background:linear-gradient(135deg, #2ecc71, #27ae60);">
                                            <div style="font-size:1.5rem; font-weight:bold; color:white;">98%</div>
                                            <div style="font-size:0.8rem;">Tizim Barqarorligi</div>
                                        </div>
                                    </div>
                                    
                                    <div class="maintenance-logs">
                                        <table class="maintenance-table">
                                            <thead>
                                                <tr>
                                                    <th>Ob'ekt / Qurilma</th>
                                                    <th>Muammo / Vazifa</th>
                                                    <th>Holat</th>
                                                    <th>Mas'ul</th>
                                                    <th>Sana</th>
                                                    <th style="text-align:center;">Amallar</th>
                                                </tr>
                                            </thead>
                                            <tbody id="maintenance-body">
                                                <!-- Dynamic rows -->
                                            </tbody>
                                        </table>
                                    </div>
                                `;
    setTimeout(initMaintenanceTable, 100);
    return section;
}

function initMaintenanceTable() {
    const body = document.getElementById('maintenance-body');
    if (!body) return;
    body.innerHTML = '';

    let repairCount = 0;
    let checkCount = 0;

    maintenanceLogs.forEach((log, index) => {
        if (log.status === 'repair') repairCount++;
        if (log.status === 'check') checkCount++;

        const tr = document.createElement('tr');
        tr.innerHTML = `
                                        <td><strong>${log.object}</strong></td>
                                        <td>${log.task}</td>
                                        <td><span class="status-badge ${log.status}">${getStatusLabel(log.status)}</span></td>
                                        <td>${log.person}</td>
                                        <td>${log.date}</td>
                                        <td style="text-align:center;">
                                            <button class="action-btn edit" onclick="openMaintModal(${index})" style="padding:5px 8px;"><i class="fas fa-edit"></i></button>
                                            <button class="action-btn delete" onclick="deleteMaintLog(${index})" style="padding:5px 8px;"><i class="fas fa-trash"></i></button>
                                        </td>
                                    `;
        body.appendChild(tr);
    });

    document.getElementById('maint-repair-count').textContent = repairCount;
    document.getElementById('maint-check-count').textContent = checkCount;
}

function getStatusLabel(status) {
    switch (status) {
        case 'repair': return 'Ta\'mirlash';
        case 'check': return 'Tekshiruv';
        case 'ok': return 'Bajarildi';
        default: return status;
    }
}

function openMaintModal(index = null) {
    const log = index !== null ? maintenanceLogs[index] : { object: '', task: '', status: 'repair', person: '', date: new Date().toISOString().split('T')[0] };

    const modal = document.createElement('div');
    modal.id = 'maint-modal';
    modal.style = `
                                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                                    background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center;
                                    z-index: 10000; backdrop-filter: blur(5px);
                                `;
    modal.innerHTML = `
                                    <div style="background: rgba(30, 39, 46, 0.95); width: 400px; padding: 25px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.5); color: white;">
                                        <h3>${index !== null ? 'Tahrirlash' : 'Yangi yozuv'}</h3>
                                        <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
                                            <input type="text" id="m-object" placeholder="Ob'ekt nomi" value="${log.object}" style="padding: 10px; border-radius: 5px; border: none; background: rgba(255,255,255,0.1); color: white;">
                                            <input type="text" id="m-task" placeholder="Muammo / Vazifa" value="${log.task}" style="padding: 10px; border-radius: 5px; border: none; background: rgba(255,255,255,0.1); color: white;">
                                            <select id="m-status" style="padding: 10px; border-radius: 5px; border: none; background: rgba(255,255,255,0.1); color: white;">
                                                <option value="repair" ${log.status === 'repair' ? 'selected' : ''}>Ta'mirlash</option>
                                                <option value="check" ${log.status === 'check' ? 'selected' : ''}>Tekshiruv</option>
                                                <option value="ok" ${log.status === 'ok' ? 'selected' : ''}>Bajarildi</option>
                                            </select>
                                            <input type="text" id="m-person" placeholder="Mas'ul shaxs" value="${log.person}" style="padding: 10px; border-radius: 5px; border: none; background: rgba(255,255,255,0.1); color: white;">
                                            <input type="date" id="m-date" value="${log.date}" style="padding: 10px; border-radius: 5px; border: none; background: rgba(255,255,255,0.1); color: white;">
                                            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
                                                <button class="action-btn delete" onclick="document.getElementById('maint-modal').remove()">Bekor qilish</button>
                                                <button class="action-btn check" onclick="saveMaintLog(${index})">Saqlash</button>
                                            </div>
                                        </div>
                                    </div>
                                `;
    document.body.appendChild(modal);
}

function saveMaintLog(index) {
    const object = document.getElementById('m-object').value;
    const task = document.getElementById('m-task').value;
    const status = document.getElementById('m-status').value;
    const person = document.getElementById('m-person').value;
    const date = document.getElementById('m-date').value;

    if (!object || !task) {
        alert('Iltimos, barcha maydonlarni to\'ldiring!');
        return;
    }

    const newLog = { id: Date.now(), object, task, status, person, date };

    if (index !== null) {
        maintenanceLogs[index] = newLog;
    } else {
        maintenanceLogs.push(newLog);
    }

    saveMaintenanceData();
    document.getElementById('maint-modal').remove();
    showNotification("Ma'lumot saqlandi!", "success");
}

function deleteMaintLog(index) {
    if (confirm('O\'chirmoqchimisiz?')) {
        maintenanceLogs.splice(index, 1);
        saveMaintenanceData();
        showNotification("Ma'lumot o'chirildi", "info");
    }
}

// Tizimni qayta yuklash (yangi funksiyalar uchun)
setTimeout(() => {
    if (typeof currentUser !== 'undefined' && currentUser && document.getElementById('mainSystem').style.display !== 'none') {
        console.log("New features injected");
        renderSidebar();
        renderMainContent();
    }
}, 500);

// Qor effektini ishga tushirish
function createSnowflakes() {
    const container = document.createElement('div');
    container.className = 'snow-container';
    document.body.appendChild(container);

    const snowflakeCount = 50;
    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.animationDuration = Math.random() * 3 + 2 + 's';
        snowflake.style.opacity = Math.random();
        container.appendChild(snowflake);
    }
}
createSnowflakes();

function openHistoryModal() {
    const modal = document.getElementById('history-modal');
    modal.classList.add('active');
    modal.style.display = 'flex';
    loadHistoryDates();
}

function loadHistoryDates() {
    const history = JSON.parse(localStorage.getItem('subdivisionReportsHistory')) || {};
    const list = document.getElementById('historyDateList');
    list.innerHTML = '';

    const dates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a)); // Sort desc (newest first)

    if (dates.length === 0) {
        list.innerHTML = '<div style="padding: 10px; color: #888;">Hozircha tarix mavjud emas</div>';
        return;
    }

    dates.forEach(date => {
        const count = Object.keys(history[date]).length;
        const div = document.createElement('div');
        div.className = 'history-date-item';
        div.innerHTML = `<span><i class="far fa-calendar-alt"></i> ${date}</span> <span style="background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 10px; font-size: 0.7rem;">${count}</span>`;
        div.onclick = () => loadHistoryDetails(date, div);
        list.appendChild(div);
    });
}

function loadHistoryDetails(date, element) {
    document.querySelectorAll('.history-date-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    const history = JSON.parse(localStorage.getItem('subdivisionReportsHistory')) || {};
    const data = history[date] || {};
    const container = document.getElementById('historyDetails');
    container.innerHTML = '';

    if (Object.keys(data).length === 0) {
        container.innerHTML = '<p>Ma\'lumot topilmadi</p>';
        return;
    }

    container.innerHTML = `<h3 style="margin-bottom: 20px; color: #00c6ff;">${date} sanasidagi hisobotlar</h3>`;

    for (const [bolinmaId, report] of Object.entries(data)) {
        const subName = subdivisions.find(s => s.id === bolinmaId)?.name || bolinmaId;

        const card = document.createElement('div');
        card.className = 'history-report-card';
        card.innerHTML = `
                                        <div class="history-report-header">
                                            <strong style="color: #2ecc71;">${subName}</strong>
                                            <span class="history-report-time"><i class="far fa-clock"></i> ${report.time}</span>
                                        </div>
                                        <div style="line-height: 1.5; color: rgba(255,255,255,0.9);">
                                            ${report.text}
                                        </div>
                                    `;
        container.appendChild(card);
    }
}

// ============ ROAD MANAGEMENT FUNCTIONS ============

// ============ ROAD MANAGEMENT SIDEBAR FUNCTIONS ============

function getRoadSidebarHTML(bolinmaId) {
    console.log('getRoadSidebarHTML called with:', bolinmaId);
    console.log('window.roadManagementData:', window.roadManagementData);
    console.log('window.monitoringData:', window.monitoringData);

    const roadData = window.roadManagementData[bolinmaId] || {
        switches: { "1/11": 0, "1/9": 0 },
        tracks: { main: 0, reception: 0, other: 0 }
    };

    // Ensure monitoring data exists or default random
    let monitorData = window.monitoringData[bolinmaId];
    if (!monitorData) {
        monitorData = {
            temp: Math.floor(Math.random() * (55 - 20) + 20),
            defects: 0,
            wearV: 0.0,
            wearH: 0.0
        };
        window.monitoringData[bolinmaId] = monitorData;
    }

    console.log('roadData:', roadData);
    console.log('monitorData:', monitorData);

    // Check permissions
    const canEdit = currentUser && currentUser.role === 'bolinma' && currentUser.bolinmalar && currentUser.bolinmalar.includes(bolinmaId);

    return `
        <div class="road-sidebar-header">
            <span><i class="fas fa-chart-bar"></i> Monitoring</span>
            ${canEdit ? `
                <button onclick="editRoadManagement('${bolinmaId}')" style="background:none; border:none; color:#ffd700; cursor:pointer;" title="Tahrirlash">
                    <i class="fas fa-edit"></i>
                </button>
            ` : ''}
        </div>
        
        <!-- Smart Monitoring Card -->
        <div class="road-mini-card">
            <h5><i class="fas fa-thermometer-half"></i> Holat Monitoringi</h5>
            <div class="mini-stat-row">
                <span class="mini-stat-label">Rels Harorati:</span>
                <span class="mini-stat-value" style="color: ${monitorData.temp > 50 ? '#e74c3c' : (monitorData.temp > 40 ? '#f1c40f' : '#2ecc71')}">
                    +${monitorData.temp}°C
                </span>
            </div>
            <div class="mini-stat-row">
                <span class="mini-stat-label">Nuqsonlar:</span>
                <span class="mini-stat-value" style="color: ${monitorData.defects > 0 ? '#e74c3c' : '#2ecc71'}">
                    ${monitorData.defects} ta
                </span>
            </div>
        </div>

        <!-- Strelkalar Mini Card -->
        <div class="road-mini-card">
            <h5><i class="fas fa-code-branch"></i> Strelkalar</h5>
            <div class="mini-stat-row">
                <span class="mini-stat-label">1/11 marka:</span>
                <span class="mini-stat-value highlight">${(roadData.switches && roadData.switches["1/11"]) || 0}</span>
            </div>
            <div class="mini-stat-row">
                <span class="mini-stat-label">1/9 marka:</span>
                <span class="mini-stat-value highlight">${(roadData.switches && roadData.switches["1/9"]) || 0}</span>
            </div>
            <div class="mini-stat-row" style="border-top:1px solid rgba(255,255,255,0.1); margin-top:5px; padding-top:5px;">
                <span class="mini-stat-label">Jami:</span>
                <span class="mini-stat-value">${((roadData.switches && roadData.switches["1/11"]) || 0) + ((roadData.switches && roadData.switches["1/9"]) || 0)}</span>
            </div>
        </div>
        
        <!-- Yo'llar Mini Card -->
        <div class="road-mini-card">
            <h5><i class="fas fa-ruler"></i> Yo'llar Uzunligi (km)</h5>
            <div class="mini-stat-row">
                <span class="mini-stat-label">Asosiy:</span>
                <span class="mini-stat-value highlight">${(roadData.tracks && roadData.tracks.main) || 0}</span>
            </div>
            <div class="mini-stat-row">
                <span class="mini-stat-label">Qabul:</span>
                <span class="mini-stat-value highlight">${(roadData.tracks && roadData.tracks.reception) || 0}</span>
            </div>
            <div class="mini-stat-row">
                <span class="mini-stat-label">Boshqa:</span>
                <span class="mini-stat-value highlight">${(roadData.tracks && roadData.tracks.other) || 0}</span>
            </div>
        </div>
    `;
}

function editRoadManagement(bolinmaId) {
    const roadData = window.roadManagementData[bolinmaId] || {
        switches: { "1/11": 0, "1/9": 0 },
        tracks: { main: 0, reception: 0, other: 0 }
    };

    let monitorData = window.monitoringData[bolinmaId] || {
        temp: 25, defects: 0, wearV: 0, wearH: 0
    };

    let modal = document.getElementById('road-edit-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'road-edit-modal';
    modal.className = 'road-modal active';
    modal.style.maxHeight = '90vh';
    modal.style.overflowY = 'auto'; // Ensure it doesn't clip on small screens

    modal.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h3 style="color:#ffd700; margin:0;"><i class="fas fa-pen"></i> Tahrirlash</h3>
            <button onclick="document.getElementById('road-edit-modal').remove()" style="background:none; border:none; color:white; font-size:1.2rem; cursor:pointer;">&times;</button>
        </div>
        
        <!-- Monitoring Inputs -->
        <h4 style="color:#2ecc71; font-size:0.95rem; margin-bottom:10px; border-bottom:1px solid rgba(46,204,113,0.3); padding-bottom:5px;">Holat Monitoringi</h4>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:15px;">
             <div>
                <label class="road-form-label">Harorat (°C)</label>
                <input type="number" id="input-temp" class="road-input" value="${monitorData.temp}">
             </div>
             <div>
                <label class="road-form-label">Nuqsonlar (soni)</label>
                <input type="number" id="input-defects" class="road-input" value="${monitorData.defects}">
             </div>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:15px;">
             <div>
                <label class="road-form-label">Yeyilish V (mm)</label>
                <input type="number" step="0.1" id="input-wear-v" class="road-input" value="${monitorData.wearV}">
             </div>
             <div>
                <label class="road-form-label">Yeyilish G (mm)</label>
                <input type="number" step="0.1" id="input-wear-h" class="road-input" value="${monitorData.wearH}">
             </div>
        </div>

        <!-- Road Inputs -->
        <h4 style="color:#00f2ff; font-size:0.95rem; margin-bottom:10px; border-bottom:1px solid rgba(0,242,255,0.3); padding-bottom:5px;">Infratuzilma</h4>
        
        <label class="road-form-label" style="font-size:0.85rem; color:#aaa;">Strelkalar Soni:</label>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:15px;">
             <div>
                <label class="road-form-label">1/11 marka</label>
                <input type="number" id="input-sw-11" class="road-input" value="${roadData.switches["1/11"]}">
             </div>
             <div>
                <label class="road-form-label">1/9 marka</label>
                <input type="number" id="input-sw-9" class="road-input" value="${roadData.switches["1/9"]}">
             </div>
        </div>
        
        <label class="road-form-label" style="font-size:0.85rem; color:#aaa;">Yo'llar Uzunligi (km):</label>
        <div style="margin-bottom: 10px;">
            <label class="road-form-label">1 - Asosiy yo'l</label>
            <input type="number" step="0.01" id="input-track-1" class="road-input" value="${roadData.tracks.main}">
        </div>
        <div style="margin-bottom: 10px;">
            <label class="road-form-label">3 - Qabul qilish yo'li</label>
            <input type="number" step="0.01" id="input-track-3" class="road-input" value="${roadData.tracks.reception}">
        </div>
        <div style="margin-bottom: 10px;">
            <label class="road-form-label">100 - Boshqa yo'llar</label>
            <input type="number" step="0.01" id="input-track-100" class="road-input" value="${roadData.tracks.other}">
        </div>
        
        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
            <button onclick="document.getElementById('road-edit-modal').remove()" class="control-btn" style="padding:6px 12px; font-size:0.9rem;">Bekor qilish</button>
            <button onclick="saveRoadManagement('${bolinmaId}')" class="control-btn green" style="padding:6px 12px; font-size:0.9rem;">Saqlash</button>
        </div>
    `;

    document.body.appendChild(modal);
}

function saveRoadManagement(bolinmaId) {
    // Road Inputs
    const sw11 = document.getElementById('input-sw-11').value;
    const sw9 = document.getElementById('input-sw-9').value;
    const t1 = document.getElementById('input-track-1').value;
    const t3 = document.getElementById('input-track-3').value;
    const t100 = document.getElementById('input-track-100').value;

    // Monitor Inputs
    const temp = document.getElementById('input-temp').value;
    const defects = document.getElementById('input-defects').value;
    const wearV = document.getElementById('input-wear-v').value;
    const wearH = document.getElementById('input-wear-h').value;

    if (sw11 === '' || t1 === '' || temp === '') { // Basic validation
        alert("Iltimos, asosiy maydonlarni to'ldiring!");
        return;
    }

    // Save Road Data
    window.roadManagementData[bolinmaId] = {
        switches: {
            "1/11": parseInt(sw11) || 0,
            "1/9": parseInt(sw9) || 0
        },
        tracks: {
            main: parseFloat(t1) || 0,
            reception: parseFloat(t3) || 0,
            other: parseFloat(t100) || 0
        }
    };

    // Save Monitor Data
    window.monitoringData[bolinmaId] = {
        temp: parseInt(temp) || 0,
        defects: parseInt(defects) || 0,
        wearV: parseFloat(wearV) || 0,
        wearH: parseFloat(wearH) || 0
    };

    // Commit to LocalStorage
    localStorage.setItem('roadManagementData', JSON.stringify(window.roadManagementData));
    localStorage.setItem('monitoringData', JSON.stringify(window.monitoringData));

    // Close modal
    document.getElementById('road-edit-modal').remove();

    // Update View (Re-render Sidebar)
    const activeWindow = document.getElementById(bolinmaId + '-window');
    if (activeWindow) {
        const sidebar = activeWindow.querySelector('.road-management-sidebar');
        if (sidebar) sidebar.innerHTML = getRoadSidebarHTML(bolinmaId);
    }

    // Update Homepage Monitoring Cards if visible
    if (typeof renderHomepageMonitoring === 'function') {
        renderHomepageMonitoring();
    }

    alert("Barcha ma'lumotlar saqlandi!");
}


// Override existing createExcelTable for better UI
function createExcelTable(data) {
    const container = document.getElementById('excelEditor');
    container.innerHTML = '';

    const excelContainer = document.createElement('div');
    excelContainer.className = 'excel-container';

    const table = document.createElement('table');
    table.className = 'sheets-table';

    // Determine dimensions
    const MAX_COLS = 26; // A-Z
    const MAX_ROWS = 50;

    // Process Data to ensure it's a grid
    let gridData = {};
    if (data && Array.isArray(data)) {
        data.forEach((row, r) => {
            if (Array.isArray(row)) {
                row.forEach((cell, c) => {
                    if (!gridData[r]) gridData[r] = {};
                    gridData[r][c] = cell;
                });
            }
        });
    }

    // 1. Header Row (A, B, C...)
    const headerRow = document.createElement('tr');
    // Corner cell
    const corner = document.createElement('th');
    corner.className = 'corner-header row-header';
    headerRow.appendChild(corner);

    for (let c = 0; c < MAX_COLS; c++) {
        const th = document.createElement('th');
        th.textContent = String.fromCharCode(65 + c);
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    // 2. Data Rows
    for (let r = 0; r < MAX_ROWS; r++) {
        const tr = document.createElement('tr');

        // Row Header (1, 2, 3...)
        const rowHead = document.createElement('th');
        rowHead.className = 'row-header';
        rowHead.textContent = r + 1;
        tr.appendChild(rowHead);

        for (let c = 0; c < MAX_COLS; c++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.dataset.row = r;
            input.dataset.col = c;

            // Fill data if exists
            if (gridData[r] && gridData[r][c] !== undefined) {
                input.value = gridData[r][c];
            }

            // Events for Sheets-like experience
            input.addEventListener('focus', function () {
                highlightHeaders(r, c);
                td.classList.add('active-cell');

                // Update Formula Bar
                const address = String.fromCharCode(65 + c) + (r + 1);
                const addrEl = document.getElementById('active-cell-address');
                const formulaEl = document.getElementById('formula-input');
                if (addrEl) addrEl.textContent = address;
                if (formulaEl) {
                    formulaEl.value = input.value;
                    // Sync formula bar to input
                    formulaEl.oninput = () => { input.value = formulaEl.value; };
                }
            });

            input.addEventListener('blur', function () {
                clearHighlights();
                td.classList.remove('active-cell');
            });

            input.addEventListener('keydown', function (e) {
                handleExcelKeydown(e, r, c);
            });

            td.appendChild(input);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    excelContainer.appendChild(table);
    container.appendChild(excelContainer);

    // Helper functions
    function highlightHeaders(r, c) {
        clearHighlights();
        // +1 for column headers because of the corner cell
        // +1 for row headers because of the initial header row (A,B,C...)
        const colHeaders = table.querySelectorAll('th:not(.row-header)'); // Selects A, B, C... headers
        const rowHeaders = table.querySelectorAll('.row-header:not(.corner-header)'); // Selects 1, 2, 3... headers

        if (colHeaders[c]) colHeaders[c].classList.add('header-active');
        if (rowHeaders[r]) rowHeaders[r].classList.add('header-active');
    }

    function clearHighlights() {
        table.querySelectorAll('.header-active').forEach(h => h.classList.remove('header-active'));
    }

    function handleExcelKeydown(e, r, c) {
        let nextRow = r;
        let nextCol = c;
        let handled = true;

        switch (e.key) {
            case 'ArrowUp': nextRow = Math.max(0, r - 1); break;
            case 'ArrowDown': nextRow = Math.min(MAX_ROWS - 1, r + 1); break;
            case 'ArrowLeft':
                if (e.target.selectionStart === 0) nextCol = Math.max(0, c - 1);
                else handled = false;
                break;
            case 'ArrowRight':
                if (e.target.selectionEnd === e.target.value.length) nextCol = Math.min(MAX_COLS - 1, c + 1);
                else handled = false;
                break;
            case 'Enter': nextRow = Math.min(MAX_ROWS - 1, r + 1); break;
            case 'Tab':
                e.preventDefault();
                if (e.shiftKey) { // Shift + Tab moves left
                    nextCol = Math.max(0, c - 1);
                    if (nextCol === c && r > 0) { // If at first column, move up to previous row's last column
                        nextRow = r - 1;
                        nextCol = MAX_COLS - 1;
                    }
                } else { // Tab moves right
                    nextCol = Math.min(MAX_COLS - 1, c + 1);
                    if (nextCol === c && r < MAX_ROWS - 1) { // If at last column, move down to next row's first column
                        nextRow = r + 1;
                        nextCol = 0;
                    }
                }
                break;
            default: handled = false;
        }

        if (handled && (nextRow !== r || nextCol !== c)) {
            const nextInput = table.querySelector(`input[data-row="${nextRow}"][data-col="${nextCol}"]`);
            if (nextInput) {
                nextInput.focus();
                if (e.key === 'Enter' || e.key === 'Tab') nextInput.select();
            }
        }
    }
}


// Excel Ribbon Actions
window.formatExcelCell = function (style) {
    const activeInput = document.activeElement;
    if (activeInput && activeInput.tagName === 'INPUT' && activeInput.closest('.sheets-table')) {
        if (style === 'bold') activeInput.style.fontWeight = activeInput.style.fontWeight === 'bold' ? 'normal' : 'bold';
        if (style === 'italic') activeInput.style.fontStyle = activeInput.style.fontStyle === 'italic' ? 'normal' : 'italic';
    }
};

// Re-bind save functionality to use the new structure
// ... saveExcelFile is already defined above, but we need to ensure it selects the right inputs

// We need to overwrite saveExcelFile to handle the new DOM structure (headers vs inputs)
window.saveExcelFile = function () {
    if (!currentEditingFile) return;

    try {
        const table = document.querySelector('.sheets-table');
        if (!table) return;

        const data = [];
        const rows = table.querySelectorAll('tr'); // Includes header row

        // Skip first row (header A, B, C)
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const rowData = [];
            const inputs = row.querySelectorAll('input');
            let hasData = false;

            inputs.forEach(input => {
                rowData.push(input.value);
                if (input.value.trim() !== '') hasData = true;
            });

            // Only push rows that have data (optimized) or keep all to preserve structure?
            // Keeping structure is safer for Excel
            data.push(rowData);
        }

        // Remove trailing empty rows to be clean
        while (data.length > 0 && data[data.length - 1].every(c => c === '')) {
            data.pop();
        }

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(data);

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        currentEditingFile.content = excelBuffer;
        currentEditingFile.status = 'approved';
        saveDatabase();

        alert('Excel fayl muvaffaqiyatli saqlandi!');
        document.getElementById('excel-editor-window').classList.remove('active');
        document.getElementById('department-overlay').classList.remove('active');

        updateAllDepartmentWindows();
    } catch (e) {
        console.error(e);
        alert('Excel faylni saqlashda xatolik: ' + e.message);
    }
};

window.openExcelEditor = function (file) {
    console.log("Opening Excel:", file.name);
    window.currentEditingFile = file;
    document.getElementById('excel-editor-window').classList.add('active');
    document.getElementById('department-overlay').classList.add('active');

    let data = file.content;

    // FIX: Restore Uint8Array from JSON object {0:x, 1:y...}
    if (data && typeof data === 'object' && !Array.isArray(data) && !(data instanceof Uint8Array)) {
        console.log("Restoring Uint8Array from JSON object...");
        const values = Object.values(data);
        data = new Uint8Array(values);
    }

    try {
        // Try reading
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Get data
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        createExcelTable(jsonData);
    } catch (e) {
        console.error("Excel Open Error:", e);
        alert("Faylni o'qishda xatolik bo'ldi. Fayl buzilgan bo'lishi mumkin.");
    }
};

// Function to initialize Smart System components
function initSmartSystem() {
    setTimeout(function () {
        const btn = document.getElementById('openDispatcherIntegrationBtn');
        const win = document.getElementById('dispatcher-integration-window');
        const closeBtn = document.getElementById('closeDispatcherIntegrationBtn');

        if (btn && win && closeBtn) {
            btn.addEventListener('click', function () {
                win.classList.add('active');
                win.style.display = 'flex';
            });

            closeBtn.addEventListener('click', function () {
                win.classList.remove('active');
                setTimeout(() => { if (!win.classList.contains('active')) win.style.display = 'none'; }, 300);
            });

            const tabs = win.querySelectorAll('.integration-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', function () {
                    tabs.forEach(t => t.classList.remove('active'));
                    win.querySelectorAll('.integration-frame').forEach(f => {
                        f.style.display = 'none';
                        f.classList.remove('active');
                    });

                    this.classList.add('active');
                    const tabId = this.getAttribute('data-tab');
                    const frame = document.getElementById(tabId);
                    if (frame) {
                        frame.style.display = 'block';
                        frame.classList.add('active');
                    }
                });
            });

        }

        // Video Chat Logic
        const videoBtn = document.getElementById('openVideoChatBtn');
        const videoWin = document.getElementById('video-chat-window');
        const closeVideoBtn = document.getElementById('closeVideoChatBtn');
        let jitsiApi = null;

        if (videoBtn && videoWin && closeVideoBtn) {
            videoBtn.addEventListener('click', function () {
                videoWin.classList.add('active');
                videoWin.style.display = 'flex';

                // Initialize Jitsi Meet
                if (!jitsiApi) {
                    const domain = 'meet.jit.si';
                    const roomName = 'SmartPCH-Conference-Room-Main';

                    // Set room name safely
                    const roomNameEl = document.getElementById('meet-room-name');
                    if (roomNameEl) roomNameEl.textContent = 'Xona: ' + roomName;

                    const options = {
                        roomName: roomName,
                        width: '100%',
                        height: '100%',
                        parentNode: document.getElementById('meet-container'),
                        // Check for currentUser existence
                        userInfo: {
                            displayName: (typeof currentUser !== 'undefined' && currentUser) ? currentUser.name : 'Foydalanuvchi'
                        },
                        configOverwrite: {
                            startWithAudioMuted: true,
                            startWithVideoMuted: true,
                            prejoinPageEnabled: false
                        },
                        interfaceConfigOverwrite: {
                            TOOLBAR_BUTTONS: [
                                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                                'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                                'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                                'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                                'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                                'security'
                            ]
                        },
                        onload: function () {
                            // console.log('Video chat loaded');
                        }
                    };

                    // Load Jitsi Script dynamically if not present
                    if (!window.JitsiMeetExternalAPI) {
                        const script = document.createElement('script');
                        script.src = 'https://meet.jit.si/external_api.js';
                        script.onload = () => {
                            jitsiApi = new JitsiMeetExternalAPI(domain, options);
                        };
                        document.head.appendChild(script);
                    } else {
                        jitsiApi = new JitsiMeetExternalAPI(domain, options);
                    }
                }
            });

            const closeVideo = function () {
                videoWin.classList.remove('active');
                setTimeout(() => {
                    if (!videoWin.classList.contains('active')) {
                        videoWin.style.display = 'none';
                        if (jitsiApi) {
                            jitsiApi.dispose();
                            jitsiApi = null;
                            document.getElementById('meet-container').innerHTML = '';
                        }
                    }
                }, 300);
            };

            closeVideoBtn.addEventListener('click', closeVideo);
        }
    }, 1000);
}

// Global DOM Initialization
document.addEventListener('DOMContentLoaded', function () {
    // Nav Clock Update
    setInterval(() => {
        const clockEl = document.getElementById('nav-clock-time');
        if (clockEl) {
            const now = new Date();
            clockEl.textContent = now.toLocaleTimeString('uz-UZ', { hour12: false });
        }
    }, 1000);

    initSmartSystem();
});


function openHistoryModal() {
    const modal = document.getElementById('history-modal');
    modal.classList.add('active');
    modal.style.display = 'flex';
    loadHistoryDates();
}

function loadHistoryDates() {
    const history = JSON.parse(localStorage.getItem('subdivisionReportsHistory')) || {};
    const list = document.getElementById('historyDateList');
    list.innerHTML = '';

    const dates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a)); // Sort desc (newest first)

    if (dates.length === 0) {
        list.innerHTML = '<div style="padding: 10px; color: #888;">Hozircha tarix mavjud emas</div>';
        return;
    }

    dates.forEach(date => {
        const count = Object.keys(history[date]).length;
        const div = document.createElement('div');
        div.className = 'history-date-item';
        div.innerHTML = `<span><i class="far fa-calendar-alt"></i> ${date}</span> <span style="background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 10px; font-size: 0.7rem;">${count}</span>`;
        div.onclick = () => loadHistoryDetails(date, div);
        list.appendChild(div);
    });
}

function loadHistoryDetails(date, element) {
    document.querySelectorAll('.history-date-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    const history = JSON.parse(localStorage.getItem('subdivisionReportsHistory')) || {};
    const data = history[date] || {};
    const container = document.getElementById('historyDetails');
    container.innerHTML = '';

    if (Object.keys(data).length === 0) {
        container.innerHTML = '<p>Ma\'lumot topilmadi</p>';
        return;
    }

    container.innerHTML = `<h3 style="margin-bottom: 20px; color: #00c6ff;">${date} sanasidagi hisobotlar</h3>`;

    for (const [bolinmaId, report] of Object.entries(data)) {
        // Find subdivision name securely
        let subName = bolinmaId;
        const sub = subdivisions.find(s => s.id === bolinmaId);
        if (sub) subName = sub.name;

        const card = document.createElement('div');
        card.className = 'history-report-card';
        card.innerHTML = `
                    <div class="history-report-header">
                        <strong style="color: #2ecc71;">${subName}</strong>
                        <span class="history-report-time"><i class="far fa-clock"></i> ${report.time}</span>
                    </div>
                    <div style="line-height: 1.5; color: rgba(255,255,255,0.9);">
                        ${report.text}
                    </div>
                `;
        container.appendChild(card);
    }
}

// Sidebar Accordion Logic
document.addEventListener('DOMContentLoaded', function () {
    const sidebarHeader = document.getElementById('sidebarHeader');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const toggleIcon = document.getElementById('sidebarToggleIcon');

    if (sidebarHeader && sidebarMenu) {
        sidebarHeader.addEventListener('click', function () {
            // Toggle 'collapsed' on the parent SIDEBAR element
            const sidebar = sidebarHeader.parentElement;
            sidebar.classList.toggle('collapsed');

            // Also toggle menu class for animation
            sidebarMenu.classList.toggle('collapsed');


            if (toggleIcon) {
                toggleIcon.classList.toggle('rotate-icon');
            }
        });
    }
});

// --- SAFETY SECTION FUNCTIONS (Mehnat Muhofazasi) ---
// Old render function removed


// --- MECHANICS SECTION FUNCTIONS (Mexanika Bo'limi) ---
function renderMexanikaSection(windowElement, bolinmaId) {
    // Call the mechanics section renderer
    if (typeof renderMechanicsSection === 'function') {
        renderMechanicsSection(windowElement, bolinmaId);
    } else {
        console.error('renderMechanicsSection function not found');
    }
}


// --- TRAIN SCHEDULE & RADAR LOGIC ---

// Store for Train Schedules: key = 'train_schedule_bolinmaId'
window.getTrainSchedule = function (bolinmaId) {
    const key = `train_schedule_${bolinmaId}`;
    return JSON.parse(localStorage.getItem(key)) || [];
}

window.openTrainScheduleModal = function (bolinmaId, event) {
    if (event) event.stopPropagation();

    // Remove existing modal if any
    const existing = document.getElementById('train-schedule-modal');
    if (existing) existing.remove();

    const trains = getTrainSchedule(bolinmaId);

    // Create Modal HTML
    const modal = document.createElement('div');
    modal.id = 'train-schedule-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); backdrop-filter: blur(10px);
        display: flex; align-items: center; justify-content: center; z-index: 10000;
    `;

    modal.innerHTML = `
        <div style="background: #1e293b; width: 600px; max-width: 90%; border-radius: 20px; border: 1px solid rgba(0, 198, 255, 0.3); overflow: hidden; box-shadow: 0 0 50px rgba(0, 198, 255, 0.2);">
            <div style="padding: 20px; background: linear-gradient(90deg, rgba(0, 198, 255, 0.1), transparent); border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: white;"><i class="fas fa-train"></i> Poyezdlar Jadvali (${bolinmaId})</h3>
                <button onclick="document.getElementById('train-schedule-modal').remove()" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            
            <div style="padding: 20px; max-height: 70vh; overflow-y: auto;">
                
                <!-- Add New Train Form -->
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 15px 0; color: #00c6ff;">Yangi poyezd qo'shish</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <input type="text" id="train-name" placeholder="Poyezd Nomi (Masalan: Afrosiyob 760)" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 10px; color: white; border-radius: 8px;">
                        <input type="text" id="train-route" placeholder="Yo'nalish (Toshkent - Buxoro)" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 10px; color: white; border-radius: 8px;">
                        <input type="time" id="train-time" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 10px; color: white; border-radius: 8px;">
                        <select id="train-status" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 10px; color: white; border-radius: 8px;">
                            <option value="ontime">O'z vaqtida</option>
                            <option value="delayed">Kechikmoqda</option>
                            <option value="arrived">Yetib keldi</option>
                        </select>
                        <input type="number" id="train-pk" placeholder="Hozirgi PK (Radar uchun)" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 10px; color: white; border-radius: 8px;">
                    </div>
                    <button onclick="saveTrainToSchedule('${bolinmaId}')" style="margin-top: 15px; width: 100%; padding: 12px; background: linear-gradient(45deg, #00c6ff, #0072ff); border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer;">
                        <i class="fas fa-plus"></i> Jadvalga qo'shish
                    </button>
                </div>

                <!-- Existing List -->
                <h4 style="color: rgba(255,255,255,0.7); margin-bottom: 15px;">Joriy Jadval</h4>
                <div id="train-list-container">
                    ${trains.length === 0 ? '<div style="text-align:center; color:rgba(255,255,255,0.3);">Poyezdlar yo\'q</div>' : ''}
                    ${trains.map((t, index) => `
                        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); padding: 15px; border-radius: 10px; margin-bottom: 10px; border-left: 4px solid ${t.status === 'delayed' ? '#e74c3c' : '#2ecc71'};">
                            <div>
                                <div style="font-weight: bold; color: white;">${t.name}</div>
                                <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5);">${t.route} | PK: ${t.pk}</div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="font-size: 1.2rem; white-space: nowrap; color: #ffd700; font-family: monospace;">${t.time}</div>
                                <button onclick="deleteTrainFromSchedule('${bolinmaId}', ${index})" style="background: none; border: none; color: #e74c3c; cursor: pointer;"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

window.saveTrainToSchedule = function (bolinmaId) {
    const name = document.getElementById('train-name').value;
    const route = document.getElementById('train-route').value;
    const time = document.getElementById('train-time').value;
    const status = document.getElementById('train-status').value;
    const pk = document.getElementById('train-pk').value;

    if (!name || !time) {
        alert("Iltimos, poyezd nomi va vaqtini kiriting!");
        return;
    }

    const trains = getTrainSchedule(bolinmaId);
    trains.push({ name, route, time, status, pk: pk || 0 });

    const key = `train_schedule_${bolinmaId}`;
    localStorage.setItem(key, JSON.stringify(trains));

    // Refresh modal
    document.getElementById('train-schedule-modal').remove();
    openTrainScheduleModal(bolinmaId);

    alert("Poyezd qo'shildi!");
}

window.deleteTrainFromSchedule = function (bolinmaId, index) {
    const trains = getTrainSchedule(bolinmaId);
    trains.splice(index, 1);
    const key = `train_schedule_${bolinmaId}`;
    localStorage.setItem(key, JSON.stringify(trains));

    // Refresh modal
    document.getElementById('train-schedule-modal').remove();
    openTrainScheduleModal(bolinmaId);
}

// Function to render the Radar in Subdivision Dashboard
window.renderTrainRadarWidget = function (bolinmaId) {
    const trains = getTrainSchedule(bolinmaId);
    const range = getPKRange(); // Current user's PK range

    // Safety check for container
    const container = document.getElementById('trainRadarContainer');
    if (!container) return;

    // Filter trains that are loosely relevant? For now show all, or filter by PK range logic if we were complex.
    // We will show all assigned trains in the Table, and trains within range on the Radar.

    let radarHTML = `
        <div style="position: relative; width: 100%; height: 120px; background: rgba(0,0,0,0.3); border-radius: 15px; margin-bottom: 20px; overflow: hidden; display: flex; align-items: center;">
            <div style="position: absolute; width: 100%; height: 1px; background: rgba(255,255,255,0.2); top: 50%;"></div>
            
            <!-- PK Markers -->
            <div style="position: absolute; bottom: 10px; left: 10px; color: rgba(255,255,255,0.3); font-size: 0.7rem;">PK ${range.start}</div>
            <div style="position: absolute; bottom: 10px; right: 10px; color: rgba(255,255,255,0.3); font-size: 0.7rem;">PK ${range.end}</div>
            
            <!-- Dynamic Train Icons -->
            ${trains.map(t => {
        // Calculate position percentage
        // Assume safe range 140-160 etc.
        const totalDist = range.end - range.start;
        let percent = ((t.pk - range.start) / totalDist) * 100;

        // Clamp for visuals
        if (percent < 0) percent = -5; // Just off screen left
        if (percent > 100) percent = 105; // Just off screen right

        const isVisible = percent >= 0 && percent <= 100;
        const color = t.status === 'delayed' ? '#e74c3c' : '#00f2ff';

        return `
                    <div class="train-radar-icon" style="position: absolute; left: ${percent}%; top: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; transition: left 1s ease;">
                        <div style="background: ${color}; padding: 5px; border-radius: 5px; box-shadow: 0 0 15px ${color}; color: black;">
                            <i class="fas fa-subway"></i>
                        </div>
                        <div style="font-size: 0.6rem; color: ${color}; margin-top: 5px; white-space: nowrap; background: rgba(0,0,0,0.8); padding: 2px 5px; border-radius: 4px;">${t.name} (PK ${t.pk})</div>
                    </div>
                `;
    }).join('')}
        </div>
        
        <!-- Digital Board -->
        <div class="digital-station-board">
            <h4 style="color: #00f2ff; margin-bottom: 10px; border-bottom: 1px solid rgba(0, 242, 255, 0.2); padding-bottom: 5px;">JADVAL (Online)</h4>
            <div style="display: grid; gap: 10px; max-height: 200px; overflow-y: auto;">
                ${trains.map(t => `
                     <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; border-left: 2px solid ${t.status === 'delayed' ? '#e74c3c' : '#2ecc71'}">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-train" style="color: rgba(255,255,255,0.5);"></i>
                            <div>
                                <div style="font-weight: bold; color: white; font-size: 0.9rem;">${t.name}</div>
                                <div style="font-size: 0.75rem; color: rgba(255,255,255,0.4);">${t.route}</div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                             <div style="font-family: monospace; font-size: 1.1rem; color: #ffd700;">${t.time}</div>
                             <div style="font-size: 0.7rem; color: ${t.status === 'delayed' ? '#e74c3c' : '#2ecc71'};">${t.status === 'delayed' ? 'KECHIKMOQDA' : 'O\'Z VAQTIDA'}</div>
                        </div>
                     </div>
                `).join('')}
                ${trains.length === 0 ? '<div style="padding:10px; color:rgba(255,255,255,0.3); font-style:italic;">Bugungi reyslar yo\'q</div>' : ''}
            </div>
        </div>
    `;

    container.innerHTML = radarHTML;
}

window.initTrainRadar = function () {
    // Current user departments is array
    if (currentUser.bolinmalar && currentUser.bolinmalar.length > 0) {
        renderTrainRadarWidget(currentUser.bolinmalar[0]);
    } else if (currentUser.departments && currentUser.departments.length > 0) {
        // If department array is used like 'bolinma1'
        renderTrainRadarWidget(currentUser.departments.find(d => d.startsWith('bolinma')));
    }
}

// Ensure initSubdivisionFeatures is available globally
window.initSubdivisionFeatures = function () {
    console.log("Initializing Subdivision Features...");
    if (typeof initKanban === 'function') initKanban();
    if (typeof initTrainRadar === 'function') initTrainRadar();

    // Explicitly call these if they haven't run or need refresh
    if (typeof loadWeatherData === 'function') loadWeatherData();
    if (typeof loadNews === 'function') loadNews();
    if (typeof createCompetitionChart === 'function') createCompetitionChart();

    // Also init map interactions if needed
    if (typeof renderMapDefects === 'function') renderMapDefects();
};

// --- EDITOR EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', function () {
    // Text Editor Save Button
    const saveTextBtn = document.getElementById('saveTextFileBtn');
    if (saveTextBtn) {
        saveTextBtn.addEventListener('click', saveTextFile);
    }

    // Text Editor Close Buttons
    const closeTextBtn = document.getElementById('closeTextEditorBtn');
    const cancelTextBtn = document.getElementById('cancelTextEditBtn');

    function closeTextEditor() {
        const win = document.getElementById('text-editor-window');
        if (win) {
            win.classList.remove('active');
            win.style.display = 'none';
        }

        // Remove overlay only if no other windows active
        const activeWindows = document.querySelectorAll('.department-window.active');
        if (activeWindows.length === 0) {
            document.getElementById('department-overlay').classList.remove('active');
        }
    }

    if (closeTextBtn) closeTextBtn.addEventListener('click', closeTextEditor);
    if (cancelTextBtn) cancelTextBtn.addEventListener('click', closeTextEditor);
});

// ============ DEPARTMENT SECTION RENDERERS ============

// C) Iqtisod Section (Economy - PU-74)
function renderEconomySection(windowElement, bolinmaId) {
    // 1. Clear specific container if exists
    const existingView = windowElement.querySelector('#economy-journals-view');
    if (existingView) existingView.remove();

    // 2. Create View Container
    const view = document.createElement('div');
    view.id = 'economy-journals-view';
    view.className = 'department-section-view';
    view.style.padding = '20px';
    view.style.marginTop = '20px';
    view.style.background = 'rgba(255,255,255,0.05)';
    view.style.borderRadius = '15px';

    view.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #00c6ff;"><i class="fas fa-chart-line"></i> Iqtisodiy Ko'rsatkichlar</h3>
            <button class="control-btn pu74-main-btn" onclick="openPU74Window('${bolinmaId}')" 
                style="background: linear-gradient(135deg, #00c6ff, #0072ff); padding: 10px 20px; font-size: 1rem; border: none; border-radius: 8px; color: white; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(0, 198, 255, 0.3);">
                <i class="fas fa-clipboard-list"></i> 
                PU-74 Jurnalini Ochish
            </button>
        </div>
        
        <!-- Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="font-size: 0.9rem; color: #aaa;">Oylik Reja</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: white; margin-top: 5px;">100%</div>
                <div style="font-size: 0.8rem; color: #2ecc71;"><i class="fas fa-arrow-up"></i> Bajarildi</div>
            </div>
             <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="font-size: 0.9rem; color: #aaa;">Ishlatilgan Mablag'</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: white; margin-top: 5px;">45 mln</div>
                <div style="font-size: 0.8rem; color: #f1c40f;">So'm</div>
            </div>
        </div>

        <div class="economy-info-box" style="padding: 15px; background: rgba(0, 198, 255, 0.05); border-left: 3px solid #00c6ff; border-radius: 5px;">
            <p style="margin: 0; color: rgba(255,255,255,0.8);"><i class="fas fa-info-circle"></i> PU-74 elektron jurnali orqali kunlik ishlarni kiriting va dispetcher topshiriqlari bilan solishtiring.</p>
        </div>
    `;

    let body = windowElement.querySelector('.department-body') || windowElement.querySelector('.window-content') || windowElement;

    // Insert before file list if possible, or append
    const fileList = body.querySelector('.files-area-wrapper') || body.querySelector('.file-management');
    if (fileList) {
        body.insertBefore(view, fileList);
    } else {
        body.appendChild(view);
    }
}


// B) Ishlab Chiqarish Section (Production) - Already defined above at line 4113


// D) Dispatcher Section - Stub
function renderSubdivisionReportSection(windowElement, bolinmaId) {
    console.log('Rendering Dispatcher Report Section for', bolinmaId);
    const existingView = windowElement.querySelector('#dispatcher-assignment-view');
    if (existingView) existingView.remove();

    const view = document.createElement('div');
    view.id = 'dispatcher-assignment-view';
    view.className = 'department-section-view';
    view.innerHTML = `<div style="padding:20px; background:rgba(255,255,255,0.05);"><h3>Dispetcher Topshiriqlari</h3><p>Topshiriqlar ro'yxati...</p></div>`;

    let body = windowElement.querySelector('.department-body') || windowElement.querySelector('.window-content') || windowElement;
    const fileList = body.querySelector('.files-area-wrapper') || body.querySelector('.file-management');
    if (fileList) body.insertBefore(view, fileList);
    else body.appendChild(view);
}

// E) Metrology Section - Stub
function renderMetrologySection(windowElement, bolinmaId) {
    console.log('Rendering Metrology Section for', bolinmaId);
}

// F) Mechanics Section - Dashboard
function renderMechanicsSection(windowElement, bolinmaId) {
    console.log('Rendering Mechanics Dashboard for', bolinmaId);

    const existingView = windowElement.querySelector('#mechanics-section-view');
    if (existingView) existingView.remove();

    // Get Data from Global Store
    const data = window.waybillData || { vehicles: [], orders: [] };

    // Calculate Stats
    const totalVehicles = data.vehicles.length;
    const activeVehicles = data.vehicles.filter(v => v.status === 'busy').length;
    const repairVehicles = data.vehicles.filter(v => v.status === 'repair').length;
    const freeVehicles = data.vehicles.filter(v => v.status === 'free').length;

    const view = document.createElement('div');
    view.id = 'mechanics-section-view';
    view.className = 'department-section-view';
    view.innerHTML = `
        <div style="padding: 25px; background: rgba(0,0,0,0.2); border-radius: 15px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: white; display: flex; align-items: center; gap: 12px; font-size: 1.5rem;">
                    <i class="fas fa-cogs" style="color: #3498db;"></i>
                    Mexanika Bo'limi Boshqaruvi
                </h3>
                <div style="background: rgba(255,255,255,0.1); padding: 5px 15px; border-radius: 20px; color: #ccc; font-size: 0.9rem;">
                    <i class="fas fa-calendar-alt"></i> ${new Date().toLocaleDateString()}
                </div>
            </div>

            <!-- KPI Dashboard -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="background: linear-gradient(135deg, #2c3e50, #34495e); padding: 20px; border-radius: 12px; position: relative; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                    <div style="font-size: 2.5rem; font-weight: bold; color: white;">${totalVehicles}</div>
                    <div style="color: #bdc3c7; font-size: 0.9rem;">Jami Texnika</div>
                    <i class="fas fa-truck-monster" style="position: absolute; right: -10px; bottom: -10px; font-size: 5rem; color: rgba(255,255,255,0.05);"></i>
                </div>
                <div style="background: linear-gradient(135deg, #e74c3c, #c0392b); padding: 20px; border-radius: 12px; position: relative; overflow: hidden; box-shadow: 0 4px 6px rgba(231, 76, 60, 0.3);">
                    <div style="font-size: 2.5rem; font-weight: bold; color: white;">${activeVehicles}</div>
                    <div style="color: #ecf0f1; font-size: 0.9rem;">Ishda (Band)</div>
                    <i class="fas fa-clock" style="position: absolute; right: -10px; bottom: -10px; font-size: 5rem; color: rgba(255,255,255,0.1);"></i>
                </div>
                <div style="background: linear-gradient(135deg, #2ecc71, #27ae60); padding: 20px; border-radius: 12px; position: relative; overflow: hidden; box-shadow: 0 4px 6px rgba(46, 204, 113, 0.3);">
                    <div style="font-size: 2.5rem; font-weight: bold; color: white;">${freeVehicles}</div>
                    <div style="color: #ecf0f1; font-size: 0.9rem;">Bo'sh (Tayyor)</div>
                    <i class="fas fa-check-circle" style="position: absolute; right: -10px; bottom: -10px; font-size: 5rem; color: rgba(255,255,255,0.1);"></i>
                </div>
                <div style="background: linear-gradient(135deg, #f1c40f, #f39c12); padding: 20px; border-radius: 12px; position: relative; overflow: hidden; box-shadow: 0 4px 6px rgba(241, 196, 15, 0.3);">
                    <div style="font-size: 2.5rem; font-weight: bold; color: white;">${repairVehicles}</div>
                    <div style="color: #fff; font-size: 0.9rem;">Ta'mirda</div>
                    <i class="fas fa-tools" style="position: absolute; right: -10px; bottom: -10px; font-size: 5rem; color: rgba(255,255,255,0.1);"></i>
                </div>
            </div>

            <!-- Main Sections: Dynamic Tabs -->
            <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin-bottom: 30px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px;">
                    <div style="display: flex; gap: 20px;">
                        <h4 onclick="window.refreshMechanicsDashboard()" style="margin: 0; color: #3498db; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-truck-pickup"></i> Texnikalar Boshqaruvi
                        </h4>
                        <h4 style="margin: 0; color: #94a3b8; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; gap: 10px; opacity: 0.6;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6" onclick="showToast('Haydovchilar ro\'yxati yaqin vaqtda qo\'shiladi', 'info')">
                            <i class="fas fa-users-cog"></i> Haydovchilar
                        </h4>
                    </div>
                     <div style="display: flex; gap: 10px;">
                        <button onclick="if(window.openAddVehicleModal) window.openAddVehicleModal()" style="background: #2ecc71; border: none; color: white; padding: 8px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-plus"></i> Yangi Texnika
                        </button>
                    </div>
                </div>

                <!-- NEW: Visual Card View (Transport Buyurtma Tizimi Style) -->
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px;" id="mechanics-cards-container">
                    ${data.vehicles.map(v => {
        let statusColor = v.status === 'free' ? '#2ecc71' : (v.status === 'busy' ? '#e74c3c' : '#f1c40f');
        return `
                            <div style="background: #1e293b; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; position: relative; transition: all 0.3s;" onmouseover="this.style.borderColor='${statusColor}40'; this.style.transform='translateY(-3px)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.05)'; this.style.transform='translateY(0)'">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                    <div style="background: rgba(255,255,255,0.05); width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                        <i class="fas fa-truck" style="color: white; font-size: 1.2rem;"></i>
                                    </div>
                                    <div style="display: flex; gap: 5px;">
                                        <button onclick="if(window.deleteVehicle) window.deleteVehicle('${v.id}')" style="background: rgba(239, 68, 68, 0.1); border: none; color: #ef4444; width: 30px; height: 30px; border-radius: 6px; cursor: pointer;" title="O'chirish">
                                            <i class="fas fa-trash-alt" style="font-size: 0.8rem;"></i>
                                        </button>
                                    </div>
                                </div>
                                <h5 style="margin: 0; color: white; font-size: 1.05rem;">${v.name}</h5>
                                <p style="margin: 3px 0 10px 0; color: #94a3b8; font-family: monospace; font-size: 0.85rem;">${v.number}</p>
                                
                                <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 15px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                        <span>Garaj:</span> <span style="color: #cbd5e1;">${v.garage || '---'}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span>Yoqilg'i:</span> <span style="color: #cbd5e1;">${v.fuelNorm} L/100km</span>
                                    </div>
                                </div>

                                <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: 8px;">
                                     <span style="color: ${statusColor}; font-size: 0.8rem; font-weight: bold; display: flex; align-items: center; gap: 5px;">
                                        <span style="width: 8px; height: 8px; background: ${statusColor}; border-radius: 50%;"></span>
                                        ${v.status === 'free' ? "Bo'sh" : (v.status === 'busy' ? "Ishda" : "Ta'mir")}
                                    </span>
                                    ${v.status === 'busy' ? `<span style="font-size: 0.7rem; color: #94a3b8;">${v.currentTask || ''}</span>` : ''}
                                </div>
                            </div>
                        `;
    }).join('')}
                </div>

                <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 25px;">
                    <h4 style="margin: 0 0 20px 0; color: #f39c12; font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-clock"></i> Kelgan Buyurtmalar
                        <span style="background: #f39c1220; color: #f39c12; padding: 2px 10px; border-radius: 20px; font-size: 0.8rem;">${data.orders.length} ta</span>
                    </h4>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; min-width: 600px;">
                            <thead>
                                <tr style="color: #64748b; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                    <th style="padding: 12px;">Sana</th>
                                    <th style="padding: 12px;">Bo'linma</th>
                                    <th style="padding: 12px;">Texnika</th>
                                    <th style="padding: 12px;">Vazifa</th>
                                    <th style="padding: 12px;">Holat</th>
                                    <th style="padding: 12px; text-align: right;">Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.orders.length === 0 ? `
                                    <tr><td colspan="6" style="padding: 30px; text-align: center; color: #64748b; font-style: italic;">Hali buyurtmalar yo'q</td></tr>
                                ` : data.orders.map(o => `
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                                        <td style="padding: 15px 12px; color: #94a3b8;">${o.date}</td>
                                        <td style="padding: 15px 12px; color: #38bdf8; font-weight: bold;">${o.deptName || 'Noma\'lum'}</td>
                                        <td style="padding: 15px 12px; color: white;">${o.vehicleName}</td>
                                        <td style="padding: 15px 12px; color: #94a3b8;">${o.task}</td>
                                        <td style="padding: 15px 12px;">
                                            <span style="color: ${o.status === 'approved' ? '#2ecc71' : '#f39c12'}; display: flex; align-items: center; gap: 5px;">
                                                <i class="fas ${o.status === 'approved' ? 'fa-check' : 'fa-spinner fa-spin'}"></i>
                                                ${o.status === 'approved' ? 'Tasdiqlandi' : 'Kutilmoqda'}
                                            </span>
                                        </td>
                                        <td style="padding: 15px 12px; text-align: right;">
                                            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                                                ${o.status !== 'approved' ? `
                                                    <button onclick="if(window.approveOrder) window.approveOrder(${o.id})" style="background: #2ecc71; border: none; color: white; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem;"><i class="fas fa-check"></i> Tasdiqlash</button>
                                                ` : ''}
                                                <button onclick="if(window.rejectOrder) window.rejectOrder(${o.id})" style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem;"><i class="fas fa-times"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Global Quick Actions -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                <button onclick="if(window.openTechnicalMaintenanceWindow) window.openTechnicalMaintenanceWindow('${bolinmaId}')" 
                    style="background: linear-gradient(135deg, #3498db, #2980b9); border: none; padding: 25px; color: white; border-radius: 15px; cursor: pointer; transition: all 0.3s; display: flex; flex-direction: column; align-items: center; gap: 15px; box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);">
                    <div style="background: rgba(255,255,255,0.2); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-wrench" style="font-size: 1.8rem;"></i>
                    </div>
                    <div><span style="font-size: 1.1rem; font-weight: bold;">Texnik Xizmat (TO-1, TO-2)</span></div>
                </button>

                <button onclick="if(window.openWaybillWindow) window.openWaybillWindow('${bolinmaId}')" 
                    style="background: linear-gradient(135deg, #8e44ad, #9b59b6); border: none; padding: 25px; color: white; border-radius: 15px; cursor: pointer; transition: all 0.3s; display: flex; flex-direction: column; align-items: center; gap: 15px; box-shadow: 0 4px 15px rgba(142, 68, 173, 0.3);">
                    <div style="background: rgba(255,255,255,0.2); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-file-invoice" style="font-size: 1.8rem;"></i>
                    </div>
                    <div><span style="font-size: 1.1rem; font-weight: bold;">Yo'l Varaqalari Hisoboti</span></div>
                </button>
            </div>
        </div>
    `;

    let body = windowElement.querySelector('.department-body') || windowElement.querySelector('.window-content') || windowElement;
    const fileList = body.querySelector('.files-area-wrapper') || body.querySelector('.file-management');
    if (fileList) body.insertBefore(view, fileList);
    else body.appendChild(view);
}


// Make functions globally accessible
window.renderMechanicsSection = renderMechanicsSection;
window.renderMexanikaSection = renderMexanikaSection;

// --- MEHNAT SECTION ---
function renderMehnatSection(windowElement, bolinmaId) {
    const contentDiv = windowElement.querySelector('.window-content');
    if (!contentDiv) return;

    // Avvalgi safety view mavjud bo'lsa, yangilaymiz (tozalamaymiz — safetyDashboard o'zi boshqaradi)
    const fn = typeof renderSafetyDashboard === 'function' ? renderSafetyDashboard
        : (window.renderSafetyDashboard || null);

    if (fn) {
        // Faqat safety ko'rinishini tozalaymiz, contentDiv emas
        const old = contentDiv.querySelector('#safety-dashboard-view');
        if (old) old.innerHTML = '';
        fn(windowElement, bolinmaId);
    } else {
        // safety.js yuklanmagan — fallback UI
        let fallback = contentDiv.querySelector('#safety-fallback-view');
        if (!fallback) {
            fallback = document.createElement('div');
            fallback.id = 'safety-fallback-view';
            contentDiv.appendChild(fallback);
        }
        fallback.innerHTML = `
            <div style="padding:30px;text-align:center;color:white;">
                <i class="fas fa-shield-alt" style="font-size:3rem;color:#f39c12;margin-bottom:15px;display:block;"></i>
                <h3 style="color:#f39c12;">Mehnat Muhofazasi Moduli</h3>
                <p style="color:rgba(255,255,255,0.7);margin:10px 0;">Xavfsizlik moduli yuklanmoqda yoki mavjud emas.</p>
                <div style="display:flex;gap:10px;justify-content:center;margin-top:15px;flex-wrap:wrap;">
                    <button onclick="window.openTNU19Window && window.openTNU19Window('${bolinmaId}')"
                        style="background:linear-gradient(45deg,#f39c12,#e67e22);border:none;color:white;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;">
                        <i class="fas fa-file-contract"></i> TNU-19 Jurnali
                    </button>
                    <button onclick="window.openTNU20Window && window.openTNU20Window('${bolinmaId}')"
                        style="background:linear-gradient(45deg,#8e44ad,#9b59b6);border:none;color:white;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;">
                        <i class="fas fa-graduation-cap"></i> TNU-20 Jurnali
                    </button>
                    <button onclick="window.openTechnicalMaintenanceWindow && window.openTechnicalMaintenanceWindow('${bolinmaId}')"
                        style="background:linear-gradient(45deg,#16a085,#1abc9c);border:none;color:white;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;">
                        <i class="fas fa-tools"></i> TO Jurnali
                    </button>
                </div>
            `;
    }
}

/**
 * SMART PCH - GLOBAL SEARCH SYSTEM
 */
function initGlobalSearch() {
    const input = document.getElementById('globalSearchInput');
    const resultsDropdown = document.getElementById('searchResults');

    if (!input || !resultsDropdown) return;

    input.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (query.length < 2) {
            resultsDropdown.classList.remove('active');
            return;
        }

        const results = searchEverything(query);
        displaySearchResults(results, resultsDropdown);
    });

    // Close search on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.global-search-container')) {
            resultsDropdown.classList.remove('active');
        }
    });
}

function searchEverything(query) {
    let results = [];

    // 1. Search Workers
    if (typeof workersData !== 'undefined') {
        workersData.forEach(worker => {
            if (worker.name.toLowerCase().includes(query) || worker.role.toLowerCase().includes(query)) {
                results.push({ type: 'worker', name: worker.name, meta: worker.role + ' - ' + worker.bolinma, icon: 'fa-user-tie' });
            }
        });
    }

    // 2. Search Trains
    if (typeof trainsData !== 'undefined') {
        trainsData.forEach(train => {
            if (train.number.toLowerCase().includes(query) || train.route.toLowerCase().includes(query)) {
                results.push({ type: 'train', name: train.number, meta: train.route, icon: 'fa-train' });
            }
        });
    }

    // 3. Search Sections/Departments
    const allSections = [
        { name: 'Ishlab chiqarish', icon: 'fa-industry' },
        { name: 'Mexanika', icon: 'fa-cog' },
        { name: 'Bugalteriya', icon: 'fa-calculator' },
        { name: 'Xodimlar', icon: 'fa-users' },
        { name: 'Mehnat muhofazasi', icon: 'fa-hard-hat' }
    ];
    allSections.forEach(section => {
        if (section.name.toLowerCase().includes(query)) {
            results.push({ type: 'section', name: section.name, meta: 'Bo\'lim', icon: section.icon });
        }
    });

    return results.slice(0, 8); // Limit to top 8
}

function displaySearchResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = '<div class="search-item"><div class="search-item-info"><span class="search-item-name">Hech narsa topilmadi</span></div></div>';
    } else {
        container.innerHTML = results.map(item => `
            <div class="search-item" onclick="handleSearchClick('${item.type}', '${item.name}')">
                <i class="fas ${item.icon}"></i>
                <div class="search-item-info">
                    <span class="search-item-name">${item.name}</span>
                    <span class="search-item-meta">${item.meta}</span>
                </div>
            </div>
        `).join('');
    }
    container.classList.add('active');
}

function handleSearchClick(type, name) {
    showToast(`Navigatsiya: ${name}`, 'info');
    document.getElementById('searchResults').classList.remove('active');
    document.getElementById('globalSearchInput').value = '';

    if (type === 'train') {
        if (typeof openRailwayMapModal === 'function') openRailwayMapModal();
    }
}

// --- MOBILE MENU LOGIC ---
function initMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    // Create toggle button if it doesn't exist
    if (!document.querySelector('.mobile-menu-toggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'mobile-menu-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        toggleBtn.style.cssText = `
            position: fixed; bottom: 30px; right: 30px; z-index: 2100;
            display: none; /* Only visible via CSS Media Query */
        `;
        document.body.appendChild(toggleBtn);

        toggleBtn.onclick = (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('mobile-active');
            updateSidebarOverlay();
        };
    }

    // Create overlay if it doesn't exist
    if (!document.querySelector('.sidebar-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        overlay.onclick = () => {
            sidebar.classList.remove('mobile-active');
            updateSidebarOverlay();
        };
    }

    function updateSidebarOverlay() {
        const overlay = document.querySelector('.sidebar-overlay');
        const isActive = sidebar.classList.contains('mobile-active');
        if (overlay) overlay.style.display = isActive ? 'block' : 'none';
    }

    // Close menu on clicks outside or on menu items
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !e.target.closest('.mobile-menu-toggle')) {
            sidebar.classList.remove('mobile-active');
            updateSidebarOverlay();
        }
    });

    // Close menu when clicking sidebar items on mobile
    sidebar.addEventListener('click', (e) => {
        if (e.target.closest('li') && window.innerWidth <= 768) {
            setTimeout(() => {
                sidebar.classList.remove('mobile-active');
                updateSidebarOverlay();
            }, 300);
        }
    });
}

// Initializing settings
document.addEventListener('DOMContentLoaded', () => {
    initGlobalSearch();
    initMobileMenu();
});

// Final exports
window.renderMehnatSection = renderMehnatSection;


