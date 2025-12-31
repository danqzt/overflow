import { createFileRoute, notFound } from '@tanstack/react-router'
import { getQuestionById } from '@/actions/questions.ts'
import QuestionDetailHeader from '@/components/question-detail/QuestionDetailHeader.tsx'
import QuestionContent from '@/components/question-detail/QuestionContent.tsx'
import AnswerContent from '@/components/question-detail/AnswerContent.tsx'
import AnswerHeader from '@/components/question-detail/AnswerHeader.tsx'

export const Route = createFileRoute('/questions/$id')({
  component: RouteComponent,
  loader: async ({ params }) => {
    try {
      return await getQuestionById({ data: { id: params.id } });
    } catch (err: any) {
      if (err?.status === 404) {
        throw notFound();
      }
      throw err;
    }
  },
})

function RouteComponent() {
  const question = Route.useLoaderData();

  return (<div className='w-full'>
    <QuestionDetailHeader question={question}/>
    <QuestionContent question={question}/>
    {question.answers.length > 0 && (
      <AnswerHeader answerCount={question.answers.length} />
    )}
    {question.answers.map(answer => (
      <AnswerContent answer={answer} key={answer.id}/>
    ))}
  </div>)
}
