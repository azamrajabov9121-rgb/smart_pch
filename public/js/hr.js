// Open HR Department Homepage Window
window.openHRDepartmentWindow = function () {
    // Create modal
    let modal = document.getElementById('hr-dept-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'hr-dept-modal';
        modal.className = 'department-window';
        modal.innerHTML = `
            <div class="window-header">
                <h2 class="department-name">
                    <i class="fas fa-users"></i> Xodimlar Bo'limi
                </h2>
                <button class="close-btn" onclick="closeHRDepartmentWindow()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="window-content" id="hr-dept-content"></div>
        `;
        document.body.appendChild(modal);
    }

    // Render content
    document.getElementById('hr-dept-content').innerHTML = renderHRDashboard();

    // Show modal
    modal.classList.add('active');
    document.getElementById('department-overlay').classList.add('active');

    // Initialize charts after DOM is ready
    setTimeout(() => {
        if (typeof initHRCharts === 'function') {
            initHRCharts();
        }
    }, 100);
};

// Close HR Department Window
window.closeHRDepartmentWindow = function () {
    const modal = document.getElementById('hr-dept-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    const overlay = document.getElementById('department-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
};

// Initialize HR data from server
async function initHRData() {
    try {
        const employees = await SmartUtils.fetchAPI('/hr/employees');
        if (employees) {
            window.hrData = window.hrData || {};
            window.hrData.employees = employees;

            // Map keys for compatibility (department_id -> department, full_name -> name)
            window.hrData.employees = window.hrData.employees.map(emp => ({
                ...emp,
                name: emp.full_name,
                department: emp.bolinma_id || emp.department_id,
                bolinma: emp.bolinma_id || emp.department_id,
                bolinmaId: emp.bolinma_id || emp.department_id,
                tabelNumber: emp.tabel_number || emp.tabelNumber,
                birthday: emp.birth_date,
                hireDate: emp.hired_date,
                faceTemplate: emp.face_template
            }));

            console.log('✅ HR ma\'lumotlari serverdan yuklandi');
        } else {
            window.hrData = { employees: [], attendance: {}, nextId: 1 };
        }
    } catch (e) {
        console.error('HR ma\'lumotlarini serverdan yuklashda xatolik:', e);
        window.hrData = { employees: [], attendance: {}, nextId: 1 };
    }

    // Attendance data simulation if not exists (keep local for now but could be moved to API later)
    if (!window.hrData.attendance) {
        const attendance = {};
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
            const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const present = Math.floor(Math.random() * 3) + 6;
            attendance[date] = { present: present, absent: 8 - present, leave: 0 };
        }
        window.hrData.attendance = attendance;
    }
}

// Get stats for dashboard cards
function getHRStats(deptId = 'all') {
    initHRData();
    let employees = window.hrData.employees;
    if (deptId !== 'all') {
        employees = employees.filter(emp => emp.department === deptId);
    }
    const today = new Date();
    const thisWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Today's attendance
    const todayKey = today.toISOString().split('T')[0];
    const todayAttendance = window.hrData.attendance[todayKey] || { present: 0, absent: 0 };
    const attendancePercent = employees.length > 0 ? Math.round((todayAttendance.present / employees.length) * 100) : 0;

    // Birthdays this week
    const birthdaysThisWeek = employees.filter(emp => {
        const bday = new Date(emp.birthday);
        const thisYearBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
        return thisYearBday >= today && thisYearBday <= thisWeek;
    });

    // New employees this month
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    const newThisMonth = employees.filter(emp => {
        const hireDate = new Date(emp.hireDate);
        return hireDate.getMonth() === thisMonth && hireDate.getFullYear() === thisYear;
    }).length;

    // Training alerts (Expired or expiring within 15 days)
    const fifteenDays = 15 * 24 * 60 * 60 * 1000;
    const trainingAlerts = employees.filter(emp => {
        // Mock logic for training deadlines, should be replaced with real record checks
        // If employee has no medical date, it's an alert
        if (!emp.medicalCheckupDate) return true;
        const medicalDate = new Date(emp.medicalCheckupDate);
        return medicalDate < new Date(today.getTime() + fifteenDays);
    });

    return {
        totalEmployees: employees.length,
        newThisMonth: newThisMonth,
        attendance: {
            percent: attendancePercent,
            present: todayAttendance.present,
            total: employees.length
        },
        birthdaysThisWeek: birthdaysThisWeek.length,
        birthdayEmployees: birthdaysThisWeek,
        trainingAlerts: trainingAlerts.length,
        alertEmployees: trainingAlerts
    };
}

// Get department distribution for pie chart
function getDepartmentDistribution() {
    initHRData();
    const departments = {};

    window.hrData.employees.forEach(emp => {
        departments[emp.department] = (departments[emp.department] || 0) + 1;
    });

    return departments;
}

