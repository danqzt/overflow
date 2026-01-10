import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'

export type Theme = 'light' | 'dark'
const storageKey = '_preferered_theme'

// code from: https://nisabmohd.vercel.app/tanstack-dark
export const getThemeServerFn = createServerFn().handler(
  () => (getCookie(storageKey) || 'light') as Theme,
)

export const setThemeServerFn = createServerFn({ method: 'POST' })
  .inputValidator((t) => {
    if (t === 'light' || t === 'dark') return t
    throw new Error('Invalid theme')
  })
  .handler(({ data }) => setCookie(storageKey, data))
