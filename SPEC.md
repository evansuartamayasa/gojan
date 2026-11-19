# SPEC — GoJan

Aplikasi katalog produk UMKM makanan/minuman berbasis web. Satu perangkat dipakai bersama oleh calon pembeli (mode katalog) dan pengelola toko (mode dashboard demo).

| Atribut | Nilai |
|---|---|
| Nama produk | GoJan |
| Jenis | Aplikasi web statis (single page) |
| Stack | Vite + JavaScript vanilla (ES modules), HTML, CSS |
| Backend | Tidak ada |
| Penyimpanan | `localStorage` peramban |
| Target pengerjaan | Latihan 1 hari (± 8 jam efektif) |
| Status dokumen | Final untuk MVP |

**Catatan repositori:** berkas `index.html`, `css/`, `js/`, `CATATAN.md`, dan `UI-SPEC.md` yang ada saat ini milik latihan landing page **BersihKilat** (jasa housekeeping) dan **tidak** menjadi bagian aplikasi ini. Implementasi GoJan akan dibuat sebagai proyek Vite terpisah di subfolder `GoJan/` agar tidak menimpa pekerjaan lama. Keputusan lokasi ini tidak memengaruhi perilaku yang dispesifikasikan di bawah.

---

## 1. Tujuan

1. Menyediakan katalog produk UMKM yang bisa dibuka tanpa instalasi, tanpa akun, dan tanpa koneksi ke server.
2. Memungkinkan calon pembeli menemukan produk dengan cepat (cari, filter kategori, urutkan) lalu menghubungi penjual lewat WhatsApp dengan pesan yang sudah terisi.
3. Memungkinkan pengelola toko mengelola katalog (tambah, lihat, ubah, hapus) lewat dashboard demo dan melihat ringkasan persediaan, dengan data yang tetap ada setelah halaman dimuat ulang.
4. Menjadi latihan satu hari yang utuh: satu alur data (state → render → simpan), tanpa framework, tanpa backend.

**Kriteria keberhasilan latihan:** seluruh acceptance criteria di §9 lulus secara manual dalam satu kali sesi pemeriksaan, tanpa error di konsol.

---

## 2. Pengguna

| Persona | Kebutuhan utama | Konteks pakai |
|---|---|---|
| **Calon pembeli** — pelanggan UMKM, 18–45 tahun, mobile-first | Lihat produk, tahu harga & stok, cari yang spesifik, langsung chat penjual | Ponsel, koneksi lambat, tidak mau daftar akun |
| **Pengelola toko** — pemilik UMKM, bukan teknis | Menambah produk baru, memperbaiki harga/stok, menghapus produk yang tidak dijual, melihat total stok | Ponsel atau laptop, satu perangkat yang sama dengan pembeli |

**Model peran:** tidak ada autentikasi dan **tidak ada login palsu** (tidak ada layar kata sandi, tidak ada tombol "masuk" yang hanya kosmetik). Pindah peran dilakukan lewat tab navigasi "Katalog" / "Dashboard" yang selalu terlihat. Dashboard diberi label jelas **"Demo pengelola — data tersimpan di perangkat ini"** agar tidak disalahartikan sebagai sistem toko sungguhan.

**Asumsi:** satu perangkat, satu peramban, satu pengguna aktif pada satu waktu. Tidak ada sinkronisasi antar perangkat.

---

## 3. Daftar Fitur (MVP)

Prioritas: **P0** = wajib untuk dianggap selesai; **P1** = dikerjakan bila waktu tersisa.

### 3.1 Katalog (pembeli)

