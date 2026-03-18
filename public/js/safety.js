// Safety Module - Digital Safety Instructions & Signatures
// Handles "Mehnat Muhofazasi" features.

let currentSigningWorker = null;
let signaturePadActive = false;
var safetyIsDrawing = false;
let lastX = 0;
let lastY = 0;

// Main Dashboard Renderer
window.renderSafetyDashboard = function (windowElement, bolinmaId) {
    const contentDiv = windowElement.querySelector('.window-content');
    if (!contentDiv) return;

    // Add safety-active class to allow buttons to be visible
    contentDiv.classList.add('safety-active');

    // 1. Clear content
    contentDiv.innerHTML = '';

    // 2. Render Dashboard
    const dashboardHtml = `
        <div id="safety-dashboard-view" style="padding: 30px; color: white; height: 100%; display: flex; flex-direction: column; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            
            <!-- Header Section -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 50px;">
                <!-- Left: Title -->
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="img/logo.png" alt="Logo" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">
                    <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: white;">Mehnat Muhofazasi (Safety)</h2>
                </div>

                <!-- Right: Buttons -->
                <div style="display: flex; gap: 15px; flex-wrap: wrap; z-index: 100;">
                    <button onclick="window.openSafetyWorkerList('${bolinmaId}')" 
                        style="background-color: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: 0.2s; position: relative; z-index: 100;">
                        <i class="fas fa-users"></i> Xodimlar Ro'yxati
                    </button>
                    
                    <button onclick="window.openSafetyTNU19('${bolinmaId}')" 
                        style="background-color: #2c3e50; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: 0.2s; position: relative; z-index: 100;">
                        <i class="fas fa-file-alt"></i> TNU-19 Jurnal
                    </button>
                    
                     <button onclick="window.openSafetyTNU20('${bolinmaId}')" 
                        style="background-color: #9b59b6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: 0.2s; position: relative; z-index: 100;">
                        <i class="fas fa-graduation-cap"></i> TNU-20 Jurnal
                    </button>

                    <button onclick="window.openSafetyTechTraining('${bolinmaId}')" 
                        style="background-color: #e67e22; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: 0.2s; position: relative; z-index: 100;">
                        <i class="fas fa-chalkboard-teacher"></i> Texnik O'quv
                    </button>
                </div>
            </div>

            <!-- Stats Container -->
            <div id="safety-stats"></div>

            <!-- Central Content: Spinner -->
            <div id="safety-main-view" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px;">
                <div class="safety-spinner" style="opacity: 0.8;">
                     <i class="fas fa-spinner fa-spin" style="font-size: 50px; color: #3498db;"></i>
                </div>
            </div>

        </div>
    `;

    contentDiv.innerHTML = dashboardHtml;
    window.currentSafetyBolinmaId = bolinmaId;

    // 3. Load Stats
    if (typeof renderSafetyStats === 'function') {
        renderSafetyStats(bolinmaId);
    }

    // 5. Load Initial View (Worker List) to remove spinner
    setTimeout(() => {
        if (typeof renderWorkerList === 'function') {
            renderWorkerList(bolinmaId);
        } else {
            // If function missing, just clear spinner
            const mainView = windowElement.querySelector('#safety-main-view');
            if (mainView) mainView.innerHTML = '<div style="text-align:center; color:rgba(255,255,255,0.5);">Xodimlar ro\'yxati yuklanmadi</div>';
        }
    }, 100);
};

// --- Proxy Functions for Reliability ---
window.openSafetyWorkerList = function (bolinmaId) {
    if (typeof renderWorkerList === 'function') {
        renderWorkerList(bolinmaId);
    } else {
        alert("Xodimlar ro'yxati funksiyasi topilmadi!");
    }
};

// Aliases for dashboard buttons
window.openSafetyTNU19 = function (bolinmaId) {
    if (typeof openTNU19Window === 'function') openTNU19Window(bolinmaId);
};

window.openSafetyTNU20 = function (bolinmaId) {
    if (typeof openTNU20Window === 'function') openTNU20Window(bolinmaId);
};

window.openSafetyTechTraining = function (bolinmaId) {
    if (typeof openTechTrainingWindow === 'function') openTechTrainingWindow(bolinmaId);
};

// --- TNU-19 Implementation (Daily Briefing Log) ---
// --- TNU-19 Implementation (Daily Briefing Log) ---
// MOVED TO tnu19.js - Using global window.openTNU19Window
/*
window.openTNU19Window = function (bolinmaId) {
    const mainView = document.getElementById('safety-main-view');
    if (!mainView) return;

    const logs = JSON.parse(localStorage.getItem('tnu19_logs') || '[]');
    const filteredLogs = logs.filter(l => l.bolinmaId === bolinmaId);

    mainView.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px;">
                <h3 style="margin: 0; color: #f1c40f;"><i class="fas fa-book"></i> TNU-19: Ish joyidagi yo'riqnoma jurnali</h3>
                <button onclick="openNewBriefingModal('TNU-19', '${bolinmaId}')" 
                    style="background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-plus"></i> Yangi Yo'riqnoma
                </button>
            </div>

            <div style="flex: 1; overflow-y: auto; background: rgba(0,0,0,0.1); border-radius: 10px; padding: 10px;">
                <table style="width: 100%; border-collapse: collapse; color: white;">
                    <thead>
                        <tr style="border-bottom: 2px solid rgba(255,255,255,0.1); text-align: left;">
                            <th style="padding: 12px;">Sana</th>
                            <th style="padding: 12px;">Yo'riqnoma Mavzusi</th>
                            <th style="padding: 12px;">Yo'riqchi</th>
                            <th style="padding: 12px;">Xodim (Imzo)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredLogs.length > 0 ? filteredLogs.map(l => `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 12px; color: #aaa;">${new Date(l.date).toLocaleString()}</td>
                                <td style="padding: 12px;">${l.topic}</td>
                                <td style="padding: 12px;">${l.instructor}</td>
                                <td style="padding: 12px; display: flex; align-items: center; gap: 10px;">
                                    ${l.workerName}
                                    ${l.signature ? `<img src="${l.signature}" style="height: 30px; background: white; border-radius: 4px; padding: 2px;">` : '<span style="color: #e74c3c;">Imzolanmagan</span>'}
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #666;">Hozircha yozuvlar yo\'q</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
};
*/

