import {fetchClient} from "@/libs/fetchClient.ts";
import { createServerFn } from '@tanstack/react-start'

export const triggerError = createServerFn({ method: 'GET' })
  .inputValidator((data: { code: number }) => data)
  .handler(async ({ data }) => fetchClient<{}>(`/tests/errors?code=${data.code}`),
  )

export const triggerAuth = createServerFn({ method: 'GET' }).handler(async () =>
  fetchClient<{ data: string } | null>(`/tests/auth`),
)
