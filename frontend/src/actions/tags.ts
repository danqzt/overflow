import { createServerFn } from '@tanstack/react-start'
import type { Tag } from '@/libs/types'
import { fetchClient } from '@/libs/server/fetchClient.ts'

function fetchTags() {
  return fetchClient<Array<Tag>>('/tags')
}

export const getTags = createServerFn({ method: 'GET' }).handler(
  async () => await fetchTags(),
)
