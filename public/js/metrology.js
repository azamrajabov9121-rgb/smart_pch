// Metrology Department (Standardization & Electricity) - v3.0 (API Connected)
// Features: Monthly Electricity Persistence, Device Calibration (LGM Stamp) with Backend

(function () {
    window.initMetrologyData = initMetrologyData;
    window.getMetrologyDashboardHTML = getMetrologyDashboardHTML;
    window.refreshMetrologyViews = refreshMetrologyViews;
    window.saveElectricityReading = saveElectricityReading;
    window.addMetrologyDeviceRecord = addMetrologyDeviceRecord;
    window.renderMetrologySection = renderMetrologySection;

    async function initMetrologyData() {
        const currentUser = window.Auth?.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
        const bolinmaId = currentUser.bolinmalar?.[0] || 'admin';

        try {
            // Load Electricity
            const elec = await SmartUtils.fetchAPI(`/metrology/electricity/${bolinmaId}`);
            window.metrologyElectricity = window.metrologyElectricity || {};
            window.metrologyElectricity[bolinmaId] = elec || { lastReading: 0, currentMonth: 0 };

            // Load Devices
            const devices = await SmartUtils.fetchAPI(`/metrology/devices?bolinma_id=${bolinmaId}`);
            window.metrologyDevices = devices || [];
        } catch (e) {
            console.error("Metrology Init Error:", e);
            // Fallback to local
            window.metrologyDevices = JSON.parse(localStorage.getItem('metrologyDevices') || '[]');
            window.metrologyElectricity = JSON.parse(localStorage.getItem('metrologyElectricity') || '{}');
        }
    }

    function getMetrologyDashboardHTML() {
        const currentUser = window.Auth?.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
        const bolinmaId = currentUser.bolinmalar?.[0] || 'admin';

        const elec = window.metrologyElectricity?.[bolinmaId] || { lastReading: 0, currentMonth: 0 };
        const devices = window.metrologyDevices || [];

        return `
        <style>
            .metrology-container { padding: 40px; font-family: 'Inter', sans-serif; background: #0f172a; min-height: 100vh; color: #fff; }
            .metro-header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 40px; display: flex; justify-content: space-between; align-items: center; }
            .metro-title h1 { margin: 0; font-size: 2.5rem; font-weight: 900; letter-spacing: -1.5px; }
            .metro-title p { margin: 10px 0 0 0; color: #38bdf8; font-weight: 800; font-size: 1.1rem; text-transform: uppercase; }
            
            .metro-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
            .metro-card { background: rgba(255,255,255,0.03); border-radius: 35px; border: 1.5px solid rgba(255,255,255,0.1); padding: 40px; backdrop-filter: blur(20px); }
            .metro-card h3 { margin: 0 0 30px 0; font-size: 1.4rem; font-weight: 900; display: flex; align-items: center; gap: 15px; color: #fff; }
            
            .elec-input-group { background: #fff; border-radius: 25px; padding: 30px; margin-bottom: 25px; }
            .elec-label { display: block; color: #000; font-weight: 900; font-size: 0.85rem; text-transform: uppercase; margin-bottom: 15px; }
            .elec-val { width: 100%; border: none; border-bottom: 3px solid #000; font-size: 1.8rem; font-weight: 1000; color: #000; outline: none; padding: 10px 0; }
            
            .last-val-box { background: rgba(56,189,248,0.1); padding: 20px; border-radius: 20px; border: 1.5px solid rgba(56,189,248,0.2); margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
            .last-val-label { font-weight: 800; color: #38bdf8; font-size: 0.9rem; }
            .last-val-num { font-weight: 1000; font-size: 1.4rem; color: #fff; }

            .devices-table { width: 100%; border-collapse: separate; border-spacing: 0 12px; }
            .devices-table th { text-align: left; padding: 15px; color: #94a3b8; font-weight: 900; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; }
            .devices-table td { padding: 20px 15px; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); color: #fff; font-weight: 800; }
            .devices-table td:first-child { border-left: 1px solid rgba(255,255,255,0.05); border-radius: 20px 0 0 20px; }
            .devices-table td:last-child { border-right: 1px solid rgba(255,255,255,0.05); border-radius: 0 20px 20px 0; }
            
            .birka { padding: 6px 14px; border-radius: 10px; font-size: 0.75rem; font-weight: 1000; text-transform: uppercase; }
            .birka-active { background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid #22c55e; }
            .birka-expired { background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid #ef4444; }

            .metro-btn { padding: 18px 30px; border-radius: 20px; border: none; font-weight: 1000; cursor: pointer; transition: 0.3s; font-size: 1rem; }
            .btn-primary { background: #38bdf8; color: #000; box-shadow: 0 10px 25px rgba(56,189,248,0.3); }
            .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(56,189,248,0.4); }
        </style>

        <div class="metrology-container">
            <div class="metro-header">
                <div class="metro-title">
                    <p>Metrologiya va Standartlashtirish</p>
                    <h1>PCH-O'LCHOV NAZORATI</h1>
                </div>
                <div style="text-align: right;">
                    <div style="color: #94a3b8; font-weight: 800; margin-bottom: 5px;">JOORIY HOLAT</div>
                    <div style="font-weight: 1000; font-size: 1.2rem; color: #fff;">STANDARTGA MUVOFIQ</div>
                </div>
            </div>

            <div class="metro-grid">
                <div class="metro-card">
                    <h3><i class="fas fa-bolt" style="color:#f59e0b;"></i> Elektr Energiyasi Nazorati</h3>
                    <div class="elec-input-group">
                        <label class="elec-label">Joryi oy ko'rsatkichi (kWh):</label>
                        <input type="number" id="metro-elec-current" placeholder="0000" class="elec-val" value="${elec.currentMonth || ''}">
                    </div>
                    <div class="last-val-box">
                        <span class="last-val-label">O'tgan oy (Arxiv):</span>
                        <span class="last-val-num">${elec.lastReading || '0'} kWh</span>
                    </div>
                    <div style="margin-top: 30px;">
                        <button class="metro-btn btn-primary" style="width: 100%;" onclick="saveElectricityReading('${bolinmaId}')">
                            MA'LUMOTNI SAQLASH
                        </button>
                    </div>
                </div>

                <div class="metro-card">
                    <h3><i class="fas fa-shield-alt" style="color:#38bdf8;"></i> LGM / Standartlashtirish</h3>
                    <div style="display: flex; gap: 15px; margin-bottom: 30px;">
                        <div style="flex:1; background: rgba(0,0,0,0.2); padding: 20px; border-radius: 20px; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 1000; color: #fff;">${devices.length}</div>
                            <div style="font-size: 0.7rem; color: #94a3b8; font-weight: 900; margin-top: 5px;">JAMI ASBOBLAR</div>
                        </div>
                        <div style="flex:1; background: rgba(34,197,94,0.1); padding: 20px; border-radius: 20px; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 1000; color: #4ade80;">${devices.filter(d => getCalibrationStatus(d.stampDate) === 'valid').length}</div>
                            <div style="font-size: 0.7rem; color: #4ade80; font-weight: 900; margin-top: 5px;">BIRKA BERILGAN</div>
                        </div>
                    </div>
                    <button class="metro-btn btn-primary" style="width: 100%; margin-top: 20px; background: rgba(255,255,255,0.05); color: #fff; border: 1.5px solid rgba(255,255,255,0.1);" onclick="addMetrologyDeviceRecord('${bolinmaId}')">
                        YANGI ASBOB RO'YXATGA OLISH
                    </button>
                </div>
            </div>

            <div class="metro-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 35px;">
                    <h3 style="margin:0;"><i class="fas fa-list-ul" style="color: #38bdf8;"></i> Asbob va Uskunalar Registri</h3>
                    <div style="background: rgba(255,255,255,0.05); padding: 8px 20px; border-radius: 12px; font-weight: 900; color: #94a3b8; font-size: 0.8rem;">
                        BO'LINMA: ${bolinmaId.toUpperCase()}
                    </div>
                </div>
                <table class="devices-table">
                    <thead>
                        <tr>
                            <th>Nomi</th>
                            <th>Zavod №</th>
                            <th>LGM (Birka) Sanasi</th>
                            <th>Status (Birka)</th>
                            <th>Amal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${devices.length === 0 ? `<tr><td colspan="5" style="text-align: center; color: #475569; padding: 50px;">Ma'lumot mavjud emas...</td></tr>` :
                devices.map(d => {
                    const status = getCalibrationStatus(d.stampDate);
                    return `
                                <tr>
                                    <td>${d.name}</td>
                                    <td>${d.serial || '---'}</td>
                                    <td style="color: #38bdf8;">${d.stampDate || '---'}</td>
                                    <td><span class="birka birka-${status}">${status === 'valid' ? 'ACTIVE' : 'EXPIRED'}</span></td>
                                    <td><button onclick="deleteMetroDevice(${d.id})" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fas fa-trash"></i></button></td>
                                </tr>`;
                }).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
    }

    function getCalibrationStatus(stampDate) {
        if (!stampDate) return 'expired';
        const stamp = new Date(stampDate);
        const now = new Date();
        const diffYears = (now - stamp) / (1000 * 60 * 60 * 24 * 365);
        return diffYears < 1 ? 'valid' : 'expired';
    }

    async function saveElectricityReading(bolinmaId) {
        const currentVal = parseInt(document.getElementById('metro-elec-current')?.value);
        if (isNaN(currentVal)) return SmartUtils.showToast("Qiymat kiriting!", "error");

        const oldData = (window.metrologyElectricity && window.metrologyElectricity[bolinmaId]) || { lastReading: 0, currentMonth: 0 };

        const res = await SmartUtils.fetchAPI('/metrology/electricity', {
            method: 'POST',
            body: JSON.stringify({
                bolinmaId,
                lastReading: oldData.currentMonth || oldData.lastReading,
                currentMonth: currentVal
            })
        });

        if (res) {
            SmartUtils.showToast("Saqlandi", "success");
            refreshMetrologyViews();
        }
    }

    async function addMetrologyDeviceRecord(bolinmaId) {
        const name = prompt("Asbob nomi:");
        if (!name) return;
        const serial = prompt("Zavod №:");
        const stampDate = prompt("LGM sanasi (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);

        const res = await SmartUtils.fetchAPI('/metrology/devices', {
            method: 'POST',
            body: JSON.stringify({ bolinma_id: bolinmaId, name, serial, stampDate })
        });

        if (res) {
            SmartUtils.showToast("Qo'shildi", "success");
            refreshMetrologyViews();
        }
    }

    window.deleteMetroDevice = async (id) => {
        if (!confirm("O'chirilsinmi?")) return;
        const res = await SmartUtils.fetchAPI(`/metrology/devices/${id}`, { method: 'DELETE' });
        if (res) refreshMetrologyViews();
    };

    function renderMetrologySection(windowElement, bolinmaId) {
        const body = windowElement.querySelector('.window-content') || windowElement.querySelector('.department-body');
        if (!body) return;
        let view = body.querySelector('#metrology-dashboard-view');
        if (!view) {
            view = document.createElement('div');
            view.id = 'metrology-dashboard-view';
            body.insertBefore(view, body.firstChild);
        }
        view.innerHTML = getMetrologyDashboardHTML();
    }

    async function refreshMetrologyViews() {
        await initMetrologyData();
        const containers = document.querySelectorAll('.metrology-dashboard-container');
        const view = document.getElementById('metrology-dashboard-view');
        const html = getMetrologyDashboardHTML();
        if (view) view.innerHTML = html;
        containers.forEach(c => c.innerHTML = html);
    }

    initMetrologyData();
})();
