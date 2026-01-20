import type { Question } from '@/libs/types'
import VotingButton from '@/components/question-detail/VotingButton.tsx'
import QuestionFooter from '@/components/question-detail/QuestionFooter.tsx'
import { AuthUser } from '@/libs/authClient.ts'

type Props = {
  question: Question,
  user?: AuthUser
}

export default function QuestionContent({ question, user }: Props) {
  return (
    <div className="flex border-b pb-3 px-6">
      <VotingButton target={question} askerId={question.askerId} currentUserId={user?.userId} />
      <div className="flex flex-col w-full">
        <div
          className="flex-1 mt-4 ml-6 prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: question.content }}
        />
        <QuestionFooter question={question} />
      </div>
    </div>
  )
}
