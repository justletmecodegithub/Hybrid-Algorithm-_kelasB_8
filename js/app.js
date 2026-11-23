// js/app.js
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const dataset = window.HybridCloud.WEEK3_DATASET;
    const engine = new window.HybridCloud.CloudSimEngine();
    const gantt = new window.HybridCloud.GanttVisualizer(document.getElementById('ganttCanvas'), dataset);
    const dualChart = new window.HybridCloud.DualHybridChart(document.getElementById('dualConvCanvas'));
    const runner = new window.HybridCloud.HybridBenchmarkRunner(dataset);

    let lastAcoHist = [];
    let lastDmfoHist = [];

    function syncDualChart() {
      const r1 = new window.HybridCloud.SeededRNG(engine.seed);
      const r2 = new window.HybridCloud.SeededRNG(engine.seed);
      lastAcoHist = new window.HybridCloud.AcoSaScheduler({
        dataset, popSize: engine.popSize, maxIter: engine.maxIter, rng: () => r1.random()
      }).runAll().history;
      lastDmfoHist = new window.HybridCloud.DmfoDeScheduler({
        dataset, popSize: engine.popSize, maxIter: engine.maxIter, rng: () => r2.random()
      }).runAll().history;
      dualChart.render(lastAcoHist, lastDmfoHist, engine.maxIter);
    }

    engine.onUpdate(state => {
      document.getElementById('telBest').textContent = `${state.bestMakespan.toFixed(2)}s`;
      document.getElementById('telIter').textContent = `${state.iteration} / ${state.maxIter}`;
      gantt.render(state);
    });

    document.getElementById('selAlgo')?.addEventListener('change', e => {
      engine.algorithm = e.target.value;
      engine.init();
    });

    document.getElementById('rngPop')?.addEventListener('input', e => {
      engine.popSize = parseInt(e.target.value, 10);
      document.getElementById('lblPop').textContent = engine.popSize;
      engine.init();
      syncDualChart();
    });

    document.getElementById('rngIter')?.addEventListener('input', e => {
      engine.maxIter = parseInt(e.target.value, 10);
      document.getElementById('lblIter').textContent = engine.maxIter;
      engine.init();
      syncDualChart();
    });

    document.getElementById('btnPlay')?.addEventListener('click', () => {
      engine.isRunning ? engine.pause() : engine.play();
    });
    document.getElementById('btnStep')?.addEventListener('click', () => engine.step());
    document.getElementById('btnReset')?.addEventListener('click', () => engine.init());

    document.getElementById('btnRunBatch')?.addEventListener('click', () => {
      const rows = runner.run(10, engine.popSize, engine.maxIter, engine.seed);
      const tbody = document.getElementById('batchTableBody');
      tbody.innerHTML = rows.map(r => `
        <tr class="border-t border-outline">
          <td class="py-2 px-4">#${r.trial}</td>
          <td class="py-2 px-4 font-mono text-xs">${r.seed}</td>
          <td class="py-2 px-4 font-mono text-primary">${r.acoMakespan.toFixed(3)}s</td>
          <td class="py-2 px-4 font-mono text-sky-400">${r.dmfoMakespan.toFixed(3)}s</td>
          <td class="py-2 px-4 font-mono text-xs">${r.diff.toFixed(3)}s</td>
          <td class="py-2 px-4 font-semibold">${r.winner}</td>
        </tr>
      `).join('');

      const acoWins = rows.filter(r => r.winner === 'ACO-SA').length;
      const dmfoWins = rows.filter(r => r.winner === 'DMFO-DE').length;
      document.getElementById('batchSummary').textContent =
        `10 trials selesai — ACO-SA unggul: ${acoWins}, DMFO-DE unggul: ${dmfoWins}, Seri: ${10 - acoWins - dmfoWins}`;
    });

    document.getElementById('btnExportCsv')?.addEventListener('click', () => runner.exportCsv());

    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ]
      });
    }

    syncDualChart();
  });
})();
