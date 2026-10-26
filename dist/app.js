import { createClient, createWorker } from "./vendor.js";
import { config } from "./config.js";
import {
  categories,
  rupiah,
  today,
  summarize,
  validTransaction,
  parseReceipt,
  csv,
} from "./finance.js";

const db =
  config.url && config.key ? createClient(config.url, config.key) : null;
const app = document.querySelector("#app"),
  modal = document.querySelector("#modal");
const icons = {
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  wallet:
    "M20 7H4V4h14v3 M4 7a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16V7 M20 11h-6v5h6 M16 13.5h.1",
  arrows: "M4 7h14 m-4-4 4 4-4 4 M20 17H6 m4-4-4 4 4 4",
  scan: "M8 3H3v5 M16 3h5v5 M21 16v5h-5 M8 21H3v-5 M7 9h10 M7 13h7 M7 17h4",
  chart: "M4 3v17h17 M8 15v-4 M13 15V7 M18 15V4",
  book: "M12 5C9 3 5 3 3 4v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1v15",
  report: "M6 3h9l4 4v14H6z M14 3v5h5 M9 12h7 M9 16h7",
  arrow: "M4 12h16 m-6-6 6 6-6 6",
  plus: "M12 5v14 M5 12h14",
  down: "M7 5v14 m-4-4 4 4 4-4 M17 5v14",
  up: "M7 19V5 m-4 4 4-4 4 4 M17 19V5",
  check: "m5 12 4 4L19 6",
  shield: "M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6z m-4 9 3 3 5-6",
  bulb: "M9 18h6 M10 21h4 M8 15c0-2-3-3-3-6a7 7 0 0 1 14 0c0 3-3 4-3 6z",
  logout: "M10 4H4v16h6 M9 12h12 m-4-4 4 4-4 4",
  close: "m6 6 12 12 M6 18 18 6",
  food: "M5 3v6c0 3 6 3 6 0V3 M8 3v18 M18 3c-4 4-4 8 0 8v10 M18 3v8",
  edit: "m4 16 11-11 4 4-11 11-5 1z m9-9 4 4",
  trash: "M3 6h18 M8 6V3h8v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7",
  download: "M12 3v12 m-4-4 4 4 4-4 M4 16v5h16v-5",
  calendar: "M4 5h16v16H4z M8 3v4 M16 3v4 M4 10h16",
  leaf: "M20 3C8 2 2 7 5 15c5 9 15 1 15-12Z M6 17l9-9",
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" aria-hidden="true" viewBox="0 0 24 24"><path d="${icons[name] || icons.wallet}"/></svg>`;
const brand = () =>
  '<a href="#" class="brand" aria-label="MAPAN beranda"><img src="icon.svg" alt=""><span>MAPAN<small>MAHASISWA PAHAM KEUANGAN</small></span></a>';
const escape = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const shortDate = (date) =>
  new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(
    new Date(date + "T12:00:00"),
  );
const monthLabel = () =>
  new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(
    new Date(),
  );
let user = null,
  rows = [],
  budgets = [],
  demo = false,
  page = "dashboard",
  period = "month",
  toastTimer,
  loadVersion = 0;
const colors = [
  "#305b49",
  "#b8cd8b",
  "#e2c99d",
  "#8ba997",
  "#dce5d1",
  "#adab86",
  "#d6c5b5",
];

function toast(message) {
  const t = document.querySelector("#toast");
  t.textContent = message;
  t.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("visible"), 4500);
}
function showModal(html) {
  modal.innerHTML = html;
  modal.showModal();
  modal
    .querySelector("[data-close]")
    ?.addEventListener("click", () => modal.close());
}
function modalHead(title, sub = "") {
  return `<div class="modal-heading"><h2>${title}</h2><button class="icon-btn" data-close aria-label="Tutup">${icon("close")}</button></div><p class="modal-sub">${sub}</p>`;
}
function errorMessage(e) {
  if (e?.message?.includes("Invalid login"))
    return "Email atau kata sandi belum sesuai. Periksa kembali, ya.";
  if (e?.message?.includes("Email not confirmed"))
    return "Verifikasi emailmu terlebih dahulu lewat tautan di kotak masuk.";
  if (e?.message?.includes("rate limit"))
    return "Terlalu banyak percobaan. Tunggu sebentar sebelum mencoba lagi.";
  if (e?.message?.includes("Failed to fetch"))
    return "Koneksi terputus. Periksa internetmu dan coba lagi.";
  return e?.message || "Belum berhasil. Silakan coba lagi.";
}
const monthRows = () =>
  rows.filter((t) => t.date.startsWith(today().slice(0, 7)));
