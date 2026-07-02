let allUsersCached = [];
let roleAuditsCached = [
    { email: 'jane.smith@example.com', oldRole: 'ROLE_USER', newRole: 'ROLE_ADMIN', date: new Date(Date.now() - 86400000 * 2).toLocaleString() },
    { email: 'bob.developer@example.com', oldRole: 'ROLE_USER', newRole: 'ROLE_ADMIN', date: new Date(Date.now() - 86400000 * 5).toLocaleString() }
];
let logInterval = null;
let usersTrendChart = null;
let topicsPieChart = null;

const logMessages = [
    "INFO c.i.service.AuthService : Generated JWT access credential for user account.",
    "INFO c.i.service.AiService : Connection token requested to Google Gemini API.",
    "INFO c.i.service.InterviewService : Question grading evaluation compiled in 1240ms.",
    "INFO c.i.controller.ResumeController : Upload complete: developer_resume_v2.pdf.",
    "WARN c.i.security.JwtFilter : Expired authorization token attempt on route path /api/users/profile.",
    "INFO c.i.service.ResumeService : Extracted skills match: Spring Boot, PostgreSQL, Docker."
];

const apiStats = [
    { method: 'POST', route: '/api/auth/login', count: 4890, latency: '145ms', status: '200 OK' },
    { method: 'POST', route: '/api/auth/register', count: 1240, latency: '210ms', status: '201 Created' },
    { method: 'POST', route: '/api/interviews/setup', count: 3200, latency: '890ms', status: '200 OK' },
    { method: 'POST', route: '/api/interviews/submit-answer', count: 15400, latency: '350ms', status: '200 OK' },
    { method: 'POST', route: '/api/resumes/upload', count: 850, latency: '1840ms', status: '200 OK' },
    { method: 'GET', route: '/api/users/profile', count: 9100, latency: '65ms', status: '200 OK' }
];

document.addEventListener('DOMContentLoaded', () => {
    loadSystemStats();
});

