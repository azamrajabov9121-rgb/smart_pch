// Material Usage Act (M-29) Logic - Integrated with Accounting
// Now allows selecting materials from the Material Report and automatically deducting stock.

// Store data in localStorage: 'materialActs'
function getMaterialActs(deptId) {
    const allActs = JSON.parse(localStorage.getItem('materialActs')) || [];
    return allActs.filter(act => act.deptId === deptId);
}

function saveMaterialActToStorage(act) {
    const allActs = JSON.parse(localStorage.getItem('materialActs')) || [];
    allActs.push(act);
    localStorage.setItem('materialActs', JSON.stringify(allActs));
}

let currentMaterialCart = [];
let currentActMaterialsList = []; // New separate list for M-29 specific materials

// Open Material Act Window (Document Style)
function openMaterialsWindow(deptId) {
    const modalId = 'materials-modal';
    let modal = document.getElementById(modalId);

    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = "integration-window active";
        modal.style.zIndex = "10020";

        // Get current info
        const now = new Date();
        const year = now.getFullYear();
        const dayMonth = now.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' });

        let deptDisplayName = deptId;
        if (typeof sectionsData !== 'undefined' && sectionsData[deptId]) {
            deptDisplayName = (sectionsData[deptId].name || deptId) + " bo'linmasi";
        } else if (deptId.startsWith('bolinma')) {
            deptDisplayName = deptId.replace('bolinma', '') + "-bo'linma";
        }

        // Modal structure
        modal.innerHTML = `
            <div class="window-header">
                <h2><i class="fas fa-file-contract"></i> M-29 Dalolatnoma (Raqamli Hujjat)</h2>
                <button class="close-window" onclick="closeMaterialsWindow()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="window-content" style="background: var(--primary-dark); display: flex; flex-direction: column; align-items: center; gap: 30px; padding: 40px; overflow-y: auto;">
                
                <!-- TOOLBAR / CONTROLS -->
                <div class="glass-panel" style="width: 95%; max-width: 1400px; padding: 25px; display: flex; flex-direction: column; gap: 20px; border-bottom: 2px solid var(--accent);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h4 style="color: var(--accent-gold); margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                            <i class="fas fa-plus-circle"></i> Material qo'shish
                        </h4>
                        <span style="font-size: 0.85rem; color: var(--text-secondary);">Ombordagi qoldiqlar asosida</span>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 2fr 1fr auto; gap: 15px; align-items: end;">
                        <div class="form-group" style="margin: 0;">
                            <label style="display: block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 5px;">Materialni qidirib tanlang</label>
                            <input list="m29-materials-list" id="m29-material-select" class="glass-input" placeholder="Yozib qidiring..." style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border); color: white; padding: 10px; border-radius: 8px;" onchange="validateM29Stock()">
                            <datalist id="m29-materials-list">
                                <!-- JS fills this -->
                            </datalist>
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label style="display: block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 5px;">Miqdori <span id="m29-stock-info" style="color:var(--accent);font-size:0.7rem;"></span></label>
                            <input type="number" id="m29-material-qty" class="glass-input" placeholder="0.00" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border); color: white; padding: 10px; border-radius: 8px; transition: 0.3s;" oninput="validateM29Stock()">
                        </div>
                        <button onclick="addMaterialToM29()" class="control-btn orange" style="height: 42px; padding: 0 25px;">
                            <i class="fas fa-plus"></i> Qo'shish
                        </button>
                    </div>
                </div>

                <!-- DOCUMENT CONTAINER (A4 Style + Paper Effect) -->
                <div id="m29-printable-area" style="background-color: #fdfbf7; background-image: radial-gradient(#00000005 1px, transparent 1px); background-size: 20px 20px; box-shadow: inset 0 0 80px rgba(0,0,0,0.03), 0 20px 60px rgba(0,0,0,0.8); width: 95%; max-width: 1400px; min-height: 297mm; padding: 25mm 20mm; color: black; font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5; position: relative;">
                    
                    <!-- Official Header Decorations -->
                    <div style="position: absolute; top: 10mm; left: 0; right: 0; display: flex; justify-content: center; opacity: 0.05; pointer-events: none;">
                        <i class="fas fa-train" style="font-size: 150px;"></i>
                    </div>

                    <div style="text-align: right; font-size: 12pt; margin-bottom: 30px;">
                         M-29 shakli <br>
                         Tasdiqlangan 
                    </div>

                    <h3 style="text-align: center; margin-bottom: 40px; text-transform: uppercase; font-weight: bold; border-bottom: 2px solid black; padding-bottom: 10px; display: inline-block; width: 100%;">
                        Dalolatnoma
                    </h3>

                    <!-- Header Info -->
                    <div style="display: flex; justify-content: space-between; margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                        <div style="display: flex; align-items: baseline;">
                            <input type="text" id="act-day-month" value="${dayMonth}" style="border: none; border-bottom: 1px solid black; width: 120px; font-family: inherit; font-size: inherit; text-align: center; outline: none; color: black !important;">
                            <span>&nbsp;kuni,</span>
                            <input type="number" id="act-year" value="${year}" style="border: none; border-bottom: 1px solid black; width: 60px; text-align: center; outline: none; font-family: inherit; font-size: inherit; color: black !important;">
                            <span>-yil</span>
                        </div>
                        <div style="display: flex; align-items: baseline;">
                            <input type="text" id="act-station" placeholder="Bekat nomi" style="border: none; border-bottom: 1px solid black; width: 180px; padding: 0 5px; font-family: inherit; font-size: inherit; text-align: center; outline: none; color: black !important;">
                            <span>&nbsp;bekati</span>
                        </div>
                    </div>

                    <!-- Intro Text -->
                    <div style="text-align: justify; margin-bottom: 20px; text-indent: 40px;">
                        Biz quyida imzo chekuvchilar, 
                         <input type="text" id="act-dept-name" value="${deptDisplayName}" style="border: none; border-bottom: 1px solid black; width: 180px; text-align: center; outline: none; font-weight: bold; color: black !important; background: transparent !important;">
                         yo'l ustasi: 
                        <input type="text" id="act-master" value="${typeof currentUser !== 'undefined' && currentUser ? (currentUser.fio || currentUser.username) : ''}" placeholder="F.I.SH" style="border: none; border-bottom: 1px solid black; width: 220px; outline: none; text-align: center; color: black !important; background: transparent !important;">
                        , yo'l brigadiri: 
                        <input type="text" id="act-brigadier1" placeholder="F.I.SH" style="border: none; border-bottom: 1px solid black; width: 220px; outline: none; text-align: center; color: black !important;">
                        , yo'l brigadiri: 
                        <input type="text" id="act-brigadier2" placeholder="F.I.SH" style="border: none; border-bottom: 1px solid black; width: 220px; outline: none; text-align: center; color: black !important;">
                        lar tomonidan ushbu dalolatnoma tuzildi.
                    </div>

                    <div style="text-align: justify; margin-bottom: 20px; text-indent: 40px;">
                         Dalolatnoma shu haqidakim, <b>${deptDisplayName}</b>ga qarashli bo'lgan
                        <input type="text" id="act-location-start" placeholder="Peregon/Joy nomi" style="border: none; border-bottom: 1px solid black; width: 100%; margin-top: 8px; outline: none; font-weight: bold; color: black !important;">
                        hududining 
                        <input type="text" id="act-km" placeholder="0000" style="border: none; border-bottom: 1px solid black; width: 70px; text-align: center; outline: none; color: black !important;"> km 
                        <input type="text" id="act-pk" placeholder="0" style="border: none; border-bottom: 1px solid black; width: 40px; text-align: center; outline: none; color: black !important;"> pk
                        <input type="text" id="act-misc-loc" placeholder="qo'shimcha ma'lumot" style="border: none; border-bottom: 1px solid black; width: 280px; outline: none; color: black !important;">
                        larda rejali profilaktika va joriy ta'mirlash ishlari olib borildi.
                    </div>

                    <div style="text-align: justify; margin-bottom: 25px; text-indent: 40px;">
                        Bajarilgan ishning mazmuni: "
                        <input type="text" id="act-work-desc" placeholder="Ish turi va sababi..." style="border: none; border-bottom: 1px solid black; width: 85%; outline: none; font-style: italic; color: black !important;">
                        ". Ishlarni bajarishda 
                        <input type="text" id="act-method" placeholder="Texnik vosita yoki usul" style="border: none; border-bottom: 1px solid black; width: 250px; outline: none; color: black !important;">
                        yordamida barcha xavfsizlik qoidalariga rioya qilingan holda amalga oshirildi.
                    </div>

                    <!-- Materials Table (REPLACING UL) -->
                    <div style="margin-top: 30px;">
                        <div style="margin-bottom: 15px; font-weight: bold;">
                             Yuqorida ko'rsatilgan ishlarni bajarishda sarflangan materiallar ro'yxati:
                        </div>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13pt;">
                            <thead>
                                <tr style="background: #f9f9f9;">
                                    <th style="border: 1px solid black; padding: 8px; width: 40px; text-align: center;">№</th>
                                    <th style="border: 1px solid black; padding: 8px; text-align: left;">Material nomi</th>
                                    <th style="border: 1px solid black; padding: 8px; width: 10px; text-align: center;">O'lchov</th>
                                    <th style="border: 1px solid black; padding: 8px; width: 150px; text-align: center;">Miqdori</th>
                                    <th class="no-print" style="border: 1px solid black; padding: 8px; width: 50px; text-align: center;"></th>
                                </tr>
                            </thead>
                            <tbody id="m29-materials-tbody">
                                <!-- Materials will be dynamically injected here -->
                                <tr>
                                    <td colspan="5" style="border: 1px solid black; padding: 15px; text-align: center; color: #999; font-style: italic;">Materiallar qo'shilmagan</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <textarea id="act-materials" style="display:none;"></textarea>
                    </div>

                    <!-- Closing Statement -->
                    <div style="text-align: justify; margin-top: 30px; text-indent: 40px;">
                         Haqiqatan ham ushbu materiallar 
                        <input type="text" id="act-mat-summary" placeholder="mazkur ish uchun" style="border: none; border-bottom: 1px solid black; width: 300px; outline: none; font-weight: bold; color: black !important;">
                        maqsadli sarflandi va ularni bo'linma hisobotidan chiqim qilishga ruxsat berishingizni so'raymiz.
                    </div>

                    <!-- Signatures Section -->
                    <div style="margin-top: 60px;">
                        <div style="text-align: center; margin-bottom: 40px; font-weight: bold;">
                             Dalolatnoma imzolandi:
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 25px;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                                <div style="width: 150px;">Yo'l ustasi:</div>
                                <div style="flex: 1; border-bottom: 1px solid black; margin: 0 20px; position: relative;">
                                    <span style="position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); font-size: 9pt; color: #666;">(imzo)</span>
                                </div>
                                <div style="width: 200px; border-bottom: 1px solid black; text-align: center;" id="display-master"></div>
                            </div>

                            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                                <div style="width: 150px;">Brigadir:</div>
                                <div style="flex: 1; border-bottom: 1px solid black; margin: 0 20px; position: relative;">
                                    <span style="position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); font-size: 9pt; color: #666;">(imzo)</span>
                                </div>
                                <div style="width: 200px; border-bottom: 1px solid black; text-align: center;" id="display-brigadier1"></div>
                            </div>

                            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                                <div style="width: 150px;">Brigadir:</div>
                                <div style="flex: 1; border-bottom: 1px solid black; margin: 0 20px; position: relative;">
                                    <span style="position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); font-size: 9pt; color: #666;">(imzo)</span>
                                </div>
                                <div style="width: 200px; border-bottom: 1px solid black; text-align: center;" id="display-brigadier2"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Stamp Placeholder (Only visible in view) -->
                    <div id="m29-stamp-container" style="position: absolute; bottom: 50mm; right: 20mm; width: 120px; height: 120px; display: none; align-items: center; justify-content: center; opacity: 0.6; pointer-events: none;">
                         <div style="width: 100px; height: 100px; border: 4px double #1a4e8a; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1a4e8a; font-weight: bold; font-size: 10pt; text-align: center; border: 4px double #1a4e8a;">
                            O'ZBEKISTON<br>TEMIR<br>YO'LLARI
                         </div>
                    </div>
                </div>

                <!-- ACTIONS BLOCK -->
                <div style="display: flex; gap: 15px; width: 95%; max-width: 1400px; flex-wrap: wrap;">
                    <button onclick="saveMaterialAct('${deptId}')" class="control-btn green" style="flex: 2; height: 60px; font-size: 1.1rem; border-radius: 30px; box-shadow: 0 10px 25px rgba(39, 174, 96, 0.4);">
                        <i class="fas fa-check-circle"></i> Tasdiqlash uchun yuborish
                    </button>
                    <!-- E-Imzo Integration Button -->
                    <button onclick="alert('E-Imzo moduli ishga tushirildi! Qisqa vaqt ichida ERI kalitingiz orqali imzolashingiz mumkin bo\\'ladi.')" class="control-btn" style="flex: 1; height: 60px; font-size: 1.1rem; border-radius: 30px; background: linear-gradient(135deg, #8e44ad, #9b59b6); border-color: #8e44ad; color: white; box-shadow: 0 10px 25px rgba(142, 68, 173, 0.4);">
                        <i class="fas fa-key"></i> E-Imzo (ERI)
                    </button>
                    <button onclick="printCurrentAct('${deptId}')" class="control-btn blue" style="flex: 1; height: 60px; font-size: 1.1rem; border-radius: 30px; box-shadow: 0 10px 25px rgba(0, 198, 255, 0.3);">
                        <i class="fas fa-print"></i> PDF / Chop etish
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Sync inputs with display spans for signatures
        const syncInputs = () => {
            const master = document.getElementById('act-master').value;
            const b1 = document.getElementById('act-brigadier1').value;
            const b2 = document.getElementById('act-brigadier2').value;
            if (document.getElementById('display-master')) document.getElementById('display-master').textContent = master;
            if (document.getElementById('display-brigadier1')) document.getElementById('display-brigadier1').textContent = b1;
            if (document.getElementById('display-brigadier2')) document.getElementById('display-brigadier2').textContent = b2;
        };

        ['act-master', 'act-brigadier1', 'act-brigadier2'].forEach(id => {
            document.getElementById(id).addEventListener('input', syncInputs);
        });

        // Initial sync for autofilled values
        syncInputs();
    }

    modal.classList.add('active');
    document.getElementById('department-overlay')?.classList.add('active');

    // Populate Dropdown
    populateMaterialDropdown();
    // Reset List
    currentActMaterialsList = [];
    updateM29ListUI();
}

function closeMaterialsWindow() {
    document.getElementById('materials-modal')?.remove();
    // Only remove overlay if no other active windows exist
    if (document.querySelectorAll('.department-window.active').length === 0) {
        document.getElementById('department-overlay')?.classList.remove('active');
    }
}

// --- Integration Functions ---

function populateMaterialDropdown() {
    const select = document.getElementById('m29-material-select');
    if (!select) return;

    select.innerHTML = '<option value="">Material tanlang...</option>';

    // Get from Shared Storage (accounting.js)
    let materials = [];
    if (typeof window.getStoredMaterials === 'function') {
        materials = window.getStoredMaterials();
    } else {
        console.warn("Accounting module not found, using empty list");
    }

    materials.forEach(mat => {
        // Only show items with stock > 0
        if (mat.endQty > 0) {
            const opt = document.createElement('option');
            opt.value = `${mat.name} (Qoldiq: ${mat.endQty} ${mat.uom})`;
            // Store dataset separately in a global store format for lookups based on selected string
            window._m29MaterialStore = window._m29MaterialStore || {};
            window._m29MaterialStore[opt.value] = { name: mat.name, max: mat.endQty, uom: mat.uom };

            select.appendChild(opt);
        }
    });
}

// Live Validation for Stock
function validateM29Stock() {
    const inputStr = document.getElementById('m29-material-select').value;
    const qtyInput = document.getElementById('m29-material-qty');
    const infoSpan = document.getElementById('m29-stock-info');

    // Clear validation borders
    qtyInput.style.border = "1px solid var(--glass-border)";
    qtyInput.style.backgroundColor = "rgba(0,0,0,0.3)";
    infoSpan.textContent = "";

    if (!inputStr || !window._m29MaterialStore || !window._m29MaterialStore[inputStr]) return;

    const matData = window._m29MaterialStore[inputStr];
    infoSpan.textContent = `(Maks: ${matData.max} ${matData.uom})`;

    const currentQty = parseFloat(qtyInput.value) || 0;

    if (currentQty > matData.max) {
        // Warning state
        qtyInput.style.border = "2px solid #e74c3c";
        qtyInput.style.backgroundColor = "rgba(231, 76, 60, 0.1)";
        infoSpan.textContent = `(Maks oshdi: ${matData.max} ${matData.uom})`;
        infoSpan.style.color = "#e74c3c";
    } else if (currentQty > 0) {
        // Valid state
        qtyInput.style.border = "2px solid #2ecc71";
    }
}

function addMaterialToM29() {
    const select = document.getElementById('m29-material-select');
    const qtyInput = document.getElementById('m29-material-qty');

    const inputStr = select.value;
    const qty = parseFloat(qtyInput.value);

    if (!inputStr || !qty || qty <= 0) {
        alert("Iltimos, materialni ro'yxatdan tanlang va miqdorni kiriting.");
        return;
    }

    if (!window._m29MaterialStore || !window._m29MaterialStore[inputStr]) {
        alert("Noto'g'ri material kiritildi. Ro'yxatdan tanlang.");
        return;
    }

    const matData = window._m29MaterialStore[inputStr];
    const maxQty = parseFloat(matData.max);

    if (qty > maxQty) {
        alert(`Diqqat! Omborda atigi ${maxQty} mavjud. Siz ${qty} kiritdingiz.`);
        return;
    }

    // Check if already completely depleted by previous selections in same form
    let currentInCart = 0;
    currentActMaterialsList.forEach(m => {
        if (m.name === matData.name) currentInCart += m.qty;
    });

    if (currentInCart + qty > maxQty) {
        alert(`Siz ro'yxatga avval bu materialdan ${currentInCart} qo'shgansiz. Omborda faqat ${maxQty} qolgan.`);
        return;
    }

    // Add to list
    currentActMaterialsList.push({
        name: matData.name,
        qty: qty,
        uom: matData.uom
    });

    // Reset inputs
    select.value = "";
    qtyInput.value = "";
    validateM29Stock();

    updateM29ListUI();
}

function updateM29ListUI() {
    const tbody = document.getElementById('m29-materials-tbody');
    const textArea = document.getElementById('act-materials');
    if (!tbody) return;

    if (currentActMaterialsList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="border: 1px solid black; padding: 15px; text-align: center; color: #999; font-style: italic;">Materiallar qo\'shilmagan</td></tr>';
        if (textArea) textArea.value = "";
        return;
    }

    tbody.innerHTML = '';
    let textSummary = "";

    currentActMaterialsList.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="border: 1px solid black; padding: 8px; text-align: center;">${index + 1}</td>
            <td style="border: 1px solid black; padding: 8px; font-size: 12pt;"><b>${item.name}</b></td>
            <td style="border: 1px solid black; padding: 8px; text-align: center;">${item.uom}</td>
            <td style="border: 1px solid black; padding: 8px; text-align: center; font-weight: bold;">${item.qty}</td>
            <td class="no-print" style="border: 1px solid black; padding: 8px; text-align: center;">
                <button onclick="removeMaterialFromM29(${index})" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 1.1rem;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);

        textSummary += `${item.name} (${item.qty} ${item.uom}), `;
    });

    // Update the hidden textarea for PDF generation
    if (textSummary.endsWith(", ")) textSummary = textSummary.slice(0, -2);
    if (textArea) textArea.value = textSummary;
}

function removeMaterialFromM29(index) {
    currentActMaterialsList.splice(index, 1);
    updateM29ListUI();
}


// --- Saving Logic ---

function getActDataFromForm(deptId) {
    const station = document.getElementById('act-station').value;
    const master = document.getElementById('act-master').value;
    const b1 = document.getElementById('act-brigadier1').value;
    const b2 = document.getElementById('act-brigadier2').value;

    return {
        id: Date.now(),
        deptId: deptId,
        date: new Date().toISOString(),
        station: station || 'Noma\'lum',
        master: master || 'Mas\'ul xodim',
        brigadier1: b1 || '',
        brigadier2: b2 || '',
        year: document.getElementById('act-year').value,
        dayMonth: document.getElementById('act-day-month').value,
        deptName: document.getElementById('act-dept-name').value,
        locationStart: document.getElementById('act-location-start').value,
        km: document.getElementById('act-km').value,
        pk: document.getElementById('act-pk').value,
        miscLoc: document.getElementById('act-misc-loc').value,
        workDesc: document.getElementById('act-work-desc').value,
        method: document.getElementById('act-method').value,
        materials: document.getElementById('act-materials').value, // Auto-filled from list
        matSummary: document.getElementById('act-mat-summary').value,
        items: [...currentActMaterialsList] // Save structured data for deduction
    };
}

async function saveMaterialAct(deptId) {
    if (currentActMaterialsList.length === 0) {
        if (!confirm("Materiallar ro'yxati bo'sh. Davom etaverasizmi? (Chiqim qilinmaydi)")) return;
    }

    const actData = getActDataFromForm(deptId);

    // Also save to localStorage for approval workflow
    const localAct = {
        ...actData,
        status: 'pending',
        items: [...currentActMaterialsList]
    };
    const allActs = JSON.parse(localStorage.getItem('materialActs')) || [];
    allActs.push(localAct);
    localStorage.setItem('materialActs', JSON.stringify(allActs));

    try {
        let responseId = localAct.id;
        try {
            const response = await SmartUtils.fetchAPI('/materials/acts', {
                method: 'POST',
                body: JSON.stringify({
                    dept_id: deptId,
                    date: actData.date,
                    station: actData.station,
                    bolinma_num: actData.bolinmaNum,
                    master: actData.master,
                    brigadier1: actData.brigadier1,
                    brigadier2: actData.brigadier2,
                    year: actData.year,
                    day_month: actData.dayMonth,
                    dept_name: actData.deptName,
                    location_start: actData.locationStart,
                    km: actData.km,
                    pk: actData.pk,
                    misc_loc: actData.miscLoc,
                    work_desc: actData.workDesc,
                    method: actData.method,
                    materials_summary: actData.materials,
                    items: currentActMaterialsList
                })
            });
            if (response && response.id) responseId = response.id;
        } catch (serverErr) {
            console.error('Server save failed:', serverErr);
            alert('Diqqat: Serverga ulanish muammosi. Ma\'lumotlar faqat mahalliy saqlandi.');
        }

        // Virtual PDF creation for UI — fayl ro'yxatiga qo'shish
        if (typeof uploadedFiles !== 'undefined') {
            const actDate = actData.dayMonth || new Date().toLocaleDateString('uz-UZ');
            const actYear = actData.year || new Date().getFullYear();
            const bolinmaNum = actData.bolinmaNum || deptId.replace('bolinma', '');
            const uploaderName = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.username : 'unknown';
            const actFileName = `M-29 Dalolatnoma ${actDate}.${actYear}.pdf`;

            // Bugalteriya bo'limi section uchun compositeId aniqlash
            // Bo'linmadagi bugalteriya bo'limi odatda sectionId = 5 (yoki 'bugalteriya' nomli section)
            let bugalteriyaSectionId = deptId;
            if (typeof sectionsData !== 'undefined' && sectionsData[deptId]) {
                const bugSection = sectionsData[deptId].find(s =>
                    s.name && s.name.toLowerCase().includes('bugalteriya')
                );
                if (bugSection) {
                    bugalteriyaSectionId = deptId + '-' + bugSection.id;
                }
            }

            const bugalteriyaFile = {
                id: 'ext_' + Date.now(),
                name: `[${bolinmaNum}-bo'linma] ${actFileName}`,
                type: 'application/pdf',
                size: 1024 * 15,
                department: bugalteriyaSectionId,
                uploadDate: new Date().toISOString(),
                isVirtual: true,
                virtualType: 'm29',
                virtualDataId: responseId,
                actData: localAct,
                status: 'pending',
                uploader: uploaderName,
                sourceBolinma: deptId,
                folder: 'M-29'
            };
            uploadedFiles.push(bugalteriyaFile);
            if (typeof saveDatabase === 'function') saveDatabase();

            // Fayllar ro'yxatini yangilash — ochiq bugalteriya oynasini topish
            const bugWin = document.getElementById(bugalteriyaSectionId + '-window');
            if (bugWin && typeof updateFilesTable === 'function') {
                updateFilesTable(bugWin, bugalteriyaSectionId);
            }
        }

        alert("Akt muvaffaqiyatli yaratildi va tasdiqlash uchun yuborildi!\nBugalteriya bo'limida PDF ko'rinishida paydo bo'ladi.");
        closeMaterialsWindow();

    } catch (e) {
        console.error("Error saving material act:", e);
        alert("Aktni saqlashda xatolik yuz berdi!");
    }
}

