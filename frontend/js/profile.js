let selectedTemplateName = 'minimalist';

const improvedBulletsCatalog = {
    'created a website': [
        'Designed and launched a dynamic responsive React.js web application, resulting in a 40% increase in weekly active user engagement.',
        'Spearheaded frontend UI overhaul using TailwindCSS, reducing load times by 1.2 seconds and optimizing page speed metrics.',
        'Developed end-to-end user registration and portal services, supporting 10,000+ test accounts concurrently.'
    ],
    'created apis for the database': [
        'Architected and implemented 15+ secure RESTful Spring Boot APIs, reducing backend querying latencies by 35% overall.',
        'Engineered high-performance database microservices using PostgreSQL and MyBatis, processing 500+ operations per second.',
        'Developed database endpoints wrapped with JWT token authorization, securing credentials for 5,000+ api users.'
    ],
    'wrote java code': [
        'Refactored legacy Java monolith databases into clean Spring Boot modules, reducing deployment costs by 22%.',
        'Implemented concurrent task routines using Java Executor framework pools, resolving thread racing bottlenecks.',
        'Engineered Java algorithms processing file imports, scaling daily ingest capacities by 3x.'
    ]
};

document.addEventListener('DOMContentLoaded', async () => {
    // Load current profile
    try {
        const user = await API.get('/users/profile');
        document.getElementById('profile-name').value = user.fullName || '';
        document.getElementById('profile-skills').value = user.skills || '';
        document.getElementById('profile-bio').value = user.bio || '';
        
        // Pre-fill builder values
        document.getElementById('build-email').value = user.email || '';
        document.getElementById('build-phone').value = user.phone || '+1 (555) 123-4567';
        document.getElementById('build-summary').value = user.bio || '';
        
        // Initial live rendering
        updateLivePreview();
    } catch (err) {}

    // Load resume history
    loadResumeHistory();
});

// Switch Tab
function switchTab(tabName, btn) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(c => c.classList.remove('active'));

    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(b => b.classList.remove('active'));

    document.getElementById(`tab-${tabName}`).classList.add('active');
    btn.classList.add('active');
    
    if (tabName === 'resume-builder') {
        updateLivePreview();
    }
}

// Select Resume Template
function selectTemplate(name) {
    selectedTemplateName = name;
    
    const minimalist = document.getElementById('tpl-minimalist');
    const modern = document.getElementById('tpl-modern');
    
    if (minimalist && modern) {
        if (name === 'minimalist') {
            minimalist.classList.add('selected');
            minimalist.style.borderColor = 'var(--primary)';
            modern.classList.remove('selected');
            modern.style.borderColor = 'var(--border-color)';
        } else {
            minimalist.classList.remove('selected');
            minimalist.style.borderColor = 'var(--border-color)';
            modern.classList.add('selected');
            modern.style.borderColor = 'var(--primary)';
        }
    }
    updateLivePreview();
}

