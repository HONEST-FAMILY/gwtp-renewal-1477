(function () {
  var GW = window.GW, B = window.GW_BASE, F = window.GW_FACILITIES || [];
  var U = 'https://www.gwtp.or.kr/gwtp/';
  var esc = GW.esc;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function $(id) { return document.getElementById(id); }

  var MENU = [
    { t: '공고안내', h: U + 'bbsNew_list.php?code=sub01a&keyvalue=sub01' },
    { t: '사업안내', h: U + 'pageview.php?url=sub02a&keyvalue=sub02' },
    { t: '입주안내', h: U + 'pageview.php?url=sub04a&keyvalue=sub04' },
    { t: '경영공시', h: U + 'bbsNew_list.php?code=sub05a&keyvalue=sub05' },
    { t: 'TP NOW', h: U + 'bbsNew_list.php?code=sub06a&keyvalue=sub06' },
    { t: 'TP소개', h: U + 'pageview.php?url=sub07a&keyvalue=sub07' }
  ];
  var menuHtml = MENU.map(function (m) { return '<li><a href="' + m.h + '" target="_blank" rel="noopener">' + m.t + '</a></li>'; }).join('');
  $('disList').innerHTML = menuHtml;
  $('menuList').innerHTML = menuHtml;

  var NEWS_Q = ['aWR4PTM2NDMmc3RhcnRQYWdlPTAmbGlzdE5vPTE4OSZ0YWJsZT1jc19iYnNfZGF0YV9uZXcmY29kZT1zdWIwNmImc2VhcmNoX2l0ZW09JnNlYXJjaF9vcmRlcj0mdXJsPXN1YjA2YiZrZXl2YWx1ZT1zdWIwNiZiYnNfbWFsbmFtZT0=',
    'aWR4PTM2NDImc3RhcnRQYWdlPTAmbGlzdE5vPTE4OCZ0YWJsZT1jc19iYnNfZGF0YV9uZXcmY29kZT1zdWIwNmImc2VhcmNoX2l0ZW09JnNlYXJjaF9vcmRlcj0mdXJsPXN1YjA2YiZrZXl2YWx1ZT1zdWIwNiZiYnNfbWFsbmFtZT0=',
    'aWR4PTM2Mjcmc3RhcnRQYWdlPTAmbGlzdE5vPTE4NyZ0YWJsZT1jc19iYnNfZGF0YV9uZXcmY29kZT1zdWIwNmImc2VhcmNoX2l0ZW09JnNlYXJjaF9vcmRlcj0mdXJsPXN1YjA2YiZrZXl2YWx1ZT1zdWIwNiZiYnNfbWFsbmFtZT0=',
    'aWR4PTM2MDEmc3RhcnRQYWdlPTAmbGlzdE5vPTE4NiZ0YWJsZT1jc19iYnNfZGF0YV9uZXcmY29kZT1zdWIwNmImc2VhcmNoX2l0ZW09JnNlYXJjaF9vcmRlcj0mdXJsPXN1YjA2YiZrZXl2YWx1ZT1zdWIwNiZiYnNfbWFsbmFtZT0=',
    'aWR4PTM2MDAmc3RhcnRQYWdlPTAmbGlzdE5vPTE4NSZ0YWJsZT1jc19iYnNfZGF0YV9uZXcmY29kZT1zdWIwNmImc2VhcmNoX2l0ZW09JnNlYXJjaF9vcmRlcj0mdXJsPXN1YjA2YiZrZXl2YWx1ZT1zdWIwNiZiYnNfbWFsbmFtZT0='];
  function kDate(s) { var p = s.split('-'); return p[0] + '년 ' + (+p[1]) + '월 ' + (+p[2]) + '일'; }
  $('newsRow').innerHTML = B.news.map(function (n, i) {
    return '<a class="news-it ' + (i % 2 ? 'l' : 's') + '" href="' + U + 'bbsNew_view.php?bbs_data=' + NEWS_Q[i] + '||" target="_blank" rel="noopener">' +
      '<div class="ni"><img src="../assets-shared/photo/news-' + (i + 1) + '.jpg" alt="" loading="lazy"></div>' +
      '<time datetime="' + n.date + '">' + kDate(n.date) + '</time><span>' + esc(n.title) + '</span></a>';
  }).join('');
  $('newsMore').href = B.newsUrl;
  var row = $('newsRow');
  function step(dir) {
    var its = row.querySelectorAll('.news-it'), x = row.scrollLeft, pad = parseFloat(getComputedStyle(row).paddingLeft) || 0;
    var target = null;
    for (var i = 0; i < its.length; i++) {
      var l = its[i].offsetLeft - pad;
      if (dir > 0 && l > x + 4) { target = l; break; }
      if (dir < 0 && l < x - 4) target = l;
    }
    if (target === null) target = dir > 0 ? row.scrollWidth : 0;
    row.scrollTo({ left: target, behavior: reduce ? 'auto' : 'smooth' });
  }
  $('newsPrev').addEventListener('click', function () { step(-1); });
  $('newsNext').addEventListener('click', function () { step(1); });
  function arrows() {
    $('newsPrev').disabled = row.scrollLeft < 4;
    $('newsNext').disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4;
  }
  row.addEventListener('scroll', arrows, { passive: true });
  window.addEventListener('resize', arrows);
  arrows();

  var live = GW.live().slice().sort(GW.byDeadline);
  $('evMore').href = B.listUrl;
  $('evRows').innerHTML = live.slice(0, 8).map(function (n) {
    var b = GW.badge(n);
    var secs = (n.sectors || []).filter(function (s) { return s !== '전 분야'; });
    var sec = secs.length ? secs.join(' · ') : '전 분야';
    var when = b.cls === 'urgent' || b.cls === 'open' ? b.text + ' · ' + GW.fmtShort(n.apply_end) : b.text;
    return '<a class="ev-tr" role="row" href="' + esc(n.url || B.listUrl) + '" target="_blank" rel="noopener">' +
      '<span class="t" role="cell"><i>' + esc(n.no || '') + '</i>' + esc(n.title) + '</span>' +
      '<span class="s" role="cell">' + esc(sec) + '</span>' +
      '<span class="d ' + b.cls + '" role="cell">' + esc(when) + '</span></a>';
  }).join('');

  var cities = [];
  F.forEach(function (f) { if (cities.indexOf(f.city) < 0) cities.push(f.city); });
  $('cardAp').textContent = cities.map(function (c) { return c.replace(/(시|군)$/, ''); }).join('·') + ' ' + cities.length + '개 시군 ' + F.length + '곳에서 임대공장과 사무실, 실험실을 운영합니다.';
  $('cardA').href = U + 'pageview.php?url=sub04a&keyvalue=sub04';
  $('cardB').href = U + 'bbsNew_list.php?code=sub05a&keyvalue=sub05';

  function floorsScale(f) {
    var under = 0, over = 0;
    (f.floors || []).forEach(function (fl) {
      var m = /(지하|지상)\s*(\d+)층/.exec(fl.level || '');
      if (!m) return;
      if (m[1] === '지하') under = Math.max(under, +m[2]); else over = Math.max(over, +m[2]);
    });
    return [under ? '지하 ' + under + '층' : '', over ? '지상 ' + over + '층' : ''].filter(Boolean).join(' · ');
  }
  function scaleText(f) {
    var s = f.scale || floorsScale(f);
    return f.city + (s ? ' · ' + s : '') + (f.area ? ' · ' + f.area.split(' · ')[0] : '');
  }
  $('projList').innerHTML = F.map(function (f, i) {
    var city = f.city.replace(/(시|군)$/, '');
    return '<li data-city="' + city + '" data-img="' + (f.img ? '../assets-shared/img/' + f.img + '.jpg' : '') + '">' +
      '<a href="' + U + 'pageview.php?url=sub04c&keyvalue=sub04" target="_blank" rel="noopener"><span class="n">' + esc(f.name) + '</span><span class="s">' + esc(scaleText(f)) + '</span></a></li>';
  }).join('');
  var seen = {};
  Array.prototype.forEach.call(document.querySelectorAll('#projList li'), function (li) {
    var c = li.getAttribute('data-city');
    if (seen[c]) li.removeAttribute('data-city'); else seen[c] = 1;
  });
  $('projMore').href = U + 'pageview.php?url=sub04c&keyvalue=sub04';

  $('contactP').innerHTML = '대표번호 <a href="tel:' + B.phone + '">' + B.phone + '</a><br>' + esc(B.address);
  $('sysP').innerHTML = B.systems.map(function (s) { return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + '</a>'; }).join(' · ');

  function lis(arr) { return arr.map(function (x) { return '<li><a href="' + U + x[1] + '" target="_blank" rel="noopener">' + x[0] + '</a></li>'; }).join(''); }
  $('ftA').innerHTML = lis([['공지사항', 'bbsNew_list.php?code=sub01a&keyvalue=sub01'], ['모집공고', 'bbsNew_list.php?code=sub01b&keyvalue=sub01'], ['계약공고', 'bbsNew_list.php?code=sub01c&keyvalue=sub01'], ['채용공고', 'bbsNew_list.php?code=sub01d&keyvalue=sub01'], ['타기관소식', 'bbsNew_list.php?code=sub01g&keyvalue=sub01']]);
  $('ftB').innerHTML = lis([['지역사업안내', 'pageview.php?url=sub02a&keyvalue=sub02'], ['장비지원', 'pageview.php?url=sub02c&keyvalue=sub02'], ['입주안내', 'pageview.php?url=sub04a&keyvalue=sub04'], ['입주기업소개', 'pageview.php?url=sub04b&keyvalue=sub04'], ['시설현황', 'pageview.php?url=sub04c&keyvalue=sub04']]);
  $('ftC').innerHTML = lis([['경영공시', 'bbsNew_list.php?code=sub05a&keyvalue=sub05'], ['언론보도', 'bbsNew_list.php?code=sub06b&keyvalue=sub06'], ['연혁', 'pageview.php?url=sub07d&keyvalue=sub07'], ['조직안내', 'pageview.php?url=sub07e&keyvalue=sub07'], ['찾아오시는 길', 'pageview.php?url=sub07g&keyvalue=sub07']]);
  $('ftTel').innerHTML = '대표번호 <a href="tel:' + B.phone + '">' + B.phone + '</a>';
  $('ftAddr').textContent = B.address;

  var hov = $('hoverImg');
  if (fine) {
    var hx = 0, hy = 0, tx = 0, ty = 0, on = false, raf = 0, last = 0;
    function loop(now) {
      var dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      var k = reduce ? 1 : 1 - Math.exp(-dt * 15);
      hx += (tx - hx) * k; hy += (ty - hy) * k;
      hov.style.transform = 'translate3d(' + hx.toFixed(1) + 'px,' + hy.toFixed(1) + 'px,0)';
      if (on || Math.abs(tx - hx) > 0.5) raf = requestAnimationFrame(loop); else raf = 0;
    }
    var list = $('projList');
    list.addEventListener('mousemove', function (e) {
      tx = e.clientX + 28; ty = e.clientY - 100;
      if (tx + 300 > window.innerWidth - 8) tx = e.clientX - 328;
      if (!raf) { last = 0; raf = requestAnimationFrame(loop); }
    });
    list.addEventListener('mouseover', function (e) {
      var li = e.target.closest('li');
      if (!li) return;
      var src = li.getAttribute('data-img');
      if (!src) { hov.classList.remove('on'); on = false; return; }
      if (hov.getAttribute('src') !== src) hov.src = src;
      if (!on) { hx = tx = e.clientX + 28; hy = ty = e.clientY - 100; }
      on = true; hov.classList.add('on');
      if (!raf) { last = 0; raf = requestAnimationFrame(loop); }
    });
    list.addEventListener('mouseleave', function () { on = false; hov.classList.remove('on'); });
  }

  var menu = $('menu'), form = $('searchForm'), q = $('q'), res = $('searchRes');
  function openMenu(search) {
    menu.hidden = false; document.body.classList.add('lock');
    $('menuOpen').setAttribute('aria-expanded', 'true');
    form.hidden = !search; res.hidden = true;
    $('menuLbl').textContent = search ? '검색' : '메뉴';
    if (search) setTimeout(function () { q.focus(); }, 30); else $('menuClose').focus();
  }
  function closeMenu() {
    menu.hidden = true; document.body.classList.remove('lock');
    $('menuOpen').setAttribute('aria-expanded', 'false');
  }
  $('menuOpen').addEventListener('click', function () { openMenu(false); });
  $('searchOpen').addEventListener('click', function () { openMenu(true); });
  $('menuClose').addEventListener('click', closeMenu);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) closeMenu(); });
  function runSearch(word) {
    word = (word || '').trim();
    if (!word) { res.hidden = true; return; }
    var r = GW.search(word), out = [];
    r.notices.slice(0, 6).forEach(function (n) { out.push('<li><a href="' + esc(n.url || B.listUrl) + '" target="_blank" rel="noopener"><i>' + esc(GW.badge(n).text) + '</i>' + esc(n.title) + '</a></li>'); });
    r.places.slice(0, 3).forEach(function (p) { out.push('<li><a href="#places"><i>시설</i>' + esc(p.name) + ' · ' + esc(p.city) + '</a></li>'); });
    r.systems.slice(0, 3).forEach(function (s) { out.push('<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener"><i>사이트</i>' + esc(s.name) + '</a></li>'); });
    res.innerHTML = out.length ? out.join('') : '<li class="none">"' + esc(word) + '"에 맞는 공고·시설이 없습니다.</li>';
    res.hidden = false;
  }
  var qT;
  q.addEventListener('input', function () { clearTimeout(qT); qT = setTimeout(function () { runSearch(q.value); }, 120); });
  form.addEventListener('submit', function (e) { e.preventDefault(); runSearch(q.value); });
  res.addEventListener('click', function (e) { var a = e.target.closest('a'); if (a && a.getAttribute('href') === '#places') closeMenu(); });
  $('ftForm').addEventListener('submit', function (e) { e.preventDefault(); openMenu(true); q.value = $('ftQ').value; runSearch(q.value); });
})();
