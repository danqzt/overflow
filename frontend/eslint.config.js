//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  {
    ignores: [
      '.output/**',
      '.vinxi/**',
      '.tanstack/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**'
    ]
  },
  ...tanstackConfig
]
