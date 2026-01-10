import { createFileRoute, notFound } from '@tanstack/react-router'
import { QuestionForm } from '@/components/forms/QuestionForm.tsx'
import { getQuestionById } from '@/actions/questions.ts'
import { handlerError } from '@/libs/util.ts'

export const Route = createFileRoute('/questions/edit/$id')({
  component: RouteComponent,
  loader: async ({ params }) => {
    return await getQuestionById({ data: { id: params.id } })
  },
})

function RouteComponent() {
  const { data: question, error } = Route.useLoaderData()

  if (error) handlerError(error)
  if (!question) throw notFound()

  return (
    <div className="flex flex-col gap-4 px-6">
      <h3 className="text-3xl font-semibold">Edit your question</h3>
      <QuestionForm question={question} />
    </div>
  )
}
