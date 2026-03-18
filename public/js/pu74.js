// =====================================================
// PU-74: VIRTUAL JURNAL — Formulalar, Imzo, Chop etish
// Yuridik kuchga ega elektron hujjat
// =====================================================

let pu74CurrentFile = '';
let pu74Workbook = null;
let pu74ActiveSheet = 0;
let pu74EditedCells = {};
let pu74FormulaMap = {}; // {sheetIndex: {cellRef: formulaStr}}
let pu74Signatures = {}; // {role: dataURL}
// Department identifier (e.g., 'iqtisod') – used for saving the Excel file in a sub‑folder
let pu74CurrentDept = '';


// ==========================================
// 1. BRIGADA TANLASH
// ==========================================
function openPU74Window(deptId) {
    // Save department for later export (e.g., 'iqtisod')
    pu74CurrentDept = deptId || '';
    let modal = document.getElementById('pu74-selection-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'pu74-selection-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(240,247,255,0.7);backdrop-filter:blur(20px);z-index:10020;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);';

    modal.innerHTML = `
        <div style="background:#ffffff;border:1px solid rgba(31,38,135,0.1);border-radius:32px;padding:50px;width:650px;text-align:center;box-shadow:0 30px 70px rgba(31,38,135,0.15);transform:translateY(30px);transition:transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);position:relative;overflow:hidden;">
            <div style="position:absolute;top:0;left:0;width:100%;height:6px;background:linear-gradient(90deg, #d4af37, #b8860b);"></div>
            <div style="font-size:3rem;margin-bottom:15px;"><i class="fas fa-book-open" style="color:#d4af37;"></i></div>
            <h2 style="margin:0 0 10px;font-size:2.2rem;color:#1e293b;font-weight:900;letter-spacing:1px;">PU-74 JURNALI</h2>
            <p style="color:#64748b;margin-bottom:40px;font-size:1.1rem;font-weight:600;">Bajarilgan ishlar dalolatnomasi — Yuridik hujjat</p>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;">
                <button onclick="loadPU74Brigade('1-brigada.xlsx','1-BRIGADA')" class="pu74-brigade-btn" style="background:linear-gradient(135deg,#60a5fa,#2563eb);border:none;padding:35px 20px;border-radius:24px;cursor:pointer;color:white;font-weight:800;font-size:1.1rem;display:flex;flex-direction:column;align-items:center;gap:15px;transition:all 0.3s;box-shadow:0 10px 20px rgba(37,99,235,0.15);">
                    <div style="width:60px;height:60px;background:rgba(255,255,255,0.2);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;backdrop-filter:blur(5px);">1</div>1-BRIGADA
                </button>
                <button onclick="loadPU74Brigade('2-brigada.xlsx','2-BRIGADA')" class="pu74-brigade-btn" style="background:linear-gradient(135deg,#34d399,#059669);border:none;padding:35px 20px;border-radius:24px;cursor:pointer;color:white;font-weight:800;font-size:1.1rem;display:flex;flex-direction:column;align-items:center;gap:15px;transition:all 0.3s;box-shadow:0 10px 20px rgba(16,185,129,0.15);">
                    <div style="width:60px;height:60px;background:rgba(255,255,255,0.2);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;backdrop-filter:blur(5px);">2</div>2-BRIGADA
                </button>
                <button onclick="loadPU74Brigade('3-brigada.xlsx','3-BRIGADA')" class="pu74-brigade-btn" style="background:linear-gradient(135deg,#818cf8,#4f46e5);border:none;padding:35px 20px;border-radius:24px;cursor:pointer;color:white;font-weight:800;font-size:1.1rem;display:flex;flex-direction:column;align-items:center;gap:15px;transition:all 0.3s;box-shadow:0 10px 20px rgba(79,70,229,0.15);">
                    <div style="width:60px;height:60px;background:rgba(255,255,255,0.2);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;backdrop-filter:blur(5px);">3</div>3-BRIGADA
                </button>
            </div>
            <button onclick="closePU74Selection()" style="margin-top:40px;background:rgba(148,163,184,0.1);border:1.5px solid rgba(148,163,184,0.2);color:#475569;padding:14px 40px;border-radius:18px;cursor:pointer;font-weight:700;transition:0.2s;">BEKOR QILISH</button>
        </div>
    `;
    document.body.appendChild(modal);
    requestAnimationFrame(() => { modal.style.opacity = '1'; });
}

function closePU74Selection() {
    const m = document.getElementById('pu74-selection-modal');
    if (m) { m.style.opacity = '0'; setTimeout(() => m.remove(), 300); }
}

