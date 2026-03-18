/**
 * SMART PCH - Global Search System
 */

function initGlobalSearch() {
    const input = document.getElementById('globalSearchInput');
    const resultsDropdown = document.getElementById('searchResults');

    if (!input || !resultsDropdown) return;

    input.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (query.length < 2) {
            resultsDropdown.classList.remove('active');
            return;
        }

        const results = searchEverything(query);
        displaySearchResults(results, resultsDropdown);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.global-search-container')) {
            resultsDropdown.classList.remove('active');
        }
    });
}

function searchEverything(query) {
    let results = [];

    // 1. Workers
    if (typeof hrData !== 'undefined' && hrData.employees) {
        hrData.employees.forEach(emp => {
            if (emp.name.toLowerCase().includes(query) || (emp.position && emp.position.toLowerCase().includes(query))) {
                results.push({ type: 'worker', name: emp.name, meta: emp.position + ' - ' + emp.department, icon: 'fa-user-tie' });
            }
        });
    } else if (typeof workersData !== 'undefined') {
        workersData.forEach(worker => {
            if (worker.name.toLowerCase().includes(query) || worker.role.toLowerCase().includes(query)) {
                results.push({ type: 'worker', name: worker.name, meta: worker.role + ' - ' + worker.bolinma, icon: 'fa-user-tie' });
            }
        });
    }

    // 2. Trains
    if (typeof trainsData !== 'undefined') {
        trainsData.forEach(train => {
            if (train.number.toLowerCase().includes(query) || train.route.toLowerCase().includes(query)) {
                results.push({ type: 'train', name: train.number, meta: train.route, icon: 'fa-train' });
            }
        });
    }

    return results.slice(0, 8);
}

function displaySearchResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = '<div class="search-item"><div class="search-item-info"><span class="search-item-name">Hech narsa topilmadi</span></div></div>';
    } else {
        container.innerHTML = results.map(item => `
            <div class="search-item" onclick="handleSearchClick('${item.type}', '${item.name}')">
                <i class="fas ${item.icon}"></i>
                <div class="search-item-info">
                    <span class="search-item-name">${item.name}</span>
                    <span class="search-item-meta">${item.meta}</span>
                </div>
            </div>
        `).join('');
    }
    container.classList.add('active');
}

function handleSearchClick(type, name) {
    showToast(`Navigatsiya: ${name}`, 'info');
    document.getElementById('searchResults').classList.remove('active');
    document.getElementById('globalSearchInput').value = '';

    if (type === 'train') {
        if (typeof openRailwayMapModal === 'function') openRailwayMapModal();
    }
}

// Global initialization
window.initGlobalSearch = initGlobalSearch;
window.handleSearchClick = handleSearchClick;
