// js/quiz.js — Knowledge Check interaktif (terinspirasi referensi Pak Fuad Minggu 12)
(function () {
  window.HybridCloud = window.HybridCloud || {};

  const quizScore = {};   // { kcId: true/false }

  /**
   * Inisialisasi semua .kc-quiz yang ada di dokumen.
   * Setiap quiz perlu atribut data-kc="<id unik>".
   */
  function initAllQuizzes() {
    document.querySelectorAll('.kc-quiz').forEach(quiz => {
      const id  = quiz.dataset.kc;
      const fb  = quiz.querySelector('.kc-fb');
      quiz.querySelectorAll('.kc-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          if (quiz.dataset.answered) return;   // sudah dijawab, kunci
          quiz.dataset.answered = '1';

          const ok = btn.dataset.ok === '1';
          if (!(id in quizScore)) quizScore[id] = ok;

          // Warna semua tombol
          quiz.querySelectorAll('.kc-opt').forEach(o => {
            o.classList.remove('correct', 'wrong');
            if (o.dataset.ok === '1') o.classList.add('correct');
            else                      o.classList.add('wrong');
          });

          // Feedback
          if (fb) {
            fb.innerHTML = '<b>' + (ok ? '✓ Benar.' : '✗ Belum tepat.') + '</b> ' + btn.dataset.fb;
            fb.classList.add('show');
          }
        });
      });
    });
  }

  /** Hitung skor total dari semua KC yang sudah dijawab. */
  function getScore() {
    const vals = Object.values(quizScore);
    return { correct: vals.filter(Boolean).length, total: vals.length };
  }

  /** Render skor akhir ke elemen #kc-score-display dan rekap jika ada. */
  function renderFinalScore() {
    const el = document.getElementById('kc-score-display');
    if (!el) return;
    const { correct, total } = getScore();
    el.textContent = total ? `${correct} / ${total}` : '–';

    // Warna skor
    el.style.color = correct === total ? 'var(--accent)' : correct === 0 ? '#ef4444' : '#38bdf8';

    // Rekap per soal
    const recap = document.getElementById('kc-score-recap');
    if (!recap) return;
    const qs = {
      kc1: 'ACO-SA: SA membantu keluar dari optimum lokal',
      kc2: 'DMFO-DE: api berkurang → eksploitasi meningkat'
    };
    recap.innerHTML = Object.entries(qs).map(([id, label]) => {
      const ok = quizScore[id];
      const color = ok === true ? '#22c55e' : ok === false ? '#ef4444' : '#94a3b8';
      const icon  = ok === true ? '✓' : ok === false ? '✗' : '○';
      return `<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:10px;background:var(--bg-surface);border:1px solid rgba(148,163,184,.2)">
        <span style="font-size:1.3rem;color:${color}">${icon}</span>
        <span style="font-size:0.95rem">${label}</span>
      </div>`;
    }).join('');
  }

  window.HybridCloud.initQuizzes    = initAllQuizzes;
  window.HybridCloud.getKcScore     = getScore;
  window.HybridCloud.renderKcScore  = renderFinalScore;

  document.addEventListener('DOMContentLoaded', initAllQuizzes);
})();
