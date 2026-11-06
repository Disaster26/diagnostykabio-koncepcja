(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rok = document.getElementById('rok');
  if (rok) rok.textContent = new Date().getFullYear();

  /* menu mobilne */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu-mob');
  function zamknij() { menu.hidden = true; burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Otwórz menu'); }
  burger.addEventListener('click', function () {
    var otw = menu.hidden;
    menu.hidden = !otw;
    burger.setAttribute('aria-expanded', String(otw));
    burger.setAttribute('aria-label', otw ? 'Zamknij menu' : 'Otwórz menu');
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) zamknij(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { zamknij(); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 1180 && !menu.hidden) zamknij(); });

  /* aktywna pozycja menu = bieżąca sekcja */
  var linki = [].slice.call(document.querySelectorAll('.nav a'));
  var sekcje = linki.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function spy() {
    var y = window.scrollY + window.innerHeight * 0.35, akt = -1;
    sekcje.forEach(function (s, i) { if (s && s.offsetTop <= y) akt = i; });
    linki.forEach(function (a, i) { a.classList.toggle('on', i === akt); if (i === akt) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  window.addEventListener('scroll', function () { window.requestAnimationFrame(spy); }, { passive: true });
  spy();

  /* galeria certyfikatów: palec, mysz, strzałki, klawiatura */
  var tor = document.getElementById('rz-tor');
  if (tor) {
    var btn = document.querySelectorAll('[data-rz]');
    function krok() { var k = tor.querySelector('.rz'); return k.getBoundingClientRect().width + 20; }
    function stan() {
      btn[0].disabled = tor.scrollLeft < 4;
      btn[1].disabled = tor.scrollLeft > tor.scrollWidth - tor.clientWidth - 4;
    }
    function idz(d) { tor.scrollBy({ left: d * krok(), behavior: reduce ? 'auto' : 'smooth' }); }
    [].forEach.call(btn, function (b) { b.addEventListener('click', function () { idz(+b.dataset.rz); }); });
    tor.addEventListener('scroll', function () { window.requestAnimationFrame(stan); }, { passive: true });
    tor.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); idz(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); idz(-1); }
    });
    var p0 = null, sl = 0, ruch = false;
    tor.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      p0 = e.clientX; sl = tor.scrollLeft; ruch = false;
      tor.setPointerCapture(e.pointerId);
    });
    tor.addEventListener('pointermove', function (e) {
      if (p0 === null) return;
      var dx = e.clientX - p0;
      if (Math.abs(dx) > 4) { ruch = true; tor.classList.add('ciag'); }
      if (ruch) tor.scrollLeft = sl - dx;
    });
    function koniec() {
      if (p0 === null) return;
      p0 = null;
      if (ruch) { tor.classList.remove('ciag'); }
    }
    tor.addEventListener('pointerup', koniec);
    tor.addEventListener('pointercancel', koniec);
    tor.addEventListener('click', function (e) { if (ruch) { e.preventDefault(); e.stopPropagation(); ruch = false; } }, true);
    window.addEventListener('resize', stan);
    stan();
  }

  /* formularz pokazowy - bez wysyłki */
  var form = document.getElementById('form');
  var info = document.getElementById('form-info');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.imie.value.trim() || !form.tel.value.trim() || !form.zgoda.checked) {
      info.className = 'form-info blad';
      info.textContent = 'Podaj imię, numer telefonu i zaznacz zgodę, żebyśmy mogli oddzwonić.';
      return;
    }
    info.className = 'form-info ok';
    info.textContent = 'Dziękujemy. To wersja pokazowa - na docelowej stronie wiadomość trafi od razu do biura.';
    form.reset();
  });

  /* dolny pasek na telefonie: dopiero po przewinięciu za przycisk w hero */
  var pasek = document.getElementById('mob-pasek');
  var cta = document.getElementById('hero-cta');
  var kontakt = document.getElementById('kontakt');
  if ('IntersectionObserver' in window && pasek && cta) {
    var zaCta = false, wKontakcie = false;
    function ustaw() {
      var w = zaCta && !wKontakcie;
      pasek.classList.toggle('widac', w);
      pasek.setAttribute('aria-hidden', String(!w));
      pasek.querySelectorAll('a').forEach(function (a) { a.tabIndex = w ? 0 : -1; });
    }
    new IntersectionObserver(function (en) { zaCta = !en[0].isIntersecting && en[0].boundingClientRect.top < 0; ustaw(); }).observe(cta);
    new IntersectionObserver(function (en) { wKontakcie = en[0].isIntersecting; ustaw(); }, { threshold: 0.1 }).observe(kontakt);
  }
})();
