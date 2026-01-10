import { Button } from '@heroui/button'
import { triggerAuth } from '@/actions/testActions.ts'
import { handlerError, successToast } from '@/libs/util.ts'

export default function AuthButton() {
  const onClick = async () => {
    const { data: msg, error } = await triggerAuth()
    if (error) handlerError(error)
    if (msg) successToast(msg.data)
  }
  return (
    <Button color="success" onPress={onClick}>
      {' '}
      Test Auth
    </Button>
  )
}
