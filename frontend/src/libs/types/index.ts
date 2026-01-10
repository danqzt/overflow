export interface Question {
  id: string
  title: string
  content: string
  askerId: string
  askerDisplayName: string
  createdAt: string
  updatedAt?: string
  viewCount: number
  tagSlugs: Array<string>
  hasAcceptedAnswer: boolean
  votes: number
  answerCount: number
  answers: Array<Answer>
}

export interface Answer {
  id: string
  content: string
  userId: string
  userDisplayName: string
  questionId: string
  createdAt: string
  updatedAt?: string
  accepted: boolean
}

export interface Tag {
  slug: string
  name: string
  description: string
  id: string
}
