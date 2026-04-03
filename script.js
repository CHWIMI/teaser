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

// 앱 초기화 (DOMContentLoaded 사용으로 변경 - 다중 등록 가능)
window.addEventListener('DOMContentLoaded', () => {
    runIntroFlow();  // Phase 1 인트로 시작
    initBoard();     // 게시판 렌더링
    initSliders();   // 슬라이더 초기화
    initNavAlerts(); // 네비게이션 알림 초기화
});

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
const ENCRYPTED_PAYLOAD = "U2FsdGVkX19rBMNT09adwslOWtw47staZZEbZcTq+cKAZT/8MJxbFTj1j74UiEW40n/oC+uKpHc7sPbbj5y2r5oNZPJl73z5Wjy5cT/8VVOVoWMb1gwZuYE7Jg10qgAQmtrmjaWq1UxGIxwrm5eCPBSLhgfM8p+Yv4S2Ykxuc1Ptx/mYZzwr53b0IRByKVbiDmRl1K4mPQJTNsoBsVFjlVzmadC8itGVzgSVvscXbaMQD3d/TPf2h56cI16fBG1tdSnXK6VuL9tgbqUSi0S6n7jhaatk340T7Xmo+M0LrLVNSqQKW2nbArlGkQU3WuSxfWTAvOuycPQZYCCcoMGaOXdZoB9tnXpQI9FHXVc13lkYdG99wmhbe6OLfVk2iswdzNr8XkmjwPnWfIMTT2Dw1D2pOr3SYFZWhRoBYlgOa94JtWn873VeD6N/vHc+6tsNbtNoOm9Uw2V8xFg8iw0Jq2PuE7ApXjCVQqqAgDF0bAXAhc+wShr5Par1Bx2Pio1kbFT9n7YQIQnNEv49YP32g8j3w+iYNh8N+K+MG/m99fZ9mb6BSiDTWn8odsVFkRV0GijJ/zrX+Qr1342Z+wY1LjvsECuCpqBxAM+3mHbbkRMRn8yiY+le5hhBRllJ8u0j";

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

                // Footer is inside phase2-main, auto-hidden on phase switch
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
    // Using simple offset so it doesn't break depending on local system zone too much, but D-Day is April 8th 2026.
    const targetDate = new Date('2026-04-08T00:00:00+09:00').getTime();

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


/* =========================================
 * 게시글 데이터 로직 (POSTS)
 *
 * 각 게시글 객체 구조:
 * {
 *   id: (number)      - 고유 번호 (중복 불가)
 *   title: (string)   - 게시글 제목
 *   author: (string)  - 작성자/작성부서
 *   date: (string)    - 작성일 (YYYY-MM-DD 형식)
 *   status: (string)  - 진행상태 ('진행중', '완료', '예정' 등)
 *   content: (string) - 본문 내용 (HTML 태그 사용 가능)
 * }
 *
 * 예시: 새 게시글 추가 시 배열 맨 앞에 추가하면 최상단 표시됨
 *
 * 이미지 삽입 로직 (content 필드 내부)
 *
 * ① 같은 폴더에 이미지 파일이 있는 경우:
 *   <img src="파일명.jpg" alt="설명" style="max-width:100%; margin:15px 0;">
 *
 * ② 외부 URL 사용 시:
 *   <img src="https://example.com/image.png" alt="설명" style="max-width:100%; margin:15px 0;">
 *   오류 시 index.html의 CSP img-src에 해당 도메인 확인 필수!
 *   예: img-src 'self' data: https://chwimi.github.io https://example.com;
 *
 * ③ 이미지 + 측션(설명문) 조합:
 *   <figure style="text-align:center; margin:20px 0;">
 *     <img src="photo.jpg" alt="사진 설명" style="max-width:100%;">
 *     <figcaption style="color:#888; font-size:0.85rem; margin-top:8px;">
 *       사진 설명 텍스트
 *     </figcaption>
 *   </figure>
 * id 1에 예시 넣어뒀으니까 참고해서 작성
 */
