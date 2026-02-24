/**
 * PCH STANSIYALAR XARITASI
 * ========================
 * Faol temir yo'l masofasidagi barcha stansiyalarni
 * Leaflet xaritasida ko'rsatadi.
 *
 * Qo'llanish:
 *   window.openPCHMap()  — alohida modal oyna sifatida
 */

// ============================================================
// BARCHA PCH STANSIYALARI MA'LUMOTLARI
// (Haqiqiy koordinatlar, O'zbekiston temir yo'llari)
// ============================================================
window.PCH_STATIONS_DATA = {

    // PCh-16: Qorlitog' TYM — Buxoro → Xorazm yo'nalishi (4020–4303 km)
    // Navbahor (Buxoro hududi) → Turon (To'rtko'l tumani chegarasi, Qoraqalpog'iston)
    // Yo'nalish: Shimoli-g'arb — Qizilqum cho'li orqali
    pch16: [
        { name: "Navbahor", km: 4020, lat: 39.725, lng: 64.253, type: "станция", bolinma: 1 },
        { name: "Qorovulbozor", km: 4035, lat: 39.802, lng: 64.024, type: "разъезд", bolinma: 1 },
        { name: "Yaxshilik", km: 4051, lat: 39.878, lng: 63.793, type: "станция", bolinma: 2 },
        { name: "Oqtepa", km: 4068, lat: 39.952, lng: 63.562, type: "разъезд", bolinma: 2 },
        { name: "Parvoz", km: 4084, lat: 40.025, lng: 63.330, type: "станция", bolinma: 3 },
        { name: "Kattaqo'ton", km: 4101, lat: 40.098, lng: 63.099, type: "разъезд", bolinma: 3 },
        { name: "Qorlitog'", km: 4117, lat: 40.170, lng: 62.869, type: "станция", bolinma: 4 },
        { name: "Kiyikli", km: 4133, lat: 40.242, lng: 62.638, type: "разъезд", bolinma: 4 },
        { name: "Xizirbobo", km: 4150, lat: 40.315, lng: 62.408, type: "станция", bolinma: 5 },
        { name: "Olish", km: 4166, lat: 40.387, lng: 62.177, type: "разъезд", bolinma: 5 },
        { name: "Shurchi", km: 4183, lat: 40.460, lng: 61.948, type: "станция", bolinma: 6 },
        { name: "Jayxun", km: 4200, lat: 40.525, lng: 61.742, type: "станция", bolinma: 7 },
        { name: "Qorakol", km: 4218, lat: 40.620, lng: 61.530, type: "разъезд", bolinma: 7 },
        { name: "Dautepa", km: 4234, lat: 40.745, lng: 61.340, type: "станция", bolinma: 8 },
        { name: "Tomdi", km: 4251, lat: 40.890, lng: 61.200, type: "разъезд", bolinma: 8 },
        { name: "Amudaryo", km: 4268, lat: 41.080, lng: 61.115, type: "станция", bolinma: 9 },
        { name: "Oltin yo'l", km: 4285, lat: 41.315, lng: 61.057, type: "разъезд", bolinma: 9 },
        { name: "Turon", km: 4303, lat: 41.550, lng: 61.005, type: "станция", bolinma: 10 },
    ],

    // PCh-1: Salar TYM (2800–2940 km)
    pch1: [
        { name: "Toshkent-Janubiy", km: 2800, lat: 41.2800, lng: 69.2200, type: "станция", bolinma: 1 },
        { name: "Salar", km: 2825, lat: 41.2100, lng: 69.2800, type: "станция", bolinma: 2 },
        { name: "Ohangaron", km: 2860, lat: 40.9100, lng: 69.6500, type: "станция", bolinma: 4 },
        { name: "Yangiyo'l", km: 2900, lat: 41.1100, lng: 69.0400, type: "станция", bolinma: 6 },
        { name: "Tuyabo'g'iz", km: 2940, lat: 41.0500, lng: 69.1000, type: "станция", bolinma: 8 },
    ],

    // PCh-2: Toshkent TYM (2940–3050 km)
    pch2: [
        { name: "Toshkent-Yuk", km: 2940, lat: 41.3200, lng: 69.2700, type: "станция", bolinma: 1 },
        { name: "Keles", km: 2980, lat: 41.3900, lng: 69.0900, type: "станция", bolinma: 3 },
        { name: "Bekobod", km: 3050, lat: 40.2200, lng: 69.2400, type: "станция", bolinma: 7 },
    ],

    // PCh-3: Qamchiq TYM (Angren-Pop)
    pch3: [
        { name: "Angren", km: 116, lat: 41.0200, lng: 70.1500, type: "станция", bolinma: 1 },
        { name: "Angren-Qamchiq", km: 135, lat: 41.0700, lng: 70.3000, type: "разъезд", bolinma: 2 },
        { name: "Qamchiq (tunneli)", km: 190, lat: 41.1000, lng: 70.8000, type: "tunnel", bolinma: 5 },
        { name: "Pop", km: 268, lat: 41.0000, lng: 71.1200, type: "станция", bolinma: 9 },
    ],

    // PCh-5: Jizzax TYM (3170–3310 km)
    pch5: [
        { name: "Xovos", km: 3170, lat: 40.7200, lng: 68.8000, type: "станция", bolinma: 1 },
        { name: "G'allaorol", km: 3210, lat: 40.4500, lng: 68.4000, type: "станция", bolinma: 3 },
        { name: "Jizzax", km: 3310, lat: 40.1200, lng: 67.8400, type: "станция", bolinma: 8 },
    ],

    // PCh-6: Qo'qon TYM (268–430 km)
    pch6: [
        { name: "Pop", km: 268, lat: 41.0000, lng: 71.1200, type: "станция", bolinma: 1 },
        { name: "Qo'qon", km: 320, lat: 40.5300, lng: 70.9400, type: "станция", bolinma: 3 },
        { name: "Margilan", km: 360, lat: 40.4700, lng: 71.7200, type: "станция", bolinma: 5 },
        { name: "Farg'ona", km: 390, lat: 40.3900, lng: 71.7900, type: "станция", bolinma: 7 },
        { name: "Hazratqo'l", km: 430, lat: 40.6600, lng: 72.5400, type: "станция", bolinma: 9 },
    ],

    // PCh-7: Andijon TYM (430–545 km)
    pch7: [
        { name: "Hazratqo'l", km: 430, lat: 40.6600, lng: 72.5400, type: "станция", bolinma: 1 },
        { name: "Xo'jaobod", km: 480, lat: 40.7500, lng: 72.7500, type: "станция", bolinma: 3 },
        { name: "Andijon", km: 545, lat: 40.7800, lng: 72.3400, type: "станция", bolinma: 7 },
    ],

    // PCh-8: Namangan TYM (545–660 km)
    pch8: [
        { name: "Andijon", km: 545, lat: 40.7800, lng: 72.3400, type: "станция", bolinma: 1 },
        { name: "Namangan", km: 615, lat: 41.0000, lng: 71.6700, type: "станция", bolinma: 5 },
        { name: "Chust", km: 660, lat: 40.9900, lng: 71.1200, type: "станция", bolinma: 7 },
    ],

    // PCh-10: Samarqand TYM (3450–3600 km)
    pch10: [
        { name: "Kattaqo'rg'on", km: 3450, lat: 39.9000, lng: 66.2600, type: "станция", bolinma: 1 },
        { name: "Samarqand", km: 3540, lat: 39.6500, lng: 66.9600, type: "станция", bolinma: 5 },
        { name: "Samarqand-Sharq", km: 3600, lat: 39.6200, lng: 67.1000, type: "станция", bolinma: 8 },
    ],

    // PCh-11: Navoiy TYM (3600–3745 km)
    pch11: [
        { name: "Samarqand-Sharq", km: 3600, lat: 39.6200, lng: 67.1000, type: "станция", bolinma: 1 },
        { name: "Navoiy", km: 3745, lat: 40.0800, lng: 65.3700, type: "станция", bolinma: 9 },
    ],

    // PCh-12: Buxoro TYM (3745–3880 km)
    pch12: [
        { name: "Navoiy", km: 3745, lat: 40.0800, lng: 65.3700, type: "станция", bolinma: 1 },
        { name: "Kogon", km: 3820, lat: 39.7200, lng: 64.5500, type: "станция", bolinma: 5 },
        { name: "Buxoro", km: 3880, lat: 39.7700, lng: 64.4500, type: "станция", bolinma: 8 },
    ],

    // PCh-17: Qarshi TYM (4303–4430 km)
    pch17: [
        { name: "Turon", km: 4303, lat: 38.7000, lng: 65.2000, type: "станция", bolinma: 1 },
        { name: "Qarshi", km: 4430, lat: 38.8600, lng: 65.7900, type: "станция", bolinma: 8 },
    ],

    // PCh-19: Termiz TYM (4540–4660 km)
    pch19: [
        { name: "G'uzor", km: 4540, lat: 38.6200, lng: 66.2500, type: "станция", bolinma: 1 },
        { name: "Qarshi-Janub", km: 4575, lat: 38.5000, lng: 66.5000, type: "разъезд", bolinma: 3 },
        { name: "Shahrisabz", km: 4600, lat: 39.0600, lng: 66.8300, type: "станция", bolinma: 5 },
        { name: "Termiz", km: 4660, lat: 37.2200, lng: 67.2800, type: "станция", bolinma: 8 },
    ],

    // PCh-20: Urgench TYM (3880–4030 km)
    pch20: [
        { name: "Buxoro-2", km: 3880, lat: 39.7700, lng: 64.4500, type: "станция", bolinma: 1 },
        { name: "Urgench", km: 4030, lat: 41.5500, lng: 60.6300, type: "станция", bolinma: 9 },
    ],

    // PCh-22: Qo'ng'irot TYM (4135–4370 km)
    pch22: [
        { name: "Xiva", km: 4135, lat: 41.3800, lng: 60.3600, type: "станция", bolinma: 1 },
        { name: "Beruniy", km: 4250, lat: 41.6900, lng: 60.7500, type: "станция", bolinma: 6 },
        { name: "Qo'ng'irot", km: 4370, lat: 43.0800, lng: 58.9000, type: "станция", bolinma: 10 },
    ],
};

