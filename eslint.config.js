//  @ts-check
import { tanstackConfig } from "@tanstack/eslint-config";
import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";
import globals from "globals";
import js from "@eslint/js";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tanstackConfig,
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["dist", "**/generated/**"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: true, // Si es lento, limita a archivos donde lo necesitas
      },
      parser: tseslint.parser,
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      importPlugin: importPlugin, // Usa 'import' como clave
    },
    rules: {
      "import/no-unresolved": "off",
      "import/order": [
        "warn",
        {
          groups: [
            ["builtin", "external"],
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          pathGroups: [
            {
              pattern: "@mantine/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@prisma/client",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@trpc/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@tanstack/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@/types/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@/integrations/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@/store/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@/lib/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@/utils/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@/hooks/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@/constants/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@/assets/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@/components/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "./**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["type"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },
];
