// Defektaskop Aravacha Tracking System
// Initialize defectoscope data with Defect Codes

// Boshlang'ich (default) jadval
const DEFAULT_SCHEDULE = {
    "POISK-0106": {
        operator: 'Sharipov R., Shirinov Sh., Olimov A.',
        color: 'orange',
        schedule: {
            1: { text: "St. Qorlitog' 4143 km", start: 4143, end: 4143 },
            4: { text: "4144 km-4150 km", start: 4144, end: 4150 },
            5: { text: "4151 km-4156 km", start: 4151, end: 4156 },
            6: { text: "4157 km-4162 km", start: 4157, end: 4162 },
            7: { text: "4163 km, Rzd Kiyikli, 3-ECHK yo'llari", start: 4163, end: 4163 },
            8: { text: "Texnik ko'rik", start: 4020, end: 4020, status: 'paused' },
            11: { text: "Rzd Kiyikli-4174 km", start: 4163, end: 4174 },
            12: { text: "4175 km-4180 km", start: 4175, end: 4180 },
            13: { text: "4181 km-4185 km", start: 4181, end: 4185 },
            14: { text: "4186 km-4191 km", start: 4186, end: 4191 },
            15: { text: "4192 km-4197 km", start: 4192, end: 4197 },
            18: { text: "4198 km, St Xizirbobo 2-4 yo'llar", start: 4198, end: 4198 },
            19: { text: "4020 km-4025 km", start: 4020, end: 4025 },
            20: { text: "4026 km-4031 km", start: 4026, end: 4031 },
            21: { text: "4032 km, Rzd Navbaxor, 3-ECHK yo'li", start: 4032, end: 4032 },
            22: { text: "Rzd Navbaxor 4042 km", start: 4042, end: 4042 },
            25: { text: "4043 km-4048 km", start: 4043, end: 4048 },
            26: { text: "4049 km-4054 km", start: 4049, end: 4054 },
            27: { text: "4055 km-4060 km", start: 4055, end: 4060 },
            28: { text: "4161 km, St Yaxshilik", start: 4161, end: 4161 },
            29: { text: "Jadval taxlili", start: 4020, end: 4020, status: 'paused' }
        }
    },
    "POISK-2603": {
        operator: 'Mavlonov I., Kamolov G\'.',
        color: 'blue',
        schedule: {
            1: { text: "4163 km, Rzd Kiyikli", start: 4163, end: 4163 },
            4: { text: "Rzd Kiyikli 3-ECHK yo'llari 4171 km", start: 4163, end: 4171 },
            5: { text: "4171 km-4176 km", start: 4171, end: 4176 },
            6: { text: "4177 km-4182 km", start: 4177, end: 4182 },
            7: { text: "Texnik ko'rik", start: 4020, end: 4020, status: 'paused' },
            8: { text: "4183 km-4188 km", start: 4183, end: 4188 },
            11: { text: "4189 km-4194 km", start: 4189, end: 4194 },
            12: { text: "4195 km, St, Xizirbobo, as-yo'l", start: 4195, end: 4195 },
            13: { text: "St,Xizirbobo 2-4 yo'l, 4203 km", start: 4198, end: 4203 },
            14: { text: "4204 km-4209 km", start: 4204, end: 4209 },
            15: { text: "4210 km-4215 km", start: 4210, end: 4215 },
            18: { text: "4216 km-4221 km", start: 4216, end: 4221 },
            19: { text: "4222 km-4227 km", start: 4222, end: 4227 },
            20: { text: "4228 km, Rzd Jayxun 3-ECHK yo'llari", start: 4228, end: 4228 },
            21: { text: "Rzd Jayxun 4238 km", start: 4228, end: 4238 },
            22: { text: "4239 km-4244 km", start: 4239, end: 4244 },
            25: { text: "4245 km-4250 km", start: 4245, end: 4250 },
            26: { text: "4251 km-4256 km", start: 4251, end: 4256 },
            27: { text: "4257 km, St Doutepa", start: 4257, end: 4257 },
            28: { text: "St Doutepa 2-4 yo'llar, 4264 km", start: 4264, end: 4264 },
            29: { text: "Jadval tahlili", start: 4020, end: 4020, status: 'paused' }
        }
    },
    "POISK-1080": {
        operator: 'Nurimov Sh., Komilov D.',
        color: 'green',
        schedule: {
            1: { text: "4246 km-4251 km", start: 4246, end: 4251 },
            4: { text: "4252 km-4257 km", start: 4252, end: 4257 },
            5: { text: "4258km, St Doutepa", start: 4258, end: 4258 },
            6: { text: "Texnik ko'rik", start: 4020, end: 4020, status: 'paused' },
            7: { text: "St Doutepa 2-4 qo'shimcha yo'llar", start: 4258, end: 4258 },
            8: { text: "St Doutepa-4266 km", start: 4258, end: 4266 },
            11: { text: "4267 km-4272 km", start: 4267, end: 4272 },
            12: { text: "4273 km-4278 km", start: 4273, end: 4278 },
            13: { text: "4279 km-4284 km", start: 4279, end: 4284 },
            14: { text: "4285 km-4290 km", start: 4285, end: 4290 },
            15: { text: "4291 km-4296 km", start: 4291, end: 4296 },
            18: { text: "4297 km, Rzd Turon 3-ECHK yo'llar", start: 4297, end: 4297 },
            19: { text: "Rzd Turon 4303 km", start: 4303, end: 4303 },
            20: { text: "4211 km-4216 km", start: 4211, end: 4216 },
            21: { text: "4217 km-4222 km", start: 4217, end: 4222 },
            22: { text: "4223 km-4228 km", start: 4223, end: 4228 },
            25: { text: "4229 km-Rzd Jayxun, 3-ECHK yo'llari", start: 4229, end: 4229 },
            26: { text: "Rzd Jayxun-4238 km", start: 4229, end: 4238 },
            27: { text: "4239 km-4244 km", start: 4239, end: 4244 },
            28: { text: "4245 km 4250 km", start: 4245, end: 4250 },
            29: { text: "Jadval tahlili", start: 4020, end: 4020, status: 'paused' }
        }
    },
    "POISK-1004": { // Qo'shilgan 4-aravacha
        operator: 'Zokirov V., Ergashev T.',
        color: 'purple',
        schedule: {
            1: { text: "Zaxira / Qo'shimcha tekshiruv", start: 4020, end: 4100 },
            5: { text: "Stansiya yo'llari nazorati", start: 4160, end: 4165 },
            10: { text: "Texnik ko'rik", start: 4020, end: 4020, status: 'paused' },
            15: { text: "Ta'mirdan chiqqan oraliq", start: 4200, end: 4210 },
            20: { text: "Og'ir defekt ustidan tahlil", start: 4250, end: 4260 }
        }
    }
};

