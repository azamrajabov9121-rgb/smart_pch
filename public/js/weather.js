/**
 * SMART PCH - Weather System Module (Buxoro Region)
 */

// Use var to avoid redeclaration errors with script.js
var weatherData = weatherData || null;
var currentWeatherView = currentWeatherView || 'current';

async function loadWeatherData() {
    try {
        const weatherContainer = document.querySelector('.weather-container');
        if (!weatherContainer) return;

        // Caching mechanism: Avoid redundant requests if data is fresh (within 10 minutes)
        const cached = localStorage.getItem('lastWeatherData');
        const lastFetch = localStorage.getItem('lastWeatherFetchTime');
        const now = Date.now();

        if (cached && lastFetch && (now - lastFetch < 10 * 60 * 1000)) {
            weatherData = JSON.parse(cached);
            renderWeather();
            return;
        }

        weatherContainer.innerHTML = `<div class="weather-loading"><i class="fas fa-spinner fa-spin"></i> Havo ma'lumotlari yuklanmoqda...</div>`;

        const lat = 39.7075; // Yangibozor, Buxoro
        const lon = 64.0900;

        // window.CONFIG already defines appropriate URLs
        const response = await fetch(`${window.CONFIG.API_URL}/weather?lat=${lat}&lon=${lon}`);
        if (!response.ok) throw new Error('API Error');

        const data = await response.json();
        weatherData = {
            current: data,
            hourly: [],
            daily: []
        };

        // Save to cache
        localStorage.setItem('lastWeatherData', JSON.stringify(weatherData));
        localStorage.setItem('lastWeatherFetchTime', now.toString());

        renderWeather();
    } catch (error) {
        console.error('Weather load error:', error);
        useFallbackWeather();
    }
}

function useFallbackWeather() {
    weatherData = {
        current: {
            main: { temp: 8, feels_like: 5, humidity: 70, pressure: 1015 },
            wind: { speed: 12, deg: 320 },
            weather: [{ description: 'qisman bulutli', icon: '02d', main: 'Clouds' }],
            dt: Math.floor(Date.now() / 1000)
        }
    };
    renderWeather();
}

function renderWeather() {
    const container = document.querySelector('.weather-container');
    if (!container || !weatherData) return;

    if (currentWeatherView === 'current') renderCurrentWeather(container);
    else if (currentWeatherView === 'hourly') renderHourlyForecast(container);
    else if (currentWeatherView === 'daily') renderDailyForecast(container);
}

function renderCurrentWeather(container) {
    const data = weatherData.current;
    const temp = Math.round(data.main.temp);

    container.innerHTML = `
        <div class="weather-card">
            <div class="weather-icon"><i class="${getWeatherIcon(data.weather[0].icon)}"></i></div>
            <div class="weather-temp">${temp}°C</div>
            <div class="weather-desc">${data.weather[0].description}</div>
            <div class="weather-details">
                <div class="weather-detail"><span>Hissiyot</span><span>${Math.round(data.main.feels_like)}°C</span></div>
                <div class="weather-detail"><span>Namlik</span><span>${data.main.humidity}%</span></div>
            </div>
        </div>
    `;
}

function getWeatherIcon(iconCode) {
    const icons = {
        '01d': 'fas fa-sun', '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun', '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud', '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud-meatball', '04n': 'fas fa-cloud-meatball',
        '09d': 'fas fa-cloud-showers-heavy', '10d': 'fas fa-cloud-rain',
        '11d': 'fas fa-bolt', '13d': 'fas fa-snowflake', '50d': 'fas fa-smog'
    };
    return icons[iconCode] || 'fas fa-cloud';
}

// Global Exports
window.loadWeatherData = loadWeatherData;
window.renderWeather = renderWeather;
