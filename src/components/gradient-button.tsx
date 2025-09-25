import type React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface GradientButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode
}

const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(({ className, children, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      className={cn(
        "bg-gradient-primary hover:opacity-90 transition-opacity text-white border-0",
        "dark:bg-primary dark:hover:bg-primary/90",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  )
})

GradientButton.displayName = "GradientButton"

export { GradientButton }
