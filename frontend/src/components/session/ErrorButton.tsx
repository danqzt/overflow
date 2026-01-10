import { Button } from '@heroui/button'
import { useServerFn } from '@tanstack/react-start'
import { useState, useTransition } from 'react'
import { triggerError } from '@/actions/testActions.ts'
import { handlerError } from '@/libs/util.ts'

export default function ErrorButton() {
  const serverFn = useServerFn(triggerError)
  const [pending, transitionFn] = useTransition()
  const [status, setStatus] = useState(0)

  const onClick = (code: number) => {
    transitionFn(async () => {
      const { error } = await serverFn({ data: { code: code } })
      handlerError(error!)
      setStatus(code)
    })
  }
  return (
    <div className="gap-3 flex">
      {[400, 401, 403, 404, 500, 600].map((code) => (
        <Button
          key={code}
          type="button"
          color="primary"
          onPress={() => onClick(code)}
          isLoading={pending && status === code}
        >
          Test Error {code}
        </Button>
      ))}
    </div>
  )
}
