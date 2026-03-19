/**
 * PU-28 Elektron Jurnali moduli
 */

let pu28Data = [];
let currentPU28Department = null;

function initPU28Data() {
    const savedData = localStorage.getItem('pu28_data');
    if (savedData) {
        pu28Data = JSON.parse(savedData);
    } else {
        pu28Data = [
            {
                id: 1,
                departmentId: 'bolinma1',
                date: '2026-02-26',
                checkMethod: 'Arava',
                km: 3840,
                pk: 5,
                zv: 2,
                defectDesc: 'Shpallarda yoriqlar mavjud, boltlangan qismlar bo\'shashgan',
                resolvedStatus: 'pending',
                dateResolved: null
            }
        ];
        savePU28DataLocal();
    }
}

function savePU28DataLocal() {
    localStorage.setItem('pu28_data', JSON.stringify(pu28Data));
}

window.openPU28Window = function (departmentId) {
    console.log("PU-28 Opened for:", departmentId);
    currentPU28Department = departmentId;

    if (pu28Data.length === 0) {
        initPU28Data();
    }

    let modal = document.getElementById('pu28-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pu28-modal';
        modal.className = 'integration-window';
        modal.style.zIndex = '10005';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="window-header" style="background: linear-gradient(90deg, #f8fafc 0%, #e0e7ff 100%);">
            <h2 style="color: #1e293b;"><i class="fas fa-clipboard-check" style="color: #d4af37;"></i> PU-28: Yo'l Ko'rik Jurnali</h2>
            <button class="action-btn delete" onclick="document.getElementById('pu28-modal').classList.remove('active')" style="background: rgba(239, 68, 68, 0.05); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.1); border-radius: 10px; width: 36px; height: 36px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="window-content" style="background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%); color: #1e293b; padding: 15px !important; overflow-y: auto; display: block !important; width: 100% !important; box-sizing: border-box !important;">
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; width: 100%;">
                <h3 style="margin: 0; color: #1e293b; font-weight: 800; font-size: 1.4rem;">${departmentId === 'ishlab-chiqarish' ? 'Barcha bo\'linmalar' : document.querySelector('.department-name')?.innerText || departmentId}</h3>
                <div style="display: flex; gap: 15px;">
                    <button onclick="createNewPU28RecordVoice()" style="background: linear-gradient(135deg, #d4af37, #b8860b); border: none; color: white; padding: 12px 25px; border-radius: 14px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-weight: 800; box-shadow: 0 5px 15px rgba(212, 175, 55, 0.2); transition: all 0.3s; text-transform: uppercase; font-size: 0.85rem;">
                        <i class="fas fa-microphone"></i> YANGI TEKSHIRUV
                    </button>
                    <!-- Excel export button for future -->
                    <button style="background: rgba(37, 99, 235, 0.05); border: 1.5px solid rgba(37, 99, 235, 0.1); color: #ffd700; padding: 10px 20px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 700;">
                        <i class="fas fa-file-excel"></i> EXPORT
                    </button>
                </div>
            </div>

            <!-- Tab Content Area -->
            <div id="pu28-table-content" style="width: 100% !important; min-width: 100% !important;">
                ${generatePU28TableHTML(departmentId)}
            </div>

        </div>
    `;

    modal.classList.add('active');
};

window.refreshPU28Table = function () {
    const tableContainer = document.getElementById('pu28-table-content');
    if (tableContainer) {
        tableContainer.innerHTML = generatePU28TableHTML(currentPU28Department);
    }
}

function generatePU28TableHTML(deptId) {
    let records = pu28Data;
    if (deptId !== 'ishlab-chiqarish') {
        records = records.filter(r => r.departmentId === deptId);
    }

    if (records.length === 0) {
        return `<div style="padding: 30px; text-align: center; color: rgba(255,255,255,0.5);">Hozircha ma'lumot yo'q. Yangi o'lchov qo'shish uchun yuqoridagi tugmani bosing.</div>`;
    }

    // Sort descending by date & id
    records.sort((a, b) => b.id - a.id);

    const rows = records.map(record => {
        return `
        <tr style="border-bottom: 1px solid rgba(31, 38, 135, 0.05); transition: all 0.2s;" onmouseover="this.style.background='rgba(37, 99, 235, 0.02)'" onmouseout="this.style.background='transparent'">
            <td style="padding: 14px 10px; color: #64748b; font-weight: 500;">${record.date}</td>
            <td style="padding: 14px 10px; font-weight: 700; color: #1e293b;">${record.checkMethod}</td>
            <td style="padding: 14px 10px; text-align: center; color: #ffd700; font-weight: 900; font-size: 1.1rem;">${record.km}</td>
            <td style="padding: 14px 10px; text-align: center; color: #d4af37; font-weight: 900; font-size: 1.1rem;">${record.pk}</td>
            <td style="padding: 14px 10px; text-align: center; color: #b8860b; font-weight: 900; font-size: 1.1rem;">${record.zv}</td>
            <td style="padding: 14px 10px; color: #1e293b; font-size: 0.93rem; line-height: 1.5; font-weight: 500; word-wrap: break-word; overflow-wrap: break-word;">${record.defectDesc}</td>
            <td style="padding: 14px 10px;">
                ${record.resolvedStatus !== 'resolved' ? `
                <div style="display: flex; gap: 8px;">
                    <button onclick="resolvePU28Defect(${record.id})" style="background: rgba(16, 185, 129, 0.05); border: 1.5px solid rgba(16, 185, 129, 0.2); color: #059669; padding: 8px 16px; border-radius: 10px; cursor: pointer; font-size: 0.8rem; font-weight: 800; transition: all 0.2s; text-transform: uppercase;" onmouseover="this.style.background='rgba(16,185,129,0.1)'" onmouseout="this.style.background='rgba(16,185,129,0.05)'">
                        <i class="fas fa-check"></i> OK
                    </button>
                    <button onclick="deletePU28Entry(${record.id})" style="background: rgba(239, 68, 68, 0.05); border: 1.5px solid rgba(239, 68, 68, 0.2); color: #ef4444; padding: 8px 12px; border-radius: 10px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.1)'" onmouseout="this.style.background='rgba(239,68,68,0.05)'">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                ` : `<span style="color: #059669; background: rgba(16, 185, 129, 0.08); padding: 6px 14px; border-radius: 10px; font-size: 0.75rem; font-weight: 800; border: 1px solid rgba(16,185,129,0.2); text-transform: uppercase;"><i class="fas fa-check-double"></i> BAJARILDI (${record.dateResolved})</span>`}
            </td>
        </tr>
    `}).join('');

    return `
        <style>
            .pu28-table { display: table !important; width: 100% !important; max-width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; border-spacing: 0; margin: 0; padding: 0; }
            .pu28-table th { background: #f8fafc; padding: 16px 10px; text-align: left; font-size: 0.78rem; color: #64748b; border-bottom: 2px solid rgba(31, 38, 135, 0.08); text-transform: uppercase; letter-spacing: 1.2px; font-weight: 900; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; box-sizing: border-box !important; }
            .pu28-table td { padding: 14px 10px; font-size: 0.95rem; border-bottom: 1px solid rgba(31, 38, 135, 0.05); color: #1e293b; overflow: hidden; text-overflow: ellipsis; word-wrap: break-word; box-sizing: border-box !important; }
            .pu28-table tr:hover { background: rgba(37, 99, 235, 0.02); }
            .pu28-table col.col-sana { width: 10%; }
            .pu28-table col.col-usuli { width: 10%; }
            .pu28-table col.col-km { width: 12%; }
            .pu28-table col.col-pk { width: 12%; }
            .pu28-table col.col-zv { width: 12%; }
            .pu28-table col.col-kamchilik { width: 28%; }
            .pu28-table col.col-holati { width: 16%; }
        </style>
        <div style="width: 100% !important; min-width: 100% !important; background: #ffffff; border-radius: 20px; border: 1px solid rgba(31, 38, 135, 0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.02); overflow: hidden; box-sizing: border-box;">
            <table class="pu28-table">
                <colgroup>
                    <col class="col-sana">
                    <col class="col-usuli">
                    <col class="col-km">
                    <col class="col-pk">
                    <col class="col-zv">
                    <col class="col-kamchilik">
                    <col class="col-holati">
                </colgroup>
                <thead>
                    <tr>
                        <th><i class="far fa-calendar-alt" style="color: #3b82f6;"></i> SANA</th>
                        <th><i class="fas fa-microscope" style="color: #6366f1;"></i> USULI</th>
                        <th style="text-align: center;"><i class="fas fa-road" style="color: #ffd700;"></i> KM</th>
                        <th style="text-align: center;"><i class="fas fa-map-marker-alt" style="color: #d4af37;"></i> PK</th>
                        <th style="text-align: center;"><i class="fas fa-arrows-alt-v" style="color: #b8860b;"></i> ZV</th>
                        <th><i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i> ANIQLANGAN KAMCHILIKLAR</th>
                        <th><i class="fas fa-tasks" style="color: #10b981;"></i> HOLATI</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

window.resolvePU28Defect = function (recordId) {
    if (confirm("Ushbu kamchilik bartaraf etilganligini tasdiqlaysizmi?")) {
        const record = pu28Data.find(r => r.id === recordId);
        if (record) {
            record.resolvedStatus = 'resolved';
            record.dateResolved = new Date().toISOString().split('T')[0];
            savePU28DataLocal();
            refreshPU28Table();
            if (window.SmartUtils) SmartUtils.showToast("Kamchilik maqomi 'Bajarildi' etib belgilandi!", 'success');
        }
    }
};

window.deletePU28Entry = function (recordId) {
    if (confirm("Yozuvni o'chirib yuborasizmi?")) {
        pu28Data = pu28Data.filter(r => r.id !== recordId);
        savePU28DataLocal();
        refreshPU28Table();
        if (window.SmartUtils) SmartUtils.showToast("O'chirildi", "info");
    }
}

// ----------------------------------------------------
// AI VOICE ASSISTANT MODAL & NLP LOGIC FOR PU-28
// ----------------------------------------------------
window.createNewPU28RecordVoice = function () {
    let modal = document.getElementById('pu28-entry-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pu28-entry-modal';
        modal.className = 'integration-window';
        modal.style.zIndex = '10010';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="window-header" style="background: linear-gradient(90deg, #1e293b 0%, #020617 100%); border-bottom: 2px solid var(--glass-border); padding: 15px 30px;">
            <h2 style="color: #fff; margin:0; display:flex; align-items:center; gap:12px; font-weight:800; font-size:1.3rem;">
                <i class="fas fa-robot" style="color: var(--accent-gold);"></i> PU-28 AI OVOZLI YORDAMCHI
            </h2>
            <button class="close-btn" onclick="document.getElementById('pu28-entry-modal').classList.remove('active')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="window-content" style="background: #020617; color: var(--text-primary); padding: 25px !important; display: grid; grid-template-columns: 1fr 1fr; gap: 25px; font-family: 'Inter', sans-serif; height: calc(100% - 70px); box-sizing: border-box; overflow-y: hidden;">
            
            <!-- Chap tomon: Ovozli kiritish -->
            <div style="background: rgba(30, 41, 59, 0.3); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 24px; padding: 30px; display: flex; flex-direction: column; height: 100%; box-sizing: border-box; backdrop-filter: blur(10px);">
                <h3 style="color: var(--accent-gold); margin-top: 0; margin-bottom: 15px; font-size: 1.2rem; font-weight: 900; display: flex; align-items: center; gap: 12px; text-transform: uppercase;">
                    <i class="fas fa-microphone-alt"></i> Ovozli Kiritish
                </h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px; line-height: 1.5; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 12px; border-left: 3px solid var(--accent-gold);">
                    Yordam: <i style="color: #fff; font-weight: 500;">"Vizual tekshiruv. 3840-kilometr, 5-piket, ikkinchi zveno. Kamchilik: yog'och shpal yorilgan."</i>
                </p>
                
                <div id="pu28-voice-log" style="flex: 1; background: rgba(0, 0, 0, 0.5); border: 1px solid var(--glass-border); border-radius: 20px; margin-bottom: 25px; padding: 25px; overflow-y: auto; color: #fff; font-size: 1.1rem; line-height: 1.6; box-shadow: inset 0 2px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; text-align: center; font-style: italic; opacity: 0.7;">
                    Tayyor... Gapirish uchun pastdagi tugmani bosing.
                </div>

                <button id="pu28-mic-btn" onclick="startPU28VoiceRecognition()" style="background: linear-gradient(135deg, #ef4444, #991b1b); border: none; color: white; padding: 20px; border-radius: 50px; cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 15px; transition: 0.3s; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3); font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px;">
                    <i class="fas fa-microphone"></i> <span>Gapirishni boshlash</span>
                </button>
            </div>

            <!-- O'ng tomon: Natija formasi -->
            <div style="background: rgba(30, 41, 59, 0.3); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 24px; padding: 30px; display: flex; flex-direction: column; height: 100%; box-sizing: border-box; backdrop-filter: blur(10px);">
                <h3 style="color: var(--accent-gold); margin-top: 0; margin-bottom: 25px; font-size: 1.2rem; font-weight: 900; display: flex; align-items: center; gap: 12px; text-transform: uppercase;">
                    <i class="fas fa-clipboard-check"></i> Natija Ma'lumotlari
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; flex: 1;">
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label style="display: block; margin-bottom: 10px; color: var(--text-secondary); font-weight: 700; font-size: 0.8rem; text-transform: uppercase;">Tekshirish usuli</label>
                        <select id="ai28-entry-method" style="width: 100%; padding: 14px; border-radius: 12px; background: rgba(0, 0, 0, 0.6); border: 1px solid var(--glass-border); color: #fff; font-weight: 700; outline: none; appearance: none; cursor: pointer;">
                            <option value="Vizual">Vizual (Piyoda)</option>
                            <option value="Arava">Arava (Defektoskop)</option>
                            <option value="Kommision">Kommision ko'rik</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label style="display: block; margin-bottom: 10px; color: var(--text-secondary); font-weight: 700; font-size: 0.8rem; text-transform: uppercase;">Km</label>
                        <input type="number" id="ai28-entry-km" style="width: 100%; padding: 14px; border-radius: 12px; background: rgba(0, 0, 0, 0.6); border: 1px solid var(--glass-border); color: #fff; font-weight: 900; font-size: 1.2rem; outline: none; text-align: center;">
                    </div>
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 10px; color: var(--text-secondary); font-weight: 700; font-size: 0.8rem; text-transform: uppercase;">Pk</label>
                        <input type="number" id="ai28-entry-pk" style="width: 100%; padding: 14px; border-radius: 12px; background: rgba(0, 0, 0, 0.6); border: 1px solid var(--glass-border); color: #fff; font-weight: 900; font-size: 1.2rem; outline: none; text-align: center;">
                    </div>
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 10px; color: var(--text-secondary); font-weight: 700; font-size: 0.8rem; text-transform: uppercase;">Zv</label>
                        <input type="number" id="ai28-entry-zv" style="width: 100%; padding: 14px; border-radius: 12px; background: rgba(0, 0, 0, 0.6); border: 1px solid var(--glass-border); color: #fff; font-weight: 900; font-size: 1.2rem; outline: none; text-align: center;">
                    </div>

                    <div class="form-group" style="grid-column: 1 / -1; display: flex; flex-direction: column; flex: 1;">
                        <label style="display: block; margin-bottom: 10px; color: #ef4444; font-weight: 800; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">Aniqlangan Kamchilik</label>
                        <textarea id="ai28-entry-defect" style="width: 100%; flex: 1; padding: 20px; border-radius: 20px; background: rgba(0, 0, 0, 0.6); border: 1px solid var(--glass-border); color: #fff; resize: none; font-size: 1.1rem; outline: none; line-height: 1.5; box-shadow: inset 0 2px 10px rgba(0,0,0,0.4);" placeholder="Kamchilikni batafsil tavsiflang..."></textarea>
                    </div>
                </div>

                <div style="display: flex; gap: 20px; margin-top: 25px;">
                    <button onclick="savePU28AIEntry()" style="flex: 2; background: var(--gold-gradient); border: none; color: #000; padding: 18px; border-radius: 18px; cursor: pointer; font-size: 1.1rem; font-weight: 900; box-shadow: 0 10px 25px rgba(212, 175, 55, 0.3); text-transform: uppercase;">
                        <i class="fas fa-save"></i> SAQLASH
                    </button>
                    <button onclick="document.getElementById('pu28-entry-modal').classList.remove('active')" style="flex: 1; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); color: #fff; padding: 18px; border-radius: 18px; cursor: pointer; font-size: 1rem; font-weight: 700; text-transform: uppercase;">
                        BEKOR
                    </button>
                </div>
            </div>

        </div>
    `;

    modal.classList.add('active');
};

let pu28Recognition = null;
let ai28ParsingTimeout = null;

window.startPU28VoiceRecognition = function () {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        if (window.SmartUtils) SmartUtils.showToast("Kechirasiz, brauzeringiz ovozli kiritishni qo'llab-quvvatlamaydi.", "error");
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!pu28Recognition) {
        pu28Recognition = new SpeechRecognition();
        pu28Recognition.lang = 'uz-UZ';
        pu28Recognition.interimResults = true;
        pu28Recognition.maxAlternatives = 1;

        pu28Recognition.onstart = function () {
            const btn = document.getElementById('pu28-mic-btn');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Eshitilmoqda, gapiring...</span>';
            btn.style.background = 'linear-gradient(135deg, #f39c12, #f1c40f)';
            document.getElementById('pu28-voice-log').innerHTML = "<span style='color: #1abc9c;'><i class='fas fa-assistive-listening-systems'></i> Quloq solinmoqda...</span><br/><br/>";
        };

        pu28Recognition.onresult = function (event) {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (interimTranscript.trim().length > 0 || finalTranscript.trim().length > 0) {
                document.getElementById('pu28-voice-log').innerHTML = `
                    <div style="margin-bottom: 10px; color: #95a5a6;">${interimTranscript}</div>
                    <div style="color: white; font-weight: bold;">${finalTranscript}</div>
                 `;
            }

            if (finalTranscript !== '') {
                document.getElementById('pu28-voice-log').innerHTML = `
                    <b style="color:#f1c40f;">Siz aytdingiz:</b><br/>"${finalTranscript}"<br/><br/>
                    <span style="color:#1abc9c;"><i class="fas fa-magic"></i> AI Tahlil qilmoqda...</span>
                `;

                clearTimeout(ai28ParsingTimeout);
                ai28ParsingTimeout = setTimeout(() => {
                    parsePU28VoiceToForm(finalTranscript.toLowerCase());
                }, 500);
            }
        };

        pu28Recognition.onerror = function (event) {
            console.error(event.error);
            document.getElementById('pu28-voice-log').innerHTML = `<span style="color:#e74c3c;"><i class="fas fa-exclamation-circle"></i> Xatolik yuz berdi: ${event.error}.</span>`;
            resetPU28MicButton();
        };

        pu28Recognition.onend = function () {
            resetPU28MicButton();
        }
    }

    try { pu28Recognition.start(); } catch (e) { pu28Recognition.stop(); setTimeout(() => { pu28Recognition.start(); }, 100); }
};

function resetPU28MicButton() {
    const btn = document.getElementById('pu28-mic-btn');
    if (btn && btn.innerHTML.includes('Eshitilmoqda')) {
        btn.innerHTML = '<i class="fas fa-microphone"></i> <span>Yana gapirish</span>';
        btn.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
    }
}

// PU-28 AI NLP Parser
window.parsePU28VoiceToForm = function (text) {
    console.log("PU-28 AI Parsed form:", text);

    // 1. Check Method
    if (text.includes('arava') || text.includes('defektoskop')) document.getElementById('ai28-entry-method').value = 'Arava';
    else if (text.includes('komissiya') || text.includes('kommision')) document.getElementById('ai28-entry-method').value = 'Kommision';
    else if (text.includes('vizual') || text.includes('piyoda')) document.getElementById('ai28-entry-method').value = 'Vizual';

    // 2. KM (Kilometr)
    let kmMatch = text.match(/(\d+)\s*(?:-|l|) *kilometr/);
    if (!kmMatch) kmMatch = text.match(/(\d{2,4})\s*km/);
    if (kmMatch) document.getElementById('ai28-entry-km').value = kmMatch[1];

    // 3. PK (Piket)
    const numMap = { 'bir': 1, 'birinchi': 1, 'ikki': 2, 'ikkinchi': 2, 'uch': 3, 'uchinchi': 3, 'to\'rt': 4, 'to\'rtinchi': 4, "besh": 5, "beshinchi": 5, "olti": 6, "oltinchi": 6, "yetti": 7, "yettinchi": 7, "sakkiz": 8, "sakkizinchi": 8, "to'qqiz": 9, "to'qqizinchi": 9, "o'n": 10, "o'ninchi": 10 };

    let pkMatch = text.match(/((bir|ikki|uch|to'rt|besh|olti|yetti|sakkiz|to'qqiz|o'n|1|2|3|4|5|6|7|8|9|10)[-a-z\s]*)\s*piket/);
    if (!pkMatch) pkMatch = text.match(/piket\s*((bir|ikki|uch|to'rt|besh|olti|yetti|sakkiz|to'qqiz|o'n|1|2|3|4|5|6|7|8|9|10)[-a-z\s]*)/);
    if (pkMatch) {
        let rawVal = pkMatch[1].replace(/inchi/g, '').replace(/-/, '').trim();
        document.getElementById('ai28-entry-pk').value = numMap[rawVal] || parseInt(rawVal) || 0;
    } else {
        let pkFallbackMatch = text.match(/pk\s*(\d+)/i) || text.match(/(\d+)\s*pk/i);
        if (pkFallbackMatch) document.getElementById('ai28-entry-pk').value = pkFallbackMatch[1];
    }

    // 4. ZV (Zveno)
    let zvMatch = text.match(/((bir|ikki|uch|to'rt|besh|olti|yetti|sakkiz|to'qqiz|o'n|1|2|3|4|5|6|7|8|9|10)[-a-z\s]*)\s*zveno/);
    if (zvMatch) {
        let rawVal = zvMatch[1].replace(/inchi/g, '').replace(/-/, '').trim();
        document.getElementById('ai28-entry-zv').value = numMap[rawVal] || parseInt(rawVal) || 0;
    }

    // 5. Defect 
    let defectKeywords = ['kamchilik', 'muammo', 'nuqson', 'shikast', 'qayd'];
    for (let kw of defectKeywords) {
        if (text.includes(kw)) {
            let defectText = text.substring(text.indexOf(kw) + kw.length).replace(/(:|-)/g, '').trim();
            defectText = defectText.charAt(0).toUpperCase() + defectText.slice(1);
            document.getElementById('ai28-entry-defect').value = defectText;
            break;
        }
    }

    document.getElementById('pu28-voice-log').innerHTML += `<br/><span style="color:#1abc9c; font-weight:bold;"><i class="fas fa-check-double"></i> Ma'lumotlar tahlil qilinib formaga joylandi! O'ng tomonni tekshiring.</span>`;
};

window.savePU28AIEntry = function () {
    const method = document.getElementById('ai28-entry-method').value;
    const km = document.getElementById('ai28-entry-km').value;
    const pk = document.getElementById('ai28-entry-pk').value;
    const zv = document.getElementById('ai28-entry-zv').value;
    const defect = document.getElementById('ai28-entry-defect').value;

    if (!km || !defect) {
        if (window.SmartUtils) SmartUtils.showToast("Kilometr va kamchilikni kiritish shart! Ovoz bilan qayta urinib ko'ring yoki qo'lda yozing.", "warning");
        return;
    }

    const newRecord = {
        id: Date.now(),
        departmentId: currentPU28Department,
        date: new Date().toISOString().split('T')[0],
        checkMethod: method,
        km: parseInt(km),
        pk: parseInt(pk) || 0,
        zv: parseInt(zv) || 0,
        defectDesc: defect.trim(),
        resolvedStatus: 'pending',
        dateResolved: null
    };

    pu28Data.push(newRecord);
    savePU28DataLocal();

    document.getElementById('pu28-entry-modal').classList.remove('active');
    refreshPU28Table();

    if (window.SmartUtils) {
        SmartUtils.showToast("PU-28 jurnaliga ma'lumot saqlandi!", "success");
    }
};