// Main HR Dashboard HTML
function renderHRDashboard(deptId = 'all') {
    initHRData();
    const stats = getHRStats(deptId);

    return `
        <style>
            .hr-stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .hr-stat-card {
                background: rgba(15, 23, 42, 0.8);
                border: 2px solid rgba(0, 198, 255, 0.3);
                border-radius: 15px;
                padding: 20px;
                position: relative;
                overflow: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                backdrop-filter: blur(10px);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            }
            .hr-stat-card:hover {
                transform: translateY(-5px);
                border-color: var(--accent-color);
                box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
            }
            .hr-stat-card::after {
                content: '';
                position: absolute;
                top: -50px;
                right: -50px;
                width: 150px;
                height: 150px;
                background: radial-gradient(circle, var(--accent-color) 0%, transparent 70%);
                opacity: 0.1;
                pointer-events: none;
            }
            .hr-stat-icon {
                font-size: 1.8rem;
                width: 54px;
                height: 54px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 12px;
                margin-bottom: 15px;
                transition: transform 0.3s;
            }
            .hr-stat-card:hover .hr-stat-icon {
                transform: scale(1.1);
            }
            .hr-stat-label {
                color: rgba(255, 255, 255, 0.5);
                font-size: 0.9rem;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .hr-stat-value {
                font-size: 2.2rem;
                font-weight: 800;
                color: white;
                margin: 10px 0;
            }
            .hr-stat-badge {
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: bold;
                display: inline-flex;
                align-items: center;
                gap: 5px;
                width: fit-content;
            }
            .hr-main-content {
                display: grid;
                grid-template-columns: 1fr 340px;
                gap: 25px;
                margin-bottom: 25px;
            }
            .employee-table-container {
                background: rgba(15, 23, 42, 0.7);
                border-radius: 24px;
                padding: 25px;
                border: 1px solid rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(15px);
                overflow-x: auto;
                width: 100%;
            }
            .employee-table {
                width: 100%;
                border-collapse: collapse;
                min-width: 900px;
            }
            .premium-row {
                transition: all 0.2s;
                border: 1px solid transparent;
            }
            .premium-row:hover {
                background: rgba(0, 198, 255, 0.03) !important;
                border-color: rgba(0, 198, 255, 0.2);
            }
            .biometric-pill {
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 0.7rem;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 6px;
                text-transform: uppercase;
            }
            .employee-table th {
                text-align: left;
                padding: 12px;
                border-bottom: 2px solid rgba(0,198,255,0.3);
                color: #00c6ff;
                font-weight: 600;
                white-space: nowrap;
            }
            .employee-table td {
                padding: 12px;
                border-bottom: 1px solid rgba(255,255,255,0.05);
                vertical-align: middle;
            }
            .no-wrap {
                white-space: nowrap;
            }
            .employee-table tr:hover {
                background: rgba(0,198,255,0.05);
            }
            .employee-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
            }
            .status-badge {
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 0.85rem;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            .status-active {
                background: rgba(46,204,113,0.2);
                color: #2ecc71;
            }
            .status-leave {
                background: rgba(241,196,15,0.2);
                color: #f1c40f;
            }
            .sidebar-widget {
                background: rgba(15, 23, 42, 0.8);
                border: 2px solid rgba(0, 198, 255, 0.3);
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            }
            .widget-title {
                color: #00c6ff;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 1.1rem;
            }
            .birthday-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px;
                border-radius: 8px;
                background: rgba(255,255,255,0.05);
                margin-bottom: 10px;
            }
            .chart-container {
                background: rgba(15, 23, 42, 0.8);
                border: 2px solid rgba(0, 198, 255, 0.3);
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            }
            .charts-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
                gap: 20px;
            }
            @media (max-width: 1400px) {
                .hr-main-content {
                    grid-template-columns: 1fr;
                }
                .hr-stats-grid {
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                }
            }
            @media (max-width: 768px) {
                .charts-grid {
                    grid-template-columns: 1fr;
                }
                .hr-stats-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
        
        <!-- Stats Cards -->
        <div class="hr-stats-grid">
            <!-- Total Employees -->
            <div class="hr-stat-card" style="--accent-color: #0088ff;">
                <div class="hr-stat-icon" style="background: linear-gradient(135deg, #0088ff, #00c6ff); color: white; box-shadow: 0 4px 15px rgba(0, 136, 255, 0.4);">
                    <i class="fas fa-users-viewfinder"></i>
                </div>
                <div>
                   <div class="hr-stat-label">Xodimlar tarkibi</div>
                   <div class="hr-stat-value">${stats.totalEmployees}</div>
                </div>
                <div class="hr-stat-badge" style="background: rgba(46,204,113,0.15); color: #2ecc71; border: 1px solid rgba(46,204,113,0.2);">
                    <i class="fas fa-arrow-up"></i> +${stats.newThisMonth} yangi
                </div>
            </div>
            
            <!-- Today's Attendance -->
            <div class="hr-stat-card" style="--accent-color: #00f2fe;">
                <div class="hr-stat-icon" style="background: linear-gradient(135deg, #00f2fe, #4facfe); color: white; box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);">
                    <i class="fas fa-fingerprint"></i>
                </div>
                <div>
                    <div class="hr-stat-label">Kunlik Davomat</div>
                    <div class="hr-stat-value">${stats.attendance.percent}%</div>
                </div>
                <div class="hr-stat-badge" style="background: rgba(0,198,255,0.15); color: #00c6ff; border: 1px solid rgba(0,198,255,0.2);">
                    <i class="fas fa-check-circle"></i> ${stats.attendance.present} ishda
                </div>
            </div>
            
            <!-- Birthdays -->
            <div class="hr-stat-card" style="--accent-color: #ff9a9e;">
                <div class="hr-stat-icon" style="background: linear-gradient(135deg, #ff9a9e, #fecfef); color: white; box-shadow: 0 4px 15px rgba(255, 154, 158, 0.4);">
                    <i class="fas fa-cake-candles"></i>
                </div>
                <div>
                    <div class="hr-stat-label">Tug'ilgan Kunlar</div>
                    <div class="hr-stat-value">${stats.birthdaysThisWeek}</div>
                </div>
                <div class="hr-stat-badge" style="background: rgba(243,156,18,0.15); color: #f39c12; border: 1px solid rgba(243,156,18,0.2);">
                    <i class="fas fa-calendar-day"></i> Hafta davomida
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="hr-stat-card" style="--accent-color: #a18cd1; justify-content: flex-start; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <div class="hr-stat-label" style="margin:0">Boshqaruv</div>
                    <div style="color: #a18cd1; font-size: 1.2rem;"><i class="fas fa-shield-halved"></i></div>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button onclick="openExodimImportModal()" style="flex: 1; min-width: 100px; padding: 10px 8px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; border-radius: 10px; cursor: pointer; font-size: 0.75rem; font-weight: bold; transition: 0.2s; white-space: nowrap;">
                        <i class="fas fa-file-import"></i> Yuklash
                    </button>
                    <button onclick="openAddEmployeeModal()" style="flex: 1; min-width: 100px; padding: 10px 8px; background: rgba(155, 89, 182, 0.15); border: 1px solid rgba(155, 89, 182, 0.3); color: #9b59b6; border-radius: 10px; cursor: pointer; font-size: 0.75rem; font-weight: bold; transition: 0.2s; white-space: nowrap;">
                        <i class="fas fa-user-plus"></i> Qo'shish
                    </button>
                </div>
                <button onclick="openTimesheet('${deptId}')" style="width: 100%; padding: 10px; background: linear-gradient(135deg, #4481eb, #04befe); border: none; color: white; border-radius: 10px; cursor: pointer; font-size: 0.8rem; font-weight: bold; box-shadow: 0 4px 15px rgba(68, 129, 235, 0.3);">
                    <i class="fas fa-table-list"></i> Elektron Tabelni ko'rish
                </button>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="hr-main-content">
            <!-- Employee Table -->
            <div class="employee-table-container">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
                    <h3 style="color: #00c6ff; margin: 0; font-size: 1.3rem;">
                        <i class="fas fa-list-ul"></i> Xodimlar Ro'yxati
                    </h3>
                    <div style="display: flex; gap: 10px; flex-grow: 1; justify-content: flex-end; min-width: 300px;">
                        <input type="text" id="hr-search" placeholder="Ism yoki lavozim bo'yicha qidirish..." style="flex-grow: 1; max-width: 400px; padding: 10px 15px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 10px; outline: none; transition: 0.3s;" onfocus="this.style.borderColor='#00c6ff'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'" onkeyup="filterEmployees()">
                        <button onclick="SmartUtils.exportToPDF('employee-table-content', 'Xodimlar_Royxati')" 
                                style="padding: 10px 20px; background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.3); color: #e74c3c; border-radius: 10px; cursor: pointer; transition: 0.2s; white-space: nowrap;">
                            <i class="fas fa-file-pdf"></i> PDF
                        </button>
                    </div>
                </div>
                
                <div id="employee-table-content">
                    ${renderEmployeeTable('', deptId === 'all' ? '' : deptId)}
                </div>
            </div>
            
            <!-- Sidebar Widgets -->
            <div>
                ${renderDepartmentStatsWidget()}
                ${renderTrainingAlertWidget(stats.alertEmployees)}
                ${renderBirthdayWidget(stats.birthdayEmployees)}
                ${renderAttendanceCalendar()}
            </div>
        </div>
        
        <!-- Charts -->
        <div class="charts-grid">
            <div class="chart-container">
                <h3 class="widget-title">
                    <i class="fas fa-chart-pie"></i>
                    Bo'limlar Bo'yicha Taqsimot
                </h3>
                <canvas id="dept-chart" height="250"></canvas>
            </div>
            <div class="chart-container">
                <h3 class="widget-title">
                    <i class="fas fa-chart-line"></i>
                    Oylik Davomat Tendensiyasi
                </h3>
                <canvas id="attendance-chart" height="250"></canvas>
            </div>
        </div>
    `;
}

