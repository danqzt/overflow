import { Answer } from '@/libs/types'
import { Avatar } from '@heroui/avatar'
import { timeAgo } from '@/libs/util.ts'

type Props = {
  answer: Answer
}
export default function AnswerFooter({ answer }: Props) {
  return (
    <div className="flex justify-end mt-4">
      <div className="flex flex-col basis-2/5 bg-primary/10 px-3 py-2 gap-2 rounded-lg">
        <span className="text-sm font-extralight">
          answered {timeAgo(answer.createdAt)}
        </span>
        <div className="flex gap-3 items-center">
          <Avatar
            className="h-6 w-6"
            color="secondary"
            name={answer.userDisplayName.charAt(0)}
          />
          <div className="flex items-center flex-col">
            <span>{answer.userDisplayName}</span>
            <span className="self-start text-sm font-semibold">42</span>
          </div>
        </div>
      </div>
    </div>
  )
}
