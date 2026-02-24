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
        modal.style = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 10006; display: flex; flex-direction: column;";

        // Modal structure (Header + Content)
        modal.innerHTML = `
            <div class="window-header" style="background: linear-gradient(90deg, #2c3e50 0%, #34495e 100%); flex-shrink: 0;">
                <h2 class="department-name">
                    <i class="fas fa-file-signature"></i> M-29 Dalolatnoma (Integratsiyalashgan)
                </h2>
                <button class="close-btn" onclick="closeMaterialsWindow()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="window-content" style="flex-grow: 1; padding: 20px; background: #5a6e7f; display: flex; justify-content: center; overflow-y: auto;">
                
                <!-- DOCUMENT CONTAINER -->
                <div style="background: white; width: 210mm; min-height: 297mm; padding: 25mm 20mm; color: black; font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.6; box-shadow: 0 0 30px rgba(0,0,0,0.5); margin-bottom: 50px;">
                    
                    <h3 style="text-align: center; margin-bottom: 40px; text-transform: uppercase;">Dalolatnoma</h3>

                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                        <div>
                            ____/____.202__ y
                        </div>
                        <div style="display: flex; align-items: baseline;">
                            <input type="text" id="act-station" placeholder="Buxoro" style="border: none; border-bottom: 1px solid black; width: 150px; padding: 0 5px; font-family: inherit; font-size: inherit; text-align: center; outline: none;">
                            <span>&nbsp;bekati</span>
                        </div>
                    </div>

                    <!-- Intro -->
                    <div style="text-align: justify;">
                        Biz quyida imzo chekuvchilar 
                        <input type="text" id="act-bolinma-num" placeholder="4" style="border: none; border-bottom: 1px solid black; width: 40px; text-align: center; outline: none;">
                         yo'l ustasi: 
                        <input type="text" id="act-master" placeholder="Atadjonov J" style="border: none; border-bottom: 1px solid black; width: 200px; outline: none;">
                        , yo'l brigadiri: 
                        <input type="text" id="act-brigadier1" placeholder="Movlonov I" style="border: none; border-bottom: 1px solid black; width: 200px; outline: none;">
                        , yo'l brigadiri: 
                        <input type="text" id="act-brigadier2" placeholder="Safarov H" style="border: none; border-bottom: 1px solid black; width: 200px; outline: none;">
                        lar tomonidan tuzildi ushbu dalolatnoma shu haqidakim
                    </div>

                    <!-- Date/Location -->
                    <div style="text-align: justify; margin-top: 10px;">
                        <input type="number" id="act-year" value="2026" style="border: none; border-bottom: 1px solid black; width: 60px; text-align: center; outline: none;">-yil
                        <input type="text" id="act-day-month" placeholder="29-avgust" style="border: none; border-bottom: 1px solid black; width: 150px; text-align: center; outline: none;">
                        kuni
                        <input type="text" id="act-dept-name" placeholder="4-bo'linmaga" style="border: none; border-bottom: 1px solid black; width: 150px; text-align: center; outline: none;">
                        qarashli bo'lgan
                        <br>
                        <input type="text" id="act-location-start" placeholder="Peregon Parvoz - Qorlitog' - Kiyikli" style="border: none; border-bottom: 1px solid black; width: 100%; margin-top: 5px; outline: none;">
                        bekatlari oralig'i
                        <input type="text" id="act-km" placeholder="4118" style="border: none; border-bottom: 1px solid black; width: 60px; text-align: center; outline: none;"> km
                        <input type="text" id="act-pk" placeholder="1" style="border: none; border-bottom: 1px solid black; width: 40px; text-align: center; outline: none;"> pk
                        <input type="text" id="act-misc-loc" placeholder="dan 4150 km pk 10 gacha" style="border: none; border-bottom: 1px solid black; width: 250px; outline: none;">
                        larda
                    </div>

                    <!-- Work Description -->
                    <div style="text-align: justify; margin-top: 10px;">
                        "
                        <input type="text" id="act-work-desc" placeholder="Yo'lovchi poyezdlardan tushgan..." style="border: none; border-bottom: 1px solid black; width: 70%; outline: none;">
                        " nosozliklarini bartaraf qilish uchun
                        <input type="text" id="act-method" placeholder="..." style="border: none; border-bottom: 1px solid black; width: 100%; margin-top: 5px; outline: none;">
                        yordamida joriy ta'mir ishlari bajarildi.
                    </div>

                    <!-- Materials Selection (INTEGRATED) -->
                    <div style="text-align: justify; margin-top: 10px; background: #fdfdfd; border: 1px dashed #ccc; padding: 10px; border-radius: 5px;">
                        <div>
                            Yuqorida joriy ta'mir ishlarini bajarishda tarmoq xom-ashyo hisobotida mavjud bo'lgan:
                        </div>
                        
                        <!-- UI Control -->
                        <div style="display: flex; gap: 10px; margin-top: 10px; align-items: center;">
                            <select id="m29-material-select" style="padding: 5px; font-size: 14px; flex-grow: 1; border: 1px solid #999;">
                                <option value="">Material tanlang...</option>
                            </select>
                            <input type="number" id="m29-material-qty" placeholder="Soni" style="width: 80px; padding: 5px; font-size: 14px; border: 1px solid #999;">
                            <button onclick="addMaterialToM29()" style="padding: 5px 15px; background: #3498db; color: white; border: none; cursor: pointer;">Qo'shish</button>
                        </div>

                        <!-- List of selected materials -->
                        <ul id="m29-selected-list" style="margin-top: 10px; padding-left: 20px; font-style: italic;">
                            <!-- Items appear here -->
                        </ul>
                        
                        <!-- Hidden text field for PDF generation purposes (Auto-filled) -->
                        <textarea id="act-materials" style="display:none;"></textarea>
                        
                        <div style="margin-top: 5px;">sarflandi.</div>
                    </div>

                    <!-- Closing -->
                    <div style="text-align: justify; margin-top: 10px;">
                        Ushbu yuqorida sarflangan
                        <input type="text" id="act-mat-summary" placeholder="xom ashyo materialini" style="border: none; border-bottom: 1px solid black; width: 300px; outline: none;">
                        bo'linma xisobotidan chiqim qilishga ruxsat berishingizni so'raymiz.
                    </div>

                    <!-- Footer -->
                    <div style="text-align: center; margin-top: 50px; font-weight: bold; text-decoration: underline;">
                        Dalolatnoma shu xakida tuzildi va imzolandi
                    </div>

                    <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; line-height: 2;">
                        <div>yo'l ustasi:</div>
                        <div style="border-bottom: 1px solid black;"></div>
                        <div>yo'l brigadiri:</div>
                        <div style="border-bottom: 1px solid black;"></div>
                        <div>yo'l brigadiri:</div>
                        <div style="border-bottom: 1px solid black;"></div>
                    </div>

                    <!-- Buttons -->
                    <div style="position: sticky; bottom: 20px; text-align: center; margin-top: 50px; display: flex; justify-content: center; gap: 20px;">
                        <button onclick="saveMaterialAct('${deptId}')" style="background: #27ae60; color: white; padding: 15px 30px; border: none; border-radius: 30px; font-size: 1.1rem; cursor: pointer; box-shadow: 0 5px 15px rgba(39, 174, 96, 0.4); transition: transform 0.2s;">
                            <i class="fas fa-save"></i> Saqlash va Chiqim Qilish
                        </button>
                        <button onclick="printCurrentAct('${deptId}')" style="background: #3498db; color: white; padding: 15px 30px; border: none; border-radius: 30px; font-size: 1.1rem; cursor: pointer; box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4); transition: transform 0.2s;">
                            <i class="fas fa-print"></i> Chop etish
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
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
            opt.value = mat.name;
            opt.textContent = `${mat.name} (Qoldiq: ${mat.endQty} ${mat.uom})`;
            opt.dataset.uom = mat.uom;
            opt.dataset.max = mat.endQty;
            select.appendChild(opt);
        }
    });
}

function addMaterialToM29() {
    const select = document.getElementById('m29-material-select');
    const qtyInput = document.getElementById('m29-material-qty');

    const name = select.value;
    const qty = parseFloat(qtyInput.value);

    if (!name || !qty || qty <= 0) {
        alert("Iltimos, material va to'g'ri miqdorni tanlang.");
        return;
    }

    // Check stock availability
    const selectedOpt = select.options[select.selectedIndex];
    const maxQty = parseFloat(selectedOpt.dataset.max);

    if (qty > maxQty) {
        alert(`Diqqat! Omborda atigi ${maxQty} mavjud. Siz ${qty} kiritdingiz.`);
        return;
    }

    // Add to list
    currentActMaterialsList.push({
        name: name,
        qty: qty,
        uom: selectedOpt.dataset.uom
    });

    // Reset inputs
    select.value = "";
    qtyInput.value = "";

    updateM29ListUI();
}

function updateM29ListUI() {
    const ul = document.getElementById('m29-selected-list');
    const textArea = document.getElementById('act-materials');
    if (!ul) return;

    ul.innerHTML = '';
    let textSummary = "";

    currentActMaterialsList.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <b>${item.name}</b> - ${item.qty} ${item.uom} 
            <i class="fas fa-times" style="color: red; cursor: pointer; margin-left: 10px;" onclick="removeMaterialFromM29(${index})"></i>
        `;
        ul.appendChild(li);

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
    return {
        id: Date.now(),
        deptId: deptId,
        date: new Date().toISOString(),
        station: document.getElementById('act-station').value,
        bolinmaNum: document.getElementById('act-bolinma-num').value,
        master: document.getElementById('act-master').value,
        brigadier1: document.getElementById('act-brigadier1').value,
        brigadier2: document.getElementById('act-brigadier2').value,
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

        if (response) {
            // Virtual PDF creation for UI consistency
            if (typeof uploadedFiles !== 'undefined') {
                const actDate = actData.dayMonth || new Date().toLocaleDateString('uz-UZ');
                const actYear = actData.year || new Date().getFullYear();
                const bolinmaNum = actData.bolinmaNum || deptId.replace('bolinma', '');
                const uploaderName = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.username : 'unknown';
                const actFileName = `M-29 Dalolatnoma ${actDate}.${actYear}.pdf`;

                const bugalteriyaFile = {
                    id: 'ext_' + Date.now(),
                    name: `[${bolinmaNum}-bo'linma] ${actFileName}`,
                    type: 'application/pdf',
                    size: 1024 * 15,
                    department: 'bugalteriya',
                    uploadDate: new Date().toISOString(),
                    isVirtual: true,
                    virtualType: 'm29',
                    virtualDataId: response.id,
                    status: 'pending',
                    uploader: uploaderName,
                    sourceBolinma: deptId
                };
                uploadedFiles.push(bugalteriyaFile);
                if (typeof saveDatabase === 'function') saveDatabase();
            }

            alert("Akt muvaffaqiyatli yaratildi va tasdiqlash uchun yuborildi!");
            closeMaterialsWindow();
        }
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
    const printContent = `
        <div style="font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.6; color: black; padding: 20px;">
            <h3 style="text-align: center; margin-bottom: 40px; text-transform: uppercase;">Dalolatnoma</h3>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                <div>____/____.${data.year} y</div>
                <div><b>${data.station}</b> bekati</div>
            </div>

            <div style="text-align: justify; text-indent: 50px;">
                Biz quyida imzo chekuvchilar <b>${data.bolinmaNum}</b> yo'l ustasi: <b>${data.master}</b>, 
                yo'l brigadiri: <b>${data.brigadier1}</b>, yo'l brigadiri: <b>${data.brigadier2}</b> 
                lar tomonidan tuzildi ushbu dalolatnoma shu haqidakim
            </div>

            <div style="text-align: justify; margin-top: 10px; text-indent: 50px;">
                <b>${data.year}</b>-yil <b>${data.dayMonth}</b> kuni <b>${data.deptName}</b> qarashli bo'lgan 
                <b>${data.locationStart}</b> bekatlari oralig'i <b>${data.km}</b> km <b>${data.pk}</b> pk <b>${data.miscLoc}</b> larda
            </div>

            <div style="text-align: justify; margin-top: 10px; text-indent: 50px;">
                "<b>${data.workDesc}</b>" nosozliklarini bartaraf qilish uchun 
                <b>${data.method}</b> yordamida joriy ta'mir ishlari bajarildi.
            </div>

            <div style="text-align: justify; margin-top: 10px; text-indent: 50px;">
                Yuqorida joriy ta'mir ishlarini bajarishda tarmoq xom-ashyo hisobotida mavjud bo'lgan 
                <b>${data.materials}</b> sarflandi.
            </div>

            <div style="text-align: justify; margin-top: 10px; text-indent: 50px;">
                Ushbu yuqorida sarflangan <b>${data.matSummary}</b> bo'linma xisobotidan chiqim qilishga ruxsat berishingizni so'raymiz.
            </div>

            <div style="text-align: center; margin-top: 50px; font-weight: bold; text-decoration: underline;">
                Dalolatnoma shu xakida tuzildi va imzolandi
            </div>

            <div style="margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; line-height: 2;">
                <div>yo'l ustasi:</div>
                <div style="border-bottom: 1px solid black;"><span style="float:right">${data.master}</span></div>

                <div>yo'l brigadiri:</div>
                <div style="border-bottom: 1px solid black;"><span style="float:right">${data.brigadier1}</span></div>

                <div>yo'l brigadiri:</div>
                <div style="border-bottom: 1px solid black;"><span style="float:right">${data.brigadier2}</span></div>
            </div>
        </div>
    `;

    const win = window.open('', '', 'height=900,width=800');
    win.document.write(`<html><head><title>Dalolatnoma</title></head><body>${printContent}</body></html>`);
    win.document.close();
    win.print();
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

// Legacy support placeholders (if referenced elsewhere)
window.addMaterialToCart = function () { };
window.removeMaterialFromCart = function () { };
