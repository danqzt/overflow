import { Button } from '@heroui/button'
import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  CheckCircleIcon as CheckOutlined,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckSolid } from '@heroicons/react/24/solid'
import { Answer, Question, Vote } from '@/libs/types'
import { useMutation } from '@tanstack/react-query'
import { acceptAnswer, vote } from '@/actions/questions.ts'
import { handlerError, successToast } from '@/libs/util.ts'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'

type Props = {
  accepted?: boolean
  target: Question | Answer
  currentUserId?: string | null
  askerId?: string
}

const isTargetAnswer = (target: Question | Answer): target is Answer => {
  return 'questionId' in target
}

export default function VotingButton({
  target,
  currentUserId,
  askerId,
}: Props) {
  const router = useRouter()
  const [voteBtnType, setVoteBtnType] = useState<'up' | 'down' | null>(
    null,
  )

  const { isPending: acceptAnswerPending, mutateAsync: acceptAnswerAsync } =
    useMutation({
      mutationFn: acceptAnswer,
    })

  const { isPending: isVotingPending, mutateAsync: voteAsync } = useMutation({
    mutationFn: vote,
  })

  const canVote = isTargetAnswer(target)
    ? target.userId !== currentUserId && target.userVoted === 0
    : target.askerId !== currentUserId && target.userVoted === 0

  const handleAcceptAnswer = async () => {
    if (!isTargetAnswer(target) || askerId !== currentUserId) return

    const { error } = await acceptAnswerAsync({
      data: { answerId: target.id, questionId: target.questionId },
    })
    if (error) handlerError(error)
    else {
      successToast('Answer accepted successfully', 'Success')
      await router.invalidate()
    }
  }

  const handleVote = async (voteValue: 1 | -1) => {
    if (!canVote) return

    setVoteBtnType(voteValue === 1 ? 'up' : 'down')

    const vote: Vote = {
      targetType: isTargetAnswer(target) ? 'Answer' : 'Question',
      targetId: target.id,
      targetUserId: isTargetAnswer(target) ? target.userId : target.askerId,
      questionId: isTargetAnswer(target) ? target.questionId : target.id,
      voteValue,
    }
    const { error } = await voteAsync({ data: vote })
    if (error) handlerError(error)
    else {
      successToast('Your vote has been recorded', 'Success')
      await router.invalidate()
    }
  }
  const isPending = acceptAnswerPending || isVotingPending

  return (
    <div className="flex-shrink-0 flex flex-col gap-3 items-center justify-start mt-4">
      <Button
        isIconOnly
        variant="light"
        onPress={() => handleVote(1)}
        disabled={!canVote || isPending}
        isLoading={voteBtnType === 'up' && isVotingPending}
      >
        <ArrowUpCircleIcon className="w-12" />
      </Button>
      <span className="text-xl font-semibold">{target.votes}</span>
      <Button
        isIconOnly
        variant="light"
        onPress={() => handleVote(-1)}
        disabled={!canVote || isPending}
        isLoading={isVotingPending && voteBtnType === 'down'}
      >
        <ArrowDownCircleIcon className="w-12" />
      </Button>
      {isTargetAnswer(target) && (
        <Button
          isIconOnly
          variant="light"
          isDisabled={target.accepted || askerId !== currentUserId || isPending}
          className="disabled:opacity-100"
          isLoading={acceptAnswerPending}
          onPress={handleAcceptAnswer}
        >
          {target.accepted ? (
            <CheckSolid className="text-success" />
          ) : (
            <CheckOutlined className="size-12 text-default-500" />
          )}
        </Button>
      )}
    </div>
  )
}
