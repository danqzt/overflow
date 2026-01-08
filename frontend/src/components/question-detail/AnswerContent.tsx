import { Answer } from '@/libs/types'
import VotingButton from '@/components/question-detail/VotingButton.tsx'
import AnswerFooter from '@/components/question-detail/AnswerFooter.tsx'

type Props = {
  answer: Answer
}
export default function AnswerContent({ answer }: Props) {
  return (
    <div className="flex border-b pb-3 px-6">
      <VotingButton accepted={answer.accepted} />
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
