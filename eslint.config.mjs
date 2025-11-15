import airbnbExtended from "eslint-config-airbnb-extended";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_FILES = ["**/*.{js,cjs,mjs,jsx,ts,tsx,cts,mts}"];
const TYPED_SOURCE_FILES = ["**/*.{ts,tsx,cts,mts}"];
const TYPECHECK_FREE_FILES = [
  "vitest.config.ts",
  "vite.config.ts",
  ".storybook/**/*.ts",
  ".storybook/**/*.tsx",
];

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
  {
    files: TYPED_SOURCE_FILES,
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
  },
  airbnbExtended.plugins.stylistic,
  airbnbExtended.plugins.importX,
  airbnbExtended.plugins.node,
  airbnbExtended.plugins.react,
  airbnbExtended.plugins.reactA11y,
  airbnbExtended.plugins.reactHooks,
  airbnbExtended.plugins.typescriptEslint,
  ...airbnbExtended.configs.base.recommended,
  ...airbnbExtended.configs.base.typescript,
  ...airbnbExtended.configs.react.recommended,
  ...airbnbExtended.configs.react.typescript,
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: path.join(__dirname, "apps/web/tsconfig.app.json"),
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: ["apps/server/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: path.join(__dirname, "apps/server/tsconfig.json"),
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: TYPECHECK_FREE_FILES,
    languageOptions: {
      parserOptions: { projectService: false },
    },
  },
  {
    name: "collaboard/custom-rule-overrides",
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-props-no-spreading": "off",
      "react/require-default-props": "off",
      "import-x/prefer-default-export": "off",
      "import-x/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: true,
          optionalDependencies: false,
          peerDependencies: false,
        },
      ],
    },
  },
  {
    name: "collaboard/prettier",
    files: SOURCE_FILES,
    plugins: {
      prettier,
    },
    rules: {
      "prettier/prettier": "error",
    },
  },
  prettierConfig,
];