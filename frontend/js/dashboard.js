let skillsChartInstance = null;

const dailyChallenges = [
    { title: "Java Multithreading Round", desc: "Evaluate thread pools, executors, concurrency controls, and futures under hard conditions to earn the Java Scholar badge.", category: "Java", difficulty: "Hard" },
    { title: "OS Page Replacement", desc: "Demonstrate memory paging strategies, cache optimization, and scheduling algorithms to verify OS conceptual expertise.", category: "OS", difficulty: "Intermediate" },
    { title: "SQL Optimization Metrics", desc: "Grade cluster indexes, query planners, execution cost logs, and JOIN metrics to prove relational mastery.", category: "SQL", difficulty: "Intermediate" },
    { title: "DSA Advanced Tree Balancing", desc: "Analyze AVL rotations, red-black heuristics, and traverse paths to complete critical data structures requirements.", category: "DSA", difficulty: "Hard" }
];

document.addEventListener('DOMContentLoaded', async () => {
    // Set User Greeting
    const user = Auth.getCurrentUser();
    document.getElementById('welcome-title').textContent = `Welcome, ${user.fullName}`;

    // Load Daily Challenge
    const challenge = dailyChallenges[new Date().getDate() % dailyChallenges.length];
    document.getElementById('challenge-title').textContent = challenge.title;
    document.getElementById('challenge-desc').textContent = challenge.desc;
    document.getElementById('challenge-start-btn').href = `interview.html?category=${challenge.category}&difficulty=${challenge.difficulty}`;

    try {
        // Fetch User Stats / Progress
        const progress = await API.get('/interviews/progress');
        document.getElementById('stats-total').textContent = progress.totalInterviews;
        document.getElementById('stats-avg').textContent = progress.averageScore ? `${Math.round(progress.averageScore)}%` : '0%';
        document.getElementById('stats-highest').textContent = progress.highestScore ? `${progress.highestScore}%` : '0%';

        // Render Progress Categories list
        renderProgressBars(progress.completedCategories);

        // Initialize skills Chart
        renderChart(progress.completedCategories);

        // Load Resumes & ATS Score
        const resumes = await API.get('/resumes');
        let atsScore = null;
        if (resumes.length > 0) {
            atsScore = resumes[0].atsScore;
            document.getElementById('stats-ats').textContent = `${atsScore}%`;
        } else {
            document.getElementById('stats-ats').textContent = 'N/A';
        }

        // Fetch History list for streak/heatmap rendering
        const historyList = await API.get('/interviews/history');

        // Streak Count
        const streak = calculateStreak(historyList);
        document.getElementById('streak-count').textContent = `🔥 ${streak}`;
        renderStreakBubbles(historyList);

        // Readiness score
        const readiness = calculateReadiness(progress, atsScore);
        document.getElementById('readiness-pct').textContent = `${readiness}%`;
        
        // Gauge ring coloring
        const gauge = document.getElementById('readiness-gauge');
        if (gauge) {
            gauge.style.background = `conic-gradient(var(--success) ${readiness}%, rgba(255,255,255,0.05) 0%)`;
        }

        // Heatmap
        renderCalendarHeatmap(historyList);

        // Badges
        const badgesList = getBadges(progress, resumes, historyList);
        renderBadges(badgesList);

        // Achievements
        renderAchievements(progress, resumes, historyList);

        // Render Recommendations dynamically based on scores
        if (progress.totalInterviews > 0) {
            updateAiRecommendations(progress.averageScore, progress.completedCategories);
        }

        // Bind History
        bindHistory(historyList);

    } catch (err) {
        console.error("Dashboard initialization error:", err);
    }
});

