import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';


import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  build: {
    rollupOptions: {
      input: {
        // content: resolve(__dirname, 'src/contentScript.jsx'),
        main: resolve(__dirname, 'src/main.jsx'),
        sidepanel: resolve(__dirname, 'src/sidepanel.jsx'),
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: 'assets/[name].[hash][extname]',
        dir: resolve(__dirname, 'dist'),
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
