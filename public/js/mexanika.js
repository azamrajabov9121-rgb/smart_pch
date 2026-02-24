// Mexanika Bo'limi - Auto-inject Technical Maintenance & Waybill Buttons
// Updated to support direct calls from renderMechanicsSection

function openRepairJournal(bolinmaId) {
    alert("Ta'mir Jurnali moduli tez orada ishga tushadi!");
}

function openSpareParts(bolinmaId) {
    alert("Ehtiyot Qismlar moduli tez orada ishga tushadi!");
}

// Export new functions
window.openRepairJournal = openRepairJournal;
window.openSpareParts = openSpareParts;

// --- NEW FEATURES: VEHICLE MANAGEMENT ---

function openAddVehicleModal() {
    const modalHTML = `
        <div id="add-vehicle-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center; z-index:10000;">
            <div style="background:#1e293b; width:450px; padding:30px; border-radius:15px; border:1px solid rgba(56, 189, 248, 0.4); box-shadow:0 0 50px rgba(0,0,0,0.5);">
                <h3 style="color:white; margin-top:0; display:flex; align-items:center; gap:10px;">
                    <i class="fas fa-plus-circle" style="color:#2ecc71;"></i> Yangi Texnika Qo'shish
                </h3>
                <div style="display:flex; flex-direction:column; gap:15px; margin-top:20px;">
                    <input type="text" id="new-v-name" placeholder="Texnika nomi (masalan: Isuzu)" style="background:#0f172a; border:1px solid #334155; color:white; padding:12px; border-radius:8px;">
                    <input type="text" id="new-v-number" placeholder="Davlat raqami (01 777 AAA)" style="background:#0f172a; border:1px solid #334155; color:white; padding:12px; border-radius:8px;">
                    <input type="text" id="new-v-garage" placeholder="Garaj raqami" style="background:#0f172a; border:1px solid #334155; color:white; padding:12px; border-radius:8px;">
                    <select id="new-v-fuel" style="background:#0f172a; border:1px solid #334155; color:white; padding:12px; border-radius:8px;">
                        <option value="Dizel">Dizel</option>
                        <option value="Benzin">Benzin</option>
                        <option value="Gaz">Gaz</option>
                    </select>
                    <input type="number" id="new-v-norm" placeholder="Yoqilg'i normasi (L/100km)" style="background:#0f172a; border:1px solid #334155; color:white; padding:12px; border-radius:8px;">
                </div>
                <div style="display:flex; gap:10px; margin-top:25px;">
                    <button onclick="saveNewVehicle()" style="flex:1; background:#2ecc71; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold;">Saqlash</button>
                    <button onclick="document.getElementById('add-vehicle-modal').remove()" style="flex:1; background:#ef4444; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold;">Bekor qilish</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function saveNewVehicle() {
    const name = document.getElementById('new-v-name').value;
    const number = document.getElementById('new-v-number').value;
    const garage = document.getElementById('new-v-garage').value;
    const fuel = document.getElementById('new-v-fuel').value;
    const norm = document.getElementById('new-v-norm').value;

    if (!name || !number) {
        alert("Iltimos, barcha maydonlarni to'ldiring!");
        return;
    }

    const newVehicle = {
        id: 'V-' + Date.now(),
        name: name,
        number: number,
        garage: garage,
        fuelType: fuel,
        fuelNorm: parseFloat(norm) || 0,
        status: 'free',
        startFuel: 0,
        startSpeedometer: 0
    };

    window.waybillData.vehicles.push(newVehicle);
    document.getElementById('add-vehicle-modal').remove();

    // Refresh the view if the dashboard is open
    if (typeof refreshMechanicsDashboard === 'function') refreshMechanicsDashboard();
    alert("✅ Yangi texnika muvaffaqiyatli qo'shildi!");
}

function deleteVehicle(vehicleId) {
    if (!confirm("Haqiqatan ham ushbu texnikani ro'yxatdan o'chirmoqchimisiz?")) return;

    window.waybillData.vehicles = window.waybillData.vehicles.filter(v => v.id !== vehicleId);
    if (typeof refreshMechanicsDashboard === 'function') refreshMechanicsDashboard();
    alert("❌ Texnika o'chirildi.");
}

function approveOrder(orderId) {
    const order = window.waybillData.orders.find(o => o.id === orderId);
    if (!order) return;

    if (order.status === 'approved') {
        alert("Ushbu buyurtma allaqachon tasdiqlangan!");
        return;
    }

    const confirmMsg = `Buyurtmani tasdiqlaysizmi?\n\nBo'linma: ${order.deptName}\nTexnika: ${order.vehicleName}\nVazifa: ${order.task}`;
    if (confirm(confirmMsg)) {
        order.status = 'approved';

        // Find vehicle and set to busy
        const vehicle = window.waybillData.vehicles.find(v => v.id === order.vehicleId);
        if (vehicle) {
            vehicle.status = 'busy';
            vehicle.currentTask = order.task;
        }

        if (typeof refreshMechanicsDashboard === 'function') refreshMechanicsDashboard();
        alert("✅ Buyurtma tasdiqlandi!");
    }
}

