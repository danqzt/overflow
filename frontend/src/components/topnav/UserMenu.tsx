import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react'
import { Avatar } from '@heroui/avatar'
import type { User } from 'better-auth'
import { authClient } from '@/libs/authClient.ts'
import { UserProfile } from '@/libs/types'
import { useRouter } from '@tanstack/react-router'

type Props = {
  user: User & UserProfile
}
export default function UserMenu({ user }: Props) {
  const router = useRouter();

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.navigate({to:'/questions'})
        }
      }
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
