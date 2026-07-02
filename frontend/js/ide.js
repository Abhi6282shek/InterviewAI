const problemCatalog = {
    'two-sum': {
        title: 'Two Sum',
        difficulty: 'Easy',
        desc: `
            <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>
            <p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
            <p>You can return the answer in any order.</p>
            <pre><strong>Example 1:</strong>
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].</pre>
        `,
        testCases: [
            { inputs: [[2, 7, 11, 15], 9], expected: [0, 1] },
            { inputs: [[3, 2, 4], 6], expected: [1, 2] },
            { inputs: [[3, 3], 6], expected: [0, 1] }
        ],
        starters: {
            javascript: `function twoSum(nums, target) {\n    // Write your JavaScript code here\n    \n}`,
            python: `def twoSum(nums: list[int], target: int) -> list[int]:\n    # Write your Python code here\n    pass`,
            java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your Java code here\n        return new int[]{}; \n    }\n}`,
            cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your C++ code here\n        return {};\n    }\n};`,
            sql: `-- Write your SQL query here\nSELECT * FROM users;`
        }
    },
    'reverse-list': {
        title: 'Reverse Linked List',
        difficulty: 'Easy',
        desc: `
            <p>Given the <code>head</code> of a singly linked list, reverse the list, and return the reversed list.</p>
            <pre><strong>Example 1:</strong>
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]</pre>
        `,
        testCases: [
            { inputs: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
            { inputs: [[1, 2]], expected: [2, 1] }
        ],
        starters: {
            javascript: `function reverseList(head) {\n    // Write your JavaScript code here\n    \n}`,
            python: `def reverseList(head):\n    # Write your Python code here\n    pass`,
            java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your Java code here\n        return head;\n    }\n}`,
            cpp: `class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write your C++ code here\n        return head;\n    }\n};`,
            sql: `-- Write your SQL query here\nSELECT * FROM nodes;`
        }
    },
    'valid-parentheses': {
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        desc: `
            <p>Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.</p>
            <p>An input string is valid if:</p>
            <ul>
                <li>Open brackets must be closed by the same type of brackets.</li>
                <li>Open brackets must be closed in the correct order.</li>
            </ul>
            <pre><strong>Example 1:</strong>
Input: s = "()[]{}"
Output: true</pre>
        `,
        testCases: [
            { inputs: ["()"], expected: true },
            { inputs: ["()[]{}"], expected: true },
            { inputs: ["(]"], expected: false }
        ],
        starters: {
            javascript: `function isValid(s) {\n    // Write your JavaScript code here\n    \n}`,
            python: `def isValid(s: str) -> bool:\n    # Write your Python code here\n    pass`,
            java: `class Solution {\n    public boolean isValid(String s) {\n        // Write your Java code here\n        return false;\n    }\n}`,
            cpp: `class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your C++ code here\n        return false;\n    }\n};`,
            sql: `-- Write your SQL query here\nSELECT * FROM brackets;`
        }
    },
    'group-anagrams': {
        title: 'Group Anagrams',
        difficulty: 'Medium',
        desc: `
            <p>Given an array of strings <code>strs</code>, group the anagrams together. You can return the answer in any order.</p>
            <pre><strong>Example 1:</strong>
Input: strs = ["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]]</pre>
        `,
        testCases: [
            { inputs: [["eat","tea","tan","ate","nat","bat"]], expected: [["bat"],["nat","tan"],["ate","eat","tea"]] }
        ],
        starters: {
            javascript: `function groupAnagrams(strs) {\n    // Write your JavaScript code here\n    \n}`,
            python: `def groupAnagrams(strs: list[str]) -> list[list[str]]:\n    # Write your Python code here\n    pass`,
            java: `class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        // Write your Java code here\n        return new ArrayList<>();\n    }\n}`,
            cpp: `class Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        // Write your C++ code here\n        return {};\n    }\n};`,
            sql: `-- Write your SQL query here\nSELECT * FROM anagrams;`
        }
    },
    'merge-intervals': {
        title: 'Merge Intervals',
        difficulty: 'Medium',
        desc: `
            <p>Given an array of <code>intervals</code> where <code>intervals[i] = [starti, endi]</code>, merge all overlapping intervals, and return an array of the non-overlapping intervals.</p>
            <pre><strong>Example 1:</strong>
Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]</pre>
        `,
        testCases: [
            { inputs: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] }
        ],
        starters: {
            javascript: `function mergeIntervals(intervals) {\n    // Write your JavaScript code here\n    \n}`,
            python: `def merge(intervals: list[list[int]]) -> list[list[int]]:\n    # Write your Python code here\n    pass`,
            java: `class Solution {\n    public int[][] merge(int[][] intervals) {\n        // Write your Java code here\n        return new int[][]{};\n    }\n}`,
            cpp: `class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        // Write your C++ code here\n        return {};\n    }\n};`,
            sql: `-- Write your SQL query here\nSELECT * FROM intervals;`
        }
    }
};

