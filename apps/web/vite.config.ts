import { defineConfig } from 'vitest/config';
import type { PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
const plugins: PluginOption[] = [
  react() as PluginOption,
  tailwindcss() as PluginOption,
];
export default defineConfig({
  plugins,
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:4000',
      '/socket.io': {
        target: 'ws://localhost:4000',
        ws: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    env: {
      VITE_API_URL: 'http://localhost:4000',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules', 'test'],
    },
    projects: [
      // 유닛 테스트 프로젝트
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/**/*.stories.*'],
          env: {
            VITE_API_URL: 'http://localhost:4000',
          },
          environmentOptions: {
            jsdom: {
              url: 'http://localhost:4000',
            },
          },
        },
      },
      // Storybook 테스트 프로젝트
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
