/**
 * ThemeProvider Component
 *
 * This component wraps your application with NextThemesProvider from "next-themes".
 * It enables theme management (like light/dark mode) across the app.
 *
 * Usage:
 *   Wrap your app's root layout with <ThemeProvider> to apply theme support.
 *
 * Props:
 *   children - The child components that will have access to the theme context.
 *   ...props  - Any other props supported by NextThemesProvider (like defaultTheme, attribute, etc.)
 *
 * Example:
 *   <ThemeProvider attribute="class" defaultTheme="system">
 *     <App />
 *   </ThemeProvider>
 */

"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ 
  children, 
  ...props 
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}