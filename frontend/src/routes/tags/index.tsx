import { createFileRoute } from '@tanstack/react-router'
import { handlerError } from '@/libs/util.ts'
import TagCard from '@/components/tags/TagCard.tsx'
import TagHeader from '@/components/tags/TagHeader.tsx'
import { useGetTags } from '@/libs/hooks.ts'

export const Route = createFileRoute('/tags/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: tags } = useGetTags()

  const { data, error } = tags || {}

  if (error) {
    handlerError(error)
    return <div>Cannot load</div>
  }
  return (
    <div className="w-full px-6">
      <TagHeader />
      <div className="grid grid-cols-3 gap-4">
        {data?.map((tag) => (
          <TagCard tag={tag} key={tag.id} />
        ))}
      </div>
    </div>
  )
}
