import type * as React from 'react'
import { ProductLogo } from '@/assets/svgs/logo'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant='floating' {...props}>
      <SidebarHeader className='rounded-lg bg-sidebar-gradient'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg'>
              <ProductLogo />
              <span className='font-medium'>Aspiron</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className='rounded-lg bg-sidebar-gradient'>
        <SidebarGroup>
          <SidebarMenu className='gap-2'>
            <SidebarMenuItem>
              <SidebarMenuButton>Menu Button</SidebarMenuButton>
              <SidebarMenuSub className='ml-0 border-l-0 px-1.5'>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton isActive={false}>
                    SidebarMenuSub button
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
