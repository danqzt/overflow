import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react'
import { Avatar } from '@heroui/avatar'
import { useRouter } from '@tanstack/react-router'
import type { User } from 'better-auth'
import { authClient } from '@/libs/authClient.ts'

type Props = {
  user: User
}
export default function UserMenu({ user }: Props) {
  const router = useRouter()
  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.navigate({ to: '/' })
        },
      },
    })
  }
  return (
    <Dropdown>
      <DropdownTrigger>
        <div className="flex items-center gap-2 cursor-pointer">
          <Avatar color="secondary" size="sm" name={user.name.charAt(0)} />
          {user.name}
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
