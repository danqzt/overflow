import { createFileRoute } from '@tanstack/react-router'
import { getQuestions } from '@/actions/questions.ts'
import QuestionCard from '@/components/question/QuestionCard.tsx'
import QuestionHeader from '@/components/question/QuestionHeader.tsx'
import {  questionSearchSchema } from '@/libs/types/schema.ts'
import AppPagination from '@/components/question/AppPagination.tsx'

export const Route = createFileRoute('/questions/')({
  validateSearch: (search) => questionSearchSchema.parse(search),
  component: QuestionPage,
  loader: async ({ location }) => {
    const params = location.search;
    return await getQuestions({data: params})
  },
})

function QuestionPage() {
  const {data: questions, error } = Route.useLoaderData()!
  const params = Route.useSearch();

  if(error) {
    throw error;
  }
  return (
    <>
      <QuestionHeader tag={params.tag} total={questions?.totalCount ?? 0} />
      {questions.items.map((q) => (
        <div key={q.id} className="py-4 not-last:border-b w-full flex">
          <QuestionCard question={q} />
        </div>
      ))}
      <AppPagination totalCount={questions?.totalCount ?? 0} />
    </>
  )
}
