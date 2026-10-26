# MAPAN — Mahasiswa Paham Keuangan

Aplikasi keuangan mahasiswa berbahasa Indonesia. HTML, CSS, dan JavaScript modules, tanpa framework UI. Dependensi dibundel lokal; tidak ada branding pembuat website.

## Menjalankan

Gunakan Node.js 22 atau lebih baru.

```sh
npm ci
npm run build
npm test
npm run dev
```

Buka http://127.0.0.1:4173. Semua aset publik berada di `dist/`. `npm run format` merapikan source, bukan vendor hasil bundling.

## Status akun dan database

Koneksi produksi menggunakan proyek gratis MAPAN (`cdtelkcqgvscbzwfpaow`) dalam organisasi akun gamal, sesuai pilihan akhir pemilik. Mode contoh tidak menyimpan perubahan ke database; perubahan contoh hilang saat halaman dimuat ulang.

**Langkah yang masih diperlukan:** pengaturan URL dan pengirim email belum tersimpan. Buka https://supabase.com/dashboard/project/cdtelkcqgvscbzwfpaow/auth/url-configuration lalu isi Site URL dengan `https://mapan-mahasiswa-paham-keuangan.sagetulip8.chatgpt.site`. Tambahkan `https://mapan-mahasiswa-paham-keuangan.sagetulip8.chatgpt.site/**` pada Redirect URLs dan simpan. Untuk pendaftaran di luar anggota organisasi, siapkan pengirim SMTP pada Authentication → Emails → SMTP Settings. Pertahankan verifikasi email. Kontrol Chrome berhenti sebelum konfigurasi ini dapat disimpan; jangan menganggap email sudah diuji.

Konfigurasi untuk deployment lain atau pemasangan ulang:

1. Buat/pilih proyek Supabase gratis di akun pemilik tersebut.
2. Jalankan `schema.sql` satu kali melalui SQL Editor. Jangan jalankan ulang pada database yang sudah memiliki tabel MAPAN.
3. Isi `url` dan **publishable key** proyek pada `dist/config.js`. Jangan pernah memakai `service_role` atau secret key di frontend.
4. Di Authentication → URL Configuration, isi Site URL dengan alamat deployment MAPAN dan daftarkan alamat yang sama dalam Redirect URLs. Tambahkan alamat preview lokal jika dibutuhkan. Tautan pendaftaran menggunakan `/#dashboard`; pemulihan menggunakan `/#password`.
5. Aktifkan Email provider dan pertahankan verifikasi email. Atur SMTP untuk pendaftaran pengguna umum. Layanan email bawaan Supabase membatasi penerima dan laju pengiriman; verifikasi dan pemulihan email perlu diuji setelah SMTP siap.
6. Uji dengan dua akun: daftar, verifikasi, masuk, tambah/ubah/hapus transaksi, anggaran, keluar, masuk ulang, dan pastikan akun kedua tidak bisa melihat data akun pertama.
7. Publikasikan ulang direktori `dist/`.

Autentikasi email dan pemulihan kata sandi menggunakan SDK Supabase, bukan implementasi kata sandi sendiri. Database memakai row-level security dan validasi server. Form memvalidasi nominal rupiah utuh, kategori, keterangan, dan tanggal. Tidak ada data finansial akun di localStorage; SDK menyimpan sesi login di browser.

## Fitur

- Ringkasan saldo seluruh waktu serta pemasukan/pengeluaran per periode.
- Grafik arus keuangan dan pembagian kategori.
- Tambah, edit, hapus, cari, filter transaksi; ekspor CSV dengan pencegahan formula injection.
- Anggaran kategori bulanan dan indikator penggunaan.
- Laporan tujuh hari dengan pemilihan tanggal; cetak/simpan PDF melalui dialog browser.
- Edukasi reflektif berdasarkan kategori transaksi.
- OCR struk menggunakan Tesseract.js di perangkat. Worker ada di `dist/`; model bahasa dan core OCR diunduh dari CDN pada penggunaan pertama. Foto tidak diunggah ke database. Pengguna memeriksa hasil sebelum menyimpan.

## Struktur

- `dist/app.js`: routing hash, tampilan, integrasi akun, dan interaksi.
- `dist/finance.js`: perhitungan, validasi, parser struk, ekspor.
- `dist/styles.css`: desain responsif, termasuk cetak.
- `dist/config.js`: konfigurasi publik Supabase.
- `vendor.js` + `build.mjs`: bundling SDK dan OCR.
- `schema.sql`: tabel, indeks, constraints, dan kebijakan per akun.
- `tests/finance.test.js`: perhitungan uang, input invalid, parser OCR, keamanan CSV.
- `server.mjs`: preview lokal. Rute `/__mobile` hanya untuk pemeriksaan viewport 390px.

## Verifikasi yang selesai

Empat pengujian logika otomatis lulus. Pemeriksaan browser mencakup halaman depan, desktop, viewport ponsel 390px, tambah transaksi dan pembaruan saldo/grafik, perubahan anggaran, laporan mingguan, serta OCR struk sintetis (total Rp25.000 dan tanggal 26/10/2026 terbaca). Tidak ada error console saat alur-alur tersebut diuji.

Skema awal diuji dengan pemeriksaan kebijakan database dan Supabase Security Advisors tanpa temuan. Pengujian login email, pengiriman email, sinkronisasi lintas perangkat, dan isolasi runtime dua akun masih memerlukan pengujian dengan akun terverifikasi. Akurasi OCR tergantung foto dan format struk. Belum dilakukan load test atau pemeriksaan semua browser/perangkat.

Website diterbitkan secara privat melalui Sites. Untuk penggunaan di luar Sites, unggah `dist/` ke hosting statis HTTPS; kode tidak membutuhkan layanan Lovable.
