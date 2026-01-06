import { Button } from '@heroui/button'
import { authClient } from '@/libs/authClient.ts'

export default function LoginButton() {
  return (
    <Button
      color="secondary"
      variant="bordered"
      type="button"
      onPress={() =>
        authClient.signIn.oauth2({
          providerId: 'keycloak',
          callbackURL: '/questions',
        })
      }
    >
      Login
    </Button>
  )
}
