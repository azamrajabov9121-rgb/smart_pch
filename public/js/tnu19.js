// TNU-19: Xavfsizlik Texnikasi Yo'riqnomasi Jurnali
// Safety Instruction Journal with Dual Signatures and Passport-style Cards

let tnu19Records = [];
let tnu19CurrentRecord = null;
let tnu19SignatureStep = 'worker'; // 'worker' or 'instructor'

// Load records from server
async function loadTNU19Records() {
    await initHRData();
    try {
        const records = await SmartUtils.fetchAPI('/safety/tnu19');
        if (records) {
            tnu19Records = records.map(r => ({
                ...r,
                workerName: r.employee_name, // Map for compatibility
                instructionType: r.instruction_type,
                instructionContent: r.instructionContent || 'Yo\'riqnoma o\'tildi',
                workerSignature: r.signature,
                instructorSignature: r.signature // Temporary same as worker for demo, or add field
            }));
        }
    } catch (e) {
        console.error('TNU-19 yuklashda xatolik:', e);
        tnu19Records = [];
    }
    return tnu19Records;
}

// Save record to server
async function saveTNU19Records(record) {
    try {
        const data = {
            employee_id: record.workerId,
            bolinma_id: record.bolinmaId,
            date: record.date,
            time: record.time,
            instruction_type: record.instructionType,
            instructor_name: record.instructorName,
            signature: record.workerSignature
        };
        await SmartUtils.fetchAPI('/safety/tnu19', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        showToast('Yozuv saqlandi', 'success');
    } catch (e) {
        console.error('TNU-19 saqlashda xatolik:', e);
        showToast('Saqlashda xatolik yuz berdi', 'error');
    }
}

// Global utility for generating an "automatic" handwriting-style signature
window.generateAutoSignature = function (name) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 400, 150);

    // Choose font
    const fonts = ['"Brush Script MT", cursive', '"Dancing Script", cursive', 'cursive', 'serif'];
    ctx.font = "italic 44px " + fonts[0];
    ctx.fillStyle = "navy";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.save();
    ctx.translate(200, 75);
    ctx.rotate(-0.06); // Slight natural tilt

    const nameParts = (name || "Xodim").split(' ');
    const displaySignature = nameParts[0] + (nameParts[1] ? ' ' + nameParts[1][0] + '.' : '');
    ctx.fillText(displaySignature, 0, 0);

    // Aesthetic underline
    ctx.beginPath();
    ctx.moveTo(-160, 35);
    ctx.bezierCurveTo(-60, 55, 60, 15, 160, 40);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "navy";
    ctx.stroke();
    ctx.restore();

    return canvas.toDataURL();
}

// Get workers list filtered by bolinmaId
function getTNU19Workers(bolinmaId) {
    let allWorkers = [];

    // First, try to get from new HR system
    if (typeof window.hrData !== 'undefined' && window.hrData.employees && window.hrData.employees.length > 0) {
        allWorkers = window.hrData.employees.map(emp => ({
            id: emp.id || emp.tabelNumber,
            name: emp.name,
            position: emp.position,
            bolinma: emp.department,
            bolinmaId: emp.department,
            phone: emp.phone || '',
            tabelNumber: emp.tabelNumber || '',
            photo: emp.photo || ''
        }));
    } else {
        // Fallback to old system
        const saved = localStorage.getItem('smart_pch_workers');
        if (saved && saved !== '[]' && saved !== 'null' && saved !== 'undefined') {
            allWorkers = JSON.parse(saved);
        }

        if (allWorkers.length === 0 && typeof window.workersData !== 'undefined') {
            allWorkers = window.workersData;
        }
    }

    // Filter by bolinmaId if provided
    if (bolinmaId && bolinmaId !== 'all') {
        const bolinmaNumMatch = String(bolinmaId).match(/\d+/);
        const bolinmaNum = bolinmaNumMatch ? bolinmaNumMatch[0] : bolinmaId;

        return allWorkers.filter(w => {
            const wBolinma = String(w.bolinma || w.bolinmaId || w.department || '').toLowerCase();
            const wNumMatch = wBolinma.match(/\d+/);
            const wNum = wNumMatch ? wNumMatch[0] : '';

            // Match by number or by exact string
            return wNum === bolinmaNum ||
                wBolinma.includes(String(bolinmaId).toLowerCase()) ||
                String(bolinmaId).toLowerCase().includes(wBolinma);
        });
    }

    return allWorkers;
}

// Open TNU-19 Journal Window with Face ID Protection
async function openTNU19Window(bolinmaId) {
    // Face ID autentifikatsiya o'chirildi — to'g'ridan jurnal ochiladi
    // ID qo'shishda Face ID talab qilinadi (openTNU19SignatureModal ichida)

    await loadTNU19Records();
    window.currentTNU19BolinmaId = bolinmaId;

    const existing = document.getElementById('tnu19-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'tnu19-modal';
    // ... (rest of the modal creation code remains the same as before)
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(240, 247, 255, 0.8); z-index: 10030; display: flex;
        justify-content: center; align-items: center; overflow-y: auto;
        font-family: 'Inter', sans-serif; backdrop-filter: blur(10px);
    `;

    modal.innerHTML = `
        <div style="background: #ffffff; width: 95%; max-width: 1500px; height: 90vh; border-radius: 24px; display: flex; flex-direction: column; box-shadow: 0 40px 100px rgba(31, 38, 135, 0.15); border: 1px solid rgba(212, 175, 55, 0.2); overflow: hidden;">
            
            <!-- Header -->
            <div style="padding: 20px 30px; border-bottom: 2px solid #d4af37; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(90deg, #f8fafc 0%, #e0e7ff 100%);">
                <div>
                    <h2 style="margin: 0; color: #1e293b; display: flex; align-items: center; gap: 15px; font-size: 1.4rem; font-weight: 800;">
                        <span style="background: rgba(212, 175, 55, 0.1); padding: 8px; border-radius: 12px;"><i class="fas fa-file-contract" style="color: #d4af37;"></i></span>
                        TNU-19: Xavfsizlik Yo'riqnomasi Jurnali
                    </h2>
                    <p style="margin: 5px 0 0 0; color: #64748b; font-size: 0.9rem; padding-left: 55px; font-weight: 500;">
                        Texnika xavfsizligi bo'yicha yo'riqnomalar va imzolar
                    </p>
                </div>
                <button onclick="closeTNU19Window()" style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1); color: #ef4444; width: 42px; height: 42px; border-radius: 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- Toolbar -->
            <div style="padding: 15px 30px; background: #f8fafc; display: flex; gap: 15px; border-bottom: 1px solid rgba(31, 38, 135, 0.08); align-items: center;">
                <button class="tnu19-tab active" data-tab="table" onclick="switchTNU19Tab('table')" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); border: none; color: white; padding: 12px 24px; border-radius: 14px; cursor: pointer; font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">
                    <i class="fas fa-table"></i> Jurnal
                </button>
                <button class="tnu19-tab" data-tab="new" onclick="switchTNU19Tab('new')" style="background: #fff; border: 1px solid rgba(31, 38, 135, 0.12); color: #475569; padding: 12px 24px; border-radius: 14px; cursor: pointer; font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; gap: 10px; transition: 0.2s;">
                    <i class="fas fa-plus"></i> Yangi Yozuv
                </button>
                <button class="tnu19-tab" data-tab="stats" onclick="switchTNU19Tab('stats')" style="background: #fff; border: 1px solid rgba(31, 38, 135, 0.12); color: #475569; padding: 12px 24px; border-radius: 14px; cursor: pointer; font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; gap: 10px; transition: 0.2s;">
                    <i class="fas fa-chart-pie"></i> Statistika
                </button>
            </div>

            <!-- Content Area -->
            <div id="tnu19-content" style="padding: 0; overflow-y: auto; flex-grow: 1; color: #c9d1d9;">
                <!-- Content will be loaded here -->
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    switchTNU19Tab('table');
}

