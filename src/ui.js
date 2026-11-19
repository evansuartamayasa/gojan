/**
 * Lapisan tampilan landing page GoJan.
 * Semua teks produk dirender lewat textContent, bukan innerHTML.
 */

import { CONFIG, filterProducts, isValidImagePath } from './products.js';

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

export function showCatalogError(message) {
  const grid = document.getElementById('catalog-root');
  const count = document.getElementById('catalog-count');
  if (!grid || !count) return;

  const status = el('p', 'empty-state', message);
  status.setAttribute('role', 'alert');
  grid.replaceChildren(status);
  count.textContent = '';
}

export function stockStatus(stok) {
  if (stok === 0) return { key: 'habis', label: 'Habis' };
  if (stok <= CONFIG.LOW_STOCK_THRESHOLD) {
    return { key: 'menipis', label: `Stok menipis: ${stok}` };
  }
  return { key: 'tersedia', label: `Stok: ${stok}` };
}

export function buildWhatsAppUrl(nomor, produk) {
  if (typeof nomor !== 'string' || !/^[1-9]\d{7,14}$/.test(nomor)) {
    throw new Error('Nomor WhatsApp harus menggunakan format internasional tanpa tanda tambah.');
  }
  if (!produk || typeof produk.nama !== 'string') {
    throw new Error('Data produk tidak valid.');
  }

  const harga = formatRupiah(produk.harga);
  const pesan =
    produk.stok > 0
      ? `Halo, saya ingin memesan ${produk.nama} (${harga}) sebanyak 1. Mohon konfirmasi ketersediaannya.`
      : `Halo, saya ingin menanyakan ketersediaan ${produk.nama} (${harga}). Mohon info kapan stok tersedia.`;

  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}

export function buildWaUrl(product) {
  return buildWhatsAppUrl(CONFIG.WA_NUMBER, product);
}

function buildGeneralWaUrl() {
  const pesan =
    'Halo GoJan, saya ingin bertanya tentang produk lokal yang tersedia di katalog.';
  return `https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent(pesan)}`;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function svgEl(tag, attributes) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [name, value] of Object.entries(attributes)) {
    node.setAttribute(name, value);
  }
  return node;
}

function createChatIcon() {
  const svg = svgEl('svg', {
    viewBox: '0 0 24 24',
    width: '18',
    height: '18',
    'aria-hidden': 'true',
    focusable: 'false',
  });
  svg.append(
    svgEl('path', {
      d: 'M4.5 5.5h15v10h-9l-6 4v-14Z',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '1.7',
      'stroke-linejoin': 'round',
    }),
    svgEl('path', {
      d: 'M8.5 9.5h7M8.5 12.5h4.5',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '1.7',
      'stroke-linecap': 'round',
    }),
  );
  return svg;
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

  const svg = svgEl('svg', {
    viewBox: '0 0 320 240',
    'aria-hidden': 'true',
    focusable: 'false',
  });
  svg.classList.add('placeholder');
  svg.append(
    svgEl('rect', { width: '320', height: '240', fill: theme.bg }),
    svgEl('text', {
      x: '160',
      y: '120',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      fill: theme.fg,
      'font-family': 'system-ui, sans-serif',
      'font-size': '64',
      'font-weight': '700',
    }),
  );
  svg.lastElementChild.textContent = initials || '?';
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
  if (product.stok === 0) {
    const disabled = el(
      'span',
      'btn btn--wa btn--wa-disabled',
      'Pesan via WhatsApp',
    );
    disabled.setAttribute('aria-disabled', 'true');
    disabled.setAttribute('aria-label', `Pesan ${product.nama} dinonaktifkan karena stok habis`);
    return disabled;
  }

  const link = el(
    'a',
    'btn btn--wa',
    product.stok > 0 ? 'Pesan via WhatsApp' : 'Tanya ketersediaan',
  );
  link.href = buildWaUrl(product);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute(
    'aria-label',
    `${product.stok > 0 ? 'Pesan' : 'Tanyakan ketersediaan'} ${product.nama} via WhatsApp`,
  );
  link.prepend(createChatIcon());
  return link;
}

