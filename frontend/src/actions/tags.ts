import { createServerFn } from '@tanstack/react-start'
import { fetchTags } from '@/server/services/questionSvc.ts'
import { fetchClient } from '@/server/fetchClient.ts'
import { TrendingTag } from '@/libs/types'

export const getSortedTags = createServerFn({ method: 'GET' })
  .inputValidator((data: { sort: string }) => data)
  .handler(async ({ data }) => await fetchTags(data.sort))

export const getTags = createServerFn({ method: 'GET' })
  .handler(async () => await fetchTags())

export const getTrandingTags = createServerFn({ method: 'GET' })
  .handler(async () => await fetchClient<TrendingTag[]>('/stats/trending-tags'))

