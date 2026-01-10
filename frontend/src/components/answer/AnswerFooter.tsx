import { Avatar } from '@heroui/avatar'
import { Button } from '@heroui/button'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import type { Answer } from '@/libs/types'
import { handlerError, timeAgo } from '@/libs/util.ts'
import { deleteAnswer } from '@/actions/questions.ts'
import { authClient } from '@/libs/authClient.ts'
import { useSelectedAnswer } from '@/context/useSelectedAnswer.ts'

type Props = {
  answer: Answer
}
export default function AnswerFooter({ answer }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const { data } = authClient.useSession()

  const { isPending, mutateAsync } = useMutation({
    mutationFn: deleteAnswer,
  })

  const router = useRouter()

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this answer?')) {
      const { error } = await mutateAsync({
        data: { answerId: answer.id, questionId: answer.questionId },
      })
      setDeleteTarget(answer.id)
      if (error) handlerError(error)
      else router.invalidate()
    }
  }
  const { setSelectedAnswer } = useSelectedAnswer()

  return (
    <div className="flex flex-between">
      {data?.user.userId === answer.userId && (
        <div className="flex justify-start items-center gap-2">
          <Button
            variant="light"
            size="md"
            color="primary"
            className="normal-case"
            isDisabled={isPending}
            onPress={() => setSelectedAnswer(answer)}
          >
            Edit
          </Button>
          <Button
            variant="light"
            size="md"
            color="danger"
            className="normal-case"
            type="button"
            onPress={handleDelete}
            isLoading={isPending && deleteTarget === answer.id}
            isDisabled={isPending}
          >
            Delete
          </Button>
        </div>
      )}
      <div className="flex justify-end mt-4 w-full">
        <div className="flex flex-col basis-2/5 bg-primary/10 px-3 py-2 gap-2 rounded-lg">
          <span className="text-sm font-extralight">
            answered {timeAgo(answer.createdAt)}
          </span>
          <div className="flex gap-3 items-center">
            <Avatar
              className="h-6 w-6"
              color="secondary"
              name={answer.userDisplayName.charAt(0)}
            />
            <div className="flex items-center flex-col">
              <span>{answer.userDisplayName}</span>
              <span className="self-start text-sm font-semibold">42</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
