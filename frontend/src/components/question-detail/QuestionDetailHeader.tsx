import { Question } from '@/libs/types'
import { Button } from '@heroui/button'
import { Link } from '@tanstack/react-router'
import { fuzzyTimeAgo } from '@/libs/util.ts'
import { authClient } from '@/libs/authClient.ts'
import DeleteQuestionButton from '@/components/question-detail/DeleteQuestionButton.tsx'

type Props = {
  question: Question
}
function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-foreground-500">{label}</span>
      <span>{value}</span>
    </div>
  )
}
export default function QuestionDetailHeader({ question }: Props) {
  const { data } = authClient.useSession()
  return (
    <div className="flex flex-col w-full border-b gap-4 pb-4 px-6">
      <div className="flex justify-between gap-4">
        <div className="text-3xl font-semibold first-letter:uppercase">
          {question.title}
        </div>
        <Button
          as={Link}
          to="/questions/ask"
          color="secondary"
          className="w-[20%]"
        >
          Ask Question
        </Button>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Info label="Asked" value={fuzzyTimeAgo(question.createdAt)} />
          {question.updatedAt && (
            <Info label="Modified" value={fuzzyTimeAgo(question.updatedAt)} />
          )}
          <Info label="Viewed" value={`${question.viewCount + 1} times`} />
        </div>
        {data?.user?.userId === question.askerId && (
          <div className="flex items-center gap-3">
            <Button
              as={Link}
              to={`/questions//edit/${question.id}`}
              size="md"
              variant="faded"
              color="primary"
            >
              Edit
            </Button>
            <DeleteQuestionButton id={question.id} />
          </div>
        )}
      </div>
    </div>
  )
}