window.currentDefectoDay = window.currentDefectoDay || new Date().getDate();

function initDefectoscopeData() {
    const today = window.currentDefectoDay;

    // Tizimdan saqlangan oylik jadvalni olish (agar bo'lmasa DEFAULT ni oladi)
    const activeSchedule = JSON.parse(localStorage.getItem('defectoscopeMonthlySchedule')) || DEFAULT_SCHEDULE;

    // Test namunasi uchun defekt ob'ektlari (buni ham aslida serverdan olish kerak)
    const mockDefects = {
        "POISK-0106": [{ pk: 4023, code: '21', type: 'Yengil', description: 'Bolt zaiflashgan', time: '09:15' }],
        "POISK-2603": [{ pk: 4175, code: '26.3', type: 'O\'rta', description: 'Rels yoriq', time: '08:30' }],
        "POISK-1080": [{ pk: 4288, code: '41', type: 'Yengil', description: 'Skrep yeyilgan', time: '09:45' }]
    };

    window.defectoscopeCarts = Object.keys(activeSchedule).map(cartId => {
        const cartInfo = activeSchedule[cartId];
        const daySchedule = cartInfo.schedule[today] || { text: "Dam olish / Reja yo'q", start: 4020, end: 4020, status: 'inactive' };

        const start = daySchedule.start || 4020;
        const end = daySchedule.end || start;
        let current = start;

        // Simulyatsiya qilingan yoki haqiqiy vaqtga qarab pozitsiyani belgilash
        // Agar o'tgan yoki kelajakdagi kun tanlansa
        const isToday = today === new Date().getDate();
        let currentStatus = daySchedule.status || 'inactive';

        if (isToday) {
            const hour = new Date().getHours() + new Date().getMinutes() / 60;
            if (hour >= 8 && hour <= 17 && start !== end) {
                const fraction = (hour - 8) / 9;
                current = Math.floor(start + (end - start) * fraction);
                if (daySchedule.status !== 'paused') currentStatus = 'active';
            } else if (hour > 17) {
                current = end;
                if (daySchedule.status !== 'paused') currentStatus = 'completed';
            }
        } else if (today < new Date().getDate()) {
            current = end; // O'tib ketgan kun - marshrut to'liq yakunlangan
            if (daySchedule.status !== 'paused') currentStatus = 'completed';
        } else {
            current = start; // Kelajak kun - boshlanmagan
            if (daySchedule.status !== 'paused') currentStatus = 'inactive';
        }

        return {
            id: cartId,
            operator: cartInfo.operator,
            scheduleText: daySchedule.text,
            route: { start: start, current: current, end: end },
            startTime: '08:00',
            estimatedEnd: '17:00',
            speed: currentStatus === 'active' ? 1.5 : 0,
            checked: Math.abs(current - start),
            defects: mockDefects[cartId] ? mockDefects[cartId].filter(d => d.pk >= Math.min(start, end) && d.pk <= Math.max(start, end)) : [],
            status: currentStatus,
            color: cartInfo.color,
            startPkInput: start,
            endPkInput: end
        };
    });
}

// Calculate progress percentage
function calculateProgress(start, current, end) {
    if (start === end) return 100;
    const total = Math.abs(end - start);
    if (total === 0) return 0;
    const completed = Math.abs(current - start);
    return Math.round((completed / total) * 100);
}

// Get status badge HTML
function getStatusBadge(status) {
    const badges = {
        'active': '<span style="color: #2ecc71;">🟢 FAOL</span>',
        'paused': '<span style="color: #f1c40f;">🟡 TANAFFUS</span>',
        'completed': '<span style="color: #3498db;">🔵 TUGALLANDI</span>',
        'inactive': '<span style="color: #e74c3c;">🔴 FAOL EMAS</span>'
    };
    return badges[status] || badges['inactive'];
}


