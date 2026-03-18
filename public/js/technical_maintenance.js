// Technical Maintenance Journal (TO-1, TO-2, TO-3)
// Texnik Xizmat Ko'rsatish Jurnali

let toRecords = [];
let toVehicles = [];
let currentTOType = null;

// Open Technical Maintenance Journal Window
window.openTechnicalMaintenanceWindow = async function (bolinmaId) {
    const existing = document.getElementById('to-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'to-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); z-index: 10030; display: flex;
        justify-content: center; align-items: center; font-family: 'Inter', sans-serif;
    `;

    modal.innerHTML = `
        <div style="background: #0f172a; width: 95%; max-width: 1200px; height: 90vh; border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; border: 1px solid rgba(56, 189, 248, 0.3);">
            <div style="padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: #1e293b;">
                <div>
                    <h2 style="margin: 0; color: white; display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-wrench" style="color: #38bdf8;"></i> TO-1, TO-2, TO-3 Jurnallari
                    </h2>
                </div>
                <button onclick="document.getElementById('to-modal').remove()" style="background: rgba(255,255,255,0.1); border: none; color: white; font-size: 24px; cursor: pointer; width: 40px; height: 40px; border-radius: 50%;">&times;</button>
            </div>
            <div id="to-content" style="padding: 30px; overflow-y: auto; flex: 1; color: white;">
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 20px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #38bdf8;"></i>
                    <p style="font-size: 1.2rem; color: #94a3b8;">Ma'lumotlar yuklanmoqda...</p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    try {
        toRecords = await SmartUtils.fetchAPI('/mechanics/maintenance') || [];
        toVehicles = await SmartUtils.fetchAPI(`/mechanics/vehicles?bolinma_id=${bolinmaId}`) || [];
        renderTODashboard();
    } catch (e) {
        console.error("Maintenance load error:", e);
        document.getElementById('to-content').innerHTML = '<div style="text-align:center; padding:50px; color:#ef4444;">Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.</div>';
    }
};

