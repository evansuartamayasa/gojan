# UI-SPEC — BersihKilat (Jasa Penyedia Housekeeping)

Dokumen ini adalah spesifikasi antarmuka untuk landing page **BersihKilat**: jasa housekeeping untuk rumah, apartemen, dan kantor kecil. Isinya mengikat keputusan visual, ukuran, komponen, dan perilaku aksesibilitas sebelum implementasi CSS/JS dimulai.

> **Catatan sumber:** `SPEC.md` tidak ditemukan di repositori. Spesifikasi ini disusun dari `CATATAN.md` (tujuan latihan & target aplikasi) dan struktur `index.html` yang sudah ada. Dua komponen yang diminta tetapi belum ada di halaman saat ini — **filter katalog** dan **dashboard demo** — didefinisikan di sini sebagai penambahan baru, bukan perubahan pada yang sudah berjalan.

---

## 1. Prinsip Desain

1. **Tenang, hangat, terpercaya.** Krem hangat sebagai kanvas, hijau rempah sebagai warna aksi. Tidak ada gradien neon atau bayangan pekat.
2. **Mobile-first.** Semua tata letak dirancang untuk lebar 360 px lebih dulu, lalu dinaikkan dengan `min-width`.
3. **Satu aksi utama per layar.** Tombol WhatsApp/pemesanan harus selalu menjadi elemen paling menonjol setelah judul.
4. **Kontras dulu, dekorasi kemudian.** Setiap pasangan teks/latar wajib ≥ 4.5:1; dekorasi tidak boleh menurunkan kontras teks.
5. **Terasa seperti jasa lokal, bukan SaaS.** Sudut membulat lembut (10–20 px), foto/ilustrasi ruangan, bahasa Indonesia santai-profesional.

---

## 2. Token Desain

### 2.1 Palet warna

| Token | Hex | Peran |
|---|---|---|
| `--cream-50` | `#FBF7F0` | Latar halaman utama |
| `--cream-100` | `#F5EDE1` | Latar section bergantian (tint) |
| `--cream-200` | `#EADFCB` | Garis batas halus, pemisah |
| `--surface` | `#FFFFFF` | Kartu, panel form, navbar saat sticky |
| `--green-900` | `#16382A` | Footer, teks di atas krem terang, judul tebal |
| `--green-700` | `#23543E` | Warna merek utama, tombol primer, teks tautan |
| `--green-500` | `#3C7A5A` | Hover/ikon, garis aksen |
| `--green-100` | `#E4EDE3` | Chip aktif, latar badge, highlight baris |
| `--spice-600` | `#9A5B12` | Teks aksen "spice" (label, harga kecil) |
| `--spice-500` | `#B4691E` | Ikon dekoratif, garis aksen 2 px |
| `--ink` | `#2A2620` | Teks utama (cokelat-arang, bukan hitam murni) |
| `--ink-soft` | `#5C5449` | Teks sekunder, keterangan |
| `--wa` | `#1E7A46` | Tombol WhatsApp (hijau lebih pekat, bukan hijau merek) |
| `--danger` | `#A32A1E` | Pesan galat form |
| `--focus` | `#1F6FB2` | Cincin fokus (biru, sengaja beda dari merek) |

**Rasio pemakaian:** ±70% krem/netral, 20% hijau rempah, 10% putih & aksen spice. Hijau tidak dipakai sebagai latar satu section penuh kecuali footer dan panel pemesanan.

### 2.2 Kontras terverifikasi (WCAG 2.1)

| Teks | Latar | Rasio | Hasil |
|---|---|---|---|
| `#2A2620` ink | `#FBF7F0` cream-50 | ± 12.9:1 | AAA |
| `#5C5449` ink-soft | `#FBF7F0` cream-50 | ± 6.4:1 | AA (normal) |
| `#23543E` green-700 | `#FBF7F0` cream-50 | ± 8.1:1 | AAA |
| `#23543E` green-700 | `#E4EDE3` green-100 | ± 6.6:1 | AA |
| `#FFFFFF` | `#23543E` green-700 | ± 8.7:1 | AAA |
| `#FFFFFF` | `#1E7A46` wa | ± 5.3:1 | AA |
| `#9A5B12` spice-600 | `#FBF7F0` cream-50 | ± 5.0:1 | AA |
| `#FFFFFF` | `#16382A` green-900 | ± 12.4:1 | AAA |
| `#A32A1E` danger | `#FFFFFF` surface | ± 7.2:1 | AA |
| `#A32A1E` danger | `#F7DDD9` badge batal | ± 5.6:1 | AA |

