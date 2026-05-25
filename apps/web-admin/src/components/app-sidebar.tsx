import { SidebarBrand } from '@/components/sidebar/sidebar-brand'
import { sidebarItems } from '@/components/sidebar/sidebar-config'
import { SidebarMenuList } from '@/components/sidebar/sidebar-menu-list'
import { Separator } from '@/components/ui/separator'
import { Sidebar } from '@/components/ui/sidebar'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant='floating'
      role='navigation'
      aria-label='Main navigation'
      {...props}
    >
      <SidebarBrand />
      <Separator />
      <SidebarMenuList items={sidebarItems} />
    </Sidebar>
  )
}