const POSTS = [
    {
        id: 1,
        title: '용의 협곡 통행 제한 및 우회도로 안내',
        author: '도로교통과',
        date: '2026-04-01',
        status: '진행중',
        content: `
            <h3>용의 협곡 통행 제한 안내</h3>
            <img src="og_image.png" alt="용의 협곡 현황" style="max-width:100%; border-radius:8px; margin-bottom:20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <p>현재 핑크 킹짱룡의 난동으로 인한 용의 협곡 일대 낙석 위험 및 마법 에너지 불안정 현상이 보고되어 다음과 같이 통행을 제한합니다.</p>
            <br>
            <p><strong>1. 제한 구간:</strong> 용의 협곡 3번 국도 ~ 7번 국도 (약 12km 구간)</p>
            <p><strong>2. 제한 기간:</strong> 2026.04.01(화) ~ 복구 완료 시까지</p>
            <p><strong>3. 우회도로:</strong> 은빛 숲 순환도로 → 달빛 교차로 → 왕성 방면</p>
            <p><strong>4. 비상 연락처:</strong> 세레니티 도로관리공단 ☎ 1588-몰랑몰랑</p>
            <br>
            <p>주민 여러분의 안전을 위해 협조 부탁드립니다. 복구 일정은 추후 별도 공지 예정입니다.</p>
        `
    },
    {
        id: 2,
        title: '(자칭) 세레니티 기획부 청년자문단 최종합격자 공고',
        author: '인사교육과',
        date: '2026-03-31',
        status: '완료',
        content: `
            <h3>청년자문단 최종합격자 공고</h3>
            <p>(자칭) 세레니티 기획부 제3기 청년자문단 최종합격자를 다음과 같이 공고합니다.</p>
            <br>
            <p><strong>1. 합격자 수:</strong> 총 12명</p>
            <p><strong>2. 임기:</strong> 2026.04.15 ~ 2027.04.14 (1년간)</p>
            <p><strong>3. 오리엔테이션:</strong> 2026.04.10(목) 10:00, 왕성 대회의실</p>
            <br>
            <p>합격을 축하드리며, 상세 사항은 개별 안내 예정입니다.</p>
        `
    },
    {
        id: 3,
        title: '마법 도구 사용 가이드라인 개정안 행정예고',
        author: '마법안전과',
        date: '2026-03-31',
        status: '예고',
        content: `
            <h3>마법 도구 사용 가이드라인 개정안</h3>
            <p>마법 도구 사용에 관한 안전 가이드라인을 다음과 같이 개정 예고합니다.</p>
            <br>
            <p><strong>1. 주요 개정 내용:</strong></p>
            <p>- 3등급 이상 마법 도구 사용 시 안전 교육 의무화</p>
            <p>- 마법 도구 등록제 도입 (신규 구입 시 왕실 등록 필수)</p>
            <p>- 미성년자 마법 도구 사용 연령 상향</p>
            <p>- 마법소녀 전용 도구 신청 규정 개정</p>
            <br>
            <p><strong>2. 의견 제출 기간:</strong> 2026.03.31 ~ 2026.04.30</p>
            <p>주민 여러분의 적극적인 의견 제출을 부탁드립니다.</p>
        `
    },
    {
        id: 4,
        title: '제12차 성벽 보수 공사 입찰 공고',
        author: '시설관리과',
        date: '2026-03-30',
        status: '진행중',
        content: `
            <h3>제12차 성벽 보수 공사 입찰 공고</h3>
            <p>세레니티 왕국 남쪽 성벽 보수 공사 입찰을 다음과 같이 공고합니다.</p>
            <br>
            <p><strong>1. 공사명:</strong> 남쪽 성벽 3구역 보강 및 방어마법진 갱신</p>
            <p><strong>2. 공사 기간:</strong> 2026.05.01 ~ 2026.09.30 (약 5개월)</p>
            <p><strong>3. 예산:</strong> 150,000 골드</p>
            <p><strong>4. 입찰 마감:</strong> 2026.04.15 17:00</p>
            <br>
            <p>참가 자격: 세레니티 왕국 등록 건설업체 (마법공학 분야 전문 허가 필수)</p>
        `
    },
    {
        id: 5,
        title: '지하실 및 주말농장 현황 안내',
        author: '■■■■■■■■■■■■',
        date: '????-??-??',
        status: '진행중',
        content: `
            <h3>지하실 및 주말농장 현황 안내</h3>
            <p>세레니티 왕국 지하실 및 주말농장 운영 현황을 안내드립니다.</p>
            <br>
            <p><strong>1. 지하실:</strong></p>
            <p>- 위치: ■■■■■■■■■■■</p>
            <p>- 현황: ■■■■■■■■■■■■</p>
            <br>
            <p><strong>2. 주말농장:</strong></p>
            <p>- 위치: ■■■■■■■■■■■■</p>
            <p>- 운영시간: ■■■■■■■■■■■■</p>
            <p>- 현황: ■■■■■■■■■■■■</p>
            <br>
            <p>참여를 원하시는 분은 ■■■■■■■■■■■■로 문의 바랍니다.</p>
        `
    }
];


