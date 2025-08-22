import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    testTimeout: 360000,
    retry: 3,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
  // Relative to the web root
  cacheDir: './node_modules/.cache/cloud-vitest',
})