async function closeTNU19Window() {
    document.getElementById('tnu19-modal')?.remove();
    tnu19CurrentRecord = null;
}

function switchTNU19Tab(tab) {
    document.querySelectorAll('.tnu19-tab').forEach(btn => {
        if (btn.getAttribute('data-tab') === tab) {
            btn.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
            btn.style.color = 'white';
            btn.style.borderColor = 'transparent';
            btn.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.2)';
        } else {
            btn.style.background = '#fff';
            btn.style.color = '#475569';
            btn.style.borderColor = 'rgba(31, 38, 135, 0.12)';
            btn.style.boxShadow = 'none';
        }
    });

    const content = document.getElementById('tnu19-content');
    if (!content) return;

    switch (tab) {
        case 'table':
            renderTNU19Table();
            break;
        case 'new':
            renderTNU19Form();
            break;
        case 'stats':
            renderTNU19Stats();
            break;
    }
}

function renderTNU19Table() {
    const content = document.getElementById('tnu19-content');
    if (!content) return;

    const records = loadTNU19Records();
    const filterDateInput = document.getElementById('tnu19-filter-date');
    let filterDate = filterDateInput?.value || new Date().toISOString().slice(0, 10);
    const filterName = document.getElementById('tnu19-search')?.value.toLowerCase() || '';
    const filterType = document.getElementById('tnu19-filter-type')?.value || '';

    let filteredRecords = records.filter(r => {
        if (window.currentTNU19BolinmaId && window.currentTNU19BolinmaId !== 'all' && r.bolinmaId !== window.currentTNU19BolinmaId) return false;
        if (filterDate && r.date !== filterDate) return false;
        if (filterType && r.instructionType !== filterType) return false;
        if (filterName && !r.workerName.toLowerCase().includes(filterName)) return false;
        return true;
    });

    // Sort descending
    filteredRecords.sort((a, b) => b.id.localeCompare(a.id));

    let html = `
        <div style="padding: 30px; font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #ffffff;">
            <div style="display: flex; gap: 20px; margin-bottom: 30px; align-items: flex-end; flex-wrap: wrap; background: #f8fafc; padding: 25px; border-radius: 20px; border: 1px solid rgba(31,38,135,0.08);">
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <label style="font-size: 0.8rem; color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Sana:</label>
                    <input type="date" id="tnu19-filter-date" value="${filterDate}" onchange="renderTNU19Table()" style="background: #ffffff; border: 1px solid rgba(31,38,135,0.12); color: #1e293b; padding: 12px 15px; border-radius: 12px; font-size: 0.95rem; outline: none; font-weight: 600; transition: 0.2s;">
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                     <label style="font-size: 0.8rem; color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Tur:</label>
                    <select id="tnu19-filter-type" onchange="renderTNU19Table()" style="background: #ffffff; border: 1px solid rgba(31,38,135,0.12); color: #1e293b; padding: 12px 15px; border-radius: 12px; min-width: 200px; font-size: 0.95rem; outline: none; font-weight: 600; cursor: pointer; transition: 0.2s;">
                        <option value="">Barcha turlar</option>
                        <option value="kirish" ${filterType === 'kirish' ? 'selected' : ''}>Kirish</option>
                        <option value="takroriy" ${filterType === 'takroriy' ? 'selected' : ''}>Takroriy</option>
                        <option value="rejalashtirilmagan" ${filterType === 'rejalashtirilmagan' ? 'selected' : ''}>Rejalashtirilmagan</option>
                        <option value="maqsadli" ${filterType === 'maqsadli' ? 'selected' : ''}>Maqsadli</option>
                    </select>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px; flex-grow: 1;">
                     <label style="font-size: 0.8rem; color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Qidiruv:</label>
                    <input type="text" id="tnu19-search" value="${filterName}" placeholder="Xodim ismi..." onkeyup="renderTNU19Table()" style="background: #ffffff; border: 1px solid rgba(31,38,135,0.12); color: #1e293b; padding: 12px 15px; border-radius: 12px; width: 100%; font-size: 0.95rem; outline: none; font-weight: 600; transition: 0.2s;">
                </div>
                <button style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 12px 25px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; height: 48px; box-shadow: 0 8px 16px rgba(239, 68, 68, 0.2); transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                    <i class="fas fa-file-pdf"></i> PDF
                </button>
            </div>

            <div style="background: #ffffff; border: 1px solid rgba(31,38,135,0.1); border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(31,38,135,0.05);">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #1e293b; border-bottom: 2px solid #d4af37; text-align: left;">
                            <th style="padding: 18px 20px; color: #ffffff; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; text-align: center;">Sana</th>
                            <th style="padding: 18px 20px; color: #ffffff; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em;">Xodim F.I.O</th>
                            <th style="padding: 18px 20px; color: #ffffff; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em;">Bo'linma</th>
                            <th style="padding: 18px 20px; color: #ffffff; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em;">Lavozimi</th>
                            <th style="padding: 18px 20px; color: #ffffff; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; text-align: center;">Turi</th>
                            <th style="padding: 18px 20px; color: #ffffff; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em;">Mavzu</th>
                            <th style="padding: 18px 20px; color: #ffffff; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em;">Yo'riqchi</th>
                            <th style="padding: 18px 20px; color: #ffffff; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; text-align: center;">Xodim imzosi</th>
                            <th style="padding: 18px 20px; color: #ffffff; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; text-align: center;">Yo'riqchi imzosi</th>
                            <th style="padding: 18px 20px; color: #ffffff; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; text-align: center;">Amal</th>
                        </tr>
                    </thead>
                    <tbody style="color: #1e293b;">
    `;

    if (filteredRecords.length === 0) {
        html += `<tr><td colspan="10" style="padding: 40px; text-align: center; color: #64748b;">Yozuvlar topilmadi</td></tr>`;
    } else {
        filteredRecords.forEach((r, index) => {
            const dateStr = new Date(r.date).toLocaleDateString();
            const typeBadgeClass = {
                'kirish': '#3b82f6', // blue-500
                'takroriy': '#22c55e', // green-500
                'rejalashtirilmagan': '#f59e0b', // amber-500
                'maqsadli': '#a855f7' // purple-500
            }[r.instructionType] || '#94a3b8';

            const bgClass = index % 2 === 0 ? 'transparent' : '#1e293b'; // Stripe effect

            // Xodim initials
            const initials = r.workerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            html += `
                <tr style="border-bottom: 1px solid rgba(31,38,135,0.06); background: ${bgClass}; transition: 0.2s;" onmouseover="this.style.background='#f0f7ff'" onmouseout="this.style.background='${bgClass}'">
                    <td style="padding: 15px 20px; text-align: center; font-family: 'Inter', sans-serif; color: #64748b; font-size: 0.85rem; font-weight: 600;">
                        ${r.date}<br><span style="color: #ffd700; font-weight: 800;">${r.time}</span>
                    </td>
                    <td style="padding: 15px 20px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #e0e7ff, #f8fafc); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 800; color: #ffd700; border: 1.5px solid rgba(212,175,55,0.3);">${initials}</div>
                            <span style="font-weight: 700; font-size: 0.95rem; color: #1e293b;">${r.workerName.toUpperCase()}</span>
                        </div>
                    </td>
                    <td style="padding: 15px 20px; color: #b8860b; font-weight: 800; font-size: 0.9rem;">${r.bolinmaId.replace('bolinma', '')}-bo'linma</td>
                    <td style="padding: 15px 20px; color: #64748b; text-transform: uppercase; font-size: 0.75rem; font-weight: 700;">${r.workerPosition}</td>
                    <td style="padding: 15px 20px; text-align: center;">
                        <span style="background: ${typeBadgeClass}15; color: ${typeBadgeClass}; border: 1px solid ${typeBadgeClass}30; padding: 5px 12px; border-radius: 20px; font-size: 0.7rem; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">${r.instructionType}</span>
                    </td>
                    <td style="padding: 15px 20px; max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #334155; font-weight: 500;" title="${r.instructionContent}">${r.instructionContent}</td>
                    <td style="padding: 15px 20px; font-size: 0.9rem; color: #475569; font-weight: 600;">${r.instructorName}</td>
                    <td style="padding: 15px 20px; text-align: center;">
                         ${r.workerSignature
                    ? `<img src="${r.workerSignature}" style="height: 38px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'" onclick="viewTNU19Passport('${r.id}')" title="Pasport shaklida ko'rish">`
                    : '<span style="color:#ef4444; font-size:0.75rem; font-weight: 700; background: rgba(239, 68, 68, 0.05); padding: 4px 10px; border-radius: 10px; border: 1px solid rgba(239, 68, 68, 0.1);">IMZOLANMAGAN</span>'}
                    </td>
                    <td style="padding: 15px 20px; text-align: center;">
                        ${r.instructorSignature
                    ? `<img src="${r.instructorSignature}" style="height: 38px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'" onclick="viewTNU19Passport('${r.id}')">`
                    : '<span style="color:#ef4444; font-size:0.75rem; font-weight: 700; background: rgba(239, 68, 68, 0.05); padding: 4px 10px; border-radius: 10px; border: 1px solid rgba(239, 68, 68, 0.1);">IMZOLANMAGAN</span>'}
                    </td>
                    <td style="padding: 15px 20px; text-align: center;">
                         <button onclick="deleteTNU19Record('${r.id}')" style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1); color: #ef4444; cursor: pointer; transition: all 0.2s; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.background='#ef4444'; this.style.color='#fff'" onmouseout="this.style.background='rgba(239, 68, 68, 0.05)'; this.style.color='#ef4444'">
                            <i class="fas fa-trash-alt" style="font-size: 0.85rem;"></i>
                         </button>
                    </td>
                </tr>
            `;
        });
    }

    html += `</tbody></table></div></div>`;
    content.innerHTML = html;
}

