import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import TopNav from '@/components/topnav/TopNav.tsx'
import SideMenu from '@/components/SideMenu.tsx'
import { AppProvider } from '@/context/AppProvider.tsx'
import { getThemeServerFn } from '@/actions/theme.ts'
import ThemeProvider from '@/context/ThemeProvider.tsx'
import NotFound from '@/components/error/NotFound.tsx'
import TrendingTags from '@/components/TrendingTags.tsx'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Overflow',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
  loader: () => getThemeServerFn(),
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const theme = Route.useLoaderData()
  return (
    <html lang="en" className={`${theme} h-full`}>
      <head>
        <HeadContent />
      </head>
      <body className="bg-stone-200 h-full dark:bg-default-50">
        <ThemeProvider theme={theme}>
          <AppProvider>
            <TopNav />
            <div className="flex grow overflow-auto">
              <aside className="basis-1/6 shrink-0 border-r border-neutral-500 pt-20 sticky top-0 px-6">
                <SideMenu />
              </aside>
              <main className="flex-1 pt-20 h-full">{children}</main>
              <aside className="basis-1/4 shrink-0 px-6 pt-20 bg-stone-300 dark:bg-default-100 sticky top-0">
               <TrendingTags/>
              </aside>
            </div>
          </AppProvider>
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
        <script
          src="https://upload-widget.cloudinary.com/latest/global/all.js"
          type="text/javascript"
        ></script>
      </body>
    </html>
  )
}