// Render employee table
function renderEmployeeTable(filterText = '', filterDept = '') {
    initHRData();
    let employees = window.hrData.employees;

    // Apply filters
    if (filterText) {
        employees = employees.filter(emp =>
            emp.name.toLowerCase().includes(filterText.toLowerCase()) ||
            emp.position.toLowerCase().includes(filterText.toLowerCase())
        );
    }
    if (filterDept) {
        console.log('🔍 Filter bo\'lim:', filterDept);
        console.log('📊 Filterlashdan oldin:', employees.length, 'xodim');
        console.log('📋 Mavjud bo\'limlar:', [...new Set(employees.map(e => e.department))]);
        employees = employees.filter(emp => emp.department === filterDept);
        console.log('📊 Filterlashdan keyin:', employees.length, 'xodim');
    }

    if (employees.length === 0) {
        console.log('❌ Xodim topilmadi! Filter:', { filterText, filterDept });
        return '<p style="text-align: center; padding: 40px; color: rgba(255,255,255,0.5);">Xodim topilmadi</p>';
    }

    return `
        <table class="employee-table">
            <thead>
                <tr>
                    <th style="width: 100px;">№ (Tabel)</th>
                    <th style="width: 250px;">Xodim</th>
                    <th>Lavozim</th>
                    <th style="width: 180px;">Bo'lim</th>
                    <th style="width: 130px;">Biometrika</th>
                    <th style="width: 110px;">Holat</th>
                    <th style="width: 130px;">Harakatlar</th>
                </tr>
            </thead>
            <tbody>
                ${employees.map(emp => `
                    <tr class="premium-row">
                        <td class="no-wrap" style="color: #0088ff; font-weight: bold; font-family: 'JetBrains Mono', monospace;">${emp.tabelNumber || emp.tabel_number || '---'}</td>
                        <td class="no-wrap">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div class="employee-avatar" style="background: linear-gradient(135deg, #00c6ff, #0072ff); box-shadow: 0 4px 10px rgba(0, 198, 255, 0.2);">
                                    ${emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                </div>
                                <div style="min-width: 140px;">
                                    <div style="font-weight: 700; color: white; font-size: 0.9rem;">${emp.name}</div>
                                    <div style="font-size: 0.75rem; color: rgba(255,255,255,0.4);"><i class="fas fa-phone-alt" style="font-size: 0.7rem;"></i> ${emp.phone || 'Noma\'lum'}</div>
                                </div>
                            </div>
                        </td>
                        <td style="color: rgba(255,255,255,0.7); font-size: 0.8rem; line-height: 1.2; max-width: 200px; white-space: normal;">${emp.position}</td>
                        <td style="color: rgba(255,255,255,0.6); font-size: 0.8rem;">
                             <span style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); display: inline-block; white-space: normal; max-width: 160px;">
                                ${emp.department}
                             </span>
                        </td>
                        <td class="no-wrap">
                            ${emp.faceTemplate ?
            `<div class="biometric-pill" style="background: rgba(46, 204, 113, 0.1); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.2); padding: 4px 10px;">
                                    <i class="fas fa-face-smile"></i> FAOL
                                 </div>` :
            `<div class="biometric-pill" style="background: rgba(148, 163, 184, 0.05); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.1); padding: 4px 10px;">
                                    <i class="fas fa-face-meh"></i> YO'Q
                                 </div>`}
                        </td>
                        <td class="no-wrap">
                            <span class="status-badge ${emp.status === 'active' ? 'status-active' : 'status-leave'}" style="font-size: 0.7rem; padding: 4px 10px;">
                                <i class="fas ${emp.status === 'active' ? 'fa-check' : 'fa-clock'}"></i> ${emp.status === 'active' ? 'ISHDA' : 'TA\'TIL'}
                            </span>
                        </td>
                        <td class="no-wrap">
                            <div style="display: flex; gap: 6px;">
                                <button onclick="viewEmployeeDetails(${emp.id})" style="background: rgba(0,198,255,0.1); border: 1px solid rgba(0,198,255,0.2); color: #00c6ff; width: 34px; height: 34px; border-radius: 8px; cursor: pointer; transition: 0.2s;">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button onclick="editEmployee(${emp.id})" style="background: rgba(241,196,15,0.1); border: 1px solid rgba(241,196,15,0.2); color: #f1c40f; width: 34px; height: 34px; border-radius: 8px; cursor: pointer; transition: 0.2s;">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteEmployee(${emp.id})" style="background: rgba(231,76,60,0.1); border: 1px solid rgba(231,76,60,0.2); color: #e74c3c; width: 34px; height: 34px; border-radius: 8px; cursor: pointer; transition: 0.2s;">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Filter employees
window.filterEmployees = function () {
    const searchText = document.getElementById('hr-search').value;
    const deptFilter = document.getElementById('hr-dept-filter').value;
    document.getElementById('employee-table-content').innerHTML = renderEmployeeTable(searchText, deptFilter);
};

// Training alert widget
function renderTrainingAlertWidget(alerts) {
    if (alerts.length === 0) {
        return `
            <div class="sidebar-widget" style="border-color: rgba(46, 204, 113, 0.3);">
                <h3 class="widget-title" style="color: #2ecc71;">
                    <i class="fas fa-check-shield"></i>
                    Xavfsizlik Nazorati
                </h3>
                <p style="text-align: center; padding: 20px; color: rgba(46,204,113,0.7); font-weight: 500;">
                    Barcha xodimlar yo'riqnomadan o'tgan
                </p>
            </div>
        `;
    }

    return `
        <div class="sidebar-widget" style="border-color: rgba(231, 76, 60, 0.5); background: rgba(231, 76, 60, 0.05);">
            <h3 class="widget-title" style="color: #e74c3c;">
                <i class="fas fa-exclamation-triangle"></i>
                Muddati Tugagan / Yaqin
            </h3>
            <div style="max-height: 300px; overflow-y: auto; padding-right: 5px;">
                ${alerts.map(emp => `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 8px; background: rgba(231, 76, 60, 0.1); margin-bottom: 10px; border-left: 3px solid #e74c3c;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: white;">${emp.name}</div>
                            <div style="font-size: 0.8rem; color: rgba(231, 76, 60, 0.8);">
                                ${emp.medicalCheckupDate ? `Muddati: ${emp.medicalCheckupDate}` : 'Yo\'riqnoma yo\'q!'}
                            </div>
                        </div>
                        <button onclick="openSafetyTNU19('${emp.department}')" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; font-size: 0.75rem; cursor: pointer;">
                            Imzolatish
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Birthday widget
function renderBirthdayWidget(birthdays) {
    if (birthdays.length === 0) {
        return `
            <div class="sidebar-widget">
                <h3 class="widget-title">
                    <i class="fas fa-birthday-cake"></i>
                    Tug'ilgan Kunlar
                </h3>
                <p style="text-align: center; padding: 20px; color: rgba(255,255,255,0.5);">
                    Bu hafta tug'ilgan kunlar yo'q
                </p>
            </div>
        `;
    }

    return `
        <div class="sidebar-widget">
            <h3 class="widget-title">
                <i class="fas fa-birthday-cake"></i>
                Bu Hafta Tug'ilgan Kunlar
            </h3>
            ${birthdays.map(emp => {
        const bday = new Date(emp.birthday);
        const formatted = bday.toLocaleDateString('uz-UZ', { month: 'long', day: 'numeric' });
        return `
                    <div class="birthday-item">
                        <div class="employee-avatar" style="width: 45px; height: 45px;">
                            ${emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: white;">${emp.name}</div>
                            <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6);">
                                <i class="fas fa-calendar"></i> ${formatted}
                            </div>
                        </div>
                        <div style="font-size: 24px;">🎂</div>
                    </div>
                `;
    }).join('')}
        </div>
    `;
}

// Department Stats Widget
function renderDepartmentStatsWidget() {
    initHRData();
    const dist = getDepartmentDistribution();
    // Sort by name (1-bo'linma, 2-bo'linma, etc.)
    const sortedDepts = Object.keys(dist).sort((a, b) => {
        if (a.includes('bo\'linma') && b.includes('bo\'linma')) {
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        }
        return a.localeCompare(b);
    });

    return `
        <div class="sidebar-widget" style="border-left: 4px solid #00c6ff;">
            <h3 class="widget-title">
                <i class="fas fa-sitemap"></i>
                Bo'linmalar bo'yicha xodimlar
            </h3>
            <div style="display: grid; gap: 8px;">
                ${sortedDepts.map(dept => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background: rgba(0, 198, 255, 0.05); border-radius: 10px; border: 1px solid rgba(0, 198, 255, 0.1); cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='rgba(0, 198, 255, 0.1)'" onmouseout="this.style.background='rgba(0, 198, 255, 0.05)'" onclick="document.getElementById('hr-search').value='${dept}'; window.filterEmployees();">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 8px; height: 8px; border-radius: 50%; background: #00c6ff;"></div>
                            <span style="font-weight: 500; font-size: 0.9rem;">${dept}</span>
                        </div>
                        <div style="background: rgba(0, 198, 255, 0.2); color: #00c6ff; padding: 2px 10px; border-radius: 12px; font-weight: bold; font-size: 0.85rem;">
                            ${dist[dept]}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                <span style="color: rgba(255,255,255,0.5); font-size: 0.85rem;">Jami:</span>
                <span style="color: white; font-weight: bold;">${window.hrData ? window.hrData.employees.length : 0} ta xodim</span>
            </div>
        </div>
    `;
}

// Attendance calendar with navigation
// Global variable for calendar month tracking
if (!window.hrCalendarMonth) {
    window.hrCalendarMonth = new Date();
}

function renderAttendanceCalendar() {
    const calendarDate = new Date(window.hrCalendarMonth);
    const month = calendarDate.getMonth();
    const year = calendarDate.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date();

    const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
    const weekDays = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];

    let calendar = '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; margin-top: 10px;">';

    // Week days header with weekend highlighting
    weekDays.forEach((day, index) => {
        const isWeekend = index === 0 || index === 6; // Yakshanba (0) or Shanba (6)
        calendar += `<div style="text-align: center; font-size: 0.75rem; color: ${isWeekend ? '#e74c3c' : 'rgba(255,255,255,0.5)'}; padding: 5px; font-weight: ${isWeekend ? 'bold' : 'normal'};">${day}</div>`;
    });

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        calendar += '<div></div>';
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const attendance = window.hrData.attendance[date];
        const dayOfWeek = new Date(year, month, day).getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Yakshanba or Shanba
        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

        let bgColor = 'rgba(255,255,255,0.05)';
        if (attendance) {
            const percent = (attendance.present / window.hrData.employees.length) * 100;
            if (percent >= 90) bgColor = 'rgba(46,204,113,0.3)';
            else if (percent >= 70) bgColor = 'rgba(0,198,255,0.2)';
            else bgColor = 'rgba(231,76,60,0.2)';
        }

        calendar += `
            <div style="
                aspect-ratio: 1;
                background: ${bgColor};
                border: ${isToday ? '2px solid #00c6ff' : '1px solid rgba(255,255,255,0.1)'};
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.85rem;
                color: ${isWeekend ? '#e74c3c' : (isToday ? '#00c6ff' : 'white')};
                font-weight: ${isToday || isWeekend ? 'bold' : 'normal'};
            ">
                ${day}
            </div>
        `;
    }

    calendar += '</div>';

    return `
        <div class="sidebar-widget">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <button onclick="changeCalendarMonth(-1)" style="background: rgba(0,198,255,0.2); border: 1px solid rgba(0,198,255,0.4); color: #00c6ff; padding: 8px 12px; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <h3 class="widget-title" style="margin: 0;">
                    <i class="fas fa-calendar-alt"></i>
                    ${monthNames[month]} ${year}
                </h3>
                <button onclick="changeCalendarMonth(1)" style="background: rgba(0,198,255,0.2); border: 1px solid rgba(0,198,255,0.4); color: #00c6ff; padding: 8px 12px; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            ${calendar}
            <div style="display: flex; gap: 15px; margin-top: 15px; font-size: 0.85rem; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="width: 12px; height: 12px; background: rgba(46,204,113,0.3); border-radius: 3px;"></div>
                    <span style="color: rgba(255,255,255,0.7);">90%+</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="width: 12px; height: 12px; background: rgba(0,198,255,0.2); border-radius: 3px;"></div>
                    <span style="color: rgba(255,255,255,0.7);">70-89%</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="width: 12px; height: 12px; background: rgba(231,76,60,0.2); border-radius: 3px;"></div>
                    <span style="color: rgba(255,255,255,0.7);">&lt;70%</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <span style="color: #e74c3c; font-weight: bold;">●</span>
                    <span style="color: rgba(255,255,255,0.7);">Dam olish</span>
                </div>
            </div>
        </div>
    `;
}

