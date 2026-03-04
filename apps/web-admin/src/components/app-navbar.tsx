import { Link, useRouteContext } from '@tanstack/react-router'
import { HomeIcon } from 'lucide-react'
import { Logout } from '@/components/logout'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs'

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
        <DropdownMenuTrigger>
          {session?.user.avatar_url ? (
            <Avatar>
              <AvatarImage
                src={session?.user.avatar_url}
                alt={session.user.email}
              />
              <AvatarFallback>{`${session.user.first_name?.[0]} ${session.user.last_name?.[0]}`}</AvatarFallback>
            </Avatar>
          ) : (
            `${session?.user.first_name} ${session?.user.last_name}`
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent className='w-40' align='start'>
          <DropdownMenuGroup>
            {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
            <DropdownMenuItem render={<Logout />} />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
