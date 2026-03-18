/**
 * SMART PCH - Authentication & User Management
 */

window.Auth = {
    currentUser: null,
    users: {},

    // Faqat rol va strukturani aniqlash uchun — parollar YO'Q
    roleStructure: {
        'admin': { name: 'Administrator', role: 'admin', departments: ['dispetcher'] },
        'dispetcher': { name: 'Dispetcher Bo\'limi', role: 'department', departments: ['dispetcher'] }
    },

    async init() {
        console.log('Initializing Auth System...');
        // Server-based authentication — frontendda parol saqlanmaydi
    },

    async save() {
        localStorage.setItem('smart_pch_users', JSON.stringify(this.users));
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

        if (mainSystem) mainSystem.style.setProperty('display', 'none', 'important');
        if (landingPage) landingPage.style.setProperty('display', 'none', 'important');

        if (loginPage) {
            loginPage.style.setProperty('display', 'flex', 'important');
            loginPage.style.setProperty('opacity', '1', 'important');
            loginPage.style.setProperty('visibility', 'visible', 'important');
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
                <div class="window-header" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);">
                    <h2>
                        <i class="fas fa-user-circle" style="color: #00c6ff;"></i> Mening Profilim
                    </h2>
                    <button class="close-window" onclick="document.getElementById('user-profile-modal').classList.remove('active')">
                        &times;
                    </button>
                </div>
                <div class="window-content" id="user-profile-content" style="padding: 0; color: white; overflow-y: auto;">
                </div>
            `;
            document.body.appendChild(modal);
        }

        const user = this.currentUser;
        const isAdmin = user.role === 'admin';
        const userDepts = user.departments || [];
        const userBolinmalar = user.bolinmalar || [];
        const loginDate = new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
        const loginTime = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

        // Role badge color
        const roleBadgeColor = isAdmin ? '#e74c3c' : (user.role === 'department' ? '#3498db' : '#2ecc71');
        const roleName = isAdmin ? 'Administrator' : (user.role === 'department' ? 'Bo\'lim boshlig\'i' : 'Bo\'linma xodimi');

        // Admin quick actions
        const adminActionsHTML = isAdmin ? `
            <div style="width: 100%; margin-top: 10px;">
                <h3 style="margin: 0 0 15px 0; font-size: 1rem; color: rgba(255,255,255,0.8); display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-bolt" style="color: #ffd700;"></i> Tezkor amallar
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
                    <button onclick="document.getElementById('user-profile-modal').classList.remove('active'); document.getElementById('openAdminPanelBtn')?.click();" 
                        style="display: flex; align-items: center; gap: 12px; padding: 14px 18px; background: linear-gradient(135deg, rgba(231,76,60,0.15), rgba(231,76,60,0.05)); border: 1px solid rgba(231,76,60,0.3); border-radius: 12px; color: #fff; cursor: pointer; transition: all 0.3s; font-size: 0.9rem;">
                        <i class="fas fa-cogs" style="font-size: 1.2rem; color: #e74c3c;"></i>
                        <div style="text-align: left;">
                            <div style="font-weight: 600;">Admin Panel</div>
                            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">Boshqaruv paneli</div>
                        </div>
                    </button>
                    <button onclick="document.getElementById('user-profile-modal').classList.remove('active'); document.getElementById('openAdminPanelBtn')?.click(); setTimeout(() => { const usersTab = document.querySelector('[data-admin-tab=\\'users\\']'); if(usersTab) usersTab.click(); }, 300);"
                        style="display: flex; align-items: center; gap: 12px; padding: 14px 18px; background: linear-gradient(135deg, rgba(52,152,219,0.15), rgba(52,152,219,0.05)); border: 1px solid rgba(52,152,219,0.3); border-radius: 12px; color: #fff; cursor: pointer; transition: all 0.3s; font-size: 0.9rem;">
                        <i class="fas fa-users-cog" style="font-size: 1.2rem; color: #3498db;"></i>
                        <div style="text-align: left;">
                            <div style="font-weight: 600;">Foydalanuvchilar</div>
                            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">Boshqarish</div>
                        </div>
                    </button>
                    <button onclick="document.getElementById('user-profile-modal').classList.remove('active'); document.getElementById('openAdminPanelBtn')?.click(); setTimeout(() => { const auditTab = document.querySelector('[data-admin-tab=\\'audit\\']'); if(auditTab) auditTab.click(); }, 300);"
                        style="display: flex; align-items: center; gap: 12px; padding: 14px 18px; background: linear-gradient(135deg, rgba(155,89,182,0.15), rgba(155,89,182,0.05)); border: 1px solid rgba(155,89,182,0.3); border-radius: 12px; color: #fff; cursor: pointer; transition: all 0.3s; font-size: 0.9rem;">
                        <i class="fas fa-history" style="font-size: 1.2rem; color: #9b59b6;"></i>
                        <div style="text-align: left;">
                            <div style="font-weight: 600;">Audit jurnali</div>
                            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">Tizim tarixi</div>
                        </div>
                    </button>
                    <button onclick="document.getElementById('user-profile-modal').classList.remove('active'); if(window.openAdminMurojaatWindow) window.openAdminMurojaatWindow();"
                        style="display: flex; align-items: center; gap: 12px; padding: 14px 18px; background: linear-gradient(135deg, rgba(243,156,18,0.15), rgba(243,156,18,0.05)); border: 1px solid rgba(243,156,18,0.3); border-radius: 12px; color: #fff; cursor: pointer; transition: all 0.3s; font-size: 0.9rem;">
                        <i class="fas fa-file-signature" style="font-size: 1.2rem; color: #f39c12;"></i>
                        <div style="text-align: left;">
                            <div style="font-weight: 600;">Rahbar vizasi</div>
                            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">Tasdiqlash</div>
                        </div>
                    </button>
                </div>
            </div>
        ` : '';

        // Departments list
        const deptsHTML = userDepts.length > 0 ? `
            <div style="width: 100%; margin-top: 10px;">
                <h3 style="margin: 0 0 12px 0; font-size: 1rem; color: rgba(255,255,255,0.8); display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-building" style="color: #3498db;"></i> Tegishli bo'limlar
                </h3>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${userDepts.map(d => `
                        <span style="padding: 6px 14px; background: rgba(52,152,219,0.1); border: 1px solid rgba(52,152,219,0.25); border-radius: 20px; font-size: 0.8rem; color: #7ec8e3; font-weight: 500;">
                            <i class="fas fa-folder" style="margin-right: 4px; font-size: 0.7rem;"></i> ${d}
                        </span>
                    `).join('')}
                </div>
            </div>
        ` : '';

        const bolinmalarHTML = userBolinmalar.length > 0 ? `
            <div style="width: 100%; margin-top: 10px;">
                <h3 style="margin: 0 0 12px 0; font-size: 1rem; color: rgba(255,255,255,0.8); display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-sitemap" style="color: #2ecc71;"></i> Tegishli bo'linmalar
                </h3>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${userBolinmalar.map(b => `
                        <span style="padding: 6px 14px; background: rgba(46,204,113,0.1); border: 1px solid rgba(46,204,113,0.25); border-radius: 20px; font-size: 0.8rem; color: #7dcea0; font-weight: 500;">
                            <i class="fas fa-layer-group" style="margin-right: 4px; font-size: 0.7rem;"></i> ${b}
                        </span>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Admin Broadcast Section
        const broadcastUI = isAdmin ? `
            <div style="width: 100%; background: rgba(255,193,7,0.05); padding: 22px; border-radius: 16px; border: 1px solid rgba(255,193,7,0.2); margin-top: 20px;">
                <h3 style="margin: 0 0 15px 0; font-size: 1rem; color: #ffc107; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-bullhorn"></i> Barcha foydalanuvchilarga e'lon (Broadcast)
                </h3>
                <div id="broadcast-form">
                    <input type="text" id="broadcastTitle" placeholder="Xabar sarlavhasi (ixtiyoriy)" 
                        style="width: 100%; padding: 12px 16px; margin-bottom: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: white; font-size: 0.9rem; box-sizing: border-box; outline: none; transition: border 0.3s;"
                        onfocus="this.style.borderColor='rgba(255,193,7,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.15)'">
                    <textarea id="broadcastMessage" placeholder="Xabar matni..." 
                        style="width: 100%; height: 100px; padding: 12px 16px; margin-bottom: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: white; font-size: 0.9rem; box-sizing: border-box; outline: none; transition: border 0.3s; resize: none;"
                        onfocus="this.style.borderColor='rgba(255,193,7,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.15)'"></textarea>
                    
                    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <select id="broadcastPriority" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: #1e293b; color: white; outline: none;">
                            <option value="normal">Normal</option>
                            <option value="important">Muhim</option>
                            <option value="urgent">TEZKOR</option>
                        </select>
                        <button style="flex: 2; padding: 12px; background: linear-gradient(135deg, #ffc107, #ff8f00); border: none; border-radius: 10px; color: #1a2a3a; font-weight: 700; cursor: pointer; font-size: 0.9rem; transition: all 0.3s;" onclick="window.Auth.sendBroadcast()">
                            <i class="fas fa-paper-plane"></i> Xabar yuborish
                        </button>
                    </div>
                </div>
            </div>
        ` : '';

        document.getElementById('user-profile-content').innerHTML = `
            <div style="max-width: 800px; margin: 0 auto; padding: 30px 25px;">
                <!-- Profile Header Card -->
                <div style="background: linear-gradient(135deg, rgba(0,198,255,0.08), rgba(0,114,255,0.05)); border: 1px solid rgba(0,198,255,0.15); border-radius: 20px; padding: 30px; margin-bottom: 25px; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -40px; right: -40px; width: 150px; height: 150px; background: radial-gradient(circle, rgba(0,198,255,0.1), transparent); border-radius: 50%;"></div>
                    <div style="position: absolute; bottom: -30px; left: -30px; width: 120px; height: 120px; background: radial-gradient(circle, rgba(0,114,255,0.08), transparent); border-radius: 50%;"></div>
                    
                    <div style="display: flex; align-items: center; gap: 25px; position: relative; z-index: 1; flex-wrap: wrap;">
                        <!-- Avatar -->
                        <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #00c6ff, #0072ff); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 800; color: white; box-shadow: 0 8px 30px rgba(0,198,255,0.3); flex-shrink: 0; border: 3px solid rgba(255,255,255,0.2); overflow: hidden;">
                            ${user.avatar ? `<img src="${user.avatar}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` : (user.name || 'A')[0].toUpperCase()}
                        </div>
                        
                        <!-- User Info -->
                        <div style="flex: 1; min-width: 200px;">
                            <h2 style="margin: 0 0 5px 0; font-size: 1.5rem; color: #fff; font-weight: 700;">${user.name || 'Foydalanuvchi'}</h2>
                            <p style="color: #00c6ff; margin: 0 0 5px 0; font-size: 0.95rem; font-weight: 500;">@${user.username || user.role}</p>
                            <p style="color: #ccc; margin: 0 0 10px 0; font-size: 0.85rem;"><i class="fas fa-phone"></i> ${user.phone || '+998 --- -- --'}</p>
                            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                                <span style="padding: 4px 14px; background: ${roleBadgeColor}; border-radius: 20px; font-size: 0.75rem; font-weight: 700; color: white; letter-spacing: 0.5px; text-transform: uppercase;">
                                    <i class="fas ${isAdmin ? 'fa-crown' : 'fa-user-tag'}" style="margin-right: 4px;"></i> ${roleName}
                                </span>
                                <span style="padding: 4px 12px; background: rgba(46,204,113,0.15); border: 1px solid rgba(46,204,113,0.3); border-radius: 20px; font-size: 0.7rem; color: #2ecc71; font-weight: 600;">
                                    <i class="fas fa-circle" style="font-size: 0.4rem; vertical-align: middle; margin-right: 4px; animation: pulse 2s infinite;"></i> Online
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; margin-bottom: 25px;">
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; text-align: center;">
                        <div style="font-size: 1.6rem; margin-bottom: 2px;">📋</div>
                        <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-bottom: 4px;">Bo'limlar</div>
                        <div style="font-size: 1.3rem; font-weight: 800; color: #00c6ff;">${userDepts.length}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; text-align: center;">
                        <div style="font-size: 1.6rem; margin-bottom: 2px;">🏗️</div>
                        <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-bottom: 4px;">Bo'linmalar</div>
                        <div style="font-size: 1.3rem; font-weight: 800; color: #2ecc71;">${userBolinmalar.length}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; text-align: center;">
                        <div style="font-size: 1.6rem; margin-bottom: 2px;">📅</div>
                        <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-bottom: 4px;">Kirish sanasi</div>
                        <div style="font-size: 0.85rem; font-weight: 700; color: #f39c12;">${loginDate}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; text-align: center;">
                        <div style="font-size: 1.6rem; margin-bottom: 2px;">⏰</div>
                        <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-bottom: 4px;">Vaqti</div>
                        <div style="font-size: 1.3rem; font-weight: 800; color: #e67e22;">${loginTime}</div>
                    </div>
                </div>

                <!-- Admin Quick Actions -->
                ${adminActionsHTML}

                <!-- Departments -->
                ${deptsHTML}

                <!-- Bolinmalar -->
                ${bolinmalarHTML}

                <!-- Broadcast Section -->
                ${broadcastUI}

                <!-- Security Section -->
                <div style="width: 100%; background: rgba(0,198,255,0.04); padding: 22px; border-radius: 16px; border: 1px solid rgba(0,198,255,0.15); margin-top: 20px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 1rem; color: #00c6ff; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-shield-alt"></i> Xavfsizlik sozlamalari
                    </h3>
                    
                    <!-- Profile Update Form -->
                    <div id="profile-update-form" style="display: none; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px;">
                        <h4 style="color: white; margin-top: 0;">Ma'lumotlarni tahrirlash</h4>
                        <input type="text" id="updateNameInput" value="${user.name || ''}" placeholder="To'liq ismingiz" 
                            style="width: 100%; padding: 12px 16px; margin-bottom: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: white; font-size: 0.9rem; box-sizing: border-box; outline: none;">
                        <input type="text" id="updatePhoneInput" value="${user.phone || ''}" placeholder="Telefon raqami (+998901234567)" 
                            style="width: 100%; padding: 12px 16px; margin-bottom: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: white; font-size: 0.9rem; box-sizing: border-box; outline: none;">
                        <input type="text" id="updateAvatarInput" value="${user.avatar || ''}" placeholder="Rasm URL (ixtiyoriy)" 
                            style="width: 100%; padding: 12px 16px; margin-bottom: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: white; font-size: 0.9rem; box-sizing: border-box; outline: none;">
                        <div style="display: flex; gap: 10px;">
                            <button style="flex: 1; padding: 12px; background: linear-gradient(135deg, #2ecc71, #27ae60); border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; font-size: 0.9rem;" onclick="window.Auth.updateProfile()">
                                <i class="fas fa-save"></i> Saqlash
                            </button>
                            <button style="flex: 1; padding: 12px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.7); border-radius: 10px; cursor: pointer; font-size: 0.9rem;"
                                onclick="document.getElementById('profile-update-form').style.display='none'; document.getElementById('showProfileFormBtn').style.display='flex';">
                                <i class="fas fa-times"></i> Bekor qilish
                            </button>
                        </div>
                    </div>
                    <button id="showProfileFormBtn" style="width: 100%; padding: 12px; margin-bottom: 15px; background: rgba(46,204,113,0.1); border: 1px solid rgba(46,204,113,0.25); border-radius: 10px; color: #2ecc71; cursor: pointer; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s;"
                        onclick="document.getElementById('profile-update-form').style.display='block'; this.style.display='none';">
                        <i class="fas fa-user-edit"></i> Profilni tahrirlash
                    </button>

                    <div id="password-change-form" style="display: none;">
                        <input type="password" id="currentPasswordInput" placeholder="Joriy parol" 
                            style="width: 100%; padding: 12px 16px; margin-bottom: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: white; font-size: 0.9rem; box-sizing: border-box; outline: none; transition: border 0.3s;"
                            onfocus="this.style.borderColor='rgba(0,198,255,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.15)'">
                        <input type="password" id="newPasswordInput" placeholder="Yangi parol (kamida 6 ta belgi)" 
                            style="width: 100%; padding: 12px 16px; margin-bottom: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: white; font-size: 0.9rem; box-sizing: border-box; outline: none; transition: border 0.3s;"
                            onfocus="this.style.borderColor='rgba(0,198,255,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.15)'">
                        <input type="password" id="confirmPasswordInput" placeholder="Yangi parolni tasdiqlang" 
                            style="width: 100%; padding: 12px 16px; margin-bottom: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: white; font-size: 0.9rem; box-sizing: border-box; outline: none; transition: border 0.3s;"
                            onfocus="this.style.borderColor='rgba(0,198,255,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.15)'">
                        <div style="display: flex; gap: 10px;">
                            <button style="flex: 1; padding: 12px; background: linear-gradient(135deg, #00c6ff, #0072ff); border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; font-size: 0.9rem; transition: all 0.3s;" onclick="window.Auth.changePassword()">
                                <i class="fas fa-save"></i> Saqlash
                            </button>
                            <button style="flex: 1; padding: 12px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.7); border-radius: 10px; cursor: pointer; font-size: 0.9rem; transition: all 0.3s;"
                                onclick="document.getElementById('password-change-form').style.display='none'; document.getElementById('showPasswordFormBtn').style.display='flex';">
                                <i class="fas fa-times"></i> Bekor qilish
                            </button>
                        </div>
                    </div>
                    <button id="showPasswordFormBtn" style="width: 100%; padding: 12px; background: rgba(0,198,255,0.1); border: 1px solid rgba(0,198,255,0.25); border-radius: 10px; color: #00c6ff; cursor: pointer; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s;"
                        onclick="document.getElementById('password-change-form').style.display='block'; this.style.display='none';"
                        onmouseover="this.style.background='rgba(0,198,255,0.2)'" onmouseout="this.style.background='rgba(0,198,255,0.1)'">
                        <i class="fas fa-key"></i> Parolni o'zgartirish
                    </button>
                </div>

                <!-- Logout Button -->
                <button style="width: 100%; padding: 14px; background: rgba(231,76,60,0.08); border: 1px solid rgba(231,76,60,0.25); border-radius: 12px; color: #e74c3c; cursor: pointer; font-size: 0.95rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 15px; transition: all 0.3s;"
                    onclick="window.Auth.logout()"
                    onmouseover="this.style.background='rgba(231,76,60,0.2)'" onmouseout="this.style.background='rgba(231,76,60,0.08)'">
                    <i class="fas fa-sign-out-alt"></i> Tizimdan chiqish
                </button>

                <!-- System Info Footer -->
                <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
                    <p style="margin: 0; font-size: 0.75rem; color: rgba(255,255,255,0.3);">
                        <i class="fas fa-code-branch"></i> SMART PCH v2.0 &bull; 
                        <i class="fas fa-server"></i> Tizim ishlayapti &bull;
                        <i class="fas fa-lock"></i> Xavfsiz ulanish
                    </p>
                </div>
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
    },

    async sendBroadcast() {
        const title = document.getElementById('broadcastTitle').value;
        const message = document.getElementById('broadcastMessage').value;
        const priority = document.getElementById('broadcastPriority').value;

        if (!message.trim()) {
            showToast("Xabar matnini kiriting!", "error");
            return;
        }

        try {
            const response = await fetch('/api/broadcast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                },
                body: JSON.stringify({ title, message, priority })
            });

            const data = await response.json();
            if (response.ok) {
                showToast("Xabar barcha foydalanuvchilarga yuborildi!", "success");
                document.getElementById('broadcastTitle').value = '';
                document.getElementById('broadcastMessage').value = '';
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error("Broadcast failed:", error);
            showToast(error.message, "error");
        }
    },

    async updateProfile() {
        const full_name = document.getElementById('updateNameInput')?.value;
        const phone = document.getElementById('updatePhoneInput')?.value;
        const avatar = document.getElementById('updateAvatarInput')?.value;

        try {
            const response = await SmartUtils.fetchAPI('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify({ full_name, phone, avatar })
            });

            if (response) {
                showToast('Profil muvaffaqiyatli yangilandi!', 'success');

                // Update local storage
                this.currentUser.name = full_name || this.currentUser.name;
                this.currentUser.phone = phone || this.currentUser.phone;
                this.currentUser.avatar = avatar || this.currentUser.avatar;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

                // Re-render UI
                if (document.getElementById('userName')) {
                    document.getElementById('userName').textContent = this.currentUser.name;
                }
                const avatarEl = document.getElementById('userAvatar');
                if (avatarEl) {
                    if (this.currentUser.avatar) {
                        avatarEl.innerHTML = `<img src="${this.currentUser.avatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
                    } else {
                        avatarEl.textContent = this.currentUser.name[0].toUpperCase();
                    }
                }

                // Re-render modal details without cloning
                setTimeout(() => this.openUserProfile(), 100);
            }
        } catch (error) {
            showToast(error.message || 'Profil yangilashda xatolik', 'error');
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
