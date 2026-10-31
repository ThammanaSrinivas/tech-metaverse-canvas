import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { type DialogProps } from "@radix-ui/react-dialog"
import { Command as CommandPrimitive } from "cmdk"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Dialog, DialogTitle } from "@/components/ui/dialog"
import { MODAL_MOTION, STILL } from "@/components/overlayMotion"

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-xl bg-popover/95 backdrop-blur-md text-popover-foreground shadow-2xl ring-1 ring-border/50",
      className
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

interface CommandDialogProps extends DialogProps {
  children?: React.ReactNode;
}

/**
 * Not the shared DialogContent: its Radix overlay is a `fixed` layer at the screen's edges, which
 * Safari 26 paints its toolbars with (at once, while the dim is still fading), and it locks scroll
 * with `overflow: hidden` on <body>, which makes iOS re-lay out the page. Here the dim is `absolute`
 * over the whole document, so the dialog renders in place (inside Layout's root), not in a portal.
 * Radix still traps focus and closes on Escape or a tap outside. The panel is opaque from its first
 * frame and goes at once; only the dim fades (overlayMotion.ts).
 */
const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  const still = useReducedMotion() ? STILL : {}
  // Opened by a shortcut or a button that isn't a Radix trigger, so Radix has nowhere to return
  // focus to: remember what had it (before Radix moves focus in) and give it back on close.
  const returnTo = React.useRef<HTMLElement | null>(null)
  React.useLayoutEffect(() => {
    if (props.open) returnTo.current = document.activeElement as HTMLElement | null
  }, [props.open])
  return (
    <Dialog {...props}>
      <AnimatePresence>
        {props.open && (
          <motion.div
            key="dim"
            {...MODAL_MOTION.backdrop}
            {...still}
            className="absolute inset-x-0 top-0 -bottom-px z-50 bg-black/80"
            aria-hidden
          />
        )}
      </AnimatePresence>
      <DialogPrimitive.Content
        className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] overflow-hidden shadow-2xl duration-200 data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] motion-reduce:animate-none sm:rounded-lg"
        aria-describedby={undefined}
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          returnTo.current?.focus({ preventScroll: true })
        }}
      >
        {/* screen readers announce the dialog by name; sighted users see the search field */}
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input-wrapper]_svg]:text-muted-foreground/70 [&_[cmdk-input]]:h-14 [&_[cmdk-input]]:text-base [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-3 [&_[cmdk-item]]:rounded-lg [&_[cmdk-item]]:mx-2 [&_[cmdk-item]]:my-1 [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4">
          {children}
        </Command>
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </Dialog>
  )
}

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-border/50 px-4 py-2" cmdk-input-wrapper="">
    <div className="flex items-center justify-center w-5 h-5 mr-3">
      <Search className="h-4 w-4 shrink-0 text-muted-foreground/70" />
    </div>
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-12 w-full bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50 font-medium",
        className
      )}
      {...props}
    />
  </div>
))

CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[400px] overflow-y-auto overflow-x-hidden py-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent", className)}
    {...props}
  />
))

CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-8 text-center text-sm text-muted-foreground/70 font-medium"
    {...props}
  />
))

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-2 text-foreground [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground/80 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider",
      className
    )}
    {...props}
  />
))

CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-border/50 my-2", className)}
    {...props}
  />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-lg px-3 py-3 text-sm font-medium outline-none transition-all duration-200 data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent/80 data-[selected='true']:text-accent-foreground data-[selected='true']:shadow-sm data-[disabled=true]:opacity-40 hover:bg-accent/50",
      className
    )}
    {...props}
  />
))

CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-wider text-muted-foreground/70 font-mono bg-muted/50 px-2 py-1 rounded-md",
        className
      )}
      {...props}
    />
  )
}
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