/* =========================================
 * 📝 게시판 렌더링 및 상세 보기
 * ========================================= */

/**
 * 게시판 목록을 POSTS 배열 기반으로 렌더링합니다.
 * initBoard()에서 호출됩니다.
 */
function renderBoardList() {
    const ul = document.getElementById('board-list-ul');
    if (!ul) return;
    ul.innerHTML = '';

    POSTS.forEach(post => {
        const li = document.createElement('li');
        // 제목 영역
        const titleSpan = document.createElement('span');
        titleSpan.textContent = post.title;
        // 날짜 영역
        const dateSpan = document.createElement('span');
        dateSpan.className = 'date';
        dateSpan.textContent = post.date;

        li.appendChild(titleSpan);
        li.appendChild(dateSpan);

        // 클릭 시 상세 보기
        li.addEventListener('click', () => showPostDetail(post.id));
        ul.appendChild(li);
    });
}

/**
 * 게시글 상세 페이지를 표시합니다.
 * @param {number} postId - 표시할 게시글 ID
 */
function showPostDetail(postId) {
    const post = POSTS.find(p => p.id === postId);
    if (!post) return;

    const detailView = document.getElementById('post-detail-view');
    const topSection = document.querySelector('.top-section');
    const bottomSection = document.querySelector('.bottom-section');

    // 메인 섹션 숨기기
    topSection.classList.add('hidden');
    bottomSection.classList.add('hidden');

    // 이전/다음 게시글 찾기
    const postIndex = POSTS.findIndex(p => p.id === postId);
    const prevPost = POSTS[postIndex + 1] || null; // 이전글 (더 오래된 글)
    const nextPost = POSTS[postIndex - 1] || null; // 다음글 (더 최신 글)

    // 상세 페이지 HTML 생성
    detailView.innerHTML = `
        <div class="post-detail-header">
            <h2>${post.title}</h2>
        </div>
        <div class="post-detail-meta">
            <span>작성자 <strong>${post.author}</strong></span>
            <span>등록일 <strong>${post.date}</strong></span>
            <span>진행상태 <strong>${post.status}</strong></span>
        </div>
        <div class="post-detail-content">
            ${post.content}
        </div>
        <div class="post-detail-footer">
            <button class="post-list-btn" id="btn-back-to-list">목록</button>
        </div>
        <div class="post-nav">
            ${nextPost ? `<div class="post-nav-item" data-post-id="${nextPost.id}"><span class="nav-label">∧ 다음글</span><span class="nav-title">${nextPost.title}</span></div>` : ''}
            ${prevPost ? `<div class="post-nav-item" data-post-id="${prevPost.id}"><span class="nav-label">∨ 이전글</span><span class="nav-title">${prevPost.title}</span></div>` : ''}
        </div>
    `;

    // 이벤트 바인딩 (목록 버튼)
    document.getElementById('btn-back-to-list')?.addEventListener('click', hidePostDetail);

    // 이벤트 바인딩 (이전/다음 게시글)
    detailView.querySelectorAll('.post-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            showPostDetail(Number(item.dataset.postId));
        });
    });

    detailView.classList.remove('hidden');

    // 상단으로 스크롤 (브라우저 렌더링 후 적용되도록 setTimeout 사용)
    setTimeout(() => {
        const container = document.getElementById('phase2-main');
        if (container) container.scrollTop = 0;
        window.scrollTo(0, 0);
    }, 10);
}

/**
 * 게시글 상세를 닫고 목록으로 돌아갑니다.
 */
function hidePostDetail() {
    const detailView = document.getElementById('post-detail-view');
    const topSection = document.querySelector('.top-section');
    const bottomSection = document.querySelector('.bottom-section');

    detailView.classList.add('hidden');
    topSection.classList.remove('hidden');
    bottomSection.classList.remove('hidden');
}

/** 게시판 초기화 */
function initBoard() {
    renderBoardList();
}


/* =========================================
 * 🎬 슬라이더 시스템
 * =========================================
 * initSlider(config) 함수로 Hero, 사진뉴스, 동영상뉴스
 * 세 영역의 슬라이더를 각각 초기화합니다.
 */

/**
 * 슬라이더를 초기화합니다.
 * @param {Object} config - 슬라이더 설정
 * @param {string} config.trackId      - 슬라이더 트랙 요소 ID
 * @param {string} config.indicatorId  - 페이지 표시 요소 ID
 * @param {string} config.prevId       - 이전 버튼 ID
 * @param {string} config.nextId       - 다음 버튼 ID
 * @param {string} [config.pauseId]    - 일시정지 버튼 ID (선택)
 * @param {number} [config.total=3]    - 총 슬라이드 수
 * @param {number} [config.interval=4000] - 자동재생 간격(ms)
 */
