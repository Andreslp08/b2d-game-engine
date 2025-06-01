// eslint.config.mjs
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
     ignores: [
      "dist/**",        // Ignora todo lo de dist
      "**/*.d.ts"       // Ignora archivos de declaración TypeScript donde sea
    ],
  },
  ...tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
      rules: {
        "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/ban-ts-comment": "off"
      }
    }
  )
];