const periodRows = () =>
  period === "all"
    ? rows
    : period === "month"
      ? monthRows()
      : rows.filter((t) => t.date >= daysAgo(6) && t.date <= today());
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function sampleRows() {
  return [
    {
      description: "Uang saku bulanan",
      type: "income",
      category: "Lainnya",
      amount: 2500000,
      date: daysAgo(6),
    },
    {
      description: "Makan siang di kantin",
      type: "expense",
      category: categories[0],
      amount: 25000,
      date: today(),
    },
    {
      description: "Kopi bareng teman",
      type: "expense",
      category: categories[0],
      amount: 18000,
      date: today(),
    },
    {
      description: "Ojek ke kampus",
      type: "expense",
      category: categories[1],
      amount: 15000,
      date: daysAgo(1),
    },
    {
      description: "Belanja kebutuhan kos",
      type: "expense",
      category: categories[2],
      amount: 87000,
      date: daysAgo(2),
    },
    {
      description: "Bayar kos",
      type: "expense",
      category: categories[3],
      amount: 650000,
      date: daysAgo(5),
    },
    {
      description: "Cetak tugas kuliah",
      type: "expense",
      category: categories[4],
      amount: 25000,
      date: daysAgo(3),
    },
    {
      description: "Freelance desain",
      type: "income",
      category: categories[6],
      amount: 350000,
      date: daysAgo(2),
    },
    {
      description: "Makan malam",
      type: "expense",
      category: categories[0],
      amount: 22000,
      date: daysAgo(4),
    },
  ]
    .map((t, i) => ({ ...t, id: "demo-" + i }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function landing() {
  app.innerHTML = `<div class="section-wrap"><header class="public-nav">${brand()}<nav class="navlinks"><a href="#fitur">Fitur MAPAN</a><a href="#cara-kerja">Cara kerja</a><button class="link-btn" data-demo>Lihat contoh ${icon("arrow")}</button></nav><div class="nav-actions"><a class="btn ghost" href="#masuk">Masuk</a><a class="btn" href="#daftar">Mulai sekarang ${icon("arrow")}</a></div></header><main><section class="hero"><div><span class="pill">${icon("leaf")} Langkah kecil, keuangan lebih baik.</span><h1>Kuliah jalan.<br>Keuangan<br><em>tetap aman.</em></h1><p>Uang saku bukan cuma soal cukup sampai akhir bulan. Kenali kebiasaanmu, atur pengeluaran, dan mulai jadi mahasiswa yang mapan.</p><div class="hero-actions"><a href="#daftar" class="btn">Mulai perjalananmu ${icon("arrow")}</a><button class="btn secondary" data-demo>Lihat contoh</button></div><div class="quiet-list"><span>${icon("check")} Tanpa biaya berlangganan</span><span>${icon("check")} Nggak harus jago keuangan</span></div></div><div class="hero-art"><div class="mock"><div class="mock-top"><b>Dompet mahasiswa</b><span class="muted">Contoh tampilan</span></div><div class="mock-balance"><small>Saldo tersedia</small><strong>Rp2.008.000</strong><div class="mock-pair"><span>↙ Pemasukan<b>Rp2.850.000</b></span><span>↗ Pengeluaran<b>Rp842.000</b></span></div></div><h4>Sedikit demi sedikit, jadi paham.</h4><div class="mini-bars">${[32, 65, 48, 80, 55, 95, 65].map((n) => `<i style="height:${n}%"></i>`).join("")}</div><div class="mock-foot"><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span></div></div><div class="art-note"><span class="note-icon">${icon("check")}</span><span><strong>Lebih sadar, lebih terarah.</strong>Mulai dari satu catatan hari ini.</span></div><span class="hero-caption">CATAT. PAHAMI. TUMBUH.</span></div></section><div class="features-strip"><div>${icon("wallet")}<span><strong>Satu tempat untuk uangmu</strong><small>Saldo dan transaksi selalu terhubung.</small></span></div><div>${icon("scan")}<span><strong>Struk nggak cuma jadi sampah</strong><small>Foto, periksa, lalu simpan transaksinya.</small></span></div><div>${icon("bulb")}<span><strong>Belajar dari keseharian</strong><small>Insight dari kebiasaanmu sendiri.</small></span></div></div><section class="section" id="fitur"><div class="section-heading"><div><span class="eyebrow muted">Dibuat untuk kehidupan mahasiswa</span><h2>Urus keuangan.<br>Tanpa bikin tambah pikiran.</h2></div><p>Dari uang saku, bayar kos, sampai jajan di kantin. Semuanya punya tempat di MAPAN.</p></div><div class="feature-grid">${[
    [
      "01",
      "wallet",
      "Catatan yang jelas",
      "Catat pemasukan dan pengeluaran. Lihat saldo terkini tanpa harus hitung ulang.",
    ],
    [
      "02",
      "scan",
      "Foto struk, jadi catatan",
      "Baca total dan tanggal dari struk. Kamu tetap memeriksa hasilnya sebelum disimpan.",
    ],
    [
      "03",
      "chart",
      "Pola yang mulai kelihatan",
      "Grafik dan ringkasan mingguan membantu kamu memahami ke mana uangmu pergi.",
    ],
    [
      "04",
      "book",
      "Belajar yang relevan",
      "Materi singkat dan refleksi berdasarkan kategori pengeluaranmu.",
    ],
    [
      "05",
      "report",
      "Anggaran yang masuk akal",
      "Tentukan batas bulanan per kategori, lalu pantau penggunaannya.",
    ],
    [
      "06",
      "shield",
      "Ruang pribadi untuk uangmu",
      "Login email dan akses data per akun. Struk diproses di perangkatmu.",
    ],
  ]
    .map(
      ([n, i, t, d]) =>
        `<article class="feature"><div class="feature-num"><span>${n} / MAPAN</span>${icon(i)}</div><h3>${t}</h3><p>${d}</p></article>`,
    )
    .join(
      "",
    )}</div></section><section class="section how" id="cara-kerja"><div><span class="eyebrow muted">Mulainya sederhana</span><h2>Nggak perlu sempurna.<br>Mulai aja dulu.</h2></div><div class="steps">${[
    [
      "01",
      "Bikin ruang keuanganmu",
      "Daftar dengan email, verifikasi akun, lalu masuk ke dashboard pribadimu.",
    ],
    [
      "02",
      "Catat yang masuk dan keluar",
      "Isi manual atau gunakan scan struk. Cukup beberapa langkah setiap hari.",
    ],
    [
      "03",
      "Luangkan waktu untuk refleksi",
      "Baca laporan mingguan dan temukan satu kebiasaan kecil yang bisa diperbaiki.",
    ],
  ]
    .map(
      ([n, t, d]) =>
        `<div class="step"><b>${n}</b><div><h3>${t}</h3><p>${d}</p></div></div>`,
    )
    .join(
      "",
    )}</div></section><section class="cta"><div><h2>Masa depan yang mapan,<br>dimulai dari hari ini.</h2><p>Satu catatan kecil. Satu langkah lebih paham.</p></div><a class="btn lime" href="#daftar">Buat akun MAPAN ${icon("arrow")}</a></section></main><footer>${brand()}<span>© ${new Date().getFullYear()} MAPAN · Mahasiswa Paham Keuangan</span><button class="link-btn" data-privacy>Privasi & data</button></footer></div>`;
  bindCommon();
}

function auth(mode = "masuk") {
  if (!db) {
    app.innerHTML = `<main class="auth-page"><section class="auth-story">${brand()}<div><h1>Selangkah lagi,<br>lebih mapan.</h1><p>Ruang untuk memahami keuanganmu.</p></div></section><section class="auth-main"><div class="auth-form"><a href="#" class="link-btn">← Kembali ke beranda</a><h2>Pendaftaran segera dibuka.</h2><p>Akun pribadi sedang disiapkan. Sambil menunggu, kamu bisa mencoba fitur MAPAN dengan data contoh.</p><button class="btn" data-demo>Jelajahi contoh MAPAN ${icon("arrow")}</button></div></section></main>`;
    bindCommon();
    return;
  }
  const register = mode === "daftar",
    recovery = mode === "pulihkan",
    reset = mode === "password";
  app.innerHTML = `<main class="auth-page"><section class="auth-story"><div>${brand()}</div><div><span class="eyebrow">Catat. Pahami. Tumbuh.</span><h1>Belajar mandiri.<br>Termasuk soal<br><span style="color:#d9eeaa">uang sendiri.</span></h1><p>Teman mengelola keuangan, dari awal bulan sampai akhir semester.</p></div><small class="muted">MAPAN — Mahasiswa Paham Keuangan</small></section><section class="auth-main"><div class="auth-form"><a href="#" class="link-btn">← Kembali ke beranda</a><h2>${register ? "Mulai jadi lebih mapan." : recovery ? "Lupa kata sandi?" : reset ? "Kata sandi baru." : "Selamat datang lagi."}</h2><p>${register ? "Buat akun untuk mulai memahami keuanganmu." : recovery ? "Kami akan mengirim tautan pemulihan ke emailmu." : reset ? "Gunakan kata sandi unik minimal 8 karakter." : "Catatan keuanganmu menunggu. Yuk, lanjutkan."}</p><form id="auth-form">${register ? '<label class="form-field">Nama panggilan<input name="name" required maxlength="50" autocomplete="nickname" placeholder="Kamu biasa dipanggil siapa?"></label>' : ""}${!reset ? '<label class="form-field">Email<input type="email" name="email" required autocomplete="email" placeholder="nama@email.com"></label>' : ""}${!recovery ? `<label class="form-field">Kata sandi<input type="password" name="password" required minlength="8" maxlength="128" autocomplete="${register || reset ? "new-password" : "current-password"}" placeholder="${register || reset ? "Minimal 8 karakter" : "Kata sandimu"}"></label>` : ""}${!register && !reset && !recovery ? '<a href="#pulihkan" class="link-btn">Lupa kata sandi?</a>' : ""}<div class="form-error" role="alert"></div><button class="btn" type="submit">${register ? "Buat akun" : recovery ? "Kirim tautan pemulihan" : reset ? "Simpan kata sandi" : "Masuk ke MAPAN"} ${icon("arrow")}</button></form><div class="auth-switch">${register ? 'Sudah punya akun? <a href="#masuk">Masuk</a>' : recovery || reset ? '<a href="#masuk">Kembali ke masuk</a>' : 'Belum punya akun? <a href="#daftar">Daftar dulu</a>'}</div><div class="auth-switch"><button data-demo>Lihat contoh tanpa mendaftar</button></div></div></section></main>`;
  bindCommon();
  document.querySelector("#auth-form").onsubmit = async (e) => {
    e.preventDefault();
    const f = e.currentTarget,
      b = f.querySelector("button[type=submit]"),
      error = f.querySelector(".form-error");
    b.disabled = true;
    error.textContent = "";
    const values = Object.fromEntries(new FormData(f));
    try {
      let result;
      if (register) {
        result = await db.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: { name: values.name },
            emailRedirectTo: location.origin + "/#dashboard",
          },
        });
        if (result.error) throw result.error;
        if (!result.data.session) {
          f.innerHTML =
            '<div class="insight"><div><h3>Cek emailmu, ya.</h3><p>Jika pendaftaran berhasil, tautan verifikasi akan dikirim ke emailmu. Buka tautannya, lalu kembali untuk masuk. Periksa juga folder spam.</p></div></div>';
          return;
        }
      } else if (recovery) {
        result = await db.auth.resetPasswordForEmail(values.email, {
          redirectTo: location.origin + "/#password",
        });
        if (result.error) throw result.error;
        toast("Jika email terdaftar, tautan pemulihan akan dikirim.");
        return;
      } else if (reset) {
        result = await db.auth.updateUser({ password: values.password });
        if (result.error) throw result.error;
        toast("Kata sandi berhasil diperbarui.");
      } else {
        result = await db.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (result.error) throw result.error;
      }
      demo = false;
      user = result.data.user;
      await loadData();
      location.hash = "dashboard";
    } catch (err) {
      error.textContent = errorMessage(err);
    } finally {
      b.disabled = false;
    }
  };
}

