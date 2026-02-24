/**
 * SMART PCH - Utility Module
 * Contains Shared Helpers and Global Notification System
 */

const SmartUtils = {
    /**
     * Central API Fetch Wrapper
     * Automatically handles Base URL, JWT Token, and JSON conversion
     */
    fetchAPI: async function (endpoint, options = {}) {
        const baseUrl = window.CONFIG?.API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('jwtToken');

        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(options.headers || {})
        };

        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                ...options,
                headers
            });

            if (response.status === 401) {
                // Token expired or invalid - faqat token mavjud bo'lsa logout qilamiz
                // Aks holda (login qilinmagan holat) cheksiz reload loop yuzaga keladi
                const existingToken = localStorage.getItem('jwtToken');
                if (existingToken) {
                    console.warn('Token muddati tugagan yoki noto\'g\'ri. Tizimdan chiqilmoqda...');
                    window.Auth?.logout?.();
                }
                return null;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Call failed (${endpoint}):`, error);
            throw error;
        }
    },

    /**
     * Toast Notification System
     * @param {string} message - The message to show
     * @param {string} type - 'success', 'error', 'info', 'warning'
     * @param {number} duration - Milliseconds to show the toast
     */
    showToast: function (message, type = 'info', duration = 4000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" type="button">&times;</button>
        `;

        container.appendChild(toast);

        // Auto remove duration
        const timer = setTimeout(() => {
            SmartUtils.removeToast(toast);
        }, duration);

        // Manual close
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.onclick = (e) => {
                e.stopPropagation();
                clearTimeout(timer);
                SmartUtils.removeToast(toast);
            };
        }
    },

    removeToast: function (toast) {
        if (!toast) return;
        toast.classList.add('toast-outgoing');

        // Majburiy o'chirish (Fail-safe) - agar animatsiya ishlamay qolsa
        const forceRemove = setTimeout(() => {
            if (toast && toast.parentNode) toast.remove();
        }, 600);

        toast.addEventListener('animationend', () => {
            clearTimeout(forceRemove);
            if (toast && toast.parentNode) toast.remove();
        }, { once: true });
    },

    /**
     * Data Persistence Wrapper (Electron FS + LocalStorage Fallback)
     */
    save: async function (key, data) {
        try {
            // 1. Try Server Save - faqat autentifikatsiya qilingan bo'lsa
            const token = localStorage.getItem('jwtToken');
            if (token) {
                await this.fetchAPI('/storage/save', {
                    method: 'POST',
                    body: JSON.stringify({ key, data })
                }).catch(e => console.warn('Server storage failed, falling back to local', e));
            }

            // 2. Electron Fallback
            if (window.electron && window.electron.saveData) {
                await window.electron.saveData(`${key}.json`, data);
            }

            // 3. LocalStorage Fallback
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Storage Save Error:', e);
            localStorage.setItem(key, JSON.stringify(data));
            return false;
        }
    },

    load: async function (key, defaultValue = null) {
        try {
            // 1. Try Server Load - faqat autentifikatsiya qilingan bo'lsa
            // Token yo'q bo'lsa server chaqirilmaydi (cheksiz reload loop oldini oladi)
            const token = localStorage.getItem('jwtToken');
            if (token) {
                const serverData = await this.fetchAPI(`/storage/load/${key}`).catch(() => null);
                if (serverData) return serverData;
            }

            // 2. Electron Fallback
            if (window.electron && window.electron.loadData) {
                const fileData = await window.electron.loadData(`${key}.json`);
                if (fileData) return fileData;
            }

            // 3. LocalStorage Fallback
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Storage Load Error:', e);
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        }
    },

    /**
     * Formatting Helpers
     */
    formatDate: function (dateStr) {
        return new Date(dateStr).toLocaleDateString('uz-UZ');
    },

    formatTime: function (dateStr) {
        return new Date(dateStr).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    },
    /**
     * Data Backup & Restore System
     */
    backupData: function () {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data[key] = localStorage.getItem(key);
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SmartPCH_Backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Ma\'lumotlar muvaffaqiyatli arxivlandi!', 'success');
    },

    restoreData: function (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                Object.keys(data).forEach(key => {
                    localStorage.setItem(key, data[key]);
                });
                showToast('Ma\'lumotlar tiklandi! Sahifani yangilang.', 'success');
                setTimeout(() => location.reload(), 2000);
            } catch (err) {
                showToast('Faylni o\'qib bo\'lmadi!', 'error');
            }
        };
        reader.readAsText(file);
    },

    /**
     * Form Validation Helper
     */
    validateInput: function (value, type) {
        if (!value || value.trim() === '') return false;

        const patterns = {
            tel: /^(\+998|998)?\d{9}$/,
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            number: /^\d+$/
        };

        if (patterns[type]) {
            return patterns[type].test(value.replace(/\s/g, ''));
        }
        return true;
    },

    /**
     * Professional PDF Export System
     * @param {HTMLElement|string} element - Element or ID to export
     * @param {string} fileName - Name of the file
     * @param {Object} options - Custom options (title, subtitle)
     */
    exportToPDF: function (element, fileName = 'Hisobot', options = {}) {
        const target = typeof element === 'string' ? document.getElementById(element) : element;
        if (!target) {
            showToast('Eksport uchun ma\'lumot topilmadi!', 'error');
            return;
        }

        showToast('PDF tayyorlanmoqda...', 'info');

        // Create a temporary container for styling the report
        const printContainer = document.createElement('div');
        printContainer.className = 'pdf-report-template';
        printContainer.innerHTML = `
            <div class="report-header">
                <div class="header-logo">
                    <img src="img/logo.png" style="width: 80px; height: 80px;">
                </div>
                <div class="header-text">
                    <h2>O'ZBEKISTON TEMIR YO'LLARI</h2>
                    <h3>"QORLITOG' TEMIR YO'L MASOFASI" FILIALI</h3>
                    <div class="report-title-box">
                        <h1 class="report-main-title">${options.title || 'RASMIY HISOBOT'}</h1>
                        <p class="report-subtitle">${options.subtitle || ''}</p>
                    </div>
                </div>
            </div>
            <div class="report-content">
                ${target.innerHTML}
            </div>
            <div class="report-footer">
                <div class="footer-signatures">
                    <div class="signature">
                        <p>Mas'ul shaxs:</p>
                        <div class="sign-line"></div>
                        <p>${currentUser ? currentUser.name : '________________'}</p>
                    </div>
                    <div class="signature">
                        <p>Sana:</p>
                        <div class="sign-line"></div>
                        <p>${this.formatDate(new Date())}</p>
                    </div>
                </div>
                <div class="footer-stamp">
                    <div class="stamp-placeholder">M.O'. (Muhr o'rni)</div>
                </div>
            </div>
        `;

        const pdfOptions = {
            margin: [10, 10, 10, 10],
            filename: `${fileName}_${new Date().getTime()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(pdfOptions).from(printContainer).save().then(() => {
            showToast('PDF muvaffaqiyatli yuklab olindi!', 'success');
        }).catch(err => {
            console.error('PDF Error:', err);
            showToast('PDF yaratishda xatolik yuz berdi!', 'error');
        });
    },

    /**
     * Empty State Template Generator
 */
    getEmptyState: function (message = "Ma'lumot topilmadi") {
        return `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>${message}</p>
            </div>
        `;
    }
};


// Global shorthand
window.showToast = (msg, type, duration) => SmartUtils.showToast(msg, type, duration);
window.backupSystemData = () => SmartUtils.backupData();

/**
 * Check Authentication State
 * Restores saved user session or shows login page
 */
function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            if (user && user.username) {
                // User session exists - let DOMContentLoaded in script.js handle actual restoration
                console.log('Auth: Session found for', user.username);
            }
        } catch (e) {
            console.warn('Auth: Invalid session data, clearing.');
            localStorage.removeItem('currentUser');
        }
    }
}

/**
 * Global Initialization Sequence
 */
function initSmartSystem() {
    console.log('Smart PCH System Initializing...');

    // Setup Backup Button
    const backupBtn = document.getElementById('backupDataBtn');
    if (backupBtn) {
        backupBtn.onclick = () => window.backupSystemData();
    }

    // Check authentication
    if (typeof checkAuth === 'function') {
        checkAuth();
    }

    // Setup theme elements
    document.body.classList.add('system-ready');

    // Loading spinner yaratish
    SmartUtils.createLoadingSpinner();

    // Global error handler
    SmartUtils.setupGlobalErrorHandler();
}

/**
 * Loading Spinner System
 */
SmartUtils.createLoadingSpinner = function () {
    if (document.getElementById('global-loading-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'global-loading-overlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px);
        display: none; align-items: center; justify-content: center;
        z-index: 999999; transition: opacity 0.3s;
    `;
    overlay.innerHTML = `
        <div style="text-align: center; color: white;">
            <div style="width: 50px; height: 50px; border: 3px solid rgba(0,198,255,0.2);
                border-top: 3px solid #00c6ff; border-radius: 50%;
                animation: spin 0.8s linear infinite; margin: 0 auto 15px;"></div>
            <p id="loading-text" style="font-family: 'Inter', sans-serif; font-size: 0.9rem;
                color: rgba(255,255,255,0.8);">Yuklanmoqda...</p>
        </div>
    `;
    document.body.appendChild(overlay);

    // Spin animatsiyasi
    if (!document.getElementById('loading-spin-style')) {
        const style = document.createElement('style');
        style.id = 'loading-spin-style';
        style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
        document.head.appendChild(style);
    }
};

SmartUtils.showLoading = function (text = 'Yuklanmoqda...') {
    const overlay = document.getElementById('global-loading-overlay');
    const loadingText = document.getElementById('loading-text');
    if (overlay) {
        overlay.style.display = 'flex';
        if (loadingText) loadingText.textContent = text;
    }
};

SmartUtils.hideLoading = function () {
    const overlay = document.getElementById('global-loading-overlay');
    if (overlay) overlay.style.display = 'none';
};

// Global shorthand
window.showLoading = (text) => SmartUtils.showLoading(text);
window.hideLoading = () => SmartUtils.hideLoading();

/**
 * Global Error Handler
 */
SmartUtils.setupGlobalErrorHandler = function () {
    // Unhandled JS errors
    window.addEventListener('error', (event) => {
        console.error('Global Error:', event.error);
        // Foydalanuvchiga ko'rsatish (faqat muhim xatolar)
        if (event.error && event.error.message && !event.error.message.includes('Script error')) {
            SmartUtils.showToast('Tizimda xatolik yuz berdi: ' + event.error.message, 'error');
        }
    });

    // Unhandled Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled Promise Rejection:', event.reason);
        const msg = event.reason?.message || 'Noma\'lum xatolik';
        if (msg.includes('Failed to fetch')) {
            SmartUtils.showToast('Server bilan aloqa yo\'q. Internet yoki serverni tekshiring.', 'error');
        }
    });
};