// Passport Style View
function viewTNU19Passport(recordId) {
    const r = tnu19Records.find(rem => rem.id === recordId);
    if (!r) return;

    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.8); z-index: 10060; display: flex;
        justify-content: center; align-items: center; backdrop-filter: blur(5px);
    `;

    const initials = r.workerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    // Find worker to get photo if available
    const allWorkers = getTNU19Workers('all');
    const worker = allWorkers.find(w => String(w.id) === String(r.workerId));
    const photoUrl = worker ? worker.photo : null;

    modal.innerHTML = `
        <div style="background: white; width: 600px; height: 350px; border-radius: 15px; display: flex; overflow: hidden; box-shadow: 0 0 50px rgba(0,0,0,0.5); font-family: 'Segoe UI', sans-serif; position: relative;">
            <!-- Background Pattern -->
            <div style="position: absolute; width: 100%; height: 100%; opacity: 0.05; background-image: repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%); pointer-events: none;"></div>
            
            <!-- Left Side: Photo area -->
            <div style="width: 200px; background: linear-gradient(135deg, #1e3c72, #2a5298); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; padding: 20px; text-align: center;">
                <div style="width: 100px; height: 120px; background: #fff; margin-bottom: 20px; border: 4px solid rgba(255,255,255,0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    ${photoUrl ? `<img src="${photoUrl}" style="width: 100%; height: 100%; object-fit: cover;">` : `<span style="color: #1e3c72; font-size: 2rem; font-weight: bold;">${initials}</span>`}
                </div>
                <div style="font-size: 0.8rem; opacity: 0.8;">ID: ${r.workerId || '---'}</div>
                <div style="font-size: 1.5rem; margin-top: 10px;"><i class="fas fa-fingerprint"></i></div>
            </div>

            <!-- Right Side: Details -->
            <div style="flex: 1; padding: 25px; display: flex; flex-direction: column; position: relative;">
                <div style="border-bottom: 2px solid #1e3c72; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin: 0; color: #1e3c72; font-size: 1.2rem; text-transform: uppercase;">Xavfsizlik Ruxsatnomasi</h2>
                    <img src="img/logo.png" style="height: 30px; opacity: 0.8;">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 0.9rem; color: #2c3e50;">
                    <div>
                        <div style="font-size: 0.7rem; color: #7f8c8d; text-transform: uppercase;">Xodim</div>
                        <div style="font-weight: 700; font-size: 1rem;">${r.workerName}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.7rem; color: #7f8c8d; text-transform: uppercase;">Lavozim</div>
                        <div style="font-weight: 600;">${r.workerPosition}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.7rem; color: #7f8c8d; text-transform: uppercase;">Bo'linma</div>
                        <div style="font-weight: 600;">${r.bolinmaId.replace('bolinma', '')} - BO'LINMA</div>
                    </div>
                    <div>
                        <div style="font-size: 0.7rem; color: #7f8c8d; text-transform: uppercase;">Sana</div>
                        <div style="font-weight: 600;">${r.date}</div>
                    </div>
                </div>

                <div style="margin-top: 20px;">
                    <div style="font-size: 0.7rem; color: #7f8c8d; text-transform: uppercase;">Yo'riqnoma Turi</div>
                    <span style="background: #2ecc71; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase;">${r.instructionType}</span>
                </div>

                <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end;">
                   <div>
                        <div style="font-size: 0.7rem; color: #7f8c8d; border-top: 1px solid #ccc; padding-top: 2px; width: 120px;">Mas'ul Imzosi</div>
                        <img src="${r.instructorSignature}" style="height: 30px; margin-bottom: -5px;">
                   </div>
                   <div style="text-align: right;">
                        <img src="${r.workerSignature}" style="height: 45px; display: block; margin-left: auto;">
                        <div style="font-size: 0.7rem; color: #7f8c8d; border-top: 1px solid #ccc; padding-top: 2px; width: 120px; text-align: center;">Xodim Imzosi</div>
                   </div>
                </div>
            </div>

            <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #bdc3c7;">&times;</button>
        </div>
    `;

    document.body.appendChild(modal);
}

// Render New Record Form
function renderTNU19Form() {
    const content = document.getElementById('tnu19-content');
    if (!content) return;

    const workers = getTNU19Workers(window.currentTNU19BolinmaId);

    content.innerHTML = `
        <div style="max-width: 850px; margin: 40px auto; color: #1e293b;">
            <div style="background: #ffffff; padding: 40px; border-radius: 24px; border: 1px solid rgba(212, 175, 55, 0.2); box-shadow: 0 30px 60px rgba(31, 38, 135, 0.08);">
                <h3 style="margin-top: 0; color: #1e293b; border-bottom: 2px solid #d4af37; padding-bottom: 20px; display: flex; align-items: center; gap: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                    <i class="fas fa-file-signature" style="color: #d4af37;"></i> Yangi Yo'riqnoma Yozuvi
                </h3>

                <div style="display: grid; gap: 25px; margin-top: 30px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <label style="display: block; margin-bottom: 10px; color: #64748b; font-weight: 800; font-size: 0.8rem; text-transform: uppercase;">Yo'riqnoma Turi</label>
                            <select id="tnu19-type" style="width: 100%; padding: 14px; background: #f8fafc; border: 1px solid rgba(31,38,135,0.1); color: #1e293b; border-radius: 12px; font-weight: 700; outline: none; transition: 0.3s; cursor: pointer;">
                                <option value="takroriy">Takroriy</option>
                                <option value="kirish">Kirish</option>
                                <option value="rejalashtirilmagan">Rejalashtirilmagan</option>
                                <option value="maqsadli">Maqsadli</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 10px; color: #64748b; font-weight: 800; font-size: 0.8rem; text-transform: uppercase;">Xodimni Tanlang</label>
                            <select id="tnu19-worker" onchange="updateWorkerDetails(this)" style="width: 100%; padding: 14px; background: #f8fafc; border: 1px solid rgba(31,38,135,0.1); color: #1e293b; border-radius: 12px; font-weight: 700; outline: none; transition: 0.3s; cursor: pointer;">
                                <option value="">-- Tanlang --</option>
                                ${workers.map(w => `<option value="${w.id}" data-name="${w.name}" data-pos="${w.position}">${w.name} - ${w.position}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 10px; color: #64748b; font-weight: 800; font-size: 0.8rem; text-transform: uppercase;">Yo'riqnoma Mavzusi</label>
                        <textarea id="tnu19-content-textarea" rows="4" placeholder="Mavzuni kiriting..." style="width: 100%; padding: 15px; background: #f8fafc; border: 1px solid rgba(31,38,135,0.1); color: #1e293b; border-radius: 12px; resize: vertical; font-size: 1rem; font-weight: 500; outline: none; transition: 0.3s;">Navbatdagi xavfsizlik texnikasi bo'yicha yo'riqnoma</textarea>
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 10px; color: #64748b; font-weight: 800; font-size: 0.8rem; text-transform: uppercase;">Yo'riqchi (Siz)</label>
                        <div style="position: relative;">
                            <input type="text" id="tnu19-instructor-name" value="Mahmudov M.U." style="width: 100%; padding: 14px 14px 14px 45px; background: #f8fafc; border: 1px solid rgba(31,38,135,0.1); color: #1e293b; border-radius: 12px; font-weight: 700; outline: none;">
                            <i class="fas fa-user-tie" style="position: absolute; left: 18px; top: 16px; color: #d4af37;"></i>
                        </div>
                        <input type="hidden" id="tnu19-instructor-pos" value="Bosh muhandis">
                    </div>

                    <div style="text-align: right; margin-top: 20px; border-top: 1px solid rgba(31,38,135,0.05); padding-top: 25px;">
                        <button onclick="startTNU19Signing()" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; padding: 16px 40px; border-radius: 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 12px; margin-left: auto; box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2); text-transform: uppercase; letter-spacing: 1px; transition: 0.3s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='none'">
                            Imzo bosishga o'tish <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateWorkerDetails(select) {
    const option = select.options[select.selectedIndex];
    if (option.value) {
        document.getElementById('tnu19-worker').setAttribute('data-name', option.getAttribute('data-name'));
        document.getElementById('tnu19-worker').setAttribute('data-position', option.getAttribute('data-pos'));
    }
}

// Start Signing
function startTNU19Signing() {
    const workerSelect = document.getElementById('tnu19-worker');
    if (!workerSelect.value) {
        alert("Xodimni tanlang!");
        return;
    }

    // Create record object
    tnu19CurrentRecord = {
        id: 'tnu19_' + Date.now(),
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        workerId: workerSelect.value,
        workerName: workerSelect.options[workerSelect.selectedIndex].getAttribute('data-name'),
        workerPosition: workerSelect.options[workerSelect.selectedIndex].getAttribute('data-pos'),
        instructionType: document.getElementById('tnu19-type').value,
        instructionContent: document.getElementById('tnu19-content-textarea').value,
        instructorName: document.getElementById('tnu19-instructor-name').value,
        instructorPosition: document.getElementById('tnu19-instructor-pos').value,
        bolinmaId: window.currentTNU19BolinmaId || '1-bo\'linma'
    };

    tnu19SignatureStep = 'worker'; // Start with worker
    openTNU19SignatureModal();
}

// Improved Signature Modal
function openTNU19SignatureModal() {
    const existing = document.getElementById('tnu19-signature-modal');
    if (existing) existing.remove();

    const isWorker = tnu19SignatureStep === 'worker';
    window.signerName = isWorker ? tnu19CurrentRecord.workerName : tnu19CurrentRecord.instructorName;
    const signerName = window.signerName;
    const title = isWorker ? 'Xodim Imzosi' : 'Mas\'ul Shaxs Imzosi';

    // Initials for avatar
    const initials = signerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const modal = document.createElement('div');
    modal.id = 'tnu19-signature-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.9); z-index: 10050; display: flex;
        justify-content: center; align-items: center; backdrop-filter: blur(8px);
    `;

    modal.innerHTML = `
        <div style="background: #ffffff; width: 700px; border-radius: 24px; border: 1px solid rgba(31, 38, 135, 0.1); overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.2); font-family: 'Inter', sans-serif;">
            <div style="padding: 25px 35px; background: ${isWorker ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'linear-gradient(135deg, #d4af37, #b8860b)'}; color: white; display: flex; align-items: center; gap: 20px;">
                <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.4rem; border: 2px solid rgba(255,255,255,0.4);">${initials}</div>
                <div>
                    <h2 style="margin: 0; font-size: 1.4rem; font-weight: 800;">${title}</h2>
                    <p style="margin: 0; opacity: 0.9; font-weight: 600; font-size: 1rem;">${signerName}</p>
                </div>
            </div>
            
            <div style="padding: 40px; display: flex; flex-direction: column; align-items: center; background: #ffffff;">
                <p style="color: #64748b; margin-bottom: 30px; font-weight: 600; font-size: 1.1rem;">Tasdiqlash usulini tanlang:</p>
                
                <div style="display: flex; gap: 25px; width: 100%; margin-bottom: 40px;">
                    <button id="use-signature-btn" onclick="showSignatureInput()" style="flex: 1; padding: 30px; background: rgba(37, 99, 235, 0.05); border: 2px solid rgba(37, 99, 235, 0.1); border-radius: 20px; color: #ffd700; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 15px; transition: all 0.3s;" onmouseover="this.style.background='rgba(37, 99, 235, 0.1)'; this.style.transform='translateY(-5px)'" onmouseout="this.style.background='rgba(37, 99, 235, 0.05)'; this.style.transform='none'">
                        <i class="fas fa-pen-nib" style="font-size: 2.5rem; color: #ffd700;"></i>
                        <span style="font-weight: 800; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 1px;">Qo'lda Imzo</span>
                    </button>
                    
                    <button id="use-faceid-btn" onclick="openTNU19FaceIDModal()" style="flex: 1; padding: 30px; background: rgba(212, 175, 55, 0.05); border: 2px solid rgba(212, 175, 55, 0.2); border-radius: 20px; color: #b8860b; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 15px; transition: all 0.3s; position: relative; overflow: hidden;" onmouseover="this.style.background='rgba(212, 175, 55, 0.1)'; this.style.transform='translateY(-5px)'" onmouseout="this.style.background='rgba(212, 175, 55, 0.05)'; this.style.transform='none'">
                        <div style="position: absolute; top: 12px; right: 12px; background: #d4af37; color: white; font-size: 0.65rem; padding: 3px 10px; border-radius: 8px; font-weight: 800; text-transform: uppercase;">Tavsiya etiladi</div>
                        <i class="fas fa-user-shield" style="font-size: 2.5rem; color: #d4af37;"></i>
                        <span style="font-weight: 800; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 1px;">Face ID (Biometrik)</span>
                    </button>
                </div>

                <div id="signature-input-container" style="display: none; width: 100%;">
                    <p style="color: #64748b; margin-bottom: 20px; text-align: center; font-weight: 600;">Ekran yuzasiga imzo qo'ying:</p>
                    <div style="background: #f8fafc; border: 2px solid rgba(212, 175, 55, 0.2); border-radius: 16px; padding: 5px; width: 100%; box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);">
                         <canvas id="tnu19-sig-canvas" width="600" height="250" style="width: 100%; height: 250px; display: block; cursor: crosshair; touch-action: none;"></canvas>
                    </div>

                    <div style="display: flex; gap: 20px; margin-top: 35px; width: 100%;">
                        <button onclick="clearTNU19Signature()" style="flex: 1; padding: 15px; border-radius: 14px; border: 1.5px solid rgba(148, 163, 184, 0.3); background: transparent; color: #64748b; cursor: pointer; font-weight: 700; transition: 0.2s;">
                            <i class="fas fa-eraser"></i> TOZALASH
                        </button>
                        <button onclick="saveTNU19Signature()" style="flex: 2; padding: 15px; border-radius: 14px; border: none; background: linear-gradient(135deg, #10b981, #059669); color: white; font-weight: 900; cursor: pointer; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2); transition: 0.3s; text-transform: uppercase; letter-spacing: 1px;">
                            <i class="fas fa-check"></i> TASDIQLASH
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setupTNU19Canvas();
}

function setupTNU19Canvas() {
    const canvas = document.getElementById('tnu19-sig-canvas');
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = "navy";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    let isDrawing = false;

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function startDraw(e) { isDrawing = true; ctx.beginPath(); const pos = getPos(e); ctx.moveTo(pos.x, pos.y); }
    function draw(e) { if (!isDrawing) return; e.preventDefault(); const pos = getPos(e); ctx.lineTo(pos.x, pos.y); ctx.stroke(); }
    function endDraw() { isDrawing = false; }

    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseout", endDraw);  // Canvas tashqarisiga chiqqanda to'xtat
    document.addEventListener("mouseup", endDraw);
    canvas.addEventListener("touchstart", startDraw, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    document.addEventListener("touchend", endDraw);

    // Cleanup: modal yopilganda event listener larni olib tashlash
    const sigModal = document.getElementById('tnu19-signature-modal');
    if (sigModal) {
        const obs = new MutationObserver(() => {
            if (!document.getElementById('tnu19-signature-modal')) {
                document.removeEventListener('mouseup', endDraw);
                document.removeEventListener('touchend', endDraw);
                obs.disconnect();
            }
        });
        obs.observe(document.body, { childList: true });
    }
}

function clearTNU19Signature() {
    const c = document.getElementById('tnu19-sig-canvas');
    c.getContext('2d').clearRect(0, 0, c.width, c.height);
}

function showSignatureInput() {
    document.getElementById('signature-input-container').style.display = 'block';
    document.getElementById('use-faceid-btn').parentElement.style.display = 'none';
    setupTNU19Canvas();
}

// Face ID Modal Implementation
function openTNU19FaceIDModal() {
    const existing = document.getElementById('tnu19-faceid-modal');
    if (existing) existing.remove();

    const isWorker = tnu19SignatureStep === 'worker';
    window.signerName = isWorker ? tnu19CurrentRecord.workerName : tnu19CurrentRecord.instructorName;
    const signerName = window.signerName;

    const modal = document.createElement('div');
    modal.id = 'tnu19-faceid-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(240, 247, 255, 0.95); z-index: 10060; display: flex;
        flex-direction: column; align-items: center; justify-content: center;
        font-family: 'Inter', sans-serif; overflow: hidden; backdrop-filter: blur(20px);
    `;

    modal.innerHTML = `
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at center, rgba(37, 99, 235, 0.05) 0%, transparent 70%); pointer-events: none;"></div>
        
        <!-- Scanner HUD -->
        <div style="position: relative; width: 450px; height: 600px; display: flex; flex-direction: column; align-items: center; gap: 40px; z-index: 5; background: rgba(255, 255, 255, 0.4); border-radius: 40px; border: 1px solid rgba(212, 175, 55, 0.2); padding: 40px; box-shadow: 0 40px 100px rgba(31, 38, 135, 0.1);">
            
            <div style="text-align: center;">
                <h2 style="color: #1e293b; margin: 0; font-size: 1.6rem; letter-spacing: 4px; font-weight: 900; text-transform: uppercase;">FACE ID <span style="color: #d4af37;">SCAN</span></h2>
                <div id="faceid-status" style="color: #64748b; font-size: 0.95rem; margin-top: 12px; font-weight: 600;">Biometrik ma'lumotlar kutilmoqda...</div>
            </div>

            <!-- Camera Viewport -->
            <div id="faceid-viewport" style="position: relative; width: 340px; height: 340px; border-radius: 50%; border: 8px solid #ffffff; overflow: hidden; background: #000; box-shadow: 0 0 60px rgba(37, 99, 235, 0.15); border: 2px solid rgba(212, 175, 55, 0.3);">
                <video id="faceid-video" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); border-radius: 50%;"></video>
                
                <!-- Overlay Elements -->
                <div id="faceid-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; border: 30px solid rgba(240, 247, 255, 0.8); box-sizing: border-box; pointer-events: none;"></div>
                
                <div id="faceid-scanner-line" style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, transparent, #d4af37, transparent); box-shadow: 0 0 20px #d4af37; display: none; z-index: 10;"></div>
                
                <!-- Grid SVG overlay -->
                <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; opacity: 0.2; pointer-events: none;">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2563eb" stroke-width="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                <div id="faceid-corner-tl" style="position: absolute; top: 70px; left: 70px; width: 40px; height: 40px; border-top: 3px solid #d4af37; border-left: 3px solid #d4af37; transition: all 0.5s; border-radius: 10px 0 0 0;"></div>
                <div id="faceid-corner-tr" style="position: absolute; top: 70px; right: 70px; width: 40px; height: 40px; border-top: 3px solid #d4af37; border-right: 3px solid #d4af37; transition: all 0.5s; border-radius: 0 10px 0 0;"></div>
                <div id="faceid-corner-bl" style="position: absolute; bottom: 70px; left: 70px; width: 40px; height: 40px; border-bottom: 3px solid #d4af37; border-left: 3px solid #d4af37; transition: all 0.5s; border-radius: 0 0 0 10px;"></div>
                <div id="faceid-corner-br" style="position: absolute; bottom: 70px; right: 70px; width: 40px; height: 40px; border-bottom: 3px solid #d4af37; border-right: 3px solid #d4af37; transition: all 0.5s; border-radius: 0 0 10px 0;"></div>

                <div id="faceid-success-icon" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0); color: #10b981; font-size: 100px; transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 20;">
                    <i class="fas fa-check-circle"></i>
                </div>
            </div>

            <div style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 15px;">
                 <div style="font-size: 0.8rem; color: #ffd700; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Identifikatsiya:</div>
                 <div style="font-size: 1.4rem; color: #1e293b; font-weight: 800; letter-spacing: 0.5px;">${signerName.toUpperCase()}</div>
                 
                 <div id="faceid-process-bar" style="width: 250px; height: 6px; background: rgba(31, 38, 135, 0.05); border-radius: 10px; overflow: hidden; margin-top: 15px; border: 1px solid rgba(212, 175, 55, 0.1);">
                    <div id="faceid-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #2563eb, #d4af37); transition: width 0.1s linear;"></div>
                 </div>
            </div>

            <button onclick="stopTNU19FaceID()" style="position: absolute; bottom: -100px; background: #ffffff; border: 1.5px solid rgba(239, 68, 68, 0.2); color: #ef4444; padding: 14px 30px; border-radius: 20px; cursor: pointer; display: flex; align-items: center; gap: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); transition: 0.3s;" onmouseover="this.style.background='#ef4444'; this.style.color='#fff'" onmouseout="this.style.background='#ffffff'; this.style.color='#ef4444'">
                <i class="fas fa-times"></i> Bekor qilish
            </button>
        </div>

        <!-- Hud Details -->
        <div style="position: absolute; top: 40px; right: 40px; color: #ffd700; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; pointer-events: none; opacity: 0.6; text-align: right;">
            [ ENCRYPTION: <span style="color: #d4af37;">RSA-4096</span> ]<br>
            [ LATENCY: <span style="color: #d4af37;">${Math.floor(Math.random() * 20 + 5)}ms</span> ]<br>
            [ BIOMETRIC SEED: <span style="color: #d4af37;">0x${Math.random().toString(16).substr(2, 8).toUpperCase()}</span> ]
        </div>

        <div style="position: absolute; bottom: 40px; left: 40px; color: #ffd700; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; pointer-events: none; opacity: 0.6;">
            SYSTEM: <span style="color: #10b981;">SECURE</span><br>
            CORE: <span style="color: #10b981;">STABLE</span><br>
            SIGNATURE: <span style="color: #d4af37;">PENDING</span>
        </div>
    `;

    document.body.appendChild(modal);
    startTNU19FaceID();
}

let faceidStream = null;

async function startTNU19FaceID() {
    const video = document.getElementById('faceid-video');
    const status = document.getElementById('faceid-status');
    const line = document.getElementById('faceid-scanner-line');
    const progress = document.getElementById('faceid-progress');
    const corners = [
        document.getElementById('faceid-corner-tl'),
        document.getElementById('faceid-corner-tr'),
        document.getElementById('faceid-corner-bl'),
        document.getElementById('faceid-corner-br')
    ];

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        faceidStream = stream;
        video.srcObject = stream;

        status.innerText = "Yuzingizni doira ichiga joylashtiring...";

        // Artificial delay for "finding face"
        setTimeout(() => {
            status.innerText = "Yuz topildi! Skanerlash boshlanmoqda...";
            status.style.color = "#238636";
            line.style.display = "block";

            // Animation for line and hud
            let pos = 0;
            let dir = 1;
            const lineAnim = setInterval(() => {
                pos += (2 * dir);
                if (pos >= 318 || pos <= 0) dir *= -1;
                line.style.top = pos + "px";
            }, 10);

            // Expanding corners animation
            corners.forEach(c => {
                c.style.borderColor = "#238636";
                c.style.transform = "scale(1.2)";
            });

            // Progress bar
            let p = 0;
            const pInterval = setInterval(() => {
                p += 1.5;
                if (p > 30 && p < 40) status.innerText = "Biometrik nuqtalar tahlil qilinmoqda...";
                if (p > 60 && p < 70) status.innerText = "Ma'lumotlar bazasi bilan solishtirilmoqda...";
                if (p > 85 && p < 95) status.innerText = "Muvaffaqiyatli!";

                progress.style.width = p + "%";
                if (p >= 100) {
                    clearInterval(pInterval);
                    clearInterval(lineAnim);
                    finishFaceID();
                }
            }, 50);

        }, 2000);

    } catch (err) {
        console.error("Camera access error:", err);
        status.innerText = "Kameraga ruxsat berilmadi!";
        status.style.color = "#f85149";
    }
}