function calculateStreak(historyList) {
    if (!historyList || historyList.length === 0) return 0;
    
    // Group and sort unique dates (latest first)
    const dates = [...new Set(historyList.map(item => new Date(item.createdAt).toDateString()))]
        .map(dStr => new Date(dStr))
        .sort((a, b) => b - a);

    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (dates.length > 0) {
        const latestDate = new Date(dates[0]);
        latestDate.setHours(0,0,0,0);
        
        const diffDays = Math.round((today - latestDate) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
            streak = 1;
            let lastDate = latestDate;
            
            for (let i = 1; i < dates.length; i++) {
                const current = new Date(dates[i]);
                current.setHours(0,0,0,0);
                const diff = Math.round((lastDate - current) / (1000 * 60 * 60 * 24));
                if (diff === 1) {
                    streak++;
                    lastDate = current;
                } else if (diff > 1) {
                    break;
                }
            }
        }
    }
    return streak;
}

function renderStreakBubbles(historyList) {
    const bubblesContainer = document.getElementById('streak-bubbles-container');
    if (!bubblesContainer) return;
    
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    
    // Get start of current week (Monday)
    const startOfWeek = new Date(today);
    const distanceToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    startOfWeek.setDate(today.getDate() - distanceToMonday);
    startOfWeek.setHours(0,0,0,0);
    
    // Generate array of strings for the 7 days of this week
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        weekDays.push(d.toDateString());
    }
    
    const completedDays = new Set(historyList.map(item => new Date(item.createdAt).toDateString()));
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    
    bubblesContainer.innerHTML = dayLabels.map((label, index) => {
        const dateStr = weekDays[index];
        const isActive = completedDays.has(dateStr);
        return `<span class="bubble ${isActive ? 'active' : ''}" title="${new Date(dateStr).toLocaleDateString()}">${label}</span>`;
    }).join('');
}

function calculateReadiness(progress, atsScore) {
    let scoreWeight = progress.averageScore ? progress.averageScore : 0;
    let practiceWeight = Math.min((progress.totalInterviews / 5) * 100, 100);
    let atsWeight = atsScore ? atsScore : 0;
    
    let readiness = 0;
    if (atsScore) {
        readiness = Math.round((scoreWeight * 0.5) + (practiceWeight * 0.3) + (atsWeight * 0.2));
    } else {
        readiness = Math.round((scoreWeight * 0.6) + (practiceWeight * 0.4));
    }
    return Math.min(readiness, 100);
}

function renderCalendarHeatmap(historyList) {
    const calendarGrid = document.getElementById('calendar-heatmap');
    if (!calendarGrid) return;
    
    const activityMap = {};
    historyList.forEach(item => {
        const dStr = new Date(item.createdAt).toDateString();
        activityMap[dStr] = (activityMap[dStr] || 0) + 1;
    });
    
    const totalDays = 84; // 12 weeks
    const cells = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    for (let i = totalDays - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dStr = d.toDateString();
        const count = activityMap[dStr] || 0;
        
        let level = 0;
        if (count > 0) {
            level = Math.min(count, 3);
        }
        cells.push(`<div class="calendar-cell val-${level}" title="${d.toLocaleDateString()}: ${count} session(s)"></div>`);
    }
    calendarGrid.innerHTML = cells.join('');
}

function getBadges(progress, resumes, historyList) {
    const badges = [];
    if (progress.totalInterviews > 0) {
        badges.push({ name: 'First Step', icon: '🎯', desc: 'Completed first mock practice session' });
    }
    
    const completedCategories = progress.completedCategories || {};
    if (completedCategories['Java'] && completedCategories['Java'] >= 2) {
        badges.push({ name: 'Java Scholar', icon: '☕', desc: 'Finished 2+ Java sessions' });
    }
    
    if (progress.highestScore >= 85) {
        badges.push({ name: 'Elite Scorer', icon: '🏆', desc: 'Achieved high grading score ≥ 85%' });
    }
    
    if (resumes.length > 0 && resumes[0].atsScore >= 80) {
        badges.push({ name: 'ATS Approved', icon: '📄', desc: 'Resume scanning rank match ≥ 80%' });
    }
    
    const streak = calculateStreak(historyList);
    if (streak >= 3) {
        badges.push({ name: 'Consistent', icon: '🔥', desc: 'Practiced 3+ consecutive days' });
    }
    return badges;
}

