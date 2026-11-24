// js/animation.js — Animasi visualisasi algoritma (beat steps & node highlight)
(function () {
  window.HybridCloud = window.HybridCloud || {};

  /* -----------------------------------------------------------------------
     1. BEAT CONTROLLER
     Mengelola langkah animasi (beat) di dalam satu slide.
     Digunakan untuk slide walkthrough ACO-SA dan DMFO-DE.
  ----------------------------------------------------------------------- */
  class BeatController {
    /**
     * @param {string}   slideid   – id elemen section slide
     * @param {number}   nBeats    – jumlah langkah
     * @param {Function} renderFn  – dipanggil dengan (beatIndex) setiap render
     */
    constructor(slideid, nBeats, renderFn) {
      this.slide    = document.getElementById(slideid);
      this.nBeats   = nBeats;
      this.renderFn = renderFn;
      this.beat     = 0;

      if (!this.slide) return;

      this._buildBar();
      this._bindKeys();
      this.render(0);
    }

    _buildBar() {
      const bar = this.slide.querySelector('.beats-bar');
      if (!bar) return;
      bar.innerHTML = '';
      for (let i = 0; i < this.nBeats; i++) {
        const btn = document.createElement('button');
        btn.className = 'beat-dot';
        btn.textContent = i + 1;
        btn.setAttribute('aria-label', `Langkah ${i + 1}`);
        btn.addEventListener('click', () => this.goto(i));
        bar.appendChild(btn);
      }
    }

    _syncBar() {
      const dots = this.slide?.querySelectorAll('.beat-dot');
      if (!dots) return;
      dots.forEach((d, i) => {
        d.classList.toggle('done', i < this.beat);
        d.classList.toggle('cur',  i === this.beat);
      });
    }

    goto(b) {
      this.beat = Math.max(0, Math.min(this.nBeats - 1, b));
      this.render(this.beat);
    }

    next() { if (this.beat < this.nBeats - 1) this.goto(this.beat + 1); }
    prev() { if (this.beat > 0)               this.goto(this.beat - 1); }

    render(b) {
      this._syncBar();
      this.renderFn(b);
    }

    _bindKeys() {
      // navigasi keyboard hanya ketika slide ini aktif
      document.addEventListener('keydown', e => {
        if (!this.slide?.classList.contains('is-active')) return;
        if (/INPUT|SELECT|TEXTAREA/.test(e.target?.tagName)) return;
        if (e.key === 'ArrowRight') { e.stopPropagation(); this.next(); }
        if (e.key === 'ArrowLeft')  { e.stopPropagation(); this.prev(); }
      }, true);   // capture supaya mendahului navigation.js
    }
  }

  /* -----------------------------------------------------------------------
     2. ALGO NODE HIGHLIGHTER
     Menyala/matikan class .active pada node-node flowchart algoritma.
  ----------------------------------------------------------------------- */
  function highlightNodes(containerSel, activeIds = []) {
    const container = document.querySelector(containerSel);
    if (!container) return;
    container.querySelectorAll('[data-node]').forEach(el => {
      const id = el.dataset.node;
      el.classList.toggle('active',    activeIds.includes(id));
      el.classList.toggle('done-node', !activeIds.includes(id) && el.classList.contains('was-active'));
    });
    activeIds.forEach(id => {
      const el = container.querySelector(`[data-node="${id}"]`);
      if (el) el.classList.add('was-active');
    });
  }

  /* -----------------------------------------------------------------------
     3. ANIMATED METRIC BARS
     Menset lebar bar setelah slide aktif, memicu transisi CSS.
  ----------------------------------------------------------------------- */
  function animateMetricBars(containerSel) {
    const container = document.querySelector(containerSel);
    if (!container) return;
    // Set width ke 0 dulu (untuk re-animate kalau slide diakses ulang)
    container.querySelectorAll('.metric-bar-fill').forEach(bar => {
      bar.style.width = '0';
    });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      container.querySelectorAll('.metric-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.pct || '0%';
      });
    }));
  }

  /* -----------------------------------------------------------------------
     4. SCENE: ACO-SA WALKTHROUGH (slide #slide-aco-walk)
  ----------------------------------------------------------------------- */
  const ACO_STEPS = [
    {
      title  : 'Inisialisasi',
      log    : ['Feromon awal τ = 1.0 untuk semua pasangan (task, VM)', 'Populasi semut siap di-spawn'],
      nodes  : ['init'],
      arrows : []
    },
    {
      title  : 'Bangun solusi semut',
      log    : ['Setiap semut memilih VM berdasarkan τ^α × η^β', 'η = kecepatan VM / panjang task (heuristik)'],
      nodes  : ['build'],
      arrows : ['init-build']
    },
    {
      title  : 'Refined oleh SA',
      log    : ['Setiap solusi semut diperhalus 5 iterasi SA', 'Terima perbaikan atau tolak dengan P = exp(−Δ/T)'],
      nodes  : ['sa'],
      arrows : ['build-sa']
    },
    {
      title  : 'Evaporasi & deposit feromon',
      log    : ['τ = (1 − ρ)×τ  — evaporasi (ρ = 0.25)', 'τ[task][bestVm] += 1/makespan_terbaik'],
      nodes  : ['phero'],
      arrows : ['sa-phero']
    },
    {
      title  : 'Update solusi global terbaik',
      log    : ['Simpan jadwal terbaik dari iterasi ini', 'Lanjut ke iterasi berikutnya sampai maxIter'],
      nodes  : ['best'],
      arrows : ['phero-best']
    }
  ];

  function renderAcoWalk(b) {
    const step = ACO_STEPS[b] || ACO_STEPS[0];

    // Log
    const logEl = document.getElementById('aco-step-log');
    if (logEl) {
      logEl.innerHTML = step.log
        .map((l, i) => `<div class="${i === step.log.length - 1 ? 'last' : ''}">${l}</div>`)
        .join('');
    }

    // Title
    const titleEl = document.getElementById('aco-step-title');
    if (titleEl) titleEl.textContent = `Langkah ${b + 1}: ${step.title}`;

    // Highlight nodes
    highlightNodes('#aco-walk-flow', step.nodes);

    // Arrows
    document.querySelectorAll('#aco-walk-flow .algo-arrow').forEach(a => {
      a.classList.toggle('active', step.arrows.includes(a.dataset.arrow || ''));
    });
  }

  /* -----------------------------------------------------------------------
     5. SCENE: DMFO-DE WALKTHROUGH (slide #slide-dmfo-walk)
  ----------------------------------------------------------------------- */
  const DMFO_STEPS = [
    {
      title  : 'Inisialisasi populasi ngengat',
      log    : ['Setiap ngengat = solusi acak (pemetaan task→VM)', 'Hitung fitness (makespan) tiap ngengat'],
      nodes  : ['init'],
      arrows : []
    },
    {
      title  : 'Kurangi jumlah nyala api',
      log    : ['flames = max(1, popSize − iter × (popSize−1)/maxIter)', 'Api makin sedikit seiring konvergensi'],
      nodes  : ['flame'],
      arrows : ['init-flame']
    },
    {
      title  : 'Trajektori spiral MFO',
      log    : ['nextPos = dist × exp(b×t) × cos(2π×t) + flamePos', 'Eksplorasi ruang solusi secara spiral'],
      nodes  : ['spiral'],
      arrows : ['flame-spiral']
    },
    {
      title  : 'Mutasi & crossover DE',
      log    : ['trial = best + F × (a − c)  jika rand < CR', 'Kombinasi posisi spiral + operator DE/rand/1/bin'],
      nodes  : ['de'],
      arrows : ['spiral-de']
    },
    {
      title  : 'Seleksi greedy',
      log    : ['Terima trial hanya jika makespan ≤ fitness ngengat saat ini', 'Update solusi global terbaik bila perlu'],
      nodes  : ['select'],
      arrows : ['de-select']
    }
  ];

  function renderDmfoWalk(b) {
    const step = DMFO_STEPS[b] || DMFO_STEPS[0];

    const logEl = document.getElementById('dmfo-step-log');
    if (logEl) {
      logEl.innerHTML = step.log
        .map((l, i) => `<div class="${i === step.log.length - 1 ? 'last' : ''}">${l}</div>`)
        .join('');
    }

    const titleEl = document.getElementById('dmfo-step-title');
    if (titleEl) titleEl.textContent = `Langkah ${b + 1}: ${step.title}`;

    highlightNodes('#dmfo-walk-flow', step.nodes);

    document.querySelectorAll('#dmfo-walk-flow .algo-arrow').forEach(a => {
      a.classList.toggle('active', step.arrows.includes(a.dataset.arrow || ''));
    });
  }

  /* -----------------------------------------------------------------------
     6. INIT ketika DOM siap
  ----------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    // Beat controller untuk walkthrough ACO-SA
    if (document.getElementById('slide-aco-walk')) {
      window._acoWalkCtrl = new BeatController('slide-aco-walk', ACO_STEPS.length, renderAcoWalk);
    }

    // Beat controller untuk walkthrough DMFO-DE
    if (document.getElementById('slide-dmfo-walk')) {
      window._dmfoWalkCtrl = new BeatController('slide-dmfo-walk', DMFO_STEPS.length, renderDmfoWalk);
    }

    // Animasi bar metric tiap kali slide perbandingan aktif
    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          const el = m.target;
          if (el.id === 'slide-benchmark' && el.classList.contains('is-active')) {
            animateMetricBars('#slide-benchmark');
          }
        }
      });
    });

    document.querySelectorAll('.presentation-slide').forEach(slide => {
      observer.observe(slide, { attributes: true });
    });

    // Reset beat ke 0 setiap kali slide walkthrough menjadi aktif
    ['slide-aco-walk', 'slide-dmfo-walk'].forEach(sid => {
      const slide = document.getElementById(sid);
      if (!slide) return;
      new MutationObserver(muts => {
        muts.forEach(m => {
          if (m.type === 'attributes' && m.attributeName === 'class' && slide.classList.contains('is-active')) {
            const ctrl = sid === 'slide-aco-walk' ? window._acoWalkCtrl : window._dmfoWalkCtrl;
            ctrl?.goto(0);
          }
        });
      }).observe(slide, { attributes: true });
    });
  });

  window.HybridCloud.BeatController      = BeatController;
  window.HybridCloud.highlightNodes      = highlightNodes;
  window.HybridCloud.animateMetricBars   = animateMetricBars;
})();
