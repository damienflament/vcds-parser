import { defineConfig } from 'vite'
import commonjs from 'vite-plugin-commonjs'

export default defineConfig({
  plugins: [
    commonjs()
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        sw: 'sw.js'
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  }
})
