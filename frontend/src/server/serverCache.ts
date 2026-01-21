import { LRUCache } from 'lru-cache'
import { TopUserWithProfile, UserProfile } from '@/libs/types'
import { ApiResponse } from '@/libs/types/ApiResponse.ts'

function serverCache<T extends {}>() {
  return new LRUCache<string, T>({
    ttl: 1000 * 60 * 2,
    max: 500,
  })
}

export const profileCache = serverCache<Map<string, UserProfile>>();
export const topUsersCache = serverCache<ApiResponse<TopUserWithProfile[]>>();