function createProductCard(product) {
  const card = el(
    'article',
    `product-card${product.stok === 0 ? ' product-card--habis' : ''}`,
  );

  const media = el('div', 'card-media');
  media.append(createProductImage(product));
  if (product.unggulan) media.append(el('span', 'badge', 'Unggulan'));

  const body = el('div', 'card-body');
  body.append(
    el('p', 'card-category', product.kategori),
    el('h3', 'card-title', product.nama),
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

function renderCatalog(products, root) {
  if (products.length === 0) {
    root.replaceChildren(
      el('p', 'empty-state', 'Produk tidak ditemukan. Coba ubah kata pencarian atau filter yang dipilih.'),
    );
    return;
  }
  root.replaceChildren(...products.map(createProductCard));
}

function renderHeroFeatured(product, root) {
  if (!product) {
    root.replaceChildren();
    return;
  }

  const card = el('article', 'featured-card');

  const media = el('div', 'featured-media');
  media.append(createProductImage(product));
  media.append(el('span', 'badge', 'Pilihan minggu ini'));

  const body = el('div', 'featured-body');
  body.append(
    el('p', 'featured-category', product.kategori),
    el('p', 'featured-name', product.nama),
    el('p', 'featured-description', product.deskripsi),
  );

  const row = el('div', 'featured-row');
  row.append(el('p', 'featured-price', formatRupiah(product.harga)), createStockBadge(product));

  body.append(row);
  card.append(media, body);
  root.replaceChildren(card);
}

function getCategoryCounts(products) {
  const counts = new Map();
  for (const product of products) {
    counts.set(product.kategori, (counts.get(product.kategori) ?? 0) + 1);
  }
  return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0], 'id'));
}

function renderCategoryFilter(categories, total, root, active, onSelect) {
  const buttons = [];

  function makeButton(label, count, value) {
    const button = el('button', 'category-chip');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(value === active));
    button.append(el('span', undefined, label), el('span', 'chip-count', String(count)));
    button.addEventListener('click', () => onSelect(value));
    buttons.push({ button, value });
    return button;
  }

  const items = [makeButton('Semua', total, 'Semua')];
  for (const [category, count] of categories) {
    items.push(makeButton(category, count, category));
  }

  root.replaceChildren(...items);

  return function syncActive(nextActive) {
    for (const { button, value } of buttons) {
      const pressed = value === nextActive;
      button.setAttribute('aria-pressed', String(pressed));
      button.classList.toggle('is-active', pressed);
    }
  };
}

/**
 * Merender seluruh landing page dari data produk.
 * Filter kategori dikelola di sini karena halaman ini tidak punya state lain.
 */
export function initLanding(products) {
  const grid = document.getElementById('catalog-root');
  const filterRoot = document.getElementById('kategori');
  const count = document.getElementById('catalog-count');
  const searchInput = document.getElementById('catalog-search');
  const sortSelect = document.getElementById('catalog-sort');
  const heroRoot = document.getElementById('hero-featured');
  const heroMeta = document.getElementById('hero-meta');
  const heroWa = document.getElementById('hero-wa-link');

  if (!grid || !filterRoot || !count) return;

  const categories = getCategoryCounts(products);
  let activeCategory = 'Semua';
  let searchTerm = '';
  let sortBy = 'default';

  if (heroRoot) {
    const featured = products.find((product) => product.unggulan) ?? products[0];
    renderHeroFeatured(featured, heroRoot);
  }

  if (heroMeta) {
    heroMeta.textContent = `${products.length} produk pilihan · ${categories.length} kategori · pesan langsung via WhatsApp`;
  }

  if (heroWa) {
    heroWa.href = buildGeneralWaUrl();
  }

  const syncActive = renderCategoryFilter(
    categories,
    products.length,
    filterRoot,
    activeCategory,
    (value) => {
      activeCategory = value;
      syncActive(value);
      update();
    },
  );

  searchInput?.addEventListener('input', () => {
    searchTerm = searchInput.value;
    update();
  });

  sortSelect?.addEventListener('change', () => {
    sortBy = sortSelect.value;
    update();
  });

  function update() {
    const visible = filterProducts(products, {
      searchTerm,
      category: activeCategory,
      sortBy,
    });

    renderCatalog(visible, grid);
    count.textContent = `Menampilkan ${visible.length} dari ${products.length} produk`;
  }

  update();
}
