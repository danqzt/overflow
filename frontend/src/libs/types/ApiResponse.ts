export type ApiResponse<T> = {
  data: T
  error?: ServerError,
  authToken?: string
}

export type ServerError = {
  message: string
  status: number
}
