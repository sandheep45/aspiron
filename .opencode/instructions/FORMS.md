# Form Handling Conventions

## Framework

**TanStack React Form** via `@tanstack/react-form-start`. All field components are bound via `createFormHook` in `components/forms/form-core.ts` and registered in a single hook set.

## Available field components

All in `components/forms/field-elements/`:

- `FormInput` — text/password inputs, supports left/right icons and password toggle
- `FormTextarea` — multi-line text
- `FormSelect` — dropdown with `<SelectContent>` children
- `FormCheckbox` — boolean toggle with label
- `FormSwitch` — boolean toggle with horizontal layout
- `FormToggle` — pressed/unpressed toggle
- `FormSlider` — numeric range
- `FormInputOTP` — one-time password input
- `FormRadioGroup` — radio button group

Each field component:
- Calls `useFieldContext<Type>()` to bind to form state
- Wraps a `<ui/field>` + `<ui/input>` pair
- Renders `<FieldError>` when `field.state.meta.isTouched && !field.state.meta.isValid`

## Submit button

`<form.SubmitButton>` — auto-disables while submitting, subscribes to `form.isSubscribing` via `form.Subscribe` selector.

## Validation

- Zod schemas defined in `modules/<domain>/schema.ts`
- Passed via `formOptions({ validators: { onChange: schema } })` in `modules/<domain>/form-option.ts`
- Validation runs automatically on change; errors surfaced via `field.state.meta.errors`

## Submission pattern

Use TanStack Query mutations inside `useAppForm({ ...formOption, onSubmit })`.

### How to add a new form

1. **Schema:** Zod schema in `modules/<domain>/schema.ts`
2. **Form options:** `formOptions({ validators: { onChange: schema }, defaultValues })` in `modules/<domain>/form-option.ts`
3. **Component:** `const form = useAppForm({ ...formOption, onSubmit })`
4. **Template:** `<form.AppForm>`, `<form.AppField name="...">`, `<field.FormXxx>`
5. **Submit:** `<form.SubmitButton>`

### Example (login form)

```tsx
const form = useAppForm({
  ...loginFormOption,
  onSubmit: async ({ value }) => {
    mutate(value, {
      onSuccess: () => navigate('/dashboard'),
      onError: (error) => toast.error(error.message),
    })
  },
})

// Template
<form.AppForm>
  <form onSubmit={handleSubmit}>
    <form.AppField name="email">
      {(field) => <field.FormInput labelProps={{ children: 'Email' }} />}
    </form.AppField>
    <form.SubmitButton>Login</form.SubmitButton>
  </form>
</form.AppForm>
```

## Key packages

| Package | Role |
|---|---|
| `@tanstack/react-form-start` | Server-integrated form state + validation |
| `zod` | Schema validation (`validators.onChange`) |
| `@tanstack/react-query` | Mutation management for API calls |
| `sonner` | Toast notifications for errors |
