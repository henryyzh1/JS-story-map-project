import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        L: "readonly" // Leaflet global
      },
    },
    rules: {
      "no-unused-vars": ["warn", { "args": "none" }],
      "no-undef": "error",
      "semi": ["error", "always"],
      "quotes": ["error", "double"]
    },
  }
]);
