import TrendingTags from '@/components/right-side/TrendingTags.tsx'
import TopUser from '@/components/right-side/TopUser.tsx'

export default function RightSide() {
  return (
    <div className="flex flex-col gap-3">
      <TrendingTags/>
      <TopUser/>
    </div>
  )
}