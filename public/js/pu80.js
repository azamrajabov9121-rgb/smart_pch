// PU-80: Qat'iy nazoratdagi ish qurollari jurnali
// Logic for strict tool control with time-based warnings

// Store data in localStorage: 'pu80Data'
function getPU80Data() {
    try {
        const data = localStorage.getItem('pu80Data');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Error parsing PU-80 data:", e);
        return [];
    }
}

function savePU80Data(data) {
    try {
        localStorage.setItem('pu80Data', JSON.stringify(data));
    } catch (e) {
        console.error("Error saving PU-80 data:", e);
    }
}

// Open PU-80 Window
// Open PU-80 Window
function openPU80Window(deptId) {
    console.log("Opening PU-80 Window for Dept:", deptId);
    try {
        // Create modal structure if not exists
        let modal = document.getElementById('pu80-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'pu80-modal';
            modal.className = 'department-window';
            modal.style.zIndex = '10005';
            modal.innerHTML = `
            <div class="window-header" style="background: linear-gradient(90deg, #1cb5e0 0%, #000851 100%);">
                <h2 class="department-name">
                    <i class="fas fa-tools"></i> PU-80: Qat'iy Nazoratdagi Ish Qurollari
                </h2>
                <button class="close-btn" onclick="closePU80Window()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="window-content" id="pu80-content" style="padding: 20px; background: #0f172a;">
                
                <!-- Add New Entry Form -->
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.1);">
                    <h3 style="color: #00c6ff; margin-top: 0; margin-bottom: 15px;">Yangi Kirim Qo'shish</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; align-items: end;">
                        <div>
                            <label style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Ish Quroli</label>
                            <input type="text" id="pu80-tool-select" placeholder="M: Drel, Bolg'a..." style="width: 100%; padding: 10px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 6px;">
                        </div>
                        <div>
                            <label style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Raqami</label>
                            <input type="text" id="pu80-tool-number" placeholder="№ 12345" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 6px;">
                        </div>
                        <div>
                            <label style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Mas'ul Xodim</label>
                            <input type="text" id="pu80-responsible" placeholder="F.I.Sh." style="width: 100%; padding: 10px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 6px;">
                        </div>
                        <div>
                            <button onclick="initiateAddPU80Entry('${deptId}')" style="width: 100%; padding: 10px; background: #00c6ff; border: none; color: white; font-weight: bold; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-plus"></i> Qo'shish (Imzo Bilan)
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Active Tools Table -->
                <h3 style="color: #00c6ff;">Faol (Topshirilmagan) Qurollar</h3>
                <div class="employee-table-container">
                    <table class="employee-table" style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid rgba(0,198,255,0.3); color: #00c6ff;">
                                <th style="padding: 12px; text-align: left;">Ish Quroli</th>
                                <th style="padding: 12px; text-align: left;">Raqami</th>
                                <th style="padding: 12px; text-align: left;">Mas'ul</th>
                                <th style="padding: 12px; text-align: center;">Olingan Imzo</th>
                                <th style="padding: 12px; text-align: center;">Olingan Vaqt</th>
                                <th style="padding: 12px; text-align: center;">Holat</th>
                                <th style="padding: 12px; text-align: center;">Amallar</th>
                            </tr>
                        </thead>
                        <tbody id="pu80-table-body">
                            <!-- Rows will be added here -->
                        </tbody>
                    </table>
                </div>

            </div>
        `;
            document.body.appendChild(modal);
        }

        renderPU80Table(deptId);

        // Show modal
        modal.classList.add('active');
        // Ensure overlay logic exists or fallback
        const overlay = document.getElementById('department-overlay');
        if (overlay) overlay.classList.add('active');

    } catch (error) {
        console.error("PU-80 Error:", error);
        alert("PU-80 oynasini ochishda xatolik yuz berdi: " + error.message);
    }
}

function closePU80Window() {
    const modal = document.getElementById('pu80-modal');
    if (modal) modal.classList.remove('active');
    const overlay = document.getElementById('department-overlay');
    if (overlay) overlay.classList.remove('active');

    // Close signature modal just in case
    closeSignatureModal();
}

// Global variables for signature logic
let isSigningForReturn = false;
let pendingNewEntry = null;

