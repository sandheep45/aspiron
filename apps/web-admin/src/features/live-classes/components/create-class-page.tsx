import { Link } from '@tanstack/react-router'
import { CalendarPlus, Link as LinkIcon, Video } from 'lucide-react'
import { useAppForm } from '@/components/forms/form-core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectContent, SelectItem } from '@/components/ui/select'
import { createClassFormOption } from '@/features/live-classes/form-option'

const providers = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'google_meet', label: 'Google Meet' },
  { value: 'microsoft_teams', label: 'Microsoft Teams' },
  { value: 'custom', label: 'Custom' },
]

export function CreateClassPage() {
  const form = useAppForm({
    ...createClassFormOption,
    onSubmit: async ({ value }) => {
      console.log('Create class:', value)
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    form.handleSubmit()
  }

  return (
    <div className='mx-auto flex w-full max-w-lg flex-col gap-6'>
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10'>
          <Video className='h-5 w-5 text-indigo-400' />
        </div>
        <div>
          <h1 className='font-semibold text-2xl text-white'>
            Create Live Class
          </h1>
          <p className='text-slate-400 text-sm'>
            Schedule a new live class for your students
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Class Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form.AppForm>
            <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <form.AppField name='provider'>
                {(field) => (
                  <field.FormSelect
                    labelProps={{ children: 'Provider' }}
                    placeholder='Select a provider'
                  >
                    <SelectContent>
                      {providers.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </field.FormSelect>
                )}
              </form.AppField>

              <form.AppField name='scheduled_at'>
                {(field) => (
                  <field.FormInput
                    type='datetime-local'
                    leftIcon={
                      <CalendarPlus className='size-4 text-slate-500' />
                    }
                    labelProps={{ children: 'Date & Time' }}
                  />
                )}
              </form.AppField>

              <form.AppField name='duration_min'>
                {(field) => (
                  <field.FormInput
                    type='number'
                    min={5}
                    max={240}
                    labelProps={{ children: 'Duration (minutes)' }}
                  />
                )}
              </form.AppField>

              <form.AppField name='join_url'>
                {(field) => (
                  <field.FormInput
                    type='url'
                    placeholder='https://zoom.us/j/...'
                    leftIcon={<LinkIcon className='size-4 text-slate-500' />}
                    labelProps={{ children: 'Join URL' }}
                  />
                )}
              </form.AppField>

              <div className='flex items-center gap-3 pt-2'>
                <form.SubmitButton variant='brand' className='flex-1'>
                  Schedule Class
                </form.SubmitButton>
                <Link
                  to='/live-classes'
                  className='inline-flex h-9 items-center justify-center rounded-lg border border-slate-700 px-4 font-medium text-slate-300 text-sm transition-colors hover:bg-slate-800'
                >
                  Cancel
                </Link>
              </div>
            </form>
          </form.AppForm>
        </CardContent>
      </Card>
    </div>
  )
}
