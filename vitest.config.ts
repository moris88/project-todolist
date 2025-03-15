/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      coverage: {
        provider: 'v8',
      },
      globals: true,
      environment: 'jsdom',
      reporters: ['verbose'],
      setupFiles: ['./test/vitest.setup.ts'],
    },
  })
)
