export type Response<T> = {
  data?: T
  error?: ServerError
}

export type ServerError = {
  message: string
  status: number
}
