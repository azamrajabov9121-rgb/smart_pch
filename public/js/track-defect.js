/**
 * SMART TRACK-DEFECT MONITOR v2.0
 * Lenta yuklash + Kamchiliklar monitoring tizimi
 * - Ishlab chiqarish: Umumiy PDF lenta yuklaydi (har sahifa = 1 KM)
 * - Bo'linmalar: Faqat o'z KM chegarasidagi lentalarni ko'radi
 * - 3-4 daraja kamchiliklar batafsil, 2-daraja faqat soni
 */

const BOLINMA_BORDERS = [
    { name: "1-bo'linma", start: 4020, end: 4050 },
    { name: "2-bo'linma", start: 4051, end: 4083 },
    { name: "3-bo'linma", start: 4084, end: 4117 },
    { name: "4-bo'linma", start: 4118, end: 4150 },
    { name: "5-bo'linma", start: 4151, end: 4183 },
    { name: "6-bo'linma", start: 4184, end: 4205 },
    { name: "7-bo'linma", start: 4206, end: 4233 },
    { name: "8-bo'linma", start: 4234, end: 4260 },
    { name: "9-bo'linma", start: 4261, end: 4289 },
    { name: "10-bo'linma", start: 4290, end: 4303 }
];

function findBolinmaByKm(km) {
    for (let bol of BOLINMA_BORDERS) {
        if (km >= bol.start && km <= bol.end) return bol.name;
    }
    return "Noma'lum";
}

function getBolinmaKmRange(bolinmaId) {
    if (!bolinmaId || bolinmaId === 'ishlab-chiqarish' || bolinmaId === 'all') return null;
    for (let bol of BOLINMA_BORDERS) {
        if (bol.name === bolinmaId || bolinmaId.includes(bol.name.replace("-bo'linma", ''))) return bol;
    }
    return null;
}

// ===================== IndexedDB for Tape Images =====================
const TAPE_DB_NAME = 'SmartTrackTapeDB';
const TAPE_STORE = 'tapeImages';

function openTapeDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(TAPE_DB_NAME, 1);
        req.onupgradeneeded = e => { e.target.result.createObjectStore(TAPE_STORE, { keyPath: 'km' }); };
        req.onsuccess = e => resolve(e.target.result);
        req.onerror = e => reject(e.target.error);
    });
}

async function saveTapeImage(km, imageDataUrl) {
    const db = await openTapeDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(TAPE_STORE, 'readwrite');
        tx.objectStore(TAPE_STORE).put({ km: parseInt(km), image: imageDataUrl, uploadDate: new Date().toISOString() });
        tx.oncomplete = () => resolve();
        tx.onerror = e => reject(e.target.error);
    });
}

async function getTapeImage(km) {
    const db = await openTapeDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(TAPE_STORE, 'readonly');
        const req = tx.objectStore(TAPE_STORE).get(parseInt(km));
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = e => reject(e.target.error);
    });
}

async function getAllTapeKms() {
    const db = await openTapeDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(TAPE_STORE, 'readonly');
        const req = tx.objectStore(TAPE_STORE).getAllKeys();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = e => reject(e.target.error);
    });
}