| ID | Fitur | Detail | Prio |
|---|---|---|---|
| F-01 | Katalog 8 produk contoh | Dimuat otomatis saat pertama kali dibuka. Data contoh nonpribadi (nama produk UMKM fiktif, tanpa nama/telepon orang). | P0 |
| F-02 | Kartu produk | Foto, badge "Unggulan" (bila `unggulan: true`), nama, kategori, harga Rupiah terformat, status stok, deskripsi ringkas (maks. 2 baris dengan elipsis). | P0 |
| F-03 | Foto lokal / placeholder | `imageUrl` menunjuk berkas di `public/img/`. Bila kosong atau gagal dimuat, tampilkan placeholder SVG lokal (inisial + warna kategori) — bukan layanan gambar pihak ketiga. | P0 |
| F-04 | Harga Rupiah | Ditampilkan `Rp45.000` (tanpa desimal, pemisah titik) menggunakan `Intl.NumberFormat('id-ID')`. Nilai mentah tetap integer. | P0 |
| F-05 | Status stok | `stok = 0` → label "Habis" + kartu diredupkan secara proporsional (teks tetap lolos kontras); `1–5` → "Stok menipis: N"; `> 5` → "Stok: N". | P0 |
| F-06 | Pencarian | Satu kolom teks; mencocokkan nama, kategori, dan deskripsi; tidak peka huruf besar/kecil; spasi di awal/akhir diabaikan. Hasil diperbarui saat mengetik. | P0 |
| F-07 | Filter kategori | Chip "Semua" + kategori yang diturunkan dari data. Satu kategori aktif pada satu waktu; chip aktif ditandai `aria-pressed="true"` dan secara visual. | P0 |
| F-08 | Sorting | Pilihan: **Unggulan dulu** (default; unggulan lebih dulu, lalu nama A–Z), **Nama A–Z**, **Harga terendah**, **Harga tertinggi**, **Stok terendah**. | P0 |
| F-09 | Gabungan & reset | Pencarian + filter + sorting berlaku bersamaan (AND). Tombol "Reset" mengembalikan pencarian kosong, kategori "Semua", sorting default. | P0 |
| F-10 | Jumlah hasil & keadaan kosong | Baris "Menampilkan N dari 8 produk" dengan `aria-live="polite"`. Bila N = 0, tampilkan pesan kosong + tombol "Tampilkan semua produk". | P0 |
| F-11 | Tombol pesan WhatsApp | Satu tombol per kartu. Bila stok > 0: "Pesan via WhatsApp". Bila stok = 0: "Tanya ketersediaan". Membuka `https://wa.me/<nomor>?text=<pesan ter-encode>` di tab baru (`rel="noopener noreferrer"`). Pesan memuat nama produk, harga, dan jumlah 1 (MVP tanpa keranjang). | P0 |
| F-12 | Nomor WhatsApp terpusat | Nomor disimpan di satu konstanta konfigurasi (`CONFIG.WA_NUMBER`, placeholder `6281234567890`). Tidak ada nomor tersebar di banyak tempat. | P0 |

### 3.2 Dashboard demo (pengelola)

| ID | Fitur | Detail | Prio |
|---|---|---|---|
| F-13 | Ringkasan persediaan | Kartu KPI: **total produk**, **total stok** (jumlah semua `stok`), **produk habis** (`stok = 0`). Nilai dihitung ulang setelah setiap mutasi. | P0 |
| F-14 | Tabel/daftar produk | Kolom: foto mini, nama, kategori, harga, stok, unggulan, aksi (Ubah/Hapus). Di mobile menjadi daftar kartu (label–nilai), tanpa scroll horizontal. | P0 |
| F-15 | Create | Form tambah produk; produk baru langsung muncul di katalog dan dashboard. | P0 |
| F-16 | Read | Form ubah terisi data produk terpilih; data yang tampil di form identik dengan data tersimpan. | P0 |
| F-17 | Update | Simpan perubahan; kartu katalog dan ringkasan ikut berubah tanpa reload. | P0 |
| F-18 | Delete | Hapus dengan dialog konfirmasi yang menyebut nama produk. Batal tidak mengubah apa pun. | P0 |
| F-19 | Validasi form | Aturan di §5.3; pesan galat per field, fokus pindah ke field pertama yang salah, form tidak tersimpan bila ada galat. | P0 |
| F-20 | Reset data contoh | Tombol "Muat ulang data contoh" (dengan konfirmasi) mengembalikan 8 produk awal dan menghapus perubahan. | P0 |
| F-21 | Notifikasi aksi | Toast singkat "Produk ditambahkan / diperbarui / dihapus" di `aria-live="polite"`, hilang otomatis ≤ 4 detik. | P1 |
| F-22 | Badge stok menipis di tabel | Menandai baris dengan `stok ≤ 5`. | P1 |

### 3.3 Penyimpanan & ketahanan

| ID | Fitur | Detail | Prio |
|---|---|---|---|
| F-23 | Persistensi localStorage | Setiap mutasi berhasil langsung ditulis ke `GoJan:v1:products`. Reload halaman mempertahankan data. | P0 |
| F-24 | Pemulihan data rusak | JSON tidak valid / bukan array / skema tidak dikenali → pakai data contoh, tampilkan banner "Data tersimpan tidak dapat dibaca, katalog dimuat ulang dari data contoh", dan jangan menimpa data lama sebelum pengguna menekan "Muat ulang data contoh". | P0 |
| F-25 | Peringatan kuota penuh | Bila `localStorage.setItem` melempar `QuotaExceededError`, tampilkan galat yang bisa ditutup, pertahankan state di memori, jangan mengklaim "tersimpan". | P0 |
| F-26 | Sinkron antar tab | Mendengarkan event `storage` dan memuat ulang state bila kunci berubah di tab lain. | P1 |

