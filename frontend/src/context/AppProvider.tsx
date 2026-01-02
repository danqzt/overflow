import { ReactNode } from 'react'
import { useRouter } from '@tanstack/react-router'
import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { useTagStore } from '@/context/useTagStore.ts'
import { useGetTags } from '@/libs/hooks.ts'

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const setTags = useTagStore(state => state.setTags);

  const { data } = useGetTags();

  if (data?.data) {
    setTags(data.data);
  }

  return (
      <HeroUIProvider
        className="h-full flex flex-col"
        navigate={(to, options) => router.navigate({ to, ...options })}
      >
        <ToastProvider/>
        {children}
      </HeroUIProvider>
  )
}