// ===================== MAIN HTML GENERATOR =====================
window.generateTrackDefectHTML = function (bolinmaId, isInline = false) {
    let storageKey = 'track_defects_data';
    let storedData = localStorage.getItem(storageKey);
    let defects = [];
    if (!storedData) {
        defects = [
            { id: 1, bolinma: "1-bo'linma", km: 4025, pk: 4, degree: 3, type: "Cho'kish (Pr)", status: "open", date: "2026-03-07", description: "O'ng tomonga cho'kish 12mm" },
            { id: 2, bolinma: "1-bo'linma", km: 4025, pk: 7, degree: 2, type: "Kengayish (Ush)", status: "open", date: "2026-03-05", description: "Kengayish 18mm" },
            { id: 3, bolinma: "2-bo'linma", km: 4070, pk: 8, degree: 4, type: "Siljish (R)", status: "open", date: "2026-03-08", description: "Tezlikni 40 km/soat ga cheklash" },
            { id: 4, bolinma: "5-bo'linma", km: 4160, pk: 2, degree: 3, type: "Cho'kish", status: "in_progress", date: "2026-03-07", description: "Chap rels cho'kishi" },
            { id: 5, bolinma: "6-bo'linma", km: 4190, pk: 6, degree: 2, type: "Balandlik (V)", status: "open", date: "2026-03-08", description: "Balandlik o'zgarishi 10mm" }
        ];
        localStorage.setItem(storageKey, JSON.stringify(defects));
    } else {
        defects = JSON.parse(storedData);
    }
    window.trackDefectsData = defects; // Make it globally accessible

    let isMasterKey = (bolinmaId === 'ishlab-chiqarish' || !bolinmaId || bolinmaId === 'all');
    let filteredDefects = isMasterKey
        ? defects
        : defects.filter(d => (d.bolinma === bolinmaId || bolinmaId.includes(d.bolinma.replace("-bo'linma", ''))));

    // Separate by degree
    let critical34 = filteredDefects.filter(d => d.degree >= 3 && d.status !== 'fixed');
    let degree2Count = filteredDefects.filter(d => d.degree === 2).length;
    let total = filteredDefects.length;
    let fixed = filteredDefects.filter(d => d.status === 'fixed').length;

    // Group 2-degree by KM for summary
    let degree2ByKm = {};
    filteredDefects.filter(d => d.degree === 2).forEach(d => {
        degree2ByKm[d.km] = (degree2ByKm[d.km] || 0) + 1;
    });

    // Get KM range for bolinma filtering
    let bolinmaRange = getBolinmaKmRange(bolinmaId);

    return `
        <div class="window-header" style="background: linear-gradient(135deg, #1e293b, #0f172a); border-bottom: 2px solid #e74c3c; ${isInline ? 'border-radius: 15px 15px 0 0;' : ''}">
            <div>
                <h2 class="department-name" style="color: #e74c3c; text-shadow: 0 0 10px rgba(231, 76, 60, 0.4); display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-satellite-dish"></i> SMART TRACK-DEFECT MONITOR (${isMasterKey ? "Barcha bo'linmalar" : bolinmaId})
                </h2>
                <div style="color: #94a3b8; font-size: 0.9rem; margin-top: 5px; font-weight: bold;">
                    <i class="fas fa-map-marker-alt" style="color: #f59e0b;"></i> ${bolinmaRange ? bolinmaRange.start + ' km – ' + bolinmaRange.end + ' km' : '4020 km – 4303 km (284 km)'}
                </div>
            </div>
            ${!isInline ? `
            <button type="button" class="close-btn" onclick="document.getElementById('track-defect-modal').classList.remove('active')" style="color: #cbd5e1; transition: 0.3s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#cbd5e1'">
                <i class="fas fa-times"></i>
            </button>` : ''}
        </div>
        <div class="window-content" style="padding: 20px; background: linear-gradient(160deg, #0f172a 0%, #1e293b 100%); color: #f8fafc; display: flex; flex-direction: column; gap: 15px; ${isInline ? 'border-radius: 0 0 15px 15px; height: 800px; max-height: 85vh;' : ''}">
            
            <!-- KPI Cards -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="color: #94a3b8; font-size: 0.8rem; font-weight: bold;">JAMI</div>
                        <div style="font-size: 1.8rem; font-weight: 800;">${total}</div>
                    </div>
                    <i class="fas fa-clipboard-list" style="font-size: 2rem; color: #38bdf8; opacity: 0.5;"></i>
                </div>
                <div style="background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.2); padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="color: #ef4444; font-size: 0.8rem; font-weight: bold;">3-4 DARAJA</div>
                        <div style="font-size: 1.8rem; font-weight: 800; color: #ef4444;">${critical34.length}</div>
                    </div>
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444; opacity: 0.8;"></i>
                </div>
                <div style="background: rgba(245,158,11,0.05); border: 1px solid rgba(245,158,11,0.2); padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="color: #f59e0b; font-size: 0.8rem; font-weight: bold;">2-DARAJA (soni)</div>
                        <div style="font-size: 1.8rem; font-weight: 800; color: #f59e0b;">${degree2Count}</div>
                    </div>
                    <i class="fas fa-info-circle" style="font-size: 2rem; color: #f59e0b; opacity: 0.8;"></i>
                </div>
                <div style="background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2); padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="color: #10b981; font-size: 0.8rem; font-weight: bold;">YOPILGAN</div>
                        <div style="font-size: 1.8rem; font-weight: 800; color: #10b981;">${fixed}</div>
                    </div>
                    <i class="fas fa-check-circle" style="font-size: 2rem; color: #10b981; opacity: 0.8;"></i>
                </div>
                <!-- NEW: Repeat Rate KPI -->
                <div style="background: rgba(255,255,255,0.03); border: 1px solid ${filteredDefects.filter(d => d.isRepeated).length > 0 ? '#f59e0b' : 'rgba(255,255,255,0.08)'}; padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="color: #94a3b8; font-size: 0.8rem; font-weight: bold;">TAKRORIY (XRONIK)</div>
                        <div style="font-size: 1.8rem; font-weight: 800; color: ${filteredDefects.filter(d => d.isRepeated).length > 0 ? '#f59e0b' : '#f8fafc'};">${filteredDefects.filter(d => d.isRepeated).length}</div>
                    </div>
                    <i class="fas fa-history" style="font-size: 2rem; color: #f59e0b; opacity: 0.5;"></i>
                </div>
            </div>

            <!-- Main Area: Lenta + Defects -->
            <div style="display: grid; grid-template-columns: 2fr 3fr; gap: 15px; flex: 1; overflow: hidden; min-height: 0;">
                
                <!-- LEFT: Lenta Panel -->
                <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; display: flex; flex-direction: column; min-height: 0;">
                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(56,189,248,0.3);">
                        <h3 style="color: #38bdf8; margin: 0; font-size: 1rem;">
                            <i class="fas fa-scroll"></i> Yo'l Lentasi
                        </h3>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            ${isMasterKey ? `<button type="button" onclick="window.openTapeUploadModal()" style="background: linear-gradient(135deg, #10b981, #059669); border: none; color: white; padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: bold;">
                                <i class="fas fa-upload"></i> PDF Yuklash
                            </button>` : ''}
                            <select id="lentaKmSelect" onchange="window.showTapeForKm(this.value)" style="background: #0f172a; border: 1px solid #334155; color: #38bdf8; padding: 3px 6px; border-radius: 4px; font-weight: bold; font-size: 0.85rem;">
                                <option value="">KM tanlang...</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- 2-daraja KM summary -->
                    ${Object.keys(degree2ByKm).length > 0 ? `
                    <div style="background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); border-radius: 8px; padding: 8px 12px; margin-bottom: 10px; font-size: 0.8rem;">
                        <div style="color: #f59e0b; font-weight: bold; margin-bottom: 4px;"><i class="fas fa-info-circle"></i> 2-daraja kamchiliklar (faqat soni):</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${Object.entries(degree2ByKm).map(([km, count]) => `
                                <span style="background: rgba(245,158,11,0.15); padding: 2px 8px; border-radius: 10px; color: #fbbf24; font-weight: bold; cursor: pointer;" onclick="window.showTapeForKm(${km})">km ${km}: ${count} ta</span>
                            `).join('')}
                        </div>
                    </div>` : ''}

                    <!-- Tape Image Display -->
                    <div id="tape-display-area" style="flex: 1; background: #000; border: 1px solid #334155; border-radius: 8px; overflow-y: auto; display: flex; align-items: center; justify-content: center; min-height: 200px;">
                        <div style="text-align: center; color: #475569; padding: 30px;">
                            <i class="fas fa-scroll" style="font-size: 3rem; opacity: 0.3;"></i>
                            <p style="margin-top: 10px; font-size: 0.85rem;">KM tanlang yoki kamchilik ustiga bosing</p>
                            <p style="font-size: 0.75rem; color: #334155;">Lenta yuklanmagan bo'lsa, "PDF Yuklash" tugmasini bosing</p>
                        </div>
                    </div>
                </div>

                <!-- RIGHT: 3-4 Daraja Defect Cards -->
                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; display: flex; flex-direction: column; min-height: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 10px; flex-shrink: 0;">
                        <h3 style="color: #f8fafc; margin: 0; font-size: 1rem;">
                            <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i> 3-4 Daraja Kamchiliklar
                        </h3>
                        <div style="display: flex; gap: 8px;">
                            ${(isMasterKey || (typeof currentUser !== 'undefined' && currentUser.role === 'admin')) ? `
                            <button type="button" onclick="window.openAddDefectModal()" style="background: linear-gradient(135deg, #e74c3c, #c0392b); border: none; color: white; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.8rem;">
                                <i class="fas fa-plus"></i> Yangi (3-4)
                            </button>
                            <button type="button" onclick="window.SmartUtils.showToast('PDF hisobot shakllantirilmoqda...', 'info')" style="background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.3); color: #38bdf8; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">
                                <i class="fas fa-download"></i> PDF
                            </button>` : ''}
                        </div>
                    </div>

                    <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 5px;">
                        ${filteredDefects.filter(d => d.degree >= 3).sort((a, b) => b.id - a.id).map(d => {
        let sc = d.status === 'fixed' ? '#10b981' : (d.status === 'in_progress' ? '#f59e0b' : '#ef4444');
        let si = d.status === 'fixed' ? 'fa-check' : (d.status === 'in_progress' ? 'fa-tools' : 'fa-exclamation');
        let st = d.status === 'fixed' ? 'YOPILDI' : (d.status === 'in_progress' ? 'BARTARAF ETILMOQDA' : 'OCHIQ');
        let pulse = (d.degree === 4 && d.status === 'open') ? 'animation: pulseRed 2s infinite;' : '';
        let repeatBadge = d.isRepeated ? `<span class="repeat-pulse" style="background: rgba(245,158,11,0.2); border: 1px solid #f59e0b; color: #f59e0b; padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: bold; margin-left:8px;"><i class="fas fa-history"></i> TAKRORIY</span>` : '';
        let repeatWarning = d.isRepeated ? `<div style="color: #f59e0b; font-size: 0.75rem; margin-top: 5px; font-style: italic; background: rgba(245,158,11,0.05); padding: 4px 8px; border-radius: 4px; border-left: 2px solid #f59e0b;">
            <i class="fas fa-user-ninja"></i> Ogohlantirish: Bu nuqson avval ham aniqlangan! Ustaning ishi nazoratga olinsin.
        </div>` : '';

        return `
                        <div onclick="window.showTapeForKm(${d.km})" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-left: 4px solid ${sc}; border-radius: 8px; padding: 12px; cursor: pointer; ${pulse} transition: 0.3s; display: grid; grid-template-columns: 1.5fr 2.5fr auto; gap: 10px; align-items: center;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                            <div>
                                <div style="font-size: 1rem; font-weight: bold; color: #f8fafc; font-family: monospace;">km ${d.km} pk ${d.pk} ${repeatBadge}</div>
                                <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 3px;"><i class="fas fa-building"></i> ${d.bolinma}</div>
                                <div style="color: ${d.degree >= 4 ? '#ef4444' : '#f59e0b'}; font-weight: bold; font-size: 0.85rem; margin-top: 3px;"><i class="fas fa-thermometer-half"></i> ${d.degree}-daraja</div>
                            </div>
                            <div style="border-left: 1px solid rgba(255,255,255,0.1); padding-left: 10px;">
                                <div style="color: #38bdf8; font-weight: bold; font-size: 0.9rem;">${d.type}</div>
                                <div style="color: #cbd5e1; font-size: 0.85rem;">${d.description}</div>
                                ${repeatWarning}
                                <div style="color: #64748b; font-size: 0.7rem; margin-top: 4px;"><i class="fas fa-calendar-alt"></i> ${d.date}</div>
                            </div>
                            <div style="text-align: right; display: flex; flex-direction: column; gap: 6px; align-items: flex-end;">
                                <span style="background: ${sc}20; border: 1px solid ${sc}50; color: ${sc}; padding: 3px 8px; border-radius: 10px; font-size: 0.7rem; font-weight: bold;">
                                    <i class="fas ${si}"></i> ${st}
                                </span>
                                <span style="color: #475569; font-size: 0.65rem;"><i class="fas fa-scroll"></i> Lentani ko'rish</span>
                            </div>
                        </div>`}).join('')}
                        ${filteredDefects.filter(d => d.degree >= 3).length === 0 ? '<div style="text-align: center; color: #475569; padding: 40px;"><i class="fas fa-check-circle" style="font-size: 2rem;"></i><p>3-4 daraja kamchilik topilmadi</p></div>' : ''}
                    </div>
                </div>
            </div>

            <!-- NEW: Chronic Issues Summary (Master Control) -->
            ${filteredDefects.filter(d => d.isRepeated).length > 0 ? `
            <div style="background: rgba(245,158,11,0.05); border: 1px solid rgba(245,158,11,0.2); border-radius: 12px; padding: 12px 15px; display: flex; align-items: center; gap: 20px;">
                <div style="background: #f59e0b; color: #000; width: 45px; height: 45px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0;">
                    <i class="fas fa-user-shield" style="color: #000 !important;"></i>
                </div>
                <div style="flex: 1;">
                    <div style="color: #f59e0b; font-weight: 800; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Xronik nuqsonlar tahlili (Nazorat)</div>
                    <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 2px;">
                        Aniqlangan ${filteredDefects.filter(d => d.isRepeated).length} ta takroriy nuqson yo'l ustalarining ish sifatiga past baho berilishiga asos bo'ladi.
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    ${[...new Set(filteredDefects.filter(d => d.isRepeated).map(d => d.bolinma))].map(bol => `
                        <span style="background: rgba(239,68,68,0.1); border: 1px solid #ef4444; color: #ef4444; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: bold;">
                            <i class="fas fa-exclamation-circle"></i> ${bol}
                        </span>
                    `).join('')}
                </div>
            </div>` : ''}
        </div>
        <style>
            @keyframes pulseRed {
                0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
            }
            @keyframes pulseYellow {
                0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
                70% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
                100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
            }
            .repeat-pulse { animation: pulseYellow 2s infinite; }
        </style>
    `;
};

