import { Link } from '@tanstack/react-router'
import { Sparkles } from 'lucide-react'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function SidebarBrand() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          render={<Link to='/' />}
          className='text-3xl'
        >
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-purple-600'>
            <Sparkles className='h-4 w-4 text-white' />
          </div>
          Aspiron
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
