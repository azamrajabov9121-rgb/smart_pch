// Incoming Material (Trebovanie) Logic - FMU-25 Style
let currentIncomingList = [];
let currentIncomingDeptId = '';

function openIncomingWindow(deptId) {
    currentIncomingDeptId = deptId; // Save for later use
    const modalId = 'incoming-modal';
    let modal = document.getElementById(modalId);

    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.style = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 10006; display: flex; flex-direction: column;";

        modal.innerHTML = `
            <div class="window-header" style="background: linear-gradient(90deg, #27ae60 0%, #2ecc71 100%); flex-shrink: 0;">
                <h2 class="department-name">
                    <i class="fas fa-truck-loading"></i> Kirim Hujjati (Trebovanie FMU-25)
                </h2>
                <button class="close-btn" onclick="closeIncomingWindow()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="window-content" style="flex-grow: 1; padding: 20px; background: #5a6e7f; display: flex; justify-content: center; overflow-y: auto;">
                
                <!-- DOCUMENT CONTAINER: FMU-25 Style -->
                <div style="background: white; width: 95%; max-width: 1400px; min-height: 210mm; padding: 15mm; color: black; font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.2; box-shadow: 0 0 30px rgba(0,0,0,0.5); margin-bottom: 50px; transform-origin: top center;">
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="font-size: 10pt;">
                            <div>(korxona) ______________________</div>
                        </div>
                        <div style="text-align: right; font-size: 10pt;">
                            <div>Forma № FMU-25</div>
                            <div>Tasdiqlangan formaga muvofiq</div>
                        </div>
                    </div>

                    <h2 style="text-align: center; margin: 20px 0; text-transform: uppercase; color: black !important; text-shadow: none !important; font-weight: 900; letter-spacing: 1px; font-family: 'Times New Roman', serif;">Talabnoma (Trebovanie) № <input type="text" value="1" style="width: 50px; text-align: center; border: none; border-bottom: 2px solid black; font-weight: bold; font-size: 14pt; color: black !important; background: transparent;"></h2>

                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <div>
                            Sana: <input type="date" id="inc-date" value="${new Date().toISOString().split('T')[0]}" style="font-family: inherit;">
                        </div>
                        <div>
                            <select id="inc-sender" style="border: none; border-bottom: 1px solid black; outline: none;">
                                <option value="Markaziy Ombor">Markaziy Ombor</option>
                                <option value="Ta'minotchi">Ta'minotchi</option>
                            </select>
                            dan
                            <select id="inc-receiver" style="border: none; border-bottom: 1px solid black; outline: none;">
                                <option value="${deptId}">${deptId} -uchastka</option>
                                <option value="Ombor">Ombor</option>
                            </select>
                            ga
                        </div>
                    </div>

                    <!-- TABLE FMU-25 -->
                    <table style="width: 100%; border-collapse: collapse; border: 2px solid black; font-size: 11pt;">
                        <thead>
                            <tr style="text-align: center;">
                                <th colspan="2" style="border: 1px solid black;">Schyot</th>
                                <th rowspan="2" style="border: 1px solid black; width: 30%;">Material Nomi, navi, o'lchami</th>
                                <th rowspan="2" style="border: 1px solid black;">O'lchov<br>birligi</th>
                                <th colspan="2" style="border: 1px solid black;">Miqdori</th>
                                <th rowspan="2" style="border: 1px solid black;">Narxi<br>(so'm)</th>
                                <th rowspan="2" style="border: 1px solid black;">Summasi<br>(so'm)</th>
                                <th rowspan="2" style="border: 1px solid black;">*</th>
                            </tr>
                            <tr style="text-align: center; font-size: 10pt;">
                                <th style="border: 1px solid black;">Sintetik</th>
                                <th style="border: 1px solid black;">Analitik</th>
                                <th style="border: 1px solid black;">So'ralgan</th>
                                <th style="border: 1px solid black;">Berilgan</th>
                            </tr>
                        </thead>
                        <tbody id="inc-table-body">
                            <!-- Rows go here -->
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="7" style="text-align: right; font-weight: bold; padding: 5px; border: 1px solid black;">JAMI:</td>
                                <td id="inc-grand-total" style="font-weight: bold; padding: 5px; border: 1px solid black;">0</td>
                                <td style="border: 1px solid black;"></td>
                            </tr>
                        </tfoot>
                    </table>

                    <!-- ADD ITEM FORM (Hidden in Print, Visible in App) -->
                    <div style="background: #e8f5e9; padding: 10px; margin-top: 10px; border: 1px dashed green; display: flex; gap: 5px; align-items: flex-end; flex-wrap: wrap;">
                        <div style="width: 60px;"><label style="font-size: 9px;">Schyot</label><input type="text" id="add-schyot" value="1010" style="width: 100%;"></div>
                        <div style="width: 60px;"><label style="font-size: 9px;">Kod</label><input type="text" id="add-code" value="001" style="width: 100%;"></div>
                        <div style="flex-grow: 1; min-width: 150px;">
                            <label style="font-size: 9px;">Nomi</label>
                            <input type="text" id="add-name" list="mat-suggestions" style="width: 100%;">
                            <datalist id="mat-suggestions"></datalist>
                        </div>
                        <div style="width: 60px;">
                            <label style="font-size: 9px;">Birlik</label>
                            <select id="add-uom" style="width: 100%;">
                                <option>dona</option><option>kg</option><option>litr</option><option>metr</option>
                            </select>
                        </div>
                        <div style="width: 70px;"><label style="font-size: 9px;">So'ralgan</label><input type="number" id="add-req" style="width: 100%;"></div>
                        <div style="width: 70px;"><label style="font-size: 9px;">Berilgan</label><input type="number" id="add-rel" style="width: 100%;"></div>
                        <div style="width: 80px;"><label style="font-size: 9px;">Narx</label><input type="number" id="add-price" style="width: 100%;"></div>
                        <button onclick="addFMURow()" style="background: green; color: white; border: none; padding: 5px 10px; cursor: pointer;">+</button>
                    </div>

                    <!-- Signatures -->
                    <div style="margin-top: 40px; display: flex; justify-content: space-between; padding: 0 50px;">
                        <div>
                            <div>So'radi: _____________________</div>
                            <div style="font-size: 10pt; margin-left: 60px;">(imzo)</div>
                        </div>
                        <div>
                            <div>Ruxsat berdi: _____________________</div>
                            <div style="font-size: 10pt; margin-left: 90px;">(imzo)</div>
                        </div>
                        <div>
                            <div>Oldim: _____________________</div>
                            <div style="font-size: 10pt; margin-left: 60px;">(imzo)</div>
                        </div>
                    </div>

                     <!-- Actions -->
                    <div style="text-align: center; margin-top: 50px;">
                        <button onclick="saveFMUAct()" style="background: #27ae60; color: white; padding: 10px 30px; border: none; font-size: 16px; cursor: pointer;">
                            <i class="fas fa-save"></i> BAZAGA KIRIM QILISH
                        </button>
                    </div>

                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.classList.add('active');
    populateSuggestions();
}

function closeIncomingWindow() {
    document.getElementById('incoming-modal')?.remove();
    currentIncomingList = []; // Eski ma'lumotlarni tozalash
}

function populateSuggestions() {
    const list = document.getElementById('mat-suggestions');
    if (list && window.getStoredMaterials) {
        list.innerHTML = '';
        window.getStoredMaterials().forEach(m => {
            const op = document.createElement('option');
            op.value = m.name;
            list.appendChild(op);
        });
    }
}

function addFMURow() {
    const schyot = document.getElementById('add-schyot').value;
    const code = document.getElementById('add-code').value;
    const name = document.getElementById('add-name').value;
    const uom = document.getElementById('add-uom').value;
    const req = parseFloat(document.getElementById('add-req').value) || 0;
    const rel = parseFloat(document.getElementById('add-rel').value) || 0;
    const price = parseFloat(document.getElementById('add-price').value) || 0;

    if (!name || rel <= 0) {
        alert("Nom va Berilgan miqdor shart!");
        return;
    }

    currentIncomingList.push({
        schyot, code, name, uom, req, rel, price,
        sum: rel * price
    });

    // reset most fields but keep schyot logic
    document.getElementById('add-name').value = '';
    document.getElementById('add-req').value = '';
    document.getElementById('add-rel').value = '';

    renderFMUTable();
}

function renderFMUTable() {
    const tbody = document.getElementById('inc-table-body');
    tbody.innerHTML = '';
    let total = 0;

    currentIncomingList.forEach((item, idx) => {
        total += item.sum;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="border: 1px solid black; padding: 5px; text-align: center;">${item.schyot}</td>
            <td style="border: 1px solid black; padding: 5px; text-align: center;">${item.code}</td>
            <td style="border: 1px solid black; padding: 5px;">${item.name}</td>
            <td style="border: 1px solid black; padding: 5px; text-align: center;">${item.uom}</td>
            <td style="border: 1px solid black; padding: 5px; text-align: center;">${item.req}</td>
            <td style="border: 1px solid black; padding: 5px; text-align: center;">${item.rel}</td>
            <td style="border: 1px solid black; padding: 5px; text-align: right;">${item.price.toLocaleString()}</td>
            <td style="border: 1px solid black; padding: 5px; text-align: right;">${item.sum.toLocaleString()}</td>
            <td style="border: 1px solid black; text-align: center;">
                <button onclick="delFMUItem(${idx})" style="color: red; border: none; background: none; cursor: pointer;">x</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    document.getElementById('inc-grand-total').textContent = total.toLocaleString();
}

function delFMUItem(idx) {
    currentIncomingList.splice(idx, 1);
    renderFMUTable();
}

function saveFMUAct() {
    if (currentIncomingList.length === 0) return;
    if (!confirm("Materiallar omborga kirim qilinsinmi?")) return;

    let count = 0;
    if (window.addMaterialStock) {
        currentIncomingList.forEach(item => {
            // We use 'rel' (released/berilgan) as the actual incoming amount
            window.addMaterialStock(item.name, item.rel, item.price, item.uom);
            count++;
        });
        if (window.logTransaction) {
            window.logTransaction('Incoming', {
                items: currentIncomingList,
                totalSum: currentIncomingList.reduce((sum, i) => sum + i.sum, 0),
                department: currentIncomingDeptId
            });
        }
        alert(count + " ta material kirim qilindi!");
        closeIncomingWindow();
    } else {
        alert("Xatolik: accounting.js");
    }
}

// Global Exports
window.openIncomingWindow = openIncomingWindow;
window.closeIncomingWindow = closeIncomingWindow;
window.addFMURow = addFMURow;
window.delFMUItem = delFMUItem;
window.saveFMUAct = saveFMUAct;
