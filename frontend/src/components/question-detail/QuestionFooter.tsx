import { Question } from '@/libs/types'
import { Chip } from '@heroui/chip'
import { Link } from '@tanstack/react-router'
import { Avatar } from '@heroui/avatar'
import { timeAgo } from '@/libs/util.ts'

type Props = {
  question: Question
}
export default function QuestionFooter({ question }: Props) {
  return (
    <div className="flex justify-between">
      <div className="flex flex-col self-end">
        <div className="flex gap-2">
          {question.tagSlugs.map((tag) => (
            <Chip
              key={tag}
              as={Link}
              to={`/questions/?tag=${tag}`}
              variant="bordered"
            >
              {tag}
            </Chip>
          ))}
        </div>
      </div>
      <div className="flex flex-col basis-2/5 bg-primary/10 px-3 py-2 gap-2 rounded-lg">
        <span className="text-sm font-extralight">asked {timeAgo(question.createdAt)}</span>
        <div className="flex gap-3 items-center">
          <Avatar className='h-6 w-6' color='secondary' name={question.askerDisplayName.charAt(0)} />
          <div className="flex items-center flex-col">
            <span>{question.askerDisplayName}</span>
            <span className="self-start text-sm font-semibold">42</span>
          </div>
        </div>

      </div>
    </div>
  )
}