function rejectOrder(orderId) {
    if (!confirm("Buyurtmani bekor qilmoqchimisiz?")) return;

    const index = window.waybillData.orders.findIndex(o => o.id === orderId);
    if (index > -1) {
        const order = window.waybillData.orders[index];
        // Free up vehicle
        const vehicle = window.waybillData.vehicles.find(v => v.id === order.vehicleId);
        if (vehicle) {
            vehicle.status = 'free';
            delete vehicle.currentTask;
        }
        window.waybillData.orders.splice(index, 1);
        if (typeof refreshMechanicsDashboard === 'function') refreshMechanicsDashboard();
        alert("❌ Buyurtma bekor qilindi.");
    }
}

function refreshMechanicsDashboard() {
    // This is a bridge function to trigger a re-render in script.js
    const dashboardContainer = document.getElementById('mechanics-dashboard-container') || document.getElementById('mechanics-section-view');
    if (dashboardContainer) {
        // Find the window or section it belongs to
        const parentWindow = dashboardContainer.closest('.department-window') || dashboardContainer.closest('section');
        if (window.renderMechanicsSection) {
            window.renderMechanicsSection(parentWindow, 'mexanika');
        }
    }
}

window.openAddVehicleModal = openAddVehicleModal;
window.saveNewVehicle = saveNewVehicle;
window.deleteVehicle = deleteVehicle;
window.approveOrder = approveOrder;
window.rejectOrder = rejectOrder;
window.refreshMechanicsDashboard = refreshMechanicsDashboard;

// --- EXISTING DATA STORE (MOCK) ---
// --- REPLACEMENT: REAL DATA LOADING ---
async function initMechanicsData() {
    try {
        const vehicles = await SmartUtils.fetchAPI('/mechanics/vehicles');
        if (vehicles) {
            window.waybillData.vehicles = vehicles.map(v => ({
                id: v.id,
                name: v.name,
                number: v.number,
                garage: v.garage_number,
                fuelType: v.fuel_type,
                fuelNorm: v.fuel_norm,
                startFuel: v.start_fuel,
                startSpeedometer: v.start_speedometer,
                status: v.status,
                departmentId: v.bolinma_id
            }));
            console.log('✅ Mexanika ma\'lumotlari serverdan yuklandi');
        }
    } catch (e) {
        console.error('Mexanika ma\'lumotlarini yuklashda xatolik:', e);
    }
}

// Global data store shell
window.waybillData = {
    drivers: [
        { id: 1, name: 'Eshmatov Toshmat', category: 'B, C, E', shift: 'Kunduzgi', phone: '+998 90 123 45 67', avatar: 'T', departmentId: 'bolinma1' }
    ],
    vehicles: [],
    orders: []
};

// Auto-init
initMechanicsData();

let currentWaybill = {
    driverId: 'DRV-001',
    vehicleId: 'V-001',
    startTime: '08:00',
    endTime: '17:00',
    startSpeedometer: 12500,
    endSpeedometer: 0,
    startFuel: 45,
    filledFuel: 0,
    endFuel: 0,
    distance: 0,
    normConsumption: 0,
    actualConsumption: 0
};

// --- NEW FEATURES: ORDERING SYSTEM ---

