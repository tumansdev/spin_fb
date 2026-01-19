import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          'bg-primary text-primary-foreground': variant === 'default',
          'bg-green-500/20 text-green-400 border border-green-500/30': variant === 'success',
          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30': variant === 'warning',
          'bg-red-500/20 text-red-400 border border-red-500/30': variant === 'destructive',
          'border border-input bg-background': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