async function loadData() {
  const version = ++loadVersion;
  const all = [];
  let offset = 0;
  while (true) {
    const { data, error } = await db
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + 999);
    if (error) throw error;
    all.push(...data);
    if (data.length < 1000) break;
    offset += 1000;
  }
  const { data, error } = await db.from("budgets").select("*");
  if (error) throw error;
  if (version !== loadVersion) return;
  rows = all;
  budgets = data || [];
}
const navs = [
  ["dashboard", "grid", "Ringkasan"],
  ["transaksi", "arrows", "Transaksi"],
  ["anggaran", "wallet", "Anggaran"],
  ["laporan", "report", "Laporan mingguan"],
  ["edukasi", "book", "Ruang belajar"],
];
function shell() {
  const name = demo
    ? "Nadia"
    : user?.user_metadata?.name || user?.email?.split("@")[0] || "Teman MAPAN";
  app.innerHTML = `<div class="shell"><aside class="sidebar">${brand()}<span class="sidebar-label">RUANG KEUANGANMU</span><nav>${navs.map(([id, i, t]) => `<a class="nav-item ${page === id ? "active" : ""}" href="#${id}" ${page === id ? 'aria-current="page"' : ""}>${icon(i)}${t}</a>`).join("")}</nav><div class="sidebar-note">${icon("leaf")}<strong>Pelan-pelan, jadi mapan.</strong>Keuangan yang sehat dimulai dari kebiasaan kecil yang konsisten.<a href="#edukasi" class="link-btn" style="margin-top:13px">Belajar sebentar ${icon("arrow")}</a></div><div class="account"><span class="avatar">${escape(name.slice(0, 1).toUpperCase())}</span><span class="account-info"><strong>${escape(name)}</strong><small>${demo ? "Akun contoh" : "Akun pribadi"}</small></span><button class="icon-btn" data-logout aria-label="${demo ? "Keluar dari contoh" : "Keluar akun"}">${icon("logout")}</button></div></aside><div><header class="topbar"><div class="breadcrumb">Ruang keuangan <span>/ &nbsp;${navs.find((n) => n[0] === page)?.[2]}</span></div><div class="mobile-brand">${brand()}</div><div class="topbar-right"><span class="live-label"><i class="live-dot"></i>${demo ? "Mode contoh" : "Tersimpan online"}</span><span>${new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date())}</span><button class="icon-btn" data-logout aria-label="Keluar">${icon("logout")}</button></div></header><main class="main-content">${demo ? '<div class="demo-banner"><span>Ini data contoh. Jelajahi dulu, lalu mulai catatanmu sendiri.</span><button data-start>Buat akun →</button></div>' : ""}<div id="page"></div><div class="app-footer"><span>MAPAN · Mahasiswa Paham Keuangan</span><button class="link-btn" data-privacy style="font-size:9px">Privasi & data</button></div></main></div></div>`;
  renderPage(name);
  bindCommon();
  document.querySelectorAll("[data-logout]").forEach(
    (b) =>
      (b.onclick = async () => {
        if (!demo) {
          const { error } = await db.auth.signOut();
          if (error) {
            toast(errorMessage(error));
            return;
          }
        }
        demo = false;
        user = null;
        rows = [];
        budgets = [];
        loadVersion++;
        location.hash = "";
      }),
  );
  document.querySelector("[data-start]")?.addEventListener("click", () => {
    demo = false;
    rows = [];
    budgets = [];
    location.hash = "daftar";
  });
}

