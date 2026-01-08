import { createServerFn } from '@tanstack/react-start';
import { Question } from '@/libs/types';
import { fetchClient } from '@/libs/server/fetchClient.ts';
import {
  editQuestionSchema,
  questionSchema,
} from '@/libs/types/questionSchema.ts'

async function fetchQuestions(tag?: string){
  let url = '/questions';
  if (tag) url += `?tag=${encodeURIComponent(tag)}`;
  const { data } = await fetchClient<Question[]>(url);
  return data;
}

async function fetchQuestionById(id: string){
  return await fetchClient<Question>(`/questions/${id}`);
}

async function queryQuestions(query: string){
  const {data, error} = await fetchClient<Question[]>(`/search?query=${encodeURIComponent(query)}`);
  if(error) throw error;
  return data;
}


export const getQuestions = createServerFn({ method: 'GET' })
  .handler(async () => fetchQuestions())

export const getQuestionsByTag = createServerFn({ method: 'GET' })
  .inputValidator((data: { tag: string }) => data)
  .handler(async ({ data }) => fetchQuestions(data.tag))

export const getQuestionById = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => fetchQuestionById(data.id));

export const searchQuestion = createServerFn({ method: 'GET' })
  .inputValidator((data: { query: string }) => data)
  .handler(async ({ data }) => queryQuestions(data.query))

export const askQuestion = createServerFn({ method: 'POST' })
  .inputValidator(questionSchema)
  .handler(async ({ data }) => {
    return await fetchClient<Question>('/questions', 'POST', {
      body: {...data},
    });
  });
export const editQuestion = createServerFn({ method: 'POST' })
  .inputValidator(editQuestionSchema)
  .handler(async ({ data }) => {
    const { id, ...rest } = data;
    return await fetchClient<Question>(`/questions/${id}`, 'PUT', {
      body: {...rest},
    });
  });

export const deleteQuestion = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => fetchClient<{}>(`/questions/${data.id}`, 'DELETE'));
