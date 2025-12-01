// -------------------------------
//  Developer Reference Notes
// -------------------------------
//
// Project: Hirefy – On-Demand IT Service Platform
// Group: S-Ware 
// Members: Anandjit Kaur, Hassan Mir, Imad Rana, Kishan Patel, Mayur Tirkar
// Folder: app/components/ui   File: Card.tsx
//
// Description:
// - Reusable Card component for displaying content sections
// - Built using React + TypeScript and TailwindCSS
// - Includes main Card container and subcomponents:
//    1. CardHeader -> title/heading area
//    2. CardTitle -> heading text
//    3. CardDescription -> descriptive text
//    4. CardContent -> main body content
//    5. CardFooter -> actions/links area
// - Supports forwardRef for accessibility and parent DOM references
// - TailwindCSS used for layout, spacing, borders, rounded corners, and shadows
//
// Technical Understanding & Research Summary:
// - Studied React forwardRef for passing refs from parent
// - Learned composition pattern: main component + subcomponents
// - TailwindCSS used for spacing (p-6), typography (font-semibold, text-sm), rounded corners, shadows
// - TypeScript ensures proper typing of HTML div attributes
// - Code reviewed and annotated using ChatGPT for audit clarity
//
// References / Tutorials:
// • React forwardRef: https://react.dev/reference/react/forwardRef  
// • TailwindCSS Utilities: https://tailwindcss.com/docs  
// • Component composition pattern: https://react.dev/learn/passing-props-to-children  
//
// -------------------------------
// ChatGPT Prompt Used
// -------------------------------
//
// "I need you to create a reusable Card component for my Hirefy web application.
// The card should have a clean design with optional header, title, content, and footer sections. 
// Use React with TypeScript/TSX and TailwindCSS for styling. 
// The card should be responsive, support composition (so other UI components like Button can be placed inside), 
// and be used for features like core values, team profiles, or content previews across the app."
//
// -------------------------------
// Summary:
// - Language: TypeScript / TSX (React)
// - Side: Frontend Component (Client-side)
// - Libraries Used: React, TailwindCSS
// - Purpose: Display structured content in card layouts with header, content, and footer
// -------------------------------
import * as React from "react"

import { cn } from "../../lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