function periodSelect() {
  return `<select class="period-select" id="period" aria-label="Periode ringkasan"><option value="month" ${period === "month" ? "selected" : ""}>${monthLabel()}</option><option value="week" ${period === "week" ? "selected" : ""}>7 hari terakhir</option><option value="all" ${period === "all" ? "selected" : ""}>Semua waktu</option></select>`;
}
function pageTitle(title, sub, actions = "") {
  return `<div class="page-title"><div><h1>${title}</h1><p>${sub}</p></div><div class="page-actions">${actions}</div></div>`;
}
function renderPage(name) {
  const el = document.querySelector("#page");
  if (page === "dashboard") {
    const sum = summarize(periodRows()),
      balance = summarize(rows).balance;
    el.innerHTML =
      pageTitle(
        `Halo, ${escape(name.split(" ")[0])} <span style="color:#8fa36d">☀</span>`,
        "Yuk, lihat kabar keuanganmu hari ini.",
        `<button class="btn secondary" data-scan>${icon("scan")} Scan struk</button><button class="btn" data-add>${icon("plus")} Catat transaksi</button>`,
      ) +
      `<div class="stats"><article class="stat balance"><div class="stat-title">Total saldo ${icon("wallet")}</div><strong>${rupiah(balance)}</strong><small>Dari seluruh transaksi yang tercatat</small></article><article class="stat"><div class="stat-title">Pemasukan ${icon("down")}</div><strong>${rupiah(sum.income)}</strong><small><span class="up">↙</span> ${period === "month" ? "Bulan ini" : period === "week" ? "7 hari terakhir" : "Semua waktu"}</small></article><article class="stat"><div class="stat-title">Pengeluaran ${icon("up")}</div><strong>${rupiah(sum.expense)}</strong><small><span class="down">↗</span> ${period === "month" ? "Bulan ini" : period === "week" ? "7 hari terakhir" : "Semua waktu"}</small></article></div><div class="dashboard-grid"><section class="panel"><div class="panel-heading"><h2>Arus keuangan</h2>${periodSelect()}</div><p class="panel-sub">Sedikit lebih paham ke mana uangmu pergi.</p>${barChart()}</section><section class="panel"><div class="panel-heading"><h2>Ke mana uangmu pergi?</h2>${icon("chart")}</div><p class="panel-sub">Pengeluaran berdasarkan kategori</p>${categoryChart(periodRows())}</section></div>${insight(periodRows())}<section class="panel transactions-panel"><div class="panel-heading"><h2>Transaksi terbaru</h2><a href="#transaksi" class="link-btn">Lihat semua ${icon("arrow")}</a></div><p class="panel-sub">Setiap catatan kecil, berarti.</p>${transactionTable(rows.slice(0, 5), false)}</section>`;
    document.querySelector("#period").onchange = (e) => {
      period = e.target.value;
      renderPage(name);
    };
  } else if (page === "transaksi") {
    el.innerHTML =
      pageTitle(
        "Catatan transaksi",
        "Semua yang masuk dan keluar, dalam satu tempat.",
        `<button class="btn secondary" data-export>${icon("download")} Unduh CSV</button><button class="btn" data-add>${icon("plus")} Catat transaksi</button>`,
      ) +
      `<section class="panel"><div class="filters"><input id="search" placeholder="Cari transaksi…" aria-label="Cari transaksi"><select id="type-filter" aria-label="Jenis transaksi"><option value="">Semua jenis</option><option value="income">Pemasukan</option><option value="expense">Pengeluaran</option></select><input id="month-filter" type="month" aria-label="Filter bulan"><button class="btn secondary small" id="clear-filter">Reset filter</button></div><div id="table"></div></section>`;
    const update = () => {
      const q = document.querySelector("#search").value.toLowerCase(),
        type = document.querySelector("#type-filter").value,
        month = document.querySelector("#month-filter").value;
      const filtered = rows.filter(
        (t) =>
          (!type || t.type === type) &&
          (!month || t.date.startsWith(month)) &&
          (t.description.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q)),
      );
      document.querySelector("#table").innerHTML = transactionTable(
        filtered,
        true,
      );
      bindTable();
    };
    ["search", "type-filter", "month-filter"].forEach((id) =>
      document.querySelector("#" + id).addEventListener("input", update),
    );
    document.querySelector("#clear-filter").onclick = () => {
      ["search", "type-filter", "month-filter"].forEach(
        (id) => (document.querySelector("#" + id).value = ""),
      );
      update();
    };
    update();
  } else if (page === "anggaran") {
    el.innerHTML =
      pageTitle(
        "Beri uangmu arah.",
        "Batas bulanan yang kamu tentukan sendiri.",
        `<button class="btn" data-budget>${icon("plus")} Atur anggaran</button>`,
      ) +
      `<section class="panel"><div class="panel-heading"><h2>Anggaran ${monthLabel()}</h2><span class="pill">Bulanan</span></div><p class="panel-sub">Anggaran berulang setiap bulan. Kamu bisa mengubahnya kapan saja.</p>${
        budgets.length
          ? budgets
              .map((b) => {
                const spent = monthRows()
                    .filter(
                      (t) => t.type === "expense" && t.category === b.category,
                    )
                    .reduce((s, t) => s + Number(t.amount), 0),
                  pct = Math.round((spent / Number(b.amount)) * 100);
                return `<div class="budget-row"><strong>${escape(b.category)}</strong><button class="link-btn" data-budget="${escape(b.category)}">Ubah</button></div><div class="progress ${pct > 100 ? "over" : ""}"><i style="width:${Math.min(pct, 100)}%"></i></div><div class="category-row"><span>${rupiah(spent)} dari ${rupiah(b.amount)}</span><b>${pct}%</b></div><p class="panel-sub">${spent > b.amount ? "Melebihi anggaran " + rupiah(spent - b.amount) : "Sisa anggaran " + rupiah(b.amount - spent)}</p>`;
              })
              .join("")
          : '<div class="empty">Belum ada anggaran. Mulai dari satu kategori yang paling sering kamu gunakan.</div>'
      }</section>${insight(monthRows())}`;
  } else if (page === "laporan") {
    el.innerHTML = reportPage();
    document.querySelector("#report-date").onchange = () => {
      document.querySelector("#report-body").innerHTML = reportBody(
        document.querySelector("#report-date").value,
      );
    };
    document.querySelector("[data-print]").onclick = () => window.print();
  } else {
    el.innerHTML = education();
  }
  bindPage();
}

