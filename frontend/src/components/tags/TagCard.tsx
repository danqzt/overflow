import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card'
import { Link } from '@tanstack/react-router'
import { Tag } from '@/libs/types'
import { Chip } from '@heroui/chip'

type Props = {
  tag: Tag;
}
export default function TagCard({ tag }: Props) {
  return (
    <Card as={Link} to={`/questions?tag=${tag.slug}`} isHoverable isPressable>
       <CardHeader>
         <Chip variant="bordered">
           {tag.slug}
         </Chip>
       </CardHeader>
      <CardBody>
        <p className="line-clamp-3">{tag.description}</p>
      </CardBody>
      <CardFooter>
        42 questions
      </CardFooter>
    </Card>
  )
}