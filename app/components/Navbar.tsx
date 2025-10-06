// -------------------------------
//  Developer Reference Notes
// -------------------------------
//
// Project: Hirefy – On-Demand IT Service Platform
// Group: S-Ware 
// Members: Anandjit Kaur, Hassan Mir, Imad Rana, Kishan Patel, Mayur Tirkar
// Folder: app/components/ui File: Navbar.tsx
//
// Description:
// - Front-end React (TypeScript/Next.js) component for the Hirefy Navigation Bar  
// - Manages navigation links and Firebase authentication state  
// - Shows Login/Register for guests and Dashboard/Logout for logged-in users  
// - Includes custom Hirefy SVG logo and mobile-friendly slide menu 
//
// Technical Understanding & Research Summary:
// - Researched through:
//   • Google search results on React navigation and authentication best practices  
//   • Official React documentation: https://react.dev  
//   • Next.js documentation: https://nextjs.org/docs  
//   • Firebase Authentication docs: https://firebase.google.com/docs/auth  
//   • YouTube tutorials on responsive navbars and authentication in React
//     - https://www.youtube.com/watch?v=NWEukI8KsBI  
//     - https://www.youtube.com/watch?v=6kgitEWTxac  
//     - https://firebase.google.com/docs/auth
// - Final code refined and documented with ChatGPT assistance for clarity and maintainability.  
// -------------------------------
// ChatGPT Prompt Used
// -------------------------------
// I gave ChatGPT the following prompt to help me write and understand
// this component clearly:
//
// "I need you to create a responsive navigation bar (Navbar) for my Hirefy web application,
// built with React (TypeScript/Next.js). It should manage navigation links, handle authentication
// state with Firebase, support role-based dashboard routing, and include logout functionality.
// The Navbar must include a custom logo, a dynamic user dropdown menu for authenticated users,
// and a mobile-friendly layout for smaller screens, ensuring a seamless and modern user experience."
// -------------------------------
//  Summary:
// - Language: TypeScript / TSX (React / Next.js)
// - Side: Frontend Component (Client-side)
// - Libraries Used: firebase/auth, next/link, next/navigation, shadcn/ui, lucide-react
// - Purpose: To provide a responsive navigation bar with authentication awareness,
//   dynamic role-based dashboard routing, and a modern mobile drawer menu.
// -------------------------------

'use client'; // Next.js directive: this component renders on the client (enables hooks like useState, useRouter, etc.)

import { useAuth } from '../context/AuthContext'; // Custom context: provides { user, userData, loading } for auth state & profile/role.
import { auth } from '../lib/firebase/firebase'; // Firebase Auth instance configured in your app.
import { signOut } from 'firebase/auth'; // Firebase sign-out function.
import { LayoutDashboard, LogOut, Menu } from 'lucide-react'; // Icons used in menu items and mobile trigger.
import Link from 'next/link'; // Next.js client-side navigation links.
import { usePathname, useRouter } from 'next/navigation'; // Hooks: current route path + programmatic navigation (router.push).
import { Button } from '../components/ui/button'; // Reusable Button component (design system / shadcn).
import { Skeleton } from '../components/ui/skeleton'; // Skeleton loaders for navbar while auth is resolving.
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'; // Dropdown primitives for the user menu.
import { Avatar, AvatarFallback } from '../components/ui/avatar'; // Avatar UI with fallback initials (no image).
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet'; // Off-canvas drawer used for the mobile menu.
import { useState } from 'react'; // React state hook (for mobile menu open/close).
import { cn } from "../lib/utils"; // Classname helper to merge conditional Tailwind classes.

// Brand mark: inline SVG logo wrapped in a link to "/".
const HirefyLogo = () => (
    <Link href="/" className="flex items-center justify-center h-8 w-8">
        <svg
            width="32"
            height="32"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                {/* Vertical gradient for the spherical logo */}
                <linearGradient id="sphereGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FF7B79', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#FF4C4A', stopOpacity: 1 }} />
                </linearGradient>
            </defs>
            {/* Circular background with gradient fill */}
            <circle cx="50" cy="50" r="48" fill="url(#sphereGradient)" />
            {/* Decorative white arcs (brand style lines) */}
            <path
                d="M25 35 C40 25, 60 25, 75 35"
                stroke="white"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
            />
            <path
                d="M20 50 C35 40, 65 40, 80 50"
                stroke="white"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
            />
            <path
                d="M25 65 C40 55, 60 55, 75 65"
                stroke="white"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
            />
             <path
                d="M35 80 C45 72, 55 72, 65 80"
                stroke="white"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
            />
             <path
                d="M40 20 C48 15, 52 15, 60 20"
                stroke="white"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
            />
        </svg>
    </Link>
)

