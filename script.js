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

// History State Management
window.addEventListener('popstate', (e) => {
    const state = e.state;
    if (!state) return;

    if (state.phase === 3) {
        switchPhase(document.querySelector('.phase-active'), phases.error);
    } else if (state.phase === 4) {
        switchPhase(document.querySelector('.phase-active'), phases.unlock);
    } else if (state.phase === 2) {
        switchPhase(document.querySelector('.phase-active'), phases.main);
        if (state.view === 'post') {
            showPostDetail(state.postId, false);
        } else {
            hidePostDetail(false);
        }
    }
});

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
    // Phase 1은 진입 시 바로 표시되도록 하되, 뒤로가기로 돌아갈 수 없게 히스토리 상으로는 Phase 2를 기본으로 깔아둠
    history.replaceState({ phase: 2, view: 'main' }, '');

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
        history.pushState({ phase: 3 }, '');
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
                history.pushState({ phase: 4 }, '');
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
        title: '동쪽 숲 통행 제한 및 우회도로 안내',
        author: '도로교통과',
        date: '2026-04-01',
        status: '진행중',
        content: `
            <h3>용의 협곡 통행 제한 안내</h3>
            <img src="warning.png" alt="경고문" style="max-width:100%; border-radius:8px; margin-bottom:20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <p>현재 세레니티 동쪽숲에서 몰랑쿤의 10배나 차이나는 크기의 그림자가 목격돼 출입을 제한합니다.</p>
            <br>
            <p><strong>1. 제한 구간:</strong> 세레니티 동쪽 숲 ~ 북동쪽 용의 협곡역 (약 12km)</p>
            <p><strong>2. 제한 기간:</strong> 2026.04.01(화) ~ 복구 완료 시까지</p>
            <p><strong>3. 우회도로:</strong> 은빛 숲 순환도로 → 달빛 지하 교차로 → 왕성 방면</p>
            <p><strong>4. 비상 연락처:</strong> 세레니티 도로관리공단 ☎ 1588-몰랑몰랑 ~ 몰루몰루</p>
            <p><strong>5. 담당자:</strong> 화굥, 원더</p>
            <br>
            <p>국민 여러분의 안전을 위해 협조 부탁드립니다. 복구 일정은 추후 별도 공지 예정입니다.</p>
        `
    },
    {
        id: 2,
        title: '(자칭) 세레니티 기획부 청년자문단 최종합격자 공고',
        author: '인재경영과 화굥',
        date: '2026-03-31',
        status: '완료',
        content: `
            <h3>청년자문단 최종합격자 공고</h3>
            <img src="notice.jpg" alt="공고문" style="max-width:100%; border-radius:8px; margin-bottom:20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <p>(자칭) 세레니티 기획부 제3기 청년자문단 최종합격자를 다음과 같이 공고합니다.</p>
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
            <p>국민 여러분의 적극적인 의견 제출을 부탁드립니다.</p>
        `
    },
    {
        id: 4,
        title: '세레니티 건국 기념 빛과 소리의 연회 안내',
        author: '문화예술과 빈우주',
        date: '2026-04-03',
        status: '진행중',
        content: `
            <h3>세레니티 건국 기념 빛과 소리의 연회 안내</h3>
            <p>세레니티 건국 기념일을 맞이하여, 왕국의 밤을 수놓을 신비로운 연회에 국민 여러분을 초대합니다.</p>
            <br>
            <p><strong>1. 일시 및 장소:</strong> 2026.04.09(목) 19:00 / 세레니티 대극장</p>
            <p><strong>2. 주요 행사:</strong></p>
            <p>- 왕궁 무도회</p>
            <p>- W국의 성녀가 보내온 신비로운 축복의 전언</p>
            <p><strong>3. 입장권 배부:</strong> 각 구역 행정복지센터에서 선착순 배부 중</p>
            <br>
            <p>국민 여러분의 많은 관심과 참여를 부탁드립니다.</p>
        `
    },
    {
        id: 5,
        title: '제1치즈 농장 배양법 교육 및 풍요의 결실 기념식',
        author: '농림축산과 총아리',
        date: '2026-04-09',
        status: '진행중',
        content: `
            <h3>제1치즈 농장 배양법 교육 및 풍요의 결실 기념식</h3>
            <p>세레니티 제1치즈 농장에서 대지의 마력을 빌려 황금빛 유가공 결정체를 밭에서 직접 피워내는 특별한 비전 교육을 실시합니다.</p>
            <br>
            <p><strong>1. 교육 내용:</strong> 고다 치즈 씨앗 파종법 및 모짜렐라 줄기 유인망 설치 규격 안내</p>
            <p><strong>2. 특별 행사:</strong> 익명의 대마법사님께서 치즈 농장 발전을 위해 <b>거액의 후원금</b>을 쾌척하시어, 교육 전 간단한 전달식이 있을 예정입니다.</p>
            <p><strong>3. 신청 대상:</strong> 세레니티 농업 종사자 및 치즈를 사랑하는 주민 누구나</p>
            <p><strong>4. 준비물:</strong> 튼튼한 모종삽과 치즈를 향한 열정</p>
            <br>
            <p>참여를 희망하시는 분들은 농림축산과(☎ 1588-치즈치즈)로 사전 등록해 주시기 바랍니다.</p>
        `
    },
    {
        id: 6,
        title: '[긴급] 공주님 특별 단독 생방송 편성 안내',
        author: '왕실홍보실',
        date: '2026-04-18',
        status: '진행중',
        content: `
            <h3>공주님 특별 단독 생방송 안내</h3>
            <p>왕립 마법공학연구소의 최신 모션 캡처 기술 시연을 위해, 세레니티 공주님의 특별 단독 생방송이 긴급 편성되었습니다.</p>
            <br>
            <p><strong>1. 방송 일시:</strong> 2026.04.18(토) (마법 송출망 1번 채널)</p>
            <p><strong>2. 주의 사항:</strong></p>
            <p>- 이번 방송에서 공주님은 모션 캡처 아바타와의 완벽한 동기화를 위해 부득이하게 방송 내내 <b>'냥체'</b>를 사용하실 예정입니다.</p>
            <br>
            <p>백성 여러분의 많은 시청 바란다냥! <s>(살려주세요)</s></p>
        `
    },
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
 * @param {boolean} pushHistory - 히스토리 추가 여부
 */