function initiateAddPU80Entry(deptId) {
    const toolName = document.getElementById('pu80-tool-select').value;
    const toolNumber = document.getElementById('pu80-tool-number').value;
    const responsible = document.getElementById('pu80-responsible').value;

    if (!toolName || !responsible || !toolNumber) {
        alert("Barcha maydonlarni to'ldiring!");
        return;
    }

    pendingNewEntry = {
        deptId: deptId,
        toolName: toolName,
        toolNumber: toolNumber,
        responsible: responsible
    };

    isSigningForReturn = false;
    const now = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    const detailsHTML = `
        <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 15px; text-align: left; font-size: 0.9rem; color: #ccc;">
            <div style="margin-bottom: 5px;"><strong>Ish Quroli:</strong> <span style="color: white;">${toolName}</span></div>
            <div style="margin-bottom: 5px;"><strong>Inventar Raqami:</strong> <span style="color: white;">${toolNumber}</span></div>
            <div style="margin-bottom: 5px;"><strong>Mas'ul Shaxs:</strong> <span style="color: white;">${responsible}</span></div>
            <div><strong>Vaqt:</strong> <span style="color: #00c6ff;">${now}</span></div>
        </div>
    `;
    openSignatureModal("Mulkni olishni tasdiqlash (Imzo)", detailsHTML);
}

function returnPU80Tool(id, deptId) {
    currentSignatureId = id;
    currentSignatureDeptId = deptId;
    isSigningForReturn = true;

    const data = getPU80Data();
    const item = data.find(e => e.id === id);
    let detailsHTML = '';

    if (item) {
        const now = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
        detailsHTML = `
            <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 15px; text-align: left; font-size: 0.9rem; color: #ccc;">
                <div style="margin-bottom: 5px;"><strong>Ish Quroli:</strong> <span style="color: white;">${item.toolName}</span></div>
                <div style="margin-bottom: 5px;"><strong>Inventar Raqami:</strong> <span style="color: white;">${item.toolNumber}</span></div>
                <div style="margin-bottom: 5px;"><strong>Mas'ul Shaxs:</strong> <span style="color: white;">${item.responsible}</span></div>
                 <div><strong>Topshirish Vaqti:</strong> <span style="color: #e74c3c;">${now}</span></div>
            </div>
        `;
    }

    openSignatureModal("Mulkni topshirishni tasdiqlash (Imzo)", detailsHTML);
}

