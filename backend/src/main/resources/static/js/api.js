/* InterviewAI Client API Utility Wrapper */
const API_BASE_URL = 'http://localhost:8080/api';

const API = {
    // Show global loader overlay
    showLoader() {
        let loader = document.getElementById('global-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.innerHTML = '<div class="loader-spinner"></div>';
            document.body.appendChild(loader);
        }
        loader.style.opacity = '1';
        loader.style.display = 'flex';
    },

    // Hide global loader overlay
    hideLoader() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 300);
        }
    },

    // Display a beautiful visual toast message
    showToast(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type} glass-panel`;
        toast.innerHTML = `
            <div class="toast-content">${message}</div>
        `;

        container.appendChild(toast);

        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4000);
    },

    getHeaders(isMultipart = false) {
        const headers = {};
        if (!isMultipart) {
            headers['Content-Type'] = 'application/json';
        }
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    async handleResponse(response) {
        if (response.status === 401) {
            localStorage.clear();
            this.showToast('Session expired. Please log in again.', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            throw new Error('Unauthorized');
        }

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const errorMsg = data.message || `API error (${response.status})`;
            this.showToast(errorMsg, 'error');
            throw new Error(errorMsg);
        }
        return data;
    },

    async get(endpoint, silent = false) {
        if (!silent) this.showLoader();
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } finally {
            if (!silent) this.hideLoader();
        }
    },

    async post(endpoint, body = {}, silent = false) {
        if (!silent) this.showLoader();
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });
            return await this.handleResponse(response);
        } finally {
            if (!silent) this.hideLoader();
        }
    },

    async put(endpoint, body = {}, silent = false) {
        if (!silent) this.showLoader();
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });
            return await this.handleResponse(response);
        } finally {
            if (!silent) this.hideLoader();
        }
    },

    async delete(endpoint, silent = false) {
        if (!silent) this.showLoader();
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } finally {
            if (!silent) this.hideLoader();
        }
    },

    async uploadFile(endpoint, file, silent = false) {
        if (!silent) this.showLoader();
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(true),
                body: formData
            });
            return await this.handleResponse(response);
        } finally {
            if (!silent) this.hideLoader();
        }
    }
};

// Handle light/dark mode setup globally on page load
document.addEventListener('DOMContentLoaded', () => {
    const isLight = localStorage.getItem('theme') === 'light';
    if (isLight) {
        document.body.classList.add('light-mode');
    }
});

// Event delegation for theme toggle button clicks
document.addEventListener('click', (e) => {
    const toggle = e.target.closest('.theme-toggle');
    if (toggle) {
        const currentMode = document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', currentMode ? 'light' : 'dark');
        document.querySelectorAll('.theme-toggle').forEach(btn => {
            btn.innerHTML = currentMode ? '🌙' : '☀️';
        });
    }
});