// ==========================================
// 2. EXCEL YUKLASH
// ==========================================
function loadPU74Brigade(fileName, title) {
    closePU74Selection();
    pu74CurrentFile = fileName;
    pu74ActiveSheet = 0;
    pu74FormulaMap = {};

    // Oldingi tahrirlarni yuklash
    try { pu74EditedCells = JSON.parse(localStorage.getItem('pu74_edits_' + fileName) || '{}'); } catch (e) { pu74EditedCells = {}; }
    try { pu74Signatures = JSON.parse(localStorage.getItem('pu74_signs_' + fileName) || '{}'); } catch (e) { pu74Signatures = {}; }

    let viewer = document.getElementById('pu74-excel-viewer');
    if (viewer) viewer.remove();

    viewer = document.createElement('div');
    viewer.id = 'pu74-excel-viewer';
    viewer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#f0ebe3;z-index:10021;display:flex;flex-direction:column;';

    viewer.innerHTML = `
        <div id="pu74-topbar" style="height:70px;min-height:70px;background:linear-gradient(90deg, #1e293b 0%, #334155 100%);display:flex;align-items:center;justify-content:space-between;padding:0 30px;z-index:10;box-shadow:0 4px 15px rgba(0,0,0,0.2);">
            <div style="display:flex;align-items:center;gap:15px;">
                <div style="width:40px;height:40px;background:rgba(212,175,55,0.1);border-radius:12px;display:flex;align-items:center;justify-content:center;">
                    <i class="fas fa-book-open" style="font-size:1.3rem;color:#d4af37;"></i>
                </div>
                <div style="display:flex;flex-direction:column;">
                    <span style="font-weight:900;font-size:1.1rem;color:white;letter-spacing:0.5px;">${title} — PU-74</span>
                    <span style="font-size:0.75rem;color:rgba(255,255,255,0.5);font-weight:600;">
                        <i class="fas fa-balance-scale" style="color: #d4af37; margin-right: 5px;"></i> ELEKTRON YURIDIK HUJJAT
                    </span>
                </div>
            </div>
            <div style="display:flex;gap:12px;align-items:center;">
                <button id="pu74-voice-btn" onclick="togglePU74ExcelVoice()" class="pu74-toolbar-btn" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;padding:10px 18px;border-radius:12px;font-weight:700;cursor:pointer;transition:0.2s;display:flex;align-items:center;gap:8px;">
                    <i class="fas fa-microphone"></i> OVOZLI KIRITISH
                </button>
                <button onclick="recalcAllFormulas()" class="pu74-toolbar-btn" style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);color:#818cf8;padding:10px 18px;border-radius:12px;font-weight:700;cursor:pointer;transition:0.2s;display:flex;align-items:center;gap:8px;">
                    <i class="fas fa-calculator"></i> HISOB-KITOB
                </button>
                <button onclick="window.print()" class="pu74-toolbar-btn" style="background:rgba(248,250,252,0.1);border:1.5px solid rgba(248,250,252,0.2);color:white;padding:10px 18px;border-radius:12px;font-weight:700;cursor:pointer;transition:0.2s;display:flex;align-items:center;gap:8px;">
                    <i class="fas fa-print"></i> CHOP ETISH
                </button>
                <button onclick="savePU74Edits()" class="pu74-toolbar-btn" style="background:linear-gradient(135deg, #d4af37, #b8860b);border:none;color:white;padding:10px 25px;border-radius:12px;font-weight:800;cursor:pointer;transition:0.3s;box-shadow:0 4px 12px rgba(212,175,55,0.2);display:flex;align-items:center;gap:8px;">
                    <i class="fas fa-save"></i> SAQLASH
                </button>
                <button onclick="closePU74Viewer()" class="pu74-toolbar-btn" style="background:rgba(239, 68, 68, 0.1);color:#ef4444;border:none;width:40px;height:40px;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:0.2s;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        <div id="pu74-sheet-tabs" style="display:flex;gap:0;background:#f8fafc;border-bottom:1px solid rgba(31,38,135,0.08);padding:0 20px;overflow-x:auto;min-height:50px;"></div>
        <div id="pu74-journal-content" style="flex:1;overflow:auto;padding:40px;display:flex;flex-direction:column;align-items:center;gap:30px;background:#f1f5f9;">
            <div id="pu74-loading" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100px;color:#64748b;">
                <div style="width:100px;height:100px;border-radius:50%;border:4px solid rgba(37,99,235,0.1);border-top-color: #ffd700;animation:pu74-spin 1s linear infinite;"></div>
                <style>@keyframes pu74-spin { 0% { transform:rotate(0deg); } 100% { transform:rotate(360deg); } }</style>
                <div style="font-size:1.3rem;margin-top:30px;font-weight:700;">Jurnal yuklanmoqda...</div>
            </div>
        </div>`;

    document.body.appendChild(viewer);

    fetch(fileName).then(r => {
        if (!r.ok) throw new Error('Fayl topilmadi: ' + fileName);
        return r.arrayBuffer();
    }).then(buf => {
        if (typeof XLSX === 'undefined') throw new Error("SheetJS kutubxonasi yuklanmagan!");
        pu74Workbook = XLSX.read(buf, { type: 'array', cellFormula: true, cellStyles: true });
        buildFormulaMap();
        renderPU74SheetTabs();
        renderPU74Sheet(0);
    }).catch(err => {
        document.getElementById('pu74-loading').innerHTML = `
            <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:#e74c3c;margin-bottom:20px;"></i>
            <div style="font-size:1.2rem;color:#c0392b;">${err.message}</div>
            <label style="margin-top:20px;background:#217346;color:white;padding:12px 30px;border-radius:8px;cursor:pointer;">
                <i class="fas fa-upload"></i> Faylni yuklash
                <input type="file" accept=".xlsx,.xls" style="display:none;" onchange="handlePU74FileUpload(this)">
            </label>`;
    });
}

