import {
  createFileRoute,
  notFound,
} from '@tanstack/react-router'
import { getQuestionById } from '@/actions/questions.ts'
import QuestionDetailHeader from '@/components/question-detail/QuestionDetailHeader.tsx'
import QuestionContent from '@/components/question-detail/QuestionContent.tsx'
import AnswerContent from '@/components/answer/AnswerContent.tsx'
import AnswerHeader from '@/components/answer/AnswerHeader.tsx'
import { handlerError } from '@/libs/util.ts'
import AnswerForm from '@/components/forms/AnswerForm.tsx'
import { authClient } from '@/libs/authClient.ts'
import LoginToAnswer from '@/components/answer/LoginToAnswer.tsx'

export const Route = createFileRoute('/questions/$id')({
  component: RouteComponent,
  loader: async ({ params }) => {
    return await getQuestionById({ data: { id: params.id } })
  },
})

function RouteComponent() {
  const { data: question, error } = Route.useLoaderData()
  const { data: session, isPending } = authClient.useSession()

  if (error) handlerError(error)
  if (!question) throw notFound()
  if (isPending) return <div>Loading...</div>

  return (
    <div className="w-full">
      <QuestionDetailHeader question={question} />
      <QuestionContent question={question} user={session?.user} />
      {question.answers.length > 0 && (
        <AnswerHeader answerCount={question.answers.length} />
      )}
      {question.answers.map((answer) => (
        <AnswerContent answer={answer} key={answer.id} askerId={question.askerId} user={session?.user} />
      ))}
      {session && <AnswerForm questionId={question.id} />}
      {!session && <LoginToAnswer />}
    </div>
  )
}
