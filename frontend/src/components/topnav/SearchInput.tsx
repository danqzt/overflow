import { MagnifyingGlassIcon } from '@heroicons/react/16/solid'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { Listbox, ListboxItem } from '@heroui/listbox'
import { Input } from '@heroui/input'
import {Spinner} from "@heroui/spinner";
import { searchQuestion } from '@/actions/questions.ts'


export default function SearchInput() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState<string | undefined>(
    undefined,
  )
  const searchQueryFn = useServerFn(searchQuestion)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchQueryFn({ data: { query: debouncedQuery! } }),
    enabled: !!debouncedQuery && debouncedQuery.length > 3,
  })

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [query])

  const onAction = () => {
    setQuery('')
  }
  return (
    <div className="flex flex-col w-full">
      <Input
        startContent={<MagnifyingGlassIcon className="size-6" />}
        placeholder="Search"
        className="ml-6"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery('')}
        isClearable
        endContent={isLoading &&  <Spinner size="sm"/>}
      />
      {!isLoading && data && (
        <div className="absolute top-full z-50 bg-white dark:bg-default-50 shadow-lg w-[50%] border-default-500 border-2">
          <Listbox
            onAction={onAction}
            items={data}
            className="flex flex-col overflow-y-auto"
          >
            {(item) => (
              <ListboxItem
                href={`/questions/${item.id}`}
                startContent={
                  <div className="flex flex-col h-14 min-w-14 justify-center items-center border border-success rounded-md">
                    <span>{item.answerCount}</span>
                    <span className="text-xs">answers</span>
                  </div>
                }
              >
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-xs opacity-60 line-clamp-2">
                    {item.content}
                  </div>
                </div>
              </ListboxItem>
            )}
          </Listbox>
        </div>
      )}
    </div>
  )
}
