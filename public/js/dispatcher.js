(function () {
    // SMART PCH - Dispatcher Module (v12.0) - Royal Glass Edition
    // Premium Dark UI for Subdivisions and Dispatchers

    window.initDispatcherData = initDispatcherData;
    window.getDispatcherDashboardHTML = getDispatcherDashboardHTML;
    window.renderSubdivisionReportSendView = renderSubdivisionReportSendView;
    window.refreshDispatcherData = refreshDispatcherData;
    window.submitDetailedReport = submitDetailedReport;

    window.subdivisionReports = window.subdivisionReports || {};
    let subdivisionReports = window.subdivisionReports;
    let recentReports = [];

    const subdivisions = window.subdivisions || [
        { id: 'bolinma1', name: '1-bo\'linma', manager: 'Rajabov E.' },
        { id: 'bolinma2', name: '2-bo\'linma', manager: 'Roziyev A.' },
        { id: 'bolinma3', name: '3-bo\'linma', manager: 'Islomov S.' },
        { id: 'bolinma4', name: '4-bo\'linma', manager: 'Atadjanov J.' },
        { id: 'bolinma5', name: '5-bo\'linma', manager: 'Choriyev Y.' },
        { id: 'bolinma6', name: '6-bo\'linma', manager: 'Islomov F.' },
        { id: 'bolinma7', name: '7-bo\'linma', manager: 'Mambetov A.' },
        { id: 'bolinma8', name: '8-bo\'linma', manager: 'Qutimov R.' },
        { id: 'bolinma9', name: '9-bo\'linma', manager: 'Kerimov U.' },
        { id: 'bolinma10', name: '10-bo\'linma', manager: 'Davletov Sh.' }
    ];

    async function initDispatcherData() {
        try {
            const reports = await SmartUtils.fetchAPI('/reports/today') || [];
            for (let key in window.subdivisionReports) { delete window.subdivisionReports[key]; }
            reports.forEach(r => { window.subdivisionReports[r.bolinma_id] = r; });
            recentReports = await SmartUtils.fetchAPI('/reports/history') || [];
        } catch (e) { console.error("Data error:", e); }
    }

    function getDispatcherDashboardHTML() {
        if (!window.currentUser) {
            const saved = localStorage.getItem('currentUser');
            if (saved) window.currentUser = JSON.parse(saved);
        }
        if (!window.currentUser) return '<div style="padding:40px; text-align:center; color:#fff;">Tizimga kirilmagan.</div>';

        const isDispatcher = window.currentUser.role === 'admin' || (window.currentUser.departments && window.currentUser.departments.includes('dispetcher'));

        // If user is admin/dispatcher, they ONLY see the monitoring list
        if (isDispatcher) {
            return renderDispatcherListView();
        }

        // ONLY 'bolinma' role can see and use the report sending form
        if (window.currentUser.role === 'bolinma') {
            const bid = window.currentUser.bolinmalar?.[0];
            if (!bid) return '<div style="padding:40px; text-align:center; color:#fff;">Sizga biriktirilgan bo\'linma topilmadi.</div>';
            return renderSubdivisionReportSendView(bid);
        }

        return '<div style="padding:40px; text-align:center; color:#64748b;">Hisobot yuborish uchun huquqingiz yetarli emas.</div>';
    }

    /**
     * DISPATCHER (ADMIN) VIEW
     */
    function renderDispatcherListView() {
        const today = new Date().toLocaleDateString('uz-UZ');
        return `
        <div style="padding: 40px; font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #f0f7ff 0%, #e0e7ff 100%); min-height: 100vh; color: #f8fafc; width: 100%; box-sizing: border-box;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: rgba(255,255,255,0.7); padding: 30px; border-radius: 24px; border: 1px solid rgba(212, 175, 55, 0.3); backdrop-filter: blur(15px); box-shadow: 0 10px 30px rgba(31, 38, 135, 0.07); width: 100%; box-sizing: border-box;">
                <div>
                    <h1 style="margin: 0; font-size: 2.2rem; font-weight: 900; color: #f8fafc; letter-spacing: -1px;">DISPETCHERLIK <span style="color: #d4af37;">PANELI</span></h1>
                    <p style="margin: 8px 0 0 0; color: #64748b; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-calendar-alt" style="color: #d4af37;"></i> ${today} &bull; Jonli monitoring
                    </p>
                </div>
                <button onclick="refreshDispatcherData()" style="padding: 14px 30px; background: linear-gradient(135deg, #d4af37, #b8860b); color: #fff; border: none; border-radius: 16px; cursor: pointer; font-weight: 800; display: flex; align-items: center; gap: 10px; transition: 0.3s; box-shadow: 0 10px 25px rgba(212, 175, 55, 0.3);">
                    <i class="fas fa-sync-alt"></i> YANGILASH
                </button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 30px;">
                ${subdivisions.map(sub => {
            const r = subdivisionReports[sub.id];
            return `
                    <div style="background: rgba(255,255,255,0.6); border: 1.5px solid ${r ? 'rgba(212, 175, 55, 0.4)' : 'rgba(31, 38, 135, 0.05)'}; border-radius: 32px; padding: 35px; backdrop-filter: blur(20px); transition: all 0.4s ease; position: relative; overflow: hidden; box-shadow: 0 8px 32px rgba(31, 38, 135, 0.05);"
                         onmouseover="this.style.transform='translateY(-8px)'; this.style.borderColor='rgba(212, 175, 55, 0.6)'; this.style.boxShadow='0 12px 40px rgba(212, 175, 55, 0.15)'"
                         onmouseout="this.style.transform='none'; this.style.borderColor='${r ? 'rgba(212, 175, 55, 0.4)' : 'rgba(31, 38, 135, 0.05)'}'; this.style.boxShadow='0 8px 32px rgba(31, 38, 135, 0.05)'">
                        
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;">
                            <div>
                                <h3 style="margin: 0; font-size: 1.4rem; font-weight: 900; color: #f8fafc;">${sub.name}</h3>
                                <div style="color: #b8860b; font-size: 0.9rem; font-weight: 700; margin-top: 6px; display: flex; align-items: center; gap: 6px;">
                                    <i class="fas fa-user-tie" style="font-size: 0.8rem;"></i> ${sub.manager}
                                </div>
                            </div>
                            <div style="background: ${r ? 'rgba(212, 175, 55, 0.1)' : 'rgba(245, 158, 11, 0.05)'}; color: ${r ? '#b8860b' : '#64748b'}; padding: 8px 16px; border-radius: 14px; font-weight: 800; font-size: 0.75rem; border: 1px solid ${r ? 'rgba(212, 175, 55, 0.3)' : 'rgba(245, 158, 11, 0.1)'}; text-transform: uppercase; letter-spacing: 0.5px;">
                                ${r ? 'Yuborildi' : 'Kutilmoqda'}
                            </div>
                        </div>

                        <div style="min-height: 100px; padding: 22px; background: rgba(255,255,255,0.4); border-radius: 20px; border: 1px solid rgba(31, 38, 135, 0.08); margin-bottom: 25px; color: #334155; font-size: 1.05rem; line-height: 1.6; font-weight: 500; border-left: 4px solid ${r ? '#d4af37' : 'rgba(31, 38, 135, 0.1)'};">
                            ${r ? r.content : '<span style="color:rgba(148, 163, 184, 0.6); font-style:italic;">Ma\'lumot kiritilmagan...</span>'}
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 700; color: #64748b;">
                            <span style="display: flex; align-items: center; gap: 6px;">
                                <i class="far fa-clock" style="color: #d4af37;"></i> ${r ? r.time : '--:--'}
                            </span>
                            ${r ? `<span style="color: #b8860b; display: flex; align-items: center; gap: 6px;">TASDIQLANGAN <i class="fas fa-check-circle"></i></span>` : ''}
                        </div>
                    </div>
                    `;
        }).join('')}
            </div>
        </div>`;
    }

    /**
     * SUBDIVISION (BOLINMA) FORM - PREMIUM ROYAL DARK
     */
    function renderSubdivisionReportSendView(bolinmaId) {
        const report = subdivisionReports[bolinmaId] || {};
        const data = report.structuredData || {};
        const today = new Date().toLocaleDateString('uz-UZ');
        const bolinmaNum = bolinmaId.replace('bolinma', '');

        let workerOptions = '<option value="">Hodimni tanlang...</option>';
        try {
            const allEmp = JSON.parse(localStorage.getItem('employeeData')) || [];
            allEmp.filter(e => (e.department?.includes(bolinmaId)) || (e.bolinma == bolinmaNum)).forEach(emp => {
                workerOptions += `<option value="${emp.name || emp.fullName}">${emp.name || emp.fullName}</option>`;
            });
        } catch (e) { }

        const obxodData = data.obxodchilar || [];

        return `
        <div style="padding: 0; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; align-items: center; background: #0f172a; min-height: 100vh; color: #f8fafc; width: 100%; box-sizing: border-box;">
            
            <div style="width: 100%; background: #0f172a; border-radius: 0; box-shadow: none; overflow: hidden; border: none;">
                
                <!-- Premium Glass Header -->
                <div style="padding: 50px 60px; background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(37, 99, 235, 0.05)); border-bottom: 1px solid rgba(212, 175, 55, 0.15); display: flex; justify-content: space-between; align-items: center; position: relative;">
                    <div>
                        <h1 style="margin: 0; color: #f8fafc; font-size: 2.5rem; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">Kunlik Raport</h1>
                        <div style="margin-top: 15px; display: flex; align-items: center; gap: 15px;">
                            <span style="background: rgba(212, 175, 55, 0.15); color: #b8860b; padding: 7px 18px; border-radius: 14px; font-weight: 800; font-size: 0.95rem; border: 1px solid rgba(212, 175, 55, 0.3); text-shadow: 0 0 5px rgba(212, 175, 55, 0.2);">${bolinmaNum}-BO'LINMA</span>
                            <span style="color: #64748b; font-weight: 600; font-size: 1.1rem;">&bull; ${today}</span>
                        </div>
                    </div>
                    <div style="width: 72px; height: 72px; background: rgba(212, 175, 55, 0.1); border-radius: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(212, 175, 55, 0.3); box-shadow: 0 0 20px rgba(212, 175, 55, 0.15); animation: pulse-gold 2s infinite;">
                        <i class="fas fa-file-export" style="color: #d4af37; font-size: 2rem;"></i>
                    </div>
                </div>

                <div style="padding: 50px 60px; display: flex; flex-direction: column; gap: 40px;">
                    
                    <!-- WORK AREA - LIGHT GLASS STYLE -->
                    <div style="background: rgba(255,255,255,0.5); border: 1px solid rgba(31, 38, 135, 0.1); border-radius: 35px; padding: 40px; transition: 0.3s; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
                        <label style="display: flex; align-items: center; gap: 12px; font-weight: 800; color: #b8860b; font-size: 1.1rem; margin-bottom: 25px; text-transform: uppercase; letter-spacing: 1px;">
                            <i class="fas fa-tools"></i> Bajarilgan ishlar (KM va PK)
                        </label>
                        <textarea id="report-work-plan" placeholder="Bugun bajarilgan ishlar tafsilotini va aniq koordinatlarini (KM, PK) kiriting..." 
                            style="width: 100%; min-height: 200px; background: rgba(31, 38, 135, 0.03); border: 2px solid rgba(31, 38, 135, 0.08); border-radius: 28px; padding: 30px; font-size: 1.25rem; color: #f8fafc; line-height: 1.7; outline: none; transition: 0.4s; box-sizing: border-box; font-weight: 400; resize: none;" 
                            onfocus="this.style.borderColor='#d4af37'; this.style.boxShadow='0 0 20px rgba(212,175,55,0.1)'"
                            onblur="this.style.borderColor='rgba(31, 38, 135, 0.08)'; this.style.boxShadow='none'"
                        >${data.workPlan || ''}</textarea>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                        <div style="background: rgba(255,255,255,0.5); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 30px; padding: 30px; transition: 0.3s; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
                            <label style="display: block; font-weight: 800; color: #d4af37; font-size: 0.9rem; margin-bottom: 15px; text-transform: uppercase;"><i class="fas fa-bolt" style="margin-right:8px;"></i> Ogohlantirish</label>
                            <input id="report-warning" value="${data.warning || ''}" placeholder="Xavfli nuqtalar bormi?" 
                                style="width: 100%; background: rgba(15, 23, 42, 0.7); color: #fff; border: 1.5px solid rgba(212, 175, 55, 0.15); border-radius: 16px; padding: 18px 22px; font-weight: 500; color: #f8fafc; font-size: 1.1rem; outline: none; transition: 0.3s;"
                                onfocus="this.style.borderColor='#d4af37'; this.style.background='rgba(212,175,55,0.02)'">
                        </div>
                        <div style="background: rgba(255,255,255,0.5); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 30px; padding: 30px; transition: 0.3s; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
                            <label style="display: block; font-weight: 800; color: #ffd700; font-size: 0.9rem; margin-bottom: 15px; text-transform: uppercase;"><i class="fas fa-file-alt" style="margin-right:8px;"></i> Zayavka / Ariza</label>
                            <input id="report-zayavka" value="${data.zayavka || ''}" placeholder="Hujjat raqami..." 
                                style="width: 100%; background: rgba(15, 23, 42, 0.7); color: #fff; border: 1.5px solid rgba(37, 99, 235, 0.15); border-radius: 16px; padding: 18px 22px; font-weight: 500; color: #f8fafc; font-size: 1.1rem; outline: none; transition: 0.3s;"
                                onfocus="this.style.borderColor='#2563eb'; this.style.background='rgba(37,99,235,0.02)'">
                        </div>
                    </div>

                    <!-- OBXOD TABLE - LIGHT GOLD INTERFACE -->
                    <div style="background: rgba(255,255,255,0.5); border-radius: 40px; padding: 40px; border: 1px solid rgba(31, 38, 135, 0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 35px; border-bottom: 1px solid rgba(31, 38, 135, 0.1); padding-bottom: 25px;">
                            <h3 style="margin: 0; font-size: 1.5rem; font-weight: 900; color: #f8fafc; text-transform: uppercase; display: flex; align-items: center; gap: 15px;">
                                <i class="fas fa-walking" style="color: #b8860b;"></i> Yo'l Obxodi Monitoringi
                            </h3>
                            <button onclick="addObxodRow('${bolinmaId}')" style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.25)); color: #b8860b; border: 1px solid rgba(212, 175, 55, 0.3); padding: 14px 32px; border-radius: 18px; font-weight: 800; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 20px rgba(212,175,55,0.1);"
                                onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                <i class="fas fa-user-plus"></i> QATOR QO'SHISH
                            </button>
                        </div>
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: separate; border-spacing: 0 16px;">
                                <thead>
                                    <tr style="color: #64748b; font-size: 0.85rem; text-transform: uppercase; font-weight: 900; letter-spacing: 1.5px;">
                                        <th style="padding: 0 10px; text-align: left;">Insepktor / Mas'ul</th>
                                        <th style="padding: 0 10px; width: 110px; text-align: center;">Dan (KM)</th>
                                        <th style="padding: 0 10px; width: 110px; text-align: center;">Gacha (KM)</th>
                                        <th style="padding: 0 10px; width: 100px; text-align: center;">Kamch.</th>
                                        <th style="padding: 0 10px; width: 100px; text-align: center;">B-f.</th>
                                    </tr>
                                </thead>
                                <tbody id="obxod-table-body">
                                    ${(obxodData.length > 0 ? obxodData : [{}]).map(ob => `
                                        <tr>
                                            <td style="padding-right: 15px;"><select class="obxod-name" style="width: 100%; background: rgba(15, 23, 42, 0.7); color: #fff; border: 1.5px solid rgba(31, 38, 135, 0.1); padding: 16px; border-radius: 20px; font-weight: 600; color: #f8fafc; outline: none; transition: 0.3s; cursor: pointer; font-size:1rem;">${workerOptions.replace(`value="${ob.name}"`, `value="${ob.name}" selected`)}</select></td>
                                            <td style="padding-right: 12px;"><input class="obxod-km-from" value="${ob.kmFrom || ''}" placeholder="0" style="width: 100%; background: rgba(15, 23, 42, 0.7); color: #fff; border: 1.5px solid rgba(31, 38, 135, 0.1); padding: 16px; border-radius: 20px; text-align: center; font-weight: 900; color:#f8fafc; outline: none; font-size: 1.1rem;"></td>
                                            <td style="padding-right: 12px;"><input class="obxod-km-to" value="${ob.kmTo || ''}" placeholder="0" style="width: 100%; background: rgba(15, 23, 42, 0.7); color: #fff; border: 1.5px solid rgba(31, 38, 135, 0.1); padding: 16px; border-radius: 20px; text-align: center; font-weight: 900; color:#f8fafc; outline: none; font-size: 1.1rem;"></td>
                                            <td style="padding-right: 12px;"><input class="obxod-kamchilik" type="number" value="${ob.kamchilik || '0'}" style="width: 100%; background: rgba(245,158,11,0.1); border: 1.5px solid rgba(245,158,11,0.3); padding: 16px; border-radius: 20px; text-align: center; font-weight: 900; color: #b45309; outline: none; font-size: 1.2rem;"></td>
                                            <td><input class="obxod-bartaraf" type="number" value="${ob.bartaraf || '0'}" style="width: 100%; background: rgba(16,185,129,0.1); border: 1.5px solid rgba(16,185,129,0.3); padding: 16px; border-radius: 20px; text-align: center; font-weight: 900; color: #059669; outline: none; font-size: 1.2rem;"></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- MECHANISMS - LIGHT BLUE GRID -->
                    <div style="background: rgba(255,255,255,0.5); border: 1px solid rgba(31, 38, 135, 0.1); border-radius: 40px; padding: 45px; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
                        <h3 style="margin: 0 0 35px 0; font-size: 1.3rem; font-weight: 900; color: #f8fafc; display: flex; align-items: center; gap: 15px; text-transform: uppercase;">
                            <i class="fas fa-microchip" style="color: #ffd700;"></i> Kichik Mexanizmlar Hisobi
                        </h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(145px, 1fr)); gap: 25px;">
                            ${['AG-B', 'RM-80', 'Svarka', 'DGP-10', 'EShP', 'Yekka'].map(tool => {
            const toolData = (data.tools && data.tools[tool]) || {};
            return `
                                    <div style="background: rgba(15, 23, 42, 0.7); color: #fff; border: 1px solid rgba(31,38,135,0.1); border-radius: 28px; padding: 25px; text-align: center; transition: 0.3s; position: relative; overflow: hidden; box-shadow: 0 4px 15px rgba(31, 38, 135, 0.05);" onmouseover="this.style.borderColor='rgba(212, 175, 55, 0.5)'; this.style.transform='translateY(-10px)'" onmouseout="this.style.borderColor='rgba(31,38,135,0.1)'; this.style.transform='none'">
                                        <div style="font-weight: 900; font-size: 0.9rem; color: #ffd700; margin-bottom: 22px; border-bottom: 2px solid rgba(31, 38, 135, 0.05); padding-bottom: 10px; letter-spacing: 1px;">${tool}</div>
                                        <div style="display: flex; flex-direction: column; gap: 18px;">
                                            <div style="display: flex; flex-direction: column; gap: 6px;">
                                                <span style="font-size: 0.65rem; color: #64748b; font-weight: 800;">SONI</span>
                                                <input class="tool-count" data-tool="${tool}" value="${toolData.count || ''}" style="width: 100%; border: 1.5px solid rgba(31,38,135,0.1); border-radius: 12px; padding: 8px; text-align: center; font-weight: 900; color: #f8fafc; background: rgba(31, 38, 135, 0.03); font-size: 1rem;">
                                            </div>
                                            <div style="display: flex; flex-direction: column; gap: 6px;">
                                                <span style="font-size: 0.65rem; color: #64748b; font-weight: 800;">SOAT</span>
                                                <input class="tool-time" data-tool="${tool}" value="${toolData.time || ''}" style="width: 100%; border: 1.5px solid rgba(31,38,135,0.1); border-radius: 12px; padding: 8px; text-align: center; font-weight: 900; color: #f8fafc; background: rgba(31, 38, 135, 0.03); font-size: 1rem;">
                                            </div>
                                            <div style="display: flex; flex-direction: column; gap: 6px;">
                                                <span style="font-size: 0.65rem; color: #64748b; font-weight: 800;">YONILG'I</span>
                                                <input class="tool-fuel" data-tool="${tool}" value="${toolData.fuel || ''}" style="width: 100%; border: 1.5px solid rgba(31,38,135,0.1); border-radius: 12px; padding: 8px; text-align: center; font-weight: 900; color: #f8fafc; background: rgba(31, 38, 135, 0.03); font-size: 1rem;">
                                            </div>
                                        </div>
                                    </div>
                                `;
        }).join('')}
                        </div>
                    </div>

                    <!-- REVOLUTIONARY SUBMIT BUTTON -->
                    <div style="margin-top: 15px;">
                        <button onclick="submitDetailedReport('${bolinmaId}')" 
                            style="width: 100%; padding: 32px; background: linear-gradient(135deg, #38bdf8, #8b5cf6); color: #fff; border: none; border-radius: 40px; cursor: pointer; font-weight: 950; font-size: 1.6rem; box-shadow: 0 30px 60px rgba(56,189,248,0.4); transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: flex; align-items: center; justify-content: center; gap: 20px; letter-spacing: 2px; text-transform: uppercase;"
                            onmouseover="this.style.transform='translateY(-10px) scale(1.02)'; this.style.boxShadow='0 40px 80px rgba(56,189,248,0.6)'"
                            onmouseout="this.style.transform='none'; this.style.boxShadow='0 30px 60px rgba(56,189,248,0.4)'"
                        >
                            <i class="fas fa-paper-plane" style="font-size: 1.8rem;"></i> TASDIQLASH VA YUBORISH
                        </button>
                    </div>
                </div>
            </div>

            <!-- HISTORY SECTION - LIGHT THEME -->
            <div style="width: 95%; max-width: 1600px; margin-top: 100px;">
                <h2 style="color: #f8fafc; font-size: 1.8rem; font-weight: 950; margin-bottom: 45px; display: flex; align-items: center; gap: 20px; text-transform: uppercase;">
                    <span style="height: 3px; width: 60px; background: #38bdf8; border-radius: 2px;"></span>
                    OXIRGI TOPHIRILGAN RAPORTLAR
                </h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px;">
                    ${recentReports.filter(r => r.bolinma_id === bolinmaId).slice(0, 3).map(r => `
                        <div style="background: rgba(30, 41, 59, 0.4); padding: 40px; border-radius: 35px; border: 1px solid rgba(31, 38, 135, 0.08); shadow: 0 10px 30px rgba(0,0,0,0.02); transition: all 0.4s ease-out; position: relative; overflow: hidden;"
                             onmouseover="this.style.background='#f0f7ff'; this.style.transform='translateY(-15px)'; this.style.borderColor='rgba(37, 99, 235, 0.3)'"
                             onmouseout="this.style.background='#ffffff'; this.style.transform='none'; this.style.borderColor='rgba(31, 38, 135, 0.08)'">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                                <span style="background: rgba(37, 99, 235, 0.1); color: #ffd700; padding: 7px 16px; border-radius: 12px; font-weight: 800; font-size: 0.85rem; border: 1px solid rgba(37, 99, 235, 0.2);"><i class="far fa-calendar-check" style="margin-right:8px;"></i>${r.date}</span>
                                <span style="color: #64748b; font-weight: 700; font-size: 0.9rem;">${r.time}</span>
                            </div>
                            <div style="color: #f8fafc; font-size: 1.1rem; font-weight: 600; line-height: 1.7; border-left: 4px solid #d4af37; padding-left: 20px;">${r.content}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Hidden inputs for legacy support -->
            <input id="report-km-start" value="" type="hidden">
            <input id="report-km-end" value="" type="hidden">
            <input id="report-workforce-in" value="0" type="hidden">
            <input id="report-workforce-out" value="0" type="hidden">

            <style>
                @keyframes pulse-blue {
                    0% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.4); }
                    70% { box-shadow: 0 0 0 20px rgba(56, 189, 248, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
                }
                select option { background: #0f172a; color: #fff; }
                input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
            </style>
        </div>`;
    }

    async function submitDetailedReport(bolinmaId) {
        const workPlan = document.getElementById('report-work-plan')?.value || '';
        const warning = document.getElementById('report-warning')?.value || '';
        const zayavka = document.getElementById('report-zayavka')?.value || '';

        const obxodchilar = [];
        document.querySelectorAll('#obxod-table-body tr').forEach(row => {
            const name = row.querySelector('.obxod-name')?.value;
            if (name) {
                obxodchilar.push({
                    name,
                    kmFrom: row.querySelector('.obxod-km-from')?.value || '',
                    kmTo: row.querySelector('.obxod-km-to')?.value || '',
                    kamchilik: row.querySelector('.obxod-kamchilik')?.value || '0',
                    bartaraf: row.querySelector('.obxod-bartaraf')?.value || '0'
                });
            }
        });

        const tools = {};
        document.querySelectorAll('.tool-count').forEach(el => {
            const tool = el.dataset.tool;
            tools[tool] = {
                count: el.value,
                time: document.querySelector('.tool-time[data-tool="' + tool + '"]')?.value || '0',
                fuel: document.querySelector('.tool-fuel[data-tool="' + tool + '"]')?.value || '0'
            };
        });

        const structuredData = { workPlan, warning, zayavka, tools, obxodchilar };
        const totalKam = obxodchilar.reduce((s, o) => s + (parseInt(o.kamchilik) || 0), 0);
        const nameList = obxodchilar.map(o => o.name).join(', ');

        const content = `Ish: ${workPlan}. Obxod: ${nameList || 'Yo\'q'} (${totalKam} kam).`;

        const userId = window.currentUser?.id || window.Auth?.currentUser?.id;
        if (!userId) return SmartUtils.showToast('Login kiring!', 'error');

        try {
            const res = await SmartUtils.fetchAPI('/reports', {
                method: 'POST',
                body: JSON.stringify({ bolinma_id: bolinmaId, content, structuredData, user_id: userId })
            });
            if (res) {
                SmartUtils.showToast('Muvaffaqiyatli yuborildi', 'success');
                refreshDispatcherData();
            }
        } catch (e) { SmartUtils.showToast("Xato: " + e.message, 'error'); }
    }

    async function refreshDispatcherData() {
        await initDispatcherData();
        const containers = document.querySelectorAll('.dispatcher-dashboard-container');
        if (containers.length > 0) {
            containers.forEach(c => { c.innerHTML = getDispatcherDashboardHTML(); });
        } else {
            const main = document.getElementById('main-content');
            if (main && main.innerHTML.includes('dispetcher')) {
                main.innerHTML = getDispatcherDashboardHTML();
            }
        }
    }

    window.addObxodRow = (bid) => {
        const tbody = document.getElementById('obxod-table-body');
        if (!tbody) return;
        const bNum = bid.replace('bolinma', '');
        let opts = '<option value="">Hodim...</option>';
        try {
            const all = JSON.parse(localStorage.getItem('employeeData')) || [];
            all.filter(e => e.department?.includes(bid) || e.bolinma == bNum).forEach(e => {
                opts += `<option value="${e.name || e.fullName}">${e.name || e.fullName}</option>`;
            });
        } catch (e) { }
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="padding-right: 15px;"><select class="obxod-name" style="width: 100%; background: rgba(15, 23, 42, 0.7); color: #fff; border: 1.5px solid rgba(31,38,135,0.1); padding: 16px; border-radius: 20px; font-weight: 600; color: #f8fafc; outline: none; transition: 0.3s; cursor: pointer; font-size:1rem;">${opts}</select></td>
            <td style="padding-right: 12px;"><input class="obxod-km-from" style="width: 100%; background: rgba(15, 23, 42, 0.7); color: #fff; border: 1.5px solid rgba(31,38,135,0.1); padding: 16px; border-radius: 20px; text-align: center; font-weight: 900; color:#f8fafc; outline: none; font-size: 1.1rem;"></td>
            <td style="padding-right: 12px;"><input class="obxod-km-to" style="width: 100%; background: rgba(15, 23, 42, 0.7); color: #fff; border: 1.5px solid rgba(31,38,135,0.1); padding: 16px; border-radius: 20px; text-align: center; font-weight: 900; color:#f8fafc; outline: none; font-size: 1.1rem;"></td>
            <td style="padding-right: 12px;"><input class="obxod-kamchilik" type="number" value="0" style="width: 100%; background: rgba(245,158,11,0.1); border: 1.5px solid rgba(245,158,11,0.3); padding: 16px; border-radius: 20px; text-align: center; font-weight: 900; color: #b45309; outline: none; font-size: 1.2rem;"></td>
            <td><input class="obxod-bartaraf" type="number" value="0" style="width: 100%; background: rgba(16,185,129,0.1); border: 1.5px solid rgba(16,185,129,0.3); padding: 16px; border-radius: 20px; text-align: center; font-weight: 900; color: #059669; outline: none; font-size: 1.2rem;"></td>
        `;
        tbody.appendChild(tr);
    };

    window.refreshDispatcherData = refreshDispatcherData;
})();
