/**
 * ThemeToggle Component
 *
 * This component provides a user interface to toggle between light, dark, and system themes.
 * It uses the `useTheme` hook from "next-themes" and a dropdown menu for selection.
 *
 * Usage:
 *   Include <ThemeToggle /> anywhere in your app where you want the user to switch themes.
 *
 * Features:
 *   - Light theme
 *   - Dark theme
 *   - System default theme
 *
 * Components used:
 *   - Button: clickable trigger for the dropdown
 *   - DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem: for theme selection
 *   - Icons: Sun and Moon from "lucide-react" with transition animations
 *
 * Example:
 *   <ThemeToggle />
 */

"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-9 h-9 p-0">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}