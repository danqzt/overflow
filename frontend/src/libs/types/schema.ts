import { z } from 'zod'
import { stripHtmlTags } from '@/libs/util.ts'

const required = (name: string) =>
  z.string().trim().min(1, `${name} is required`)

const contentField = z
  .string()
  .refine((value) => value.trim().length > 0, {
    message: 'Content is required',
  })
  .refine((value) => stripHtmlTags(value).length >= 10, {
    message: 'Content must be at least 10 characters',
  })

export const schema = z.object({
  title: required('Title'),
  content: contentField,
  tags: z
    .array(z.string(), { message: 'Select at least 1 tag' })
    .min(1, 'Select at least 1 tag')
    .max(5, 'You can select up to 5 tags'),
})

export const editQuestionSchema = schema.extend({
  id: z.string().uuid('Invalid question ID'),
})

export const answerSchema = z.object({
  content: contentField,
})

export const postAnswerSchema = answerSchema.extend({
  questionId: z.string().uuid('Invalid question ID'),
})

export const editAnswerSchema = postAnswerSchema.extend({
  answerId: z.string().uuid('Invalid answer ID'),
})

const sortOptions = ['newest', 'unanswered', 'active']
export type SortOption = typeof sortOptions[number]
export const questionSearchSchema = z.object({
  tag: z.string().optional(),
  sort: z.enum(sortOptions).optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
})

export type QuestionSchema = z.infer<typeof schema>
export type EditQuestionSchema = z.infer<typeof editQuestionSchema>
export type AnswerSchema = z.infer<typeof answerSchema>
export type EditAnswerSchema = z.infer<typeof editAnswerSchema>
export type PostAnswerSchema = z.infer<typeof postAnswerSchema>
export type QuestionSearch = z.infer<typeof questionSearchSchema>
