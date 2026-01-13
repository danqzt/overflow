import { createServerFn } from '@tanstack/react-start'
import { fetchTags } from '@/server/services/questionSvc.ts'

export const getTags = createServerFn({ method: 'GET' }).handler(
  async () => await fetchTags(),
)