// Bo'linma ranglari
const BOLINMA_COLORS = [
    '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12',
    '#1abc9c', '#e67e22', '#34495e', '#16a085', '#8e44ad'
];

// Stansiya turi ikonasi
function getStationIcon(type, color) {
    const shape = type === 'tunnel' ? '⬛' : type === 'разъезд' ? '◆' : '●';
    return L.divIcon({
        className: '',
        html: `<div style="
            background: ${color};
            width: ${type === 'станция' ? 16 : 11}px;
            height: ${type === 'станция' ? 16 : 11}px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 8px ${color}, 0 2px 6px rgba(0,0,0,0.5);
            cursor: pointer;
        "></div>`,
        iconSize: [type === 'станция' ? 16 : 11, type === 'станция' ? 16 : 11],
        iconAnchor: [type === 'станция' ? 8 : 5, type === 'станция' ? 8 : 5],
    });
}

// ============================================================
// XARITANI OCHISH
// ============================================================
window.openPCHMap = function () {
    const activeMasofa = window.ACTIVE_MASOFA || window.getActiveMasofa?.();

    // Modal
    const existing = document.getElementById('pch-map-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'pch-map-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.97); z-index: 10050;
        display: flex; flex-direction: column;
        font-family: 'Segoe UI', sans-serif;
    `;

    const masofaName = activeMasofa ? activeMasofa.name : "Temir Yo'l Masofasi";
    const pchNum = activeMasofa ? activeMasofa.pchNumber : '';
    const mtuColors = {
        toshkent_mtu: '#3498db', qoqon_mtu: '#2ecc71',
        samarqand_mtu: '#9b59b6', buxoro_mtu: '#f39c12',
        qarshi_mtu: '#e74c3c', qongrot_mtu: '#1abc9c',
    };
    const headerColor = activeMasofa ? (mtuColors[activeMasofa.mtu] || '#00c6ff') : '#00c6ff';

    modal.innerHTML = `
        <!-- HEADER -->
        <div style="background: linear-gradient(90deg, #0d1b2e, #1e3c72);
            padding: 12px 20px; display: flex; align-items: center;
            justify-content: space-between; border-bottom: 2px solid ${headerColor}40;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="background: ${headerColor}22; border: 1px solid ${headerColor}66;
                    border-radius: 8px; padding: 6px 12px; font-size: 0.8rem;
                    font-weight: 700; color: ${headerColor}; letter-spacing: 1px;">
                    ${pchNum || 'PCh'}
                </div>
                <div>
                    <div style="color: white; font-size: 1.1rem; font-weight: 600;">
                        <i class="fas fa-map-marked-alt" style="color: ${headerColor};"></i>
                        &nbsp;${masofaName} — Stansiyalar Xaritasi
                    </div>
                    <div style="color: rgba(255,255,255,0.5); font-size: 0.78rem; margin-top: 2px;">
                        ${activeMasofa ? `${activeMasofa.kmStart}–${activeMasofa.kmEnd} km • ${activeMasofa.startStation} → ${activeMasofa.endStation}` : ''}
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <!-- Legend -->
                <div style="display: flex; gap: 12px; font-size: 0.75rem; color: rgba(255,255,255,0.6);">
                    <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#3498db;border:2px solid white;margin-right:4px;"></span>Stansiya</span>
                    <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f39c12;border:2px solid white;margin-right:4px;"></span>Razezd</span>
                </div>
                <button onclick="document.getElementById('pch-map-modal').remove()"
                    style="background: rgba(231,76,60,0.2); border: 1px solid #e74c3c;
                    color: #e74c3c; width: 34px; height: 34px; border-radius: 50%;
                    cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; justify-content: center;">
                    ×
                </button>
            </div>
        </div>

        <!-- BODY: Sidebar + Map -->
        <div style="display: flex; flex: 1; overflow: hidden;">

            <!-- SIDEBAR -->
            <div id="pch-map-sidebar" style="
                width: 300px; min-width: 260px; background: #0d1b2e;
                border-right: 1px solid rgba(255,255,255,0.08);
                overflow-y: auto; flex-shrink: 0;">

                <!-- Stansiya soni -->
                <div style="padding: 15px 18px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <div style="color: rgba(255,255,255,0.4); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                        Stansiyalar Ro'yxati
                    </div>
                    <input type="text" id="station-search-input" placeholder="🔍 Stansiya qidirish..."
                        oninput="filterStationList(this.value)"
                        style="width: 100%; padding: 8px 12px; background: rgba(255,255,255,0.07);
                        border: 1px solid rgba(255,255,255,0.12); border-radius: 8px;
                        color: white; font-size: 0.85rem; outline: none; box-sizing: border-box;">
                </div>
                <div id="station-list-items" style="padding: 8px 0;"></div>
            </div>

            <!-- MAP -->
            <div style="flex: 1; position: relative;">
                <div id="pch-leaflet-map" style="width: 100%; height: 100%;"></div>

                <!-- Info panel (stansiya bosilganda) -->
                <div id="station-info-panel" style="
                    position: absolute; bottom: 20px; left: 20px;
                    background: rgba(13,27,46,0.95); border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 12px; padding: 0; width: 280px;
                    display: none; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    backdrop-filter: blur(10px); z-index: 1000;"></div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Xaritani ishga tushirish
    setTimeout(() => initPCHLeafletMap(activeMasofa, headerColor), 100);
};