function barChart() {
  let buckets;
  if (period === "month") {
    const month = today().slice(0, 7);
    buckets = Array.from({ length: 5 }, (_, i) => ({
      label: `Mgg ${i + 1}`,
      rows: rows.filter(
        (t) =>
          t.date.startsWith(month) &&
          Math.min(4, Math.floor((Number(t.date.slice(8)) - 1) / 7)) === i,
      ),
    }));
  } else if (period === "all") {
    const dates = [...new Set(rows.map((t) => t.date.slice(0, 7)))].sort();
    buckets = dates.map((date) => ({
      label: new Intl.DateTimeFormat("id-ID", {
        month: "short",
        year: "2-digit",
      }).format(new Date(date + "-01T12:00:00")),
      rows: rows.filter((t) => t.date.startsWith(date)),
    }));
    if (buckets.length > 12) buckets = buckets.slice(-12);
  } else {
    buckets = Array.from({ length: 7 }, (_, i) => {
      const d = daysAgo(6 - i);
      return {
        label: new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(
          new Date(d + "T12:00:00"),
        ),
        rows: rows.filter((t) => t.date === d),
      };
    });
  }
  if (!buckets.length) buckets = [{ label: "—", rows: [] }];
  const values = buckets.map((b) => ({ ...b, ...summarize(b.rows) })),
    max = Math.max(1, ...values.flatMap((b) => [b.income, b.expense]));
  return `<div class="chart-legend"><span><i class="dot" style="background:#305b49"></i>Pemasukan</span><span><i class="dot" style="background:#c9df9f"></i>Pengeluaran</span></div><div class="chart" role="img" aria-label="Grafik arus keuangan. ${values.map((v) => `${v.label}: pemasukan ${rupiah(v.income)}, pengeluaran ${rupiah(v.expense)}`).join(". ")}"><div class="chart-axis"><span>${compact(max)}</span><span>${compact((max * 2) / 3)}</span><span>${compact(max / 3)}</span><span>0</span></div><div class="chart-plot">${values.map((v) => `<div class="bar-group"><div class="bar" style="height:${(v.income / max) * 100}%" title="Pemasukan ${rupiah(v.income)}"></div><div class="bar expense" style="height:${(v.expense / max) * 100}%" title="Pengeluaran ${rupiah(v.expense)}"></div><span class="bar-label">${v.label}</span></div>`).join("")}</div></div><p class="chart-foot">${periodRows().length ? `${periodRows().length} transaksi dalam periode ini.` : "Belum ada transaksi pada periode ini."}${period === "all" && new Set(rows.map((t) => t.date.slice(0, 7))).size > 12 ? " Grafik menampilkan 12 bulan aktif terakhir." : ""}</p>`;
}
function compact(n) {
  return n >= 1000000
    ? (n / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 }) +
        " jt"
    : n >= 1000
      ? Math.round(n / 1000) + " rb"
      : Math.round(n);
}
function categoryChart(data) {
  const total = summarize(data).expense,
    parts = categories
      .map((c, i) => ({
        c,
        color: colors[i],
        amount: data
          .filter((t) => t.type === "expense" && t.category === c)
          .reduce((s, t) => s + Number(t.amount), 0),
      }))
      .filter((p) => p.amount)
      .sort((a, b) => b.amount - a.amount);
  let last = 0;
  const gradient = parts
    .map((p) => {
      const from = last;
      last += (p.amount / total) * 100;
      return `${p.color} ${from}% ${last}%`;
    })
    .join(",");
  return `<div class="category-chart"><div class="donut" style="background:${total ? "conic-gradient(" + gradient + ")" : "#eef2e7"}" role="img" aria-label="Total pengeluaran ${rupiah(total)}"><div class="donut-center"><strong>${parts.length}</strong><span>kategori pengeluaran</span></div></div></div><div class="category-list">${parts.length ? parts.map((p) => `<div class="category-row"><span><i class="dot" style="background:${p.color}"></i>${p.c}</span><b>${Math.round((p.amount / total) * 100)}% <span class="muted" style="font-weight:400">· ${rupiah(p.amount)}</span></b></div>`).join("") : '<p class="panel-sub" style="text-align:center">Catat pengeluaran pertama untuk melihat polamu.</p>'}</div>`;
}
function insight(data) {
  const expense = data.filter((t) => t.type === "expense");
  const totals = categories
    .map((c) => ({
      c,
      v: expense
        .filter((t) => t.category === c)
        .reduce((s, t) => s + Number(t.amount), 0),
    }))
    .sort((a, b) => b.v - a.v);
  const sum = summarize(data);
  return `<aside class="insight">${icon("bulb")}<div><h3>${expense.length ? "Catatan kecil untukmu" : "Mulai dari yang paling sederhana."}</h3><p>${expense.length ? `Pengeluaran terbesarmu ada di <strong>${totals[0].c.toLowerCase()}</strong> (${rupiah(totals[0].v)}). ${sum.expense > sum.income ? "Pengeluaran periode ini lebih besar dari pemasukan yang tercatat. Coba periksa kebutuhan yang bisa ditunda." : "Luangkan waktu sebentar untuk menilai: mana kebutuhan, mana yang masih bisa kamu atur?"} ` : "Catat uang saku atau pemasukan pertama, lalu tambah pengeluaran harianmu. Polanya akan terlihat seiring waktu."}<a href="#edukasi" class="link-btn" style="margin-left:5px">Baca di ruang belajar →</a></p></div></aside>`;
}

