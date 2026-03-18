// TNU-20: Bilimlarni Tekshirish Jurnali
// Knowledge Verification Journal with Test Results

let tnu20Records = [];
let tnu20CurrentRecord = null;

// Load records from server
async function loadTNU20Records() {
    await initHRData();
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
        const bNumMatch = String(bolinmaId).match(/\d+/);
        const bNum = bNumMatch ? bNumMatch[0] : bolinmaId;

        return allWorkers.filter(w => {
            const wBolinma = String(w.bolinma || w.bolinmaId || '').toLowerCase();
            const wNumMatch = wBolinma.match(/\d+/);
            const wNum = wNumMatch ? wNumMatch[0] : '';
            return wNum === bNum || wBolinma.includes(String(bolinmaId).toLowerCase());
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

// Load worker photo helper
function loadWorkerPhoto(workerId) {
    let allWorkers = [];
    if (typeof window.hrData !== 'undefined' && window.hrData.employees) {
        allWorkers = window.hrData.employees;
    } else {
        const saved = localStorage.getItem('smart_pch_workers');
        allWorkers = saved ? JSON.parse(saved) : [];
    }
    const worker = allWorkers.find(w => String(w.id || w.tabelNumber) === String(workerId));
    return worker && worker.photo ? worker.photo : '';
}

// Open TNU-20 Journal Window
async function openTNU20Window(bolinmaId) {
    await loadTNU20Records();
    window.currentTNU20BolinmaId = bolinmaId;

    // Remove existing modal
    const existing = document.getElementById('tnu20-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'tnu20-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(240, 247, 255, 0.8); z-index: 10030; display: flex;
        justify-content: center; align-items: center; backdrop-filter: blur(10px);
    `;

    modal.innerHTML = `
        <div style="background: #ffffff; width: 95%; max-width: 1400px; max-height: 95vh; border-radius: 30px; display: flex; flex-direction: column; box-shadow: 0 40px 100px rgba(31, 38, 135, 0.15); border: 1px solid rgba(255,255,255,0.3); overflow: hidden; font-family: 'Inter', sans-serif;">
            
            <!-- Header -->
            <div style="padding: 30px 40px; border-bottom: 2px solid #d4af37; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(90deg, #f8fafc 0%, #e0e7ff 100%);">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="width: 60px; height: 60px; background: white; border-radius: 18px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(31, 38, 135, 0.08);">
                        <i class="fas fa-graduation-cap" style="color: #d4af37; font-size: 2rem;"></i>
                    </div>
                    <div>
                        <h2 style="margin: 0; color: #1e293b; font-size: 1.6rem; font-weight: 800; letter-spacing: -0.5px;">
                            TNU-20: <span style="color: #ffd700;">Bilimlarni Tekshirish Jurnali</span>
                        </h2>
                        <p style="margin: 5px 0 0 0; color: #64748b; font-size: 0.95rem; font-weight: 600;">
                            Xavfsizlik texnikasi bo'yicha bilim tekshiruv natijalari
                        </p>
                    </div>
                </div>
                <button onclick="closeTNU20Window()" style="background: #ffffff; border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; font-size: 1.5rem; cursor: pointer; width: 50px; height: 50px; border-radius: 15px; transition: all 0.3s; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 15px rgba(0,0,0,0.05);" onmouseover="this.style.background='#ef4444'; this.style.color='#fff'" onmouseout="this.style.background='#ffffff'; this.style.color='#ef4444'">
                   <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- Tab Navigation -->
            <div style="padding: 15px 40px; background: #f8fafc; display: flex; gap: 15px; border-bottom: 1px solid rgba(31,38,135,0.08);">
                <button class="tnu20-tab active" data-tab="table" onclick="switchTNU20Tab('table')" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); border: none; color: white; padding: 12px 30px; border-radius: 14px; cursor: pointer; font-weight: 800; transition: all 0.3s; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 20px rgba(37, 99, 235, 0.15);">
                    <i class="fas fa-table"></i> Jurnal
                </button>
                <button class="tnu20-tab" data-tab="new" onclick="switchTNU20Tab('new')" style="background: #ffffff; border: 1px solid rgba(31,38,135,0.1); color: #64748b; padding: 12px 30px; border-radius: 14px; cursor: pointer; font-weight: 700; transition: all 0.3s; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-plus-circle"></i> Yangi Yozuv
                </button>
                <button class="tnu20-tab" data-tab="stats" onclick="switchTNU20Tab('stats')" style="background: #ffffff; border: 1px solid rgba(31,38,135,0.1); color: #64748b; padding: 12px 30px; border-radius: 14px; cursor: pointer; font-weight: 700; transition: all 0.3s; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-chart-line"></i> Statistika
                </button>
            </div>

            <!-- Content Area -->
            <div id="tnu20-content" style="padding: 35px 40px; overflow-y: auto; flex-grow: 1; color: #1e293b; background: #ffffff;">
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
            btn.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
            btn.style.border = 'none';
            btn.style.color = '#fff';
            btn.style.boxShadow = '0 10px 20px rgba(37, 99, 235, 0.15)';
        } else {
            btn.style.background = '#ffffff';
            btn.style.border = '1px solid rgba(31,38,135,0.1)';
            btn.style.color = '#64748b';
            btn.style.boxShadow = 'none';
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

    const records = tnu20Records;

    let html = `
        <div style="margin-bottom: 35px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 20px; border-radius: 20px; border: 1px solid rgba(31,38,135,0.05); box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
            <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                <input type="date" id="tnu20-filter-date" onchange="renderTNU20Table()" style="padding: 12px 15px; border-radius: 12px; border: 1px solid rgba(31,38,135,0.1); background: #ffffff; color: #1e293b; font-weight: 600; outline: none;">
                <select id="tnu20-filter-result" onchange="renderTNU20Table()" style="padding: 12px 15px; border-radius: 12px; border: 1px solid rgba(31,38,135,0.1); background: #ffffff; color: #1e293b; font-weight: 600; outline: none;">
                    <option value="">Barcha natijalar</option>
                    <option value="o'tdi">O'tdi</option>
                    <option value="o'tmadi">O'tmadi</option>
                </select>
                <div style="position: relative;">
                    <input type="text" id="tnu20-filter-name" placeholder="Xodim ismi..." onkeyup="renderTNU20Table()" style="padding: 12px 15px 12px 40px; border-radius: 12px; border: 1px solid rgba(31,38,135,0.1); background: #ffffff; color: #1e293b; min-width: 250px; font-weight: 600; outline: none;">
                    <i class="fas fa-search" style="position: absolute; left: 15px; top: 15px; color: #64748b;"></i>
                </div>
            </div>
            <button onclick="exportTNU20PDF()" style="background: linear-gradient(135deg, #d4af37, #b8860b); border: none; color: white; padding: 12px 25px; border-radius: 12px; cursor: pointer; font-weight: 800; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 20px rgba(212, 175, 55, 0.2); transition: 0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                <i class="fas fa-file-pdf"></i> PDF EKSPORT
            </button>
        </div>

        <div style="background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid rgba(31,38,135,0.08); box-shadow: 0 20px 50px rgba(31, 38, 135, 0.05);">
            <table style="width: 100%; border-collapse: collapse; color: #1e293b;">
                <thead>
                    <tr style="background: #1e293b; border-bottom: 2px solid #d4af37;">
                        <th style="padding: 18px 15px; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #fff; font-weight: 800;">Sana</th>
                        <th style="padding: 18px 15px; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #fff; font-weight: 800;">Foto</th>
                        <th style="padding: 18px 15px; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #fff; font-weight: 800;">F.I.O</th>
                        <th style="padding: 18px 15px; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #fff; font-weight: 800;">Lavozim</th>
                        <th style="padding: 18px 15px; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #fff; font-weight: 800;">Sabab</th>
                        <th style="padding: 18px 15px; text-align: center; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #fff; font-weight: 800;">Natija</th>
                        <th style="padding: 18px 15px; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #fff; font-weight: 800;">Keyingi sana</th>
                        <th style="padding: 18px 15px; text-align: center; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #fff; font-weight: 800;">Amallar</th>
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
            const resultColor = record.result === "o'tdi" ? '#10b981' : '#ef4444';
            const resultIcon = record.result === "o'tdi" ? 'fa-check-circle' : 'fa-times-circle';
            const nextTestWarning = new Date(record.nextTestDate) < new Date() ? 'color: #ef4444; font-weight: 800;' : 'color: #b8860b; font-weight: 800;';

            // Find worker for photo
            const allWorkers = JSON.parse(localStorage.getItem('smart_pch_workers') || '[]');
            const worker = allWorkers.find(w => w.id === record.workerId);
            const initials = record.workerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

            const photoHtml = worker && worker.photo
                ? `<img src="${worker.photo}" style="width: 45px; height: 45px; border-radius: 12px; object-fit: cover; border: 2px solid #2563eb; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">`
                : `<div style="width: 45px; height: 45px; border-radius: 12px; background: linear-gradient(135deg, #2563eb, #1d4ed8); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; color: white; border: 2px solid rgba(255,255,255,0.5);">${initials}</div>`;

            html += `
                <tr style="border-bottom: 1px solid rgba(31,38,135,0.06); transition: all 0.2s;" onmouseover="this.style.background='#f0f7ff'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 15px; font-weight: 700; color: #64748b;">${record.date}</td>
                    <td style="padding: 10px;">${photoHtml}</td>
                    <td style="padding: 15px; font-weight: 800; color: #1e293b; font-size: 1rem;">${record.workerName}</td>
                    <td style="padding: 15px; font-size: 0.8rem; color: #64748b; font-weight: 600; text-transform: uppercase;">${record.workerPosition}</td>
                    <td style="padding: 15px; font-size: 0.85rem; font-weight: 700; color: #1e293b;">${record.testReason === 'navbatdagi' ? 'Navbatdagi' : 'N.tashqari'}</td>
                    <td style="padding: 15px; text-align: center;">
                        <span style="background: ${resultColor}15; color: ${resultColor}; border: 1px solid ${resultColor}30; padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; text-transform: uppercase;">
                            <i class="fas ${resultIcon}"></i> ${record.result}
                        </span>
                    </td>
                    <td style="padding: 15px; font-size: 0.9rem; ${nextTestWarning}">${record.nextTestDate}</td>
                    <td style="padding: 15px; text-align: center;">
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <button onclick="viewTNU20Details('${record.id}')" style="background: #ffffff; border: 1.5px solid rgba(37, 99, 235, 0.2); color: #ffd700; padding: 10px; border-radius: 10px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#2563eb'; this.style.color='#fff'">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="deleteTNU20Record('${record.id}')" style="background: #ffffff; border: 1.5px solid rgba(239, 68, 68, 0.2); color: #ef4444; padding: 10px; border-radius: 10px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#ef4444'; this.style.color='#fff'">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    html += `
                </tbody>
            </table>
        </div>

        <div style="margin-top: 30px; text-align: center; color: #64748b; font-weight: 700; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid rgba(212, 175, 55, 0.1);">
            Jami yozuvlar: <strong style="color: #1e293b;">${filtered.length}</strong> / ${records.length}
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
        <div style="max-width: 900px; margin: 0 auto;">
            <div style="background: #ffffff; padding: 45px; border-radius: 30px; border: 1px solid rgba(212, 175, 55, 0.2); box-shadow: 0 30px 60px rgba(31, 38, 135, 0.08);">
                <h3 style="margin-top: 0; color: #1e293b; border-bottom: 2px solid #d4af37; padding-bottom: 20px; font-weight: 800; font-size: 1.5rem; display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-clipboard-check" style="color: #d4af37;"></i> Yangi Tekshiruv Yozuvi
                </h3>

                <div style="display: grid; gap: 25px; margin-top: 30px;">
                    <!-- Worker Selection -->
                    <div>
                        <label style="display: block; margin-bottom: 10px; color: #475569; font-weight: 800; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px;">
                            Xodimni tanlang:
                        </label>
                        <select id="tnu20-worker" style="width: 100%; padding: 15px; border-radius: 14px; border: 1px solid rgba(31, 38, 135, 0.1); background: #f8fafc; color: #1e293b; font-size: 1rem; font-weight: 600; outline: none; transition: 0.3s;">
                            <option value="">Tanlang...</option>
                            ${workers.map(w => `<option value="${w.id}" data-name="${w.name}" data-position="${w.role || 'Xodim'}">${w.name} - ${w.role || 'Xodim'}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Test Reason -->
                    <div>
                        <label style="display: block; margin-bottom: 10px; color: #475569; font-weight: 800; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px;">
                            Tekshiruv sababi:
                        </label>
                        <select id="tnu20-reason" style="width: 100%; padding: 15px; border-radius: 14px; border: 1px solid rgba(31, 38, 135, 0.1); background: #f8fafc; color: #1e293b; font-size: 1rem; font-weight: 600; outline: none; transition: 0.3s;">
                            <option value="navbatdagi" selected>Navbatdagi tekshiruv</option>
                            <option value="navbatdan-tashqari">Navbatdan tashqari tekshiruv</option>
                        </select>
                    </div>

                    <!-- Test Subject -->
                    <div>
                        <label style="display: block; margin-bottom: 10px; color: #475569; font-weight: 800; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px;">
                            Bilim tekshiruv mavzusi:
                        </label>
                        <textarea id="tnu20-subject" rows="4" placeholder="Qaysi instruksiyalar va qoidalar bo'yicha tekshirildi..." style="width: 100%; padding: 15px; border-radius: 14px; border: 1px solid rgba(31, 38, 135, 0.1); background: #f8fafc; color: #1e293b; font-size: 1rem; font-weight: 600; resize: vertical; outline: none; transition: 0.3s;"></textarea>
                    </div>

                    <!-- Test Result -->
                    <div>
                        <label style="display: block; margin-bottom: 10px; color: #475569; font-weight: 800; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px;">
                            Natija:
                        </label>
                        <select id="tnu20-result" style="width: 100%; padding: 15px; border-radius: 14px; border: 1px solid rgba(31, 38, 135, 0.1); background: #f8fafc; color: #1e293b; font-size: 1rem; font-weight: 600; outline: none; transition: 0.3s;">
                            <option value="o'tdi" selected>✅ Bilimi qoniqarli, sinovdan o'tdi</option>
                            <option value="o'tmadi">❌ Bilimi yetarli emas, sinovdan o'tmadi</option>
                        </select>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <!-- Certificate Number -->
                        <div>
                            <label style="display: block; margin-bottom: 10px; color: #475569; font-weight: 800; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px;">
                                Guvohnoma raqami:
                            </label>
                            <input type="text" id="tnu20-certificate" value="${certNumber}" readonly style="width: 100%; padding: 15px; border-radius: 14px; border: 1px solid rgba(212, 175, 55, 0.2); background: rgba(212, 175, 55, 0.05); color: #b8860b; font-size: 1rem; font-family: 'JetBrains Mono', monospace; font-weight: 800; outline: none;">
                        </div>

                        <!-- Next Test Date -->
                        <div>
                            <label style="display: block; margin-bottom: 10px; color: #475569; font-weight: 800; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px;">
                                Keyingi tekshiruv sanasi:
                            </label>
                            <input type="date" id="tnu20-next-date" value="${nextDate}" style="width: 100%; padding: 15px; border-radius: 14px; border: 1px solid rgba(31, 38, 135, 0.1); background: #f8fafc; color: #1e293b; font-size: 1rem; font-weight: 600; outline: none;">
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <button onclick="startTNU20Signing()" style="background: linear-gradient(135deg, #10b981, #059669); border: none; color: white; padding: 20px 30px; border-radius: 16px; font-size: 1.1rem; font-weight: 900; cursor: pointer; margin-top: 20px; box-shadow: 0 15px 30px rgba(16, 185, 129, 0.25); transition: all 0.3s; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; justify-content: center; gap: 12px;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 20px 40px rgba(16, 185, 129, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 15px 30px rgba(16, 185, 129, 0.25)'">
                        <i class="fas fa-signature"></i> IMZO QO'YISH VA SAQLASH
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
        background: rgba(240, 247, 255, 0.9); z-index: 10040; display: flex;
        justify-content: center; align-items: center; backdrop-filter: blur(10px);
    `;

    modal.innerHTML = `
        <div style="background: #ffffff; width: 90%; max-width: 750px; border-radius: 30px; box-shadow: 0 40px 100px rgba(31, 38, 135, 0.15); border: 1px solid rgba(212, 175, 55, 0.2); overflow: hidden; font-family: 'Inter', sans-serif;">
            <div style="padding: 30px 40px; border-bottom: 2px solid #d4af37; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white;">
                <h3 style="margin: 0; font-size: 1.5rem; font-weight: 800; display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-signature" style="color: #d4af37;"></i> Xodim Imzosi
                </h3>
                <p style="margin: 8px 0 0 0; opacity: 0.9; font-weight: 600; font-size: 1rem;">
                    Identifikatsiya: <span style="color: #d4af37; font-weight: 800;">${tnu20CurrentRecord.workerName}</span>
                </p>
            </div>

            <div style="padding: 40px; text-align: center; background: #ffffff;">
                <div style="margin-bottom: 25px; color: #64748b; font-weight: 700; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px;">
                    Ekran yuzasiga imzo qo'ying:
                </div>
                <div style="background: #f8fafc; display: inline-block; border-radius: 20px; border: 2px solid rgba(212, 175, 55, 0.2); padding: 5px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.05); cursor: crosshair;">
                    <canvas id="tnu20-signature-canvas" width="650" height="250" style="touch-action: none; display: block;"></canvas>
                </div>
                <br>
                <button onclick="clearTNU20Signature()" style="margin-top: 25px; background: rgba(100, 116, 139, 0.05); border: 1.5px solid rgba(100, 116, 139, 0.2); color: #64748b; padding: 12px 30px; border-radius: 12px; cursor: pointer; font-weight: 700; transition: 0.2s;" onmouseover="this.style.background='rgba(100, 116, 139, 0.1)'" onmouseout="this.style.background='rgba(100, 116, 139, 0.05)'">
                    <i class="fas fa-eraser"></i> TOZALASH
                </button>
            </div>

            <div style="padding: 30px 40px; border-top: 1px solid rgba(31, 38, 135, 0.05); text-align: right; background: #f8fafc; display: flex; gap: 20px; justify-content: flex-end;">
                <button onclick="closeTNU20SignatureModal()" style="background: #ffffff; border: 1.5px solid rgba(239, 68, 68, 0.2); color: #ef4444; padding: 15px 35px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#ef4444'; this.style.color='#fff'">
                    BEKOR QILISH
                </button>
                <button onclick="saveTNU20Signature()" style="background: linear-gradient(135deg, #10b981, #059669); border: none; color: white; padding: 15px 45px; border-radius: 14px; font-weight: 900; cursor: pointer; box-shadow: 0 15px 30px rgba(16, 185, 129, 0.2); transition: 0.3s; text-transform: uppercase; letter-spacing: 1px;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                    <i class="fas fa-check-circle"></i> TASDIQLASH VA SAQLASH
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
    ctx.strokeStyle = '#1e293b'; // Premium Dark Blue

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
        background: rgba(240, 247, 255, 0.85); z-index: 10050; display: flex;
        justify-content: center; align-items: center; backdrop-filter: blur(15px);
    `;

    const resultColor = record.result === "o'tdi" ? '#10b981' : '#ef4444';
    const resultIcon = record.result === "o'tdi" ? 'fa-check-circle' : 'fa-times-circle';

    modal.innerHTML = `
        <div style="background: #ffffff; width: 95%; max-width: 800px; border-radius: 40px; padding: 0; color: #1e293b; box-shadow: 0 50px 100px rgba(31, 38, 135, 0.15); border: 1px solid rgba(212, 175, 55, 0.2); overflow: hidden; font-family: 'Inter', sans-serif;">
            <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 35px 45px; border-bottom: 3px solid #d4af37; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: #fff; font-size: 1.6rem; font-weight: 800; display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-file-alt" style="color: #d4af37;"></i> Tekshiruv Ma'lumotlari
                </h3>
                <button onclick="this.closest('div').parentElement.parentElement.remove()" style="background: rgba(255,255,255,0.1); border: none; color: white; width: 45px; height: 45px; border-radius: 12px; font-size: 1.5rem; cursor: pointer; transition: 0.3s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'; this.style.color='#ef4444'"><i class="fas fa-times"></i></button>
            </div>

            <div style="padding: 45px; display: grid; gap: 25px;">
                <div style="background: #f8fafc; padding: 25px; border-radius: 20px; border: 1px solid rgba(31, 38, 135, 0.05); display: flex; align-items: center; gap: 25px;">
                    <div style="width: 80px; height: 80px; background: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(0,0,0,0.05); border: 2px solid #2563eb;">
                         <img src="${loadWorkerPhoto(record.workerId)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 18px;">
                    </div>
                    <div>
                        <div style="color: #64748b; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Xodimg to'liq ma'lumoti</div>
                        <div style="font-size: 1.4rem; font-weight: 900; color: #1e293b;">${record.workerName}</div>
                        <div style="color: #ffd700; font-size: 0.95rem; font-weight: 700;">${record.workerPosition}</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: #f8fafc; padding: 20px; border-radius: 18px; border: 1px solid rgba(31, 38, 135, 0.05);">
                        <div style="color: #64748b; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Tekshiruv sanasi</div>
                        <div style="font-weight: 800; color: #1e293b; font-size: 1.1rem;">${record.date} <span style="color: #ffd700; margin-left: 10px;">${record.time}</span></div>
                    </div>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 18px; border: 1px solid rgba(31, 38, 135, 0.05);">
                        <div style="color: #64748b; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Tekshiruv sababi</div>
                        <div style="font-weight: 800; color: #1e293b; font-size: 1.1rem;">${record.testReason === 'navbatdagi' ? 'Navbatdagi' : 'Navbatdan tashqari'}</div>
                    </div>
                </div>

                <div style="background: #f8fafc; padding: 25px; border-radius: 18px; border: 1px solid rgba(31, 38, 135, 0.05);">
                    <div style="color: #64748b; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Tekshiruv mavzusi</div>
                    <div style="color: #1e293b; line-height: 1.6; font-weight: 600;">${record.testSubject}</div>
                </div>

                <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 20px;">
                    <div style="background: ${resultColor}08; padding: 25px; border-radius: 18px; border: 1.5px solid ${resultColor}30; display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="color: #64748b; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Tekshiruv natijasi</div>
                            <div style="font-weight: 900; color: ${resultColor}; font-size: 1.4rem; display: flex; align-items: center; gap: 12px; text-transform: uppercase;">
                                <i class="fas ${resultIcon}"></i> ${record.result}
                            </div>
                        </div>
                        <div style="width: 60px; height: 60px; background: white; border-radius: 50%; border: 3px solid ${resultColor}; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px ${resultColor}20;">
                             <i class="fas ${resultIcon}" style="font-size: 1.8rem; color: ${resultColor};"></i>
                        </div>
                    </div>
                    <div style="background: rgba(212, 175, 55, 0.05); padding: 25px; border-radius: 18px; border: 1.5px solid rgba(212, 175, 55, 0.2);">
                        <div style="color: #64748b; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Guvohnoma №</div>
                        <div style="font-weight: 900; color: #b8860b; font-family: 'JetBrains Mono', monospace; font-size: 1.3rem;">${record.certificateNumber}</div>
                    </div>
                </div>

                <div style="background: #ffffff; padding: 25px; border-radius: 18px; border: 1px solid rgba(31, 38, 135, 0.08); display: flex; justify-content: space-between; align-items: center; box-shadow: 0 15px 30px rgba(0,0,0,0.03);">
                    <div style="flex: 1;">
                        <div style="color: #64748b; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Keyingi tekshiruv sanasi</div>
                        <div style="font-weight: 900; color: #ffd700; font-size: 1.5rem;">${record.nextTestDate}</div>
                        <div style="margin-top: 10px; color: #ef4444; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                             <i class="fas fa-exclamation-circle"></i> O'z vaqtida o'tishi shart
                        </div>
                    </div>
                    <div style="text-align: center; background: white; padding: 15px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.05);">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=CERT:${record.certificateNumber}|ID:${record.workerId}|DATE:${record.date}" style="width: 100px; height: 100px;" alt="QR Verification">
                        <div style="color: #1e293b; font-size: 10px; font-weight: 900; margin-top: 10px; letter-spacing: 1px;">VERIFIKATSIYA</div>
                    </div>
                </div>

                <div style="background: #f8fafc; padding: 30px; border-radius: 24px; border: 1px solid rgba(31,38,135,0.05);">
                    <div style="color: #64748b; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-pen-fancy" style="color: #d4af37;"></i> Xodimning raqamli imzosi:
                    </div>
                    <div style="background: white; border-radius: 20px; padding: 20px; display: flex; align-items: center; justify-content: center; border: 1.5px solid rgba(212, 175, 55, 0.15); box-shadow: inset 0 2px 10px rgba(0,0,0,0.02);">
                        <img src="${record.signature}" style="max-width: 100%; height: 120px; object-fit: contain;">
                    </div>
                    <div style="text-align: right; margin-top: 12px; color: #64748b; font-size: 0.8rem; font-weight: 600; font-style: italic;">
                        Hujjat tizim tomonidan himoyalangan va tasdiqlangan
                    </div>
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

    const records = tnu20Records;
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
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; margin-bottom: 40px;">
            <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; border-radius: 24px; box-shadow: 0 15px 30px rgba(37, 99, 235, 0.2); position: relative; overflow: hidden;">
                <i class="fas fa-users" style="position: absolute; right: -10px; bottom: -10px; font-size: 6rem; color: rgba(255,255,255,0.1);"></i>
                <div style="font-size: 0.9rem; font-weight: 800; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Jami Tekshiruvlar</div>
                <div style="font-size: 3rem; font-weight: 900; color: #fff;">${records.length}</div>
            </div>
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 24px; box-shadow: 0 15px 30px rgba(16, 185, 129, 0.2); position: relative; overflow: hidden;">
                <i class="fas fa-check-circle" style="position: absolute; right: -10px; bottom: -10px; font-size: 6rem; color: rgba(255,255,255,0.1);"></i>
                <div style="font-size: 0.9rem; font-weight: 800; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Muvaffaqiyatli</div>
                <div style="font-size: 3rem; font-weight: 900; color: #fff;">${passed}</div>
            </div>
            <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; border-radius: 24px; box-shadow: 0 15px 30px rgba(239, 68, 68, 0.2); position: relative; overflow: hidden;">
                <i class="fas fa-times-circle" style="position: absolute; right: -10px; bottom: -10px; font-size: 6rem; color: rgba(255,255,255,0.1);"></i>
                <div style="font-size: 0.9rem; font-weight: 800; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">O'tmagan</div>
                <div style="font-size: 3rem; font-weight: 900; color: #fff;">${failed}</div>
            </div>
            <div style="background: linear-gradient(135deg, #d4af37, #b8860b); padding: 30px; border-radius: 24px; box-shadow: 0 15px 30px rgba(212, 175, 55, 0.2); position: relative; overflow: hidden;">
                <i class="fas fa-chart-line" style="position: absolute; right: -10px; bottom: -10px; font-size: 6rem; color: rgba(255,255,255,0.1);"></i>
                <div style="font-size: 0.9rem; font-weight: 800; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">O'tish Ko'rsatkichi</div>
                <div style="font-size: 3rem; font-weight: 900; color: #fff;">${passRate}%</div>
            </div>
        </div >

        <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 30px;">
            <div style="background: #ffffff; padding: 35px; border-radius: 30px; border: 1px solid rgba(212, 175, 55, 0.2); box-shadow: 0 20px 50px rgba(0,0,0,0.05);">
                <h3 style="margin-top: 0; color: #1e293b; border-bottom: 2px solid #d4af37; padding-bottom: 20px; font-weight: 800; display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-calendar-alt" style="color: #d4af37;"></i> Yaqin Kunlarda Tekshiruvlar (30 kun)
                </h3>
                ${upcoming.length === 0 ? `
                    <div style="text-align: center; padding: 50px; color: #64748b; background: #f8fafc; border-radius: 20px; border: 1px dashed rgba(31,38,135,0.1);">
                        <i class="fas fa-calendar-check" style="font-size: 4rem; margin-bottom: 20px; display: block; color: #10b981; opacity: 0.5;"></i>
                        <span style="font-weight: 700; font-size: 1.1rem;">Hozircha yaqin kunlarda rejalashtirilgan tekshiruvlar mavjud emas</span>
                    </div>
                ` : `
                    <div style="display: grid; gap: 15px; max-height: 400px; overflow-y: auto; padding-right: 10px;">
                        ${upcoming.map(r => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; background: #f8fafc; border-left: 5px solid #d4af37; border-radius: 15px; border: 1px solid rgba(31,38,135,0.05); transition: 0.2s;" onmouseover="this.style.background='#fff'; this.style.boxShadow='0 10px 20px rgba(0,0,0,0.05)'" onmouseout="this.style.background='#f8fafc'; this.style.boxShadow='none'">
                                <div style="display: flex; align-items: center; gap: 15px;">
                                    <div style="width: 50px; height: 50px; background: white; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #d4af37; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                                        <i class="fas fa-user"></i>
                                    </div>
                                    <div>
                                        <div style="font-weight: 900; color: #1e293b; font-size: 1.1rem;">${r.workerName}</div>
                                        <div style="font-size: 0.85rem; color: #64748b; font-weight: 600; text-transform: uppercase;">${r.workerPosition}</div>
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="color: #ffd700; font-weight: 900; font-size: 1.2rem;">${r.nextTestDate}</div>
                                    <div style="font-size: 0.85rem; color: #ef4444; font-weight: 800; background: rgba(239, 68, 68, 0.05); padding: 4px 10px; border-radius: 20px; margin-top: 5px; display: inline-block;">
                                        ${Math.ceil((new Date(r.nextTestDate) - today) / (24 * 60 * 60 * 1000))} kun qoldi
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>

            <div style="background: #ffffff; padding: 35px; border-radius: 30px; border: 1px solid rgba(31,38,135,0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.05);">
                <h3 style="margin-top: 0; color: #1e293b; border-bottom: 2px solid #2563eb; padding-bottom: 20px; font-weight: 800; display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-chart-pie" style="color: #ffd700;"></i> Natijalar Taqsimoti
                </h3>
                <div style="display: grid; gap: 20px; margin-top: 25px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 25px; background: rgba(16, 185, 129, 0.05); border-left: 6px solid #10b981; border-radius: 20px; transition: 0.3s;" onmouseover="this.style.transform='translateX(10px)'">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="width: 45px; height: 45px; background: #10b981; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white;">
                                <i class="fas fa-check"></i>
                            </div>
                            <span style="font-weight: 800; color: #1e293b; font-size: 1.1rem;">Sinovdan o'tganlar</span>
                        </div>
                        <strong style="font-size: 2rem; font-weight: 900; color: #10b981;">${passed}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 25px; background: rgba(239, 68, 68, 0.05); border-left: 6px solid #ef4444; border-radius: 20px; transition: 0.3s;" onmouseover="this.style.transform='translateX(10px)'">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="width: 45px; height: 45px; background: #ef4444; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white;">
                                <i class="fas fa-times"></i>
                            </div>
                            <span style="font-weight: 800; color: #1e293b; font-size: 1.1rem;">Sinovdan o'tmaganlar</span>
                        </div>
                        <strong style="font-size: 2rem; font-weight: 900; color: #ef4444;">${failed}</strong>
                    </div>

                    <!-- Progress Bar -->
                    <div style="margin-top: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-weight: 800; color: #64748b; font-size: 0.9rem;">
                            <span>UMUMIY SAMARADORLIK</span>
                            <span>${passRate}%</span>
                        </div>
                        <div style="width: 100%; height: 16px; background: #f1f5f9; border-radius: 10px; overflow: hidden; border: 1px solid rgba(0,0,0,0.05);">
                            <div style="width: ${passRate}%; height: 100%; background: linear-gradient(90deg, #10b981, #34d399); border-radius: 10px; box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Export to PDF
function exportTNU20PDF() {
    if (typeof html2pdf === 'undefined') {
        alert('PDF moduli yuklanmagan. Iltimos sahifani yangilang.');
        return;
    }

    // Xabar
    if (window.SmartUtils) window.SmartUtils.showToast("TNU-20 PDF tayyorlanmoqda, kuting...", "info");

    const element = document.getElementById('tnu20-content');

    const opt = {
        margin: 10,
        filename: `TNU-20_Natijalar_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        if (window.SmartUtils) window.SmartUtils.showToast("PDF muvaffaqiyatli saqlandi!", "success");
    }).catch(err => {
        console.error("PDF Export Error:", err);
        alert("PDF yaratishda xatolik yuz berdi!");
    });
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

console.log('✅ TNU-20 Module Loaded');
