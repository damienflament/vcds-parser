import { defineConfig } from 'vite'
import commonjs from 'vite-plugin-commonjs'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import ajv from './plugins/ajv.mjs'
import peggy from './plugins/peggy.mjs'

export default defineConfig({
  plugins: [
    nodePolyfills(),
    commonjs(),
    peggy(),
    ajv()
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
  },
  esbuild: {
    jsx: 'automatic',
    jsxDev: false,
    jsxImportSource: 'vanjs-jsx'
  }
})