---

## 4. Data Model

Satu entitas: **Product**. Disimpan sebagai array JSON di satu kunci localStorage.

```json
{
  "id": "p01",
  "nama": "Kopi Robusta Tubruk 200g",
  "kategori": "Minuman",
  "harga": 45000,
  "stok": 12,
  "deskripsi": "Kopi robusta sangrai medium, digiling kasar untuk tubruk.",
  "imageUrl": "/img/kopi-robusta.svg",
  "unggulan": true
}
```

| Field | Tipe | Aturan | Wajib |
|---|---|---|---|
| `id` | string | Unik, stabil, tidak diubah saat edit. Format `p` + `Date.now().toString(36)` untuk produk baru; data contoh memakai `p01`–`p08`. | Ya |
| `nama` | string | 2–60 karakter setelah trim; spasi berlebih dirapikan. | Ya |
| `kategori` | string | 1–24 karakter; dipilih dari kategori yang ada atau diketik baru (datalist). Tidak ada CRUD kategori terpisah. | Ya |
| `harga` | number (integer) | `>= 0`, `<= 100000000`, tanpa desimal, dalam Rupiah. | Ya |
| `stok` | number (integer) | `>= 0`, `<= 100000`, tanpa desimal. | Ya |
| `deskripsi` | string | 0–280 karakter; boleh kosong. | Tidak |
| `imageUrl` | string | Kosong, atau path lokal yang dimulai `/img/` dan berakhiran `.svg/.png/.jpg/.webp`. URL absolut (`http://`, `https://`, `//`) ditolak. | Tidak |
| `unggulan` | boolean | `true`/`false`; tidak boleh string. | Ya |

**Aturan turunan (tidak disimpan):**
- `stokStatus` = `habis` (0) / `menipis` (1–5) / `tersedia` (>5).
- `totalProduk` = panjang array; `totalStok` = Σ `stok`; `jumlahHabis` = hitungan `stok === 0`.
- `kategoriTersedia` = daftar unik `kategori`, diurutkan A–Z.

**Kunci penyimpanan & skema:**

| Kunci | Isi |
|---|---|
| `GoJan:v1:products` | `JSON.stringify(Product[])` |
| `GoJan:v1:schema` | `"1"` (string) — penanda versi skema |

Aturan versi: bila `schema` tidak ada atau bukan `"1"`, diperlakukan sebagai data tidak dikenali (jalur F-24). Migrasi otomatis hanya dilakukan bila versi lebih lama dan aturannya ditulis di kode; untuk MVP, hanya ada versi 1.

**Data contoh (8 produk, nonpribadi):**

| id | nama | kategori | harga | stok | unggulan |
|---|---|---|---|---|---|
| p01 | Kopi Robusta Tubruk 200g | Minuman | 45000 | 12 | ya |
| p02 | Kopi Arabika Gayo 200g | Minuman | 68000 | 0 | tidak |
| p03 | Sambal Bawang Botol 150ml | Makanan | 32000 | 20 | ya |
| p04 | Keripik Pisang Cokelat 150g | Camilan | 25000 | 35 | tidak |
| p05 | Teh Melati Premium 100g | Minuman | 28000 | 18 | tidak |
| p06 | Brownies Kukus Pandan | Kue | 55000 | 4 | ya |
| p07 | Madu Hutan 250ml | Makanan | 62000 | 9 | tidak |
| p08 | Granola Madu 250g | Camilan | 62000 | 8 | tidak |

Data ini sengaja memuat: satu produk habis (p02), satu stok menipis (p06), tiga unggulan, dua kategori dengan harga sama (p07 & p08) untuk menguji sorting, dan empat kategori terisi.

---

## 5. Perilaku & Aturan Rinci

### 5.1 Alur pembeli
1. Halaman terbuka pada tab **Katalog**; 8 produk tampil, sorting default "Unggulan dulu".
2. Pengguna mengetik di kolom cari → hasil menyempit; jumlah hasil diumumkan.
3. Pilih chip kategori → hasil menyempit lagi; kombinasi dengan pencarian.
4. Ubah sorting → urutan berubah tanpa kehilangan pencarian/filter.
5. Tidak ada hasil → keadaan kosong dengan tombol reset.
6. Klik "Pesan via WhatsApp" → tab baru ke `wa.me` dengan pesan berisi nama produk, harga, dan jumlah 1. Tombol pada produk habis memakai pesan berbeda ("menanyakan ketersediaan").

