"use client"

import { useWatch, type Control, type FieldPath, type FieldValues } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { DatePicker } from "@/components/shared/date-picker"
import { OptionalBadge } from "./optional-badge"

interface DateRangeFieldsProps<T extends FieldValues> {
  control: Control<T>
  startName: FieldPath<T>
  endName: FieldPath<T>
  startLabel?: string
  endLabel?: string
  startDescription?: string
  endDescription?: string
  startOptional?: boolean
  endOptional?: boolean
}

export function DateRangeFields<T extends FieldValues>({
  control,
  startName,
  endName,
  startLabel = "Start Date",
  endLabel = "End Date",
  startDescription,
  endDescription,
  startOptional = false,
  endOptional = false,
}: DateRangeFieldsProps<T>) {
  const startValue = useWatch({ control, name: startName })

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField
        control={control}
        name={startName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {startLabel}
              {startOptional && <OptionalBadge />}
            </FormLabel>
            <FormControl>
              <DatePicker value={field.value} onChange={field.onChange} />
            </FormControl>
            {startDescription && <FormDescription>{startDescription}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={endName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {endLabel}
              {endOptional && <OptionalBadge />}
            </FormLabel>
            <FormControl>
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                disabledDays={startValue ? { before: startValue } : undefined}
              />
            </FormControl>
            {endDescription && <FormDescription>{endDescription}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
