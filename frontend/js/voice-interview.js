const voiceQuestionsCatalog = {
    'Java Concurrency': [
        {
            q: "Welcome to your Java Concurrency interview. Can you explain why we use Thread Pools instead of creating raw thread instances?",
            followUpMatch: ["reuse", "resource", "overhead", "limit", "cost"],
            followUpYes: "That is correct. Reusing threads mitigates execution overhead. How would you handle thread pool rejection policies when tasks saturate the queue?",
            followUpNo: "Good start, though resource reuse is the primary reason. Tell me, how would you configure thread pool rejection policies when the queue is full?",
            finalQ: "Understood. Finally, what is the difference between submit() and execute() methods in a ThreadPoolExecutor?"
        }
    ],
    'System Design': [
        {
            q: "Welcome to your System Design round. How do you scale a read-heavy database when query performance starts degrading?",
            followUpMatch: ["cache", "replica", "index", "read", "redis"],
            followUpYes: "Excellent strategy of using caching or replicas. How does introducing a Redis cache impact write consistency, and how do you handle invalidation?",
            followUpNo: "That works, though replica structures are standard. How does adding a Cache like Redis impact consistency, and how do you handle invalidation?",
            finalQ: "Got it. Finally, how do you prevent cache stampede or cache penetration under heavy user traffic?"
        }
    ],
    'Data Structures': [
        {
            q: "Welcome to your Algorithms round. What are the key advantages of a Hash Map, and how are collisions resolved under the hood in Java?",
            followUpMatch: ["chaining", "list", "bucket", "probing", "tree"],
            followUpYes: "Accurate description of chaining bucket structures. When a bucket length exceeds 8, how does Java 8 optimize collision traversal?",
            followUpNo: "Partially correct. Buckets utilize chaining. Can you tell me how Java 8 optimizes collision search when a bucket is heavily saturated?",
            finalQ: "Indeed, it converts to a Red-Black tree. Finally, what is the average vs worst-case lookup time complexity of a HashMap?"
        }
    ],
    'Behavioral': [
        {
            q: "Welcome to your Behavioral round. Describe a time you had a technical disagreement with a team member. How did you resolve it?",
            followUpMatch: ["data", "compromise", "listen", "respect", "discuss"],
            followUpYes: "A logical outcome focused on compromise and data. If the disagreement persists, when do you decide to escalate to a manager?",
            followUpNo: "Interesting. Resolving disputes requires objective metrics. If you cannot align, when do you decide to escalate to a manager?",
            finalQ: "Valid criteria. Finally, how do you handle communicating a deadline that you realize you can no longer meet?"
        }
    ]
};

let currentCategory = 'Java Concurrency';
let currentTurn = 0; // 0: initial, 1: followUp, 2: finalQ
let activeSessionText = "";
let timerInterval = null;
let timerSeconds = 0;
let userAnswers = [];
let avatarInstance = null;

// Speech recognition and synthesis wrappers
let recognition = null;
let isVoiceActive = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop when user pauses speaking
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        addTranscriptLine('candidate', text);
        userAnswers.push(text);
        
        // Progress the conversation round
        progressConversation(text);
    };

    recognition.onerror = (e) => {
        console.error("Speech Recognition Error:", e.error);
        if (e.error === 'no-speech') {
            API.showToast("No speech detected. Please speak clearly into your mic.", "warning");
            // restart listening
            setAgentState('listening');
        }
    };
}

function startVoiceInterview() {
    currentCategory = document.getElementById('voice-category').value;
    currentTurn = 0;
    userAnswers = [];

    document.getElementById('setup-card').style.display = 'none';
    document.getElementById('arena-card').style.display = 'block';
    document.getElementById('voice-topic-badge').textContent = currentCategory;

    // Reset transcripts
    document.getElementById('transcript-feed').innerHTML = '';

    // Start timer
    timerSeconds = 0;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timerSeconds++;
        const m = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
        const s = (timerSeconds % 60).toString().padStart(2, '0');
        document.getElementById('voice-timer').textContent = `⏱️ ${m}:${s}`;
    }, 1000);

    // Initialize avatar
    if (typeof AIAvatar !== 'undefined') {
        avatarInstance = new AIAvatar('voice-avatar-canvas');
    }

    // AI Speaks the first question
    const firstQ = voiceQuestionsCatalog[currentCategory][0].q;
    speakText(firstQ);
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.onstart = () => {
            setAgentState('speaking');
            addTranscriptLine('ai', text);
        };

        utterance.onend = () => {
            // Start listening once AI finishes speaking
            setAgentState('listening');
        };

        window.speechSynthesis.speak(utterance);
    } else {
        // Fallback for browsers without speech synthesis
        addTranscriptLine('ai', text);
        setTimeout(() => {
            setAgentState('listening');
        }, 3000);
    }
}