### 5.2 Alur pengelola
1. Pindah ke tab **Dashboard**; KPI dan tabel tampil dari state yang sama dengan katalog.
2. "Tambah produk" membuka form kosong (modal atau panel di halaman — keputusan implementasi, tetapi harus accessible).
3. Simpan → data tersimpan, katalog & dashboard diperbarui, toast muncul.
4. "Ubah" membuka form terisi; simpan memperbarui baris yang sama (bukan membuat duplikat).
5. "Hapus" membuka konfirmasi; setelah konfirmasi baris hilang dan KPI berubah.
6. Reload → semua perubahan tetap ada.
7. "Muat ulang data contoh" → konfirmasi → 8 produk awal kembali.

### 5.3 Aturan validasi form
| Field | Aturan | Pesan galat (contoh) |
|---|---|---|
| Nama | wajib, 2–60 karakter | "Nama produk wajib diisi (2–60 karakter)." |
| Kategori | wajib, 1–24 karakter | "Pilih atau tulis kategori." |
| Harga | wajib, bilangan bulat, 0–100.000.000 | "Harga harus angka bulat 0–100.000.000." |
| Stok | wajib, bilangan bulat, 0–100.000 | "Stok harus angka bulat 0–100.000." |
| Deskripsi | opsional, ≤ 280 karakter | "Deskripsi maksimal 280 karakter." |
| Gambar | opsional, hanya path lokal `/img/...` | "Gunakan path lokal /img/nama-file.svg." |

Validasi dijalankan saat submit (dan saat blur untuk field yang sudah disentuh). Pesan galat ditampilkan di bawah field, dihubungkan `aria-describedby`, dan ringkasan galat di atas form menerima fokus. Input tidak pernah "diam-diam dibulatkan": `12.5` untuk stok adalah galat, bukan 12.

### 5.4 Aturan rendering & keamanan
- Semua teks dari data pengguna dirender dengan `textContent` (atau escaping setara), **tidak** lewat `innerHTML` berisi string produk.
- `imageUrl` divalidasi sebelum dipakai sebagai `src`; `onerror` mengganti ke placeholder.
- Tidak ada `eval`, `new Function`, atau penyisipan HTML mentah dari input.
- Semua tautan eksternal memakai `target="_blank"` + `rel="noopener noreferrer"`.

---

## 6. Non-Functional Requirements

| ID | Kategori | Persyaratan | Cara memeriksa |
|---|---|---|---|
| NFR-01 | Kinerja | Muat awal < 2 detik di localhost (bundel JS+CSS < 150 KB sebelum gzip, tanpa gambar berat). | DevTools Network, hard reload |
| NFR-02 | Kinerja | Pencarian/filter/sort terasa instan (< 100 ms untuk 8–50 produk). | Uji ketik cepat |
| NFR-03 | Aksesibilitas | Kontras teks ≥ 4.5:1 (teks normal) dan ≥ 3:1 (teks besar/ikon fungsional). | Inspeksi DevTools / kontras checker |
| NFR-04 | Aksesibilitas | Seluruh alur dapat diselesaikan dengan keyboard saja: skip link → navbar → filter → kartu → dashboard → form → dialog. | Uji Tab/Shift+Tab/Enter/Esc |
| NFR-05 | Aksesibilitas | Fokus selalu terlihat; dialog mengunci fokus dan mengembalikannya ke pemicu saat ditutup. | Uji keyboard |
| NFR-06 | Aksesibilitas | Setiap input punya `<label for>`; tombol ikon punya `aria-label`; hasil pencarian & toast punya `aria-live="polite"`. | Inspeksi DOM |
| NFR-07 | Responsif | Tidak ada scroll horizontal pada lebar 320, 360, 390, 768, 1024, 1440 px. | Resize / device toolbar |
| NFR-08 | Responsif | Target sentuh ≥ 44×44 px untuk tombol, chip, dan aksi tabel. | Inspeksi |
| NFR-09 | Ketahanan | Reload dan tutup-buka tab mempertahankan data. | Uji manual |
| NFR-10 | Ketahanan | Data localStorage rusak tidak membuat halaman blank; muncul banner dan katalog memakai data contoh. | Ubah nilai kunci lewat DevTools |
| NFR-11 | Kapasitas | Ukuran data tersimpan < 1 MB untuk 100 produk berisi deskripsi maksimum. | DevTools Application |
| NFR-12 | Kompatibilitas | Chrome, Edge, Firefox, Safari versi stabil terbaru (2 versi terakhir). | Uji minimal Chrome + Firefox |
| NFR-13 | Kualitas kode | Tanpa error/warning di konsol; `npm run build` sukses. | Konsol + terminal |
| NFR-14 | Privasi | Tidak ada analytics, cookie, atau permintaan jaringan selain berkas lokal dan `wa.me` saat diklik. | DevTools Network |
| NFR-15 | Kejujuran UI | Label demo terlihat di dashboard; tidak ada fitur yang tampak aktif padahal tidak berfungsi. | Inspeksi visual |

