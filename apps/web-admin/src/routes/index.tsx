import { useLogin } from '@aspiron/tanstack-client'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { login } = useLogin()
  return (
    <div>
      Hello
      <Button
        onClick={() => {
          login({
            email: 'barbara_turner.1@admin.aspiron',
            password: 'admin123',
          })
        }}
      >
        Login
      </Button>
    </div>
  )
}
