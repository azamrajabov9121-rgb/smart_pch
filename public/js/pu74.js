// PU-74: Iqtisod bo'limi uchun Excel (Luckysheet) moduli
// 1-brigada va 2-brigada tugmalari bilan
// YANGILANGAN: Akt yaratish va Izohlar tizimi

let pu74CurrentFile = '';
let pu74ActsData = {}; // Aktlar ma'lumotlarini saqlash uchun

// 1. Brigada tanlash oynasini ochish
function openPU74Window(deptId) {
    let modal = document.getElementById('pu74-selection-modal');
    if (modal) modal.remove();

    // Modal yaratish
    modal = document.createElement('div');
    modal.id = 'pu74-selection-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px);
        z-index: 10000; display: flex; align-items: center; justify-content: center;
        opacity: 0; transition: opacity 0.3s ease;
    `;

    modal.innerHTML = `
        <div class="pu74-selection-card" style="
            background: rgba(30, 41, 59, 0.95); border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px; padding: 40px; width: 600px; text-align: center;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5); transform: translateY(20px); transition: transform 0.3s ease;
        ">
            <h2 style="
                margin: 0 0 30px 0; font-size: 2rem; 
                background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                text-transform: uppercase; letter-spacing: 2px;
            ">
                <i class="fas fa-file-invoice-dollar"></i> PU-74 Hisobot
            </h2>
            
            <p style="color: rgba(255,255,255,0.6); margin-bottom: 40px; font-size: 1.1rem;">
                Iltimos, ishlamoqchi bo'lgan brigadangizni tanlang:
            </p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <!-- 1-Brigada -->
                <button onclick="loadPU74Brigade('1-brigada.xlsx', '1-BRIGADA')" style="
                    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
                    border: none; padding: 30px 20px; border-radius: 15px; cursor: pointer;
                    color: white; font-weight: bold; font-size: 1.2rem;
                    transition: transform 0.2s, box-shadow 0.2s;
                    display: flex; flex-direction: column; align-items: center; gap: 15px;
                " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 20px rgba(46, 204, 113, 0.3)'"
                  onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    
                    <div style="
                        width: 60px; height: 60px; background: rgba(255,255,255,0.2); 
                        border-radius: 50%; display: flex; align-items: center; justify-content: center;
                        font-size: 1.8rem;
                    ">1</div>
                    <span>1-BRIGADA</span>
                </button>

                <!-- 2-Brigada -->
                <button onclick="loadPU74Brigade('2-brigada.xlsx', '2-BRIGADA')" style="
                    background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
                    border: none; padding: 30px 20px; border-radius: 15px; cursor: pointer;
                    color: white; font-weight: bold; font-size: 1.2rem;
                    transition: transform 0.2s, box-shadow 0.2s;
                    display: flex; flex-direction: column; align-items: center; gap: 15px;
                " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 20px rgba(230, 126, 34, 0.3)'"
                  onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    
                    <div style="
                        width: 60px; height: 60px; background: rgba(255,255,255,0.2); 
                        border-radius: 50%; display: flex; align-items: center; justify-content: center;
                        font-size: 1.8rem;
                    ">2</div>
                    <span>2-BRIGADA</span>
                </button>
            </div>

            <button onclick="closePU74Selection()" style="
                margin-top: 40px; background: transparent; border: 1px solid rgba(255,255,255,0.2);
                color: rgba(255,255,255,0.5); padding: 10px 30px; border-radius: 30px; cursor: pointer;
                transition: all 0.2s;
            " onmouseover="this.style.borderColor='white'; this.style.color='white'">
                Bekor qilish
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    // Animatsiya uchun
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
        modal.querySelector('.pu74-selection-card').style.transform = 'translateY(0)';
    });

    // Akt ma'lumotlarini yuklab olish
    loadActsData();
}

function closePU74Selection() {
    const modal = document.getElementById('pu74-selection-modal');
    if (modal) {
        modal.style.opacity = '0';
        modal.querySelector('.pu74-selection-card').style.transform = 'translateY(20px)';
        setTimeout(() => modal.remove(), 300);
    }
}