function transactionTable(data, actions) {
  return data.length
    ? `<div class="table-wrap"><table><thead><tr><th>TRANSAKSI</th><th class="hide-mobile">KATEGORI</th><th>TANGGAL</th><th style="text-align:right">NOMINAL</th>${actions ? "<th>AKSI</th>" : ""}</tr></thead><tbody>${data.map((t) => `<tr><td><div class="transaction-name"><span class="transaction-icon">${icon(t.type === "income" ? "down" : t.category === categories[0] ? "food" : "wallet")}</span><span>${escape(t.description)}</span></div></td><td class="hide-mobile"><span class="category-badge">${escape(t.category)}</span></td><td class="table-date">${shortDate(t.date)} ${t.date.slice(0, 4) !== today().slice(0, 4) ? t.date.slice(0, 4) : ""}</td><td class="amount ${t.type === "income" ? "income-text" : ""}">${t.type === "income" ? "+" : "−"}${rupiah(t.amount)}</td>${actions ? `<td><button class="icon-btn" data-edit="${t.id}" aria-label="Ubah ${escape(t.description)}">${icon("edit")}</button><button class="icon-btn" data-delete="${t.id}" aria-label="Hapus ${escape(t.description)}">${icon("trash")}</button></td>` : ""}</tr>`).join("")}</tbody></table></div>`
    : '<div class="empty">Belum ada transaksi yang cocok.<br>Catat transaksi baru atau ubah filter pencarianmu.</div>';
}

function bindPage() {
  document
    .querySelectorAll("[data-add]")
    .forEach((b) => (b.onclick = () => transactionModal()));
  document
    .querySelectorAll("[data-scan]")
    .forEach((b) => (b.onclick = scanModal));
  document
    .querySelectorAll("[data-budget]")
    .forEach((b) => (b.onclick = () => budgetModal(b.dataset.budget)));
  document
    .querySelector("[data-export]")
    ?.addEventListener("click", () => downloadCSV(rows));
  bindTable();
}
function bindTable() {
  document
    .querySelectorAll("[data-edit]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          transactionModal(rows.find((t) => t.id === b.dataset.edit))),
    );
  document
    .querySelectorAll("[data-delete]")
    .forEach((b) => (b.onclick = () => deleteModal(b.dataset.delete)));
}
function transactionModal(existing = {}, notice = "") {
  showModal(
    modalHead(
      existing.id ? "Ubah transaksi" : "Catat transaksi",
      notice || "Satu catatan kecil untuk keuangan yang lebih terarah.",
    ) +
      `<form id="transaction-form"><div class="type-toggle"><label><input type="radio" name="type" value="expense" ${existing.type !== "income" ? "checked" : ""}>Pengeluaran</label><label><input type="radio" name="type" value="income" ${existing.type === "income" ? "checked" : ""}>Pemasukan</label></div><label class="form-field">Nominal (Rp)<input name="amount" type="number" min="1" max="1000000000" step="1" required inputmode="numeric" placeholder="0" value="${existing.amount || ""}"></label><label class="form-field">Keterangan<input name="description" required maxlength="100" placeholder="Misal: makan siang di kantin" value="${escape(existing.description || "")}"></label><div class="form-row"><label class="form-field">Kategori<select name="category">${categories.map((c) => `<option ${c === existing.category ? "selected" : ""}>${c}</option>`).join("")}</select></label><label class="form-field">Tanggal<input name="date" type="date" required max="9999-12-31" value="${existing.date || today()}"></label></div><div class="form-error" role="alert"></div><div class="modal-actions"><button type="button" class="btn secondary" id="cancel-tx">Batal</button><button type="submit" class="btn">Simpan transaksi ${icon("check")}</button></div></form>`,
  );
  document.querySelector("#cancel-tx").onclick = () => modal.close();
  document.querySelector("#transaction-form").onsubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget,
      b = form.querySelector("[type=submit]"),
      data = Object.fromEntries(new FormData(form));
    data.amount = Number(data.amount);
    data.description = data.description.trim();
    if (!validTransaction(data)) {
      form.querySelector(".form-error").textContent =
        "Periksa kembali nominal, keterangan, dan tanggal transaksi.";
      return;
    }
    b.disabled = true;
    try {
      if (demo) {
        if (existing.id)
          rows = rows.map((t) =>
            t.id === existing.id ? { ...t, ...data } : t,
          );
        else rows.unshift({ ...data, id: crypto.randomUUID() });
        rows.sort((a, b) => b.date.localeCompare(a.date));
      } else {
        const result = existing.id
          ? await db
              .from("transactions")
              .update(data)
              .eq("id", existing.id)
              .select()
              .single()
          : await db
              .from("transactions")
              .insert({ ...data, user_id: user.id })
              .select()
              .single();
        if (result.error) throw result.error;
        if (existing.id)
          rows = rows.map((t) => (t.id === existing.id ? result.data : t));
        else rows.unshift(result.data);
        rows.sort((a, b) => b.date.localeCompare(a.date));
      }
      modal.close();
      shell();
      toast(
        demo ? "Catatan contoh diperbarui." : "Transaksi tersimpan online.",
      );
    } catch (err) {
      form.querySelector(".form-error").textContent = errorMessage(err);
    } finally {
      b.disabled = false;
    }
  };
}
function deleteModal(id) {
  const item = rows.find((t) => t.id === id);
  showModal(
    modalHead(
      "Hapus transaksi?",
      "Transaksi ini akan dikeluarkan dari perhitungan saldo.",
    ) +
      `<p style="font-size:13px">${escape(item.description)} · ${rupiah(item.amount)}</p><div class="form-error" role="alert"></div><div class="modal-actions"><button class="btn secondary" id="keep">Batal</button><button class="btn" id="confirm-delete">Hapus transaksi</button></div>`,
  );
  document.querySelector("#keep").onclick = () => modal.close();
  document.querySelector("#confirm-delete").onclick = async (e) => {
    e.currentTarget.disabled = true;
    try {
      if (!demo) {
        const { data, error } = await db
          .from("transactions")
          .delete()
          .eq("id", id)
          .select();
        if (error) throw error;
        if (!data.length)
          throw Error("Transaksi tidak ditemukan. Muat ulang halaman.");
      }
      rows = rows.filter((t) => t.id !== id);
      modal.close();
      shell();
      toast("Transaksi dihapus.");
    } catch (err) {
      modal.querySelector(".form-error").textContent = errorMessage(err);
      e.target.disabled = false;
    }
  };
}

