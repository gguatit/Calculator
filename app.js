// 테마 초기화
const toggle = document.getElementById('themeToggle');
function applyTheme(isDark) {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  toggle.checked = isDark;
}
// 기본: OS 선호 색상 감지
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(prefersDark);
toggle.addEventListener('change', () => applyTheme(toggle.checked));

// 입력 보조 함수: 커서 위치에 텍스트 삽입
function insertText(text) {
  const el = document.getElementById('expr');
  const start = el.selectionStart || 0;
  const end = el.selectionEnd || 0;
  const value = el.value;
  el.value = value.slice(0, start) + text + value.slice(end);
  const pos = start + text.length;
  el.setSelectionRange(pos, pos);
  el.focus();
}
function delChar() {
  const el = document.getElementById('expr');
  const start = el.selectionStart || 0;
  const end = el.selectionEnd || 0;
  if (start === end && start > 0) {
    el.value = el.value.slice(0, start - 1) + el.value.slice(end);
    el.setSelectionRange(start - 1, start - 1);
  } else if (start !== end) {
    el.value = el.value.slice(0, start) + el.value.slice(end);
    el.setSelectionRange(start, start);
  }
  el.focus();
}
function clearAll() {
  document.getElementById('expr').value = '';
  document.getElementById('result').textContent = '';
  document.getElementById('expr').focus();
}

// 계산기 유틸과 안전한 평가
const Calc = (function(){
  let angleMode = 'rad'; // 'rad' or 'deg'
  function toRad(x){ return angleMode === 'deg' ? x * Math.PI / 180 : x; }
  function fromRad(x){ return angleMode === 'deg' ? x * 180 / Math.PI : x; }
  return {
    setAngleMode(mode){ angleMode = mode; },
    sin(x){ return Math.sin(toRad(x)); },
    cos(x){ return Math.cos(toRad(x)); },
    tan(x){ return Math.tan(toRad(x)); },
    asin(x){ return fromRad(Math.asin(x)); },
    acos(x){ return fromRad(Math.acos(x)); },
    atan(x){ return fromRad(Math.atan(x)); },
    sqrt(x){ return Math.sqrt(x); },
    pow(x,y){ return Math.pow(x,y); },
    ln(x){ return Math.log(x); },
    log(x){ return Math.log10 ? Math.log10(x) : Math.log(x)/Math.LN10; },
    abs(x){ return Math.abs(x); },
    exp(x){ return Math.exp(x); },
    floor(x){ return Math.floor(x); },
    ceil(x){ return Math.ceil(x); },
    round(x){ return Math.round(x); },
    min(...a){ return Math.min(...a); },
    max(...a){ return Math.max(...a); },
    fact(n){ n = Math.trunc(n); if (n < 0) return NaN; let r=1; for(let i=2;i<=n;i++) r*=i; return r; }
  };
})();

function calculate(){
  const inputEl = document.getElementById('expr');
  const input = inputEl.value.trim();
  const resEl = document.getElementById('result');
  if (!input) { resEl.innerHTML = ''; return; }

  // 함수명 치환: Calc.<fn>
  let expr = input
    .replace(/π|pi/gi, 'Math.PI')
    .replace(/\be\b/gi, 'Math.E')
    .replace(/\b(sin|cos|tan|asin|acos|atan|sqrt|abs|ln|log|pow|exp|floor|ceil|round|min|max|fact)\b/gi, function(m){ return 'Calc.' + m.toLowerCase(); });

  // '^' 연산자를 '**'로 대체 (지수)
  expr = expr.replace(/\^/g, '**');

  // 팩토리얼 표기: 후위 '!' 를 Calc.fact(...)로 변환
  expr = expr.replace(/(\d+|\([^()]+\))!/g, 'Calc.fact($1)');

  try {
    // 허용 문자만 남기기: 숫자, 연산자, ., 괄호, 알파벳, 밑줄, 공백, !, ^
    if (/[^0-9+\-*/().,\s\*\*A-Za-z_<>=%]/.test(expr)) {
      throw new Error('허용되지 않은 문자가 포함되어 있습니다.');
    }
    // 평가
    const result = Function('return (' + expr + ')')();
    if (typeof result === 'number' && isFinite(result)) resEl.textContent = result;
    else resEl.innerHTML = '<span class="error">계산 불가</span>';
  } catch (e){
    resEl.innerHTML = '<span class="error">오류: ' + e.message + '</span>';
  }
}

// Enter 키로 계산
document.getElementById('expr').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') calculate();
});

// 모드 버튼: Engineering <-> Standard 전환
const modeBtn = document.getElementById('modeBtn');
let engMode = true; // true: engineering (show function keys), false: standard
function updateModeUI(){
  document.querySelectorAll('.key.function').forEach(k=> k.classList.toggle('hidden', !engMode));
  modeBtn.textContent = engMode ? 'Mode: ENG' : 'Mode: STD';
}
modeBtn.addEventListener('click', ()=>{ engMode = !engMode; updateModeUI(); });

// 각도 모드 토글 (RAD / DEG)
const angleBtn = document.getElementById('angleBtn');
let angleMode = 'rad';
angleBtn.addEventListener('click', ()=>{
  angleMode = angleMode === 'rad' ? 'deg' : 'rad';
  angleBtn.textContent = 'Mode: ' + angleMode.toUpperCase();
  Calc.setAngleMode(angleMode);
});
// 초기 설정
Calc.setAngleMode(angleMode);
updateModeUI();
