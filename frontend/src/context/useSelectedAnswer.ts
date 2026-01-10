import { create } from 'zustand/react'
import type { Answer } from '@/libs/types'

type SelectedAnswer = {
  answer?: Answer | null
  setSelectedAnswer: (answer: Answer | null) => void
  clearSelectedAnswer: () => void
}

export const useSelectedAnswer = create<SelectedAnswer>((set) => ({
  setSelectedAnswer: (answer) => set({ answer }),
  answer: null,
  clearSelectedAnswer: () => set({ answer: null }),
}))
