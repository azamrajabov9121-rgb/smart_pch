/**
 * O'ZBEKISTON TEMIR YO'LLARI AJ
 * "Temiryo'linfratuzilma" AJ — Yo'l Xo'jaligi Boshqarmasi
 * =========================================================
 * Barcha Temir Yo'l Masofalari (PCh — Put Chasti) To'liq Ro'yxati
 *
 * Tuzilish:
 *  6 ta MTU (Mintaqaviy Temir Yo'l Uzeli):
 *    1. Toshkent MTU   → PCh-1, PCh-2, PCh-3, PCh-4, PCh-5
 *    2. Qo'qon MTU     → PCh-6, PCh-7, PCh-8
 *    3. Samarqand MTU  → PCh-9, PCh-10, PCh-11
 *    4. Buxoro MTU     → PCh-12, PCh-13, PCh-14, PCh-15, PCh-16
 *    5. Qarshi MTU     → PCh-17, PCh-18, PCh-19
 *    6. Qo'ng'irot MTU → PCh-20, PCh-21, PCh-22
 *
 * Manba: railwayinfra.uz, railway.uz
 * =========================================================
 */

window.MTU_LIST = [
    { id: 'toshkent_mtu', name: "Toshkent MTU", color: "#3498db" },
    { id: 'qoqon_mtu', name: "Qo'qon MTU", color: "#2ecc71" },
    { id: 'samarqand_mtu', name: "Samarqand MTU", color: "#9b59b6" },
    { id: 'buxoro_mtu', name: "Buxoro MTU", color: "#f39c12" },
    { id: 'qarshi_mtu', name: "Qarshi MTU", color: "#e74c3c" },
    { id: 'qongrot_mtu', name: "Qo'ng'irot MTU", color: "#1abc9c" },
];

