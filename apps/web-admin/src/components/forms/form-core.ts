import {
  createFormHook,
  createFormHookContexts,
} from '@tanstack/react-form-start'
import { FormInput } from '@/components/forms/field-elements/form-input'

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

export const { useAppForm, useTypedAppFormContext, withFieldGroup, withForm } =
  createFormHook({
    fieldComponents: {
      FormInput,
      // form-input, form-select, etc...
    },
    formComponents: {
      // submit-button, clear-form-button, etc...
    },
    fieldContext,
    formContext,
  })
