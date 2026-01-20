import { Button } from '@heroui/button'
import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  CheckCircleIcon as CheckOutlined,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckSolid } from '@heroicons/react/24/solid'
import { Answer, Question } from '@/libs/types'
import { useMutation } from '@tanstack/react-query'
import { acceptAnswer } from '@/actions/questions.ts'
import { handlerError, successToast } from '@/libs/util.ts'
import { useRouter } from '@tanstack/react-router'

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
  const router = useRouter();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: acceptAnswer,
  })

  const handleAcceptAnswer = async () => {
    if (!isTargetAnswer(target) || askerId !== currentUserId) return;

    const {error} = await mutateAsync({data: { answerId: target.id, questionId: target.questionId }});
    if(error) handlerError(error);
    else {
      successToast('Answer accepted successfully', 'Success');
      await router.invalidate();
    }
  }
  return (
    <div className="flex-shrink-0 flex flex-col gap-3 items-center justify-start mt-4">
      <Button isIconOnly variant="light">
        <ArrowUpCircleIcon className="w-12" />
      </Button>
      <span className="text-xl font-semibold">0</span>
      <Button isIconOnly variant="light">
        <ArrowDownCircleIcon className="w-12" />
      </Button>
      {isTargetAnswer(target) && (
        <Button
          isIconOnly
          variant="light"
          isDisabled={target.accepted || askerId !== currentUserId }
          className="disabled:opacity-100"
          isLoading={isPending}
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