function openSignatureModal(title, detailsHTML = '') {
    // Remove existing signature modal if any
    const existingModal = document.getElementById('signature-modal');
    if (existingModal) existingModal.remove();

    const signatureModalHTML = `
        <div id="signature-modal" style="
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: rgba(0,0,0,0.8); 
            z-index: 20000; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            backdrop-filter: blur(5px);
        ">
            <div style="background: #1e293b; padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); width: 500px; max-width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <div style="text-align: center; margin-bottom: 20px;">
                     <h3 style="color: white; margin: 0 0 5px 0;"><i class="fas fa-pen-nib" style="color:#2ecc71;"></i> ${title}</h3>
                     <p style="color: #aaa; margin: 0; font-size: 0.9rem;">Iltimos, pastdagi maydonga imzo qo'ying</p>
                </div>
                
                ${detailsHTML}

                <div style="background: white; border-radius: 8px; margin: 15px 0; overflow: hidden; position: relative;">
                    <canvas id="signature-pad" width="450" height="200" style="display: block; cursor: crosshair; touch-action: none;"></canvas>
                    <div style="position: absolute; bottom: 5px; right: 10px; color: #ccc; font-size: 0.8rem; pointer-events: none;">Imzo maydoni</div>
                </div>

                <div style="display: flex; gap: 10px; justify-content: space-between; margin-top: 20px;">
                    <button onclick="clearSignature()" style="background: #e74c3c; border: none; color: white; padding: 10px 20px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                        <i class="fas fa-eraser"></i> Tozalash
                    </button>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="closeSignatureModal()" style="background: #95a5a6; border: none; color: white; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                            Bekor qilish
                        </button>
                        <button onclick="handleSignatureSubmit()" style="background: #2ecc71; border: none; color: white; padding: 10px 25px; border-radius: 6px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-check"></i> Tasdiqlash
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;


    document.body.insertAdjacentHTML('beforeend', signatureModalHTML);
    initSignatureCanvas();
}

function closeSignatureModal() {
    const modal = document.getElementById('signature-modal');
    if (modal) modal.remove();
}

function initSignatureCanvas() {
    signatureCanvas = document.getElementById('signature-pad');
    if (!signatureCanvas) return;

    signatureCtx = signatureCanvas.getContext('2d');

    // Set style
    signatureCtx.strokeStyle = "#000000";
    signatureCtx.lineWidth = 3;
    signatureCtx.lineJoin = "round";
    signatureCtx.lineCap = "round";

    // Helper to get coordinates
    function getPos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        if (evt.touches) {
            return {
                x: evt.touches[0].clientX - rect.left,
                y: evt.touches[0].clientY - rect.top
            };
        }
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    // Start drawing
    function startDraw(e) {
        e.preventDefault();
        isDrawing = true;
        const pos = getPos(signatureCanvas, e);
        signatureCtx.beginPath();
        signatureCtx.moveTo(pos.x, pos.y);
    }

    // Draw move
    function moveDraw(e) {
        e.preventDefault();
        if (!isDrawing) return;
        const pos = getPos(signatureCanvas, e);
        signatureCtx.lineTo(pos.x, pos.y);
        signatureCtx.stroke();
    }

    // End drawing
    function endDraw(e) {
        e.preventDefault();
        isDrawing = false;
        signatureCtx.closePath();
    }

    // Mouse Events
    signatureCanvas.addEventListener('mousedown', startDraw, { passive: false });
    signatureCanvas.addEventListener('mousemove', moveDraw, { passive: false });
    signatureCanvas.addEventListener('mouseup', endDraw, { passive: false });
    signatureCanvas.addEventListener('mouseleave', endDraw, { passive: false });

    // Touch Events
    signatureCanvas.addEventListener('touchstart', startDraw, { passive: false });
    signatureCanvas.addEventListener('touchmove', moveDraw, { passive: false });
    signatureCanvas.addEventListener('touchend', endDraw, { passive: false });
}

function clearSignature() {
    if (signatureCtx && signatureCanvas) {
        signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
        signatureCtx.beginPath(); // Reset path to avoid connecting new lines to cleared ones
    }
}

function handleSignatureSubmit() {
    if (!signatureCanvas) return;

    // Check if empty (simple heuristic: check center pixel or assume valid if used)
    // For now we just save.

    const signatureData = signatureCanvas.toDataURL('image/png');
    const data = getPU80Data();

    if (isSigningForReturn) {
        // Handle Return
        const entryIndex = data.findIndex(e => e.id === currentSignatureId);
        if (entryIndex > -1) {
            data[entryIndex].returnTime = new Date().toISOString();
            data[entryIndex].status = 'returned';
            data[entryIndex].signatureReturn = signatureData;

            savePU80Data(data);
            renderPU80Table(currentSignatureDeptId);
            closeSignatureModal();
        } else {
            alert("Xatolik: Ma'lumot topilmadi.");
            closeSignatureModal();
        }
    } else {
        // Handle New Entry (Take)
        if (!pendingNewEntry) return;

        const now = new Date();
        const newEntry = {
            id: Date.now(),
            deptId: pendingNewEntry.deptId,
            toolName: pendingNewEntry.toolName,
            toolNumber: pendingNewEntry.toolNumber,
            responsible: pendingNewEntry.responsible,
            takenTime: now.toISOString(),
            returnTime: null,
            status: 'active',
            signatureTaken: signatureData,
            signatureReturn: null
        };

        data.push(newEntry);
        savePU80Data(data);
        renderPU80Table(pendingNewEntry.deptId);

        // Clear inputs after success
        const toolSelect = document.getElementById('pu80-tool-select');
        const toolNumber = document.getElementById('pu80-tool-number');
        const toolResponsible = document.getElementById('pu80-responsible');
        if (toolSelect) toolSelect.value = '';
        if (toolNumber) toolNumber.value = '';
        if (toolResponsible) toolResponsible.value = '';

        closeSignatureModal();
        pendingNewEntry = null; // Reset
    }
}


// ------ Helper: Render Table ------

function renderPU80Table(deptId) {
    const data = getPU80Data().filter(e => e.deptId === deptId && e.status === 'active');
    const tbody = document.getElementById('pu80-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 30px; color: rgba(255,255,255,0.5);"><i class="fas fa-check-circle" style="font-size: 2rem; display:block; margin-bottom:10px;"></i>Hozirda barcha qurollar joyida</td></tr>';
        return;
    }

    const now = new Date();
    const currentHour = now.getHours();

    data.forEach(item => {
        const takenDate = new Date(item.takenTime);
        const timeString = takenDate.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

        let signatureImg = `<span style="font-size:0.8rem; color:#aaa;">Imzo yo'q</span>`;
        if (item.signatureTaken) {
            signatureImg = `<img src="${item.signatureTaken}" alt="Imzo" style="height: 30px; background: white; border-radius: 4px; padding: 2px;">`;
        }

        let statusBadge = '';
        let rowStyle = '';

        // Time-based status
        if (currentHour >= 19) {
            statusBadge = `<span class="status-badge" style="background: rgba(231,76,60,0.2); color: #e74c3c; border: 1px solid #e74c3c; border-radius: 4px; padding: 2px 6px; font-size: 0.8rem;">
                <i class="fas fa-exclamation-circle"></i> Kritik
            </span>`;
            rowStyle = 'box-shadow: inset 5px 0 0 #e74c3c; background: rgba(231,76,60,0.05);';
        } else if (currentHour >= 18) {
            statusBadge = `<span class="status-badge" style="background: rgba(243,156,18,0.2); color: #f39c12; border: 1px solid #f39c12; border-radius: 4px; padding: 2px 6px; font-size: 0.8rem;">
                <i class="fas fa-clock"></i> Kechikmoqda
            </span>`;
            rowStyle = 'box-shadow: inset 5px 0 0 #f39c12;';
        } else if (currentHour >= 17) {
            statusBadge = `<span class="status-badge" style="background: rgba(241,196,15,0.2); color: #f1c40f; border: 1px solid #f1c40f; border-radius: 4px; padding: 2px 6px; font-size: 0.8rem;">
                <i class="fas fa-hourglass-half"></i> Topshirish vaqti
            </span>`;
        } else {
            statusBadge = `<span class="status-badge" style="background: rgba(46,204,113,0.2); color: #2ecc71; border-radius: 4px; padding: 2px 6px; font-size: 0.8rem;">
                <i class="fas fa-check-circle"></i> Ishda
            </span>`;
        }

        const tr = document.createElement('tr');
        tr.style = `border-bottom: 1px solid rgba(255,255,255,0.05); cursor: default; transition: 0.3s; ${rowStyle}`;
        tr.onmouseover = function () { this.style.backgroundColor = 'rgba(255,255,255,0.05)'; };
        tr.onmouseout = function () { this.style.backgroundColor = 'transparent'; };

        tr.innerHTML = `
            <td style="padding: 12px; color: white; display: flex; align-items: center; gap: 10px;">
                <div style="width: 30px; height: 30px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-tools" style="color: #00c6ff; font-size: 0.8rem;"></i>
                </div>
                ${item.toolName}
            </td>
            <td style="padding: 12px; color: rgba(255,255,255,0.7); font-family: monospace;">${item.toolNumber}</td>
            <td style="padding: 12px; color: white;">${item.responsible}</td>
            <td style="padding: 12px; text-align: center;">${signatureImg}</td>
            <td style="padding: 12px; text-align: center; color: rgba(255,255,255,0.7);">${timeString}</td>
            <td style="padding: 12px; text-align: center;">${statusBadge}</td>
            <td style="padding: 12px; text-align: center;">
                <button onclick="returnPU80Tool(${item.id}, '${deptId}')" style="
                    background: linear-gradient(135deg, #00c6ff, #0072ff); 
                    border: none; 
                    color: white; 
                    padding: 8px 15px; 
                    border-radius: 6px; 
                    cursor: pointer; 
                    transition: 0.2s;
                    box-shadow: 0 4px 10px rgba(0, 114, 255, 0.3);
                    font-size: 0.85rem;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    <i class="fas fa-file-signature"></i> Topshirish (Imzo)
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