window.MASOFA_LIST = [

    // ╔══════════════════════════════════════════════╗
    // ║          1. TOSHKENT MTU                     ║
    // ║  PCh-1, PCh-2, PCh-3, PCh-4, PCh-5          ║
    // ╚══════════════════════════════════════════════╝

    {
        id: 'pch1',
        pchNumber: "PCh-1",
        name: "Salar Temir Yo'l Masofasi",
        shortName: "Salar TYM (PCh-1)",
        mtu: "toshkent_mtu",
        region: "Toshkent shahri",
        kmStart: 2800,
        kmEnd: 2940,
        bolinmalarCount: 8,
        startStation: "Toshkent-Janubiy",
        endStation: "Salar",
        mapCenter: [41.2995, 69.2401],
        mapZoom: 10,
        subdivisions: genBolinmalar(8, 2800, 2940),
    },
    {
        id: 'pch2',
        pchNumber: "PCh-2",
        name: "Toshkent Temir Yo'l Masofasi",
        shortName: "Toshkent TYM (PCh-2)",
        mtu: "toshkent_mtu",
        region: "Toshkent viloyati",
        kmStart: 2940,
        kmEnd: 3050,
        bolinmalarCount: 7,
        startStation: "Toshkent-Yuk",
        endStation: "Bekobod",
        mapCenter: [41.1500, 69.6000],
        mapZoom: 9,
        subdivisions: genBolinmalar(7, 2940, 3050),
    },
    {
        id: 'pch3',
        pchNumber: "PCh-3",
        name: "Qamchiq (Angren) Temir Yo'l Masofasi",
        shortName: "Qamchiq TYM (PCh-3)",
        mtu: "toshkent_mtu",
        region: "Toshkent viloyati",
        kmStart: 116,
        kmEnd: 268,
        bolinmalarCount: 9,
        startStation: "Angren",
        endStation: "Pop (Qamchiq tonneli)",
        mapCenter: [40.9680, 69.9100],
        mapZoom: 9,
        subdivisions: genBolinmalar(9, 116, 268),
    },
    {
        id: 'pch4',
        pchNumber: "PCh-4",
        name: "Xovos Temir Yo'l Masofasi",
        shortName: "Xovos TYM (PCh-4)",
        mtu: "toshkent_mtu",
        region: "Sirdaryo viloyati",
        kmStart: 3050,
        kmEnd: 3170,
        bolinmalarCount: 7,
        startStation: "Bekobod",
        endStation: "Xovos",
        mapCenter: [40.7000, 68.7500],
        mapZoom: 9,
        subdivisions: genBolinmalar(7, 3050, 3170),
    },
    {
        id: 'pch5',
        pchNumber: "PCh-5",
        name: "Jizzax Temir Yo'l Masofasi",
        shortName: "Jizzax TYM (PCh-5)",
        mtu: "toshkent_mtu",
        region: "Jizzax viloyati",
        kmStart: 3170,
        kmEnd: 3310,
        bolinmalarCount: 8,
        startStation: "Xovos",
        endStation: "Jizzax",
        mapCenter: [40.1158, 67.8422],
        mapZoom: 9,
        subdivisions: genBolinmalar(8, 3170, 3310),
    },

    // ╔══════════════════════════════════════════════╗
    // ║          2. QO'QON MTU                       ║
    // ║  PCh-6, PCh-7, PCh-8                         ║
    // ╚══════════════════════════════════════════════╝

    {
        id: 'pch6',
        pchNumber: "PCh-6",
        name: "Qo'qon Temir Yo'l Masofasi",
        shortName: "Qo'qon TYM (PCh-6)",
        mtu: "qoqon_mtu",
        region: "Farg'ona viloyati",
        kmStart: 268,
        kmEnd: 430,
        bolinmalarCount: 10,
        startStation: "Pop",
        endStation: "Hazratqo'l",
        mapCenter: [40.5283, 70.9422],
        mapZoom: 9,
        subdivisions: genBolinmalar(10, 268, 430),
    },
    {
        id: 'pch7',
        pchNumber: "PCh-7",
        name: "Andijon Temir Yo'l Masofasi",
        shortName: "Andijon TYM (PCh-7)",
        mtu: "qoqon_mtu",
        region: "Andijon viloyati",
        kmStart: 430,
        kmEnd: 545,
        bolinmalarCount: 7,
        startStation: "Hazratqo'l",
        endStation: "Andijon",
        mapCenter: [40.7821, 72.3442],
        mapZoom: 9,
        subdivisions: genBolinmalar(7, 430, 545),
    },
    {
        id: 'pch8',
        pchNumber: "PCh-8",
        name: "Namangan Temir Yo'l Masofasi",
        shortName: "Namangan TYM (PCh-8)",
        mtu: "qoqon_mtu",
        region: "Namangan viloyati",
        kmStart: 545,
        kmEnd: 660,
        bolinmalarCount: 7,
        startStation: "Andijon",
        endStation: "Namangan",
        mapCenter: [40.9983, 71.6726],
        mapZoom: 9,
        subdivisions: genBolinmalar(7, 545, 660),
    },

    // ╔══════════════════════════════════════════════╗
    // ║          3. SAMARQAND MTU                    ║
    // ║  PCh-9, PCh-10, PCh-11                       ║
    // ╚══════════════════════════════════════════════╝

    {
        id: 'pch9',
        pchNumber: "PCh-9",
        name: "Kattaqo'rg'on Temir Yo'l Masofasi",
        shortName: "Kattaqo'rg'on TYM (PCh-9)",
        mtu: "samarqand_mtu",
        region: "Samarqand viloyati",
        kmStart: 3310,
        kmEnd: 3450,
        bolinmalarCount: 8,
        startStation: "Jizzax",
        endStation: "Kattaqo'rg'on",
        mapCenter: [39.8960, 66.2560],
        mapZoom: 9,
        subdivisions: genBolinmalar(8, 3310, 3450),
    },
    {
        id: 'pch10',
        pchNumber: "PCh-10",
        name: "Samarqand Temir Yo'l Masofasi",
        shortName: "Samarqand TYM (PCh-10)",
        mtu: "samarqand_mtu",
        region: "Samarqand viloyati",
        kmStart: 3450,
        kmEnd: 3600,
        bolinmalarCount: 9,
        startStation: "Kattaqo'rg'on",
        endStation: "Samarqand-Sharq",
        mapCenter: [39.6549, 66.9597],
        mapZoom: 9,
        subdivisions: genBolinmalar(9, 3450, 3600),
    },
    {
        id: 'pch11',
        pchNumber: "PCh-11",
        name: "Navoiy Temir Yo'l Masofasi",
        shortName: "Navoiy TYM (PCh-11)",
        mtu: "samarqand_mtu",
        region: "Navoiy viloyati",
        kmStart: 3600,
        kmEnd: 3745,
        bolinmalarCount: 9,
        startStation: "Samarqand-Sharq",
        endStation: "Navoiy",
        mapCenter: [40.0840, 65.3680],
        mapZoom: 9,
        subdivisions: genBolinmalar(9, 3600, 3745),
    },

    // ╔══════════════════════════════════════════════╗
    // ║          4. BUXORO MTU                       ║
    // ║  PCh-12, PCh-13, PCh-14, PCh-15, PCh-16     ║
    // ╚══════════════════════════════════════════════╝

    {
        id: 'pch12',
        pchNumber: "PCh-12",
        name: "Buxoro Temir Yo'l Masofasi",
        shortName: "Buxoro TYM (PCh-12)",
        mtu: "buxoro_mtu",
        region: "Buxoro viloyati",
        kmStart: 3745,
        kmEnd: 3880,
        bolinmalarCount: 8,
        startStation: "Navoiy",
        endStation: "Buxoro",
        mapCenter: [39.7680, 64.4556],
        mapZoom: 9,
        subdivisions: genBolinmalar(8, 3745, 3880),
    },
    {
        id: 'pch13',
        pchNumber: "PCh-13",
        name: "Kogon Temir Yo'l Masofasi",
        shortName: "Kogon TYM (PCh-13)",
        mtu: "buxoro_mtu",
        region: "Buxoro viloyati",
        kmStart: 3880,
        kmEnd: 4020,
        bolinmalarCount: 8,
        startStation: "Buxoro",
        endStation: "Qorovulbozor",
        mapCenter: [39.6800, 64.5200],
        mapZoom: 9,
        subdivisions: genBolinmalar(8, 3880, 4020),
    },
    {
        id: 'pch14',
        pchNumber: "PCh-14",
        name: "Olot Temir Yo'l Masofasi",
        shortName: "Olot TYM (PCh-14)",
        mtu: "buxoro_mtu",
        region: "Buxoro / Qashqadaryo",
        kmStart: 4020,
        kmEnd: 4120,
        bolinmalarCount: 6,
        startStation: "Qorovulbozor",
        endStation: "Olot",
        mapCenter: [39.4000, 64.2000],
        mapZoom: 9,
        subdivisions: genBolinmalar(6, 4020, 4120),
    },
    {
        id: 'pch15',
        pchNumber: "PCh-15",
        name: "Miskin Temir Yo'l Masofasi",
        shortName: "Miskin TYM (PCh-15)",
        mtu: "buxoro_mtu",
        region: "Qashqadaryo viloyati",
        kmStart: 4120,
        kmEnd: 4210,
        bolinmalarCount: 6,
        startStation: "Olot",
        endStation: "Miskin",
        mapCenter: [39.3000, 64.8000],
        mapZoom: 9,
        subdivisions: genBolinmalar(6, 4120, 4210),
    },
    {
        id: 'pch16',
        pchNumber: "PCh-16",
        name: "Qorlitog' Temir Yo'l Masofasi",
        shortName: "Qorlitog' TYM (PCh-16)",
        mtu: "buxoro_mtu",
        region: "Qashqadaryo / Buxoro",
        kmStart: 4020,
        kmEnd: 4303,
        bolinmalarCount: 10,
        startStation: "Navbahor",
        endStation: "Turon",
        mapCenter: [40.4, 62.8],
        mapZoom: 9,
        subdivisions: [
            { id: 'bolinma1', name: "1-bo'linma", manager: 'Rajabov E', km: "4020km pk1 – 4050km pk10" },
            { id: 'bolinma2', name: "2-bo'linma", manager: 'Rustamov A', km: "4051km pk1 – 4083km pk10" },
            { id: 'bolinma3', name: "3-bo'linma", manager: 'Islomov S.', km: "4084km pk1 – 4117km pk10" },
            { id: 'bolinma4', name: "4-bo'linma", manager: 'Atadjanov J.', km: "4118km pk1 – 4150km pk10" },
            { id: 'bolinma5', name: "5-bo'linma", manager: 'Choriyev Y.', km: "4151km pk1 – 4183km pk10" },
            { id: 'bolinma6', name: "6-bo'linma", manager: 'Islomov F.', km: "4184km pk1 – 4205km pk10" },
            { id: 'bolinma7', name: "7-bo'linma", manager: 'Mambetov A', km: "Jayxun" },
            { id: 'bolinma8', name: "8-bo'linma", manager: "Qutimov R.", km: "Dautepa peregon" },
            { id: 'bolinma9', name: "9-bo'linma", manager: 'Kerimov U', km: "4261km pk1 – 4289km pk10" },
            { id: 'bolinma10', name: "10-bo'linma", manager: "Davletov Sh", km: "4290km pk1 – 4303km pk10" },
        ],
    },

    // ╔══════════════════════════════════════════════╗
    // ║          5. QARSHI MTU                       ║
    // ║  PCh-17, PCh-18, PCh-19                      ║
    // ╚══════════════════════════════════════════════╝

    {
        id: 'pch17',
        pchNumber: "PCh-17",
        name: "Qarshi Temir Yo'l Masofasi",
        shortName: "Qarshi TYM (PCh-17)",
        mtu: "qarshi_mtu",
        region: "Qashqadaryo viloyati",
        kmStart: 4303,
        kmEnd: 4430,
        bolinmalarCount: 8,
        startStation: "Turon",
        endStation: "Qarshi",
        mapCenter: [38.8637, 65.7889],
        mapZoom: 9,
        subdivisions: genBolinmalar(8, 4303, 4430),
    },
    {
        id: 'pch18',
        pchNumber: "PCh-18",
        name: "G'uzor Temir Yo'l Masofasi",
        shortName: "G'uzor TYM (PCh-18)",
        mtu: "qarshi_mtu",
        region: "Qashqadaryo / Surxondaryo",
        kmStart: 4430,
        kmEnd: 4540,
        bolinmalarCount: 7,
        startStation: "Qarshi",
        endStation: "G'uzor",
        mapCenter: [38.5000, 66.2500],
        mapZoom: 9,
        subdivisions: genBolinmalar(7, 4430, 4540),
    },
    {
        id: 'pch19',
        pchNumber: "PCh-19",
        name: "Termiz Temir Yo'l Masofasi",
        shortName: "Termiz TYM (PCh-19)",
        mtu: "qarshi_mtu",
        region: "Surxondaryo viloyati",
        kmStart: 4540,
        kmEnd: 4660,
        bolinmalarCount: 8,
        startStation: "G'uzor",
        endStation: "Termiz",
        mapCenter: [37.2242, 67.2783],
        mapZoom: 8,
        subdivisions: genBolinmalar(8, 4540, 4660),
    },

    // ╔══════════════════════════════════════════════╗
    // ║          6. QO'NG'IROT MTU                   ║
    // ║  PCh-20, PCh-21, PCh-22                      ║
    // ╚══════════════════════════════════════════════╝

    {
        id: 'pch20',
        pchNumber: "PCh-20",
        name: "Urgench Temir Yo'l Masofasi",
        shortName: "Urgench TYM (PCh-20)",
        mtu: "qongrot_mtu",
        region: "Xorazm viloyati",
        kmStart: 3880,
        kmEnd: 4030,
        bolinmalarCount: 9,
        startStation: "Buxoro-2",
        endStation: "Urgench",
        mapCenter: [41.5500, 60.6333],
        mapZoom: 8,
        subdivisions: genBolinmalar(9, 3880, 4030),
    },
    {
        id: 'pch21',
        pchNumber: "PCh-21",
        name: "Xiva Temir Yo'l Masofasi",
        shortName: "Xiva TYM (PCh-21)",
        mtu: "qongrot_mtu",
        region: "Xorazm viloyati",
        kmStart: 4030,
        kmEnd: 4135,
        bolinmalarCount: 6,
        startStation: "Urgench",
        endStation: "Xiva",
        mapCenter: [41.3786, 60.3625],
        mapZoom: 9,
        subdivisions: genBolinmalar(6, 4030, 4135),
    },
    {
        id: 'pch22',
        pchNumber: "PCh-22",
        name: "Qo'ng'irot Temir Yo'l Masofasi",
        shortName: "Qo'ng'irot TYM (PCh-22)",
        mtu: "qongrot_mtu",
        region: "Qoraqalpog'iston Respublikasi",
        kmStart: 4135,
        kmEnd: 4370,
        bolinmalarCount: 10,
        startStation: "Xiva",
        endStation: "Qo'ng'irot",
        mapCenter: [43.0800, 58.9000],
        mapZoom: 8,
        subdivisions: genBolinmalar(10, 4135, 4370),
    },

];