---

## 7. Risiko

| ID | Risiko | Dampak | Mitigasi |
|---|---|---|---|
| R-01 | Nomor WhatsApp masih placeholder → pesanan masuk ke nomor asing | Tinggi | Nomor hanya di satu konstanta + banner kecil "Nomor contoh" di README; AC-24 memeriksa keseragaman nomor |
| R-02 | Pengguna mengira dashboard demo adalah sistem toko nyata | Sedang | Label "Demo" persisten, teks penyimpanan lokal, tanpa klaim sinkronisasi |
| R-03 | Data hilang karena mode privat / pembersihan situs / kuota | Sedang | F-24/F-25 + ekspektasi tertulis; tombol reset data contoh |
| R-04 | XSS lewat nama/deskripsi produk | Tinggi (walau lokal) | Larangan `innerHTML` untuk data pengguna, validasi `imageUrl` (F-14, §5.4) |
| R-05 | Escape encoding pesan WhatsApp salah (spasi, `&`, newline) | Rendah | Selalu `encodeURIComponent`, AC-19 memeriksa teks terurai benar |
| R-06 | Harga tampil salah (desimal, pembulatan) | Sedang | Integer-only + `Intl.NumberFormat('id-ID')` + AC-05 |
| R-07 | Hapus tidak sengaja | Sedang | Dialog konfirmasi menyebut nama produk; reset tersedia |
| R-08 | Waktu 1 hari habis sebelum CRUD selesai | Sedang | Urutan iterasi §10; P1 boleh dipotong, P0 tidak |
| R-09 | Dua tab menimpa data satu sama lain | Rendah | F-26 (P1); bila tidak dikerjakan, dicatat sebagai batasan |
| R-10 | Foto contoh melanggar lisensi | Rendah | Hanya SVG placeholder buatan sendiri; tanpa foto stok |
| R-11 | `localStorage` diblokir kebijakan peramban | Rendah | Aplikasi tetap berjalan di memori + banner peringatan |

---

## 8. Out of Scope

Tidak dikerjakan pada MVP ini:

1. Backend, API, database, atau sinkronisasi antar perangkat.
2. Autentikasi, akun, peran berbasis hak akses, dan **login palsu** dalam bentuk apa pun.
3. Keranjang, checkout, pembayaran, ongkos kirim, dan pengurangan stok otomatis saat pesanan dikirim.
4. Manajemen pesanan (status, riwayat, pelanggan) — dashboard hanya mengelola produk.
5. Unggah foto dari perangkat atau kamera; hanya path lokal/placeholder.
6. CRUD kategori terpisah (kategori mengikuti data produk).
7. Impor/ekspor CSV/JSON, cetak, dan backup manual.
8. Multi-bahasa, mode gelap, PWA/offline install, notifikasi push.
9. Unit/E2E test otomatis; verifikasi MVP dilakukan manual sesuai §9.
10. Deployment, domain, SEO lanjutan, dan optimasi gambar tingkat lanjut.

---

## 9. Acceptance Criteria

Semua kriteria diperiksa manual pada build produksi lokal (`npm run build` lalu `npm run preview`) dan dev server. "Data bersih" = localStorage dikosongkan lalu halaman dimuat ulang.

### 9.1 Katalog & data awal
| ID | Langkah | Hasil yang diharapkan |
|---|---|---|
| AC-01 | Buka aplikasi dengan data bersih | Tepat 8 produk tampil; tab Katalog aktif; tanpa error konsol |
| AC-02 | Periksa urutan awal | Produk `unggulan: true` (p01, p03, p06) muncul lebih dulu, lalu sisanya A–Z |
| AC-03 | Periksa satu kartu | Menampilkan gambar/placeholder, nama, kategori, harga `Rp45.000`, status stok, deskripsi ≤ 2 baris |
| AC-04 | Hapus/rename berkas gambar salah satu produk lalu reload | Placeholder lokal tampil menggantikan gambar; tidak ada ikon gambar rusak; tidak ada permintaan jaringan eksternal |
| AC-05 | Periksa semua harga | Format `Rp` + pemisah ribuan titik, tanpa desimal; nilai p07 & p08 tampil `Rp62.000` |
| AC-06 | Cari produk dengan `stok = 0` (p02) | Label "Habis", tombol bertuliskan "Tanya ketersediaan"; teks tetap terbaca (kontras ≥ 4.5:1) |
| AC-07 | Cari produk `stok = 4` (p06) | Label "Stok menipis: 4" |
| AC-08 | Cari produk `stok = 35` (p04) | Label "Stok: 35" |