function printCurrentAct(deptId) {
    const actData = getActDataFromForm(deptId);
    printDocumentAct(actData);
}

function printDocumentAct(data) {
    let materialsTableRows = "";
    if (data.items && data.items.length > 0) {
        data.items.forEach((item, index) => {
            materialsTableRows += `
                <tr>
                    <td style="border: 1px solid black; padding: 8px; text-align: center;">${index + 1}</td>
                    <td style="border: 1px solid black; padding: 8px;">${item.name}</td>
                    <td style="border: 1px solid black; padding: 8px; text-align: center;">${item.uom}</td>
                    <td style="border: 1px solid black; padding: 8px; text-align: center; font-weight: bold;">${item.qty}</td>
                </tr>
            `;
        });
    } else {
        materialsTableRows = '<tr><td colspan="4" style="border: 1px solid black; padding: 15px; text-align: center;">Materiallar ko\'rsatilmagan</td></tr>';
    }

    const showStamp = (data.status === 'approved' || data.status === 'awaiting_signature');

    const printContent = `
        <style>
            @media print { .no-print { display: none !important; } }
            body { font-family: 'Times New Roman', serif; color: black; background: white; }
            .document { width: 100%; max-width: 210mm; margin: 0 auto; padding: 20mm; position: relative; }
            .header-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .title { text-align: center; text-transform: uppercase; font-weight: bold; font-size: 16pt; margin: 30px 0; border-bottom: 2px solid black; padding-bottom: 10px; }
            .text { text-align: justify; text-indent: 40px; margin-bottom: 15px; font-size: 14pt; line-height: 1.5; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13pt; }
            th, td { border: 1px solid black; padding: 8px; }
            .signatures { margin-top: 50px; display: flex; flex-direction: column; gap: 25px; }
            .sig-row { display: flex; justify-content: space-between; align-items: flex-end; }
            .sig-line { flex: 1; border-bottom: 1px solid black; margin: 0 20px; position: relative; }
            .sig-label { position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%); font-size: 9pt; }
            .stamp { position: absolute; bottom: 40mm; right: 20mm; width: 120px; height: 120px; opacity: 0.7; }
        </style>
        <div class="document">
            <div style="text-align: right; font-size: 11pt; margin-bottom: 20px;">M-29 shakli</div>
            <div class="title">Dalolatnoma</div>
            
            <div class="header-info">
                <div><b>${data.dayMonth}</b> kuni, <b>${data.year}</b>-yil</div>
                <div><b>${data.station}</b> bekati</div>
            </div>

            <div class="text">
                Biz quyida imzo chekuvchilar, <b>${data.deptName}</b> yo'l ustasi: <b>${data.master}</b>, 
                yo'l brigadiri: <b>${data.brigadier1}</b>, yo'l brigadiri: <b>${data.brigadier2}</b> 
                lar tomonidan ushbu dalolatnoma tuzildi.
            </div>

            <div class="text">
                Dalolatnoma shu haqidakim, <b>${data.deptName}</b>ga qarashli bo'lgan 
                <b>${data.locationStart}</b> hududining <b>${data.km}</b> km <b>${data.pk}</b> pk <b>${data.miscLoc}</b> larda
                joriy ta'mir ishlari bajarildi.
            </div>

            <div class="text">
                "<b>${data.workDesc}</b>" nosozliklarini bartaraf qilish uchun 
                <b>${data.method}</b> yordamida ishlar amalga oshirildi.
            </div>

            <div style="font-weight: bold; margin-top: 20px;">Sarflangan materiallar ro'yxati:</div>
            <table>
                <thead>
                    <tr style="background: #eee;">
                        <th style="width: 40px;">№</th>
                        <th style="text-align: left;">Material nomi</th>
                        <th style="width: 80px;">O'lchov</th>
                        <th style="width: 100px;">Miqdori</th>
                    </tr>
                </thead>
                <tbody>
                    ${materialsTableRows}
                </tbody>
            </table>

            <div class="text" style="margin-top: 30px;">
                Ushbu yuqorida sarflangan <b>${data.matSummary}</b> bo'linma xisobotidan chiqim qilishga ruxsat berishingizni so'raymiz.
            </div>

            <div class="signatures">
                <div class="sig-row">
                    <div style="width: 150px;">Yo'l ustasi:</div>
                    <div class="sig-line"><span class="sig-label">(imzo)</span></div>
                    <div style="width: 200px; border-bottom: 1px solid black; text-align: center;"><b>${data.master}</b></div>
                </div>
                <div class="sig-row">
                    <div style="width: 150px;">Brigadir:</div>
                    <div class="sig-line"><span class="sig-label">(imzo)</span></div>
                    <div style="width: 200px; border-bottom: 1px solid black; text-align: center;"><b>${data.brigadier1}</b></div>
                </div>
                <div class="sig-row">
                    <div style="width: 150px;">Brigadir:</div>
                    <div class="sig-line"><span class="sig-label">(imzo)</span></div>
                    <div style="width: 200px; border-bottom: 1px solid black; text-align: center;"><b>${data.brigadier2}</b></div>
                </div>
            </div>

            ${showStamp ? `
            <div class="stamp">
                <div style="width: 100px; height: 100px; border: 4px double #1a4e8a; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1a4e8a; font-weight: bold; font-size: 10pt; text-align: center;">
                    O'ZBEKISTON<br>TEMIR<br>YO'LLARI
                </div>
            </div>` : ''}
        </div>
    `;

    const win = window.open('', '', 'height=900,width=800');
    win.document.write(`<html><head><title>M-29 Dalolatnoma</title></head><body>${printContent}</body></html>`);
    win.document.close();
    // Auto-close after print or if user cancels
    win.onload = () => {
        setTimeout(() => {
            win.print();
            // win.close();
        }, 300);
    };
}

