// Security: Prevent Right Click
document.addEventListener('contextmenu', event => event.preventDefault());

// Security: Prevent highlighting/selection
document.addEventListener('selectstart', event => event.preventDefault());

// Security: Prevent DevTools shortcuts
document.addEventListener('keydown', function (event) {
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
    if (fromNode) {
        fromNode.classList.remove('phase-active');
        fromNode.classList.add('hidden');
    }
    if (toNode) {
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

// AES Encrypted Payload of the target HTML
const ENCRYPTED_PAYLOAD = "U2FsdGVkX1/xE3slp2YvCBviicTMpN0H8Zk5HMFd2BKwn0IPZoCclPAtYmCoOPDK1cMt3dffUfVZJ8Y1UTMmkJpraU5brA8mYNKwc09i79pXklSy0a1BVN8xanAjl3bwEkIJQUjtt7iFK1ncntCYcPESyRFOp8N9P8neqELp4dX6gj7/s0/c2qm+1CVhCgrjEjeqtWsyzmjco5B5+TpbXdQFjIFavdgDGLFSYQe/ds4aQ1w53aeERKCpuwfFneMp8FLo986Sc34Eg4fOszvxnGjHjYz1maTWFcKh8/qZWIcxQlSZzMcZFyIz3SBbyyFHKXrSXrz6EopGYJ4/38ZVLfADLy/FIP289lbIiDBcG5mZZSuI4WyUXtMcU3O2JWr6UEK/mhezcQjX657ljaCnyVmeM7nPEUbxD65pqOgOz6OoDZo3CoMbAj3XhIRvsuhkMSAKK+4tGUC+jvkNuIHzS1HsXUgvtGeKYSr4YzGlDVcfG1zPPpvNbENRG6UCgKZSbJbqPY4HKh9fhMERc0I2xg==";

passwordInput?.addEventListener('input', (e) => {
    const val = e.target.value;
    if (val.length === 4) {
        passwordInput.blur(); // Hide mobile keyboard

        try {
            // Attempt decryption using the user input as the key
            const bytes = CryptoJS.AES.decrypt(ENCRYPTED_PAYLOAD, val);
            const decryptedHTML = bytes.toString(CryptoJS.enc.Utf8);

            if (decryptedHTML) {
                // Decryption successful!
                errorMsg.classList.add('hidden');

                // Inject the decrypted content
                const unlockContent = document.getElementById('unlock-content');
                if (unlockContent) {
                    unlockContent.innerHTML = decryptedHTML;
                }

                // Remove footers for immersion on unlock page
                document.querySelector('footer').style.display = 'none';
                switchPhase(phases.error, phases.unlock);
                startCountdown();
            } else {
                // Wrong password (empty string returned)
                throw new Error("Invalid password");
            }
        } catch (error) {
            // Decryption failed (wrong password)
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
            const rewardLink = document.getElementById('reward-link');
            if (rewardLink && rewardLink.classList.contains('hidden')) {
                rewardLink.classList.remove('hidden');
            }
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
