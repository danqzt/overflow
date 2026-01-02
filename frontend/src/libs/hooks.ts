import { useQuery } from '@tanstack/react-query'
import { getTags } from '@/actions/tags.ts'

export const useGetTags = () => useQuery({
  queryKey: ['tags'],
  queryFn: getTags,
  staleTime: 120_000,
})