function initSlider(config) {
    const track = document.getElementById(config.trackId);
    const indicator = document.getElementById(config.indicatorId);
    const prevBtn = document.getElementById(config.prevId);
    const nextBtn = document.getElementById(config.nextId);

    if (!track || !indicator) return;

    let current = 0;
    const total = config.total || 3;
    let autoPlayInterval = null;
    let playing = false;

    /** 지정한 인덱스로 이동 */
    function goTo(index) {
        current = index;
        if (current < 0) current = total - 1;
        if (current >= total) current = 0;
        track.style.transform = `translateX(-${current * 100}%)`;
        indicator.textContent = `${current + 1}/${total}`;
    }

    // 이전/다음 버튼
    prevBtn?.addEventListener('click', () => goTo(current - 1));
    nextBtn?.addEventListener('click', () => goTo(current + 1));

    // 자동재생 (페이즈 버튼이 있는 경우 - Hero 슬라이더)
    if (config.pauseId) {
        const pauseBtn = document.getElementById(config.pauseId);
        const autoInterval = config.interval || 4000;

        // 자동재생 시작
        autoPlayInterval = setInterval(() => goTo(current + 1), autoInterval);
        playing = true;

        pauseBtn?.addEventListener('click', () => {
            if (playing) {
                clearInterval(autoPlayInterval);
                pauseBtn.textContent = '▶';
            } else {
                autoPlayInterval = setInterval(() => goTo(current + 1), autoInterval);
                pauseBtn.textContent = '||';
            }
            playing = !playing;
        });
    }
}

/** 모든 슬라이더 초기화 */
function initSliders() {
    // Hero 배너 슬라이더 (자동재생 O)
    initSlider({
        trackId: 'hero-slider-track',
        indicatorId: 'hero-indicator',
        prevId: 'hero-prev',
        nextId: 'hero-next',
        pauseId: 'hero-pause',
        total: 3,
        interval: 4000
    });

    // 사진뉴스 슬라이더
    initSlider({
        trackId: 'photo-slider-track',
        indicatorId: 'photo-indicator',
        prevId: 'photo-prev',
        nextId: 'photo-next',
        total: 3
    });

    // 동영상뉴스 슬라이더
    initSlider({
        trackId: 'video-slider-track',
        indicatorId: 'video-indicator',
        prevId: 'video-prev',
        nextId: 'video-next',
        total: 3
    });
}


/* =========================================
 * 🏛️ 커스텀 모달 ("~주농에 갔어요" 알림)
 * ========================================= */

/** 모달을 엽니다. */
function showModal(message) {
    const modal = document.getElementById('custom-modal');
    const msgEl = modal?.querySelector('.modal-message');
    if (msgEl) msgEl.textContent = message;
    modal?.classList.remove('hidden');
}

/** 모달을 닫습니다. */
function hideModal() {
    document.getElementById('custom-modal')?.classList.add('hidden');
}


/* =========================================
 * 🚨 네비게이션 알림 초기화
 * ========================================= */

/** 상단 네비게이션 클릭 시 커스텀 모달을 표시합니다. */
function initNavAlerts() {
    const MSG = '해당 기능은 주농에 갔어요';

    // 로고 클릭 시 메인 페이지(목록)로 복귀
    document.querySelector('.header-top .logo')?.addEventListener('click', () => {
        hidePostDetail();
        document.getElementById('phase2-main').scrollTop = 0;
    });

    // Hero 배너 클릭 시 알림 (컨트롤 영역 제외)
    document.querySelector('.hero-banner')?.addEventListener('click', (e) => {
        if (e.target.closest('.hero-controls')) return;
        showModal(MSG);
    });

    // GNB 네비게이션 메뉴
    document.querySelectorAll('.gnb-nav ul li').forEach(item => {
        item.addEventListener('click', () => showModal(MSG));
    });

    // 검색, 자주찾는정보, 햄버거 버튼
    document.querySelector('.search-btn')?.addEventListener('click', () => showModal(MSG));
    document.querySelector('.star-btn')?.addEventListener('click', () => showModal(MSG));
    document.querySelector('.hamburger')?.addEventListener('click', () => showModal(MSG));

    // 모달 닫기 이벤트
    document.getElementById('modal-close-btn')?.addEventListener('click', hideModal);
    document.getElementById('modal-overlay')?.addEventListener('click', hideModal);
}
