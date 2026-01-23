import { Select } from '@heroui/select'
import { SelectItem } from '@heroui/react'
import { AnswerSortOption } from '@/libs/types'

type Props = {
  answerCount: number,
  sortBy: AnswerSortOption,
  setSortBy: (value: AnswerSortOption) => void,
}

export default function AnswerHeader({ answerCount, sortBy, setSortBy }: Props) {
  return (
    <div className="flex items-center justify-between pt-3 w-full px-6">
      <div className="text-2xl">
        {answerCount} {answerCount === 1 ? 'Answer' : 'Answers'}
      </div>
      <div className="flex items-center gap-3 justify-end w-[50%] ml-auto">
        <Select aria-label="Select sorting" defaultSelectedKeys={[sortBy]} onSelectionChange={(keys) => setSortBy(keys.currentKey as AnswerSortOption) }>
          <SelectItem key="highScore">Highest score (default)</SelectItem>
          <SelectItem key="created">Date created</SelectItem>
        </Select>
      </div>
    </div>
  )
}