### 9.2 Pencarian, filter, sorting
| ID | Langkah | Hasil yang diharapkan |
|---|---|---|
| AC-09 | Ketik `kopi` | Hanya p01 & p02 tampil; baris hasil "Menampilkan 2 dari 8 produk" |
| AC-10 | Ketik `KOPI` | Hasil sama dengan AC-09 (tidak peka huruf besar/kecil) |
| AC-11 | Ketik `  kopi  ` (spasi di tepi) | Hasil sama dengan AC-09 |
| AC-12 | Ketik `sambal` saat kategori "Minuman" aktif | 0 hasil + keadaan kosong + tombol "Tampilkan semua produk" |
| AC-13 | Klik "Tampilkan semua produk" | Pencarian kosong, kategori "Semua", 8 produk tampil |
| AC-14 | Pilih chip "Minuman" | Hanya 3 produk (p01, p02, p05); chip aktif ditandai visual + `aria-pressed="true"` |
| AC-15 | Pilih "Harga terendah" | Urutan: 25000, 28000, 32000, 45000, 55000, 62000, 62000, 68000 |
| AC-16 | Pilih "Harga tertinggi" | Kebalikan AC-15 |
| AC-17 | Pilih "Stok terendah" | Produk stok 0 paling atas, lalu 4, 8, 9, 12, 18, 20, 35 |
| AC-18 | Gabungkan cari `a` + kategori "Camilan" + "Harga terendah" | Hanya produk Camilan yang memuat huruf "a", urut harga naik; filter lain tidak ter-reset |

### 9.3 WhatsApp
| ID | Langkah | Hasil yang diharapkan |
|---|---|---|
| AC-19 | Klik "Pesan via WhatsApp" pada p01 | Tab baru `wa.me` terbuka; pesan berisi "Kopi Robusta Tubruk 200g", `Rp45.000`, dan jumlah 1; spasi & baris baru ter-encode benar |
| AC-20 | Klik tombol pada p02 (habis) | Pesan menanyakan ketersediaan, bukan menyatakan pesanan |
| AC-21 | Periksa seluruh tautan WA di aplikasi | Semua memakai nomor yang sama dari satu konfigurasi; `rel` memuat `noopener`; teks tombol menjelaskan tujuan |
| AC-22 | Blokir pop-up lalu klik tombol WA | Tidak ada error konsol; pengguna tetap mendapat umpan balik (pesan/tautan cadangan) |

### 9.4 Dashboard & CRUD
| ID | Langkah | Hasil yang diharapkan |
|---|---|---|
| AC-23 | Buka tab Dashboard | Label demo terlihat; KPI: total produk 8, total stok 106, produk habis 1 |
| AC-24 | Tambah produk valid (nama "Teh Jahe Instan", kategori "Minuman", harga 15000, stok 10) | Produk muncul di tabel & katalog; KPI menjadi 9 produk / 116 stok; toast sukses |
| AC-25 | Submit form kosong | Tidak tersimpan; 4 pesan galat tampil; fokus pindah ke field nama |
| AC-26 | Isi harga `12.5` dan stok `-1` | Ditolak dengan pesan galat; data lama tidak berubah |
| AC-27 | Isi `imageUrl` dengan `https://contoh.com/a.jpg` | Ditolak dengan pesan path lokal; produk tidak tersimpan |
| AC-28 | Ubah harga p03 menjadi 35000, simpan | Kartu katalog & tabel menampilkan `Rp35.000`; jumlah produk tetap 9 (tidak ada duplikat) |
| AC-29 | Hapus produk hasil AC-24, batalkan konfirmasi | Produk tetap ada; KPI tidak berubah |
| AC-30 | Hapus produk hasil AC-24, konfirmasi | Produk hilang dari tabel & katalog; KPI kembali 8 / 106 / 1 |
| AC-31 | Reload halaman setelah perubahan | Seluruh perubahan (tambah/ubah/hapus) tetap ada |
| AC-32 | Klik "Muat ulang data contoh" lalu konfirmasi | Kembali ke 8 produk awal dengan nilai pada §4 |
| AC-33 | Isi nama produk dengan `<img src=x onerror=alert(1)>` | Teks tampil apa adanya sebagai teks; tidak ada dialog alert, tidak ada elemen gambar disisipkan |

