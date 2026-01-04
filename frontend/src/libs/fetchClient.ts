import { Response } from '@/libs/types/Response.ts';
import { getAccessToken } from '@/libs/auth.ts'
import { getRequestHeaders } from '@tanstack/react-start/server'


export async function fetchClient<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  options: Omit<RequestInit, 'body'> & {body?: unknown } ={}): Promise<Response<T>> {

  const {body, ...rest} = options;
  const apiUrl = process.env.API_URL;
  if(!apiUrl) throw new Error('Missing API URL');
  const token = await getAccessToken(getRequestHeaders());
  console.log(token);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token?.accessToken) ? { 'Authorization': `Bearer ${token.accessToken}` } : {},
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
     let errorData = isJson ? (await response.json()).title : await response.text();
     if(response.status === 401) {
       const authHeader = response.headers.get('WWW-Authenticate'.toLowerCase());
       if(authHeader?.includes('error_description')){
         const match = authHeader.match(/error_description="(.+?)"/);
         if(match) errorData = match[1];
         else errorData = "You must be logged in to do that";
       }
     }
     return {  error: { message: errorData || 'An error occurred', status: response.status } };
   }

   const data = await response.json();
   return { data };

}

