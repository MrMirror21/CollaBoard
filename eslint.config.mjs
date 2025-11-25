import airbnbExtended from 'eslint-config-airbnb-extended';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_FILES = ['**/*.{js,cjs,mjs,jsx,ts,tsx,cts,mts}'];
const TYPECHECK_FREE_FILES = [
  '**/vitest.config.ts',
  '**/vite.config.ts',
  '**/playwright.config.ts',
  '**/.storybook/**/*.ts',
  '**/.storybook/**/*.tsx',
  '**/test/**/*.ts',
  '**/test/**/*.tsx',
  '**/*.shims.d.ts',
  '**/stories/**/*.ts',
  '**/stories/**/*.tsx',
];

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/public/**', // 자동 생성 파일 (mockServiceWorker.js 등)
      '**/stories/**', // Storybook 예제 파일
      '**/generated/**', // Prisma 등 자동 생성 코드
      'eslint.config.mjs',
      'apps/server/prisma.config.ts',
    ],
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
  // Import resolver 설정 - @/ 경로 별칭 해석
  {
    name: 'collaboard/import-resolver',
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: [
            path.join(__dirname, 'apps/web/tsconfig.app.json'),
            path.join(__dirname, 'apps/server/tsconfig.json'),
          ],
        },
      },
    },
  },
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: path.join(__dirname, 'apps/web/tsconfig.app.json'),
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: ['apps/server/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: path.join(__dirname, 'apps/server/tsconfig.json'),
        tsconfigRootDir: __dirname,
      },
    },
  },
  // vite.config.ts, vitest.config.ts 등 타입 체크 제외 파일
  {
    files: TYPECHECK_FREE_FILES,
    ...tseslint.configs.disableTypeChecked,
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      'import-x/no-unresolved': 'off',
      'import-x/extensions': 'off',
    },
  },
  {
    name: 'collaboard/custom-rule-overrides',
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/require-default-props': 'off',
      'react/prop-types': 'off', // TypeScript 사용 시 불필요
      // 커스텀 Input 컴포넌트를 control로 인식하도록 설정
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          controlComponents: ['Input'],
          depth: 3,
        },
      ],
      'import-x/prefer-default-export': 'off',
      'comma-dangle': 'off',
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
          optionalDependencies: false,
          peerDependencies: false,
        },
      ],
      // @ 경로 별칭 관련 규칙 비활성화 (TypeScript가 이미 처리)
      'import-x/no-unresolved': 'off',
      'import-x/extensions': 'off',
      // generated 폴더 내 패키지에 대한 상대 경로 import 허용
      'import-x/no-relative-packages': 'off',
      // Prettier와 충돌하는 @stylistic 규칙들 비활성화
      '@stylistic/indent': 'off',
      '@stylistic/max-len': 'off',
      '@stylistic/object-curly-newline': 'off',
      '@stylistic/no-trailing-spaces': 'off',
      '@stylistic/comma-dangle': 'off',
      '@stylistic/no-multiple-empty-lines': 'off',
      '@stylistic/operator-linebreak': 'off',
      '@stylistic/semi': 'off',
      // 불필요한 규칙 비활성화
      'arrow-body-style': 'off',
    },
  },
  {
    name: 'collaboard/prettier',
    files: SOURCE_FILES,
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  prettierConfig,
];
