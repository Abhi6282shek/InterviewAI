// Floating Assistant Operation
document.addEventListener('DOMContentLoaded', () => {
    // Inject floating widgets HTML if not present
    if (!document.getElementById('floating-assistant-widget')) {
        const div = document.createElement('div');
        div.id = 'floating-assistant-widget';
        div.innerHTML = `
            <div class="floating-assistant-trigger" id="assistant-trigger">🤖</div>
            
            <div class="floating-assistant-panel" id="assistant-panel">
                <div class="assistant-header">
                    <h3>InterviewAI Chatbot</h3>
                    <button id="btn-close-assistant" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1.1rem;">✕</button>
                </div>
                
                <div class="assistant-chat-body" id="assistant-chat-body">
                    <div class="assistant-bubble ai">
                        Hi! I am your InterviewAI career assistant. Ask me questions about technical concepts, Java concurrency, SQL query profiling, or mock answers.
                    </div>
                </div>

                <div class="assistant-suggestions">
                    <div class="assistant-chip" onclick="handleSuggestion('Explain DSA')">Explain DSA</div>
                    <div class="assistant-chip" onclick="handleSuggestion('Generate Java Question')">Generate Java Q</div>
                    <div class="assistant-chip" onclick="handleSuggestion('Improve Answer')">Improve Answer</div>
                    <div class="assistant-chip" onclick="handleSuggestion('Explain SQL')">Explain SQL</div>
                </div>

                <div class="assistant-input-bar">
                    <input type="text" class="assistant-text-input" id="assistant-chat-input" placeholder="Type a message...">
                    <button class="assistant-send-btn" id="btn-send-assistant">✈</button>
                </div>
            </div>
        `;
        document.body.appendChild(div);

        // Bind events
        document.getElementById('assistant-trigger').addEventListener('click', toggleAssistantPanel);
        document.getElementById('btn-close-assistant').addEventListener('click', toggleAssistantPanel);
        document.getElementById('btn-send-assistant').addEventListener('click', sendUserMessage);
        document.getElementById('assistant-chat-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendUserMessage();
        });
    }
});

function toggleAssistantPanel() {
    const panel = document.getElementById('assistant-panel');
    if (!panel) return;
    
    if (panel.style.display === 'flex') {
        panel.style.display = 'none';
    } else {
        panel.style.display = 'flex';
        const body = document.getElementById('assistant-chat-body');
        body.scrollTop = body.scrollHeight;
    }
}

function handleSuggestion(text) {
    appendMessage('user', text);
    generateAssistantResponse(text);
}

function sendUserMessage() {
    const input = document.getElementById('assistant-chat-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    appendMessage('user', text);
    input.value = '';

    generateAssistantResponse(text);
}

function appendMessage(sender, text) {
    const body = document.getElementById('assistant-chat-body');
    if (!body) return;

    const div = document.createElement('div');
    div.className = `assistant-bubble ${sender}`;
    div.innerHTML = text.replace(/\n/g, '<br>');
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function generateAssistantResponse(userText) {
    const norm = userText.toLowerCase();
    let response = "I'm here to help! Try clicking the suggestions below or ask me about concurrency, Big O, SQL syntax queries, or behavioral STAR structures.";

    if (norm.includes('explain dsa') || norm.includes('data structure')) {
        response = `<strong>Data Structures & Algorithms (DSA) Guide:</strong><br><br>
1. <strong>Big O Complexity:</strong> Measure execution growth: O(1) constant lookup, O(N) linear iteration, and O(N log N) heap sorting.<br>
2. <strong>Balanced B-Trees:</strong> AVL and Red-Black trees maintain node heights to guarantee O(log N) lookup search paths.<br>
3. <strong>Dynamic Programming:</strong> Solves overlapping subproblems by memoizing search outcomes.`;
    } 
    else if (norm.includes('java question') || norm.includes('generate java')) {
        response = `<strong>Java Practice Question:</strong><br><br>
"Explain how <code>volatile</code> memory visibility variables operate. How does volatile impact CPU registry syncs, and when should you use it instead of synchronized blocks?"`;
    } 
    else if (norm.includes('improve answer') || norm.includes('star method')) {
        response = `<strong>AI STAR Optimizing Advice:</strong><br><br>
Structure developer descriptions using **STAR format** to showcase impact:<br>
• <strong>S - Situation:</strong> Outline context (e.g. "We scaled a 15k QPS query pool").<br>
• <strong>T - Task:</strong> Outline bottleneck.<br>
• <strong>A - Action:</strong> Describe what you coded (e.g. "configured Redis cache writes").<br>
• <strong>R - Result:</strong> Cite metrics ("reducing latency by 35%").`;
    } 
    else if (norm.includes('explain sql') || norm.includes('sql index')) {
        response = `<strong>SQL Database Performance Internals:</strong><br><br>
• <strong>Index Scan vs Seek:</strong> A scan reviews every page of a table index, taking O(N) time. A seek navigates b-tree leaves directly to find values in O(log N) time.<br>
• <strong>ACID Rules:</strong> Atomicity (all or nothing), Consistency, Isolation (dirty/phantom reads safety), Durability.`;
    }
    else if (norm.includes('hello') || norm.includes('hi ') || norm.includes('hey')) {
        response = "Hello! I am your AI career bot. How can I help you optimize your portfolio or practice coding screeners today?";
    }

    setTimeout(() => {
        appendMessage('ai', response);
    }, 800);
}