function budgetModal(category = "") {
  const existing = budgets.find((b) => b.category === category);
  showModal(
    modalHead(
      "Atur anggaran",
      "Batas pengeluaran per kategori, berlaku setiap bulan.",
    ) +
      `<form id="budget-form"><label class="form-field">Kategori<select name="category">${categories.map((c) => `<option ${c === category ? "selected" : ""}>${c}</option>`).join("")}</select></label><label class="form-field">Batas bulanan (Rp)<input name="amount" type="number" required min="1" max="1000000000" step="1" value="${existing?.amount || ""}" placeholder="Misal: 600000"></label><div class="form-error" role="alert"></div><div class="modal-actions">${existing ? '<button class="btn secondary" type="button" id="remove-budget">Hapus batas</button>' : ""}<button class="btn" type="submit">Simpan anggaran</button></div></form>`,
  );
  const form = document.querySelector("#budget-form");
  form.elements.category.onchange = () => {
    form.elements.amount.value =
      budgets.find((b) => b.category === form.elements.category.value)
        ?.amount || "";
  };
  form.onsubmit = async (e) => {
    e.preventDefault();
    const b = form.querySelector("[type=submit]"),
      data = {
        category: form.elements.category.value,
        amount: Number(form.elements.amount.value),
      };
    if (
      !Number.isSafeInteger(data.amount) ||
      data.amount < 1 ||
      data.amount > 1e9
    )
      return;
    b.disabled = true;
    try {
      if (!demo) {
        const { error } = await db
          .from("budgets")
          .upsert(
            { ...data, user_id: user.id },
            { onConflict: "user_id,category" },
          );
        if (error) throw error;
      }
      budgets = budgets
        .filter((b) => b.category !== data.category)
        .concat(data);
      modal.close();
      shell();
      toast("Anggaran diperbarui.");
    } catch (err) {
      form.querySelector(".form-error").textContent = errorMessage(err);
    } finally {
      b.disabled = false;
    }
  };
  document
    .querySelector("#remove-budget")
    ?.addEventListener("click", async (e) => {
      e.target.disabled = true;
      try {
        if (!demo) {
          const { error } = await db
            .from("budgets")
            .delete()
            .eq("category", category);
          if (error) throw error;
        }
        budgets = budgets.filter((b) => b.category !== category);
        modal.close();
        shell();
        toast("Batas anggaran dihapus.");
      } catch (err) {
        form.querySelector(".form-error").textContent = errorMessage(err);
        e.target.disabled = false;
      }
    });
}

function scanModal() {
  showModal(
    modalHead(
      "Dari struk, jadi catatan.",
      "Pilih foto yang jelas. Pembacaan berlangsung di perangkatmu; foto tidak diunggah ke database.",
    ) +
      `<div class="scan-drop">${icon("scan")}<strong>Pilih foto struk</strong><span class="muted">JPG, PNG, atau WEBP · maksimal 8 MB</span><input id="receipt-file" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Pilih foto struk"><img class="scan-preview" id="receipt-preview" alt="Pratinjau struk" hidden></div><p id="ocr-progress" class="panel-sub" role="status"></p><div class="form-error" role="alert"></div><div class="modal-actions"><button class="btn secondary" id="manual-tx">Isi manual</button><button class="btn" id="read-receipt" disabled>Baca struk ${icon("scan")}</button></div>`,
  );
  let file, url;
  const input = document.querySelector("#receipt-file"),
    read = document.querySelector("#read-receipt");
  input.onchange = () => {
    file = input.files[0];
    const error = modal.querySelector(".form-error");
    error.textContent = "";
    if (url) URL.revokeObjectURL(url);
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 8 * 1024 * 1024
    ) {
      error.textContent =
        "Pilih gambar JPG, PNG, atau WEBP berukuran di bawah 8 MB.";
      file = null;
      read.disabled = true;
      return;
    }
    url = URL.createObjectURL(file);
    const preview = document.querySelector("#receipt-preview");
    preview.src = url;
    preview.hidden = false;
    read.disabled = false;
  };
  document.querySelector("#manual-tx").onclick = () => {
    if (url) URL.revokeObjectURL(url);
    modal.close();
    transactionModal();
  };
  read.onclick = async () => {
    if (!file) return;
    read.disabled = true;
    input.disabled = true;
    let worker;
    const progress = document.querySelector("#ocr-progress");
    try {
      progress.textContent =
        "Menyiapkan pembaca struk. Proses pertama memerlukan unduhan model OCR.";
      worker = await createWorker("eng", 1, {
        workerPath: location.origin + "/ocr-worker.min.js",
        logger: (m) => {
          if (m.status === "recognizing text")
            progress.textContent = `Membaca struk… ${Math.round(m.progress * 100)}%`;
        },
      });
      const result = await worker.recognize(file);
      const parsed = parseReceipt(result.data.text);
      if (!modal.open) return;
      modal.close();
      transactionModal(
        { ...parsed, type: "expense" },
        "Hasil scan belum tentu tepat. Periksa nominal, tanggal, dan keterangan sebelum menyimpan.",
      );
    } catch {
      if (modal.open) {
        modal.querySelector(".form-error").textContent =
          "Struk belum berhasil dibaca. Coba foto yang lebih jelas, periksa koneksi internet, atau isi manual.";
        read.disabled = false;
        input.disabled = false;
      }
    } finally {
      if (worker) await worker.terminate();
      if (url) URL.revokeObjectURL(url);
    }
  };
  modal.addEventListener(
    "close",
    () => {
      if (url) URL.revokeObjectURL(url);
    },
    { once: true },
  );
}

