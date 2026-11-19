/**
 * Lapisan tampilan: membuat dan memperbarui DOM dari data produk.
 * Semua teks produk dirender lewat textContent, bukan innerHTML.
 */

import { CONFIG, isValidImagePath } from './products.js';

const rupiah = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

const CATEGORY_THEME = {
  Minuman: { bg: '#E4EDE3', fg: '#16382A' },
  Makanan: { bg: '#F6E7D2', fg: '#6B3F0C' },
  Camilan: { bg: '#F1EAD9', fg: '#4A4030' },
  Kue: { bg: '#F7E1D8', fg: '#6E2B1B' },
};

export function formatRupiah(value) {
  return `Rp${rupiah.format(Number(value) || 0)}`;
}

export function stockStatus(stok) {
  if (stok === 0) return { key: 'habis', label: 'Habis' };
  if (stok <= CONFIG.LOW_STOCK_THRESHOLD) return { key: 'menipis', label: `Stok menipis: ${stok}` };
  return { key: 'tersedia', label: `Stok: ${stok}` };
}

export function buildWaUrl(product) {
  const harga = formatRupiah(product.harga);
  const pesan =
    product.stok > 0
      ? `Halo, saya ingin memesan ${product.nama} (${harga}) sebanyak 1. Mohon konfirmasi ketersediaannya.`
      : `Halo, saya ingin menanyakan ketersediaan ${product.nama} (${harga}). Mohon info kapan stok tersedia.`;

  return `https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent(pesan)}`;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Placeholder SVG lokal: inisial produk + warna kategori. */
function createPlaceholder(product) {
  const theme = CATEGORY_THEME[product.kategori] ?? { bg: '#E4EDE3', fg: '#16382A' };
  const initials = String(product.nama)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 320 240');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.classList.add('placeholder');

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('width', '320');
  rect.setAttribute('height', '240');
  rect.setAttribute('fill', theme.bg);

  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', '160');
  text.setAttribute('y', '120');
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('dominant-baseline', 'central');
  text.setAttribute('fill', theme.fg);
  text.setAttribute('font-family', 'system-ui, sans-serif');
  text.setAttribute('font-size', '64');
  text.setAttribute('font-weight', '700');
  text.textContent = initials || '?';

  svg.append(rect, text);
  return svg;
}

function createProductImage(product) {
  if (product.imageUrl && isValidImagePath(product.imageUrl)) {
    const img = document.createElement('img');
    img.src = product.imageUrl;
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => {
      img.replaceWith(createPlaceholder(product));
    });
    return img;
  }
  return createPlaceholder(product);
}

function createStockBadge(product) {
  const status = stockStatus(product.stok);
  return el('span', `stock stock--${status.key}`, status.label);
}

