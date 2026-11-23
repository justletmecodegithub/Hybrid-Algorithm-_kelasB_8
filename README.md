# Presentasi & Simulator Hybrid Cloud Scheduling: ACO-SA & DMFO-DE
> **Interactive Presentation Deck & Simulation Playground for Hybrid Metaheuristics in Cloud Task Scheduling: Ant Colony Optimization – Simulated Annealing (ACO-SA) & Discrete Moth-Flame Optimization – Differential Evolution (DMFO-DE)**

[![GitHub Pages Deployment](https://img.shields.io/badge/Deploy-GitHub%20Pages-brightgreen?logo=github)](https://pages.github.com/)
[![License: Academic Open Source](https://img.shields.io/badge/License-Academic%20MIT-blue.svg)](LICENSE)
[![Standards: IEEE-754 FP64](https://img.shields.io/badge/Precision-FP64%20IEEE--754-orange.svg)]()
[![Platform: Web Standard](https://img.shields.io/badge/Platform-HTML5%20%7C%20CSS3%20%7C%20ES6+-informational.svg)]()

---

## 1. Deskripsi Proyek

Aplikasi web presentasi interaktif ini dirancang untuk keperluan demo dan pemaparan tugas mata kuliah **Strategi Optimasi Komputasi Awan (SOKA)** yang berfokus pada perbandingan dua algoritma hybrid dalam penjadwalan tugas (*task scheduling*) ke *Virtual Machine* (VM):

1. **ACO-SA (*Ant Colony Optimization – Simulated Annealing*)** — Mensah, Boateng, & Asare (2021); Anoop Kumar (2024).
2. **DMFO-DE (*Discrete Moth-Flame Optimization – Differential Evolution*)** — Ahmed et al. (2021).

Proyek ini memadukan format presentasi *slide* layar penuh dengan simulasi penjadwalan berbasis peramban (*client-side*). Seluruh evaluasi penjadwalan, penggambaran *Gantt Chart* VM, plot kurva konvergensi, dan pengujian *multi-trial* berjalan 100% di sisi klien tanpa dependensi *backend*, sehingga mudah di-*host* di GitHub Pages dan diperluas dengan animasi tambahan.

---

## 2. Fitur Utama

- **Format Presentasi Interaktif Multi-Slide**:
  - *Cover*, daftar isi dengan tautan langsung antar-slide, kartu referensi ilmiah interaktif, bagian formulasi & simulasi, serta kontrol navigasi panah layar dan *keyboard* (`ArrowLeft` / `ArrowRight`).
  - Indikator progres di bagian atas, nomor slide aktif, dan sinkronisasi *hash* URL (`#slide-...`).
  - Efek *hover* dan *click selection* pada kartu penjelasan serta tautan langsung ke publikasi rujukan.
- **Formulasi Matematis & Dataset Minggu 3**:
  - Persamaan *Makespan* ($C_{\max}$) dan *Degree of Imbalance* ($DI$) dirender menggunakan **KaTeX**.
  - Modul dataset terpisah (`week3-dataset.js`) untuk mendefinisikan kapasitas MIPS *Virtual Machine*, biaya per detik, dan beban instruksi (*lengthMI*) tiap *task* pada dataset Minggu 3.
- **Simulator Real-Time Hybrid (`ACO-SA` vs `DMFO-DE`)**:
  - Pemilihan algoritma hybrid aktif, pengaturan ukuran populasi, iterasi maksimum, serta kontrol *Play*, *Step*, dan *Reset*.
  - Menggunakan *Seeded Linear Congruential Generator* (`SeededRNG`) agar eksperimen dapat diulang dengan *seed* yang sama.
  - Telemetri langsung untuk *Best Makespan* dan iterasi berjalan.
- **Visualisasi Canvas & Komparasi Konvergensi**:
  - *Live VM Gantt Schedule* (`gantt-canvas.js`) untuk memvisualisasikan distribusi blok *task* pada masing-masing VM.
  - Grafik konvergensi ganda (`charts.js`) untuk membandingkan lintasan *makespan* terbaik **ACO-SA** dan **DMFO-DE**.
- **Eksperimen Batch Multi-Trial & Ekspor CSV**:
  - Menjalankan beberapa *trial* independen dengan *seed* bervariasi pada konfigurasi populasi dan iterasi yang sama.
  - Menampilkan tabel perbandingan *Makespan* dan selisih ($\Delta$) per *trial*, serta fitur unduh hasil ke berkas `.csv`.
- **Arsitektur Terpisah untuk Pengembangan Animasi**:
  - Dipisah antara markup, *styling* & *keyframes* (`css/styles.css`), logika algoritma, mesin simulasi, visualisasi *canvas*, dan navigasi sehingga penambahan animasi baru tidak mencampuradukkan kode.

---

## 3. Tumpukan Teknologi (Tech Stack)

- **Frontend Core**: HTML5 Semantik, CSS3 Modern, Vanilla JavaScript (ES6+ modular tanpa *bundler*).
- **Styling & Tata Letak**: Tailwind CSS CDN dikombinasikan dengan *custom stylesheet* (`css/styles.css`) dan *staggered animation hooks*.
- **Rendering Persamaan Matematika**: KaTeX (`auto-render`).
- **Visualisasi Grafis**: HTML5 Canvas API (*Gantt Chart* alokasi VM & grafik konvergensi).

---

## 4. Struktur Direktori Proyek

```text
hybrid-cloud-deck/
├── index.html                     # Struktur slide presentasi & kontrol interaktif
├── README.md                      # Dokumentasi proyek & panduan deployment
├── css/
│   └── styles.css                 # Gaya deck, transisi slide, animasi stagger, & kontrol navigasi
└── js/
    ├── data/
    │   └── week3-dataset.js       # Definisi VM, tasks Minggu 3, & fungsi evaluasi penjadwalan
    ├── algorithms/
    │   ├── aco-sa.js              # Implementasi hybrid Ant Colony Optimization + Simulated Annealing
    │   └── dmfo-de.js             # Implementasi hybrid Discrete Moth-Flame + Differential Evolution
    ├── simulation/
    │   └── engine.js              # Seeded LCG RNG & siklus eksekusi simulasi (play/step/pause/reset)
    ├── visualization/
    │   ├── gantt-canvas.js        # Renderer Gantt Chart alokasi task per VM pada HTML5 Canvas
    │   └── charts.js              # Plot komparasi konvergensi ACO-SA vs DMFO-DE
    ├── experiments/
    │   └── runner.js              # Runner batch multi-trial & generator ekspor file CSV
    ├── navigation.js              # Navigasi slide, keyboard shortcut, & interaksi kartu
    └── app.js                     # Orkestrasi UI, telemetri, & sinkronisasi simulasi/tabel