Aturan tambahan:
- Teks di atas `--green-500` hanya untuk ukuran ≥ 18.66 px bold / 24 px reguler; di bawah itu gunakan `--green-700`.
- `--spice-500` **tidak boleh** dipakai untuk teks — hanya garis, ikon, dan bingkai.
- Angka besar (statistik, harga) boleh memakai `--spice-600` karena lolos AA pada latar krem.

### 2.3 Spasi, radius, bayangan

- Skala spasi: `4, 8, 12, 16, 24, 32, 48, 64, 96` px. Kelipatan 4 px.
- Radius: `sm 8` · `md 12` · `lg 20` · `pill 999`.
- Bayangan (hangat, bukan abu-abu netral):
  - `shadow-sm`: `0 1px 2px rgba(42,38,32,.06), 0 2px 8px rgba(42,38,32,.05)`
  - `shadow-md`: `0 8px 24px rgba(42,38,32,.08)`
  - `shadow-lg`: `0 20px 48px rgba(42,38,32,.12)`
- Batas: `1px solid var(--cream-200)` pada semua kartu (bayangan tipis, bukan tebal).

### 2.4 Ikon & ilustrasi

- Ikon garis 1.75 px, sudut membulat, ukuran 20 / 24 / 32 px.
- Ilustrasi ruangan bergaya flat dengan isian `--green-100` dan aksen `--green-500`; tidak memakai foto stok berwajah.
- Avatar tim: inisial di lingkaran `--green-100` dengan teks `--green-900`.

---

## 3. Tipografi

