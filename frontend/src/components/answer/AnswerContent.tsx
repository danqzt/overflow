import type { Answer } from '@/libs/types'
import VotingButton from '@/components/question-detail/VotingButton.tsx'
import AnswerFooter from '@/components/answer/AnswerFooter.tsx'
import { AuthUser } from '@/libs/authClient.ts'

type Props = {
  answer: Answer,
  user?: AuthUser,
  askerId: string,
}
export default function AnswerContent({ answer, user, askerId }: Props) {
  return (
    <div className="flex border-b pb-3 px-6">
      <VotingButton target={answer} currentUserId={user?.userId} askerId={askerId} />
      <div className="flex flex-col w-full">
        <div
          className="flex-1 mt-4 ml-6 prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: answer.content }}
        />
        <AnswerFooter answer={answer} />
      </div>
    </div>
  )
}
