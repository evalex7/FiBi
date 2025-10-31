"use client"

import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const SheetContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
  side: "top" | "bottom" | "left" | "right"
}>({
  open: false,
  onOpenChange: () => {},
  side: "right",
})

const useSheetContext = () => React.useContext(SheetContext)

const Sheet = ({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) => {
  return (
    <SheetContext.Provider value={{ open, onOpenChange, side: "right" }}>
      {children}
    </SheetContext.Provider>
  )
}

const SheetTrigger = ({
  children,
  asChild = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) => {
  const { onOpenChange } = useSheetContext()
  const Comp = asChild ? "div" : "button"
  const child = asChild ? React.Children.only(children as React.ReactElement) : children

  return (
    <Comp
      {...props}
      onClick={(e) => {
        onOpenChange(true)
        if (props.onClick) props.onClick(e)
      }}
    >
      {child}
    </Comp>
  )
}

const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    side?: "top" | "bottom" | "left" | "right"
  }
>(({ side = "right", className, children, ...props }, ref) => {
  const { open, onOpenChange } = useSheetContext()

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false)
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onOpenChange])

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  const sideClasses = {
    top: "inset-x-0 top-0 border-b",
    bottom: "inset-x-0 bottom-0 border-t",
    left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
    right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
  }

  const transitionClasses = {
    open: {
        top: 'animate-in slide-in-from-top',
        bottom: 'animate-in slide-in-from-bottom',
        left: 'animate-in slide-in-from-left',
        right: 'animate-in slide-in-from-right',
    },
    closed: {
        top: 'animate-out slide-out-to-top',
        bottom: 'animate-out slide-out-to-bottom',
        left: 'animate-out slide-out-to-left',
        right: 'animate-out slide-out-to-right',
    }
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/80"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={ref}
        className={cn(
          "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out duration-300",
          sideClasses[side],
          open ? transitionClasses.open[side] : transitionClasses.closed[side],
          className
        )}
        {...props}
      >
        {children}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>
  )
})
SheetContent.displayName = "SheetContent"

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = "SheetDescription"

const SheetClose = ({ children }: { children: React.ReactNode }) => {
  const { onOpenChange } = useSheetContext()
  return <button onClick={() => onOpenChange(false)}>{children}</button>
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
