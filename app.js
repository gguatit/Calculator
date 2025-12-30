// ------------------------------------------------------------
// 테마(다크/라이트) 초기화 및 토글 처리
// 이 섹션은 페이지 전체의 색상 테마를 변경합니다.
// - `themeToggle` 체크박스 상태를 읽어 다크/라이트를 적용합니다.
// - 사용자의 OS 색상 선호(prefers-color-scheme)를 초기값으로 사용합니다.
const toggle = document.getElementById('themeToggle');

/**
 * applyTheme
 * @param {boolean} isDark - true면 다크 테마 적용, false면 라이트 테마 적용
 * - 이 함수는 루트 요소(`document.documentElement`)에 `data-theme` 속성을 설정
 *   CSS에서 이 속성으로 스타일을 분기하여 테마를 바꿉니다.
 * - 또한 토글 UI의 체크 상태를 동기화합니다.
 */
function applyTheme(isDark) {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  toggle.checked = isDark;
}

// 페이지 로드 시 사용자의 OS 선호 색상으로 초기 테마를 설정합니다.
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(prefersDark);

// 토글박스가 변경되면 테마를 전환합니다.
toggle.addEventListener('change', () => applyTheme(toggle.checked));

// 입력 보조 함수: 커서 위치에 텍스트 삽입
// ------------------------------------------------------------
// 입력 관련 보조 함수들
// - 이 함수들은 화면의 입력창(`#expr`)에 텍스트 삽입, 삭제, 초기화를 편리하게 합니다.

/**
 * insertText
 * - 현재 커서 위치(또는 선택된 영역)에 `text`를 삽입하고
 *   커서를 삽입한 텍스트 끝으로 이동시킵니다.
 * - 예: 함수 버튼을 눌러 `sin(`을 삽입할 때 사용됩니다.
 */
function insertText(text) {
  const el = document.getElementById('expr');
  // selectionStart/End는 입력창에서의 커서/선택 위치를 나타냅니다.
  const start = el.selectionStart || 0;
  const end = el.selectionEnd || 0;
  const value = el.value;
  // 커서 앞부분 + 삽입할 텍스트 + 커서 뒷부분
  el.value = value.slice(0, start) + text + value.slice(end);
  const pos = start + text.length;
  // 커서를 삽입된 텍스트 끝으로 옮김
  el.setSelectionRange(pos, pos);
  el.focus();
}

/**
 * delChar
 * - 커서 바로 앞의 문자 1개를 삭제하거나, 텍스트가 선택되어 있으면 선택영역을 삭제합니다.
 * - 입력창 내부 편집 동작을 직접 제어하기 때문에 사용자 기대 동작과 동일합니다.
 */
function delChar() {
  const el = document.getElementById('expr');
  const start = el.selectionStart || 0;
  const end = el.selectionEnd || 0;
  if (start === end && start > 0) {
    // 선택이 없으면 커서 앞의 한 글자 삭제
    el.value = el.value.slice(0, start - 1) + el.value.slice(end);
    el.setSelectionRange(start - 1, start - 1);
  } else if (start !== end) {
    // 선택이 있으면 그 영역을 삭제
    el.value = el.value.slice(0, start) + el.value.slice(end);
    el.setSelectionRange(start, start);
  }
  el.focus();
}

/**
 * clearAll
 * - 입력과 결과를 모두 초기화하고 입력창에 포커스를 둡니다.
 */
function clearAll() {
  document.getElementById('expr').value = '';
  document.getElementById('result').textContent = '';
  document.getElementById('expr').focus();
}

// ------------------------------------------------------------
// 계산 유틸리티 객체 `Calc`
// - 삼각함수에서 각도 모드(rad/deg)를 처리하고, 자주 쓰이는 수학 함수를 모아 안전하게 제공합니다.
// - 내부 상태로 `angleMode`를 가지며 `setAngleMode`로 변경합니다.
// - UI에서 직접 Math.*를 호출하는 대신 여기 메서드를 사용하면 각도 단위 일관성을 유지할 수 있습니다.
const Calc = (function(){
  // 내부 상태: 각도 모드. 'rad' 또는 'deg' 중 하나.
  let angleMode = 'rad'; // 기본: 라디안

  // toRad / fromRad: 각도 단위 변환 헬퍼
  function toRad(x){ return angleMode === 'deg' ? x * Math.PI / 180 : x; }
  function fromRad(x){ return angleMode === 'deg' ? x * 180 / Math.PI : x; }

  return {
    // 외부에서 각도 모드 전환할 때 사용
    setAngleMode(mode){ angleMode = mode; },

    // 삼각함수: 내부에서 단위 변환을 수행
    sin(x){ return Math.sin(toRad(x)); },
    cos(x){ return Math.cos(toRad(x)); },
    tan(x){ return Math.tan(toRad(x)); },
    asin(x){ return fromRad(Math.asin(x)); },
    acos(x){ return fromRad(Math.acos(x)); },
    atan(x){ return fromRad(Math.atan(x)); },

    // 기본 수학 함수들 (이름을 통일해 UI에서 호출하기 편하도록 함)
    sqrt(x){ return Math.sqrt(x); },
    pow(x,y){ return Math.pow(x,y); },
    ln(x){ return Math.log(x); },
    // log는 10진 로그를 기본으로 제공 (환경에 따라 Math.log10이 없을 수 있어 폴백 처리)
    log(x){ return Math.log10 ? Math.log10(x) : Math.log(x)/Math.LN10; },
    abs(x){ return Math.abs(x); },
    exp(x){ return Math.exp(x); },
    floor(x){ return Math.floor(x); },
    ceil(x){ return Math.ceil(x); },
    round(x){ return Math.round(x); },
    min(...a){ return Math.min(...a); },
    max(...a){ return Math.max(...a); },

    // factorial: 음수는 정의되지 않음(NaN), 소수는 버림(trunc) 처리 후 계산
    fact(n){
      n = Math.trunc(n);
      if (n < 0) return NaN;
      let r = 1;
      for (let i = 2; i <= n; i++) r *= i;
      return r;
    }
  };
})();

