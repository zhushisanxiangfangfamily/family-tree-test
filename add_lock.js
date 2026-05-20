const fs = require('fs');
let html = fs.readFileSync('C:/Users/29763/github-family-tree-test/index.html', 'utf8');

// 1. Add lock screen CSS (append before </style> but in head - add to existing style block)
const lockCSS = `\n/* ── 密码锁 ── */
#lock-overlay{position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;
  display:flex;align-items:center;justify-content:center;flex-direction:column;
  background:linear-gradient(180deg,#F5F0E8 0%,#E8E2D5 100%);
  font-family:system-ui,-apple-system,sans-serif}
#lock-overlay.hidden{display:none}
.lock-card{text-align:center;padding:40px 30px;max-width:360px;width:90%}
.lock-icon{font-size:60px;margin-bottom:16px}
.lock-title{font-size:22px;font-weight:700;color:#4a3000;margin-bottom:8px}
.lock-subtitle{font-size:14px;color:#8B7355;margin-bottom:28px}
.lock-input-wrap{display:flex;gap:8px;justify-content:center;margin-bottom:12px}
.lock-dot{width:48px;height:56px;border:2px solid #C5B088;border-radius:10px;
  background:#fff;font-size:32px;text-align:center;line-height:52px;color:#4a3000;
  caret-color:transparent;transition:border-color .2s}
.lock-dot.filled{border-color:#8B6914}
.lock-dot.error{border-color:#c0392b;animation:shake .4s}
.lock-hint{font-size:13px;color:#999;margin-top:16px}
.lock-error{font-size:13px;color:#c0392b;margin-top:8px;display:none}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}50%{transform:translateX(8px)}75%{transform:translateX(-4px)}}
.hidden-input{position:absolute;opacity:0;width:1px;height:1px}
`;

// Insert before </style>
html = html.replace('</style>', lockCSS + '</style>');

// 2. Add lock screen HTML right after <body ...>
const bodyTag = html.match(/<body[^>]*>/)[0];
const lockHTML = bodyTag + `
<div id="lock-overlay">
  <div class="lock-card">
    <div class="lock-icon">🏠</div>
    <div class="lock-title">朱氏三厢房家族族谱</div>
    <div class="lock-subtitle">请输入密码查看</div>
    <div class="lock-input-wrap" id="lock-dots">
      <div class="lock-dot" data-i="0"></div>
      <div class="lock-dot" data-i="1"></div>
      <div class="lock-dot" data-i="2"></div>
      <div class="lock-dot" data-i="3"></div>
    </div>
    <div class="lock-error" id="lock-error">密码不正确</div>
    <div class="lock-hint">点击上方圆点输入数字密码</div>
    <input type="number" class="hidden-input" id="lock-input" inputmode="numeric" maxlength="4">
  </div>
</div>
`;
html = html.replace(bodyTag, lockHTML);

// 3. Add lock JS before the main script starts (before </head> or after last </script>)
const lockJS = `
<script>
(function(){
  var PASS = '4646';
  var STORAGE_KEY = 'ft_unlocked';

  // Check if already unlocked
  function isUnlocked() {
    var params = new URLSearchParams(location.search);
    if (params.get('key') === PASS) {
      sessionStorage.setItem(STORAGE_KEY, '1');
      // Clean URL
      params.delete('key');
      var newUrl = location.pathname + (params.toString() ? '?' + params.toString() : '');
      history.replaceState(null, '', newUrl);
      return true;
    }
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  }

  if (isUnlocked()) {
    var overlay = document.getElementById('lock-overlay');
    if (overlay) overlay.classList.add('hidden');
    return;
  }

  // Show lock screen
  var input = document.getElementById('lock-input');
  var dots = document.querySelectorAll('.lock-dot');
  var errorEl = document.getElementById('lock-error');
  var code = '';

  function updateDots() {
    dots.forEach(function(d, i) {
      if (i < code.length) d.classList.add('filled');
      else d.classList.remove('filled');
    });
  }

  function clearError() { errorEl.style.display = 'none'; }

  function shake() {
    dots.forEach(function(d) { d.classList.add('error'); });
    errorEl.style.display = 'block';
    setTimeout(function() {
      dots.forEach(function(d) { d.classList.remove('error'); });
      code = '';
      updateDots();
    }, 500);
  }

  // Click on dot area to focus
  document.getElementById('lock-dots').addEventListener('click', function() {
    input.focus();
  });

  input.addEventListener('input', function() {
    clearError();
    var val = input.value.replace(/\\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    code = val;
    input.value = code;
    updateDots();
    if (code.length === 4) {
      if (code === PASS) {
        sessionStorage.setItem(STORAGE_KEY, '1');
        document.getElementById('lock-overlay').classList.add('hidden');
      } else {
        shake();
        input.value = '';
      }
    }
  });

  // Auto-focus
  setTimeout(function() { input.focus(); }, 300);
})();
</script>
`;

html = html.replace('</head>', lockJS + '</head>');

fs.writeFileSync('C:/Users/29763/github-family-tree-test/index.html', html);
console.log('Lock screen added');
