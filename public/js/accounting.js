// Accounting Module - Material Report & M-29 Logic
// Handles both "Material Hisoboti" and "M-29" journals.

const STORAGE_KEY = 'material_report_data';
let accountingCurrentFile = '';
let materialIdCounter = 10;

// --- Data Management Functions ---

function getStoredMaterials() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);

    // Default Data
    return [
        { id: 1, schyot: "1000", name: "Dizel Yoqilg'isi", uom: "litr", price: 12000, begQty: 50, begSum: 600000, inQty: 100, inSum: 1200000, outQty: 20, outSum: 240000, endQty: 130, endSum: 1560000 },
        { id: 2, schyot: "1010", name: "Benzin A-92", uom: "litr", price: 11500, begQty: 30, begSum: 345000, inQty: 50, inSum: 575000, outQty: 25, outSum: 287500, endQty: 55, endSum: 632500 },
        { id: 3, schyot: "1020", name: "Moy M-8G2", uom: "litr", price: 45000, begQty: 10, begSum: 450000, inQty: 5, inSum: 225000, outQty: 3, outSum: 135000, endQty: 12, endSum: 540000 },
        { id: 4, schyot: "2000", name: "Shpatelka", uom: "dona", price: 25000, begQty: 15, begSum: 375000, inQty: 10, inSum: 250000, outQty: 5, outSum: 125000, endQty: 20, endSum: 500000 },
        { id: 5, schyot: "2010", name: "Brusha (katta)", uom: "dona", price: 15000, begQty: 8, begSum: 120000, inQty: 5, inSum: 75000, outQty: 2, outSum: 30000, endQty: 11, endSum: 165000 },
        { id: 6, schyot: "2020", name: "Brusha (kichik)", uom: "dona", price: 8000, begQty: 12, begSum: 96000, inQty: 8, inSum: 64000, outQty: 6, outSum: 48000, endQty: 14, endSum: 112000 },
        { id: 7, schyot: "2030", name: "Ruletka 5m", uom: "dona", price: 35000, begQty: 3, begSum: 105000, inQty: 2, inSum: 70000, outQty: 1, outSum: 35000, endQty: 4, endSum: 140000 },
        { id: 8, schyot: "2040", name: "Picha", uom: "dona", price: 12000, begQty: 20, begSum: 240000, inQty: 15, inSum: 180000, outQty: 10, outSum: 120000, endQty: 25, endSum: 300000 },
        { id: 9, schyot: "2050", name: "Gilza (patron)", uom: "dona", price: 18000, begQty: 50, begSum: 900000, inQty: 30, inSum: 540000, outQty: 20, outSum: 360000, endQty: 60, endSum: 1080000 },
        { id: 10, schyot: "2060", name: "Lenta o'lchash", uom: "metr", price: 5000, begQty: 100, begSum: 500000, inQty: 50, inSum: 250000, outQty: 30, outSum: 150000, endQty: 120, endSum: 600000 }
    ];
}

