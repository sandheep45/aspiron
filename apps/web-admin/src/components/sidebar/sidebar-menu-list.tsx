import { useLocation } from '@tanstack/react-router'
import type { SidebarItem } from '@/components/sidebar/sidebar-config'
import { SidebarMenuGroup } from '@/components/sidebar/sidebar-menu-group'
import { SidebarMenuListItem } from '@/components/sidebar/sidebar-menu-list-item'

interface SidebarMenuListProps {
  items: SidebarItem[]
}

export function SidebarMenuList({ items }: SidebarMenuListProps) {
  const { pathname } = useLocation()

  return (
    <SidebarMenuGroup>
      {items.map((item) => (
        <SidebarMenuListItem
          key={item.id}
          item={item}
          isActive={pathname.includes(item.hrefTo ?? '')}
        />
      ))}
    </SidebarMenuGroup>
  )
}
