import { ReactNode } from 'react'
import { useRouter } from '@tanstack/react-router'
import { HeroUIProvider } from '@heroui/react'

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  return (
      <HeroUIProvider
        className="h-full flex flex-col"
        navigate={(to, options) => router.navigate({ to, ...options })}
      >
        {children}
      </HeroUIProvider>
  )
}
