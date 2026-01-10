import { useMutation, useQuery } from '@tanstack/react-query'
import { getTags } from '@/actions/tags.ts'

export const useGetTags = () =>
  useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
    staleTime: 120_000,
  })

export const useDeleteImage = () =>
  useMutation({
    mutationFn: async (publicId: string) => {
      await fetch('/api/sign-image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(publicId),
      })
    },
  })
