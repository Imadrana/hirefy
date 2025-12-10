 // ---------------------------------------------
// Developer Reference Notes
// ---------------------------------------------
//
// Project: Hirefy – On-Demand IT Service Platform
// Group: S-Ware
// Members: Hassan Mir, Imad Rana, Kishan Patel, Mayur Tirkar, Anandjit Kaur
// File: app/find-jobs/page.tsx
//
// Description:
// - Client-facing page where professionals can browse, search, and filter open jobs.
// - Reads job posts from the Firestore `jobs` collection and only shows those with status "open".
// - Enriches each job with client profile info (name and avatar) from the `users` collection.
// - Supports text search on job titles and a skill dropdown to filter results.
// - Lets professionals open a dialog, review key details, and submit a proposal stored in `proposals`.
//
// Development Process & Key Learnings:
// - Practiced setting up a Firestore onSnapshot listener and then sorting the results by createdAt on the client.
// - Implemented a simple `getTimeAgo` helper to display relative "Posted X ago" labels for each job card.
// - Used React state to manage searchTerm, skillFilter, dialog visibility, and proposal form values cleanly.
// - Added front-end validation for proposal rate and cover letter before writing to Firestore.
// - Focused on making the layout responsive with a grid (1 column on mobile, 2 columns on larger screens).
//
// References & Resources Used:
// • Next.js App Router & Client Components: https://nextjs.org/docs/app/building-your-application/routing  
// • Firebase Firestore real-time listeners (onSnapshot): https://firebase.google.com/docs/firestore/query-data/listen  
// • shadcn/ui components (Card, Badge, Button, Dialog, Input, Textarea, Avatar): https://ui.shadcn.com  
// • Lucide React Icons (Search, Tag, DollarSign, Clock, FileText, Loader2): https://lucide.dev/icons  
// • TailwindCSS utility classes & responsive grid: https://tailwindcss.com/docs  
//
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
