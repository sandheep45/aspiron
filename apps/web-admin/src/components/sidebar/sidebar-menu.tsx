import { Link, useLocation } from '@tanstack/react-router'
import type { SidebarItem } from '@/components/sidebar/sidebar-config'
import { buttonVariants } from '@/components/ui/button'
import {
  SidebarGroup,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenu as UISidebarMenu,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

interface SidebarMenuListProps {
  items: SidebarItem[]
}

export function SidebarMenuList({ items }: SidebarMenuListProps) {
  const { pathname } = useLocation()

  return (
    <SidebarGroup>
      <UISidebarMenu className='gap-1 py-3'>
        {items.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              className={cn(
                buttonVariants({
                  variant: pathname === item.href ? 'brand' : 'ghost',
                }),
                pathname === item.href ? '' : 'text-slate-400',
                'justify-start py-4',
              )}
              render={<Link to={item.href} />}
            >
              {item.icon} {item.label}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </UISidebarMenu>
    </SidebarGroup>
  )
}