// --- Defect SVG Generator (Helper Function) ---
function getDefectSVG(code) {
    // Default rail profile
    const railBase = `
        <path d="M10,50 L50,50 L45,40 L35,35 L35,20 L45,15 L45,10 L15,10 L15,15 L25,20 L25,35 L15,40 L10,50 Z" 
              fill="none" stroke="#333" stroke-width="2"/>
    `;

    let defectMark = '';

    switch (code) {
        case '17.1': // Payvand chokidagi nuqson (Head crack)
            defectMark = `<path d="M20,12 L40,12" stroke="red" stroke-width="3" />`;
            break;
        case '21': // Kallakdagi nuqson (Head surface)
            defectMark = `<circle cx="30" cy="12" r="4" fill="red" />`;
            break;
        case '26.3': // Rels kallasining yemirilishi (Head wear/crack)
            defectMark = `<path d="M45,10 L40,20" stroke="red" stroke-width="3" />`;
            break;
        case '30G': // Gorizontal yoriq (Horizontal crack in head)
            defectMark = `<line x1="20" y1="15" x2="40" y2="15" stroke="red" stroke-width="2" stroke-dasharray="2,1" />`;
            break;
        case '53.1': // Bolt teshigidan yoriq (Bolt hole crack)
            defectMark = `
                <circle cx="30" cy="28" r="3" fill="none" stroke="#333" />
                <line x1="30" y1="28" x2="40" y2="20" stroke="red" stroke-width="2" />
                <line x1="30" y1="28" x2="20" y2="36" stroke="red" stroke-width="2" />
            `;
            break;
        case '41': // Bo'yin yorig'i (Web crack)
            defectMark = `<line x1="30" y1="20" x2="30" y2="40" stroke="red" stroke-width="2" />`;
            break;
        case '69': // Tagidagi yoriq (Base crack)
            defectMark = `<path d="M20,48 L40,48" stroke="red" stroke-width="3" />`;
            break;
        default:
            defectMark = `<text x="30" y="30" text-anchor="middle" fill="red" font-size="20">?</text>`;
    }

    return `<svg width="60" height="60" viewBox="0 0 60 60" style="background:white; border-radius:4px;">
        ${railBase}
        ${defectMark}
    </svg>`;
}