// ==========================================
// 3. FORMULA XARITASINI YARATISH
// ==========================================
function buildFormulaMap() {
    if (!pu74Workbook) return;
    pu74FormulaMap = {};
    pu74Workbook.SheetNames.forEach((name, si) => {
        const sheet = pu74Workbook.Sheets[name];
        if (!sheet || !sheet['!ref']) return;
        pu74FormulaMap[si] = {};
        const range = XLSX.utils.decode_range(sheet['!ref']);
        for (let R = range.s.r; R <= range.e.r; R++) {
            for (let C = range.s.c; C <= range.e.c; C++) {
                const ref = XLSX.utils.encode_cell({ c: C, r: R });
                const cell = sheet[ref];
                if (cell && cell.f) {
                    pu74FormulaMap[si][ref] = cell.f;
                }
            }
        }
    });
}

// ==========================================
// 4. SHEET TABLAR
// ==========================================
function renderPU74SheetTabs() {
    const tc = document.getElementById('pu74-sheet-tabs');
    if (!tc || !pu74Workbook) return;
    tc.innerHTML = pu74Workbook.SheetNames.map((name, idx) => {
        const a = idx === pu74ActiveSheet;
        const dn = name.length > 18 ? name.substring(0, 16) + '..' : name;
        return `<button onclick="renderPU74Sheet(${idx})" style="padding:0 25px;border:none;cursor:pointer;font-size:0.85rem;white-space:nowrap;transition:all 0.3s;background:${a ? '#fff' : 'transparent'};color:${a ? '#2563eb' : '#64748b'};font-weight:${a ? '800' : '600'};border-bottom:${a ? '3px solid #2563eb' : '3px solid transparent'};height:100%;text-transform:uppercase;letter-spacing:0.5px;">${dn}</button>`;
    }).join('');
}

// ==========================================
// 5. SHEET RENDER (Formulalar bilan)
// ==========================================
function renderPU74Sheet(si) {
    if (!pu74Workbook) return;
    pu74ActiveSheet = si;
    renderPU74SheetTabs();

    const sn = pu74Workbook.SheetNames[si];
    const sheet = pu74Workbook.Sheets[sn];
    const cd = document.getElementById('pu74-journal-content');

    if (!sheet || !sheet['!ref']) {
        cd.innerHTML = '<div style="padding:40px;text-align:center;color:#999;">Bu bet bo\'sh</div>';
        return;
    }

    const range = XLSX.utils.decode_range(sheet['!ref']);
    const merges = sheet['!merges'] || [];
    const formulas = pu74FormulaMap[si] || {};

    // FAQAT 1-bet (index 0) muqova sahifa — boshqa betlarda to'liq kataklar ko'rinsin
    const isCoverPage = (si === 0);

    // Merge map
    const mm = {};
    merges.forEach(m => {
        const rs = m.e.r - m.s.r + 1, cs = m.e.c - m.s.c + 1;
        for (let r = m.s.r; r <= m.e.r; r++)
            for (let c = m.s.c; c <= m.e.c; c++)
                mm[r + '_' + c] = (r === m.s.r && c === m.s.c) ? { rowspan: rs, colspan: cs } : 'skip';
    });

    let html = '';
    for (let R = range.s.r; R <= range.e.r; R++) {
        html += '<tr>';
        for (let C = range.s.c; C <= range.e.c; C++) {
            const mk = R + '_' + C;
            if (mm[mk] === 'skip') continue;

            const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
            const cell = sheet[cellRef];
            const editKey = si + '_' + R + '_' + C;
            const hasFormula = !!formulas[cellRef];

            // Qiymatni aniqlash
            let val = '';
            if (pu74EditedCells[editKey] !== undefined) {
                val = pu74EditedCells[editKey];
            } else if (cell) {
                if (cell.w) val = cell.w;
                else if (cell.v !== undefined) {
                    if (typeof cell.v === 'number') {
                        val = cell.v % 1 !== 0 ? cell.v.toFixed(2) : String(cell.v);
                    } else {
                        val = String(cell.v);
                    }
                }
            }

            const trimVal = val.trim();
            const isEmpty = trimVal === '';

            // TD CSS klasslari
            let cls = '';
            if (hasFormula) {
                const isCrossSheet = formulas[cellRef].includes("'");
                cls += isCrossSheet ? ' pu74-formula-cell pu74-cross-formula' : ' pu74-formula-cell';
            } else if (isCoverPage && isEmpty) {
                // FAQAT 1-betda bo'sh kataklar chegarasiz bo'ladi
                cls += ' pu74-empty-cell';
            } else if (isCoverPage && trimVal.length > 5) {
                // 1-betdagi matnli yozuvlar forma uslubida
                cls += ' pu74-text-cell';
            }
            // Boshqa betlarda hamma katak oddiy chegarali bo'ladi (excel kabi)

            if (cell && cell.t === 'n') cls += ' pu74-num-cell';

            let spanStr = '';
            const mi = mm[mk];
            if (mi && typeof mi === 'object') {
                if (mi.rowspan > 1) spanStr += ` rowspan="${mi.rowspan}"`;
                if (mi.colspan > 1) spanStr += ` colspan="${mi.colspan}"`;
            }

            const editable = hasFormula ? 'false' : 'true';
            const tooltip = hasFormula ? ` title="Formula: =${formulas[cellRef]}"` : '';

            html += `<td${spanStr} class="${cls}"${tooltip} contenteditable="${editable}" data-r="${R}" data-c="${C}" data-si="${si}" data-ref="${cellRef}" onfocus="this.classList.add('editing')" onblur="onPU74CellEdit(this);this.classList.remove('editing')">${val}</td>`;
        }
        html += '</tr>';
    }

    // IMZO va sahifa
    const signatureHTML = buildSignatureHTML();
    const pageClass = isCoverPage ? 'pu74-paper-page pu74-cover-page' : 'pu74-paper-page';

    cd.innerHTML = `
        <div class="${pageClass}">
            <table class="pu74-journal-table">${html}</table>
            ${signatureHTML}
        </div>
    `;

    initSignatureCanvases();
}

