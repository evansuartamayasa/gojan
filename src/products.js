/**
 * Sumber tunggal untuk konfigurasi, data contoh, dan aturan validasi produk.
 * Nomor WhatsApp hanya boleh didefinisikan di sini.
 */

export const CONFIG = {
  WA_NUMBER: '6281234567890',
  LOW_STOCK_THRESHOLD: 5,
  LIMITS: {
    NAMA_MIN: 2,
    NAMA_MAX: 60,
    KATEGORI_MAX: 24,
    HARGA_MAX: 100_000_000,
    STOK_MAX: 100_000,
    DESKRIPSI_MAX: 280,
  },
};

/** Delapan produk contoh (nonpribadi) sesuai SPEC.md §4. */
export const SEED_PRODUCTS = [
  {
    id: 'p01',
    nama: 'Kopi Robusta Tubruk 200g',
    kategori: 'Minuman',
    harga: 45000,
    stok: 12,
    deskripsi: 'Kopi robusta sangrai medium, digiling kasar untuk tubruk.',
    imageUrl: '',
    unggulan: true,
  },
  {
    id: 'p02',
    nama: 'Kopi Arabika Gayo 200g',
    kategori: 'Minuman',
    harga: 68000,
    stok: 0,
    deskripsi: 'Arabika single origin Gayo, aroma buah dengan keasaman lembut.',
    imageUrl: '',
    unggulan: false,
  },
  {
    id: 'p03',
    nama: 'Sambal Bawang Botol 150ml',
    kategori: 'Makanan',
    harga: 32000,
    stok: 20,
    deskripsi: 'Sambal bawang pedas sedang, dimasak tanpa pengawet.',
    imageUrl: '',
    unggulan: true,
  },
  {
    id: 'p04',
    nama: 'Keripik Pisang Cokelat 150g',
    kategori: 'Camilan',
    harga: 25000,
    stok: 35,
    deskripsi: 'Keripik pisang renyah dengan lapisan cokelat tipis.',
    imageUrl: '',
    unggulan: false,
  },
  {
    id: 'p05',
    nama: 'Teh Melati Premium 100g',
    kategori: 'Minuman',
    harga: 28000,
    stok: 18,
    deskripsi: 'Teh melati wangi dengan seduhan ringan, cocok untuk sore.',
    imageUrl: '',
    unggulan: false,
  },
  {
    id: 'p06',
    nama: 'Brownies Kukus Pandan',
    kategori: 'Kue',
    harga: 55000,
    stok: 4,
    deskripsi: 'Brownies kukus pandan lembut, satu loyang kecil siap potong.',
    imageUrl: '',
    unggulan: true,
  },
  {
    id: 'p07',
    nama: 'Madu Hutan 250ml',
    kategori: 'Makanan',
    harga: 62000,
    stok: 9,
    deskripsi: 'Madu hutan murni tanpa campuran gula, dikemas dalam botol kaca.',
    imageUrl: '',
    unggulan: false,
  },
  {
    id: 'p08',
    nama: 'Granola Madu 250g',
    kategori: 'Camilan',
    harga: 62000,
    stok: 8,
    deskripsi: 'Granola panggang dengan madu, kacang, dan buah kering.',
    imageUrl: '',
    unggulan: false,
  },
];

/** Path gambar hanya boleh lokal (/img/...) dan berformat gambar yang didukung. */
export function isValidImagePath(imageUrl) {
  if (imageUrl === undefined || imageUrl === null || imageUrl === '') return true;
  if (typeof imageUrl !== 'string') return false;
  if (/^(https?:)?\/\//i.test(imageUrl)) return false;
  return /^\/img\/[\w.-]+\.(svg|png|jpe?g|webp)$/i.test(imageUrl);
}

function normalizeName(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

/**
 * Memvalidasi satu produk. Mengembalikan objek { field: pesanGalat }.
 * Objek kosong berarti valid.
 */
export function validateProduct(input) {
  const errors = {};
  const product = input ?? {};
  const { LIMITS } = CONFIG;

  const nama = normalizeName(product.nama);
  if (nama.length < LIMITS.NAMA_MIN || nama.length > LIMITS.NAMA_MAX) {
    errors.nama = `Nama produk wajib diisi (${LIMITS.NAMA_MIN}–${LIMITS.NAMA_MAX} karakter).`;
  }

  const kategori = normalizeName(product.kategori);
  if (kategori.length === 0 || kategori.length > LIMITS.KATEGORI_MAX) {
    errors.kategori = 'Pilih atau tulis kategori.';
  }

  if (!Number.isInteger(product.harga) || product.harga < 0 || product.harga > LIMITS.HARGA_MAX) {
    errors.harga = 'Harga harus angka bulat 0–100.000.000.';
  }

  if (!Number.isInteger(product.stok) || product.stok < 0 || product.stok > LIMITS.STOK_MAX) {
    errors.stok = 'Stok harus angka bulat 0–100.000.';
  }

  if (typeof product.deskripsi !== 'string' || product.deskripsi.length > LIMITS.DESKRIPSI_MAX) {
    errors.deskripsi = 'Deskripsi maksimal 280 karakter.';
  }

  if (!isValidImagePath(product.imageUrl)) {
    errors.imageUrl = 'Gunakan path lokal /img/nama-file.svg.';
  }

  if (typeof product.unggulan !== 'boolean') {
    errors.unggulan = 'Status unggulan harus berupa boolean.';
  }

  return errors;
}

/** Membersihkan spasi berlebih sebelum produk disimpan. */
export function normalizeProduct(input) {
  return {
    ...input,
    nama: normalizeName(input.nama),
    kategori: normalizeName(input.kategori),
    deskripsi: typeof input.deskripsi === 'string' ? input.deskripsi.trim() : '',
  };
}
