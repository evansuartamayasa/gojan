import './style.css';

import { apiRequest } from './api.js';

const loginForm = document.getElementById('login-form');
const ownerContent = document.getElementById('owner-content');
const ownerIdentity = document.getElementById('owner-identity');
const importPanel = document.getElementById('import-panel');
const inspectButton = document.getElementById('inspect-button');
const importButton = document.getElementById('import-button');
const importPreview = document.getElementById('import-preview');
const status = document.getElementById('owner-status');

let productsToImport = null;

function showStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle('owner-status--error', isError);
}

function showAuthenticated(user) {
  loginForm.hidden = true;
  ownerContent.hidden = false;
  ownerIdentity.textContent = `Sesi aktif · peran ${user.role}`;
  if (user.role === 'owner') {
    importPanel.hidden = false;
  } else {
    importPanel.hidden = true;
    showStatus('Akun ini tidak memiliki peran owner untuk mengimpor data.', true);
  }
}

function readLocalProducts() {
  const rawSchema = localStorage.getItem('gojan:v1:schema');
  const rawProducts = localStorage.getItem('gojan:v1:products');
  if (rawSchema !== '1' || rawProducts === null) {
    throw new Error('Data katalog GoJan versi 1 tidak ditemukan di perangkat ini.');
  }

  let products;
  try {
    products = JSON.parse(rawProducts);
  } catch {
    throw new Error('Data katalog lokal bukan JSON yang valid.');
  }
  if (!Array.isArray(products) || products.length === 0 || products.length > 100) {
    throw new Error('Data harus berisi 1–100 produk untuk dapat ditinjau dan diimpor.');
  }
  if (products.some((product) => !product || typeof product !== 'object' || Array.isArray(product))) {
    throw new Error('Data katalog lokal berisi bentuk produk yang tidak valid.');
  }
  return products;
}

function renderPreview(products) {
  const heading = document.createElement('h3');
  heading.textContent = `${products.length} produk ditemukan`;
  const list = document.createElement('ul');
  list.className = 'import-preview-list';
  for (const product of products) {
    const item = document.createElement('li');
    item.textContent = `${product.nama || 'Nama tidak tersedia'} · ${product.kategori || 'Tanpa kategori'}`;
    list.append(item);
  }
  importPreview.replaceChildren(heading, list);
  importPreview.hidden = false;
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const submitButton = loginForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  showStatus('Memverifikasi akun…');
  try {
    const { user } = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: formData.get('email'),
        password: formData.get('password'),
      },
    });
    loginForm.elements.password.value = '';
    showAuthenticated(user);
    showStatus(user.role === 'owner' ? 'Sesi aman aktif.' : 'Akses pemilik tidak tersedia.', user.role !== 'owner');
  } catch (error) {
    ownerContent.hidden = true;
    loginForm.hidden = false;
    showStatus(error.message, true);
  } finally {
    submitButton.disabled = false;
  }
});

inspectButton.addEventListener('click', () => {
  try {
    productsToImport = readLocalProducts();
    renderPreview(productsToImport);
    importButton.disabled = false;
    showStatus('Tinjau daftar di atas, lalu konfirmasi impor.');
  } catch (error) {
    productsToImport = null;
    importPreview.hidden = true;
    importButton.disabled = true;
    showStatus(error.message, true);
  }
});

importButton.addEventListener('click', async () => {
  if (!productsToImport) return;
  importButton.disabled = true;
  showStatus('Mengirim produk untuk validasi dan impor…');
  try {
    const result = await apiRequest('/api/owner/import', {
      method: 'POST',
      body: { products: productsToImport },
    });
    productsToImport = null;
    showStatus(
      `Impor selesai: ${result.imported.length} produk baru, ${result.skipped} ID yang sudah pernah diimpor dilewati. Salinan lokal tetap tersimpan.`,
    );
    importPreview.hidden = true;
  } catch (error) {
    importButton.disabled = false;
    showStatus(error.message, true);
  }
});

document.getElementById('logout-button').addEventListener('click', async () => {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    ownerContent.hidden = true;
    loginForm.hidden = false;
    loginForm.reset();
    productsToImport = null;
    importPreview.replaceChildren();
    importPreview.hidden = true;
    importButton.disabled = true;
    showStatus('Anda telah keluar.');
  } catch (error) {
    showStatus(error.message, true);
  }
});

apiRequest('/api/auth/me')
  .then(({ user }) => {
    showAuthenticated(user);
    showStatus(user.role === 'owner' ? 'Sesi aman aktif.' : 'Akses pemilik tidak tersedia.', user.role !== 'owner');
  })
  .catch((error) => {
    loginForm.hidden = false;
    if (error.status === 401) {
      showStatus('Masuk dengan akun yang telah diprovisikan untuk memulai.');
      return;
    }
    showStatus(error.message || 'Status akun tidak dapat diperiksa.', true);
  });