// ==========================================
// 6. IMZO (ELEKTRON SIGNATURE) TIZIMI
// ==========================================
function buildSignatureHTML() {
    const roles = [
        { id: 'pdb', label: 'ПДБ (Yo\'l boshlig\'i)' },
        { id: 'pd', label: 'ПД (Bo\'linma boshlig\'i)' },
        { id: 'normировщик', label: 'Normировщик' },
        { id: 'brigadir', label: 'Brigadir' }
    ];

    return `
        <div class="pu74-signature-area">
            ${roles.map(r => `
                <div class="pu74-signature-box">
                    <label>${r.label}</label>
                    <canvas class="pu74-signature-canvas${pu74Signatures[r.id] ? ' signed' : ''}" data-role="${r.id}" width="200" height="60"></canvas>
                    <button class="pu74-sign-btn" onclick="clearSignature('${r.id}')"><i class="fas fa-eraser"></i> Tozalash</button>
                </div>
            `).join('')}
        </div>
    `;
}

function initSignatureCanvases() {
    document.querySelectorAll('.pu74-signature-canvas').forEach(canvas => {
        const role = canvas.getAttribute('data-role');
        const ctx = canvas.getContext('2d');

        // Oldindan saqlangan imzoni yuklash
        if (pu74Signatures[role]) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0);
            img.src = pu74Signatures[role];
        }

        let drawing = false;
        canvas.addEventListener('mousedown', e => { drawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); });
        canvas.addEventListener('mousemove', e => {
            if (!drawing) return;
            ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#1a1a2e';
            ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke();
        });
        canvas.addEventListener('mouseup', () => { drawing = false; saveSignature(role, canvas); });
        canvas.addEventListener('mouseleave', () => { drawing = false; });

        // Touch support
        canvas.addEventListener('touchstart', e => { e.preventDefault(); drawing = true; const t = e.touches[0]; const r = canvas.getBoundingClientRect(); ctx.beginPath(); ctx.moveTo(t.clientX - r.left, t.clientY - r.top); });
        canvas.addEventListener('touchmove', e => {
            e.preventDefault(); if (!drawing) return;
            const t = e.touches[0]; const r = canvas.getBoundingClientRect();
            ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#1a1a2e';
            ctx.lineTo(t.clientX - r.left, t.clientY - r.top); ctx.stroke();
        });
        canvas.addEventListener('touchend', () => { drawing = false; saveSignature(role, canvas); });
    });
}

function saveSignature(role, canvas) {
    pu74Signatures[role] = canvas.toDataURL();
    canvas.classList.add('signed');
}

window.clearSignature = function (role) {
    const canvas = document.querySelector(`.pu74-signature-canvas[data-role="${role}"]`);
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.classList.remove('signed');
        delete pu74Signatures[role];
    }
};

// ==========================================
// 7. FORMULA ENGINE (Cross-sheet va hamma turdagi formulalar)
// ==========================================

// Sheet nomidan index topish
function getSheetIndex(sheetName) {
    if (!pu74Workbook) return -1;
    for (let i = 0; i < pu74Workbook.SheetNames.length; i++) {
        if (pu74Workbook.SheetNames[i] === sheetName) return i;
    }
    return -1;
}