// Open Vehicle Order Window
function openOrderWindow() {
    // Remove if exists
    if (document.getElementById('order-window')) document.getElementById('order-window').remove();

    const modalHTML = `
        <div id="order-window" class="integration-window" style="
            display: flex; 
            flex-direction: column;
            position: fixed; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%); 
            width: 90vw; 
            height: 90vh; 
            max-width: 1600px; 
            background: #0f172a; 
            z-index: 2005; 
            border: 1px solid rgba(56, 189, 248, 0.4); 
            box-shadow: 0 0 60px rgba(0,0,0,0.9); 
            border-radius: 20px; 
            backdrop-filter: blur(15px);
        ">
            <!-- Header -->
            <div class="window-header" style="
                padding: 20px 30px; 
                background: linear-gradient(90deg, #1e293b, #0f172a); 
                border-bottom: 1px solid rgba(255,255,255,0.1); 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                border-radius: 20px 20px 0 0;
            ">
                <h2 style="margin: 0; color: white; display: flex; align-items: center; gap: 15px; font-size: 1.6rem;">
                    <span style="background: rgba(243, 156, 18, 0.2); padding: 10px; border-radius: 12px;">
                        <i class="fas fa-shipping-fast" style="color: #f39c12;"></i>
                    </span>
                    Transport Buyurtma Tizimi
                </h2>
                <div style="display:flex; gap:15px; align-items:center;">
                    <div style="color: #94a3b8; font-size: 0.9rem; margin-right: 20px;">
                        <span style="display:inline-block; width:10px; height:10px; background:#2ecc71; border-radius:50%; margin-right:5px;"></span> Bo'sh
                        <span style="display:inline-block; width:10px; height:10px; background:#e74c3c; border-radius:50%; margin: 0 5px 0 15px;"></span> Band
                        <span style="display:inline-block; width:10px; height:10px; background:#f1c40f; border-radius:50%; margin: 0 5px 0 15px;"></span> Ta'mirda
                    </div>
                    <button class="close-window" onclick="document.getElementById('order-window').remove()" style="background: rgba(255,255,255,0.1); width: 40px; height: 40px; border-radius: 50%; color: white; cursor: pointer; border: 1px solid rgba(255,255,255,0.2);">&times;</button>
                </div>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px; overflow-y: auto; flex-grow: 1;">
                <h3 style="color: white; margin-bottom: 20px;">Hozirgi Holat</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
                    ${renderVehicleCards()}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function renderVehicleCards() {
    return waybillData.vehicles.map(v => {
        let statusColor = '#2ecc71'; // Green (Free)
        let statusText = "Bo'sh (Buyurtma qiling)";
        let btnDisabled = '';
        let statusIcon = 'fa-check-circle';
        let cardOpacity = '1';

        if (v.status === 'busy') {
            statusColor = '#e74c3c'; // Red
            statusText = `Band: ${v.currentTask || 'Ishda'}`;
            btnDisabled = 'disabled';
            statusIcon = 'fa-clock';
            cardOpacity = '0.8';
        } else if (v.status === 'repair') {
            statusColor = '#f1c40f'; // Yellow
            statusText = "Ta'mirda";
            btnDisabled = 'disabled';
            statusIcon = 'fa-tools';
            cardOpacity = '0.7';
        }

        return `
            <div style="
                background: #1e293b; 
                border-radius: 12px; 
                padding: 20px; 
                position: relative; 
                border: 1px solid rgba(255,255,255,0.05); 
                transition: transform 0.2s; 
                opacity: ${cardOpacity};
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            " onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 10px;">
                        <i class="fas fa-truck" style="font-size: 2rem; color: white;"></i>
                    </div>
                    <span style="
                        background: ${statusColor}20; 
                        color: ${statusColor}; 
                        padding: 5px 12px; 
                        border-radius: 20px; 
                        font-size: 0.8rem; 
                        font-weight: bold; 
                        display: flex; 
                        align-items: center; 
                        gap: 5px;
                        border: 1px solid ${statusColor}40;
                    ">
                        <i class="fas ${statusIcon}"></i> ${v.status === 'free' ? "Bo'sh" : (v.status === 'busy' ? "Band" : "Ta'mirda")}
                    </span>
                </div>

                <h3 style="color: white; margin: 0 0 5px 0; font-size: 1.2rem;">${v.name}</h3>
                <p style="color: #94a3b8; margin: 0 0 15px 0; font-size: 0.9rem;">${v.number}</p>

                <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <span style="color: #64748b; font-size: 0.8rem;">Garaj:</span>
                        <span style="color: #cbd5e1; font-size: 0.8rem;">${v.garage}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color: #64748b; font-size: 0.8rem;">Yoqilg'i:</span>
                        <span style="color: #cbd5e1; font-size: 0.8rem;">${v.fuelType}</span>
                    </div>
                </div>

                ${v.status === 'free' ? `
                    <button onclick="bookVehicle('${v.id}')" style="
                        width: 100%; 
                        padding: 12px; 
                        background: linear-gradient(135deg, #3b82f6, #2563eb); 
                        border: none; 
                        border-radius: 8px; 
                        color: white; 
                        font-weight: bold; 
                        cursor: pointer; 
                        transition: all 0.3s;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                    " onmouseover="this.style.boxShadow='0 0 15px #3b82f680'" onmouseout="this.style.boxShadow='none'">
                        <i class="fas fa-calendar-check"></i> Buyurtma Berish
                    </button>
                ` : `
                    <div style="
                        width: 100%; 
                        padding: 12px; 
                        background: rgba(255,255,255,0.05); 
                        border-radius: 8px; 
                        color: #64748b; 
                        text-align: center; 
                        font-size: 0.9rem;
                        border: 1px dashed #475569;
                    ">
                        ${statusText}
                    </div>
                `}
            </div>
        `;
    }).join('');
}

function bookVehicle(vehicleId) {
    const vehicle = waybillData.vehicles.find(v => v.id === vehicleId);
    if (!vehicle || vehicle.status !== 'free') return;

    // Simple Prompt for MVP (Ideally a modal form)
    const task = prompt(`Buyurtma uchun ma'lumot kiritish (${vehicle.name}):\n\nQayerga/Maqsad nima?`);

    if (task) {
        // Update State
        vehicle.status = 'busy';
        vehicle.currentTask = task;

        // Log to History
        waybillData.orders.push({
            id: Date.now(),
            vehicleId: vehicleId,
            vehicleName: vehicle.name,
            task: task,
            deptName: (window.Auth && window.Auth.currentUser ? window.Auth.currentUser.name : "Noma'lum"),
            date: new Date().toLocaleString(),
            status: 'pending'
        });

        alert("✅ Buyurtma qabul qilindi!\nTexnika band qilindi.");

        // Re-render
        if (document.getElementById('order-window')) {
            openOrderWindow(); // Refresh
        }
    }
}

