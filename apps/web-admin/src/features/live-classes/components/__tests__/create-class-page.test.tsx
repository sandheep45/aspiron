import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createContext } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CreateClassPage } from '@/features/live-classes/components/create-class-page'

const { mockFormOptions, mockUseAppForm } = vi.hoisted(() => ({
  mockFormOptions: vi.fn(() => ({ validators: {}, defaultValues: {} })),
  mockUseAppForm: vi.fn(),
}))

vi.mock('@tanstack/react-form-start', () => {
  const fieldContext = createContext(null)
  const formContext = createContext(null)
  return {
    formOptions: mockFormOptions,
    createFormHookContexts: () => ({
      fieldContext,
      formContext,
      useFieldContext: () => ({
        state: {
          value: '',
          meta: { isTouched: false, isValid: true, errors: [] },
        },
        handleChange: vi.fn(),
      }),
      useFormContext: () => ({}),
    }),
    createFormHook: (_opts: {
      fieldComponents: Record<string, unknown>
      formComponents: Record<string, unknown>
    }) => ({
      useAppForm: mockUseAppForm,
    }),
  }
})

vi.mock('@/components/ui/select', () => ({
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode
    value: string
  }) => <option value={value}>{children}</option>,
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

function createMockForm() {
  const handleSubmit = vi.fn()
  return {
    AppForm: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    AppField: ({
      children,
    }: {
      children: (field: Record<string, unknown>) => React.ReactNode
    }) => {
      const mockField = {
        state: {
          value: '',
          meta: { isTouched: false, isValid: true, errors: [] },
        },
        FormSelect: ({
          children,
          labelProps,
          placeholder,
        }: {
          children: React.ReactNode
          labelProps?: { children?: React.ReactNode }
          placeholder?: string
        }) => (
          <div>
            <span>{labelProps?.children}</span>
            <select>
              <option value=''>{placeholder}</option>
              {children}
            </select>
          </div>
        ),
        FormInput: ({
          labelProps,
          leftIcon,
          ...props
        }: Record<string, unknown>) => (
          <div>
            {labelProps && (
              <span>
                {String((labelProps as Record<string, unknown>).children ?? '')}
              </span>
            )}
            <input {...props} />
          </div>
        ),
      }
      return <>{children(mockField)}</>
    },
    Subscribe: ({
      children,
    }: {
      children: (state: Record<string, unknown>) => React.ReactNode
    }) => <>{children({ isSubmitting: false })}</>,
    SubmitButton: ({ children, ...props }: { children: React.ReactNode }) => (
      <button type='submit' {...props}>
        {children}
      </button>
    ),
    handleSubmit,
  }
}

describe('CreateClassPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders heading and description', () => {
    mockUseAppForm.mockReturnValue(createMockForm())
    render(<CreateClassPage />)
    expect(screen.getByText('Create Live Class')).toBeInTheDocument()
    expect(
      screen.getByText('Schedule a new live class for your students'),
    ).toBeInTheDocument()
  })

  it('renders all form field labels', () => {
    mockUseAppForm.mockReturnValue(createMockForm())
    render(<CreateClassPage />)
    expect(screen.getByText('Provider')).toBeInTheDocument()
    expect(screen.getByText('Date & Time')).toBeInTheDocument()
    expect(screen.getByText('Duration (minutes)')).toBeInTheDocument()
    expect(screen.getByText('Join URL')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    mockUseAppForm.mockReturnValue(createMockForm())
    render(<CreateClassPage />)
    expect(
      screen.getByRole('button', { name: 'Schedule Class' }),
    ).toBeInTheDocument()
  })

  it('renders Cancel link to /live-classes', () => {
    mockUseAppForm.mockReturnValue(createMockForm())
    render(<CreateClassPage />)
    const cancel = screen.getByText('Cancel')
    expect(cancel.closest('a')).toHaveAttribute('href', '/live-classes')
  })

  it('calls handleSubmit on form submission', async () => {
    const user = userEvent.setup()
    const form = createMockForm()
    mockUseAppForm.mockReturnValue(form)
    render(<CreateClassPage />)
    await user.click(screen.getByRole('button', { name: 'Schedule Class' }))
    expect(form.handleSubmit).toHaveBeenCalledTimes(1)
  })
})
