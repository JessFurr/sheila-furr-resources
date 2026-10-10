// Gentle scroll-in: fade/slide elements up as they enter the viewport.
(function () {
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var sel = '.section-head, .phase-card, .faq-card, .svc-col, .cred-stack, .cta-band, .article-card, .video-card, .approach, .bio-body, .fact-card, .crossroads-wrap, .stay-map, .compare, .res-flow, .book-group';
  var els = Array.prototype.slice.call(document.querySelectorAll(sel)).filter(function (e) { return !e.closest('.hero, .page-hero'); });
  var vh = window.innerHeight;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(function (e) {
    var sibs = Array.prototype.filter.call(e.parentNode.children, function (x) { return els.indexOf(x) > -1; });
    e.style.transitionDelay = Math.min(sibs.indexOf(e), 4) * 0.09 + 's';
    e.classList.add('rv');
    if (e.getBoundingClientRect().top < vh * 0.9) { e.style.transitionDelay = '0s'; e.classList.add('in'); }
    else io.observe(e);
  });
  document.documentElement.classList.add('reveal-on');
})();
