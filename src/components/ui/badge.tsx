import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30',
        secondary:
          'bg-slate-500/20 text-slate-300 border border-slate-400/30',
        destructive:
          'bg-red-500/20 text-red-300 border border-red-400/30',
        outline: 'text-white border border-white/20 bg-transparent',
        success:
          'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30',
        warning:
          'bg-amber-500/20 text-amber-300 border border-amber-400/30',
        accent:
          'bg-violet-500/20 text-violet-300 border border-violet-400/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
