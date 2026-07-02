const urlParams = new URLSearchParams(window.location.search);
const interviewId = urlParams.get('id');
let certificateId = null;

const weakTopicsCatalog = {
    'Java': [
        { topic: 'Garbage Collection Algorithms', desc: 'Understanding minor/major GC phases, G1 vs. ZGC, and heap memory allocation tuning.' },
        { topic: 'Concurrency & Thread Pools', desc: 'Managing thread safety, race conditions, synchronized blocks, and executor parameters.' },
        { topic: 'Abstract Classes vs. Interfaces', desc: 'Design rules for multiple inheritance, default interface methods, and polymorphic boundaries.' }
    ],
    'SQL': [
        { topic: 'Indexes & Query Planners', desc: 'Optimizing table scans, understanding clustered vs. non-clustered keys, and profiling plans.' },
        { topic: 'Transaction Isolation Levels', desc: 'Managing dirty reads, phantom reads, serializability states, and lock concurrency.' },
        { topic: 'Subqueries vs. CTEs', desc: 'Writing performant recursive statements, temporary views, and table partitions.' }
    ],
    'OS': [
        { topic: 'Memory Page Replacement', desc: 'Implementing virtual memory page replacement policies to prevent thrashing states.' },
        { topic: 'Deadlock Prevention Criteria', desc: 'Breaking circular waits, mutual exclusion rules, and resource allocations.' },
        { topic: 'Context Switching Costs', desc: 'Evaluating process Control Blocks, CPU register saving, and cache misses.' }
    ],
    'DSA': [
        { topic: 'Tree Balance Rotations', desc: 'Implementing AVL tree height-balancing, red-black nodes, and search tree traversal times.' },
        { topic: 'Dynamic Programming Memoization', desc: 'Formulating states, recursion parameters, and memoized lookup optimizations.' },
        { topic: 'Graph Shortest Paths', desc: 'Contrasting Dijkstra, Bellman-Ford, and heuristic search paths.' }
    ]
};

const roadmapProjectsCatalog = {
    'Java': [
        { title: "High-Throughput Concurrent Task Queue", desc: "Build a thread-safe custom executor pool in Java using CAS lock-free parameters and concurrent nodes." },
        { title: "GC Collection Profiler", desc: "Design a logging dashboard capturing JVM GC execution times and memory allocations." }
    ],
    'SQL': [
        { title: "Database Query Index Profiler", desc: "Develop a script compiling database query planners, comparing clustered index lookups vs full table scans." }
    ],
    'OS': [
        { title: "Virtual Page Thrashing Simulator", desc: "Implement a memory replacement scheduler displaying LRU, FIFO, and clock page replacement faults." }
    ],
    'DSA': [
        { title: "Red-Black Self-Balancing Visualiser", desc: "Build an interactive balance tree visualizer displaying AVL and Red-Black rotations." }
    ]
};

const genericProjects = [
    { title: "STAR Placement Matrix Builder", desc: "Design a database tracking personal projects, conflict scenarios, and agile deliverables logs." },
    { title: "Clean Code Refactoring Blueprint", desc: "Implement design patterns (Strategy, Factory, Singleton) to modularize standard codebases." }
];

document.addEventListener('DOMContentLoaded', async () => {
    if (!interviewId) {
        API.showToast('Invalid Interview Result Target', 'error');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
        return;
    }

    try {
        const res = await API.get(`/interviews/${interviewId}/results`);

        // Set headers details
        document.getElementById('result-category').textContent = `${res.category} Practice`;
        document.getElementById('overall-score-pct').textContent = `${res.score}%`;
        document.getElementById('overall-feedback-summary').textContent = res.overallFeedback;
        document.getElementById('result-duration').textContent = `${Math.round(res.durationSeconds / 60)} min`;
        document.getElementById('result-difficulty').textContent = res.difficulty;

        // Fill list values
        document.getElementById('strengths-list').innerHTML = res.strengths.map(s => `<li>${s}</li>`).join('');
        document.getElementById('weaknesses-list').innerHTML = res.weaknesses.map(w => `<li>${w}</li>`).join('');

        // Generate seeded sub-scores & render radar chart
        const subScores = generateSubScores(res.score, interviewId);
        bindSubMetrics(subScores);
        renderRadarChart(subScores);

        // Render weak topics list
        renderWeakTopics(res.category, res.questions);

        // Render AI Career Roadmap Section
        renderAiCareerRoadmap(res);

        // Display certificate buttons if eligible
        if (res.certificateId) {
            certificateId = res.certificateId;
            document.getElementById('view-cert-btn').style.display = 'inline-flex';
            setupCert(res);
        }

        // Render logs
        renderQaLogs(res.questions);

    } catch (err) {
        console.error("Results load failure:", err);
    }
});

