import './style.css';

import { STORAGE_KEYS, getState, loadProducts, subscribe } from './store.js';
import {
  initTabs,
  renderCatalog,
  renderDashboard,
  renderStorageBanner,
} from './ui.js';

const catalogRoot = document.getElementById('catalog-root');
const dashboardRoot = document.getElementById('dashboard-root');
const storageBanner = document.getElementById('storage-banner');

function render(state) {
  renderCatalog(state.products, catalogRoot);
  renderDashboard(state.products, dashboardRoot);
  renderStorageBanner(state, storageBanner);
}

initTabs();
render(loadProducts());
subscribe(render);

// Sinkronkan state bila tab lain mengubah data tersimpan.
window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEYS.products || event.key === STORAGE_KEYS.schema) {
    loadProducts();
  }
});

// Diekspos untuk pemeriksaan cepat di konsol selama pengembangan.
if (import.meta.env.DEV) {
  window.housekeeper = { getState, loadProducts };
}
