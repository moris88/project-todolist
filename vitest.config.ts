/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
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
          lines: 80,
          statements: 80,
          functions: 80,
          branches: 80,
        },
      },
      globals: true,
      environment: 'jsdom',
      reporters: ['verbose'],
      setupFiles: ['./test/vitest.setup.ts'],
    },
  })
)