function saveStoredMaterials(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Called from M-29 to deduct stock
function deductMaterialStock(materialName, qty) {
    let materials = getStoredMaterials();
    let mat = materials.find(m => m.name === materialName);

    if (mat) {
        mat.outQty = (parseFloat(mat.outQty) || 0) + parseFloat(qty);
        // Recalculate
        const price = parseFloat(mat.price) || 0;
        const begQty = parseFloat(mat.begQty) || 0;
        const inQty = parseFloat(mat.inQty) || 0;

        mat.outSum = mat.outQty * price;
        mat.endQty = begQty + inQty - mat.outQty;
        mat.endSum = mat.endQty * price;

        saveStoredMaterials(materials);
        return true;
    }
    return false;
}

// Called from Incoming (FMU-25) to add stock
function addMaterialStock(materialName, qty, price, uom) {
    let materials = getStoredMaterials();
    let mat = materials.find(m => m.name === materialName);

    if (mat) {
        // Mavjud material — kirim qo'shish
        mat.inQty = (parseFloat(mat.inQty) || 0) + parseFloat(qty);
        const matPrice = parseFloat(mat.price) || parseFloat(price) || 0;
        const begQty = parseFloat(mat.begQty) || 0;
        const outQty = parseFloat(mat.outQty) || 0;

        mat.inSum = mat.inQty * matPrice;
        mat.endQty = begQty + mat.inQty - outQty;
        mat.endSum = mat.endQty * matPrice;
    } else {
        // Yangi material qo'shish
        const newId = materials.length > 0 ? Math.max(...materials.map(m => m.id)) + 1 : 1;
        const qtyNum = parseFloat(qty) || 0;
        const priceNum = parseFloat(price) || 0;
        mat = {
            id: newId,
            schyot: "9999",
            name: materialName,
            uom: uom || 'dona',
            price: priceNum,
            begQty: 0, begSum: 0,
            inQty: qtyNum, inSum: qtyNum * priceNum,
            outQty: 0, outSum: 0,
            endQty: qtyNum, endSum: qtyNum * priceNum
        };
        materials.push(mat);
    }

    saveStoredMaterials(materials);
    return true;
}

// --- UI Functions ---

function openAccountingJournal(type, bolinmaId) {
    // console.log("openAccountingJournal called", type, bolinmaId);
    if (type === 'M-29') {
        if (typeof window.openMaterialsWindow === 'function') {
            window.openMaterialsWindow(bolinmaId);
        } else {
            const script = document.createElement('script');
            script.src = 'js/materials.js';
            script.onload = function () {
                if (typeof window.openMaterialsWindow === 'function') {
                    setTimeout(function () {
                        window.openMaterialsWindow(bolinmaId);
                    }, 100);
                }
            };
            document.head.appendChild(script);
        }
    } else if (type === 'Incoming') {
        if (typeof window.openIncomingWindow === 'function') {
            window.openIncomingWindow(bolinmaId);
        } else {
            const script = document.createElement('script');
            script.src = 'js/incoming.js';
            script.onload = function () {
                if (typeof window.openIncomingWindow === 'function') {
                    window.openIncomingWindow(bolinmaId);
                }
            };
            document.head.appendChild(script);
        }
    } else if (type === 'Archive') {
        if (typeof window.openArchiveWindow === 'function') {
            window.openArchiveWindow(bolinmaId);
        } else {
            // Should already be loaded in accounting.js, but just in case
            console.error("Archive function not found, ensuring accounting.js is loaded");
        }
    } else if (type === 'MaterialReport') {
        const fileName = `Material_Hisoboti_${bolinmaId}.xlsx`;
        loadAccountingTable(fileName, "Material Hisoboti", bolinmaId);
    }
}

function loadAccountingTable(fileName, title, bolinmaId) {
    let viewer = document.getElementById('accounting-excel-viewer');
    if (viewer) viewer.remove();

    viewer = document.createElement('div');
    viewer.id = 'accounting-excel-viewer';
    viewer.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: #1a1a2e; z-index: 10020; display: flex; flex-direction: column;
    `;

    // Rolni aniqlash
    const _curUser = (typeof currentUser !== 'undefined') ? currentUser : null;
    const _userRole = _curUser ? _curUser.role : 'guest';
    const canEdit = (_userRole === 'department' || _userRole === 'admin');

    // Load Data from Storage
    const materials = getStoredMaterials();
    if (materials.length > 0) {
        materialIdCounter = Math.max(...materials.map(m => m.id)) + 1;
    }

    let tableRows = materials.map(m => createRowHTML(m)).join('');

    // Toolbar tugmalari — rolga qarab
    let toolbarBtns = '';
    if (canEdit) {
        // Department/Admin — to'liq boshqaruv
        toolbarBtns = `
                <button id="approval-btn" onclick="openApprovalList()" style="display:none; background: #f39c12; border: none; color: white; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-weight: bold; animation: pulse 2s infinite;">
                    <i class="fas fa-check-double"></i> Tasdiqlash
                </button>
                <label for="import-excel-input" style="background: linear-gradient(135deg, #e67e22, #d35400); border: none; color: white; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-weight: bold; display: inline-flex; align-items: center; gap: 6px;">
                    <i class="fas fa-file-excel"></i> 1C dan Import
                </label>
                <input type="file" id="import-excel-input" accept=".xlsx,.xls,.csv" onchange="importMaterialsFromExcel(this)" style="display: none;">
                <button onclick="addMaterialRow()" style="background: #3498db; border: none; color: white; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                    <i class="fas fa-plus"></i> Qo'shish
                </button>
                <button onclick="deleteMaterialRow()" style="background: #e74c3c; border: none; color: white; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                    <i class="fas fa-trash"></i> O'chirish
                </button>
                <button onclick="saveMaterialTable()" style="background: #27ae60; border: none; color: white; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                    <i class="fas fa-save"></i> Saqlash
                </button>`;
    }
    // Birja tugmasi — hammaga ko'rinadi
    toolbarBtns += `
                <button onclick="if(window.openMarketplaceWindow) window.openMarketplaceWindow('${bolinmaId || 'bolinma1'}')" style="background: linear-gradient(135deg, #16a085, #1abc9c); border: none; color: white; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                    <i class="fas fa-handshake"></i> Birja
                </button>
                <button onclick="closeAccountingViewer()" style="background: #95a5a6; border: none; color: white; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                    <i class="fas fa-times"></i> Yopish
                </button>`;

    viewer.innerHTML = `
        <div style="
            height: 50px; background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white; display: flex; 
            align-items: center; justify-content: space-between; padding: 0 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3); z-index: 10;
        ">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-weight: bold; font-size: 1.2rem; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-table" style="font-size: 1.3rem;"></i> ${title}
                </div>
                <span style="font-size: 0.8rem; opacity: 0.9; background: rgba(0,0,0,0.3); padding: 4px 10px; border-radius: 4px;">
                    ${fileName}${!canEdit ? ' (faqat ko\'rish)' : ''}
                </span>
            </div>
            
            <div style="display: flex; gap: 10px; align-items: center;">
                ${toolbarBtns}
            </div>
        </div>
        
        <div style="flex: 1; overflow-y: auto; overflow-x: auto; padding: 0; width: 100%; box-sizing: border-box; background: #1a1a2e; display: flex; flex-direction: column;">
            <table id="material-table" style="width: 100%; min-width: 100%; border-collapse: collapse; background: #1e1e32; box-shadow: 0 4px 20px rgba(0,0,0,0.3); table-layout: fixed; margin: 0;">
                <colgroup>
                    <col style="width: 45px;"> <!-- № -->
                    <col style="width: 80px;"> <!-- Schyot -->
                    <col style="width: auto;"> <!-- Material Nomi -->
                    <col style="width: 75px;"> <!-- O'lchov -->
                    <col style="width: 95px;"> <!-- Narxi -->
                    <col style="width: 80px;"> <!-- Bosh. Qoldiq Soni -->
                    <col style="width: 120px;"> <!-- Bosh. Qoldiq Summasi -->
                    <col style="width: 75px;"> <!-- Kirim Soni -->
                    <col style="width: 110px;"> <!-- Kirim Summasi -->
                    <col style="width: 75px;"> <!-- Chiqim Soni -->
                    <col style="width: 110px;"> <!-- Chiqim Summasi -->
                    <col style="width: 75px;"> <!-- Yakuniy Qoldiq Soni -->
                    <col style="width: 120px;"> <!-- Yakuniy Qoldiq Summasi -->
                </colgroup>
                <thead>
                    <tr style="background: #1a1a2e;">
                        <th colspan="13" style="padding: 15px; color: #ffffff; text-align: center; font-size: 20px; border-bottom: 2px solid #9b59b6; background: rgba(155, 89, 182, 0.1);">
                            MATERIALLAR HISOBOTI (MATERIAL REPORT)
                        </th>
                    </tr>
                    <tr style="background: #2d2d44;">
                        <th rowspan="2" style="padding: 12px 8px; text-align: center; color: #ffffff; border: 1px solid #4a4a6a; font-size: 13px;">№</th>
                        <th rowspan="2" style="padding: 12px 8px; text-align: center; color: #ffffff; border: 1px solid #4a4a6a; font-size: 13px;">Schyot</th>
                        <th rowspan="2" style="padding: 12px 8px; text-align: center; color: #ffffff; border: 1px solid #4a4a6a; font-size: 13px;">Material Nomi</th>
                        <th rowspan="2" style="padding: 12px 8px; text-align: center; color: #ffffff; border: 1px solid #4a4a6a; font-size: 13px;">O'lchov</th>
                        <th rowspan="2" style="padding: 12px 8px; text-align: center; color: #ffffff; border: 1px solid #4a4a6a; font-size: 13px;">Narxi</th>
                        <th colspan="2" style="padding: 12px; text-align: center; border: 1px solid #4a4a6a; background: #3498db; color: white; font-size: 13px;">Bosh. Qoldiq</th>
                        <th colspan="2" style="padding: 12px; text-align: center; border: 1px solid #4a4a6a; background: #27ae60; color: white; font-size: 13px;">Kirim</th>
                        <th colspan="2" style="padding: 12px; text-align: center; border: 1px solid #4a4a6a; background: #e74c3c; color: white; font-size: 13px;">Chiqim</th>
                        <th colspan="2" style="padding: 12px; text-align: center; border: 1px solid #4a4a6a; background: #9b59b6; color: white; font-size: 13px;">Yakuniy Qoldiq</th>
                    </tr>
                    <tr style="background: #2d2d44;">
                        <th style="padding: 10px; text-align: center; border: 1px solid #4a4a6a; background: #2980b9; color: white; font-size: 12px;">Soni</th>
                        <th style="padding: 10px; text-align: center; border: 1px solid #4a4a6a; background: #2980b9; color: white; font-size: 12px;">Summasi</th>
                        <th style="padding: 10px; text-align: center; border: 1px solid #4a4a6a; background: #229954; color: white; font-size: 12px;">Soni</th>
                        <th style="padding: 10px; text-align: center; border: 1px solid #4a4a6a; background: #229954; color: white; font-size: 12px;">Summasi</th>
                        <th style="padding: 10px; text-align: center; border: 1px solid #4a4a6a; background: #c0392b; color: white; font-size: 12px;">Soni</th>
                        <th style="padding: 10px; text-align: center; border: 1px solid #4a4a6a; background: #c0392b; color: white; font-size: 12px;">Summasi</th>
                        <th style="padding: 10px; text-align: center; border: 1px solid #4a4a6a; background: #8e44ad; color: white; font-size: 12px;">Soni</th>
                        <th style="padding: 10px; text-align: center; border: 1px solid #4a4a6a; background: #8e44ad; color: white; font-size: 12px;">Summasi</th>
                    </tr>
                </thead>
                <tbody id="material-table-body">
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;

    document.body.appendChild(viewer);

    // Bo'linma uchun barcha inputlarni readonly qilish
    if (!canEdit) {
        const allInputs = viewer.querySelectorAll('#material-table-body input');
        allInputs.forEach(inp => {
            inp.readOnly = true;
            inp.disabled = true;
            inp.style.opacity = '0.7';
            inp.style.cursor = 'not-allowed';
            inp.style.border = '1px solid #3d3d5c';
        });
    }

    // Pending ACT larni tekshirish (DOM ga qo'shilgandan keyin)
    if (canEdit) {
        setTimeout(() => {
            if (window.checkPendingActs) window.checkPendingActs(bolinmaId);
        }, 500);
    }
}