// ===================== Show Tape for KM =====================
window.showTapeForKm = async function (km) {
    if (!km) return;
    km = parseInt(km);
    const display = document.getElementById('tape-display-area');
    if (!display) return;

    // Update selector
    const sel = document.getElementById('lentaKmSelect');
    if (sel) sel.value = km;

    display.innerHTML = `<div style="text-align: center; color: #38bdf8; padding: 20px;"><i class="fas fa-spinner fa-spin" style="font-size: 1.5rem;"></i><p style="font-size: 0.8rem; margin-top: 8px;">km ${km} lentasi yuklanmoqda...</p></div>`;

    try {
        const tape = await getTapeImage(km);
        if (tape && tape.image) {
            display.innerHTML = `
                <div style="width: 100%; height: 100%; display: flex; flex-direction: column; position: relative; border-radius: 8px; overflow: hidden;">
                    <div style="background: rgba(15, 23, 42, 0.95); padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; z-index: 5; border-bottom: 1px solid rgba(56,189,248,0.3);">
                        <span style="color: #38bdf8; font-weight: bold; font-size: 0.9rem;"><i class="fas fa-scroll"></i> KM ${km} Lentasi</span>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <span style="color: #64748b; font-size: 0.75rem;">${tape.uploadDate ? new Date(tape.uploadDate).toLocaleDateString() : ''}</span>
                            <button type="button" onclick="window.openTapeViewerFullScreen(${km})" style="background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: white; padding: 6px 15px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: bold; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); text-shadow: 0 1px 2px rgba(0,0,0,0.5); transition: 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                <i class="fas fa-expand"></i> Katta ko'rish (Analiz)
                            </button>
                        </div>
                    </div>
                    <div style="position: relative; width: 100%; flex: 1; min-height: 250px; cursor: zoom-in; overflow: hidden; display: flex; align-items: flex-start; justify-content: center; background: #000;" onclick="window.openTapeViewerFullScreen(${km})">
                        <img src="${tape.image}" style="max-width: 100%; height: auto; max-height: 100%; object-fit: contain; display: block;" alt="KM ${km} lentasi"/>
                        <div style="position: absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0); transition: 0.3s;" onmouseover="this.style.background='rgba(56, 189, 248, 0.05)'; this.childNodes[1].style.transform='scale(1)'; this.childNodes[1].style.opacity='1';" onmouseout="this.style.background='rgba(0,0,0,0)'; this.childNodes[1].style.transform='scale(0.8)'; this.childNodes[1].style.opacity='0';">
                            <div style="background: rgba(0,0,0,0.8); padding: 15px 30px; border-radius: 50px; border: 1px solid #38bdf8; color: #38bdf8; font-weight: bold; font-size: 1.1rem; display: flex; align-items: center; gap: 10px; transform: scale(0.8); opacity: 0; transition: 0.3s; box-shadow: 0 0 25px rgba(56,189,248,0.5);">
                                <i class="fas fa-search-plus"></i> Analiz Rejimi
                            </div>
                        </div>
                    </div>
                </div>`;
        } else {
            display.innerHTML = `
                <div style="text-align: center; color: #64748b; padding: 30px;">
                    <i class="fas fa-image" style="font-size: 2.5rem; opacity: 0.3;"></i>
                    <p style="margin-top: 10px; font-size: 0.85rem;">KM ${km} uchun lenta yuklanmagan</p>
                    <p style="font-size: 0.75rem; color: #475569;">Ishlab chiqarish bo'limi "PDF Yuklash" orqali yuklashi kerak</p>
                </div>`;
        }
    } catch (err) {
        display.innerHTML = `<div style="text-align: center; color: #ef4444; padding: 20px;"><i class="fas fa-exclamation-circle"></i> Xatolik: ${err.message}</div>`;
    }
};