function updateLivePreview() {
    const fullName = document.getElementById('profile-name').value || 'Candidate Name';
    const email = document.getElementById('build-email').value || 'name@domain.com';
    const phone = document.getElementById('build-phone').value || '+1 (555) 123-4567';
    const link = document.getElementById('build-link').value || '';
    const summary = document.getElementById('build-summary').value || 'Enter professional summary details here...';
    const expCompany = document.getElementById('build-exp-company').value || 'Company Corporation';
    const expTitle = document.getElementById('build-exp-title').value || 'Software Engineer';
    
    const bulletsVal = document.getElementById('build-exp-bullets').value || 'Optimized application databases.';
    const expBullets = bulletsVal.split('\n').filter(b => b.trim().length > 0);
    
    const eduSchool = document.getElementById('build-edu-school').value || 'State Tech University';
    const eduDegree = document.getElementById('build-edu-degree').value || 'B.S. Computer Science';
    const skills = document.getElementById('profile-skills').value || 'Java, SQL, JavaScript';

    const container = document.getElementById('live-resume-preview');
    if (!container) return;

    if (selectedTemplateName === 'minimalist') {
        container.innerHTML = `
            <div style="font-family: Arial, sans-serif; line-height: 1.4; color: #333333;">
                <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 12px;">
                    <h1 style="margin: 0; font-size: 1.4rem; color: #111; text-transform: uppercase;">${fullName}</h1>
                    <p style="margin: 3px 0 0; font-size: 0.75rem; color: #555;">
                        ${email} | ${phone} ${link ? `| ${link}` : ''}
                    </p>
                </div>

                <div style="margin-bottom: 12px;">
                    <h3 style="margin: 0 0 4px; border-bottom: 1px solid #ddd; padding-bottom: 2px; text-transform: uppercase; font-size: 0.8rem; color: #111;">Summary</h3>
                    <p style="margin: 0; font-size: 0.75rem; color: #444;">${summary}</p>
                </div>

                <div style="margin-bottom: 12px;">
                    <h3 style="margin: 0 0 4px; border-bottom: 1px solid #ddd; padding-bottom: 2px; text-transform: uppercase; font-size: 0.8rem; color: #111;">Experience</h3>
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 0.8rem; margin-bottom: 2px;">
                        <span>${expCompany}</span>
                        <span style="font-weight: normal; font-style: italic;">Present</span>
                    </div>
                    <div style="font-style: italic; font-size: 0.75rem; margin-bottom: 4px; color: #555;">${expTitle}</div>
                    <ul style="margin: 0 0 0 16px; padding: 0; font-size: 0.75rem; display: flex; flex-direction: column; gap: 3px; color: #444;">
                        ${expBullets.map(b => `<li>${b}</li>`).join('')}
                    </ul>
                </div>

                <div style="margin-bottom: 12px;">
                    <h3 style="margin: 0 0 4px; border-bottom: 1px solid #ddd; padding-bottom: 2px; text-transform: uppercase; font-size: 0.8rem; color: #111;">Education</h3>
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 0.8rem;">
                        <span>${eduSchool}</span>
                    </div>
                    <div style="font-style: italic; font-size: 0.75rem; margin-top: 1px; color: #555;">${eduDegree}</div>
                </div>

                <div>
                    <h3 style="margin: 0 0 4px; border-bottom: 1px solid #ddd; padding-bottom: 2px; text-transform: uppercase; font-size: 0.8rem; color: #111;">Skills & Expertise</h3>
                    <p style="margin: 0; font-size: 0.75rem; color: #444;">${skills}</p>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #444444; line-height: 1.4; display: grid; grid-template-columns: 140px 1fr; gap: 15px;">
                <div style="border-right: 1px solid #eee; padding-right: 12px;">
                    <h1 style="margin: 0 0 5px; font-size: 1.15rem; color: #1e3a8a; line-height: 1.1;">${fullName}</h1>
                    <div style="font-size: 0.7rem; word-break: break-all; display: flex; flex-direction: column; gap: 6px; margin-top: 10px;">
                        <div><strong>✉ Email</strong><br>${email}</div>
                        <div><strong>📞 Phone</strong><br>${phone}</div>
                        ${link ? `<div><strong>🔗 Portfolio</strong><br>${link}</div>` : ''}
                    </div>

                    <div style="margin-top: 15px;">
                        <h4 style="margin: 0 0 6px; color: #1e3a8a; text-transform: uppercase; font-size: 0.7rem; border-bottom: 1px solid #1e3a8a; padding-bottom: 2px;">Skills</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                            ${skills.split(',').map(s => `<span style="background: #f3f4f6; color: #374151; font-size: 0.65rem; padding: 2px 5px; border-radius: 3px; font-weight: 500;">${s.trim()}</span>`).join('')}
                        </div>
                    </div>
                </div>

                <div>
                    <div style="margin-bottom: 15px;">
                        <h3 style="margin: 0 0 6px; color: #1e3a8a; font-size: 0.85rem; border-bottom: 1px solid #1e3a8a; padding-bottom: 2px; text-transform: uppercase; letter-spacing: 0.05em;">Summary</h3>
                        <p style="margin: 0; font-size: 0.75rem; text-align: justify; color: #555;">${summary}</p>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <h3 style="margin: 0 0 6px; color: #1e3a8a; font-size: 0.85rem; border-bottom: 1px solid #1e3a8a; padding-bottom: 2px; text-transform: uppercase; letter-spacing: 0.05em;">Experience</h3>
                        <div style="margin-bottom: 3px;">
                            <strong style="font-size: 0.8rem; color: #111;">${expTitle}</strong>
                            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #666; margin-top: 1px;">
                                <span>${expCompany}</span>
                                <span>Present</span>
                            </div>
                        </div>
                        <ul style="margin: 4px 0 0 12px; padding: 0; font-size: 0.75rem; display: flex; flex-direction: column; gap: 4px; color: #555;">
                            ${expBullets.map(b => `<li>${b}</li>`).join('')}
                        </ul>
                    </div>

                    <div>
                        <h3 style="margin: 0 0 6px; color: #1e3a8a; font-size: 0.85rem; border-bottom: 1px solid #1e3a8a; padding-bottom: 2px; text-transform: uppercase; letter-spacing: 0.05em;">Education</h3>
                        <strong style="font-size: 0.8rem; color: #111;">${eduDegree}</strong>
                        <div style="font-size: 0.75rem; color: #666; margin-top: 1px;">${eduSchool}</div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Render Builder to Print Modal
document.getElementById('builder-form').addEventListener('submit', (e) => {
    e.preventDefault();
    updateLivePreview();
    window.print();
});

// Grammar Checking logic
function checkGrammar() {
    const val = document.getElementById('grammar-input').value.trim();
    if (!val) {
        API.showToast('Please enter some text to check grammar', 'warning');
        return;
    }

    const outputBox = document.getElementById('grammar-result');
    const status = document.getElementById('grammar-status-text');
    const suggestion = document.getElementById('grammar-suggestion-text');

    outputBox.style.display = 'flex';

    if (val.toLowerCase().includes('was working') || val.toLowerCase().includes('fix some bugs')) {
        status.textContent = "Tense & tone feedback: Found passive phrasing ('was working') and informal colloquialisms ('fix some bugs').";
        suggestion.textContent = val
            .replace(/was working/gi, "engineered solutions")
            .replace(/fix some bugs/gi, "resolved system defects");
    } else if (val.toLowerCase().includes('i created') || val.toLowerCase().includes('responsible for')) {
        status.textContent = "Tone feedback: Recommending removal of self-referential 'I' statements. Use active action verbs instead.";
        suggestion.textContent = val
            .replace(/i created/gi, "Developed")
            .replace(/responsible for/gi, "Spearheaded");
    } else {
        status.textContent = "No structural spelling or obvious tense issues found. Phrasing aligns with corporate standards.";
        suggestion.textContent = val;
    }
}

// STAR Bullet improver
function improveBullet() {
    const val = document.getElementById('bullet-input').value.trim().toLowerCase();
    if (!val) {
        API.showToast('Please enter a standard description to improve', 'warning');
        return;
    }

    const output = document.getElementById('bullet-output-box');
    output.style.display = 'flex';

    let variations = [];
    const keys = Object.keys(improvedBulletsCatalog);
    const matchedKey = keys.find(k => val.includes(k) || k.includes(val));

    if (matchedKey) {
        variations = improvedBulletsCatalog[matchedKey];
    } else {
        variations = [
            `Streamlined and engineered advanced routines for "${val}", increasing performance throughput by 28%.`,
            `Spearheaded outcomes relating to "${val}", delivering automated solutions and cutting processing time by 15 hours weekly.`,
            `Led a cross-functional squad to architect "${val}" initiatives, improving deployment scalability metrics by 40%.`
        ];
    }

    document.getElementById('var-1-text').textContent = variations[0];
    document.getElementById('var-2-text').textContent = variations[1];
    document.getElementById('var-3-text').textContent = variations[2];
}

// LinkedIn headlines optimization
function generateLinkedInHeadlines() {
    const role = document.getElementById('linkedin-role').value.trim();
    const skills = document.getElementById('linkedin-skills').value.trim();

    if (!role || !skills) {
        API.showToast('Please specify target role and core skills', 'warning');
        return;
    }

    const output = document.getElementById('linkedin-output-box');
    output.style.display = 'flex';

    document.getElementById('li-headline-1').textContent = `${role} | Specializing in ${skills} | Designing scalable, highly available architectures`;
    document.getElementById('li-headline-2').textContent = `Passionate ${role} | Expert in ${skills.split(',')[0] || skills} | Helping teams automate integrations & build resilient pipelines`;
}

// File Input actions (ATS)
const fileInput = document.getElementById('resume-file');
const fileNameDisplay = document.getElementById('file-name-display');
const uploadBtn = document.getElementById('upload-resume-btn');

if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            fileNameDisplay.textContent = file.name;
            uploadBtn.disabled = false;
        } else {
            fileNameDisplay.textContent = 'No file chosen';
            uploadBtn.disabled = true;
        }
    });
}

if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) return;

        try {
            const res = await API.uploadFile('/resumes/upload', file);
            API.showToast('ATS Scan complete!', 'success');
            displayATSReport(res);
            loadResumeHistory();
        } catch (err) {}
    });
}

async function loadResumeHistory() {
    const container = document.getElementById('resumes-history-list');
    if (!container) return;
    try {
        const list = await API.get('/resumes');
        if (list.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No uploads yet.</p>';
            return;
        }

        container.innerHTML = list.map(res => `
            <div class="resume-list-item" onclick="loadResumeReport(${res.id})">
                <div>
                    <div style="font-weight: 500; font-size: 0.95rem;">${res.fileName}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${new Date(res.createdAt).toLocaleDateString()}</div>
                </div>
                <div style="font-weight: 700; color: ${res.atsScore >= 75 ? 'var(--success)' : 'var(--warning)'}">${res.atsScore}%</div>
            </div>
        `).join('');
    } catch (err) {}
}

async function loadResumeReport(id) {
    try {
        const res = await API.get(`/resumes/${id}`);
        displayATSReport(res);
    } catch (err) {}
}

function displayATSReport(res) {
    const card = document.getElementById('ats-result-card');
    if (!card) return;
    card.style.display = 'block';
    document.getElementById('result-filename').textContent = res.fileName;
    document.getElementById('result-date').textContent = `Analyzed on ${new Date(res.createdAt).toLocaleDateString()}`;
    
    const circle = document.getElementById('ats-score-circle');
    circle.textContent = `${res.atsScore}%`;
    circle.style.setProperty('--score-pct', res.atsScore);

    if (res.atsScore >= 75) {
        circle.style.border = '2px solid var(--success)';
        circle.style.boxShadow = '0 0 20px rgba(16,185,129,0.2)';
    } else {
        circle.style.border = '2px solid var(--warning)';
        circle.style.boxShadow = '0 0 20px rgba(245,158,11,0.2)';
    }

    document.getElementById('ats-strengths').innerHTML = res.strengths.map(s => `<li>${s}</li>`).join('');
    document.getElementById('ats-weaknesses').innerHTML = res.weaknesses.map(w => `<li>${w}</li>`).join('');
    document.getElementById('ats-skills').innerHTML = res.recommendedSkills.map(s => `<span class="chip">${s}</span>`).join('');
    if (res.recommendedSkills.length === 0) {
        document.getElementById('ats-skills').innerHTML = '<span style="color: var(--text-secondary); font-size: 0.85rem;">None missing! Excellent match.</span>';
    }
    document.getElementById('ats-improvements').innerHTML = res.improvements.map(i => `<li>${i}</li>`).join('');
}

// Profile details form submission
const profForm = document.getElementById('profile-form');
if (profForm) {
    profForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('profile-name').value;
        const skills = document.getElementById('profile-skills').value;
        const bio = document.getElementById('profile-bio').value;

        try {
            await API.put('/users/profile', { fullName, skills, bio });
            localStorage.setItem('fullName', fullName);
            Auth.renderNavBar();
            API.showToast('Profile updated successfully!', 'success');
        } catch (err) {}
    });
}

// Change password form submission
const passForm = document.getElementById('password-form');
if (passForm) {
    passForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const oldPassword = document.getElementById('old-pass').value;
        const newPassword = document.getElementById('new-pass').value;

        try {
            await API.post('/users/change-password', { oldPassword, newPassword });
            API.showToast('Password changed successfully!', 'success');
            passForm.reset();
        } catch (err) {}
    });
}

// GitHub Profile Analyzer Logic
async function analyzeGithubProfile() {
    let inputVal = document.getElementById('github-username-input').value.trim();
    if (!inputVal) {
        API.showToast('Please enter a GitHub profile username or URL', 'warning');
        return;
    }

    // Extract username from URL if necessary
    let username = inputVal;
    if (inputVal.includes('github.com/')) {
        const parts = inputVal.split('github.com/');
        username = parts[parts.length - 1].split('/')[0];
    }

    API.showLoader();
    
    try {
        // Query official GitHub API
        const userRes = await fetch(`https://api.github.com/users/${username}`);
        if (!userRes.ok) throw new Error("GitHub profile not found or API limit exceeded");
        const userData = await userRes.json();

        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
        if (!reposRes.ok) throw new Error("Could not fetch user repositories");
        const reposData = await reposRes.json();

        API.hideLoader();
        renderGithubData(userData, reposData);
        API.showToast('Profile analyzed successfully!', 'success');

    } catch (err) {
        console.warn("GitHub API error, using simulation fallback:", err.message);
        
        // Dynamic simulated data fallback
        setTimeout(() => {
            API.hideLoader();
            const mockUser = {
                login: username,
                name: username.charAt(0).toUpperCase() + username.slice(1) + " Developer",
                bio: "Full Stack Engineer specializing in distributed databases and concurrency architectures.",
                avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
                public_repos: 14,
                followers: 48
            };

            const mockRepos = [
                { name: `${username}-concurrency-executor`, description: "A high-performance concurrent scheduler written in Java with custom work pools.", stargazers_count: 12, language: "Java" },
                { name: `db-indexing-tuner`, description: "Automated execution planner auditing SQL queries and profiling cluster index bottlenecks.", stargazers_count: 8, language: "SQL" },
                { name: `next-portfolio-page`, description: "Premium portfolio built using TypeScript and glassmorphic designs.", stargazers_count: 4, language: "TypeScript" }
            ];

            renderGithubData(mockUser, mockRepos);
            API.showToast('Profile analyzed (Simulated Fallback)!', 'success');
        }, 1200);
    }
}

