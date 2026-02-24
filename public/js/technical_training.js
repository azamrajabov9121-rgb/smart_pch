// Technical Training: Texnik O'quv Mashg'ulotlari Jurnali
// Technical Training Journal with Multi-Signature Support

let techTrainingRecords = [];
let techTrainingCurrentRecord = null;
let techTrainingSignatureStep = 'instructor'; // 'instructor' or 'attendee'
let currentSigningAttendeeId = null;

// Load records from localStorage
function loadTechTrainingRecords() {
    const stored = localStorage.getItem('tech_training_records');
    if (stored) {
        techTrainingRecords = JSON.parse(stored);
    }
    return techTrainingRecords;
}

// Save records to localStorage
function saveTechTrainingRecords() {
    localStorage.setItem('tech_training_records', JSON.stringify(techTrainingRecords));
}

// Get workers list filtered by bolinmaId (reusing logic from other modules if possible, or independent)
function getTechTrainingWorkers(bolinmaId) {
    let allWorkers = [];
    // Try HR data first
    if (typeof window.hrData !== 'undefined' && window.hrData.employees && window.hrData.employees.length > 0) {
        allWorkers = window.hrData.employees.map(emp => ({
            id: emp.id || emp.tabelNumber,
            name: emp.name,
            position: emp.position,
            bolinma: emp.department,
            bolinmaId: emp.department
        }));
    } else {
        // Fallback
        const saved = localStorage.getItem('smart_pch_workers');
        if (saved && saved !== '[]' && saved !== 'null') {
            allWorkers = JSON.parse(saved);
        } else if (typeof window.workersData !== 'undefined') {
            allWorkers = window.workersData;
        }
    }

    if (bolinmaId && bolinmaId !== 'all') {
        const bolinmaNumMatch = String(bolinmaId).match(/\d+/);
        const bolinmaNum = bolinmaNumMatch ? bolinmaNumMatch[0] : bolinmaId;
        const format1 = `bolinma${bolinmaNum}`;
        const format2 = `${bolinmaNum}`;
        const format3 = `${bolinmaNum}-bo'linma`;

        return allWorkers.filter(w => {
            const wBolinma = String(w.bolinma || w.bolinmaId || '').toLowerCase();
            return wBolinma.includes(format1) || wBolinma.includes(format2) || wBolinma.includes(format3) || wBolinma === String(bolinmaId).toLowerCase();
        });
    }
    return allWorkers;
}