// ===================== FULLSCREEN LENTA VIEWER (ANALIZ) =====================
window.openTapeViewerFullScreen = async function (km) {
    if (!km) return;
    const tape = await getTapeImage(km);
    if (!tape || !tape.image) return;

    let defects = window.trackDefectsData || JSON.parse(localStorage.getItem('track_defects_data')) || [];
    let kmDefects = defects.filter(d => d.km === km && d.status !== 'fixed' && d.degree >= 3);

    let modal = document.getElementById('tape-fullscreen-viewer');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tape-fullscreen-viewer';
        modal.innerHTML = `
            <style>
                .glass-panel-top {
                    background: rgba(15, 23, 42, 0.75);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                }
                .zoom-btn {
                    background: rgba(255,255,255,0.05); color: #f8fafc; border: 1px solid rgba(255,255,255,0.1);
                    width: 44px; height: 44px; border-radius: 10px; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: 0.2s;
                }
                .zoom-btn:hover { background: rgba(56,189,248,0.2); border-color: #38bdf8; color: #38bdf8; box-shadow: 0 0 15px rgba(56,189,248,0.3); transform: translateY(-2px); }
                .zoom-btn:active { transform: translateY(0); }
                
                .defect-box {
                    position: absolute; border: 2px solid; background: transparent; 
                    cursor: pointer; transition: 0.2s; border-radius: 4px; z-index: 10;
                }
                .defect-box:hover { z-index: 1000; background: rgba(255,255,255,0.1); }
                .defect-tooltip {
                    position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
                    background: rgba(15,23,42,0.95); color: white; padding: 8px 12px; border-radius: 8px;
                    font-size: 0.8rem; white-space: nowrap; pointer-events: none; opacity: 0; transition: 0.3s;
                    border: 1px solid; margin-bottom: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.8); backdrop-filter: blur(5px);
                }
                .defect-box:hover .defect-tooltip { opacity: 1; bottom: calc(100% + 5px); }
                
                .ruler-x { position: absolute; top: 0; bottom: 0; width: 1.5px; background: #38bdf8; pointer-events: none; display: none; box-shadow: 0 0 8px #38bdf8, 0 0 2px #fff; z-index: 50;}
                .ruler-y { position: absolute; left: 0; right: 0; height: 1.5px; background: #38bdf8; pointer-events: none; display: none; box-shadow: 0 0 8px #38bdf8, 0 0 2px #fff; z-index: 50;}
                .ruler-label { 
                    position: absolute; background: rgba(15,23,42,0.9); color: #38bdf8; padding: 5px 10px; font-size: 0.8rem; 
                    border-radius: 6px; pointer-events: none; z-index: 51; border: 1px solid rgba(56,189,248,0.5); font-weight: bold; font-family: monospace;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
                }
                
                .night-mode-active img { filter: invert(0.9) hue-rotate(180deg) brightness(1.3) contrast(1.5); }
                
                @keyframes pulseRedElite {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6), inset 0 0 10px rgba(239, 68, 68, 0.4); }
                    70% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0), inset 0 0 5px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0), inset 0 0 10px rgba(239, 68, 68, 0); }
                }
            </style>
            
            <div class="glass-panel-top" style="position: absolute; top: 25px; left: 50%; transform: translateX(-50%); padding: 12px 25px; border-radius: 16px; z-index: 100; display: flex; gap: 25px; align-items: center;">
                <div style="color: #f8fafc; font-weight: bold; font-size: 1.2rem; display: flex; align-items: center; gap: 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
                    <i class="fas fa-satellite-dish" style="color: #38bdf8;"></i> RADAR / KM ${km}
                </div>
                <div style="width: 1px; height: 25px; background: rgba(255,255,255,0.15);"></div>
                <div style="display: flex; gap: 12px;">
                    <button type="button" class="zoom-btn" onclick="window.tapeZoomAction(-0.3)" title="Kichraytirish"><i class="fas fa-search-minus"></i></button>
                    <button type="button" class="zoom-btn" onclick="window.tapeZoomAction(0.3)" title="Kattalashtirish"><i class="fas fa-search-plus"></i></button>
                    <button type="button" class="zoom-btn" onclick="window.resetTapeZoomAction()" title="Asliga qaytarish"><i class="fas fa-expand-arrows-alt"></i></button>
                    <button type="button" id="nightModeBtn" class="zoom-btn" onclick="window.toggleNightModeAction()" title="Tungi rejim (Kontrast)"><i class="fas fa-moon"></i></button>
                </div>
                <div style="width: 1px; height: 25px; background: rgba(255,255,255,0.15);"></div>
                <button type="button" onclick="window.closeTapeViewerAction()" style="background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.4); padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 0.95rem; display: flex; align-items: center; gap: 8px; transition: 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.3)'; this.style.borderColor='#ef4444';" onmouseout="this.style.background='rgba(239,68,68,0.15)'; this.style.borderColor='rgba(239,68,68,0.4)';">
                    <i class="fas fa-times-circle"></i> Yopish
                </button>
            </div>

            <div id="tape-wrapper" style="width: 100%; height: 100%; position: relative; overflow: hidden; background: #070b14; cursor: grab;">
                <div id="tape-transform-layer" style="transform-origin: 0 0; position: absolute; top: 0; left: 0; transition: transform 0.1s ease-out;">
                    <img id="tape-image" src="" alt="Tape" style="display: block; pointer-events: none; user-select: none; box-shadow: 0 0 50px rgba(255,255,255,0.05);">
                    <div id="tape-defects-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: auto;"></div>
                </div>

                <!-- Radar Lines -->
                <div id="radar-x" class="ruler-x"></div>
                <div id="radar-y" class="ruler-y"></div>
                <div id="radar-label" class="ruler-label" style="display: none;"></div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(2, 6, 23, 0.95); z-index:10030; display:flex; flex-direction:column; overflow:hidden; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); opacity: 0; transform: scale(1.02); backdrop-filter: blur(5px);';

        // Expose functions globally once
        window.tapeState = { scale: 1, panX: 0, panY: 0, isPanning: false, km: km };

        window.applyTapeTransform = function () {
            const layer = document.getElementById('tape-transform-layer');
            if (layer) layer.style.transform = `translate(${window.tapeState.panX}px, ${window.tapeState.panY}px) scale(${window.tapeState.scale})`;
        };

        window.tapeZoomAction = function (delta, originX = null, originY = null) {
            let newScale = window.tapeState.scale + delta;
            if (newScale < 0.2) newScale = 0.2;
            if (newScale > 10) newScale = 10;

            const wrapper = document.getElementById('tape-wrapper');
            let cx = originX !== null ? originX : wrapper.clientWidth / 2;
            let cy = originY !== null ? originY : wrapper.clientHeight / 2;

            window.tapeState.panX = cx - (cx - window.tapeState.panX) * (newScale / window.tapeState.scale);
            window.tapeState.panY = cy - (cy - window.tapeState.panY) * (newScale / window.tapeState.scale);
            window.tapeState.scale = newScale;
            window.applyTapeTransform();
        };

        window.resetTapeZoomAction = function () {
            const img = document.getElementById('tape-image');
            const wrapper = document.getElementById('tape-wrapper');
            if (img.naturalWidth > 0 && wrapper.clientWidth > 0) {
                // Fit to width by default so it's readable
                let wScale = wrapper.clientWidth / img.naturalWidth;
                window.tapeState.scale = wScale < 1 ? wScale * 0.9 : 1;
            } else {
                window.tapeState.scale = 1;
            }
            window.tapeState.panX = (wrapper.clientWidth - (img.naturalWidth * window.tapeState.scale)) / 2;
            window.tapeState.panY = 50;
            window.applyTapeTransform();
        };

        window.toggleNightModeAction = function () {
            const wrapper = document.getElementById('tape-wrapper');
            const btn = document.getElementById('nightModeBtn');
            if (wrapper.classList.contains('night-mode-active')) {
                wrapper.classList.remove('night-mode-active');
                btn.innerHTML = '<i class="fas fa-moon"></i>';
                btn.style.color = "#f8fafc";
                btn.style.borderColor = "rgba(255,255,255,0.1)";
            } else {
                wrapper.classList.add('night-mode-active');
                btn.innerHTML = '<i class="fas fa-sun"></i>';
                btn.style.color = "#f59e0b";
                btn.style.borderColor = "#f59e0b";
            }
        };

        window.closeTapeViewerAction = function () {
            const m = document.getElementById('tape-fullscreen-viewer');
            if (m) {
                m.style.opacity = '0';
                m.style.transform = 'scale(0.98)';
                setTimeout(() => { m.remove(); }, 400);
            }
        };

        // Render Defects AI Boxes
        window.renderDefectAIBox = function (defects, imgW, imgH) {
            const container = document.getElementById('tape-defects-container');
            container.innerHTML = '';
            defects.forEach(d => {
                let pkRatio = d.pk ? ((d.pk - 1) / 10) + 0.05 : Math.random() * 0.9;
                // Assumes Y-axis is longitudinal length
                let boxHeight = imgH * 0.05; // 5% of height per defect box approx
                let boxWidth = imgW * 0.2;   // 20% width per lane
                let yPos = pkRatio * imgH - (boxHeight / 2);

                let laneIdx = 0;
                if (d.type.includes('Siljish') || d.type.includes('Burchak')) laneIdx = 1;
                else if (d.type.includes('Kengayish') || d.type.includes('Torayish')) laneIdx = 2;
                else if (d.type.includes('Kortka')) laneIdx = 3;
                let xPos = (imgW / 4) * laneIdx + (imgW / 8) - (boxWidth / 2);

                let isCritical = d.degree === 4;
                let color = isCritical ? '#ef4444' : '#f59e0b';

                const box = document.createElement('div');
                box.className = 'defect-box';
                box.style.width = boxWidth + 'px';
                box.style.height = boxHeight + 'px';
                box.style.left = xPos + 'px';
                box.style.top = yPos + 'px';
                box.style.borderColor = color;
                box.style.backgroundColor = isCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)';

                if (isCritical) {
                    box.style.animation = 'pulseRedElite 2s infinite';
                    box.style.boxShadow = '0 0 20px rgba(239,68,68,0.5), inset 0 0 10px rgba(239,68,68,0.5)';
                }

                box.innerHTML = `
                    <div class="defect-tooltip" style="border-color: ${color}">
                        <div style="font-size: 0.95rem; color: ${color}; margin-bottom: 3px;">
                            ${isCritical ? '<i class="fas fa-skull-crossbones"></i> O\'TA XAVFLI' : '<i class="fas fa-exclamation-triangle"></i> XAVFLI'}
                        </div>
                        <span style="color: #cbd5e1">${d.type}</span><br>
                        <span style="color: #94a3b8; font-size: 0.7rem;">km ${d.km} pk ${d.pk}</span>
                    </div>
                `;
                container.appendChild(box);
            });
        };

        // Events listeners for pan/zoom/radar
        const wrap = document.getElementById('tape-wrapper');
        let startX = 0, startY = 0, pStartX = 0, pStartY = 0;

        wrap.addEventListener('mousedown', (e) => {
            if (e.target.closest('.glass-panel-top')) return;
            window.tapeState.isPanning = true;
            startX = e.clientX; startY = e.clientY;
            pStartX = window.tapeState.panX; pStartY = window.tapeState.panY;
            wrap.style.cursor = 'grabbing';
            document.getElementById('tape-transform-layer').style.transition = 'none'; // disable transition while panning
        });

        window.addEventListener('mousemove', (e) => {
            const mViewer = document.getElementById('tape-fullscreen-viewer');
            if (!mViewer) return;

            const rect = wrap.getBoundingClientRect();
            let mouseX = e.clientX - rect.left;
            let mouseY = e.clientY - rect.top;

            // Radar
            const rx = document.getElementById('radar-x');
            const ry = document.getElementById('radar-y');
            const rL = document.getElementById('radar-label');

            if (mouseX >= 0 && mouseX <= rect.width && mouseY >= 0 && mouseY <= rect.height && !e.target.closest('.glass-panel-top')) {
                rx.style.display = 'block'; ry.style.display = 'block'; rL.style.display = 'block';
                rx.style.left = mouseX + 'px'; ry.style.top = mouseY + 'px';
                rL.style.left = (mouseX + 15) + 'px'; rL.style.top = (mouseY + 15) + 'px';

                const img = document.getElementById('tape-image');
                if (img && img.naturalHeight) {
                    const realY = (mouseY - window.tapeState.panY) / window.tapeState.scale;
                    let ratio = realY / img.naturalHeight;
                    ratio = Math.max(0, Math.min(1, ratio));
                    let metr = Math.round(ratio * 1000);
                    let pk = Math.floor(metr / 100) + 1;
                    if (pk > 10) pk = 10;
                    rL.innerHTML = `<i class="fas fa-crosshairs"></i> PK ${pk} | ${metr}m`;
                }
            } else {
                rx.style.display = 'none'; ry.style.display = 'none'; rL.style.display = 'none';
            }

            // Panning
            if (!window.tapeState.isPanning) return;
            window.tapeState.panX = pStartX + (e.clientX - startX);
            window.tapeState.panY = pStartY + (e.clientY - startY);
            window.applyTapeTransform();
        });

        window.addEventListener('mouseup', () => {
            window.tapeState.isPanning = false;
            wrap.style.cursor = 'grab';
            document.getElementById('tape-transform-layer').style.transition = 'transform 0.1s ease-out';
        });

        wrap.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = wrap.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            let delta = e.deltaY < 0 ? 0.3 : -0.3;
            window.tapeZoomAction(delta, mx, my);
        }, { passive: false });
    }

    // Update image and show
    const img = document.getElementById('tape-image');
    img.src = tape.image;
    window.tapeState.km = km;

    img.onload = () => {
        window.resetTapeZoomAction();
        window.renderDefectAIBox(kmDefects, img.naturalWidth, img.naturalHeight);
    };

    // Show modal with animation
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    }, 10);
};



// ===================== Populate KM Selector =====================
window.populateLentaKmSelector = async function (bolinmaId) {
    const sel = document.getElementById('lentaKmSelect');
    if (!sel) return;

    const allKms = await getAllTapeKms();
    const range = getBolinmaKmRange(bolinmaId);

    // Filter KMs by bolinma range
    const filteredKms = range ? allKms.filter(km => km >= range.start && km <= range.end) : allKms;

    sel.innerHTML = '<option value="">KM tanlang...</option>';
    filteredKms.sort((a, b) => a - b).forEach(km => {
        const opt = document.createElement('option');
        opt.value = km;
        opt.textContent = 'km ' + km;
        sel.appendChild(opt);
    });
};

// ===================== PDF Upload Modal =====================
window.openTapeUploadModal = function () {
    let modal = document.getElementById('tape-upload-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tape-upload-modal';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:10020; display:flex; align-items:center; justify-content:center;';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background:#1e293b; width: 600px; max-height: 80vh; overflow-y: auto; padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); color: white;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #38bdf8;"><i class="fas fa-upload"></i> Lenta PDF Yuklash</h3>
                <button type="button" onclick="document.getElementById('tape-upload-modal').remove()" style="background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">&times;</button>
            </div>

            <div style="background: rgba(56,189,248,0.05); border: 1px dashed rgba(56,189,248,0.3); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
                <i class="fas fa-file-pdf" style="font-size: 3rem; color: #ef4444; margin-bottom: 10px;"></i>
                <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 15px;">
                    PDF faylni tanlang. Har bir sahifa bitta KM lentasi sifatida saqlanadi.<br>
                    <strong style="color: #f59e0b;">Boshlanish KM raqamini kiriting</strong> — keyin har sahifa +1 km bo'ladi.
                </p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; text-align: left;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #94a3b8; font-size: 0.85rem;">Boshlanish KM</label>
                        <input type="number" id="tapeStartKm" value="4020" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: white; font-size: 1.1rem; font-weight: bold;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #94a3b8; font-size: 0.85rem;">Yo'l raqami (Put')</label>
                        <select id="tapePutNumber" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: white;">
                            <option value="1">1-yo'l</option>
                            <option value="2">2-yo'l</option>
                        </select>
                    </div>
                </div>

                <input type="file" id="tapePdfFile" accept=".pdf,.jpg,.jpeg,.png" multiple style="display: none;">
                <button type="button" onclick="document.getElementById('tapePdfFile').click()" style="background: linear-gradient(135deg, #3b82f6, #2563eb); border: none; color: white; padding: 12px 30px; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 1rem;">
                    <i class="fas fa-folder-open"></i> Faylni Tanlash (PDF yoki Rasm)
                </button>
                <p id="tapeFileInfo" style="color: #64748b; font-size: 0.8rem; margin-top: 8px;"></p>
            </div>

            <div id="tapeUploadProgress" style="display: none; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: #94a3b8; font-size: 0.85rem;">Yuklanmoqda...</span>
                    <span id="tapeProgressText" style="color: #38bdf8; font-weight: bold;">0%</span>
                </div>
                <div style="background: #0f172a; border-radius: 10px; overflow: hidden; height: 8px;">
                    <div id="tapeProgressBar" style="height: 100%; background: linear-gradient(90deg, #10b981, #38bdf8); width: 0%; transition: width 0.3s; border-radius: 10px;"></div>
                </div>
            </div>

            <div id="tapeUploadResult" style="display: none; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; padding: 15px; text-align: center; color: #10b981; font-weight: bold;">
            </div>
        </div>
    `;

    // File input handler
    document.getElementById('tapePdfFile').addEventListener('change', handleTapeFileSelect);
};