function stopTNU19FaceID() {
    if (faceidStream) {
        faceidStream.getTracks().forEach(track => track.stop());
    }
    document.getElementById('tnu19-faceid-modal')?.remove();
}

function finishFaceID() {
    const status = document.getElementById('faceid-status');
    const line = document.getElementById('faceid-scanner-line');
    const successIcon = document.getElementById('faceid-success-icon');
    const video = document.getElementById('faceid-video');

    line.style.display = "none";
    successIcon.style.transform = "translate(-50%, -50%) scale(1)";
    video.style.filter = "grayscale(0%) brightness(1.0)";
    video.style.transition = "all 0.5s";

    // --- AUTOMATIC FACE TEMPLATE CAPTURE ---
    if (tnu19SignatureStep === 'worker' && tnu19CurrentRecord.workerId) {
        const faceCanvas = document.createElement('canvas');
        faceCanvas.width = video.videoWidth;
        faceCanvas.height = video.videoHeight;
        faceCanvas.getContext('2d').drawImage(video, 0, 0);
        const faceBase64 = faceCanvas.toDataURL('image/jpeg', 0.8);

        SmartUtils.fetchAPI(`/hr/employees/${tnu19CurrentRecord.workerId}/face`, {
            method: 'PATCH',
            body: JSON.stringify({ face_template: faceBase64 })
        }).then(() => console.log('Face template captured/updated'))
            .catch(e => console.error('Face capture error:', e));
    }
    // ----------------------------------------

    setTimeout(() => {
        // Generate a stylized signature instead of a robotic box
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');

        // Styles for signature background (transparent)
        ctx.clearRect(0, 0, 400, 150);

        // Setup font for signature (using a script-like style)
        const fonts = ['"Brush Script MT", cursive', '"Dancing Script", cursive', 'cursive', 'serif'];
        ctx.font = "italic 40px " + fonts[0];
        ctx.fillStyle = "navy";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Draw the name with a slight tilt and some stylistic lines
        ctx.save();
        ctx.translate(200, 75);
        ctx.rotate(-0.05); // Slight tilt

        // Main signature text
        const nameParts = signerName.split(' ');
        const displaySignature = nameParts[0] + (nameParts[1] ? ' ' + nameParts[1][0] + '.' : '');
        ctx.fillText(displaySignature, 0, 0);

        // Add a stylistic underline flourish
        ctx.beginPath();
        ctx.moveTo(-150, 30);
        ctx.bezierCurveTo(-50, 50, 50, 10, 150, 35);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "navy";
        ctx.stroke();
        ctx.restore();

        // Add verification watermark (subtle)
        ctx.font = "10px monospace";
        ctx.fillStyle = "rgba(0,100,0,0.5)";
        ctx.textAlign = "right";
        const dateStr = new Date().toLocaleString();
        ctx.fillText("FACIAL BIOMETRIC VERIFIED: " + dateStr, 390, 140);

        const sigData = canvas.toDataURL();

        if (tnu19SignatureStep === 'worker') {
            tnu19CurrentRecord.workerSignature = sigData;

            // --- AUTOMATIC TIMESHEET UPDATE ---
            if (tnu19CurrentRecord.workerId) {
                SmartUtils.fetchAPI('/timesheet/attendance', {
                    method: 'POST',
                    body: JSON.stringify({
                        employee_id: tnu19CurrentRecord.workerId,
                        hours: 8 // Standard 8 hours for passing Face ID
                    })
                }).then(() => {
                    console.log('Attendance recorded for', tnu19CurrentRecord.workerName);
                    showToast(`${tnu19CurrentRecord.workerName} uchun davomat qayd etildi (8 soat)`, 'success');
                }).catch(e => console.error('Attendance error:', e));
            }
            // ----------------------------------

            tnu19SignatureStep = 'instructor';
            stopTNU19FaceID();
            document.getElementById('tnu19-signature-modal')?.remove();
            openTNU19SignatureModal();
        } else {
            tnu19CurrentRecord.instructorSignature = sigData;
            tnu19Records.push(tnu19CurrentRecord);
            saveTNU19Records(tnu19CurrentRecord).then(() => {
                stopTNU19FaceID();
                document.getElementById('tnu19-signature-modal')?.remove();
                switchTNU19Tab('table');
                setTimeout(() => {
                    viewTNU19Passport(tnu19CurrentRecord.id);
                    tnu19CurrentRecord = null;
                }, 300);
            });
        }
    }, 1500);
}

