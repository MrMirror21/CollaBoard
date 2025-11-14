import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**",
      "eslint.config.mjs",
    ],
  },

  ...compat.extends("airbnb", "airbnb/hooks"),

  {
    files: ["apps/web/src/**/*.ts", "apps/web/src/**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: [
      "vitest.config.ts",
      "vite.config.ts",
      ".storybook/**/*.ts",
      ".storybook/**/*.tsx"
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: false, // type-check 비활성화
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      react,
      "react-hooks": reactHooks,
      import: importPlugin,
      prettier,
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          project: [
            "./apps/web/tsconfig.node.json",
            "./apps/web/tsconfig.app.json",
            "./tsconfig.json",
          ],
        },
        node: {
          extensions: [".js", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,

      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // 충돌나는 규칙 off
      "react/react-in-jsx-scope": "off", // Vite/React 17+
      "import/prefer-default-export": "off",
      "react/jsx-props-no-spreading": "off",
      "react/require-default-props": "off",

      "prettier/prettier": "error",

      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: true,
          optionalDependencies: false,
          peerDependencies: false,
        },
      ]
    },
  },

  prettierConfig,
];