// ===================== Handle File Selection =====================
async function handleTapeFileSelect(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const startKm = parseInt(document.getElementById('tapeStartKm').value) || 4020;
    const infoEl = document.getElementById('tapeFileInfo');
    const progressDiv = document.getElementById('tapeUploadProgress');
    const progressBar = document.getElementById('tapeProgressBar');
    const progressText = document.getElementById('tapeProgressText');
    const resultDiv = document.getElementById('tapeUploadResult');

    const file = files[0];
    const isPdf = file.type === 'application/pdf';

    if (isPdf) {
        infoEl.textContent = `PDF: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`;
        progressDiv.style.display = 'block';

        // Load PDF.js if needed
        if (!window.pdfjsLib) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            document.head.appendChild(script);
            await new Promise((resolve) => { script.onload = resolve; });
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const totalPages = pdf.numPages;
            let saved = 0;

            for (let i = 1; i <= totalPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                await page.render({ canvasContext: ctx, viewport: viewport }).promise;

                const imageData = canvas.toDataURL('image/jpeg', 0.85);

                // --- NEW AUTO KM DETECTION LOGIC ---
                let detectedKm = null;
                try {
                    const textContent = await page.getTextContent();
                    const textItems = textContent.items.map(item => item.str).join(' ');
                    // Search for "Km: 1234", "Км: 1234", "Км:1234" etc.
                    const kmMatch = textItems.match(/(?:Km|Км|КМ|KM)[:\s]*(\d{4})/i);
                    if (kmMatch && kmMatch[1]) {
                        detectedKm = parseInt(kmMatch[1]);
                        console.log(`Page ${i}: Detected KM ${detectedKm} from text`);
                    }
                } catch (textErr) {
                    console.warn(`Could not extract text from page ${i}`, textErr);
                }

                const km = detectedKm || (startKm + i - 1);
                await saveTapeImage(km, imageData);
                saved++;

                const pct = Math.round((i / totalPages) * 100);
                progressBar.style.width = pct + '%';
                progressText.textContent = `${pct}% (km ${km} ${detectedKm ? '✅' : '⚙️'})`;
            }

            progressDiv.style.display = 'none';
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${saved} ta KM lentasi saqlandi! (km ${startKm} – km ${startKm + saved - 1})`;

            // Refresh selector
            setTimeout(() => window.populateLentaKmSelector('ishlab-chiqarish'), 500);
        } catch (err) {
            progressDiv.style.display = 'none';
            resultDiv.style.display = 'block';
            resultDiv.style.borderColor = 'rgba(239,68,68,0.3)';
            resultDiv.style.background = 'rgba(239,68,68,0.1)';
            resultDiv.style.color = '#ef4444';
            resultDiv.innerHTML = `<i class="fas fa-times-circle"></i> Xatolik: ${err.message}`;
        }
    } else {
        // Image files — each image = 1 KM
        infoEl.textContent = `${files.length} ta rasm tanlandi`;
        progressDiv.style.display = 'block';
        let saved = 0;

        for (let i = 0; i < files.length; i++) {
            const reader = new FileReader();
            const imgData = await new Promise(resolve => {
                reader.onload = e => resolve(e.target.result);
                reader.readAsDataURL(files[i]);
            });
            const km = startKm + i;
            await saveTapeImage(km, imgData);
            saved++;
            const pct = Math.round(((i + 1) / files.length) * 100);
            progressBar.style.width = pct + '%';
            progressText.textContent = `${pct}% (km ${km})`;
        }

        progressDiv.style.display = 'none';
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${saved} ta KM lentasi saqlandi! (km ${startKm} – km ${startKm + saved - 1})`;
        setTimeout(() => window.populateLentaKmSelector('ishlab-chiqarish'), 500);
    }
}