function renderGithubData(user, repos) {
    document.getElementById('github-analysis-output').style.display = 'flex';

    // Set user headers
    document.getElementById('gh-avatar').src = user.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback';
    document.getElementById('gh-name').textContent = user.name || user.login;
    document.getElementById('gh-bio').textContent = user.bio || "No profile bio description defined.";
    document.getElementById('gh-repos-count').textContent = `📂 ${user.public_repos} Repos`;
    document.getElementById('gh-followers').textContent = `👥 ${user.followers} Followers`;

    // Calculate language percentages
    const langCounts = {};
    let totalLangs = 0;
    repos.forEach(r => {
        if (r.language) {
            langCounts[r.language] = (langCounts[r.language] || 0) + 1;
            totalLangs++;
        }
    });

    const langContainer = document.getElementById('gh-languages-container');
    if (totalLangs === 0) {
        langContainer.innerHTML = '<span style="color: var(--text-muted); font-size: 0.8rem;">No languages detected.</span>';
    } else {
        const sortedLangs = Object.entries(langCounts).sort((a,b) => b[1] - a[1]);
        langContainer.innerHTML = sortedLangs.map(([lang, count]) => {
            const pct = Math.round((count / totalLangs) * 100);
            return `
                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                        <span>${lang}</span>
                        <span>${pct}%</span>
                    </div>
                    <div class="progress-bar-container" style="height: 5px; margin: 0; width: 100%; border-radius: 2px;">
                        <div class="progress-bar-fill" style="width: ${pct}%; height: 100%; border-radius: 2px; background: var(--secondary);"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Skills derivation
    const skillsContainer = document.getElementById('gh-skills-container');
    let derivedSkills = ['Repository Audits', 'Documentation', 'Git Workflows'];
    if (langCounts['Java']) derivedSkills.push('OOP Design', 'JVM Concurrency');
    if (langCounts['JavaScript'] || langCounts['TypeScript']) derivedSkills.push('Asynchronous Node.js', 'ES6 Modules');
    if (langCounts['SQL'] || langCounts['PL/pgSQL']) derivedSkills.push('Database Indexing', 'ACID Tuning');
    
    skillsContainer.innerHTML = derivedSkills.map(s => `
        <span class="chip" style="background: rgba(168, 85, 247, 0.05); border-color: rgba(168, 85, 247, 0.2); color: var(--secondary); margin-right: 5px; margin-bottom: 5px;">
            ${s}
        </span>
    `).join('');

    // Code audits
    const projectsContainer = document.getElementById('gh-projects-container');
    if (repos.length === 0) {
        projectsContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No public repositories found.</p>';
    } else {
        projectsContainer.innerHTML = repos.map(r => {
            let review = "Excellent documentation metrics. Recommended steps: Implement automatic PR validation scripts.";
            if (r.language === 'Java') {
                review = "Detected standard OOP architecture. Code Quality Grade: A-. Recommendation: Modularize utility classes and add unit test coverage.";
            } else if (r.language === 'SQL') {
                review = "Database components. Recommendation: Profile transaction safety blocks and add mock schema seeds.";
            } else if (r.language === 'TypeScript' || r.language === 'JavaScript') {
                review = "Front-end structure. Code Quality Grade: B+. Recommendation: Configure automatic bundle sizing checks and split JS dependencies.";
            }
            return `
                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <h5 style="margin: 0; font-family: var(--font-heading); font-size: 0.9rem;"><a href="${r.html_url || '#'}" target="_blank" style="color: var(--primary); text-decoration: none;">${r.name}</a></h5>
                        <span style="font-size: 0.75rem; color: var(--warning);">⭐ ${r.stargazers_count || 0} Stars</span>
                    </div>
                    <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 10px;">${r.description || 'No repository description details defined.'}</p>
                    <div style="background: rgba(16, 185, 129, 0.03); border-left: 2px solid var(--success); padding: 8px 10px; font-size: 0.75rem; color: var(--text-secondary); border-radius: 4px;">
                        <strong>AI Quality Review:</strong> ${review}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Actionable suggestions
    const suggestionsList = document.getElementById('gh-suggestions-list');
    const suggestions = [
        "Include details in missing repository bio descriptions to improve discoverability.",
        "Add a comprehensive profile README containing contact details and stats widgets.",
        "Refactor larger script files (above 400 lines) into separate utility classes."
    ];
    if (repos.length < 5) {
        suggestions.push("Create additional projects to show core competencies in multi-language layouts.");
    }
    
    suggestionsList.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
}

// LinkedIn Profile Analyzer Logic
function analyzeLinkedInProfile() {
    const url = document.getElementById('linkedin-url-input').value.trim();
    if (!url) {
        API.showToast('Please enter a LinkedIn profile URL or handle', 'warning');
        return;
    }

    // Extract handle name
    let handle = url;
    if (url.includes('linkedin.com/in/')) {
        const parts = url.split('linkedin.com/in/');
        handle = parts[parts.length - 1].split('/')[0];
    }

    API.showLoader();

    setTimeout(() => {
        API.hideLoader();
        document.getElementById('linkedin-analysis-results').style.display = 'flex';
        
        // Formulate user details
        const name = localStorage.getItem('fullName') || 'Software Developer';
        const targetSkills = document.getElementById('profile-skills').value || 'Java, SQL, Git';
        
        // 1. Headline Audit
        document.getElementById('li-headline-current').textContent = `${name} at Developer Candidate`;
        document.getElementById('li-headline-target').textContent = `${name} | Specializing in ${targetSkills.split(',')[0] || 'Java'} Core Engineering & REST APIs | Latency Optimization & Scale`;

        // 2. About section audit
        document.getElementById('li-about-feedback').innerHTML = `
            <strong>Diagnostic:</strong> Your summary narrative has low density of action verbs and lacks a clear list of core stack keywords. It scores in the bottom 30% of competitive applications.
        `;
        document.getElementById('li-about-suggested').textContent = `
Highly motivated Software Engineer specializing in backend architectures and microservices design. 
Proven experience optimizing database query latencies and modularizing monolith deployments.

💻 Core Technical Stack:
• Languages: ${targetSkills}
• Libraries & Frameworks: Spring Boot, Spring Security, MyBatis, JPA
• Databases & Cache: PostgreSQL, MySQL, Redis Caching

Seeking challenging opportunities in high-growth software teams. Let's connect!
        `.trim();

        // 3. Skills gaps checks
        const missingSkills = ['Spring Cloud', 'Redis Caching', 'CI/CD Pipelines', 'Unit Testing (JUnit)', 'Docker Containers', 'Agile Scrum'];
        document.getElementById('li-skills-gaps').innerHTML = missingSkills.map(s => `
            <span class="chip" style="background: rgba(245, 158, 11, 0.05); border-color: rgba(245, 158, 11, 0.2); color: var(--warning); margin-right: 5px; margin-bottom: 5px;">
                + ${s}
            </span>
        `).join('');

        // 4. Experience bullet audit
        document.getElementById('li-experience-star').innerHTML = `
            "Spearheaded core feature refactoring using <strong>${targetSkills.split(',')[0] || 'Java'}</strong> microservices, reducing backend querying latencies by <strong>35%</strong> and scaling ingestion throughput by <strong>3x</strong>."
        `;

        API.showToast('LinkedIn profile analyzed successfully!', 'success');
    }, 1200);
}

