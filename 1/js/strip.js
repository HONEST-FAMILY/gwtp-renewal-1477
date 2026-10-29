(function () {
  var A = '../assets-shared/';
  var ITEMS = [
    { img: 'photo/cc-spring-s.jpg', dep: 'depth/cc-spring.png', city: '춘천', t: '춘천 신북 단지', d: '기술혁신지원센터와 춘천벤처1·2공장이 모인 곳, 춘천시 신북읍 신북로 61-10 일대', alt: '벚꽃이 핀 강원테크노파크 춘천 신북 단지 항공 사진' },
    { img: 'photo/cc-s.jpg', dep: 'depth/cc.png', city: '춘천', t: '춘천벤처1·2공장', d: '임대공장 두 동, 임대면적 합계 6,747.61㎡', alt: '춘천 신북 단지와 주변 들판 항공 사진' },
    { img: 'photo/wj-s.jpg', dep: 'depth/wj.png', city: '원주', t: '원주 문막 단지', d: '원주벤처공장과 원주벤처2공장, 원주시 문막읍 동화공단로 130-2', alt: '숲에 둘러싸인 원주 문막 단지 항공 사진' },
    { img: 'img/hc-antibody.jpg', dep: 'depth/hc-antibody.png', city: '홍천', t: '중화항체치료제개발지원센터', d: '바이오 관련 실험실과 기업입주공간, 홍천군 북방면 두개비산로 199-9', alt: '홍천 중화항체치료제개발지원센터 건물' },
    { img: 'photo/gn-s.jpg', dep: 'depth/gn.png', city: '강릉', t: '강릉 과학단지', d: '세라믹신소재지원센터 · SoP지원센터 · 강릉벤처1·2공장 · 반도체부재공장', alt: '숲 사이 강릉 과학단지 항공 사진' },
    { img: 'photo/gn-bldg-s.jpg', dep: 'depth/gn-bldg.png', city: '강릉', t: '강릉시 과학단지로 106', d: '실험실 · 창업보육실 · 기기분석실 · 임대공장, 강릉 시설 다섯 곳', alt: '지역산업의 True Partner 간판이 걸린 강릉 건물' },
    { img: 'photo/sc-s.jpg', dep: 'depth/sc.png', city: '삼척', t: '삼척 언장 단지', d: '에너지방재지원센터와 삼척창업보육센터, 삼척시 언장1길 27', alt: '소나무 숲 옆 삼척 단지 항공 사진' },
    { img: 'img/sc-energy.jpg', dep: 'depth/sc-energy.png', city: '삼척', t: '에너지방재지원센터', d: '사무실 · 연구실 · 세미나실, 연면적 3,288.03㎡', alt: '삼척 에너지방재지원센터 건물' }
  ];
  var N = ITEMS.length;
  var CITIES = [];
  ITEMS.forEach(function (it) { if (CITIES.indexOf(it.city) < 0) CITIES.push(it.city); });

  var hero = document.getElementById('hero');
  var band = document.getElementById('band');
  var box = document.getElementById('bandItems');
  var cv = document.getElementById('bandGl');
  var cap = document.getElementById('cap');
  var capT = document.getElementById('capT'), capD = document.getElementById('capD'), capR = document.getElementById('capRoute');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var els = ITEMS.map(function (it, i) {
    var a = document.createElement('a');
    a.className = 'band-it';
    a.href = '#places';
    a.setAttribute('data-i', i);
    a.setAttribute('aria-label', it.t + ' — ' + it.city);
    var im = document.createElement('img');
    im.src = A + it.img; im.alt = it.alt; im.draggable = false; im.decoding = 'async';
    a.appendChild(im);
    box.appendChild(a);
    return a;
  });

  var S = { vw: 0, bandW: 0, x0: 0, W: null, H: 0, mobile: false };
  function knots() {
    var vw = S.vw;
    if (vw < 768) return { '-3': 195, '-2': 195, '-1': 195, '0': 265, '1': 195, '2': 195, '3': 195 };
    var s = vw < 1024 ? 0.8 : 1;
    return { '-3': 231 * s, '-2': 231 * s, '-1': 333 * s, '0': 500 * s, '1': 365 * s, '2': 243 * s, '3': 231 * s };
  }
  function Wk(k) {
    if (k <= -3) return S.W['-3'];
    if (k >= 3) return S.W['3'];
    var a = Math.floor(k), f = k - a;
    return S.W[a] + (S.W[a + 1] - S.W[a]) * f;
  }
  function measure(force) {
    var vw = document.documentElement.clientWidth;
    if (!force && vw === S.vw) return;
    S.vw = vw; S.mobile = vw < 768;
    S.W = knots();
    S.H = Math.round(S.W['0'] * 2 / 3);
    S.x0 = S.mobile ? Math.round(vw * 0.16) : Math.round(vw * 0.3195);
    band.style.height = S.H + 'px';
    S.bandW = band.clientWidth;
    cap.style.marginLeft = S.x0 + 'px';
    if (gl) sizeCanvas();
  }

  var p = 0, pTarget = 0, pPrev = 0, vel = 0;
  var lastInput = -1e9, lastAdvance = 0, mouseMode = false, inView = true;
  var ptr = { x: 0, y: 0, over: false };
  var rects = new Array(N);

  function mod(n, m) { return ((n % m) + m) % m; }
  function layout() {
    var a = Math.floor(p), f = p - a;
    var half = N / 2;
    var lefts = {};
    lefts[1] = S.x0 + (1 - f) * Wk(-f);
    for (var j = 2; j <= half; j++) lefts[j] = lefts[j - 1] + Wk(j - 1 - f);
    for (j = 0; j > -half; j--) lefts[j] = lefts[j + 1] - Wk(j - f);
    for (j = -half + 1; j <= half; j++) {
      var i = mod(a + j, N), w = Wk(j - f);
      rects[i] = { x: lefts[j], w: w, h: w * 2 / 3, k: j - f };
    }
  }
  function applyDom() {
    for (var i = 0; i < N; i++) {
      var r = rects[i], el = els[i];
      if (!r) continue;
      var vis = r.x + r.w > -2 && r.x < S.bandW + 2;
      el.style.visibility = vis ? 'visible' : 'hidden';
      if (!vis) continue;
      el.style.transform = 'translate3d(' + r.x.toFixed(2) + 'px,0,0)';
      el.style.width = r.w.toFixed(2) + 'px';
      el.style.height = r.h.toFixed(2) + 'px';
    }
  }

  var shown = -1;
  function caption(force) {
    var i = mod(Math.round(p), N);
    if (i === shown && !force) return;
    shown = i;
    var it = ITEMS[i];
    var write = function () {
      capT.textContent = it.t;
      capD.textContent = it.d;
      capR.innerHTML = CITIES.map(function (c) { return c === it.city ? '<b>' + c + '</b>' : c; }).join(' — ');
      cap.classList.remove('fade');
    };
    if (force) { write(); return; }
    cap.classList.add('fade');
    clearTimeout(caption.t);
    caption.t = setTimeout(write, 170);
  }

  var gl = null, prog = null, buf = null, U = {}, tex = [];
  function initGL() {
    try { gl = cv.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true }); } catch (e) { gl = null; }
    if (!gl) return;
    var vs = 'attribute vec2 aP;uniform vec4 uR;uniform vec2 uS;varying vec2 vU;void main(){vec2 q=uR.xy+aP*uR.zw;vec2 c=q/uS*2.0-1.0;gl_Position=vec4(c.x,-c.y,0.0,1.0);vU=aP;}';
    var fs = 'precision mediump float;uniform sampler2D uI;uniform sampler2D uD;uniform vec4 uC;uniform vec2 uO;varying vec2 vU;' +
      'void main(){vec2 uv=uC.xy+vU*uC.zw;float d=texture2D(uD,uv).r;vec2 o=(d-0.5)*uO;float d2=texture2D(uD,clamp(uv+o,0.0,1.0)).r;o=(mix(d,d2,0.6)-0.5)*uO;' +
      'gl_FragColor=vec4(texture2D(uI,clamp(uv+o,vec2(0.001),vec2(0.999))).rgb,1.0);}';
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
    } catch (e) { gl = null; return; }
    gl.useProgram(prog);
    buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'aP');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    ['uR', 'uS', 'uI', 'uD', 'uC', 'uO'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    gl.uniform1i(U.uI, 0); gl.uniform1i(U.uD, 1);
    ITEMS.forEach(function (it, i) {
      var t = { img: null, dep: null, ready: false, crop: [0, 0, 1, 1] };
      tex[i] = t;
      var n = 0;
      function done() { if (++n === 2) { t.ready = true; t.crop = cropFor(t.w, t.h); } }
      load(A + it.img, function (o, w, h) { t.img = o; t.w = w; t.h = h; done(); });
      load(A + it.dep, function (o) { t.dep = o; done(); });
    });
    sizeCanvas();
  }
  function load(src, cb) {
    var im = new Image();
    im.onload = function () {
      if (!gl) return;
      var tx = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tx);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
      cb(tx, im.naturalWidth, im.naturalHeight);
    };
    im.src = src;
  }
  var ZOOM = 1.04;
  function cropFor(w, h) {
    var ai = w / h, ar = 1.5, cw = 1, ch = 1;
    if (ai > ar) cw = ar / ai; else ch = ai / ar;
    cw /= ZOOM; ch /= ZOOM;
    return [(1 - cw) / 2, (1 - ch) / 2, cw, ch];
  }
  var dpr = 1;
  function sizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    cv.width = Math.round(S.bandW * dpr);
    cv.height = Math.round(S.H * dpr);
  }

  var disp = [];
  for (var di = 0; di < N; di++) disp.push([0, 0]);
  var t0 = performance.now(), tPrev = t0, acc = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min(0.05, (now - tPrev) / 1000);
    tPrev = now;
    if (!inView || document.hidden) return;
    var idle = now - lastInput > 3000;
    if (idle && !reduce && now - lastAdvance > 4500 && !drag.on) {
      lastAdvance = now; mouseMode = false;
      pTarget = Math.round(pTarget) + 1;
    }
    if (!drag.on) p += (pTarget - p) * (1 - Math.exp(-dt * 4));
    if (Math.abs(pTarget - p) < 0.0005) p = pTarget;
    if (p >= N && pTarget >= N) { p -= N; pTarget -= N; pPrev -= N; }
    if (p < 0 && pTarget < 0) { p += N; pTarget += N; pPrev += N; }
    var v = dt > 0 ? (p - pPrev) / dt : 0;
    pPrev = p;
    vel += (v - vel) * (1 - Math.exp(-dt * 10));
    layout();
    applyDom();
    caption(false);
    if (!gl) return;
    var t = (now - t0) / 1000;
    var act = mod(Math.round(p), N);
    var ar = rects[act];
    var vx = Math.max(-1.2, Math.min(1.2, vel * 1.6));
    var lx = reduce ? 0 : 0.4 * Math.sin(t * Math.PI * 2 / 7), ly = reduce ? 0 : 0.25 * Math.sin(t * Math.PI * 2 / 5);
    var hx = lx, hy = ly;
    if (ptr.over && !idle && ar) {
      var br = band.getBoundingClientRect();
      hx = Math.max(-1, Math.min(1, (ptr.x - (br.left + ar.x + ar.w / 2)) / (ar.w / 2)));
      hy = Math.max(-1, Math.min(1, (ptr.y - (br.top + ar.h / 2)) / (ar.h / 2)));
    } else if (!idle) { hx = 0; hy = 0; }
    gl.viewport(0, 0, cv.width, cv.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.uS, S.bandW, S.H);
    var any = false;
    for (var i = 0; i < N; i++) {
      var r = rects[i], tx = tex[i];
      var isAct = i === act;
      var tx2 = (isAct ? hx : hx * 0.45) + vx, ty2 = isAct ? hy : hy * 0.45;
      var k = 1 - Math.exp(-dt * 9);
      disp[i][0] += (tx2 - disp[i][0]) * k;
      disp[i][1] += (ty2 - disp[i][1]) * k;
      if (!r || !tx || !tx.ready) continue;
      if (r.x + r.w < 0 || r.x > S.bandW) continue;
      any = true;
      var c = tx.crop, amp = 0.036;
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tx.img);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tx.dep);
      gl.uniform4f(U.uR, r.x, 0, r.w, r.h);
      gl.uniform4f(U.uC, c[0], c[1], c[2], c[3]);
      gl.uniform2f(U.uO, disp[i][0] * amp * c[2], disp[i][1] * amp * c[3] * 0.7);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    if (any && !cv.classList.contains('on')) cv.classList.add('on');
  }

  var drag = { on: false, id: null, x: 0, y: 0, p0: 0, moved: false, lastX: 0, lastT: 0, vx: 0 };
  function touchInput() { lastInput = performance.now(); }
  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.over = true;
    touchInput();
    if (drag.on) return;
    if (!mouseMode) { mouseMode = true; p = mod(p, N); pTarget = mod(Math.round(pTarget), N); pPrev = p; }
    var f = e.clientX / S.vw * (N - 1), cur = Math.round(pTarget);
    if (Math.abs(f - cur) > 0.62) pTarget = Math.max(0, Math.min(N - 1, Math.round(f)));
  });
  hero.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') ptr.over = false; });

  band.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    drag.on = true; drag.id = e.pointerId; drag.x = e.clientX; drag.y = e.clientY; drag.p0 = p; drag.moved = false;
    drag.lastX = e.clientX; drag.lastT = performance.now(); drag.vx = 0;
    mouseMode = false;
    touchInput();
  });
  window.addEventListener('pointermove', function (e) {
    if (!drag.on || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(e.clientY - drag.y)) {
      drag.moved = true; band.classList.add('drag');
      try { band.setPointerCapture(e.pointerId); } catch (er) { }
    }
    if (!drag.moved) return;
    var unit = S.W['0'] * 0.85;
    p = drag.p0 - dx / unit; pTarget = p;
    var now = performance.now(), dtt = Math.max(1, now - drag.lastT);
    drag.vx = drag.vx * 0.6 + ((e.clientX - drag.lastX) / dtt) * 0.4;
    drag.lastX = e.clientX; drag.lastT = now;
    touchInput();
  }, { passive: true });
  function endDrag(e) {
    if (!drag.on || (e && e.pointerId !== drag.id)) return;
    drag.on = false; band.classList.remove('drag');
    if (drag.moved) {
      var unit = S.W['0'] * 0.85;
      var fling = -drag.vx * 260 / unit;
      pTarget = Math.round(p + Math.max(-2, Math.min(2, fling)));
      drag.justDragged = performance.now();
    }
    touchInput();
  }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  box.addEventListener('click', function (e) {
    var a = e.target.closest('.band-it');
    if (!a) return;
    e.preventDefault();
    if (drag.justDragged && performance.now() - drag.justDragged < 350) return;
    var i = +a.getAttribute('data-i');
    var act = mod(Math.round(p), N);
    touchInput();
    if (i === act) {
      var t = document.querySelector('[data-city="' + ITEMS[i].city + '"]');
      if (t) {
        t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        t.classList.add('flash');
        setTimeout(function () { t.classList.remove('flash'); }, 1600);
      }
      return;
    }
    var base = Math.round(p), delta = mod(i - mod(base, N), N);
    if (delta > N / 2) delta -= N;
    mouseMode = false;
    pTarget = base + delta;
  });
  band.tabIndex = 0;
  band.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { pTarget = Math.round(pTarget) + 1; touchInput(); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { pTarget = Math.round(pTarget) - 1; touchInput(); e.preventDefault(); }
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { inView = en[0].isIntersecting; }, { rootMargin: '100px' }).observe(hero);
  }
  var rT;
  window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { measure(false); }, 200); });

  measure(true);
  initGL();
  layout(); applyDom(); caption(true);
  lastAdvance = performance.now();
  requestAnimationFrame(frame);
  window.GW_STRIP = { items: ITEMS, state: function () { return { p: p, pTarget: pTarget, active: mod(Math.round(p), N), gl: !!gl, ready: tex.filter(function (t) { return t && t.ready; }).length }; } };
})();
