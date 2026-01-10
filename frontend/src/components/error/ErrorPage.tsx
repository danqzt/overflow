import { Button } from '@heroui/button'

type Props = {
  error: Error
  reset: () => void
}
export default function ErrorPage({ error, reset }: Props) {
  return (
    <div className="h-full flex items-center justify-center space-y-4">
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-5xl font-bold">Something went wrong</h2>
        <h3 className="text-3xl text-danger-400">{error.message}</h3>
        <Button onPress={reset}>Try again</Button>
      </div>
    </div>
  )
}
