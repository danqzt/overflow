import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react'
import { Avatar } from '@heroui/avatar'
import { redirect, useNavigate, useRouter } from '@tanstack/react-router'
import type { User } from 'better-auth'
import { authClient } from '@/libs/authClient.ts'
import { UserProfile } from '@/libs/types'

type Props = {
  user: User & UserProfile
}
export default function UserMenu({ user }: Props) {

  const signOut = async () => {
    const { data } = await authClient.getAccessToken({
      providerId: 'keycloak',
    });
    const { data: session } = await authClient.getSession();
    await authClient.revokeSession({ token: session!.session.token });
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          const idToken = data?.idToken;
          const keycloakLogoutUrl = `${import.meta.env.VITE_AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/logout`
          const redirectUri = encodeURIComponent(`${window.location.origin}/questions`)
          const clientId = import.meta.env.VITE_AUTH_KEYCLOAK_CLIENT_ID;

          window.location.href = `${keycloakLogoutUrl}?post_logout_redirect_uri=${redirectUri}&client_id=${clientId}&id_token_hint=${idToken}`;
        },
      },
    })
  }
  return (
    <Dropdown>
      <DropdownTrigger>
        <div className="flex items-center gap-2 cursor-pointer">
          <Avatar color="secondary" size="sm" name={user.displayName.charAt(0)} />
          {user.displayName}
        </div>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem key="edit">Edit Profile</DropdownItem>
        <DropdownItem
          key="logout"
          className="text-danger"
          color="danger"
          onPress={signOut}
        >
          Sign out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
