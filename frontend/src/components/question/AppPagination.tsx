import { useEffect, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Button } from '@heroui/button'
import { Pagination } from '@heroui/react'

type Props = {
  totalCount: number
}
const PAGE_SIZE = [2, 5, 10]
export default function AppPagination({totalCount}: Props) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const searchParams = useSearch({ from: '/questions/' })
  const nav = useNavigate()

  useEffect(() => {
    const updateParams = async () => {
      await nav({
        to: '/questions',
        search: {
          ...searchParams,
          page: currentPage,
          pageSize: pageSize,
        },resetScroll: true,
      })
    }

    updateParams()
  }, [nav, searchParams, currentPage, pageSize])

  return (
    <div className="flex justify-between items-center pt-3 pb-6 px-6">
      <div className="flex items-center gap-2">
        <span>Page size: </span>
        <div className="flex items-center gap-1">
          {PAGE_SIZE.map((size, i) => (
            <Button
              key={i}
              type="button"
              variant={size === pageSize ? 'solid' : 'bordered'}
              size="sm"
              color="secondary"
              isIconOnly
              onPress={() => {
                setCurrentPage(1)
                setPageSize(size)
              }}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>
      <Pagination total={Math.ceil(totalCount / pageSize)}
      color="secondary"
      onChange={setCurrentPage}
      page={currentPage}
      className="cursor-pointer"/>
    </div>
  )
}