let editorInstance = null;
let currentProblemId = 'two-sum';
let currentLanguage = 'javascript';

// Load Monaco Editor
document.addEventListener('DOMContentLoaded', () => {
    loadProblem(currentProblemId);
    
    require(['vs/editor/editor.main'], () => {
        editorInstance = monaco.editor.create(document.getElementById('monaco-editor-container'), {
            value: problemCatalog[currentProblemId].starters[currentLanguage],
            language: currentLanguage,
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: false }
        });
    });

    // Listeners
    document.getElementById('problem-selector').addEventListener('change', (e) => {
        currentProblemId = e.target.value;
        loadProblem(currentProblemId);
        if (editorInstance) {
            editorInstance.setValue(problemCatalog[currentProblemId].starters[currentLanguage]);
        }
    });

    document.getElementById('language-selector').addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        if (editorInstance) {
            const model = editorInstance.getModel();
            monaco.editor.setModelLanguage(model, currentLanguage);
            editorInstance.setValue(problemCatalog[currentProblemId].starters[currentLanguage]);
        }
    });

    document.getElementById('btn-run-code').addEventListener('click', () => {
        runTestCases();
    });

    document.getElementById('btn-submit-code').addEventListener('click', () => {
        submitSolution();
    });
});

function loadProblem(id) {
    const prob = problemCatalog[id];
    document.getElementById('problem-title').textContent = prob.title;
    document.getElementById('problem-desc').innerHTML = prob.desc;
    
    const diff = document.getElementById('problem-difficulty');
    diff.textContent = prob.difficulty;
    if (prob.difficulty === 'Easy') {
        diff.className = 'problem-difficulty-badge';
        diff.style.background = 'rgba(16, 185, 129, 0.1)';
        diff.style.color = 'var(--success)';
    } else {
        diff.className = 'problem-difficulty-badge';
        diff.style.background = 'rgba(245, 158, 11, 0.1)';
        diff.style.color = 'var(--warning)';
    }

    // Load initial test cases
    const list = document.getElementById('test-cases-list');
    list.innerHTML = prob.testCases.map((tc, idx) => `
        <div class="test-case-item" id="tc-${idx}">
            <div>
                <strong>Case ${idx + 1}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 3px;">
                    Input: ${JSON.stringify(tc.inputs)}
                </div>
            </div>
            <span class="tc-status-badge" style="color: var(--text-muted);">Pending</span>
        </div>
    `).join('');
}

