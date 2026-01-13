import type {UserProfile} from "@/libs/types";
import {profileCache} from "@/server/serverCache.ts";
import {fetchClient} from "@/server/fetchClient.ts";

export async function fetchProfiles(ids: string[]) : Promise<Map<string, UserProfile>> {
    const cacheKey = 'profile-cache-by-id';
    const sortedIds = ids.sort();
    if (profileCache.has(cacheKey)) {

        const profiles = profileCache.get(cacheKey)!;
        const hasAllIds = sortedIds.every((id: string) => profiles.has(id));
        if (hasAllIds) return profiles;
    }

    const { data, error } = await fetchClient<[UserProfile]>(
        `/profiles/batch?${new URLSearchParams({ ids: sortedIds.join(',') })}`,
    )

    const profilesMap = error
        ? new Map<string, UserProfile>()
        : new Map(data!.map((p) => [p.userId, p]));

    if(profilesMap.size > 0) profileCache.set(cacheKey, profilesMap);
    return profilesMap;
}

