import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppNavbar } from '@/components/app-navbar'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export const Route = createFileRoute('/_private-routes')({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({
        to: '/auth',
      })
    }
  },
  staticData: {
    breadcrumb: undefined,
  },
})

function RouteComponent() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '14rem',
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className='py-2.5 pr-2'>
        <AppNavbar />
        <div className='flex-1 overflow-auto p-5'>
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