function getCellNumericValue(si, cellRef) {
    const sheet = pu74Workbook.Sheets[pu74Workbook.SheetNames[si]];
    if (!sheet) return 0;
    const decoded = XLSX.utils.decode_cell(cellRef);
    const editKey = si + '_' + decoded.r + '_' + decoded.c;

    if (pu74EditedCells[editKey] !== undefined) {
        const v = parseFloat(pu74EditedCells[editKey]);
        return isNaN(v) ? 0 : v;
    }

    // Agar bu katak o'zi formula bo'lsa, avval hisoblash kerak
    const formulas = pu74FormulaMap[si] || {};
    if (formulas[cellRef]) {
        const result = evaluateFormula(si, formulas[cellRef]);
        if (result !== null) return result;
    }

    const cell = sheet[cellRef];
    if (!cell) return 0;
    if (typeof cell.v === 'number') return cell.v;
    const p = parseFloat(cell.v);
    return isNaN(p) ? 0 : p;
}

function evaluateFormula(si, formula) {
    // ===== CROSS-SHEET: +'2-3 бетлар'!C41 =====
    const crossMatch = formula.match(/^\+?'([^']+)'!([A-Z]+\d+)$/i);
    if (crossMatch) {
        const targetSheetName = crossMatch[1];
        const targetCellRef = crossMatch[2];
        const targetSI = getSheetIndex(targetSheetName);
        if (targetSI >= 0) {
            return getCellNumericValue(targetSI, targetCellRef);
        }
        return 0;
    }

    // ===== SUM(range) — SUM(C11:R12) =====
    const sumMatch = formula.match(/^SUM\(([A-Z]+\d+):([A-Z]+\d+)\)$/i);
    if (sumMatch) {
        const start = XLSX.utils.decode_cell(sumMatch[1]);
        const end = XLSX.utils.decode_cell(sumMatch[2]);
        let total = 0;
        for (let r = start.r; r <= end.r; r++) {
            for (let c = start.c; c <= end.c; c++) {
                total += getCellNumericValue(si, XLSX.utils.encode_cell({ c, r }));
            }
        }
        return total;
    }

    // ===== SUM(AB5:AB35) with $ signs =====
    const sumRangeClean = formula.match(/^SUM\(([\$]?[A-Z]+[\$]?\d+):([\$]?[A-Z]+[\$]?\d+)\)$/i);
    if (sumRangeClean) {
        const start = XLSX.utils.decode_cell(sumRangeClean[1].replace(/\$/g, ''));
        const end = XLSX.utils.decode_cell(sumRangeClean[2].replace(/\$/g, ''));
        let total = 0;
        for (let r = start.r; r <= end.r; r++) {
            for (let c = start.c; c <= end.c; c++) {
                total += getCellNumericValue(si, XLSX.utils.encode_cell({ c, r }));
            }
        }
        return total;
    }

    // ===== SUM(cell,cell,...) — SUM(C11,C13,C15,...) =====
    const sumListMatch = formula.match(/^SUM\(([A-Z0-9,\s]+)\)$/i);
    if (sumListMatch) {
        const refs = sumListMatch[1].split(',').map(s => s.trim());
        let total = 0;
        refs.forEach(ref => { total += getCellNumericValue(si, ref); });
        return total;
    }

    // ===== Addition: +A1+B1+C1+... =====
    const addMatch = formula.match(/^\+?([A-Z]+\d+(?:\+[A-Z]+\d+)+)$/i);
    if (addMatch) {
        const refs = addMatch[1].split('+');
        let total = 0;
        refs.forEach(ref => { total += getCellNumericValue(si, ref.trim()); });
        return total;
    }

    // ===== Multiplication/Division: +J5*D5/G5 =====
    const mulDivMatch = formula.match(/^\+?([A-Z]+\d+)\*(\$?[A-Z]+\$?\d+)\/(\$?[A-Z]+\$?\d+)$/i);
    if (mulDivMatch) {
        const a = getCellNumericValue(si, mulDivMatch[1].replace(/\$/g, ''));
        const b = getCellNumericValue(si, mulDivMatch[2].replace(/\$/g, ''));
        const c = getCellNumericValue(si, mulDivMatch[3].replace(/\$/g, ''));
        return c !== 0 ? (a * b / c) : 0;
    }

    // ===== Division*Multiplication: +K5/$G5*$D5 =====
    const divMulMatch = formula.match(/^\+?(\$?[A-Z]+\$?\d+)\/(\$?[A-Z]+\$?\d+)\*(\$?[A-Z]+\$?\d+)$/i);
    if (divMulMatch) {
        const a = getCellNumericValue(si, divMulMatch[1].replace(/\$/g, ''));
        const b = getCellNumericValue(si, divMulMatch[2].replace(/\$/g, ''));
        const c = getCellNumericValue(si, divMulMatch[3].replace(/\$/g, ''));
        return b !== 0 ? (a / b * c) : 0;
    }

    // ===== Cross-sheet SUM: =SUM('sheet'!A1:A10) =====
    const crossSumMatch = formula.match(/^SUM\('([^']+)'!([A-Z]+\d+):([A-Z]+\d+)\)$/i);
    if (crossSumMatch) {
        const tsi = getSheetIndex(crossSumMatch[1]);
        if (tsi >= 0) {
            const start = XLSX.utils.decode_cell(crossSumMatch[2]);
            const end = XLSX.utils.decode_cell(crossSumMatch[3]);
            let total = 0;
            for (let r = start.r; r <= end.r; r++) {
                for (let c = start.c; c <= end.c; c++) {
                    total += getCellNumericValue(tsi, XLSX.utils.encode_cell({ c, r }));
                }
            }
            return total;
        }
    }

    // ===== Multiplication with cross-sheet: +'sheet'!K6/$G$7*$J$7 =====
    const crossDivMul = formula.match(/^\+?'([^']+)'!([A-Z]+\d+)\/(\$?[A-Z]+\$?\d+)\*(\$?[A-Z]+\$?\d+)$/i);
    if (crossDivMul) {
        const tsi = getSheetIndex(crossDivMul[1]);
        if (tsi >= 0) {
            const a = getCellNumericValue(tsi, crossDivMul[2]);
            const b = getCellNumericValue(si, crossDivMul[3].replace(/\$/g, ''));
            const c = getCellNumericValue(si, crossDivMul[4].replace(/\$/g, ''));
            return b !== 0 ? (a / b * c) : 0;
        }
    }

    return null; // Tanilmagan formula
}