// Change calendar month
window.changeCalendarMonth = function (direction) {
    const current = new Date(window.hrCalendarMonth);
    current.setMonth(current.getMonth() + direction);
    window.hrCalendarMonth = current;

    // Re-render the calendar widget
    const widgetContainer = document.querySelector('.sidebar-widget:has(.fa-calendar-alt)');
    if (widgetContainer) {
        widgetContainer.outerHTML = renderAttendanceCalendar();
    }
};

// Initialize charts
window.initHRCharts = function () {
    // Department pie chart
    const deptData = getDepartmentDistribution();
    const deptCtx = document.getElementById('dept-chart');
    if (deptCtx && window.Chart) {
        new Chart(deptCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(deptData),
                datasets: [{
                    data: Object.values(deptData),
                    backgroundColor: [
                        'rgba(243, 156, 18, 0.8)',
                        'rgba(52, 152, 219, 0.8)',
                        'rgba(155, 89, 182, 0.8)',
                        'rgba(46, 204, 113, 0.8)',
                        'rgba(231, 76, 60, 0.8)',
                        'rgba(26, 188, 156, 0.8)',
                        'rgba(241, 196, 15, 0.8)'
                    ],
                    borderWidth: 2,
                    borderColor: '#0f172a'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: 'rgba(255,255,255,0.8)', padding: 15 }
                    }
                }
            }
        });
    }

    // Attendance trends line chart
    const attendanceCtx = document.getElementById('attendance-chart');
    if (attendanceCtx && window.Chart) {
        const today = new Date();
        const labels = [];
        const data = [];

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            labels.push(date.getDate());

            const att = window.hrData.attendance[dateKey];
            if (att) {
                const percent = Math.round((att.present / window.hrData.employees.length) * 100);
                data.push(percent);
            } else {
                data.push(null);
            }
        }

        new Chart(attendanceCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Davomat %',
                    data: data,
                    borderColor: 'rgba(0, 198, 255, 1)',
                    backgroundColor: 'rgba(0, 198, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { color: 'rgba(255,255,255,0.6)' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    x: {
                        ticks: { color: 'rgba(255,255,255,0.6)' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: 'rgba(255,255,255,0.8)' }
                    }
                }
            }
        });
    }
};

window.processExcelData = function (jsonData, detectedColumns) {
    let newCount = 0;
    let errorCount = 0;
    let updatedCount = 0; // Assuming this might be used for future updates

    const employeesToImport = [];

    jsonData.forEach((row, index) => {
        try {
            // Use detected columns or common defaults
            const name = row[detectedColumns.name || 'F.I.SH'] || row['F.I.SH'] || row['Ism'] || row['Name'] || '';
            const position = row[detectedColumns.position || 'Lavozimi'] || row['Lavozimi'] || row['Position'] || '';
            const department = row[detectedColumns.department || 'Bo\'linma'] || row['Bo\'linma'] || row['Department'] || '';

            if (name) {
                employeesToImport.push({
                    full_name: name,
                    position: position,
                    department_id: department
                });
                newCount++;
            }
        } catch (err) {
            console.error(`Xatolik qatorda ${index + 1}:`, err);
            errorCount++;
        }
    });

    if (employeesToImport.length > 0) {
        showToast(`Serverga ${employeesToImport.length} ta xodim yuklanmoqda...`, 'info');

        SmartUtils.fetchAPI('/hr/import-exodim', {
            method: 'POST',
            body: JSON.stringify({ employees: employeesToImport })
        }).then(result => {
            showToast(`${employeesToImport.length} ta xodim muvaffaqiyatli yuklandi!`, 'success');
            initHRData(); // Refresh data
        }).catch(err => {
            console.error('Import error:', err);
            showToast('Yuklashda xatolik yuz berdi', 'error');
        });
    }

    console.log(`=== IMPORT YAKUNLANDI: ${newCount} qo'shildi, ${updatedCount} yangilandi, ${errorCount} xato ===`);
};

