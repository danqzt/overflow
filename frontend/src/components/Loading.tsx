import { Spinner } from '@heroui/spinner'

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-full">
      <Spinner color="secondary" label="loading..." />
    </div>
  )
}