function renderBadges(badges) {
    const container = document.getElementById('badges-row');
    if (!container) return;
    
    if (badges.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 10px 0;">Practice mock sessions to unlock badges.</p>';
        return;
    }
    
    container.innerHTML = badges.map(badge => `
        <div class="badge-item glass-panel" title="${badge.desc}">
            <div style="font-size: 1.8rem;">${badge.icon}</div>
            <div style="font-weight: 600; font-size: 0.75rem; margin-top: 6px; color: var(--text-primary);">${badge.name}</div>
        </div>
    `).join('');
}

function renderAchievements(progress, resumes, historyList) {
    const container = document.getElementById('achievements-list');
    if (!container) return;
    
    const categoriesCount = Object.keys(progress.completedCategories || {}).length;
    const streak = calculateStreak(historyList);
    
    const list = [
        { name: 'ATS Onboarding', cond: resumes.length > 0, desc: 'Upload a PDF resume under Profile settings' },
        { name: 'Elite Performance', cond: progress.highestScore >= 85, desc: 'Score 85% or higher on a mock session' },
        { name: 'Multidisciplinary', cond: categoriesCount >= 3, desc: 'Practice mock rounds in 3 unique topics' },
        { name: 'Consistency Habit', cond: streak >= 3, desc: 'Build a practice streak of 3+ consecutive days' }
    ];
    
    container.innerHTML = list.map(ach => `
        <div style="display: flex; gap: 10px; align-items: flex-start; font-size: 0.85rem;">
            <span style="font-size: 1.1rem; color: ${ach.cond ? 'var(--success)' : 'var(--text-muted)'}; flex-shrink: 0;">
                ${ach.cond ? '✅' : '🔒'}
            </span>
            <div>
                <strong style="color: ${ach.cond ? 'var(--text-primary)' : 'var(--text-secondary)'}; font-size: 0.85rem;">${ach.name}</strong>
                <p style="margin: 2px 0 0; font-size: 0.75rem; color: var(--text-muted); line-height: 1.3;">${ach.desc}</p>
            </div>
        </div>
    `).join('');
}

