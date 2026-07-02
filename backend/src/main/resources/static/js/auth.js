/* InterviewAI Authentication Manager */
const Auth = {
    // Save session payload
    saveSession(authResponse) {
        localStorage.setItem('token', authResponse.token);
        localStorage.setItem('email', authResponse.email);
        localStorage.setItem('fullName', authResponse.fullName);
        localStorage.setItem('role', authResponse.role);
    },

    // Check if token exists
    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    // Get current user payload
    getCurrentUser() {
        return {
            email: localStorage.getItem('email'),
            fullName: localStorage.getItem('fullName'),
            role: localStorage.getItem('role')
        };
    },

    // Check if user is Admin
    isAdmin() {
        return localStorage.getItem('role') === 'ROLE_ADMIN';
    },

    // Logout and purge session
    logout() {
        localStorage.clear();
        window.location.href = 'login.html';
    },

    // Redirect guest users away from protected screens
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
        }
    },

    // Redirect logged-in users away from guest-only screens
    redirectIfAuthenticated() {
        if (this.isAuthenticated()) {
            window.location.href = 'dashboard.html';
        }
    },

    // Render global premium glassmorphic navigation header dynamically
    renderNavBar() {
        const nav = document.querySelector('.navbar');
        if (!nav) return;

        const user = this.getCurrentUser();
        const isLoggedIn = this.isAuthenticated();

        let navLinksHTML = `
            <li><a href="index.html" class="nav-link">Home</a></li>
        `;

        if (isLoggedIn) {
            navLinksHTML += `
                <li><a href="dashboard.html" class="nav-link" id="nav-dashboard">Dashboard</a></li>
                <li><a href="interview.html" class="nav-link" id="nav-interview">Mock Arena</a></li>
                <li><a href="profile.html" class="nav-link" id="nav-profile">Profile & ATS</a></li>
            `;

            if (user.role === 'ROLE_ADMIN') {
                navLinksHTML += `
                    <li><a href="admin.html" class="nav-link" id="nav-admin">Admin Panel</a></li>
                `;
            }
        }

        const isLight = localStorage.getItem('theme') === 'light';
        let navActionsHTML = `
            <button class="theme-toggle">${isLight ? '🌙' : '☀️'}</button>
        `;

        if (isLoggedIn) {
            navActionsHTML += `
                <span class="user-greeting" style="font-size: 0.9rem; color: var(--text-secondary);">Hi, ${user.fullName.split(' ')[0]}</span>
                <button class="btn btn-secondary" onclick="Auth.logout()" style="padding: 8px 16px; font-size: 0.85rem;">Logout</button>
            `;
        } else {
            // Check if current page is login, if so show Register button, otherwise show Login
            const isLoginPage = window.location.pathname.includes('login.html');
            if (isLoginPage) {
                navActionsHTML += `
                    <a href="register.html" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.85rem;">Register</a>
                `;
            } else {
                navActionsHTML += `
                    <a href="login.html" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.85rem;">Login</a>
                `;
            }
        }

        nav.innerHTML = `
            <a href="index.html" class="nav-logo">InterviewAI</a>
            <ul class="nav-links">
                ${navLinksHTML}
            </ul>
            <div class="nav-actions">
                ${navActionsHTML}
            </div>
        `;

        // Highlight active page link
        const currentPath = window.location.pathname;
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (currentPath.endsWith(href)) {
                link.classList.add('active');
                link.style.color = 'var(--text-primary)';
                link.style.borderBottom = '2px solid var(--primary)';
            }
        });
    }
};

// Auto wire page protections and navbars
document.addEventListener('DOMContentLoaded', () => {
    const isProtected = ['dashboard.html', 'interview.html', 'result.html', 'profile.html', 'admin.html']
        .some(path => window.location.pathname.endsWith(path));

    const isGuestOnly = ['login.html', 'register.html']
        .some(path => window.location.pathname.endsWith(path));

    if (isProtected) {
        Auth.requireAuth();
    }

    if (isGuestOnly) {
        Auth.redirectIfAuthenticated();
    }

    // Auto-render navbar if element exists
    Auth.renderNavBar();
});