function showPostDetail(postId, pushHistory = true) {
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
    document.getElementById('btn-back-to-list')?.addEventListener('click', () => hidePostDetail(true));

    // 이벤트 바인딩 (이전/다음 게시글)
    detailView.querySelectorAll('.post-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            showPostDetail(Number(item.dataset.postId), true);
        });
    });

    detailView.classList.remove('hidden');

    // 히스토리 추가
    if (pushHistory) {
        history.pushState({ phase: 2, view: 'post', postId: postId }, '');
    }

    // 상단으로 스크롤 (브라우저 렌더링 후 적용되도록 setTimeout 사용)
    setTimeout(() => {
        const container = document.getElementById('phase2-main');
        if (container) container.scrollTop = 0;
        window.scrollTo(0, 0);
    }, 10);
}

/**
 * 게시글 상세를 닫고 목록으로 돌아갑니다.
 * @param {boolean} pushHistory - 히스토리 추가 여부
 */
function hidePostDetail(pushHistory = true) {
    const detailView = document.getElementById('post-detail-view');
    const topSection = document.querySelector('.top-section');
    const bottomSection = document.querySelector('.bottom-section');

    detailView.classList.add('hidden');
    topSection.classList.remove('hidden');
    bottomSection.classList.remove('hidden');

    if (pushHistory) {
        history.pushState({ phase: 2, view: 'main' }, '');
    }
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
                if (autoPlayInterval) clearInterval(autoPlayInterval);
                autoPlayInterval = null;
                pauseBtn.textContent = '▶';
            } else {
                if (!autoPlayInterval) autoPlayInterval = setInterval(() => goTo(current + 1), autoInterval);
                pauseBtn.textContent = '||';
            }
            playing = !playing;
        });

        // 이슈 1번 해결(성능 개선): 화면에서 슬라이더가 보이지 않는 Phase 상태일 때 백그라운드 재생 일시정지
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (playing && !autoPlayInterval) {
                        autoPlayInterval = setInterval(() => goTo(current + 1), autoInterval);
                    }
                } else {
                    if (autoPlayInterval) {
                        clearInterval(autoPlayInterval);
                        autoPlayInterval = null;
                    }
                }
            });
        });
        observer.observe(track);
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
        if (!document.getElementById('post-detail-view').classList.contains('hidden')) {
            hidePostDetail(true);
        }
        document.getElementById('phase2-main').scrollTop = 0;
    });

    // Hero 배너 클릭 시 알림 (컨트롤 영역 제외)
    document.querySelector('.hero-banner')?.addEventListener('click', (e) => {
        if (e.target.closest('.hero-controls')) return;
        showModal(MSG);
    });

    // GNB 네비게이션 메뉴 (이벤트 위임 - 이슈 2 성능 개선)
    document.querySelector('.gnb-nav ul')?.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            showModal(MSG);
        }
    });

    // 검색, 자주찾는정보, 햄버거 버튼
    document.querySelector('.search-btn')?.addEventListener('click', () => showModal(MSG));
    document.querySelector('.star-btn')?.addEventListener('click', () => showModal(MSG));
    document.querySelector('.hamburger')?.addEventListener('click', () => showModal(MSG));

    // 모달 닫기 이벤트
    document.getElementById('modal-close-btn')?.addEventListener('click', hideModal);
    document.getElementById('modal-overlay')?.addEventListener('click', hideModal);
}
