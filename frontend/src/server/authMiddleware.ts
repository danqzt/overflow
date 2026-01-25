import {createMiddleware} from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from '@/server/auth.ts'

export const authMiddleware = createMiddleware()
  .server(async({next}) =>{
    const data = await auth.api.getSession({
        headers: getRequestHeaders(),
    });
      console.log("I M IN MIDDLEWARE", data);
      return next({
          context: {
            session: data?.session ?? null
          },
      });
  })