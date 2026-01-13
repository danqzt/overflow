export interface Question {
  id: string
  title: string
  content: string
  askerId: string
  createdAt: string
  updatedAt?: string
  viewCount: number
  tagSlugs: Array<string>
  hasAcceptedAnswer: boolean
  votes: number
  answerCount: number
  answers: Array<Answer>
  author: UserProfile
}

export interface Answer {
  id: string
  content: string
  userId: string
  questionId: string
  createdAt: string
  updatedAt?: string
  accepted: boolean,
  author: UserProfile
}

export interface Tag {
  slug: string
  name: string
  description: string
  id: string
}

export interface UserProfile {
  userId: string
  displayName: string
  reputation: number
}
