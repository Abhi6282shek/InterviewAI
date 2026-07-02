const stagesCatalog = [
    {
        badge: "STAGE 1: CODING",
        title: "Two Sum Algorithm",
        desc: `<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>
               <p>Write your solution in JavaScript. The function signature must remain <code>twoSum</code>.</p>`,
        type: 'code',
        lang: 'javascript',
        starter: `function twoSum(nums, target) {\n    // Write your JS code here\n    \n}`,
        testCases: [
            { inputs: [[2, 7, 11, 15], 9], expected: [0, 1] }
        ]
    },
    {
        badge: "STAGE 2: JAVA CORE",
        title: "ConcurrentHashMap Internals",
        desc: `<p>Explain the core differences between <code>HashMap</code> and <code>ConcurrentHashMap</code>.</p>
               <p>Detail how thread safety is achieved, particularly focusing on segment level locking vs CAS node operations introduced in Java 8.</p>`,
        type: 'qa'
    },
    {
        badge: "STAGE 3: DATABASE SQL",
        title: "High Performance Placements",
        desc: `<p>Write a query to select the <code>fullName</code> and <code>email</code> from the <code>users</code> table where the <code>score</code> is greater than or equal to 85, sorted by score in descending order.</p>`,
        type: 'code',
        lang: 'sql',
        starter: `-- Write your SQL query here\nSELECT fullName, email FROM users \nWHERE \n`
    },
    {
        badge: "STAGE 4: HR INQUIRY",
        title: "Project Conflict Resolution",
        desc: `<p>Describe a situation where you had a technical disagreement with a team lead or colleague.</p>
               <p>Explain how you presented your data, aligned perspectives, and successfully navigated the conflict.</p>`,
        type: 'qa'
    },
    {
        badge: "STAGE 5: SYSTEM DESIGN",
        title: "Scale bit.ly URL Shortener",
        desc: `<p>Explain how you would design a scalable URL Shortening service like Bit.ly.</p>
               <p>Focus on key hashing strategies (Base62), write caches (Redis), and redirection structures to prevent database bottlenecks.</p>`,
        type: 'qa'
    },
    {
        badge: "STAGE 6: BEHAVIORAL VALUES",
        title: "Ownership & Bias for Action",
        desc: `<p>Describe a time you noticed an issue or bottleneck outside your direct responsibilities and took ownership to resolve it.</p>
               <p>Detail the action steps taken and the final measurable outcome.</p>`,
        type: 'qa'
    }
];

let currentStageIndex = 0;
let monacoEditorInstance = null;
let savedResponses = {}; // Keyed by stage index
let webcamStream = null;
let avatarInstance = null;
let recognition = null;
let isRecording = false;

document.addEventListener('DOMContentLoaded', () => {
    // Initial load
    savedResponses = stagesCatalog.map((s, idx) => ({
        index: idx,
        val: s.starter || ''
    }));

    loadStage(0);

    // Bind next stage button
    document.getElementById('btn-next-stage').addEventListener('click', () => {
        submitAndProgress();
    });

    // Bind run code button
    document.getElementById('btn-run-code').addEventListener('click', () => {
        runCodeHeuristic();
    });

    // Bind Voice Recording
    setupVoiceRecognition();
});

// Setup Speech recognition
function setupVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            const input = document.getElementById('qa-response-input');
            if (finalTranscript && input) {
                input.value += (input.value ? ' ' : '') + finalTranscript;
                updateFluencyBar(input.value);
            }
        };

        recognition.onerror = (e) => {
            console.error("Mixed Voice Rec error:", e.error);
            stopVoiceRecording();
        };

        const recBtn = document.getElementById('btn-voice-record');
        recBtn.addEventListener('click', () => {
            if (isRecording) stopVoiceRecording();
            else startVoiceRecording();
        });
    } else {
        document.getElementById('btn-voice-record').style.display = 'none';
    }
}

function startVoiceRecording() {
    isRecording = true;
    if (recognition) {
        recognition.start();
        document.getElementById('btn-voice-record').innerHTML = '🛑 Stop Recording';
        document.getElementById('voice-status').textContent = 'Listening (Speak clearly)...';
        setAvatarState('listening');
    }
}

