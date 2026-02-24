// Technical Maintenance Journal (TO-1, TO-2, TO-3)
// Texnik Xizmat Ko'rsatish Jurnali

let toRecords = [];
let currentTOType = null;

// Load TO records from localStorage
function loadTORecords() {
    const saved = localStorage.getItem('toRecords');
    if (saved) {
        toRecords = JSON.parse(saved);
    }
}

// Save TO records to localStorage
function saveTORecords() {
    localStorage.setItem('toRecords', JSON.stringify(toRecords));
}

// Open Technical Maintenance Journal Window
window.openTechnicalMaintenanceWindow = function (bolinmaId) {
    loadTORecords();

    // Remove existing modal
    const existing = document.getElementById('to-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'to-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.95); z-index: 10030; display: flex;
        justify-content: center; align-items: center; overflow-y: auto;
    `;

    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); width: 95%; max-width: 1400px; max-height: 95vh; border-radius: 20px; display: flex; flex-direction: column; box-shadow: 0 0 50px rgba(0,0,0,0.8); border: 2px solid rgba(255,255,255,0.1);">
            
            <!-- Header -->
            <div style="padding: 20px 30px; border-bottom: 2px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); border-radius: 20px 20px 0 0;">
                <div>
                    <h2 style="margin: 0; color: white; display: flex; align-items: center; gap: 15px;">
                        <i class="fas fa-wrench" style="color: #3498db;"></i>
                        Texnik Xizmat Ko'rsatish Jurnali
                    </h2>
                    <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.7); font-size: 0.9em;">
                        TO-1, TO-2, TO-3 Jurnallari
                    </p>
                </div>
                <button onclick="closeTechnicalMaintenanceWindow()" style="background: rgba(231, 76, 60, 0.2); border: 1px solid #e74c3c; color: white; font-size: 28px; cursor: pointer; width: 45px; height: 45px; border-radius: 50%; transition: all 0.3s;">&times;</button>
            </div>

            <!-- Content Area -->
            <div id="to-content" style="padding: 25px 30px; overflow-y: auto; flex-grow: 1; color: white;">
                <!-- Content will be loaded here -->
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    renderTODashboard();
};

// Close Technical Maintenance Window
window.closeTechnicalMaintenanceWindow = function () {
    const modal = document.getElementById('to-modal');
    if (modal) modal.remove();
};

// Render TO Dashboard
function renderTODashboard() {
    const content = document.getElementById('to-content');
    if (!content) return;

    // Calculate statistics
    const stats = {
        total: toRecords.length,
        pending: toRecords.filter(r => r.status === 'pending').length,
        completed: toRecords.filter(r => r.status === 'completed' && new Date(r.completedDate).getMonth() === new Date().getMonth()).length,
        overdue: toRecords.filter(r => r.status === 'overdue').length
    };

    content.innerHTML = `
        <!-- TO Type Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <!-- TO-1 Card -->
            <div onclick="openTOJournal('TO-1')" style="background: linear-gradient(135deg, rgba(52, 152, 219, 0.2), rgba(41, 128, 185, 0.3)); border: 2px solid rgba(52, 152, 219, 0.3); border-radius: 15px; padding: 30px; cursor: pointer; transition: all 0.3s; backdrop-filter: blur(10px); position: relative; overflow: hidden;">
                <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(52, 152, 219, 0.1); border-radius: 50%;"></div>
                <div style="position: relative; z-index: 1;">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                        <i class="fas fa-wrench" style="font-size: 2.5rem; color: #3498db;"></i>
                        <h2 style="margin: 0; font-size: 3rem; color: #3498db; font-weight: bold;">TO-1</h2>
                    </div>
                    <h3 style="margin: 0 0 10px 0; color: white; font-size: 1.2rem;">Kundalik Texnik Ko'rik</h3>
                    <div style="display: inline-block; background: rgba(52, 152, 219, 0.3); padding: 5px 15px; border-radius: 20px; font-size: 0.9rem; color: #3498db; border: 1px solid rgba(52, 152, 219, 0.5);">
                        <i class="fas fa-route"></i> Har 1000 km
                    </div>
                </div>
            </div>

            <!-- TO-2 Card -->
            <div onclick="openTOJournal('TO-2')" style="background: linear-gradient(135deg, rgba(243, 156, 18, 0.2), rgba(211, 84, 0, 0.3)); border: 2px solid rgba(243, 156, 18, 0.3); border-radius: 15px; padding: 30px; cursor: pointer; transition: all 0.3s; backdrop-filter: blur(10px); position: relative; overflow: hidden;">
                <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(243, 156, 18, 0.1); border-radius: 50%;"></div>
                <div style="position: relative; z-index: 1;">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                        <i class="fas fa-tools" style="font-size: 2.5rem; color: #f39c12;"></i>
                        <h2 style="margin: 0; font-size: 3rem; color: #f39c12; font-weight: bold;">TO-2</h2>
                    </div>
                    <h3 style="margin: 0 0 10px 0; color: white; font-size: 1.2rem;">O'rta Texnik Ko'rik</h3>
                    <div style="display: inline-block; background: rgba(243, 156, 18, 0.3); padding: 5px 15px; border-radius: 20px; font-size: 0.9rem; color: #f39c12; border: 1px solid rgba(243, 156, 18, 0.5);">
                        <i class="fas fa-route"></i> Har 5000 km
                    </div>
                </div>
            </div>

            <!-- TO-3 Card -->
            <div onclick="openTOJournal('TO-3')" style="background: linear-gradient(135deg, rgba(231, 76, 60, 0.2), rgba(192, 57, 43, 0.3)); border: 2px solid rgba(231, 76, 60, 0.3); border-radius: 15px; padding: 30px; cursor: pointer; transition: all 0.3s; backdrop-filter: blur(10px); position: relative; overflow: hidden;">
                <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(231, 76, 60, 0.1); border-radius: 50%;"></div>
                <div style="position: relative; z-index: 1;">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                        <i class="fas fa-hard-hat" style="font-size: 2.5rem; color: #e74c3c;"></i>
                        <h2 style="margin: 0; font-size: 3rem; color: #e74c3c; font-weight: bold;">TO-3</h2>
                    </div>
                    <h3 style="margin: 0 0 10px 0; color: white; font-size: 1.2rem;">Kapital Texnik Ko'rik</h3>
                    <div style="display: inline-block; background: rgba(231, 76, 60, 0.3); padding: 5px 15px; border-radius: 20px; font-size: 0.9rem; color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.5);">
                        <i class="fas fa-route"></i> Har 10000 km
                    </div>
                </div>
            </div>
        </div>

        <!-- Statistics Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
            <div style="background: rgba(52, 152, 219, 0.1); border: 1px solid rgba(52, 152, 219, 0.3); border-radius: 12px; padding: 20px; text-align: center;">
                <i class="fas fa-clipboard-list" style="font-size: 2rem; color: #3498db; margin-bottom: 10px;"></i>
                <div style="font-size: 2rem; font-weight: bold; color: white; margin-bottom: 5px;">${stats.total}</div>
                <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Jami Ko'riklar</div>
            </div>
            <div style="background: rgba(241, 196, 15, 0.1); border: 1px solid rgba(241, 196, 15, 0.3); border-radius: 12px; padding: 20px; text-align: center;">
                <i class="fas fa-clock" style="font-size: 2rem; color: #f1c40f; margin-bottom: 10px;"></i>
                <div style="font-size: 2rem; font-weight: bold; color: white; margin-bottom: 5px;">${stats.pending}</div>
                <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Kutilmoqda</div>
            </div>
            <div style="background: rgba(46, 204, 113, 0.1); border: 1px solid rgba(46, 204, 113, 0.3); border-radius: 12px; padding: 20px; text-align: center;">
                <i class="fas fa-check-circle" style="font-size: 2rem; color: #2ecc71; margin-bottom: 10px;"></i>
                <div style="font-size: 2rem; font-weight: bold; color: white; margin-bottom: 5px;">${stats.completed}</div>
                <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Shu Oyda Bajarildi</div>
            </div>
            <div style="background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.3); border-radius: 12px; padding: 20px; text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #e74c3c; margin-bottom: 10px;"></i>
                <div style="font-size: 2rem; font-weight: bold; color: white; margin-bottom: 5px;">${stats.overdue}</div>
                <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Kechikkan</div>
            </div>
        </div>

        <!-- Recent Inspections Table -->
        <div style="background: rgba(0,0,0,0.3); border-radius: 15px; padding: 20px; border: 1px solid rgba(255,255,255,0.1);">
            <h3 style="margin: 0 0 20px 0; color: white; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-history"></i> So'nggi Ko'riklar
            </h3>
            ${renderRecentInspections()}
        </div>
    `;
}

// Render recent inspections
function renderRecentInspections() {
    const recent = toRecords.slice(-10).reverse();

    if (recent.length === 0) {
        return '<p style="text-align: center; color: rgba(255,255,255,0.5); padding: 40px;">Hozircha ko\'riklar yo\'q</p>';
    }

    return `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="border-bottom: 2px solid rgba(255,255,255,0.1);">
                    <th style="padding: 12px; text-align: left; color: rgba(255,255,255,0.7); font-weight: 600;">Vagon/Lokomotiv</th>
                    <th style="padding: 12px; text-align: left; color: rgba(255,255,255,0.7); font-weight: 600;">TO Turi</th>
                    <th style="padding: 12px; text-align: left; color: rgba(255,255,255,0.7); font-weight: 600;">Sana</th>
                    <th style="padding: 12px; text-align: left; color: rgba(255,255,255,0.7); font-weight: 600;">Holat</th>
                </tr>
            </thead>
            <tbody>
                ${recent.map(record => `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: all 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
                        <td style="padding: 12px; color: white;">${record.vehicleName}</td>
                        <td style="padding: 12px; color: white;">${record.toType}</td>
                        <td style="padding: 12px; color: rgba(255,255,255,0.7);">${new Date(record.date).toLocaleDateString('uz-UZ')}</td>
                        <td style="padding: 12px;">
                            ${getStatusBadge(record.status)}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Get status badge
function getStatusBadge(status) {
    const badges = {
        completed: '<span style="background: rgba(46, 204, 113, 0.2); color: #2ecc71; padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; border: 1px solid rgba(46, 204, 113, 0.5);"><i class="fas fa-check"></i> Bajarildi</span>',
        pending: '<span style="background: rgba(241, 196, 15, 0.2); color: #f1c40f; padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; border: 1px solid rgba(241, 196, 15, 0.5);"><i class="fas fa-clock"></i> Kutilmoqda</span>',
        overdue: '<span style="background: rgba(231, 76, 60, 0.2); color: #e74c3c; padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; border: 1px solid rgba(231, 76, 60, 0.5);"><i class="fas fa-exclamation-triangle"></i> Kechikkan</span>'
    };
    return badges[status] || badges.pending;
}

// Open TO Journal (TO-1, TO-2, or TO-3)
// Open TO Journal View
window.openTOJournal = function (toType) {
    currentTOType = toType;

    // Find content area in main window
    const content = document.getElementById('to-content');
    if (!content) return;

    const modalHTML = `
        <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1); height: 100%; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: white; display: flex; align-items: center; gap: 10px;">
                    <button onclick="renderTODashboard()" style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; opacity: 0.7; transition: 0.3s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    ${toType} Jurnali
                </h2>
                <button onclick="openNewTOForm()" style="background: linear-gradient(45deg, #2ecc71, #27ae60); border: none; color: white; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);">
                    <i class="fas fa-plus"></i> Yangi Ko'rik
                </button>
            </div>

            <div style="flex: 1; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse; color: white;">
                    <thead style="background: rgba(0,0,0,0.5); position: sticky; top: 0;">
                        <tr>
                            <th style="padding: 15px; text-align: left;">Sana</th>
                            <th style="padding: 15px; text-align: left;">Texnika</th>
                            <th style="padding: 15px; text-align: left;">Mas'ul</th>
                            <th style="padding: 15px; text-align: left;">Izoh</th>
                            <th style="padding: 15px; text-align: center;">Holat</th>
                            <th style="padding: 15px; text-align: center;">Amallar</th>
                        </tr>
                    </thead>
                    <tbody id="to-journal-tbody">
                        ${renderTOJournalRows(toType)}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    content.innerHTML = modalHTML;
};

function renderTOJournalRows(type) {
    const list = toRecords.filter(r => r.toType === type).sort((a, b) => new Date(b.date) - new Date(a.date));

    if (list.length === 0) return '<tr><td colspan="6" style="padding: 40px; text-align: center; color: rgba(255,255,255,0.5);">Yozuvlar mavjud emas</td></tr>';

    return list.map(r => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 15px;">${new Date(r.date).toLocaleDateString()}</td>
            <td style="padding: 15px; font-weight: bold;">${r.vehicleName}</td>
            <td style="padding: 15px;">${r.inspector}</td>
            <td style="padding: 15px; font-style: italic; color: #aaa;">${r.notes || '-'}</td>
            <td style="padding: 15px; text-align: center;">${getStatusBadge(r.status)}</td>
            <td style="padding: 15px; text-align: center;">
                <button onclick="toggleTOStatus('${r.id}')" title="Holatni o'zgartirish" style="background: rgba(255,255,255,0.1); border: none; color: white; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-sync-alt"></i>
                </button>
                 <button onclick="deleteTORecord('${r.id}')" title="O'chirish" style="background: rgba(231, 76, 60, 0.2); border: 1px solid #e74c3c; color: #e74c3c; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-left: 5px;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

window.openNewTOForm = function () {
    const formHTML = `
        <div id="to-form-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10100; display: flex; justify-content: center; align-items: center;">
            <div style="background: #2c3e50; padding: 30px; border-radius: 15px; width: 500px; color: white; box-shadow: 0 0 50px rgba(0,0,0,0.8);">
                <h3 style="margin-top: 0; margin-bottom: 20px;">Yangi ${currentTOType} Ko'rigi</h3>
                
                <label style="display: block; margin-bottom: 5px;">Texnika Nomi</label>
                <input type="text" id="to-vehicle" placeholder="Masalan: Ekskavator CAT-320" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 5px; border: none;">
                
                <label style="display: block; margin-bottom: 5px;">O'tkazilgan Sana</label>
                <input type="date" id="to-date" value="${new Date().toISOString().slice(0, 10)}" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 5px; border: none;">
                
                <label style="display: block; margin-bottom: 5px;">Mas'ul Shaxs (Inspektor)</label>
                <input type="text" id="to-inspector" placeholder="F.I.Sh" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 5px; border: none;">
                
                 <label style="display: block; margin-bottom: 5px;">Izoh / Aniqlangan kamchiliklar</label>
                <textarea id="to-notes" rows="3" style="width: 100%; padding: 10px; margin-bottom: 20px; border-radius: 5px; border: none;"></textarea>

                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button onclick="document.getElementById('to-form-modal').remove()" style="padding: 10px 20px; background: transparent; border: 1px solid #95a5a6; color: #bdc3c7; border-radius: 5px; cursor: pointer;">Bekor qilish</button>
                    <button onclick="saveNewTORecord()" style="padding: 10px 25px; background: #2ecc71; border: none; color: white; border-radius: 5px; cursor: pointer; font-weight: bold;">Saqlash</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', formHTML);
};

window.saveNewTORecord = function () {
    const vehicle = document.getElementById('to-vehicle').value;
    const date = document.getElementById('to-date').value;
    const inspector = document.getElementById('to-inspector').value;
    const notes = document.getElementById('to-notes').value;

    if (!vehicle || !inspector) {
        alert("Texnika nomi va mas'ul shaxsni kiriting!");
        return;
    }

    const newRecord = {
        id: Date.now(),
        toType: currentTOType,
        vehicleName: vehicle,
        date: date,
        inspector: inspector,
        notes: notes,
        status: 'completed', // Default completed for now
        completedDate: new Date().toISOString()
    };

    toRecords.push(newRecord);
    saveTORecords();
    document.getElementById('to-form-modal').remove();
    openTOJournal(currentTOType); // Refresh
};

window.deleteTORecord = function (id) {
    if (confirm("O'chirishni tasdiqlaysizmi?")) {
        toRecords = toRecords.filter(r => r.id != id);
        saveTORecords();
        openTOJournal(currentTOType); // Refresh
    }
};

window.toggleTOStatus = function (id) {
    const r = toRecords.find(k => k.id == id);
    if (r) {
        r.status = r.status === 'completed' ? 'pending' : 'completed';
        saveTORecords();
        openTOJournal(currentTOType); // Refresh
    }
};


// Global exports
window.openTechnicalMaintenanceWindow = openTechnicalMaintenanceWindow;
window.closeTechnicalMaintenanceWindow = closeTechnicalMaintenanceWindow;
window.openTOJournal = openTOJournal;