// Tab Switcher
function switchSection(sectionId, btn) {
    document.querySelectorAll('.admin-menu-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.admin-content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`section-${sectionId}`).classList.add('active');

    // Section specific loaders
    if (sectionId === 'dashboard') loadSystemStats();
    if (sectionId === 'analytics') renderAnalytics();
    if (sectionId === 'users') loadUsersList();
    if (sectionId === 'logs') {
        renderRoleAudits();
        startTerminalLogging();
    } else {
        if (logInterval) {
            clearInterval(logInterval);
            logInterval = null;
        }
    }
    if (sectionId === 'api') renderApiMonitor();
    if (sectionId === 'settings') loadAiSettings();
}

async function loadSystemStats() {
    try {
        const stats = await API.get('/admin/stats');
        document.getElementById('stats-users').textContent = stats.totalUsers;
        document.getElementById('stats-interviews').textContent = stats.totalInterviews;
        document.getElementById('stats-score').textContent = stats.averageScore ? `${Math.round(stats.averageScore)}%` : '0%';

        const activityBody = document.getElementById('admin-recent-activity');
        if (stats.recentInterviews.length === 0) {
            activityBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 20px;">No global logs found.</td></tr>';
            return;
        }

        activityBody.innerHTML = stats.recentInterviews.map(i => `
            <tr>
                <td style="font-weight: 500;">${i.userFullName} <br><span style="font-size: 0.75rem; color: var(--text-secondary);">${i.userEmail}</span></td>
                <td>${i.category}</td>
                <td style="font-weight: 700; color: ${i.score >= 70 ? 'var(--success)' : 'var(--warning)'}">${i.score}%</td>
                <td style="font-size: 0.85rem; color: var(--text-secondary);">${new Date(i.createdAt).toLocaleString()}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Failed to load stats:", err);
    }
}

async function loadUsersList() {
    try {
        allUsersCached = await API.get('/admin/users');
        renderUsersTable(allUsersCached);
    } catch (err) {}
}

function renderUsersTable(users) {
    const tbody = document.getElementById('admin-users-list');
    tbody.innerHTML = users.map(u => `
        <tr>
            <td style="font-weight: 500;">${u.fullName}</td>
            <td>${u.email}</td>
            <td>
                <select class="form-input" style="padding: 6px 12px; font-size: 0.85rem; background-color: var(--bg-secondary);" onchange="updateRole(${u.id}, '${u.email}', this.value)">
                    <option value="ROLE_USER" ${u.role === 'ROLE_USER' ? 'selected' : ''}>ROLE_USER</option>
                    <option value="ROLE_ADMIN" ${u.role === 'ROLE_ADMIN' ? 'selected' : ''}>ROLE_ADMIN</option>
                </select>
            </td>
            <td>
                <button class="btn btn-danger" onclick="deleteUser(${u.id})" style="padding: 6px 12px; font-size: 0.8rem;">Delete</button>
            </td>
        </tr>
    `).join('');
}

function filterUserRegistry() {
    const query = document.getElementById('user-search-input').value.toLowerCase();
    const role = document.getElementById('filter-user-role').value;
    
    const filtered = allUsersCached.filter(u => {
        const matchesQuery = u.fullName.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
        const matchesRole = role === 'ALL' || u.role === role;
        return matchesQuery && matchesRole;
    });
    
    renderUsersTable(filtered);
}

async function updateRole(userId, userEmail, newRole) {
    try {
        await API.put(`/admin/users/${userId}/role`, { role: newRole });
        API.showToast('User role updated successfully!', 'success');
        
        // Log to audit history
        roleAuditsCached.unshift({
            email: userEmail,
            oldRole: newRole === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN',
            newRole: newRole,
            date: new Date().toLocaleString()
        });
        
        loadUsersList();
    } catch (err) {}
}

async function deleteUser(userId) {
    const consent = confirm("Are you sure you want to delete this user from the system?");
    if (!consent) return;

    try {
        await API.delete(`/admin/users/${userId}`);
        API.showToast('User deleted successfully!', 'success');
        loadUsersList();
    } catch (err) {}
}

// Analytics Rendering
function renderAnalytics() {
    const ctxTrend = document.getElementById('chart-users-trend').getContext('2d');
    if (usersTrendChart) usersTrendChart.destroy();
    
    usersTrendChart = new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
            datasets: [{
                label: 'Signups',
                data: [120, 190, 310, 480, 650, 890],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.05)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 9 } } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af', font: { size: 9 } } }
            }
        }
    });

    const ctxPie = document.getElementById('chart-topics-pie').getContext('2d');
    if (topicsPieChart) topicsPieChart.destroy();
    
    topicsPieChart = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: ['Java', 'SQL', 'OS', 'DSA', 'HR'],
            datasets: [{
                data: [42, 28, 15, 23, 31],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.6)',
                    'rgba(168, 85, 247, 0.6)',
                    'rgba(16, 185, 129, 0.6)',
                    'rgba(245, 158, 11, 0.6)',
                    'rgba(239, 68, 68, 0.6)'
                ],
                borderColor: '#11131e',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#9ca3af', font: { size: 8 } }
                }
            }
        }
    });
}

// Logs and Audit history
function renderRoleAudits() {
    const list = document.getElementById('role-audit-list');
    if (!list) return;
    list.innerHTML = roleAuditsCached.map(a => `
        <div class="audit-item">
            <strong>${a.email}</strong> updated from <span style="color: var(--text-muted);">${a.oldRole}</span> to <span style="color: var(--success);">${a.newRole}</span>
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 3px;">${a.date}</div>
        </div>
    `).join('');
}

function startTerminalLogging() {
    const win = document.getElementById('terminal-logs-window');
    if (!win) return;
    
    win.innerHTML = `
        <div class="log-entry info">[${new Date().toLocaleTimeString()}] INFO c.i.Application : Starting InterviewAI Backend on port 8080...</div>
        <div class="log-entry info">[${new Date().toLocaleTimeString()}] INFO c.i.Application : Database connected successfully. Pool size: 10.</div>
    `;

    if (logInterval) clearInterval(logInterval);
    
    logInterval = setInterval(() => {
        const msg = logMessages[Math.floor(Math.random() * logMessages.length)];
        const isWarn = msg.includes("WARN");
        const type = isWarn ? "warn" : "info";
        
        const el = document.createElement("div");
        el.className = `log-entry ${type}`;
        el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        win.appendChild(el);
        win.scrollTop = win.scrollHeight;
    }, 4000);
}

// API Monitor
function renderApiMonitor() {
    const tbody = document.getElementById('api-endpoint-list');
    if (!tbody) return;
    
    tbody.innerHTML = apiStats.map(s => `
        <tr>
            <td><span class="api-badge ${s.method.toLowerCase()}">${s.method}</span></td>
            <td style="font-family: monospace; font-size: 0.8rem; font-weight: 500;">${s.route}</td>
            <td style="font-weight: 600;">${s.count.toLocaleString()}</td>
            <td style="color: var(--secondary); font-weight: 500;">${s.latency}</td>
            <td><span style="color: var(--success); font-weight: 600;">${s.status}</span></td>
        </tr>
    `).join('');
}

// CSV Export
function exportUsersCSV() {
    if (allUsersCached.length === 0) {
        API.showToast('No users cached to export. Click Manage Users first.', 'warning');
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Full Name,Email,Role\n";
    
    allUsersCached.forEach(u => {
        csvContent += `${u.id},"${u.fullName}","${u.email}",${u.role}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `InterviewAI_Users_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    API.showToast('Users CSV exported successfully!', 'success');
}

// Settings
async function loadAiSettings() {
    try {
        const settings = await API.get('/admin/settings');
        document.getElementById('settings-provider').value = settings.aiProvider;
        document.getElementById('settings-model').value = settings.modelName;
        document.getElementById('settings-key').value = settings.apiKey || '';
        document.getElementById('settings-temp').value = settings.temperature;
        document.getElementById('settings-prompt').value = settings.systemPrompt || '';
    } catch (err) {}
}

document.getElementById('admin-settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const aiProvider = document.getElementById('settings-provider').value;
    const modelName = document.getElementById('settings-model').value;
    const apiKey = document.getElementById('settings-key').value;
    const temperature = parseFloat(document.getElementById('settings-temp').value);
    const systemPrompt = document.getElementById('settings-prompt').value;

    try {
        await API.put('/admin/settings', { aiProvider, modelName, apiKey, temperature, systemPrompt });
        API.showToast('AI Settings updated successfully!', 'success');
    } catch (err) {}
});
