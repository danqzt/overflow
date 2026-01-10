import { Controller } from 'react-hook-form'
import clsx from 'clsx'
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import RichTextEditor from '@/components/rte/RichTextEditor.tsx'

type RichTextFieldProps<T extends FieldValues> = {
  name: FieldPath<T>
  control: Control<T>
  label?: string
}

export function RichTextField<T extends FieldValues>({
  name,
  control,
  label = 'Include all the information someone would need to answer your question.',
}: RichTextFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <>
          <p
            className={clsx('text-sm', {
              'text-danger': fieldState.error?.message,
            })}
          >
            {label}
          </p>
          <RichTextEditor
            onChange={field.onChange}
            onBlur={field.onBlur}
            value={field.value}
            errorMessage={fieldState.error?.message}
          />
          {fieldState.error?.message && (
            <span className="text-xs text-danger -mt-1">
              {fieldState.error.message}
            </span>
          )}
        </>
      )}
    />
  )
}
