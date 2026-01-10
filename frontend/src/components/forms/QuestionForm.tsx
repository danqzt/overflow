import { Form } from '@heroui/form'
import { Input } from '@heroui/input'
import { Select } from '@heroui/select'
import { SelectItem } from '@heroui/react'
import { Button } from '@heroui/button'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import type {
  EditQuestionSchema,
  QuestionSchema} from '@/libs/types/schema.ts';
import type { Question } from '@/libs/types'
import {
  schema
} from '@/libs/types/schema.ts'
import { askQuestion, editQuestion } from '@/actions/questions.ts'
import { handlerError } from '@/libs/util.ts'
import { useTagStore } from '@/context/useTagStore.ts'
import { RichTextField } from '@/components/forms/RichTextField.tsx'

type Props = {
  question?: Question
}
const defaultValue = {
  title: '',
  content: '',
  tags: [] as Array<string>,
}
export function QuestionForm({ question }: Props) {
  const tags = useTagStore((state) => state.tags)
  const {
    register,
    control,
    handleSubmit,
    formState: { isValid, errors, isDirty },
  } = useForm<QuestionSchema>({
    resolver: zodResolver(schema),
    mode: 'all',
    defaultValues: question
      ? { ...question, tags: question.tagSlugs }
      : defaultValue,
  })

  const { isPending, mutateAsync } = useMutation({
    mutationFn: (request: EditQuestionSchema | QuestionSchema) => {
      return question
        ? editQuestion({ data: request as EditQuestionSchema })
        : askQuestion({ data: request })
    },
  })

  const router = useRouter()

  const onSubmit = async (formData: QuestionSchema) => {
    const { data: resp, error } = await mutateAsync({
      ...formData,
      ...(question && { id: question.id }),
    })

    if (error) {
      handlerError(error)
      return
    }

    const questionId = question?.id ?? resp!.id
    router.navigate({ to: '/questions/$id', params: { id: questionId } })
  }
  const disabled = question ? !isDirty || !isValid : !isValid

  return (
    <Form
      className="flex flex-col gap-3 p-6 shadow-xl bg-white dark:bg-black"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-3 w-full">
        <h3 className="text-2xl font-semibold">Title</h3>
        <Input
          {...register('title')}
          className="w-full"
          label="Be specific and imagine you’re asking a question to another person."
          placeholder="e.g. How to center a div in CSS?"
          labelPlacement="outside-top"
          isInvalid={Boolean(errors.title)}
          errorMessage={errors.title?.message}
        />
      </div>
      <div className="flex flex-col gap-3 w-full">
        <h3 className="text-2xl font-semibold">Body</h3>
        <RichTextField name="content" control={control} />
      </div>
      <div className="flex flex-col gap-3 w-full">
        <h3 className="text-2xl font-semibold">Tags</h3>
        <p className="text-sm text-neutral-500">
          Add up to 5 tags to describe what your question is about. Start typing
          to see suggestions.
        </p>
        {tags.length > 0 && (
          <Controller
            control={control}
            name="tags"
            render={({ field, fieldState }) => (
              <Select
                className="w-full"
                label="Choose up to 5 tags that describe your question"
                isClearable
                selectionMode="multiple"
                disallowEmptySelection
                items={tags}
                selectedKeys={field.value}
                onBlur={field.onBlur}
                onSelectionChange={(keys) => field.onChange(Array.from(keys))}
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              >
                {(tag) => <SelectItem key={tag.id}>{tag.name}</SelectItem>}
              </Select>
            )}
          />
        )}
      </div>
      <Button
        isLoading={isPending}
        isDisabled={disabled}
        color="primary"
        className="w-fit"
        type="submit"
      >
        {question ? 'Edit' : 'Post'} your question
      </Button>
    </Form>
  )
}