window.renderTODashboard = function () {
    const content = document.getElementById('to-content');
    if (!content) return;

    const stats = {
        total: toRecords.length,
        to1: toRecords.filter(r => r.to_type === 'TO-1').length,
        to2: toRecords.filter(r => r.to_type === 'TO-2').length,
        to3: toRecords.filter(r => r.to_type === 'TO-3').length
    };

    content.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
            <div onclick="openTOJournal('TO-1')" style="background: linear-gradient(135deg, #3498db, #2980b9); padding: 30px; border-radius: 15px; cursor: pointer; text-align: center;">
                <h1 style="margin: 0; font-size: 3rem;">TO-1</h1>
                <p>Kundalik (1000 km)</p>
                <div style="font-size: 1.5rem; font-weight: bold; margin-top: 10px;">${stats.to1} ta qayd</div>
            </div>
            <div onclick="openTOJournal('TO-2')" style="background: linear-gradient(135deg, #f39c12, #d35400); padding: 30px; border-radius: 15px; cursor: pointer; text-align: center;">
                <h1 style="margin: 0; font-size: 3rem;">TO-2</h1>
                <p>O'rta (5000 km)</p>
                <div style="font-size: 1.5rem; font-weight: bold; margin-top: 10px;">${stats.to2} ta qayd</div>
            </div>
            <div onclick="openTOJournal('TO-3')" style="background: linear-gradient(135deg, #e74c3c, #c0392b); padding: 30px; border-radius: 15px; cursor: pointer; text-align: center;">
                <h1 style="margin: 0; font-size: 3rem;">TO-3</h1>
                <p>Kapital (10000 km)</p>
                <div style="font-size: 1.5rem; font-weight: bold; margin-top: 10px;">${stats.to3} ta qayd</div>
            </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.5); border-radius: 15px; padding: 25px; border: 1px solid rgba(255,255,255,0.05);">
            <h3 style="margin:0 0 20px 0;"><i class="fas fa-history"></i> So'nggi amallar</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="text-align: left; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <th style="padding: 12px;">Sana</th>
                        <th style="padding: 12px;">Texnika</th>
                        <th style="padding: 12px;">Turi</th>
                        <th style="padding: 12px;">Inspektor</th>
                        <th style="padding: 12px;">Holat</th>
                    </tr>
                </thead>
                <tbody>
                    ${toRecords.slice(0, 5).map(r => `
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                            <td style="padding: 12px;">${new Date(r.date).toLocaleDateString()}</td>
                            <td style="padding: 12px; font-weight: bold; color: #38bdf8;">${r.vehicle_name}</td>
                            <td style="padding: 12px;"><span style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px;">${r.to_type}</span></td>
                            <td style="padding: 12px;">${r.inspector ? r.inspector : '---'}</td>
                            <td style="padding: 12px;"><span style="color: #2ecc71;">✅ Bajarildi</span></td>
                        </tr>
                    `).join('')}
                    ${toRecords.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding:20px; color:#64748b;">Hali qaydlar yo\'q</td></tr>' : ''}
                </tbody>
            </table>
        </div>
    `;
}

window.openTOJournal = function (type) {
    currentTOType = type;
    const content = document.getElementById('to-content');
    const filtered = toRecords.filter(r => r.to_type === type);

    content.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
            <button onclick="renderTODashboard()" style="background: rgba(255,255,255,0.1); border: none; color: white; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                <i class="fas fa-arrow-left"></i> Orqaga
            </button>
            <h2 style="margin: 0;">${type} Jurnali</h2>
            <button onclick="openNewTOForm()" style="background: #2ecc71; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                <i class="fas fa-plus"></i> Yangi Qayd
            </button>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #1e293b; text-align: left; color: #94a3b8;">
                    <th style="padding: 15px;">Sana</th>
                    <th style="padding: 15px;">Texnika</th>
                    <th style="padding: 15px;">Inspektor</th>
                    <th style="padding: 15px;">Izoh</th>
                    <th style="padding: 15px; text-align: center;">Amallar</th>
                </tr>
            </thead>
            <tbody>
                ${filtered.map(r => `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 15px;">${new Date(r.date).toLocaleDateString()}</td>
                        <td style="padding: 15px; font-weight: bold;">${r.vehicle_name} (${r.vehicle_number})</td>
                        <td style="padding: 15px;">${r.inspector}</td>
                        <td style="padding: 15px; font-size: 0.9rem; color: #cbd5e1;">${r.notes || '-'}</td>
                        <td style="padding: 15px; text-align: center;">
                            <button onclick="deleteTORecord('${r.id}')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
                ${filtered.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding:40px; color:#64748b;">Ushbu turdagi qaydlar mavjud emas</td></tr>' : ''}
            </tbody>
        </table>
    `;
};

window.openNewTOForm = function () {
    const formHTML = `
        <div id="to-form-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15,23,42,0.95); display: flex; align-items: center; justify-content: center; z-index: 10050;">
            <div style="background: #1e293b; width: 450px; padding: 30px; border-radius: 15px; border: 1px solid #38bdf8;">
                <h3 style="color: white; margin: 0 0 20px 0;">Yangi ${currentTOType} Qaydi</h3>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <select id="to-vehicle-select" style="background: #0f172a; border: 1px solid #334155; color: white; padding: 12px; border-radius: 8px;">
                        <option value="">Texnikani tanlang</option>
                        ${toVehicles.map(v => `<option value="${v.id}">${v.name} (${v.number})</option>`).join('')}
                    </select>
                    <input type="date" id="to-date-input" value="${new Date().toISOString().split('T')[0]}" style="background: #0f172a; border: 1px solid #334155; color: white; padding: 12px; border-radius: 8px;">
                    <input type="text" id="to-inspector-input" placeholder="Inspektor (F.I.Sh)" style="background: #0f172a; border: 1px solid #334155; color: white; padding: 12px; border-radius: 8px;">
                    <textarea id="to-notes-input" placeholder="Izoh / Kamchiliklar" style="background: #0f172a; border: 1px solid #334155; color: white; padding: 12px; border-radius: 8px; min-height: 80px;"></textarea>
                </div>
                <div style="display: flex; gap: 10px; margin-top:25px;">
                    <button onclick="saveNewTORecord()" style="flex: 1; background: #2ecc71; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold;">Saqlash</button>
                    <button onclick="document.getElementById('to-form-overlay').remove()" style="flex: 1; background: #94a3b8; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold;">Bekor qilish</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', formHTML);
};

window.saveNewTORecord = async function () {
    const payload = {
        vehicle_id: document.getElementById('to-vehicle-select').value,
        to_type: currentTOType,
        date: document.getElementById('to-date-input').value,
        inspector: document.getElementById('to-inspector-input').value,
        notes: document.getElementById('to-notes-input').value
    };

    if (!payload.vehicle_id || !payload.inspector) return alert("Barcha maydonlarni to'ldiring!");

    await SmartUtils.fetchAPI('/mechanics/maintenance', { method: 'POST', body: JSON.stringify(payload) });
    showToast(`${currentTOType} qaydi saqlandi!`, "success");
    document.getElementById('to-form-overlay').remove();

    // Refresh data
    toRecords = await SmartUtils.fetchAPI('/mechanics/maintenance') || [];
    openTOJournal(currentTOType);
};

window.deleteTORecord = async function (id) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await SmartUtils.fetchAPI(`/mechanics/maintenance/${id}`, { method: 'DELETE' });
    toRecords = await SmartUtils.fetchAPI('/mechanics/maintenance') || [];
    openTOJournal(currentTOType);
};