function viewMaterialAct(actDataOrId, deptId) {
    // Only difference from old viewMaterialAct is we might want to ensure 'materials' text is displayed
    // The existing logic already handles display based on saved act object, which includes the 'materials' string we generated.
    let data = actDataOrId;

    if (typeof actDataOrId !== 'object') {
        const baseDeptId = deptId.replace(/-bugalteriya|-section-.*$/, '');
        const acts = getMaterialActs(baseDeptId);
        data = acts.find(a => a.id == actDataOrId);
        // Fallback search
        if (!data) {
            const actsRaw = getMaterialActs(deptId);
            data = actsRaw.find(a => a.id == actDataOrId);
        }
    }

    if (!data) {
        alert("Ma'lumot topilmadi!");
        return;
    }

    // Reuse Print Logic for View or dedicated view
    // For simplicity, reusing printDocumentAct logic but in a modal
    // ... (Code similar to printDocumentAct but in a modal container - see original implementation if needed)
    // For now, let's just use the Print Preview directly as it's cleaner
    printDocumentAct(data);
}

// Global Exports
window.openMaterialsWindow = openMaterialsWindow;
window.closeMaterialsWindow = closeMaterialsWindow;
window.saveMaterialAct = saveMaterialAct;
window.viewMaterialAct = viewMaterialAct;
window.printDocumentAct = printDocumentAct;
window.populateMaterialDropdown = populateMaterialDropdown;
window.addMaterialToM29 = addMaterialToM29;
window.removeMaterialFromM29 = removeMaterialFromM29;
window.validateM29Stock = validateM29Stock;

// Legacy support placeholders (if referenced elsewhere)
window.addMaterialToCart = function () { };
window.removeMaterialFromCart = function () { };
