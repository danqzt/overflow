import { Response } from '@/libs/types/Response.ts';

export async function fetchClient<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  options: Omit<RequestInit, 'body'> & {body?: unknown } ={}): Promise<Response<T>> {

  const {body, ...rest} = options;
  const apiUrl = process.env.API_URL;
  if(!apiUrl) throw new Error('Missing API URL');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(rest.headers || {}),
  }
  const response = await fetch(apiUrl + url, {
    method,
    headers,
    ...(body ? {body: JSON.stringify(body)} : {}),
    ...rest,
  });

   if(!response.ok) {
     const contentType = response.headers.get('Content-Type');
     const isJson = contentType?.includes('application/json') || contentType?.includes('application/problem+json');
     const errorData = isJson ? (await response.json()).title : await response.text();
     return {  error: { message: errorData || 'An error occurred', status: response.status } };
   }

   const data = await response.json();
   return { data };

}