// Open Waybill Window Function
function openWaybillWindow(bolinmaId) {
    // Check if already open
    if (document.getElementById('waybill-window')) return;

    let filteredDrivers = waybillData.drivers;
    let filteredVehicles = waybillData.vehicles;

    // Filter if not Mexanika/Admin
    if (bolinmaId && !bolinmaId.includes('mexanika') && !bolinmaId.includes('admin')) {
        filteredDrivers = waybillData.drivers.filter(d => d.departmentId === bolinmaId);
        filteredVehicles = waybillData.vehicles.filter(v => v.departmentId === bolinmaId);
    }

    // Safety check - if no vehicles for this department
    if (filteredVehicles.length === 0) {
        alert("Sizning bo'linmangizga biriktirilgan texnika topilmadi!");
        return;
    }

    // Load first available driver/vehicle as default
    const driver = filteredDrivers.length > 0 ? filteredDrivers[0] : waybillData.drivers[0];
    const vehicle = filteredVehicles.length > 0 ? filteredVehicles[0] : waybillData.vehicles[0];

    // Reset current waybill state with new defaults
    currentWaybill.driverId = driver.id;
    currentWaybill.vehicleId = vehicle.id;
    currentWaybill.startSpeedometer = vehicle.startSpeedometer;
    currentWaybill.startFuel = vehicle.startFuel;

    const modalHTML = `
        <div id="waybill-window" class="integration-window" style="
            display: flex; 
            flex-direction: column;
            position: fixed; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%); 
            width: 95vw; 
            height: 92vh; 
            max-width: 1800px; 
            background: #0f172a; 
            z-index: 2000; 
            border: 1px solid rgba(56, 189, 248, 0.4); 
            box-shadow: 0 0 60px rgba(0,0,0,0.8); 
            border-radius: 16px; 
            backdrop-filter: blur(10px);
        ">
            <div class="window-header" style="
                padding: 15px 25px; 
                background: linear-gradient(90deg, #1e293b, #0f172a); 
                border-bottom: 1px solid rgba(255,255,255,0.1); 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                border-radius: 16px 16px 0 0;
            ">
                <h2 style="margin: 0; color: white; display: flex; align-items: center; gap: 15px; font-size: 1.5rem;">
                    <span style="background: rgba(56, 189, 248, 0.2); padding: 8px; border-radius: 8px;">
                        <i class="fas fa-file-invoice" style="color: #38bdf8;"></i>
                    </span>
                    Elektron Yo'l Varaqasi (${bolinmaId || 'Umumiy'})
                </h2>
                <div style="display:flex; gap:15px;">
                    <button class="control-btn green" style="padding: 10px 25px; font-size: 1rem; border-radius: 8px; display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #2ecc71, #27ae60); border: none; color: white; cursor: pointer; box-shadow: 0 4px 15px rgba(46, 204, 113, 0.4);" onclick="saveWaybill()">
                        <i class="fas fa-paper-plane"></i> Yuborish
                    </button>
                    <button class="close-window" onclick="document.getElementById('waybill-window').remove()" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); width: 40px; height: 40px; border-radius: 50%; color: white; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s;">&times;</button>
                </div>
            </div>
            
            <div class="waybill-grid" style="
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                grid-template-rows: auto 1fr;
                gap: 25px;
                padding: 25px;
                flex-grow: 1;
                overflow: hidden;
            ">
                <!-- 1. Driver Info -->
                <div class="waybill-card" style="background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column;">
                    <h4 style="color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
                        <span><i class="fas fa-user-circle" style="color: #38bdf8;"></i> Haydovchi</span>
                        <select onchange="updateDriver(this.value)" style="background: #0f172a; border: 1px solid #334155; color: white; padding: 5px 10px; border-radius: 6px; outline: none; cursor: pointer;">
                            ${filteredDrivers.map(d => `<option value="${d.id}" ${d.id === currentWaybill.driverId ? 'selected' : ''}>${d.name}</option>`).join('')}
                        </select>
                    </h4>
                    <div class="driver-profile" id="wb-driver-profile" style="flex: 1;">
                        ${renderDriverProfile(driver)}
                    </div>
                </div>

                <!-- 2. Vehicle Info -->
                <div class="waybill-card" style="background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column;">
                    <h4 style="color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
                        <span><i class="fas fa-truck-monster" style="color: #f39c12;"></i> Texnika</span>
                         <select onchange="updateVehicle(this.value)" style="background: #0f172a; border: 1px solid #334155; color: white; padding: 5px 10px; border-radius: 6px; outline: none; cursor: pointer;">
                            ${filteredVehicles.map(v => `<option value="${v.id}" ${v.id === currentWaybill.vehicleId ? 'selected' : ''}>${v.name}</option>`).join('')}
                        </select>
                    </h4>
                    <div id="wb-vehicle-info" style="flex: 1;">
                        ${renderVehicleInfo(vehicle)}
                    </div>
                    <div class="input-group" style="margin-top: 15px;">
                        <label style="color: #94a3b8; font-size: 0.8rem;">Texnik holati</label>
                        <select class="waybill-input" style="background: rgba(46, 204, 113, 0.1); border: 1px solid #2ecc71; color: #2ecc71; width: 100%; padding: 10px; border-radius: 6px; margin-top: 5px; font-weight: bold;">
                            <option>Soz (Ishga tayyor)</option>
                            <option>Ta'mirtalab</option>
                        </select>
                    </div>
                </div>

                <!-- 3. Shift Details -->
                <div class="waybill-card" style="background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                    <h4 style="color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
                        <i class="fas fa-clock" style="color: #a855f7;"></i> Smena & Spidometr
                    </h4>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom: 15px;">
                        <div class="input-group">
                            <label style="color: #94a3b8; font-size: 0.8rem; display: block; margin-bottom: 5px;">Ish boshi</label>
                            <input type="time" class="waybill-input" id="wb-start-time" value="${currentWaybill.startTime}" onchange="currentWaybill.startTime = this.value" style="background: #0f172a; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; width: 100%;">
                        </div>
                        <div class="input-group">
                            <label style="color: #94a3b8; font-size: 0.8rem; display: block; margin-bottom: 5px;">Ish oxiri</label>
                            <input type="time" class="waybill-input" id="wb-end-time" value="${currentWaybill.endTime}" onchange="currentWaybill.endTime = this.value" style="background: #0f172a; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; width: 100%;">
                        </div>
                    </div>
                    <div class="input-group" style="margin-bottom: 15px;">
                        <label style="color: #94a3b8; font-size: 0.8rem; display: block; margin-bottom: 5px;">Spidometr (Boshlang'ich)</label>
                        <input type="number" class="waybill-input" id="wb-start-km" value="${currentWaybill.startSpeedometer}" readonly style="background: #0f172a; border: 1px solid #334155; color: #38bdf8; font-weight:bold; padding: 10px; border-radius: 6px; width: 100%;">
                    </div>
                    <div class="input-group" style="margin-bottom: 15px;">
                        <label style="color: #94a3b8; font-size: 0.8rem; display: block; margin-bottom: 5px;">Spidometr (Yakuniy)</label>
                        <input type="number" class="waybill-input" id="wb-end-km" placeholder="Nechida tugadi?" oninput="calcWaybill()" style="background: #0f172a; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; width: 100%;">
                    </div>
                    <div class="input-group">
                        <label style="color: #94a3b8; font-size: 0.8rem; display: block; margin-bottom: 5px;">Bosib o'tilgan (km)</label>
                         <input type="text" class="waybill-input" id="wb-distance" readonly style="background: #0f172a; border: 1px solid #334155; color: #f1c40f; font-weight:bold; padding: 10px; border-radius: 6px; width: 100%;">
                    </div>
                </div>

                <!-- 4. Route Map (Visual) -->
                <div class="waybill-card" style="grid-column: span 2; position: relative; background: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="position: absolute; top: 15px; left: 15px; z-index: 1000; background: rgba(15, 23, 42, 0.9); padding: 8px 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                        <h4 style="margin: 0; color: #38bdf8; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-map-marked-alt"></i> Yo'nalish Xaritasi (GPS)
                        </h4>
                    </div>
                    <div id="waybill-map" style="width: 100%; height: 100%; min-height: 400px; background: #0f172a;"></div>
                </div>

                <!-- 5. Fuel Consumption -->
                <div class="waybill-card" style="background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; justify-content: center;">
                    <h4 style="color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
                        <i class="fas fa-gas-pump" style="color: #ef4444;"></i> Yoqilg'i Sarfi
                    </h4>
                    
                    <div class="input-group" style="margin-bottom: 15px;">
                        <label style="color: #94a3b8; font-size: 0.8rem; display: block; margin-bottom: 5px;">Bakda bor edi (Litr)</label>
                        <input type="number" class="waybill-input" id="wb-fuel-start" value="${currentWaybill.startFuel}" readonly style="background: #0f172a; border: 1px solid #334155; color: #94a3b8; font-weight: normal; padding: 10px; border-radius: 6px; width: 100%;">
                    </div>
                    
                    <div class="input-group" style="margin-bottom: 15px;">
                        <label style="color: #94a3b8; font-size: 0.8rem; display: block; margin-bottom: 5px;">Quyildi (Litr)</label>
                        <input type="number" class="waybill-input" id="wb-fuel-filled" value="0" oninput="calcWaybill()" style="background: #0f172a; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; width: 100%;">
                    </div>

                    <div class="input-group" style="margin-bottom: 20px;">
                        <label style="color: #94a3b8; font-size: 0.8rem; display: block; margin-bottom: 5px;">Bakda qoldi (Litr)</label>
                        <input type="number" class="waybill-input" id="wb-fuel-end" placeholder="O'lchov natijasi" oninput="calcWaybill()" style="background: #0f172a; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; width: 100%;">
                    </div>

                    <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                        <div class="input-group" style="margin-bottom: 10px; display: flex; justify-content: space-between;">
                            <label style="color: #94a3b8; font-size: 0.8rem;">Norma (${vehicle.fuelNorm}):</label>
                            <input type="text" id="wb-norm-cons" readonly style="background: transparent; border: none; color: white; text-align: right; width: 80px; font-family: monospace;">
                        </div>
                        <div class="input-group" style="margin-bottom: 10px; display: flex; justify-content: space-between;">
                            <label style="color: #94a3b8; font-size: 0.8rem;">Fakt:</label>
                            <input type="text" id="wb-fact-cons" readonly style="background: transparent; border: none; color: #ef4444; font-weight: bold; text-align: right; width: 80px; font-family: monospace;">
                        </div>
                        <div class="input-group" style="display: flex; justify-content: space-between;">
                            <label style="color: #94a3b8; font-size: 0.8rem;">Natija:</label>
                            <input type="text" id="wb-diff-cons" readonly style="background: transparent; border: none; color: white; text-align: right; width: 120px; font-family: monospace; font-size: 0.9rem;">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    initWaybillMap();
}

// Show Technical List function
function showTechnicalList(bolinmaId) {
    let filteredVehicles = waybillData.vehicles;

    // Filter if not Mexanika department (admin view)
    if (bolinmaId && !bolinmaId.includes('mexanika') && !bolinmaId.includes('admin')) {
        filteredVehicles = waybillData.vehicles.filter(v => v.departmentId === bolinmaId);
    }

    const listHTML = `
        <div id="tech-list-window" class="integration-window" style="display: block; z-index: 1006;">
            <div class="window-header">
                <h2><i class="fas fa-truck-monster"></i> Texnikalar Ro'yxati (${bolinmaId || 'Umumiy'})</h2>
                <div style="display:flex; gap: 10px;">
                    <button class="control-btn" style="background: linear-gradient(135deg, #2ecc71, #27ae60);" onclick="document.getElementById('tech-excel-upload').click()">
                        <i class="fas fa-file-excel"></i> Exceldan Yuklash
                    </button>
                    <input type="file" id="tech-excel-upload" accept=".xlsx, .xls" style="display: none;" onchange="handleTechExcelUpload(this)">
                    <button class="close-window" onclick="document.getElementById('tech-list-window').remove()">&times;</button>
                </div>
            </div>
            <div style="padding: 20px; overflow-y: auto; max-height: 80vh;">
                <table style="width: 100%; border-collapse: collapse; color: white;" id="tech-list-table">
                    <thead>
                        <tr style="background: rgba(0,0,0,0.3);">
                            <th style="padding: 10px; text-align: left;">№</th>
                            <th style="padding: 10px; text-align: left;">Texnika Nomi</th>
                            <th style="padding: 10px; text-align: left;">Davlat Raqami</th>
                            <th style="padding: 10px; text-align: left;">Garaj Raqami</th>
                            <th style="padding: 10px; text-align: left;">Bo'linma</th>
                            <th style="padding: 10px; text-align: left;">Yoqilg'i Turi</th>
                            <th style="padding: 10px; text-align: left;">Norma (L/100km)</th>
                            <th style="padding: 10px; text-align: center;">Holati</th>
                        </tr>
                    </thead>
                    <tbody id="tech-list-tbody">
                        ${renderTechListRows(filteredVehicles)}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Remove if exists
    if (document.getElementById('tech-list-window')) document.getElementById('tech-list-window').remove();

    document.body.insertAdjacentHTML('beforeend', listHTML);
}

