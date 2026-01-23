export type PaginatedResult<T> ={
  items: T[],
  totalCount: number,
  page: number,
  pageSize: number
}
export type AnswerSortOption = 'highScore' | 'created';
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
  author: UserProfile,
  userVoted: number
}

export interface Answer {
  id: string
  content: string
  userId: string
  questionId: string
  createdAt: string
  updatedAt?: string
  accepted: boolean,
  author: UserProfile,
  votes: number,
  userVoted: number
}

export interface Tag {
  slug: string
  name: string
  description: string
  id: string
  usageCount: number
}

export interface UserProfile {
  userId: string
  displayName: string
  reputation: number
}

export interface TrendingTag {
  tag: string,
  count: number
}

export interface VoteRecord  {
  targetId: string,
  targetType: 'Question' | 'Answer',
  voteValue: number
}

export interface Vote {
  targetId: string,
  targetType: 'Question' | 'Answer',
  targetUserId: string,
  questionId: string,
  voteValue: 1 | -1
}

export interface TopUser {
  userId: string,
  delta: number,
}

export type TopUserWithProfile = TopUser & { profile: UserProfile } ;

