import {fetchClient} from "@/libs/fetchClient.ts";
import { createServerFn } from '@tanstack/react-start'

export const triggerError = createServerFn({ method: 'GET' })
  .inputValidator((data: { code: number }) => data)
  .handler(async ({ data }) => fetchClient<{}>(`/questions/errors?code=${data.code}`),
  )
