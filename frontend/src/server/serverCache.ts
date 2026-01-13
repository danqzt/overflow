import { LRUCache } from 'lru-cache'
import { UserProfile } from '@/libs/types'

function serverCache<T extends {}>() {
  return new LRUCache<string, T>({
    ttl: 1000 * 60 * 2,
    max: 500,
  })
}

export const profileCache = serverCache<Map<string, UserProfile>>()