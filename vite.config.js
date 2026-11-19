import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

export default {
  build: {
    rollupOptions: {
      input: {
        catalog: resolve(root, 'index.html'),
        owner: resolve(root, 'owner.html'),
      },
    },
  },
};
