// -------------------------------
//  Developer Reference Notes
// -------------------------------
//
// Project: Hirefy – On-Demand IT Service Platform
// Group: S-Ware
// Members: Anandjit Kaur, Hassan Mir, Imad Rana, Kishan Patel, Mayur Tirkar
// Folder: app/components/ui   File: Button.tsx
//
// Description:
// - Reusable Button component with multiple variants (default, destructive, outline, etc.)
// - Supports different sizes and icon-only buttons
// - Uses class-variance-authority for variant handling
// - Optional asChild prop allows wrapping with a different component like Link
//
// Technical Understanding & Research Summary:
// - Studied CVA library to manage class variants dynamically
// - Learned forwardRef to allow parent access
// - TailwindCSS used for button styling: colors, padding, hover, focus, disabled states
// - Learned integration with Radix Slot for composable children
//
// References / Tutorials:
// • CVA: https://github.com/joe-bell/cva
// • TailwindCSS Buttons: https://tailwindcss.com/docs/background-color
// • React forwardRef: https://react.dev/reference/react/forwardRef
//
// -------------------------------
// ChatGPT Prompt Used
// -------------------------------
//
// "I need you to create a reusable Button component for my Hirefy web application.
// The button should support different sizes, variants, and states (e.g., default, outline, disabled). 
// It should be styled using TailwindCSS and built with React + TypeScript/TSX. 
// The component should also accept children (text or icons) and be flexible enough to be used across the app for calls-to-action, 
// form submissions, and navigation links."
//
// -------------------------------
// Summary:
// - Language: TypeScript / TSX (React)
// - Side: Frontend Component (Client-side)
// - Libraries Used: React, class-variance-authority, TailwindCSS, lucide-react
// - Purpose: Display reusable buttons with variants, sizes, and optional child components
// -------------------------------
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
