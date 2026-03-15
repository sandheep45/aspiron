import { SidebarBrand } from '@/components/sidebar/sidebar-brand'
import { sidebarItems } from '@/components/sidebar/sidebar-config'
import { SidebarMenuList } from '@/components/sidebar/sidebarmenu-list'
import { Separator } from '@/components/ui/separator'
import { Sidebar } from '@/components/ui/sidebar'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant='floating' {...props}>
      <SidebarBrand />
      <Separator />
      <SidebarMenuList items={sidebarItems} />
    </Sidebar>
  )
}
