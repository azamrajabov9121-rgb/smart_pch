// TNU-20: Bilimlarni Tekshirish Jurnali
// Knowledge Verification Journal with Test Results

let tnu20Records = [];
let tnu20CurrentRecord = null;

// Load records from server
async function loadTNU20Records() {
    try {
        const records = await SmartUtils.fetchAPI('/safety/tnu20');
        if (records) {
            tnu20Records = records.map(r => ({
                ...r,
                workerName: r.employee_name,
                certificateNumber: r.certificate_no,
                nextTestDate: r.next_test_date
            }));
        }
    } catch (e) {
        console.error('TNU-20 yuklashda xatolik:', e);
        tnu20Records = [];
    }
    return tnu20Records;
}

// Save records to server
async function saveTNU20Records(record) {
    try {
        const data = {
            employee_id: record.workerId,
            bolinma_id: record.bolinmaId,
            date: record.date,
            next_test_date: record.nextTestDate,
            certificate_no: record.certificateNumber,
            result: record.result,
            signature: record.signature
        };
        await SmartUtils.fetchAPI('/safety/tnu20', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        showToast('Yozuv saqlandi', 'success');
    } catch (e) {
        console.error('TNU-20 saqlashda xatolik:', e);
        showToast('Saqlashda xatolik yuz berdi', 'error');
    }
}

// Get workers list filtered by bolinmaId
function getTNU20Workers(bolinmaId) {
    let allWorkers = [];

    // Prioritize new HR system
    if (typeof window.hrData !== 'undefined' && window.hrData.employees && window.hrData.employees.length > 0) {
        allWorkers = window.hrData.employees.map(emp => ({
            id: emp.id || emp.tabelNumber,
            name: emp.name,
            role: emp.position,
            position: emp.position,
            bolinma: emp.department,
            bolinmaId: emp.department,
            photo: emp.photo || ''
        }));
    } else {
        const saved = localStorage.getItem('smart_pch_workers');
        if (saved) {
            allWorkers = JSON.parse(saved);
        } else if (typeof window.workersData !== 'undefined') {
            allWorkers = window.workersData;
        }
    }

    // Filter by bolinmaId if provided
    if (bolinmaId && bolinmaId !== 'all') {
        return allWorkers.filter(w => {
            const wBolinma = String(w.bolinma || w.bolinmaId || '').toLowerCase();
            return wBolinma.includes(String(bolinmaId).toLowerCase());
        });
    }

    return allWorkers;
}

// Generate certificate number
function generateCertificateNumber() {
    const year = new Date().getFullYear();
    const count = tnu20Records.filter(r => r.date.startsWith(year.toString())).length + 1;
    return `TNU20-${year}-${String(count).padStart(3, '0')}`;
}

// Calculate next test date (6 months from now)
function calculateNextTestDate() {
    const date = new Date();
    date.setMonth(date.getMonth() + 6);
    return date.toISOString().slice(0, 10);
}

// Open TNU-20 Journal Window
function openTNU20Window(bolinmaId) {
    loadTNU20Records();
    window.currentTNU20BolinmaId = bolinmaId; // Store for later use

    // Remove existing modal
    const existing = document.getElementById('tnu20-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'tnu20-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.95); z-index: 10030; display: flex;
        justify-content: center; align-items: center; overflow-y: auto;
    `;

    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%); width: 95%; max-width: 1400px; max-height: 95vh; border-radius: 20px; display: flex; flex-direction: column; box-shadow: 0 0 50px rgba(0,0,0,0.8); border: 2px solid rgba(255,255,255,0.1);">
            
            <!-- Header -->
            <div style="padding: 20px 30px; border-bottom: 2px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); border-radius: 20px 20px 0 0;">
                <div>
                    <h2 style="margin: 0; color: white; display: flex; align-items: center; gap: 15px;">
                        <i class="fas fa-graduation-cap" style="color: #f39c12;"></i>
                        TNU-20: Bilimlarni Tekshirish Jurnali
                    </h2>
                    <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.7); font-size: 0.9em;">
                        Xavfsizlik texnikasi bo'yicha bilim tekshiruv natijalari
                    </p>
                </div>
                <button onclick="closeTNU20Window()" style="background: rgba(231, 76, 60, 0.2); border: 1px solid #e74c3c; color: white; font-size: 28px; cursor: pointer; width: 45px; height: 45px; border-radius: 50%; transition: all 0.3s;">&times;</button>
            </div>

            <!-- Tab Navigation -->
            <div style="padding: 15px 30px; background: rgba(0,0,0,0.2); display: flex; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <button class="tnu20-tab active" data-tab="table" onclick="switchTNU20Tab('table')" style="background: linear-gradient(45deg, #9b59b6, #8e44ad); border: none; color: white; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                    <i class="fas fa-table"></i> Jurnal
                </button>
                <button class="tnu20-tab" data-tab="new" onclick="switchTNU20Tab('new')" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                    <i class="fas fa-plus"></i> Yangi Yozuv
                </button>
                <button class="tnu20-tab" data-tab="stats" onclick="switchTNU20Tab('stats')" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                    <i class="fas fa-chart-pie"></i> Statistika
                </button>
            </div>

            <!-- Content Area -->
            <div id="tnu20-content" style="padding: 25px 30px; overflow-y: auto; flex-grow: 1; color: white;">
                <!-- Content will be loaded here -->
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    switchTNU20Tab('table');
}

// Close TNU-20 Window
function closeTNU20Window() {
    document.getElementById('tnu20-modal')?.remove();
    tnu20CurrentRecord = null;
}

// Switch between tabs
function switchTNU20Tab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tnu20-tab').forEach(btn => {
        if (btn.getAttribute('data-tab') === tab) {
            btn.style.background = 'linear-gradient(45deg, #9b59b6, #8e44ad)';
            btn.style.border = 'none';
        } else {
            btn.style.background = 'rgba(255,255,255,0.1)';
            btn.style.border = '1px solid rgba(255,255,255,0.2)';
        }
    });

    const content = document.getElementById('tnu20-content');
    if (!content) return;

    switch (tab) {
        case 'table':
            renderTNU20Table();
            break;
        case 'new':
            renderTNU20Form();
            break;
        case 'stats':
            renderTNU20Stats();
            break;
    }
}

// Render Table View
function renderTNU20Table() {
    const content = document.getElementById('tnu20-content');
    if (!content) return;

    const records = loadTNU20Records();

    let html = `
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                <input type="date" id="tnu20-filter-date" onchange="renderTNU20Table()" style="padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white;">
                <select id="tnu20-filter-result" onchange="renderTNU20Table()" style="padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white;">
                    <option value="">Barcha natijalar</option>
                    <option value="o'tdi">O'tdi</option>
                    <option value="o'tmadi">O'tmadi</option>
                </select>
                <input type="text" id="tnu20-filter-name" placeholder="Xodim ismi..." onkeyup="renderTNU20Table()" style="padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white; min-width: 200px;">
            </div>
            <button onclick="exportTNU20PDF()" style="background: linear-gradient(45deg, #e74c3c, #c0392b); border: none; color: white; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                <i class="fas fa-file-pdf"></i> PDF Chiqarish
            </button>
        </div>

        <div style="background: rgba(0,0,0,0.3); border-radius: 15px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
            <table style="width: 100%; border-collapse: collapse; color: white;">
                <thead>
                    <tr style="background: rgba(0,0,0,0.5);">
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.1); font-size: 0.85em;">Sana</th>
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.1); font-size: 0.85em;">Foto</th>
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.1); font-size: 0.85em;">F.I.O</th>
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.1); font-size: 0.85em;">Lavozim</th>
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.1); font-size: 0.85em;">Sabab</th>
                        <th style="padding: 10px; text-align: center; border-bottom: 2px solid rgba(255,255,255,0.1); font-size: 0.85em;">Natija</th>
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.1); font-size: 0.85em;">Keyingi sana</th>
                        <th style="padding: 10px; text-align: center; border-bottom: 2px solid rgba(255,255,255,0.1); font-size: 0.85em;">Amallar</th>
                    </tr>
                </thead>
                <tbody>
    `;

    // Apply filters
    const filterDate = document.getElementById('tnu20-filter-date')?.value || '';
    const filterResult = document.getElementById('tnu20-filter-result')?.value || '';
    const filterName = document.getElementById('tnu20-filter-name')?.value.toLowerCase() || '';

    let filtered = records.filter(r => {
        // Filter by bolinmaId first
        if (window.currentTNU20BolinmaId && window.currentTNU20BolinmaId !== 'all' && r.bolinmaId !== window.currentTNU20BolinmaId) return false;
        if (filterDate && r.date !== filterDate) return false;
        if (filterResult && r.result !== filterResult) return false;
        if (filterName && !r.workerName.toLowerCase().includes(filterName)) return false;
        return true;
    });

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));

    if (filtered.length === 0) {
        html += `
            <tr>
                <td colspan="9" style="padding: 40px; text-align: center; color: rgba(255,255,255,0.5);">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
                    Ma'lumot topilmadi
                </td>
            </tr>
        `;
    } else {
        filtered.forEach((record, index) => {
            const resultColor = record.result === "o'tdi" ? '#2ecc71' : '#e74c3c';
            const resultIcon = record.result === "o'tdi" ? 'fa-check-circle' : 'fa-times-circle';
            const nextTestWarning = new Date(record.nextTestDate) < new Date() ? 'color: #e74c3c; font-weight: bold;' : '';

            // Find worker for photo
            const allWorkers = JSON.parse(localStorage.getItem('smart_pch_workers') || '[]');
            const worker = allWorkers.find(w => w.id === record.workerId);
            const initials = record.workerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

            const photoHtml = worker && worker.photo
                ? `<img src="${worker.photo}" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 2px solid #8e44ad;">`
                : `<div style="width: 35px; height: 35px; border-radius: 50%; background: linear-gradient(135deg, #8e44ad, #9b59b6); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.75rem; color: white; border: 2px solid rgba(255,255,255,0.2);">${initials}</div>`;

            html += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 10px; font-size: 0.85em;">${record.date}</td>
                    <td style="padding: 5px;">${photoHtml}</td>
                    <td style="padding: 10px; font-weight: bold; font-size: 0.9em;">${record.workerName}</td>
                    <td style="padding: 10px; font-size: 0.8em; color: rgba(255,255,255,0.7);">${record.workerPosition}</td>
                    <td style="padding: 10px; font-size: 0.8em;">${record.testReason === 'navbatdagi' ? 'Navb' : 'N.tashq'}</td>
                    <td style="padding: 10px; text-align: center;">
                        <span style="background: ${resultColor}; padding: 3px 10px; border-radius: 12px; font-size: 0.75em; font-weight: bold; display: inline-flex; align-items: center; gap: 4px;">
                            <i class="fas ${resultIcon}"></i> ${record.result}
                        </span>
                    </td>
                    <td style="padding: 10px; font-size: 0.85em; ${nextTestWarning}">${record.nextTestDate}</td>
                    <td style="padding: 10px; text-align: center;">
                        <button onclick="viewTNU20Details('${record.id}')" style="background: rgba(52, 152, 219, 0.2); border: 1px solid #3498db; color: #3498db; padding: 4px 10px; border-radius: 5px; cursor: pointer; margin-right: 5px;">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="deleteTNU20Record('${record.id}')" style="background: rgba(231, 76, 60, 0.2); border: 1px solid #e74c3c; color: #e74c3c; padding: 4px 10px; border-radius: 5px; cursor: pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    html += `
                </tbody>
            </table>
        </div>

        <div style="margin-top: 20px; text-align: center; color: rgba(255,255,255,0.6);">
            Jami yozuvlar: <strong style="color: white;">${filtered.length}</strong> / ${records.length}
        </div>
    `;

    content.innerHTML = html;
}

// Render New Record Form
function renderTNU20Form() {
    const content = document.getElementById('tnu20-content');
    if (!content) return;

    const workers = getTNU20Workers(window.currentTNU20BolinmaId);
    const certNumber = generateCertificateNumber();
    const nextDate = calculateNextTestDate();

    content.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto;">
            <div style="background: rgba(0,0,0,0.3); padding: 30px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1);">
                <h3 style="margin-top: 0; color: #f39c12; border-bottom: 2px solid rgba(243, 156, 18, 0.3); padding-bottom: 15px;">
                    <i class="fas fa-clipboard-check"></i> Yangi Tekshiruv Yozuvi
                </h3>

                <div style="display: grid; gap: 20px;">
                    <!-- Worker Selection -->
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: rgba(255,255,255,0.8); font-weight: bold;">
                            Xodim:
                        </label>
                        <select id="tnu20-worker" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white; font-size: 1em;">
                            <option value="">Tanlang...</option>
                            ${workers.map(w => `<option value="${w.id}" data-name="${w.name}" data-position="${w.role || 'Xodim'}">${w.name} - ${w.role || 'Xodim'}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Test Reason -->
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: rgba(255,255,255,0.8); font-weight: bold;">
                            Tekshiruv sababi:
                        </label>
                        <select id="tnu20-reason" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white; font-size: 1em;">
                            <option value="navbatdagi" selected>Navbatdagi tekshiruv</option>
                            <option value="navbatdan-tashqari">Navbatdan tashqari tekshiruv</option>
                        </select>
                    </div>

                    <!-- Test Subject -->
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: rgba(255,255,255,0.8); font-weight: bold;">
                            Bilim tekshiruv mavzusi:
                        </label>
                        <textarea id="tnu20-subject" rows="3" placeholder="Qaysi instruksiyalar va qoidalar bo'yicha tekshirildi..." style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white; font-size: 1em; resize: vertical;"></textarea>
                    </div>

                    <!-- Test Result -->
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: rgba(255,255,255,0.8); font-weight: bold;">
                            Natija:
                        </label>
                        <select id="tnu20-result" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white; font-size: 1em;">
                            <option value="o'tdi" selected>✅ O'tdi</option>
                            <option value="o'tmadi">❌ O'tmadi</option>
                        </select>
                    </div>

                    <!-- Certificate Number (Auto-generated) -->
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: rgba(255,255,255,0.8); font-weight: bold;">
                            Guvohnoma raqami:
                        </label>
                        <input type="text" id="tnu20-certificate" value="${certNumber}" readonly style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.5); color: #3498db; font-size: 1em; font-family: monospace; font-weight: bold;">
                    </div>

                    <!-- Next Test Date (Auto-calculated) -->
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: rgba(255,255,255,0.8); font-weight: bold;">
                            Keyingi tekshiruv sanasi:
                        </label>
                        <input type="date" id="tnu20-next-date" value="${nextDate}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white; font-size: 1em;">
                    </div>

                    <!-- Submit Button -->
                    <button onclick="startTNU20Signing()" style="background: linear-gradient(45deg, #27ae60, #2ecc71); border: none; color: white; padding: 15px 30px; border-radius: 10px; font-size: 1.1em; font-weight: bold; cursor: pointer; margin-top: 10px; box-shadow: 0 5px 15px rgba(46, 204, 113, 0.3); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <i class="fas fa-signature"></i> Imzo Qo'yish va Saqlash
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Start signing process
function startTNU20Signing() {
    const workerId = document.getElementById('tnu20-worker').value;
    const reason = document.getElementById('tnu20-reason').value;
    const subject = document.getElementById('tnu20-subject').value.trim();
    const result = document.getElementById('tnu20-result').value;
    const certificate = document.getElementById('tnu20-certificate').value;
    const nextDate = document.getElementById('tnu20-next-date').value;

    if (!workerId) {
        alert('Iltimos, xodimni tanlang!');
        return;
    }
    if (!subject) {
        alert('Iltimos, tekshiruv mavzusini kiriting!');
        return;
    }

    const workerSelect = document.getElementById('tnu20-worker');
    const selectedOption = workerSelect.options[workerSelect.selectedIndex];

    tnu20CurrentRecord = {
        id: 'tnu20_' + Date.now(),
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        workerId: workerId,
        workerName: selectedOption.getAttribute('data-name'),
        workerPosition: selectedOption.getAttribute('data-position'),
        testReason: reason,
        testSubject: subject,
        result: result,
        certificateNumber: certificate,
        nextTestDate: nextDate,
        signature: null,
        bolinmaId: window.currentTNU20BolinmaId || 'all'
    };

    openTNU20SignatureModal();
}

