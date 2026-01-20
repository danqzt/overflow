import { useQuery } from '@tanstack/react-query'
import { getTrandingTags } from '@/actions/tags.ts'
import { handlerError } from '@/libs/util.ts'
import { Chip } from '@heroui/chip'
import { Link } from '@tanstack/react-router'

export default function TrendingTags() {
  const { isPending, data: resp } = useQuery({
    queryKey: ['trending-tags'],
    queryFn: getTrandingTags,
    staleTime: 60_000,
  })

  if (resp?.error) {
    handlerError(resp?.error)
  }
  return (
    <div className="bg-primary-50 p-6 rounded-2xl">
      <h3 className="text-2xl text-center text-secondary mb-5">
        Trending tags this week
      </h3>
      {isPending ? (
        <div className="grid grid-cols-2 gap-3 px-6">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="h-8 bg-gray-200 rounded animate-pulse"
              style={{ width: '80%' }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-6">
          {resp?.data &&
            resp.data.map((tag) => (
              <Chip
                as={Link}
                to={`/questions?tag=${tag.tag}`}
                key={tag.tag}
                variant="solid"
                color="primary"
              >
                {tag.tag} ({tag.count})
              </Chip>
            ))}
        </div>
      )}

    </div>
  )
}
