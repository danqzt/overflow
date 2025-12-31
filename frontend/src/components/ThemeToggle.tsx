import { Button } from '@heroui/button'
import { useTheme } from '@/context/ThemeProvider.tsx'
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button
      color="primary"
      variant="light"
      isIconOnly
      aria-label="Toggle Theme"
      onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      {theme === 'light' && <MoonIcon className="h-8" />}
      {theme === 'dark' && <SunIcon className="h-8 text-yellow-300" />}
    </Button>
  )
}
