import { createContext, use } from 'react'
import { setThemeServerFn, Theme } from '@/actions/theme.ts'
import { useRouter } from '@tanstack/react-router'
import { PropsWithChildren } from 'react'

type ThemeContextVal = { theme: Theme, setTheme: (theme: Theme) => void }

const ThemeContext = createContext<ThemeContextVal|null>(null);

export default function ThemeProvider({ children, theme } : PropsWithChildren<{theme: Theme }>) {
  const router = useRouter();

  const setTheme = async (newTheme: Theme) => {
    await setThemeServerFn({data: newTheme});
    router.invalidate();
  }

  return <ThemeContext value={{theme, setTheme}}>{children}</ThemeContext>
}

export function useTheme() {
  const val = use(ThemeContext);
  if(!val) throw new Error("useTheme must be used within a ThemeProvider");
  return val;
}