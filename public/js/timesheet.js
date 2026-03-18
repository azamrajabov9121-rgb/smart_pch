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
                <button class="ts-btn" style="background: #3b82f6; color: white;" onclick="renderTimesheetMonitor()"><i class="fas fa-desktop"></i> Bo'limlar Monitori</button>
                <button class="ts-btn" style="background: #10b981; color: white;" onclick="exportTimesheetToExcel()"><i class="fas fa-file-excel"></i> Excelga yuklash</button>
                <button id="ts-archive-btn" class="ts-btn" style="background: #059669; color: white; display: none;" onclick="window.archiveTimesheetToPDF()"><i class="fas fa-file-pdf"></i> Arxiv (PDF)</button>
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
    const hr = await initHRData();
    if (hr && hr.employees && hr.employees.length > 0) {
        allWorkers = hr.employees.map(emp => ({
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
    const currentUser = window.Auth.currentUser;
    let employees = allWorkers;
    let isEditable = false;

    // 1. Hard constraint: Bolinma users can ONLY see their assigned subdivisions
    if (currentUser?.role === 'bolinma' && currentUser.bolinmalar && currentUser.bolinmalar.length > 0) {
        employees = allWorkers.filter(w => {
            const wBol = String(w.bolinma || w.bolinmaId || '').toLowerCase().trim();
            const wNumMatch = wBol.match(/\d+/);
            const wNum = wNumMatch ? wNumMatch[0] : '';

            return currentUser.bolinmalar.some(b => {
                const bStr = String(b).toLowerCase().trim();
                const bNumMatch = bStr.match(/\d+/);
                const bNum = bNumMatch ? bNumMatch[0] : '';

                if (bNum && wNum === bNum) return true;
                if (bStr && wBol === bStr) return true;
                if (bStr && wBol && wBol.includes(bStr)) return true;
                if (bStr && wBol && bStr.includes(wBol)) return true;
                return false;
            });
        });

        // Bolinma users can edit their own section
        isEditable = true;
    } else if (currentUser?.role === 'admin') {
        // Admin can see and edit everything
        isEditable = true;
    }

    // 2. Secondary filter: if a specific department was selected
    if (currentTimesheetDept !== 'all') {
        const bIdStr = String(currentTimesheetDept).toLowerCase().trim();
        const bNumMatch = bIdStr.match(/\d+/);
        const bNum = bNumMatch ? bNumMatch[0] : '';

        employees = employees.filter(w => {
            const wBol = String(w.bolinma || w.bolinmaId || '').toLowerCase().trim();
            const wNumMatch = wBol.match(/\d+/);
            const wNum = wNumMatch ? wNumMatch[0] : '';

            if (bNum && wNum === bNum) return true;
            if (bIdStr && wBol === bIdStr) return true;
            if (bIdStr && wBol && wBol.includes(bIdStr)) return true;
            if (bIdStr && wBol && bIdStr.includes(wBol)) return true;
            return false;
        });
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

    // Fetch Signatures
    let signatures = {};
    try {
        if (currentTimesheetDept !== 'all') {
            const sigData = await SmartUtils.fetchAPI(`/timesheet/signatures/${year}/${month}/${currentTimesheetDept}`);
            if (sigData) signatures = sigData;
        }
    } catch (e) {
        console.warn('Signatures fetch failed', e);
    }

    let html = `
        <div class="tabel-wrapper">
            <div class="tabel-print-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 15px; color: #000 !important;">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <img src="img/logo.png" alt="O'zRTy Logo" style="height: 80px; filter: grayscale(1) contrast(3);">
                    <div style="text-align: left;">
                        <h3 style="margin: 0; font-size: 1.2rem; font-weight: 800; color: #000 !important;">"O'ZBEKISTON TEMIR YO'LLARI" AJ</h3>
                        <p style="margin: 0; font-size: 0.8rem; font-weight: 600; color: #000 !important;">Korxona: PCH-16 (Temir yo'l masofasi)</p>
                    </div>
                </div>
                <div style="width: 380px; text-align: right; font-family: 'Times New Roman', serif;">
                    <div style="font-weight: 800; font-size: 1.3rem; margin-bottom: 5px; color: #000 !important;">УТВЕРЖДАЮ (TASDIQLAYMAN)</div>
                    <div class="director-approval-box" style="border: 2px solid #000; padding: 15px; min-width: 350px; min-height: 120px; background: #fff; position: relative; color: #000 !important;">
                         ${signatures.rahbar_name ? `
                            <div class="e-signature-stamp director-stamp">
                                <div class="stamp-qr" id="qr-rahbar"></div>
                                <div class="stamp-details">
                                    <div class="stamp-label">DIREKTOR TASDIQLADI</div>
                                    <div class="stamp-name">${signatures.rahbar_name}</div>
                                    <div class="stamp-date">${new Date(signatures.rahbar_at).toLocaleString()}</div>
                                    <div class="stamp-serial">ERI: ${signatures.rahbar_serial}</div>
                                </div>
                            </div>
                        ` : (window.Auth.currentUser.role === 'admin' || window.Auth.currentUser.role === 'director' || window.Auth.currentUser.role === 'rahbar') ? `
                            <div style="text-align: center;">
                                <p style="font-size: 0.85rem; color: #000 !important; margin-bottom: 15px;">Direktor tasdig'i uchun:</p>
                                <button onclick="signTimesheet('rahbar')" class="sign-btn director" ${!signatures.iqtisod_name ? 'disabled title="Oldin Iqtisod bo\'limi tasdiqlashi kerak"' : ''} style="width: 100%; margin-top: 0;">
                                    <i class="fas fa-stamp"></i> E-IMZO BILAN TASDIQLASH
                                </button>
                            </div>
                        ` : `
                            <div style="text-align: center; color: #000 !important; font-style: italic; padding-top: 20px;">
                                <i class="fas fa-hourglass-half fa-spin"></i> Rahbar tasdig'i kutilmoqda...
                            </div>
                        `}
                    </div>
                </div>
            </div>

            <div style="text-align: center; margin-bottom: 30px; color: #000 !important;">
                <h1 style="font-size: 4rem; font-weight: 900; margin: 0; letter-spacing: 15px; color: #000 !important; text-shadow: none;">Т А Б Е Л Ь</h1>
                <p style="font-size: 1.2rem; font-weight: 700; margin: 5px 0; color: #000 !important;">ИСПОЛЬЗОВАНИЯ РАБОЧЕГО ВРЕМЕНИ И РАСЧЕТА ЗАРАБОТНОЙ ПЛАТЫ ЗА ${monthNameRu[month]} ${year} года</p>
                <div style="display: flex; justify-content: center; gap: 20px; font-weight: 800; font-size: 1.1rem; border-top: 2px solid #000; padding-top: 10px; width: 60%; margin: 10px auto; color: #000 !important;">
                    <span>Xodimlar soni: ${employees.length} ta</span>
                    <span>Bo'lim: ${currentTimesheetDept === 'all' ? "UMUMIY" : currentTimesheetDept}</span>
                </div>
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
        `;
    });

    html += `
                </tbody>
            </table>

            <div class="tabel-footer" style="margin-top: 40px; border-top: 3px solid #000; padding-top: 30px; color: black; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px; font-family: 'Times New Roman', serif;">
                <!-- 1. Tuzuvchi (Bo'linma) -->
                <div class="signature-block">
                    <div style="font-weight: 800; font-size: 1.1rem; margin-bottom: 15px; border-bottom: 2px solid #000; display: inline-block; padding: 0 10px;">BO'LINMA (TUZUVCHI)</div>
                    <div style="min-height: 120px; position: relative;">
                        ${signatures.tuzuvchi_name ? `
                            <div class="e-signature-stamp tuzuvchi-stamp">
                                <div class="stamp-qr" id="qr-tuzuvchi"></div>
                                <div class="stamp-details">
                                    <div class="stamp-label">TUZUVCHI IMZOLADI</div>
                                    <div class="stamp-name">${signatures.tuzuvchi_name}</div>
                                    <div class="stamp-date">${new Date(signatures.tuzuvchi_at).toLocaleString()}</div>
                                    <div class="stamp-serial">ERI: ${signatures.tuzuvchi_serial}</div>
                                </div>
                            </div>
                        ` : (window.Auth.currentUser.role === 'bolinma' || window.Auth.currentUser.role === 'admin') ? `
                            <div style="text-align: center; padding-top: 20px;">
                                <button onclick="signTimesheet('tuzuvchi')" class="sign-btn" style="width: 100%;">
                                    <i class="fas fa-pen-nib"></i> E-IMZO BILAN IMZOLASH
                                </button>
                            </div>
                        ` : '<div style="color: #94a3b8; font-size: 1rem; font-style: italic; text-align: center; padding-top: 30px;">Imzo kutilmoqda...</div>'}
                    </div>
                </div>

                <!-- 2. Xodimlar bo'limi -->
                <div class="signature-block">
                    <div style="font-weight: 800; font-size: 1.1rem; margin-bottom: 15px; border-bottom: 2px solid #000; display: inline-block; padding: 0 10px;">XODIMLAR BO'LIMI</div>
                    <div style="min-height: 120px; position: relative;">
                        ${signatures.xodimlar_name ? `
                            <div class="e-signature-stamp dept-stamp-hr">
                                <div class="stamp-qr" id="qr-xodimlar"></div>
                                <div class="stamp-details">
                                    <div class="stamp-label">XODIMLAR TASDIQLADI</div>
                                    <div class="stamp-name">${signatures.xodimlar_name}</div>
                                    <div class="stamp-date">${new Date(signatures.xodimlar_at).toLocaleString()}</div>
                                    <div class="stamp-serial">ERI: ${signatures.xodimlar_serial}</div>
                                </div>
                            </div>
                        ` : (window.Auth.currentUser.role === 'admin' || window.Auth.currentUser.departments?.includes('xodimlar')) ? `
                            <div style="text-align: center; padding-top: 20px;">
                                <button onclick="signTimesheet('xodimlar')" class="sign-btn checker" ${!signatures.tuzuvchi_name ? 'disabled title="Oldin bo\'linma imzolashi kerak"' : ''} style="width: 100%;">
                                    <i class="fas fa-user-shield"></i> HR TASDIG'I (ERI)
                                </button>
                            </div>
                        ` : '<div style="color: #94a3b8; font-size: 1rem; font-style: italic; text-align: center; padding-top: 30px;">HR tasdig\'i kutilmoqda...</div>'}
                    </div>
                </div>

                <!-- 3. Iqtisod bo'limi -->
                <div class="signature-block">
                    <div style="font-weight: 800; font-size: 1.1rem; margin-bottom: 15px; border-bottom: 2px solid #000; display: inline-block; padding: 0 10px;">IQTISOD BO'LIMI</div>
                    <div style="min-height: 120px; position: relative;">
                        ${signatures.iqtisod_name ? `
                            <div class="e-signature-stamp dept-stamp-iqtisod">
                                <div class="stamp-qr" id="qr-iqtisod"></div>
                                <div class="stamp-details">
                                    <div class="stamp-label">IQTISOD TASDIQLADI</div>
                                    <div class="stamp-name">${signatures.iqtisod_name}</div>
                                    <div class="stamp-date">${new Date(signatures.iqtisod_at).toLocaleString()}</div>
                                    <div class="stamp-serial">ERI: ${signatures.iqtisod_serial}</div>
                                </div>
                            </div>
                        ` : (window.Auth.currentUser.role === 'admin' || window.Auth.currentUser.departments?.includes('iqtisod')) ? `
                            <div style="text-align: center; padding-top: 20px;">
                                <button onclick="signTimesheet('iqtisod')" class="sign-btn checker" ${!signatures.xodimlar_name ? 'disabled title="Oldin Xodimlar bo\'limi tasdiqlashi kerak"' : ''} style="width: 100%;">
                                    <i class="fas fa-calculator"></i> IQTISOD TASDIG'I (ERI)
                                </button>
                            </div>
                        ` : '<div style="color: #94a3b8; font-size: 1rem; font-style: italic; text-align: center; padding-top: 30px;">Iqtisod tasdig\'i kutilmoqda...</div>'}
                    </div>
                </div>
            </div>
            
            ${signatures.rahbar_name ? `
                <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin-top: 20px; display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-truck-loading" style="font-size: 1.5rem; color: #10b981;"></i>
                    <div>
                        <div style="font-weight: bold; color: #064e3b;">Buxgalteriyaga yuborildi</div>
                        <div style="font-size: 0.85rem; color: #065f46;">Ushbu tabel rahbar tomonidan tasdiqlandi va hisob-kitob uchun buxgalteriyada mavjud.</div>
                    </div>
                </div>
            ` : ''}

            <div style="text-align: right; margin-top: 15px; font-size: 0.8rem; color: #64748b;">
                Tizim: Smart PCh Management | Vaqt: ${new Date().toLocaleString()}
            </div>
        </div>
    `;

    document.getElementById('timesheet-table-container').innerHTML = html;

    // Generate QR Codes
    setTimeout(() => {
        ['tuzuvchi', 'xodimlar', 'iqtisod', 'rahbar'].forEach(role => {
            const sig = signatures[`${role}_name`];
            const container = document.getElementById(`qr-${role}`);
            if (sig && container) {
                const serial = signatures[`${role}_serial`] || 'ERI-KEY';
                const verifyUrl = `https://smartpch.uz/verify/tabel?role=${role}&y=${year}&m=${month}&b=${currentTimesheetDept}&s=${serial}`;
                new QRCode(container, {
                    text: verifyUrl,
                    width: 45,
                    height: 45,
                    colorDark: role === 'tuzuvchi' ? "#0d9488" : (role === 'rahbar' ? "#92400e" : (role === 'iqtisod' ? "#7c3aed" : "#1e40af")),
                    colorLight: "white",
                    correctLevel: QRCode.CorrectLevel.M
                });
            }
        });
    }, 200);

    // Handle Finalization (Director signed)
    const isFinalized = !!signatures.rahbar_name;
    const saveBtn = document.getElementById('ts-save-btn');
    const archiveBtn = document.getElementById('ts-archive-btn');

    if (isFinalized) {
        if (saveBtn) saveBtn.style.display = 'none';
        if (archiveBtn) archiveBtn.style.display = 'flex';
        // Disable editing
        showToast('Tabel rahbar tomonidan tasdiqlangan (FINAL). O\'zgartirish mumkin emas.', 'info');
    } else {
        if (saveBtn) saveBtn.style.display = 'flex';
        if (archiveBtn) archiveBtn.style.display = 'none';
    }

    applyTabelStyles();

    // If finalized, disable any contentEditable in inputs
    if (isFinalized) {
        document.querySelectorAll('.ts-input').forEach(el => {
            el.setAttribute('contenteditable', 'false');
            el.style.cursor = 'default';
        });
    }
}

window.signTimesheet = async function (role) {
    if (currentTimesheetDept === 'all') {
        return showToast('Faqat bitta bo\'linma tanlangan holda imzolash mumkin', 'warning');
    }

    const labels = {
        'tuzuvchi': 'Bo\'linma',
        'xodimlar': 'Xodimlar bo\'limi',
        'iqtisod': 'Iqtisod bo\'limi',
        'rahbar': 'Korxona rahbari'
    };
    const roleName = labels[role] || 'Mas\'ul shaxs';
    if (!confirm(`${roleName} sifatida E-IMZO (ERI) orqali imzo qo'ymoqchimisiz?`)) return;

    try {
        // 1. Check E-IMZO Agent
        const agent = await EImzoHelper.checkAgent();
        if (!agent.success) {
            console.warn(agent.message);
            // In demo mode or if user allows, proceed with mock signing if agent is missing
        }

        // 2. Select Certificate (ERI Key)
        const certId = await EImzoHelper.showCertModal();
        if (!certId) return;

        // 3. Prepare data to sign (Hash of the table content)
        const tableData = document.querySelector('.official-ts-table').innerText;
        const dataToSign = `TABEL_${currentTimesheetDept}_${currentTimesheetMonth.getFullYear()}_${currentTimesheetMonth.getMonth()}_${tableData.substring(0, 100)}`;

        // 4. Perform Signing
        showToast('E-IMZO kaliti bilan imzolanmoqda...', 'info');
        const signature = await EImzoHelper.signData(certId, dataToSign);

        if (!signature || !signature.pkcs7) {
            throw new Error('Imzo hosil qilinmadi');
        }

        // 5. Send to Server for valid verification
        const res = await SmartUtils.fetchAPI('/timesheet/sign', {
            method: 'POST',
            body: JSON.stringify({
                year: currentTimesheetMonth.getFullYear(),
                month: currentTimesheetMonth.getMonth(),
                bolinmaId: currentTimesheetDept,
                role: role,
                signature: signature.pkcs7,
                certSerial: certId
            })
        });

        if (res) {
            showToast('Tabel E-IMZO orqali muvaffaqiyatli imzolandi!', 'success');
            renderTimesheetTable();
        }
    } catch (e) {
        showToast('Imzolashda xatolik: ' + e.message, 'error');
        console.error(e);
    }
};

// Monthly Monitoring / Archive Summary
async function renderTimesheetMonitor() {
    const date = currentTimesheetMonth;
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

    showToast(`${monthNames[month]} oyi monitori yuklanmoqda...`, 'info');

    // Get all departments (Safe access)
    const subdivisions = (window.INITIAL_DATA && (window.INITIAL_DATA.bolinmaData || window.INITIAL_DATA.subdivisions)) || [];
    const container = document.getElementById('timesheet-table-container');

    // Fetch all signatures for this month
    let allSigs = {};
    try {
        allSigs = await SmartUtils.fetchAPI(`/timesheet/signatures/all?year=${year}&month=${month}`);
    } catch (e) {
        console.warn('Could not fetch all signatures, using individual fetch loop');
    }

    let html = `
        <div class="tabel-wrapper" style="width: 100%; padding: 20px; color: #000 !important; font-family: 'Times New Roman', serif; box-sizing: border-box; background: white;">
            <div style="text-align: center; margin-bottom: 20px; color: #000 !important;">
                <h2 style="color: #000 !important; font-weight: 950; font-size: 2.2rem; text-shadow: none; margin: 0;">OYLIK TABEL MONITORINGI</h2>
                <p style="color: #000 !important; font-weight: 800; font-size: 1.1rem; margin-top: 5px;">${monthNames[month]} ${year} yili uchun barcha bo'limlar holati</p>
            </div>
            
            <table class="monitor-table" style="width: 100%; border-collapse: collapse; border: 2px solid #000;">
                <thead>
                    <tr style="background: #f8fafc; text-align: left; border-bottom: 3px solid #000;">
                        <th style="padding: 15px; color: #000 !important; font-weight: 900; border-right: 1px solid #000;">№</th>
                        <th style="padding: 15px; color: #000 !important; font-weight: 900; border-right: 1px solid #000;">BO'LIM / BO'LINMA NOMI</th>
                        <th style="padding: 15px; text-align: center; color: #000 !important; font-weight: 900; border-right: 1px solid #000;">TUZUVCHI</th>
                        <th style="padding: 15px; text-align: center; color: #000 !important; font-weight: 900; border-right: 1px solid #000;">XODIMLAR</th>
                        <th style="padding: 15px; text-align: center; color: #000 !important; font-weight: 900; border-right: 1px solid #000;">IQTISOD</th>
                        <th style="padding: 15px; text-align: center; color: #000 !important; font-weight: 900; border-right: 1px solid #000;">RAHBAR</th>
                        <th style="padding: 15px; text-align: center; color: #000 !important; font-weight: 900;">AMAL</th>
                    </tr>
                </thead>
                <tbody>
    `;

    for (let i = 0; i < subdivisions.length; i++) {
        const sub = subdivisions[i];
        const sigs = allSigs[sub.id] || {};

        const getStatusIcon = (signed) => signed ?
            `<i class="fas fa-check-circle" style="color: #059669; font-size: 1.4rem;" title="Imzolangan"></i>` :
            `<i class="fas fa-clock" style="color: #cbd5e1; font-size: 1.4rem;" title="Kutilmoqda"></i>`;

        html += `
            <tr style="border-bottom: 1px solid #000; transition: all 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='white'">
                <td style="padding: 15px; color: #000 !important; font-weight: 700; border-right: 1px solid #000;">${i + 1}</td>
                <td style="padding: 15px; font-weight: 900; color: #000 !important; border-right: 1px solid #000;">${sub.name}</td>
                <td style="padding: 15px; text-align: center; border-right: 1px solid #000;">${getStatusIcon(sigs.tuzuvchi_name)}</td>
                <td style="padding: 15px; text-align: center; border-right: 1px solid #000;">${getStatusIcon(sigs.xodimlar_name)}</td>
                <td style="padding: 15px; text-align: center; border-right: 1px solid #000;">${getStatusIcon(sigs.iqtisod_name)}</td>
                <td style="padding: 15px; text-align: center; border-right: 1px solid #000;">${getStatusIcon(sigs.rahbar_name)}</td>
                <td style="padding: 15px; text-align: center;">
                    <button class="ts-btn" style="padding: 6px 15px; font-size: 0.8rem; background: #000; color: white;" onclick="openTimesheet('${sub.id}')">
                        Ochish <i class="fas fa-external-link-alt" style="font-size: 0.7rem;"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    html += `
                </tbody>
            </table>
            
            <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: center; border-top: 3px solid #000; padding-top: 20px; color: #000 !important;">
                <div style="color: #000 !important; font-size: 1.1rem; font-weight: 800;">
                    Jami bo'limlar: <b>${subdivisions.length} ta</b>
                </div>
                <div style="display: flex; gap: 20px; font-size: 1rem; color: #000 !important; font-weight: 700;">
                    <span><i class="fas fa-check-circle" style="color: #059669;"></i> Imzolangan</span>
                    <span><i class="fas fa-clock" style="color: #cbd5e1;"></i> Jarayonda</span>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    document.getElementById('ts-dept-title').innerText = "(Umumiy Monitoring)";

    // Hide unnecessary tools
    const saveBtn = document.getElementById('ts-save-btn');
    const archiveBtn = document.getElementById('ts-archive-btn');
    if (saveBtn) saveBtn.style.display = 'none';
    if (archiveBtn) archiveBtn.style.display = 'none';
}

function applyTabelStyles() {
    const styleId = 'official-tabel-styles';
    let style = document.getElementById(styleId);
    if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
    }

    style.innerHTML = `
        .timesheet-content {
            padding: 5px;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            background: #0f172a;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
        }
        .timesheet-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(10, 10, 15, 0.98);
            z-index: 100020 !important;
            display: none;
            flex-direction: column;
            padding: 0; /* Bo'sh joyni yo'qotish */
            box-sizing: border-box;
            backdrop-filter: blur(15px);
        }
        .tabel-wrapper {
            background: white;
            padding: 0;
            margin: 0;
            width: 100%;
            min-width: 100%;
            position: relative;
            box-sizing: border-box;
            align-self: stretch;
            flex: 1;
        }
        .official-ts-table {
            width: 100% !important;
            border-collapse: collapse;
            border: 3.5px solid black;
            font-family: 'Times New Roman', serif;
            background: white;
            color: #000 !important;
            table-layout: fixed;
            margin: 0;
        }
        .official-ts-table th, .official-ts-table td {
            border: 1.5px solid black;
            height: 45px;
            padding: 2px;
            color: #000 !important;
            font-size: 0.85rem;
            text-align: center;
            vertical-align: middle;
            font-weight: 700;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .official-ts-table thead th {
            background: #f1f5f9;
            font-weight: 950;
            color: #000 !important;
            font-size: 0.75rem;
            text-transform: uppercase;
        }
        .v-text {
            height: 200px;
            vertical-align: bottom !important;
            padding: 0 !important;
        }
        .v-text div {
            writing-mode: vertical-rl;
            transform: rotate(180deg);
            white-space: nowrap;
            display: inline-block;
            text-align: center;
            width: 100%;
            height: 100%;
            font-size: 0.75rem;
            font-weight: 900;
            padding: 10px 0;
            letter-spacing: 0.5px;
            color: #000 !important;
            line-height: 1.2;
        }
        .ts-input {
            width: 100%;
            height: 100%;
            outline: none;
            font-weight: 900;
            font-size: 1.1rem;
            color: #000 !important;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        .ts-input:focus {
            background: #e0f2fe;
            box-shadow: inset 0 0 0 3px #0ea5e9;
        }
        
        /* Modern Sign Button */
        .sign-btn {
            background: linear-gradient(135deg, #2563eb, #1e40af);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 800;
            letter-spacing: 0.5px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            text-transform: uppercase;
        }
        .sign-btn:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
            filter: brightness(1.1);
        }
        .sign-btn.director { background: linear-gradient(135deg, #ea580c, #9a3412); box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3); }
        .sign-btn.checker { background: linear-gradient(135deg, #059669, #064e3b); box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); }

        @media print {
            body { background: white !important; }
            .timesheet-content { padding: 0 !important; background: white !important; }
            .tabel-wrapper { 
                padding: 0 !important; 
                margin: 0 !important; 
                box-shadow: none !important; 
                border-radius: 0 !important;
                width: 100% !important;
                max-width: none !important;
            }
            .official-ts-table { 
                width: 100% !important; 
                page-break-inside: auto;
            }
            thead { display: table-header-group; }
        }
    `;
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

// Export to Excel using SheetJS
window.exportTimesheetToExcel = function () {
    const table = document.querySelector('.official-ts-table');
    if (!table) return showToast('Jadvak topilmadi', 'error');

    try {
        const wb = XLSX.utils.table_to_book(table, { raw: true });
        const monthName = document.getElementById('ts-current-date').innerText;
        const deptName = currentTimesheetDept === 'all' ? 'barcha_bolimlar' : currentTimesheetDept;

        XLSX.writeFile(wb, `Tabel_${deptName}_${monthName.replace(' ', '_')}.xlsx`);
        showToast('Excel fayl yuklab olindi', 'success');
    } catch (e) {
        console.error('Excel export error:', e);
        showToast('Eksportda xatolik yuz berdi', 'error');
    }
};

// Archive finalized timesheet to PDF (A4 Landscape / Albom)
window.archiveTimesheetToPDF = function () {
    const element = document.querySelector('.tabel-wrapper');
    if (!element) return showToast('Tabel topilmadi', 'error');

    const month = document.getElementById('ts-current-date').innerText;
    const dept = currentTimesheetDept === 'all' ? 'UMUMIY' : currentTimesheetDept;
    const filename = `Tabel_Arxiv_${dept}_${month.replace(' ', '_')}.pdf`;

    // Professional A4 Landscape optimization
    const opt = {
        margin: [5, 5, 5, 5],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true,
            windowWidth: 2600 // Force high-res capture width
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape', compress: true }
    };

    showToast('Tabel A4 (Albom) formatida arxivga saqlanmoqda...', 'info');

    html2pdf().set(opt).from(element).toPdf().get('pdf').then(async (pdf) => {
        const blob = pdf.output('blob');

        // 1. Local download (Classic)
        pdf.save();

        // 2. Upload to server archive (Persistent)
        const formData = new FormData();
        formData.append('file', blob, filename);
        formData.append('module', 'timesheet_archive');
        formData.append('bolinma_id', currentTimesheetDept);
        formData.append('department', currentTimesheetDept);
        formData.append('status', 'approved'); // Auto-approved as it's signed byproduct

        try {
            await fetch('/api/files/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.Auth.token}`
                },
                body: formData
            });
            showToast('Tabel muvaffaqiyatli arxivlandi (A4 + Tizim)!', 'success');
        } catch (e) {
            console.error('Server archive error:', e);
            showToast('Fayl yuklab olindi, lekin tizimga saqlashda xatolik', 'warning');
        }
    }).catch(err => {
        console.error('Archive error:', err);
        showToast('Arxivlashda xatolik yuz berdi', 'error');
    });
};

// Global Exports
window.openTimesheet = openTimesheet;
window.closeTimesheet = closeTimesheet;
window.changeTimesheetMonth = changeTimesheetMonth;
window.archiveTimesheetToPDF = archiveTimesheetToPDF;
