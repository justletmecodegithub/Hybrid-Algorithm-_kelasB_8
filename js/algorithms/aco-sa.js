// js/algorithms/aco-sa.js
(function () {
  window.HybridCloud = window.HybridCloud || {};

  class AcoSaScheduler {
    constructor(config) {
      this.dataset = config.dataset;
      this.popSize = config.popSize || 24;
      this.maxIter = config.maxIter || 60;
      this.rng = config.rng || Math.random;
      this.alpha = 1.0;
      this.beta = 1.5;
      this.rho = 0.25;
      this.reset();
    }

    reset() {
      const numTasks = this.dataset.tasks.length;
      const numVms = this.dataset.vms.length;
      this.pheromone = Array.from({ length: numTasks }, () => new Array(numVms).fill(1.0));
      this.currentIter = 0;
      this.bestSchedule = null;
      this.bestMetrics = { makespan: Infinity, totalCost: Infinity, vmBlocks: [] };
      this.history = [];
    }

    buildAntSolution() {
      const numTasks = this.dataset.tasks.length;
      const numVms = this.dataset.vms.length;
      const schedule = [];

      for (let t = 0; t < numTasks; t++) {
        const mi = this.dataset.tasks[t].lengthMI;
        const weights = [];
        let sumW = 0;

        for (let v = 0; v < numVms; v++) {
          const heuristic = this.dataset.vms[v].mips / mi;
          const w = Math.pow(this.pheromone[t][v], this.alpha) * Math.pow(heuristic, this.beta);
          weights.push(w);
          sumW += w;
        }

        let r = this.rng() * sumW;
        let chosen = numVms - 1;
        for (let v = 0; v < numVms; v++) {
          r -= weights[v];
          if (r <= 0) {
            chosen = v;
            break;
          }
        }
        schedule.push(chosen);
      }
      return schedule;
    }

    // Tahap Simulated Annealing untuk memperbaiki solusi semut
    simulatedAnnealingRefine(initSchedule, temp) {
      let current = [...initSchedule];
      let currentEval = window.HybridCloud.evaluateSchedule(current, this.dataset);
      const numTasks = this.dataset.tasks.length;
      const numVms = this.dataset.vms.length;

      for (let k = 0; k < 5; k++) {
        const candidate = [...current];
        const idx = Math.floor(this.rng() * numTasks);
        candidate[idx] = Math.floor(this.rng() * numVms);
        const candEval = window.HybridCloud.evaluateSchedule(candidate, this.dataset);
        const delta = candEval.makespan - currentEval.makespan;

        if (delta <= 0 || this.rng() < Math.exp(-delta / Math.max(temp, 1e-4))) {
          current = candidate;
          currentEval = candEval;
        }
      }
      return { schedule: current, evalData: currentEval };
    }

    step() {
      if (this.currentIter >= this.maxIter) return this.getState();

      const progress = this.currentIter / Math.max(1, this.maxIter - 1);
      const temp = 25 * Math.pow(0.05, progress);
      let iterBestSchedule = null;
      let iterBestEval = { makespan: Infinity };

      for (let i = 0; i < this.popSize; i++) {
        const rawSched = this.buildAntSolution();
        const refined = this.simulatedAnnealingRefine(rawSched, temp);
        if (refined.evalData.makespan < iterBestEval.makespan) {
          iterBestEval = refined.evalData;
          iterBestSchedule = refined.schedule;
        }
      }

      // Evaporasi & deposit feromon
      for (let t = 0; t < this.pheromone.length; t++) {
        for (let v = 0; v < this.pheromone[t].length; v++) {
          this.pheromone[t][v] *= (1 - this.rho);
        }
        const bestVm = iterBestSchedule[t];
        this.pheromone[t][bestVm] += 1 / Math.max(iterBestEval.makespan, 1e-6);
      }

      if (iterBestEval.makespan < this.bestMetrics.makespan) {
        this.bestMetrics = iterBestEval;
        this.bestSchedule = [...iterBestSchedule];
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
        algorithm: 'ACO-SA',
        iteration: this.currentIter,
        maxIter: this.maxIter,
        bestMakespan: this.bestMetrics.makespan,
        totalCost: this.bestMetrics.totalCost,
        vmBlocks: this.bestMetrics.vmBlocks || [],
        history: [...this.history]
      };
    }
  }

  window.HybridCloud.AcoSaScheduler = AcoSaScheduler;
})();