// Add employee modal
window.openAddEmployeeModal = function () {
    const modal = document.createElement('div');
    modal.id = 'employee-modal';
    modal.className = 'department-window active';
    modal.style.zIndex = '10001';

    modal.innerHTML = `
        <div class="window-header">
            <h2 class="department-name">
                <i class="fas fa-user-plus"></i> Yangi Xodim Qo'shish
            </h2>
            <button class="close-btn" onclick="closeEmployeeModal()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="window-content" style="padding: 30px; max-height: 70vh; overflow-y: auto;">
            <form id="employee-form" style="display: grid; gap: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-user"></i> Ism Familiya *
                        </label>
                        <input type="text" id="emp-name" required style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-briefcase"></i> Lavozim *
                        </label>
                        <input type="text" id="emp-position" required style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-building"></i> Bo'lim *
                        </label>
                        <select id="emp-department" required style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                            <option value="">Tanlang...</option>
                            <option value="1-bo'linma">1-bo'linma</option>
                            <option value="2-bo'linma">2-bo'linma</option>
                            <option value="3-bo'linma">3-bo'linma</option>
                            <option value="4-bo'linma">4-bo'linma</option>
                            <option value="5-bo'linma">5-bo'linma</option>
                            <option value="6-bo'linma">6-bo'linma</option>
                            <option value="7-bo'linma">7-bo'linma</option>
                            <option value="8-bo'linma">8-bo'linma</option>
                            <option value="9-bo'linma">9-bo'linma</option>
                            <option value="10-bo'linma">10-bo'linma</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-phone"></i> Telefon *
                        </label>
                        <input type="tel" id="emp-phone" required placeholder="+998901234567" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-id-card"></i> Tabel Raqami *
                        </label>
                        <input type="text" id="emp-tabel-number" required placeholder="101" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-heartbeat"></i> Tibbiy Ko'rik Kuni
                        </label>
                        <input type="date" id="emp-medical-date" placeholder="дд.мм.гггг" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-birthday-cake"></i> Tug'ilgan Kun
                        </label>
                        <input type="date" id="emp-birthday" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-calendar-check"></i> Ish Boshlagan Sana
                        </label>
                        <input type="date" id="emp-hire-date" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-plane-departure"></i> Ta'til Boshlanish Sanasi
                        </label>
                        <input type="date" id="emp-vacation-start" onchange="checkVacationStatus()" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-plane-arrival"></i> Ta'til Tugash Sanasi
                        </label>
                        <input type="date" id="emp-vacation-end" onchange="checkVacationStatus()" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                        <i class="fas fa-info-circle"></i> Holat
                        <span style="font-size: 0.75rem; opacity: 0.7; font-weight: normal; margin-left: 8px;">(Ta'til sanalariga qarab avtomatik o'zgaradi)</span>
                    </label>
                    <select id="emp-status" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                        <option value="active">Faol</option>
                        <option value="on_leave">Ta'tilda</option>
                    </select>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 20px;">
                    <button type="button" onclick="closeEmployeeModal()" style="padding: 12px 30px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 8px; cursor: pointer; font-weight: 500;">
                        <i class="fas fa-times"></i> Bekor qilish
                    </button>
                    <button type="submit" style="padding: 12px 30px; background: linear-gradient(135deg, #00c6ff, #0099cc); border: none; color: white; border-radius: 8px; cursor: pointer; font-weight: 500;">
                        <i class="fas fa-save"></i> Saqlash
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('department-overlay').classList.add('active');

    // Form submit handler
    document.getElementById('employee-form').onsubmit = async function (e) {
        e.preventDefault();

        const vacationStart = document.getElementById('emp-vacation-start').value;
        const vacationEnd = document.getElementById('emp-vacation-end').value;
        const today = new Date().toISOString().split('T')[0];

        // Auto-detect vacation status
        let autoStatus = 'active';
        if (vacationStart && vacationEnd) {
            if (today >= vacationStart && today <= vacationEnd) {
                autoStatus = 'on_leave';
            }
        }

        const employeeData = {
            full_name: document.getElementById('emp-name').value,
            position: document.getElementById('emp-position').value,
            department_id: 'pch', // Default or specific
            bolinma_id: document.getElementById('emp-department').value,
            phone: document.getElementById('emp-phone').value,
            rank: '1', // Placeholder or add to form
            birth_date: document.getElementById('emp-birthday').value || today,
            hired_date: document.getElementById('emp-hire-date').value || today,
            status: autoStatus
        };

        try {
            showToast('Saqlanmoqda...', 'info');
            const result = await SmartUtils.fetchAPI('/hr/employees', {
                method: 'POST',
                body: JSON.stringify(employeeData)
            });

            if (result && result.id) {
                showToast('Xodim muvaffaqiyatli qo\'shildi!', 'success');
                closeEmployeeModal();
                await initHRData();
                filterEmployees();
            }
        } catch (error) {
            console.error('Error saving employee:', error);
            showToast('Xatoli: ' + error.message, 'error');
        }
    };

    // Add vacation status checker function
    window.checkVacationStatus = function () {
        const vacationStart = document.getElementById('emp-vacation-start')?.value;
        const vacationEnd = document.getElementById('emp-vacation-end')?.value;
        const statusSelect = document.getElementById('emp-status');

        if (!statusSelect) return;

        if (vacationStart && vacationEnd) {
            const today = new Date().toISOString().split('T')[0];
            if (today >= vacationStart && today <= vacationEnd) {
                statusSelect.value = 'on_leave';
                statusSelect.style.background = 'rgba(255, 193, 7, 0.2)';
            } else {
                statusSelect.value = 'active';
                statusSelect.style.background = 'rgba(0,0,0,0.3)';
            }
        }
    };
};

// View employee details
window.viewEmployeeDetails = function (id) {
    const employee = window.hrData.employees.find(e => e.id === id);
    if (!employee) return;

    const modal = document.createElement('div');
    modal.id = 'employee-details-modal';
    modal.className = 'department-window active';
    modal.style.zIndex = '10100';
    modal.style.maxWidth = '600px';

    modal.innerHTML = `
        <div class="window-header" style="background: linear-gradient(135deg, #00c6ff, #0072ff);">
            <h2 class="department-name">
                <i class="fas fa-user-circle"></i> Xodim Profili
            </h2>
            <button class="close-btn" onclick="document.getElementById('employee-details-modal').remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="window-content" style="padding: 30px; display: flex; gap: 30px;">
            <div style="flex-shrink: 0;">
                <div style="width: 180px; height: 220px; border-radius: 12px; background: #161b22; border: 2px solid #30363d; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    ${employee.faceTemplate ?
            `<img src="${employee.faceTemplate}" style="width: 100%; height: 100%; object-fit: cover;">` :
            `<div style="text-align: center; color: rgba(255,255,255,0.1);">
                            <i class="fas fa-user" style="font-size: 4rem; display: block; margin-bottom: 10px;"></i>
                            <span style="font-size: 0.8rem;">RASM YO'Q</span>
                         </div>`}
                </div>
                ${employee.faceTemplate ?
            `<div style="text-align: center; margin-top: 10px; color: #2ecc71; font-weight: bold; font-size: 0.8rem;">
                        <i class="fas fa-check-double"></i> FACE ID TASDIQLANGAN
                     </div>` : ''}
            </div>

            <div style="flex: 1; display: grid; gap: 15px;">
                <div>
                    <div style="color: rgba(255,255,255,0.4); font-size: 0.8rem; text-transform: uppercase;">Ism Familiya</div>
                    <div style="font-size: 1.2rem; font-weight: bold; color: white;">${employee.name}</div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <div style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">Tabel №</div>
                        <div style="color: #00c6ff; font-family: monospace; font-weight: bold;">${employee.tabelNumber || '---'}</div>
                    </div>
                    <div>
                        <div style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">Holat</div>
                        <div style="color: ${employee.status === 'active' ? '#2ecc71' : '#f1c40f'}; font-weight: bold;">
                            ${employee.status === 'active' ? 'Faol' : 'Ta\'tilda'}
                        </div>
                    </div>
                </div>
                <div>
                    <div style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">Lavozimi</div>
                    <div style="color: rgba(255,255,255,0.9);">${employee.position}</div>
                </div>
                <div>
                    <div style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">Bo'linma</div>
                    <div style="color: rgba(255,255,255,0.9);">${employee.department}</div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <div style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">Telefon</div>
                        <div style="color: rgba(255,255,255,0.9);">${employee.phone || '---'}</div>
                    </div>
                    <div>
                        <div style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">Tug'ilgan kuni</div>
                        <div style="color: rgba(255,255,255,0.9);">${employee.birthday || '---'}</div>
                    </div>
                </div>
            </div>
        </div>
        <div style="padding: 20px; border-top: 1px solid #30363d; display: flex; justify-content: flex-end; background: rgba(0,0,0,0.2);">
            <button onclick="document.getElementById('employee-details-modal').remove()" style="padding: 10px 25px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 8px; cursor: pointer;">
                Yopish
            </button>
        </div>
    `;

    document.body.appendChild(modal);
};

// Edit employee modal
window.editEmployee = function (id) {
    const employee = window.hrData.employees.find(e => e.id === id);
    if (!employee) return;

    const modal = document.createElement('div');
    modal.id = 'employee-modal';
    modal.className = 'department-window active';
    modal.style.zIndex = '10001';

    modal.innerHTML = `
        <div class="window-header">
            <h2 class="department-name">
                <i class="fas fa-edit"></i> Xodim Ma'lumotlarini Tahrirlash
            </h2>
            <button class="close-btn" onclick="closeEmployeeModal()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="window-content" style="padding: 30px; max-height: 70vh; overflow-y: auto;">
            <form id="employee-form" style="display: grid; gap: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-user"></i> Ism Familiya *
                        </label>
                        <input type="text" id="emp-name" value="${employee.name}" required style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-briefcase"></i> Lavozim *
                        </label>
                        <input type="text" id="emp-position" value="${employee.position}" required style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-building"></i> Bo'lim *
                        </label>
                        <select id="emp-department" required style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                            <option value="">Tanlang...</option>
                            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `
                                <option value="${n}-bo'linma" ${employee.department === n + "-bo'linma" ? 'selected' : ''}>${n}-bo'linma</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-phone"></i> Telefon *
                        </label>
                        <input type="tel" id="emp-phone" value="${employee.phone}" required style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-birthday-cake"></i> Tug'ilgan Kun
                        </label>
                        <input type="date" id="emp-birthday" value="${employee.birthday}" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                            <i class="fas fa-calendar-check"></i> Ish Boshlagan Sana
                        </label>
                        <input type="date" id="emp-hire-date" value="${employee.hireDate}" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                    </div>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; color: #00c6ff; font-weight: 500;">
                        <i class="fas fa-info-circle"></i> Holat
                    </label>
                    <select id="emp-status" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,198,255,0.3); color: white; border-radius: 8px;">
                        <option value="active" ${employee.status === 'active' ? 'selected' : ''}>Faol</option>
                        <option value="on_leave" ${employee.status === 'on_leave' ? 'selected' : ''}>Ta'tilda</option>
                    </select>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 20px;">
                    <button type="button" onclick="closeEmployeeModal()" style="padding: 12px 30px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 8px; cursor: pointer; font-weight: 500;">
                        <i class="fas fa-times"></i> Bekor qilish
                    </button>
                    <button type="submit" style="padding: 12px 30px; background: linear-gradient(135deg, #00c6ff, #0099cc); border: none; color: white; border-radius: 8px; cursor: pointer; font-weight: 500;">
                        <i class="fas fa-save"></i> Saqlash
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('department-overlay').classList.add('active');

    // Form submit handler
    document.getElementById('employee-form').onsubmit = async function (e) {
        e.preventDefault();

        const employeeData = {
            full_name: document.getElementById('emp-name').value,
            position: document.getElementById('emp-position').value,
            department_id: 'pch',
            bolinma_id: document.getElementById('emp-department').value,
            phone: document.getElementById('emp-phone').value,
            rank: '1',
            birth_date: document.getElementById('emp-birthday').value,
            hired_date: document.getElementById('emp-hire-date').value,
            status: document.getElementById('emp-status').value
        };

        try {
            showToast('Saqlanmoqda...', 'info');
            await SmartUtils.fetchAPI(`/hr/employees/${id}`, {
                method: 'PUT',
                body: JSON.stringify(employeeData)
            });

            showToast('O\'zgarishlar saqlandi!', 'success');
            closeEmployeeModal();
            await initHRData();
            filterEmployees();
        } catch (error) {
            console.error('Error updating employee:', error);
            showToast('Xatolik: ' + error.message, 'error');
        }
    };
};

// Delete employee
window.deleteEmployee = async function (id) {
    if (confirm('Xodimni o\'chirmoqchimisiz?')) {
        try {
            showToast('O\'chirilmoqda...', 'info');
            await SmartUtils.fetchAPI(`/hr/employees/${id}`, {
                method: 'DELETE'
            });

            showToast('Xodim o\'chirildi!', 'success');
            await initHRData();
            filterEmployees();
        } catch (error) {
            console.error('Error deleting employee:', error);
            showToast('Xatolik: ' + error.message, 'error');
        }
    }
};

// Close employee modal
window.closeEmployeeModal = function () {
    const modal = document.getElementById('employee-modal');
    if (modal) {
        modal.remove();
    }
    const overlay = document.getElementById('department-overlay');
    if (overlay && !document.querySelector('.department-window.active')) {
        overlay.classList.remove('active');
    }
};

// Initialize on load
initHRData();

// Auto-render HR Dashboard for Admin and Xodimlar Bo'limi users ONLY
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        // Check if mainContent area exists and user belongs to Xodimlar department
        const mainContent = document.getElementById('mainContent');
        if (mainContent && typeof currentUser !== 'undefined') {
            // Get user role/type
            const userRole = currentUser.role || currentUser.lavozim || '';
            const userDepts = currentUser.departments || [];

            // Check if user is Admin (PChMG role = Bosh ishchi)
            const isAdmin = userRole === 'PChMG' ||
                userRole === 'admin' ||
                userRole === 'Admin' ||
                currentUser.username === 'PChMG';

            // Check if user is from HR department (Xodimlar bo'limi)
            const isHRDept = userDepts.includes('xodimlar') ||
                userDepts.includes('Xodimlar') ||
                userRole === 'xodimlar' ||
                userRole === 'Xodimlar' ||
                userRole === 'HR';

            // Check if user is a regular bolinma user (should NOT see HR dashboard)
            const isBolinmaUser = userRole.includes('bolinma') ||
                userRole.includes("bo'linma") ||
                /^\d+-bo'linma$/.test(userRole) ||
                (currentUser.bolinmaId && !isAdmin && !isHRDept);

            // Only show HR dashboard for Admin or HR department users, NOT for regular bolinma users
            if ((isAdmin || isHRDept) && !isBolinmaUser) {
                // Create HR Dashboard container
                const hrSection = document.createElement('div');
                hrSection.id = 'hr-homepage-section';
                hrSection.className = 'department-section';
                hrSection.style.padding = '20px';
                hrSection.innerHTML = `
                    <div style="margin-bottom: 20px;">
                        <h2 style="color: #00c6ff; display: flex; align-items: center; gap: 10px; margin: 0;">
                            <i class="fas fa-users"></i>
                            Xodimlar Bo'limi - Boshqaruv Paneli
                        </h2>
                    </div>
                    ${renderHRDashboard()}
                `;

                // Append HR Dashboard (don't clear mainContent, just add section)
                const existingSection = document.getElementById('hr-homepage-section');
                if (!existingSection) {
                    mainContent.appendChild(hrSection);
                }

                // Initialize charts
                setTimeout(() => {
                    if (typeof initHRCharts === 'function') {
                        initHRCharts();
                    }
                }, 200);
            }
        }
    }, 500); // Wait for currentUser to be loaded
});

// E-Xodim Import Modal
window.openExodimImportModal = function () {
    const modal = document.createElement('div');
    modal.id = 'exodim-import-modal';
    modal.className = 'department-window';
    modal.style.cssText = 'z-index: 10050;';

    modal.innerHTML = `
        <div class="window-header" style="background: linear-gradient(135deg, #10b981, #059669);">
            <h2 class="department-name">
                <i class="fas fa-file-excel"></i> E-Xodim Integratsiyasi
            </h2>
            <button class="close-btn" onclick="closeExodimImportModal()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="window-content" style="padding: 30px; max-height: 70vh; overflow-y: auto;">
            <style>
                .import-zone {
                    border: 3px dashed rgba(16, 185, 129, 0.4);
                    border-radius: 16px;
                    padding: 60px 40px;
                    text-align: center;
                    background: rgba(16, 185, 129, 0.05);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-bottom: 30px;
                }
                .import-zone:hover {
                    border-color: #10b981;
                    background: rgba(16, 185, 129, 0.1);
                    transform: translateY(-2px);
                }
                .import-zone.dragover {
                    border-color: #10b981;
                    background: rgba(16, 185, 129, 0.15);
                    transform: scale(1.02);
                }
                .import-icon {
                    font-size: 4rem;
                    color: #10b981;
                    margin-bottom: 20px;
                    animation: bounce 2s infinite;
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .import-instructions {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 12px;
                    padding: 20px;
                    margin-top: 20px;
                    border-left: 4px solid #10b981;
                }
                .import-step {
                    display: flex;
                    align-items: flex-start;
                    gap: 15px;
                    margin-bottom: 15px;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 8px;
                }
                .step-number {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    flex-shrink: 0;
                }
                .import-result {
                    display: none;
                    margin-top: 20px;
                    padding: 20px;
                    border-radius: 12px;
                    background: rgba(16, 185, 129, 0.1);
                    border: 2px solid #10b981;
                }
                .result-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                    margin-top: 15px;
                }
                .result-stat {
                    text-align: center;
                    padding: 15px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 8px;
                }
                .result-stat-value {
                    font-size: 2rem;
                    font-weight: bold;
                    color: #10b981;
                }
                .result-stat-label {
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.7);
                    margin-top: 5px;
                }
            </style>
            
            <div class="import-zone" id="import-drop-zone" onclick="document.getElementById('excel-file-input').click()">
                <div class="import-icon">
                    <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <h3 style="color: #10b981; margin: 0 0 10px 0; font-size: 1.5rem;">Excel Faylni Yuklash</h3>
                <p style="color: rgba(255, 255, 255, 0.7); margin: 0 0 15px 0;">
                    Faylni bu yerga sudrab tashlang yoki bosib tanlang
                </p>
                <p style="color: rgba(255, 255, 255, 0.5); font-size: 0.9rem; margin: 0;">
                    Qo'llab-quvvatlanadigan formatlar: .xlsx, .xls, .csv
                </p>
                <input type="file" id="excel-file-input" accept=".xlsx,.xls,.csv" style="display: none;" onchange="handleExcelFile(this.files[0])">
            </div>
            
            <div class="import-instructions">
                <h4 style="color: #10b981; margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-info-circle"></i> Qanday ishlaydi?
                </h4>
                
                <div class="import-step">
                    <div class="step-number">1</div>
                    <div>
                        <strong style="color: #00c6ff;">E-Xodim tizimiga kiring</strong>
                        <p style="margin: 5px 0 0 0; color: rgba(255, 255, 255, 0.7); font-size: 0.9rem;">
                            E-Xodim platformasiga login qiling
                        </p>
                    </div>
                </div>
                
                <div class="import-step">
                    <div class="step-number">2</div>
                    <div>
                        <strong style="color: #00c6ff;">Xodimlar ro'yxatini yuklab oling</strong>
                        <p style="margin: 5px 0 0 0; color: rgba(255, 255, 255, 0.7); font-size: 0.9rem;">
                            "Export" yoki "Excel ga yuklash" tugmasini bosing
                        </p>
                    </div>
                </div>
                
                <div class="import-step">
                    <div class="step-number">3</div>
                    <div>
                        <strong style="color: #00c6ff;">Faylni bu yerga yuklang</strong>
                        <p style="margin: 5px 0 0 0; color: rgba(255, 255, 255, 0.7); font-size: 0.9rem;">
                            Yuqoridagi maydonga faylni sudrab tashlang yoki tanlang
                        </p>
                    </div>
                </div>
                
                <div class="import-step">
                    <div class="step-number">4</div>
                    <div>
                        <strong style="color: #00c6ff;">Avtomatik import</strong>
                        <p style="margin: 5px 0 0 0; color: rgba(255, 255, 255, 0.7); font-size: 0.9rem;">
                            Tizim avtomatik ravishda barcha xodimlarni bazaga qo'shadi
                        </p>
                    </div>
                </div>
            </div>
            
            <div class="import-result" id="import-result">
                <h4 style="color: #10b981; margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-check-circle"></i> Import Muvaffaqiyatli!
                </h4>
                <div class="result-stats">
                    <div class="result-stat">
                        <div class="result-stat-value" id="result-total">0</div>
                        <div class="result-stat-label">Jami Yuklandi</div>
                    </div>
                    <div class="result-stat">
                        <div class="result-stat-value" id="result-new" style="color: #10b981;">0</div>
                        <div class="result-stat-label">Yangi Qo'shildi</div>
                    </div>
                    <div class="result-stat">
                        <div class="result-stat-value" id="result-updated" style="color: #f59e0b;">0</div>
                        <div class="result-stat-label">Yangilandi</div>
                    </div>
                    <div class="result-stat">
                        <div class="result-stat-value" id="result-errors" style="color: #ef4444;">0</div>
                        <div class="result-stat-label">Xatoliklar</div>
                    </div>
                </div>
                <button onclick="closeExodimImportModal(); filterEmployees();" style="width: 100%; margin-top: 20px; padding: 12px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: white; border-radius: 8px; cursor: pointer; font-weight: bold;">
                    <i class="fas fa-check"></i> Tayyor
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('department-overlay').classList.add('active');
    setTimeout(() => modal.classList.add('active'), 10);

    // Setup drag and drop
    const dropZone = document.getElementById('import-drop-zone');

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleExcelFile(files[0]);
        }
    });
};

