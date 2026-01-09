import { Answer } from '@/libs/types'
import { create } from 'zustand/react'

type SelectedAnswer = {
  answer?: Answer,
  setSelectedAnswer: (answer: Answer| undefined) => void,
}

export const useSelectedAnswer = create<SelectedAnswer>((set, get) => ({
  setSelectedAnswer: (answer) => set({ answer }),
  answer: get()?.answer
}));
