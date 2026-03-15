import { Link } from '@tanstack/react-router'
import type { SidebarItem } from '@/components/sidebar/sidebar-config'
import { buttonVariants } from '@/components/ui/button'
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

interface Props {
  item: SidebarItem
  isActive: boolean
}

export function SidebarMenuListItem({ item, isActive }: Props) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className={cn(
          buttonVariants({
            variant: isActive ? 'brand' : 'ghost',
          }),
          isActive ? '' : 'text-slate-400',
          'justify-start py-4',
        )}
        render={<Link to={item.hrefTo} />}
      >
        {item.icon} {item.label}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
