import {
  HomeIcon,
  QuestionMarkCircleIcon,
  TagIcon,
  UserIcon,
} from '@heroicons/react/24/solid'
import { Listbox, ListboxItem } from '@heroui/listbox'
import { useLocation } from '@tanstack/react-router'

const navLinks = [
  { key: 'home', text: 'Home', href: '/', icon: HomeIcon },
  {
    key: 'questions',
    text: 'Questions',
    href: '/questions',
    icon: QuestionMarkCircleIcon,
  },
  { key: 'tags', text: 'Tags', href: '/tags', icon: TagIcon },
  { key: 'sessions', text: 'User Session', href: '/session', icon: UserIcon },
]
export default function SideMenu() {
  const { pathname } = useLocation()
  return (
    <Listbox
      aria-label="nav-links"
      className="sticky top-20 ml-6"
      items={navLinks}
      key={pathname}
    >
      {({ key, href, text, icon: Icon }) => (
        <ListboxItem
          aria-labelledby={key}
          aria-describedby={text}
          key={key}
          href={href}
          startContent={<Icon className="h-6" />}
          classNames={{
            base: pathname === href ? 'text-secondary' : '',
            title: 'text-lg',
          }}
        >
          {text}
        </ListboxItem>
      )}
    </Listbox>
  )
}