**Keluarga:** `Plus Jakarta Sans` (sudah dimuat di `index.html`), cadangan `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. Tanpa serif dekoratif.

| Token | Mobile | Desktop (≥1024) | Berat | Line-height | Pemakaian |
|---|---|---|---|---|---|
| `display` | 32 px | 56 px | 800 | 1.1 | H1 hero |
| `h2` | 26 px | 40 px | 700 | 1.15 | Judul section |
| `h3` | 19 px | 22 px | 700 | 1.3 | Judul kartu |
| `body-lg` | 17 px | 19 px | 400 | 1.65 | Subjudul hero |
| `body` | 16 px | 16 px | 400 | 1.65 | Paragraf |
| `small` | 14 px | 14 px | 500 | 1.5 | Keterangan, label |
| `caption` | 12.5 px | 13 px | 600 | 1.4 | Eyebrow, badge, legal |

Aturan:
- Eyebrow: HURUF KAPITAL, `letter-spacing: .12em`, warna `--spice-600`, maksimal 6 kata.
- Lebar baris paragraf 55–75 karakter (`max-width: 68ch`).
- Tidak ada teks di bawah 12.5 px. Tidak ada teks rata kanan-kiri (`text-align: justify`).

---

## 4. Layout & Breakpoint

Pendekatan mobile-first; semua breakpoint memakai `@media (min-width: ...)`.

| Nama | Lebar | Perilaku kunci |
|---|---|---|
| `xs` | < 480 px | 1 kolom, padding tepi 20 px, CTA full-width, hamburger |
| `sm` | 480–767 px | 1 kolom, kartu lebih lega, statistik 2 kolom |
| `md` | 768–1023 px | Navbar horizontal muncul, grid layanan 2 kolom, filter sebaris |
| `lg` | ≥ 1024 px | Container 1140 px, hero 2 kolom, grid layanan 3 kolom, dashboard 2 panel |
| `xl` | ≥ 1280 px | Container maksimum 1200 px, jarak section 96 px |

- Container: `max-width: 1200px`, padding inline `20 / 24 / 32` px mengikuti breakpoint.
- Ritme vertikal section: mobile `56px`, desktop `96px`.
- Grid: `display: grid; gap: 16px` (mobile) → `24px` (desktop). Tidak ada layout grid eksplisit > 12 kolom.
- Target sentuh minimum **44 × 44 px** untuk semua tombol, tautan nav, chip filter, dan item daftar yang dapat diklik. Di desktop boleh 40 px, tetapi tidak kurang.

---

## 5. Aksesibilitas Wajib

1. **Skip link** `"Langsung ke konten utama"` sebagai elemen fokus pertama; terlihat saat `:focus`.
2. **Fokus terlihat:** `outline: 3px solid var(--focus); outline-offset: 2px` — jangan pernah `outline: none` tanpa pengganti.
3. **Urutan heading** satu `h1`, `h2` per section, `h3` per kartu; tidak melompati level.
4. **Landmark:** `header`, `nav[aria-label="Navigasi utama"]`, `main`, `footer`, satu `h1`.
5. **Filter:** chip memakai `<button aria-pressed="true|false">`; jumlah hasil diumumkan lewat `aria-live="polite"` (mis. "6 layanan ditampilkan").
6. **Form:** setiap input punya `<label for>`; pesan galat terhubung via `aria-describedby`; ringkasan galat muncul di atas form dan menerima fokus.
7. **Estimasi biaya** dalam wadah `aria-live="polite"` agar perubahan harga terbaca pembaca layar.
8. **Gambar/ilustrasi dekoratif** `aria-hidden="true"` atau `alt=""`.
9. **Kontras** mengikuti tabel §2.2; teks sekunder tidak lebih terang dari `--ink-soft`.
10. **Gerak:** animasi reveal maksimum 300 ms, hormati `prefers-reduced-motion: reduce` (nonaktifkan transform & opacity animasi).
11. **Zoom:** layout tetap utuh pada 200% zoom dan lebar 320 px tanpa scroll horizontal.
12. **Bahasa** dokumen `lang="id"`; teks tombol menjelaskan hasil ("Pesan via WhatsApp", bukan "Klik di sini").

---

## 6. Komponen

### 6.1 Navbar
- **Mobile (< 768):** brand kiri, tombol hamburger kanan (44×44), panel menu turun penuh di bawah header. Panel tertutup saat tautan diklik, `Esc` ditekan, atau fokus keluar.
- **Desktop:** brand kiri, 5 tautan tengah (Beranda, Layanan, Harga, Testimoni, Kontak), tombol primer "Pesan Sekarang" kanan.
- Sticky setelah scroll 64 px: latar `--surface` 92% + `backdrop-filter: blur(8px)`, batas bawah `--cream-200`, tinggi 64 px (mobile 60 px).
- Tautan aktif: warna `--green-700`, garis bawah 2 px `--spice-500`, `aria-current="page"` (scrollspy).
- Tombol hamburger: `aria-expanded`, `aria-controls="mainNav"`, label berubah "Buka/Tutup menu navigasi".

### 6.2 Hero
- Grid 1 kolom (mobile) → 2 kolom 1.05fr/0.95fr (≥1024).
- Isi kiri: eyebrow kepercayaan + titik pulse, H1, paragraf, dua CTA (primer "Pesan Sekarang", sekunder "Lihat Layanan"), strip statistik 3 item.
- Mobile: CTA utama full-width, CTA sekunder di bawahnya; statistik jadi 3 baris ringkas atau 2 kolom + 1.
- Visual kanan: kartu ilustrasi ruangan + 3 kartu kecil (rating, respons, tim). Di mobile, hanya kartu utama + satu badge rating; badge lain disembunyikan (`display:none` di bawah 480 px).
- Latar hero: `--cream-100` dengan lengkung/wave ke section berikutnya (dekoratif, aria-hidden).

### 6.3 Grid Produk / Layanan (dengan filter)
- Header grid: judul `h2`, deskripsi, lalu **bar filter**.
- Filter berisi chip kategori: `Semua`, `Daily Cleaning`, `Deep Cleaning`, `Kantor & Apartemen`, `Paket Berlangganan`; plus kontrol urut (`select`): "Paling relevan / Harga terendah / Harga tertinggi".
- Chip aktif: latar `--green-100`, teks `--green-900`, ikon centang kecil. Tidak aktif: latar `--surface`, batas `--cream-200`.
- Baris ringkasan hasil: "Menampilkan 4 dari 4 layanan" — `aria-live="polite"`.
- Kartu layanan: ikon 32 px, label kategori (opsional), `h3`, deskripsi 2–3 baris, 3 poin fitur, footer berisi "Mulai Rp…" + tautan "Pilih layanan".
- Kartu unggulan diberi garis atas 3 px `--spice-500` + badge "Paling sering dipesan".
- Grid: 1 kolom (xs), 2 kolom (md), 3 kolom (lg). Tetap 3 kolom maksimum agar kartu tidak terlalu sempit.
- Keadaan kosong: pesan "Belum ada layanan di kategori ini" + tombol "Tampilkan semua".

### 6.4 Paket Harga
- 3 kartu sejajar di desktop, bertumpuk di mobile, urutan: Reguler → Lengkap (ditonjolkan) → Berlangganan.
- Kartu unggulan: latar `--green-700`, teks putih, badge "Paling populer", CTA putih dengan teks `--green-700`.
- Daftar fitur memakai ikon centang hijau (`--green-500`) dan silang `--ink-soft` dengan teks tetap terbaca (bukan `opacity` rendah).
- Harga: angka 32/40 px berat 800, mata uang & satuan lebih kecil (`small`).

### 6.5 Tombol

| Varian | Latar | Teks | Batas | Pemakaian |
|---|---|---|---|---|
| Primer | `--green-700` | putih | – | Aksi utama |
| WhatsApp | `--wa` | putih | – | Konfirmasi pesanan & tombol float |
| Sekunder/ghost | transparan | `--green-700` | 1.5 px `--green-700` | Aksi alternatif |
| Netral | `--surface` | `--ink` | 1 px `--cream-200` | Filter, "Pilih layanan" |
| Tautan | transparan | `--green-700` + garis bawah | – | Navigasi teks |

- Radius `pill` untuk CTA utama, `md` untuk tombol di dalam kartu.
- Hover: gelapkan 8%; Active: turunkan 1 px; Disabled: `--cream-200` + teks `--ink-soft`, `cursor:not-allowed`, tetap ≥ 3:1.
- Ikon WhatsApp 20 px selalu di kiri label, `aria-hidden="true"`.

### 6.6 Tombol WhatsApp
Tiga titik masuk, semuanya menuju nomor yang sama dengan pesan terisi otomatis:
1. **CTA hero & navbar** — tombol primer (bukan hijau WA agar tidak ada dua hijau bersaing; ikon WA tetap ada).
2. **Tombol float** — kanan bawah, 56×56 px, `--wa`, label "Chat kami" muncul ≥ 768 px, `aria-label="Chat WhatsApp BersihKilat"`. Tidak menutupi CTA form di mobile: beri `bottom: 16px` + `right: 16px`, dan padding bawah `main` 80 px.
3. **Tombol submit form** — label "Konfirmasi Pesanan via WhatsApp"; setelah klik, tampilkan status "Membuka WhatsApp…" dan sediakan tautan cadangan bila popup diblokir.

Format tautan: `https://wa.me/628xxxxxxxxxx?text=<pesan ter-encode>`. Nomor & teks masih placeholder (lihat §9).

