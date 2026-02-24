// Timesheet Logic

// State
let currentTimesheetMonth = new Date();
let currentTimesheetDept = 'all';

// Open Modal
async function openTimesheet(deptId = 'all') {
    currentTimesheetDept = deptId;

    // Check if modal exists
    let modal = document.getElementById('timesheet-modal');
    if (!modal) {
        createTimesheetModal();
        modal = document.getElementById('timesheet-modal');
    }

    await renderTimesheetTable();
    modal.classList.add('active');
}

// Close Modal
function closeTimesheet() {
    document.getElementById('timesheet-modal').classList.remove('active');
}

// Create Modal DOM
function createTimesheetModal() {
    const modal = document.createElement('div');
    modal.id = 'timesheet-modal';
    modal.className = 'timesheet-modal';
    modal.innerHTML = `
        <div class="timesheet-header">
            <div class="timesheet-title">
                <i class="fas fa-calendar-alt"></i> Elektron Tabel <span id="ts-dept-title" style="font-size: 1rem; margin-left: 10px; opacity: 0.8;"></span>
            </div>
            <div class="timesheet-controls">
                <button class="ts-btn" onclick="changeTimesheetMonth(-1)"><i class="fas fa-chevron-left"></i></button>
                <span id="ts-current-date" style="color: white; font-size: 1.1rem; padding: 0 10px;">Sentabr 2025</span>
                <button class="ts-btn" onclick="changeTimesheetMonth(1)"><i class="fas fa-chevron-right"></i></button>
                
                <div style="width: 20px;"></div>
                
                <button class="ts-btn ts-btn-primary" onclick="window.print()"><i class="fas fa-print"></i> Chop etish</button>
                ${window.Auth.currentUser?.role !== 'department' ? `
                <button id="ts-save-btn" class="ts-btn ts-btn-success" onclick="saveTimesheet()"><i class="fas fa-save"></i> Saqlash</button>
                ` : ''}
                <button class="ts-btn ts-btn-danger" onclick="closeTimesheet()"><i class="fas fa-times"></i> Yopish</button>
            </div>
        </div>
        <div class="timesheet-content" id="timesheet-table-container">
            <!-- Table goes here -->
        </div>
    `;
    document.body.appendChild(modal);
}

// Helper to check weekends
function isWeekend(year, month, day) {
    const d = new Date(year, month, day).getDay();
    return d === 0 || d === 6;
}

