/**
 * PU-29: Strelkali o'tkazgichlarni tekshirish jurnali
 * (Jurnal promerki strelochnix perevodov)
 */

// Global state
let pu29Data = [];
let currentPU29Department = null;

// Mock initial data
function initPU29Data() {
    const savedData = localStorage.getItem('pu29_data');
    if (savedData) {
        pu29Data = JSON.parse(savedData);
    } else {
        pu29Data = [
            {
                id: 1,
                departmentId: 'bolinma1',
                date: '2026-02-25',
                station: 'Buxoro-1',
                switchNumber: '5',
                // Раздел 1
                shablon: 1522,
                ustriqQismi: 2,
                // Раздел 3
                defects: [
                    { id: 101, desc: "O'tkir qism yemirilishi 3mm dan ko'p", dateAdded: '2026-02-25', addedBy: 'Turobov H.', status: 'pending' }
                ]
            }
        ];
        savePU29DataLocal();
    }
}

function savePU29DataLocal() {
    localStorage.setItem('pu29_data', JSON.stringify(pu29Data));
}

// Oynani ochish asosiy funksiyasi
window.openPU29Window = function (departmentId) {
    console.log("PU-29 Opened for:", departmentId);
    currentPU29Department = departmentId;

    if (pu29Data.length === 0) {
        initPU29Data();
    }

    let modal = document.getElementById('pu29-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pu29-modal';
        modal.className = 'integration-window';
        modal.style.zIndex = '10005';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="window-header" style="background: linear-gradient(90deg, #1e293b 0%, #020617 100%); border-bottom: 2px solid var(--glass-border); padding: 15px 30px;">
            <h2 class="department-name" style="font-size: 1.3rem; margin: 0; display: flex; align-items: center; gap: 12px; font-weight: 800; color: #fff;">
                <i class="fas fa-railroad-light" style="color: var(--accent-gold);"></i> PU-29: STRELKALI O'TKAZGICHLAR JURNALI
            </h2>
            <div style="display:flex; align-items:center; gap:25px;">
                <button class="close-btn" onclick="document.getElementById('pu29-modal').classList.remove('active')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        <div class="window-content" style="padding: 0; background: #020617; color: var(--text-primary); overflow-y: auto; height: calc(100% - 70px); box-sizing: border-box;">
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 25px 30px; background: rgba(30, 41, 59, 0.2);">
                <h3 style="margin: 0; color: #fff; font-weight: 900; font-size: 1.5rem; letter-spacing: -0.5px;">
                    <i class="fas fa-map-marked-alt" style="color: var(--accent-gold); margin-right: 10px;"></i>
                    ${departmentId === 'ishlab-chiqarish' ? 'Barcha bo\'linmalar' : document.querySelector('.department-name')?.innerText || departmentId}
                </h3>
                <div style="display: flex; gap: 15px;">
                    <button onclick="createNewPU29Record()" style="background: var(--gold-gradient); border: none; color: #000; padding: 14px 28px; border-radius: 16px; cursor: pointer; display: flex; align-items: center; gap: 12px; font-weight: 900; box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3); transition: 0.3s; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 0.5px;">
                        <i class="fas fa-plus-circle"></i> YANGI TEKSHIRUV
                    </button>
                    <button style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); color: #fff; padding: 14px 24px; border-radius: 16px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-weight: 700; text-transform: uppercase; font-size: 0.8rem;">
                        <i class="fas fa-file-excel"></i> EXPORT
                    </button>
                </div>
            </div>

            <!-- Tabs -->
            <div class="pu29-tabs" style="display: flex; gap: 15px; padding: 0 30px 20px; border-bottom: 1px solid var(--glass-border); background: rgba(30, 41, 59, 0.2);">
                <button class="tab-btn active" onclick="switchPU29Tab('razdel1')" style="background: var(--gold-gradient); border: none; color: #000; padding: 14px 30px; border-radius: 14px; cursor: pointer; font-weight: 900; font-size: 0.9rem; transition: 0.3s; text-transform: uppercase;">
                    1-2. O'lchovlar va Eskirishlar
                </button>
                <button class="tab-btn" onclick="switchPU29Tab('razdel3')" style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); color: var(--text-secondary); padding: 14px 30px; border-radius: 14px; cursor: pointer; font-weight: 700; font-size: 0.9rem; transition: 0.3s; text-transform: uppercase;">
                    3. Boshqa Kamchiliklar
                </button>
            </div>

            <!-- Tab Content Area -->
            <div id="pu29-tab-content" style="padding: 30px; width: 100% !important; min-width: 100% !important; box-sizing: border-box;">
                ${generateRazdel12TableHTML(departmentId)}
            </div>

        </div>
    `;

    modal.classList.add('active');
};

// Tab switching logic
window.switchPU29Tab = function (tabId) {
    const modal = document.getElementById('pu29-modal');
    if (!modal) return;

    // Update buttons
    const btns = modal.querySelectorAll('.tab-btn');
    btns.forEach(btn => {
        btn.style.background = 'transparent';
        btn.style.borderColor = 'rgba(31, 38, 135, 0.1)';
        btn.style.color = '#64748b';
        btn.style.fontWeight = '700';
        btn.classList.remove('active');
    });

    const activeBtn = Array.from(btns).find(b => b.getAttribute('onclick').includes(tabId));
    if (activeBtn) {
        activeBtn.style.background = 'rgba(37, 99, 235, 0.08)';
        activeBtn.style.borderColor = 'rgba(37, 99, 235, 0.15)';
        activeBtn.style.color = '#2563eb';
        activeBtn.style.fontWeight = '800';
        activeBtn.classList.add('active');
    }

    // Update content
    const container = document.getElementById('pu29-tab-content');
    if (tabId === 'razdel1') {
        container.innerHTML = generateRazdel12TableHTML(currentPU29Department);
    } else {
        container.innerHTML = generateRazdel3TableHTML(currentPU29Department);
    }
};

// HTML Generators
function generateRazdel12TableHTML(deptId) {
    let records = pu29Data;
    if (deptId !== 'ishlab-chiqarish' && deptId !== 'admin') {
        records = pu29Data.filter(r => r.departmentId === deptId);
    }

    if (records.length === 0) {
        return `<div style="text-align:center; padding: 40px; color: #7f8c8d;">Hozircha tekshiruv dalolatnomalari kiritilmagan.</div>`;
    }

    let rows = records.map(r => `
        <tr style="border-bottom: 1px solid rgba(31, 38, 135, 0.05); transition: all 0.2s;" onmouseover="this.style.background='rgba(37, 99, 235, 0.02)'" onmouseout="this.style.background='transparent'">
            <td style="padding: 14px 10px; color: #64748b; font-weight: 500;">${r.departmentId}</td>
            <td style="padding: 14px 10px; font-weight: 800; color: #1e293b;">${r.station}</td>
            <td style="padding: 14px 10px; text-align: center; color: #d4af37; font-weight: 900; font-size: 1.1rem;">${r.switchNumber}</td>
            <td style="padding: 14px 10px; color: #64748b;">${r.date}</td>
            <td style="padding: 14px 10px; text-align: center; font-weight: 900; color: #ffd700;" class="${Math.abs(1520 - (r.shablon || 1520)) > 4 ? 'danger-text' : ''}">${r.shablon || '-'}</td>
            <td style="padding: 14px 10px; text-align: center; color: #b8860b; font-weight: 900;">${r.ustriqQismi || '-'}</td>
            <td style="padding: 14px 10px; color: #475569; font-size: 0.93rem; word-wrap: break-word; overflow-wrap: break-word;">${r.otherIndicators || 'Batafsil...'}</td>
            <td style="padding: 14px 10px; text-align:right;">
                <button onclick="editPU29Record(${r.id})" style="background: rgba(37, 99, 235, 0.05); border: 1.5px solid rgba(37, 99, 235, 0.15); color: #ffd700; padding: 8px 16px; border-radius: 10px; cursor: pointer; font-size: 0.8rem; font-weight: 800; transition: 0.2s; text-transform: uppercase;">
                    <i class="fas fa-edit"></i> TAHRIR
                </button>
            </td>
        </tr>
    `).join('');

    return `
        <style>
            .pu29-table { display: table !important; width: 100% !important; max-width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; border-spacing: 0; margin: 0; padding: 0; }
            .pu29-table th { background: #f8fafc; padding: 16px 10px; text-align: left; font-size: 0.78rem; color: #64748b; border-bottom: 2px solid rgba(31, 38, 135, 0.08); text-transform: uppercase; letter-spacing: 1.2px; font-weight: 900; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; box-sizing: border-box !important; }
            .pu29-table td { padding: 14px 10px; font-size: 0.95rem; border-bottom: 1px solid rgba(31, 38, 135, 0.05); color: #1e293b; overflow: hidden; text-overflow: ellipsis; word-wrap: break-word; box-sizing: border-box !important; }
            .pu29-table tr:hover { background: rgba(37, 99, 235, 0.02); }
            .danger-text { color: #ef4444 !important; font-weight: 900; }
        </style>
        <div style="width: 100% !important; min-width: 100% !important; background: #ffffff; border-radius: 20px; border: 1px solid rgba(31, 38, 135, 0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.02); overflow: hidden; box-sizing: border-box;">
            <table class="pu29-table">
                <colgroup>
                    <col style="width: 6%;">
                    <col style="width: 12%;">
                    <col style="width: 8%;">
                    <col style="width: 15%;">
                    <col style="width: 8%;">
                    <col style="width: 8%;">
                    <col style="width: 33%;">
                    <col style="width: 10%;">
                </colgroup>
                <thead>
                    <tr>
                        <th rowspan="2"><i class="fas fa-list-ol"></i> B/N</th>
                        <th rowspan="2"><i class="fas fa-building" style="color: #3b82f6;"></i> STANSIYA</th>
                        <th rowspan="2" style="text-align: center;"><i class="fas fa-random" style="color: #d4af37;"></i> STR.</th>
                        <th rowspan="2"><i class="far fa-calendar-alt" style="color: #6366f1;"></i> SANA</th>
                        <th colspan="2" style="text-align: center; border-left: 1px solid rgba(31, 38, 135, 0.08); background: rgba(37, 99, 235, 0.02);"><i class="fas fa-ruler-combined" style="color: #ffd700;"></i> O'LCHAMLAR</th>
                        <th rowspan="2" style="border-left: 1px solid rgba(31, 38, 135, 0.08); padding-left: 15px;"><i class="fas fa-chart-line" style="color: #10b981;"></i> BOSHQA (15-28)</th>
                        <th rowspan="2" style="text-align:right;"><i class="fas fa-bolt" style="color: #ef4444;"></i> AMALLAR</th>
                    </tr>
                    <tr>
                        <th style="text-align:center; border-left: 1px solid rgba(31, 38, 135, 0.08); background: rgba(37, 99, 235, 0.02);"><i class="fas fa-grip-lines-vertical"></i> SHAB.</th>
                        <th style="text-align:center; background: rgba(37, 99, 235, 0.02);"><i class="fas fa-level-up-alt"></i> O'ST.</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

function generateRazdel3TableHTML(deptId) {
    let records = pu29Data;
    if (deptId !== 'ishlab-chiqarish' && deptId !== 'admin') {
        records = pu29Data.filter(r => r.departmentId === deptId);
    }

    // Flatten defects
    let defects = [];
    records.forEach(r => {
        if (r.defects) {
            r.defects.forEach(d => {
                defects.push({
                    recordId: r.id,
                    station: r.station,
                    switchNumber: r.switchNumber,
                    ...d
                });
            });
        }
    });

    if (defects.length === 0) {
        return `<div style="text-align:center; padding: 40px; color: #7f8c8d;">Hozircha kamchiliklar qayd etilmagan.</div>`;
    }

    let rows = defects.map(d => `
        <tr style="border-bottom: 1px solid rgba(31, 38, 135, 0.05); transition: background 0.2s;" onmouseover="this.style.background='rgba(37, 99, 235, 0.02)'" onmouseout="this.style.background='transparent'">
            <td style="padding: 14px 10px; font-weight: bold; color: #3b82f6;">${d.station} (Str: ${d.switchNumber})</td>
            <td style="padding: 14px 10px; color: #64748b;">${d.dateAdded}</td>
            <td style="padding: 14px 10px; color: #ef4444; word-wrap: break-word; overflow-wrap: break-word;">${d.desc}</td>
            <td style="padding: 14px 10px; color: #475569;">${d.addedBy}</td>
            <td style="padding: 14px 10px; text-align:center;">
                ${d.status === 'resolved'
            ? `<span style="background: rgba(16, 185, 129, 0.08); color: #059669; padding: 6px 12px; border-radius: 10px; font-size: 0.75rem; font-weight: 800; border: 1px solid rgba(16,185,129,0.2);"><i class="fas fa-check-circle"></i> Bartaraf etildi (${d.dateResolved || ''})</span>`
            : `<span style="background: rgba(239, 68, 68, 0.08); color: #ef4444; padding: 6px 12px; border-radius: 10px; font-size: 0.75rem; font-weight: 800; border: 1px solid rgba(239,68,68,0.2);"><i class="fas fa-exclamation-triangle"></i> Jarayonda</span>`
        }
            </td>
            <td style="padding: 14px 10px; text-align:right;">
                ${d.status !== 'resolved' ? `
                <button onclick="resolveDefect(${d.recordId}, ${d.id})" style="background: rgba(16, 185, 129, 0.05); border: 1.5px solid rgba(16,185,129,0.2); color: #059669; padding: 8px 14px; border-radius: 10px; cursor: pointer; font-size: 0.8rem; font-weight: 800;">
                    <i class="fas fa-check"></i> Hal qilish
                </button>` : ''}
            </td>
        </tr>
    `).join('');

    return `
        <style>
            .pu29-r3-table { display: table !important; width: 100% !important; max-width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; border-spacing: 0; margin: 0; padding: 0; }
            .pu29-r3-table th { background: #f8fafc; padding: 16px 10px; text-align: left; font-size: 0.78rem; color: #64748b; border-bottom: 2px solid rgba(31, 38, 135, 0.08); text-transform: uppercase; letter-spacing: 1.2px; font-weight: 900; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; box-sizing: border-box !important; }
            .pu29-r3-table td { padding: 14px 10px; font-size: 0.95rem; border-bottom: 1px solid rgba(31, 38, 135, 0.05); color: #1e293b; overflow: hidden; text-overflow: ellipsis; word-wrap: break-word; box-sizing: border-box !important; }
            .pu29-r3-table tr:hover { background: rgba(37, 99, 235, 0.02); }
        </style>
        <div style="width: 100% !important; min-width: 100% !important; background: #ffffff; border-radius: 20px; border: 1px solid rgba(31, 38, 135, 0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.02); overflow: hidden; box-sizing: border-box;">
            <table class="pu29-r3-table">
                <colgroup>
                    <col style="width: 18%;">
                    <col style="width: 10%;">
                    <col style="width: 32%;">
                    <col style="width: 16%;">
                    <col style="width: 14%;">
                    <col style="width: 10%;">
                </colgroup>
                <thead>
                    <tr>
                        <th><i class="fas fa-map-marked-alt" style="color: #3b82f6;"></i> STANSIYA / STR.</th>
                        <th><i class="far fa-calendar-alt" style="color: #6366f1;"></i> SANA</th>
                        <th><i class="fas fa-file-alt" style="color: #d4af37;"></i> KAMCHILIK MAZMUNI</th>
                        <th><i class="fas fa-user-edit" style="color: #ffd700;"></i> MAS'UL</th>
                        <th style="text-align:center;"><i class="fas fa-info-circle" style="color: #10b981;"></i> HOLATI</th>
                        <th style="text-align:right;"><i class="fas fa-bolt" style="color: #ef4444;"></i> AMALLAR</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

// Logic Functions placeholder
window.createNewPU29Record = function () {
    let modal = document.getElementById('pu29-entry-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pu29-entry-modal';
        modal.className = 'integration-window';
        modal.style.zIndex = '10010'; // Higher than pu29 main window
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="window-header" style="background: linear-gradient(90deg, #f8fafc 0%, #e0e7ff 100%);">
            <h2 style="color: #1e293b;"><i class="fas fa-robot" style="color: #d4af37;"></i> Yangi tekshiruv (AI Yordamchi)</h2>
            <button class="action-btn delete" onclick="document.getElementById('pu29-entry-modal').classList.remove('active')" style="background: rgba(239, 68, 68, 0.05); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.1); border-radius: 10px; width: 36px; height: 36px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="window-content" style="background:#fff; color:#1e293b; padding: 15px !important; overflow-y: auto; border-top: 1px solid rgba(31, 38, 135, 0.05);">
            <div style="display: flex; gap: 15px; flex-wrap: wrap; width: 100% !important; min-width: 100% !important; box-sizing: border-box;">
            
            <!-- Chap tomon: Ovozli kiritish / Chat -->
            <div style="flex: 1; min-width: 320px; background: rgba(37, 99, 235, 0.02); border-radius: 24px; padding: 25px; display: flex; flex-direction: column; border: 1px solid rgba(31, 38, 135, 0.05);">
                <h3 style="color: #ffd700; margin-top: 0; font-weight: 800;"><i class="fas fa-microphone-alt" style="color: #d4af37;"></i> Ovozli yordamchi</h3>
                <p style="color: #64748b; font-size: 0.9rem; line-height: 1.4; margin-bottom: 20px;">
                    Ovozli namuna: <br/><i style="color:#b8860b; font-weight: 600;">"Buxoro 1 stansiyasi, 5-strelka. Shablon 1522, ustriq qismi 2. Kamchilik: qulf buzilgan."</i>
                </p>
                
                <div id="pu29-voice-log" style="flex: 1; min-height: 140px; background: #fff; border: 1.5px solid rgba(31, 38, 135, 0.1); border-radius: 20px; margin-bottom: 20px; padding: 20px; overflow-y: auto; font-family: 'Inter', sans-serif; color: #1e293b; font-size: 1.05rem; line-height: 1.5; box-shadow: inset 0 2px 5px rgba(0,0,0,0.02);">
                    Tayyor... Gapirish uchun pastdagi tugmani bosing.
                </div>

                <button id="pu29-mic-btn" onclick="startPU29VoiceRecognition()" style="background: linear-gradient(135deg, #ef4444, #dc2626); border: none; color: white; padding: 15px; border-radius: 50px; cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.3s; box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2); font-weight: 800; text-transform: uppercase;">
                    <i class="fas fa-microphone"></i> <span>Gapirishni boshlash</span>
                </button>
            </div>

            <!-- O'ng tomon: Formalar (Avtomat to'ldiriladi) -->
            <div style="flex: 1; min-width: 320px; background: #fff; border-radius: 24px; padding: 25px; border: 1px solid rgba(31, 38, 135, 0.05); box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
                <h3 style="color: #ffd700; margin-top: 0; font-weight: 800;"><i class="fas fa-clipboard-check" style="color: #10b981;"></i> Natija formasi</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="form-group" style="margin-bottom: 5px;">
                        <label style="display: block; margin-bottom: 5px; color: #64748b; font-weight: 700; font-size: 0.85rem;">Stansiya</label>
                        <input type="text" id="ai-entry-station" style="width: 100%; box-sizing: border-box; padding: 12px; border-radius: 12px; background: #f8fafc; border: 1.5px solid rgba(31, 38, 135, 0.1); color: #1e293b; font-weight: 700; outline: none;">
                    </div>
                    <div class="form-group" style="margin-bottom: 5px;">
                        <label style="display: block; margin-bottom: 5px; color: #64748b; font-weight: 700; font-size: 0.85rem;">Strelka No</label>
                        <input type="number" id="ai-entry-switch" style="width: 100%; box-sizing: border-box; padding: 12px; border-radius: 12px; background: #f8fafc; border: 1.5px solid rgba(31, 38, 135, 0.1); color: #1e293b; font-weight: 900; outline: none; text-align: center;">
                    </div>
                    
                    <h4 style="grid-column: 1 / -1; color: #ffd700; margin: 10px 0 5px 0; font-weight: 800; font-size: 1rem; border-bottom: 1px solid rgba(37, 99, 235, 0.1); padding-bottom: 5px; text-transform: uppercase;">1-2. O'lchovlar</h4>
                    
                    <div class="form-group" style="margin-bottom: 5px;">
                        <label style="display: block; margin-bottom: 5px; color: #64748b; font-weight: 700; font-size: 0.85rem;">Shablon (mm)</label>
                        <input type="number" id="ai-entry-shablon" style="width: 100%; box-sizing: border-box; padding: 12px; border-radius: 12px; background: #f8fafc; border: 1.5px solid rgba(31, 38, 135, 0.1); color: #ffd700; font-weight: 900; outline: none; text-align: center;">
                    </div>
                    <div class="form-group" style="margin-bottom: 5px;">
                        <label style="display: block; margin-bottom: 5px; color: #64748b; font-weight: 700; font-size: 0.85rem;">O'stiriq (Koren) mm</label>
                        <input type="number" id="ai-entry-ustriq" style="width: 100%; box-sizing: border-box; padding: 12px; border-radius: 12px; background: #f8fafc; border: 1.5px solid rgba(31, 38, 135, 0.1); color: #b8860b; font-weight: 900; outline: none; text-align: center;">
                    </div>

                    <h4 style="grid-column: 1 / -1; color: #ef4444; margin: 10px 0 5px 0; font-weight: 800; font-size: 1rem; border-bottom: 1px solid rgba(239, 68, 68, 0.1); padding-bottom: 5px; text-transform: uppercase;">3. Kamchiliklar</h4>
                    
                    <div class="form-group" style="grid-column: 1 / -1; margin-bottom: 5px;">
                        <label style="display: block; margin-bottom: 5px; color: #64748b; font-weight: 700; font-size: 0.85rem;">Aniqlangan kamchilik (izoh)</label>
                        <textarea id="ai-entry-defect" rows="3" style="width: 100%; box-sizing: border-box; padding: 12px; border-radius: 16px; background: #f8fafc; border: 1.5px solid rgba(31, 38, 135, 0.1); color: #1e293b; resize: none; outline: none; line-height: 1.4; font-size: 0.95rem;"></textarea>
                    </div>
                </div>

                <div style="display: flex; gap: 15px; margin-top: 25px;">
                    <button onclick="savePU29AIEntry()" style="flex: 1.5; background: linear-gradient(135deg, #d4af37, #b8860b); border: none; color: white; padding: 15px; border-radius: 14px; cursor: pointer; font-size: 1.1rem; font-weight: 800; box-shadow: 0 5px 15px rgba(212, 175, 55, 0.2); text-transform: uppercase;">
                        <i class="fas fa-save"></i> SAQLASH
                    </button>
                    <button onclick="document.getElementById('pu29-entry-modal').classList.remove('active')" style="flex: 1; background: rgba(148, 163, 184, 0.1); border: 1.5px solid rgba(148, 163, 184, 0.2); color: #475569; padding: 15px; border-radius: 14px; cursor: pointer; font-size: 1rem; font-weight: 700; text-transform: uppercase;">
                        BEKOR
                    </button>
                </div>
            </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
};

let pu29Recognition = null;
let aiParsingTimeout = null;

window.startPU29VoiceRecognition = function () {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        SmartUtils.showToast("Kechirasiz, brauzeringiz ovozli kiritishni qo'llab-quvvatlamaydi (Google Chrome tavsiya etiladi).", "error");
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!pu29Recognition) {
        pu29Recognition = new SpeechRecognition();
        pu29Recognition.lang = 'uz-UZ'; // O'zbek tili uchun (eslatma: ba'zan rus yoki o'zbekni qorishtirib aytiladi)
        pu29Recognition.interimResults = true; // Jonli efirda yozish
        pu29Recognition.maxAlternatives = 1;

        pu29Recognition.onstart = function () {
            const btn = document.getElementById('pu29-mic-btn');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Eshitilmoqda, gapiring...</span>';
            btn.style.background = 'linear-gradient(135deg, #f39c12, #f1c40f)';
            document.getElementById('pu29-voice-log').innerHTML = "<span style='color: #2ecc71;'><i class='fas fa-assistive-listening-systems'></i> Quloq solinmoqda...</span><br/><br/>";
        };

        pu29Recognition.onresult = function (event) {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (interimTranscript.trim().length > 0 || finalTranscript.trim().length > 0) {
                document.getElementById('pu29-voice-log').innerHTML = `
                    <div style="margin-bottom: 10px; color: #95a5a6;">${interimTranscript}</div>
                    <div style="color: white; font-weight: bold;">${finalTranscript}</div>
                 `;
            }

            if (finalTranscript !== '') {
                // To display full result once done
                document.getElementById('pu29-voice-log').innerHTML = `
                    <b style="color:#f1c40f;">Siz aytdingiz:</b><br/>"${finalTranscript}"<br/><br/>
                    <span style="color:#2ecc71;"><i class="fas fa-magic"></i> AI Tahlil qilmoqda...</span>
                `;

                // Process text via AI Simulation Parse function
                clearTimeout(aiParsingTimeout);
                aiParsingTimeout = setTimeout(() => {
                    parseVoiceToForm(finalTranscript.toLowerCase());
                }, 500); // Kichik muzlatish effekti natural ko'rinishi uchun
            }
        };

        pu29Recognition.onerror = function (event) {
            console.error(event.error);
            document.getElementById('pu29-voice-log').innerHTML = `<span style="color:#e74c3c;"><i class="fas fa-exclamation-circle"></i> Xatolik yuz berdi: ${event.error}. Iltimos mikrofon ruxsatnomasini tekshiring.</span>`;
            resetMicButton();
        };

        pu29Recognition.onend = function () {
            resetMicButton();
        }
    }

    // Try starting it
    try {
        pu29Recognition.start();
    } catch (e) {
        pu29Recognition.stop();
        setTimeout(() => { pu29Recognition.start(); }, 100);
    }
};

function resetMicButton() {
    const btn = document.getElementById('pu29-mic-btn');
    if (btn.innerHTML.includes('Eshitilmoqda')) {
        btn.innerHTML = '<i class="fas fa-microphone"></i> <span>Yana gapirish</span>';
        btn.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
    }
}

// Sodda AI NLP Parseri imitatsiyasi
function parseVoiceToForm(text) {
    console.log("AI Parsed Voice Text:", text);

    // 1. Stansiyani topish
    if (text.includes('buxoro')) document.getElementById('ai-entry-station').value = 'Buxoro-1';
    else if (text.includes('navoiy')) document.getElementById('ai-entry-station').value = 'Navoiy';
    else if (text.includes('toshkent')) document.getElementById('ai-entry-station').value = 'Toshkent';
    else if (text.includes('samarqand')) document.getElementById('ai-entry-station').value = 'Samarqand';
    // Agar aniq nom bo'lmasa lekin "stansiya" yoki "stansiyasi" desa, shu matn atrofini kesvoladi
    else {
        let stansiyaMatch = text.match(/([a-z\s]+)\s+stansiya/);
        if (stansiyaMatch && stansiyaMatch[1]) {
            document.getElementById('ai-entry-station').value = stansiyaMatch[1].trim() + " stansiyasi";
        }
    }

    // 2. Strelka raqamini topish (masalan: 5-strelka, beshinchi strelka, strelka 5, strelka besh)
    const switchPattern = /((bir|ikki|uch|to'rt|besh|olti|yetti|sakkiz|to'qqiz|o'n|1|2|3|4|5|6|7|8|9|10)[-a-z\s]+)\s*strelka|strelka\s*((bir|ikki|uch|to'rt|besh|olti|yetti|sakkiz|to'qqiz|o'n|1|2|3|4|5|6|7|8|9|10))/;
    const matchSwitch = text.match(switchPattern);

    const numMap = { 'bir': 1, 'birinchi': 1, 'ikki': 2, 'ikkinchi': 2, 'uch': 3, 'uchinchi': 3, 'to\'rt': 4, 'to\'rtinchi': 4, "besh": 5, "beshinchi": 5, "olti": 6, "oltinchi": 6, "yetti": 7, "yettinchi": 7, "sakkiz": 8, "sakkizinchi": 8, "to'qqiz": 9, "to'qqizinchi": 9, "o'n": 10, "o'ninchi": 10 };

    if (matchSwitch) {
        let rawVal = matchSwitch[2] || matchSwitch[3]; // regex dan qaysi tomon tushganiga qarab
        if (!rawVal) rawVal = matchSwitch[1];

        let switchNum = rawVal.replace(/inchi/g, '').replace(/-/, '').trim();
        if (numMap[switchNum]) switchNum = numMap[switchNum];

        document.getElementById('ai-entry-switch').value = switchNum;
    } else { // fallback
        let digits = text.match(/\d+/);
        if (digits && digits[0].length < 3) document.getElementById('ai-entry-switch').value = digits[0];
    }

    // 3. Shablonni topish (masalan: 1522, bir ming besh yuz ..., yigirma ikki)
    let shablonMatch = text.match(/shablon[A-Za-z\s]*(\d{4})/);
    if (shablonMatch) {
        document.getElementById('ai-entry-shablon').value = shablonMatch[1];
    } else {
        // Fallback for spoken shorthand
        if (text.includes('1522') || text.includes('22') || text.includes('yigirma ikki') || text.includes('yigirma 2')) document.getElementById('ai-entry-shablon').value = '1522';
        else if (text.includes('1524') || text.includes('24') || text.includes('yigirma to')) document.getElementById('ai-entry-shablon').value = '1524';
        else if (text.includes('1520') || text.includes('20') || text.includes('yigirma')) document.getElementById('ai-entry-shablon').value = '1520';
        else if (text.match(/15\d{2}/)) document.getElementById('ai-entry-shablon').value = text.match(/15\d{2}/)[0];
    }

    // 4. Ustriq qismini topish ("ustiriq 2", "ustro 3", "ildiz 4")
    let ustriqMatch = text.match(/(ustriq|o'stiriq|koren|ustro)[a-z\s]*(\d)/);
    if (ustriqMatch) {
        document.getElementById('ai-entry-ustriq').value = ustriqMatch[2];
    } else {
        // Simple fallback
        if (text.includes('ikki') || text.includes('2')) document.getElementById('ai-entry-ustriq').value = '2';
        else if (text.includes('uch') || text.includes('3')) document.getElementById('ai-entry-ustriq').value = '3';
    }

    // 5. Kamchiliklarni izlash ("kamchilik: ...", "muammo: ...")
    let defectKeywords = ['kamchilik', 'muammo', 'nuqson', 'shikast'];
    let foundDefect = false;
    for (let kw of defectKeywords) {
        if (text.includes(kw)) {
            let defectText = text.substring(text.indexOf(kw) + kw.length).replace(/(:|-)/g, '').trim();
            // capitalize
            defectText = defectText.charAt(0).toUpperCase() + defectText.slice(1);
            document.getElementById('ai-entry-defect').value = defectText;
            foundDefect = true;
            break;
        }
    }

    document.getElementById('pu29-voice-log').innerHTML += `<br/><span style="color:#3498db; font-weight:bold;"><i class="fas fa-check-double"></i> Ma'lumotlar tahlil qilinib formaga joylandi! O'ng tomonni tekshiring.</span>`;
}

window.savePU29AIEntry = function () {
    const station = document.getElementById('ai-entry-station').value;
    const switchNum = document.getElementById('ai-entry-switch').value;
    const shablon = document.getElementById('ai-entry-shablon').value;
    const ustriq = document.getElementById('ai-entry-ustriq').value;
    const defect = document.getElementById('ai-entry-defect').value;

    if (!station || !switchNum) {
        SmartUtils.showToast("Stansiya va strelka raqami avtomatik topilmadi. Iltimos o'zingiz kiriting.", "warning");
        return;
    }

    const newRecord = {
        id: Date.now(),
        departmentId: currentPU29Department,
        date: new Date().toISOString().split('T')[0],
        station: station,
        switchNumber: switchNum,
        shablon: parseInt(shablon) || 1520,
        ustriqQismi: parseInt(ustriq) || 0,
    };

    if (defect && defect.trim() !== '') {
        newRecord.defects = [
            { id: Date.now() + 1, desc: defect.trim(), dateAdded: newRecord.date, addedBy: 'Ovozli Kiritish AI', status: 'pending' }
        ];
    }

    pu29Data.push(newRecord);
    savePU29DataLocal();

    document.getElementById('pu29-entry-modal').classList.remove('active');

    // Yozuvni qayerda ko'rishni aniqlash
    window.switchPU29Tab('razdel1');
    if (newRecord.defects && newRecord.defects.length > 0) {
        setTimeout(() => {
            SmartUtils.showToast("Ma'lumotlar jadvalga o'tdi. Kamchiliklar Razdel 3 ga tushdi!", "success");
        }, 500);
    } else {
        SmartUtils.showToast("Ma'lumotlar saqlandi!", "success");
    }
};

window.resolveDefect = function (recordId, defectId) {
    if (confirm("Ushbu kamchilik bartaraf etilganini tasdiqlaysizmi?")) {
        const record = pu29Data.find(r => r.id === recordId);
        if (record && record.defects) {
            const defect = record.defects.find(d => d.id === defectId);
            if (defect) {
                defect.status = 'resolved';
                defect.dateResolved = new Date().toISOString().split('T')[0];
                savePU29DataLocal();
                switchPU29Tab('razdel3'); // Refresh
                SmartUtils.showToast("Kamchilik maqomi yangilandi!", 'success');
            }
        }
    }
};

// Expose minimal CSS for modal
const style = document.createElement('style');
style.textContent = `
    #pu29-modal .window-content::-webkit-scrollbar { width: 8px; }
    #pu29-modal .window-content::-webkit-scrollbar-thumb { background: rgba(231, 76, 60, 0.5); border-radius: 4px; }
`;
document.head.appendChild(style);