### 9.5 Ketahanan & aksesibilitas
| ID | Langkah | Hasil yang diharapkan |
|---|---|---|
| AC-34 | Set `GoJan:v1:products` menjadi `{rusak` lewat DevTools, reload | Banner data tidak terbaca tampil; katalog memakai 8 data contoh; halaman tidak blank |
| AC-35 | Kosongkan `GoJan:v1:schema`, reload | Diperlakukan sebagai data tidak dikenali; banner tampil; tidak menimpa diam-diam |
| AC-36 | Selesaikan alur beli (cari → filter → buka WA) hanya dengan keyboard | Semua langkah tercapai; fokus selalu terlihat; tidak ada jebakan fokus |
| AC-37 | Buka dialog tambah/ubah, tekan `Esc` | Dialog tertutup; fokus kembali ke tombol pemicu |
| AC-38 | Resize ke 320 px dan 1440 px | Tanpa scroll horizontal; kartu & tabel tetap terbaca; tombol ≥ 44 px di mobile |
| AC-39 | Inspeksi kontras teks utama, teks sekunder, tombol primer & WA | Semua ≥ 4.5:1 (teks normal) / ≥ 3:1 (teks besar) |
| AC-40 | Aktifkan `prefers-reduced-motion: reduce` | Animasi/transisi non-esensial tidak berjalan; tidak ada konten yang hilang |
| AC-41 | Jalankan `npm run build` | Build sukses tanpa error; `npm run preview` menyajikan aplikasi yang berfungsi sama |
| AC-42 | Periksa tab Network saat memuat halaman | Hanya aset lokal (kecuali tidak ada permintaan ke `wa.me` sebelum tombol diklik) |

### 9.6 Traceability fitur → AC

| Fitur | AC |
|---|---|
| F-01, F-02, F-03 | AC-01, AC-03, AC-04, AC-33 |
| F-04 | AC-05 |
| F-05 | AC-06, AC-07, AC-08 |
| F-06 | AC-09, AC-10, AC-11 |
| F-07 | AC-14 |
| F-08 | AC-15, AC-16, AC-17 |
| F-09, F-10 | AC-12, AC-13, AC-18 |
| F-11, F-12 | AC-19, AC-20, AC-21, AC-22 |
| F-13, F-14 | AC-23, AC-31 |
| F-15..F-19 | AC-24..AC-30, AC-33 |
| F-20 | AC-32 |
| F-21 | AC-24, AC-28, AC-30 |
| F-23..F-25 | AC-31, AC-34, AC-35 |
| NFR-03..NFR-08 | AC-36..AC-39 |
| NFR-13, NFR-14 | AC-41, AC-42 |

F-21 dan F-22 (P1) serta NFR-01, NFR-02, NFR-09–NFR-12, dan NFR-15 tidak punya AC bernomor karena diperiksa langsung saat Iterasi 6. Bila item P1 dipotong, kriteria terkait otomatis tidak berlaku dan dicatat di README.

---

## 10. Implementation Plan per Iterasi

Total target ± 8 jam. Setiap iterasi punya definisi selesai (DoD) yang bisa dilihat di layar, sehingga progres tidak bergantung pada "hampir selesai".

### Iterasi 0 — Fondasi proyek (45 menit)
- Scaffold Vite (vanilla, tanpa template framework), struktur folder, `README` singkat.
- Struktur yang direncanakan:
  - `index.html` — satu dokumen, dua tab (Katalog/Dashboard), kontainer dialog & toast.
  - `src/main.js` — bootstrap, event delegation, orkestrasi.
  - `src/state.js` — state produk, mutasi, seleksi (cari/kategori/sort), derived values.
  - `src/storage.js` — baca/tulis/validasi localStorage, penanganan kuota & data rusak.
  - `src/products.js` — 8 data contoh + validasi model.
  - `src/ui/catalog.js`, `src/ui/dashboard.js`, `src/ui/dialog.js`, `src/ui/toast.js`.
  - `src/format.js` — format Rupiah, status stok, encoding pesan WA.
  - `src/config.js` — `WA_NUMBER`, batas validasi, kunci storage.
  - `src/styles/` — token warna/tipe/spasi, layout, komponen.
  - `public/img/` — 8 SVG placeholder lokal.