// ============================================================
// LEAFLET XARITASINI ISHGA TUSHIRISH
// ============================================================
function initPCHLeafletMap(masofa, headerColor) {
    if (!window.L) {
        alert("Leaflet xarita kutubxonasi yuklanmagan!");
        return;
    }

    // Stansiyalar ma'lumotini topish
    const masofaId = masofa ? masofa.id : null;
    let stations = getStationsForMasofa(masofaId, masofa);

    if (!stations || stations.length === 0) {
        document.getElementById('pch-leaflet-map').innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100%;
                color:rgba(255,255,255,0.4);flex-direction:column;gap:15px;background:#0d1b2e;">
                <i class="fas fa-map-marked-alt" style="font-size:4rem;color:rgba(255,255,255,0.15);"></i>
                <div>Bu masofa uchun stansiya koordinatalari hali kiritilmagan.</div>
                <div style="font-size:0.85rem;color:rgba(255,255,255,0.3);">
                    ${masofa ? masofa.startStation + ' → ' + masofa.endStation : ''}
                </div>
            </div>`;
        return;
    }

    // Xarita markazi
    const center = masofa ? masofa.mapCenter
        : [stations[Math.floor(stations.length / 2)].lat, stations[Math.floor(stations.length / 2)].lng];
    const zoom = masofa ? masofa.mapZoom : 9;

    // Leaflet xarita
    const map = L.map('pch-leaflet-map', {
        center: center,
        zoom: zoom,
        zoomControl: true,
    });

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '©OpenStreetMap ©CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // ---- Temir yo'l liniyasini chizish ----
    const lineCoords = stations.map(s => [s.lat, s.lng]);

    // Orqa (qalin, rangli) chiziq
    L.polyline(lineCoords, {
        color: headerColor,
        weight: 6,
        opacity: 0.5,
        dashArray: null,
        lineJoin: 'round',
    }).addTo(map);

    // Old (nozik oq) chiziq
    L.polyline(lineCoords, {
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.3,
        dashArray: '6, 6',
    }).addTo(map);

    // ---- Bo'linmalar ranglar mapping ----
    const bolinmaColorMap = {};
    if (masofa && masofa.subdivisions) {
        masofa.subdivisions.forEach((b, i) => {
            const bNum = parseInt(b.id.replace('bolinma', '')) || (i + 1);
            bolinmaColorMap[bNum] = BOLINMA_COLORS[i % BOLINMA_COLORS.length];
        });
    } else {
        for (let i = 1; i <= 10; i++) {
            bolinmaColorMap[i] = BOLINMA_COLORS[(i - 1) % BOLINMA_COLORS.length];
        }
    }

    // ---- Markerlar ----
    const markers = [];
    stations.forEach((st, idx) => {
        const color = bolinmaColorMap[st.bolinma] || '#00c6ff';
        const icon = getStationIcon(st.type, color);

        const marker = L.marker([st.lat, st.lng], { icon }).addTo(map);

        // Marker bosilganda
        marker.on('click', () => showStationInfo(st, color, masofa));

        // Tooltip
        marker.bindTooltip(`
            <b>${st.name}</b><br>
            ${st.km} km &nbsp;|&nbsp; ${st.type}<br>
            <span style="color:${color};">${idx + 1}-bo'linma hududida</span>
        `, {
            direction: 'top',
            offset: [0, -10],
            className: 'pch-map-tooltip'
        });

        markers.push({ station: st, marker, color });
    });

    // ---- Km label (har 5-stansiyada) ----
    stations.forEach((st, i) => {
        if (i % 3 === 0 || i === stations.length - 1 || i === 0) {
            L.marker([st.lat, st.lng], {
                icon: L.divIcon({
                    className: '',
                    html: `<div style="
                        background: rgba(0,0,0,0.7); color: rgba(255,255,255,0.7);
                        font-size: 9px; padding: 1px 5px; border-radius: 3px;
                        white-space: nowrap; margin-top: 12px; border: 1px solid rgba(255,255,255,0.15);
                    ">${st.km} km</div>`,
                    iconSize: [60, 20],
                    iconAnchor: [30, 0],
                })
            }).addTo(map);
        }
    });

    // Sidebar ro'yxatini to'ldirish
    renderStationSidebar(stations, markers, map, bolinmaColorMap, masofa);

    // Xaritani stansiyalarga moslashtirish
    if (lineCoords.length > 1) {
        map.fitBounds(L.latLngBounds(lineCoords), { padding: [40, 40] });
    }

    // Global saqlab qo'yish
    window._pchMap = map;
    window._pchMarkers = markers;
    window._pchStations = stations;
}

