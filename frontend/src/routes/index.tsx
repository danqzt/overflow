import { createFileRoute } from '@tanstack/react-router'
import { AcademicCapIcon } from '@heroicons/react/24/solid'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="flex items-center h-[calc(100vh-160px)] justify-center">
      <div className="flex flex-col justify-center items-center gap-5 text-5xl text-secondary font-bold">
        <AcademicCapIcon className="w-96 h-96" />
        <div>Welcome to Overflow!</div>
      </div>
    </div>
  )
}