// ===================== Open/Render Functions =====================
window.openTrackDefectMonitor = function (bolinmaId) {
    let modal = document.getElementById('track-defect-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'track-defect-modal';
        modal.className = 'department-window';
        modal.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; max-width: 100% !important; height: 100% !important; margin: 0 !important; padding: 0 !important; z-index: 10030 !important;';
        document.body.appendChild(modal);
    }
    modal.innerHTML = window.generateTrackDefectHTML(bolinmaId, false);
    modal.classList.add('active');
    setTimeout(() => window.populateLentaKmSelector(bolinmaId), 300);
};

window.renderInlineTrackDefectMonitor = function (containerId, bolinmaId) {
    let container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = window.generateTrackDefectHTML(bolinmaId, true);
    setTimeout(() => window.populateLentaKmSelector(bolinmaId), 300);
};

// ===================== Fix Defect =====================
window.openFixDefectModal = function (defectId) {
    let defects = window.trackDefectsData || JSON.parse(localStorage.getItem('track_defects_data')) || [];
    let idx = defects.findIndex(d => d.id === defectId);
    if (idx === -1) return;
    if (confirm("Kamchilik bartaraf etilganini tasdiqlaysizmi?")) {
        defects[idx].status = 'fixed';
        window.trackDefectsData = defects;
        localStorage.setItem('track_defects_data', JSON.stringify(defects));
        window.SmartUtils.showToast("Kamchilik yopildi!", "success");
        document.getElementById('track-defect-modal').classList.remove('active');
        setTimeout(() => window.openTrackDefectMonitor(defects[idx].bolinma), 100);
    }
};