function bindHistory(list) {
    const body = document.getElementById('history-body');
    if (!body) return;
    if (list.length === 0) return;

    body.innerHTML = list.map(item => `
        <tr onclick="viewResult(${item.id})">
            <td style="font-weight: 600;">${item.category}</td>
            <td>${item.type}</td>
            <td><span class="badge ${getDifficultyBadgeClass(item.difficulty)}">${item.difficulty}</span></td>
            <td style="font-weight: 700;">${item.score !== null ? `${item.score}%` : 'N/A'}</td>
            <td><span class="badge ${item.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}">${item.status}</span></td>
            <td style="font-size: 0.8rem; color: var(--text-secondary);">${new Date(item.createdAt).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

function viewResult(id) {
    window.location.href = `result.html?id=${id}`;
}

function getDifficultyBadgeClass(diff) {
    if (diff === 'Beginner') return 'badge-success';
    if (diff === 'Intermediate') return 'badge-warning';
    return 'badge-danger';
}

function renderProgressBars(catMap) {
    const container = document.getElementById('progress-list');
    if (!container) return;
    const keys = Object.keys(catMap || {});
    if (keys.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No interviews completed yet.</p>';
        return;
    }

    container.innerHTML = keys.map(key => {
        const count = catMap[key];
        const pct = Math.min((count / 5) * 100, 100);
        return `
            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 5px;">
                    <span style="font-weight: 500;">${key}</span>
                    <span style="color: var(--text-secondary);">${count}/5 mock sessions</span>
                </div>
                <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; border: 1px solid var(--border-color);">
                    <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: 4px;"></div>
                </div>
            </div>
        `;
    }).join('');
}

function updateAiRecommendations(avgScore, catMap) {
    const keys = Object.keys(catMap || {});
    let text = '';
    
    if (avgScore < 70) {
        text = "Your average mock score is below 70%. Focus on review of ideal answers in your weak categories. We suggest setting interview difficulty to 'Beginner' for your next practice run.";
    } else if (keys.includes('Java') && catMap['Java'] < 2) {
        text = "Good overall score! However, Java proficiency is critical. We recommend taking another 'Technical Intermediate' mock session in Java to improve interview readiness.";
    } else if (!keys.includes('SQL')) {
        text = "Impressive dashboard stats! To round out your technical profile, try taking a 'Technical SQL' practice test to verify your database understanding.";
    } else {
        text = "Fantastic progression! You are performing above average. We recommend changing your interview difficulty setting to 'Advanced' or choosing a 'Mixed HR and Technical' session to practice transition communications.";
    }

    const recText = document.getElementById('ai-suggestion-text');
    if (recText) recText.textContent = text;
}

function renderChart(catMap) {
    const canvas = document.getElementById('skillsChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const categories = Object.keys(catMap || {});
    const counts = Object.values(catMap || {});

    if (categories.length === 0) {
        categories.push('No Practice Yet');
        counts.push(0);
    }

    const isLight = document.body.classList.contains('light-mode');
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';
    const textColor = isLight ? '#4b5563' : '#9ca3af';

    if (skillsChartInstance) {
        skillsChartInstance.destroy();
    }

    skillsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Interviews Completed',
                data: counts,
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                borderColor: '#6366f1',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: gridColor },
                    ticks: { 
                        stepSize: 1,
                        color: textColor 
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: textColor }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Global Notification Toggle
function toggleNotifications(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('notif-dropdown');
    if (!dropdown) return;
    
    if (dropdown.style.display === 'flex') {
        dropdown.style.display = 'none';
    } else {
        dropdown.style.display = 'flex';
        // Close dropdown when clicking outside
        const closeDropdown = (e) => {
            if (!document.getElementById('bell-notif-container').contains(e.target)) {
                dropdown.style.display = 'none';
                document.removeEventListener('click', closeDropdown);
            }
        };
        document.addEventListener('click', closeDropdown);
    }
}

// Export dashboard statistics to CSV file format
function exportDashboardAnalytics() {
    const total = document.getElementById('stats-total').textContent;
    const avg = document.getElementById('stats-avg').textContent;
    const highest = document.getElementById('stats-highest').textContent;
    const atsRank = document.getElementById('stats-ats').textContent;
    const streak = document.getElementById('streak-count').textContent.replace('🔥 ', '');
    const readiness = document.getElementById('readiness-pct').textContent;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Metric Name,Value\n";
    csvContent += `Total Mock Sessions Practiced,${total}\n`;
    csvContent += `Average Evaluation Score,${avg}\n`;
    csvContent += `Highest Evaluation Score,${highest}\n`;
    csvContent += `ATS Resume Fit Score,${atsRank}\n`;
    csvContent += `Practice Active Streak (Days),${streak}\n`;
    csvContent += `Interview Readiness index,${readiness}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "InterviewAI_Dashboard_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    API.showToast('CSV Report Downloaded!', 'success');
}

// Dynamic Leaderboard Rendering
function renderLeaderboard(userAvgScore) {
    const container = document.getElementById('leaderboard-container');
    if (!container) return;

    const user = Auth.getCurrentUser();
    const parsedAvg = parseFloat(userAvgScore) || 0;
    
    const candidates = [
        { rank: 1, name: "Jane Doe (Staff Dev)", score: 94, avatar: "👩‍💻" },
        { rank: 2, name: `${user.fullName} (You)`, score: Math.max(parsedAvg, 75), avatar: "👤", isUser: true },
        { rank: 3, name: "Bob Smith (Senior QA)", score: 72, avatar: "👨‍💻" },
        { rank: 4, name: "Alice Brown (Junior PM)", score: 68, avatar: "👩‍💼" }
    ];

    // Sort list by score descending
    candidates.sort((a, b) => b.score - a.score);
    // Assign rank positions after sorting
    candidates.forEach((c, idx) => c.rank = idx + 1);

    container.innerHTML = candidates.map(c => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-radius: 8px; background: ${c.isUser ? 'var(--primary-glow)' : 'rgba(255,255,255,0.01)'}; border: 1px solid ${c.isUser ? 'var(--primary)' : 'var(--border-color)'}; font-size: 0.8rem;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-weight: 800; width: 18px; color: ${c.rank === 1 ? 'var(--warning)' : 'var(--text-muted)'};">#${c.rank}</span>
                <span>${c.avatar}</span>
                <span style="font-weight: ${c.isUser ? '700' : 'normal'};">${c.name}</span>
            </div>
            <span style="font-weight: 700; color: var(--secondary);">${c.score}%</span>
        </div>
    `).join('');
}

// Scheduler persistent storage hooks
document.addEventListener('DOMContentLoaded', () => {
    // Render initial Leaderboard
    const avgText = document.getElementById('stats-avg').textContent;
    renderLeaderboard(avgText);

    // Load scheduled list
    loadSchedulerList();

    // Bind schedule Form
    const schedForm = document.getElementById('scheduler-form');
    if (schedForm) {
        schedForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const company = document.getElementById('sched-company').value.trim();
            const datetime = document.getElementById('sched-datetime').value;
            
            const schedules = JSON.parse(localStorage.getItem('scheduled_mocks') || '[]');
            schedules.push({ company, datetime, id: Date.now() });
            localStorage.setItem('scheduled_mocks', JSON.stringify(schedules));
            
            schedForm.reset();
            loadSchedulerList();
            API.showToast('Interview Mock Scheduled!', 'success');

            // Add notification alert
            updateSchedulerNotification(company, datetime);
        });
    }
});

function loadSchedulerList() {
    const list = document.getElementById('scheduler-list');
    if (!list) return;

    const schedules = JSON.parse(localStorage.getItem('scheduled_mocks') || '[]');
    if (schedules.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted); font-size: 0.75rem; text-align: center;">No scheduled sessions. Plan your targets!</p>';
        return;
    }

    // Sort by datetime ascending
    schedules.sort((a,b) => new Date(a.datetime) - new Date(b.datetime));

    list.innerHTML = schedules.slice(0, 3).map(s => {
        const dateStr = new Date(s.datetime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); padding: 8px 10px; border-radius: 6px;">
                <div>
                    <strong>💼 ${s.company}</strong>
                    <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 2px;">${dateStr}</div>
                </div>
                <button onclick="cancelSchedule(${s.id})" style="background: none; border: none; color: var(--danger); cursor: pointer; font-size: 0.85rem;">✕</button>
            </div>
        `;
    }).join('');
}

function cancelSchedule(id) {
    let schedules = JSON.parse(localStorage.getItem('scheduled_mocks') || '[]');
    schedules = schedules.filter(s => s.id !== id);
    localStorage.setItem('scheduled_mocks', JSON.stringify(schedules));
    loadSchedulerList();
    API.showToast('Scheduled mock cancelled.', 'info');
}

function updateSchedulerNotification(company, datetime) {
    const dateStr = new Date(datetime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const badge = document.getElementById('notif-badge');
    const items = document.getElementById('notif-items');
    if (!badge || !items) return;

    // Increment badge
    const curVal = parseInt(badge.textContent) || 0;
    badge.textContent = curVal + 1;

    // Prepend item
    const newItem = document.createElement('div');
    newItem.style.marginBottom = '8px';
    newItem.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
    newItem.style.paddingBottom = '6px';
    newItem.innerHTML = `📅 <strong>${company} practice</strong> scheduled for ${dateStr}.`;
    
    items.insertBefore(newItem, items.firstChild);
}
