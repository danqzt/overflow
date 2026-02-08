import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@/server/auth.ts'
import loggingMiddleware from '@/server/loggingMiddleware.ts'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    middleware: [loggingMiddleware],
    handlers: {
      GET: ({ request }) => {
        return auth.handler(request)
      },
      POST: ({ request }) => {
        return auth.handler(request)
      },
    },
  },
})
