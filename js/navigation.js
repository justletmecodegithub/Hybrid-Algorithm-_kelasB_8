// js/navigation.js
(function () {
  window.HybridCloud = window.HybridCloud || {};

  function initNavigation() {
    const slides = Array.from(document.querySelectorAll('.presentation-slide'));
    const progress = document.getElementById('deckProgress');
    const counter = document.getElementById('deckCounter');
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');

    const hashId = decodeURIComponent(window.location.hash.slice(1));
    let active = Math.max(0, slides.findIndex(s => s.id === hashId));

    function show(idx) {
      if (idx < 0 || idx >= slides.length) return;
      slides[active].classList.remove('is-active');
      active = idx;
      void slides[active].offsetWidth;
      slides[active].classList.add('is-active');

      if (counter) counter.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      if (progress) progress.style.width = `${((active + 1) / slides.length) * 100}%`;
      if (prevBtn) prevBtn.disabled = active === 0;
      if (nextBtn) nextBtn.disabled = active === slides.length - 1;
      history.replaceState(null, '', `#${slides[active].id}`);

      // Render skor KC saat slide skor aktif
      if (slides[active].id === 'slide-score' && window.HybridCloud?.renderKcScore) {
        window.HybridCloud.renderKcScore();
      }
    }

    slides.forEach((s, i) => s.classList.toggle('is-active', i === active));
    show(active);

    prevBtn?.addEventListener('click', () => show(active - 1));
    nextBtn?.addEventListener('click', () => show(active + 1));

    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const target = document.getElementById(link.getAttribute('href').slice(1));
        const idx = slides.indexOf(target?.closest('.presentation-slide'));
        if (idx >= 0) {
          e.preventDefault();
          show(idx);
        }
      });
    });

    document.querySelectorAll('.explanation-card').forEach(card => {
      card.addEventListener('click', () => card.classList.toggle('is-selected'));
    });

    document.querySelectorAll('.reference-card').forEach(card => {
      card.addEventListener('click', () => card.classList.add('is-selected'));
    });

    window.addEventListener('keydown', e => {
      if (e.target instanceof HTMLElement && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight') show(active + 1);
      if (e.key === 'ArrowLeft') show(active - 1);
    });
  }

  document.addEventListener('DOMContentLoaded', initNavigation);
})();
