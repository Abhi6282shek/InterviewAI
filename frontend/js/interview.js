let interviewId = null;
let questions = [];
let currentIndex = 0;
let activeTimer = null;
let questionTimeTaken = 0;
let categoryName = '';
let webcamStream = null;
let avatarInstance = null;

function initAvatar() {
    if (typeof AIAvatar !== 'undefined') {
        avatarInstance = new AIAvatar('avatar-canvas');
    }
}

function setAvatarState(state) {
    if (avatarInstance) {
        avatarInstance.setState(state);
    }
}

// Web Speech API Voice Recognition setup
let recognition = null;
let isRecording = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        const txtArea = document.getElementById('answer-input');
        if (finalTranscript) {
            txtArea.value += (txtArea.value ? ' ' : '') + finalTranscript;
            updateFluencyMeter(txtArea.value);
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech Recognition Error: ", event.error);
        stopRecording();
        API.showToast("Voice recognition failed: " + event.error, "error");
    };
}

// Bind voice recorder actions on load
document.addEventListener('DOMContentLoaded', () => {
    const voiceBtn = document.getElementById('voice-record-btn');
    if (!voiceBtn) return;
    
    if (!recognition) {
        voiceBtn.style.display = 'none';
        return;
    }

    voiceBtn.addEventListener('click', () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    });
});

function startRecording() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    isRecording = true;
    recognition.start();
    
    const voiceBtn = document.getElementById('voice-record-btn');
    const pulse = document.getElementById('record-pulse');
    const statusSpan = document.getElementById('voice-status');
    
    if (voiceBtn) voiceBtn.innerHTML = '🛑 Stop Recording';
    if (pulse) pulse.style.display = 'block';
    if (statusSpan) statusSpan.textContent = 'Listening (Speak into microphone)...';
}

function stopRecording() {
    isRecording = false;
    recognition.stop();
    
    const voiceBtn = document.getElementById('voice-record-btn');
    const pulse = document.getElementById('record-pulse');
    const statusSpan = document.getElementById('voice-status');
    
    if (voiceBtn) voiceBtn.innerHTML = '🎤 Record Answer (Voice-to-Text)';
    if (pulse) pulse.style.display = 'none';
    if (statusSpan) statusSpan.textContent = '';
}

// Setup form submission
document.getElementById('setup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = document.getElementById('category').value;
    const difficulty = document.getElementById('difficulty').value;
    const type = document.getElementById('type').value;
    categoryName = category;

    try {
        const res = await API.post('/interviews/setup', { category, difficulty, type });
        interviewId = res.interviewId;
        questions = res.questions.map(q => ({
            ...q,
            tempAnswer: '',
            isAnswered: false
        }));
        currentIndex = 0;

        // Configure screen state
        document.getElementById('setup-screen').style.display = 'none';
        document.getElementById('arena-screen').style.display = 'block';
        document.getElementById('arena-subtitle').textContent = `${category} • ${difficulty} • ${type}`;

        // Initialize webcam
        startWebcam();

        // Initialize avatar
        initAvatar();

        // Load Question
        loadQuestion();
    } catch (err) {
        console.error("Failed to setup interview:", err);
    }
});

// Camera preview setup
async function startWebcam() {
    const video = document.getElementById('camera-feed');
    const placeholder = document.getElementById('camera-placeholder');
    if (!video) return;

    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = webcamStream;
        video.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
    } catch (err) {
        console.warn("Camera access denied or unavailable:", err);
        if (placeholder) {
            placeholder.textContent = '❌ Camera Unavailable';
            placeholder.style.fontSize = '1rem';
        }
    }
}

function stopWebcam() {
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
    }
}

// Speech synthesis speaking question out loud
function speakQuestion(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // stop current speak threads
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.onstart = () => {
            const ind = document.getElementById('ai-speaking-indicator');
            const status = document.getElementById('avatar-status-text');
            
            if (ind) ind.classList.add('speaking');
            if (status) status.textContent = 'Speaking...';
            setAvatarState('speaking');
        };
        
        utterance.onend = () => {
            const ind = document.getElementById('ai-speaking-indicator');
            const status = document.getElementById('avatar-status-text');
            
            if (ind) ind.classList.remove('speaking');
            if (status) status.textContent = 'Listening...';
            setAvatarState('listening');
        };
        
        window.speechSynthesis.speak(utterance);
    }
}

