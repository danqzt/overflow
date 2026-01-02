import { createFileRoute } from '@tanstack/react-router'
import ErrorButton from '@/components/error/ErrorButton.tsx'

export const Route = createFileRoute('/session/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div><ErrorButton/> </div>
}
