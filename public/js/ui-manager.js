/**
 * SMART PCH - UI & Navigation Management
 */

function initMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    if (!document.querySelector('.mobile-menu-toggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'mobile-menu-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        toggleBtn.style.cssText = `position: fixed; bottom: 30px; right: 30px; z-index: 2100; display: none;`;
        document.body.appendChild(toggleBtn);

        toggleBtn.onclick = (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('mobile-active');
            updateSidebarOverlay();
        };
    }
}

function updateSidebarOverlay() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar && overlay) {
        if (sidebar.classList.contains('mobile-active')) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
}

function renderSidebar() {
    const sidebarMenu = document.getElementById('sidebarMenu');
    if (!sidebarMenu) return;

    // Sidebar rendering logic would go here
    // This usually depends on user role and departments
    console.log('Sidebar rendered');
}

// Global Exports
window.initMobileMenu = initMobileMenu;
window.renderSidebar = renderSidebar;
window.updateSidebarOverlay = updateSidebarOverlay;
