import js from "@eslint/js";
import globals from "globals";

export default [
  {
    // Don't lint external libraries
    ignores: ["public/assets/**"]
  },

  {
    // Browser globals are available in this application.
    files: ["public/**/*.js"],
    languageOptions: {
      globals: globals.browser
    }
  },

  {
    // The file registered as a Service Worker has access to related globals.
    files: ["public/sw.js"],
    languageOptions: {
      globals: globals.serviceworker
    }
  },

  {
    // Scripts are executed in the global Node context.
    files: ["scripts/*.mjs"],
    languageOptions: {
      globals: globals.nodeBuiltin
    }
  },

  js.configs.recommended,
];