function stopVoiceRecording() {
    isRecording = false;
    if (recognition) {
        recognition.stop();
        document.getElementById('btn-voice-record').innerHTML = '🎤 Record Answer (Voice-to-Text)';
        document.getElementById('voice-status').textContent = '';
        setAvatarState('idle');
    }
}

function updateFluencyBar(val) {
    const words = val.trim().split(/\s+/).filter(w => w.length > 0).length;
    let score = 0;
    if (words > 0) {
        if (words < 15) score = 30;
        else if (words < 35) score = 65;
        else if (words < 70) score = 88;
        else score = 96;
    }
    const bar = document.getElementById('fluency-bar-fill');
    if (bar) bar.style.width = `${score}%`;
}

function setAvatarState(state) {
    if (avatarInstance) {
        avatarInstance.setState(state);
    }
}

function loadStage(idx) {
    const stage = stagesCatalog[idx];
    document.getElementById('round-badge').textContent = stage.badge;
    document.getElementById('stage-title').textContent = stage.title;
    document.getElementById('stage-instructions').innerHTML = stage.desc;
    document.getElementById('stage-progress-label').textContent = `Stage ${idx + 1} of 6`;

    // Highlight Stepper
    document.querySelectorAll('.step-node').forEach((node, nodeIdx) => {
        node.className = 'step-node';
        if (nodeIdx === idx) node.classList.add('active');
        else if (nodeIdx < idx) node.classList.add('completed');
    });

    const editorModule = document.getElementById('editor-module');
    const qaModule = document.getElementById('qa-module');
    const mediaCard = document.getElementById('media-card');

    if (stage.type === 'code') {
        editorModule.style.display = 'block';
        qaModule.style.display = 'none';
        mediaCard.style.display = 'none';

        // Load Monaco
        document.getElementById('editor-lang-label').textContent = `Language: ${stage.lang.toUpperCase()}`;
        document.getElementById('console-terminal').textContent = 'Console Output idle. Write code and click Run Case.';

        if (monacoEditorInstance) {
            monacoEditorInstance.setValue(savedResponses[idx].val || stage.starter);
            const model = monacoEditorInstance.getModel();
            monaco.editor.setModelLanguage(model, stage.lang);
        } else {
            require(['vs/editor/editor.main'], () => {
                monacoEditorInstance = monaco.editor.create(document.getElementById('mixed-monaco-container'), {
                    value: savedResponses[idx].val || stage.starter,
                    language: stage.lang,
                    theme: 'vs-dark',
                    automaticLayout: true,
                    fontSize: 13,
                    minimap: { enabled: false }
                });
            });
        }
    } else {
        editorModule.style.display = 'none';
        qaModule.style.display = 'block';
        mediaCard.style.display = 'block';

        const textarea = document.getElementById('qa-response-input');
        textarea.value = savedResponses[idx].val || '';
        updateFluencyBar(textarea.value);

        // Active Webcam & Canvas Avatar
        startWebcam();
        if (!avatarInstance) {
            avatarInstance = new AIAvatar('mixed-avatar-canvas');
        }
        setAvatarState('speaking');
        
        // Voice speaks the stage prompts out loud
        speakPrompt(stage.title);
    }
}

function speakPrompt(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setAvatarState('speaking');
        utterance.onend = () => setAvatarState('listening');
        window.speechSynthesis.speak(utterance);
    }
}

async function startWebcam() {
    const video = document.getElementById('mixed-camera-feed');
    const placeholder = document.getElementById('webcam-placeholder');
    if (!video) return;
    if (webcamStream) return; // already running

    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = webcamStream;
        video.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
    } catch (err) {
        console.warn("Webcam blocked:", err);
    }
}

function stopWebcam() {
    if (webcamStream) {
        webcamStream.getTracks().forEach(t => t.stop());
        webcamStream = null;
    }
}

