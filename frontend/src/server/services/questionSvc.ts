import { ApiResponse } from '@/libs/types/ApiResponse.ts'
import type { Question, Tag } from '@/libs/types'
import { fetchClient } from '@/server/fetchClient.ts'
import { fetchProfiles } from '@/server/services/profileSvc.ts'

export async function fetchQuestions(tag?: string): Promise<ApiResponse<Question[]>> {
  let url = '/questions'
  if (tag) url += `?tag=${encodeURIComponent(tag)}`
  const { data, error } = await fetchClient<Array<Question>>(url)
  if (error) return { data: [], error }

  const ids = Array.from(new Set(data.map((q) => q.askerId)));
  const profiles = await fetchProfiles(ids);

  const enrichedData = data.map(question => ({
    ...question,
    author: profiles.get(question.askerId)!
  }));

  return { data: enrichedData  }
}

export async function fetchQuestionById(id: string) : Promise<ApiResponse<Question>> {
  const {data ,error } = await fetchClient<Question>(`/questions/${id}`)
  if(error) return { data: {} as Question, error };
  if(!data?.askerId) return { data: {} as Question };

  let ids = new Set<string>()
  ids.add(data.askerId)
  data.answers.forEach(a => { ids.add(a.userId) });
  const profiles = await fetchProfiles(Array.from(ids));
  const enrichedData = { ...data,
    author : profiles.get(data.askerId)!,
    answers: data.answers.map(answer => ({...answer, author: profiles.get(answer.userId)! }))
  };
  return { data: enrichedData }
}

export async function queryQuestions(query: string) {
  const { data, error } = await fetchClient<Array<Question>>(
    `/search?query=${encodeURIComponent(query)}`,
  )
  if (error) throw error
  return data
}

export function fetchTags() {
  return fetchClient<Array<Tag>>('/tags')
}
