/**
 * State katalog dalam memori; backend menjadi satu-satunya sumber persistensi.
 */

import { normalizeProduct, validateProduct } from './products.js';
import { apiRequest } from './api.js';

let state = { products: [], error: null };
const listeners = new Set();

function emit() {
  for (const listener of listeners) listener(state);
}

function setProducts(products) {
  state = { products, error: null };
  emit();
  return state;
}

function handleError(error) {
  state = { ...state, error: error instanceof Error ? error.message : 'Permintaan gagal.' };
  emit();
  return { ok: false, error: state.error };
}

export function getState() {
  return state;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function loadProducts() {
  try {
    const { products } = await apiRequest('/api/owner/products');
    if (!Array.isArray(products)) throw new Error('Respons produk server tidak valid.');
    setProducts(products);
    return state;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function addProduct(input) {
  const product = normalizeProduct(input);
  const errors = validateProduct(product);
  if (Object.keys(errors).length) return { ok: false, errors };

  try {
    const result = await apiRequest('/api/owner/products', {
      method: 'POST',
      body: product,
    });
    setProducts([result.product, ...state.products]);
    return { ok: true, product: result.product };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateProduct(id, input) {
  const product = normalizeProduct(input);
  const errors = validateProduct(product);
  if (Object.keys(errors).length) return { ok: false, errors };

  try {
    const result = await apiRequest(`/api/owner/products/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: product,
    });
    setProducts(state.products.map((item) => (item.id === id ? result.product : item)));
    return { ok: true, product: result.product };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteProduct(id) {
  try {
    await apiRequest(`/api/owner/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
    setProducts(state.products.filter((item) => item.id !== id));
    return { ok: true };
  } catch (error) {
    return handleError(error);
  }
}
