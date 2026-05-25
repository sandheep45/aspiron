import { render, screen } from '@testing-library/react'
import { LoginForm } from '@/features/auth/components/login-form'

const mockMutate = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@aspiron/tanstack-client', () => ({
  useLoginMutation: () => ({ mutate: mockMutate }),
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  Link: ({
    children,
    to,
    className,
  }: {
    children: React.ReactNode
    to: string
    className?: string
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LoginForm', () => {
  it('renders the login form heading', () => {
    render(<LoginForm />)
    expect(screen.getByText('Log in to your account')).toBeInTheDocument()
  })

  it('renders email and password fields', () => {
    render(<LoginForm />)
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  it('renders Login button', () => {
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })

  it('renders Forgot Password link', () => {
    render(<LoginForm />)
    const link = screen.getByText('Forgot Password?')
    expect(link).toBeInTheDocument()
    expect(link.getAttribute('href')).toBe('/auth/forgot-password')
  })

  it('renders email label', () => {
    render(<LoginForm />)
    expect(screen.getByText('Email address')).toBeInTheDocument()
  })

  it('renders password label', () => {
    render(<LoginForm />)
    expect(screen.getByText('Password')).toBeInTheDocument()
  })

  it('renders email input with correct type', () => {
    render(<LoginForm />)
    const emailInput = screen.getByPlaceholderText('you@example.com')
    expect(emailInput.tagName).toBe('INPUT')
  })

  it('renders password input with type password', () => {
    render(<LoginForm />)
    const passwordInput = screen.getByPlaceholderText('••••••••')
    expect(passwordInput.getAttribute('type')).toBe('password')
  })
})
