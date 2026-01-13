import { createServerFn } from '@tanstack/react-start'
import type { Answer, Question } from '@/libs/types'
import { fetchClient } from '@/server/fetchClient.ts'
import {
  editAnswerSchema,
  editQuestionSchema,
  postAnswerSchema,
  schema,
} from '@/libs/types/schema.ts'
import {
  fetchQuestionById,
  fetchQuestions,
  queryQuestions,
} from '@/server/services/questionSvc.ts'



export const getQuestions = createServerFn({ method: 'GET' }).handler(
  async () => fetchQuestions(),
)

export const getQuestionsByTag = createServerFn({ method: 'GET' })
  .inputValidator((data: { tag: string }) => data)
  .handler(async ({ data }) => fetchQuestions(data.tag))

export const getQuestionById = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => fetchQuestionById(data.id))

export const searchQuestion = createServerFn({ method: 'GET' })
  .inputValidator((data: { query: string }) => data)
  .handler(async ({ data }) => queryQuestions(data.query))

export const askQuestion = createServerFn({ method: 'POST' })
  .inputValidator(schema)
  .handler(async ({ data }) => {
    return await fetchClient<Question>('/questions', 'POST', {
      body: { ...data },
    })
  })
export const editQuestion = createServerFn({ method: 'POST' })
  .inputValidator(editQuestionSchema)
  .handler(async ({ data }) => {
    const { id, ...rest } = data
    return await fetchClient<Question>(`/questions/${id}`, 'PUT', {
      body: { ...rest },
    })
  })

export const deleteQuestion = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) =>
    fetchClient<{}>(`/questions/${data.id}`, 'DELETE'),
  )

export const postAnswer = createServerFn({ method: 'POST' })
  .inputValidator(postAnswerSchema)
  .handler(async ({ data }) => {
    const { questionId, ...rest } = data
    return await fetchClient<Answer>(
      `/questions/${questionId}/answers`,
      'POST',
      {
        body: { ...rest },
      },
    )
  })

export const editAnswer = createServerFn({ method: 'POST' })
  .inputValidator(editAnswerSchema)
  .handler(async ({ data }) => {
    const { questionId, answerId, ...rest } = data
    return await fetchClient<{}>(
      `/questions/${questionId}/answers/${answerId}`,
      'PUT',
      {
        body: { ...rest },
      },
    )
  })

export const deleteAnswer = createServerFn({ method: 'POST' })
  .inputValidator((data: { questionId: string; answerId: string }) => data)
  .handler(async ({ data }) => {
    const { questionId, answerId } = data
    return await fetchClient<{}>(
      `/questions/${questionId}/answers/${answerId}`,
      'DELETE',
    )
  })