window.recalcAllFormulas = function () {
    if (!pu74Workbook) return;
    let count = 0;

    // Barcha sheetlardagi formulalarni hisoblash (cross-sheet ham)
    // Avval oddiy formulalar, keyin cross-sheet
    for (let pass = 0; pass < 2; pass++) {
        Object.keys(pu74FormulaMap).forEach(si => {
            const formulas = pu74FormulaMap[si];
            Object.keys(formulas).forEach(cellRef => {
                const formula = formulas[cellRef];
                const isCross = formula.includes("'");
                // 1-pass: oddiy, 2-pass: cross-sheet
                if (pass === 0 && isCross) return;
                if (pass === 1 && !isCross) return;

                const result = evaluateFormula(parseInt(si), formula);
                if (result !== null) {
                    const decoded = XLSX.utils.decode_cell(cellRef);
                    // Hozirgi ko'rinayotgan sheet bo'lsagina DOM yangilanadi
                    if (parseInt(si) === pu74ActiveSheet) {
                        const td = document.querySelector(`td[data-si="${si}"][data-r="${decoded.r}"][data-c="${decoded.c}"]`);
                        if (td) {
                            const display = result % 1 !== 0 ? result.toFixed(2) : String(result);
                            td.innerText = display;
                            td.classList.add('pu74-recalc-flash');
                            setTimeout(() => td.classList.remove('pu74-recalc-flash'), 800);
                        }
                    }
                    // Workbook ichidagi qiymatni ham yangilash
                    const sheet = pu74Workbook.Sheets[pu74Workbook.SheetNames[parseInt(si)]];
                    if (sheet[cellRef]) {
                        sheet[cellRef].v = result;
                        sheet[cellRef].w = result % 1 !== 0 ? result.toFixed(2) : String(result);
                    }
                    count++;
                }
            });
        });
    }

    if (window.SmartUtils) SmartUtils.showToast(count + ' ta formula hisoblandi (betlar aro ham)!', 'success');
    else alert(count + ' ta formula hisoblandi!');
};

// ==========================================
// 8. KATAK TAHRIRLASH
// ==========================================
function onPU74CellEdit(td) {
    const r = td.getAttribute('data-r');
    const c = td.getAttribute('data-c');
    const si = td.getAttribute('data-si');
    const ref = td.getAttribute('data-ref');
    const key = si + '_' + r + '_' + c;
    const newValue = td.innerText.trim();

    const sheet = pu74Workbook.Sheets[pu74Workbook.SheetNames[parseInt(si)]];
    const origCell = sheet[ref];
    const origValue = origCell ? (origCell.w || String(origCell.v || '')) : '';

    if (newValue !== origValue) {
        pu74EditedCells[key] = newValue;
        // Workbook ni ham yangilash
        if (sheet[ref]) {
            sheet[ref].v = isNaN(newValue) ? newValue : parseFloat(newValue);
            sheet[ref].w = newValue;
        }
        // Formulalarni qayta hisoblash
        autoRecalcDependents(parseInt(si), ref);
        // AVTOMATIK SAQLASH
        autoSavePU74();
    } else {
        delete pu74EditedCells[key];
    }
}

let pu74AutoSaveTimer = null;
function autoSavePU74() {
    if (pu74AutoSaveTimer) clearTimeout(pu74AutoSaveTimer);
    pu74AutoSaveTimer = setTimeout(() => {
        localStorage.setItem('pu74_edits_' + pu74CurrentFile, JSON.stringify(pu74EditedCells));
        // Visual feedback
        let badge = document.querySelector('.pu74-saved-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'pu74-saved-badge';
            document.body.appendChild(badge);
        }
        badge.innerHTML = '<i class="fas fa-check-circle"></i> Avtomatik saqlandi';
        badge.style.display = 'block';
        setTimeout(() => { badge.style.display = 'none'; }, 2000);
    }, 500); // 500ms delay — tez yozganda ko'p marta saqlamaslik uchun
}