// Single navigation link with "active" state styling based on current path.
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const pathname = usePathname(); // Current route path (e.g., "/contact").
    // Active when exact "/" or when pathname starts with the href for nested routes.
    const isActive = href === '/' ? pathname === href : pathname.startsWith(href);
    return (
        <Link href={href} className={cn("font-semibold transition-colors hover:text-primary", isActive ? "text-primary" : "text-foreground/60")}>
            {children}
        </Link>
    )
}

export default function Navbar() {
  // Auth context values:
  // - user: Firebase user object (null if not logged in)
  // - userData: your app-specific profile (contains role)
  // - loading: true while auth state/profile is being fetched
  const { user, userData, loading } = useAuth();
  const router = useRouter(); // For redirecting after logout.
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false); // Controls the mobile Sheet state.

  // Logs out current user via Firebase, then navigate to /login.
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Role-based dashboard routing:
  // Maps the current user's role to its dashboard path.
  const getDashboardPath = () => {
    if (!userData) return '/';
    switch (userData.role) {
      case 'admin':
        return '/dashboard/admin';
      case 'client':
        return '/dashboard/client';
      case 'professional':
        return '/dashboard/professional';
      default:
        return '/';
    }
  };

  // Returns first two characters of email as uppercase initials for AvatarFallback.
  const getInitials = (email: string | undefined | null) => {
    if (!email) return '..';
    return email.substring(0, 2).toUpperCase();
  }

  // Centralized nav links used in both desktop and mobile menus.
  const navLinks = (
    <>
      <NavLink href="/">Home</NavLink>
      <NavLink href="/about">About</NavLink>
      <NavLink href="/contact">Contact</NavLink>
    </>
  )

  return (
    // Sticky header with backdrop blur and border; stays fixed at top with high z-index.
    <header className="bg-card/95 border-b backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        {/* Left side: logo + desktop nav */}
        <div className="flex items-center gap-8">
            {/* Brand group: logo + brand name */}
            <div className="flex items-center gap-3 group">
                <HirefyLogo />
                <Link href="/" className="text-xl font-bold font-headline text-foreground transition-colors">
                  Hirefy
                </Link>
            </div>
            {/* Desktop navigation (hidden on small screens) */}
            <nav className="hidden md:flex items-center gap-6">
                {navLinks}
            </nav>
        </div>
        
        {/* Right side: auth area + mobile menu trigger */}
        <div className="flex items-center gap-2">
          {/* While auth state is loading, show skeleton placeholders */}
          {loading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          ) : user ? (
            // If logged in: show avatar button that opens the account dropdown menu
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-primary/50">
                    <AvatarFallback className="bg-primary/20">{getInitials(user.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              {/* Account dropdown content anchored to the avatar button */}
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">My Account</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Role-aware "Dashboard" link */}
                <DropdownMenuItem asChild>
                  <Link href={getDashboardPath()}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* Logout action with destructive styling on focus/hover */}
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // If logged out (and not loading): show Login/Register (hidden on small screens)
            <div className="hidden md:flex items-center gap-2">
              <Button asChild variant="ghost" className="font-semibold">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="font-semibold">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
           {/* Mobile menu trigger (hamburger) visible only below md breakpoint */}
           <div className="md:hidden">
            {/* Sheet = slide-over drawer. open/onOpenChange controlled by local state. */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              {/* Clicking this button toggles the Sheet */}
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              {/* Drawer content slides from the right; contains nav links and auth buttons */}
              <SheetContent side="right" className="w-[240px]">
                <div className="flex flex-col p-4 pt-12">
                   <nav className="flex flex-col gap-6 text-lg mb-8">
                     {navLinks}
                   </nav>
                   {/* If user is logged out, show auth buttons inside the drawer */}
                   {!user && !loading && (
                     <div className="flex flex-col gap-3">
                        {/* Close drawer after navigating (setMobileMenuOpen(false)) */}
                        <Button asChild variant="outline" onClick={() => setMobileMenuOpen(false)}>
                            <Link href="/login">Login</Link>
                        </Button>
                        <Button asChild onClick={() => setMobileMenuOpen(false)}>
                            <Link href="/register">Register</Link>
                        </Button>
                     </div>
                   )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