// Open Technical Training Window
function openTechTrainingWindow(bolinmaId) {
    loadTechTrainingRecords();
    window.currentTechTrainingBolinmaId = bolinmaId;

    const existing = document.getElementById('tech-training-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'tech-training-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.95); z-index: 10030; display: flex;
        justify-content: center; align-items: center; overflow-y: auto;
    `;

    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); width: 95%; max-width: 1400px; max-height: 95vh; border-radius: 20px; display: flex; flex-direction: column; box-shadow: 0 0 50px rgba(0,0,0,0.8); border: 2px solid rgba(255,255,255,0.1);">
            
            <!-- Header -->
            <div style="padding: 20px 30px; border-bottom: 2px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); border-radius: 20px 20px 0 0;">
                <div>
                    <h2 style="margin: 0; color: white; display: flex; align-items: center; gap: 15px;">
                        <i class="fas fa-chalkboard-teacher" style="color: #e67e22;"></i>
                        Texnik O'quv Mashg'ulotlari Jurnali
                    </h2>
                    <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.7); font-size: 0.9em;">
                        Xodimlarning malakasini oshirish va texnik o'quv mashg'ulotlari hisobi
                    </p>
                </div>
                <button onclick="closeTechTrainingWindow()" style="background: rgba(231, 76, 60, 0.2); border: 1px solid #e74c3c; color: white; font-size: 28px; cursor: pointer; width: 45px; height: 45px; border-radius: 50%; transition: all 0.3s;">&times;</button>
            </div>

            <!-- Tab Navigation -->
            <div style="padding: 15px 30px; background: rgba(0,0,0,0.2); display: flex; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <button class="tech-tab active" data-tab="table" onclick="switchTechTrainingTab('table')" style="background: linear-gradient(45deg, #e67e22, #d35400); border: none; color: white; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                    <i class="fas fa-table"></i> Jurnal
                </button>
                <button class="tech-tab" data-tab="new" onclick="switchTechTrainingTab('new')" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                    <i class="fas fa-plus"></i> Yangi Mashg'ulot
                </button>
                <button class="tech-tab" data-tab="stats" onclick="switchTechTrainingTab('stats')" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                    <i class="fas fa-chart-pie"></i> Statistika
                </button>
            </div>

            <!-- Content Area -->
            <div id="tech-training-content" style="padding: 25px 30px; overflow-y: auto; flex-grow: 1; color: white;">
                <!-- Content will be loaded here -->
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    switchTechTrainingTab('table');
}

function closeTechTrainingWindow() {
    document.getElementById('tech-training-modal')?.remove();
    techTrainingCurrentRecord = null;
}

function switchTechTrainingTab(tab) {
    document.querySelectorAll('.tech-tab').forEach(btn => {
        if (btn.getAttribute('data-tab') === tab) {
            btn.style.background = 'linear-gradient(45deg, #e67e22, #d35400)';
            btn.style.border = 'none';
        } else {
            btn.style.background = 'rgba(255,255,255,0.1)';
            btn.style.border = '1px solid rgba(255,255,255,0.2)';
        }
    });

    const content = document.getElementById('tech-training-content');
    if (!content) return;

    switch (tab) {
        case 'table':
            renderTechTrainingTable();
            break;
        case 'new':
            renderTechTrainingForm();
            break;
        case 'stats':
            renderTechTrainingStats();
            break;
    }
}

function renderTechTrainingTable() {
    const content = document.getElementById('tech-training-content');
    if (!content) return;

    const records = loadTechTrainingRecords();

    // Filters
    const filterDate = document.getElementById('tech-filter-date')?.value || '';
    const filterName = document.getElementById('tech-filter-name')?.value.toLowerCase() || '';

    let filtered = records.filter(r => {
        if (window.currentTechTrainingBolinmaId && window.currentTechTrainingBolinmaId !== 'all' && r.bolinmaId !== window.currentTechTrainingBolinmaId) return false;
        if (filterDate && r.date !== filterDate) return false;
        if (filterName && !r.topic.toLowerCase().includes(filterName)) return false;
        return true;
    });

    // Sort descending by date
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    let html = `
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; gap: 15px;">
                <input type="date" id="tech-filter-date" onchange="renderTechTrainingTable()" style="padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white;">
                <input type="text" id="tech-filter-name" placeholder="Mavzu bo'yicha qidiruv..." onkeyup="renderTechTrainingTable()" style="padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white; min-width: 250px;">
            </div>
            <button onclick="alert('PDF eksport tez orada qo\\'shiladi')" style="background: linear-gradient(45deg, #c0392b, #e74c3c); border: none; color: white; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                <i class="fas fa-file-pdf"></i> PDF
            </button>
        </div>

        <div style="background: rgba(0,0,0,0.3); border-radius: 15px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
            <table style="width: 100%; border-collapse: collapse; color: white;">
                <thead>
                    <tr style="background: rgba(0,0,0,0.5);">
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.1);">Sana</th>
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.1);">Mavzu</th>
                        <th style="padding: 15px; text-align: center; border-bottom: 2px solid rgba(255,255,255,0.1);">Soat</th>
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.1);">O'tkazuvchi</th>
                        <th style="padding: 15px; text-align: center; border-bottom: 2px solid rgba(255,255,255,0.1);">Qatnashchilar</th>
                        <th style="padding: 15px; text-align: center; border-bottom: 2px solid rgba(255,255,255,0.1);">Amallar</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (filtered.length === 0) {
        html += `<tr><td colspan="6" style="padding: 40px; text-align: center; color: rgba(255,255,255,0.5);">Ma'lumot topilmadi</td></tr>`;
    } else {
        filtered.forEach(r => {
            const signedCount = r.attendees.filter(a => a.signature).length;
            const totalCount = r.attendees.length;
            const progress = Math.round((signedCount / totalCount) * 100);

            html += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 15px;">${r.date}</td>
                    <td style="padding: 15px; font-weight: bold;">${r.topic}</td>
                    <td style="padding: 15px; text-align: center;"><span style="background: rgba(255,255,255,0.1); padding: 5px 10px; border-radius: 5px;">${r.hours} soat</span></td>
                    <td style="padding: 15px;">${r.instructorName}</td>
                    <td style="padding: 15px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                                <div style="height: 100%; background: ${progress === 100 ? '#2ecc71' : '#f39c12'}; width: ${progress}%"></div>
                            </div>
                            <span style="font-size: 0.8em; color: rgba(255,255,255,0.7);">${signedCount}/${totalCount}</span>
                        </div>
                    </td>
                    <td style="padding: 15px; text-align: center;">
                        <button onclick="viewTechTrainingDetails('${r.id}')" style="background: rgba(52, 152, 219, 0.2); border: 1px solid #3498db; color: #3498db; padding: 6px 12px; border-radius: 5px; cursor: pointer; transition: 0.2s;">
                            <i class="fas fa-eye"></i> Ko'rish
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    html += `</tbody></table></div>`;
    content.innerHTML = html;
}

function renderTechTrainingForm() {
    const content = document.getElementById('tech-training-content');
    if (!content) return;

    const workers = getTechTrainingWorkers(window.currentTechTrainingBolinmaId);

    content.innerHTML = `
        <div style="max-width: 900px; margin: 0 auto;">
            <div style="background: rgba(0,0,0,0.3); padding: 30px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1);">
                <h3 style="margin-top: 0; color: #e67e22; border-bottom: 2px solid rgba(230, 126, 34, 0.3); padding-bottom: 15px;">
                    <i class="fas fa-edit"></i> Yangi Mashg'ulot Yaratish
                </h3>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold;">Sana:</label>
                        <input type="date" id="tech-date" value="${new Date().toISOString().slice(0, 10)}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold;">Davomiyligi (soat):</label>
                        <input type="number" id="tech-hours" value="2" min="1" max="8" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white;">
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold;">Mashg'ulot Mavzusi:</label>
                    <input type="text" id="tech-topic" placeholder="Masalan: Temir yo'l izlarini ta'mirlash qoidalari" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white;">
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold;">O'tkazuvchi (Instructor):</label>
                    <input type="text" id="tech-instructor" value="Mahmudov M.U." style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white;">
                </div>

                <div style="margin-bottom: 30px;">
                    <label style="display: block; margin-bottom: 15px; font-weight: bold; display: flex; justify-content: space-between;">
                        <span>Qatnashchilar:</span>
                        <button onclick="document.querySelectorAll('.tech-worker-cb').forEach(c => c.checked = true)" style="font-size: 0.8em; background: none; border: none; color: #4aa3ff; cursor: pointer;">Barchasini tanlash</button>
                    </label>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; max-height: 300px; overflow-y: auto; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 10px;">
                        ${workers.map(w => `
                            <label style="display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                                <input type="checkbox" class="tech-worker-cb" value="${w.id}" data-name="${w.name}" data-pos="${w.position || 'Xodim'}" style="width: 18px; height: 18px;">
                                <span>${w.name}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <div style="text-align: right;">
                    <button onclick="createTechTrainingSession()" style="background: linear-gradient(45deg, #2ecc71, #27ae60); border: none; color: white; padding: 15px 40px; border-radius: 10px; font-size: 1.1em; font-weight: bold; cursor: pointer; box-shadow: 0 5px 15px rgba(46, 204, 113, 0.3);">
                        <i class="fas fa-check"></i> Yaratish va Imzlash
                    </button>
                </div>
            </div>
        </div>
    `;
}

function createTechTrainingSession() {
    const topic = document.getElementById('tech-topic').value;
    const date = document.getElementById('tech-date').value;
    const hours = document.getElementById('tech-hours').value;
    const instructor = document.getElementById('tech-instructor').value;

    // Get selected attendees
    const checkboxes = document.querySelectorAll('.tech-worker-cb:checked');
    if (checkboxes.length === 0) {
        alert("Iltimos, kamida bitta qatnashchini tanlang!");
        return;
    }
    if (!topic) {
        alert("Mavzuni kiriting!");
        return;
    }

    const attendees = Array.from(checkboxes).map(cb => ({
        id: cb.value,
        name: cb.getAttribute('data-name'),
        position: cb.getAttribute('data-pos'),
        signature: null
    }));

    techTrainingCurrentRecord = {
        id: 'tt_' + Date.now(),
        date,
        topic,
        hours,
        instructorName: instructor,
        instructorSignature: null,
        bolinmaId: window.currentTechTrainingBolinmaId || 'all',
        attendees
    };

    // Step 1: Instructor Signs
    techTrainingSignatureStep = 'instructor';
    openTechTrainingSignatureModal();
}

function openTechTrainingSignatureModal() {
    const modalId = 'tech-sig-modal';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const isInstructor = techTrainingSignatureStep === 'instructor';
    let signerName = 'Mas\'ul Shaxs';
    let signerPos = '';

    if (isInstructor) {
        signerName = techTrainingCurrentRecord.instructorName;
        signerPos = 'O\'tkazuvchi';
    } else {
        const attendee = techTrainingCurrentRecord.attendees.find(a => a.id === currentSigningAttendeeId);
        if (attendee) {
            signerName = attendee.name;
            signerPos = attendee.position;
        }
    }

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.9); z-index: 10050; display: flex;
        justify-content: center; align-items: center;
    `;

    modal.innerHTML = `
        <div style="background: #2c3e50; width: 90%; max-width: 700px; border-radius: 15px; padding: 25px; box-shadow: 0 0 40px rgba(0,0,0,0.7);">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: white;">${isInstructor ? 'O\'tkazuvchi Imzosi' : 'Qatnashchi Imzosi'}</h2>
                <p style="color: #bdc3c7; font-size: 1.2em; margin-top: 5px;">${signerName}</p>
                <p style="color: #7f8c8d; margin-top: 0;">${signerPos}</p>
            </div>

            <div style="background: white; border-radius: 10px; cursor: crosshair; overflow: hidden; margin-bottom: 20px;">
                <canvas id="tech-sig-canvas" width="650" height="250" style="display: block; width: 100%; touch-action: none;"></canvas>
            </div>

            <div style="display: flex; gap: 15px; justify-content: center;">
                <button onclick="clearTechTrainingSignature()" style="background: #7f8c8d; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer;">
                    <i class="fas fa-eraser"></i> Tozalash
                </button>
                <button onclick="saveTechTrainingSignature()" style="background: #27ae60; color: white; border: none; padding: 12px 40px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1.1em;">
                    <i class="fas fa-check"></i> Tasdiqlash
                </button>
                <button onclick="document.getElementById('${modalId}').remove()" style="background: transparent; color: #95a5a6; border: 1px solid #95a5a6; padding: 12px 20px; border-radius: 8px; cursor: pointer;">
                    Bekor qilish
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setupTechSignatureCanvas();
}

function setupTechSignatureCanvas() {
    const canvas = document.getElementById('tech-sig-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';

    let isDrawing = false;
    let lastX = 0; let lastY = 0;

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function start(e) {
        isDrawing = true;
        const pos = getPos(e);
        lastX = pos.x; lastY = pos.y;
    }

    function move(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastX = pos.x; lastY = pos.y;
    }

    function end() { isDrawing = false; }

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end);
}

function clearTechTrainingSignature() {
    const canvas = document.getElementById('tech-sig-canvas');
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

function saveTechTrainingSignature() {
    const canvas = document.getElementById('tech-sig-canvas');
    // Check blank
    const blank = document.createElement('canvas');
    blank.width = canvas.width; blank.height = canvas.height;
    if (canvas.toDataURL() === blank.toDataURL()) {
        alert("Imzo qo'ying!");
        return;
    }
    const signature = canvas.toDataURL();

    if (techTrainingSignatureStep === 'instructor') {
        techTrainingCurrentRecord.instructorSignature = signature;
        // Save initially
        techTrainingRecords.push(techTrainingCurrentRecord);
        saveTechTrainingRecords();
        document.getElementById('tech-sig-modal').remove();
        // Go to View
        switchTechTrainingTab('table');
        viewTechTrainingDetails(techTrainingCurrentRecord.id);
    } else {
        // Attendee signing
        const attendee = techTrainingCurrentRecord.attendees.find(a => a.id === currentSigningAttendeeId);
        if (attendee) {
            attendee.signature = signature;
            // Update in records
            const idx = techTrainingRecords.findIndex(r => r.id === techTrainingCurrentRecord.id);
            if (idx !== -1) techTrainingRecords[idx] = techTrainingCurrentRecord;
            saveTechTrainingRecords();
            document.getElementById('tech-sig-modal').remove();
            viewTechTrainingDetails(techTrainingCurrentRecord.id); // Refresh detail view
        }
    }
}

function viewTechTrainingDetails(recordId) {
    const records = loadTechTrainingRecords();
    techTrainingCurrentRecord = records.find(r => r.id === recordId);
    if (!techTrainingCurrentRecord) return;

    const modalId = 'tech-details-modal';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.95); z-index: 10040; display: flex;
        justify-content: center; align-items: center; overflow-y: auto;
    `;

    const attendeesHtml = techTrainingCurrentRecord.attendees.map(a => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03);">
            <div>
                <div style="font-weight: bold; color: white;">${a.name}</div>
                <div style="font-size: 0.85em; color: rgba(255,255,255,0.6);">${a.position}</div>
            </div>
            <div>
                ${a.signature
            ? `<img src="${a.signature}" style="height: 30px; background: white; padding: 2px; border-radius: 4px;">`
            : `<button onclick="signForAttendee('${a.id}')" style="background: #e67e22; border: none; color: white; padding: 5px 15px; border-radius: 4px; cursor: pointer; font-size: 0.8em;"><i class="fas fa-pen"></i> Imzlash</button>`
        }
            </div>
        </div>
    `).join('');

    modal.innerHTML = `
        <div style="background: #2c3e50; width: 95%; max-width: 800px; border-radius: 15px; overflow: hidden; box-shadow: 0 0 50px rgba(0,0,0,0.5);">
            <div style="padding: 20px; background: linear-gradient(90deg, #e67e22, #d35400); color: white; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0;"><i class="fas fa-book-open"></i> Mashg'ulot Tafsilotlari</h3>
                <button onclick="document.getElementById('${modalId}').remove()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">&times;</button>
            </div>
            <div style="padding: 30px; max-height: 80vh; overflow-y: auto;">
                <div style="margin-bottom: 25px;">
                    <div style="color: #bdc3c7; font-size: 0.9em; margin-bottom: 5px;">Mavzu</div>
                    <div style="font-size: 1.4em; color: white; font-weight: bold;">${techTrainingCurrentRecord.topic}</div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                    <div>
                        <div style="color: #bdc3c7; font-size: 0.9em;">Sana</div>
                        <div style="color: white; font-weight: bold;">${techTrainingCurrentRecord.date}</div>
                    </div>
                    <div>
                        <div style="color: #bdc3c7; font-size: 0.9em;">Davomiyligi</div>
                        <div style="color: white; font-weight: bold;">${techTrainingCurrentRecord.hours} soat</div>
                    </div>
                    <div>
                        <div style="color: #bdc3c7; font-size: 0.9em;">O'tkazuvchi</div>
                        <div style="color: white; font-weight: bold;">${techTrainingCurrentRecord.instructorName}</div>
                    </div>
                    <div>
                        <div style="color: #bdc3c7; font-size: 0.9em;">O'tkazuvchi Imzosi</div>
                        ${techTrainingCurrentRecord.instructorSignature ? `<img src="${techTrainingCurrentRecord.instructorSignature}" style="height: 40px; background: white; padding: 2px; border-radius: 4px;">` : 'Mavjud emas'}
                    </div>
                </div>

                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 15px;">
                    <h4 style="margin: 0 0 15px 0; color: #e67e22; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
                        Qatnashchilar (${techTrainingCurrentRecord.attendees.length})
                    </h4>
                    <div style="display: grid; gap: 5px;">
                        ${attendeesHtml}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function signForAttendee(attendeeId) {
    if (!techTrainingCurrentRecord) return;
    techTrainingSignatureStep = 'attendee';
    currentSigningAttendeeId = attendeeId;
    openTechTrainingSignatureModal();
}

function renderTechTrainingStats() {
    const content = document.getElementById('tech-training-content');
    if (!content) return;
    const records = loadTechTrainingRecords();

    // Calculate total hours per month or sessions count
    const totalSessions = records.length;
    let totalHours = 0;
    records.forEach(r => totalHours += Number(r.hours));

    content.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
            <div style="background: linear-gradient(135deg, #3498db, #2980b9); padding: 20px; border-radius: 15px; color: white;">
                <h3>Jami Mashg'ulotlar</h3>
                <div style="font-size: 3em; font-weight: bold;">${totalSessions}</div>
            </div>
            <div style="background: linear-gradient(135deg, #e67e22, #d35400); padding: 20px; border-radius: 15px; color: white;">
                <h3>Jami Soatlar</h3>
                <div style="font-size: 3em; font-weight: bold;">${totalHours}</div>
            </div>
             <div style="background: linear-gradient(135deg, #9b59b6, #8e44ad); padding: 20px; border-radius: 15px; color: white;">
                <h3>O'rtacha Ishtirok</h3>
                <div style="font-size: 3em; font-weight: bold;">${totalSessions ? Math.round(records.reduce((acc, r) => acc + r.attendees.length, 0) / totalSessions) : 0}</div>
            </div>
        </div>
    `;
}

// Global exports
window.openTechTrainingWindow = openTechTrainingWindow;
window.closeTechTrainingWindow = closeTechTrainingWindow;
window.switchTechTrainingTab = switchTechTrainingTab;
window.renderTechTrainingTable = renderTechTrainingTable;
window.renderTechTrainingForm = renderTechTrainingForm;
window.createTechTrainingSession = createTechTrainingSession;
window.viewTechTrainingDetails = viewTechTrainingDetails;
window.signForAttendee = signForAttendee;
window.openTechTrainingSignatureModal = openTechTrainingSignatureModal;
window.clearTechTrainingSignature = clearTechTrainingSignature;
window.saveTechTrainingSignature = saveTechTrainingSignature;
window.renderTechTrainingStats = renderTechTrainingStats;
console.log('✅ Technical Training Module Loaded');
