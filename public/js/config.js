/**
 * SMART PCH - Global Configuration
 * Dynamically detects environment (Web, Electron, or Production)
 */

window.CONFIG = {
    APP_NAME: "Smart PCH Dispatcher",
    VERSION: "2.1.0",

    // API URL Detection
    API_URL: (function () {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isElectron = navigator.userAgent.toLowerCase().includes('electron');
        const savedApiUrl = localStorage.getItem('custom_api_url');

        if (savedApiUrl) return savedApiUrl;

        // Agar Electron bo'lsa va local ishlayotgan bo'lsa
        if (isElectron || isLocal) {
            return 'http://localhost:5000/api';
        }

        // Production (Online sayt)
        return window.location.origin + '/api';
    })(),

    // WebSocket URL Detection
    WS_URL: (function () {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isElectron = navigator.userAgent.toLowerCase().includes('electron');

        if (isElectron || isLocal) {
            return 'http://localhost:5000';
        }
        return window.location.origin;
    })(),

    // Map Coordinates (Bukhara Central)
    BUKHARA_COORDS: {
        lat: 39.7681,
        lon: 64.4556
    }
};

console.log(`[Config] Running on ${navigator.userAgent.toLowerCase().includes('electron') ? 'Desktop (Electron)' : 'Web/Mobile'}`);
console.log(`[Config] API Endpoint: ${window.CONFIG.API_URL}`);