// Seeded random number generator for consistent subscores per interviewId
function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function generateSubScores(baseScore, id) {
    const seed = parseInt(id) || 101;
    const variance = [
        seededRandom(seed) * 16 - 8,
        seededRandom(seed + 1) * 16 - 8,
        seededRandom(seed + 2) * 16 - 8,
        seededRandom(seed + 3) * 16 - 8,
        seededRandom(seed + 4) * 16 - 8,
        seededRandom(seed + 5) * 16 - 8
    ];
    
    const rawScores = variance.map(v => Math.max(Math.min(Math.round(baseScore + v), 100), 10));
    const avg = rawScores.reduce((a, b) => a + b, 0) / 6;
    const diff = baseScore - avg;
    
    return rawScores.map(val => Math.max(Math.min(Math.round(val + diff), 100), 10));
}

function bindSubMetrics(scores) {
    const ids = ['tech', 'comm', 'grammar', 'confidence', 'vocab', 'behavior'];
    ids.forEach((id, idx) => {
        const val = scores[idx];
        document.getElementById(`metric-${id}`).textContent = `${val}%`;
        document.getElementById(`bar-${id}`).style.width = `${val}%`;
    });
}

function renderRadarChart(scores) {
    const canvas = document.getElementById('readinessRadarChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const isLight = document.body.classList.contains('light-mode');
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)';
    const labelColor = isLight ? '#4b5563' : '#9ca3af';
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Technical Depth', 'Communication', 'Grammar', 'Confidence Pace', 'Vocabulary Scope', 'Behavioral Align'],
            datasets: [{
                label: 'Score Profile',
                data: scores,
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                borderColor: '#6366f1',
                pointBackgroundColor: '#a855f7',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#6366f1',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: gridColor },
                    grid: { color: gridColor },
                    pointLabels: {
                        color: labelColor,
                        font: { size: 9, family: 'var(--font-heading)' }
                    },
                    ticks: {
                        display: false,
                        stepSize: 20
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function renderWeakTopics(category, questions) {
    const container = document.getElementById('weak-topics-container');
    if (!container) return;

    const lowScoringQuestions = questions.filter(q => q.score < 80);
    
    if (lowScoringQuestions.length === 0) {
        container.innerHTML = '<p style="color: var(--success); font-size: 0.85rem; font-weight: 500;">✓ Excellent performance! No critical weak topics detected.</p>';
        return;
    }

    let catalog = weakTopicsCatalog[category] || [
        { topic: 'Conceptual Articulation', desc: 'Elaborating explanations with specific tools and code paradigms.' },
        { topic: 'Logic Structure Design', desc: 'Structuring responses with clear preconditions, steps, and edge-cases.' }
    ];

    const count = Math.min(lowScoringQuestions.length, catalog.length);
    const topics = catalog.slice(0, count);

    container.innerHTML = topics.map(t => `
        <div class="weak-topic-item">
            <span class="weak-topic-icon">⚠️</span>
            <div>
                <div class="weak-topic-title">${t.topic}</div>
                <p class="weak-topic-desc">${t.desc}</p>
            </div>
        </div>
    `).join('');
}

function renderAiCareerRoadmap(res) {
    const levelEl = document.getElementById('roadmap-level');
    const chanceEl = document.getElementById('roadmap-hiring-chance');
    
    if (res.score >= 85) {
        levelEl.textContent = "Senior Developer";
        chanceEl.textContent = "88% Odds";
        chanceEl.style.color = "var(--success)";
    } else if (res.score >= 70) {
        levelEl.textContent = "Mid-Level Engineer";
        chanceEl.textContent = "65% Odds";
        chanceEl.style.color = "var(--warning)";
    } else {
        levelEl.textContent = "Junior Developer";
        chanceEl.textContent = "35% Odds";
        chanceEl.style.color = "var(--danger)";
    }

    // Weak Skills tags
    const skillsContainer = document.getElementById('roadmap-weak-skills');
    let weakSkills = [];
    if (res.category === 'Java') weakSkills = ['Multithreading', 'CAS locks', 'Heap Memory', 'GC Tuning'];
    else if (res.category === 'SQL') weakSkills = ['Indexes', 'ACID transactions', 'CTE tables', 'Query Plan'];
    else if (res.category === 'OS') weakSkills = ['Memory Paging', 'Deadlocks', 'Context Switch', 'Scheduling'];
    else if (res.category === 'DSA') weakSkills = ['Balancing Trees', 'Dynamic Programming', 'Graph paths', 'Big-O'];
    else weakSkills = ['STAR Framework', 'Situation Analysis', 'Metrics Delivery', 'Articulations'];

    skillsContainer.innerHTML = weakSkills.map(s => `
        <span class="chip" style="background: rgba(239, 68, 68, 0.05); border-color: rgba(239, 68, 68, 0.2); color: var(--danger); margin-right: 5px; margin-bottom: 5px;">
            ${s}
        </span>
    `).join('');

    // Study topics
    const topicsList = document.getElementById('roadmap-topics');
    if (res.weaknesses && res.weaknesses.length > 0) {
        topicsList.innerHTML = res.weaknesses.map(w => `<li>Study: <span>${w}</span></li>`).join('');
    } else {
        topicsList.innerHTML = '<li>Maintain current pace & practice advanced designs.</li>';
    }

    // Recommended Projects
    const projectsContainer = document.getElementById('roadmap-projects');
    const catalog = roadmapProjectsCatalog[res.category] || genericProjects;
    
    projectsContainer.innerHTML = catalog.map(p => `
        <div class="project-suggestion-item">
            <div class="project-suggestion-title">🛠️ ${p.title}</div>
            <div class="project-suggestion-desc">${p.desc}</div>
        </div>
    `).join('');

    // Readiness index
    const readinessPct = document.getElementById('roadmap-readiness-pct');
    const readinessFill = document.getElementById('roadmap-readiness-fill');
    
    readinessPct.textContent = `${res.score}%`;
    readinessFill.style.width = `${res.score}%`;
}

function renderQaLogs(questions) {
    const container = document.getElementById('qa-log-container');
    container.innerHTML = questions.map(q => `
        <div class="qa-log-item">
            <div class="qa-log-header">
                <h4 style="font-family: var(--font-heading); max-width: 80%;">${q.questionText}</h4>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                    <span class="badge ${q.score >= 80 ? 'badge-success' : 'badge-warning'}" style="font-size: 0.85rem; font-weight: 700;">Score: ${q.score}%</span>
                    <button class="bookmark-btn ${q.bookmarked ? 'active' : ''}" onclick="toggleBookmark(${q.id}, this)">
                        ${q.bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
                    </button>
                </div>
            </div>

            <div class="box-title">Your Answer</div>
            <p style="color: var(--text-secondary); line-height: 1.6; font-size: 0.95rem; font-style: italic;">
                "${q.userAnswer}"
            </p>

            <div class="box-title">AI Feedback Evaluation</div>
            <p style="color: var(--text-secondary); line-height: 1.6; font-size: 0.95rem;">
                ${q.aiFeedback}
            </p>

            <div class="box-title">Ideal Model Answer</div>
            <div class="ideal-box">${q.idealAnswer}</div>
        </div>
    `).join('');
}

async function toggleBookmark(qId, btn) {
    try {
        const res = await API.post(`/interviews/bookmark-question/${qId}`);
        if (res.bookmarked) {
            btn.classList.add('active');
            btn.textContent = '★ Bookmarked';
            API.showToast('Question bookmarked!', 'success');
        } else {
            btn.classList.remove('active');
            btn.textContent = '☆ Bookmark';
        }
    } catch (err) {}
}

// PDF download functionality using html2pdf
function exportPDF() {
    const element = document.getElementById('printable-area');
    const opt = {
        margin:       10,
        filename:     `InterviewAI_Report_${interviewId}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#0a0b10' },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Temporary hide header actions for clean report view
    const actions = document.querySelector('.header-actions');
    const bookmarks = document.querySelectorAll('.bookmark-btn');
    
    if (actions) actions.style.display = 'none';
    bookmarks.forEach(b => b.style.display = 'none');
    
    API.showLoader();
    html2pdf().set(opt).from(element).save().then(() => {
        API.hideLoader();
        if (actions) actions.style.display = 'flex';
        bookmarks.forEach(b => b.style.display = 'inline-block');
    });
}

// Certificate modal triggers
const modal = document.getElementById('cert-modal');
document.getElementById('view-cert-btn').addEventListener('click', () => {
    modal.style.display = 'flex';
});

function closeCert() {
    modal.style.display = 'none';
}

function setupCert(res) {
    const user = Auth.getCurrentUser();
    document.getElementById('cert-user-name').textContent = user.fullName;
    document.getElementById('cert-category').textContent = `${res.category} Mock Curriculum`;
    document.getElementById('cert-score').textContent = `${res.score}%`;
    document.getElementById('cert-id').textContent = res.certificateId;
    document.getElementById('cert-date').textContent = new Date(res.completedAt || res.createdAt).toLocaleDateString();
}
