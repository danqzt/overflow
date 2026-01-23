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
import { Answer, AnswerSortOption } from '@/libs/types'
import { useState } from 'react'
import Loading from '@/components/Loading.tsx'

export const Route = createFileRoute('/questions/$id')({
  component: RouteComponent,
  loader: async ({ params }) => {
    return await getQuestionById({ data: { id: params.id } })
  },
})

function RouteComponent() {
  const { data: question, error } = Route.useLoaderData()
  const { data: session, isPending } = authClient.useSession()
  const [ sortMode, setSortMode] = useState<AnswerSortOption>('highScore');

  if (error) handlerError(error)
  if (!question) throw notFound()
  if (isPending) return <Loading/>

  const sortHighScore = (a: Answer, b: Answer) => {
    if(a.accepted !== b.accepted) return a.accepted ? -1 : 1;
    const va = a.votes ?? 0, vb = b.votes ?? 0;
    if(va!== vb) return vb - va;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }

  const sortCreatedAt = (a: Answer, b: Answer) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }

  const sortedAnswers = [...question.answers].sort(sortMode === 'highScore' ? sortHighScore : sortCreatedAt );
  return (
    <div className="w-full">
      <QuestionDetailHeader question={question} />
      <QuestionContent question={question} user={session?.user} />
      {question.answers.length > 0 && (
        <AnswerHeader answerCount={question.answers.length} sortBy={sortMode} setSortBy={setSortMode} />
      )}
      {sortedAnswers.map((answer) => (
        <AnswerContent answer={answer} key={answer.id} askerId={question.askerId} user={session?.user} />
      ))}
      {session && <AnswerForm questionId={question.id} />}
      {!session && <LoginToAnswer />}
    </div>
  )
}
