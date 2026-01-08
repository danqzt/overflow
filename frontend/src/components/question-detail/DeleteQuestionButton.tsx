import { Link, useRouter } from '@tanstack/react-router'
import { Button } from '@heroui/button'
import { useMutation } from '@tanstack/react-query'
import { deleteQuestion } from '@/actions/questions.ts'
import { handlerError } from '@/libs/util.ts'

type Props = {
  id: string
}
export default function DeleteQuestionButton({ id }: Props) {
  const { isPending, mutateAsync } = useMutation({
    mutationFn: deleteQuestion,
  })

  const router = useRouter()
  const onClick = async () => {
    const { error } = await mutateAsync({ data: { id } })
    if (error) handlerError(error)
    else router.navigate({ to: '/questions' })
  }
  return (
    <Button
      isDisabled={isPending}
      as={Link}
      size="sm"
      variant="faded"
      color="danger"
      onPress={onClick}
    >
      Delete
    </Button>
  )
}
