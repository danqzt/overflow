import { ApiResponse } from '@/libs/types/ApiResponse.ts'
import type { PaginatedResult, Question, Tag, VoteRecord } from '@/libs/types'
import { fetchClient } from '@/server/fetchClient.ts'
import { fetchProfiles } from '@/server/services/profileSvc.ts'
import { QuestionSearch } from '@/libs/types/schema.ts'

export async function fetchQuestions(
  qParams : QuestionSearch,
): Promise<ApiResponse<PaginatedResult<Question>>> {
  const params = new URLSearchParams();
  if( qParams?.tag ) params.set('tag', qParams.tag);
  if( qParams?.page ) params.set('page', qParams.page.toString());
  if( qParams?.pageSize ) params.set('pageSize', qParams.pageSize.toString());
  if( qParams?.sort ) params.set('sort', qParams.sort);

  const url = `/questions${params.toString() ? `?${params.toString()}` : ''}`;

  const { data, error } = await fetchClient<PaginatedResult<Question>>(url)
  if (error)
    return { data: { items: [], pageSize: 0, page: 0, totalCount: 0 }, error }

  const ids = Array.from(new Set(data.items.map((q) => q.askerId)))
  const profiles = await fetchProfiles(ids)

  const enrichedData = data.items.map((question) => ({
    ...question,
    author: profiles.get(question.askerId)!,
  }))

  return {
    data: {
      items: enrichedData,
      page: data.page,
      pageSize: data.pageSize,
      totalCount: data.totalCount,
    },
  }
}

export async function fetchQuestionById(
  id: string,
): Promise<ApiResponse<Question>> {
  const { data, error, authToken } = await fetchClient<Question>(
    `/questions/${id}`,
  )
  if (error) return { data: {} as Question, error }
  if (!data?.askerId) return { data: {} as Question }

  let ids = new Set<string>()
  ids.add(data.askerId)
  data.answers.forEach((a) => {
    ids.add(a.userId)
  })
  const profiles = await fetchProfiles(Array.from(ids))

  let voteMap = new Map<string, number>()
  if (authToken) {
    const voteUrl = `/votes/${id}`
    const { data: votes, error: voteError } = await fetchClient<VoteRecord[]>(
      voteUrl,
      undefined,
      undefined,
      authToken,
    )
    if (!voteError) {
      voteMap = new Map(votes.map((v) => [v.targetId, v.voteValue]))
    }
  }

  const getUserVote = (targetId: string) => voteMap.get(targetId) ?? 0

  const enrichedData: Question = {
    ...data,
    userVoted: getUserVote(data.id),
    author: profiles.get(data.askerId)!,
    answers: data.answers.map((answer) => ({
      ...answer,
      author: profiles.get(answer.userId)!,
      userVoted: getUserVote(answer.id),
    })),
  }

  return { data: enrichedData }
}

export async function queryQuestions(query: string) {
  const { data, error } = await fetchClient<Array<Question>>(
    `/search?query=${encodeURIComponent(query)}`,
  )
  if (error) throw error
  return data
}

export function fetchTags(sort?: string) {
  let url = '/tags'
  if (sort) {
    url += `?sort=${encodeURIComponent(sort)}`
  }
  return fetchClient<Array<Tag>>(url)
}