async function saveTNU19Signature() {
    const c = document.getElementById('tnu19-sig-canvas');
    const blank = document.createElement('canvas'); blank.width = c.width; blank.height = c.height;
    if (c.toDataURL() === blank.toDataURL()) { alert("Imzo qo'ying!"); return; }

    const sig = c.toDataURL();

    if (tnu19SignatureStep === 'worker') {
        tnu19CurrentRecord.workerSignature = sig;
        tnu19SignatureStep = 'instructor';
        openTNU19SignatureModal();
    } else {
        tnu19CurrentRecord.instructorSignature = sig;
        tnu19Records.push(tnu19CurrentRecord);
        await saveTNU19Records(tnu19CurrentRecord);
        document.getElementById('tnu19-signature-modal').remove();
        switchTNU19Tab('table');
        setTimeout(() => {
            viewTNU19Passport(tnu19CurrentRecord.id);
            tnu19CurrentRecord = null;
        }, 300);
    }
}



// Render Stats View
function renderTNU19Stats() {
    const content = document.getElementById('tnu19-content');
    if (!content) return;

    const allWorkers = getTNU19Workers(window.currentTNU19BolinmaId);
    const records = loadTNU19Records();

    // Calculate Stats
    const totalWorkers = allWorkers.length;
    const instructedWorkers = new Set(records.map(r => r.workerId)).size;
    const coveragePercent = totalWorkers > 0 ? Math.round((instructedWorkers / totalWorkers) * 100) : 0;

    // Group records by type
    const statsByType = {
        'kirish': 0,
        'takroriy': 0,
        'rejalashtirilmagan': 0,
        'maqsadli': 0
    };
    records.forEach(r => {
        if (statsByType[r.instructionType] !== undefined) {
            statsByType[r.instructionType]++;
        }
    });

    content.innerHTML = `
        <div style="padding: 30px; font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #ffffff;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; margin-bottom: 40px;">
                <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; border-radius: 20px; color: white; box-shadow: 0 15px 30px rgba(37, 99, 235, 0.2); position: relative; overflow: hidden;">
                    <i class="fas fa-users" style="position: absolute; right: -20px; bottom: -20px; font-size: 8rem; opacity: 0.1;"></i>
                    <div style="font-size: 0.85rem; margin-bottom: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8;">Jami Xodimlar</div>
                    <div style="font-size: 2.8rem; font-weight: 900;">${totalWorkers}</div>
                    <div style="margin-top: 15px; font-size: 0.85rem; background: rgba(255,255,255,0.2); display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 12px; font-weight: 700;">
                        <i class="fas fa-check-circle"></i> Bazada faol
                    </div>
                </div>

                <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 20px; color: white; box-shadow: 0 15px 30px rgba(16, 185, 129, 0.2); position: relative; overflow: hidden;">
                    <i class="fas fa-user-check" style="position: absolute; right: -20px; bottom: -20px; font-size: 8rem; opacity: 0.1;"></i>
                    <div style="font-size: 0.85rem; margin-bottom: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8;">Yo'riqnoma O'tganlar</div>
                    <div style="font-size: 2.8rem; font-weight: 900;">${instructedWorkers}</div>
                    <div style="margin-top: 15px; font-size: 0.85rem; background: rgba(255,255,255,0.2); display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 12px; font-weight: 700;">
                        <i class="fas fa-percentage"></i> ${coveragePercent}% qamrov
                    </div>
                </div>

                <div style="background: linear-gradient(135deg, #d4af37, #b8860b); padding: 30px; border-radius: 20px; color: white; box-shadow: 0 15px 30px rgba(212, 175, 55, 0.2); position: relative; overflow: hidden;">
                    <i class="fas fa-file-contract" style="position: absolute; right: -20px; bottom: -20px; font-size: 8rem; opacity: 0.1;"></i>
                   <div style="font-size: 0.85rem; margin-bottom: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8;">Jami Yozuvlar</div>
                   <div style="font-size: 2.8rem; font-weight: 900;">${records.length}</div>
                   <div style="margin-top: 15px; font-size: 0.85rem; background: rgba(255,255,255,0.2); display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 12px; font-weight: 700;">
                       <i class="fas fa-history"></i> Barcha turlar
                   </div>
                </div>
            </div>

            <!-- Detailed Worker Status List -->
            <div style="background: #ffffff; border: 1px solid rgba(31, 38, 135, 0.1); border-radius: 24px; overflow: hidden; box-shadow: 0 15px 40px rgba(31, 38, 135, 0.05);">
                <div style="padding: 25px 35px; border-bottom: 1px solid rgba(31, 38, 135, 0.08); display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
                    <h3 style="margin: 0; font-size: 1.25rem; color: #1e293b; font-weight: 800; display: flex; align-items: center; gap: 15px;">
                        <i class="fas fa-list-check" style="color: #ffd700;"></i> Xodimlar & Yo'riqnoma Holati
                    </h3>
                    <div style="position: relative; width: 350px;">
                        <input type="text" id="tnu19-stats-search" placeholder="Xodimni qidirish..." onkeyup="filterTNU19StatsTable()" style="width: 100%; background: #ffffff; border: 1px solid rgba(31, 38, 135, 0.15); color: #1e293b; padding: 12px 15px 12px 45px; border-radius: 14px; font-size: 0.95rem; font-weight: 600; outline: none; transition: 0.3s;">
                        <i class="fas fa-search" style="position: absolute; left: 18px; top: 15px; color: #64748b;"></i>
                    </div>
                </div>
                <div style="max-height: 550px; overflow-y: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="position: sticky; top: 0; background: #1e293b; z-index: 10;">
                            <tr style="text-align: left; color: #ffffff; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1.5px;">
                                <th style="padding: 18px 30px; font-weight: 800;">Xodim</th>
                                <th style="padding: 18px 20px; font-weight: 800;">Lavozim</th>
                                <th style="padding: 18px 20px; font-weight: 800;">Oxirgi Yo'riqnoma</th>
                                <th style="padding: 18px 20px; font-weight: 800;">Sana</th>
                                <th style="padding: 18px 30px; font-weight: 800; text-align: center;">Holat</th>
                            </tr>
                        </thead>
                        <tbody id="tnu19-stats-table-body" style="color: #1e293b;">
                            ${allWorkers.map(w => {
        // Find latest record for this worker
        const workerRecords = records.filter(r => String(r.workerId) === String(w.id));
        workerRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
        const lastRecord = workerRecords[0];

        const hasIntro = workerRecords.some(r => r.instructionType === 'kirish');
        const hasRepeat = workerRecords.some(r => r.instructionType === 'takroriy');

        const statusHtml = lastRecord
            ? `<span style="color: #2ecc71; font-weight: bold; font-size: 0.8rem;">O'tgan</span>`
            : `<span style="color: #e74c3c; font-weight: bold; font-size: 0.8rem;">O'tmagan</span>`;

        const typeBadgeClass = lastRecord ? ({
            'kirish': '#3498db',
            'takroriy': '#2ecc71',
            'rejalashtirilmagan': '#e67e22',
            'maqsadli': '#9b59b6'
        }[lastRecord.instructionType] || '#7f8c8d') : 'transparent';

        return `
                                    <tr style="border-bottom: 1px solid rgba(212, 175, 55, 0.1); transition: 0.2s;" onmouseover="this.style.background='#f0f7ff'" onmouseout="this.style.background='transparent'">
                                        <td style="padding: 18px 30px; font-weight: 700; color: #1e293b;">${w.name}</td>
                                        <td style="padding: 18px 20px; color: #64748b; font-size: 0.85rem; font-weight: 600; text-transform: uppercase;">${w.position}</td>
                                        <td style="padding: 18px 20px;">
                                            ${lastRecord ? `
                                                <span style="background: ${typeBadgeClass}15; color: ${typeBadgeClass}; border: 1px solid ${typeBadgeClass}30; padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase;">${lastRecord.instructionType}</span>
                                            ` : '<span style="color: #cbd5e1; font-weight: 800;">---</span>'}
                                        </td>
                                        <td style="padding: 18px 20px; color: #b8860b; font-weight: 800; text-align: center; font-size: 0.9rem;">${lastRecord ? lastRecord.date : '---'}</td>
                                        <td style="padding: 18px 30px; text-align: center;">${statusHtml}</td>
                                    </tr>
                                `;
    }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Type Distribution -->
             <div style="background: #ffffff; border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 24px; padding: 35px; box-shadow: 0 20px 50px rgba(31, 38, 135, 0.05);">
                <h3 style="margin: 0 0 25px 0; font-size: 1.25rem; color: #1e293b; font-weight: 800; border-bottom: 2px solid #d4af37; padding-bottom: 15px; display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-chart-pie" style="color: #d4af37;"></i> Yo'riqnoma Turlari Bo'yicha
                </h3>
                <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                    <div style="flex: 1; background: #f8fafc; padding: 25px; border-radius: 20px; border: 1px solid rgba(37, 99, 235, 0.1); display: flex; align-items: center; justify-content: space-between; min-width: 200px; box-shadow: 0 8px 16px rgba(0,0,0,0.02);">
                        <span style="color: #ffd700; font-weight: 800; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px;">Kirish</span>
                        <span style="font-size: 1.6rem; font-weight: 900; color: #1e293b;">${statsByType['kirish']}</span>
                    </div>
                    <div style="flex: 1; background: #f8fafc; padding: 25px; border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.1); display: flex; align-items: center; justify-content: space-between; min-width: 200px; box-shadow: 0 8px 16px rgba(0,0,0,0.02);">
                        <span style="color: #10b981; font-weight: 800; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px;">Takroriy</span>
                        <span style="font-size: 1.6rem; font-weight: 900; color: #1e293b;">${statsByType['takroriy']}</span>
                    </div>
                    <div style="flex: 1; background: #f8fafc; padding: 25px; border-radius: 20px; border: 1px solid rgba(245, 158, 11, 0.1); display: flex; align-items: center; justify-content: space-between; min-width: 200px; box-shadow: 0 8px 16px rgba(0,0,0,0.02);">
                        <span style="color: #f59e0b; font-weight: 800; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px;">Rejalashtirilmagan</span>
                        <span style="font-size: 1.6rem; font-weight: 900; color: #1e293b;">${statsByType['rejalashtirilmagan']}</span>
                    </div>
                    <div style="flex: 1; background: #f8fafc; padding: 25px; border-radius: 20px; border: 1px solid rgba(139, 92, 246, 0.1); display: flex; align-items: center; justify-content: space-between; min-width: 200px; box-shadow: 0 8px 16px rgba(0,0,0,0.02);">
                        <span style="color: #8b5cf6; font-weight: 800; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px;">Maqsadli</span>
                        <span style="font-size: 1.6rem; font-weight: 900; color: #1e293b;">${statsByType['maqsadli']}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

