// PU-80: Maxsus Hisobdagi Ish Qurollari Jurnali
// Biometric tool tracking with Face ID & Signature

// Fallback in case loading order issues
if (!window.SmartUtils && typeof SmartUtils !== 'undefined') {
    window.SmartUtils = SmartUtils;
}

// Ensure SmartUtils is available
const fetchPU80 = async (url, options = {}) => {
    // 500ms kutib ko'rish (Race condition uchun)
    for (let i = 0; i < 5; i++) {
        if (window.SmartUtils) break;
        await new Promise(r => setTimeout(r, 200));
    }

    if (!window.SmartUtils) {
        alert("Tizim xatosi: SmartUtils yuklanmagan. Iltimos, sahifani yangilang (Ctrl+Shift+R).");
        throw new Error("SmartUtils missing");
    }
    return await window.SmartUtils.fetchAPI(url, options);
};

// Global state
window.pu80State = {
    pendingEntry: null,
    signatureId: null,
    deptId: null,
    isReturn: false,
    stream: null,
    scannerInterval: null,
    timerInterval: null
};

window.openPU80Window = function (deptId) {
    window.pu80State.deptId = deptId;
    let modal = document.getElementById('pu80-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pu80-modal';
        modal.className = 'department-window';
        modal.style.zIndex = '10005';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="window-header" style="background: linear-gradient(90deg, #1e293b 0%, #020617 100%); border-bottom: 2px solid var(--glass-border); padding: 15px 30px;">
            <h2 class="department-name" style="font-size: 1.3rem; margin: 0; display: flex; align-items: center; gap: 12px; font-weight: 800; color: #fff;">
                <i class="fas fa-tools" style="color: var(--accent-gold);"></i> PU-80: MAXSUS ISH QUROLLARI JURNALI
            </h2>
            <div style="display:flex; align-items:center; gap:25px;">
                <div style="text-align:right;">
                    <div style="font-size:0.7rem; color:var(--text-secondary); font-weight: 800; text-transform:uppercase; letter-spacing: 1px;">TOPSHIRISH MUDDATI: 17:00</div>
                    <div id="pu80-timer-value" style="font-size:1.3rem; font-weight:900; color:#10b981; text-shadow: 0 0 10px rgba(16, 185, 129, 0.3);">00:00:00</div>
                </div>
                <button class="close-btn" onclick="window.closePU80Window()" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        <div class="window-content" style="padding: 0; background: #020617; color: var(--text-primary); overflow-y: auto; height: calc(100% - 70px); box-sizing: border-box;">
            
            <div style="display:flex; background: rgba(30, 41, 59, 0.5); padding: 15px 30px 0; border-bottom: 1px solid var(--glass-border); backdrop-filter: blur(10px);">
                <button id="pu80-tab-journal" onclick="window.switchPU80Tab('journal')" style="padding:15px 30px; background: var(--gold-gradient); color:#000; border:none; border-radius:14px 14px 0 0; font-weight:900; cursor:pointer; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 -5px 15px rgba(212, 175, 55, 0.2);">Kunlik Jurnal</button>
                <button id="pu80-tab-inventory" onclick="window.switchPU80Tab('inventory')" style="padding:15px 30px; background:transparent; color:var(--text-secondary); border:none; border-radius:14px 14px 0 0; cursor:pointer; margin-left:10px; font-weight:700; font-size: 0.85rem; text-transform: uppercase; transition: 0.3s;">Asboblar Ombori</button>
            </div>

            <div id="pu80-main-view" style="padding:25px;">
                <div id="pu80-summary" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:20px; margin-bottom:25px;"></div>
                
                <!-- Input Section -->
                <div style="background: rgba(30, 41, 59, 0.3); padding: 30px; border-radius: 24px; margin-bottom: 30px; border: 1px solid var(--glass-border); backdrop-filter: blur(10px);">
                    <h4 style="color: var(--accent-gold); margin-top: 0; margin-bottom: 20px; font-size: 0.95rem; font-weight: 900; display:flex; align-items:center; gap:12px; text-transform: uppercase;">
                        <i class="fas fa-sign-out-alt"></i> Ish Qurolini Berishni Rasmiylashtirish
                    </h4>
                    <div style="display: grid; grid-template-columns: 1.2fr 1.2fr auto; gap: 20px; align-items: flex-end;">
                        <div>
                            <label style="color: var(--text-secondary); display:block; margin-bottom:10px; font-size:0.75rem; font-weight: 700; text-transform:uppercase;">Asbobni tanlang:</label>
                            <select id="pu80-tool-select" style="width:100%; padding:14px; background: rgba(0, 0, 0, 0.6); border: 1px solid var(--glass-border); color:#fff; border-radius:14px; outline:none; font-weight: 700; cursor:pointer; appearance: none;">
                                <option value="">-- Inventardan tanlang --</option>
                            </select>
                        </div>
                        <div>
                            <label style="color: var(--text-secondary); display:block; margin-bottom:10px; font-size:0.75rem; font-weight: 700; text-transform:uppercase;">Mas'ul Xodim (F.I.Sh.):</label>
                            <input type="text" id="pu80-resp-in" placeholder="Ism-sharifini kiriting..." style="width:100%; padding:14px; background: rgba(0, 0, 0, 0.6); border: 1px solid var(--glass-border); color:#fff; border-radius:14px; outline:none; font-weight: 700;">
                        </div>
                        <div style="display:flex; gap:15px;">
                            <button onclick="window.pu80Take('face')" style="padding:14px 30px; background: var(--gold-gradient); color:#000; border:none; border-radius:16px; cursor:pointer; font-weight:900; display:flex; align-items:center; gap:10px; font-size:0.9rem; box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3); text-transform: uppercase;">
                                <i class="fas fa-video"></i> FACE ID
                            </button>
                            <button onclick="window.pu80Take('sign')" style="padding:14px 30px; background: rgba(255, 255, 255, 0.05); color:#fff; border:1px solid var(--glass-border); border-radius:16px; cursor:pointer; font-weight:700; display:flex; align-items:center; gap:10px; font-size:0.9rem;">
                                <i class="fas fa-pen-nib" style="color: var(--accent-gold);"></i> IMZO
                            </button>
                        </div>
                    </div>
                </div>

                <div id="pu80-table-container" style="background: rgba(30, 41, 59, 0.3); border-radius: 24px; border: 1px solid var(--glass-border); overflow: hidden; backdrop-filter: blur(10px);">
                    <table style="width: 100%; border-collapse:collapse; color:#fff; font-size:0.95rem; table-layout: fixed;">
                        <colgroup>
                            <col style="width: 50px;">
                            <col style="width: 25%;">
                            <col style="width: 120px;">
                            <col style="width: 20%;">
                            <col style="width: 100px;">
                            <col style="width: 80px;">
                            <col style="width: 15%;">
                            <col style="width: 120px;">
                        </colgroup>
                        <thead style="background: rgba(0, 0, 0, 0.4);">
                            <tr>
                                <th style="padding:18px 10px; text-align:center; color: var(--text-secondary); border-bottom: 1px solid var(--glass-border);"><i class="fas fa-hashtag"></i></th>
                                <th style="padding:18px 10px; text-align:left; color: var(--text-secondary); border-bottom: 1px solid var(--glass-border); font-size: 0.8rem; font-weight: 800; text-transform: uppercase;">ASBOB NOMI</th>
                                <th style="padding:18px 10px; text-align:center; color: var(--text-secondary); border-bottom: 1px solid var(--glass-border); font-size: 0.8rem; font-weight: 800; text-transform: uppercase;">INVENTAR №</th>
                                <th style="padding:18px 10px; text-align:left; color: var(--text-secondary); border-bottom: 1px solid var(--glass-border); font-size: 0.8rem; font-weight: 800; text-transform: uppercase;">MAS'UL XODIM</th>
                                <th style="padding:18px 10px; text-align:center; color: var(--text-secondary); border-bottom: 1px solid var(--glass-border); font-size: 0.8rem; font-weight: 800; text-transform: uppercase;">VAQT</th>
                                <th style="padding:18px 10px; text-align:center; color: var(--text-secondary); border-bottom: 1px solid var(--glass-border);"><i class="fas fa-shield-alt"></i></th>
                                <th style="padding:18px 10px; text-align:center; color: var(--text-secondary); border-bottom: 1px solid var(--glass-border); font-size: 0.8rem; font-weight: 800; text-transform: uppercase;">HOLAT</th>
                                <th style="padding:18px 10px; text-align:center; color: var(--text-secondary); border-bottom: 1px solid var(--glass-border); font-size: 0.8rem; font-weight: 800; text-transform: uppercase;">AMAL</th>
                            </tr>
                        </thead>
                        <tbody id="pu80-tbody"></tbody>
                    </table>
                </div>
            </div>

            <!-- Inventory Tab Content -->
            <div id="pu80-inv-view" style="padding:30px; display:none;">
                <div style="background: rgba(30, 41, 59, 0.3); padding: 30px; border-radius: 24px; margin-bottom: 30px; border: 1px solid var(--glass-border); backdrop-filter: blur(10px);">
                    <h4 style="color: var(--accent-gold); margin-top: 0; margin-bottom: 20px; font-size: 0.95rem; font-weight: 900; display:flex; align-items:center; gap:12px; text-transform: uppercase;">
                        <i class="fas fa-plus-circle" style="color: #10b981;"></i> Yangi Ish Quroli Qo'shish
                    </h4>
                    <div style="display: grid; grid-template-columns: 1.5fr 1fr auto; gap: 20px; align-items: flex-end;">
                        <div>
                            <label style="color: var(--text-secondary); display:block; margin-bottom:10px; font-size:0.75rem; font-weight: 700; text-transform: uppercase;">Asbob Nomi</label>
                            <input type="text" id="pu80-new-tool-name" placeholder="Masalan: Drel..." style="width:100%; padding:14px; background: rgba(0, 0, 0, 0.6); border: 1px solid var(--glass-border); color:#fff; border-radius:14px; outline:none; font-weight: 700;">
                        </div>
                        <div>
                            <label style="color: var(--text-secondary); display:block; margin-bottom:10px; font-size:0.75rem; font-weight: 700; text-transform: uppercase;">Inventar Raqami</label>
                            <input type="text" id="pu80-new-tool-num" placeholder="№ 001..." style="width:100%; padding:14px; background: rgba(0, 0, 0, 0.6); border: 1px solid var(--glass-border); color:#fff; border-radius:14px; outline:none; font-weight: 900; text-align: center;">
                        </div>
                        <button onclick="window.addToolToInv()" style="padding:14px 40px; background: var(--gold-gradient); color:#000; border:none; border-radius:16px; cursor:pointer; font-weight:900; box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3); text-transform: uppercase;">SAQLASH</button>
                    </div>
                </div>
                <div id="pu80-inventory-list"></div>
            </div>
        </div>
        
        <!-- Face ID Overlay -->
        <div id="pu80-face-ovr" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(2, 6, 23, 0.95); z-index:20000; flex-direction:column; align-items:center; justify-content:center; backdrop-filter: blur(20px);">
            <div style="position: relative; width: 300px; height: 300px;">
                <video id="pu80-v" autoplay style="width:100%; height:100%; border-radius:50%; object-fit:cover; border:4px solid var(--accent-gold); box-shadow: 0 0 50px rgba(212, 175, 55, 0.3);"></video>
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: #00c6ff; animation: faceScanMove 2.5s infinite linear; z-index: 10; box-shadow: 0 0 15px #00c6ff;"></div>
            </div>
            <p style="color: #fff; margin-top: 30px; font-size: 1.1rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Biometrik Skanerlash...</p>
            <div style="margin-top:30px; display:flex; gap:20px;">
                <button onclick="window.closeFace()" style="padding:15px 40px; background: rgba(255, 255, 255, 0.05); color:white; border: 1px solid var(--glass-border); border-radius:30px; cursor: pointer; font-weight: 700; text-transform: uppercase;">BEKOR</button>
                <button id="pu80-cap-btn" style="padding:15px 40px; background: var(--gold-gradient); color:#000; border:none; border-radius:30px; font-weight:900; cursor: pointer; text-transform: uppercase; box-shadow: 0 10px 25px rgba(212, 175, 55, 0.3);">TASDIQLASH</button>
            </div>
        </div>
    `;

    document.getElementById('department-overlay').classList.add('active');
    modal.classList.add('active');
    window.refreshPU80();
    window.startTimer();
};

window.closePU80Window = function () {
    document.getElementById('pu80-modal')?.classList.remove('active');
    document.getElementById('department-overlay')?.classList.remove('active');
    if (window.pu80State.timerInterval) clearInterval(window.pu80State.timerInterval);
};

window.switchPU80Tab = function (tab) {
    const isJ = tab === 'journal';
    document.getElementById('pu80-main-view').style.display = isJ ? 'block' : 'none';
    document.getElementById('pu80-inv-view').style.display = isJ ? 'none' : 'block';

    // Tab styles
    const tabJ = document.getElementById('pu80-tab-journal');
    const tabI = document.getElementById('pu80-tab-inventory');

    if (isJ) {
        tabJ.style.background = 'linear-gradient(135deg, #d4af37, #b8860b)';
        tabJ.style.color = '#fff';
        tabI.style.background = 'transparent';
        tabI.style.color = '#64748b';
    } else {
        tabI.style.background = 'linear-gradient(135deg, #d4af37, #b8860b)';
        tabI.style.color = '#fff';
        tabJ.style.background = 'transparent';
        tabJ.style.color = '#64748b';
        window.loadInv();
    }
};

window.startTimer = function () {
    if (window.pu80State.timerInterval) clearInterval(window.pu80State.timerInterval);
    const el = document.getElementById('pu80-timer-value');
    window.pu80State.timerInterval = setInterval(() => {
        const now = new Date(), end = new Date();
        end.setHours(17, 0, 0, 0);
        let d = end - now; if (d < 0) d = 0;
        const h = String(Math.floor(d / 3600000)).padStart(2, '0'), m = String(Math.floor((d % 3600000) / 60000)).padStart(2, '0'), s = String(Math.floor((d % 60000) / 1000)).padStart(2, '0');
        if (el) el.textContent = `${h}:${m}:${s}`;
    }, 1000);
};

window.refreshPU80 = async function () {
    try {
        const data = await fetchPU80(`/pu80/records/${window.pu80State.deptId}`);
        const body = document.getElementById('pu80-tbody');
        if (!body) return;
        body.innerHTML = data.map((it, i) => `
            <tr style="border-bottom:1px solid rgba(31,38,135,0.05); transition: background 0.2s;" onmouseover="this.style.background='rgba(37,99,235,0.02)'" onmouseout="this.style.background='transparent'">
                <td style="padding:14px 10px; text-align:center; font-weight: 500; color: #64748b;">${i + 1}</td>
                <td style="padding:14px 10px; font-weight: 800; color: #1e293b; overflow: hidden; text-overflow: ellipsis;">${it.tool_name}</td>
                <td style="padding:14px 10px; text-align:center; color: #ffd700; font-weight: 900; font-family: 'Exo 2', sans-serif;">${it.tool_number || '-'}</td>
                <td style="padding:14px 10px; font-weight: 600; color: #475569; overflow: hidden; text-overflow: ellipsis;">${it.responsible}</td>
                <td style="padding:14px 10px; text-align:center; font-weight: 800; color: #1e293b;">${it.taken_time ? new Date(it.taken_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                <td style="padding:14px 10px; text-align:center;">${it.face_take ? `<img src="${it.face_take}" style="width:34px; height:34px; border-radius:10px; border:2px solid rgba(37,99,235,0.1); object-fit: cover; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">` : (it.sign_take ? '<i class="fas fa-signature" style="color:#d4af37; font-size: 1.1rem;"></i>' : '-')}</td>
                <td style="padding:14px 10px; text-align:center;">${it.status === 'active' ? '<span style="color:#b8860b; background:rgba(212,175,55,0.1); padding:5px 12px; border-radius:10px; font-size:0.7rem; font-weight: 900; text-transform: uppercase;">OLINGAN</span>' : '<span style="color:#059669; background:rgba(16,185,129,0.1); padding:5px 12px; border-radius:10px; font-size:0.7rem; font-weight: 900; text-transform: uppercase;">TOPSHIRILDI</span>'}</td>
                <td style="padding:14px 10px; text-align:center;">${it.status === 'active' ? `<button onclick="window.pu80Return(${it.id},'${it.verification_type}')" style="background:#059669; border:none; color:white; padding:7px 14px; border-radius:10px; cursor:pointer; font-size:0.75rem; font-weight:800; box-shadow: 0 4px 12px rgba(5,150,105,0.25); text-transform: uppercase;">Topshirish</button>` : '-'}</td>
            </tr>
        `).join('');

        const sum = document.getElementById('pu80-summary');
        if (sum) sum.innerHTML = `
            <div style="background:#ffffff; padding:25px; border-radius:24px; text-align:center; border:1px solid rgba(37,99,235,0.08); transition: all 0.3s; box-shadow: 0 10px 25px rgba(0,0,0,0.02);" onmouseover="this.style.transform='translateY(-5px)';this.style.boxShadow='0 15px 35px rgba(37,99,235,0.1)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 10px 25px rgba(0,0,0,0.02)'">
                <div style="color:#64748b; font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">JAMI ASBOBLAR</div>
                <div style="font-size:2.2rem; font-weight:900; color:#1e293b; font-family:'Exo 2', sans-serif;">${data.length}</div>
            </div>
            <div style="background:#ffffff; padding:25px; border-radius:24px; text-align:center; border:1px solid rgba(212,175,55,0.15); transition: all 0.3s; box-shadow: 0 10px 25px rgba(0,0,0,0.02);" onmouseover="this.style.transform='translateY(-5px)';this.style.boxShadow='0 15px 35px rgba(212,175,55,0.15)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 10px 25px rgba(0,0,0,0.02)'">
                <div style="color:#b8860b; font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">ISHDA (OLINGAN)</div>
                <div style="font-size:2.2rem; font-weight:900; color:#d4af37; font-family:'Exo 2', sans-serif;">${data.filter(x => x.status === 'active').length}</div>
            </div>
            <div style="background:#ffffff; padding:25px; border-radius:24px; text-align:center; border:1px solid rgba(16,185,129,0.15); transition: all 0.3s; box-shadow: 0 10px 25px rgba(0,0,0,0.02);" onmouseover="this.style.transform='translateY(-5px)';this.style.boxShadow='0 15px 35px rgba(16,185,129,0.15)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 10px 25px rgba(0,0,0,0.02)'">
                <div style="color:#059669; font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">OMBORDA (QAYTGAN)</div>
                <div style="font-size:2.2rem; font-weight:900; color:#10b981; font-family:'Exo 2', sans-serif;">${data.filter(x => x.status === 'returned').length}</div>
            </div>
            <div style="background:#ffffff; padding:25px; border-radius:24px; text-align:center; border:1px solid rgba(99,102,241,0.15); transition: all 0.3s; box-shadow: 0 10px 25px rgba(0,0,0,0.02);" onmouseover="this.style.transform='translateY(-5px)';this.style.boxShadow='0 15px 35px rgba(99,102,241,0.15)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 10px 25px rgba(0,0,0,0.02)'">
                <div style="color:#6366f1; font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">VERIFIKATSIYA</div>
                <div style="font-size:2.2rem; font-weight:900; color:#818cf8; font-family:'Exo 2', sans-serif;">${data.filter(x => x.verification_type === 'face' || x.sign_take).length}</div>
            </div>
        `;

        // Load tools for dropdown
        await window.loadToolsToDropdown();
    } catch (e) { console.error(e); }
};

window.loadToolsToDropdown = async function () {
    const sel = document.getElementById('pu80-tool-select');
    if (!sel) return;
    try {
        const tools = await fetchPU80(`/pu80/tools/${window.pu80State.deptId}`);
        sel.innerHTML = '<option value="">-- Tanlang --</option>' +
            tools.map(t => `<option value="${t.id}" data-name="${t.tool_name}" data-num="${t.tool_number}">${t.tool_name} (${t.tool_number})</option>`).join('');
    } catch (e) { console.error(e); }
};

window.pu80Take = function (type) {
    const sel = document.getElementById('pu80-tool-select'), r = document.getElementById('pu80-resp-in').value;
    if (!sel.value) return alert("Avval asbobni tanlang");
    if (!r) return alert("Masul xodim ismini yozing");

    const opt = sel.options[sel.selectedIndex];
    window.pu80State.pendingEntry = {
        toolName: opt.getAttribute('data-name'),
        toolNumber: opt.getAttribute('data-num'),
        responsible: r
    };
    if (type === 'face') window.startFace('take'); else window.startSign('take');
};

window.startFace = async function (mode, id) {
    const ovr = document.getElementById('pu80-face-ovr'), v = document.getElementById('pu80-v'), btn = document.getElementById('pu80-cap-btn');
    ovr.style.display = 'flex';
    try {
        window.pu80State.stream = await navigator.mediaDevices.getUserMedia({ video: true });
        v.srcObject = window.pu80State.stream;
        btn.onclick = () => window.capFace(mode, id);
    } catch (e) { alert("Kamera xatosi"); window.closeFace(); }
};

window.closeFace = function () {
    document.getElementById('pu80-face-ovr').style.display = 'none';
    if (window.pu80State.stream) window.pu80State.stream.getTracks().forEach(t => t.stop());
};

window.capFace = async function (mode, id) {
    try {
        const btn = document.getElementById('pu80-cap-btn'); btn.disabled = true; btn.innerText = "...";
        const desc = await window.FaceService.getDescriptorFromVideo(document.getElementById('pu80-v'));
        if (!window.hrData) await window.initHRData();
        let match = null;
        for (const e of window.hrData.employees || []) {
            if (e.faceTemplate) {
                const dist = window.FaceService.compareDescriptors(desc, JSON.parse(e.faceTemplate).descriptor);
                if (dist < 0.55) { match = e; break; }
            }
        }
        if (!match) throw new Error("Yuz topilmadi");
        if (mode === 'take') {
            await fetchPU80('/pu80/records', {
                method: 'POST', body: JSON.stringify({
                    deptId: window.pu80State.deptId, ...window.pu80State.pendingEntry,
                    responsible: match.name, verificationType: 'face', faceTake: JSON.parse(match.faceTemplate).image
                })
            });
        } else {
            const data = await fetchPU80(`/pu80/records/${window.pu80State.deptId}`);
            const item = data.find(x => x.id === id);
            if (item.responsible !== match.name) throw new Error("Faqat " + item.responsible + " topshirishi mumkin");
            await fetchPU80(`/pu80/records/${id}/return`, { method: 'PATCH', body: JSON.stringify({ faceReturn: JSON.parse(match.faceTemplate).image, status: 'returned' }) });
        }
        window.closeFace(); window.refreshPU80();
    } catch (e) { alert(e.message); } finally { document.getElementById('pu80-cap-btn').disabled = false; document.getElementById('pu80-cap-btn').innerText = "SKANERLASH"; }
};

window.pu80Return = function (id, type) {
    if (type === 'face') window.startFace('return', id); else window.startSign('return', id);
};

window.startSign = function (mode, id) {
    window.pu80State.isReturn = mode === 'return'; window.pu80State.signatureId = id;
    const old = document.getElementById('pu80-sign-modal'); if (old) old.remove();
    document.body.insertAdjacentHTML('beforeend', `
        <div id="pu80-sign-modal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:30000;display:flex;align-items:center;justify-content:center;">
            <div style="background:#1e293b;padding:20px;border-radius:10px;text-align:center;">
                <canvas id="pu80-canvas" width="400" height="200" style="background:#fff;border-radius:5px;cursor:crosshair;"></canvas>
                <div style="margin-top:15px;display:flex;gap:10px;justify-content:center;">
                    <button onclick="document.getElementById('pu80-sign-modal').remove()" style="padding:10px 20px;background:#555;color:#fff;border:none;border-radius:5px;">BEKOR</button>
                    <button id="pu80-sign-save" style="padding:10px 20px;background:#10b981;color:#fff;border:none;border-radius:5px;font-weight:bold;">SAQLASH</button>
                </div>
            </div>
        </div>
    `);
    const c = document.getElementById('pu80-canvas'), ctx = c.getContext('2d');
    let drawing = false;
    const getP = (e) => { const r = c.getBoundingClientRect(); return { x: (e.touches ? e.touches[0].clientX : e.clientX) - r.left, y: (e.touches ? e.touches[0].clientY : e.clientY) - r.top }; };
    c.onmousedown = c.ontouchstart = (e) => { drawing = true; const p = getP(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
    c.onmousemove = c.ontouchmove = (e) => { if (!drawing) return; const p = getP(e); ctx.lineTo(p.x, p.y); ctx.stroke(); e.preventDefault(); };
    window.onmouseup = window.ontouchend = () => { drawing = false; };
    document.getElementById('pu80-sign-save').onclick = async () => {
        const sig = c.toDataURL();
        if (window.pu80State.isReturn) {
            await fetchPU80(`/pu80/records/${window.pu80State.signatureId}/return`, { method: 'PATCH', body: JSON.stringify({ signReturn: sig, status: 'returned' }) });
        } else {
            await fetchPU80('/pu80/records', { method: 'POST', body: JSON.stringify({ ...window.pu80State.pendingEntry, deptId: window.pu80State.deptId, verificationType: 'signature', signTake: sig }) });
        }
        document.getElementById('pu80-sign-modal').remove(); window.refreshPU80();
    };
};

// Removed duplicate loadInv definition. Functions should only be defined once.

console.log("PU-80: Loaded.");

window.loadInv = async function () {
    const el = document.getElementById('pu80-inventory-list');
    if (!el) return;
    try {
        const tools = await fetchPU80(`/pu80/tools/${window.pu80State.deptId}`);
        el.innerHTML = `
            <div style="width: 100% !important; min-width: 100% !important; background:#ffffff; border-radius:24px; border: 1px solid rgba(31, 38, 135, 0.08); box-shadow: 0 15px 40px rgba(0,0,0,0.03); overflow: hidden; box-sizing: border-box;">
                <table style="display: table !important; width: 100% !important; max-width: 100% !important; border-collapse:collapse; border-spacing:0; color:#1e293b; font-size:0.95rem; table-layout: fixed !important; margin: 0; padding: 0;">
                    <colgroup>
                        <col style="width: 55%;">
                        <col style="width: 25%;">
                        <col style="width: 20%;">
                    </colgroup>
                    <thead style="background:#f8fafc;">
                        <tr>
                            <th style="padding:18px 20px; text-align:left; color:#64748b; border-bottom: 2px solid rgba(31,38,135,0.08); font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;"><i class="fas fa-toolbox" style="color:#d4af37;"></i> ASBOB NOMI</th>
                            <th style="padding:18px 20px; text-align:center; color:#64748b; border-bottom: 2px solid rgba(31,38,135,0.08); font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;"><i class="fas fa-barcode" style="color:#3b82f6;"></i> INVENTAR RAQAMI</th>
                            <th style="padding:18px 20px; text-align:center; color:#64748b; border-bottom: 2px solid rgba(31,38,135,0.08); font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;"><i class="fas fa-cogs" style="color:#ef4444;"></i> AMAL</th>
                        </tr>
                    </thead>
                <tbody>
                    ${tools.length === 0 ? '<tr><td colspan="3" style="padding:60px; text-align:center; color:#64748b; font-weight: 700;">Ro\'yxat bo\'sh. Yangi asbob qo\'shing.</td></tr>' :
                tools.map(t => `
                        <tr style="border-bottom:1px solid rgba(31,38,135,0.05); transition: background 0.2s;" onmouseover="this.style.background='rgba(37,99,235,0.02)'" onmouseout="this.style.background='transparent'">
                            <td style="padding:14px 20px; font-weight:800; color: #1e293b;">${t.tool_name}</td>
                            <td style="padding:14px 20px; text-align:center; color: #ffd700; font-weight: 900; font-family: 'Exo 2', sans-serif;">${t.tool_number || '-'}</td>
                            <td style="padding:14px 20px; text-align:center;">
                                <button onclick="window.deleteToolFromInv(${t.id})" style="background:rgba(239,68,68,0.05); border:1.5px solid rgba(239,68,68,0.1); color:#ef4444; padding:8px 16px; border-radius:12px; cursor:pointer; font-size:0.8rem; font-weight:800; transition: all 0.2s; text-transform: uppercase;">
                                    <i class="fas fa-trash-alt"></i> O'chirish
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        `;
    } catch (e) { el.innerHTML = "Xato: " + e.message; }
};

window.addToolToInv = async function () {
    const nameEl = document.getElementById('pu80-new-tool-name');
    const numEl = document.getElementById('pu80-new-tool-num');
    if (!nameEl.value) return alert("Nomini kiriting");

    try {
        await fetchPU80('/pu80/tools', {
            method: 'POST',
            body: JSON.stringify({
                deptId: window.pu80State.deptId,
                toolName: nameEl.value,
                toolNumber: numEl.value
            })
        });
        nameEl.value = ''; numEl.value = '';
        window.loadInv();
        window.loadToolsToDropdown();
        if (window.SmartUtils) window.SmartUtils.showToast("Asbob qo'shildi", "success");
    } catch (e) { alert("Qo'shib bo'lmadi: " + e.message); }
};

window.deleteToolFromInv = async function (id) {
    if (!confirm("O'chirilsinmi?")) return;
    try {
        await fetchPU80(`/pu80/tools/${id}`, { method: 'DELETE' });
        window.loadInv();
        window.loadToolsToDropdown();
        if (window.SmartUtils) window.SmartUtils.showToast("Asbob o'chirildi", "info");
    } catch (e) { alert("O'chirib bo'lmadi"); }
};

console.log("PU-80: Full Loaded with Inventory System.");
