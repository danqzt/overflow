import { createServerFn } from '@tanstack/react-start';
import { Question } from '@/types';

async function fetchQuestions(tag?: string): Promise<Question[]> {
  let url = 'http://localhost:18001/questions';
  if (tag) url += `?tag=${encodeURIComponent(tag)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(tag ? 'Failed to fetch questions by tag' : 'Failed to fetch questions');
  }
  return await response.json();
}

async function fetchQuestionById(id: string): Promise<Question> {
  const url = `http://localhost:18001/questions/${id}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch question by ID');
  }
  return await response.json() as Question;
}

export const getQuestions = createServerFn({ method: 'GET' })
  .handler(async () => fetchQuestions())

export const getQuestionsByTag = createServerFn({ method: 'GET' })
  .inputValidator((data: { tag: string }) => data)
  .handler(async ({ data }) => fetchQuestions(data.tag))

export const getQuestionById = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => fetchQuestionById(data.id));