// ============================================================
// STANSIYA MA'LUMOTLARI PANELI
// ============================================================
function showStationInfo(st, color, masofa) {
    const panel = document.getElementById('station-info-panel');
    if (!panel) return;

    const bolinmaName = masofa && masofa.subdivisions
        ? (masofa.subdivisions[st.bolinma - 1]?.name || `${st.bolinma}-bo'linma`)
        : `${st.bolinma}-bo'linma`;

    const stationTypes = {
        'станция': { label: 'Stansiya', icon: 'fa-train' },
        'разъезд': { label: 'Razezd / Blok-post', icon: 'fa-code-branch' },
        'tunnel': { label: 'Tunnel', icon: 'fa-toll' },
    };
    const typeInfo = stationTypes[st.type] || { label: st.type, icon: 'fa-circle' };

    panel.style.display = 'block';
    panel.innerHTML = `
        <div style="padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.08);
            display: flex; align-items: center; gap: 10px;">
            <div style="background: ${color}22; width: 36px; height: 36px; border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                border: 2px solid ${color}55; flex-shrink: 0;">
                <i class="fas ${typeInfo.icon}" style="color: ${color}; font-size: 0.9rem;"></i>
            </div>
            <div>
                <div style="color: white; font-weight: 700; font-size: 1rem;">${st.name}</div>
                <div style="color: rgba(255,255,255,0.4); font-size: 0.72rem;">${typeInfo.label}</div>
            </div>
            <button onclick="document.getElementById('station-info-panel').style.display='none'"
                style="margin-left: auto; background: none; border: none; color: rgba(255,255,255,0.3);
                cursor: pointer; font-size: 1rem;">×</button>
        </div>
        <div style="padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; gap: 8px;">
                <div style="flex: 1; background: rgba(255,255,255,0.05); border-radius: 8px; padding: 10px;">
                    <div style="color: rgba(255,255,255,0.4); font-size: 0.7rem; margin-bottom: 3px;">Kilometr</div>
                    <div style="color: white; font-weight: 700; font-size: 1.1rem; font-family: monospace;">${st.km} km</div>
                </div>
                <div style="flex: 1; background: ${color}18; border-radius: 8px; padding: 10px; border: 1px solid ${color}33;">
                    <div style="color: rgba(255,255,255,0.4); font-size: 0.7rem; margin-bottom: 3px;">Bo'linma</div>
                    <div style="color: ${color}; font-weight: 700; font-size: 0.9rem;">${bolinmaName}</div>
                </div>
            </div>
            <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 10px;">
                <div style="color: rgba(255,255,255,0.4); font-size: 0.7rem; margin-bottom: 3px;">Koordinatalar</div>
                <div style="color: rgba(255,255,255,0.7); font-size: 0.8rem; font-family: monospace;">
                    ${st.lat.toFixed(4)}°N, ${st.lng.toFixed(4)}°E
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// SIDEBAR RO'YXATI
// ============================================================
function renderStationSidebar(stations, markers, map, colorMap, masofa) {
    const container = document.getElementById('station-list-items');
    if (!container) return;

    container.innerHTML = stations.map((st, i) => {
        const color = colorMap[st.bolinma] || '#00c6ff';
        const isStation = st.type === 'станция';
        return `
            <div class="station-list-item" data-name="${st.name.toLowerCase()}"
                onclick="flyToStation(${i})"
                style="padding: 10px 18px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.04);
                display: flex; align-items: center; gap: 10px; transition: background 0.15s;"
                onmouseover="this.style.background='rgba(255,255,255,0.05)'"
                onmouseout="this.style.background='transparent'">
                <div style="width: ${isStation ? 10 : 7}px; height: ${isStation ? 10 : 7}px;
                    border-radius: 50%; background: ${color}; flex-shrink: 0;
                    box-shadow: 0 0 5px ${color};"></div>
                <div style="min-width: 0; flex: 1;">
                    <div style="color: white; font-size: 0.85rem; font-weight: ${isStation ? 600 : 400};
                        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${st.name}</div>
                    <div style="color: rgba(255,255,255,0.35); font-size: 0.7rem;">
                        ${st.km} km &nbsp;·&nbsp; ${st.type === 'станция' ? 'Stansiya' : 'Razezd'}
                    </div>
                </div>
                <div style="color: ${color}; font-size: 0.65rem; white-space: nowrap; opacity: 0.7;">
                    ${st.bolinma}-bo'l
                </div>
            </div>
        `;
    }).join('');

    // Jami ko'rsatish
    container.insertAdjacentHTML('afterbegin', `
        <div style="padding: 8px 18px 4px; color: rgba(255,255,255,0.3); font-size: 0.72rem; display: flex; justify-content: space-between;">
            <span>${stations.length} ta obyekt</span>
            <span>${stations.filter(s => s.type === 'станция').length} stansiya, ${stations.filter(s => s.type !== 'станция').length} razezd</span>
        </div>
    `);
}

// Stansiyaga uchish
window.flyToStation = function (index) {
    const markers = window._pchMarkers;
    const stations = window._pchStations;
    const map = window._pchMap;
    if (!markers || !map || !stations) return;

    const { station, marker, color } = markers[index];
    map.flyTo([station.lat, station.lng], 13, { duration: 1 });
    marker.openTooltip();

    const activeMasofa = window.ACTIVE_MASOFA || window.getActiveMasofa?.();
    showStationInfo(station, color, activeMasofa);
};

// Qidiruv
window.filterStationList = function (query) {
    const q = query.toLowerCase().trim();
    document.querySelectorAll('.station-list-item').forEach(item => {
        const name = item.getAttribute('data-name') || '';
        item.style.display = (!q || name.includes(q)) ? '' : 'none';
    });
};

// ============================================================
// MASOFAGA MOS STANSIYALARNI TOPISH
// ============================================================
function getStationsForMasofa(masofaId, masofa) {
    // 1. Aniq PCH_STATIONS_DATA dan qidirish
    if (masofaId && window.PCH_STATIONS_DATA[masofaId]) {
        return window.PCH_STATIONS_DATA[masofaId];
    }

    // 2. data.js dagi stansiyalar (Qorlitog' uchun default)
    if (window.INITIAL_DATA?.stations?.length > 0) {
        return window.INITIAL_DATA.stations.map((s, i) => ({
            name: s.name,
            km: masofa ? masofa.kmStart + Math.round((i / (window.INITIAL_DATA.stations.length - 1)) * (masofa.kmEnd - masofa.kmStart)) : s.id * 30,
            lat: s.lat,
            lng: s.lng,
            type: 'станция',
            bolinma: s.bolinma || (i + 1)
        }));
    }

    return [];
}

// CSS tooltip
(function addMapStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .pch-map-tooltip {
            background: rgba(13,27,46,0.95) !important;
            border: 1px solid rgba(255,255,255,0.15) !important;
            color: white !important;
            border-radius: 8px !important;
            font-size: 0.82rem !important;
            padding: 8px 12px !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
        }
        .pch-map-tooltip::before {
            border-top-color: rgba(255,255,255,0.15) !important;
        }
    `;
    document.head.appendChild(style);
})();

console.log('✅ PCH Xarita moduli yuklandi');