### 6.7 Formulir Pemesanan
- Dua panel: aside hijau (`--green-900`, teks putih, benefit + kontak) dan panel form putih. Mobile: aside menjadi header ringkas di atas form.
- Grid field: 1 kolom (xs), 2 kolom (≥768) dengan field alamat selebar penuh.
- Field: label `small` berat 600, input tinggi minimum 48 px, radius `md`, batas `--cream-200`, fokus cincin `--focus`.
- Galat: batas `--danger` + ikon + teks `small` `--danger`; bukan hanya warna.
- Panel estimasi: latar `--green-100`, baris rincian + total tebal 20 px. Update seketika saat layanan/jumlah kamar berubah.

### 6.8 Testimoni & Trust Bar
- 3 kartu testimoni (1 kolom mobile, 3 kolom ≥1024), bintang `--spice-500` dengan label teks untuk pembaca layar ("Rating 5 dari 5").
- Trust bar: 4 angka statistik, dipisah garis `--cream-200`; mobile jadi 2×2.

### 6.9 Footer
- Latar `--green-900`, teks `#F1EDE6`, tautan `#FFFFFF` dengan garis bawah saat hover.
- 4 kolom desktop (brand, navigasi, kontak, jam + area), bertumpuk di mobile dengan urutan sama.
- Baris bawah: hak cipta + tautan legal, ukuran `caption`, kontras tetap AA.

### 6.10 Dashboard Demo (baru)
Tujuan: memperlihatkan ke calon pelanggan korporat bagaimana pesanan dikelola. **Demo statis** — data contoh, tidak terhubung backend, diberi label jelas "Pratinjau dashboard (data contoh)".