function loadQuestion() {
    if (currentIndex >= questions.length) {
        finalizeInterview();
        return;
    }

    // Stop recording/speaking
    if (isRecording) stopRecording();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    const q = questions[currentIndex];
    document.getElementById('question-index-label').textContent = `Question ${currentIndex + 1} of ${questions.length}`;
    document.getElementById('question-text').textContent = q.questionText;
    
    // Load temp answer
    const input = document.getElementById('answer-input');
    input.value = q.tempAnswer || '';
    updateFluencyMeter(input.value);

    // AI reads question out loud
    speakQuestion(q.questionText);

    // Set bookmark state
    const bkBtn = document.getElementById('bookmark-btn');
    if (q.bookmarked) {
        bkBtn.classList.add('active');
        bkBtn.textContent = '★ Question Bookmarked';
    } else {
        bkBtn.classList.remove('active');
        bkBtn.textContent = '☆ Bookmark Question';
    }

    // Set progress bar fill
    const pct = (currentIndex / questions.length) * 100;
    document.getElementById('progress-bar').style.width = `${pct}%`;

    // Render navigation sidebar list
    renderQuestionNav();

    // Reset question timer
    questionTimeTaken = 0;
    startTimer();
}

// Question navigation sidebar
function renderQuestionNav() {
    const nav = document.getElementById('question-nav-list');
    if (!nav) return;

    nav.innerHTML = questions.map((q, idx) => {
        let statusClass = '';
        if (idx === currentIndex) statusClass = 'current';
        else if (q.isAnswered) statusClass = 'answered';

        let name = `Question ${idx + 1}`;
        if (q.bookmarked) name += ' ★';

        return `
            <button type="button" class="q-nav-item ${statusClass}" onclick="navigateToQuestion(${idx})">
                ${name}
            </button>
        `;
    }).join('');
}

function navigateToQuestion(idx) {
    if (idx < 0 || idx >= questions.length) return;
    
    // Save current typed response to temp
    const currentText = document.getElementById('answer-input').value;
    questions[currentIndex].tempAnswer = currentText;

    currentIndex = idx;
    loadQuestion();
}

// Real-time confidence/fluency meter based on word count/composition
function updateFluencyMeter(val) {
    const words = val.trim().split(/\s+/).filter(w => w.length > 0).length;
    let score = 0;
    if (words > 0) {
        if (words < 10) score = 35;
        else if (words < 25) score = 65;
        else if (words < 50) score = 88;
        else score = 96;
    }

    const fill = document.getElementById('confidence-fill');
    const text = document.getElementById('confidence-pct-text');
    if (fill) fill.style.width = `${score}%`;
    if (text) text.textContent = `Fluency: ${score}%`;
}

// Attach typing dynamic fluency listener
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('answer-input');
    if (input) {
        input.addEventListener('input', (e) => {
            updateFluencyMeter(e.target.value);
            questions[currentIndex].tempAnswer = e.target.value;
        });
    }
});

// Timer management
function startTimer() {
    if (activeTimer) clearInterval(activeTimer);

    let secondsLeft = 120; // 2 minutes
    updateTimerDisplay(secondsLeft);

    activeTimer = setInterval(() => {
        secondsLeft--;
        questionTimeTaken++;
        updateTimerDisplay(secondsLeft);

        if (secondsLeft <= 0) {
            clearInterval(activeTimer);
            API.showToast("Time's up! Submitting current answer.", "warning");
            submitCurrentAnswer();
        }
    }, 1000);
}

function updateTimerDisplay(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    document.getElementById('timer-display').textContent = `${m}:${s}`;
}

// Bookmark Toggle
document.getElementById('bookmark-btn').addEventListener('click', async () => {
    const q = questions[currentIndex];
    try {
        const res = await API.post(`/interviews/bookmark-question/${q.id}`);
        q.bookmarked = res.bookmarked;
        
        const bkBtn = document.getElementById('bookmark-btn');
        if (res.bookmarked) {
            bkBtn.classList.add('active');
            bkBtn.textContent = '★ Question Bookmarked';
            API.showToast('Question bookmarked successfully!', 'success');
        } else {
            bkBtn.classList.remove('active');
            bkBtn.textContent = '☆ Bookmark Question';
        }
        renderQuestionNav();
    } catch (err) {}
});

