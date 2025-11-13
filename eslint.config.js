import globals from "globals";
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";

export default [
  js.configs.recommended,
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        "game": "readonly",
        "Hooks": "readonly",
        "ui": "readonly",
        "ChatMessage": "readonly",
        "CONST": "readonly",
        "JournalEntry": "readonly",
        "canvas": "readonly",
        "Application": "readonly",
        "Dialog": "readonly",
        "FormDataExtended": "readonly",
        "Scene": "readonly",
        "Actor": "readonly",
        "$": "readonly",
        "foundry": "readonly",
        "registrarMemoriaIA": "readonly"
      }
    },
    rules: {
      "semi": ["error", "always"]
    }
  }
];