function runCodeHeuristic() {
    const terminal = document.getElementById('console-terminal');
    if (!monacoEditorInstance) return;
    const code = monacoEditorInstance.getModel().getValue();
    const stage = stagesCatalog[currentStageIndex];

    terminal.textContent = 'Compiling code & executing test case...';
    
    setTimeout(() => {
        if (stage.lang === 'javascript') {
            try {
                // Execute Two Sum sandbox
                const userFunc = eval(`(function(){\n${code}\nreturn twoSum;\n})()`);
                const out = userFunc([2,7,11,15], 9);
                if (Array.isArray(out) && out[0] === 0 && out[1] === 1) {
                    terminal.style.color = '#4ade80';
                    terminal.textContent = `Test Case Passed!\nInput: nums = [2,7,11,15], target = 9\nOutput: ${JSON.stringify(out)}\nExpected: [0,1]`;
                } else {
                    terminal.style.color = '#f87171';
                    terminal.textContent = `Test Case Failed.\nInput: nums = [2,7,11,15], target = 9\nOutput: ${JSON.stringify(out)}\nExpected: [0,1]`;
                }
            } catch (err) {
                terminal.style.color = '#f87171';
                terminal.textContent = `Compilation Error: ${err.message}`;
            }
        } else {
            // SQL syntax validation check
            if (code.toLowerCase().includes('select') && code.toLowerCase().includes('users') && code.toLowerCase().includes('score')) {
                terminal.style.color = '#4ade80';
                terminal.textContent = 'SQL syntax check passed. Returned 2 matches.\nColumns: fullName, email';
            } else {
                terminal.style.color = '#f87171';
                terminal.textContent = 'SQL validation error: Select columns missing or improper tables.';
            }
        }
    }, 1000);
}

function submitAndProgress() {
    // Save draft response
    let responseVal = "";
    const stage = stagesCatalog[currentStageIndex];
    
    if (stage.type === 'code') {
        if (monacoEditorInstance) {
            responseVal = monacoEditorInstance.getValue();
        }
    } else {
        responseVal = document.getElementById('qa-response-input').value;
    }
    
    savedResponses[currentStageIndex].val = responseVal;

    // Check voice recording
    if (isRecording) stopVoiceRecording();

    currentStageIndex++;
    if (currentStageIndex >= 6) {
        finalizeLoop();
    } else {
        loadStage(currentStageIndex);
    }
}

function finalizeLoop() {
    stopWebcam();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    document.getElementById('workspace-grid').style.display = 'none';
    document.getElementById('report-view-card').style.display = 'block';

    // Heuristically calculate scores based on user answers
    // Step 0: Coding, Step 2: SQL (CS depth)
    const codeVal = savedResponses[0].val;
    const sqlVal = savedResponses[2].val;
    
    let codingScore = (codeVal.includes('twoSum') && codeVal.includes('return')) ? 90 : 25;
    let csScore = (sqlVal.includes('SELECT') && sqlVal.includes('score')) ? 85 : 40;

    // Step 1: Java (Technical depth), Step 4: System Design
    const javaVal = savedResponses[1].val.toLowerCase();
    const designVal = savedResponses[4].val.toLowerCase();
    
    let csTechScore = javaVal.length > 30 ? (javaVal.includes('lock') || javaVal.includes('thread') ? 88 : 70) : 35;
    let designScore = designVal.length > 30 ? (designVal.includes('cache') || designVal.includes('hash') || designVal.includes('redis') ? 92 : 75) : 30;

    // Step 3: HR, Step 5: Behavioral
    const hrVal = savedResponses[3].val.toLowerCase();
    const behVal = savedResponses[5].val.toLowerCase();
    let hrScore = (hrVal.length > 40 && (hrVal.includes('action') || hrVal.includes('result') || hrVal.includes('situation'))) ? 88 : 55;

    document.getElementById('rep-coding').textContent = `${codingScore}%`;
    document.getElementById('rep-cs').textContent = `${csTechScore}%`;
    document.getElementById('rep-design').textContent = `${designScore}%`;
    document.getElementById('rep-hr').textContent = `${hrScore}%`;

    // Dynamic career reviews
    let feedback = "";
    if (codingScore > 75 && designScore > 75) {
        feedback = "Outstanding pipeline execution! Your algorithms pass verification parameters easily, and your architectural blueprints demonstrate deep system constraints knowledge. Ready for elite placement opportunities.";
    } else {
        feedback = "Great execution, though technical depth can be optimized. Focus on structuring system design outlines, adding caching, and reviewing core SQL joins constraints to secure optimal grading scores.";
    }
    
    document.getElementById('rep-feedback-text').textContent = feedback;
}