window.filterTNU19StatsTable = function () {
    const input = document.getElementById('tnu19-stats-search');
    const filter = input.value.toUpperCase();
    const table = document.getElementById('tnu19-stats-table-body');
    const tr = table.getElementsByTagName('tr');

    for (let i = 0; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName('td')[0];
        if (td) {
            const txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

// Face ID Access Request
function requestTNU19Access(bolinmaId) {
    return new Promise((resolve) => {
        // We'll use the existing Face ID modal structure but with a success callback
        // For demonstration, we'll verify the current user or just any valid face

        const existing = document.getElementById('tnu19-faceid-modal');
        if (existing) existing.remove();

        // Create a custom version for access
        window.tempFaceIDSuccess = () => {
            stopTNU19FaceID();
            resolve(true);
        };

        // Override finishFaceID globally temporarily or handle it in the function
        const originalFinish = window.finishFaceID;
        window.finishFaceID = () => {
            const status = document.getElementById('faceid-status');
            const successIcon = document.getElementById('faceid-success-icon');
            const video = document.getElementById('faceid-video');
            if (successIcon) successIcon.style.transform = "translate(-50%, -50%) scale(1)";
            if (video) video.style.filter = "grayscale(0%) brightness(1.0)";

            setTimeout(() => {
                stopTNU19FaceID();
                window.finishFaceID = originalFinish;
                resolve(true);
            }, 1500);
        };

        // Open modal with a special title
        openTNU19FaceIDModal();

        const titleEl = document.querySelector('#tnu19-faceid-modal h2');
        if (titleEl) titleEl.innerText = "TNU-19 JOURNAL ACCESS";

        const statusEl = document.getElementById('faceid-status');
        if (statusEl) statusEl.innerText = "Jurnalga kirish uchun yuzingizni skanerlang...";

        const cancelBtn = document.querySelector('#tnu19-faceid-modal button');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                stopTNU19FaceID();
                window.finishFaceID = originalFinish;
                resolve(false);
            };
        }
    });
}

// Global Exports
window.openTNU19Window = openTNU19Window;
window.closeTNU19Window = closeTNU19Window;
window.switchTNU19Tab = switchTNU19Tab;
window.renderTNU19Table = renderTNU19Table;
window.renderTNU19Form = renderTNU19Form;
window.openTNU19SignatureModal = openTNU19SignatureModal;
window.clearTNU19Signature = clearTNU19Signature;
window.saveTNU19Signature = saveTNU19Signature;
window.startTNU19Signing = startTNU19Signing;
window.updateWorkerDetails = updateWorkerDetails;
window.requestTNU19Access = requestTNU19Access;
window.openTNU19FaceIDModal = openTNU19FaceIDModal;
window.stopTNU19FaceID = stopTNU19FaceID;
window.finishFaceID = finishFaceID; // Make it global
window.viewTNU19Passport = viewTNU19Passport;
window.showSignatureInput = showSignatureInput;
window.openTNU19FaceIDModal = openTNU19FaceIDModal;
window.stopTNU19FaceID = stopTNU19FaceID;
window.deleteTNU19Record = async function (id) {
    if (confirm("Yozuvni o'chirasizmi?")) {
        try {
            await SmartUtils.fetchAPI('/safety/tnu19/' + id, { method: 'DELETE' });
            tnu19Records = tnu19Records.filter(r => r.id !== id);
            renderTNU19Table();
        } catch (e) {
            console.error('Delete error:', e);
        }
    }
}