// --- TNU-20 Implementation (Target Briefing Log) ---
window.openTNU20Window = function (bolinmaId) {
    const mainView = document.getElementById('safety-main-view');
    if (!mainView) return;

    const logs = JSON.parse(localStorage.getItem('tnu20_logs') || '[]');
    const filteredLogs = logs.filter(l => l.bolinmaId === bolinmaId);

    mainView.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px;">
                <h3 style="margin: 0; color: #9b59b6;"><i class="fas fa-file-contract"></i> TNU-20: Maqsadli yo'riqnoma jurnali</h3>
                 <button onclick="openNewBriefingModal('TNU-20', '${bolinmaId}')" 
                    style="background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-plus"></i> Yangi Ruxsatnoma
                </button>
            </div>

            <div style="flex: 1; overflow-y: auto; background: rgba(0,0,0,0.1); border-radius: 10px; padding: 10px;">
                <table style="width: 100%; border-collapse: collapse; color: white;">
                     <thead>
                        <tr style="border-bottom: 2px solid rgba(255,255,255,0.1); text-align: left;">
                            <th style="padding: 12px;">Sana</th>
                            <th style="padding: 12px;">Ish Turi (Naryad)</th>
                            <th style="padding: 12px;">Ruxsat Beruvchi</th>
                            <th style="padding: 12px;">Xodim (Imzo)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredLogs.length > 0 ? filteredLogs.map(l => `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 12px; color: #aaa;">${new Date(l.date).toLocaleString()}</td>
                                <td style="padding: 12px;">${l.topic}</td>
                                <td style="padding: 12px;">${l.instructor}</td>
                                <td style="padding: 12px; display: flex; align-items: center; gap: 10px;">
                                    ${l.workerName}
                                    ${l.signature ? `<img src="${l.signature}" style="height: 30px; background: white; border-radius: 4px; padding: 2px;">` : '<span style="color: #e74c3c;">Imzolanmagan</span>'}
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #666;">Hozircha yozuvlar yo\'q</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

// --- Universal New Briefing Modal ---
window.openNewBriefingModal = function (type, bolinmaId) {
    // 1. Get Workers for dropdown
    let allWorkers = [];
    const saved = localStorage.getItem('smart_pch_workers');
    if (saved) allWorkers = JSON.parse(saved);
    else if (typeof workersData !== 'undefined') allWorkers = workersData;

    // Filter for current dept
    const workers = allWorkers.filter(w => {
        const bIdStr = String(bolinmaId).toLowerCase();
        // Simple check, expand if needed
        return String(w.bolinma || '').toLowerCase().includes(bIdStr.replace('bolinma', ''));
    });

    // 2. Create Modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); backdrop-filter: blur(5px);
        display: flex; align-items: center; justify-content: center; z-index: 10000;
    `;
    modal.id = 'briefing-modal';

    modal.innerHTML = `
        <div style="background: #1e293b; width: 500px; padding: 25px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 0 30px rgba(0,0,0,0.5);">
            <h3 style="margin-top: 0; color: white; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-pen-nib"></i> ${type} - Yangi Yozuv
            </h3>
            
            <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
                <div>
                    <label style="color: #aaa; font-size: 0.9rem; display: block; margin-bottom: 5px;">Xodimni tanlang</label>
                    <select id="briefing-worker" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 8px;">
                        <option value="">-- Tanlang --</option>
                        ${workers.map(w => `<option value="${w.id}">${w.name} (${w.role})</option>`).join('')}
                    </select>
                </div>

                <div>
                    <label style="color: #aaa; font-size: 0.9rem; display: block; margin-bottom: 5px;">${type === 'TNU-19' ? 'Yo\'riqnoma Mavzusi' : 'Naryad / Ish Turi'}</label>
                    <input type="text" id="briefing-topic" placeholder="${type === 'TNU-19' ? 'Elektr xavfsizligi...' : 'Ko\'prik ta\'miri...'}" 
                        style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 8px;">
                </div>

                 <div>
                    <label style="color: #aaa; font-size: 0.9rem; display: block; margin-bottom: 5px;">Imzo (Barmoq yoki sichqoncha bilan)</label>
                    <div style="background: white; border-radius: 8px; cursor: crosshair; overflow: hidden; height: 200px; position: relative;">
                        <canvas id="briefing-signature-pad" width="450" height="200" style="display: block;"></canvas>
                        <div style="position: absolute; bottom: 5px; right: 5px; color: #ccc; font-size: 0.7rem; pointer-events: none;">Imzo maydoni</div>
                    </div>
                    <button onclick="clearBriefingSignature()" style="margin-top: 5px; background: none; border: none; color: #e74c3c; font-size: 0.8rem; cursor: pointer; text-decoration: underline;">Tozalash</button>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
                    <button onclick="document.getElementById('briefing-modal').remove()" 
                        style="padding: 10px 20px; background: rgba(255,255,255,0.1); border: none; color: white; border-radius: 8px; cursor: pointer;">Bekor qilish</button>
                    <button onclick="saveBriefing('${type}', '${bolinmaId}')" 
                        style="padding: 10px 30px; background: linear-gradient(135deg, #3498db, #2980b9); border: none; color: white; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);">
                        <i class="fas fa-save"></i> Saqlash
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Init Canvas
    setTimeout(() => initBriefingSignaturePad(), 100);
};

// Canvas Logic
let briefingCanvas, briefingCtx;
let isDrawingBriefing = false;

window.initBriefingSignaturePad = function () {
    briefingCanvas = document.getElementById('briefing-signature-pad');
    if (!briefingCanvas) return;
    briefingCtx = briefingCanvas.getContext('2d');

    // Set styles
    briefingCtx.strokeStyle = 'black';
    briefingCtx.lineWidth = 2;
    briefingCtx.lineCap = 'round';

    // Mouse Events
    briefingCanvas.addEventListener('mousedown', startBriefingDraw);
    briefingCanvas.addEventListener('mousemove', drawBriefing);
    briefingCanvas.addEventListener('mouseup', stopBriefingDraw);
    briefingCanvas.addEventListener('mouseout', stopBriefingDraw);

    // Touch Events (For Tablets!)
    briefingCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent scrolling
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        briefingCanvas.dispatchEvent(mouseEvent);
    }, { passive: false });

    briefingCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        briefingCanvas.dispatchEvent(mouseEvent);
    }, { passive: false });

    briefingCanvas.addEventListener('touchend', (e) => {
        const mouseEvent = new MouseEvent('mouseup', {});
        briefingCanvas.dispatchEvent(mouseEvent);
    });
};

function startBriefingDraw(e) {
    isDrawingBriefing = true;
    drawBriefing(e);
}

function drawBriefing(e) {
    if (!isDrawingBriefing) return;

    const rect = briefingCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    briefingCtx.lineTo(x, y);
    briefingCtx.stroke();
    briefingCtx.beginPath();
    briefingCtx.moveTo(x, y);
}

function stopBriefingDraw() {
    isDrawingBriefing = false;
    briefingCtx.beginPath();
}

window.clearBriefingSignature = function () {
    if (briefingCtx) briefingCtx.clearRect(0, 0, briefingCanvas.width, briefingCanvas.height);
};

window.saveBriefing = function (type, bolinmaId) {
    const workerSelect = document.getElementById('briefing-worker');
    const workerId = workerSelect.value;
    const workerName = workerSelect.options[workerSelect.selectedIndex].text;
    const topic = document.getElementById('briefing-topic').value;

    if (!workerId || !topic) {
        alert("Barcha maydonlarni to'ldiring!");
        return;
    }

    // Check empty canvas
    const pixelData = briefingCtx.getImageData(0, 0, briefingCanvas.width, briefingCanvas.height).data;
    let isCanvasEmpty = true;
    for (let i = 0; i < pixelData.length; i += 4) {
        if (pixelData[i + 3] > 0) { isCanvasEmpty = false; break; }
    }
    if (isCanvasEmpty) {
        alert("Iltimos, imzo qo'ying!");
        return;
    }

    const signature = briefingCanvas.toDataURL();
    const record = {
        id: Date.now(),
        date: new Date().toISOString(),
        bolinmaId,
        workerId,
        workerName,
        topic,
        instructor: 'Yo\'l Ustasi (Auto)', // In real app, current logged in user
        signature
    };

    const storageKey = type === 'TNU-19' ? 'tnu19_logs' : 'tnu20_logs';
    const logs = JSON.parse(localStorage.getItem(storageKey) || '[]');
    logs.push(record);
    localStorage.setItem(storageKey, JSON.stringify(logs));

    // Close and Refresh
    document.getElementById('briefing-modal').remove();

    // We need to refresh the current view
    if (type === 'TNU-19') openTNU19Window(bolinmaId);
    else openTNU20Window(bolinmaId);

    // Also show toast
    if (typeof showSafetyToast === 'function') showSafetyToast(`${type} muvaffaqiyatli saqlandi!`);
};

// --- Updated Proxy Functions Calls ---
window.openSafetyTNU19 = function (bolinmaId) {
    openTNU19Window(bolinmaId);
};

window.openSafetyTNU20 = function (bolinmaId) {
    if (typeof openTNU20Window === 'function') openTNU20Window(bolinmaId);
};

window.openSafetyTechTraining = function (bolinmaId) {
    if (typeof openTechnicalMaintenanceWindow === 'function') {
        openTechnicalMaintenanceWindow(bolinmaId);
    } else {
        if (typeof showToast === 'function') showToast("Texnik o'quv moduli tez kunda ishga tushadi", "info");
    }
};


async function renderWorkerList(bolinmaId) {
    const mainView = document.getElementById('safety-main-view');
    if (!mainView) return;

    // 1. Get Workers from HR system
    if (!window.hrData || !window.hrData.employees || window.hrData.employees.length === 0) {
        await initHRData();
    }

    let workers = window.hrData.employees || [];
    if (bolinmaId && bolinmaId !== 'all') {
        const bNumMatch = String(bolinmaId).match(/\d+/);
        const bNum = bNumMatch ? bNumMatch[0] : bolinmaId;

        workers = workers.filter(w => {
            const wBol = String(w.bolinma || w.bolinmaId || w.department || w.bolinma_id || '').toLowerCase();
            const wNumMatch = wBol.match(/\d+/);
            const wNum = wNumMatch ? wNumMatch[0] : '';
            return wNum === bNum || wBol.includes(String(bolinmaId).toLowerCase());
        });
    }

    // 2. Fetch TNU-19 Logs for today from server
    let tnu19Logs = [];
    try {
        tnu19Logs = await SmartUtils.fetchAPI(`/safety/tnu19?bolinma_id=${bolinmaId || ''}`);
    } catch (e) {
        console.error("Error fetching TNU-19 logs:", e);
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const signedTodayIds = new Set(
        tnu19Logs
            .filter(l => l.date === today)
            .map(l => l.employee_id)
    );

    if (workers.length === 0) {
        mainView.innerHTML = `
            <div style="text-align: center; color: rgba(255,255,255,0.5); padding: 50px;">
                <i class="fas fa-users-slash" style="font-size: 50px; margin-bottom: 20px;"></i>
                <p>Ushbu bo'limda xodimlar topilmadi</p>
            </div>
        `;
        return;
    }

    mainView.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
            <div style="padding: 15px; background: rgba(0,0,0,0.2); border-radius: 10px 10px 0 0; display: flex; justify-content: space-between; align-items: center;">
                 <h3 style="margin: 0; color: white;"><i class="fas fa-clipboard-check"></i> Xodimlar Imzolari (${today})</h3>
                 <span style="background: rgba(255,255,255,0.1); padding: 5px 10px; border-radius: 20px; font-size: 0.8rem;">
                    Jami: ${workers.length} xodim
                 </span>
            </div>
            
            <div style="flex: 1; overflow-y: auto; background: rgba(0,0,0,0.1); padding: 10px; border-radius: 0 0 10px 10px;">
                <table style="width: 100%; border-collapse: collapse; color: white;">
                    <thead>
                        <tr style="border-bottom: 2px solid rgba(255,255,255,0.1); text-align: left;">
                            <th style="padding: 12px; width: 50px;">#</th>
                            <th style="padding: 12px;">F.I.SH</th>
                            <th style="padding: 12px;">Lavozim</th>
                            <th style="padding: 12px;">Holat</th>
                            <th style="padding: 12px; text-align: right;">Amal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${workers.map((w, index) => {
        const isSigned = signedTodayIds.has(w.id);
        return `
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: 0.2s; background: ${isSigned ? 'rgba(46, 204, 113, 0.05)' : 'transparent'};">
                                    <td style="padding: 12px; opacity: 0.7;">${index + 1}</td>
                                    <td style="padding: 12px; font-weight: bold;">${w.full_name}</td>
                                    <td style="padding: 12px; opacity: 0.8;">${w.position || '-'}</td>
                                    <td style="padding: 12px;">
                                        ${isSigned
                ? `<span style="color: #2ecc71; display: flex; align-items: center; gap: 5px;"><i class="fas fa-check-circle"></i> Imzolangan</span>`
                : `<span style="color: #e74c3c; display: flex; align-items: center; gap: 5px;"><i class="fas fa-times-circle"></i> Imzolanmagan</span>`
            }
                                    </td>
                                    <td style="padding: 12px; text-align: right;">
                                        ${!isSigned ? `
                                            <button onclick="openInstructionModal(${w.id}, '${w.full_name}')" 
                                                style="background: linear-gradient(135deg, #3498db, #2980b9); border: none; color: white; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                                                <i class="fas fa-pen-alt"></i> Imzo Qo'yish
                                            </button>
                                        ` : `
                                            <button disabled style="background: none; border: 1px solid rgba(255,255,255,0.1); color: #2ecc71; padding: 8px 15px; border-radius: 6px; opacity: 0.7;">
                                                <i class="fas fa-lock"></i> Tasdiqlangan
                                            </button>
                                        `}
                                    </td>
                                </tr>
                            `;
    }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function openInstructionModal(workerId, workerName) {
    currentSigningWorker = { id: workerId, name: workerName };

    const existingModal = document.getElementById('instruction-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'instruction-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px);
        z-index: 10020; display: flex; justify-content: center; align-items: center;
        animation: modalFadeIn 0.3s ease-out;
    `;

    modal.innerHTML = `
        <style>
            @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            .safety-point { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 10px; transition: 0.3s; }
            .safety-point:hover { background: rgba(255,255,255,0.06); transform: translateX(5px); }
            .safety-icon { width: 32px; height: 32px; min-width: 32px; border-radius: 8px; background: rgba(243, 156, 18, 0.2); color: #f39c12; display: flex; align-items: center; justify-content: center; font-size: 14px; }
            .signature-area { background: white; border-radius: 15px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.1); border: 2px solid rgba(0,0,0,0.05); cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path></svg>'), crosshair; position: relative; }
            .signature-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 3rem; color: rgba(0,0,0,0.03); pointer-events: none; font-weight: 900; letter-spacing: 10px; text-transform: uppercase; }
        </style>
        
        <div style="background: linear-gradient(165deg, #1e293b, #0f172a); width: 95%; max-width: 850px; border-radius: 24px; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
            
            <div style="padding: 25px 30px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; background: linear-gradient(90deg, #f39c12, #e67e22);">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="background: rgba(255,255,255,0.2); width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: white;">
                        <i class="fas fa-shield-check"></i>
                    </div>
                    <div>
                        <h3 style="margin: 0; color: white; font-size: 1.4rem;">Xavfsizlik Yo'riqnomasi</h3>
                        <p style="margin: 3px 0 0 0; color: rgba(255,255,255,0.8); font-size: 0.85rem;">DIQQAT: Ushbu hujjat rasmiy hisoblanadi</p>
                    </div>
                </div>
                <button onclick="closeInstructionModal()" style="background: rgba(0,0,0,0.1); border: none; color: white; width: 40px; height: 40px; border-radius: 10px; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s;">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div style="padding: 30px; overflow-y: auto; flex-grow: 1; color: #f1f5f9; display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                
                <div>
                    <h4 style="color: #f39c12; margin: 0 0 20px 0; font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-info-circle"></i> Muhim Qoidalar
                    </h4>
                    
                    <div class="safety-point">
                        <div class="safety-icon"><i class="fas fa-hard-hat"></i></div>
                        <div>
                            <div style="font-weight: bold; font-size: 0.9rem;">Shaxsiy himoya</div>
                            <div style="font-size: 0.8rem; color: #94a3b8;">Kaska, jilet va maxsus poyabzal kiyilishi shart.</div>
                        </div>
                    </div>

                    <div class="safety-point">
                        <div class="safety-icon"><i class="fas fa-train"></i></div>
                        <div>
                            <div style="font-weight: bold; font-size: 0.9rem;">Hushyorlik</div>
                            <div style="font-size: 0.8rem; color: #94a3b8;">Izlarda doim ehtiyot bo'ling va poyezdni kuzating.</div>
                        </div>
                    </div>

                    <div class="safety-point">
                        <div class="safety-icon"><i class="fas fa-bolt"></i></div>
                        <div>
                            <div style="font-weight: bold; font-size: 0.9rem;">Elektr xavfsizligi</div>
                            <div style="font-size: 0.8rem; color: #94a3b8;">Izolatsiya va asboblar butunligini tekshiring.</div>
                        </div>
                    </div>

                    <div class="safety-point">
                        <div class="safety-icon"><i class="fas fa-mountain"></i></div>
                        <div>
                            <div style="font-weight: bold; font-size: 0.9rem;">Balandlikda ishlash</div>
                            <div style="font-size: 0.8rem; color: #94a3b8;">1.3 m dan yuqorida xavfsizlik kamari majburiy.</div>
                        </div>
                    </div>

                    <div style="margin-top: 20px; padding: 15px; background: rgba(243, 156, 18, 0.05); border-left: 3px solid #f39c12; border-radius: 8px; font-size: 0.85rem; line-height: 1.6; font-style: italic; color: #cbd5e1;">
                        "Men, <span style="color: #f39c12; font-weight: bold;">${workerName}</span>, barcha qoidalar bilan tanishdim va ularga to'liq amal qilishga va'da beraman."
                    </div>
                </div>

                <div id="safety-auth-selection" style="display: flex; flex-direction: column; gap: 20px;">
                    <h4 style="color: #2ecc71; margin: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-shield-alt"></i> Tasdiqlash usuli
                    </h4>
                    
                    <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                        <button onclick="startSafetyFaceID()" style="background: rgba(46, 204, 113, 0.1); border: 2px solid #2ecc71; color: white; padding: 20px; border-radius: 15px; cursor: pointer; display: flex; align-items: center; gap: 20px; transition: 0.3s; text-align: left;">
                            <div style="font-size: 2rem; color: #2ecc71;"><i class="fas fa-user-astronaut"></i></div>
                            <div>
                                <div style="font-weight: bold; font-size: 1.1rem;">Face ID skanerlash</div>
                                <div style="font-size: 0.8rem; color: #94a3b8;">Biometrik ma'lumotlar orqali tezkor tasdiqlash</div>
                            </div>
                        </button>

                        <button onclick="showManualSignature()" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 20px; border-radius: 15px; cursor: pointer; display: flex; align-items: center; gap: 20px; transition: 0.3s; text-align: left;">
                            <div style="font-size: 1.5rem; color: #3498db;"><i class="fas fa-pen-fancy"></i></div>
                            <div>
                                <div style="font-weight: bold;">Qo'lda imzo qo'yish</div>
                                <div style="font-size: 0.8rem; color: #94a3b8;">Ekran yuzasida imzo qoldirish</div>
                            </div>
                        </button>
                    </div>
                </div>

                <div id="manual-signature-container" style="display: none; flex-direction: column;">
                    <h4 style="color: #2ecc71; margin: 0 0 20px 0; font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-signature"></i> Raqamli Imzo Maydoni
                    </h4>
                    
                    <div class="signature-area">
                        <div class="signature-watermark">SAFETY</div>
                        <canvas id="signature-pad" width="380" height="280" style="touch-action: none; width: 100%; height: 280px;"></canvas>
                        <div style="position: absolute; bottom: 10px; left: 15px; font-size: 11px; color: #94a3b8;">
                            <i class="fas fa-fingerprint"></i> Biometrik tasdiq
                        </div>
                        <button onclick="clearSignature()" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.05); border: none; color: #64748b; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; transition: 0.3s;" title="Tozalash">
                            <i class="fas fa-eraser"></i>
                        </button>
                    </div>

                    <div style="margin-top: 20px; color: #94a3b8; font-size: 0.8rem; text-align: center;">
                        <i class="fas fa-info-circle"></i> Sichqoncha yoki barmoq orqali imzo qo'ying
                    </div>
                </div>
            </div>

            <div style="padding: 25px 30px; border-top: 1px solid rgba(255,255,255,0.05); text-align: right; background: rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px; color: #94a3b8; font-size: 0.85rem;">
                    <i class="fas fa-clock"></i> ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | ${new Date().toLocaleDateString()}
                </div>
                <button onclick="saveSignature()" style="background: linear-gradient(135deg, #2ecc71, #27ae60); border: none; color: white; padding: 14px 40px; border-radius: 12px; font-size: 1.1rem; font-weight: bold; cursor: pointer; box-shadow: 0 10px 20px -5px rgba(46, 204, 113, 0.3); transition: 0.3s; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-check-double"></i> Tasdiqlash va Saqlash
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Initialize Canvas if needed
}

window.showManualSignature = function () {
    document.getElementById('safety-auth-selection').style.display = 'none';
    const container = document.getElementById('manual-signature-container');
    container.style.display = 'flex';
    setupCanvas();
}

window.startSafetyFaceID = function () {
    if (typeof openTNU19FaceIDModal === 'function') {
        // Set up global state for TNU-19 logic to handle our safety signing
        window.tnu19SignatureStep = 'worker';
        window.tnu19CurrentRecord = {
            id: 'tnu19_' + Date.now(),
            date: new Date().toISOString().slice(0, 10),
            time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
            workerId: currentSigningWorker.id,
            workerName: currentSigningWorker.name,
            workerPosition: currentSigningWorker.role || 'Xodim',
            instructionType: 'takroriy',
            instructionContent: "Kunlik xavfsizlik texnikasi bo'yicha yo'riqnoma",
            instructorName: "Mahmudov M.U.",
            instructorPosition: "Bosh muhandis",
            bolinmaId: window.currentSafetyBolinmaId || '1-bo\'linma'
        };

        // We'll use a MutationObserver to detect when the Face ID modal is closed
        // and check if a signature was generated
        const observer = new MutationObserver((mutations) => {
            if (!document.getElementById('tnu19-faceid-modal') && !document.getElementById('tnu19-signature-modal')) {
                // Check if TNU-19 record was saved or if we have a signature
                if (window.tnu19CurrentRecord && window.tnu19CurrentRecord.workerSignature) {
                    // Manually trigger the safety log save since TNU-19 modal is gone
                    completeSafetySigning(window.tnu19CurrentRecord.workerSignature);
                }
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true });

        openTNU19FaceIDModal();
    } else {
        alert("Face ID tizimi topilmadi!");
    }
}

// Helper to complete safety signing from external sources (like Face ID)
function completeSafetySigning(sigData) {
    if (!currentSigningWorker) return;

    const today = new Date().toISOString().slice(0, 10);
    const key = `${currentSigningWorker.id}_${today}`;
    let logs = JSON.parse(localStorage.getItem('safety_logs') || '{}');

    logs[key] = {
        workerId: currentSigningWorker.id,
        workerName: currentSigningWorker.name,
        date: new Date().toISOString(),
        signature: sigData,
        type: 'Daily Instruction (Face ID)'
    };

    localStorage.setItem('safety_logs', JSON.stringify(logs));
    showSafetyToast(`${currentSigningWorker.name} Face ID orqali imzoladi!`);

    closeInstructionModal();
    const bId = window.currentSafetyBolinmaId;
    renderSafetyStats(bId);
    renderWorkerList(bId);
}

function closeInstructionModal() {
    document.getElementById('instruction-modal')?.remove();
    currentSigningWorker = null;
}

function setupCanvas() {
    const canvas = document.getElementById('signature-pad');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';

    let points = [];
    safetyIsDrawing = false;

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
            t: Date.now()
        };
    }

    function startDraw(e) {
        safetyIsDrawing = true;
        points = [getPos(e)];

        // Hide watermark on first touch
        const watermark = canvas.parentElement.querySelector('.signature-watermark');
        if (watermark) watermark.style.opacity = '0.3';
    }

    function draw(e) {
        if (!safetyIsDrawing) return;
        e.preventDefault();

        const pos = getPos(e);
        points.push(pos);

        if (points.length < 3) return;

        // Draw with quadratic curves for smoothness
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length - 2; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }

        // For the last 2 points
        ctx.quadraticCurveTo(
            points[points.length - 2].x,
            points[points.length - 2].y,
            points[points.length - 1].x,
            points[points.length - 1].y
        );

        ctx.stroke();
    }

    function stopDraw() {
        if (safetyIsDrawing) {
            safetyIsDrawing = false;
            // Simplified points array for performance if needed, 
            // but for a single signature it's fine.
        }
    }

    // Simplified event handling for stability
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    document.addEventListener('mouseup', stopDraw);

    // Touch events (window.ontouchmove o'rniga addEventListener ishlatiladi)
    canvas.addEventListener('touchstart', function (e) { startDraw(e); }, { passive: true });
    document.addEventListener('touchmove', function (e) {
        // Faqat canvas uchun
        if (safetyIsDrawing) draw(e);
    }, { passive: true });
    document.addEventListener('touchend', stopDraw);

    // Cleanup: Modal yopilganda eventlarni tozalash
    const instructionModal = document.getElementById('instruction-modal');
    if (instructionModal) {
        const observer = new MutationObserver(() => {
            if (!document.getElementById('instruction-modal')) {
                document.removeEventListener('mouseup', stopDraw);
                document.removeEventListener('touchend', stopDraw);
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true });
    }
} // setupCanvas TUGADI

// Global scope check
console.log("Safety Module: Loaded and ready to go.");
window.safetyLoaded = 'YES - ' + new Date().toLocaleTimeString();

function clearSignature() {
    const canvas = document.getElementById('signature-pad');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function showSafetyToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 30px; right: 30px; padding: 15px 25px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #2ecc71, #27ae60)' : 'linear-gradient(135deg, #e74c3c, #c0392b)'};
        color: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 100000; display: flex; align-items: center; gap: 12px;
        font-weight: bold; animation: toastSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;

    const icon = type === 'success' ? 'fa-check-double' : 'fa-exclamation-triangle';
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;

    // Keyframes if not exists
    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.innerHTML = `
            @keyframes toastSlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes toastSlideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

async function saveSignature() {
    if (!currentSigningWorker) return;

    const canvas = document.getElementById('signature-pad');
    const ctx = canvas.getContext('2d');
    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let isCanvasEmpty = true;
    for (let i = 0; i < pixelData.length; i += 4) {
        if (pixelData[i + 3] > 0) { isCanvasEmpty = false; break; }
    }

    if (isCanvasEmpty) {
        showSafetyToast("Iltimos, imzo maydonini to'ldiring!", 'error');
        return;
    }

    const signatureData = canvas.toDataURL();
    const today = new Date().toISOString().slice(0, 10);

    try {
        // 1. Save to TNU-19 via API (Automatic)
        const response = await SmartUtils.fetchAPI('/safety/tnu19', {
            method: 'POST',
            body: JSON.stringify({
                employee_id: currentSigningWorker.id,
                bolinma_id: window.currentSafetyBolinmaId || 'all',
                date: today,
                time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
                instruction_type: 'takroriy',
                instructor_name: "Mahmudov M.U.",
                signature: signatureData
            })
        });

        if (response) {
            showSafetyToast(`${currentSigningWorker.name} imzosi va TNU-19 jurnali saqlandi!`);

            // Cleanup and reload
            setTimeout(() => {
                closeInstructionModal();
                const bId = window.currentSafetyBolinmaId;
                renderSafetyStats(bId);
                renderWorkerList(bId);
            }, 500);
        }
    } catch (e) {
        showSafetyToast("Saqlashda xatolik yuz berdi!", 'error');
    }
}

// Render Safety Statistics
async function renderSafetyStats(bolinmaId) {
    try {
        const statsDiv = document.getElementById('safety-stats');
        if (!statsDiv) return;

        // 1. Get Workers
        if (!window.hrData || !window.hrData.employees) await initHRData();
        let workers = window.hrData.employees || [];
        if (bolinmaId && bolinmaId !== 'all') {
            const bNumMatch = String(bolinmaId).match(/\d+/);
            const bNum = bNumMatch ? bNumMatch[0] : bolinmaId;

            workers = workers.filter(w => {
                const wBol = String(w.bolinma || w.bolinmaId || w.department || w.bolinma_id || '').toLowerCase();
                const wNumMatch = wBol.match(/\d+/);
                const wNum = wNumMatch ? wNumMatch[0] : '';
                return wNum === bNum || wBol.includes(String(bolinmaId).toLowerCase());
            });
        }

        // 2. Fetch Logs
        const today = new Date().toISOString().slice(0, 10);
        let tnu19Logs = [];
        try {
            tnu19Logs = await SmartUtils.fetchAPI(`/safety/tnu19?bolinma_id=${bolinmaId || ''}`);
        } catch (e) { }

        const signedTodayIds = new Set(tnu19Logs.filter(l => l.date === today).map(l => l.employee_id));
        const signedWorkers = workers.filter(w => signedTodayIds.has(w.id));
        const unsignedWorkers = workers.filter(w => !signedTodayIds.has(w.id));
        const signedPercent = workers.length > 0 ? Math.round((signedWorkers.length / workers.length) * 100) : 0;

        statsDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div style="background: linear-gradient(135deg, #2ecc71, #27ae60); padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    <div style="font-size: 0.9em; opacity: 0.9; margin-bottom: 8px;"><i class="fas fa-check-circle"></i> Imzo Qo'ygan</div>
                    <div style="font-size: 2.2em; font-weight: bold;">${signedWorkers.length}</div>
                    <div style="font-size: 0.8em; opacity: 0.8; margin-top: 5px;">Bugun</div>
                </div>
                <div style="background: linear-gradient(135deg, #e74c3c, #c0392b); padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    <div style="font-size: 0.9em; opacity: 0.9; margin-bottom: 8px;"><i class="fas fa-times-circle"></i> Imzo Qo'ymagan</div>
                    <div style="font-size: 2.2em; font-weight: bold;">${unsignedWorkers.length}</div>
                    <div style="font-size: 0.8em; opacity: 0.8; margin-top: 5px;">Bugun</div>
                </div>
                <div style="background: linear-gradient(135deg, #3498db, #2980b9); padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    <div style="font-size: 0.9em; opacity: 0.9; margin-bottom: 8px;"><i class="fas fa-users"></i> Jami Xodimlar</div>
                    <div style="font-size: 2.2em; font-weight: bold;">${workers.length}</div>
                    <div style="font-size: 0.8em; opacity: 0.8; margin-top: 5px;">Bo'linmada</div>
                </div>
                <div style="background: linear-gradient(135deg, #f39c12, #e67e22); padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    <div style="font-size: 0.9em; opacity: 0.9; margin-bottom: 8px;"><i class="fas fa-chart-pie"></i> Bajarilish</div>
                    <div style="font-size: 2.2em; font-weight: bold;">${signedPercent}%</div>
                    <div style="font-size: 0.8em; opacity: 0.8; margin-top: 5px;">Bugun</div>
                </div>
            </div>
        `;
    } catch (err) {
        console.error("Error in renderSafetyStats:", err);
        const statsDiv = document.getElementById('safety-stats');
        if (statsDiv) statsDiv.innerHTML = '<div style="color: rgba(255,255,255,0.3); font-size: 0.8rem;">Statistika yuklashda xatolik yuz berdi.</div>';
    }
}


// --- CENTRAL MONITORING FOR SAFETY DEPARTMENT ---
function getCentralSafetyMonitorHTML() {
    // Get all workers
    let allWorkers = [];
    const savedWorkers = localStorage.getItem('smart_pch_workers');
    if (savedWorkers) {
        allWorkers = JSON.parse(savedWorkers);
    } else if (typeof workersData !== 'undefined') {
        allWorkers = workersData;
    }

    // All logs
    const logs = JSON.parse(localStorage.getItem('safety_logs') || '{}');
    const today = new Date().toISOString().slice(0, 10);

    // Group by bolinma
    const bolinmaStats = {};
    for (let i = 1; i <= 10; i++) {
        const bId = `bolinma${i} `;
        const bName = `${i} -bo'linma`;

        const bWorkers = allWorkers.filter(w =>
            w.bolinma === bId || w.bolinmaId === bId ||
            w.bolinma === bName || w.bolinmaId === bName
        );

        const signed = bWorkers.filter(w => {
            const key = `${w.id}_${today}`;
            return logs[key];
        });

        bolinmaStats[i] = {
            id: bId,
            name: `${i}-bo'linma`,
            total: bWorkers.length,
            signed: signed.length,
            percent: bWorkers.length > 0 ? Math.round((signed.length / bWorkers.length) * 100) : 0
        };
    }

    const totalSigned = Object.values(bolinmaStats).reduce((sum, b) => sum + b.signed, 0);
    const totalWorkers = Object.values(bolinmaStats).reduce((sum, b) => sum + b.total, 0);
    const overallPercent = totalWorkers > 0 ? Math.round((totalSigned / totalWorkers) * 100) : 0;

    // Latest 5 signatures across all
    const allLogs = Object.values(logs)
        .filter(l => l.date && l.date.includes(today))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 8);

    return `
        <div class="central-safety-monitor" style="margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 20px; border: 1px solid rgba(243, 156, 18, 0.3); padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <div>
                        <h2 style="margin: 0; color: #f39c12; font-size: 1.8rem; display: flex; align-items: center; gap: 15px;">
                            <i class="fas fa-shield-halved"></i> Markaziy Mehnat Muhofazasi Monitori
                        </h2>
                        <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.5);">Barcha bo'linmalar bo'yicha kunlik yo'riqnoma holati</p>
                    </div>
                    <div style="text-align: right;">
                        <span class="pulse-badge" style="background: rgba(46, 204, 113, 0.2); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.3); padding: 5px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">
                             LIVE MONITORING
                        </span>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; border-left: 4px solid #f39c12;">
                        <div style="font-size: 0.8rem; color: #aaa; text-transform: uppercase;">Jami Xodimlar</div>
                        <div style="font-size: 2rem; font-weight: bold; margin-top: 5px;">${totalWorkers}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; border-left: 4px solid #2ecc71;">
                        <div style="font-size: 0.8rem; color: #aaa; text-transform: uppercase;">Bugun Imzolagan</div>
                        <div style="font-size: 2rem; font-weight: bold; margin-top: 5px; color: #2ecc71;">${totalSigned}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; border-left: 4px solid #e74c3c;">
                        <div style="font-size: 0.8rem; color: #aaa; text-transform: uppercase;">Imzolamagan</div>
                        <div style="font-size: 2rem; font-weight: bold; margin-top: 5px; color: #e74c3c;">${totalWorkers - totalSigned}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; border-left: 4px solid #3498db;">
                        <div style="font-size: 0.8rem; color: #aaa; text-transform: uppercase;">Bajarilish ko'rsatkichi</div>
                        <div style="font-size: 2rem; font-weight: bold; margin-top: 5px; color: #3498db;">${overallPercent}%</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 25px;">
                    <!-- Bo'linmalar jadvali -->
                    <div style="background: rgba(0,0,0,0.2); border-radius: 15px; padding: 20px;">
                        <h4 style="margin: 0 0 15px 0; color: #ffd700;"><i class="fas fa-list-check"></i> Bo'linmalar Kesimida</h4>
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                            <thead>
                                <tr style="text-align: left; border-bottom: 2px solid rgba(255,255,255,0.1);">
                                    <th style="padding: 10px;">Bo'linma</th>
                                    <th style="padding: 10px;">Xodimlar</th>
                                    <th style="padding: 10px;">Holati</th>
                                    <th style="padding: 10px;">Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.values(bolinmaStats).map(b => `
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                        <td style="padding: 12px; font-weight: bold;">${b.name.toUpperCase()}</td>
                                        <td style="padding: 12px;">${b.signed} / ${b.total}</td>
                                        <td style="padding: 12px;">
                                            <span style="background: ${b.percent === 100 ? 'rgba(46, 204, 113, 0.2)' : b.percent > 0 ? 'rgba(241, 196, 15, 0.2)' : 'rgba(231, 76, 60, 0.2)'}; 
                                                         color: ${b.percent === 100 ? '#2ecc71' : b.percent > 0 ? '#f1c40f' : '#e74c3c'}; 
                                                         padding: 3px 10px; border-radius: 10px; font-size: 0.75rem;">
                                                ${b.percent === 100 ? 'YAKUNLANDI' : b.percent > 0 ? 'JARAYONDA' : 'BOSHLANMAGAN'}
                                            </span>
                                        </td>
                                        <td style="padding: 12px; width: 150px;">
                                            <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                                                <div style="width: ${b.percent}%; height: 100%; background: linear-gradient(90deg, #f39c12, #f1c40f); border-radius: 4px;"></div>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- So'nggi imzolar -->
                    <div style="background: rgba(0,0,0,0.2); border-radius: 15px; padding: 20px;">
                        <h4 style="margin: 0 0 15px 0; color: #ffd700;"><i class="fas fa-clock-rotate-left"></i> So'nggi Imzolar</h4>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${allLogs.map(l => `
                                <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; border-left: 3px solid #2ecc71;">
                                    <div style="font-weight: bold; font-size: 0.9rem;">${l.workerName}</div>
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                                        <span style="font-size: 0.75rem; color: #aaa;">${l.type || 'Yo\'riqnoma'}</span>
                                        <span style="font-size: 0.75rem; color: #2ecc71; font-family: monospace;">${new Date(l.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            `).join('')}
                            ${allLogs.length === 0 ? '<p style="color: #666; font-style: italic; text-align: center; margin-top: 20px;">Bugun hali imzolar yo\'q</p>' : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Export globally
window.renderSafetyDashboard = renderSafetyDashboard;
window.renderWorkerList = renderWorkerList;
window.openInstructionModal = openInstructionModal;
window.saveSignature = saveSignature;
window.closeInstructionModal = closeInstructionModal;
window.clearSignature = clearSignature;
window.getCentralSafetyMonitorHTML = getCentralSafetyMonitorHTML;
