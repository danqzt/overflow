import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@heroui/button'
import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import type {
  AnswerSchema,
  EditAnswerSchema,
  PostAnswerSchema} from '@/libs/types/schema.ts';
import { editAnswer, postAnswer } from '@/actions/questions.ts'
import {
  answerSchema
} from '@/libs/types/schema.ts'
import { handlerError } from '@/libs/util.ts'
import { RichTextField } from '@/components/forms/RichTextField.tsx'
import { useSelectedAnswer } from '@/context/useSelectedAnswer.ts'

type Props = {
  questionId: string
}
export default function AnswerForm({ questionId }: Props) {
  const { answer, clearSelectedAnswer } = useSelectedAnswer()

  const { isPending, mutateAsync } = useMutation({
    mutationFn: (request: PostAnswerSchema | EditAnswerSchema) => {
      return answer
        ? editAnswer({ data: request as EditAnswerSchema })
        : postAnswer({ data: request as PostAnswerSchema })
    },
  })

  const router = useRouter()

  const { control, handleSubmit, formState, reset } = useForm<AnswerSchema>({
    resolver: zodResolver(answerSchema),
    mode: 'onTouched',
  })
  const onSubmit = async (formData: AnswerSchema) => {
    const { error } = await mutateAsync({
      ...formData,
      questionId,
      ...(answer && { answerId: answer.id }),
    })
    if (error) handlerError(error)
    else {
      onClear()
      await router.invalidate()
    }
  }
  const onClear = () => {
    reset({ content: '' })
    clearSelectedAnswer()
  }
  useEffect(() => {
    if (answer) {
      reset(
        { content: answer.content },
        { keepTouched: false, keepDirty: false },
      )
      setTimeout(
        () =>
          document
            .getElementById('answer-form')
            ?.scrollIntoView({ behavior: 'smooth' }),
        100,
      )

      // unmounting
      return () => clearSelectedAnswer()
    }
  }, [answer])

  return (
    <div className="flex flex-col items-start my-4 gap3 w-full px-6">
      <h3 className="text-2xl">Your answer</h3>
      <form
        onSubmit={handleSubmit(onSubmit)}
        id="answer-form"
        className="w-full flex flex-col gap-3"
      >
        <RichTextField name="content" control={control} />
        <div className="flex gap-3">
          <Button
            isDisabled={isPending || !formState.isValid || !formState.isDirty}
            type="submit"
            isLoading={isPending}
            color="primary"
            className="w-fit"
          >
            {answer ? 'Edit' : 'Post'} Your Answer
          </Button>
          <Button
            type="button"
            variant="faded"
            color="secondary"
            onPress={onClear}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
