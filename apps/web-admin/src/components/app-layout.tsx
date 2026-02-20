import type React from 'react'
import { AppSidebar } from './app-sidebar'
import { SidebarInset } from './ui/sidebar'

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex min-h-screen w-full bg-app-gradient'>
      <AppSidebar />
      <SidebarInset className='w-full'>{children}</SidebarInset>
    </div>
  )
}
