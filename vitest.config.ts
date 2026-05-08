/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json-summary'],
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
