# 만우절 페이지 AES 클라이언트 암호화 로직 가이드
본 문서는 백엔드(서버)가 없는 정적 웹페이지 환경에서, 주요 콘텐츠 스포일러 방지 및 비밀 링크 보호를 위해 구축된 **"클라이언트 단독(Client-side) AES 암호화 로직"**의 구조와 작동 원리를 설명합니다.  
추후 페이지 해금 로직이나 버튼 내용을 수정하고 싶으실 때, **AI에게 이 문서를 프롬프트로 제공하여 수정 요구사항을 구체적으로 지시**할 수 있습니다.

---

## 🔒 1. 로직의 핵심 설계 사상
- **정답 자체를 코딩하지 않음:** 자바스크립트에 본래 정답인 `0409`를 해싱(Hashing)하거나 인코딩(Base64)해서 남겨두지 않습니다.
- **최종 보상 코드를 숨김:** `index.html` 소스코드상에 `개발자 도구(F12)`를 열면 보이는 `<section id="phase4-unlock">` 에는 타이머나 숨겨진 링크(`href`)가 명시되어 있지 않은 빈 껍데기 상자(`div#unlock-content`)만 존재합니다.
- **패스워드 = 암호 해독 열쇠(Key):** 사용자가 직접 입력한 4자리 숫자(PIN 번호)를 열쇠(Key)로 취급해 거대한 암호문 덩어리(`ENCRYPTED_PAYLOAD`)를 **실시간으로 복호화(Decrypt)**하여 빈 껍데기 상자에 주입(`innerHTML`)합니다.

---

## 🛠️ 2. 구조 및 컴포넌트

### 파일 1: `index.html`
- `<head>` 위치에 복호화를 수행할 `crypto-js.min.js` 라이브러리를 CDN(SRI 속성 적용 허용)으로 불러오고 있습니다.
- 보안을 위한 **CSP(Content-Security Policy) 메타 태그**가 적용되어 있어, 코드에 악성 스크립트를 밀어넣는 DOM XSS 공격이 불가능합니다.

### 파일 2: `script.js` (실행 로직)
유저의 입력 이벤트를 감지하여 비밀 공간 전개를 시도합니다. 주요 흐름은 아래와 같습니다:
```javascript
// 1. 미리 만들어둔 엄청나게 긴 암호문. HTML 태그 묶음을 AES 방식(키: '0409')으로 꽉 압축&난독화 해둔 상태입니다.
const ENCRYPTED_PAYLOAD = "U2FsdGVkX1925bqJVuHT...";

passwordInput?.addEventListener('input', (e) => {
    // 2. 사용자가 4글자(예: '0409')를 입력하면 
    const val = e.target.value;
    
    // 3. 사용자의 화면 입력값(val)을 곧바로 비밀번호 KEY로 사용해 강제 압축 해제(decrypt) 시도!
    if (val.length === 4) {
        try {
            const bytes = CryptoJS.AES.decrypt(ENCRYPTED_PAYLOAD, val);
            const decryptedHTML = bytes.toString(CryptoJS.enc.Utf8);
            
            if (decryptedHTML) {
                // 4. (암호 해독 성공!) 해독된 HTML 묶음을 빈 상자 #unlock-content 에 주입합니다.
                const unlockContent = document.getElementById('unlock-content');
                unlockContent.innerHTML = decryptedHTML;
                
                // 이후 카운트다운(startCountdown) 함수 트리거 진행
            } else { throw new Error("Invalid password"); }
        } catch { /* 실패 (오답 메시지 표출) */ }
    }
});
```

### 파일 3: (내부에서 동작하는) `startCountdown()`
해독된 HTML 묶음 속에는 **"숨김 처리된(`class="hidden"`)"** 링크나 버튼이 들어있습니다. 
타이머 로직이 째깍거리면서 목표 시간(D-DAY)에 도달(`diff <= 0`)하는 순간, 스크립트가 해당 버튼의 `hidden` 속성을 제거하여 유저가 눌러볼 수 있도록 시야에 띄워줍니다.

---

## 🚨 3. "아직 안알랴줌" 우회 대책의 이유
**"정답을 알아낸 해커는 시계를 돌려서 목적지를 훔쳐본다"**
클라이언트 로직이 완벽하게 암호화되어 있어도, 가장 심각한 약점은 **"정답을 올바르게 입력할 경우, 컴퓨터 시계가 D-Day 이전이더라도 HTML 요소검사(Elements) 창에는 해독되어 주입된 원본 링크 `href`가 평문으로 남는다"**는 것입니다.

이를 완벽하게 방어하기 위해 **물리적으로 파일 2개를 운용(이원화)**하는 방어 기동을 채택했습니다.
- **평소 (`script.js`):** 가짜로 생성된 페이로드가 탑재. 비밀번호(0409)를 해킹하고 시간을 돌려도 눌리지 않는 회색 벽돌 버튼("아직 안알랴줌")만 보입니다.
- **출격 준비 완료본 (`script_dday_backup.js`):** 진짜 생일카페 주소(`https://chwimi.github.io/moabirthday/`)가 심어진 진짜 페이로드가 탑재.

**✅ D-Day 실행 메뉴얼:**
4월 9일 자정이 되었을 때, **`script_dday_backup.js`의 파일 이름을 `script.js`로 바꾸어 기존 코드를 덮어씌운 뒤 깃허브에 커밋(Commit & Push)**만 하시면 완벽한 이벤트 오픈이 완료됩니다.

---

## 📝 4. 향후 내용을 수정할 때 AI에게 주는 명령 템플릿 예시
만약 암호문 속의 텍스트나 버튼 문구, 해금 링크 URL을 **바꾸고 싶으실 경우**, AI에게 이 문서를 지정하며 이렇게 요청하시면 됩니다.

> _"AI야, 이 문서의 규칙에 따라서 새로운 AES 페이로드를 생성해서 `script_dday_backup.js` 안에 덮어씌워 줬으면 좋겠어. 목적지 링크는 `https://youtube.com/...` 이고, 버튼 메시지는 `영상 보러가기`로 바꿔줘. 비밀번호(AES Key)는 기존과 동일하게 `0409`야. 임시 자바스크립트를 작성해서 노드 환경에서 페이로드를 뽑아내 줘!"_
