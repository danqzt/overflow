import { useMutation } from '@tanstack/react-query'
import { postAnswer } from '@/actions/questions.ts'
import { answerSchema, AnswerSchema } from '@/libs/types/schema.ts'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { handlerError } from '@/libs/util.ts'
import { RichTextField } from '@/components/forms/RichTextField.tsx'
import { Button } from '@heroui/button'
import { useRouter } from '@tanstack/react-router'

type Props = {
  questionId: string
}
export default function AnswerForm({ questionId }: Props) {
  const { isPending, mutateAsync } = useMutation({
    mutationFn: postAnswer,
  })
  const router = useRouter()
  const { control, handleSubmit, formState, reset } = useForm<AnswerSchema>({
    resolver: zodResolver(answerSchema),
    mode: 'onTouched',
  })
  const onSubmit = async (formData: AnswerSchema) => {
    const { error } = await mutateAsync({
      data: { ...formData, questionId: questionId },
    })
    if (error) handlerError(error)
    else {
      reset();
      await router.invalidate();
    }
  }
  return (
    <div className="flex flex-col items-start my-4 gap3 w-full px-6">
      <h3 className="text-2xl">Your answer</h3>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col gap-3"
      >
        <RichTextField name="content" control={control} />
        <Button
          isDisabled={isPending || !formState.isValid}
          type="submit"
          isLoading={isPending}
          color="primary"
          className="w-fit"
        >
          Post Your Answer
        </Button>
      </form>
    </div>
  )
}
