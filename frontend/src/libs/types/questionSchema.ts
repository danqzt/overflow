import { z } from 'zod'
import { stripHtmlTags } from '@/libs/util.ts'

const required = (name: string) =>
  z.string().trim().min(1, `${name} is required`)

const contentField = z.string()
  .transform((value) => value ?? '')
  .refine((value) => value.trim().length > 0, {
    message: 'Content is required',
  })
  .refine((value) => stripHtmlTags(value).length >= 10, {
    message: 'Content must be at least 10 characters',
  })

export const questionSchema = z.object({
  title: required('Title'),
  content: contentField,
  tags: z
    .array(z.string(), { message: 'Select at least 1 tag' })
    .min(1, 'Select at least 1 tag')
    .max(5, 'You can select up to 5 tags'),
})

export type QuestionSchema = z.infer<typeof questionSchema>
