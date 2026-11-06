export function renderLanding(brand, icon) {
  const features = [
    [
      "wallet",
      "Uangmu, tercatat rapi.",
      "Uang saku, hasil freelance, sampai jajan sore. Catat pemasukan dan pengeluaran dalam satu tempat.",
    ],
    [
      "scan",
      "Struk jadi catatan.",
      "Pilih foto struk, periksa hasil pembacaan, lalu simpan. Lebih sedikit mengetik, lebih mudah konsisten.",
    ],
    [
      "chart",
      "Kenali pola belanjamu.",
      "Lihat arus keuangan dan pembagian kategori. Cari tahu apa yang paling banyak mengambil ruang.",
    ],
    [
      "report",
      "Anggaran punya arah.",
      "Beri batas bulanan untuk tiap kategori, lalu pantau penggunaannya sesuai kebutuhanmu.",
    ],
    [
      "book",
      "Belajar dari keseharian.",
      "Baca materi singkat dan refleksi yang dekat dengan kebiasaan keuanganmu sendiri.",
    ],
    [
      "shield",
      "Ruang pribadi untukmu.",
      "Transaksi dan anggaran tersimpan per akun. Foto struk dibaca di perangkatmu.",
    ],
  ];
  const faq = [
    [
      "Apa itu MAPAN?",
      "MAPAN adalah Mahasiswa Paham Keuangan: tempat mencatat transaksi, mengatur anggaran, dan memahami kebiasaan keuangan sehari-hari.",
    ],
    [
      "Harus menghubungkan rekening bank?",
      "Tidak. Kamu mencatat transaksi secara manual atau melalui foto struk. Saldo dihitung dari transaksi yang kamu masukkan, bukan saldo rekening bank.",
    ],
    [
      "Bagaimana cara scan struk?",
      "Buka dashboard, pilih Scan struk, lalu pilih foto JPG, PNG, atau WEBP. Periksa nominal dan tanggal hasil pembacaan sebelum menyimpan transaksi.",
    ],
    [
      "Bisa mencoba sebelum membuat akun?",
      "Bisa. Pilih Lihat contoh untuk menjelajahi dashboard dengan data ilustrasi. Perubahan pada mode contoh tidak disimpan ke akun pribadi.",
    ],
  ];
  return `<div class="marketing">
    <header class="mk-nav mk-wrap">${brand()}<nav aria-label="Navigasi utama"><a href="#fitur">Fitur</a><a href="#cara-kerja">Cara kerja</a><a href="#faq">Tanya jawab</a></nav><div class="mk-nav-actions"><a href="#masuk">Masuk</a><a class="btn" href="#daftar">Daftar gratis ${icon("arrow")}</a></div></header>
    <main><div class="mk-top"><section class="mk-hero mk-wrap"><div class="mk-hero-copy"><h1>Kuliah jalan.<br><mark>Keuangan,</mark><br>kamu yang pegang.</h1><p>Dari uang saku sampai akhir bulan. Catat, atur, dan pahami keuanganmu—tanpa harus jago hitung-hitungan.</p><div class="mk-actions"><a class="btn" href="#daftar">Mulai jadi mapan ${icon("arrow")}</a><button class="btn secondary" data-demo>Lihat contoh</button></div><span class="mk-hero-foot">Dibuat untuk mahasiswa. Mulai dari keseharianmu.</span></div>
    <div class="mk-hero-visual"><div class="mk-orbit" aria-hidden="true"></div><img class="mk-student" src="hero-student.png" alt="Mahasiswi melihat ponsel sambil tersenyum" width="1536" height="1024" fetchpriority="high"><div class="mk-star" aria-hidden="true">✦</div><div class="mk-pocket"><span>DOMPET MAHASISWA</span><div class="mk-pocket-chip">${icon("wallet")}</div><strong>MAPAN</strong><small>Catat. Pahami. Tumbuh.</small></div><div class="mk-floating-balance"><span>Saldo tersedia ${icon("wallet")}</span><strong>Rp2.008.000</strong><small><i></i> Contoh saldo · data ilustrasi</small></div><div class="mk-floating-note">${icon("check")} Satu catatan hari ini.</div></div></section></div>
    <section class="mk-use mk-wrap"><p>Teman keuangan di setiap fase kehidupan kampus.</p><div><span>${icon("food")} Uang makan</span><span>${icon("wallet")} Biaya kos</span><span>${icon("book")} Kebutuhan kuliah</span><span>${icon("arrows")} Uang saku</span><span>${icon("leaf")} Rencana kecilmu</span></div></section>
    <section class="mk-intro mk-wrap" aria-labelledby="intro-title"><div class="mk-ledger"><div class="mk-ledger-heading"><span>Keuanganmu, lebih kelihatan.</span><span class="mk-demo-tag">Contoh tampilan</span></div><h2 id="intro-title">Nggak lagi bertanya,<br>“uangku ke mana, ya?”</h2><div class="mk-ledger-chart"><div><small>Saldo tersedia</small><strong>Rp2.008.000</strong></div><svg viewBox="0 0 460 140" role="img" aria-label="Ilustrasi grafik saldo"><path d="M0 120H460 M0 75H460 M0 30H460" stroke="#e0e8db" fill="none"/><path d="M0 114C30 114 30 78 65 87S105 118 140 81S180 87 210 49S250 79 285 44S320 65 355 27S400 55 460 10" stroke="#214d3b" stroke-width="3" fill="none"/><circle cx="355" cy="27" r="6" fill="#c9ed60" stroke="#214d3b" stroke-width="2"/></svg><div class="mk-ledger-days"><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span></div></div></div><div class="mk-side-notes"><article class="mk-green-note"><span>BUKAN CUMA MENCATAT ${icon("arrow")}</span><strong>Lebih paham.<br>Lebih terarah.</strong><p>Kenali kebiasaanmu, lalu pilih langkah berikutnya.</p></article><article class="mk-week-note"><strong>7 hari</strong><span>Satu kesempatan baru untuk refleksi keuanganmu.</span><a href="#laporan" data-demo class="link-btn">Jelajahi laporan ${icon("arrow")}</a></article></div></section>
    <section class="mk-features mk-wrap" id="fitur"><div class="mk-section-title"><span>KEBIASAAN BAIK, DIMULAI DARI SINI</span><h2>Alat sederhana.<br>Pengaruhnya ke keseharianmu.</h2><p>Semua yang kamu butuhkan untuk mulai mengelola uang sendiri.</p></div><div class="mk-feature-grid">${features.map(([i, t, d], n) => `<article class="mk-feature mk-feature-${n}"><div class="mk-feature-top"><span>${icon(i)}</span><b>0${n + 1}</b></div><h3>${t}</h3><p>${d}</p>${n === 1 ? '<div class="mk-receipt" aria-hidden="true"><span>KANTIN KAMPUS</span><i></i><div>Makan siang <b>25.000</b></div><div>TOTAL <b>Rp25.000</b></div></div>' : ""}</article>`).join("")}</div></section>
    <section class="mk-how mk-wrap" id="cara-kerja"><div><span class="mk-kicker">MULAI TANPA RIBET</span><h2>Jadi lebih mapan,<br>satu catatan demi<br>satu catatan.</h2><a class="btn" href="#daftar">Buat akunmu ${icon("arrow")}</a></div><ol>${[
      [
        "Buat ruang keuanganmu.",
        "Daftar dengan email, verifikasi, lalu masuk ke dashboard pribadimu.",
      ],
      [
        "Catat yang masuk dan keluar.",
        "Isi transaksi atau scan struk. Mulai dari uang saku dan pengeluaran hari ini.",
      ],
      [
        "Cek sebentar, pahami polanya.",
        "Lihat grafik, atur anggaran, dan luangkan waktu untuk refleksi mingguan.",
      ],
    ]
      .map(
        ([t, d], i) =>
          `<li><span>0${i + 1}</span><div><h3>${t}</h3><p>${d}</p></div></li>`,
      )
      .join("")}</ol></section>
    <section class="mk-faq mk-wrap" id="faq"><div><span class="mk-kicker">SEBELUM MULAI</span><h2>Masih penasaran?</h2><p>Kenalan sedikit lagi dengan MAPAN.</p></div><div>${faq.map(([q, a]) => `<details><summary>${q}<span aria-hidden="true">+</span></summary><p>${a}</p></details>`).join("")}</div></section>
    <section class="mk-cta mk-wrap"><div><span>UNTUK DIRIMU HARI INI DAN NANTI</span><h2>Mulai paham uangmu.<br>Mulai jadi <em>mapan.</em></h2></div><a class="btn" href="#daftar">Mulai sekarang ${icon("arrow")}</a><div class="mk-cta-ring" aria-hidden="true"></div></section></main>
    <footer class="mk-footer mk-wrap">${brand()}<span>© ${new Date().getFullYear()} MAPAN</span><button class="link-btn" data-privacy>Privasi & data</button></footer></div>`;
}