// 2. Excel faylni Luckysheet orqali yuklash
function loadPU74Brigade(fileName, title) {
    closePU74Selection();
    pu74CurrentFile = fileName;

    // Katta oyna yaratish (Fullscreen Excel Viewer)
    let viewer = document.getElementById('pu74-excel-viewer');
    if (viewer) viewer.remove();

    viewer = document.createElement('div');
    viewer.id = 'pu74-excel-viewer';
    viewer.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: white; z-index: 10001; display: flex; flex-direction: column;
    `;

    viewer.innerHTML = `
        <div style="
            height: 48px; background: #217346; color: white; display: flex; 
            align-items: center; justify-content: space-between; padding: 0 15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 10;
        ">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-weight: bold; font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-table"></i> ${title}
                </div>
                <span style="font-size: 0.8rem; opacity: 0.8; background: rgba(0,0,0,0.2); padding: 2px 8px; border-radius: 4px;">
                    ${fileName}
                </span>
            </div>
            
            <div style="display: flex; gap: 10px; align-items: center;">
                 <button onclick="createActForSelectedCell()" style="
                    background: #f39c12; border: none; color: white; padding: 6px 15px; 
                    border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.9rem;
                    display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                " onmouseover="this.style.background='#e67e22'" onmouseout="this.style.background='#f39c12'">
                    <i class="fas fa-file-contract"></i> Akt Yaratish
                </button>

                <div style="width: 1px; height: 24px; background: rgba(255,255,255,0.3); margin: 0 5px;"></div>

                <button onclick="savePU74Excel()" style="
                    background: #27ae60; border: none; color: white; padding: 6px 15px; 
                    border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.9rem;
                    display: flex; align-items: center; gap: 5px;
                " onmouseover="this.style.background='#2ecc71'" onmouseout="this.style.background='#27ae60'">
                    <i class="fas fa-save"></i> Saqlash
                </button>
                
                <button onclick="closePU74Viewer()" style="
                    background: #c0392b; border: none; color: white; padding: 6px 15px; 
                    border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.9rem;
                " onmouseover="this.style.background='#e74c3c'" onmouseout="this.style.background='#c0392b'">
                    <i class="fas fa-times"></i> Yopish
                </button>
            </div>
        </div>
        
        <div id="luckysheet" style="margin:0px;padding:0px;position:absolute;width:100%;left:0px;top:48px;bottom:0px;"></div>
        
        <div id="pu74-loading" style="
            position: absolute; top: 48px; left: 0; width: 100%; height: calc(100% - 48px);
            background: rgba(255,255,255,0.9); z-index: 20; display: flex; 
            flex-direction: column; align-items: center; justify-content: center;
        ">
            <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #217346; margin-bottom: 20px;"></i>
            <div style="font-size: 1.2rem; color: #333;">Excel fayl yuklanmoqda...</div>
        </div>
    `;

    document.body.appendChild(viewer);

    // Faylni yuklash va Luckysheet ga berish
    // XMLHttpRequest ishlatish (fetch file:// protokolda ishlamaydi)
    function initLuckysheetWithBuffer(buffer) {
        if (!window.LuckyExcel) {
            alert("LuckyExcel kutubxonasi topilmadi! Internet aloqasini tekshiring.");
            closePU74Viewer();
            return;
        }

        window.LuckyExcel.transformExcelToLucky(buffer, function (exportJson, luckysheetfile) {
            if (exportJson.sheets == null || exportJson.sheets.length == 0) {
                alert("Excel fayl o'qishda xatolik!");
                closePU74Viewer();
                return;
            }

            // LocalStorage da saqlangan ma'lumot bor? Uni ishlatamiz
            const saveKey = `pu74_data_${fileName}`;
            const savedData = localStorage.getItem(saveKey);
            const sheetsToLoad = savedData ? JSON.parse(savedData) : exportJson.sheets;

            // Loader ni o'chirish
            const loader = document.getElementById('pu74-loading');
            if (loader) loader.style.display = 'none';

            // Luckysheet init
            try {
                console.log("Luckysheet creating...", savedData ? "(from localStorage)" : "(from Excel file)");

                window.luckysheet.create({
                    container: 'luckysheet',
                    data: sheetsToLoad,
                    title: title || fileName,
                    userInfo: false,
                    lang: 'ru',
                    showinfobar: false,
                    showsheetbar: true,
                    showstatisticBar: true,
                    enableAddRow: true,
                    enableAddBackTop: true,
                    rowHeaderWidth: 46,
                    columnHeaderHeight: 20,
                    sheetFormulaBar: true,
                    hook: {
                        workbookCreateAfter: function (json) {
                            console.log("Luckysheet yuklandi");
                            restoreActsAsComments();
                        }
                    }
                });
            } catch (e) {
                alert("Luckysheet xatosi: " + e.message);
                console.error(e);
            }
        });
    }

    // 1-usul: XMLHttpRequest (lokal fayllar uchun)
    var xhr = new XMLHttpRequest();
    xhr.open('GET', fileName, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function () {
        if (xhr.status === 200 || xhr.status === 0) { // status 0 = lokal fayl
            initLuckysheetWithBuffer(xhr.response);
        } else {
            console.error("XHR xatosi:", xhr.status);
            fallbackFilePicker();
        }
    };

    xhr.onerror = function () {
        console.error("XHR xatosi - fayl topilmadi");
        fallbackFilePicker();
    };

    xhr.send();

    // 2-usul: Fallback - faylni qo'lda tanlash
    function fallbackFilePicker() {
        const loader = document.getElementById('pu74-loading');
        if (loader) {
            loader.innerHTML = `
                <div style="text-align: center; padding: 30px;">
                    <i class="fas fa-folder-open" style="font-size: 3rem; color: #f39c12; margin-bottom: 20px;"></i>
                    <div style="font-size: 1.2rem; color: #333; margin-bottom: 15px; font-weight: bold;">
                        Excel fayli topilmadi
                    </div>
                    <p style="color: #666; margin-bottom: 5px;">"<b>${fileName}</b>" fayli loyiha papkasida mavjud emas.</p>
                    <p style="color: #666; margin-bottom: 20px;">Iltimos, faylni kompyuteringizdan tanlang:</p>
                    <label style="
                        background: #217346; color: white; padding: 12px 30px;
                        border-radius: 8px; cursor: pointer; font-size: 1rem;
                        display: inline-flex; align-items: center; gap: 10px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    ">
                        <i class="fas fa-folder-open"></i> Faylni Tanlash (.xlsx)
                        <input type="file" accept=".xlsx,.xls" style="display: none;" 
                            onchange="handlePU74FileSelect(this)">
                    </label>
                    <br><br>
                    <button onclick="closePU74Viewer()" style="
                        background: transparent; border: 1px solid #ccc; color: #666; 
                        padding: 8px 20px; border-radius: 5px; cursor: pointer;">
                        Bekor qilish
                    </button>
                </div>
            `;
        }
    }
}

// 3. Akt yaratish logikasi
function createActForSelectedCell() {
    // Tanlangan katakni olish
    const range = luckysheet.getRange();
    // range bu array of objects: [{row: [0, 0], column: [0, 0]}]

    if (!range || range.length === 0) {
        alert("Iltimos, avval katakni tanlang!");
        return;
    }

    const r = range[0].row[0];
    const c = range[0].column[0];

    // Hozirgi sheet indexi
    const sheetFile = luckysheet.getSheetData();
    // luckysheet.getSheet() bu global funksiya emas, balki ma'lumot olish usuli
    // Eng oddiysi, hozirgi sheetni olish
    const sheetIndex = luckysheet.getSheet().index;

    openActModal(r, c, sheetIndex);
}

function openActModal(row, col, sheetIndex) {
    let oldModal = document.getElementById('pu74-act-modal');
    if (oldModal) oldModal.remove();

    const cellKey = `${pu74CurrentFile}_${sheetIndex}_${row}_${col}`;
    const existingAct = pu74ActsData[cellKey] || { desc: '', image: '' };

    const modal = document.createElement('div');
    modal.id = 'pu74-act-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); z-index: 20000;
        display: flex; align-items: center; justify-content: center;
        backdrop-filter: blur(5px);
    `;

    modal.innerHTML = `
        <div style="background: white; padding: 25px; border-radius: 10px; width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
            <h3 style="margin-top: 0; color: #2c3e50; border-bottom: 2px solid #f39c12; padding-bottom: 10px;">
                <i class="fas fa-file-contract"></i> Dalolatnoma (Akt) Yaratish
            </h3>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">Izoh / Tavsif:</label>
                <textarea id="act-desc" style="width: 100%; height: 100px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; resize: vertical;" placeholder="Masalan: Relsda darz ketish aniqlandi...">${existingAct.desc || ''}</textarea>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">Rasm (URL yoki Fayl):</label>
                <input type="text" id="act-image-url" value="${existingAct.image || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;" placeholder="https://example.com/image.jpg">
                <div style="margin-top: 5px; font-size: 0.8rem; color: #888;">(Hozircha faqat URL qo'llab-quvvatlanadi)</div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button onclick="document.getElementById('pu74-act-modal').remove()" style="padding: 8px 20px; border: 1px solid #ccc; background: white; border-radius: 5px; cursor: pointer;">Bekor qilish</button>
                <button onclick="saveActData(${row}, ${col}, '${sheetIndex}')" style="padding: 8px 20px; border: none; background: #27ae60; color: white; border-radius: 5px; cursor: pointer; font-weight: bold;">Saqlash</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}


function saveActData(row, col, sheetIndex) {
    const desc = document.getElementById('act-desc').value;
    const image = document.getElementById('act-image-url').value;
    const cellKey = `${pu74CurrentFile}_${sheetIndex}_${row}_${col}`;

    if (desc || image) {
        pu74ActsData[cellKey] = { desc, image, date: new Date().toISOString() };

        // LocalStorage ga yozish
        localStorage.setItem('pu74_acts_data', JSON.stringify(pu74ActsData));

        // Hujayrani bo'yash (Vizual belgi - Orange)
        // Luckysheet API: setCellValue(row, col, value_object)
        // value_object da {bg: '#color'} bo'lishi kerak.
        // Lekin biz eski qiymatni saqlab qolishimiz kerak.
        const currentVal = luckysheet.getCellValue(row, col);
        let newVal = {};
        if (typeof currentVal === 'object' && currentVal !== null) {
            newVal = { ...currentVal, bg: '#f39c12' };
        } else {
            newVal = { v: currentVal, bg: '#f39c12' };
        }

        luckysheet.setCellValue(row, col, newVal);

        alert("Dalolatnoma saqlandi! Katak rangi o'zgartirildi.");
    }

    document.getElementById('pu74-act-modal').remove();
}

function loadActsData() {
    const data = localStorage.getItem('pu74_acts_data');
    if (data) {
        pu74ActsData = JSON.parse(data);
    }
}

function restoreActsAsComments() {
    // Acts ma'lumotlarini yuklash
    loadActsData();

    // Hozirgi sheet
    // Luckysheet yuklanganda, odatda 1-sheet (index 0) activ bo'ladi yoki saqlangan holat.
    // Biz barcha sheetlar uchun tekshirishimiz mumkin, lekin Luckysheet API si asosan aktiv sheet bilan ishlaydi.
    // Hozircha faqat aktiv sheet dagi kataklarni bo'yaymiz.

    const sheetData = luckysheet.getSheetData(); // Bu 2D array
    // sheetData[row][col] -> object

    // Hozirgi sheet indexini olish
    // luckysheet.getSheet() -> sheet configuration object
    const currentSheetIndex = luckysheet.getSheet().index;

    // Barcha aktlarni ko'rib chiqish
    for (const key in pu74ActsData) {
        // key format: fileName_sheetIndex_row_col
        // "1-brigada.xlsx_0_5_2"

        const parts = key.split('_');
        // Fayl nomida "_" bo'lishi mumkinligi uchun, oxiridan ajratamiz
        // row: parts[parts.length-2]
        // col: parts[parts.length-1]
        // sheet: parts[parts.length-3]

        if (parts.length < 4) continue;

        const col = parseInt(parts.pop());
        const row = parseInt(parts.pop());
        const shIndex = parts.pop(); // Sheet index string bo'lishi mumkin
        const fName = parts.join('_'); // Qolgan qismi fayl nomi

        if (fName === pu74CurrentFile && shIndex == currentSheetIndex) {
            // Hujayrani bo'yash
            const currentVal = luckysheet.getCellValue(row, col);
            let newVal = {};
            if (typeof currentVal === 'object' && currentVal !== null) {
                newVal = { ...currentVal, bg: '#f39c12' };
            } else {
                newVal = { v: currentVal, bg: '#f39c12' };
            }
            luckysheet.setCellValue(row, col, newVal);
        }
    }

    // Refresh qilish (ba'zan kerak bo'ladi)
    luckysheet.refresh();
}


function closePU74Viewer() {
    const viewer = document.getElementById('pu74-excel-viewer');
    if (viewer) viewer.remove();
}

function savePU74Excel() {
    try {
        // Luckysheet dan joriy ma'lumotlarni olish
        const allSheets = window.luckysheet ? window.luckysheet.getAllSheets() : null;

        if (allSheets && allSheets.length > 0) {
            // localStorage ga saqlash (JSON formatda)
            const saveKey = `pu74_data_${pu74CurrentFile}`;
            localStorage.setItem(saveKey, JSON.stringify(allSheets));

            // AKT ma'lumotlarini ham saqlash
            localStorage.setItem('pu74_acts_data', JSON.stringify(pu74ActsData));

            // Tugma ko'rinishini o'zgartirish
            const btn = document.querySelector('#pu74-excel-viewer button i.fa-save');
            if (btn && btn.parentElement) {
                const originalBg = btn.parentElement.style.background;
                const originalHTML = btn.parentElement.innerHTML;
                btn.parentElement.style.background = '#2ecc71';
                btn.parentElement.innerHTML = '<i class="fas fa-check"></i> Saqlandi!';
                setTimeout(() => {
                    btn.parentElement.style.background = originalBg;
                    btn.parentElement.innerHTML = originalHTML;
                }, 2000);
            }

            if (typeof showToast === 'function') {
                showToast(`"${pu74CurrentFile}" muvaffaqiyatli saqlandi!`, 'success');
            } else {
                alert(`"${pu74CurrentFile}" saqlandi!`);
            }
        } else {
            if (typeof showToast === 'function') {
                showToast('Saqlash uchun ma\'lumot topilmadi!', 'error');
            }
        }
    } catch (e) {
        console.error('PU74 saqlash xatosi:', e);
        alert('Saqlashda xatolik: ' + e.message);
    }
}

// Qo'lda fayl tanlash uchun handler
function handlePU74FileSelect(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const buffer = e.target.result;

        if (!window.LuckyExcel) {
            alert("LuckyExcel kutubxonasi topilmadi! Internet aloqasini tekshiring.");
            closePU74Viewer();
            return;
        }

        window.LuckyExcel.transformExcelToLucky(buffer, function (exportJson) {
            if (!exportJson.sheets || exportJson.sheets.length === 0) {
                alert("Excel fayl o'qishda xatolik!");
                closePU74Viewer();
                return;
            }

            const loader = document.getElementById('pu74-loading');
            if (loader) loader.style.display = 'none';

            try {
                window.luckysheet.create({
                    container: 'luckysheet',
                    data: exportJson.sheets,
                    title: file.name,
                    userInfo: false,
                    lang: 'ru',
                    showinfobar: false,
                    showsheetbar: true,
                    showstatisticBar: true,
                    enableAddRow: true,
                    enableAddBackTop: true,
                    rowHeaderWidth: 46,
                    columnHeaderHeight: 20,
                    sheetFormulaBar: true,
                    hook: {
                        workbookCreateAfter: function () {
                            console.log("Luckysheet yuklandi (qo'lda tanlangan fayl)");
                            restoreActsAsComments();
                        }
                    }
                });
            } catch (e) {
                alert("Luckysheet xatosi: " + e.message);
                console.error(e);
            }
        });
    };
    reader.readAsArrayBuffer(file);
}

// Global scope ga chiqarish
window.openPU74Window = openPU74Window;
window.loadPU74Brigade = loadPU74Brigade;
window.closePU74Selection = closePU74Selection;
window.closePU74Viewer = closePU74Viewer;
window.savePU74Excel = savePU74Excel;
window.createActForSelectedCell = createActForSelectedCell;
window.saveActData = saveActData;
window.handlePU74FileSelect = handlePU74FileSelect;