// Render Table
async function renderTimesheetTable() {
    const date = currentTimesheetMonth;
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
    const monthNameRu = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    document.getElementById('ts-current-date').innerText = `${monthNames[month]} ${year}`;

    // Update Dept Title
    const deptTitle = currentTimesheetDept === 'all' ? "(Barcha Bo'limlar)" : `(${currentTimesheetDept})`;
    const tsDeptTitle = document.getElementById('ts-dept-title');
    if (tsDeptTitle) tsDeptTitle.innerText = deptTitle;

    // Get Data
    let allWorkers = [];

    // 1. Try to get from HR system (priority)
    if (typeof window.hrData !== 'undefined' && window.hrData.employees && window.hrData.employees.length > 0) {
        allWorkers = window.hrData.employees.map(emp => ({
            id: emp.id || emp.tabelNumber,
            name: emp.name,
            position: emp.position,
            role: emp.position,
            bolinma: emp.department,
            bolinmaId: emp.department
        }));
    } else {
        // Fallback to other systems
        const savedWorkers = localStorage.getItem('smart_pch_workers');
        if (savedWorkers) {
            allWorkers = JSON.parse(savedWorkers);
        } else if (typeof window.workersData !== 'undefined') {
            allWorkers = window.workersData;
        }
    }

    // Filter by Dept & Role Access
    let employees = allWorkers;
    let isEditable = false;
    const currentUser = window.Auth.currentUser;

    if (currentTimesheetDept !== 'all') {
        const bIdStr = String(currentTimesheetDept).toLowerCase();
        const bNum = bIdStr.replace(/[^0-9]/g, '');
        employees = allWorkers.filter(w => {
            const wBol = String(w.bolinma || w.bolinmaId || '').toLowerCase();
            return wBol.includes(bNum) || wBol === bIdStr || wBol.includes(bIdStr);
        });

        // Bo'lim (HR) faqat ko'radi, soat qo'yishga ruxsat yo'q
        // Bo'linma yoki Admin bo'lsa va departament tanlangan bo'lsa tahrirlashi mumkin
        if (currentUser?.role === 'bolinma' || currentUser?.role === 'admin') {
            isEditable = true;
        }
    }

    const storageKey = `timesheet_${year}_${month}`;
    // Fetch from server instead of localStorage
    let savedData = {};
    try {
        const serverData = await SmartUtils.fetchAPI(`/timesheet/${year}/${month}`);
        if (serverData) savedData = serverData;
    } catch (e) {
        console.warn('Timesheet server fetch failed, using local fallback', e);
        savedData = JSON.parse(localStorage.getItem(storageKey)) || {};
    }

    let html = `
        <div class="tabel-wrapper">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px; color: black; padding: 0 10px;">
                <div style="font-size: 1rem; font-weight: bold; border-bottom: 2px solid black; padding-bottom: 2px;">Предприятие ПЧ -16</div>
                <div style="text-align: center; flex: 1;">
                    <h2 style="margin: 0; text-transform: uppercase; letter-spacing: 12px; font-size: 2.8rem; color: #1e293b; line-height: 1;">Т А Б Е Л Ь</h2>
                    <div style="font-size: 0.95rem; border-top: 2px solid #10b981; padding-top: 5px; margin-top: 10px; color: #065f46; font-weight: bold;">
                        учёта использования рабочего времени и подсчёта заработка за ${monthNameRu[month]} ${year} года
                    </div>
                </div>
                <div style="width: 200px; text-align: right; font-size: 0.8rem; font-weight: bold;">Forma № T-13</div>
            </div>

            <table class="official-ts-table">
                <colgroup>
                    <col style="width: 45px;"> <!-- № -->
                    <col style="width: 320px;"> <!-- Name -->
                    ${Array.from({ length: 15 }, () => `<col style="width: 40px;">`).join('')} <!-- Days -->
                    <col style="width: 50px;"> <!-- Separator -->
                    <col style="width: 65px;"> <!-- Total Days -->
                    ${Array.from({ length: 14 }, () => `<col style="width: 40px;">`).join('')} <!-- Details -->
                    <col style="width: 70px;"> <!-- Total Hours -->
                    ${Array.from({ length: 9 }, () => `<col style="width: 45px;">`).join('')} <!-- Meta -->
                    <col style="width: 140px;"> <!-- Summa -->
                </colgroup>
                <thead>
                    <tr>
                        <th rowspan="4">№</th>
                        <th rowspan="2">Фамилия, имя, отчество</th>
                        <th colspan="16">Число месяца</th>
                        <th colspan="11">Дней</th>
                        <th rowspan="4" class="v-text"><div>Выходные и праздничные дни</div></th>
                        <th colspan="3" rowspan="2">Неотработанных часов</th>
                        <th colspan="5">Отработано часов</th>
                        <th rowspan="4" class="v-text"><div>Цех, стация, участок</div></th>
                        <th rowspan="4" class="v-text"><div>Вид оплаты</div></th>
                        <th rowspan="4" class="v-text"><div>Синтетический счет</div></th>
                        <th rowspan="4" class="v-text"><div>Статья расхода</div></th>
                        <th rowspan="4" class="v-text"><div>Дополнительный признак</div></th>
                        <th rowspan="4" class="v-text"><div>Профессиональная категория</div></th>
                        <th rowspan="4">Табельный номер</th>
                        <th rowspan="4" class="v-text"><div>Разряд</div></th>
                        <th rowspan="4">Оклад / Ставка</th>
                        <th rowspan="4" class="v-text"><div>Процент</div></th>
                        <th rowspan="4">Сумма заработка</th>
                    </tr>
                    <tr>
                        <th colspan="15">Число месяца</th>
                        <th rowspan="3" style="font-size: 1.5rem;">-</th>
                        <th rowspan="2" class="v-text"><div>ЯВОК работa</div></th>
                        <th colspan="10">неявок</th>
                        <th rowspan="3">всего</th>
                        <th colspan="4">из них</th>
                    </tr>
                    <tr>
                        <th rowspan="2">Должность</th>
                        ${Array.from({ length: 15 }, (_, i) => `<th style="background: ${isWeekend(year, month, i + 1) ? '#fee2e2' : '#f8fafc'};">${i + 1}</th>`).join('')}
                        <th class="v-text"><div>отпуск</div></th>
                        <th class="v-text"><div>очередн</div></th>
                        <th class="v-text"><div>связ. с</div></th>
                        <th class="v-text"><div>бол.</div></th>
                        <th class="v-text"><div>прочие</div></th>
                        <th class="v-text"><div>разреш</div></th>
                        <th class="v-text"><div>прогул</div></th>
                        <th>-</th>
                        <th>-</th>
                        <th>-</th>
                        <th rowspan="2" class="v-text"><div>сверхурочн</div></th>
                        <th rowspan="2" class="v-text"><div>ночные</div></th>
                        <th rowspan="2" class="v-text"><div>праздничн</div></th>
                        <th rowspan="2" class="v-text"><div>прочие</div></th>
                    </tr>
                    <tr>
                        ${Array.from({ length: 15 }, (_, i) => `<th style="background: ${isWeekend(year, month, i + 16) ? '#fee2e2' : '#f8fafc'};">${i + 16 > daysInMonth ? '-' : (i + 16)}</th>`).join('')}
                        <th colspan="10"></th>
                    </tr>
                </thead>
                <tbody>
    `;

    employees.forEach((emp, index) => {
        const empId = emp.id;
        let totalHours = 0;
        let totalDays = 0;
        let nightHours = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const val = parseFloat(savedData[`${empId}_${day}`] || 0);
            if (!isNaN(val) && val > 0) {
                totalHours += val;
                totalDays++;
                if (val === 12) nightHours += 4;
            }
        }

        const buildDayCell = (day) => {
            if (day > daysInMonth) return `<td style="background: #f1f5f9; border: 1px solid black;"></td>`;
            const key = `${empId}_${day}`;
            const val = savedData[key] || '';
            const isWE = isWeekend(year, month, day);
            const contentEditableAttr = isEditable ? 'contenteditable="true"' : 'contenteditable="false"';
            return `
                <td style="padding: 0; background: ${isWE ? '#fff1f2' : 'white'}; border: 1px solid black;">
                    <div class="ts-input" ${contentEditableAttr} oninput="calculateRow(this)" onblur="saveTimesheet(true)" data-emp="${empId}" data-day="${day}">${val}</div>
                </td>`;
        };

        html += `
            <tr class="emp-row-1" data-emp-row="${empId}">
                <td rowspan="2" style="font-weight: bold; border: 1px solid black; background: #f8fafc; text-align: center;">${index + 1}</td>
                <td rowspan="2" class="emp-name-tag" style="border: 1px solid black; text-align: left; padding: 8px;">
                    <div style="font-weight: bold; font-size: 1.05rem; color: black; line-height: 1.2;">${emp.name}</div>
                    <div style="font-size: 0.75rem; color: #334155; margin-top: 5px; border-top: 1px solid #cbd5e1; padding-top: 4px; font-weight: 500;">
                        ${emp.role || emp.position} | <span style="color: #1e40af;">№${emp.id || emp.tabelNumber || '---'}</span>
                    </div>
                </td>
                ${Array.from({ length: 15 }, (_, i) => buildDayCell(i + 1)).join('')}
                <td style="font-weight: bold; border: 1px solid black; background: #f8fafc; text-align: center;">-</td>
                <td rowspan="2" style="font-weight: bold; background: #f1f5f9; border: 1px solid black; text-align: center; font-size: 1.1rem;" class="total-days" id="total-days-${empId}">${totalDays}</td>
                <td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="border: 1px solid black;"></td>
                <td rowspan="2" style="font-weight: bold; border: 1px solid black; text-align: center;">1</td><td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="border: 1px solid black;"></td>
                <td rowspan="2" style="font-weight: bold; background: #f1f5f9; border: 1px solid black; text-align: center; font-size: 1.1rem;" class="total-hours" id="total-hours-${empId}">${totalHours}</td>
                <td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="font-weight: bold; border: 1px solid black; text-align: center; font-size: 1.1rem;" class="night-hours" id="night-hours-${empId}">${nightHours}</td><td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="border: 1px solid black;"></td>
                <td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="font-weight: bold; border: 1px solid black; text-align: center;">${101 + index}</td><td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="font-weight: bold; border: 1px solid black; text-align: center;">100</td><td rowspan="2" style="border: 1px solid black;"></td><td rowspan="2" style="border: 1px solid black;"></td>
            </tr>
            <tr class="emp-row-2">
                ${Array.from({ length: 15 }, (_, i) => buildDayCell(i + 16)).join('')}
                <td style="font-weight: bold; border: 1px solid black; background: #f8fafc; text-align: center;">-</td>
            </tr>
            <tr class="row-spacer"><td colspan="55"></td></tr>
        `;
    });

    html += `</tbody></table></div>`;

    document.getElementById('timesheet-table-container').innerHTML = html;
    applyTabelStyles();
}