function autoRecalcDependents(si, changedRef, depth) {
    if ((depth || 0) > 10) return; // Cheksiz loop oldini olish
    const cleanRef = changedRef.replace(/\$/g, '');

    // 1. O'sha sheet ichidagi bog'liq formulalar
    const formulas = pu74FormulaMap[si] || {};
    Object.keys(formulas).forEach(cellRef => {
        const f = formulas[cellRef];
        if (f.includes(cleanRef) && !f.includes("'")) {
            const result = evaluateFormula(si, f);
            if (result !== null) {
                updateCellDOM(si, cellRef, result);
                // Workbook qiymatini ham yangilash
                const sheet = pu74Workbook.Sheets[pu74Workbook.SheetNames[si]];
                if (sheet[cellRef]) { sheet[cellRef].v = result; }
                autoRecalcDependents(si, cellRef, (depth || 0) + 1);
            }
        }
    });

    // 2. Boshqa sheetlardagi cross-reference formulalar
    const currentSheetName = pu74Workbook.SheetNames[si];
    Object.keys(pu74FormulaMap).forEach(otherSI => {
        if (parseInt(otherSI) === si) return;
        const otherFormulas = pu74FormulaMap[otherSI] || {};
        Object.keys(otherFormulas).forEach(cellRef => {
            const f = otherFormulas[cellRef];
            // "'sheet_name'!CELLREF" formatidagi formulalar
            if (f.includes("'" + currentSheetName + "'") && f.includes(cleanRef)) {
                const result = evaluateFormula(parseInt(otherSI), f);
                if (result !== null) {
                    // Workbook qiymatini yangilash
                    const otherSheet = pu74Workbook.Sheets[pu74Workbook.SheetNames[parseInt(otherSI)]];
                    if (otherSheet[cellRef]) { otherSheet[cellRef].v = result; }
                    // DOM (faqat ko'rinayotgan sheet)
                    if (parseInt(otherSI) === pu74ActiveSheet) {
                        updateCellDOM(parseInt(otherSI), cellRef, result);
                    }
                    // Cascade — bu o'zgarish ham boshqa formulalarga ta'sir qilishi mumkin
                    autoRecalcDependents(parseInt(otherSI), cellRef, (depth || 0) + 1);
                }
            }
        });
    });
}

function updateCellDOM(si, cellRef, result) {
    const decoded = XLSX.utils.decode_cell(cellRef);
    const td = document.querySelector(`td[data-si="${si}"][data-r="${decoded.r}"][data-c="${decoded.c}"]`);
    if (td) {
        td.innerText = result % 1 !== 0 ? result.toFixed(2) : String(result);
        td.classList.add('pu74-recalc-flash');
        setTimeout(() => td.classList.remove('pu74-recalc-flash'), 800);
    }
}

// ==========================================
// 8.5 EXCEL EXPORT (download)
// ==========================================
window.downloadPU74Workbook = function () {
    if (!pu74Workbook) return;
    Object.keys(pu74EditedCells).forEach(k => {
        const parts = k.split('_');
        const si = parseInt(parts[0]), r = parseInt(parts[1]), c = parseInt(parts[2]);
        const ref = XLSX.utils.encode_cell({ r, c });
        const sheet = pu74Workbook.Sheets[pu74Workbook.SheetNames[si]];
        if (!sheet[ref]) sheet[ref] = {};
        const val = pu74EditedCells[k];
        const num = parseFloat(val);
        sheet[ref].v = isNaN(num) ? val : num;
        sheet[ref].t = typeof sheet[ref].v === 'number' ? 'n' : 's';
        sheet[ref].w = String(val);
    });

    const wbout = XLSX.write(pu74Workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const folder = pu74CurrentDept ? `${pu74CurrentDept}_${yearMonth}_` : '';

    const a = document.createElement('a');
    a.href = url;
    a.download = folder + pu74CurrentFile;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
};

// ==========================================
// 9. SAQLASH
// ==========================================
window.savePU74Edits = async function () {
    // Saqlash – localStorage (tahrirlar + imzolar)
    localStorage.setItem('pu74_edits_' + pu74CurrentFile, JSON.stringify(pu74EditedCells));
    localStorage.setItem('pu74_signs_' + pu74CurrentFile, JSON.stringify(pu74Signatures));

    if (window.SmartUtils) SmartUtils.showToast("Local saqlandi, serverga jo'natilmoqda...", "info");

    // Serverga (Iqtisod bo'limi) ga uzatish
    await uploadPU74ToServer();
};

async function uploadPU74ToServer() {
    if (!pu74Workbook) return;

    // Faylni hozirgi tahrirlangan holati bilan yangilaymiz
    Object.keys(pu74EditedCells).forEach(k => {
        const parts = k.split('_');
        const si = parseInt(parts[0]), r = parseInt(parts[1]), c = parseInt(parts[2]);
        const ref = XLSX.utils.encode_cell({ r, c });
        const sheet = pu74Workbook.Sheets[pu74Workbook.SheetNames[si]];
        if (!sheet[ref]) sheet[ref] = {};
        const val = pu74EditedCells[k];
        const num = parseFloat(val);
        sheet[ref].v = isNaN(num) ? val : num;
        sheet[ref].t = typeof sheet[ref].v === 'number' ? 'n' : 's';
        sheet[ref].w = String(val);
    });

    const wbout = XLSX.write(pu74Workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });

    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const dept = pu74CurrentDept || 'iqtisod';

    const formData = new FormData();
    formData.append('file', blob, pu74CurrentFile);
    formData.append('department', `${dept}/${yearMonth}`);
    formData.append('module', 'PU-74');
    formData.append('bolinma_id', dept); // iqtisod yoki kelgan bolinma_id
    formData.append('status', 'approved');

    try {
        const res = await fetch(`${window.CONFIG.API_URL}/files/upload`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('jwtToken') },
            body: formData
        });
        if (!res.ok) {
            console.error("Faylni serverga yozishda xatolik:", await res.text());
            if (window.SmartUtils) SmartUtils.showToast("Serverga yuborishda xatolik bo'ldi.", "error");
        } else {
            console.log("Iqtisod bo'limi ro'yxatiga muvaffaqiyatli saqlandi!");
            // Muvaffaqiyat xabari
            if (window.SmartUtils) SmartUtils.showToast("PU-74 ma'lumotlari Iqtisod bo'limiga oyma-oy tarzda yuborildi!", "success");
            else alert("Iqtisod bo'limi ro'yxatiga saqlandi!");
        }
    } catch (e) {
        console.error("Upload failed", e);
        if (window.SmartUtils) SmartUtils.showToast("Serverga ulanishda xato!", "error");
    }
}

