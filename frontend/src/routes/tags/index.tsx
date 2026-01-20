import { createFileRoute } from '@tanstack/react-router'
import { handlerError } from '@/libs/util.ts'
import TagCard from '@/components/tags/TagCard.tsx'
import TagHeader from '@/components/tags/TagHeader.tsx'
import { getSortedTags, getTags } from '@/actions/tags.ts'

type TagSearch = {
  sort?: string
}
export const Route = createFileRoute('/tags/')({
  validateSearch: (search: Record<string, string | undefined>): TagSearch => {
    return {
      sort: search.sort || undefined,
    }
  },
  component: RouteComponent,
  loader: async ({ location }) => {
    const { sort } = location.search as TagSearch
    if (sort) {
      return await getSortedTags({ data: { sort: sort } })
    }
    return await getTags()
  },
})

function RouteComponent() {
  const { data, error  } = Route.useLoaderData()

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
