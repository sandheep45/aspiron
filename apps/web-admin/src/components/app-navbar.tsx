import { Link, useRouteContext } from '@tanstack/react-router'
import { HomeIcon } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export function AppNavbar() {
  const breadcrumbs = useBreadcrumbs()
  const { session } = useRouteContext({
    from: '__root__',
  })

  return (
    <header className='sticky top-0 z-10 flex h-12 items-center justify-between rounded-lg border-slate-800/50 border-b bg-slate-900/40 px-6 backdrop-blur-xl'>
      <div className='flex items-center'>
        <SidebarTrigger className='size-5' />
        <Separator
          orientation='vertical'
          className='mr-2 data-[orientation=vertical]:h-full'
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link
                to='/dashboard'
                className='flex items-center gap-1 transition-colors hover:text-foreground'
              >
                <HomeIcon className='h-4 w-4' />
              </Link>
            </BreadcrumbItem>
            {breadcrumbs.map((item) => (
              <BreadcrumbItem key={item.href}>
                <BreadcrumbSeparator />
                {item.isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={
                      <Link
                        to={item.href}
                        className='transition-colors hover:text-foreground'
                      />
                    }
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button />}>
          {session?.user.email}
        </DropdownMenuTrigger>

        <DropdownMenuContent className='w-40' align='start'>
          <DropdownMenuGroup>
            {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
            <DropdownMenuItem variant='destructive'>Logout</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
