/**
 * SMART PCH - Admin Management Module
 */

// Load Admin Panel Data
async function loadAdminPanelData() {
    loadAdminBolinmaScores();
    loadAdminTrainsList();
    loadAdminWorkersList();
    loadAdminStationsList();
    loadAdminBolinmalarList();
    loadAdminUsersList();
    loadAuditLogs();
}

// User Management
// User Management
async function loadAdminUsersList() {
    const listBody = document.getElementById('admin-users-list');
    if (!listBody) return;

    listBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px;"><i class="fas fa-spinner fa-spin" style="color:var(--accent-gold); font-size:1.5rem;"></i><br><span style="color:rgba(255,255,255,0.5); font-size:0.8rem; margin-top:10px; display:block;">Yuklanmoqda...</span></td></tr>';

    try {
        const users = await SmartUtils.fetchAPI('/auth/users');
        listBody.innerHTML = '';

        if (!users || users.length === 0) {
            listBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:rgba(255,255,255,0.4);">Foydalanuvchilar topilmadi</td></tr>';
            return;
        }

        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,215,0,0.05)';
            tr.style.transition = 'all 0.2s';
            
            const roleColors = {
                admin: 'linear-gradient(135deg, #d4af37, #f1c40f)',
                department: 'linear-gradient(135deg, #3498db, #2980b9)',
                bolinma: 'linear-gradient(135deg, #2ecc71, #27ae60)'
            };

            const status = user.status || 'active';
            const isInactive = status === 'inactive';

            tr.innerHTML = `
                <td style="padding:15px 10px;">
                    <div style="font-weight:600; color:${isInactive ? '#64748b' : 'white'}; display:flex; align-items:center; gap:8px;">
                        <div style="width:32px; height:32px; border-radius:50%; background:rgba(212,175,55,0.1); border:1px solid rgba(212,175,55,0.2); display:flex; align-items:center; justify-content:center; color:var(--accent-gold);">
                            <i class="fas fa-user"></i>
                        </div>
                        ${user.full_name || 'Ismsiz'}
                    </div>
                </td>
                <td style="padding:15px 10px;"><code style="background:rgba(212,175,55,0.05); color:var(--accent-gold); padding:3px 8px; border-radius:6px; font-size:0.85rem; border:1px solid rgba(212,175,55,0.1); font-family:'Fira Code', monospace;">@${user.username}</code></td>
                <td style="padding:15px 10px;"><span style="padding:4px 12px; border-radius:20px; font-size:0.65rem; font-weight:900; background:${roleColors[user.role] || '#95a5a6'}; color:white; text-transform:uppercase; box-shadow:0 2px 10px rgba(0,0,0,0.2); letter-spacing:0.5px;">${user.role}</span></td>
                <td style="padding:15px 10px;"><div style="font-size:0.75rem; color:rgba(255,255,255,0.5); max-width:180px; line-height:1.4;">${user.departments.length > 0 ? user.departments.map(d => `<span style="display:inline-block; background:rgba(255,255,255,0.05); padding:1px 5px; border-radius:3px; margin:1px;">${d}</span>`).join(' ') : '<span style="opacity:0.3">-</span>'}</div></td>
                <td style="padding:15px 10px;">
                    <span style="display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:12px; font-size:0.7rem; font-weight:bold; background:${isInactive ? 'rgba(231,76,60,0.1)' : 'rgba(46,204,113,0.1)'}; color:${isInactive ? '#e74c3c' : '#2ecc71'}; border:1px solid ${isInactive ? 'rgba(231,76,60,0.2)' : 'rgba(46,204,113,0.2)'};">
                        <i class="fas ${isInactive ? 'fa-user-lock' : 'fa-check-circle'}"></i>
                        ${isInactive ? 'BLOKLANGAN' : 'FAOL'}
                    </span>
                </td>
                <td style="padding:15px 10px;">
                    <div style="display:flex; gap:8px;">
                        <button class="action-btn gold-btn" onclick="resetUserPassword(${user.id}, '${user.username}')" title="Parolni yangilash" style="background:rgba(212,175,55,0.15); color:var(--accent-gold); border:1px solid rgba(212,175,55,0.3); width:32px; height:32px; border-radius:8px; cursor:pointer; transition:all 0.2s;"><i class="fas fa-key"></i></button>
                        <button class="action-btn" onclick="toggleUserStatus(${user.id}, '${user.username}', '${status}')" title="${isInactive ? 'Faollashtirish' : 'Bloklash'}" style="background:${isInactive ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)'}; color:${isInactive ? '#2ecc71' : '#e74c3c'}; border:1px solid ${isInactive ? 'rgba(46,204,113,0.3)' : 'rgba(231,76,60,0.3)'}; width:32px; height:32px; border-radius:8px; cursor:pointer; transition:all 0.2s;"><i class="fas ${isInactive ? 'fa-unlock' : 'fa-lock'}"></i></button>
                        ${user.username !== 'admin' ? `
                            <button class="action-btn" onclick="deleteUserPermanent(${user.id}, '${user.username}')" title="Bazadan o'chirish" style="background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.3); border:1px solid rgba(255,255,255,0.1); width:32px; height:32px; border-radius:8px; cursor:pointer; transition:all 0.2s;"><i class="fas fa-trash"></i></button>
                        ` : ''}
                    </div>
                </td>
            `;
            listBody.appendChild(tr);
        });
    } catch (err) {
        listBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:#e74c3c;"><i class="fas fa-exclamation-triangle"></i> Xatolik: ${err.message}</td></tr>`;
    }
}