// ------------------------------------------------------------
// 입력 문자열을 안전하게 JS로 변환하여 계산하고 결과를 화면에 표시하는 함수
// 주의: 이 코드는 사용자가 입력한 수식을 JS 표현식으로 변환해 `Function`으로 평가합니다.
//       임의 코드 실행 취약점을 줄이기 위해 허용 문자 검사를 수행하지만, 완전한 샌드박스는 아닙니다.

function calculate(){
  const inputEl = document.getElementById('expr');
  const input = inputEl.value.trim();
  const resEl = document.getElementById('result');

  // 빈 입력이면 결과를 지우고 종료
  if (!input) { resEl.innerHTML = ''; return; }

  // 1) 사용자 편의 표현을 실제 JS 표현으로 치환
  // - π, pi -> Math.PI
  // - e -> Math.E
  // - 알려진 함수명은 Calc.<fn> 형식으로 바꿔 내부 유틸을 사용
  let expr = input
    .replace(/π|pi/gi, 'Math.PI')
    .replace(/\be\b/gi, 'Math.E')
    .replace(/\b(sin|cos|tan|asin|acos|atan|sqrt|abs|ln|log|pow|exp|floor|ceil|round|min|max|fact)\b/gi, function(m){
      // 함수명을 소문자로 통일한 뒤 Calc 객체의 메서드로 호출
      return 'Calc.' + m.toLowerCase();
    });

  // 2) 수학적 표기 보정
  // - ^를 거듭제곱 연산자 **로 변경
  expr = expr.replace(/\^/g, '**');

  // - 팩토리얼 표기(예: 5!)를 Calc.fact(5) 형태로 변경
  expr = expr.replace(/(\d+|\([^()]+\))!/g, 'Calc.fact($1)');

  try {
    // 3) 허용 문자 검사: 숫자, 연산자, 괄호, 점, 공백, 알파벳 등만 허용
    //    (완전한 보안 검증은 아니므로 외부 입력을 그대로 신뢰하면 안 됩니다.)
    if (/[^0-9+\-*/().,\s\*\*A-Za-z_<>=%]/.test(expr)) {
      throw new Error('허용되지 않은 문자가 포함되어 있습니다.');
    }

    // 4) 평가: Function을 사용하여 표현식을 계산
    //    Function 사용은 eval과 유사하므로 입력 검증을 철저히 해야 합니다.
    const result = Function('return (' + expr + ')')();

    // 결과가 유한한 숫자이면 표시, 아니면 오류 표시
    if (typeof result === 'number' && isFinite(result)) resEl.textContent = result;
    else resEl.innerHTML = '<span class="error">계산 불가</span>';
  } catch (e){
    // 계산 중 발생한 예외를 사용자에게 표시
    resEl.innerHTML = '<span class="error">오류: ' + e.message + '</span>';
  }
}

// Enter 키로 계산
// 입력창에서 Enter 키를 누르면 계산을 실행합니다.
document.getElementById('expr').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') calculate();
});

// ------------------------------------------------------------
// UI 모드 전환 (Engineering / Standard)
// - 엔지니어링 모드에서는 더 많은 함수 키(삼각함수, 팩토리얼 등)를 표시합니다.
const modeBtn = document.getElementById('modeBtn');
let engMode = true; // true이면 고급(함수) 키를 노출

function updateModeUI(){
  // .key.function 요소들을 숨기거나 보이게 합니다.
  document.querySelectorAll('.key.function').forEach(k => k.classList.toggle('hidden', !engMode));
  modeBtn.textContent = engMode ? 'Mode: ENG' : 'Mode: STD';
}

modeBtn.addEventListener('click', () => { engMode = !engMode; updateModeUI(); });

// 각도 모드 토글 (RAD / DEG)
const angleBtn = document.getElementById('angleBtn');
let angleMode = 'rad';

angleBtn.addEventListener('click', () => {
  angleMode = angleMode === 'rad' ? 'deg' : 'rad';
  angleBtn.textContent = 'Mode: ' + angleMode.toUpperCase();
  // Calc 객체에 각도 모드 반영
  Calc.setAngleMode(angleMode);
});

// 초기 설정: Calc에 각도 모드를 알려주고 UI 업데이트 수행
Calc.setAngleMode(angleMode);
updateModeUI();
