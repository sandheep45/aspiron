import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

export const AppNavbar = () => {
  return (
    <header className='sticky top-0 z-10 flex h-12 items-center justify-between rounded-lg border-slate-800/50 border-b bg-slate-900/40 px-6 backdrop-blur-xl'>
      <SidebarTrigger className='-ml-1' />
      <Separator
        orientation='vertical'
        className='mr-2 data-[orientation=vertical]:h-full'
      />
      Top Nav
    </header>
  )
}