// ==========================================
// YORDAMCHI FUNKSIYALAR
// ==========================================

/**
 * Avtomatik bo'linmalar ro'yxati yaratish
 */
function genBolinmalar(count, kmStart, kmEnd) {
    const step = Math.ceil((kmEnd - kmStart) / count);
    const result = [];
    for (let i = 0; i < count; i++) {
        const s = kmStart + i * step;
        const e = Math.min(kmStart + (i + 1) * step, kmEnd);
        result.push({
            id: `bolinma${i + 1}`,
            name: `${i + 1}-bo'linma`,
            manager: '',
            km: `${s}km – ${e}km`
        });
    }
    return result;
}

/**
 * MTU ga qarab masofalar ro'yxatini olish
 */
window.getMasofaByMTU = function (mtuId) {
    return window.MASOFA_LIST.filter(m => m.mtu === mtuId);
};

/**
 * PCh raqami bo'yicha masofa olish
 */
window.getMasofaByPch = function (pchNumber) {
    return window.MASOFA_LIST.find(m => m.pchNumber === pchNumber);
};

// ==========================================
// MASOFA SETUP TIZIMI
// ==========================================

window.getActiveMasofa = function () {
    const saved = localStorage.getItem('active_masofa_id');
    if (!saved) return null;
    return window.MASOFA_LIST.find(m => m.id === saved) || null;
};