- Token visual: krem hangat + hijau rempah (konsisten dengan `UI-SPEC.md` repo), font sans-serif sistem, radius 12/16.
- **DoD:** `npm run dev` menyajikan halaman kosong tanpa error; struktur folder & konstanta konfigurasi ada.

### Iterasi 1 — Model, seed, penyimpanan (1,5 jam)
- Implementasi model + validasi (`products.js`), 8 data contoh sesuai §4.
- Baca/tulis localStorage dengan skema versi, penanganan data rusak (F-24) dan kuota (F-25).
- Derived: total produk, total stok, jumlah habis, daftar kategori.
- **DoD:** di konsol, fungsi muat/simpan mengembalikan 8 produk; menaruh JSON rusak memunculkan banner alih-alih crash.

### Iterasi 2 — Katalog read-only (1,5 jam)
- Render grid kartu (F-02, F-03, F-04, F-05), placeholder SVG, badge unggulan, deskripsi elipsis.
- Layout mobile-first 1→2→3 kolom.
- **DoD:** 8 kartu tampil benar di 320 px dan 1440 px; AC-03..AC-08 lulus.

### Iterasi 3 — Cari, filter, sort, keadaan kosong (1 jam)
- State seleksi + render ulang terpusat; input pencarian, chip kategori, select sorting, tombol reset.
- Baris jumlah hasil `aria-live`; keadaan kosong (F-10).
- **DoD:** AC-09..AC-18 lulus; mengetik terasa instan.

### Iterasi 4 — WhatsApp (30 menit)
- `buildWaUrl(product)` dengan `encodeURIComponent`, varian pesan untuk stok habis, `noopener noreferrer`, fallback pop-up.
- **DoD:** AC-19..AC-22 lulus; nomor hanya ada di `config.js`.

### Iterasi 5 — Dashboard CRUD (2 jam)
- Tab dashboard, KPI, tabel desktop / kartu mobile.
- Form tambah/ubah dengan validasi §5.3, dialog konfirmasi hapus, reset data contoh, toast.
- **DoD:** AC-23..AC-33 lulus; tidak ada duplikat ID setelah edit.

### Iterasi 6 — Aksesibilitas, ketahanan, QA manual (1 jam)
- Fokus, label, `aria-*`, kontras, `prefers-reduced-motion`, uji 320 px, uji keyboard penuh, uji data rusak.
- Jalankan `npm run build` + `npm run preview`, lalu telusuri seluruh §9 dan centang hasilnya.
- Perbarui README: cara menjalankan, cara mengganti nomor WA, batasan demo.
- **DoD:** AC-01..AC-42 lulus atau tercatat sebagai kegagalan dengan alasan; tidak ada error konsol.

### Prioritas bila waktu mepet
1. Potong P1: F-21 (toast), F-22 (badge menipis di tabel), F-26 (sinkron tab). Catat di README.
2. Jangan potong: katalog, pencarian/filter/sorting, WhatsApp, CRUD + validasi, ringkasan, persistensi, penanganan data rusak.
3. Bila CRUD belum selesai, dashboard boleh tampil read-only **hanya jika** label "belum bisa mengubah data" terlihat jelas — tetapi ini berarti MVP belum selesai.

---

## 11. Asumsi & Pertanyaan Terbuka

**Asumsi yang dipakai (boleh dikoreksi tanpa mengubah struktur dokumen):**
1. Aplikasi dibangun di subfolder `GoJan/` dan tidak mengubah berkas BersihKilat.
2. Kategori bersifat bebas-teks dengan saran dari data yang ada, bukan entitas terpisah.
3. Jumlah pesanan WhatsApp selalu 1 (tanpa pemilih kuantitas).
4. Bahasa antarmuka Indonesia; mata uang Rupiah; zona waktu tidak relevan.
5. Gambar contoh dibuat sendiri sebagai SVG; tidak ada aset eksternal.

**Pertanyaan yang perlu diputuskan sebelum Iterasi 2:**
1. Dashboard sebagai bagian satu halaman (tab) atau halaman terpisah dengan hash route? *Rekomendasi: satu halaman, hash `#dashboard`, agar state tidak perlu dipulihkan.*
2. Form CRUD memakai `<dialog>` native atau panel inline? *Rekomendasi: `<dialog>` native + fallback fokus manual.*
3. Apakah produk `stok = 0` tetap boleh dipesan lewat WhatsApp? *Rekomendasi: ya, dengan pesan "tanya ketersediaan" seperti AC-20.*
