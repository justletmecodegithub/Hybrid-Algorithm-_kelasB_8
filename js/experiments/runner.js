// js/experiments/runner.js
(function () {
  window.HybridCloud = window.HybridCloud || {};

  class HybridBenchmarkRunner {
    constructor(dataset) {
      this.dataset = dataset;
      this.rows = [];
    }

    run(trials = 10, popSize = 24, maxIter = 60, baseSeed = 2026) {
      this.rows = [];
      for (let t = 1; t <= trials; t++) {
        const seed = baseSeed + t * 37;
        const r1 = new window.HybridCloud.SeededRNG(seed);
        const r2 = new window.HybridCloud.SeededRNG(seed);

        const acoState = new window.HybridCloud.AcoSaScheduler({
          dataset: this.dataset, popSize, maxIter, rng: () => r1.random()
        }).runAll();

        const dmfoState = new window.HybridCloud.DmfoDeScheduler({
          dataset: this.dataset, popSize, maxIter, rng: () => r2.random()
        }).runAll();

        const diff = acoState.bestMakespan - dmfoState.bestMakespan;
        const winner = Math.abs(diff) < 1e-9 ? 'Seri' : (acoState.bestMakespan < dmfoState.bestMakespan ? 'ACO-SA' : 'DMFO-DE');

        this.rows.push({
          trial: t,
          seed,
          acoMakespan: acoState.bestMakespan,
          dmfoMakespan: dmfoState.bestMakespan,
          diff,
          winner
        });
      }
      return this.rows;
    }

    exportCsv() {
      if (!this.rows.length) return;
      const header = ['Trial', 'Seed', 'ACO_SA_Makespan', 'DMFO_DE_Makespan', 'Delta', 'Winner'];
      const lines = this.rows.map(r => [
        r.trial, r.seed, r.acoMakespan.toFixed(4), r.dmfoMakespan.toFixed(4), r.diff.toFixed(4), r.winner
      ].join(','));
      const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hybrid_acosa_vs_dmfode.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  window.HybridCloud.HybridBenchmarkRunner = HybridBenchmarkRunner;
})();
