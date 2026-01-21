import type {
  TopUser,
  TopUserWithProfile,
  UserProfile,
} from '@/libs/types'
import { profileCache } from '@/server/serverCache.ts'
import { fetchClient } from '@/server/fetchClient.ts'
import { ApiResponse } from '@/libs/types/ApiResponse.ts'

export async function fetchProfiles(
  ids: string[],
): Promise<Map<string, UserProfile>> {
  const cacheKey = 'profile-cache-by-id'
  const sortedIds = ids.sort()
  if (profileCache.has(cacheKey)) {
    const profiles = profileCache.get(cacheKey)!
    const hasAllIds = sortedIds.every((id: string) => profiles.has(id))
    if (hasAllIds) return profiles
  }

  const { data, error } = await fetchClient<[UserProfile]>(
    `/profiles/batch?${new URLSearchParams({ ids: sortedIds.join(',') })}`,
    'GET',
    undefined,
    'anon',
  )

  const profilesMap = error
    ? new Map<string, UserProfile>()
    : new Map(data!.map((p) => [p.userId, p]))

  if (profilesMap.size > 0) profileCache.set(cacheKey, profilesMap)
  return profilesMap
}

export async function fetchTopUsers(): Promise<ApiResponse<TopUserWithProfile[]>> {
  const { data: users, error } = await fetchClient<TopUser[]>(
    '/stats/top-users',
    'GET',
    undefined,
    'anon',
  )

  if (error) return { data: [], error: error }

  const ids = [...new Set(users?.map((u) => u.userId))]
  const profiles = await fetchProfiles(ids)
  return {
    data: users?.map((u) => ({
      ...u,
      profile: profiles.get(u.userId)!,
    })),
  }
}
