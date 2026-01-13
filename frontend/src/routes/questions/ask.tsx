import { createFileRoute, redirect } from '@tanstack/react-router'
import { QuestionForm } from '@/components/forms/QuestionForm.tsx'
import { getCurrentSession } from '@/actions/profile.ts'


export const Route = createFileRoute('/questions/ask')({
  beforeLoad: async ({ location }) => {
    const session = await getCurrentSession();
    if(!session)
      throw redirect({to: '/profiles/signin', search: {redirect: location.pathname}});
    return { session }
  },
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
