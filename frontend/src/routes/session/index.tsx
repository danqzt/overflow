import { createFileRoute } from '@tanstack/react-router'
import { Snippet } from '@heroui/react'
import ErrorButton from '@/components/session/ErrorButton.tsx'
import AuthButton from '@/components/session/AuthButton.tsx'
import { authClient } from '@/libs/authClient.ts'
import { CloudinaryWidget } from '@/components/rte/CloudinaryWidget.tsx'

export const Route = createFileRoute('/session/')({
  component: RouteComponent,
  loader: async () => await authClient.getSession(),
})

function RouteComponent() {
  const data = Route.useLoaderData()

  return (
    <div className="px-6">
      <div className="text-center">
        <h3 className="font-bold text-xl">Session Dashboard</h3>
      </div>
      <Snippet
        symbol=""
        color="primary"
        classNames={{
          base: 'w-full mt-4',
          pre: 'text-wrap whitespace-pre-wrap break-all',
        }}
      >
        {JSON.stringify(data, null, 2)}
      </Snippet>
      <div className="flex items-start gap-3 justify-center mt-6 mx-2 flex-wrap">
        <ErrorButton />
        <AuthButton />
        <CloudinaryWidget
          signatureEndpoint="/api/sign-image"
          onUpload={(id) => console.log('UPLOADED', id)}
        />
      </div>
    </div>
  )
}
