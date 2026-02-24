function showLogin() {
    const landing = document.getElementById('landingPage');
    const login = document.getElementById('loginPage');

    // Add a fade out effect to landing
    landing.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    landing.style.opacity = '0';
    landing.style.transform = 'scale(1.1) translateY(-30px)';

    setTimeout(() => {
        landing.style.display = 'none';
        login.style.display = 'flex';
        login.style.opacity = '0';
        login.style.transform = 'scale(0.9)';
        login.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

        // Trigger reflow
        login.offsetHeight;

        login.style.opacity = '1';
        login.style.transform = 'scale(1)';
    }, 600);
}

// Check if user is already logged in (optional, usually handled by auth.js)
// window.addEventListener('DOMContentLoaded', () => {
//     if (localStorage.getItem('token')) {
//         document.getElementById('landingPage').style.display = 'none';
//         // auth.js will handle the rest
//     }
// });
