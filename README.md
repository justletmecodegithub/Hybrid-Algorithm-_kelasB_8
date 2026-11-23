# Hybrid-Algorithm-_kelasB_8
# Hybrid Cloud Task Scheduling: ACO-SA vs DMFO-DE

Aplikasi web presentasi interaktif berbasis HTML5, CSS, dan Vanilla JavaScript untuk membandingkan dua algoritma hybrid—**ACO-SA** (*Ant Colony Optimization – Simulated Annealing*) dan **DMFO-DE** (*Discrete Moth-Flame Optimization – Differential Evolution*)—pada permasalahan *cloud task scheduling* menggunakan dataset Minggu 3 mata kuliah **Strategi Optimasi Komputasi Awan (SOKA)**.

Dirancang modular tanpa *bundler* sehingga langsung dapat di-*host* di **GitHub Pages (`github.io`)** dan mudah diperluas dengan animasi tambahan.

---

## Struktur Direktori

```text
hybrid-cloud-deck/
├── index.html
├── README.md
├── css/
│   └── styles.css
└── js/
    ├── data/
    │   └── week3-dataset.js
    ├── algorithms/
    │   ├── aco-sa.js
    │   └── dmfo-de.js
    ├── simulation/
    │   └── engine.js
    ├── visualization/
    │   ├── gantt-canvas.js
    │   └── charts.js
    ├── experiments/
    │   └── runner.js
    ├── navigation.js
    └── app.js