// ==========================================
// 10. OVOZLI KIRITISH
// ==========================================
let pu74ExcelRecognition = null;

window.togglePU74ExcelVoice = function () {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        if (window.SmartUtils) SmartUtils.showToast("Brauzer ovozli kiritishni qo'llab-quvvatlamaydi.", "error");
        return;
    }

    const btn = document.getElementById('pu74-voice-btn');
    if (btn && btn.innerHTML.includes('Eshitilmoq') && pu74ExcelRecognition) {
        pu74ExcelRecognition.stop();
        resetPU74ExcelMic();
        return;
    }

    const focusedCell = document.querySelector('#pu74-journal-content td.editing, #pu74-journal-content td:focus');
    if (!focusedCell) {
        alert("Avval jurnaldagi biror katakchani bosing, keyin ovozli kiritishni boshlang!");
        return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!pu74ExcelRecognition) {
        pu74ExcelRecognition = new SR();
        pu74ExcelRecognition.lang = 'uz-UZ';
        pu74ExcelRecognition.interimResults = false;

        pu74ExcelRecognition.onstart = () => {
            const b = document.getElementById('pu74-voice-btn');
            if (b) { b.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Eshitilmoqda...'; b.style.background = 'linear-gradient(135deg,#e74c3c,#c0392b)'; }
        };

        pu74ExcelRecognition.onresult = (event) => {
            let text = '';
            for (let i = event.resultIndex; i < event.results.length; ++i)
                if (event.results[i].isFinal) text += event.results[i][0].transcript;
            if (text) {
                const ac = document.querySelector('#pu74-journal-content td.editing, #pu74-journal-content td:focus');
                if (ac) {
                    ac.innerText = text.charAt(0).toUpperCase() + text.slice(1);
                    onPU74CellEdit(ac);
                    if (window.SmartUtils) SmartUtils.showToast("Ovoz yozildi!", "success");
                }
            }
        };

        pu74ExcelRecognition.onerror = () => resetPU74ExcelMic();
        pu74ExcelRecognition.onend = () => resetPU74ExcelMic();
    }

    try { pu74ExcelRecognition.start(); } catch (e) { pu74ExcelRecognition.stop(); setTimeout(() => pu74ExcelRecognition.start(), 100); }
};

function resetPU74ExcelMic() {
    const b = document.getElementById('pu74-voice-btn');
    if (b) { b.innerHTML = "<i class='fas fa-microphone'></i> Ovozli kiritish"; b.style.background = 'linear-gradient(135deg,#f39c12,#d35400)'; }
}

// ==========================================
// 11. YORDAMCHI
// ==========================================
function closePU74Viewer() {
    const v = document.getElementById('pu74-excel-viewer');
    if (v) v.remove();
}

window.handlePU74FileUpload = function (input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        pu74Workbook = XLSX.read(e.target.result, { type: 'array', cellFormula: true });
        buildFormulaMap();
        renderPU74SheetTabs();
        renderPU74Sheet(0);
    };
    reader.readAsArrayBuffer(file);
};

// Global exports
window.openPU74New = function (bn, id) { openPU74Window(id); };
window.openPU74Window = openPU74Window;
window.loadPU74Brigade = loadPU74Brigade;
window.closePU74Selection = closePU74Selection;
window.closePU74Viewer = closePU74Viewer;
window.renderPU74Sheet = renderPU74Sheet;
window.onPU74CellEdit = onPU74CellEdit;