function createRowHTML(material) {
    return `
        <tr id="row-${material.id}" style="background: #2d2d44;" data-id="${material.id}">
            <td style="padding: 10px; text-align: center; color: #ffffff; border: 1px solid #4a4a6a;">${material.id}</td>
            <td style="padding: 10px; text-align: center; color: #ffffff; border: 1px solid #4a4a6a;">
                <input type="text" id="schyot-${material.id}" style="width: 100%; text-align: center; background: #3d3d5c; border: 1px solid #5a5a7a; color: white; font-size: 13px; border-radius: 3px; padding: 4px; box-sizing: border-box;" value="${material.schyot}" onchange="recalculateRow(${material.id})">
            </td>
            <td style="padding: 10px; color: #ffffff; border: 1px solid #4a4a6a;">
                <input type="text" id="name-${material.id}" style="width: 100%; background: #3d3d5c; border: 1px solid #5a5a7a; color: white; font-size: 13px; border-radius: 3px; padding: 4px; box-sizing: border-box;" value="${material.name}">
            </td>
            <td style="padding: 10px; text-align: center; color: #ffffff; border: 1px solid #4a4a6a;">
                <input type="text" id="uom-${material.id}" style="width: 100%; text-align: center; background: #3d3d5c; border: 1px solid #5a5a7a; color: white; font-size: 13px; border-radius: 3px; padding: 4px; box-sizing: border-box;" value="${material.uom}">
            </td>
            <td style="padding: 10px; text-align: right; color: #ffffff; border: 1px solid #4a4a6a;">
                <input type="number" id="price-${material.id}" style="width: 100%; text-align: right; background: #3d3d5c; border: 1px solid #5a5a7a; color: white; font-size: 13px; border-radius: 3px; padding: 4px; box-sizing: border-box;" value="${material.price}" onchange="recalculateRow(${material.id})">
            </td>
            <td style="padding: 10px; text-align: center; color: #ffffff; border: 1px solid #4a4a6a;">
                <input type="number" id="begQty-${material.id}" style="width: 100%; text-align: center; background: #3d3d5c; border: 1px solid #5a5a7a; color: white; font-size: 13px; border-radius: 3px; padding: 4px; box-sizing: border-box;" value="${material.begQty}" onchange="recalculateRow(${material.id})">
            </td>
            <td style="padding: 10px; text-align: right; color: #ffffff; border: 1px solid #4a4a6a;" id="begSum-${material.id}">${(material.begSum || 0).toLocaleString()}</td>
            <td style="padding: 10px; text-align: center; color: #ffffff; border: 1px solid #4a4a6a;">
                <input type="number" id="inQty-${material.id}" style="width: 100%; text-align: center; background: #3d3d5c; border: 1px solid #5a5a7a; color: white; font-size: 13px; border-radius: 3px; padding: 4px; box-sizing: border-box;" value="${material.inQty}" onchange="recalculateRow(${material.id})">
            </td>
            <td style="padding: 10px; text-align: right; color: #ffffff; border: 1px solid #4a4a6a;" id="inSum-${material.id}">${(material.inSum || 0).toLocaleString()}</td>
            <td style="padding: 10px; text-align: center; color: #ffffff; border: 1px solid #4a4a6a;">
                <input type="number" id="outQty-${material.id}" style="width: 100%; text-align: center; background: #3d3d5c; border: 1px solid #5a5a7a; color: white; font-size: 13px; border-radius: 3px; padding: 4px; box-sizing: border-box;" value="${material.outQty}" onchange="recalculateRow(${material.id})">
            </td>
            <td style="padding: 10px; text-align: right; color: #ffffff; border: 1px solid #4a4a6a;" id="outSum-${material.id}">${(material.outSum || 0).toLocaleString()}</td>
            <td style="padding: 10px; text-align: center; color: #ffffff; border: 1px solid #4a4a6a; font-weight: bold; background: #3d3d5c;" id="endQty-${material.id}">${material.endQty}</td>
            <td style="padding: 10px; text-align: right; color: #ffffff; border: 1px solid #4a4a6a; font-weight: bold; background: #3d3d5c;" id="endSum-${material.id}">${(material.endSum || 0).toLocaleString()}</td>
        </tr>
    `;
}

