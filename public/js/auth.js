/**
 * SMART PCH - Authentication & User Management
 */

window.Auth = {
    currentUser: null,
    users: {},

    // Faqat rol va strukturani aniqlash uchun — parollar YO'Q
    roleStructure: {
        'admin': { name: 'Administrator', role: 'admin', departments: ['ishlab-chiqarish', 'xodimlar', 'bugalteriya', 'iqtisod', 'mexanika', 'mehnat-muhofazasi', 'dispetcher', 'metrologiya'] },
        'ishlab': { name: 'Ishlab Chiqarish Bo\'limi', role: 'department', departments: ['ishlab-chiqarish'] },
        'xodimlar': { name: 'Xodimlar Bo\'limi', role: 'department', departments: ['xodimlar'] },
        'bugalteriya': { name: 'Bugalteriya Bo\'limi', role: 'department', departments: ['bugalteriya'] },
        'iqtisod': { name: 'Iqtisod Bo\'limi', role: 'department', departments: ['iqtisod'] },
        'mexanika': { name: 'Mexanika Bo\'limi', role: 'department', departments: ['mexanika'] },
        'mehnat': { name: 'Mehnat Muhofazasi Bo\'limi', role: 'department', departments: ['mehnat-muhofazasi'] },
        'dispetcher': { name: 'Dispetcher Bo\'limi', role: 'department', departments: ['dispetcher'] },
        'metrologiya': { name: 'Metrologiya Bo\'limi', role: 'department', departments: ['metrologiya'] }
    },

    async init() {
        console.log('Initializing Auth System...');
        // Server-based authentication — frontendda parol saqlanmaydi
    },

    async save() {
        if (window.electron) {
            await window.electron.saveData('users.json', this.users);
        } else {
            localStorage.setItem('smart_pch_users', JSON.stringify(this.users));
        }
    },

    async login(username, password) {
        try {
            const response = await fetch(`${window.CONFIG.API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                let errorData = {};
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { message: `Server xatosi: ${response.status}` };
                }
                console.error('Login failed:', errorData.message);
                return { success: false, message: errorData.message || `Xatolik: ${response.status}` };
            }

            const data = await response.json();

            // Save token and user details
            localStorage.setItem('jwtToken', data.token);
            this.currentUser = { ...data.user, name: data.user.full_name };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            const msg = error.message === 'Failed to fetch'
                ? 'Server bilan bog\'lanib bo\'lmadi (Server o\'chiq bo\'lishi mumkin)'
                : error.message;
            return { success: false, message: msg };
        }
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('jwtToken');

        // window.location.reload() ISHLATILMAYDI!
        // Sabab: reload → autentifikatsiyasiz API chaqiruvi → 401 → logout → reload = CHEKSIZ LOOP
        // Buning o'rniga login sahifasini to'g'ridan-to'g'ri ko'rsatamiz

        const mainSystem = document.getElementById('mainSystem');
        const loginPage = document.getElementById('loginPage');
        const landingPage = document.getElementById('landingPage');

        if (mainSystem) mainSystem.style.display = 'none';
        if (landingPage) landingPage.style.display = 'none';
        if (loginPage) {
            loginPage.style.display = 'flex';
            loginPage.style.opacity = '1';
            loginPage.style.transform = 'scale(1)';
        }

        // Login formni tozalash
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const loginError = document.getElementById('loginError');
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
        if (loginError) loginError.style.display = 'none';

        console.log('Foydalanuvchi tizimdan chiqdi.');
    },

    isLoggedIn() {
        if (!this.currentUser) {
            const saved = localStorage.getItem('currentUser');
            if (saved) {
                this.currentUser = JSON.parse(saved);
            }
        }
        // Also check if token exists
        const token = localStorage.getItem('jwtToken');
        return !!(this.currentUser && token);
    },

    openUserProfile() {
        if (!this.currentUser) return;

        let modal = document.getElementById('user-profile-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'user-profile-modal';
            modal.className = 'department-window';
            modal.innerHTML = `
                <div class="window-header" style="background: linear-gradient(135deg, var(--primary), var(--secondary));">
                    <h2 class="department-name">
                        <i class="fas fa-user-circle"></i> Mening Profilim
                    </h2>
                    <button class="close-btn" onclick="document.getElementById('user-profile-modal').classList.remove('active')">
                        &times;
                    </button>
                </div>
                <div class="window-content" id="user-profile-content" style="padding: 30px; color: white;">
                </div>
            `;
            document.body.appendChild(modal);
        }

        const user = this.currentUser;
        document.getElementById('user-profile-content').innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                <div style="width: 120px; height: 120px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: bold; border: 4px solid var(--glass-border); box-shadow: 0 0 30px rgba(0, 198, 255, 0.3);">
                    ${user.name[0]}
                </div>
                <div style="text-align: center;">
                    <h2 style="margin: 0; color: #fff;">${user.name}</h2>
                    <p style="color: var(--primary); margin: 5px 0;">@${user.username || user.role}</p>
                </div>
                
                <div style="width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; border: 1px solid var(--glass-border);">
                        <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5);">Roli</div>
                        <div style="font-weight: bold; color: #fff; text-transform: capitalize;">${user.role}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; border: 1px solid var(--glass-border);">
                        <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5);">Tizimga kirish</div>
                        <div style="font-weight: bold; color: #fff;">${new Date().toLocaleDateString()}</div>
                    </div>
                </div>

                <div style="width: 100%; background: rgba(0,198,255,0.05); padding: 20px; border-radius: 15px; border: 1px solid rgba(0,198,255,0.2);">
                    <h4 style="margin: 0 0 10px 0; color: #00c6ff;"><i class="fas fa-key"></i> Xavfsizlik</h4>
                    <div id="password-change-form" style="display: none;">
                        <input type="password" id="currentPasswordInput" placeholder="Joriy parol" 
                            style="width: 100%; padding: 10px; margin-bottom: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: white;">
                        <input type="password" id="newPasswordInput" placeholder="Yangi parol (kamida 6 ta belgi)" 
                            style="width: 100%; padding: 10px; margin-bottom: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: white;">
                        <input type="password" id="confirmPasswordInput" placeholder="Yangi parolni tasdiqlang" 
                            style="width: 100%; padding: 10px; margin-bottom: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: white;">
                        <div style="display: flex; gap: 8px;">
                            <button class="btn-primary" style="flex: 1; font-size: 0.85rem; padding: 10px;" onclick="window.Auth.changePassword()">
                                <i class="fas fa-save"></i> Saqlash
                            </button>
                            <button style="flex: 1; font-size: 0.85rem; padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 8px; cursor: pointer;"
                                onclick="document.getElementById('password-change-form').style.display='none'">
                                Bekor qilish
                            </button>
                        </div>
                    </div>
                    <button class="btn-primary" id="showPasswordFormBtn" style="width: 100%; font-size: 0.9rem; padding: 10px;" 
                        onclick="document.getElementById('password-change-form').style.display='block'; this.style.display='none';">
                        Parolni o'zgartirish
                    </button>
                </div>
                
                <button class="logout-btn" style="width: 100%; background: rgba(231, 76, 60, 0.2); border: 1px solid #e74c3c; color: #e74c3c; margin-top: 10px;" onclick="window.Auth.logout()">
                    <i class="fas fa-sign-out-alt"></i> Tizimdan chiqish
                </button>
            </div>
        `;

        modal.classList.add('active');
    },

    async changePassword() {
        const currentPassword = document.getElementById('currentPasswordInput')?.value;
        const newPassword = document.getElementById('newPasswordInput')?.value;
        const confirmPassword = document.getElementById('confirmPasswordInput')?.value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast('Barcha maydonlarni to\'ldiring', 'warning');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('Yangi parollar mos kelmayapti', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showToast('Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak', 'warning');
            return;
        }

        try {
            const response = await SmartUtils.fetchAPI('/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (response) {
                showToast('Parol muvaffaqiyatli o\'zgartirildi!', 'success');
                document.getElementById('password-change-form').style.display = 'none';
                const showBtn = document.getElementById('showPasswordFormBtn');
                if (showBtn) showBtn.style.display = 'block';
                // Inputlarni tozalash
                document.getElementById('currentPasswordInput').value = '';
                document.getElementById('newPasswordInput').value = '';
                document.getElementById('confirmPasswordInput').value = '';
            }
        } catch (error) {
            showToast(error.message || 'Parolni o\'zgartirishda xatolik', 'error');
        }
    }
};

// Initialize listeners
document.addEventListener('DOMContentLoaded', () => {
    const avatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    if (avatar) avatar.onclick = () => window.Auth.openUserProfile();
    if (userName) userName.onclick = () => window.Auth.openUserProfile();
});
