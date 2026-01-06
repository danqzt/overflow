import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/questions/ask')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/questions/ask"!</div>
}
