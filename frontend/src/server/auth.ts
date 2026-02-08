import { betterAuth } from 'better-auth'
import { genericOAuth, jwt } from 'better-auth/plugins'

const clientId = import.meta.env.VITE_AUTH_KEYCLOAK_CLIENT_ID
const clientSecret = process.env.AUTH_KEYCLOAK_CLIENT_SECRET
const baseUrl = import.meta.env.VITE_AUTH_URL
const issuerExt = import.meta.env.VITE_AUTH_KEYCLOAK_ISSUER
const issuerInternal = process.env.AUTH_KEYCLOAK_ISSUER_INTERNAL
const apiUrl = process.env.API_URL

console.log(
  'Client ID:',
  clientId,
  'Issuer:',
  'Base URL:',
  baseUrl,
  'Client Secret:',
  clientSecret,
  'Internal Issuer:',
  issuerInternal,
  'Api Url:',
  apiUrl
)

if (!clientId || !clientSecret || !baseUrl) {
  throw new Error('Missing required Keycloak environment variables')
}

export const auth = betterAuth({
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: 'keycloak',
          clientId: clientId,
          clientSecret: clientSecret,
          // authorizationUrl: `${issuerExt}/protocol/openid-connect/auth`,
          // tokenUrl: `${issuerInternal}/protocol/openid-connect/token`,
          // userInfoUrl: `${issuerInternal}/protocol/openid-connect/userinfo`,
          discoveryUrl: `${issuerExt}/.well-known/openid-configuration`,
          scopes: ['openid', 'profile', 'email', 'offline_access'],
          authorizationUrlParams: {
            prompt: 'login',
          },
          getUserInfo: async (tokens) => {
            console.log("AUTH: GetUserInfo", tokens);
            try {
              console.log("AUTH: GetUserInfo - kycloak");
              const userinfoResp = await fetch(
                `${issuerExt}/protocol/openid-connect/userinfo`,
                {
                  headers: {
                    Authorization: `Bearer ${tokens.accessToken}`,
                  },
                },
              )
              console.log("AUTH: GetUserInfo, profile/me");
              const response = await fetch(`${apiUrl}/profiles/me`, {
                headers: {
                  Authorization: `Bearer ${tokens.accessToken}`,
                  'Content-Type': 'application/json',
                },
              })
              if (response.ok && userinfoResp.ok) {
                const userInfo = await userinfoResp.json()
                const profile = await response.json()
                return { ...userInfo, ...profile }
              }
            } catch (e) {
              console.error('Failed to fetch user profile:', e)
            }
          },
          mapProfileToUser: async (profile) => {
            return {
              userId: profile.userId,
              name: profile.name,
              email: profile.email,
              displayName: profile.displayName,
              reputation: profile.reputation,
            }
          },
        },
      ],
    }),
    jwt(),
  ],
  account: {
    updateAccountOnSignIn: false,
  },
  user: {
    additionalFields: {
      userId: {
        type: 'string',
        required: false,
      },
      displayName: {
        type: 'string',
        required: false,
      },
      reputation: {
        type: 'number',
        required: false,
      },
    },
  },
})

export const getAccessToken = (header: HeadersInit) =>
  auth.api
    .getAccessToken({
      body: { providerId: 'keycloak' },
      headers: header,
    })
    .catch((e) => {
      console.error('Failed to get access token:', e)
      return null
    })
