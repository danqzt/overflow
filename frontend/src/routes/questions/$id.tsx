import { createFileRoute, notFound } from '@tanstack/react-router'
import { getQuestionById } from '@/actions/questions.ts'
import QuestionDetailHeader from '@/components/question-detail/QuestionDetailHeader.tsx'
import QuestionContent from '@/components/question-detail/QuestionContent.tsx'
import AnswerContent from '@/components/question-detail/AnswerContent.tsx'
import AnswerHeader from '@/components/question-detail/AnswerHeader.tsx'
import { handlerError } from '@/libs/util.ts'
import AnswerForm from '@/components/forms/AnswerForm.tsx'

export const Route = createFileRoute('/questions/$id')({
  component: RouteComponent,
  loader: async ({ params }) => {
    return await getQuestionById({ data: { id: params.id } });
  },
})

function RouteComponent() {
  const {data: question, error} = Route.useLoaderData()!;

  if(error) handlerError(error);
  if(!question) throw notFound();

  return (<div className='w-full'>
    <QuestionDetailHeader question={question}/>
    <QuestionContent question={question}/>
    {question.answers.length > 0 && (
      <AnswerHeader answerCount={question.answers.length} />
    )}
    {question.answers.map(answer => (
      <AnswerContent answer={answer} key={answer.id}/>
    ))}
    <AnswerForm questionId={question.id}/>
  </div>)
}
