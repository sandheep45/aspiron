import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_private-routes/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/_private-routes/dashboard/"!
      <Button variant={'ghost'}>skvj</Button>
    </div>
  )
}
