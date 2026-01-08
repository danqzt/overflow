import { fetchClient } from '@/libs/server/fetchClient.ts'
import { Tag } from '@/libs/types'
import { createServerFn } from '@tanstack/react-start'

function fetchTags() {
  return fetchClient<Tag[]>('/tags');
}

export const getTags = createServerFn({ method: 'GET' })
  .handler(async () => await fetchTags());
