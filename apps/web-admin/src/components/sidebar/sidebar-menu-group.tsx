import { SidebarGroup, SidebarMenu } from '@/components/ui/sidebar'

interface Props {
  children: React.ReactNode
}

export function SidebarMenuGroup({ children }: Props) {
  return (
    <SidebarGroup>
      <SidebarMenu className='gap-1 py-3'>{children}</SidebarMenu>
    </SidebarGroup>
  )
}