window.closeExodimImportModal = function () {
    const modal = document.getElementById('exodim-import-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
    document.getElementById('department-overlay').classList.remove('active');
};

// Handle Excel file processing
window.handleExcelFile = async function (file) {
    if (!file) return;

    // Check file type
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
        alert('Iltimos, to\'g\'ri Excel fayl formatini tanlang (.xlsx, .xls, .csv)');
        return;
    }

    // Show loading
    const dropZone = document.getElementById('import-drop-zone');
    dropZone.innerHTML = `
        <div class="import-icon">
            <i class="fas fa-spinner fa-spin"></i>
        </div>
        <h3 style="color: #10b981; margin: 0;">Fayl o'qilmoqda...</h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin: 10px 0 0 0;">${file.name}</p>
    `;

    try {
        // Read file
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Get first sheet
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                // Process data
                if (jsonData && jsonData.length > 0) {
                    processExcelData(jsonData, file.name);
                } else {
                    throw new Error('Fayl bo\'sh yoki ma\'lumotlar formati noto\'g\'ri');
                }
            } catch (error) {
                console.error('Excel parsing error:', error);
                dropZone.innerHTML = `
                    <div class="import-icon" style="color: #ef4444;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 style="color: #ef4444; margin: 0;">Xatolik: ${error.message}</h3>
                    <p style="color: rgba(255, 255, 255, 0.7); margin: 10px 0 0 0;">Iltimos, faylni tekshirib qaytadan yuklang</p>
                    <button onclick="openExodimImportModal()" style="margin-top:20px; padding:10px 20px; background:#30363d; border:none; color:white; border-radius:5px; cursor:pointer;">Qaytadan urinish</button>
                `;
            }
        };
        reader.readAsArrayBuffer(file);
    } catch (error) {
        console.error('File reading error:', error);
        alert('Faylni o\'qishda xatolik: ' + error.message);
    }
};

