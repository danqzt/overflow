import {createServerFn} from "@tanstack/react-start";
import { auth } from '@/server/auth.ts'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { fetchTopUsers } from '@/server/services/profileSvc.ts'

export const getCurrentSession = createServerFn({ method: 'GET' })
    .handler(async ({  }) => {
      return await auth.api.getSession({
        headers: getRequestHeaders(),
      });
    });

export const getTopUsers = createServerFn({ method: 'GET' })
    .handler(async () => await fetchTopUsers());