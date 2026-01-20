import { createAuthClient } from 'better-auth/react'
import {
  genericOAuthClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins'

export type AuthUser = typeof authClient.$Infer.Session.user

export const authClient = createAuthClient({
  plugins: [
    genericOAuthClient(),
    inferAdditionalFields({
      user: {
        userId: { type: 'string', required: false },
        displayName: { type: 'string', required: false },
        reputation: { type: 'number', required: false },
      },
    }),
  ],
})