function renderTechListRows(vehicles) {
    // If no vehicles provided, fallback to all (safety) or empty
    const list = vehicles || waybillData.vehicles;

    return list.map((v, index) => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
            <td style="padding: 10px;">${index + 1}</td>
            <td style="padding: 10px;">${v.name}</td>
            <td style="padding: 10px;">${v.number}</td>
            <td style="padding: 10px;">${v.garage}</td>
            <td style="padding: 10px; color: #aaa;">${v.departmentId || '-'}</td>
            <td style="padding: 10px;">${v.fuelType}</td>
            <td style="padding: 10px;">${v.fuelNorm}</td>
            <td style="padding: 10px; text-align: center;">
                 <span class="status-badge" style="
                    background: ${v.status === 'free' ? '#2ecc71' : (v.status === 'busy' ? '#e74c3c' : '#f1c40f')};
                    color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.8em;
                 ">
                    ${v.status === 'free' ? "Bo'sh" : (v.status === 'busy' ? "Band" : "Ta'mirda")}
                 </span>
            </td>
        </tr>
    `).join('');
}

function handleTechExcelUpload(input) {
    const file = input.files[0];
    if (!file) return;

    if (typeof XLSX === 'undefined') {
        alert("Excel kutubxonasi (SheetJS) yuklanmagan!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Assume first sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Process Data (Skip header row 0)
            if (jsonData.length < 2) {
                alert("Faylda ma'lumot topilmadi!");
                return;
            }

            const newVehicles = [];
            // Expected columns: Name, Number, Garage, FuelType, FuelNorm, StartFuel, StartSpeedometer
            // Adjust indices based on expected Excel format
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row[0]) continue; // Skip empty rows

                newVehicles.push({
                    id: 'V-' + (1000 + i), // Generate ID
                    name: row[0] || 'Noma\'lum',
                    number: row[1] || '---',
                    garage: row[2] || '---',
                    fuelType: row[3] || 'Dizel',
                    fuelNorm: parseFloat(row[4]) || 0,
                    startFuel: parseFloat(row[5]) || 0,
                    startSpeedometer: parseFloat(row[6]) || 0
                });
            }

            // Update Data Store
            waybillData.vehicles = newVehicles;

            // Refresh Table
            const tbody = document.getElementById('tech-list-tbody');
            if (tbody) {
                tbody.innerHTML = renderTechListRows();
            }

            alert(`✅ ${newVehicles.length} ta texnika muvaffaqiyatli yuklandi!`);

        } catch (error) {
            console.error("Excel parsing error:", error);
            alert("Faylni o'qishda xatolik yuz berdi. Formatni tekshiring.");
        }
    };
    reader.readAsArrayBuffer(file);
}

// Inject Buttons into Mexanika Window
function injectMexanikaButtons(departmentWindow, bolinmaId) {
    const controls = departmentWindow.querySelector('.file-controls');
    if (!controls) {
        console.warn('File controls not found in department window');
        return;
    }

    // Check if buttons already exist
    if (controls.querySelector('.mexanika-injected-buttons')) return;

    const btnGroup = document.createElement('div');
    btnGroup.className = 'mexanika-injected-buttons';
    btnGroup.style.display = 'inline-flex';
    btnGroup.style.gap = '5px';
    btnGroup.style.marginLeft = '10px';

    // 1. Texnik Xizmat
    const maintenanceBtn = document.createElement('button');
    maintenanceBtn.className = 'control-btn';
    maintenanceBtn.innerHTML = '<i class="fas fa-tools"></i> Texnik Xizmat';
    maintenanceBtn.style.background = 'linear-gradient(135deg, #e67e22, #d35400)';
    maintenanceBtn.onclick = () => {
        if (window.openTechnicalMaintenanceWindow) {
            window.openTechnicalMaintenanceWindow(bolinmaId);
        } else {
            alert('Texnik xizmat moduli yuklanmagan!');
        }
    };
    btnGroup.appendChild(maintenanceBtn);

    // 2. Yo'l Varaqasi
    const waybillBtn = document.createElement('button');
    waybillBtn.className = 'control-btn';
    waybillBtn.innerHTML = '<i class="fas fa-file-invoice"></i> Yo\'l Varaqasi';
    waybillBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
    waybillBtn.onclick = () => openWaybillWindow(bolinmaId);
    btnGroup.appendChild(waybillBtn);

    // 3. Texnikalar Ro'yxati
    const listBtn = document.createElement('button');
    listBtn.className = 'control-btn';
    listBtn.innerHTML = '<i class="fas fa-list"></i> Texnikalar';
    listBtn.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
    listBtn.onclick = () => showTechnicalList(bolinmaId);
    btnGroup.appendChild(listBtn);

    // 4. Transport Buyurtma (NEW)
    const orderBtn = document.createElement('button');
    orderBtn.className = 'control-btn';
    orderBtn.innerHTML = '<i class="fas fa-shipping-fast"></i> Buyurtma';
    orderBtn.style.background = 'linear-gradient(135deg, #f39c12, #d35400)';
    orderBtn.onclick = openOrderWindow; // Order window global for now, or update if needed
    btnGroup.appendChild(orderBtn);

    controls.appendChild(btnGroup);
}


// --- HELPER FUNCTIONS ---

function renderDriverProfile(driver) {
    return `
        <div class="driver-avatar">${driver.avatar}</div>
        <div>
            <div style="color:white; font-weight:bold; font-size:1.1rem;">${driver.name}</div>
            <div class="status-active">ID: ${driver.id}</div>
            <div class="status-active">Active</div>
        </div>
        <div style="width:100%; margin-top:15px;">
             <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:10px 0;">
            <div class="info-row"><span class="info-label">Toifa:</span><span class="info-value">${driver.category}</span></div>
            <div class="info-row"><span class="info-label">Smena:</span><span class="info-value">${driver.shift}</span></div>
            <div class="info-row"><span class="info-label">Telefon:</span><span class="info-value">${driver.phone}</span></div>
        </div>
    `;
}

function renderVehicleInfo(vehicle) {
    return `
        <div style="text-align:center; margin-bottom:15px;">
            <i class="fas fa-truck-moving" style="font-size: 3rem; color: #f39c12;"></i>
            <div style="margin-top:10px; color:#f39c12; font-weight:bold;">${vehicle.name}</div>
            <div style="color:#aaa; font-size:0.9rem;">Davlat raqami: ${vehicle.number}</div>
        </div>
        <div class="input-group">
            <label>Garaj raqami</label>
            <input type="text" class="waybill-input" value="${vehicle.garage}" readonly>
        </div>
    `;
}

function updateDriver(driverId) {
    currentWaybill.driverId = driverId;
    const driver = waybillData.drivers.find(d => d.id === driverId);
    document.getElementById('wb-driver-profile').innerHTML = renderDriverProfile(driver);
}

function updateVehicle(vehicleId) {
    currentWaybill.vehicleId = vehicleId;
    const vehicle = waybillData.vehicles.find(v => v.id === vehicleId);
    document.getElementById('wb-vehicle-info').innerHTML = renderVehicleInfo(vehicle);

    // Update dependent fields
    currentWaybill.startSpeedometer = vehicle.startSpeedometer;
    currentWaybill.startFuel = vehicle.startFuel;
    document.getElementById('wb-start-km').value = vehicle.startSpeedometer;
    document.getElementById('wb-fuel-start').value = vehicle.startFuel;

    // Update Norm Lable
    // Re-render would be cleaner but let's just update the label text logic in calc
    calcWaybill();
}

function calcWaybill() {
    const vehicle = waybillData.vehicles.find(v => v.id === currentWaybill.vehicleId);

    // 1. Get Values
    const startKm = parseFloat(document.getElementById('wb-start-km').value) || 0;
    const endKm = parseFloat(document.getElementById('wb-end-km').value) || 0;

    const startFuel = parseFloat(document.getElementById('wb-fuel-start').value) || 0;
    const filledFuel = parseFloat(document.getElementById('wb-fuel-filled').value) || 0;
    const endFuel = parseFloat(document.getElementById('wb-fuel-end').value) || 0;

    // 2. Calculations
    let distance = 0;
    if (endKm > startKm) {
        distance = endKm - startKm;
    }
    document.getElementById('wb-distance').value = distance + " km";

    // Norm Consumption
    const normCons = (distance / 100) * vehicle.fuelNorm;
    document.getElementById('wb-norm-cons').value = normCons.toFixed(1) + " L";

    // Actual Consumption = Start + Filled - End
    // Only calculate if endFuel is entered or logic permits
    let factCons = 0;
    if (endFuel > 0 || distance > 0) {
        factCons = (startFuel + filledFuel) - endFuel;
    }

    // Prevent negative consumption display if user hasn't finished input
    if (factCons < 0) factCons = 0;

    document.getElementById('wb-fact-cons').value = factCons.toFixed(1) + " L";

    // Difference
    const diff = normCons - factCons;
    const diffEl = document.getElementById('wb-diff-cons');

    if (factCons > 0) {
        if (diff > 0) {
            diffEl.value = `+${diff.toFixed(1)} L (Tejaldi)`;
            diffEl.style.color = '#2ecc71';
        } else if (diff < 0) {
            diffEl.value = `${diff.toFixed(1)} L (Ortiqcha)`;
            diffEl.style.color = '#e74c3c';
        } else {
            diffEl.value = "Normada";
            diffEl.style.color = 'white';
        }
    } else {
        diffEl.value = "";
    }

    // Update state
    currentWaybill.endSpeedometer = endKm;
    currentWaybill.distance = distance;
    currentWaybill.filledFuel = filledFuel;
    currentWaybill.endFuel = endFuel;
    currentWaybill.actualConsumption = factCons;
}

async function saveWaybill() {
    // Validation
    if (currentWaybill.distance <= 0) {
        alert("Xatolik: Masofa 0 bo'lishi mumkin emas! Spidometr ko'rsatkichini tekshiring.");
        return;
    }
    if (currentWaybill.endFuel < 0) {
        alert("Xatolik: Bakdagi qoldiq noto'g'ri kiritilgan.");
        return;
    }

    try {
        const response = await SmartUtils.fetchAPI('/mechanics/waybills', {
            method: 'POST',
            body: JSON.stringify({
                vehicle_id: currentWaybill.vehicleId,
                driver_id: currentWaybill.driverId,
                start_time: currentWaybill.startTime,
                end_time: currentWaybill.endTime,
                start_km: currentWaybill.startSpeedometer,
                end_km: currentWaybill.endSpeedometer,
                fuel_filled: currentWaybill.filledFuel,
                fuel_end: currentWaybill.endFuel,
                date: new Date().toISOString().split('T')[0]
            })
        });

        if (response) {
            alert(`✅ Yo'l varaqasi yuborildi!\n\nBosib o'tildi: ${currentWaybill.distance} km\nSarf: ${currentWaybill.actualConsumption.toFixed(1)} Litr`);

            // Refresh data
            await initMechanicsData();

            document.getElementById('waybill-window').remove();
            if (typeof refreshMechanicsDashboard === 'function') refreshMechanicsDashboard();
        }
    } catch (e) {
        console.error("Error saving waybill:", e);
        alert("Yo'l varaqasini saqlashda xatolik yuz berdi!");
    }
}

function initWaybillMap() {
    if (typeof L !== 'undefined') {
        setTimeout(() => {
            try {
                const mapContainer = document.getElementById('waybill-map');
                if (!mapContainer) return;

                const map = L.map('waybill-map').setView([41.2995, 69.2401], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© Smart PCH Map'
                }).addTo(map);

                // Add dummy route
                const latlngs = [
                    [41.2995, 69.2401],
                    [41.3050, 69.2450],
                    [41.3100, 69.2600]
                ];
                const polyline = L.polyline(latlngs, { color: '#00f2ff' }).addTo(map);
                map.fitBounds(polyline.getBounds());

                L.marker([41.2995, 69.2401]).addTo(map).bindPopup('Garajdan chiqish');
                L.marker([41.3100, 69.2600]).addTo(map).bindPopup('Hozirgi joylashuv').openPopup();

                map.invalidateSize();
            } catch (e) {
                console.error("Map init failed", e);
                document.getElementById('waybill-map').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:white;">Xarita yuklanmadi</div>';
            }
        }, 500);
    }
}

// Make functions globally accessible
window.injectMexanikaButtons = injectMexanikaButtons;
window.openWaybillWindow = openWaybillWindow;
window.updateDriver = updateDriver;
window.updateVehicle = updateVehicle;
window.calcWaybill = calcWaybill;
window.saveWaybill = saveWaybill;
window.waybillData = waybillData;