- Lokasi: setelah Testimoni, sebelum footer; dapat diakses dari tautan navbar "Dashboard".
- Struktur desktop: sidebar kiri 220 px (Ringkasan, Pesanan, Jadwal, Pelanggan) + area konten.
- Area konten: 3 kartu KPI (Pesanan hari ini, Kunjungan selesai, Pendapatan bulan ini), tabel pesanan 5 baris (ID, Layanan, Jadwal, Status, Estimasi), dan satu panel "Jadwal minggu ini" berupa daftar hari.
- Status pesanan memakai badge teks + warna, tidak hanya warna: `Menunggu` (`--cream-200`/`--ink`), `Dikonfirmasi` (`--green-100`/`--green-900`), `Selesai` (isi `--green-700`/putih), `Dibatalkan` (`#F7DDD9`/`--danger`).
- Mobile: sidebar berubah menjadi bar tab horizontal yang dapat digeser; tabel berubah menjadi daftar kartu (label–nilai bertumpuk), tanpa scroll horizontal.
- Semua kontrol non-fungsional diberi `disabled` + tooltip "Tersedia di akun pelanggan", atau tombol yang memunculkan toast "Ini demo".
- Dashboard tidak boleh menampilkan tombol yang terlihat aktif padahal tidak berfungsi (kecuali diberi label demo).

---

