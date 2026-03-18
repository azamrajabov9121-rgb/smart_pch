/**
 * SMART PCH - Global Configuration
 * Web Environment Configuration
 */

window.CONFIG = {
    APP_NAME: "Smart PCH Dispatcher",
    VERSION: "2.1.0",

    // API URL Detection
    API_URL: (function () {
        const isLocal = window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.startsWith('192.168.') ||
            window.location.hostname.startsWith('10.') ||
            window.location.hostname.startsWith('172.');
        const savedApiUrl = localStorage.getItem('custom_api_url');

        if (savedApiUrl) return savedApiUrl;

        // Web (Brauzer) rejimida
        if (window.location.protocol.startsWith('http')) {
            if (isLocal) {
                // Localhostda 5050-portga murojaat qilish
                return `http://${window.location.hostname}:5050/api`;
            }
            return window.location.origin + '/api';
        }

        return '/api';
    })(),

    // WebSocket URL Detection
    WS_URL: (function () {
        const isLocal = window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.startsWith('192.168.') ||
            window.location.hostname.startsWith('10.') ||
            window.location.hostname.startsWith('172.');

        if (window.location.protocol.startsWith('http')) {
            if (isLocal) {
                return `http://${window.location.hostname}:5050`;
            }
            return window.location.origin;
        }

        return window.location.origin;
    })(),

    // Map Coordinates (Bukhara Central)
    BUKHARA_COORDS: {
        lat: 39.7681,
        lon: 64.4556
    }
};

console.log(`[Config] Running on Web/Mobile`);
console.log(`[Config] API Endpoint: ${window.CONFIG.API_URL}`);
