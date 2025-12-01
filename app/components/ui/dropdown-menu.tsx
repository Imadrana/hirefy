// -------------------------------
// Developer Reference Notes
// -------------------------------
//
// Project: Hirefy – On-Demand IT Service Platform
// Group: S-Ware
// Members: Anandjit Kaur, Hassan Mir, Imad Rana, Kishan Patel, Mayur Tirkar
// Folder: app/components/ui   File: DropdownMenu.tsx
//
// Component Purpose:
// - Fully customizable dropdown menu system for the Hirefy frontend.
// - Built using Radix UI primitives with custom TailwindCSS styling.
// - Supports submenus, checkbox items, radio groups, separators, labels,
//   and keyboard shortcuts — making it scalable for complex UI needs.
//
// Technical Summary:
// - Uses Radix Dropdown primitives: Root, Trigger, Content, Sub, Item,
//   CheckboxItem, RadioItem, etc.
// - React.forwardRef used extensively to allow refs to be passed to
//   internal DOM nodes (important for accessibility and animations).
// - cn() utility merges Tailwind classes efficiently and conditionally.
// - Includes accessibility features: focus states, aria roles,
//   data-state animations, and keyboard navigation support.
// - Supports nested submenus using <DropdownMenuSub> and trigger/content pairs.
// - Incorporates Lucide icons: Check, ChevronRight, Circle.
//
// Research & Learning:
// - Studied Radix Dropdown docs: https://www.radix-ui.com/docs/primitives/components/dropdown-menu
// - Learned best practices for animated menu components.
// - Learned structure of complex reusable component APIs:
//   Trigger → Content → Items → SubMenu → Indicators → Checkbox/Radio logic.
// - Understood how Radix portals solve "clipping" issues by rendering outside DOM flow.
// - Practiced organizing a large UI component into smaller reusable blocks.
//
// References / Tutorials:
// • Radix Dropdown Menu – Official Docs  
// • React ForwardRef – https://react.dev/reference/react/forwardRef  
// • TailwindCSS Styling – https://tailwindcss.com/docs  
// • Lucide React Icons – https://lucide.dev/
//
// ChatGPT Prompt Used:
// "I need a fully customizable dropdown menu system for my Hirefy project that
// supports submenus, checkbox items, radio items, labels, separators, and
// keyboard shortcuts. Make sure it uses Radix UI primitives, TailwindCSS, and
// follows accessible patterns. Export all menu components individually so they
// can be used across multiple pages."
//
// Summary:
// - Language: TypeScript + TSX
// - Component Type: Client-side (interactive)
// - Libraries Used: React, Radix UI Dropdown, Lucide Icons, TailwindCSS
// - Purpose: A scalable dropdown menu system for navigation/settings/actions
// -------------------------------

'use client' // client-side component (allows interactivity)

import * as React from "react" // React for components/refs
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu" // Radix dropdown primitives
import { Check, ChevronRight, Circle } from "lucide-react" // icons used in items/indicators

import { cn } from "../../lib/utils" // className helper (merge/condition classes)

const DropdownMenu = DropdownMenuPrimitive.Root // alias Root as DropdownMenu

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger // trigger button element

const DropdownMenuGroup = DropdownMenuPrimitive.Group // groups related items

const DropdownMenuPortal = DropdownMenuPrimitive.Portal // renders menu in a portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub // container for sub-menus

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup // radio items group

const DropdownMenuSubTrigger = React.forwardRef< // sub-menu trigger with ref
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>, // ref type
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & { // props type
    inset?: boolean // optional left padding toggle
  }
>(({ className, inset, children, ...props }, ref) => ( // component props + ref
  <DropdownMenuPrimitive.SubTrigger // Radix sub trigger
    ref={ref} // forward ref
    className={cn( // merge classes
      "flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", // base styles
      inset && "pl-8", // add left padding when inset
      className // allow custom classes
    )}
    {...props} // spread remaining props
  >
    {children} {/* label/content inside trigger */}
    <ChevronRight className="ml-auto" /> {/* right arrow icon */}
  </DropdownMenuPrimitive.SubTrigger>
)) // end forwardRef
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName // set display name for DevTools

