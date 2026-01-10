import { createFileRoute } from '@tanstack/react-router'
import { getQuestions, getQuestionsByTag } from '@/actions/questions.ts'
import QuestionCard from '@/components/question/QuestionCard.tsx'
import QuestionHeader from '@/components/question/QuestionHeader.tsx'

type QuestionSearch = {
  tag?: string
}
export const Route = createFileRoute('/questions/')({
  validateSearch: (
    search: Record<string, string | undefined>,
  ): QuestionSearch => {
    return {
      tag: search.tag || undefined,
    }
  },
  component: QuestionPage,
  loader: async ({ location }) => {
    const { tag } = location.search as QuestionSearch
    if (tag) {
      return await getQuestionsByTag({ data: { tag: tag } })
    }
    return await getQuestions()
  },
})

function QuestionPage() {
  const questions = Route.useLoaderData()!
  const params = Route.useSearch()
  return (
    <>
      <QuestionHeader tag={params.tag} total={questions.length} />
      {questions.map((q) => (
        <div key={q.id} className="py-4 not-last:border-b w-full flex">
          <QuestionCard question={q} />
        </div>
      ))}
    </>
  )
}
