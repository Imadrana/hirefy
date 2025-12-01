// ChatGPT Prompt Used
/*Build a Radio Group component in Next.js 13 using React, TypeScript, Radix UI, and Tailwind CSS, following Shadcn UI conventions.

Requirements:

Start the file with "use client".

Import @radix-ui/react-radio-group as RadioGroupPrimitive and Circle from lucide-react.

Export two components:

RadioGroup: wrapper using RadioGroupPrimitive.Root, styled with a simple grid layout (grid gap-2).

RadioGroupItem: styled RadioGroupPrimitive.Item with Tailwind classes for borders, focus rings, and disabled states.

Inside each item, include a RadioGroupPrimitive.Indicator that renders a Circle icon when selected.

Use React.forwardRef for both components for proper ref handling.

Merge class names using a cn() utility.

Keep styling consistent with Shadcn UI (border-primary, ring-ring, disabled:opacity-50, etc.).

Output complete TypeScript code, ready to use in radio-group.tsx.*/
"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "../../lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
