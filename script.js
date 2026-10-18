(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $('#yr').textContent = new Date().getFullYear();

  // currency pair ticker
  var pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD', 'USD/CAD', 'AUD/USD', 'NZD/USD', 'GBP/JPY', 'EUR/GBP', 'USD/CHF'];
  var th = '';
  for (var r = 0; r < 2; r++) pairs.forEach(function (p) { th += '<span>' + p + '</span>'; });
  $('#track').innerHTML = th;

  // hero candlesticks: [wickTop, wickBottom, bodyTop, bodyHeight, up]
  var cd = [[420,560,450,70,0],[400,540,430,80,1],[440,570,470,60,0],[380,520,410,90,1],[350,500,380,95,1],[370,490,390,70,0],[320,470,350,100,1],[300,440,330,85,1],[330,450,350,70,0],[270,420,300,95,1],[240,390,270,100,1],[260,380,280,70,0],[200,360,230,105,1],[170,330,200,110,1]];
  var ch = '';
  cd.forEach(function (c, i) {
    var x = 60 + i * 80;
    ch += '<g class="c ' + (c[4] ? 'u' : 'd') + '" style="--i:' + i + '"><line x1="' + x + '" y1="' + c[0] + '" x2="' + x + '" y2="' + c[1] + '"/><rect x="' + (x - 12) + '" y="' + c[2] + '" width="24" height="' + c[3] + '"/></g>';
  });
  $('#candles').innerHTML = ch;

  // scroll reveal
  var els = $$('.rv,.step');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); var w = e.target.querySelector('.rv-wipe'); if (w) setTimeout(function () { w.classList.add('in'); }, 250); io.unobserve(e.target); }
      });
    }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else { $$('.rv,.rv-wipe,.step').forEach(function (el) { el.classList.add('in'); }); }

  // counters
  function count(el) {
    var end = parseInt(el.dataset.count, 10), suf = el.dataset.suffix || '', dur = 1600, s = null;
    if (reduce) { el.textContent = end + suf; return; }
    function step(ts) {
      if (!s) s = ts;
      var p = Math.min((ts - s) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: .6 });
    $$('[data-count]').forEach(function (el) { el.textContent = '0' + (el.dataset.suffix || ''); co.observe(el); });
  }

  // gallery tabs
  var tabs = $$('.tab'), panels = $$('.panel');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
      panels.forEach(function (p) { p.hidden = p.id !== t.getAttribute('aria-controls'); });
    });
  });

  // lightbox for gallery images
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<button type="button" aria-label="Close">&times;</button><img alt="">';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img');
  function closeLb() { lb.classList.remove('open'); }
  document.addEventListener('click', function (e) {
    var im = e.target.closest ? e.target.closest('.shot img, .sig img') : null;
    if (im) { lbImg.src = im.currentSrc || im.src; lbImg.alt = im.alt; lb.classList.add('open'); return; }
    if (e.target === lb || e.target.tagName === 'BUTTON' && lb.contains(e.target)) closeLb();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });

  // FAQ accordion (one open at a time)
  var qas = $$('.qa');
  qas.forEach(function (qa) {
    var btn = qa.querySelector('.q');
    btn.addEventListener('click', function () {
      var open = qa.classList.contains('open');
      qas.forEach(function (o) { o.classList.remove('open'); o.querySelector('.q').setAttribute('aria-expanded', 'false'); });
      if (!open) { qa.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });

  // scroll progress, header, parallax, sticky cta
  var prog = $('#progress'), hdr = $('#hdr'), cand = $('#candles'), stk = $('#sticky'), fin = $('#join'), ticking = false;
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    hdr.classList.toggle('scrolled', y > 40);
    if (!reduce && y < window.innerHeight * 1.2) cand.style.transform = 'translateY(' + (y * .22) + 'px)';
    var fr = fin.getBoundingClientRect();
    stk.classList.toggle('show', y > window.innerHeight * .7 && fr.top > window.innerHeight * .6);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
})();