// Main dashboard HTML
function getDefectoscopeTrackerHTML() {
    initDefectoscopeData();
    const carts = window.defectoscopeCarts;

    // Calculate totals
    const totalChecked = carts.reduce((sum, cart) => sum + cart.checked, 0);
    const totalDefects = carts.reduce((sum, cart) => sum + cart.defects.length, 0);
    const activeCarts = carts.filter(c => c.status === 'active').length;

    const now = new Date();
    const currentTime = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    const currentDate = now.toLocaleDateString('uz-UZ');

    // Collect all defects for mapping
    const allDefects = carts.flatMap(cart =>
        cart.defects.map(d => ({ ...d, cartId: cart.id }))
    );

    return `
        <style>
            .defecto-header { 
                background: linear-gradient(135deg, rgba(0,198,255,0.1), rgba(0,114,255,0.1));
                padding: 20px; 
                border-radius: 15px; 
                margin-bottom: 20px;
                border: 1px solid rgba(0,198,255,0.2);
            }
            .defecto-header h2 { 
                color: #00c6ff; 
                margin: 0 0 10px 0; 
                display: flex; 
                align-items: center; 
                gap: 10px;
            }
            .defecto-stats { 
                display: flex; 
                gap: 30px; 
                font-size: 0.9rem; 
                color: rgba(255,255,255,0.7);
            }
            .defecto-grid { 
                display: grid; 
                grid-template-columns: repeat(2, 1fr); 
                gap: 20px; 
                margin-bottom: 20px;
            }
            .defecto-card { 
                background: rgba(255,255,255,0.05); 
                border: 1px solid rgba(255,255,255,0.1); 
                border-radius: 15px; 
                padding: 20px;
                position: relative;
                overflow: hidden;
            }
            .defecto-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 4px;
                height: 100%;
                background: var(--accent-color);
            }
            .cart-id { 
                background: var(--accent-color); 
                color: white; 
                padding: 5px 12px; 
                border-radius: 8px; 
                font-weight: bold; 
                display: inline-block;
                margin-bottom: 10px;
            }
            .cart-info { 
                display: flex; 
                justify-content: space-between; 
                margin: 10px 0;
                font-size: 0.9rem;
            }
            .progress-section { 
                margin: 15px 0;
            }
            .pk-labels { 
                display: flex; 
                justify-content: space-between; 
                font-size: 0.85rem; 
                color: rgba(255,255,255,0.6);
                margin-bottom: 5px;
            }
            .progress-track { 
                height: 30px; 
                background: rgba(0,0,0,0.3); 
                border-radius: 15px; 
                position: relative;
                overflow: hidden;
            }
            .progress-fill { 
                height: 100%; 
                background: linear-gradient(90deg, #2ecc71, #00c6ff); 
                border-radius: 15px;
                position: relative;
                transition: width 0.3s;
            }
            .current-marker { 
                position: absolute; 
                top: 50%; 
                right: 0;
                transform: translate(50%, -50%); 
                width: 20px; 
                height: 20px; 
                background: #00c6ff; 
                border-radius: 50%; 
                border: 3px solid white;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0%, 100% { box-shadow: 0 0 0 0 rgba(0,198,255,0.7); }
                50% { box-shadow: 0 0 0 10px rgba(0,198,255,0); }
            }
            .progress-percent { 
                position: absolute; 
                top: 50%; 
                left: 50%; 
                transform: translate(-50%, -50%);
                color: white; 
                font-weight: bold; 
                font-size: 0.9rem;
                text-shadow: 0 1px 3px rgba(0,0,0,0.5);
            }
            .cart-stats { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 10px; 
                margin-top: 15px;
            }
            .stat-item { 
                display: flex; 
                align-items: center; 
                gap: 8px; 
                font-size: 0.85rem;
            }
            .detail-btn { 
                width: 100%; 
                padding: 10px; 
                background: rgba(0,198,255,0.2); 
                border: 1px solid rgba(0,198,255,0.3); 
                color: #00c6ff; 
                border-radius: 8px; 
                cursor: pointer; 
                margin-top: 15px;
                font-weight: bold;
            }
            .detail-btn:hover { 
                background: rgba(0,198,255,0.3); 
            }
            .sidebar-map { 
                background: rgba(255,255,255,0.05); 
                border: 1px solid rgba(255,255,255,0.1); 
                border-radius: 15px; 
                padding: 20px;
                margin-bottom: 20px;
            }
            .map-title { 
                color: #00c6ff; 
                margin-bottom: 15px; 
                display: flex; 
                align-items: center; 
                gap: 10px;
            }
            .bottom-actions { 
                display: flex; 
                gap: 10px; 
                flex-wrap: wrap;
            }
            .action-btn { 
                flex: 1; 
                min-width: 150px;
                padding: 12px 20px; 
                background: linear-gradient(135deg, #00c6ff, #0072ff); 
                border: none; 
                color: white; 
                border-radius: 8px; 
                cursor: pointer; 
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            .action-btn:hover { 
                transform: translateY(-2px); 
                box-shadow: 0 5px 15px rgba(0,198,255,0.3);
            }
            .admin-only {
                background: linear-gradient(135deg, #f39c12, #e67e22);
            }
            
            /* Tooltip Styles */
            .defect-point {
                position: absolute;
                width: 12px; 
                height: 12px;
                background: red;
                border-radius: 50%;
                border: 2px solid white;
                cursor: pointer;
                transition: transform 0.2s;
                transform: translateX(-50%);
                z-index: 5;
            }
            .defect-point:hover {
                transform: translateX(-50%) scale(1.5);
                z-index: 10;
            }
            .map-tooltip {
                visibility: hidden;
                width: 280px;
                height: auto;
                background-color: rgba(30, 41, 59, 0.95);
                color: #fff;
                border-radius: 8px;
                padding: 12px;
                position: absolute;
                z-index: 100;
                bottom: 140%; 
                left: 50%;
                margin-left: -140px;
                border: 1px solid #e74c3c;
                opacity: 0;
                transition: opacity 0.3s, bottom 0.3s;
                font-size: 0.85rem;
                pointer-events: none;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                text-align: left;
            }
            .defect-point:hover .map-tooltip {
                visibility: visible;
                opacity: 1;
                bottom: 150%;
            }
            .map-tooltip::after {
                content: "";
                position: absolute;
                top: 100%;
                left: 50%;
                margin-left: -8px;
                border-width: 8px;
                border-style: solid;
                border-color: #e74c3c transparent transparent transparent;
            }
            .cart-marker-point {
                 position: absolute;
                 width: 16px;
                 height: 16px;
                 border-radius: 50%;
                 border: 2px solid white;
                 transform: translateX(-50%);
                 z-index: 4;
                 box-shadow: 0 0 10px white;
            }

            .calendar-selector {
                background: rgba(0,0,0,0.3);
                padding: 10px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                gap: 15px;
                overflow-x: auto;
                margin-top: 15px;
                border: 1px solid rgba(255,255,255,0.1);
            }
            .day-btn {
                padding: 8px 12px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 6px;
                color: white;
                cursor: pointer;
                transition: all 0.2s;
                min-width: 45px;
                text-align: center;
            }
            .day-btn:hover { background: rgba(0,198,255,0.3); }
            .day-btn.active {
                background: #00c6ff;
                border-color: #00c6ff;
                box-shadow: 0 0 10px rgba(0,198,255,0.5);
                font-weight: bold;
            }
            .day-btn.today {
                border-bottom: 2px solid #e74c3c;
            }
        </style>
        
        <script>
            window.changeDefectoDay = function(day) {
                window.currentDefectoDay = day;
                document.getElementById('defectoscope-content').innerHTML = getDefectoscopeTrackerHTML();
            };
        </script>
        
        <div class="defecto-header">
            <h2>
                <i class="fas fa-search-location"></i>
                Defektaskop Aravachalari - Real-time Monitoring
            </h2>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div class="defecto-stats">
                    <span><i class="fas fa-road"></i> Tekshirildi: <strong>${totalChecked} km</strong></span>
                    <span><i class="fas fa-exclamation-triangle"></i> Defektlar: <strong>${totalDefects} ta</strong></span>
                    <span><i class="fas fa-calendar-day"></i> KUN: <strong>${window.currentDefectoDay}-sana</strong></span>
                </div>
                <div style="text-align: right; color: rgba(255,255,255,0.6); font-size: 0.9rem;">
                    <div>Hozir: ${currentTime}</div>
                </div>
            </div>
            
            <!-- Calendar Ribbon -->
            <div class="calendar-selector">
                <span style="color:#00c6ff; font-weight:bold; white-space:nowrap;"><i class="fas fa-calendar-alt"></i> OY KUNLARI:</span>
                ${Array.from({ length: 31 }, (_, i) => i + 1).map(day =>
        `<button class="day-btn ${day === window.currentDefectoDay ? 'active' : ''} ${day === new Date().getDate() ? 'today' : ''}" 
                             title="${day === new Date().getDate() ? 'Bugun' : ''}"
                             onclick="changeDefectoDay(${day})">${day}</button>`
    ).join('')}
            </div>
        </div>
        
        <div class="defecto-grid">
            ${carts.map(cart => {
        const progress = calculateProgress(cart.route.start, cart.route.current, cart.route.end);
        const remaining = cart.route.end - cart.route.current;

        return `
                    <div class="defecto-card" style="--accent-color: ${getCartColor(cart.color)};">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span class="cart-id" style="background: ${getCartColor(cart.color)};">${cart.id}</span>
                            ${getStatusBadge(cart.status)}
                        </div>
                        
                        <div class="cart-info" style="flex-wrap: wrap; gap: 10px;">
                            <span style="width:100%;"><i class="fas fa-users"></i> ${cart.operator}</span>
                            <span style="color:#f39c12; font-weight:bold; width:100%; border-top:1px solid rgba(255,255,255,0.1); padding-top:8px;">
                                <i class="fas fa-calendar-day"></i> KUNLIK REJA: ${cart.scheduleText}
                            </span>
                        </div>
                        
                        <div class="progress-section">
                            <div class="pk-labels">
                                <span>PK ${cart.route.start}</span>
                                <span>PK ${cart.route.current}</span>
                                <span>PK ${cart.route.end}</span>
                            </div>
                            <div class="progress-track">
                                <div class="progress-fill" style="width: ${progress}%;">
                                    <div class="current-marker"></div>
                                </div>
                                <div class="progress-percent">${progress}%</div>
                            </div>
                            <div style="text-align: center; margin-top: 5px; font-size: 0.85rem; color: rgba(255,255,255,0.6);">
                                ${remaining} km qoldi
                            </div>
                        </div>
                        
                        <div class="cart-stats">
                            <div class="stat-item">
                                <i class="fas fa-tachometer-alt" style="color: #3498db;"></i>
                                <span>Tezlik: ${cart.speed} km/h</span>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-check-circle" style="color: #2ecc71;"></i>
                                <span>Tekshirildi: ${cart.checked} km</span>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-exclamation-triangle" style="color: #f1c40f;"></i>
                                <span>Defekt: ${cart.defects.length} ta</span>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-flag-checkered" style="color: #e74c3c;"></i>
                                <span>Tugash: ${cart.estimatedEnd}</span>
                            </div>
                        </div>
                        
                        <button class="detail-btn" onclick="viewCartDetails('${cart.id}')">
                            <i class="fas fa-info-circle"></i> Batafsil
                        </button>
                    </div>
                `;
    }).join('')}
        </div>
        
        <div class="sidebar-map" style="grid-column: 1 / -1;">
            <h3 class="map-title">
                <i class="fas fa-map-marked-alt"></i>
                Umumiy Xarita (PK 4020 - 4303)
            </h3>
            <div style="padding: 20px;">
                <!-- HTML/CSS based Railway Map -->
                <div style="
                    position: relative; 
                    height: 120px; 
                    background: linear-gradient(to bottom, #2c3e50, #1a252f); 
                    border-radius: 10px; 
                    margin-bottom:20px; 
                    box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
                    overflow: hidden;
                ">
                    <!-- Rails -->
                    <div style="position: absolute; top: 60px; left: 5%; width: 90%; height: 8px; background: #95a5a6; border-radius: 4px;"></div>
                    <div style="position: absolute; top: 60px; left: 5%; width: 90%; height: 2px; background: #bdc3c7; margin-top: 3px;"></div>
                    
                    <!-- Sleepers (Visual pattern) -->
                    <div style="
                        position: absolute; 
                        top: 50px; 
                        left: 5%; 
                        width: 90%; 
                        height: 28px; 
                        background-image: linear-gradient(90deg, transparent 90%, #34495e 90%); 
                        background-size: 20px 100%;
                        opacity: 0.5;
                    "></div>

                    <!-- PK Markers -->
                    <div style="position: absolute; top: 30px; left: 5%; color: #aaa; font-size: 0.8rem; transform: translateX(-50%);">PK 4020</div>
                    <div style="position: absolute; top: 30px; left: 50%; color: #aaa; font-size: 0.8rem; transform: translateX(-50%);">PK 4160</div>
                    <div style="position: absolute; top: 30px; left: 95%; color: #aaa; font-size: 0.8rem; transform: translateX(-50%);">PK 4303</div>

                    <!-- DEFECT POINTS (Red Dots) with SVG Tooltips -->
                    ${allDefects.map(defect => {
        const totalDistance = 4303 - 4020;
        const defectDist = defect.pk - 4020;
        const pos = 5 + (defectDist / totalDistance) * 90;
        let color = '#f1c40f'; // Default yellow
        if (defect.type.includes('Og\'ir')) color = '#e74c3c'; // Red
        if (defect.type.includes('O\'rta')) color = '#f39c12'; // Orange

        const defectCode = defect.code || 'Noma\'lum';

        return `
                        <div class="defect-point" style="left: ${pos}%; top: 58px; background-color: ${color};">
                             <div class="map-tooltip">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.2); padding-bottom:5px;">
                                    <strong style="color:${color}; font-size:1rem;">PK ${defect.pk}</strong>
                                    <span style="font-size:0.8em; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; font-weight:bold;">Kod: ${defectCode}</span>
                                </div>
                                <div style="display:flex; gap:12px; align-items:flex-start;">
                                    <div style="width:70px; height:70px; background:white; border-radius:6px; overflow:hidden; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                                        ${getDefectSVG(defectCode)}
                                    </div>
                                    <div style="flex:1;">
                                        <div style="font-weight:bold; font-size:0.95em; margin-bottom:4px; color:#fff;">${defect.type}</div>
                                        <div style="font-size:0.85em; color:#bbb; line-height:1.3;">
                                            ${defect.description}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
    }).join('')}

                    <!-- CART MARKERS -->
                    ${carts.map(cart => {
        const totalDistance = 4303 - 4020;
        const cartDistance = cart.route.current - 4020;
        const pos = 5 + (cartDistance / totalDistance) * 90;
        return `
                        <div class="cart-marker-point" style="left: ${pos}%; top: 56px; background-color: ${getCartColor(cart.color)};" title="${cart.id}">
                             <div style="position:absolute; top:20px; left:50%; transform:translateX(-50%); font-size:0.7rem; color:${getCartColor(cart.color)}; white-space:nowrap; font-weight:bold;">
                                ${cart.id}
                             </div>
                        </div>`;
    }).join('')}

                </div>
                
                <!-- Legend -->
                <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <span style="width: 12px; height: 12px; background: #e74c3c; border-radius: 50%; border:2px solid white;"></span>
                        <span style="color:#aaa; font-size:0.9rem;">Og'ir Defekt</span>
                    </div>
                     <div style="display: flex; align-items: center; gap: 5px;">
                        <span style="width: 12px; height: 12px; background: #f39c12; border-radius: 50%; border:2px solid white;"></span>
                        <span style="color:#aaa; font-size:0.9rem;">O'rta Defekt</span>
                    </div>
                    ${carts.map(cart => `
                        <div style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <div style="width: 12px; height: 12px; background: ${getCartColor(cart.color)}; border-radius: 50%; border: 2px solid white;"></div>
                            <span style="color: rgba(255,255,255,0.8); font-size: 0.9rem;">${cart.id}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <div class="bottom-actions">
            <button class="action-btn" onclick="exportDefectsToExcel()">
                <i class="fas fa-file-excel"></i>
                Export Excel
            </button>
            <button class="action-btn" onclick="viewDefectReport()">
                <i class="fas fa-chart-bar"></i>
                Defekt Hisoboti
            </button>
            <button class="action-btn admin-only" onclick="openScheduleEditor()">
                <i class="fas fa-edit"></i>
                Jadval Tahrirlash
            </button>
            <button class="action-btn" onclick="refreshDefectoscopeData()">
                <i class="fas fa-sync-alt"></i>
                Yangilash
            </button>
            <button class="action-btn" onclick="window.print()">
                <i class="fas fa-print"></i>
                Print
            </button>
        </div>
    `;
}

// Get cart color
function getCartColor(color) {
    const colors = {
        'orange': '#f39c12',
        'blue': '#3498db',
        'purple': '#9b59b6',
        'green': '#2ecc71'
    };
    return colors[color] || '#95a5a6';
}

// Open defectoscope tracker window
window.openDefectoscopeTracker = function () {
    // Create modal
    let modal = document.getElementById('defectoscope-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'defectoscope-modal';
        // Remove all classes, use only inline styles
        modal.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            z-index: 10000 !important;
            background: #0f172a !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
        `;
        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #f39c12, #e67e22); padding: 20px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
                <h2 style="color: white; margin: 0; display: flex; align-items: center; gap: 10px; font-size: 1.5rem;">
                    <i class="fas fa-search-location"></i>
                    Defektaskop Aravacha Monitoring
                </h2>
                <button onclick="closeDefectoscopeTracker()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 18px; transition: all 0.3s;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div id="defectoscope-content" style="padding: 30px; background: #0f172a; overflow-y: auto; flex: 1; width: 100%;"></div>
        `;
        document.body.appendChild(modal);
    }

    // Render content
    document.getElementById('defectoscope-content').innerHTML = getDefectoscopeTrackerHTML();

    // Show modal - ensure it's visible
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';

    // Show overlay
    const overlay = document.getElementById('department-overlay');
    if (overlay) {
        overlay.classList.add('active');
    }
};

// Close window
window.closeDefectoscopeTracker = function () {
    const modal = document.getElementById('defectoscope-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
    const overlay = document.getElementById('department-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
};

// View cart details
window.viewCartDetails = function (cartId) {
    const cart = window.defectoscopeCarts.find(c => c.id === cartId);
    if (!cart) return;

    const detailsHTML = `
        <h3>📋 ${cart.id} - Batafsil Ma'lumot</h3>
        <div style="margin: 20px 0;">
            <p><strong>Operator:</strong> ${cart.operator}</p>
            <p><strong>Marshрут:</strong> PK ${cart.route.start} → ${cart.route.end}</p>
            <p><strong>Hozirgi joy:</strong> PK ${cart.route.current}</p>
            <p><strong>Boshlanish:</strong> ${cart.startTime}</p>
            <p><strong>Taxminiy tugash:</strong> ${cart.estimatedEnd}</p>
        </div>
        
        <h4>⚠️ Topilgan Defektlar (${cart.defects.length} ta):</h4>
        ${cart.defects.length === 0 ? '<p>Defekt topilmadi</p>' : `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: rgba(0,198,255,0.1);">
                        <th style="padding: 10px;">PK</th>
                        <th style="padding: 10px;">Kod</th>
                        <th style="padding: 10px;">Turi</th>
                        <th style="padding: 10px;">Tavsif</th>
                        <th style="padding: 10px;">Vaqt</th>
                    </tr>
                </thead>
                <tbody>
                    ${cart.defects.map(d => `
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <td style="padding: 10px;">${d.pk}</td>
                            <td style="padding: 10px;"><strong>${d.code || '-'}</strong></td>
                            <td style="padding: 10px;">${d.type}</td>
                            <td style="padding: 10px;">${d.description}</td>
                            <td style="padding: 10px;">${d.time}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `}
        <button class="action-btn" onclick="closeDefectDetails()" style="margin-top: 20px;">
            <i class="fas fa-arrow-left"></i> Orqaga
        </button>
    `;

    document.getElementById('defectoscope-content').innerHTML = detailsHTML;
};

window.closeDefectDetails = function () {
    document.getElementById('defectoscope-content').innerHTML = getDefectoscopeTrackerHTML();
};

window.openScheduleEditor = function () {
    if (!currentUser || (currentUser.role !== 'dispatcher' && currentUser.role !== 'admin' && !currentUser.departments?.includes('dispetcher'))) {
        alert('Faqat dispatcher va admin tahrirlash huquqiga ega!');
        return;
    }

    const currentSchedule = JSON.parse(localStorage.getItem('defectoscopeMonthlySchedule')) || DEFAULT_SCHEDULE;
    const carts = Object.keys(currentSchedule);

    // Oylik kunlarni shakllantirish (1 dan 31 gacha)
    const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

    // Dynamic Excel Grid CSS
    const editorHTML = `
        <style>
            .excel-container {
                background: #0f172a;
                border: 1px solid rgba(0, 198, 255, 0.3);
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                margin: 20px 0;
            }
            .excel-header {
                display: flex;
                background: linear-gradient(90deg, #1e293b, #0f172a);
                border-bottom: 2px solid #00c6ff;
            }
            .excel-header-cell {
                flex: 1;
                padding: 15px;
                text-align: center;
                color: #00c6ff;
                font-weight: 800;
                font-size: 1.1rem;
                letter-spacing: 1px;
                border-right: 1px solid rgba(255,255,255,0.1);
            }
            .excel-body {
                max-height: 500px;
                overflow-y: auto;
            }
            .excel-row {
                display: flex;
                background: rgba(30, 41, 59, 0.6);
                border-bottom: 1px solid rgba(255,255,255,0.05);
                transition: background 0.2s;
            }
            .excel-row:hover {
                background: rgba(0, 198, 255, 0.05);
            }
            .excel-cell {
                flex: 1;
                padding: 10px;
                border-right: 1px solid rgba(255,255,255,0.05);
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .excel-cell:last-child {
                border-right: none;
            }
            .day-number {
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                color: white;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                font-weight: 900;
                font-size: 1.2rem;
                box-shadow: 0 4px 10px rgba(231,76,60,0.3);
            }
            .cart-inputs {
                display: flex;
                flex-direction: column;
                gap: 5px;
                width: 100%;
            }
            .cart-inputs input {
                width: 100%;
                background: rgba(0, 0, 0, 0.4);
                border: 1px solid rgba(255,255,255,0.1);
                color: white;
                padding: 6px;
                border-radius: 4px;
                font-size: 0.8rem;
                transition: all 0.3s;
            }
            .cart-inputs input:focus {
                border-color: #00c6ff;
                box-shadow: 0 0 8px rgba(0,198,255,0.5);
                outline: none;
            }
            .cart-inputs input.desc {
                color: #f1c40f;
            }
            
            /* Custom Scrollbar for Excel */
            .excel-body::-webkit-scrollbar { width: 8px; }
            .excel-body::-webkit-scrollbar-track { background: #0f172a; }
            .excel-body::-webkit-scrollbar-thumb { background: #00c6ff; border-radius: 4px; }
        </style>
        
        <h3 style="display: flex; align-items: center; gap: 15px; margin-bottom: 5px; font-size: 1.8rem; color: #fff;">
            <div style="background: #2ecc71; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 12px; box-shadow: 0 0 15px rgba(46,204,113,0.4);">
                <i class="fas fa-file-excel" style="color: white; font-size: 1.5rem;"></i>
            </div>
            Oylik Interaktiv Jadval (Excel Format)
        </h3>
        <p style="color:#aaa; font-size:0.95rem; margin-bottom:15px; border-left: 3px solid #00c6ff; padding-left: 10px;">
            Siz har bir 4 ta aravacha uchun marshrut(Boshlanish va tugash)larini yoki Izohlarini shu yerda oson tahrirlashingiz mumkin.
        </p>
        
        <div class="excel-container">
            <div class="excel-header">
                <div class="excel-header-cell" style="flex: 0.3; max-width: 80px;">SANA</div>
                ${carts.map(cart => `
                    <div class="excel-header-cell">
                        <i class="fas fa-truck" style="margin-right: 5px;"></i>${cart}
                    </div>
                `).join('')}
            </div>
            
            <div class="excel-body" id="excel-grid-body">
                ${daysArray.map(day => {
        return `
                    <div class="excel-row">
                        <div class="excel-cell" style="flex: 0.3; max-width: 80px; justify-content: center;">
                            <div class="day-number">${day}</div>
                        </div>
                        ${carts.map(cartId => {
            const cartObj = currentSchedule[cartId];
            const dayData = cartObj.schedule[day] || { start: "", end: "", text: "", status: "" };

            return `
                                <div class="excel-cell">
                                    <div class="cart-inputs">
                                        <div style="display:flex; gap:5px;">
                                            <input type="number" id="cell_${cartId}_${day}_start" placeholder="Boshlanish PK" value="${dayData.start !== 4020 ? dayData.start : ""}">
                                            <input type="number" id="cell_${cartId}_${day}_end" placeholder="Tugash PK" value="${dayData.end !== 4020 ? dayData.end : ""}">
                                        </div>
                                        <input type="text" class="desc" id="cell_${cartId}_${day}_text" placeholder="(Ixtiyoriy Izoh yozing, Masalan: Texnik ko'rik)" value="${dayData.text || ""}">
                                    </div>
                                </div>
                            `;
        }).join('')}
                    </div>
                    `;
    }).join('')}
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
             <button onclick="document.getElementById('defectoscope-content').innerHTML = getDefectoscopeTrackerHTML();" style="padding: 12px 25px; background: transparent; border: 1px solid #e74c3c; color: #e74c3c; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.3s;" onmouseover="this.style.background='rgba(231,76,60,0.1)'" onmouseout="this.style.background='transparent'">
                <i class="fas fa-arrow-left"></i> Orqaga qaytish
            </button>
            <div style="display: flex; gap: 15px;">
                <button onclick="clearExcelSchedule()" style="padding: 12px 25px; background: rgba(52, 73, 94, 0.8); border: none; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    <i class="fas fa-eraser"></i> Hamma qatorlarni tozalash
                </button>
                <button onclick="saveExcelSchedule()" style="padding: 12px 35px; background: linear-gradient(135deg, #11998e, #38ef7d); border: none; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.1rem; box-shadow: 0 5px 15px rgba(56, 239, 125, 0.4); transition: all 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    <i class="fas fa-save"></i> Jadvalni Saqlash
                </button>
            </div>
        </div>
    `;

    document.getElementById('defectoscope-content').innerHTML = editorHTML;
};

window.saveExcelSchedule = function () {
    try {
        const oldSchedule = JSON.parse(localStorage.getItem('defectoscopeMonthlySchedule')) || DEFAULT_SCHEDULE;
        const newSchedule = JSON.parse(JSON.stringify(oldSchedule)); // Chuqur nusxa(deep clone)

        const carts = Object.keys(newSchedule);

        for (let day = 1; day <= 31; day++) {
            carts.forEach(cartId => {
                const startVal = document.getElementById(`cell_${cartId}_${day}_start`).value;
                const endVal = document.getElementById(`cell_${cartId}_${day}_end`).value;
                const textVal = document.getElementById(`cell_${cartId}_${day}_text`).value;

                // Agar ma'lumot bo'lsa uni qo'shamiz
                if (startVal || endVal || textVal) {
                    if (!newSchedule[cartId].schedule) newSchedule[cartId].schedule = {};

                    const pStart = startVal ? parseInt(startVal) : 4020;
                    const pEnd = endVal ? parseInt(endVal) : 4020;

                    // "Texnik ko'rik" yoki maxsus kunga moslash
                    let pStatus = 'active';
                    if (textVal && (textVal.toLowerCase().includes('texnik') || textVal.toLowerCase().includes('tahlil') || textVal.toLowerCase().includes('dam'))) {
                        pStatus = 'paused';
                    }

                    newSchedule[cartId].schedule[day] = {
                        text: textVal || `${pStart} km - ${pEnd} km`,
                        start: pStart,
                        end: pEnd,
                        status: pStatus
                    };
                } else {
                    // Agar katakcha bo'sh bo'lsa, xotiradan tozalab yuboramiz
                    if (newSchedule[cartId].schedule && newSchedule[cartId].schedule[day]) {
                        delete newSchedule[cartId].schedule[day];
                    }
                }
            });
        }

        localStorage.setItem('defectoscopeMonthlySchedule', JSON.stringify(newSchedule));

        // Success animation
        const btn = event.currentTarget;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Saqlandi!';
        btn.style.background = '#2ecc71';

        setTimeout(() => {
            window.currentDefectoDay = new Date().getDate(); // Bugungi kunga qaytarish
            document.getElementById('defectoscope-content').innerHTML = getDefectoscopeTrackerHTML();
            showToast("Jadval tizimga muvaffaqiyatli saqlandi!", "success");
        }, 800);

    } catch (err) {
        alert("Xatolik. Ma'lumotlarni saqlash imkoni bo'lmadi.\n" + err.message);
    }
};

window.clearExcelSchedule = function () {
    if (!confirm("Barcha katakdalardagi ma'lumotlarni o'chirishni tasdiqlaysizmi?")) return;

    document.querySelectorAll('.cart-inputs input').forEach(input => {
        input.value = "";
    });
};

window.saveNewMonthlySchedule = function () {
    try {
        const textValue = document.getElementById('edit-schedule-json').value;
        const newObj = JSON.parse(textValue);

        // Validation check
        if (!newObj["POISK-0106"] || !newObj["POISK-2603"] || !newObj["POISK-1080"]) {
            throw new Error("Jadval tuzilishida asosiy aravachalar IDlari (POISK-...) to'liq emas.");
        }

        localStorage.setItem('defectoscopeMonthlySchedule', JSON.stringify(newObj));
        alert('🎉 Muvaffaqiyatli saqlandi! Tizim endi yozilgan yangi oylik qoidalar asosida ishlaydi.');

        // Refresh view
        window.currentDefectoDay = new Date().getDate(); // Bugungi kunga qaytish
        document.getElementById('defectoscope-content').innerHTML = getDefectoscopeTrackerHTML();

    } catch (err) {
        alert("Xatolik: Formati noto'g'ri yozilgan. Iltimos tekshirib qayta urinib ko'ring.\n" + err.message);
    }
};

// Export to Excel (simplified)
window.exportDefectsToExcel = function () {
    alert('Excel export funksiyasi! (Demo)');
};

// View defect report
window.viewDefectReport = function () {
    const allDefects = window.defectoscopeCarts.flatMap(cart =>
        cart.defects.map(d => ({ ...d, cart: cart.id }))
    );

    const reportHTML = `
        <h3>📊 Defektlar Hisoboti</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
                <tr style="background: rgba(0,198,255,0.1);">
                    <th style="padding: 10px;">Aravacha</th>
                    <th style="padding: 10px;">PK</th>
                    <th style="padding: 10px;">Turi</th>
                    <th style="padding: 10px;">Tavsif</th>
                    <th style="padding: 10px;">Vaqt</th>
                </tr>
            </thead>
            <tbody>
                ${allDefects.map(d => `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <td style="padding: 10px;">${d.cart}</td>
                        <td style="padding: 10px;">${d.pk}</td>
                        <td style="padding: 10px;">${d.type}</td>
                        <td style="padding: 10px;">${d.description}</td>
                        <td style="padding: 10px;">${d.time}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <button class="action-btn" onclick="closeDefectDetails()">
            <i class="fas fa-arrow-left"></i> Orqaga
        </button>
    `;

    document.getElementById('defectoscope-content').innerHTML = reportHTML;
};

// Refresh data
window.refreshDefectoscopeData = function () {
    document.getElementById('defectoscope-content').innerHTML = getDefectoscopeTrackerHTML();
    alert('Ma\'lumotlar yangilandi!');
};

// Initialize on load
initDefectoscopeData();
