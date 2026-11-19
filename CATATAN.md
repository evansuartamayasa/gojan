# CATATAN — Latihan Landing Page Housekeeping

## Tujuan latihan
Membangun landing page jasa housekeeping profesional ("BersihKilat") dari nol dengan HTML, CSS, dan JavaScript murni (tanpa framework atau build step), sekaligus melatih:

- struktur HTML semantik dan aksesibilitas dasar (skip link, label form, `aria-live`);
- layout responsif dengan CSS Grid/Flexbox dan media query;
- interaksi JavaScript: menu mobile, scrollspy, animasi reveal, validasi form, dan perhitungan estimasi biaya otomatis;
- alur konversi sederhana dari formulir langsung ke pesan WhatsApp.

## Target aplikasi
Landing page satu halaman untuk usaha jasa kebersihan rumahan dan kantor, berisi:

- profil singkat dan keunggulan layanan;
- daftar layanan: Daily Cleaning, Deep Cleaning, Pembersihan Kantor/Apartemen;
- paket harga: Reguler, Lengkap, dan Berlangganan;
- formulir pemesanan dengan estimasi biaya otomatis dan konfirmasi via WhatsApp;
- testimoni, kontak, jam operasional, dan area layanan.

Target pengguna: pemilik rumah, penghuni apartemen, dan pengelola kantor kecil di kota besar yang mencari jasa kebersihan dengan pemesanan cepat.

## Risiko penggunaan AI yang perlu diperiksa
**Nomor WhatsApp dan tarif masih placeholder.** Nomor `6281234567890`, harga mulai, serta estimasi biaya dihasilkan sebagai contoh dan belum terhubung ke bisnis nyata. Sebelum situs dipakai, ganti nomor WhatsApp di `js/main.js` dan tautan `wa.me` di halaman, lalu cocokkan semua tarif dengan daftar harga resmi. Tanpa pemeriksaan ini, pesanan pelanggan bisa masuk ke nomor yang salah atau ditagih dengan harga yang keliru.