// Open signature modal
function openTNU20SignatureModal() {
    const existing = document.getElementById('tnu20-signature-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'tnu20-signature-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.95); z-index: 10040; display: flex;
        justify-content: center; align-items: center;
    `;

    modal.innerHTML = `
        <div style="background: #2c3e50; width: 90%; max-width: 700px; border-radius: 15px; box-shadow: 0 0 30px rgba(0,0,0,0.5); border: 1px solid #34495e;">
            <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); background: linear-gradient(90deg, #9b59b6, #8e44ad); border-radius: 15px 15px 0 0;">
                <h3 style="margin: 0; color: white;">
                    <i class="fas fa-signature"></i> Xodim Imzosi
                </h3>
                <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.8); font-size: 0.9em;">
                    ${tnu20CurrentRecord.workerName}
                </p>
            </div>

            <div style="padding: 25px; text-align: center;">
                <div style="margin-bottom: 15px; color: #f39c12; font-weight: bold;">
                    Quyidagi maydonga barmoq yoki sichqoncha bilan imzo qo'ying:
                </div>
                <div style="background: white; display: inline-block; border-radius: 8px; cursor: crosshair;">
                    <canvas id="tnu20-signature-canvas" width="600" height="200" style="touch-action: none;"></canvas>
                </div>
                <br>
                <button onclick="clearTNU20Signature()" style="margin-top: 15px; background: #95a5a6; border: none; color: white; padding: 8px 20px; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-eraser"></i> Tozalash
                </button>
            </div>

            <div style="padding: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: right; background: rgba(0,0,0,0.2); border-radius: 0 0 15px 15px; display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="closeTNU20SignatureModal()" style="background: #95a5a6; border: none; color: white; padding: 12px 25px; border-radius: 8px; cursor: pointer;">
                    Bekor qilish
                </button>
                <button onclick="saveTNU20Signature()" style="background: linear-gradient(45deg, #27ae60, #2ecc71); border: none; color: white; padding: 12px 30px; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4);">
                    <i class="fas fa-check"></i> Tasdiqlash va Saqlash
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setupTNU20Canvas();
}

