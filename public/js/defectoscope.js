// Defektaskop Aravacha Tracking System
// Initialize defectoscope data with Defect Codes
function initDefectoscopeData() {
    if (!window.defectoscopeCarts) {
        const defaultCarts = [
            {
                id: 'ПОИСК-0106',
                operator: 'Karimov A.A.',
                route: { start: 4020, current: 4025, end: 4050 },
                startTime: '07:30',
                estimatedEnd: '17:45',
                speed: 1.3,
                checked: 6,
                defects: [
                    { pk: 4023, code: '21', type: 'Yengil', description: 'Bolt zaiflashgan', time: '09:15' }
                ],
                status: 'active',
                color: 'orange'
            },
            {
                id: 'ПОИСК-0207',
                operator: 'Salimov B.K.',
                route: { start: 4120, current: 4145, end: 4180 },
                startTime: '06:00',
                estimatedEnd: '16:20',
                speed: 1.5,
                checked: 25,
                defects: [
                    { pk: 4125, code: '26.3', type: 'O\'rta', description: 'Rels yoriq', time: '08:30' },
                    { pk: 4138, code: '17.1', type: 'Yengil', description: 'Relso\'rni yeyilgan', time: '11:15' },
                    { pk: 4142, code: '53.1', type: 'Og\'ir', description: 'Yonoq yorig\'i', time: '12:45' }
                ],
                status: 'active',
                color: 'blue'
            },
            {
                id: 'ПОИСК-0308',
                operator: 'Aliev C.D.',
                route: { start: 4190, current: 4205, end: 4245 },
                startTime: '08:00',
                estimatedEnd: '18:30',
                speed: 0,
                checked: 15,
                defects: [
                    { pk: 4198, code: '30G', type: 'Yengil', description: 'Bolt yetishmaydi', time: '10:20' },
                    { pk: 4203, code: '14', type: 'O\'rta', description: 'Rels yeyilishi', time: '13:10' }
                ],
                status: 'paused',
                color: 'purple'
            },
            {
                id: 'ПОИСК-0409',
                operator: 'Juzgenov D.M.',
                route: { start: 4260, current: 4280, end: 4303 },
                startTime: '07:00',
                estimatedEnd: '17:10',
                speed: 1.4,
                checked: 20,
                defects: [
                    { pk: 4267, code: '41', type: 'Yengil', description: 'Skrep yeyilgan', time: '09:45' },
                    { pk: 4275, code: '69', type: 'O\'rta', description: 'Podkładka buzilib', time: '12:20' }
                ],
                status: 'active',
                color: 'green'
            }
        ];

        window.defectoscopeCarts = JSON.parse(localStorage.getItem('defectoscopeCarts')) || defaultCarts;
    }
}

// Calculate progress percentage
function calculateProgress(start, current, end) {
    const total = end - start;
    const completed = current - start;
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
        </style>
        
        <div class="defecto-header">
            <h2>
                <i class="fas fa-search-location"></i>
                Defektaskop Aravachalari - Real-time Monitoring
            </h2>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div class="defecto-stats">
                    <span><i class="fas fa-road"></i> Jami tekshirildi: <strong>${totalChecked} km</strong></span>
                    <span><i class="fas fa-exclamation-triangle"></i> Defektlar: <strong>${totalDefects} ta</strong></span>
                    <span><i class="fas fa-truck"></i> Faol aravachalar: <strong>${activeCarts}/${carts.length}</strong></span>
                </div>
                <div style="text-align: right; color: rgba(255,255,255,0.6); font-size: 0.9rem;">
                    <div>${currentDate}</div>
                    <div>${currentTime}</div>
                </div>
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
                        
                        <div class="cart-info">
                            <span><i class="fas fa-user"></i> ${cart.operator}</span>
                            <span><i class="fas fa-clock"></i> ${cart.startTime}</span>
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

    const editorHTML = `
        <h3>📝 Jadval Tahrirlash (Admin)</h3>
        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin: 20px 0;">
            <div style="margin-bottom: 15px;">
                <label>Aravacha:</label>
                <select id="edit-cart-id" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 5px; margin-top: 5px;">
                    ${window.defectoscopeCarts.map(c => `<option value="${c.id}">${c.id}</option>`).join('')}
                </select>
            </div>
            <div style="margin-bottom: 15px;">
                <label>Operator:</label>
                <input type="text" id="edit-operator" placeholder="Operator nomi" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 5px; margin-top: 5px;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <label>Boshlanish PK:</label>
                    <input type="number" id="edit-start-pk" placeholder="4020" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 5px; margin-top: 5px;">
                </div>
                <div>
                    <label>Tugash PK:</label>
                    <input type="number" id="edit-end-pk" placeholder="4050" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 5px; margin-top: 5px;">
                </div>
            </div>
            <div style="margin-top: 15px;">
                <label>Boshlanish vaqti:</label>
                <input type="time" id="edit-start-time" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 5px; margin-top: 5px;">
            </div>
        </div>
        
        <div style="display: flex; gap: 10px;">
            <button class="action-btn" onclick="saveScheduleChanges()">
                <i class="fas fa-save"></i> Saqlash
            </button>
            <button class="action-btn" onclick="closeDefectDetails()" style="background: rgba(231,76,60,0.8);">
                <i class="fas fa-times"></i> Bekor qilish
            </button>
        </div>
    `;

    document.getElementById('defectoscope-content').innerHTML = editorHTML;

    // Load current cart data
    loadCartDataForEdit();
};

function loadCartDataForEdit() {
    const cartId = document.getElementById('edit-cart-id').value;
    const cart = window.defectoscopeCarts.find(c => c.id === cartId);
    if (!cart) return;

    document.getElementById('edit-operator').value = cart.operator;
    document.getElementById('edit-start-pk').value = cart.route.start;
    document.getElementById('edit-end-pk').value = cart.route.end;
    document.getElementById('edit-start-time').value = cart.startTime;

    document.getElementById('edit-cart-id').onchange = loadCartDataForEdit;
}

window.saveScheduleChanges = function () {
    const cartId = document.getElementById('edit-cart-id').value;
    const cart = window.defectoscopeCarts.find(c => c.id === cartId);
    if (!cart) return;

    const startPK = parseInt(document.getElementById('edit-start-pk').value);
    const endPK = parseInt(document.getElementById('edit-end-pk').value);

    if (endPK <= startPK) {
        alert('Tugash PK boshlanish PK dan katta bo\'lishi kerak!');
        return;
    }

    cart.operator = document.getElementById('edit-operator').value;
    cart.route.start = startPK;
    cart.route.end = endPK;
    cart.startTime = document.getElementById('edit-start-time').value;

    // Save to localStorage
    localStorage.setItem('defectoscopeCarts', JSON.stringify(window.defectoscopeCarts));

    alert('O\'zgarishlar saqlandi!');
    closeDefectDetails();
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
