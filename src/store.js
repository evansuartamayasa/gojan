/**
 * State produk dan persistensi localStorage.
 * Setiap mutasi menulis ke localStorage lalu memberi tahu pelanggan (subscriber).
 */

import { SEED_PRODUCTS, normalizeProduct, validateProduct } from './products.js';

export const STORAGE_KEYS = {
  products: 'gojan:v1:products',
  schema: 'gojan:v1:schema',
};

export const SCHEMA_VERSION = '1';

let state = createInitialState();
const listeners = new Set();

function cloneSeeds() {
  return SEED_PRODUCTS.map((product) => ({ ...product }));
}

function createInitialState() {
  return { products: cloneSeeds(), corrupted: false, storageError: null };
}

function emit() {
  for (const listener of listeners) listener(state);
}

function isStoredProduct(value) {
  if (!value || typeof value !== 'object') return false;
  if (typeof value.id !== 'string' || value.id.length === 0) return false;
  return Object.keys(validateProduct(value)).length === 0;
}

/**
 * Memuat produk dari localStorage.
 * Data tidak valid tidak ditimpa; state memakai data contoh dan menandai `corrupted`.
 */
export function loadProducts() {
  const next = createInitialState();
  let raw = null;
  let schema = null;

  try {
    raw = localStorage.getItem(STORAGE_KEYS.products);
    schema = localStorage.getItem(STORAGE_KEYS.schema);
  } catch {
    state = { ...next, storageError: 'blocked' };
    emit();
    return state;
  }

  // Kunjungan pertama: belum ada data tersimpan, pakai data contoh.
  if (raw === null && schema === null) {
    state = next;
    emit();
    return state;
  }

  let parsed = null;
  if (schema === SCHEMA_VERSION && raw !== null) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
  }

  const isValid =
    Array.isArray(parsed) && parsed.every((product) => isStoredProduct(product));

  if (!isValid) {
    state = { ...next, corrupted: true };
    emit();
    return state;
  }

  state = { ...next, products: parsed };
  emit();
  return state;
}

function persist(products) {
  state = { ...state, products };
  let storageError = null;

  try {
    localStorage.setItem(STORAGE_KEYS.schema, SCHEMA_VERSION);
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
  } catch (error) {
    state = { ...state, storageError: error?.name === 'QuotaExceededError' ? 'quota' : 'unknown' };
    emit();
    return state.storageError;
  }

  state = { ...state, storageError: null };
  emit();
  return null;
}

export function getState() {
  return state;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addProduct(input) {
  const product = normalizeProduct(input);
  const errors = validateProduct(product);
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const newProduct = { ...product, id: `p${Date.now().toString(36)}` };
  const storageError = persist([...state.products, newProduct]);
  return { ok: true, product: newProduct, storageError };
}

export function updateProduct(id, input) {
  const product = normalizeProduct(input);
  const errors = validateProduct(product);
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const next = state.products.map((item) =>
    item.id === id ? { ...product, id: item.id } : item,
  );
  const storageError = persist(next);
  return { ok: true, product: next.find((item) => item.id === id), storageError };
}

export function deleteProduct(id) {
  const next = state.products.filter((product) => product.id !== id);
  if (next.length === state.products.length) return { ok: false };
  const storageError = persist(next);
  return { ok: true, storageError };
}

/** Mengembalikan delapan produk contoh dan menghapus perubahan pengguna. */
export function resetToSeed() {
  const storageError = persist(cloneSeeds());
  return { ok: true, storageError };
}
