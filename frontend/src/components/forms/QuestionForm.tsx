import { useTagStore } from '@/context/useTagStore.ts'
import { Form } from '@heroui/form'
import { Input } from '@heroui/input'
import { Select } from '@heroui/select'
import { SelectItem } from '@heroui/react'
import { Button } from '@heroui/button'
import { Controller, useForm } from 'react-hook-form'
import { questionSchema, QuestionSchema } from '@/libs/types/questionSchema.ts'
import { zodResolver } from '@hookform/resolvers/zod'
import RichTextEditor from '@/components/rte/RichTextEditor.tsx'
import clsx from 'clsx'

const defaultValue = {
  title: '',
  content: '',
  tags: [] as string[],
}
export function QuestionForm() {
  const tags = useTagStore((state) => state.tags)
  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, isValid, errors },
  } = useForm<QuestionSchema>({
    resolver: zodResolver(questionSchema),
    mode: 'all',
    defaultValues: defaultValue
  })
  const onSubmit = (data: QuestionSchema) => {
    console.log(data)
  }
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
        <Controller
          name="content"
          control={control}
          render={({ field, fieldState }) => (
            <>
              <p
                className={clsx('text-sm', {
                  'text-danger': fieldState.error?.message,
                })}
              >
                Include all the information someone would need to answer your
                question.
              </p>
              <RichTextEditor
                onChange={field.onChange}
                onBlur={field.onBlur}
                value={field.value}
                errorMessage={fieldState.error?.message}
              />
              {fieldState.error?.message && (
                <span className="text-xs text-danger -mt-1">
                  {fieldState.error?.message}
                </span>
              )}
            </>
          )}
        />
      </div>
      <div className="flex flex-col gap-3 w-full">
        <h3 className="text-2xl font-semibold">Tags</h3>
        <p className="text-sm text-neutral-500">
          Add up to 5 tags to describe what your question is about. Start typing
          to see suggestions.
        </p>
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
              selectedKeys={field.value ?? []}
              onBlur={field.onBlur}
              onSelectionChange={(keys) => field.onChange(Array.from(keys))}
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
            >
              {(tag) => <SelectItem key={tag.id}>{tag.name}</SelectItem>}
            </Select>
          )}
        />
      </div>
      <Button
        isLoading={isSubmitting}
        isDisabled={!isValid}
        color="primary"
        className="w-fit"
        type="submit"
      >
        Post your question
      </Button>
    </Form>
  )
}
