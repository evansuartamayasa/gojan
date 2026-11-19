import assert from 'node:assert/strict';
import test from 'node:test';

import { buildWhatsAppUrl } from '../src/ui.js';

test('buildWhatsAppUrl validates international phone numbers', () => {
  assert.throws(
    () => buildWhatsAppUrl('081234567890', { nama: 'Produk', harga: 1000, stok: 1 }),
    /format internasional/,
  );
  assert.throws(
    () => buildWhatsAppUrl('+6281234567890', { nama: 'Produk', harga: 1000, stok: 1 }),
    /format internasional/,
  );
});

test('buildWhatsAppUrl encodes the product order message', () => {
  const url = buildWhatsAppUrl('6281234567890', {
    nama: 'Kopi & Teh',
    harga: 45000,
    stok: 12,
  });
  const parsed = new URL(url);

  assert.equal(parsed.origin, 'https://wa.me');
  assert.equal(parsed.pathname, '/6281234567890');
  assert.equal(
    parsed.searchParams.get('text'),
    'Halo, saya ingin memesan Kopi & Teh (Rp45.000) sebanyak 1. Mohon konfirmasi ketersediaannya.',
  );
});

test('buildWhatsAppUrl encodes an availability message when stock is zero', () => {
  const url = buildWhatsAppUrl('6281234567890', {
    nama: 'Teh Melati',
    harga: 28000,
    stok: 0,
  });
  assert.equal(
    new URL(url).searchParams.get('text'),
    'Halo, saya ingin menanyakan ketersediaan Teh Melati (Rp28.000). Mohon info kapan stok tersedia.',
  );
});
