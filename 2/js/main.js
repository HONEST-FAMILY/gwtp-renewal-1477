(function () {
  var GW = window.GW, B = window.GW_BASE, FAC = window.GW_FACILITIES || [];
  var esc = GW.esc;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hd = document.getElementById('hd');
  var U = 'https://www.gwtp.or.kr/gwtp/';
  var NEWS_Q = ['aWR4PTM2NDMmc3RhcnRQYWdlPTAmbGlzdE5vPTE4OSZ0YWJsZT1jc19iYnNfZGF0YV9uZXcmY29kZT1zdWIwNmImc2VhcmNoX2l0ZW09JnNlYXJjaF9vcmRlcj0mdXJsPXN1YjA2YiZrZXl2YWx1ZT1zdWIwNiZiYnNfbWFsbmFtZT0=',
    'aWR4PTM2NDImc3RhcnRQYWdlPTAmbGlzdE5vPTE4OCZ0YWJsZT1jc19iYnNfZGF0YV9uZXcmY29kZT1zdWIwNmImc2VhcmNoX2l0ZW09JnNlYXJjaF9vcmRlcj0mdXJsPXN1YjA2YiZrZXl2YWx1ZT1zdWIwNiZiYnNfbWFsbmFtZT0=',
    'aWR4PTM2Mjcmc3RhcnRQYWdlPTAmbGlzdE5vPTE4NyZ0YWJsZT1jc19iYnNfZGF0YV9uZXcmY29kZT1zdWIwNmImc2VhcmNoX2l0ZW09JnNlYXJjaF9vcmRlcj0mdXJsPXN1YjA2YiZrZXl2YWx1ZT1zdWIwNiZiYnNfbWFsbmFtZT0=',
    'aWR4PTM2MDEmc3RhcnRQYWdlPTAmbGlzdE5vPTE4NiZ0YWJsZT1jc19iYnNfZGF0YV9uZXcmY29kZT1zdWIwNmImc2VhcmNoX2l0ZW09JnNlYXJjaF9vcmRlcj0mdXJsPXN1YjA2YiZrZXl2YWx1ZT1zdWIwNiZiYnNfbWFsbmFtZT0=',
    'aWR4PTM2MDAmc3RhcnRQYWdlPTAmbGlzdE5vPTE4NSZ0YWJsZT1jc19iYnNfZGF0YV9uZXcmY29kZT1zdWIwNmImc2VhcmNoX2l0ZW09JnNlYXJjaF9vcmRlcj0mdXJsPXN1YjA2YiZrZXl2YWx1ZT1zdWIwNiZiYnNfbWFsbmFtZT0='];

  function giantFit() {
    var g = document.getElementById('giant'); if (!g) return;
    var vw = window.innerWidth;
    g.style.fontSize = '100px';
    var w = g.getBoundingClientRect().width;
    if (!w) return;
    var target = vw * (vw < 641 ? 1.26 : 1.2);
    g.style.fontSize = (100 * target / w).toFixed(1) + 'px';
  }

  var story = document.getElementById('story');
  var scenes = [].slice.call(document.querySelectorAll('.scene'));
  var N = scenes.length, cur = -1;

  function wordsInto(el, t) {
    var k = 0;
    t.split(' ').forEach(function (w, wi) {
      if (wi) { el.appendChild(document.createTextNode(' ')); k++; }
      var ws = document.createElement('span'); ws.className = 'w';
      for (var j = 0; j < w.length; j++, k++) {
        var s = document.createElement('span'); s.className = 'ch';
        s.textContent = w[j];
        s.style.transitionDelay = (k * 0.026) + 's';
        ws.appendChild(s);
      }
      el.appendChild(ws);
    });
  }
  window.GW_WORDS = wordsInto;

  function splitLines(root) {
    [].forEach.call(root.querySelectorAll('.ln'), function (ln) {
      if (ln.id === 'lampLine' || ln.dataset.split) return;
      ln.dataset.split = 1;
      var t = ln.textContent; ln.textContent = '';
      wordsInto(ln, t);
    });
  }
  scenes.forEach(splitLines);

  function storyProgress() {
    var r = story.getBoundingClientRect();
    var h = story.offsetHeight - window.innerHeight;
    return Math.max(0, Math.min(1, -r.top / Math.max(1, h)));
  }

  function setScenes(p) {
    var x = p * N, idx = Math.min(N - 1, Math.floor(x)), f = x - idx;
    var fadeStart = 0.62;
    for (var i = 0; i < N; i++) {
      var s = scenes[i], o = 0;
      if (i === idx) o = idx === N - 1 ? 1 : (f < fadeStart ? 1 : 1 - (f - fadeStart) / (1 - fadeStart));
      else if (i === idx + 1) o = f < fadeStart ? 0 : (f - fadeStart) / (1 - fadeStart);
      if (i === 0) o = idx === 0 ? 1 : 0;
      s.style.opacity = o.toFixed(3);
      s.classList.toggle('vis', o > 0.001);
    }
    var active = (f >= fadeStart + (1 - fadeStart) * 0.5 && idx < N - 1) ? idx + 1 : idx;
    if (active !== cur) {
      if (cur >= 0) scenes[cur].classList.remove('on');
      cur = active;
      scenes[cur].classList.add('on');
      requestAnimationFrame(function () { scenes[cur].classList.add('play'); });
    }
    if (window.GW_LAMP) window.GW_LAMP.setVisible(idx === 0);
  }

  var chs = document.getElementById('chs');
  var track = document.getElementById('track');
  var chapEls = [].slice.call(document.querySelectorAll('.chap'));
  var wide = false, trackW = 0;

  function layoutTrack() {
    wide = window.innerWidth > 1024;
    if (!wide) { chs.style.height = ''; track.style.transform = ''; return; }
    trackW = track.scrollWidth;
    chs.style.height = (trackW - window.innerWidth + window.innerHeight) + 'px';
  }

  function trackScroll() {
    if (!wide) return;
    var r = chs.getBoundingClientRect();
    var max = trackW - window.innerWidth;
    var p = Math.max(0, Math.min(max, -r.top));
    track.style.transform = 'translate3d(' + (-p) + 'px,0,0)';
    var lab = 'NOW';
    for (var i = 0; i < chapEls.length; i++) if (chapEls[i].offsetLeft - p <= window.innerWidth * 0.35) lab = chapEls[i].querySelector('.ch-en').textContent;
    var pb = document.getElementById('pinBar');
    if (pb && pb.dataset.label !== lab) { pb.dataset.label = lab; fillBar(pb); }
  }

  function headerTheme() {
    var y = 32, theme = 'dark';
    var sr = story.getBoundingClientRect();
    if (sr.bottom > y) {
      theme = cur === N - 1 ? 'lite' : 'dark';
    } else if (wide && chs.getBoundingClientRect().top <= y && chs.getBoundingClientRect().bottom > y) {
      var x0 = window.innerWidth * 0.5;
      for (var i = 0; i < chapEls.length; i++) {
        var cr = chapEls[i].getBoundingClientRect();
        if (cr.left <= x0 && cr.right > x0) { theme = chapEls[i].dataset.theme; break; }
      }
    } else {
      var els = document.elementsFromPoint ? document.elementsFromPoint(window.innerWidth / 2, y + 8) : [];
      var sec = null;
      for (var j = 0; j < els.length; j++) { if (!hd.contains(els[j])) { sec = els[j].closest('[data-theme]'); if (sec) break; } }
      theme = sec ? sec.dataset.theme : 'dark';
    }
    hd.classList.toggle('lite', theme === 'lite');
    hd.classList.toggle('ink', theme === 'light');
  }

  function onScroll() { setScenes(storyProgress()); trackScroll(); headerTheme(); }

  function sectorPhoto(n) {
    var P = '../assets-shared/';
    var places = (n.places || []).join(' ');
    var byPlace = FAC.filter(function (f) { return f.img && (places.indexOf(f.name) > -1 || (n.title || '').indexOf(f.name) > -1); })[0];
    if (byPlace) return P + 'img/' + byPlace.img + '.jpg';
    var s = (n.sectors || []).join(' ') + ' ' + (n.title || '');
    if (/수소|에너지|LNG/.test(s)) return P + 'img/sc-energy.jpg';
    if (/반도체/.test(s)) return P + 'img/gn-semi.jpg';
    if (/모빌리티|전기차|자동차/.test(s)) return P + 'photo/tank-s.jpg';
    if (/의료|헬스/.test(s)) return P + 'photo/lab2-s.jpg';
    if (/바이오/.test(s)) return P + 'photo/fab-s.jpg';
    if (/정보보호|보안|ICT|소프트웨어|데이터/.test(s)) return P + 'img/wj-openlab.jpg';
    return P + 'photo/center-s.jpg';
  }

  function renderNow() {
    var lv = GW.live().sort(GW.byDeadline);
    var withDate = lv.filter(function (n) { return GW.status(n) === 'open'; }).length;
    document.getElementById('nowTx').textContent = '오늘 기준 신청할 수 있는 공고는 ' + lv.length + '건입니다. 마감일이 있는 ' + withDate + '건을 먼저, 상시 모집은 그다음에 놓았습니다.';
    document.getElementById('nowCards').innerHTML = lv.map(function (n) {
      var b = GW.badge(n);
      return '<a class="card" href="' + esc(n.url) + '" target="_blank" rel="noopener">' +
        '<img src="' + sectorPhoto(n) + '" alt="" loading="lazy">' +
        '<span class="dday ' + (b.cls === 'urgent' ? 'urgent' : '') + '">' + esc(b.text) + '</span>' +
        '<span class="cap"><b>' + esc(n.short || n.title) + '</b><span>' + esc((n.no ? n.no + ' · ' : '') + GW.deadlineText(n)) + '</span></span></a>';
    }).join('');
  }

  function renderPlace() {
    var cities = [];
    FAC.forEach(function (f) { if (cities.indexOf(f.city) < 0) cities.push(f.city); });
    document.getElementById('placeTx').textContent = cities.map(function (c) { return c.replace(/(시|군)$/, ''); }).join('·') + ', ' + cities.length + '개 시군에 있는 강원테크노파크 시설 ' + FAC.length + '곳입니다.';
    document.getElementById('placeCards').innerHTML = FAC.map(function (f) {
      var href = U + 'pageview.php?url=sub04c&keyvalue=sub04';
      if (!f.img) {
        return '<a class="card noimg" href="' + href + '" target="_blank" rel="noopener"><span class="ttl">' + esc(f.name) + '</span>' +
          '<span class="cap"><b>' + esc(f.city + ' · ' + f.name) + '</b><span>' + esc([f.area, f.scale].filter(Boolean).join(' · ')) + '</span></span></a>';
      }
      return '<a class="card" href="' + href + '" target="_blank" rel="noopener"><img src="../assets-shared/img/' + f.img + '.jpg" alt="' + esc(f.name) + ' 건물 사진" loading="lazy">' +
        '<span class="cap"><b>' + esc(f.city + ' · ' + f.name) + '</b><span>' + esc([f.scale, f.use].filter(Boolean).join(' · ')) + '</span></span></a>';
    }).join('');
  }

  function renderNews() {
    document.getElementById('newsCards').innerHTML = (B.news || []).slice(0, 5).map(function (n, i) {
      return '<a class="card" href="' + U + 'bbsNew_view.php?bbs_data=' + NEWS_Q[i] + '||" target="_blank" rel="noopener"><img src="../assets-shared/photo/news-' + (i + 1) + '.jpg" alt="" loading="lazy">' +
        '<span class="cap"><b>' + esc(n.title) + '</b><span>' + esc(n.date.replace(/-/g, '.')) + '</span></span></a>';
    }).join('');
  }

  function renderContact() {
    var addr = B.address || '';
    document.getElementById('ctTb').innerHTML =
      '<dt>강원테크노파크</dt><dd>' + esc(addr) + '</dd>' +
      '<dt>대표번호</dt><dd><a href="tel:' + esc(B.phone) + '">' + esc(B.phone) + '</a></dd>' +
      '<dt>시설</dt><dd>춘천 · 강릉 · 원주 · 삼척 · 태백 · 홍천</dd>';
    document.getElementById('ftAddr').innerHTML = esc(addr) + '<br>대표번호 ' + esc(B.phone);
    document.getElementById('ftLinks').innerHTML = (B.systems || []).map(function (s) {
      return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + '</a></li>';
    }).join('');
  }

  function fillBar(b) {
    var l = b.dataset.label, h = '';
    for (var i = 0; i < 16; i++) h += '<span>' + l + ' ↑</span>';
    b.innerHTML = h;
  }
  function fillBars() { [].forEach.call(document.querySelectorAll('.bar-t'), fillBar); }

  function goTo(id) {
    var el = document.getElementById(id);
    if (!el) return false;
    var y;
    if (el.classList.contains('scene')) {
      var i = scenes.indexOf(el);
      y = story.offsetTop + (story.offsetHeight - window.innerHeight) * (i + 0.3) / N;
    } else if (el.classList.contains('chap') && wide) {
      y = chs.offsetTop + el.offsetLeft;
    } else {
      y = el.getBoundingClientRect().top + window.scrollY - (el.classList.contains('chap') ? 0 : 0);
    }
    window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    return true;
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!id || id === 'top') { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
    if (goTo(id)) e.preventDefault();
  });

  renderNow(); renderPlace(); renderNews(); renderContact(); fillBars();

  var ticking = false;
  function req() { if (ticking) return; ticking = true; requestAnimationFrame(function () { ticking = false; onScroll(); }); }
  window.addEventListener('scroll', req, { passive: true });
  var rt = 0, lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      if (window.innerWidth !== lastW) { lastW = window.innerWidth; giantFit(); }
      layoutTrack(); onScroll();
    }, 200);
  });

  function boot() { giantFit(); layoutTrack(); onScroll(); }
  if (document.fonts && document.fonts.load) {
    Promise.race([document.fonts.load('800 100px "Pretendard Variable"'), new Promise(function (r) { setTimeout(r, 1400); })]).then(boot);
  } else boot();
  boot();
  window.addEventListener('load', function () { layoutTrack(); onScroll(); });
})();