// ===================== Add Defect Modal (3-4 degree only) =====================
window.openAddDefectModal = function () {
    let modal = document.getElementById('add-defect-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'add-defect-modal';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:10010; display:flex; align-items:center; justify-content:center;';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background:#1e293b; width: 650px; max-height: 90vh; overflow-y: auto; padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); color: white; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            
            <!-- Left: Form -->
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; justify-content: space-between; grid-column: 1/-1;">
                    <h3 style="margin: 0; color: #ef4444;"><i class="fas fa-exclamation-triangle"></i> 3-4 Daraja Nuqson Kiritish</h3>
                    <button type="button" onclick="document.getElementById('add-defect-modal').remove()" style="background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">&times;</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <label style="display:block; margin-bottom:4px; color:#94a3b8; font-size:0.8rem;">KM</label>
                        <input type="number" id="newDefectKm" oninput="previewBolinma(); previewDefectTape();" style="width:100%; padding:8px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:white;" placeholder="4055">
                    </div>
                    <div>
                        <label style="display:block; margin-bottom:4px; color:#94a3b8; font-size:0.8rem;">PK</label>
                        <input type="number" id="newDefectPk" style="width:100%; padding:8px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:white;" placeholder="1-10">
                    </div>
                </div>

                <div style="background: rgba(16,185,129,0.1); border: 1px dashed #10b981; padding: 6px 10px; border-radius: 6px; text-align: center;">
                    <span style="color: #94a3b8; font-size: 0.8rem;">Mas'ul:</span>
                    <strong id="previewBolinmaText" style="color: #10b981; font-size: 0.95rem;"> -</strong>
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px;">
                    <div>
                        <label style="display:block; margin-bottom:4px; color:#94a3b8; font-size:0.8rem;">Nuqson Turi</label>
                        <select id="newDefectType" style="width:100%; padding:8px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:white;">
                            <option>Cho'kish (Pr)</option><option>Siljish (R)</option>
                            <option>Kengayish (Ush)</option><option>Torayish (Suj)</option>
                            <option>Balandlik (V)</option><option>Burchak</option>
                        </select>
                    </div>
                    <div>
                        <label style="display:block; margin-bottom:4px; color:#94a3b8; font-size:0.8rem;">Daraja</label>
                        <select id="newDefectDegree" style="width:100%; padding:8px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:white;">
                            <option value="3" selected>3-daraja</option>
                            <option value="4">4-daraja</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label style="display:block; margin-bottom:4px; color:#94a3b8; font-size:0.8rem;">Izoh</label>
                    <textarea id="newDefectDesc" rows="2" style="width:100%; padding:8px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:white;" placeholder="Tezlikni 40km/s ga cheklash..."></textarea>
                </div>
                <button type="button" onclick="saveNewDefect()" style="padding:10px; background:linear-gradient(135deg, #ef4444, #dc2626); border:none; color:white; border-radius:8px; font-weight:bold; cursor:pointer;">
                    <i class="fas fa-save"></i> Kiritish va Lentaga Biriktirish
                </button>
            </div>
            
            <!-- Right: Auto Tape Preview -->
            <div style="display: flex; flex-direction: column;">
                <div style="color: #38bdf8; font-weight: bold; font-size: 0.85rem; margin-bottom: 8px;"><i class="fas fa-scroll"></i> KM Lentasi (Avtomatik)</div>
                <div id="defect-tape-preview" style="flex: 1; background: #000; border: 1px solid #334155; border-radius: 8px; overflow-y: auto; display: flex; align-items: center; justify-content: center; min-height: 250px;">
                    <div style="text-align: center; color: #475569; padding: 20px;">
                        <i class="fas fa-scroll" style="font-size: 2rem; opacity: 0.3;"></i>
                        <p style="font-size: 0.8rem; margin-top: 8px;">KM kiriting — lenta avtomatik ko'rinadi</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    window.previewBolinma = function () {
        let km = parseInt(document.getElementById('newDefectKm').value);
        const el = document.getElementById('previewBolinmaText');
        if (!km) { el.innerText = '-'; el.style.color = '#10b981'; return; }
        let b = findBolinmaByKm(km);
        el.innerText = b;
        el.style.color = b.includes("Noma'lum") ? '#ef4444' : '#10b981';
    };

    window.previewDefectTape = async function () {
        let km = parseInt(document.getElementById('newDefectKm').value);
        const preview = document.getElementById('defect-tape-preview');
        if (!km || !preview) return;
        try {
            const tape = await getTapeImage(km);
            if (tape && tape.image) {
                preview.innerHTML = `<img src="${tape.image}" style="width: 100%; height: auto;" alt="km ${km}"/>`;
            } else {
                preview.innerHTML = `<div style="text-align: center; color: #64748b; padding: 20px;"><i class="fas fa-image" style="font-size: 2rem; opacity: 0.3;"></i><p style="font-size: 0.8rem; margin-top: 8px;">km ${km} uchun lenta topilmadi</p></div>`;
            }
        } catch (e) { /* ignore */ }
    };

    window.saveNewDefect = function () {
        let km = parseInt(document.getElementById('newDefectKm').value);
        let pk = parseInt(document.getElementById('newDefectPk').value);
        let type = document.getElementById('newDefectType').value;
        let degree = parseInt(document.getElementById('newDefectDegree').value);
        let desc = document.getElementById('newDefectDesc').value;

        if (!km || !pk) { alert("KM va PK ni kiriting!"); return; }
        let bolinmaName = findBolinmaByKm(km);

        let defects = JSON.parse(localStorage.getItem('track_defects_data')) || [];

        // CHECK FOR REPEATS (Chronic defects)
        // If the same KM, PK and Type exist in history (even if they were fixed before)
        let isRepeated = defects.some(old => old.km === km && old.pk === pk && old.type === type);

        let newId = defects.length > 0 ? Math.max(...defects.map(d => d.id)) + 1 : 1;
        defects.push({
            id: newId,
            bolinma: bolinmaName,
            km, pk, degree, type,
            status: "open",
            isRepeated: isRepeated,
            date: new Date().toISOString().split('T')[0],
            description: desc
        });
        localStorage.setItem('track_defects_data', JSON.stringify(defects));

        window.SmartUtils.showToast(`${degree}-daraja nuqson km ${km} ga kiritildi → ${bolinmaName}`, "success");
        document.getElementById('add-defect-modal').remove();

        // Refresh view and auto-show the tape
        let modal = document.getElementById('track-defect-modal');
        if (modal) {
            modal.innerHTML = window.generateTrackDefectHTML('ishlab-chiqarish', false);
            setTimeout(() => { window.populateLentaKmSelector('ishlab-chiqarish'); window.showTapeForKm(km); }, 400);
        } else {
            window.openTrackDefectMonitor('ishlab-chiqarish');
            setTimeout(() => window.showTapeForKm(km), 600);
        }
    };
};

console.log('✅ Track Defect Monitor v2.0 Loaded (Lenta + Degrees)');