function createWaButton(product) {
  const link = el('a', 'btn btn--wa', product.stok > 0 ? 'Pesan via WhatsApp' : 'Tanya ketersediaan');
  link.href = buildWaUrl(product);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

function createProductCard(product) {
  const card = el('article', `product-card${product.stok === 0 ? ' product-card--habis' : ''}`);

  const media = el('div', 'card-media');
  media.append(createProductImage(product));
  if (product.unggulan) media.append(el('span', 'badge', 'Unggulan'));

  const body = el('div', 'card-body');
  body.append(
    el('p', 'card-category', product.kategori),
    el('h2', 'card-title', product.nama),
    el('p', 'card-price', formatRupiah(product.harga)),
    createStockBadge(product),
  );

  if (product.deskripsi) {
    const description = el('p', 'card-description', product.deskripsi);
    description.title = product.deskripsi;
    body.append(description);
  }

  body.append(createWaButton(product));
  card.append(media, body);
  return card;
}

export function renderCatalog(products, root) {
  if (!root) return;

  if (products.length === 0) {
    root.replaceChildren(el('p', 'empty-state', 'Belum ada produk di katalog.'));
    return;
  }

  root.replaceChildren(...products.map(createProductCard));
}

function createKpi(label, value) {
  const item = el('article', 'kpi');
  item.append(el('p', 'kpi-label', label), el('p', 'kpi-value', String(value)));
  return item;
}

function createDashboardRow(product) {
  const row = document.createElement('tr');

  const photoCell = document.createElement('td');
  photoCell.dataset.label = 'Foto';
  const thumb = el('span', 'thumb');
  thumb.append(createProductImage(product));
  photoCell.append(thumb);

  const name = document.createElement('td');
  name.dataset.label = 'Nama';
  name.textContent = product.nama;

  const category = document.createElement('td');
  category.dataset.label = 'Kategori';
  category.textContent = product.kategori;

  const price = document.createElement('td');
  price.dataset.label = 'Harga';
  price.textContent = formatRupiah(product.harga);

  const stock = document.createElement('td');
  stock.dataset.label = 'Stok';
  const isLow = product.stok <= CONFIG.LOW_STOCK_THRESHOLD;
  stock.append(el('span', isLow ? 'stock stock--menipis' : 'stock stock--tersedia', stockStatus(product.stok).label));

  const featured = document.createElement('td');
  featured.dataset.label = 'Unggulan';
  featured.textContent = product.unggulan ? 'Ya' : 'Tidak';

  row.append(photoCell, name, category, price, stock, featured);
  return row;
}

export function renderDashboard(products, root) {
  if (!root) return;

  const totalStok = products.reduce((total, product) => total + product.stok, 0);
  const jumlahHabis = products.filter((product) => product.stok === 0).length;

  const kpiGrid = el('div', 'kpi-grid');
  kpiGrid.append(
    createKpi('Total produk', products.length),
    createKpi('Total stok', totalStok),
    createKpi('Produk habis', jumlahHabis),
  );

  const heading = el('h3', 'dashboard-heading', 'Daftar produk');
  const nodes = [kpiGrid, heading];

  if (products.length === 0) {
    nodes.push(el('p', 'empty-state', 'Belum ada produk. Tambahkan produk untuk memulai.'));
  } else {
    const table = el('table', 'product-table');
    const head = document.createElement('thead');
    const headRow = document.createElement('tr');
    for (const label of ['Foto', 'Nama', 'Kategori', 'Harga', 'Stok', 'Unggulan']) {
      headRow.append(el('th', undefined, label));
    }
    head.append(headRow);

    const body = document.createElement('tbody');
    body.append(...products.map(createDashboardRow));
    table.append(head, body);

    const wrapper = el('div', 'table-wrap');
    wrapper.append(table);
    nodes.push(wrapper);
  }

  root.replaceChildren(...nodes);
}

const STORAGE_MESSAGES = {
  corrupted:
    'Data tersimpan tidak dapat dibaca, katalog dimuat ulang dari data contoh. Data lama tidak ditimpa.',
  quota:
    'Penyimpanan perangkat penuh. Perubahan tetap ada selama halaman terbuka, tetapi belum tersimpan.',
  blocked:
    'Penyimpanan perangkat tidak tersedia. Perubahan hanya bertahan selama halaman terbuka.',
  unknown: 'Data gagal disimpan ke perangkat. Perubahan hanya ada di memori.',
};

export function renderStorageBanner(state, banner) {
  if (!banner) return;

  const message = state.corrupted ? STORAGE_MESSAGES.corrupted : STORAGE_MESSAGES[state.storageError];
  if (!message) {
    banner.hidden = true;
    banner.textContent = '';
    return;
  }

  banner.textContent = message;
  banner.hidden = false;
}

/** Tab Katalog/Dashboard dengan dukungan klik dan panah keyboard. */
export function initTabs() {
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  if (tabs.length === 0) return;

  function activate(tab, { focus = false } = {}) {
    for (const item of tabs) {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;

      const panel = document.getElementById(item.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    }
    if (focus) tab.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));

    tab.addEventListener('keydown', (event) => {
      let targetIndex = null;
      if (event.key === 'ArrowRight') targetIndex = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') targetIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') targetIndex = 0;
      if (event.key === 'End') targetIndex = tabs.length - 1;

      if (targetIndex !== null) {
        event.preventDefault();
        activate(tabs[targetIndex], { focus: true });
      }
    });
  });

  if (window.location.hash === '#dashboard') {
    const dashboardTab = document.getElementById('tab-dashboard');
    if (dashboardTab) activate(dashboardTab);
  }
}
