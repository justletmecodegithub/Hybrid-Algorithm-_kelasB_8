// js/simulation/engine.js
(function () {
  window.HybridCloud = window.HybridCloud || {};

  class SeededRNG {
    constructor(seed = 2026) {
      this.state = seed >>> 0;
    }
    random() {
      this.state = (this.state * 1664525 + 1013904223) % 4294967296;
      return this.state / 4294967296;
    }
  }

  class CloudSimEngine {
    constructor() {
      this.dataset = window.HybridCloud.WEEK3_DATASET;
      this.algorithm = 'acosa';
      this.popSize = 24;
      this.maxIter = 60;
      this.seed = 2026;
      this.timer = null;
      this.isRunning = false;
      this.listeners = [];
      this.init();
    }

    onUpdate(fn) {
      this.listeners.push(fn);
    }

    emit(state) {
      this.listeners.forEach(fn => fn(state));
    }

    init() {
      this.pause();
      const rng = new SeededRNG(this.seed);
      const cfg = {
        dataset: this.dataset,
        popSize: this.popSize,
        maxIter: this.maxIter,
        rng: () => rng.random()
      };
      this.scheduler = this.algorithm === 'acosa'
        ? new window.HybridCloud.AcoSaScheduler(cfg)
        : new window.HybridCloud.DmfoDeScheduler(cfg);
      this.emit(this.scheduler.getState());
    }

    step() {
      if (this.scheduler.currentIter >= this.maxIter) {
        this.pause();
        return;
      }
      const state = this.scheduler.step();
      this.emit(state);
      if (this.scheduler.currentIter >= this.maxIter) this.pause();
    }

    play() {
      if (this.isRunning) return;
      if (this.scheduler.currentIter >= this.maxIter) this.init();
      this.isRunning = true;
      const tick = () => {
        if (!this.isRunning) return;
        this.step();
        if (this.isRunning) this.timer = setTimeout(tick, 75);
      };
      tick();
    }

    pause() {
      this.isRunning = false;
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  window.HybridCloud.SeededRNG = SeededRNG;
  window.HybridCloud.CloudSimEngine = CloudSimEngine;
})();