function recalculateRow(id) {
    const price = parseFloat(document.getElementById(`price-${id}`).value) || 0;
    const begQty = parseFloat(document.getElementById(`begQty-${id}`).value) || 0;
    const inQty = parseFloat(document.getElementById(`inQty-${id}`).value) || 0;
    const outQty = parseFloat(document.getElementById(`outQty-${id}`).value) || 0;

    // Calculate sums
    const begSum = price * begQty;
    const inSum = price * inQty;
    const outSum = price * outQty;
    const endQty = begQty + inQty - outQty;
    const endSum = begSum + inSum - outSum;

    // Update display
    document.getElementById(`begSum-${id}`).textContent = begSum.toLocaleString();
    document.getElementById(`inSum-${id}`).textContent = inSum.toLocaleString();
    document.getElementById(`outSum-${id}`).textContent = outSum.toLocaleString();
    document.getElementById(`endQty-${id}`).textContent = endQty;
    document.getElementById(`endSum-${id}`).textContent = endSum.toLocaleString();
}

function addMaterialRow() {
    materialIdCounter++;
    const tbody = document.getElementById('material-table-body');
    const newRow = createRowHTML({
        id: materialIdCounter,
        schyot: "0000",
        name: "",
        uom: "dona",
        price: 0,
        begQty: 0, begSum: 0,
        inQty: 0, inSum: 0,
        outQty: 0, outSum: 0,
        endQty: 0, endSum: 0
    });
    tbody.insertAdjacentHTML('beforeend', newRow);

    renumberRows();
}

function deleteMaterialRow() {
    const tbody = document.getElementById('material-table-body');
    const rows = tbody.querySelectorAll('tr');
    if (rows.length > 0) {
        rows[rows.length - 1].remove();
        renumberRows();
    }
}

function renumberRows() {
    const tbody = document.getElementById('material-table-body');
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        row.querySelector('td').textContent = index + 1;
    });
}

