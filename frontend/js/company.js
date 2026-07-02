const companyCatalog = [
    { id: 'google', name: 'Google', diff: 'hard', logo: 'G', style: 'Algorithmic Optimization', desc: 'Focuses on complex tree traversals, O-notation limits, and recursion boundary testing.' },
    { id: 'amazon', name: 'Amazon', diff: 'hard', logo: 'A', style: 'Leadership & Systems', desc: 'Focuses on Leadership Principles, distributed architectures, and customer obsession.' },
    { id: 'microsoft', name: 'Microsoft', diff: 'medium', logo: 'M', style: 'Architecture & OS', desc: 'Focuses on multi-threading synchronization, memory limits, and design specifications.' },
    { id: 'meta', name: 'Meta', diff: 'hard', logo: '∞', style: 'Product Scale & Graphs', desc: 'Focuses on graph optimizations, rapid code cycles, and heavy system load operations.' },
    { id: 'adobe', name: 'Adobe', diff: 'medium', logo: 'Ad', style: 'Graphics & OOP', desc: 'Focuses on pointer management, object composition, and C++ memory optimizations.' },
    { id: 'oracle', name: 'Oracle', diff: 'medium', logo: 'O', style: 'Databases & SQL', desc: 'Focuses on ACID properties, query planners, indexing structures, and data integrity.' },
    { id: 'tcs', name: 'TCS', diff: 'easy', logo: 'T', style: 'CS Core Fundamentals', desc: 'Focuses on basic logic loops, OOP definitions, and communication fluency.' },
    { id: 'infosys', name: 'Infosys', diff: 'easy', logo: 'I', style: 'Logical Problem Solving', desc: 'Focuses on basic array manipulations, relational schemas, and client deliverables.' },
    { id: 'accenture', name: 'Accenture', diff: 'easy', logo: 'Ac', style: 'Agile & Business Scenarios', desc: 'Focuses on consulting metrics, business analytics, and agile framework procedures.' }
];

let selectedCompanyId = null;

document.addEventListener('DOMContentLoaded', () => {
    renderCompanies();
    
    // Bind form submit
    document.getElementById('company-simulation-form').addEventListener('submit', (e) => {
        e.preventDefault();
        launchSimulation();
    });
});

function renderCompanies() {
    const container = document.getElementById('company-cards-container');
    if (!container) return;

    container.innerHTML = companyCatalog.map(c => `
        <div class="company-card glass-panel" onclick="openModal('${c.id}')">
            <div class="company-card-header">
                <div class="company-logo-avatar">${c.logo}</div>
                <span class="diff-badge ${c.diff}">${c.diff}</span>
            </div>
            <div class="company-card-body">
                <h3>${c.name}</h3>
                <p>${c.desc}</p>
            </div>
            <div class="company-style-tag">
                🎯 ${c.style}
            </div>
        </div>
    `).join('');
}

function openModal(id) {
    selectedCompanyId = id;
    const company = companyCatalog.find(c => c.id === id);
    if (!company) return;

    document.getElementById('modal-company-title').textContent = `${company.name} Interview Simulation`;
    
    const diffBadge = document.getElementById('modal-company-difficulty');
    diffBadge.textContent = company.diff;
    diffBadge.className = `modal-company-badge diff-badge ${company.diff}`;
    
    document.getElementById('modal-company-style').textContent = company.style;
    document.getElementById('modal-company-desc').textContent = company.desc;

    document.getElementById('company-setup-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('company-setup-modal').style.display = 'none';
}

function launchSimulation() {
    const company = companyCatalog.find(c => c.id === selectedCompanyId);
    if (!company) return;

    const round = document.getElementById('simulation-round').value; // 'Technical' or 'Behavioral'
    
    // Redirect to interview arena with customized URL parameters
    window.location.href = `interview.html?company=${company.name}&round=${round}&diff=${company.diff}`;
}
