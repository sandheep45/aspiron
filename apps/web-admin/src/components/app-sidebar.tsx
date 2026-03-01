import { SidebarBrand } from '@/components/sidebar/sidebar-brand'
import { sidebarItems } from '@/components/sidebar/sidebar-config'
import { SidebarMenuList } from '@/components/sidebar/sidebar-menu'
import { Separator } from '@/components/ui/separator'
import { Sidebar as UISidebar } from '@/components/ui/sidebar'

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof UISidebar>) {
  return (
    <UISidebar variant='floating' {...props}>
      <SidebarBrand />
      <Separator />
      <SidebarMenuList items={sidebarItems} />
    </UISidebar>
  )
}