function applyTabelStyles() {
    const styleId = 'official-tabel-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            .timesheet-content {
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                background: #0f172a;
            }
            .tabel-wrapper {
                background: white;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.6);
                overflow-x: auto;
                max-width: 98%;
            }
            .official-ts-table {
                width: 2600px;
                border-collapse: collapse;
                border: 2.5px solid black;
                font-family: 'Times New Roman', serif;
                background: white;
                color: black;
                table-layout: fixed;
            }
            .official-ts-table th, .official-ts-table td {
                border: 1.5px solid black;
                height: 35px;
                padding: 0;
                color: black;
                word-wrap: break-word;
                overflow: hidden;
                text-align: center;
                vertical-align: middle;
            }
            .official-ts-table thead th {
                background: #f8fafc;
                font-weight: bold;
                color: black;
                font-size: 0.75rem;
                padding: 4px;
            }
            .v-text {
                height: 160px;
                vertical-align: bottom !important;
                padding: 0 !important;
            }
            .v-text div {
                writing-mode: vertical-rl;
                transform: rotate(180deg);
                white-space: nowrap;
                display: inline-block;
                text-align: left;
                width: 100%;
                font-size: 0.65rem;
                font-weight: bold;
                padding: 8px 0;
            }
            .emp-name-tag {
                background: #f8fafc !important;
            }
            .ts-input {
                width: 100%;
                height: 100%;
                outline: none;
                cursor: text;
                font-weight: bold;
                color: black;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
            }
            .ts-input:focus {
                background: #f0fdf4;
                box-shadow: inset 0 0 0 2px #16a34a;
            }
            .row-spacer {
                height: 20px;
                background: #0f172a;
            }
            .row-spacer td {
                border: none !important;
            }
            @media print {
                .timesheet-header, .timesheet-controls { display: none !important; }
                .timesheet-modal { position: absolute; padding: 0; background: white; }
                .tabel-wrapper { box-shadow: none; padding: 0; max-width: none; }
                .official-ts-table { width: 100%; }
                body * { visibility: hidden; }
                #timesheet-modal, #timesheet-modal * { visibility: visible; }
                #timesheet-modal { position: absolute; left: 0; top: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

function changeTimesheetMonth(dir) {
    currentTimesheetMonth.setMonth(currentTimesheetMonth.getMonth() + dir);
    renderTimesheetTable();
}

window.calculateRow = function (cell) {
    const empId = cell.getAttribute('data-emp');
    const allCells = document.querySelectorAll(`.ts-input[data-emp="${empId}"]`);

    let totalHours = 0;
    let totalDays = 0;
    let nightHours = 0;

    allCells.forEach(c => {
        const val = parseFloat(c.innerText.trim());
        if (!isNaN(val)) {
            totalHours += val;
            if (val > 0) totalDays++;
            if (val === 12) nightHours += 4;
        }
    });

    const daysEl = document.getElementById(`total-days-${empId}`);
    const hoursEl = document.getElementById(`total-hours-${empId}`);
    const nightsEl = document.getElementById(`night-hours-${empId}`);

    if (daysEl) daysEl.innerText = totalDays;
    if (hoursEl) hoursEl.innerText = totalHours;
    if (nightsEl) nightsEl.innerText = nightHours;
};

window.saveTimesheet = async function (silent = false) {
    const date = currentTimesheetMonth;
    const year = date.getFullYear();
    const month = date.getMonth();
    const storageKey = `timesheet_${year}_${month}`;

    const data = {};
    const cells = document.querySelectorAll('.ts-input');

    cells.forEach(cell => {
        const emp = cell.getAttribute('data-emp');
        const day = cell.getAttribute('data-day');
        const val = cell.innerText.trim();
        if (val) data[`${emp}_${day}`] = val;
    });

    try {
        // Save to Server
        await SmartUtils.fetchAPI('/timesheet/save', {
            method: 'POST',
            body: JSON.stringify({ year, month, data })
        });

        // Save to LocalStorage for offline
        localStorage.setItem(storageKey, JSON.stringify(data));

        if (!silent) {
            showToast('Tabel muvaffaqiyatli saqlandi!', 'success');
            renderTimesheetTable();
        }
    } catch (e) {
        console.error('Timesheet save error:', e);
        if (!silent) showToast('Tabelni saqlashda xatolik yuz berdi', 'error');
    }
};

// Global Exports
window.openTimesheet = openTimesheet;
window.closeTimesheet = closeTimesheet;
window.changeTimesheetMonth = changeTimesheetMonth;
