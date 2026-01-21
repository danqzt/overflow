import { useQuery } from '@tanstack/react-query'
import { handlerError } from '@/libs/util.ts'
import { getTopUsers } from '@/actions/profile.ts'

export default function TopUser() {
  const { isPending, data: resp } = useQuery({
    queryKey: ['top-users'],
    queryFn: getTopUsers,
    staleTime: 60_000,
  })

  if (resp?.error) {
    handlerError(resp?.error)
  }
  return (
    <div className="bg-primary-50 p-6 rounded-2xl">
      <h3 className="text-2xl text-center text-secondary mb-5">
        Most point this week
      </h3>
      {isPending ? (
        <div className="flex flex-col gap-3 px-6">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-8 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

      ) : (
        <div className="flex flex-col gap-3 px-6">
          {resp?.data &&
            resp.data.map((user) => (
              <div className="flex justify-between items-center" key={user.userId}>
                <div>{user.profile.displayName}</div>
                <div>{user.delta}</div>
              </div>
            ))}
        </div>
      )}

    </div>
  )
}