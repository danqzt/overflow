import { createFileRoute } from '@tanstack/react-router'
import QuestionForm from '@/components/ask/QuestionForm.tsx'

export const Route = createFileRoute('/questions/ask')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="px-6">
      <h3 className="font-semibold text-3xl pb-3"> Ask a public question</h3>
      <QuestionForm />
    </div>
  )
}