const DropdownMenuSubContent = React.forwardRef< // sub-menu content with ref
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>, // ref type
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent> // props type
>(({ className, ...props }, ref) => ( // component body
  <DropdownMenuPrimitive.SubContent // Radix sub content
    ref={ref} // forward ref
    className={cn( // merge classes
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", // size, colors, animations
      className // custom classes
    )}
    {...props} // spread props
  />
)) // end forwardRef
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName // display name

const DropdownMenuContent = React.forwardRef< // root menu content with ref
  React.ElementRef<typeof DropdownMenuPrimitive.Content>, // ref type
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> // props type
>(({ className, sideOffset = 4, ...props }, ref) => ( // default offset=4
  <DropdownMenuPrimitive.Portal> {/* render in portal to avoid clipping */}
    <DropdownMenuPrimitive.Content // menu panel
      ref={ref} // forward ref
      sideOffset={sideOffset} // gap from trigger
      className={cn( // classes
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", // look/feel
        className // allow overrides
      )}
      {...props} // spread props
    />
  </DropdownMenuPrimitive.Portal>
)) // end forwardRef
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName // display name

const DropdownMenuItem = React.forwardRef< // clickable item with ref
  React.ElementRef<typeof DropdownMenuPrimitive.Item>, // ref type
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & { // props type
    inset?: boolean // optional left padding
  }
>(({ className, inset, ...props }, ref) => ( // component
  <DropdownMenuPrimitive.Item // Radix item
    ref={ref} // forward ref
    className={cn( // classes
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", // base styles
      inset && "pl-8", // extra left padding
      className // user classes
    )}
    {...props} // spread props
  />
)) // end forwardRef
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName // display name

const DropdownMenuCheckboxItem = React.forwardRef< // checkbox item with ref
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>, // ref type
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem> // props type
>(({ className, children, checked, ...props }, ref) => ( // component
  <DropdownMenuPrimitive.CheckboxItem // checkbox row
    ref={ref} // forward ref
    className={cn( // classes
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", // base styles
      className // custom
    )}
    checked={checked} // controlled checked state
    {...props} // spread props
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"> {/* leading icon slot */}
      <DropdownMenuPrimitive.ItemIndicator> {/* renders when checked */}
        <Check className="h-4 w-4" /> {/* check icon */}
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children} {/* item label */}
  </DropdownMenuPrimitive.CheckboxItem>
)) // end forwardRef
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName // display name

const DropdownMenuRadioItem = React.forwardRef< // radio item with ref
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>, // ref type
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem> // props type
>(({ className, children, ...props }, ref) => ( // component
  <DropdownMenuPrimitive.RadioItem // radio row
    ref={ref} // forward ref
    className={cn( // classes
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", // base styles
      className // custom classes
    )}
    {...props} // spread props
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"> {/* leading circle slot */}
      <DropdownMenuPrimitive.ItemIndicator> {/* shows when selected */}
        <Circle className="h-2 w-2 fill-current" /> {/* small filled dot */}
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children} {/* item label */}
  </DropdownMenuPrimitive.RadioItem>
)) // end forwardRef
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName // display name

const DropdownMenuLabel = React.forwardRef< // label text with ref
  React.ElementRef<typeof DropdownMenuPrimitive.Label>, // ref type
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & { // props type
    inset?: boolean // optional left padding
  }
>(({ className, inset, ...props }, ref) => ( // component
  <DropdownMenuPrimitive.Label // label element
    ref={ref} // forward ref
    className={cn( // classes
      "px-2 py-1.5 text-sm font-semibold", // font sizing/weight
      inset && "pl-8", // extra left padding
      className // custom classes
    )}
    {...props} // spread props
  />
)) // end forwardRef
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName // display name

const DropdownMenuSeparator = React.forwardRef< // separator line with ref
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>, // ref type
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator> // props type
>(({ className, ...props }, ref) => ( // component
  <DropdownMenuPrimitive.Separator // horizontal rule
    ref={ref} // forward ref
    className={cn("-mx-1 my-1 h-px bg-muted", className)} // thin muted line
    {...props} // spread props
  />
)) // end forwardRef
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName // display name

const DropdownMenuShortcut = ({ // small helper for right-aligned shortcut text
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => { // HTML span props
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)} // align right, small, faint
      {...props} // spread props
    />
  )
} // end component
DropdownMenuShortcut.displayName = "DropdownMenuShortcut" // display name

export { // export all components for use elsewhere
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} // end exports
