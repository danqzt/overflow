import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profiles/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/profiles/$id"!</div>
}
