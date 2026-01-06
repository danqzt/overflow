import { z } from 'zod'

const required = (name: string) => z.string().trim().min(1, `${name} is required`);

export const questionSchema = z.object({
  title: required("Title"),
  content: required("Content").min(10, 'Content must be at least 10 characters'),
  tags: z.array(z.string(), {message: 'Select at least 1 tag'}).min(1, 'Select at least 1 tag').max(5, 'You can select up to 5 tags'),
});

export type QuestionSchema = z.infer<typeof questionSchema>;