// Process Excel data and import employees
window.processExcelData = async function (jsonData, fileName) {
    initHRData();

    // Ask user if they want to clear existing employees
    const shouldClear = confirm(
        `Excel faylda ${jsonData.length} ta xodim bor.\n\n` +
        `✅ OK - Hammasini o'chirib yangi yuklash\n` +
        `❌ Bekor qilish - Qo'shish/Yangilash`
    );

    let newEmployees = [];
    let errorCount = 0;

    jsonData.forEach((row, index) => {
        try {
            const columns = {};
            const keys = Object.keys(row);
            keys.forEach(key => {
                columns[key.toLowerCase().trim()] = row[key];
            });

            // Fuzzy column detection
            let name = '', position = '', department = '', phone = '', tabelNumber = '', birthday = '', hireDate = '', medicalDate = '', vacationStart = '';

            for (let key in columns) {
                const val = columns[key];
                if (val === undefined || val === null) continue;

                const k = key.toLowerCase().trim();
                if (k.includes('ism') || k.includes('f.i.o') || k.includes('ф.и.о') || k.includes('фио') || k.includes('имя')) {
                    name = val.toString().trim();
                } else if (k.includes('lavozim') || k.includes('position') || k.includes('должность')) {
                    position = val.toString().trim();
                } else if ((k.includes('bo') && (k.includes('lim') || k.includes('linma') || k.includes('бўлим') || k.includes('бўлинма'))) || k.includes('отдел') || k.includes('подразделение') || k.includes('sex') || k.includes('сех')) {
                    department = val.toString().trim();
                } else if (k.includes('tel') || k.includes('phone') || k.includes('номер') || k.includes('телефон')) {
                    phone = val.toString().trim();
                } else if (k.includes('tabel') || k.includes('№') || k.includes('ident') || k.includes('id')) {
                    tabelNumber = val.toString().trim();
                } else if (k.includes('tug') || k.includes('birth') || k.includes('рожде')) {
                    birthday = val.toString().trim();
                } else if (k.includes('ish') || k.includes('hire') || k.includes('прием')) {
                    hireDate = val.toString().trim();
                } else if (k.includes('tibbiy') || k.includes('medical') || k.includes('медиц')) {
                    medicalDate = val.toString().trim();
                } else if (k.includes('tatil') || k.includes('ta\'til') || k.includes('vacation') || k.includes('отпуск')) {
                    vacationStart = val.toString().trim();
                }
            }

            if (!name || name.trim() === '') {
                errorCount++;
                return;
            }

            // Normalize department name
            let normalizedDepartment = department || '';
            if (normalizedDepartment) {
                const deptStr = normalizedDepartment.toString().toLowerCase().trim();

                // Use regex for more accurate bo'linma/sex detection
                const boMatch = deptStr.match(/(\d+)\s*(-| )?\s*(bo['`‘’ʻl]inma|бўлинма|bo'lim|bolim|bo‘lim|boʻlim|bo’lim)/i) || deptStr.match(/^(\d+)$/);
                const sexMatch = deptStr.match(/(\d+)\s*(-| )?\s*(sex|сех)/i);

                if (boMatch) {
                    normalizedDepartment = boMatch[1] + "-bo'linma";
                } else if (sexMatch) {
                    normalizedDepartment = sexMatch[1] + "-sex";
                } else if (deptStr.includes('5-tarmoq') || deptStr.includes('kiyakit')) {
                    normalizedDepartment = '5-tarmoq Kiyakit';
                } else if (deptStr.includes('6-tarmoq') || deptStr.includes('qorlitog')) {
                    normalizedDepartment = '6-tarmoq Qorlitog\'';
                } else if (deptStr.includes('dispetcher')) {
                    normalizedDepartment = 'Dispetcher';
                } else if (deptStr.includes('buxgalter') || deptStr.includes('iqtisod')) {
                    normalizedDepartment = 'Buxgalteriya';
                } else if (deptStr.includes('xodim') || deptStr.includes('kadr')) {
                    normalizedDepartment = 'Xodimlar';
                } else if (deptStr.includes('xavfsizlik')) {
                    normalizedDepartment = 'Xavfsizlik';
                }
            }

            newEmployees.push({
                name,
                position: position || 'Xodim',
                department: normalizedDepartment || 'Noma\'lum',
                phone: phone || '',
                tabelNumber: tabelNumber || '',
                birthday: birthday || '',
                hireDate: hireDate || '',
                medicalDate: medicalDate || '',
                vacationStart: vacationStart || '',
                status: 'active'
            });
        } catch (error) {
            console.error('Row error:', error);
            errorCount++;
        }
    });

    try {
        const response = await SmartUtils.fetchAPI('/hr/import-exodim', {
            method: 'POST',
            body: JSON.stringify({
                employees: newEmployees,
                clearFirst: shouldClear
            })
        });

        if (response) {
            // Update display
            const resultTotal = document.getElementById('result-total');
            if (resultTotal) resultTotal.innerText = jsonData.length;
            const resultNew = document.getElementById('result-new');
            if (resultNew) resultNew.innerText = newEmployees.length;
            const resultErrors = document.getElementById('result-errors');
            if (resultErrors) resultErrors.innerText = errorCount;

            const importResult = document.getElementById('import-result');
            if (importResult) importResult.style.display = 'block';
            const importInstructions = document.querySelector('.import-instructions');
            if (importInstructions) importInstructions.style.display = 'none';
            const importZone = document.getElementById('import-drop-zone');
            if (importZone) importZone.style.display = 'none';

            // Reload data
            await initHRData();
            if (typeof filterEmployees === 'function') filterEmployees();
        }
    } catch (e) {
        console.error('Import failed:', e);
        alert('Importda xatolik yuz berdi!');
    }
};

// End of HR module
console.log('✅ HR Module Loaded');
