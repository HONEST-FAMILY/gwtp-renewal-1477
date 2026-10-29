(function () {
  var canvas = document.getElementById('lamp');
  var scene = canvas && canvas.closest('.scene');
  var line = document.getElementById('lampLine');
  var hint = document.getElementById('lampHint');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) { document.documentElement.classList.add('no-canvas'); return; }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touchy = window.matchMedia('(hover: none)').matches;
  if (touchy && hint) hint.textContent = '손가락으로 쓸어 비춰 보세요';

  var PAST = '../assets-shared/photo/mine.jpg';
  var NOW = '../assets-shared/photo/cc-spring.jpg';
  var LINES = ['거친 땅과 검은 바위 속에서 우리는 희망을 캐냈습니다.', '강원의 땅 위에 새로운 심장이 뛰기 시작합니다.'];

  var past = new Image(), now = new Image(), ready = 0;
  past.decoding = now.decoding = 'async';
  past.onload = now.onload = function () { ready++; if (ready === 2) start(); };
  past.onerror = now.onerror = function () { document.documentElement.classList.add('no-canvas'); };
  past.src = PAST; now.src = NOW;

  var W = 0, H = 0, dpr = 1, MS = 4;
  var mask = document.createElement('canvas'), mctx = mask.getContext('2d', { willReadFrequently: true });
  var layer = document.createElement('canvas'), lctx = layer.getContext('2d');
  var beam = { x: 0, y: 0, tx: 0, ty: 0, r: 0, burst: 0 };
  var last = { x: 0, y: 0, ok: false };
  var lastInput = -1e9, broke = 0, breakT = 0, state = 'past', clock = 0, coverAcc = 0, cover = 0, ioVis = true, sceneVis = true, visible = true, running = false;

  function size() {
    var r = canvas.getBoundingClientRect();
    if (!r.width) return;
    W = r.width; H = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    layer.width = canvas.width; layer.height = canvas.height;
    var mw = Math.max(32, Math.round(W / MS)), mh = Math.max(32, Math.round(H / MS));
    if (mask.width !== mw || mask.height !== mh) {
      var old = null;
      if (mask.width) { old = document.createElement('canvas'); old.width = mask.width; old.height = mask.height; old.getContext('2d').drawImage(mask, 0, 0); }
      mask.width = mw; mask.height = mh;
      if (old) mctx.drawImage(old, 0, 0, mw, mh);
    }
    beam.r = Math.max(W * (W < 641 ? 0.3 : 0.11), 90);
    if (!last.ok) { beam.x = beam.tx = W * 0.5; beam.y = beam.ty = H * 0.55; }
  }

  function cover_(img, c, w, h, fx) {
    var ir = img.naturalWidth / img.naturalHeight, r = w / h, sw, sh, sx, sy;
    if (ir > r) { sh = img.naturalHeight; sw = sh * r; sx = (img.naturalWidth - sw) * fx; sy = 0; }
    else { sw = img.naturalWidth; sh = sw / r; sx = 0; sy = (img.naturalHeight - sh) * 0.5; }
    c.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  }

  function dab(x, y, rad, a) {
    var mx = x / MS, my = y / MS, mr = rad / MS;
    var g = mctx.createRadialGradient(mx, my, 0, mx, my, mr);
    g.addColorStop(0, 'rgba(255,255,255,' + a + ')');
    g.addColorStop(0.32, 'rgba(255,255,255,' + (a * 0.86) + ')');
    g.addColorStop(0.68, 'rgba(255,255,255,' + (a * 0.32) + ')');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    mctx.globalCompositeOperation = 'lighter';
    mctx.fillStyle = g;
    mctx.beginPath(); mctx.arc(mx, my, mr, 0, Math.PI * 2); mctx.fill();
  }

  function paintPath(x0, y0, x1, y1, rad, a) {
    var dx = x1 - x0, dy = y1 - y0, d = Math.sqrt(dx * dx + dy * dy);
    var step = rad * 0.3, n = Math.max(1, Math.ceil(d / step));
    for (var i = 1; i <= n; i++) dab(x0 + dx * i / n, y0 + dy * i / n, rad, a);
  }

  function measure() {
    var d = mctx.getImageData(0, 0, mask.width, mask.height).data, on = 0, tot = 0;
    for (var i = 3; i < d.length; i += 16) { tot++; if (d[i] > 150) on++; }
    return tot ? on / tot : 0;
  }

  function setLine(i) {
    if (!line) return;
    var t = LINES[i];
    line.innerHTML = '';
    var k = 0;
    t.split(' ').forEach(function (w, wi) {
      if (wi) { line.appendChild(document.createTextNode(' ')); k++; }
      var ws = document.createElement('span'); ws.className = 'w';
      for (var j = 0; j < w.length; j++, k++) {
        var s = document.createElement('span'); s.className = 'ch';
        s.textContent = w[j];
        s.style.transitionDelay = (k * 0.026) + 's';
        ws.appendChild(s);
      }
      line.appendChild(ws);
    });
    line.parentNode.classList.remove('play');
    void line.offsetWidth;
    requestAnimationFrame(function () { line.parentNode.classList.add('play'); });
  }

  function input(x, y, strong) {
    var r = canvas.getBoundingClientRect();
    beam.tx = x - r.left; beam.ty = y - r.top;
    lastInput = clock;
    if (hint && !hint.classList.contains('off') && strong) hint.classList.add('off');
  }

  function onMove(e) { if (!visible) return; input(e.clientX, e.clientY, true); }
  function onTouch(e) { if (!visible || !e.touches || !e.touches.length) return; var t = e.touches[0]; input(t.clientX, t.clientY, true); }
  function onClick(e) {
    input(e.clientX, e.clientY, true);
    beam.x = beam.tx; beam.y = beam.ty;
    beam.burst = 1;
  }

  function reset() {
    mctx.globalCompositeOperation = 'source-over';
    mctx.clearRect(0, 0, mask.width, mask.height);
    if (reduce) dab(W * 0.5, H * 0.55, Math.max(W, H) * 0.42, 1);
    state = 'past'; broke = 0; setLine(0);
  }

  var prev = 0;
  function frame(t) {
    if (!running) return;
    requestAnimationFrame(frame);
    var dt = Math.min(0.05, prev ? (t - prev) / 1000 : 0.016); prev = t;
    if (!visible) return;
    clock += dt;

    var idle = clock - lastInput > 2.2;
    if (idle && !reduce && state === 'past') {
      var q = clock * 0.42;
      beam.tx = W * (0.5 + 0.33 * Math.sin(q * 0.83)) ;
      beam.ty = H * (0.56 + 0.2 * Math.sin(q * 1.31 + 1.1));
    }
    var k = 1 - Math.exp(-dt * (idle ? 3.2 : 10));
    var nx = beam.x + (beam.tx - beam.x) * k, ny = beam.y + (beam.ty - beam.y) * k;

    var decay = 1 - Math.pow(0.5, dt / 6);
    mctx.globalCompositeOperation = 'destination-out';
    mctx.fillStyle = 'rgba(0,0,0,' + decay + ')';
    mctx.fillRect(0, 0, mask.width, mask.height);

    if (state === 'past') {
      var amt = (idle ? 0.03 : 0.085) * (dt * 60);
      var rad = beam.r * (1 + beam.burst);
      paintPath(beam.x, beam.y, nx, ny, rad, Math.min(0.5, amt * (1 + beam.burst * 2)));
    }
    beam.burst = Math.max(0, beam.burst - dt * 2);
    beam.x = nx; beam.y = ny;

    coverAcc += dt;
    if (coverAcc > 0.25 && state === 'past') {
      coverAcc = 0; cover = measure();
      if (cover > 0.42 && clock - lastInput < 2) { state = 'break'; breakT = 0; setLine(1); if (hint) hint.classList.add('off'); }
    }
    if (state === 'break') {
      breakT += dt; broke = Math.min(1, breakT / 1.2);
      if (clock - lastInput > 8) { state = 'heal'; }
    } else if (state === 'heal') {
      broke = Math.max(0, broke - dt / 1.2);
      if (broke <= 0) reset();
    }

    var cw = canvas.width, ch = canvas.height;
    var fx = W < 641 ? 0.72 : 0.5;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.filter = 'none';
    cover_(past, ctx, cw, ch, fx);
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(0, 0, cw, ch);

    lctx.globalCompositeOperation = 'source-over';
    lctx.clearRect(0, 0, cw, ch);
    cover_(now, lctx, cw, ch, 0.5);
    lctx.globalCompositeOperation = 'destination-in';
    lctx.imageSmoothingEnabled = true;
    lctx.drawImage(mask, 0, 0, cw, ch);
    ctx.drawImage(layer, 0, 0);
    if (broke > 0) {
      ctx.globalAlpha = broke;
      cover_(now, ctx, cw, ch, 0.5);
      ctx.globalAlpha = 1;
    }

  }

  function start() {
    size();
    reset();
    if (reduce && hint) hint.classList.add('off');
    window.addEventListener('mousemove', onMove, { passive: true });
    canvas.addEventListener('touchstart', onTouch, { passive: true });
    canvas.addEventListener('touchmove', onTouch, { passive: true });
    canvas.addEventListener('click', onClick);
    var wTimer = 0, lastW = window.innerWidth;
    window.addEventListener('resize', function () {
      clearTimeout(wTimer);
      wTimer = setTimeout(function () {
        if (window.innerWidth === lastW && Math.abs(canvas.getBoundingClientRect().height * dpr - canvas.height) < 160) return;
        lastW = window.innerWidth; size();
      }, 200);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { ioVis = es[0].isIntersecting; visible = ioVis && sceneVis; }, { threshold: 0 }).observe(canvas);
    }
    running = true;
    requestAnimationFrame(frame);
  }

  window.GW_LAMP = {
    setVisible: function (v) { sceneVis = v; visible = ioVis && sceneVis; },
    cover: function () { return cover; },
    state: function () { return state; }
  };
})();
