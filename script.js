// Security: Prevent Right Click
document.addEventListener('contextmenu', event => event.preventDefault());

// Security: Prevent highlighting/selection
document.addEventListener('selectstart', event => event.preventDefault());

// Security: Prevent DevTools shortcuts
document.addEventListener('keydown', function(event) {
    // Prevent F12
    if (event.key === 'F12') {
        event.preventDefault();
    }
    // Prevent Ctrl+Shift+I / Cmd+Option+I
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === 'I' || event.key === 'i')) {
        event.preventDefault();
    }
    // Prevent Ctrl+Shift+J / Cmd+Option+J
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === 'J' || event.key === 'j')) {
        event.preventDefault();
    }
    // Prevent Ctrl+U / Cmd+U
    if ((event.ctrlKey || event.metaKey) && (event.key === 'u' || event.key === 'U')) {
        event.preventDefault();
    }
});

// DOM Elements
const phases = {
    intro: document.getElementById('phase1-intro'),
    main: document.getElementById('phase2-main'),
    error: document.getElementById('phase3-error'),
    unlock: document.getElementById('phase4-unlock')
};

// Phase Utils
function switchPhase(fromNode, toNode) {
    if(fromNode) {
        fromNode.classList.remove('phase-active');
        fromNode.classList.add('hidden');
    }
    if(toNode) {
        toNode.classList.remove('hidden');
        toNode.classList.add('phase-active');
    }
}

// Typing Flow Logic (Phase 1)
const texts = [
    document.getElementById('typing-text-1'),
    document.getElementById('typing-text-2'),
    document.getElementById('typing-text-3')
];
const stampContainer = document.getElementById('stamp-container');
const gloryText = document.getElementById('glory-text');

async function runIntroFlow() {
    for (let i = 0; i < texts.length; i++) {
        await typeText(texts[i], texts[i].innerText);
        await sleep(600);
    }
    await sleep(400);
    stampContainer.classList.remove('hidden');
    await sleep(1000);
    gloryText.classList.remove('hidden');
    
    // Transition to Phase 2 after holding glory text
    await sleep(2000);
    // Flash transition effect
    document.body.style.backgroundColor = 'white';
    switchPhase(phases.intro, phases.main);
    setTimeout(() => {
        document.body.style.backgroundColor = ''; // Revert to class style
    }, 100);
}

function typeText(element, text) {
    return new Promise(resolve => {
        element.innerText = '';
        element.classList.remove('hidden');
        let i = 0;
        const interval = setInterval(() => {
            element.innerText += text[i];
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                resolve();
            }
        }, 50); // Typing speed
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

window.onload = () => {
    runIntroFlow();
};

// Phase 2 Logic
document.getElementById('trigger-banner')?.addEventListener('click', () => {
    // Red flash glitch effect for transition
    document.body.style.backgroundColor = 'red';
    setTimeout(() => {
        document.body.style.backgroundColor = '';
        switchPhase(phases.main, phases.error);
        
        // Focus password input for convenience
        setTimeout(() => document.getElementById('password-input')?.focus(), 100);
    }, 150);
});

// Phase 3 & 4 Logic
const passwordInput = document.getElementById('password-input');
const errorMsg = document.getElementById('error-msg');
// Obfuscated representation of "0409"
const TARGET_HASH = btoa('0409');

passwordInput?.addEventListener('input', (e) => {
    const val = e.target.value;
    if (val.length === 4) {
        if (btoa(val) === TARGET_HASH) {
            errorMsg.classList.add('hidden');
            // Remove footers for immersion on unlock page
            document.querySelector('footer').style.display = 'none';
            switchPhase(phases.error, phases.unlock);
            startCountdown();
        } else {
            errorMsg.classList.remove('hidden');
            passwordInput.value = '';
        }
    } else {
        errorMsg.classList.add('hidden');
    }
});

function startCountdown() {
    const timerEl = document.getElementById('timer');
    // Using simple offset so it doesn't break depending on local system zone too much, but D-Day is April 9th 2026.
    const targetDate = new Date('2026-04-09T00:00:00+09:00').getTime();

    function update() {
        const now = new Date().getTime();
        const diff = targetDate - now;

        if (diff <= 0) {
            timerEl.innerText = "00:00:00:00";
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        timerEl.innerText = `${pad(d)}:${pad(h)}:${pad(m)}:${pad(s)}`;
    }

    function pad(n) { return n < 10 ? '0' + n : n; }
    
    update();
    setInterval(update, 1000);
}
