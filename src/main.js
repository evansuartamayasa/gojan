import './style.css';

import { apiRequest } from './api.js';
import { showCatalogError, initLanding } from './ui.js';

async function loadCatalog() {
  try {
    const { products } = await apiRequest('/api/products');
    if (!Array.isArray(products)) throw new Error('Respons katalog dari server tidak valid.');
    initLanding(products);
  } catch (error) {
    showCatalogError(
      error instanceof Error ? error.message : 'Katalog gagal dimuat. Coba muat ulang halaman.',
    );
  }
}

loadCatalog();
