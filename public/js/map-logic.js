/**
 * SMART PCH - Real-time Map & Tracking System
 */

// Use var to avoid redeclaration errors with script.js
var liveMap = liveMap || null;
var trainLiveMap = trainLiveMap || null;
var subdivisionMarkers = subdivisionMarkers || [];
var trainMarkers = trainMarkers || [];
var workerMarkers = workerMarkers || [];
var routePolylines = routePolylines || [];

// 1. Overview Live Map
function createLiveMap() {
    const mapContainer = document.getElementById('live-map');
    if (!mapContainer) return;

    liveMap = L.map('live-map').setView([41.3111, 69.2797], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(liveMap);

    updateMapMarkers();

    setInterval(() => {
        if (typeof updateSubdivisionLocations === 'function') updateSubdivisionLocations();
        updateMapMarkers();
    }, 10000);
}

function updateMapMarkers() {
    if (!liveMap) return;
    subdivisionMarkers.forEach(marker => liveMap.removeLayer(marker));
    subdivisionMarkers = [];

    if (typeof subdivisions === 'undefined') return;

    subdivisions.forEach(sub => {
        const marker = L.marker([sub.location.lat, sub.location.lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: `<div style="background: ${getDepartmentColor(sub.department)}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white;">${sub.name.substring(0, 1)}</div>`
            })
        }).addTo(liveMap);

        marker.bindPopup(`
            <div style="color: #333;">
                <strong>${sub.name}</strong><br>
                <strong>Mas'ul:</strong> ${sub.manager}<br>
                <strong>Bo'lim:</strong> ${getDepartmentName(sub.department)}<br>
                <strong>Holat:</strong> Faol
            </div>
        `);
        subdivisionMarkers.push(marker);
    });
}

function updateSubdivisionLocations() {
    if (typeof subdivisions === 'undefined') return;
    subdivisions.forEach(sub => {
        sub.location.lat += (Math.random() - 0.5) * 0.01;
        sub.location.lng += (Math.random() - 0.5) * 0.01;
        sub.location.lat = Math.max(36, Math.min(45, sub.location.lat));
        sub.location.lng = Math.max(56, Math.min(73, sub.location.lng));
    });
}

// 2. Specialized Train Radar Map
function initTrainLiveMap() {
    const container = document.getElementById('trainLiveMap');
    if (!container) return;

    if (trainLiveMap) trainLiveMap.remove();

    trainLiveMap = L.map('trainLiveMap').setView([39.9, 65.8], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(trainLiveMap);

    addStationMarkers();

    if (typeof trainRoutePoints !== 'undefined' && trainRoutePoints.length > 1) {
        L.polyline(trainRoutePoints, {
            color: '#ffd700',
            weight: 4,
            opacity: 0.8
        }).addTo(trainLiveMap);
    }

    addTrainMarkers();
    addWorkerMarkers();
    if (typeof loadTrainSchedule === 'function') loadTrainSchedule();
    if (typeof loadWorkersOnline === 'function') loadWorkersOnline();

    setInterval(() => {
        if (typeof updatePositions === 'function') updatePositions();
    }, 3000);
}

function addStationMarkers() {
    if (!trainLiveMap || typeof stationsData === 'undefined') return;
    stationsData.forEach(station => {
        const marker = L.marker([station.lat, station.lng], {
            icon: L.divIcon({
                className: 'station-marker',
                html: `<div style="background: #e74c3c; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);">
                    <i class="fas fa-map-marker-alt" style="color: white; font-size: 12px;"></i>
                </div>`
            })
        }).addTo(trainLiveMap);
        marker.bindPopup(`<div style="text-align: center;"><strong>${station.name}</strong><br>${station.bolinma}-bo'linma</div>`);
    });
}

function addTrainMarkers() {
    if (!trainLiveMap || typeof trainsData === 'undefined') return;
    trainMarkers.forEach(m => trainLiveMap.removeLayer(m));
    trainMarkers = [];

    trainsData.forEach(train => {
        const marker = L.marker([train.lat, train.lng], {
            icon: L.divIcon({
                className: 'train-marker',
                html: `<div style="background: #ffd700; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);">
                    <i class="fas fa-train" style="color: #1a2a3a;"></i>
                </div>`
            })
        }).addTo(trainLiveMap);
        marker.bindPopup(`<div style="text-align: center;"><strong>${train.number}</strong><br>${train.route}</div>`);
        trainMarkers.push(marker);
    });
}

function addWorkerMarkers() {
    if (!trainLiveMap || typeof workersData === 'undefined') return;
    workerMarkers.forEach(m => trainLiveMap.removeLayer(m));
    routePolylines.forEach(p => trainLiveMap.removeLayer(p));
    workerMarkers = [];
    routePolylines = [];

    workersData.forEach(worker => {
        const marker = L.marker([worker.lat, worker.lng], {
            icon: L.divIcon({
                className: 'worker-marker-icon',
                html: `<div class="worker-marker" style="background: ${worker.color};">${worker.name.charAt(0)}</div>`
            })
        }).addTo(trainLiveMap);
        marker.bindPopup(`<div style="text-align: center;"><strong>${worker.name}</strong><br>${worker.bolinma}</div>`);
        workerMarkers.push(marker);

        if (typeof workerRoutes !== 'undefined' && workerRoutes[worker.id]) {
            const polyline = L.polyline(workerRoutes[worker.id], {
                color: worker.color, weight: 3, opacity: 0.7, dashArray: '5, 10'
            }).addTo(trainLiveMap);
            routePolylines.push(polyline);
        }
    });
}

function updatePositions() {
    if (typeof trainsData !== 'undefined') {
        trainsData.forEach(train => {
            train.lat += (Math.random() - 0.5) * 0.005;
            train.lng += (Math.random() - 0.5) * 0.005;
        });
        addTrainMarkers();
    }
    if (typeof workersData !== 'undefined') {
        workersData.forEach(worker => {
            worker.lat += (Math.random() - 0.5) * 0.002;
            worker.lng += (Math.random() - 0.5) * 0.002;
        });
        addWorkerMarkers();
    }
}

// Global Helpers (If needed elsewhere)
window.createLiveMap = createLiveMap;
window.initTrainLiveMap = initTrainLiveMap;
window.updateMapMarkers = updateMapMarkers;
window.addTrainMarkers = addTrainMarkers;
window.addWorkerMarkers = addWorkerMarkers;
