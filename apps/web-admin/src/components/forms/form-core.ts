import {
  createFormHook,
  createFormHookContexts,
} from '@tanstack/react-form-start'
import { FormCheckbox } from '@/components/forms/field-elements/form-checkbox'
import { FormInput } from '@/components/forms/field-elements/form-input'
import { FormInputOTP } from '@/components/forms/field-elements/form-input-otp'
import { FormRadioGroup } from '@/components/forms/field-elements/form-radio-group'
import { FormSelect } from '@/components/forms/field-elements/form-select'
import { FormSlider } from '@/components/forms/field-elements/form-slider'
import { FormSwitch } from '@/components/forms/field-elements/form-switch'
import { FormTextarea } from '@/components/forms/field-elements/form-textarea'
import { FormToggle } from '@/components/forms/field-elements/form-toggle'
import { SubmitButton } from '@/components/forms/form-elements/submit-button'

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

export const { useAppForm, useTypedAppFormContext, withFieldGroup, withForm } =
  createFormHook({
    fieldComponents: {
      FormInput,
      FormTextarea,
      FormSelect,
      FormCheckbox,
      FormSwitch,
      FormRadioGroup,
      FormSlider,
      FormInputOTP,
      FormToggle,
    },
    formComponents: {
      SubmitButton,
    },
    fieldContext,
    formContext,
  })
