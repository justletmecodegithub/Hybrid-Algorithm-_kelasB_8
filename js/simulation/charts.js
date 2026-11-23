// js/visualization/charts.js
(function () {
  window.HybridCloud = window.HybridCloud || {};

  class DualHybridChart {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas ? canvas.getContext('2d') : null;
    }

    drawSeries(hist, color, maxIter, minV, maxV, pad, pw, ph) {
      if (!hist || !hist.length) return;
      const ctx = this.ctx;
      const span = Math.max(maxV - minV, 1e-6);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      hist.forEach((val, i) => {
        const x = pad.l + (i / Math.max(maxIter - 1, 1)) * pw;
        const y = pad.t + ph - ((val - minV) / span) * ph;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    render(acoHist, dmfoHist, maxIter) {
      if (!this.canvas || !this.ctx) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      const all = [...acoHist, ...dmfoHist];
      if (!all.length) return;

      const minV = Math.min(...all);
      const maxV = Math.max(...all);
      const pad = { l: 48, r: 16, t: 24, b: 24 };
      const pw = w - pad.l - pad.r;
      const ph = h - pad.t - pad.b;

      this.drawSeries(acoHist, '#bef264', maxIter, minV, maxV, pad, pw, ph);
      this.drawSeries(dmfoHist, '#38bdf8', maxIter, minV, maxV, pad, pw, ph);

      ctx.font = '11px monospace';
      ctx.fillStyle = '#bef264';
      ctx.fillText('ACO-SA', pad.l, 15);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('DMFO-DE', pad.l + 75, 15);
    }
  }

  window.HybridCloud.DualHybridChart = DualHybridChart;
})();
