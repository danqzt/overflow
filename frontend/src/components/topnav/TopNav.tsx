import { Link } from '@tanstack/react-router'
import { AcademicCapIcon } from '@heroicons/react/24/solid'
import ThemeToggle from '@/components/topnav/ThemeToggle.tsx'
import SearchInput from '@/components/topnav/SearchInput.tsx'
import LoginButton from '@/components/topnav/LoginButton.tsx'
import { authClient } from '@/libs/authClient.ts'
import UserMenu from '@/components/topnav/UserMenu.tsx'
import RegisterButton from '@/components/topnav/RegisterButton.tsx'

export default function TopNav() {
  const { data: session, isPending } = authClient.useSession()
  return (
    <header className="p-2 w-full fixed top-0 z-50 bg-white border-b dark:bg-black">
      <div className="flex px-10 mx-auto">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 max-h-16">
            <AcademicCapIcon className="size-10 text-secondary" />
            <h3 className="text-xl font-semibold uppercase">Overflow</h3>
          </Link>
          <nav className="flex my-2 gap-3 text-md text-neutral-500">
            <Link to="/">About</Link>
            <Link to="/">Product</Link>
            <Link to="/">Contact</Link>
          </nav>
        </div>
        <SearchInput />
        <div className="flex basis-1/4 shrink-0 justify-end gap-3">
          <ThemeToggle />
          {session && <UserMenu user={session.user} />}
          {!isPending && !session && (
            <>
              <LoginButton />
              <RegisterButton />
            </>
          )}
        </div>
      </div>
    </header>
  )
}