function reportPage() {
  return (
    pageTitle(
      "Seminggu untuk dipahami.",
      "Lihat kebiasaanmu, lalu tentukan langkah kecil berikutnya.",
      `<button class="btn secondary" data-print>${icon("report")} Cetak / simpan PDF</button>`,
    ) +
    `<section class="panel"><div class="panel-heading"><h2>Laporan 7 hari</h2><label class="form-field" style="margin:0">Tanggal akhir<input type="date" id="report-date" value="${today()}" max="${today()}" required></label></div><div id="report-body">${reportBody(today())}</div></section>`
  );
}
function reportBody(end) {
  if (!end)
    return '<div class="empty">Pilih tanggal akhir untuk melihat laporan.</div>';
  const start = new Date(end + "T12:00:00");
  start.setDate(start.getDate() - 6);
  const from = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`,
    data = rows.filter((t) => t.date >= from && t.date <= end),
    s = summarize(data);
  return `<p class="panel-sub">${shortDate(from)} – ${shortDate(end)} ${end.slice(0, 4)}</p><div class="report-summary"><div><h3>Pemasukan</h3><strong class="income-text">${rupiah(s.income)}</strong></div><div><h3>Pengeluaran</h3><strong>${rupiah(s.expense)}</strong></div><div><h3>Selisih periode</h3><strong>${rupiah(s.balance)}</strong></div></div><p class="panel-sub">${data.length} transaksi · Rata-rata pengeluaran harian ${rupiah(s.expense / 7)}</p>${categoryChart(data)}${insight(data)}<div class="panel-heading" style="margin-top:30px"><h2>Catatan selama periode ini</h2></div>${transactionTable(data, false)}`;
}
function education() {
  return (
    pageTitle(
      "Paham dulu, mapan kemudian.",
      "Belajar dari catatanmu sendiri. Sedikit-sedikit, nggak perlu sekaligus.",
    ) +
    insight(monthRows()) +
    `<div class="content-grid" style="margin-top:22px">${[
      [
        "01 / KEBIASAAN",
        "Bedakan butuh dan ingin.",
        "Kebutuhan mendukung kegiatan harianmu. Keinginan memberi kenyamanan atau kesenangan. Keduanya boleh punya tempat, asal kamu memilihnya dengan sadar.",
        [
          "Lihat lima pengeluaran terakhirmu.",
          "Tandai mana yang mendesak dan mana yang bisa ditunda.",
          "Pilih satu perubahan kecil untuk minggu depan.",
        ],
        "Coba jeda 24 jam sebelum membeli barang yang tidak mendesak.",
      ],
      [
        "02 / ANGGARAN",
        "Anggaran yang cocok buat kamu.",
        "Tidak ada pembagian anggaran yang cocok untuk semua mahasiswa. Mulai dari biaya yang memang harus kamu bayar, lalu sesuaikan dengan uang yang tersedia.",
        [
          "Hitung kebutuhan tetap: kos, makan, dan transportasi.",
          "Sisihkan ruang untuk biaya kuliah yang tidak rutin.",
          "Tentukan batas yang realistis per kategori di menu Anggaran.",
        ],
        "Tinjau anggaran setelah beberapa minggu, bukan hanya saat uang sudah habis.",
      ],
      [
        "03 / CADANGAN",
        "Siapkan ruang untuk kejutan.",
        "Laptop rusak atau kebutuhan kuliah mendadak bisa mengubah rencana. Dana cadangan membantu kamu punya ruang saat hal tak terduga terjadi.",
        [
          "Mulai dari jumlah kecil yang bisa konsisten kamu sisihkan.",
          "Pisahkan dari uang belanja sehari-hari.",
          "Sesuaikan target dengan kebutuhan dan kondisimu sendiri.",
        ],
        "Konsisten lebih berguna daripada memaksakan nominal besar sekali saja.",
      ],
      [
        "04 / REFLEKSI",
        "Akhir minggu, cek sebentar.",
        "Laporan bukan rapor baik atau buruk. Laporan adalah cara mengenali kebiasaan agar keputusan berikutnya lebih terarah.",
        [
          "Buka laporan 7 hari terakhir.",
          "Bandingkan pengeluaran dengan kebutuhan yang terpenuhi.",
          "Tentukan satu hal untuk dipertahankan dan satu untuk diperbaiki.",
        ],
        "Gunakan catatanmu untuk memahami diri, bukan menyalahkan diri.",
      ],
    ]
      .map(
        ([n, t, d, steps, tip]) =>
          `<article class="panel lesson"><span class="eyebrow">${n}</span><h2>${t}</h2><p>${d}</p><ul>${steps.map((s) => `<li>${s}</li>`).join("")}</ul><div class="tip">${tip}</div></article>`,
      )
      .join(
        "",
      )}</div><p class="panel-sub" style="margin-top:20px">Materi pengenalan dan refleksi kebiasaan sehari-hari; bukan rekomendasi produk investasi.</p>`
  );
}

function downloadCSV(data) {
  const url = URL.createObjectURL(
      new Blob([csv(data)], { type: "text/csv;charset=utf-8;" }),
    ),
    a = document.createElement("a");
  a.href = url;
  a.download = `MAPAN-transaksi-${today()}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("File CSV siap diunduh.");
}
function bindCommon() {
  document.querySelectorAll("[data-demo]").forEach(
    (b) =>
      (b.onclick = () => {
        demo = true;
        rows = sampleRows();
        budgets = [
          { category: categories[0], amount: 600000 },
          { category: categories[1], amount: 250000 },
        ];
        if (location.hash === "#dashboard") route();
        else location.hash = "dashboard";
      }),
  );
  document
    .querySelectorAll("[data-privacy]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          showModal(
            modalHead("Data keuanganmu, ruang pribadimu.") +
              '<p style="font-size:12px">MAPAN menggunakan Supabase untuk autentikasi email dan penyimpanan transaksi serta anggaran. Akses database dibatasi per akun. Sesi login disimpan di browser agar kamu tidak perlu masuk setiap membuka halaman.</p><p style="font-size:12px;margin-top:16px">Foto struk dibaca di perangkat menggunakan OCR, tanpa disimpan di server. Model OCR diunduh dari penyedia CDN. Kamu dapat mengunduh transaksi sebagai CSV dan menghapus transaksi melalui menu Transaksi.</p><p style="font-size:12px;margin-top:16px">Mode contoh tidak menyimpan perubahan ke database. Hindari menggunakan perangkat bersama untuk akun pribadi, dan selalu keluar setelah selesai.</p>',
          )),
    );
}

function route() {
  const hash = location.hash.slice(1).split("?")[0];
  if (["fitur", "cara-kerja"].includes(hash)) {
    landing();
    requestAnimationFrame(() =>
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }),
    );
    return;
  }
  if (["masuk", "daftar", "pulihkan", "password"].includes(hash)) {
    if (user && hash !== "password" && !demo) {
      location.hash = "dashboard";
      return;
    }
    demo = false;
    auth(hash);
    window.scrollTo(0, 0);
    return;
  }
  if (navs.some((n) => n[0] === hash)) {
    if (!user && !demo) {
      location.hash = "masuk";
      return;
    }
    page = hash;
    shell();
  } else landing();
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);
db?.auth.onAuthStateChange((event, session) => {
  if (event === "PASSWORD_RECOVERY") {
    user = session?.user;
    location.hash = "password";
  }
  if (event === "SIGNED_OUT" && user) {
    user = null;
    rows = [];
    budgets = [];
    loadVersion++;
    demo = false;
    location.hash = "masuk";
  }
});
async function init() {
  app.innerHTML = '<div class="loading">Membuka MAPAN…</div>';
  if (!db) {
    route();
    return;
  }
  try {
    const { data, error } = await db.auth.getSession();
    if (error) throw error;
    user = data.session?.user || null;
    if (user) await loadData();
    if (location.hash.includes("access_token="))
      history.replaceState(null, "", location.pathname + "#dashboard");
    route();
  } catch (err) {
    app.innerHTML = `<div class="loading" style="flex-direction:column;gap:20px"><p>${escape(errorMessage(err))}</p><button class="btn" id="retry">Coba lagi</button></div>`;
    document.querySelector("#retry").onclick = init;
  }
}
init();
