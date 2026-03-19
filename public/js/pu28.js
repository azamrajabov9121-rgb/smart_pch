/**
 * PU-28 Elektron Jurnali (SERVER VERSION)
 */

const socket = io();

let pu28Data = [];
let currentPU28Department = null;

// ================= LOAD DATA =================
async function loadPU28FromServer() {
    try {
        const res = await fetch(`/api/pu28/${currentPU28Department}`);
        const data = await res.json();

        pu28Data = data.map(item => ({
            id: item.id,
            departmentId: item.bolinma_id,
            date: item.date,
            checkMethod: item.check_method,
            km: item.km,
            pk: item.pk,
            zv: item.zv,
            defectDesc: item.defect_desc,
            resolvedStatus: item.resolved_status,
            dateResolved: item.date_resolved
        }));

        refreshPU28Table();

    } catch (err) {
        console.error('❌ Yuklashda xatolik:', err);
    }
}

// ================= SOCKET =================
socket.on('new_report', () => {
    console.log('🔥 Yangi ma\'lumot keldi');
    loadPU28FromServer();
});

// ================= OPEN WINDOW =================
window.openPU28Window = function (departmentId) {
    currentPU28Department = departmentId;

    let modal = document.getElementById('pu28-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pu28-modal';
        modal.className = 'integration-window';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="window-header">
            <h2>PU-28 Jurnali</h2>
            <button onclick="document.getElementById('pu28-modal').classList.remove('active')">X</button>
        </div>

        <div class="window-content">
            <button onclick="createNewPU28Record()">+ Qo'shish</button>

            <div id="pu28-table-content"></div>
        </div>
    `;

    modal.classList.add('active');

    loadPU28FromServer();
};

// ================= REFRESH =================
window.refreshPU28Table = function () {
    const container = document.getElementById('pu28-table-content');

    if (!container) return;

    if (pu28Data.length === 0) {
        container.innerHTML = 'Ma\'lumot yo\'q';
        return;
    }

    const rows = pu28Data.map(r => `
        <tr>
            <td>${r.date}</td>
            <td>${r.checkMethod}</td>
            <td>${r.km}</td>
            <td>${r.pk}</td>
            <td>${r.zv}</td>
            <td>${r.defectDesc}</td>
            <td>
                ${r.resolvedStatus !== 'resolved'
                    ? `<button onclick="resolvePU28(${r.id})">OK</button>`
                    : 'Bajarildi'}
            </td>
        </tr>
    `).join('');

    container.innerHTML = `
        <table border="1" width="100%">
            <tr>
                <th>Sana</th>
                <th>Usul</th>
                <th>Km</th>
                <th>Pk</th>
                <th>Zv</th>
                <th>Kamchilik</th>
                <th>Holat</th>
            </tr>
            ${rows}
        </table>
    `;
};

// ================= CREATE =================
window.createNewPU28Record = function () {
    const km = prompt("KM:");
    const defect = prompt("Kamchilik:");

    if (!km || !defect) return;

    fetch('/api/pu28', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            bolinma_id: currentPU28Department,
            check_method: 'Vizual',
            km: parseInt(km),
            pk: 0,
            zv: 0,
            defect_desc: defect
        })
    })
    .then(res => res.json())
    .then(() => {
        console.log('✅ Saqlandi');
    })
    .catch(err => console.error(err));
};

// ================= RESOLVE =================
window.resolvePU28 = function (id) {
    fetch(`/api/pu28/${id}/resolve`, {
        method: 'PUT'
    })
    .then(() => loadPU28FromServer());
};