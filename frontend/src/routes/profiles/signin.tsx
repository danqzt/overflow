import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'
import { authClient } from '@/libs/authClient.ts'

type signInType = {
  redirect?: string
}
export const Route = createFileRoute('/profiles/signin')({
  component: RouteComponent,
})

function RouteComponent() {
  const { redirect } = useSearch({ from: '/profiles/signin' }) as signInType

  useEffect(() => {
    authClient.signIn.oauth2({
      providerId: 'keycloak',
      callbackURL: redirect,
    })
  }, [redirect])


  return <div>Redirecting to login page.... </div>
}
