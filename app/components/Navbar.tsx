'use client';

import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase/firebase';
import { signOut } from 'firebase/auth';
import { LayoutDashboard, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { useState } from 'react';
import { cn } from "../lib/utils";


const HirefyLogo = () => (
    <Link href="/" className="flex items-center justify-center h-8 w-8">
        <svg
            width="32"
            height="32"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="sphereGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FF7B79', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#FF4C4A', stopOpacity: 1 }} />
                </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#sphereGradient)" />
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

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const pathname = usePathname();
    const isActive = href === '/' ? pathname === href : pathname.startsWith(href);
    return (
        <Link href={href} className={cn("font-semibold transition-colors hover:text-primary", isActive ? "text-primary" : "text-foreground/60")}>
            {children}
        </Link>
    )
}

export default function Navbar() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

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

  const getInitials = (email: string | undefined | null) => {
    if (!email) return '..';
    return email.substring(0, 2).toUpperCase();
  }

  const navLinks = (
    <>
      <NavLink href="/">Home</NavLink>
      <NavLink href="/about">About</NavLink>
      <NavLink href="/contact">Contact</NavLink>
    </>
  )

  return (
    <header className="bg-card/95 border-b backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 group">
                <HirefyLogo />
                <Link href="/" className="text-xl font-bold font-headline text-foreground transition-colors">
                  Hirefy
                </Link>
            </div>
            <nav className="hidden md:flex items-center gap-6">
                {navLinks}
            </nav>
        </div>
        
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-primary/50">
                    <AvatarFallback className="bg-primary/20">{getInitials(user.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">My Account</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardPath()}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button asChild variant="ghost" className="font-semibold">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="font-semibold">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
           <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px]">
                <div className="flex flex-col p-4 pt-12">
                   <nav className="flex flex-col gap-6 text-lg mb-8">
                     {navLinks}
                   </nav>
                   {!user && !loading && (
                     <div className="flex flex-col gap-3">
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