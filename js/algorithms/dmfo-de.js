// js/algorithms/dmfo-de.js
(function () {
  window.HybridCloud = window.HybridCloud || {};

  class DmfoDeScheduler {
    constructor(config) {
      this.dataset = config.dataset;
      this.popSize = config.popSize || 24;
      this.maxIter = config.maxIter || 60;
      this.rng = config.rng || Math.random;
      this.F = 0.6;
      this.CR = 0.7;
      this.reset();
    }

    clampVm(val) {
      const n = this.dataset.vms.length;
      return ((Math.round(val) % n) + n) % n;
    }

    reset() {
      const numTasks = this.dataset.tasks.length;
      const numVms = this.dataset.vms.length;
      this.moths = [];
      this.bestSchedule = null;
      this.bestMetrics = { makespan: Infinity, totalCost: Infinity, vmBlocks: [] };
      this.history = [];

      for (let i = 0; i < this.popSize; i++) {
        const pos = Array.from({ length: numTasks }, () => Math.floor(this.rng() * numVms));
        const ev = window.HybridCloud.evaluateSchedule(pos, this.dataset);
        this.moths.push({ pos, fitness: ev.makespan, evalData: ev });
        if (ev.makespan < this.bestMetrics.makespan) {
          this.bestMetrics = ev;
          this.bestSchedule = [...pos];
        }
      }
    }

    step() {
      if (this.currentIter >= this.maxIter) return this.getState();

      const numTasks = this.dataset.tasks.length;
      const flameCount = Math.max(1, Math.round(this.popSize - this.currentIter * ((this.popSize - 1) / Math.max(1, this.maxIter))));
      const flames = [...this.moths].sort((a, b) => a.fitness - b.fitness).slice(0, flameCount);

      for (let i = 0; i < this.popSize; i++) {
        const moth = this.moths[i];
        const targetFlame = flames[Math.min(i, flames.length - 1)];

        // 1. Spiral trajectory MFO
        const b = 1;
        const tParam = (this.rng() - 0.5) * 2;
        const spiralPos = moth.pos.map((val, d) => {
          const dist = Math.abs(targetFlame.pos[d] - val);
          const nextVal = dist * Math.exp(b * tParam) * Math.cos(2 * Math.PI * tParam) + targetFlame.pos[d];
          return this.clampVm(nextVal);
        });

        // 2. Mutasi & Crossover Differential Evolution (DE/rand/1/bin)
        const a = this.moths[Math.floor(this.rng() * this.popSize)].pos;
        const c = this.moths[Math.floor(this.rng() * this.popSize)].pos;
        const jRand = Math.floor(this.rng() * numTasks);

        const trialPos = spiralPos.map((val, d) => {
          if (this.rng() < this.CR || d === jRand) {
            return this.clampVm(this.bestSchedule[d] + this.F * (a[d] - c[d]));
          }
          return val;
        });

        const trialEval = window.HybridCloud.evaluateSchedule(trialPos, this.dataset);
        if (trialEval.makespan <= moth.fitness) {
          moth.pos = trialPos;
          moth.fitness = trialEval.makespan;
          moth.evalData = trialEval;

          if (trialEval.makespan < this.bestMetrics.makespan) {
            this.bestMetrics = trialEval;
            this.bestSchedule = [...trialPos];
          }
        }
      }

      this.currentIter++;
      this.history.push(this.bestMetrics.makespan);
      return this.getState();
    }

    runAll() {
      this.reset();
      while (this.currentIter < this.maxIter) this.step();
      return this.getState();
    }

    getState() {
      return {
        algorithm: 'DMFO-DE',
        iteration: this.currentIter,
        maxIter: this.maxIter,
        bestMakespan: this.bestMetrics.makespan,
        totalCost: this.bestMetrics.totalCost,
        vmBlocks: this.bestMetrics.vmBlocks || [],
        history: [...this.history]
      };
    }
  }

  window.HybridCloud.DmfoDeScheduler = DmfoDeScheduler;
})();
