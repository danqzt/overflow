import { betterAuth} from 'better-auth'
import { genericOAuth, jwt } from 'better-auth/plugins'

const clientId = import.meta.env.VITE_AUTH_KEYCLOAK_CLIENT_ID
const clientSecret = process.env.AUTH_KEYCLOAK_CLIENT_SECRET
const baseUrl = import.meta.env.VITE_AUTH_URL;
const issuerInternal = process.env.AUTH_KEYCLOAK_ISSUER_INTERNAL;
const issuerExt = import.meta.env.VITE_AUTH_KEYCLOAK_ISSUER;

console.log('Client ID:', clientId, 'Issuer:', issuerInternal, 'Base URL:', baseUrl, 'Client Secret:', clientSecret);

if (!clientId || !clientSecret || !issuerInternal || !baseUrl) {
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
          authorizationUrl:`${issuerExt}/protocol/openid-connect/auth`,
          tokenUrl: `${issuerInternal}/protocol/openid-connect/token`,
          userInfoUrl:`${issuerInternal}/protocol/openid-connect/userinfo`,
          scopes: ['openid', 'profile', 'email', 'offline_access'],
          authorizationUrlParams: {
            prompt: 'login',
          },
          mapProfileToUser: (profile) => {
            return {
              userId: profile.sub,
              name: profile.name,
              email: profile.email,
            }
          }
        }
      ],
    }),
    jwt(),
  ],
  account:{
    updateAccountOnSignIn: false,
  },
  user: {
    additionalFields: {
      userId: {
        type: 'string',
        required: false
      }
    }
  }
})

export const getAccessToken = (header: HeadersInit) =>
  auth.api.getAccessToken({
    body: { providerId: 'keycloak' },
    headers: header,
  }).catch(e => {
    console.error('Failed to get access token:', e);
    return null;
  });

