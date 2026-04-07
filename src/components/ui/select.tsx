import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@lib/utils'

const selectVariants = cva(
  'flex w-full items-center justify-between rounded-xl border bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 appearance-none',
  {
    variants: {
      variant: {
        default: 'border-white/10 bg-white/5 text-white focus:border-indigo-400/50 focus:ring-indigo-400/20',
        error: 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20',
        subtle: 'border-white/5 bg-white/5 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof selectVariants> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <select
        className={cn(selectVariants({ variant, className }), 'pr-10')}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = 'Select'

const SelectOption = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, ...props }, ref) => {
  return <option ref={ref} className={cn('', className)} {...props} />
})
SelectOption.displayName = 'SelectOption'

export { Select, SelectOption }
