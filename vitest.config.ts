/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      typecheck: {
        tsconfig: './tsconfig.json',
      },
      exclude: ['**/node_modules/**', '**/dist/**', '**/index.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json-summary'],
        exclude: [
          '**/index.ts',
          '**/*.d.ts',
          'test/**',
          'vite.config.ts',
          'vitest.config.ts',
        ],
        thresholds: {
          lines: 70,
          statements: 70,
          functions: 70,
          branches: 70,
        },
      },
      globals: true,
      environment: 'jsdom',
      reporters: ['verbose'],
      setupFiles: ['./test/vitest.setup.ts'],
    },
  })
)