// Submit current answer
document.getElementById('submit-answer-btn').addEventListener('click', () => {
    submitCurrentAnswer();
});

async function submitCurrentAnswer() {
    clearInterval(activeTimer);
    const q = questions[currentIndex];
    const userAnswer = document.getElementById('answer-input').value;
    q.tempAnswer = userAnswer;
    q.isAnswered = true;
    setAvatarState('thinking');

    try {
        await API.post('/interviews/submit-answer', {
            questionId: q.id,
            userAnswer: userAnswer,
            timeTakenSeconds: questionTimeTaken
        });

        API.showToast('Answer submitted!', 'success');
        currentIndex++;
        loadQuestion();
    } catch (err) {
        startTimer(); // keep timer active if upload fails
    }
}

async function finalizeInterview() {
    stopWebcam();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setAvatarState('thinking');
    try {
        API.showLoader();
        const res = await API.post(`/${interviewId}/complete`);
        API.hideLoader();
        API.showToast('Mock Interview Completed!', 'success');
        setTimeout(() => {
            window.location.href = `result.html?id=${interviewId}`;
        }, 1000);
    } catch (err) {
        try {
            const res = await API.post(`/interviews/${interviewId}/complete`);
            API.hideLoader();
            API.showToast('Mock Interview Completed!', 'success');
            setTimeout(() => {
                window.location.href = `result.html?id=${interviewId}`;
            }, 1000);
        } catch (e) {
            API.hideLoader();
        }
    }
}

// Global Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Only check shortcuts if in active screen
    const arena = document.getElementById('arena-screen');
    if (!arena || arena.style.display === 'none') return;

    // Ctrl + Space (Toggle voice recording)
    if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        const recordBtn = document.getElementById('voice-record-btn');
        if (recordBtn) recordBtn.click();
    }

    // Ctrl + Enter (Submit answer)
    if (e.ctrlKey && e.code === 'Enter') {
        e.preventDefault();
        const submitBtn = document.getElementById('submit-answer-btn');
        if (submitBtn) submitBtn.click();
    }

    // Ctrl + B (Toggle bookmark)
    if (e.ctrlKey && e.code === 'KeyB') {
        e.preventDefault();
        const bkBtn = document.getElementById('bookmark-btn');
        if (bkBtn) bkBtn.click();
    }
});

// Pre-fill setup parameters from query parameters
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const difficulty = params.get('difficulty');
    
    // Check Company Mode parameters
    const company = params.get('company');
    const round = params.get('round');
    const diff = params.get('diff');
    
    if (company && round) {
        let mappedDiff = 'Intermediate';
        if (diff === 'hard') mappedDiff = 'Advanced';
        if (diff === 'easy') mappedDiff = 'Beginner';
        
        let type = round === 'Technical' ? 'Technical' : 'HR';
        
        try {
            API.showLoader();
            const res = await API.post('/interviews/setup', {
                category: `Company: ${company}`,
                difficulty: mappedDiff,
                type: type
            });
            API.hideLoader();
            
            interviewId = res.interviewId;
            questions = res.questions.map(q => ({
                ...q,
                tempAnswer: '',
                isAnswered: false
            }));
            currentIndex = 0;
            categoryName = `Company: ${company}`;

            // Configure screen state
            document.getElementById('setup-screen').style.display = 'none';
            document.getElementById('arena-screen').style.display = 'block';
            document.getElementById('arena-subtitle').textContent = `${company} • ${mappedDiff} • ${round}`;

            // Initialize webcam & avatar
            startWebcam();
            initAvatar();

            // Load Question
            loadQuestion();
        } catch (err) {
            API.hideLoader();
            console.error("Failed to launch company simulation:", err);
        }
        return;
    }
    
    if (category) {
        const catSelect = document.getElementById('category');
        if (catSelect) catSelect.value = category;
    }
    if (difficulty) {
        const diffSelect = document.getElementById('difficulty');
        if (diffSelect) diffSelect.value = difficulty;
    }
});
