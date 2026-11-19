import assert from 'node:assert/strict';
import test from 'node:test';

import { filterProducts, SEED_PRODUCTS } from '../src/products.js';

test('filterProducts matches product names case-insensitively', () => {
  assert.deepEqual(
    filterProducts(SEED_PRODUCTS, { searchTerm: 'kOpI rObUsTa' }).map(({ id }) => id),
    ['p01'],
  );
});

test('filterProducts combines search and category filters', () => {
  assert.deepEqual(
    filterProducts(SEED_PRODUCTS, { searchTerm: 'hutan', category: 'Makanan' }).map(({ id }) => id),
    ['p07'],
  );
  assert.deepEqual(filterProducts(SEED_PRODUCTS, { searchTerm: 'hutan', category: 'Camilan' }), []);
});

test('filterProducts sorts by price and name without mutating its input', () => {
  const products = [...SEED_PRODUCTS];
  assert.deepEqual(
    filterProducts(products, { sortBy: 'price-asc' }).map(({ id }) => id),
    ['p04', 'p05', 'p03', 'p01', 'p06', 'p07', 'p08', 'p02'],
  );
  assert.deepEqual(
    filterProducts(products, { sortBy: 'price-desc' }).map(({ id }) => id),
    ['p02', 'p07', 'p08', 'p06', 'p01', 'p03', 'p05', 'p04'],
  );
  assert.deepEqual(
    filterProducts(products, { sortBy: 'name-asc' }).map(({ id }) => id),
    ['p06', 'p08', 'p04', 'p02', 'p01', 'p07', 'p03', 'p05'],
  );
  assert.deepEqual(products.map(({ id }) => id), SEED_PRODUCTS.map(({ id }) => id));
});
