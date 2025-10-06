// -------------------------------
//  Developer Reference Notes
// -------------------------------
//
// Project: Hirefy – On-Demand IT Service Platform
// Group: S-Ware
// Members: Anandjit Kaur, Hassan Mir, Imad Rana, Kishan Patel, Mayur Tirkar
// Folder: app/components/ui   File: Avatar.tsx
//
// Description:
// - Reusable Avatar component for displaying user profile images
// - Built with React, TypeScript, and Radix UI primitives
// - Supports fallback when image is unavailable
// - Uses forwardRef for parent access and composable subcomponents: AvatarImage, AvatarFallback
//
// Technical Understanding & Research Summary:
// - Studied Radix Avatar documentation: https://www.radix-ui.com/docs/primitives/components/avatar
// - Learned forwardRef for passing refs to DOM elements
// - Used cn utility for combining TailwindCSS classes dynamically
// - Learned fallback patterns for avatars (show initials or placeholder icon if image missing)
//
// References / Tutorials:
// • Radix UI Avatar: https://www.radix-ui.com/docs/primitives/components/avatar
// • React forwardRef: https://react.dev/reference/react/forwardRef
// • TailwindCSS Utilities: https://tailwindcss.com/docs
//
// -------------------------------
// ChatGPT Prompt Used
// -------------------------------
//
// "I need you to create an Avatar component for my Hirefy web application.
// The component should display either a user’s profile image (if available) or a fallback with user initials. 
// It should accept props like src, alt, and fallbackText, and apply TailwindCSS styles to make the avatar rounded, centered, and scalable. 
// Write the code in React with TypeScript/TSX so it can be reused across different pages of the application."
//
// -------------------------------
// Summary:
// - Language: TypeScript / TSX (React)
// - Side: Frontend Component (Client-side)
// - Libraries Used: React, @radix-ui/react-avatar, TailwindCSS
// - Purpose: Display user avatars with image/fallback handling
// -------------------------------
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "../../lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