## 7. Wireframe Teks — Desktop (≥1024 px)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Skip link — tersembunyi, muncul saat fokus]                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│ HEADER (sticky, 64px)                                                        │
│  ✦ BersihKilat      Beranda  Layanan  Harga  Testimoni  Dashboard  Kontak    │
│                                                        [ Pesan Sekarang ]    │
├──────────────────────────────────────────────────────────────────────────────┤
│ HERO — latar cream-100                                                       │
│  ┌───────────────────────────────┐   ┌──────────────────────────────────┐    │
│  │ ● Dipercaya 2.500+ rumah      │   │ ╔══════════════════════════════╗ │    │
│  │                               │   │ ║  [ilustrasi ruangan]         ║ │    │
│  │ Rumah bersih maksimal,        │   │ ║  Deep Cleaning · selesai     ║ │    │
│  │ hidup lebih ringan.           │   │ ╚══════════════════════════════╝ │    │
│  │                               │   │ ┌──────────────┐ ┌────────────┐  │    │
│  │ Paragraf pendukung 2–3 baris  │   │ │ ★★★★★ 4,9/5  │ │ ⏱ <15 mnt  │  │    │
│  │                               │   │ │ 1.200 ulasan │ │ via WA     │  │    │
│  │ [Pesan Sekarang →] [Lihat Layanan]│ └──────────────┘ └────────────┘  │    │
│  │                               │   │ ┌──────────────────────────────┐ │    │
│  │ 2.500+   │ 4,9/5  │ 6 tahun   │   │ │ 👥 Tim terlatih & tersertifikasi│ │
│  └───────────────────────────────┘   └──────────────────────────────────┘    │
│  ~~~~~~~~~~~~~~~~ lengkung dekoratif ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  │
├──────────────────────────────────────────────────────────────────────────────┤
│ LAYANAN + FILTER (latar cream-50)                                            │
│  LAYANAN KAMI                                     [ h2 dua baris ]           │
│  Deskripsi section, max 68ch                                                 │
│                                                                              │
│  ( Semua ) ( Daily Cleaning ) ( Deep Cleaning ) ( Kantor ) ( Berlangganan )  │
│                                              Urutkan: [ Paling relevan ▾ ]   │
│  Menampilkan 4 dari 4 layanan                                                │
│                                                                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                │
│  │ [ikon]  badge   │ │ [ikon]  badge   │ │ [ikon]  badge   │                │
│  │ Daily Cleaning  │ │ Deep Cleaning   │ │ Kantor & Apt.   │                │
│  │ deskripsi…      │ │ deskripsi…      │ │ deskripsi…      │                │
│  │ ✓ fitur         │ │ ✓ fitur         │ │ ✓ fitur         │                │
│  │ ✓ fitur         │ │ ✓ fitur         │ │ ✓ fitur         │                │
│  │ ✓ fitur         │ │ ✓ fitur         │ │ ✓ fitur         │                │
│  │ Mulai Rp175.000 │ │ Mulai Rp375.000 │ │ Mulai Rp450.000 │                │
│  │     Pilih →     │ │     Pilih →     │ │     Pilih →     │                │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘                │
├──────────────────────────────────────────────────────────────────────────────┤
│ HARGA (latar cream-100)                                                      │
│           PAKET HARGA · h2 · deskripsi                                       │
│  ┌───────────────┐  ┌═══════════════┐  ┌───────────────┐                     │
│  │ Reguler       │  ║ Paling populer║  │ Berlangganan  │                     │
│  │ Rp175rb       │  ║ Lengkap       ║  │ Rp1.200rb     │                     │
│  │ /kunjungan    │  ║ Rp375rb       ║  │ /bulan        │                     │
│  │ ✓ fitur       │  ║ ✓ fitur       ║  │ ✓ fitur       │                     │
│  │ ✕ fitur       │  ║ ✓ fitur       ║  │ ✓ fitur       │                     │
│  │ [Pilih Reguler]│ ║ [Pilih Lengkap]║ │ [Pilih Paket] │                     │
│  └───────────────┘  └═══════════════┘  └───────────────┘                     │
│  Butuh penawaran khusus? [Minta penawaran]                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ PEMESANAN (latar cream-50)                                                   │
│  ┌──────────────────────────────┬─────────────────────────────────────────┐  │
│  │ PANEL HIJAU (green-900)      │ FORMULIR (putih)                        │  │
│  │ PEMESANAN CEPAT              │ Formulir Pemesanan                      │  │
│  │ h2 · paragraf                │ * Wajib diisi                           │  │
│  │ ✓ poin manfaat ×4            │ [Nama*]            [WhatsApp*]          │  │
│  │                              │ [Layanan*]         [Jumlah kamar*]      │  │
│  │ Butuh bantuan?               │ [Tanggal*]         [Waktu*]             │  │
│  │ +62 812-…                    │ [Alamat lengkap* ————————————————]      │  │
│  │ Setiap hari 07.00–21.00      │ ┌─────────────────────────────────────┐ │  │
│  │                              │ │ Estimasi: Daily · 2 kamar  Rp210.000│ │  │
│  │                              │ │ Total                      Rp210.000│ │  │
│  │                              │ └─────────────────────────────────────┘ │  │
│  │                              │ [ (WA) Konfirmasi via WhatsApp        ] │  │
│  └──────────────────────────────┴─────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────┤
│ TESTIMONI (latar cream-100)                                                  │
│  h2 · subjudul                                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                          │
│  │ ★★★★★        │ │ ★★★★★        │ │ ★★★★★        │                          │
│  │ “kutipan…”   │ │ “kutipan…”   │ │ “kutipan…”   │                          │
│  │ (RA) Nama    │ │ (DN) Nama    │ │ (SW) Nama    │                          │
│  └──────────────┘ └──────────────┘ └──────────────┘                          │
│  2.500+ │ 98% │ 24 jam │ 100%                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│ DASHBOARD DEMO (latar cream-50) — label "data contoh"                        │
│  ┌────────────┬───────────────────────────────────────────────────────────┐  │
│  │ SIDEBAR    │ Ringkasan  [ Pesanan hari ini 12 ] [ Selesai 9 ] [ Rp… ]  │  │
│  │ • Ringkasan│ ┌───────────────────────────────────────────────────────┐ │  │
│  │ • Pesanan  │ │ ID     Layanan      Jadwal     Status       Estimasi  │ │  │
│  │ • Jadwal   │ │ #1042  Deep Clean   19 Nov     [Selesai]    Rp375.000 │ │  │
│  │ • Pelanggan│ │ #1043  Daily        19 Nov     [Dikonfirmasi] Rp210.000│ │  │
│  │            │ │ #1044  Kantor       20 Nov     [Menunggu]   Rp450.000 │ │  │
│  │            │ └───────────────────────────────────────────────────────┘ │  │
│  │            │ ┌───────────────────────────────────────────────────────┐ │  │
│  │            │ │ Jadwal minggu ini: Sen ▸ Rab ▸ Kam ▸ …                │ │  │
│  │            │ └───────────────────────────────────────────────────────┘ │  │
│  └────────────┴───────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────┤
│ FOOTER (green-900)                                                           │
│  ✦ BersihKilat  │ Navigasi      │ Kontak           │ Jam & Area              │
│  deskripsi      │ Beranda       │ (WA) +62 …       │ Sen–Jum 07–21           │
│  (WA)(IG)(✉)    │ Layanan       │ (✉) halo@…       │ Sab 08–20 · Min 08–17   │
│                 │ Harga         │ (📍) Jl. Melati  │ Area: Jakarta, Depok…   │
│  ─────────────────────────────────────────────────────────────────────────── │
│  © 2026 BersihKilat              Kebijakan Privasi · Syarat & Ketentuan     │
└──────────────────────────────────────────────────────────────────────────────┘
                                                    ┌──────────────┐
                                                    │ (WA) Chat kami│  ← float
                                                    └──────────────┘
