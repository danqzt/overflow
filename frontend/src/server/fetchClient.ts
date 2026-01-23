import { getRequestHeaders } from '@tanstack/react-start/server'
import type { ApiResponse } from '@/libs/types/ApiResponse.ts'
import { getAccessToken } from '@/server/auth.ts'

export async function fetchClient<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  options: Omit<RequestInit, 'body'> & { body?: unknown } = {},
  authToken: string | undefined | 'anon' = undefined,
): Promise<ApiResponse<T>> {
  const { body, ...rest } = options
  const apiUrl = process.env.API_URL
  if (!apiUrl) throw new Error('Missing API URL')

  const token = authToken === 'anon'
    ? undefined
    : authToken || (await getAccessToken(getRequestHeaders()))?.accessToken


  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
    ...(rest.headers || {}),
  }
  const response = await fetch(apiUrl + url, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...rest,
  })

  if (!response.ok) {
    const contentType = response.headers.get('Content-Type')
    const isJson =
      contentType?.includes('application/json') ||
      contentType?.includes('application/problem+json')
    let errorData = isJson
      ? (await response.json()).title
      : await response.text()
    if (response.status === 401) {
      const authHeader = response.headers.get('WWW-Authenticate'.toLowerCase())
      if (authHeader?.includes('error_description')) {
        const match = authHeader.match(/error_description="(.+?)"/)
        if (match) errorData = match[1]
        else errorData = 'You must be logged in to do that'
      }
    }
    return {
      data: {} as T,
      error: {
        message: errorData || 'An error occurred',
        status: response.status,
      },
      authToken: token,

    }
  }

  const data = response.status === 204 ? {} : await response.json()
  return { data }
}
