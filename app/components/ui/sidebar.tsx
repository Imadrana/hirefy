"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Sidebar Context
const SidebarContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: true,
  setOpen: () => {},
})

export function useSidebar() {
  return React.useContext(SidebarContext)
}

// Sidebar Provider
export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <div className="flex min-h-screen w-full">
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

// Sidebar
export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open } = useSidebar()

  return (
    <aside
      ref={ref}
      className={cn(
        "flex h-screen flex-col border-r bg-card sticky top-0 transition-all duration-300",
        open ? "w-64" : "w-16",
        className
      )}
      {...props}
    >
      <div className="flex-1 overflow-y-auto py-4">
        {children}
      </div>
    </aside>
  )
})
Sidebar.displayName = "Sidebar"

// Sidebar Menu
export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-col gap-1 px-2", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

// Sidebar Menu Item
export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("list-none", className)} {...props} />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

// Sidebar Menu Button
export const SidebarMenuButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: { children: React.ReactNode }
  }
>(({ className, isActive, asChild, tooltip, children, ...props }, ref) => {
  const { open } = useSidebar()
  
  const buttonContent = (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive && "bg-accent text-accent-foreground",
        !open && "justify-center px-2",
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Icon element
          if (child.type && typeof child.type !== 'string') {
            return <span className="shrink-0">{child}</span>
          }
          // Text span
          if (child.type === 'span') {
            return open ? child : null
          }
        }
        return child
      })}
    </div>
  )

  if (asChild) {
    return React.Children.only(
      React.cloneElement(children as React.ReactElement, {
        ref,
        className: cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors no-underline",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isActive && "bg-accent text-accent-foreground",
          !open && "justify-center px-2",
          className
        ),
        title: !open && tooltip ? String(tooltip.children) : undefined,
      })
    )
  }

  return (
    <a ref={ref} {...props}>
      {buttonContent}
    </a>
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

// Sidebar Inset (Main Content Area)
export const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <main
    ref={ref}
    className={cn("flex-1 overflow-auto bg-background", className)}
    {...props}
  />
))
SidebarInset.displayName = "SidebarInset"