```

---

## 8. Wireframe Teks — Mobile (360–479 px)

```
┌──────────────────────────────┐
│ HEADER (60px, sticky)        │
│ ✦ BersihKilat            ≡   │
│ ┌──────────────────────────┐ │  ← panel menu (terbuka)
│ │ Beranda                  │ │
│ │ Layanan                  │ │
│ │ Harga                    │ │
│ │ Testimoni                │ │
│ │ Dashboard                │ │
│ │ Kontak                   │ │
│ │ [ Pesan Sekarang ]       │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ HERO                         │
│ ● Dipercaya 2.500+ rumah     │
│                              │
│ Rumah bersih maksimal,       │
│ hidup lebih ringan.          │
│                              │
│ Paragraf 3–4 baris.          │
│                              │
│ [ Pesan Sekarang        → ]  │  ← full width
│ [ Lihat Layanan           ]  │  ← full width
│                              │
│ 2.500+     4,9/5    6 tahun  │  ← 3 kolom ringkas
│ ┌──────────────────────────┐ │
│ │ [ilustrasi ruangan]      │ │
│ │ Deep Cleaning · selesai  │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ ★★★★★ 4,9/5 · 1.200 ulasan│ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ LAYANAN                      │
│ LAYANAN KAMI                 │
│ Judul section 2 baris        │
│ Deskripsi                    │
│                              │
│ ‹ Semua › ‹ Daily › ‹ Deep › │  ← chip, scroll horizontal
│ Urutkan [ Paling relevan ▾ ] │
│ Menampilkan 4 dari 4 layanan │
│                              │
│ ┌──────────────────────────┐ │
│ │ [ikon]      [badge]      │ │
│ │ Daily Cleaning           │ │
│ │ deskripsi 2–3 baris      │ │
│ │ ✓ fitur                  │ │
│ │ ✓ fitur                  │ │
│ │ ✓ fitur                  │ │
│ │ Mulai Rp175.000  Pilih → │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Deep Cleaning …          │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Kantor & Apartemen …     │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ HARGA                        │
│ Judul section                │
│ ┌──────────────────────────┐ │
│ │ Reguler · Rp175rb        │ │
│ │ ✓ / ✕ fitur              │ │
│ │ [ Pilih Reguler ]        │ │
│ └──────────────────────────┘ │
│ ┌══════════════════════════┐ │  ← kartu unggulan hijau
│ ║ Paling populer           ║ │
│ ║ Lengkap · Rp375rb        ║ │
│ ║ ✓ fitur                  ║ │
│ ║ [ Pilih Lengkap ]        ║ │
│ └══════════════════════════┘ │
│ ┌──────────────────────────┐ │
│ │ Berlangganan · Rp1.200rb │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ PEMESANAN                    │
│ ┌──────────────────────────┐ │  ← aside jadi header hijau ringkas
│ │ PEMESANAN CEPAT          │ │
│ │ h2 · paragraf            │ │
│ │ ✓ manfaat (2 teratas)    │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Nama lengkap *           │ │
│ │ [____________________]   │ │
│ │ Nomor WhatsApp *         │ │
│ │ [____________________]   │ │
│ │ Jenis layanan *          │ │
│ │ [ Daily Cleaning    ▾ ]  │ │
│ │ Jumlah kamar *           │ │
│ │ [ 2 kamar           ▾ ]  │ │
│ │ Tanggal *                │ │
│ │ [ dd/mm/yyyy        ]    │ │
│ │ Waktu *                  │ │
│ │ [ 13.00–15.00       ▾ ]  │ │
│ │ Alamat lengkap *         │ │
│ │ [____________________]   │ │
│ │ [____________________]   │ │
│ │ ┌──────────────────────┐ │ │
│ │ │ Estimasi   Rp210.000 │ │ │
│ │ │ Total      Rp210.000 │ │ │
│ │ └──────────────────────┘ │ │
│ │ [(WA) Konfirmasi Pesanan ]│ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ TESTIMONI                    │
│ ┌──────────────────────────┐ │
│ │ ★★★★★                    │ │
│ │ “kutipan…”               │ │
│ │ (RA) Rina · Jakarta Sel. │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ … kartu 2                │ │
│ └──────────────────────────┘ │
│ 2.500+      98%              │  ← 2×2
│ 24 jam      100%             │
├──────────────────────────────┤
│ DASHBOARD DEMO               │
│ Pratinjau · data contoh      │
│ [Ringkasan][Pesanan][Jadwal] │  ← tab scroll horizontal
│ ┌──────────┐ ┌──────────┐   │
│ │Hari ini  │ │Selesai   │   │
│ │ 12       │ │ 9        │   │
│ └──────────┘ └──────────┘   │
│ ┌──────────────────────────┐ │
│ │ #1042 · Deep Cleaning    │ │
│ │ 19 Nov · 13.00           │ │
│ │ [Selesai]   Rp375.000    │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ #1043 · Daily Cleaning   │ │
│ │ 19 Nov · 15.00           │ │
│ │ [Dikonfirmasi] Rp210.000 │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ FOOTER (green-900)           │
│ ✦ BersihKilat                │
│ deskripsi · (WA)(IG)(✉)      │
│ Navigasi                     │
│ Beranda · Layanan · Harga    │
│ Kontak                       │
│ +62 … · halo@… · alamat      │
│ Jam operasional · Area       │
│ ───────────────────────────  │
│ © 2026 BersihKilat           │
│ Privasi · Syarat             │
└──────────────────────────────┘
                       ┌──────┐
                       │ (WA) │ ← float 56px, bottom-right
                       └──────┘
