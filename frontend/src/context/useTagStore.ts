import { create } from 'zustand/react'
import type { Tag } from '@/libs/types'

type TagStore = {
  tags: Array<Tag>
  setTags: (tags: Array<Tag>) => void
  getTagBySlug: (slug: string) => Tag | undefined
}

export const useTagStore = create<TagStore>((set, get) => ({
  tags: [],
  setTags: (tags) => set({ tags }),
  getTagBySlug: (slug) => get().tags.find((tag) => tag.slug === slug),
}))