function saveMaterialTable() {
    const table = document.getElementById('material-table');
    const rows = table.querySelectorAll('tbody tr');

    let data = [];
    rows.forEach((row) => {
        const id = row.getAttribute('data-id');
        const schyot = document.getElementById(`schyot-${id}`).value;
        const name = document.getElementById(`name-${id}`).value;
        const uom = document.getElementById(`uom-${id}`).value;
        const price = document.getElementById(`price-${id}`).value;
        const begQty = document.getElementById(`begQty-${id}`).value;
        const inQty = document.getElementById(`inQty-${id}`).value;
        const outQty = document.getElementById(`outQty-${id}`).value;

        const p = parseFloat(price) || 0;
        const bq = parseFloat(begQty) || 0;
        const iq = parseFloat(inQty) || 0;
        const oq = parseFloat(outQty) || 0;

        data.push({
            id: parseInt(id),
            schyot, name, uom, price: p,
            begQty: bq, begSum: bq * p,
            inQty: iq, inSum: iq * p,
            outQty: oq, outSum: oq * p,
            endQty: bq + iq - oq, endSum: (bq + iq - oq) * p
        });
    });

    // Save to Storage
    saveStoredMaterials(data);
    alert("Jadval va ma'lumotlar saqlandi!");

    // Optional: Also Export Excel
    if (typeof XLSX !== 'undefined') {
        try {
            const wsData = [
                ["MATERIALLAR HISOBOTI (MATERIAL REPORT)"],
                [],
                ["№", "Schyot", "Material Nomi", "O'lchov", "Narxi", "Bosh. Qoldiq (Soni)", "Bosh. Qoldiq (Summasi)", "Kirim (Soni)", "Kirim (Summasi)", "Chiqim (Soni)", "Chiqim (Summasi)", "Yakuniy Qoldiq (Soni)", "Yakuniy Qoldiq (Summasi)"],
                ...data.map(m => [m.id, m.schyot, m.name, m.uom, m.price, m.begQty, m.begSum, m.inQty, m.inSum, m.outQty, m.outSum, m.endQty, m.endSum])
            ];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Hisobot");
            XLSX.writeFile(wb, `Material_Hisoboti_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (e) { console.error("Excel export error", e); }
    }
}

function closeAccountingViewer() {
    const viewer = document.getElementById('accounting-excel-viewer');
    if (viewer) viewer.remove();
}

// Global scope
window.openAccountingJournal = openAccountingJournal;
window.closeAccountingViewer = closeAccountingViewer;
window.saveMaterialTable = saveMaterialTable;
window.addMaterialRow = addMaterialRow;
window.deleteMaterialRow = deleteMaterialRow;
window.recalculateRow = recalculateRow;
// Shared API
// --- Archive / History Functions ---

function logTransaction(type, documentData) {
    const ARCHIVE_KEY = 'accounting_archive_data';
    let archive = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || '[]');

    const newEntry = {
        id: 'DOC-' + Date.now(),
        date: new Date().toISOString(),
        type: type, // 'Incoming' or 'M-29'
        data: documentData,
        summary: generateSummary(type, documentData)
    };

    archive.push(newEntry);
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
}

function generateSummary(type, data) {
    if (type === 'Incoming') {
        let items = data.items.map(i => i.name).join(', ');
        if (items.length > 50) items = items.substring(0, 50) + '...';
        return `${data.items.length} xil material kirim qilindi (${items})`;
    } else if (type === 'M-29') {
        // M-29 summary logic would go here if we passed detailed data
        return "M-29 Material Sarfi Dalolatnomasi";
    }
    return "Noma'lum Hujjat";
}

function openArchiveWindow(bolinmaId) {
    const modalId = 'archive-modal';
    let modal = document.getElementById(modalId);

    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.style = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.95); z-index: 10010; display: flex; flex-direction: column;";

        modal.innerHTML = `
            <div class="window-header" style="background: linear-gradient(90deg, #34495e 0%, #2c3e50 100%); padding: 15px; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="color: white; margin: 0;"><i class="fas fa-history"></i> Hujjatlar Arxivi</h2>
                <button onclick="closeArchiveWindow()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">&times;</button>
            </div>
            <div class="window-content" style="flex-grow: 1; padding: 20px; color: white; overflow-y: auto;">
                <div style="margin-bottom: 20px;">
                    <label>Oy bo'yicha saralash: </label>
                    <input type="month" id="archive-filter-month" onchange="renderArchiveList()" style="padding: 5px; border-radius: 5px;">
                </div>
                <table style="width: 100%; border-collapse: collapse; background: rgba(255,255,255,0.05);">
                    <thead>
                        <tr style="background: rgba(255,255,255,0.1); text-align: left;">
                            <th style="padding: 10px;">Sana</th>
                            <th style="padding: 10px;">Hujjat Turi</th>
                            <th style="padding: 10px;">Qisqacha Mazmuni</th>
                            <th style="padding: 10px;">Amallar</th>
                        </tr>
                    </thead>
                    <tbody id="archive-table-body"></tbody>
                </table>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Set default month to current
    const now = new Date();
    const monthStr = now.toISOString().slice(0, 7);
    const filterInput = document.getElementById('archive-filter-month');
    if (filterInput && !filterInput.value) filterInput.value = monthStr;

    modal.classList.add('active');
    renderArchiveList();
}

function closeArchiveWindow() {
    document.getElementById('archive-modal')?.remove();
}

function renderArchiveList() {
    const tbody = document.getElementById('archive-table-body');
    if (!tbody) return;  // Modal yo'q bo'lsa chiqib ketamiz

    const filterEl = document.getElementById('archive-filter-month');
    const filter = filterEl ? filterEl.value : '';
    const archive = JSON.parse(localStorage.getItem('accounting_archive_data') || '[]');

    tbody.innerHTML = '';

    // Sort by date desc
    archive.sort((a, b) => new Date(b.date) - new Date(a.date));

    archive.forEach(item => {
        const itemMonth = item.date.slice(0, 7);
        if (filter && itemMonth !== filter) return;

        const dateStr = new Date(item.date).toLocaleString('uz-UZ');
        const typeBadge = item.type === 'Incoming'
            ? '<span style="background: #27ae60; padding: 3px 8px; border-radius: 4px; font-size: 0.8em;">Kirim (Trebovanie)</span>'
            : '<span style="background: #e67e22; padding: 3px 8px; border-radius: 4px; font-size: 0.8em;">Chiqim (M-29)</span>';

        const row = document.createElement('tr');
        row.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
        row.innerHTML = `
            <td style="padding: 10px;">${dateStr}</td>
            <td style="padding: 10px;">${typeBadge}</td>
            <td style="padding: 10px;">${item.summary}</td>
            <td style="padding: 10px;">
                <button onclick="viewArchiveItem('${item.id}')" style="background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-eye"></i> Ko'rish
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    if (tbody.children.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #aaa;">Hujjatlar topilmadi</td></tr>';
    }
}

function viewArchiveItem(id) {
    const archive = JSON.parse(localStorage.getItem('accounting_archive_data') || '[]');
    const item = archive.find(i => i.id === id);
    if (!item) return;

    if (item.type === 'Incoming' || item.type === 'M-29') {
        const modalId = 'archive-view-modal';
        let modal = document.getElementById(modalId);
        if (modal) modal.remove();

        modal = document.createElement('div');
        modal.id = modalId;
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.9); z-index: 10050; display: flex;
            justify-content: center; align-items: center; backdrop-filter: blur(5px);
        `;

        // Format data beautifully
        let detailsHtml = '<div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin-top: 15px; font-family: monospace; font-size: 14px; overflow-x: auto;">';

        if (item.data && item.data.items && Array.isArray(item.data.items)) {
            detailsHtml += '<table style="width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 10px;">';
            detailsHtml += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.2);"><th>Nomi</th><th>Miqdor</th></tr>';
            item.data.items.forEach(mat => {
                detailsHtml += `<tr><td>${mat.name || mat.itemName || '-'}</td><td>${mat.qty || mat.quantity || '-'} ${mat.uom || ''}</td></tr>`;
            });
            detailsHtml += '</table>';
        } else {
            detailsHtml += `<pre style="color: #a8b2d1; margin: 0;">${JSON.stringify(item.data, null, 2)}</pre>`;
        }
        detailsHtml += '</div>';

        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #2c3e50, #34495e); width: 90%; max-width: 650px; border-radius: 15px; padding: 30px; color: white; box-shadow: 0 20px 50px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #3498db;"><i class="fas fa-file-invoice"></i> Hujjat Ma'lumotlari</h3>
                    <button onclick="document.getElementById('${modalId}').remove()" style="background: none; border: none; color: #e74c3c; font-size: 24px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='none'">&times;</button>
                </div>
                
                <div style="font-size: 1.1em; margin-bottom: 10px;">
                    <span style="color: #bdc3c7;">Sana:</span> <strong>${new Date(item.date).toLocaleString('uz-UZ')}</strong>
                </div>
                <div style="font-size: 1.1em; margin-bottom: 10px;">
                    <span style="color: #bdc3c7;">Turi:</span> <strong style="color: ${item.type === 'Incoming' ? '#2ecc71' : '#e67e22'};">${item.type}</strong>
                </div>
                <div style="font-size: 1.1em; margin-bottom: 15px;">
                    <span style="color: #bdc3c7;">Mazmuni:</span> <strong>${item.summary}</strong>
                </div>
                
                <div style="color: #bdc3c7; font-weight: bold; margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
                    Biriktirilgan materiallar:
                </div>
                ${detailsHtml}
                
                <div style="text-align: right; margin-top: 25px;">
                    <button onclick="document.getElementById('${modalId}').remove()" style="background: #3498db; color: white; border: none; padding: 10px 25px; border-radius: 8px; font-weight: bold; cursor: pointer;">
                        Yopish
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    } else {
        if (window.SmartUtils) window.SmartUtils.showToast("Bu hujjat turini o'qish imkonsiz", "warning");
        else alert("Bu hujjat turini ko'rish hozircha imkonsiz.");
    }
}



// --- Accounting Approval Workflow (Pending Acts) ---

function getPendingActs(bolinmaId) {
    const acts = JSON.parse(localStorage.getItem('materialActs')) || [];
    if (!bolinmaId) return acts.filter(a => a.status === 'pending');
    // Basic filter by ID or loose match if string provided
    return acts.filter(a => (a.deptId === bolinmaId || !bolinmaId) && a.status === 'pending');
}

function checkPendingActs(bolinmaId) {
    const pending = getPendingActs(bolinmaId);
    const btn = document.getElementById('approval-btn');
    if (!btn) return;

    if (pending.length > 0) {
        btn.style.display = 'inline-flex';
        btn.innerHTML = `<i class="fas fa-check-double"></i> Tasdiqlash (${pending.length})`;
        if (!btn.style.animation) btn.style.animation = 'pulse 2s infinite';
    } else {
        btn.style.display = 'none';
        btn.style.animation = '';
    }
}

function openApprovalList() {
    const acts = getPendingActs();

    // Remove existing modal if any
    const existingModal = document.getElementById('approval-modal');
    if (existingModal) existingModal.remove();

    const modalId = 'approval-modal';
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.style = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.95); z-index: 10020; display: flex; flex-direction: column;";

    // Build Rows
    let rowsHTML = '';
    if (acts.length === 0) {
        rowsHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #aaa;">Tasdiqlash uchun hujjatlar yo\'q.</td></tr>';
    } else {
        acts.forEach(act => {
            rowsHTML += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <td style="padding: 10px;">${new Date(act.date).toLocaleDateString()}</td>
                    <td style="padding: 10px;">${act.station}</td>
                    <td style="padding: 10px;">${act.master}</td>
                    <td style="padding: 10px;">${act.matSummary || 'No summary'}</td>
                    <td style="padding: 10px;"><span style="background: #f39c12; padding: 2px 8px; border-radius: 4px; font-size: 0.8em;">Kutilmoqda</span></td>
                    <td style="padding: 10px;">
                        <button onclick="viewActForApproval('${act.id}', '${act.deptId}')" style="background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">
                            <i class="fas fa-eye"></i> Ko'rish
                        </button>
                        <button onclick="approveAct('${act.id}')" style="background: #27ae60; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-check"></i> Tasdiqlash
                        </button>
                        <button onclick="rejectAct('${act.id}')" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-left: 5px;">
                             <i class="fas fa-times"></i> Rad etish
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    modal.innerHTML = `
        <div class="window-header" style="background: linear-gradient(90deg, #f39c12 0%, #e67e22 100%); padding: 15px; display: flex; justify-content: space-between; align-items: center;">
            <h2 style="color: white; margin: 0;"><i class="fas fa-clipboard-check"></i> Tasdiqlashni Kutayotgan Hujjatlar</h2>
            <button onclick="closeApprovalWindow()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">&times;</button>
        </div>
        <div class="window-content" style="flex-grow: 1; padding: 20px; color: white; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse; background: rgba(255,255,255,0.05);">
                <thead>
                    <tr style="background: rgba(255,255,255,0.1); text-align: left;">
                        <th style="padding: 10px;">Sana</th>
                        <th style="padding: 10px;">Bekat</th>
                        <th style="padding: 10px;">Ustasi</th>
                        <th style="padding: 10px;">Mazmuni</th>
                        <th style="padding: 10px;">Holati</th>
                        <th style="padding: 10px;">Amallar</th>
                    </tr>
                </thead>
                <tbody id="approval-table-body">${rowsHTML}</tbody>
            </table>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeApprovalWindow() {
    document.getElementById('approval-modal')?.remove();
}

function viewActForApproval(actId, deptId) {
    if (window.viewMaterialAct) {
        window.viewMaterialAct(actId, deptId);
    } else {
        alert("Ko'rish funksiyasi mavjud emas.");
    }
}

function approveAct(actId) {
    if (!confirm("Haqiqatan ham ushbu hujjatni tasdiqlaysizmi? \nOmbordan materiallar chiqim qilinadi.")) return;

    const allActs = JSON.parse(localStorage.getItem('materialActs')) || [];
    const actIndex = allActs.findIndex(a => a.id == actId);

    if (actIndex === -1) {
        alert("Hujjat topilmadi!");
        return;
    }

    const act = allActs[actIndex];
    const items = act.items || [];

    // Deduct Stock
    let deductedCount = 0;

    // Fallback parsing if items specific format is missing but string present (legacy support)
    if (items.length === 0 && act.materials) {
        // If needed, we could parse act.materials string, but sticking to logic.
    }

    items.forEach(item => {
        if (deductMaterialStock(item.name, item.qty)) {
            deductedCount++;
        }
    });

    // Update Status - Bugalteriya tasdiqladi, endi Rahbar imzosini kutadi
    act.status = 'awaiting_signature';
    act.approvedDate = new Date().toISOString();
    act.approvedBy = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.username : 'Bugalteriya';
    allActs[actIndex] = act;
    localStorage.setItem('materialActs', JSON.stringify(allActs));

    // UPDATE virtual PDF file in uploadedFiles 
    if (typeof uploadedFiles !== 'undefined') {
        const virtualFile = uploadedFiles.find(f =>
            f.isVirtual && f.virtualType === 'm29' &&
            (f.virtualDataId == actId || (f.actData && f.actData.id == actId))
        );
        if (virtualFile) {
            virtualFile.status = 'awaiting_signature';
            virtualFile.approvedDate = new Date().toISOString();
            if (typeof saveDatabase === 'function') saveDatabase();

            // Fayllar jadvalini yangilash
            const bugWin = document.getElementById(virtualFile.department + '-window');
            if (bugWin && typeof updateFilesTable === 'function') {
                updateFilesTable(bugWin, virtualFile.department);
            }
        }
    }

    // Log Transaction for Archive
    logTransaction('M-29', {
        id: act.id,
        summary: `M-29 Bugalteriya tasdiqladi (Rahbar imzosi kutilmoqda): ${act.matSummary}`,
        items: items
    });

    alert(`✅ Hujjat tasdiqlandi! ${deductedCount} xil material ombordan chiqim qilindi.\n\n📋 Endi hujjat Rahbar imzosini kutmoqda.\nRahbar → Xizmatlar → "Rahbar Vizasi" orqali E-IMZO qo'yishi kerak.`);

    // Refresh UI
    closeApprovalWindow();
    openApprovalList();

    // Refresh parent table if visible
    if (document.getElementById('accounting-excel-viewer')) {
        closeAccountingViewer();
        openAccountingJournal('MaterialReport', act.deptId);
    }
}

function rejectAct(actId) {
    if (!confirm("Haqiqatan ham ushbu hujjatni rad etmoqchimisiz?")) return;

    const allActs = JSON.parse(localStorage.getItem('materialActs')) || [];
    const actIndex = allActs.findIndex(a => a.id == actId);

    if (actIndex === -1) {
        alert("Hujjat topilmadi!");
        return;
    }

    const act = allActs[actIndex];
    act.status = 'rejected';
    act.rejectedDate = new Date().toISOString();

    allActs[actIndex] = act;
    localStorage.setItem('materialActs', JSON.stringify(allActs));

    alert("Hujjat rad etildi.");
    closeApprovalWindow();
    openApprovalList();

    // Refresh parent table if visible
    if (document.getElementById('accounting-excel-viewer')) {
        closeAccountingViewer();
        openAccountingJournal('MaterialReport', act.deptId);
    }
}

// ===== EXCEL IMPORT FUNKSIYASI (1C dan materiallarni yuklash) =====
function importMaterialsFromExcel(input) {
    const file = input.files[0];
    if (!file) return;

    if (typeof XLSX === 'undefined') {
        // XLSX kutubxonasini yuklash
        const script = document.createElement('script');
        script.src = 'https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js';
        script.onload = () => processExcelImport(file);
        document.head.appendChild(script);
    } else {
        processExcelImport(file);
    }
    // Inputni tozalash
    input.value = '';
}

function processExcelImport(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            if (rows.length < 2) {
                alert('Excel fayl bo\'sh yoki noto\'g\'ri format!');
                return;
            }

            // Sarlavhani aniqlash
            const header = rows[0].map(h => (h || '').toString().toLowerCase().trim());

            // Ustunlarni aniqlash (1C formatini qo'llab-quvvatlash)
            const colMap = {
                schyot: findCol(header, ['schyot', 'счёт', 'счет', 'код', 'code', 'hisob']),
                name: findCol(header, ['nomi', 'nomenklatura', 'номенклатура', 'наименование', 'material', 'name', 'nom']),
                uom: findCol(header, ['o\'lchov', 'olchov', 'birlik', 'единица', 'ед.', 'uom', 'unit']),
                price: findCol(header, ['narx', 'narxi', 'цена', 'price', 'summa']),
                qty: findCol(header, ['soni', 'miqdor', 'количество', 'qty', 'qoldiq', 'остаток']),
            };

            if (colMap.name === -1) {
                alert('Excel faylda "Material nomi" ustuni topilmadi!\n\nQabul qilinadigan ustun nomlari: Nomi, Nomenklatura, Material, Name');
                return;
            }

            // Mavjud materiallarni olish
            let materials = getStoredMaterials();
            let addedCount = 0;
            let updatedCount = 0;

            // Ma'lumotlarni import qilish (1-qatordan boshlash, 0-qator sarlavha)
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.length === 0) continue;

                const name = (colMap.name !== -1 ? (row[colMap.name] || '') : '').toString().trim();
                if (!name) continue;

                const schyot = colMap.schyot !== -1 ? (row[colMap.schyot] || '0000').toString() : '0000';
                const uom = colMap.uom !== -1 ? (row[colMap.uom] || 'dona').toString() : 'dona';
                const price = colMap.price !== -1 ? parseFloat(row[colMap.price]) || 0 : 0;
                const qty = colMap.qty !== -1 ? parseFloat(row[colMap.qty]) || 0 : 0;

                // Mavjud materialni tekshirish
                const existingIdx = materials.findIndex(m => m.name.toLowerCase() === name.toLowerCase());

                if (existingIdx !== -1) {
                    // Yangilash
                    const mat = materials[existingIdx];
                    mat.schyot = schyot;
                    mat.uom = uom;
                    if (price > 0) mat.price = price;
                    if (qty > 0) {
                        mat.begQty = qty;
                        mat.begSum = qty * (mat.price || price);
                        mat.endQty = qty + (parseFloat(mat.inQty) || 0) - (parseFloat(mat.outQty) || 0);
                        mat.endSum = mat.endQty * (mat.price || price);
                    }
                    updatedCount++;
                } else {
                    // Yangi material qo'shish
                    const newId = materials.length > 0 ? Math.max(...materials.map(m => m.id)) + 1 : 1;
                    materials.push({
                        id: newId,
                        schyot: schyot,
                        name: name,
                        uom: uom,
                        price: price,
                        begQty: qty, begSum: qty * price,
                        inQty: 0, inSum: 0,
                        outQty: 0, outSum: 0,
                        endQty: qty, endSum: qty * price
                    });
                    addedCount++;
                }
            }

            // Saqlash
            saveStoredMaterials(materials);

            // Jadvalni yangilash
            const tbody = document.getElementById('material-table-body');
            if (tbody) {
                materialIdCounter = Math.max(...materials.map(m => m.id)) + 1;
                tbody.innerHTML = materials.map(m => createRowHTML(m)).join('');
            }

            alert(`Excel import muvaffaqiyatli!\n\n✅ ${addedCount} ta yangi material qo'shildi\n🔄 ${updatedCount} ta material yangilandi\n📊 Jami: ${materials.length} ta material`);

        } catch (err) {
            console.error('Excel import error:', err);
            alert('Excel faylni o\'qishda xatolik: ' + err.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

// Ustun nomini topish yordamchi funksiya
function findCol(header, variants) {
    for (let i = 0; i < header.length; i++) {
        for (const v of variants) {
            if (header[i].includes(v)) return i;
        }
    }
    return -1;
}


// Global API - Approval
window.checkPendingActs = checkPendingActs;
window.openApprovalList = openApprovalList;
window.approveAct = approveAct;
window.rejectAct = rejectAct;
window.closeApprovalWindow = closeApprovalWindow;
window.viewActForApproval = viewActForApproval;

// Shared API - Material Stock
window.getStoredMaterials = getStoredMaterials;
window.deductMaterialStock = deductMaterialStock;
window.addMaterialStock = addMaterialStock;

// Archive API
window.logTransaction = logTransaction;
window.openArchiveWindow = openArchiveWindow;
window.closeArchiveWindow = closeArchiveWindow;
window.viewArchiveItem = viewArchiveItem;

// Excel Import API
window.importMaterialsFromExcel = importMaterialsFromExcel;
window.processExcelImport = processExcelImport;

// Accounting Journal API
window.openAccountingJournal = openAccountingJournal;
window.loadAccountingTable = loadAccountingTable;
window.closeAccountingViewer = typeof closeAccountingViewer === 'function' ? closeAccountingViewer : function () {
    const viewer = document.getElementById('accounting-excel-viewer');
    if (viewer) viewer.remove();
};