function setAgentState(state) {
    const label = document.getElementById('agent-state-label');
    if (label) {
        if (state === 'speaking') label.textContent = 'AI is speaking...';
        else if (state === 'listening') label.textContent = 'Listening... Speak now';
        else if (state === 'processing') label.textContent = 'AI is formulating follow-up...';
    }

    if (avatarInstance) {
        avatarInstance.setState(state);
    }
    
    if (state === 'speaking') {
        if (recognition) recognition.stop();
    } else if (state === 'listening') {
        if (recognition) {
            try {
                recognition.start();
            } catch (e) {
                // Ignore start calls if already running
            }
        }
    } else if (state === 'processing') {
        if (recognition) recognition.stop();
    }
}

function progressConversation(userText) {
    setAgentState('processing');

    const config = voiceQuestionsCatalog[currentCategory][0];
    
    setTimeout(() => {
        if (currentTurn === 0) {
            // Check if user answer matched standard keywords
            const matched = config.followUpMatch.some(k => userText.toLowerCase().includes(k));
            const nextQuestion = matched ? config.followUpYes : config.followUpNo;
            currentTurn = 1;
            speakText(nextQuestion);
        } else if (currentTurn === 1) {
            currentTurn = 2;
            speakText(config.finalQ);
        } else {
            // All rounds done!
            setAgentState('processing');
            document.getElementById('agent-state-label').textContent = 'Interview completed. Compiling final scorecard...';
            setTimeout(() => {
                finalizeVoiceInterview();
            }, 2000);
        }
    }, 1500);
}

function addTranscriptLine(sender, text) {
    const feed = document.getElementById('transcript-feed');
    if (!feed) return;

    const el = document.createElement('div');
    el.className = `transcript-line ${sender}`;
    el.innerHTML = `
        <span class="transcript-label">${sender === 'ai' ? 'AI Agent' : 'Candidate'}</span>
        <span>${text}</span>
    `;
    feed.appendChild(el);
    feed.scrollTop = feed.scrollHeight;
}

function finalizeVoiceInterview() {
    if (timerInterval) clearInterval(timerInterval);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (recognition) recognition.stop();

    document.getElementById('arena-card').style.display = 'none';
    document.getElementById('report-card').style.display = 'block';

    // Heuristically compute fluency/accuracy scores based on user answers lengths and vocabulary match
    let totalWords = 0;
    let containsKeywords = false;
    
    userAnswers.forEach(ans => {
        totalWords += ans.split(/\s+/).length;
        if (ans.toLowerCase().includes("thread") || ans.toLowerCase().includes("cache") || ans.toLowerCase().includes("database") || ans.toLowerCase().includes("compromise")) {
            containsKeywords = true;
        }
    });

    // Score calculations
    let fluency = Math.min(Math.max(Math.round(totalWords * 0.8), 20), 98);
    let accuracy = containsKeywords ? 88 : 65;
    let composite = Math.round((fluency + accuracy) / 2);

    document.getElementById('report-fluency').textContent = `${fluency}%`;
    document.getElementById('report-accuracy').textContent = `${accuracy}%`;
    document.getElementById('report-composite').textContent = `${composite}%`;

    // Construct constructive reviews
    let feedback = "";
    if (composite >= 80) {
        feedback = `Outstanding conversational performance! Your technical descriptions were clear, metrics-driven, and you easily adapted to follow-up prompts. Fluency patterns indicate high placement readiness.`;
    } else {
        feedback = `Good progress! Your logic is structured, but you can improve technical depth. We suggest speaking at a steady pace and incorporating specific industry metrics in your answers next time.`;
    }
    
    document.getElementById('report-feedback').textContent = feedback;
}