window.setActiveMasofa = function (masofaId) {
    localStorage.setItem('active_masofa_id', masofaId);
};

window.resetMasofaSetup = function () {
    if (!confirm("Masofa sozlamasini o'zgartirmoqchimisiz? Tizim qayta yuklanadi.")) return;
    localStorage.removeItem('active_masofa_id');
    location.reload();
};

// ==========================================
// WIZARD (BIRINCHI KIRISH OYNASI)
// ==========================================

window.showMasofaSetupWizard = function () {
    const existing = document.getElementById('masofa-wizard');
    if (existing) existing.remove();

    const mtuColors = {
        toshkent_mtu: "#3498db",
        qoqon_mtu: "#2ecc71",
        samarqand_mtu: "#9b59b6",
        buxoro_mtu: "#f39c12",
        qarshi_mtu: "#e74c3c",
        qongrot_mtu: "#1abc9c",
    };

    const mtuLabels = {
        toshkent_mtu: "Toshkent MTU",
        qoqon_mtu: "Qo'qon MTU",
        samarqand_mtu: "Samarqand MTU",
        buxoro_mtu: "Buxoro MTU",
        qarshi_mtu: "Qarshi MTU",
        qongrot_mtu: "Qo'ng'irot MTU",
    };

    // MTU bo'yicha guruhlash
    const byMtu = {};
    window.MASOFA_LIST.forEach(m => {
        if (!byMtu[m.mtu]) byMtu[m.mtu] = [];
        byMtu[m.mtu].push(m);
    });

    const wizard = document.createElement('div');
    wizard.id = 'masofa-wizard';
    wizard.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: linear-gradient(160deg, #050e1f 0%, #0d2137 50%, #071525 100%);
        z-index: 99999; display: flex; flex-direction: column;
        align-items: center; overflow-y: auto; padding: 30px 20px 60px;
        font-family: 'Segoe UI', sans-serif;
    `;

    wizard.innerHTML = `
        <style>
            .m-card:hover { background: rgba(0,198,255,0.08) !important; border-color: rgba(0,198,255,0.4) !important; transform: translateY(-2px); }
            .m-card { transition: all 0.2s ease; }
            #masofa-search:focus { border-color: rgba(0,198,255,0.5); box-shadow: 0 0 15px rgba(0,198,255,0.1); }
        </style>

        <div style="width:100%; max-width:1200px;">

            <!-- HEADER -->
            <div style="text-align:center; margin-bottom:35px; padding-top:10px;">
                <img src="img/logo.png" alt="Logo" style="width:70px;height:70px;border-radius:50%;object-fit:cover;
                    border:2px solid rgba(255,215,0,0.4); margin-bottom:15px;"
                    onerror="this.style.display='none'">
                <div style="color:#ffd700; font-size:0.8rem; font-weight:600; letter-spacing:3px; margin-bottom:8px;
                    text-transform:uppercase; opacity:0.8;">O'ZBEKISTON TEMIR YO'LLARI AJ</div>
                <h1 style="margin:0; color:white; font-size:1.9rem; font-weight:700; letter-spacing:1px;">
                    SMART PCH — <span style="color:#00c6ff;">Tizim Sozlamasi</span>
                </h1>
                <p style="color:rgba(255,255,255,0.5); margin:10px 0 0 0; font-size:0.95rem;">
                    <i class="fas fa-map-marker-alt" style="color:#00c6ff;"></i>
                    &nbsp;Qaysi temir yo'l masofasi (PCh) uchun ishlashingizni tanlang
                </p>
                <div style="width:60px;height:2px;background:linear-gradient(90deg,transparent,#00c6ff,transparent);margin:18px auto 0;"></div>
            </div>

            <!-- STATISTIKA -->
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:30px;max-width:600px;margin-left:auto;margin-right:auto;">
                <div style="background:rgba(52,152,219,0.1);border:1px solid rgba(52,152,219,0.3);border-radius:12px;padding:15px;text-align:center;">
                    <div style="color:#3498db;font-size:1.5rem;font-weight:700;">${window.MASOFA_LIST.length}</div>
                    <div style="color:rgba(255,255,255,0.5);font-size:0.75rem;">PCh Masofa</div>
                </div>
                <div style="background:rgba(46,204,113,0.1);border:1px solid rgba(46,204,113,0.3);border-radius:12px;padding:15px;text-align:center;">
                    <div style="color:#2ecc71;font-size:1.5rem;font-weight:700;">6</div>
                    <div style="color:rgba(255,255,255,0.5);font-size:0.75rem;">MTU Uzeli</div>
                </div>
                <div style="background:rgba(243,156,18,0.1);border:1px solid rgba(243,156,18,0.3);border-radius:12px;padding:15px;text-align:center;">
                    <div style="color:#f39c12;font-size:1.5rem;font-weight:700;">7500+</div>
                    <div style="color:rgba(255,255,255,0.5);font-size:0.75rem;">km Umumiy</div>
                </div>
            </div>

            <!-- QIDIRUV -->
            <div style="position:relative;max-width:500px;margin:0 auto 30px;">
                <i class="fas fa-search" style="position:absolute;left:15px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.3);"></i>
                <input type="text" id="masofa-search" placeholder="PCh raqami yoki masofa nomi..."
                    oninput="filterMasofaList(this.value)"
                    style="width:100%;padding:13px 15px 13px 45px;background:rgba(255,255,255,0.07);
                    border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:white;
                    font-size:0.95rem;outline:none;box-sizing:border-box;">
            </div>

            <!-- MTU GURUHLARI -->
            <div id="masofa-list-container">
                ${Object.entries(byMtu).map(([mtuId, masofalar]) => `
                    <div class="mtu-group" data-mtu="${mtuId}" style="margin-bottom:35px;">
                        <!-- MTU Sarlavhasi -->
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
                            <div style="width:5px;height:28px;background:${mtuColors[mtuId]};border-radius:3px;flex-shrink:0;"></div>
                            <div>
                                <div style="color:white;font-weight:700;font-size:1rem;">
                                    ${mtuLabels[mtuId]}
                                </div>
                                <div style="color:rgba(255,255,255,0.4);font-size:0.75rem;">
                                    ${masofalar.length} ta PCh masofa
                                </div>
                            </div>
                            <div style="flex:1;height:1px;background:rgba(255,255,255,0.06);margin-left:5px;"></div>
                        </div>

                        <!-- PCh Kartalar Grid -->
                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;">
                            ${masofalar.map(m => `
                                <div class="m-card masofa-card"
                                    data-search="${m.pchNumber.toLowerCase()} ${m.name.toLowerCase()} ${(m.region || '').toLowerCase()}"
                                    onclick="selectMasofa('${m.id}')"
                                    style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
                                    border-radius:12px;padding:15px 18px;cursor:pointer;position:relative;overflow:hidden;">

                                    <!-- Rang chizig'i -->
                                    <div style="position:absolute;top:0;left:0;width:100%;height:2px;background:${mtuColors[mtuId]};opacity:0.6;"></div>

                                    <div style="display:flex;align-items:flex-start;gap:10px;">
                                        <!-- PCh Badge -->
                                        <div style="background:${mtuColors[mtuId]}22;border:1px solid ${mtuColors[mtuId]}55;
                                            border-radius:8px;padding:5px 9px;font-size:0.75rem;font-weight:700;
                                            color:${mtuColors[mtuId]};white-space:nowrap;flex-shrink:0;">
                                            ${m.pchNumber}
                                        </div>
                                        <div style="min-width:0;">
                                            <div style="color:white;font-weight:600;font-size:0.9rem;
                                                overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${m.name}">
                                                ${m.name}
                                            </div>
                                            <div style="color:rgba(255,255,255,0.4);font-size:0.72rem;margin-top:3px;">
                                                <i class="fas fa-map-marker-alt" style="font-size:0.65rem;"></i>
                                                ${m.region || ''}
                                            </div>
                                        </div>
                                    </div>

                                    <div style="display:flex;gap:12px;margin-top:10px;font-size:0.72rem;color:rgba(255,255,255,0.4);">
                                        <span title="Yo'l masofasi">
                                            <i class="fas fa-ruler-horizontal" style="color:${mtuColors[mtuId]};opacity:0.7;"></i>
                                            &nbsp;${m.kmStart}–${m.kmEnd} km
                                        </span>
                                        <span title="Bo'linmalar soni">
                                            <i class="fas fa-layer-group" style="color:${mtuColors[mtuId]};opacity:0.7;"></i>
                                            &nbsp;${m.bolinmalarCount || m.subdivisions.length} bo'linma
                                        </span>
                                        <span title="Stansiyalar" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                                            <i class="fas fa-train" style="color:${mtuColors[mtuId]};opacity:0.7;"></i>
                                            &nbsp;${m.startStation} → ${m.endStation}
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- PASTKI -->
            <div style="text-align:center;padding-top:20px;color:rgba(255,255,255,0.2);font-size:0.78rem;">
                <i class="fas fa-info-circle"></i>
                Agar masofangiz ro'yxatda yo'q bo'lsa yoki ma'lumotlar noto'g'ri bo'lsa, admin paneldan tahrirlash mumkin.
                <br><br>
                <span style="opacity:0.5;">SMART PCH v2.0 | "Temiryo'linfratuzilma" AJ | O'zbekiston Temir Yo'llari AJ</span>
            </div>
        </div>
    `;

    document.body.appendChild(wizard);
};

// ==========================================
// FILTRLASH
// ==========================================
window.filterMasofaList = function (query) {
    const q = query.toLowerCase().trim();
    document.querySelectorAll('.masofa-card').forEach(card => {
        const text = card.getAttribute('data-search') || '';
        card.style.display = (!q || text.includes(q)) ? '' : 'none';
    });
    document.querySelectorAll('.mtu-group').forEach(group => {
        const hasVisible = [...group.querySelectorAll('.masofa-card')].some(c => c.style.display !== 'none');
        group.style.display = hasVisible ? '' : 'none';
    });
};

// ==========================================
// MASOFA TANLASH
// ==========================================
window.selectMasofa = function (masofaId) {
    const masofa = window.MASOFA_LIST.find(m => m.id === masofaId);
    if (!masofa) return;

    const mtuColors = {
        toshkent_mtu: "#3498db", qoqon_mtu: "#2ecc71",
        samarqand_mtu: "#9b59b6", buxoro_mtu: "#f39c12",
        qarshi_mtu: "#e74c3c", qongrot_mtu: "#1abc9c",
    };
    const color = mtuColors[masofa.mtu] || '#00c6ff';

    const wizard = document.getElementById('masofa-wizard');
    if (wizard) {
        wizard.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:white;">
                <div style="background:${color}22;border:2px solid ${color};border-radius:50%;
                    width:90px;height:90px;display:flex;align-items:center;justify-content:center;
                    font-size:2.5rem;margin-bottom:25px;animation:spin-scale 0.5s ease;">
                    <i class="fas fa-check" style="color:${color};"></i>
                </div>
                <div style="font-size:0.8rem;color:${color};font-weight:700;letter-spacing:2px;margin-bottom:8px;">
                    ${masofa.pchNumber}
                </div>
                <h2 style="margin:0 0 8px;color:white;font-size:1.5rem;text-align:center;">${masofa.name}</h2>
                <p style="color:rgba(255,255,255,0.5);margin:0 0 25px;">${masofa.region} • ${masofa.kmStart}–${masofa.kmEnd} km</p>
                <div style="display:flex;align-items:center;gap:12px;color:rgba(255,255,255,0.4);font-size:0.85rem;">
                    <i class="fas fa-spinner fa-spin" style="color:${color};"></i>
                    Tizim sozlanmoqda...
                </div>
            </div>
            <style>
                @keyframes spin-scale { from { transform:scale(0) rotate(-180deg); } to { transform:scale(1) rotate(0deg); } }
            </style>
        `;
    }

    window.setActiveMasofa(masofaId);
    window.applyMasofaConfig(masofa);

    setTimeout(() => {
        if (wizard) wizard.remove();
        const landingPage = document.getElementById('landingPage');
        const loginPage = document.getElementById('loginPage');
        if (landingPage) {
            landingPage.style.display = 'block';
        } else if (loginPage) {
            loginPage.style.display = 'flex';
        }
    }, 1600);
};

// ==========================================
// KONFIGURATSIYANI QULLASH
// ==========================================
window.applyMasofaConfig = function (masofa) {
    if (!masofa) return;
    document.querySelectorAll('.masofa-name').forEach(el => el.textContent = masofa.name.toUpperCase());
    document.querySelectorAll('.masofa-short-name').forEach(el => el.textContent = masofa.shortName);
    document.title = `SMART PCH | ${masofa.shortName}`;
    if (window.CONFIG) {
        window.CONFIG.MASOFA = masofa;
        window.CONFIG.KM_START = masofa.kmStart;
        window.CONFIG.KM_END = masofa.kmEnd;
    }
    window.ACTIVE_MASOFA = masofa;
    console.log(`✅ ${masofa.pchNumber} — ${masofa.name} (${masofa.kmStart}–${masofa.kmEnd} km) sozlandi.`);
};

// ==========================================
// TIZIMNI ISHGA TUSHIRISH
// ==========================================
window.initMasofaSystem = function () {
    const activeMasofa = window.getActiveMasofa();
    const landingPage = document.getElementById('landingPage');
    const loginPage = document.getElementById('loginPage');

    if (!activeMasofa) {
        if (loginPage) loginPage.style.display = 'none';
        if (landingPage) landingPage.style.display = 'none';
        window.showMasofaSetupWizard();
    } else {
        window.applyMasofaConfig(activeMasofa);
        window.ACTIVE_MASOFA = activeMasofa;

        // Check if already logged in - if so, both landing and login should be hidden
        const savedUser = localStorage.getItem('currentUser');
        const token = localStorage.getItem('jwtToken');

        if (savedUser && token) {
            if (landingPage) landingPage.style.display = 'none';
            if (loginPage) loginPage.style.display = 'none';
        } else {
            // Priority: Landing Page -> Login Page
            if (landingPage) {
                landingPage.style.display = 'block';
                if (loginPage) loginPage.style.display = 'none';
            } else if (loginPage) {
                loginPage.style.display = 'flex';
            }
        }
    }
};
