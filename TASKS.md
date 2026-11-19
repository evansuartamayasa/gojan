# TASKS — Housekeeper

Rincian pekerjaan untuk membangun aplikasi katalog produk UMKM **Housekeeper** sesuai `SPEC.md`. Setiap tugas punya kriteria penerimaan yang bisa diperiksa di layar dan daftar berkas yang kemungkinan berubah. Dokumen ini tidak mengubah kode.

| Atribut | Nilai |
|---|---|
| Sumber perilaku | `SPEC.md` §3–§9 (fitur, model data, NFR, acceptance criteria) |
| Sumber visual | `UI-SPEC.md` — **hanya** token warna, tipografi, radius, focus ring, dan aturan target sentuh 44 px |
| Lokasi kode | `housekeeper/` (proyek Vite terpisah; tidak menyentuh berkas BersihKilat) |
| Total estimasi MVP | ± 7 jam 45 menit untuk M0–M9 |
| Status | Rencana, belum ada implementasi |

## Catatan sumber daya desain

`UI-SPEC.md` di repositori ini adalah spesifikasi untuk **BersihKilat**, landing page jasa housekeeping. Dokumen itu tidak boleh dipakai apa adanya karena:

- Komponennya untuk layanan (paket harga, form pemesanan, dashboard pesanan #1042), bukan produk (foto, harga satuan, stok).
- Dashboard di sana bersifat statis; dashboard Housekeeper harus CRUD fungsional.
- Ia mendefinisikan navbar dengan 6 tautan dan scrollspy per section; Housekeeper hanya punya dua tab.

Yang **dipakai ulang**: palet `--cream-50/100/200`, `--green-900/700/500/100`, `--spice-600`, `--wa #1E7A46`, `--focus #1F6FB2`, tabel kontras §2.2, skala spasi 4 px, radius `sm 8 / md 12 / lg 20`, font `Plus Jakarta Sans` + cadangan sistem, dan aturan target sentuh 44×44 px. Yang **tidak dipakai**: seluruh tata letak section, wireframe, form pemesanan, harga paket, testimoni, tombol float WhatsApp, sidebar dashboard.

Aset gambar tidak boleh diambil dari internet. Delapan SVG dibuat sendiri (R-10).

## Aturan umum

1. **Definisi selesai (DoD) satu tugas:** kriteria penerimaan di bawah terpenuhi manual, tidak ada error di konsol, dan `npm run build` masih sukses setelah tugas itu selesai.
2. **Prioritas:** `P0` wajib untuk MVP; `P1` dipotong lebih dulu bila waktu mepet (`SPEC.md` §10). Tugas P1 ditandai di judulnya.
3. **Kriteria bernomor AC-xx** merujuk langsung ke `SPEC.md` §9 dan tidak boleh dinegosiasikan ulang di sini. Kriteria tanpa nomor AC adalah tambahan operasional untuk tugas itu.
4. **Berkas bertanda `(baru)`** belum ada dan akan dibuat. Berkas bertanda `(ubah)` sudah ada pada tugas sebelumnya dalam urutan ini.
5. **Larangan:** tidak menambah dependensi runtime, tidak memakai `innerHTML` untuk data pengguna, tidak menaruh nomor WhatsApp di luar `src/config.js`, dan tidak mengubah `index.html`, `css/`, `js/`, `CATATAN.md`, `UI-SPEC.md` milik BersihKilat.

## Ringkasan milestone

| ID | Milestone | Tugas | Est. | AC SPEC yang ditutup |
|---|---|---|---|---|
| M0 | Scaffold | 4 | 45 mnt | AC-41 (sebagian) |
| M1 | Model data & seed | 4 | 45 mnt | AC-01, AC-02, AC-23 |
| M2 | Katalog | 5 | 1 j 15 mnt | AC-03..AC-08 |
| M3 | Interaksi pencarian/filter | 5 | 1 j | AC-09..AC-18 |
| M4 | WhatsApp | 3 | 30 mnt | AC-19..AC-22 |
| M5 | CRUD dashboard | 6 | 2 j | AC-23..AC-33 |
| M6 | localStorage | 4 | 45 mnt | AC-31, AC-34, AC-35 |
| M7 | Testing manual | 4 | 30 mnt | AC-36..AC-40, AC-42 |
| M8 | Security review | 4 | 25 mnt | AC-33, AC-27, AC-21 |
| M9 | Build | 2 | 15 mnt | AC-41 |
| M10 | Deployment *(opsional, di luar MVP)* | 4 | 30 mnt | — |

Urutan M0 → M9 adalah urutan ketergantungan: setiap milestone hanya memakai berkas yang dibuat milestone sebelumnya. M10 dikerjakan setelah M9 lulus dan tidak menjadi syarat MVP (`SPEC.md` §8 butir 10 mengecualikan deployment).

---

## M0 — Scaffold

Tujuan: proyek Vite berjalan, struktur folder dan konstanta terpusat ada, halaman kosong tanpa error.

### T-0.1 — Inisialisasi proyek Vite `P0`

- Buat proyek Vite vanilla (tanpa template framework) di `housekeeper/`.
- `npm install`, `npm run dev` menyajikan halaman.
- Tidak ada dependensi runtime tambahan selain Vite sebagai devDependency.

**Kriteria penerimaan**
- `npm run dev` membuka halaman di `localhost` tanpa error konsol.
- Berkas BersihKilat di root tidak berubah (`git status` hanya menunjukkan `housekeeper/`).
- `package.json` hanya memuat Vite di `devDependencies`.

**Berkas mungkin berubah:** `housekeeper/package.json` (baru), `housekeeper/package-lock.json` (baru), `housekeeper/index.html` (baru), `housekeeper/vite.config.js` (baru), `housekeeper/.gitignore` (baru).

### T-0.2 — Struktur modul `P0`

- Buat kerangka berkas kosong/berisi ekspor minimal: `src/main.js`, `src/config.js`, `src/state.js`, `src/storage.js`, `src/products.js`, `src/format.js`, `src/ui/catalog.js`, `src/ui/dashboard.js`, `src/ui/dialog.js`, `src/ui/toast.js`.
- `src/main.js` mengimpor seluruh modul sehingga kesalahan impor langsung terlihat.

**Kriteria penerimaan**
- Semua modul ter-*import* tanpa galat `Cannot find module` atau ekspor hilang.
- Tidak ada modul yang memuat logika bisnis ganda (format Rupiah hanya di `format.js`, nomor WA hanya di `config.js`).

**Berkas mungkin berubah:** `housekeeper/src/main.js` (baru), `housekeeper/src/config.js` (baru), `housekeeper/src/state.js` (baru), `housekeeper/src/storage.js` (baru), `housekeeper/src/products.js` (baru), `housekeeper/src/format.js` (baru), `housekeeper/src/ui/catalog.js` (baru), `housekeeper/src/ui/dashboard.js` (baru), `housekeeper/src/ui/dialog.js` (baru), `housekeeper/src/ui/toast.js` (baru).

### T-0.3 — Konstanta konfigurasi `P0`

- `src/config.js` mengekspor: `WA_NUMBER = '6281234567890'`, `STORAGE_KEYS = { products: 'housekeeper:v1:products', schema: 'housekeeper:v1:schema' }`, `SCHEMA_VERSION = '1'`, batas validasi (`NAMA_MIN 2`, `NAMA_MAX 60`, `HARGA_MAX 100000000`, `STOK_MAX 100000`, `DESKRIPSI_MAX 280`, `KATEGORI_MAX 24`), `LOW_STOCK_THRESHOLD = 5`.

**Kriteria penerimaan**
- Pencarian `6281234567890` di seluruh `housekeeper/src` hanya menemukan `src/config.js`.
- Pencarian string `housekeeper:v1:` hanya menemukan `src/config.js`.
- Mengubah `WA_NUMBER` di satu tempat mengubah semua tautan (diperiksa setelah M4).

**Berkas mungkin berubah:** `housekeeper/src/config.js` (baru).

### T-0.4 — Kerangka dokumen & tab `P0`

- `index.html`: `lang="id"`, skip link, `header` dengan brand + dua tab (`Katalog`, `Dashboard`) memakai `role="tab"`/`aria-selected`, `main`, kontainer dialog, kontainer toast, `aria-live` untuk pengumuman.
- Tab Dashboard menampilkan label tetap "Demo pengelola — data tersimpan di perangkat ini".

**Kriteria penerimaan**
- Satu `h1`; landmark `header`/`main` ada; skip link menjadi elemen fokus pertama saat Tab.
- Kedua tab dapat difokuskan dan diaktifkan dengan Enter/Space; `aria-selected="true"` berpindah.
- Label demo terlihat saat tab Dashboard aktif, tidak hanya lewat `title`.

**Berkas mungkin berubah:** `housekeeper/index.html` (ubah), `housekeeper/src/main.js` (ubah), `housekeeper/src/styles/base.css` (baru), `housekeeper/src/styles/tokens.css` (baru).

---

## M1 — Model data & seed

Tujuan: delapan produk contoh dan aturan model tersedia sebagai satu sumber kebenaran.

### T-1.1 — Token visual & gaya dasar `P0`

- `tokens.css`: variabel warna dari `UI-SPEC.md` §2.1 (krem, hijau rempah, spice, WA, focus, danger), skala spasi 4 px, radius, bayangan hangat.
- `base.css`: reset ringan, tipografi `Plus Jakarta Sans` (lokal atau cadangan sistem — **bukan** Google Fonts CDN, karena NFR-14 melarang permintaan jaringan), `outline: 3px solid var(--focus); outline-offset: 2px`.

**Kriteria penerimaan**
- Tidak ada permintaan jaringan saat halaman dimuat (tab Network hanya berkas `localhost`).
- Tidak ada aturan `outline: none` tanpa pengganti.
- Fokus terlihat pada tautan, tab, dan tombol.

**Berkas mungkin berubah:** `housekeeper/src/styles/tokens.css` (baru), `housekeeper/src/styles/base.css` (baru), `housekeeper/src/styles/layout.css` (baru).

### T-1.2 — Model produk & seed delapan produk `P0`

- `src/products.js`: `createSeedProducts()` mengembalikan tepat 8 objek sesuai tabel `SPEC.md` §4 (p01–p08) dengan `deskripsi` dan `imageUrl` `/img/...`.
- Ekspor `validateProduct(product)` yang mengembalikan daftar galat per field sesuai §5.3 dan §4.
- Ekspor `normalizeProduct(input)` yang melakukan trim nama/kategori, merapikan spasi ganda, dan mengubah `harga`/`stok` menjadi integer **hanya** bila sudah bilangan bulat valid (tidak membulatkan `12.5`).

**Kriteria penerimaan**
- `createSeedProducts()` menghasilkan 8 item, `totalStok` = 106, `stok === 0` tepat 1 item, `unggulan === true` tepat 3 item.
- `validateProduct` menolak `harga: 12.5`, `stok: -1`, `stok: 12.5`, `nama: 'A'`, dan `imageUrl: 'https://contoh.com/a.jpg'`.
- `validateProduct` menerima produk dengan `deskripsi: ''` dan `imageUrl: ''`.

**Berkas mungkin berubah:** `housekeeper/src/products.js` (baru).

### T-1.3 — Derived values `P0`

- `src/state.js`: `getStats(products)` mengembalikan `{ totalProduk, totalStok, jumlahHabis }`; `getCategories(products)` mengembalikan kategori unik terurut A–Z.
- `getStockStatus(stok)` di `src/format.js` → `habis` / `menipis` / `tersedia`.

**Kriteria penerimaan**
- Seed menghasilkan `{ totalProduk: 8, totalStok: 106, jumlahHabis: 1 }`.
- Kategori seed = `['Camilan', 'Kue', 'Makanan', 'Minuman']`.
- `getStockStatus(0) === 'habis'`, `(1) === 'menipis'`, `(5) === 'menipis'`, `(6) === 'tersedia'`.

**Berkas mungkin berubah:** `housekeeper/src/state.js` (baru), `housekeeper/src/format.js` (baru).

### T-1.4 — Format Rupiah & pesan WhatsApp `P0`

- `formatRupiah(45000) === 'Rp45.000'` memakai `Intl.NumberFormat('id-ID')`, tanpa desimal.
- `buildWaMessage(product, { variant })` mengembalikan teks pesan; `buildWaUrl(product)` mengembalikan `https://wa.me/<WA_NUMBER>?text=<encodeURIComponent(pesan)>`.

**Kriteria penerimaan**
- `formatRupiah(0) === 'Rp0'`, `formatRupiah(100000000) === 'Rp100.000.000'`, tanpa `,00`.
- Pesan varian normal memuat nama, `Rp45.000`, dan "1".
- `decodeURIComponent(new URL(buildWaUrl(p01)).searchParams.get('text'))` mengembalikan teks asli termasuk baris baru.

**Berkas mungkin berubah:** `housekeeper/src/format.js` (ubah), `housekeeper/src/config.js` (ubah bila perlu).

---

## M2 — Katalog

Tujuan: delapan kartu produk tampil benar dan responsif, termasuk placeholder gambar.

### T-2.1 — Delapan SVG placeholder lokal `P0`

- Buat `public/img/` berisi 8 berkas `.svg` (inisial + warna kategori) dan `public/img/placeholder.svg`.
- Tidak ada teks yang tidak terbaca, tidak ada referensi ke domain luar, ukuran tiap berkas < 5 KB.

**Kriteria penerimaan**
- Semua `imageUrl` pada seed menunjuk berkas yang benar-benar ada.
- Membuka tiap SVG langsung di peramban tidak menghasilkan galat.
- Tidak ada atribut `href`/`src` ke domain eksternal di dalam SVG.

**Berkas mungkin berubah:** `housekeeper/public/img/*.svg` (baru, 9 berkas).

### T-2.2 — Render grid kartu produk `P0`

- `src/ui/catalog.js` merender kartu via `document.createElement` + `textContent` untuk semua teks produk.
- Kartu memuat: gambar (`alt` = nama produk), badge "Unggulan" bila `unggulan`, nama, kategori, harga terformat, status stok, deskripsi dengan elipsis 2 baris.
- Grid 1 kolom < 768 px, 2 kolom ≥ 768 px, 3 kolom ≥ 1024 px.

**Kriteria penerimaan**
- AC-03 lulus (satu kartu lengkap).
- AC-01 lulus: 8 produk, tanpa error konsol.
- AC-05 lulus: p07 & p08 tampil `Rp62.000`.
- Pada 1024 px tepat 3 kartu per baris; tidak ada kartu yang melebihi lebar kolom.

**Berkas mungkin berubah:** `housekeeper/src/ui/catalog.js` (ubah), `housekeeper/src/styles/components.css` (baru), `housekeeper/src/styles/layout.css` (ubah), `housekeeper/src/main.js` (ubah).

### T-2.3 — Status stok & penonjolan habis `P0`

- Label: `Habis` (0), `Stok menipis: N` (1–5), `Stok: N` (>5).
- Produk habis diredupkan pada latar/garis, **bukan** `opacity` pada teks; teks tetap ≥ 4.5:1.

**Kriteria penerimaan**
- AC-06, AC-07, AC-08 lulus.
- Mengukur kontras teks pada kartu p02 di DevTools tetap ≥ 4.5:1.
- Status tidak hanya dibedakan oleh warna; teks selalu menyebut keadaan.

**Berkas mungkin berubah:** `housekeeper/src/ui/catalog.js` (ubah), `housekeeper/src/styles/components.css` (ubah), `housekeeper/src/format.js` (ubah).

### T-2.4 — Penanganan gambar gagal `P0`

- `onerror` pada `img` mengganti `src` ke `/img/placeholder.svg`, hanya sekali (hindari loop).
- `imageUrl` yang kosong langsung memakai placeholder tanpa memicu permintaan jaringan.

**Kriteria penerimaan**
- AC-04 lulus: mengganti nama berkas gambar lalu reload menampilkan placeholder, tanpa ikon gambar rusak.
- Tidak ada permintaan jaringan eksternal di tab Network.
- Tidak ada loop `onerror` (konsol tidak berulang).

**Berkas mungkin berubah:** `housekeeper/src/ui/catalog.js` (ubah), `housekeeper/public/img/placeholder.svg` (ubah).

### T-2.5 — Urutan default "Unggulan dulu" `P0`

- Terapkan sorting default: `unggulan` lebih dulu, lalu nama A–Z (locale `id`).
- Sorting diimplementasikan sebagai fungsi murni di `src/state.js` agar bisa dipakai ulang M3.

**Kriteria penerimaan**
- AC-02 lulus: p01, p03, p06 lebih dulu, lalu sisanya A–Z.
- Fungsi sorting tidak mengubah array sumber (dicek dengan membandingkan urutan seed sebelum/sesudah render).

**Berkas mungkin berubah:** `housekeeper/src/state.js` (ubah), `housekeeper/src/ui/catalog.js` (ubah).

---

## M3 — Interaksi pencarian/filter

Tujuan: pencarian, filter kategori, sorting, dan keadaan kosong bekerja bersamaan tanpa saling mereset.

### T-3.1 — State seleksi terpusat `P0`

- `src/state.js` menyimpan `{ query, kategori, sort }` dan menyediakan `getVisibleProducts()` yang menerapkan pencarian (nama+kategori+deskripsi, case-insensitive, trim), filter (AND), dan sorting.
- Satu fungsi render ulang dipanggil setiap state berubah.

**Kriteria penerimaan**
- Mengubah state apa pun hanya memicu satu render katalog.
- `getVisibleProducts()` adalah fungsi murni: input sama → output sama.
- Query kosong + kategori `Semua` + sort default menghasilkan 8 produk.

**Berkas mungkin berubah:** `housekeeper/src/state.js` (ubah), `housekeeper/src/main.js` (ubah).

### T-3.2 — Kolom pencarian `P0`

- Input `type="search"`, `<label for>`, event `input` (bukan hanya `change`), nilai di-trim sebelum dibandingkan.

**Kriteria penerimaan**
- AC-09, AC-10, AC-11 lulus.
- Mengetik cepat tidak menyebabkan kehilangan fokus pada input.
- Input kosong mengembalikan seluruh hasil sesuai filter aktif.

**Berkas mungkin berubah:** `housekeeper/index.html` (ubah), `housekeeper/src/ui/catalog.js` (ubah), `housekeeper/src/main.js` (ubah).

### T-3.3 — Chip kategori & sorting `P0`

- Chip `Semua` + kategori turunan data, `<button aria-pressed>`, satu aktif.
- `select` sorting dengan 5 opsi: Unggulan dulu, Nama A–Z, Harga terendah, Harga tertinggi, Stok terendah.
- `Reset` mengosongkan query, kategori `Semua`, sort default.

**Kriteria penerimaan**
- AC-14 lulus: hanya 3 produk Minuman; chip aktif ditandai visual dan `aria-pressed="true"`.
- AC-15, AC-16, AC-17 lulus (urutan harga dan stok persis seperti spesifikasi).
- AC-13 lulus: `Reset`/"Tampilkan semua produk" mengembalikan kondisi awal.
- Chip dapat diaktifkan dengan keyboard dan target sentuh ≥ 44 px di mobile.

**Berkas mungkin berubah:** `housekeeper/src/ui/catalog.js` (ubah), `housekeeper/src/styles/components.css` (ubah), `housekeeper/index.html` (ubah).

### T-3.4 — Baris jumlah hasil & keadaan kosong `P0`

- "Menampilkan N dari 8 produk" dengan `aria-live="polite"` dan `role="status"`.
- N = 0 → pesan kosong + tombol "Tampilkan semua produk".

**Kriteria penerimaan**
- AC-12 lulus: `sambal` + kategori Minuman → 0 hasil, keadaan kosong, tombol tampil.
- Angka "8" pada baris hasil mengikuti jumlah total data saat ini (bukan konstanta), terverifikasi setelah menambah produk di M5.
- Pembaca layar/pengumuman tidak mengulang pesan yang sama dua kali.

**Berkas mungkin berubah:** `housekeeper/src/ui/catalog.js` (ubah), `housekeeper/src/styles/components.css` (ubah).

### T-3.5 — Kombinasi filter & performa `P0`

- Pastikan urutan operasi: filter → sort → render, tanpa mereset filter lain.
- Ukur waktu render dengan `performance.now()` pada 50 produk.

**Kriteria penerimaan**
- AC-18 lulus (cari `a` + Camilan + harga terendah, filter lain tetap).
- Render 50 produk < 100 ms (NFR-02), dicatat angkanya di catatan QA.
- Tidak ada `setTimeout`/`debounce` yang membuat hasil terasa tertunda.

**Berkas mungkin berubah:** `housekeeper/src/state.js` (ubah), `housekeeper/src/main.js` (ubah).

---

## M4 — WhatsApp

Tujuan: setiap kartu punya tombol pesan yang membuka `wa.me` dengan pesan terisi, termasuk untuk produk habis.

### T-4.1 — Tombol per kartu `P0`

- Label "Pesan via WhatsApp" (stok > 0) atau "Tanya ketersediaan" (stok = 0); elemen `<a>` dengan `href` hasil `buildWaUrl`, `target="_blank"`, `rel="noopener noreferrer"`.
- Ikon WA 20 px `aria-hidden="true"`; tinggi tombol ≥ 44 px.

**Kriteria penerimaan**
- AC-19 lulus: pesan memuat nama, `Rp45.000`, jumlah 1, encoding benar.
- AC-20 lulus: produk habis memakai pesan "menanyakan ketersediaan", bukan pernyataan pesanan.
- AC-21 lulus: semua tautan memakai nomor yang sama dan memuat `noopener`.

**Berkas mungkin berubah:** `housekeeper/src/ui/catalog.js` (ubah), `housekeeper/src/styles/components.css` (ubah), `housekeeper/src/format.js` (ubah).

### T-4.2 — Varian pesan `P0`

- Pesan normal: sapaan + nama produk + harga + jumlah 1 + penutup singkat.
- Pesan habis: menanyakan ketersediaan/restock, tanpa menyebut jumlah pesanan.

**Kriteria penerimaan**
- Kedua varian berbeda secara teks dan dapat dibedakan tanpa melihat tombol.
- Teks pesan tidak memuat karakter mentah yang merusak URL (diperiksa dengan `decodeURIComponent`).
- Nama produk dengan `&` dan spasi ganda ter-encode benar (contoh uji: `Kopi & Gula`).

**Berkas mungkin berubah:** `housekeeper/src/format.js` (ubah), `housekeeper/src/config.js` (ubah).

### T-4.3 — Umpan balik bila pop-up diblokir `P0`

- Bila tab baru gagal dibuka, tampilkan pesan/tautan cadangan yang dapat diklik pengguna.
- Tidak ada error konsol pada kasus ini.

**Kriteria penerimaan**
- AC-22 lulus.
- Pesan cadangan muncul di area `aria-live` atau toast yang dapat ditutup.
- Tautan cadangan tetap memakai nomor dari `config.js`.

**Berkas mungkin berubah:** `housekeeper/src/ui/catalog.js` (ubah), `housekeeper/src/ui/toast.js` (ubah), `housekeeper/src/main.js` (ubah).

---

## M5 — CRUD dashboard

Tujuan: pengelola dapat menambah, melihat, mengubah, dan menghapus produk dengan validasi dan ringkasan yang ikut berubah.

### T-5.1 — KPI & tabel/daftar produk `P0`

- Tiga kartu KPI (total produk, total stok, produk habis) dihitung dari state.
- Desktop: tabel dengan kolom foto mini, nama, kategori, harga, stok, unggulan, aksi. Mobile (< 768 px): daftar kartu label–nilai, tanpa scroll horizontal.

**Kriteria penerimaan**
- AC-23 lulus: 8 / 106 / 1 dan label demo terlihat.
- Pada 320 px tidak ada scroll horizontal (NFR-07).
- Tombol Ubah/Hapus ≥ 44 px di mobile dan punya `aria-label` yang menyebut nama produk.

**Berkas mungkin berubah:** `housekeeper/src/ui/dashboard.js` (ubah), `housekeeper/src/styles/components.css` (ubah), `housekeeper/index.html` (ubah).

### T-5.2 — Dialog form tambah/ubah `P0`

- Gunakan `<dialog>` native; `showModal()`, fokus awal pada field nama, `Esc` menutup, fokus kembali ke tombol pemicu.
- Field: nama, kategori (input + `datalist` dari kategori yang ada), harga, stok, deskripsi, imageUrl, unggulan (checkbox).
- Mode ubah mempertahankan `id` yang sama.

**Kriteria penerimaan**
- AC-37 lulus: `Esc` menutup dialog dan fokus kembali ke pemicu.
- Setiap input punya `<label for>`; tidak ada input tanpa nama aksesibel.
- Membuka mode ubah menampilkan nilai yang identik dengan data tersimpan (AC-16 di `SPEC.md` §3).

**Berkas mungkin berubah:** `housekeeper/src/ui/dialog.js` (ubah), `housekeeper/src/ui/dashboard.js` (ubah), `housekeeper/index.html` (ubah), `housekeeper/src/styles/components.css` (ubah).

### T-5.3 — Validasi form & ringkasan galat `P0`

- Validasi saat submit dan saat blur untuk field yang sudah disentuh.
- Galat per field di bawah input, terhubung `aria-describedby`; ringkasan galat di atas form menerima fokus.
- Form tidak tersimpan bila ada galat.

**Kriteria penerimaan**
- AC-25 lulus: submit kosong → 4 pesan galat, fokus ke nama.
- AC-26 lulus: `harga 12.5` dan `stok -1` ditolak tanpa mengubah data lama.
- AC-27 lulus: `https://contoh.com/a.jpg` ditolak dengan pesan path lokal.
- Pesan galat tidak hanya ditandai warna (ada teks + ikon).

**Berkas mungkin berubah:** `housekeeper/src/products.js` (ubah), `housekeeper/src/ui/dialog.js` (ubah), `housekeeper/src/styles/components.css` (ubah).

### T-5.4 — Simpan, perbarui, hapus `P0`

- Tambah: `id = 'p' + Date.now().toString(36)`, unik; produk baru langsung tampil di katalog dan tabel.
- Perbarui: baris yang sama berubah, tanpa duplikat.
- Hapus: dialog konfirmasi menyebut nama produk; Batal tidak mengubah apa pun.

**Kriteria penerimaan**
- AC-24 lulus: 9 produk / 116 stok setelah menambah Teh Jahe Instan 15000/10.
- AC-28 lulus: harga p03 → `Rp35.000`, jumlah produk tetap 9.
- AC-29 & AC-30 lulus.
- Setelah hapus, fokus berpindah ke tempat yang masuk akal (bukan `body`).

**Berkas mungkin berubah:** `housekeeper/src/state.js` (ubah), `housekeeper/src/ui/dashboard.js` (ubah), `housekeeper/src/ui/dialog.js` (ubah), `housekeeper/src/ui/catalog.js` (ubah).

### T-5.5 — Reset data contoh `P0`

- Tombol "Muat ulang data contoh" dengan konfirmasi; mengembalikan 8 produk awal dan menghapus perubahan.

**Kriteria penerimaan**
- AC-32 lulus: nilai kembali persis seperti `SPEC.md` §4.
- Konfirmasi menyebut akibatnya ("perubahan akan hilang").
- Setelah reset, katalog dan KPI diperbarui tanpa reload.

**Berkas mungkin berubah:** `housekeeper/src/ui/dashboard.js` (ubah), `housekeeper/src/state.js` (ubah), `housekeeper/src/products.js` (ubah).

### T-5.6 — Toast notifikasi `P1`

- Toast "Produk ditambahkan/diperbarui/dihapus" di `aria-live="polite"`, hilang ≤ 4 detik, dapat ditutup, tidak menutupi aksi.

**Kriteria penerimaan**
- Toast muncul untuk ketiga aksi dan hilang otomatis.
- Toast tidak menangkap fokus keyboard dan tidak menggeser layout.
- Bila P1 dipotong, `SPEC.md` §9.6 dicatat di README dan AC terkait dinyatakan tidak berlaku.

**Berkas mungkin berubah:** `housekeeper/src/ui/toast.js` (ubah), `housekeeper/src/styles/components.css` (ubah), `housekeeper/src/main.js` (ubah).

---

## M6 — localStorage

Tujuan: data bertahan setelah reload, dan kerusakan data tidak menghasilkan halaman kosong.

### T-6.1 — Baca/tulis dengan skema versi `P0`

- `loadProducts()` membaca `housekeeper:v1:products` + `housekeeper:v1:schema`; menulis keduanya.
- Setiap mutasi berhasil langsung menulis; tidak menulis pada setiap pengetikan pencarian.

**Kriteria penerimaan**
- AC-31 lulus: tambah/ubah/hapus bertahan setelah reload.
- Kunci `schema` bernilai `"1"` setelah penyimpanan pertama.
- Mengetik di kolom pencarian tidak memicu `localStorage.setItem` (dicek dengan breakpoint/DevTools).

**Berkas mungkin berubah:** `housekeeper/src/storage.js` (ubah), `housekeeper/src/state.js` (ubah).

### T-6.2 — Validasi data tersimpan `P0`

- Data dianggap tidak valid bila: JSON gagal diparse, bukan array, elemen tidak lolos `validateProduct`, atau `schema` ≠ `"1"`.
- Data tidak valid → pakai seed di memori + banner, **tanpa** menimpa data lama.

**Kriteria penerimaan**
- AC-34 lulus: `{rusak` → banner + 8 data contoh, halaman tidak blank.
- AC-35 lulus: `schema` dikosongkan → banner tampil, data lama tidak tertimpa sebelum reset.
- Banner dapat ditutup dan tidak hilang sebelum pengguna melihatnya (tidak auto-dismiss).

**Berkas mungkin berubah:** `housekeeper/src/storage.js` (ubah), `housekeeper/index.html` (ubah), `housekeeper/src/styles/components.css` (ubah).

### T-6.3 — Kuota penuh & localStorage diblokir `P0`

- Tangkap `QuotaExceededError` (dan kegagalan akses `localStorage`): tampilkan galat yang dapat ditutup, pertahankan state di memori, jangan tampilkan toast sukses.

**Kriteria penerimaan**
- Menyimulasikan kuota penuh (DevTools/`Object.defineProperty`) memunculkan galat, bukan toast sukses.
- Aplikasi tetap dapat dipakai setelah galat (state di memori konsisten).
- Tidak ada exception yang lolos ke konsol.

**Berkas mungkin berubah:** `housekeeper/src/storage.js` (ubah), `housekeeper/src/ui/toast.js` (ubah), `housekeeper/src/main.js` (ubah).

### T-6.4 — Sinkron antar tab `P1`

- Dengarkan event `storage`; bila kunci produk berubah, muat ulang state dan render.

**Kriteria penerimaan**
- Menambah produk di tab A memperbarui tab B tanpa reload.
- Tidak terjadi loop tulis-baca antar tab.
- Bila P1 dipotong, batasan dicatat di README (R-09).

**Berkas mungkin berubah:** `housekeeper/src/storage.js` (ubah), `housekeeper/src/main.js` (ubah).

---

## M7 — Testing manual

Tujuan: seluruh `SPEC.md` §9 ditelusuri pada build produksi dan dev server, hasilnya dicatat.

### T-7.1 — Matriks uji AC-01..AC-35 `P0`

- Telusuri setiap AC satu per satu pada `npm run preview`; catat lulus/gagal + catatan.
- Data bersih = `localStorage` dikosongkan lalu reload.

**Kriteria penerimaan**
- 35 baris AC punya status (lulus/gagal) di dokumen hasil uji.
- Setiap kegagalan punya penyebab dan tindakan; tidak ada AC yang dilewati tanpa alasan.
- Tidak ada error/warning konsol selama penelusuran.

**Berkas mungkin berubah:** `housekeeper/TESTING.md` (baru), `housekeeper/src/**` (perbaikan bila ada kegagalan).

### T-7.2 — Uji keyboard & aksesibilitas `P0`

- Alur beli (cari → filter → buka WA) dan alur kelola (tambah → ubah → hapus) dengan keyboard saja.
- Periksa fokus terlihat, jebakan fokus, `aria-live`, label input, kontras, `prefers-reduced-motion`.

**Kriteria penerimaan**
- AC-36, AC-37, AC-39, AC-40 lulus.
- Semua target sentuh ≥ 44×44 px di 360 px (AC-38 bagian tombol).
- Tidak ada `outline: none` yang efektif di CSS hasil build.

**Berkas mungkin berubah:** `housekeeper/src/styles/*.css` (ubah), `housekeeper/index.html` (ubah), `housekeeper/TESTING.md` (ubah).

### T-7.3 — Uji responsif 320–1440 px `P0`

- Periksa 320, 360, 390, 768, 1024, 1440 px: tanpa scroll horizontal, kartu dan tabel tetap terbaca.

**Kriteria penerimaan**
- AC-38 lulus di keenam lebar.
- Tabel dashboard berubah menjadi kartu di < 768 px.
- Zoom 200% tidak memotong konten secara horizontal.

**Berkas mungkin berubah:** `housekeeper/src/styles/layout.css` (ubah), `housekeeper/src/styles/components.css` (ubah).

### T-7.4 — Uji ketahanan & lintas peramban `P0`

- Reload, tutup-buka tab, mode privat, data rusak, dan kuota penuh.
- Uji minimal Chrome + Firefox versi stabil.

**Kriteria penerimaan**
- Data bertahan pada reload dan buka-tutup tab (NFR-09).
- Mode privat tidak membuat halaman blank; banner peringatan tampil bila penyimpanan gagal.
- AC-42 lulus: tab Network hanya memuat aset lokal.

**Berkas mungkin berubah:** `housekeeper/TESTING.md` (ubah), `housekeeper/src/storage.js` (ubah), `housekeeper/README.md` (baru).

---

## M8 — Security review

Tujuan: tidak ada jalur eksekusi skrip dari data produk dan tidak ada rahasia di repositori.

### T-8.1 — Audit rendering & XSS `P0`

- Cari semua `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`, `new Function`, `document.write` di `housekeeper/src`.
- Semua teks produk dirender via `textContent`; atribut `src` diisi lewat properti, bukan string HTML.

**Kriteria penerimaan**
- AC-33 lulus: nama `<img src=x onerror=alert(1)>` tampil sebagai teks, tanpa `alert`, tanpa elemen `img` baru.
- Nol kemunculan `innerHTML` dengan data produk (kemunculan statis untuk markup kosong harus diberi komentar alasan).
- Uji tambahan: deskripsi berisi `<script>alert(1)</script>` dan kategori berisi `" onmouseover="alert(1)` tetap tampil sebagai teks.

**Berkas mungkin berubah:** `housekeeper/src/ui/catalog.js` (ubah), `housekeeper/src/ui/dashboard.js` (ubah), `housekeeper/src/ui/toast.js` (ubah).

### T-8.2 — Validasi `imageUrl` & tautan eksternal `P0`

- Tolak `javascript:`, `data:`, `http://`, `https://`, `//`; hanya `/img/` + ekstensi yang diizinkan.
- Semua tautan eksternal `target="_blank"` + `rel="noopener noreferrer"`.

**Kriteria penerimaan**
- AC-27 lulus; `javascript:alert(1)` dan `data:text/html,...` juga ditolak.
- Menyisipkan `/img/../../etc/passwd` ditolak atau tidak merusak tampilan.
- AC-21 lulus (semua `rel` lengkap).

**Berkas mungkin berubah:** `housekeeper/src/products.js` (ubah), `housekeeper/src/ui/catalog.js` (ubah).

### T-8.3 — Audit rahasia & dependensi `P0`

- Pastikan tidak ada API key, token, atau `.env`; nomor WA hanya placeholder di `config.js`.
- `npm audit` tanpa kerentanan high/critical; jumlah dependensi tetap minimal.

**Kriteria penerimaan**
- `grep` untuk `api_key`, `token`, `secret`, `password` di `housekeeper/` tidak menemukan nilai nyata.
- `npm audit --omit=dev` bersih (tidak ada dependensi runtime).
- Tidak ada berkas `.env` yang ter-commit; `.gitignore` memuat `node_modules` dan `dist`.

**Berkas mungkin berubah:** `housekeeper/.gitignore` (ubah), `housekeeper/README.md` (ubah), `housekeeper/package.json` (ubah bila ada patch).

### T-8.4 — Header & konfigurasi build yang aman `P1`

- Tidak ada `sourcemap` publik di build produksi.
- Tidak memakai `dangerouslySetInnerHTML`/sejenis dan tidak memuat skrip pihak ketiga.

**Kriteria penerimaan**
- `dist/` tidak memuat berkas `.map`.
- Tidak ada `<script src="http...">` di `index.html` hasil build.
- Bila dipotong, tetap dicatat di README sebagai batasan.

**Berkas mungkin berubah:** `housekeeper/vite.config.js` (ubah), `housekeeper/index.html` (ubah).

---

## M9 — Build

Tujuan: build produksi sukses dan hasilnya berperilaku sama dengan dev.

### T-9.1 — Konfigurasi Vite & build bersih `P0`

- `base` sesuai target hosting (default `/`, atau `./` bila hosting statis tanpa root).
- `npm run build` menghasilkan `dist/`; `npm run preview` menyajikan hasilnya.

**Kriteria penerimaan**
- AC-41 lulus: build sukses tanpa error/warning.
- Ukuran JS+CSS < 150 KB sebelum gzip (NFR-01).
- Semua gambar dari `public/img/` tersalin ke `dist/img/`.
- Tidak ada aset dengan path rusak (404) di tab Network saat `preview`.

**Berkas mungkin berubah:** `housekeeper/vite.config.js` (ubah), `housekeeper/package.json` (ubah), `housekeeper/README.md` (ubah).

### T-9.2 — Smoke test build produksi `P0`

- Ulangi alur inti pada `npm run preview`: katalog 8 produk, cari, filter, WA, tambah, ubah, hapus, reload.

**Kriteria penerimaan**
- Alur inti berfungsi sama seperti dev; tidak ada perbedaan data.
- Tidak ada error konsol pada build produksi.
- Hasil dicatat di `TESTING.md` dengan tanggal dan versi peramban.

**Berkas mungkin berubah:** `housekeeper/TESTING.md` (ubah), `housekeeper/README.md` (ubah).

---

## M10 — Deployment *(opsional, di luar MVP)*

`SPEC.md` §8 butir 10 mengecualikan deployment dari MVP. Milestone ini hanya dikerjakan bila MVP sudah lulus dan user memintanya.

### T-10.1 — Pilih target hosting statis

- Hosting harus melayani berkas statis tanpa server (tanpa backend), mendukung HTTPS, dan gratis untuk latihan.

**Kriteria penerimaan**
- Target hosting disetujui user sebelum konfigurasi diubah.
- Tidak ada kredensial yang diminta untuk build lokal.

**Berkas mungkin berubah:** `housekeeper/vite.config.js` (ubah), `housekeeper/README.md` (ubah).

### T-10.2 — Konfigurasi `base` path

- Sesuaikan `base` dengan URL hasil deploy agar aset tidak 404.

**Kriteria penerimaan**
- `npm run build` + `npm run preview` menampilkan gambar dan CSS tanpa 404.
- Path `/img/...` pada data produk tetap benar setelah deploy (uji `imageUrl` absolut terhadap `base`).

**Berkas mungkin berubah:** `housekeeper/vite.config.js` (ubah), `housekeeper/src/config.js` (ubah bila perlu `BASE_URL`).

### T-10.3 — Publikasi & verifikasi URL

- Publikasikan `dist/`; verifikasi URL publik memuat aplikasi yang berfungsi.

**Kriteria penerimaan**
- URL publik menampilkan 8 produk dan tidak ada error konsol.
- Data tersimpan di peramban pengunjung (localStorage berfungsi pada HTTPS).
- Tidak ada nomor WA asli/rahasia yang terekspos; nomor tetap placeholder atau nomor user.

**Berkas mungkin berubah:** `housekeeper/README.md` (ubah), berkas konfigurasi hosting (baru).

### T-10.4 — Dokumentasi rilis

- README memuat: cara jalan lokal, cara build, cara mengganti `WA_NUMBER`, batasan demo, dan status item P1.

**Kriteria penerimaan**
- Pengguna baru dapat menjalankan proyek hanya dengan README.
- README menyatakan nomor WA masih placeholder dan data hanya lokal.
- Semua item P1 yang dipotong tercantum.

**Berkas mungkin berubah:** `housekeeper/README.md` (ubah).

---

## Peta tugas → acceptance criteria `SPEC.md`

| Milestone | AC |
|---|---|
| M0 | AC-41 (fondasi build) |
| M1 | AC-01, AC-02, AC-05, AC-23 |
| M2 | AC-01..AC-08 |
| M3 | AC-09..AC-18 |
| M4 | AC-19..AC-22 |
| M5 | AC-23..AC-33 |
| M6 | AC-31, AC-34, AC-35 |
| M7 | AC-36..AC-40, AC-42 |
| M8 | AC-21, AC-27, AC-33 |
| M9 | AC-41 |
| M10 | — (di luar MVP) |

## Risiko jadwal

| Kondisi | Tindakan |
|---|---|
| Waktu tersisa < 2 jam sebelum M5 selesai | Kerjakan T-5.1..T-5.4 saja; T-5.5 dan T-5.6 ditunda; nyatakan MVP belum selesai bila hapus/ubah belum ada. |
| Waktu tersisa < 45 menit sebelum M7 | Potong T-5.6, T-6.4, T-8.4; jalankan T-7.1 dan T-9.1 minimal; catat AC yang tidak diperiksa. |
| SVG placeholder belum siap saat M2 | Pakai satu `placeholder.svg` untuk semua produk; jangan menunda M2. |
| `npm run build` gagal karena impor | Perbaiki impor, bukan menonaktifkan pengecekan; build wajib hijau sebelum M9 ditutup. |