// Audit Logs
async function loadAuditLogs() {
    const listBody = document.getElementById('admin-audit-list');
    if (!listBody) return;

    listBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px;"><i class="fas fa-spinner fa-spin" style="color:var(--accent-gold);"></i></td></tr>';

    try {
        const logs = await SmartUtils.fetchAPI('/audit/logs?limit=50');
        listBody.innerHTML = '';

        if (!logs || logs.length === 0) {
            listBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:rgba(255,255,255,0.4);">Jurnal bo\'sh</td></tr>';
            return;
        }

        logs.forEach(log => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
            
            const actionColors = {
                'POST': '#2ecc71',
                'PUT': '#3498db',
                'PATCH': '#f39c12',
                'DELETE': '#e74c3c'
            };

            tr.innerHTML = `
                <td style="padding:12px 10px; font-size:0.75rem; color:rgba(255,255,255,0.5); font-family:monospace;">${new Date(log.created_at).toLocaleString()}</td>
                <td style="padding:12px 10px;"><span style="color:var(--accent-gold); font-weight:600;">@${log.username}</span></td>
                <td style="padding:12px 10px;"><span style="font-size:0.7rem; font-weight:900; color:${actionColors[log.action] || '#95a5a6'}">${log.action}</span></td>
                <td style="padding:12px 10px; font-size:0.8rem; color:#cbd5e1;">${log.entity}</td>
                <td style="padding:12px 10px;"><div style="font-size:0.75rem; color:rgba(255,255,255,0.4); max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title='${log.details}'>${log.details}</div></td>
                <td style="padding:12px 10px; font-size:0.75rem; color:rgba(255,255,255,0.3); font-family:monospace;">${log.ip_address}</td>
            `;
            listBody.appendChild(tr);
        });
    } catch (err) {
        listBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:#e74c3c;">Xatolik: ${err.message}</td></tr>`;
    }
}

// Action Functions (Globally Exposed)
window.loadAdminPanelData = loadAdminPanelData;
window.loadAdminUsersList = loadAdminUsersList;
window.loadAuditLogs = loadAuditLogs;

window.toggleUserStatus = async function (userId, username, currentStatus) {
    if (username === 'admin') {
        showToast("Asosiy adminni bloklab bo'lmaydi!", "error");
        return;
    }
    
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? "faollashtirishni" : "bloklashni";
    
    if (!confirm(`Foydalanuvchi @${username} ni ${actionText} tasdiqlaysizmi?`)) return;
    
    try {
        await SmartUtils.fetchAPI(`/auth/users/${userId}/status`, { 
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus })
        });
        showToast(`Foydalanuvchi ${newStatus === 'active' ? 'faollashtirildi' : 'bloklandi'}`, "success");
        loadAdminUsersList();
    } catch (err) { showToast(err.message, "error"); }
};

window.deleteUserPermanent = async function (userId, username) {
    if (username === 'admin') return;
    if (!confirm(`DIQQAT! Foydalanuvchi @${username} ni bazadan BUTUNLAY O'CHIRIB yubormoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi!`)) return;
    
    try {
        await SmartUtils.fetchAPI(`/auth/users/${userId}`, { method: 'DELETE' });
        showToast("Foydalanuvchi bazadan o'chirildi", "success");
        loadAdminUsersList();
    } catch (err) { showToast(err.message, "error"); }
};

window.resetUserPassword = async function (userId, username) {
    // Generate a random 6-digit password for convenience
    const randomPass = Math.floor(100000 + Math.random() * 900000).toString();
    const newPass = prompt(`@${username} uchun yangi parol kiriting:`, randomPass);
    
    if (!newPass) return;
    
    try {
        await SmartUtils.fetchAPI(`/auth/users/${userId}/reset-password`, {
            method: 'POST',
            body: JSON.stringify({ password: newPass })
        });
        
        // Custom Styled Alert for New Password
        const passwordLabel = `<div style="text-align:center; padding:15px; background:rgba(212,175,55,0.1); border-radius:10px; border:1px solid var(--accent-gold); margin-top:10px;">
            <p style="margin:0; color:rgba(255,255,255,0.7); font-size:0.9rem;">Yangi parol:</p>
            <h2 style="margin:10px 0; color:var(--accent-gold); font-family:monospace; letter-spacing:2px;">${newPass}</h2>
            <p style="margin:0; font-size:0.75rem; color:#e74c3c;">Iltimos, parolni saqlab qo'ying!</p>
        </div>`;
        
        // Check if there is a global modal system, else use alert
        if (window.showCustomModal) {
            window.showCustomModal("Parol Yangilandi", passwordLabel);
        } else {
            alert(`@${username} uchun yangi parol: ${newPass}\n\nIltimos, uni saqlab qo'ying!`);
        }
        
    } catch (err) { showToast("Xatolik: Amallik bajarilmadi", "error"); }
};
