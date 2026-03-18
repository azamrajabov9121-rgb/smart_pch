/**
 * RAHBAR VIZASI - Korxona rahbari uchun hujjatlarni E-IMZO orqali tasdiqlash tizimi
 * 
 * Jarayon:
 * 1. Bo'linma M-29 yaratadi → status: 'pending'
 * 2. Bugalteriya tasdiqlaydi → status: 'awaiting_signature'
 * 3. Rahbar E-IMZO bilan imzolaydi → status: 'signed'
 */

// ==========================================
// RAHBAR VIZASI OYNASINI OCHISH
// ==========================================
window.openAdminMurojaatWindow = function () {
    let modal = document.getElementById('rahbar-visa-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'rahbar-visa-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: #0a0e1a; z-index: 10025; display: flex; flex-direction: column;
    `;

    modal.innerHTML = `
        <div style="
            padding: 20px 30px;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            border-bottom: 2px solid rgba(243, 156, 18, 0.4);
            display: flex; justify-content: space-between; align-items: center;
            flex-shrink: 0;
        ">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="background: rgba(243, 156, 18, 0.15); padding: 12px; border-radius: 12px;">
                    <i class="fas fa-stamp" style="color: #f39c12; font-size: 1.5rem;"></i>
                </div>
                <div>
                    <h2 style="color: #f8fafc; margin: 0; font-size: 1.5rem; letter-spacing: -0.5px;">
                        Rahbar Vizasi — Hujjatlarni Imzolash
                    </h2>
                    <p style="color: #94a3b8; margin: 3px 0 0 0; font-size: 0.85rem;">
                        E-IMZO orqali hujjatlarni rasmiy tasdiqlash
                    </p>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <div id="visa-stats-bar" style="display: flex; gap: 10px;"></div>
                <button onclick="document.getElementById('rahbar-visa-modal').remove()" 
                    style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; width: 42px; height: 42px; border-radius: 12px; cursor: pointer; font-size: 1.2rem; transition: 0.2s;"
                    onmouseover="this.style.background='#ef4444'; this.style.color='white'" 
                    onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'; this.style.color='#ef4444'">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>

        <!-- Tabs -->
        <div style="display: flex; gap: 0; background: #0f172a; border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0; padding: 0 30px;">
            <button class="visa-tab active" data-tab="awaiting" onclick="switchVisaTab('awaiting')" style="
                padding: 15px 25px; background: none; border: none; color: #f39c12; cursor: pointer; font-weight: 700; font-size: 0.95rem;
                border-bottom: 3px solid #f39c12; transition: 0.2s;
            ">
                <i class="fas fa-clock"></i> Imzo kutilmoqda
                <span id="visa-awaiting-count" style="background: #f39c12; color: #0f172a; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; margin-left: 5px;">0</span>
            </button>
            <button class="visa-tab" data-tab="signed" onclick="switchVisaTab('signed')" style="
                padding: 15px 25px; background: none; border: none; color: #64748b; cursor: pointer; font-weight: 600; font-size: 0.95rem;
                border-bottom: 3px solid transparent; transition: 0.2s;
            ">
                <i class="fas fa-check-circle"></i> Imzolangan
                <span id="visa-signed-count" style="background: rgba(46, 204, 113, 0.2); color: #2ecc71; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; margin-left: 5px;">0</span>
            </button>
            <button class="visa-tab" data-tab="rejected" onclick="switchVisaTab('rejected')" style="
                padding: 15px 25px; background: none; border: none; color: #64748b; cursor: pointer; font-weight: 600; font-size: 0.95rem;
                border-bottom: 3px solid transparent; transition: 0.2s;
            ">
                <i class="fas fa-ban"></i> Rad etilgan
            </button>
            <button class="visa-tab" data-tab="archive" onclick="switchVisaTab('archive')" style="
                padding: 15px 25px; background: none; border: none; color: #64748b; cursor: pointer; font-weight: 600; font-size: 0.95rem;
                border-bottom: 3px solid transparent; transition: 0.2s;
            ">
                <i class="fas fa-archive"></i> Arxiv
                <span id="visa-archive-count" style="background: rgba(155, 89, 182, 0.2); color: #9b59b6; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; margin-left: 5px;">0</span>
            </button>
        </div>

        <!-- Content -->
        <div id="visa-documents-container" style="flex: 1; overflow-y: auto; padding: 25px 30px;">
            <div style="text-align: center; padding: 60px; color: #64748b;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem;"></i>
                <p>Hujjatlar yuklanmoqda...</p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    renderVisaDocuments('awaiting');
};

// ==========================================
// TAB ALMASHISH
// ==========================================
window.switchVisaTab = function (tab) {
    document.querySelectorAll('.visa-tab').forEach(t => {
        t.style.color = '#64748b';
        t.style.borderBottom = '3px solid transparent';
        t.classList.remove('active');
    });
    const tabColors = { awaiting: '#f39c12', signed: '#2ecc71', rejected: '#ef4444', archive: '#9b59b6' };
    const activeTab = document.querySelector(`.visa-tab[data-tab="${tab}"]`);
    if (activeTab) {
        activeTab.style.color = tabColors[tab] || '#64748b';
        activeTab.style.borderBottom = `3px solid ${tabColors[tab] || '#64748b'}`;
        activeTab.classList.add('active');
    }
    if (tab === 'archive') {
        renderArchiveTab();
    } else {
        renderVisaDocuments(tab);
    }
};

// ==========================================
// HUJJATLAR RO'YXATINI CHIQARISH
// ==========================================
function renderVisaDocuments(filterStatus) {
    const container = document.getElementById('visa-documents-container');
    if (!container) return;

    const allActs = JSON.parse(localStorage.getItem('materialActs')) || [];

    // Statuslar bo'yicha sanash
    const awaitingDocs = allActs.filter(a => a.status === 'awaiting_signature');
    const signedDocs = allActs.filter(a => a.status === 'signed');
    const rejectedDocs = allActs.filter(a => a.status === 'director_rejected');

    // Counters
    const awaitingCount = document.getElementById('visa-awaiting-count');
    const signedCount = document.getElementById('visa-signed-count');
    if (awaitingCount) awaitingCount.textContent = awaitingDocs.length;
    if (signedCount) signedCount.textContent = signedDocs.length;

    // Stats bar
    const statsBar = document.getElementById('visa-stats-bar');
    if (statsBar) {
        statsBar.innerHTML = `
            <div style="background: rgba(243,156,18,0.15); border: 1px solid rgba(243,156,18,0.3); padding: 6px 14px; border-radius: 8px; color: #f39c12; font-size: 0.85rem; font-weight: 600;">
                <i class="fas fa-clock"></i> ${awaitingDocs.length} kutmoqda
            </div>
            <div style="background: rgba(46,204,113,0.15); border: 1px solid rgba(46,204,113,0.3); padding: 6px 14px; border-radius: 8px; color: #2ecc71; font-size: 0.85rem; font-weight: 600;">
                <i class="fas fa-check"></i> ${signedDocs.length} imzolangan
            </div>
        `;
    }

    let docs;
    if (filterStatus === 'awaiting') docs = awaitingDocs;
    else if (filterStatus === 'signed') docs = signedDocs;
    else docs = rejectedDocs;

    if (docs.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 80px 40px; color: #475569;">
                <div style="background: rgba(255,255,255,0.03); width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px;">
                    <i class="fas ${filterStatus === 'awaiting' ? 'fa-inbox' : (filterStatus === 'signed' ? 'fa-check-double' : 'fa-ban')}" style="font-size: 3rem; color: #334155;"></i>
                </div>
                <h3 style="color: #64748b; margin-bottom: 8px;">
                    ${filterStatus === 'awaiting' ? 'Imzo kutayotgan hujjatlar yo\'q' : (filterStatus === 'signed' ? 'Imzolangan hujjatlar yo\'q' : 'Rad etilgan hujjatlar yo\'q')}
                </h3>
                <p style="color: #475569; font-size: 0.9rem;">Barcha hujjatlar o'z vaqtida ko'rib chiqilgan.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = docs.map(doc => {
        const date = new Date(doc.date).toLocaleDateString('uz-UZ');
        const approvedDate = doc.approvedDate ? new Date(doc.approvedDate).toLocaleDateString('uz-UZ') : '—';
        const signedDate = doc.signedDate ? new Date(doc.signedDate).toLocaleString('uz-UZ') : null;
        const itemsList = (doc.items || []).map(i => `${i.name} (${i.qty} ${i.uom})`).join(', ');

        let statusBadge = '';
        let actionButtons = '';

        if (filterStatus === 'awaiting') {
            statusBadge = `<span style="background: rgba(243,156,18,0.15); color: #f39c12; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; border: 1px solid rgba(243,156,18,0.3);">
                <i class="fas fa-clock"></i> Imzo kutilmoqda
            </span>`;
            actionButtons = `
                <button onclick="signDocumentWithEImzo('${doc.id}')" style="
                    background: linear-gradient(135deg, #f39c12, #e67e22); border: none; color: white;
                    padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 0.95rem;
                    display: flex; align-items: center; gap: 8px; transition: 0.3s;
                    box-shadow: 0 4px 15px rgba(243, 156, 18, 0.4);
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(243, 156, 18, 0.5)'"
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(243, 156, 18, 0.4)'">
                    <i class="fas fa-fingerprint"></i> E-IMZO bilan Imzolash
                </button>
                <button onclick="rejectByDirector('${doc.id}')" style="
                    background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444;
                    padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 0.85rem;
                    display: flex; align-items: center; gap: 6px; transition: 0.2s;
                ">
                    <i class="fas fa-times"></i> Rad etish
                </button>
            `;
        } else if (filterStatus === 'signed') {
            statusBadge = `<span style="background: rgba(46,204,113,0.15); color: #2ecc71; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; border: 1px solid rgba(46,204,113,0.3);">
                <i class="fas fa-check-circle"></i> Imzolangan
            </span>`;
            actionButtons = `
                <button onclick="viewSignedDocument('${doc.id}')" style="
                    background: rgba(52, 152, 219, 0.15); border: 1px solid rgba(52, 152, 219, 0.3); color: #3498db;
                    padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 0.85rem;
                    display: flex; align-items: center; gap: 6px;
                ">
                    <i class="fas fa-eye"></i> Ko'rish
                </button>
                <button onclick="printSignedDocument('${doc.id}')" style="
                    background: rgba(46, 204, 113, 0.15); border: 1px solid rgba(46, 204, 113, 0.3); color: #2ecc71;
                    padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 0.85rem;
                    display: flex; align-items: center; gap: 6px;
                ">
                    <i class="fas fa-print"></i> Chop etish
                </button>
            `;
        } else {
            statusBadge = `<span style="background: rgba(239,68,68,0.15); color: #ef4444; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; border: 1px solid rgba(239,68,68,0.3);">
                <i class="fas fa-ban"></i> Rad etilgan
            </span>`;
        }

        return `
            <div style="
                background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); 
                border-radius: 16px; padding: 25px; margin-bottom: 15px;
                transition: all 0.3s; border-left: 4px solid ${filterStatus === 'awaiting' ? '#f39c12' : (filterStatus === 'signed' ? '#2ecc71' : '#ef4444')};
            " onmouseover="this.style.background='rgba(255,255,255,0.04)'; this.style.borderColor='rgba(255,255,255,0.12)'"
               onmouseout="this.style.background='rgba(255,255,255,0.02)'; this.style.borderColor='rgba(255,255,255,0.06)'">
                
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 18px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="background: rgba(243, 156, 18, 0.1); width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-file-invoice" style="color: #f39c12; font-size: 1.3rem;"></i>
                        </div>
                        <div>
                            <h3 style="color: #f8fafc; margin: 0; font-size: 1.15rem;">M-29 Dalolatnoma</h3>
                            <p style="color: #64748b; margin: 3px 0 0 0; font-size: 0.85rem;">
                                ${doc.bolinmaNum || '—'}-bo'linma · ${doc.station || '—'} bekat
                            </p>
                        </div>
                    </div>
                    ${statusBadge}
                </div>

                <!-- Details Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 18px;">
                    <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 10px;">
                        <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px;">Yo'l ustasi</div>
                        <div style="color: #cbd5e1; font-weight: 600;">${doc.master || '—'}</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 10px;">
                        <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px;">Yaratilgan sana</div>
                        <div style="color: #cbd5e1; font-weight: 600;">${date}</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 10px;">
                        <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px;">Bugalteriya tasdiqlagan</div>
                        <div style="color: #cbd5e1; font-weight: 600;">${approvedDate}</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 10px;">
                        <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px;">Joylashuv</div>
                        <div style="color: #cbd5e1; font-weight: 600;">${doc.km || '—'} km, PK ${doc.pk || '—'}</div>
                    </div>
                </div>

                <!-- Materials -->
                <div style="background: rgba(0,0,0,0.15); padding: 12px 15px; border-radius: 10px; margin-bottom: 18px; border: 1px solid rgba(255,255,255,0.03);">
                    <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 6px;">
                        <i class="fas fa-boxes"></i> Materiallar
                    </div>
                    <div style="color: #94a3b8; font-size: 0.9rem;">${itemsList || doc.materials || 'Ma\'lumot mavjud emas'}</div>
                </div>

                ${signedDate ? `
                <div style="background: rgba(46,204,113,0.08); padding: 12px 15px; border-radius: 10px; margin-bottom: 18px; border: 1px solid rgba(46,204,113,0.2); display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-shield-alt" style="color: #2ecc71; font-size: 1.3rem;"></i>
                    <div>
                        <div style="color: #2ecc71; font-weight: 700; font-size: 0.9rem;">Elektron imzo qo'yilgan</div>
                        <div style="color: #64748b; font-size: 0.8rem;">${signedDate} · ${doc.signedBy || 'Rahbar'}</div>
                    </div>
                </div>
                ` : ''}

                <!-- Actions -->
                <div style="display: flex; gap: 10px; align-items: center;">
                    ${actionButtons}
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// E-IMZO BILAN IMZOLASH
// ==========================================
window.signDocumentWithEImzo = async function (docId) {
    const allActs = JSON.parse(localStorage.getItem('materialActs')) || [];
    const actIndex = allActs.findIndex(a => a.id == docId);

    if (actIndex === -1) {
        alert('Hujjat topilmadi!');
        return;
    }

    const act = allActs[actIndex];

    // Imzolanishi kerak bo'lgan ma'lumot
    const dataToSign = JSON.stringify({
        docId: act.id,
        type: 'M-29',
        station: act.station,
        master: act.master,
        materials: act.materials,
        date: act.date,
        approvedDate: act.approvedDate,
        signTimestamp: new Date().toISOString()
    });

    try {
        // E-IMZO kalitini tanlash 
        if (typeof EImzoHelper !== 'undefined') {
            const certId = await EImzoHelper.showCertModal();

            if (!certId) {
                if (typeof showToast === 'function') showToast('Imzolash bekor qilindi', 'warning');
                return;
            }

            // Imzolash
            if (typeof showToast === 'function') showToast('Hujjat imzolanmoqda...', 'info');

            try {
                const signResult = await EImzoHelper.signData(certId, dataToSign);

                // Muvaffaqiyatli imzolandi
                act.status = 'signed';
                act.signedDate = new Date().toISOString();
                act.signedBy = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.username : 'Rahbar';
                act.signature = signResult.pkcs7;
                act.signCertId = certId;

                allActs[actIndex] = act;
                localStorage.setItem('materialActs', JSON.stringify(allActs));

                // Virtual file yangilash
                updateVirtualFileStatus(docId, 'signed');

                if (typeof showToast === 'function') showToast('✅ Hujjat muvaffaqiyatli imzolandi!', 'success');
                renderVisaDocuments('awaiting');

            } catch (signErr) {
                // E-IMZO agent ishlamasa, demo rejimda imzolash
                console.warn('E-IMZO real signing failed, using demo mode:', signErr);
                signInDemoMode(act, allActs, actIndex, docId);
            }
        } else {
            // E-IMZO agent mavjud emas — Demo rejim
            signInDemoMode(act, allActs, actIndex, docId);
        }
    } catch (err) {
        console.error('Imzolashda xatolik:', err);
        // Fallback to demo
        signInDemoMode(act, allActs, actIndex, docId);
    }
};

// Demo rejimda imzolash (E-IMZO agent bo'lmaganda)
function signInDemoMode(act, allActs, actIndex, docId) {
    const confirmSign = confirm(
        '⚠️ E-IMZO Agent topilmadi yoki ishlashdan to\'xtatilgan.\n\n' +
        'Demo rejimda imzolashni xohlaysizmi?\n' +
        '(Haqiqiy ishlab chiqarishda E-IMZO Agent o\'rnatilishi kerak)\n\n' +
        'Hujjat: M-29 Dalolatnoma\n' +
        'Usta: ' + (act.master || '—') + '\n' +
        'Bekat: ' + (act.station || '—')
    );

    if (!confirmSign) return;

    act.status = 'signed';
    act.signedDate = new Date().toISOString();
    act.signedBy = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.username : 'Rahbar (Demo)';
    act.signature = 'DEMO-SIG-' + Date.now();
    act.signMode = 'demo';

    allActs[actIndex] = act;
    localStorage.setItem('materialActs', JSON.stringify(allActs));

    // Virtual file yangilash
    updateVirtualFileStatus(docId, 'signed');

    if (typeof showToast === 'function') showToast('✅ Hujjat imzolandi (Demo rejim)', 'success');
    renderVisaDocuments('awaiting');
}

// Virtual PDF fayl statusini yangilash
function updateVirtualFileStatus(docId, newStatus) {
    if (typeof uploadedFiles !== 'undefined') {
        const virtualFile = uploadedFiles.find(f =>
            f.isVirtual && f.virtualType === 'm29' &&
            (f.virtualDataId == docId || (f.actData && f.actData.id == docId))
        );
        if (virtualFile) {
            virtualFile.status = newStatus;
            virtualFile.signedDate = new Date().toISOString();
            if (typeof saveDatabase === 'function') saveDatabase();
        }
    }
}

// ==========================================
// RAD ETISH
// ==========================================
window.rejectByDirector = function (docId) {
    if (!confirm('Haqiqatan ham ushbu hujjatni rad etmoqchimisiz?\nSabab kiritish talab etiladi.')) return;

    const reason = prompt('Rad etish sababini kiriting:');
    if (!reason) return;

    const allActs = JSON.parse(localStorage.getItem('materialActs')) || [];
    const actIndex = allActs.findIndex(a => a.id == docId);

    if (actIndex === -1) {
        alert('Hujjat topilmadi!');
        return;
    }

    allActs[actIndex].status = 'director_rejected';
    allActs[actIndex].rejectedDate = new Date().toISOString();
    allActs[actIndex].rejectedBy = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.username : 'Rahbar';
    allActs[actIndex].rejectReason = reason;

    localStorage.setItem('materialActs', JSON.stringify(allActs));

    updateVirtualFileStatus(docId, 'director_rejected');

    if (typeof showToast === 'function') showToast('Hujjat rad etildi', 'warning');
    renderVisaDocuments('awaiting');
};

// ==========================================
// IMZOLANGAN HUJJATNI KO'RISH / CHOP ETISH
// ==========================================
window.viewSignedDocument = function (docId) {
    const allActs = JSON.parse(localStorage.getItem('materialActs')) || [];
    const act = allActs.find(a => a.id == docId);
    if (!act) { alert('Hujjat topilmadi!'); return; }

    if (typeof printDocumentAct === 'function') {
        printDocumentAct(act);
    } else {
        alert('Hujjatni ko\'rish funksiyasi mavjud emas.');
    }
};

window.printSignedDocument = function (docId) {
    const allActs = JSON.parse(localStorage.getItem('materialActs')) || [];
    const act = allActs.find(a => a.id == docId);
    if (!act) { alert('Hujjat topilmadi!'); return; }

    // Imzo ma'lumotlari bilan chop etish
    const signInfo = act.signedDate
        ? `\n\n---\n✅ ELEKTRON IMZO TASDIQLANGAN\nImzolagan: ${act.signedBy}\nSana: ${new Date(act.signedDate).toLocaleString('uz-UZ')}\nImzo raqami: ${act.signature ? act.signature.substring(0, 20) + '...' : '—'}`
        : '';

    const printContent = `
        <div style="font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.6; color: black; padding: 20px;">
            <h3 style="text-align: center; margin-bottom: 40px; text-transform: uppercase;">Dalolatnoma</h3>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                <div>____/____.${act.year} y</div>
                <div><b>${act.station}</b> bekati</div>
            </div>

            <div style="text-align: justify; text-indent: 50px;">
                Biz quyida imzo chekuvchilar <b>${act.bolinmaNum}</b> yo'l ustasi: <b>${act.master}</b>, 
                yo'l brigadiri: <b>${act.brigadier1}</b>, yo'l brigadiri: <b>${act.brigadier2}</b> 
                lar tomonidan tuzildi ushbu dalolatnoma shu haqidakim
            </div>

            <div style="text-align: justify; margin-top: 10px; text-indent: 50px;">
                <b>${act.year}</b>-yil <b>${act.dayMonth}</b> kuni <b>${act.deptName}</b> qarashli bo'lgan 
                <b>${act.locationStart}</b> bekatlari oralig'i <b>${act.km}</b> km <b>${act.pk}</b> pk <b>${act.miscLoc}</b> larda
            </div>

            <div style="text-align: justify; margin-top: 10px; text-indent: 50px;">
                "<b>${act.workDesc}</b>" nosozliklarini bartaraf qilish uchun 
                <b>${act.method}</b> yordamida joriy ta'mir ishlari bajarildi.
            </div>

            <div style="text-align: justify; margin-top: 10px; text-indent: 50px;">
                Yuqorida joriy ta'mir ishlarini bajarishda tarmoq xom-ashyo hisobotida mavjud bo'lgan 
                <b>${act.materials}</b> sarflandi.
            </div>

            <div style="text-align: justify; margin-top: 10px; text-indent: 50px;">
                Ushbu yuqorida sarflangan <b>${act.matSummary}</b> bo'linma xisobotidan chiqim qilishga ruxsat berishingizni so'raymiz.
            </div>

            <div style="text-align: center; margin-top: 50px; font-weight: bold; text-decoration: underline;">
                Dalolatnoma shu xakida tuzildi va imzolandi
            </div>

            <div style="margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; line-height: 2;">
                <div>yo'l ustasi:</div>
                <div style="border-bottom: 1px solid black;"><span style="float:right">${act.master}</span></div>

                <div>yo'l brigadiri:</div>
                <div style="border-bottom: 1px solid black;"><span style="float:right">${act.brigadier1}</span></div>

                <div>yo'l brigadiri:</div>
                <div style="border-bottom: 1px solid black;"><span style="float:right">${act.brigadier2}</span></div>
            </div>

            ${act.signedDate ? `
            <div style="margin-top: 40px; border: 2px solid #2ecc71; border-radius: 10px; padding: 15px; background: #f0fff4;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMmVjYzcxIj48cGF0aCBkPSJNOSAxNi4xN0w0LjgzIDEybC0xLjQyIDEuNDFMOSAxOSAyMSA3bC0xLjQxLTEuNDFMOSAxNi4xN3oiLz48L3N2Zz4=" alt="check" style="width: 30px;">
                    <div>
                        <div style="font-weight: bold; color: #27ae60; font-size: 1rem;">ELEKTRON RAQAMLI IMZO (ERI) TASDIQLANGAN</div>
                        <div style="color: #666; font-size: 0.85rem;">O'zbekiston Respublikasi "Elektron raqamli imzo to'g'risida"gi Qonuniga muvofiq</div>
                    </div>
                </div>
                <div style="font-size: 0.85rem; color: #444; display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                    <div><b>Imzolagan:</b> ${act.signedBy}</div>
                    <div><b>Sana:</b> ${new Date(act.signedDate).toLocaleString('uz-UZ')}</div>
                    <div><b>Imzo turi:</b> ${act.signMode === 'demo' ? 'Demo' : 'ERI (PKCS#7)'}</div>
                    <div><b>Raqami:</b> ${act.signature ? act.signature.substring(0, 20) + '...' : '—'}</div>
                </div>
            </div>
            ` : ''}
        </div>
    `;

    const win = window.open('', '', 'height=1000,width=850');
    win.document.write(`<html><head><title>M-29 Dalolatnoma (Imzolangan)</title></head><body>${printContent}</body></html>`);
    win.document.close();
    win.print();
};

// ==========================================
// ARXIV (BARCHA HUJJATLAR)
// ==========================================
function renderArchiveTab() {
    const container = document.getElementById('visa-documents-container');
    if (!container) return;

    const allActs = JSON.parse(localStorage.getItem('materialActs')) || [];

    // Arxiv count
    const archiveCount = document.getElementById('visa-archive-count');
    if (archiveCount) archiveCount.textContent = allActs.length;

    // Statistika hisoblash
    const stats = {
        total: allActs.length,
        pending: allActs.filter(a => a.status === 'pending').length,
        awaiting: allActs.filter(a => a.status === 'awaiting_signature').length,
        signed: allActs.filter(a => a.status === 'signed').length,
        rejected: allActs.filter(a => a.status === 'rejected' || a.status === 'director_rejected').length,
    };

    // Oylar ro'yxati
    const months = [...new Set(allActs.map(a => a.date ? a.date.substring(0, 7) : ''))];
    months.sort().reverse();

    container.innerHTML = `
        <!-- Statistika Panel -->
        <div style="background: linear-gradient(135deg, rgba(155, 89, 182, 0.1), rgba(52, 152, 219, 0.1)); border: 1px solid rgba(155, 89, 182, 0.2); border-radius: 16px; padding: 25px; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="color: #f8fafc; margin: 0; display: flex; align-items: center; gap: 10px; font-size: 1.2rem;">
                    <i class="fas fa-chart-bar" style="color: #9b59b6;"></i> Umumiy Statistika (Selektor uchun)
                </h3>
                <button onclick="exportArchiveToExcel()" style="
                    background: linear-gradient(135deg, #27ae60, #2ecc71); border: none; color: white;
                    padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.85rem;
                    display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 10px rgba(39, 174, 96, 0.3);
                ">
                    <i class="fas fa-file-excel"></i> Excelga Yuklash
                </button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px;">
                <div style="background: rgba(0,0,0,0.3); padding: 18px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 2.2rem; font-weight: 800; color: #f8fafc;">${stats.total}</div>
                    <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 5px;">Jami hujjatlar</div>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 18px; border-radius: 12px; text-align: center; border-bottom: 3px solid #f39c12;">
                    <div style="font-size: 2.2rem; font-weight: 800; color: #f39c12;">${stats.pending}</div>
                    <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 5px;">Bugalteriya kutmoqda</div>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 18px; border-radius: 12px; text-align: center; border-bottom: 3px solid #e67e22;">
                    <div style="font-size: 2.2rem; font-weight: 800; color: #e67e22;">${stats.awaiting}</div>
                    <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 5px;">Imzo kutmoqda</div>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 18px; border-radius: 12px; text-align: center; border-bottom: 3px solid #2ecc71;">
                    <div style="font-size: 2.2rem; font-weight: 800; color: #2ecc71;">${stats.signed}</div>
                    <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 5px;">Imzolangan</div>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 18px; border-radius: 12px; text-align: center; border-bottom: 3px solid #ef4444;">
                    <div style="font-size: 2.2rem; font-weight: 800; color: #ef4444;">${stats.rejected}</div>
                    <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 5px;">Rad etilgan</div>
                </div>
            </div>
        </div>

        <!-- Filtr -->
        <div style="display: flex; gap: 15px; margin-bottom: 20px; align-items: center; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <label style="color: #94a3b8; font-size: 0.85rem;"><i class="fas fa-calendar"></i> Oy:</label>
                <select id="archive-month-filter" onchange="filterArchive()" style="background: #1e293b; border: 1px solid rgba(255,255,255,0.1); color: white; padding: 8px 12px; border-radius: 8px; cursor: pointer;">
                    <option value="">Barchasi</option>
                    ${months.map(m => `<option value="${m}">${m}</option>`).join('')}
                </select>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <label style="color: #94a3b8; font-size: 0.85rem;"><i class="fas fa-filter"></i> Status:</label>
                <select id="archive-status-filter" onchange="filterArchive()" style="background: #1e293b; border: 1px solid rgba(255,255,255,0.1); color: white; padding: 8px 12px; border-radius: 8px; cursor: pointer;">
                    <option value="">Barchasi</option>
                    <option value="pending">Bugalteriya kutmoqda</option>
                    <option value="awaiting_signature">Imzo kutmoqda</option>
                    <option value="signed">Imzolangan</option>
                    <option value="rejected">Rad etilgan</option>
                    <option value="director_rejected">Rahbar rad etgan</option>
                </select>
            </div>
            <div style="margin-left: auto; color: #64748b; font-size: 0.85rem;">
                <i class="fas fa-info-circle"></i> Jami: <strong style="color: white;">${allActs.length}</strong> ta hujjat
            </div>
        </div>

        <!-- Jadval -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: rgba(155, 89, 182, 0.15); border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <th style="padding: 14px 15px; text-align: left; color: #cbd5e1; font-size: 0.8rem; text-transform: uppercase; font-weight: 700;">№</th>
                        <th style="padding: 14px 15px; text-align: left; color: #cbd5e1; font-size: 0.8rem; text-transform: uppercase; font-weight: 700;">Sana</th>
                        <th style="padding: 14px 15px; text-align: left; color: #cbd5e1; font-size: 0.8rem; text-transform: uppercase; font-weight: 700;">Hujjat</th>
                        <th style="padding: 14px 15px; text-align: left; color: #cbd5e1; font-size: 0.8rem; text-transform: uppercase; font-weight: 700;">Bo'linma</th>
                        <th style="padding: 14px 15px; text-align: left; color: #cbd5e1; font-size: 0.8rem; text-transform: uppercase; font-weight: 700;">Usta</th>
                        <th style="padding: 14px 15px; text-align: left; color: #cbd5e1; font-size: 0.8rem; text-transform: uppercase; font-weight: 700;">Materiallar</th>
                        <th style="padding: 14px 15px; text-align: center; color: #cbd5e1; font-size: 0.8rem; text-transform: uppercase; font-weight: 700;">Holati</th>
                        <th style="padding: 14px 15px; text-align: center; color: #cbd5e1; font-size: 0.8rem; text-transform: uppercase; font-weight: 700;">Amallar</th>
                    </tr>
                </thead>
                <tbody id="archive-table-body">
                    ${renderArchiveRows(allActs)}
                </tbody>
            </table>
        </div>
    `;
}

function renderArchiveRows(docs) {
    if (docs.length === 0) {
        return `<tr><td colspan="8" style="padding: 40px; text-align: center; color: #64748b;">Hujjatlar topilmadi</td></tr>`;
    }

    return docs.sort((a, b) => new Date(b.date) - new Date(a.date)).map((doc, i) => {
        const date = doc.date ? new Date(doc.date).toLocaleDateString('uz-UZ') : '—';
        const itemsList = (doc.items || []).map(it => it.name).join(', ');
        const materials = itemsList || doc.materials || '—';
        const shortMaterials = materials.length > 40 ? materials.substring(0, 40) + '...' : materials;

        let statusBadge = '';
        let statusColor = '#64748b';
        switch (doc.status) {
            case 'pending':
                statusBadge = '<span style="background: rgba(243,156,18,0.15); color: #f39c12; padding: 4px 10px; border-radius: 15px; font-size: 0.75rem; font-weight: 600;">Bugalteriya</span>';
                statusColor = '#f39c12';
                break;
            case 'awaiting_signature':
                statusBadge = '<span style="background: rgba(230,126,34,0.15); color: #e67e22; padding: 4px 10px; border-radius: 15px; font-size: 0.75rem; font-weight: 600;">Imzo kutmoqda</span>';
                statusColor = '#e67e22';
                break;
            case 'signed':
                statusBadge = '<span style="background: rgba(46,204,113,0.15); color: #2ecc71; padding: 4px 10px; border-radius: 15px; font-size: 0.75rem; font-weight: 600;"><i class="fas fa-check"></i> Imzolangan</span>';
                statusColor = '#2ecc71';
                break;
            case 'rejected':
            case 'director_rejected':
                statusBadge = '<span style="background: rgba(239,68,68,0.15); color: #ef4444; padding: 4px 10px; border-radius: 15px; font-size: 0.75rem; font-weight: 600;">Rad etilgan</span>';
                statusColor = '#ef4444';
                break;
            default:
                statusBadge = '<span style="background: rgba(100,116,139,0.15); color: #64748b; padding: 4px 10px; border-radius: 15px; font-size: 0.75rem; font-weight: 600;">' + (doc.status || 'noma\'lum') + '</span>';
        }

        return `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.03); transition: 0.2s;"
                onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
                <td style="padding: 12px 15px; color: #64748b; font-size: 0.85rem;">${i + 1}</td>
                <td style="padding: 12px 15px; color: #94a3b8; font-size: 0.85rem; white-space: nowrap;">${date}</td>
                <td style="padding: 12px 15px; color: #38bdf8; font-weight: 600; font-size: 0.85rem;">M-29</td>
                <td style="padding: 12px 15px; color: #cbd5e1; font-size: 0.85rem;">${doc.bolinmaNum || '—'}-bo'linma</td>
                <td style="padding: 12px 15px; color: #cbd5e1; font-size: 0.85rem;">${doc.master || '—'}</td>
                <td style="padding: 12px 15px; color: #94a3b8; font-size: 0.8rem;" title="${materials}">${shortMaterials}</td>
                <td style="padding: 12px 15px; text-align: center;">${statusBadge}</td>
                <td style="padding: 12px 15px; text-align: center;">
                    <button onclick="viewSignedDocument('${doc.id}')" style="background: rgba(52,152,219,0.1); border: 1px solid rgba(52,152,219,0.2); color: #3498db; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 0.8rem;" title="Ko'rish">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${doc.status === 'signed' ? `
                    <button onclick="printSignedDocument('${doc.id}')" style="background: rgba(46,204,113,0.1); border: 1px solid rgba(46,204,113,0.2); color: #2ecc71; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; margin-left: 4px;" title="Chop etish">
                        <i class="fas fa-print"></i>
                    </button>` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

// Arxiv Filtrlash
window.filterArchive = function () {
    const monthFilter = document.getElementById('archive-month-filter')?.value || '';
    const statusFilter = document.getElementById('archive-status-filter')?.value || '';

    let allActs = JSON.parse(localStorage.getItem('materialActs')) || [];

    if (monthFilter) {
        allActs = allActs.filter(a => a.date && a.date.startsWith(monthFilter));
    }
    if (statusFilter) {
        if (statusFilter === 'rejected') {
            allActs = allActs.filter(a => a.status === 'rejected' || a.status === 'director_rejected');
        } else {
            allActs = allActs.filter(a => a.status === statusFilter);
        }
    }

    const tbody = document.getElementById('archive-table-body');
    if (tbody) {
        tbody.innerHTML = renderArchiveRows(allActs);
    }
};

// Excelga Yuklash
window.exportArchiveToExcel = function () {
    const allActs = JSON.parse(localStorage.getItem('materialActs')) || [];

    if (allActs.length === 0) {
        alert('Yuklash uchun hujjatlar yo\'q!');
        return;
    }

    // Excel data
    const headers = ['№', 'Sana', 'Hujjat turi', 'Bo\'linma', 'Bekat', 'Yo\'l ustasi', 'Brigadir 1', 'Brigadir 2', 'KM', 'PK', 'Materiallar', 'Holati', 'Bugalteriya tasdiqlagan', 'Imzolagan', 'Imzo sanasi'];
    const rows = allActs.sort((a, b) => new Date(b.date) - new Date(a.date)).map((doc, i) => {
        const itemsList = (doc.items || []).map(it => `${it.name} (${it.qty} ${it.uom})`).join('; ');
        let statusText = '';
        switch (doc.status) {
            case 'pending': statusText = 'Bugalteriya kutmoqda'; break;
            case 'awaiting_signature': statusText = 'Imzo kutmoqda'; break;
            case 'signed': statusText = 'Imzolangan'; break;
            case 'rejected': case 'director_rejected': statusText = 'Rad etilgan'; break;
            default: statusText = doc.status || 'noma\'lum';
        }
        return [
            i + 1,
            doc.date ? new Date(doc.date).toLocaleDateString('uz-UZ') : '',
            'M-29',
            (doc.bolinmaNum || '') + '-bo\'linma',
            doc.station || '',
            doc.master || '',
            doc.brigadier1 || '',
            doc.brigadier2 || '',
            doc.km || '',
            doc.pk || '',
            itemsList || doc.materials || '',
            statusText,
            doc.approvedDate ? new Date(doc.approvedDate).toLocaleDateString('uz-UZ') : '',
            doc.signedBy || '',
            doc.signedDate ? new Date(doc.signedDate).toLocaleDateString('uz-UZ') : ''
        ];
    });

    if (typeof XLSX !== 'undefined') {
        try {
            const wsData = [
                ['HUJJATLAR ARXIVI — PCH SMART TIZIMI'],
                ['Hisobot sanasi: ' + new Date().toLocaleString('uz-UZ')],
                [],
                headers,
                ...rows
            ];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Arxiv');
            XLSX.writeFile(wb, `Hujjatlar_Arxivi_${new Date().toISOString().split('T')[0]}.xlsx`);
            if (typeof showToast === 'function') showToast('Excel fayl yuklandi!', 'success');
        } catch (e) {
            console.error('Excel export error:', e);
            alert('Excelga yuklashda xatolik!');
        }
    } else {
        // Fallback: CSV
        let csv = headers.join(',') + '\n';
        rows.forEach(r => {
            csv += r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',') + '\n';
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Hujjatlar_Arxivi_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        if (typeof showToast === 'function') showToast('CSV fayl yuklandi!', 'success');
    }
};

console.log('✅ Rahbar Vizasi moduli yuklandi (Arxiv bilan)');