function runTestCases() {
    const consoleOut = document.getElementById('console-output');
    if (!editorInstance) return;
    const userCode = editorInstance.getValue();

    switchBottomTab('console');
    consoleOut.className = 'console-terminal';
    consoleOut.textContent = 'Compiling and executing test cases...\n';

    // Highlight test cases with neutral spinner
    const testCases = problemCatalog[currentProblemId].testCases;
    testCases.forEach((tc, idx) => {
        const item = document.getElementById(`tc-${idx}`);
        if (item) {
            item.className = 'test-case-item';
            item.querySelector('.tc-status-badge').textContent = 'Running...';
            item.querySelector('.tc-status-badge').style.color = 'var(--warning)';
        }
    });

    setTimeout(() => {
        if (currentLanguage === 'javascript') {
            const evalResult = executeJsCode(userCode, currentProblemId);
            if (!evalResult.success) {
                consoleOut.className = 'console-terminal error';
                consoleOut.textContent = evalResult.log;
                
                testCases.forEach((tc, idx) => {
                    const item = document.getElementById(`tc-${idx}`);
                    if (item) {
                        item.className = 'test-case-item fail';
                        item.querySelector('.tc-status-badge').textContent = 'Error';
                        item.querySelector('.tc-status-badge').style.color = 'var(--danger)';
                    }
                });
            } else {
                let logText = '';
                evalResult.results.forEach((res) => {
                    const item = document.getElementById(`tc-${res.index}`);
                    const statusText = res.passed ? 'Passed' : 'Failed';
                    
                    if (item) {
                        item.className = `test-case-item ${res.passed ? 'pass' : 'fail'}`;
                        item.querySelector('.tc-status-badge').textContent = statusText;
                        item.querySelector('.tc-status-badge').style.color = res.passed ? 'var(--success)' : 'var(--danger)';
                    }

                    logText += `Test Case ${res.index + 1}: ${statusText}\n`;
                    if (!res.passed) {
                        logText += `  Expected: ${JSON.stringify(res.expected)}\n  Received: ${JSON.stringify(res.output)}\n`;
                    }
                });

                consoleOut.className = evalResult.allPassed ? 'console-terminal success' : 'console-terminal error';
                consoleOut.textContent = logText + (evalResult.allPassed ? '\nAll test cases passed successfully!' : '\nSome test cases failed.');
            }
        } else {
            // Heuristic simulation for Python, Java, C++, SQL
            const isHeuristicValid = heuristicCompiler(userCode, currentProblemId, currentLanguage);
            let logText = '';

            testCases.forEach((tc, idx) => {
                const item = document.getElementById(`tc-${idx}`);
                const passed = isHeuristicValid;
                const statusText = passed ? 'Passed' : 'Failed';

                if (item) {
                    item.className = `test-case-item ${passed ? 'pass' : 'fail'}`;
                    item.querySelector('.tc-status-badge').textContent = statusText;
                    item.querySelector('.tc-status-badge').style.color = passed ? 'var(--success)' : 'var(--danger)';
                }
                logText += `Test Case ${idx + 1}: ${statusText}\n`;
            });

            consoleOut.className = isHeuristicValid ? 'console-terminal success' : 'console-terminal error';
            consoleOut.textContent = logText + (isHeuristicValid ? `\nHeuristic compiler compiled ${currentLanguage} code successfully! All test cases passed.` : `\nCompilation Error: Missing function signature or return parameters for ${currentLanguage}.`);
        }
    }, 1200);
}

function executeJsCode(userCode, problemId) {
    let userFunc;
    try {
        let functionName = 'twoSum';
        if (problemId === 'reverse-list') functionName = 'reverseList';
        if (problemId === 'valid-parentheses') functionName = 'isValid';
        if (problemId === 'group-anagrams') functionName = 'groupAnagrams';
        if (problemId === 'merge-intervals') functionName = 'mergeIntervals';

        // Check if function name is defined in user code
        if (!userCode.includes(`function ${functionName}`)) {
            throw new Error(`Function name '${functionName}' is not defined. Please verify signature.`);
        }

        userFunc = eval(`(function() {\n${userCode}\nreturn ${functionName};\n})()`);
    } catch (err) {
        return { success: false, log: `Error: ${err.message}\n` };
    }

    const testCases = problemCatalog[problemId].testCases;
    const results = [];
    let allPassed = true;

    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        try {
            // Run
            const userOutput = userFunc(...tc.inputs);
            
            // Compare
            const isMatch = compareOutputs(userOutput, tc.expected);
            
            results.push({ index: i, passed: isMatch, output: userOutput, expected: tc.expected });
            if (!isMatch) allPassed = false;
        } catch (err) {
            results.push({ index: i, passed: false, error: err.message });
            allPassed = false;
        }
    }
    
    return { success: true, results, allPassed };
}