// Setup canvas for signature
function setupTNU20Canvas() {
    const canvas = document.getElementById('tnu20-signature-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    function startDraw(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        lastX = clientX - rect.left;
        lastY = clientY - rect.top;
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastX = x;
        lastY = y;
    }

    function stopDraw() {
        isDrawing = false;
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseout', stopDraw);
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDraw);
}

// Clear signature
function clearTNU20Signature() {
    const canvas = document.getElementById('tnu20-signature-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// Save signature and record
async function saveTNU20Signature() {
    const canvas = document.getElementById('tnu20-signature-canvas');
    if (!canvas) return;

    // Check if empty
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    if (canvas.toDataURL() === blank.toDataURL()) {
        alert('Iltimos, imzo qo\'ying!');
        return;
    }

    tnu20CurrentRecord.signature = canvas.toDataURL();

    // Save record to server
    await saveTNU20Records(tnu20CurrentRecord);

    // Refresh local list
    await loadTNU20Records();

    closeTNU20SignatureModal();
    alert('Tekshiruv natijasi muvaffaqiyatli saqlandi!');
    switchTNU20Tab('table');
    tnu20CurrentRecord = null;
}

// Close signature modal
function closeTNU20SignatureModal() {
    document.getElementById('tnu20-signature-modal')?.remove();
}

// View record details
function viewTNU20Details(recordId) {
    const record = tnu20Records.find(r => r.id === recordId);
    if (!record) return;

    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.9); z-index: 10050; display: flex;
        justify-content: center; align-items: center;
    `;

    const resultColor = record.result === "o'tdi" ? '#2ecc71' : '#e74c3c';
    const resultIcon = record.result === "o'tdi" ? 'fa-check-circle' : 'fa-times-circle';

    modal.innerHTML = `
        <div style="background: #2c3e50; width: 90%; max-width: 700px; border-radius: 15px; padding: 30px; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h3 style="margin: 0;"><i class="fas fa-file-alt"></i> Tekshiruv Ma'lumotlari</h3>
                <button onclick="this.closest('div').parentElement.remove()" style="background: none; border: none; color: white; font-size: 28px; cursor: pointer;">&times;</button>
            </div>

            <div style="display: grid; gap: 20px;">
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px;">
                    <div style="color: rgba(255,255,255,0.6); font-size: 0.9em; margin-bottom: 5px;">Xodim</div>
                    <div style="font-size: 1.2em; font-weight: bold;">${record.workerName}</div>
                    <div style="color: rgba(255,255,255,0.7); font-size: 0.9em;">${record.workerPosition}</div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px;">
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.9em; margin-bottom: 5px;">Sana</div>
                        <div style="font-weight: bold;">${record.date} ${record.time}</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px;">
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.9em; margin-bottom: 5px;">Sabab</div>
                        <div style="font-weight: bold;">${record.testReason === 'navbatdagi' ? 'Navbatdagi' : 'Navbatdan tashqari'}</div>
                    </div>
                </div>

                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px;">
                    <div style="color: rgba(255,255,255,0.6); font-size: 0.9em; margin-bottom: 5px;">Tekshiruv mavzusi</div>
                    <div>${record.testSubject}</div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="background: ${resultColor}20; padding: 15px; border-radius: 10px; border-left: 4px solid ${resultColor};">
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.9em; margin-bottom: 5px;">Natija</div>
                        <div style="font-weight: bold; color: ${resultColor}; display: flex; align-items: center; gap: 8px;">
                            <i class="fas ${resultIcon}"></i> ${record.result.charAt(0).toUpperCase() + record.result.slice(1)}
                        </div>
                    </div>
                    <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px;">
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.9em; margin-bottom: 5px;">Guvohnoma №</div>
                        <div style="font-weight: bold; color: #3498db; font-family: monospace;">${record.certificateNumber}</div>
                    </div>
                </div>

                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.9em; margin-bottom: 5px;">Keyingi tekshiruv sanasi</div>
                        <div style="font-weight: bold; color: #f39c12;">${record.nextTestDate}</div>
                    </div>
                    <div style="text-align: center; background: white; padding: 5px; border-radius: 5px;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=CERT:${record.certificateNumber}|ID:${record.workerId}|DATE:${record.date}" style="width: 80px; height: 80px;" alt="QR Verification">
                        <div style="color: black; font-size: 8px; font-weight: bold;">SKANERLANG</div>
                    </div>
                </div>

                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px;">
                    <div style="color: rgba(255,255,255,0.6); font-size: 0.9em; margin-bottom: 10px;">Xodim imzosi</div>
                    <img src="${record.signature}" style="width: 100%; max-width: 400px; background: white; border-radius: 8px; padding: 10px;">
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Delete record
async function deleteTNU20Record(recordId) {
    if (!confirm('Ushbu yozuvni o\'chirmoqchimisiz?')) return;

    try {
        await SmartUtils.fetchAPI(`/safety/tnu20/${recordId}`, { method: 'DELETE' });
        tnu20Records = tnu20Records.filter(r => r.id !== recordId);
        renderTNU20Table();
    } catch (e) {
        console.error('Delete error:', e);
    }
}

// Render Statistics
function renderTNU20Stats() {
    const content = document.getElementById('tnu20-content');
    if (!content) return;

    const records = loadTNU20Records();
    const passed = records.filter(r => r.result === "o'tdi").length;
    const failed = records.filter(r => r.result === "o'tmadi").length;
    const passRate = records.length > 0 ? ((passed / records.length) * 100).toFixed(1) : 0;

    // Upcoming tests (next 30 days)
    const today = new Date();
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcoming = records.filter(r => {
        const nextDate = new Date(r.nextTestDate);
        return nextDate >= today && nextDate <= next30Days;
    });

    content.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #9b59b6, #8e44ad); padding: 25px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                <div style="font-size: 0.9em; opacity: 0.9; margin-bottom: 10px;">Jami Tekshiruvlar</div>
                <div style="font-size: 2.5em; font-weight: bold;">${records.length}</div>
            </div>
            <div style="background: linear-gradient(135deg, #2ecc71, #27ae60); padding: 25px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                <div style="font-size: 0.9em; opacity: 0.9; margin-bottom: 10px;">O'tgan</div>
                <div style="font-size: 2.5em; font-weight: bold;">${passed}</div>
            </div>
            <div style="background: linear-gradient(135deg, #e74c3c, #c0392b); padding: 25px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                <div style="font-size: 0.9em; opacity: 0.9; margin-bottom: 10px;">O'tmagan</div>
                <div style="font-size: 2.5em; font-weight: bold;">${failed}</div>
            </div>
            <div style="background: linear-gradient(135deg, #f39c12, #e67e22); padding: 25px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                <div style="font-size: 0.9em; opacity: 0.9; margin-bottom: 10px;">O'tish Foizi</div>
                <div style="font-size: 2.5em; font-weight: bold;">${passRate}%</div>
            </div>
        </div>

        <div style="background: rgba(0,0,0,0.3); padding: 25px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 25px;">
            <h3 style="margin-top: 0; color: #f39c12; border-bottom: 2px solid rgba(243, 156, 18, 0.3); padding-bottom: 15px;">
                <i class="fas fa-calendar-alt"></i> Yaqin Kunlarda Tekshiruvlar (30 kun ichida)
            </h3>
            ${upcoming.length === 0 ? `
                <div style="text-align: center; padding: 30px; color: rgba(255,255,255,0.5);">
                    <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
                    Yaqin kunlarda tekshiruv yo'q
                </div>
            ` : `
                <div style="display: grid; gap: 10px;">
                    ${upcoming.map(r => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(241, 196, 15, 0.1); border-left: 4px solid #f1c40f; border-radius: 8px;">
                            <div>
                                <div style="font-weight: bold;">${r.workerName}</div>
                                <div style="font-size: 0.9em; color: rgba(255,255,255,0.7);">${r.workerPosition}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="color: #f39c12; font-weight: bold;">${r.nextTestDate}</div>
                                <div style="font-size: 0.85em; color: rgba(255,255,255,0.6);">
                                    ${Math.ceil((new Date(r.nextTestDate) - today) / (24 * 60 * 60 * 1000))} kun qoldi
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>

        <div style="background: rgba(0,0,0,0.3); padding: 25px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1);">
            <h3 style="margin-top: 0; color: #f39c12; border-bottom: 2px solid rgba(243, 156, 18, 0.3); padding-bottom: 15px;">
                Natijalar Bo'yicha
            </h3>
            <div style="display: grid; gap: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(46, 204, 113, 0.2); border-left: 4px solid #2ecc71; border-radius: 8px;">
                    <span><i class="fas fa-check-circle"></i> O'tgan xodimlar</span>
                    <strong style="font-size: 1.3em;">${passed}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(231, 76, 60, 0.2); border-left: 4px solid #e74c3c; border-radius: 8px;">
                    <span><i class="fas fa-times-circle"></i> O'tmagan xodimlar</span>
                    <strong style="font-size: 1.3em;">${failed}</strong>
                </div>
            </div>
        </div>
    `;
}

// Export to PDF (simplified)
function exportTNU20PDF() {
    alert('PDF eksport funksiyasi ishlab chiqilmoqda...\n\nHozircha jadval ma\'lumotlarini nusxalash yoki ekran suratini olishingiz mumkin.');
}

// Global exports
window.openTNU20Window = openTNU20Window;
window.closeTNU20Window = closeTNU20Window;
window.switchTNU20Tab = switchTNU20Tab;
window.renderTNU20Table = renderTNU20Table;
window.renderTNU20Form = renderTNU20Form;
window.renderTNU20Stats = renderTNU20Stats;
window.startTNU20Signing = startTNU20Signing;
window.saveTNU20Signature = saveTNU20Signature;
window.clearTNU20Signature = clearTNU20Signature;
window.closeTNU20SignatureModal = closeTNU20SignatureModal;
window.viewTNU20Details = viewTNU20Details;
window.deleteTNU20Record = deleteTNU20Record;
window.exportTNU20PDF = exportTNU20PDF;
window.openTNU20Window = openTNU20Window;
console.log('✅ TNU-20 Module Loaded');