```

**Catatan mobile:**
- Chip filter dan tab dashboard: satu baris, `overflow-x: auto`, `scroll-snap-type: x proximity`, tanpa scrollbar terlihat; tepi kanan diberi *fade* agar terlihat masih bisa digeser.
- Tabel dashboard berubah menjadi kartu; tidak ada tabel dengan scroll horizontal.
- Tombol float WA digeser naik (`bottom: calc(16px + env(safe-area-inset-bottom))`) dan `main` diberi `padding-bottom: 88px` agar CTA form tidak tertutup.

---

## 9. Keadaan, Data, & Placeholder

| Keadaan | Perilaku |
|---|---|
| Filter tanpa hasil | Pesan kosong + tombol "Tampilkan semua"; ringkasan hasil = "0 layanan" |
| Menu mobile terbuka | Fokus masuk ke tautan pertama, `Esc` menutup, latar `body` dikunci scroll |
| Form belum valid | Galat per field setelah blur; ringkasan galat di atas form saat submit |
| Estimasi berubah | Angka total dianimasikan halus (≤200 ms), tetap diumumkan `aria-live` |
| Dashboard demo | Semua aksi nonaktif atau memunculkan toast "Ini demo" |
| Nomor WA / tarif | **Masih placeholder** (`6281234567890`, Rp175.000 / 375.000 / 450.000, Rp1.200.000/bln). Wajib diganti sebelum rilis. |
| Nama & alamat bisnis | `Jl. Melati No. 24` dan email `halo@bersihkilat.id` adalah contoh. |

Data contoh dashboard (statis): 12 pesanan hari ini, 9 selesai, pendapatan bulan berjalan `Rp42.750.000`, 5 baris terbaru `#1042–#1046`.

---

## 10. Checklist Penerimaan

- [ ] Semua pasangan warna teks/latar lolos AA seperti tabel §2.2.
- [ ] Tidak ada scroll horizontal pada lebar 320, 360, 768, dan 1024 px.
- [ ] Setiap target sentuh ≥ 44×44 px.
- [ ] Navigasi keyboard penuh dari skip link sampai footer tanpa jebakan fokus.
- [ ] Fokus selalu terlihat (cincin `--focus`), termasuk pada chip filter dan tombol float.
- [ ] Filter mengubah grid, memperbarui ringkasan `aria-live`, dan punya keadaan kosong.
- [ ] Tombol WhatsApp muncul di hero, float, form, dan footer dengan pesan ter-encode.
- [ ] Dashboard demo diberi label "data contoh" dan tidak menyamar sebagai fitur aktif.
- [ ] `prefers-reduced-motion` menonaktifkan animasi reveal.
- [ ] Nomor WhatsApp dan seluruh tarif sudah diganti sebelum publikasi.