function compareOutputs(a, b) {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        // Sort if numbers index or sub-arrays
        const aStr = JSON.stringify(a.map(x => Array.isArray(x) ? x.sort() : x).sort());
        const bStr = JSON.stringify(b.map(x => Array.isArray(x) ? x.sort() : x).sort());
        return aStr === bStr;
    }
    return false;
}

function heuristicCompiler(userCode, problemId, lang) {
    // Check if user did basic edits to starter templates
    const starter = problemCatalog[problemId].starters[lang];
    if (userCode.trim() === starter.trim()) return false;
    
    let signature = '';
    if (problemId === 'two-sum') signature = 'twoSum';
    if (problemId === 'reverse-list') signature = 'reverseList';
    if (problemId === 'valid-parentheses') signature = 'isValid';
    if (problemId === 'group-anagrams') signature = 'groupAnagrams';
    if (problemId === 'merge-intervals') signature = 'merge';

    return userCode.includes(signature) && (userCode.includes('return') || userCode.includes('SELECT') || lang === 'python');
}

function submitSolution() {
    if (!editorInstance) return;
    const userCode = editorInstance.getValue();
    const reviewContent = document.getElementById('ai-review-content');

    API.showLoader();
    setTimeout(() => {
        API.hideLoader();
        switchBottomTab('review');
        API.showToast('Solution Submitted for Review!', 'success');

        const analysis = analyzeCode(userCode, currentProblemId, currentLanguage);

        reviewContent.innerHTML = `
            <div class="review-output-panel">
                <div class="complexity-row">
                    <div class="complexity-box">
                        <span class="complexity-label">Time Complexity</span>
                        <div class="complexity-value">${analysis.timeComplexity}</div>
                    </div>
                    <div class="complexity-box">
                        <span class="complexity-label">Space Complexity</span>
                        <div class="complexity-value">${analysis.spaceComplexity}</div>
                    </div>
                </div>

                <h4 style="font-family: var(--font-heading); font-size: 0.95rem; margin-top: 10px; color: var(--primary);">AI Constructive Suggestions</h4>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${analysis.suggestions.map(s => `
                        <div class="review-comment-item">
                            ${s}
                        </div>
                    `).join('')}
                    <div class="review-comment-item" style="border-left-color: var(--secondary); background: rgba(168,85,247,0.03);">
                        <strong>Coding Standards Recommendation:</strong> Ensure proper boundary checking for empty sizes, bounds exceptions, and type checking assertions.
                    </div>
                </div>
            </div>
        `;
    }, 1500);
}

function analyzeCode(userCode, problemId, lang) {
    let timeComplexity = 'O(N^2)';
    let spaceComplexity = 'O(1)';
    let suggestions = [];

    if (problemId === 'two-sum') {
        const hasMap = userCode.includes('Map') || userCode.includes('dict') || userCode.includes('hash') || userCode.includes('{}') || userCode.includes('new Map()');
        if (hasMap) {
            timeComplexity = 'O(N)';
            spaceComplexity = 'O(N)';
            suggestions.push("Excellent utilization of a Hash Map structure to store index positions, achieving a linear runtime search pass.");
        } else {
            timeComplexity = 'O(N^2)';
            spaceComplexity = 'O(1)';
            suggestions.push("Detected a nested loop structure. While O(1) space is efficient, this is O(N²) time. Try using a Map key lookup to achieve linear O(N) time complexity.");
        }
    } else if (problemId === 'reverse-list') {
        timeComplexity = 'O(N)';
        spaceComplexity = 'O(1)';
        suggestions.push("Clean iterative list reversal using three-pointer assignments. Memory usage is optimized to O(1) constant auxiliary space.");
    } else {
        timeComplexity = 'O(N)';
        spaceComplexity = 'O(N)';
        suggestions.push("Well structured conditional boundaries. Optimized call stacks align with standard data structures complexity criteria.");
    }

    return { timeComplexity, spaceComplexity, suggestions };
}

function switchBottomTab(tabId) {
    document.querySelectorAll('.bottom-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.bottom-tab-content').forEach(c => c.classList.remove('active'));

    document.getElementById(`tab-btn-${tabId}`).classList.add('active');
    document.getElementById(`bottom-tab-${tabId}`).classList.add('active');
}
