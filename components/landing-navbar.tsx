// components/landing-navbar.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Menu,
  X,
  Trophy,
  HelpCircle,
  Home,
  LogOut,
  User,
  Shield,
  Volleyball,
  ChartNoAxesCombined,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface LandingNavbarProps {
  isDark?: boolean;
  onThemeToggle?: () => void;
}

export function LandingNavbar({
  isDark = false,
  onThemeToggle,
}: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const role = String((session as any)?.user?.role || "").toUpperCase();
  const isAdmin = role === "ADMIN";
  const email = (session?.user?.email || "").trim();
  const name = (session?.user?.name || "").trim();

  const initials = useMemo(() => {
    const s = (name || email || "U").replace(/@.*/, "");
    const parts = s.split(/[.\s_-]+/).filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }, [name, email]);

  const navItems = [
    { label: "Početna", href: "/", icon: Home },
    { label: "Kvote", href: "/kvote", icon: Volleyball },
    // { label: "Tipovanje", href: "/tipovanje", icon: Trophy },
    { label: "Analitika", href: "/analitika", icon: ChartNoAxesCombined },
    { label: "Kontakt", href: "/kontakt", icon: HelpCircle },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b dark:bg-kvotizza-dark-bg-10 dark:border-white/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/images/kvotizza-logo.png"
              alt="Kvotizza Logo"
              width={150}
              height={150}
              className="block dark:hidden h-16 w-auto"
            />
            <Image
              src="/images/kvotizza-logo-white.png"
              alt="Kvotizza Logo"
              width={150}
              height={150}
              className="h-16 w-auto hidden dark:block"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-kvotizza-green-500">
                Kvotizza
              </h1>
              <p className="text-xs text-muted-foreground">
                Pametno poređenje kvota
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex justify-self-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 justify-self-end">
            <ThemeToggle />

            {/* Auth controls (desktop) */}
            <div className="hidden md:flex items-center gap-2">
              {status === "loading" && (
                // skeleton placeholders: avatar + button
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-9 w-24 rounded-md" />
                </div>
              )}

              {status === "unauthenticated" && (
                <>
                  <Button
                    // variant="outline"
                    size="sm"
                    onClick={() => signIn(undefined, { callbackUrl: "/" })}
                    className="dark:hover:bg-white/30 dark:bg-white/10 dark:text-white bg-black/10 hover:bg-black/30 text-black font-medium"
                  >
                    Prijava
                  </Button>
                  <Link href="/signup">
                    <Button
                      size="sm"
                      className="text-white bg-sport-green-500 hover:bg-sport-green-500/80 font-medium"
                    >
                      Registracija
                    </Button>
                  </Link>
                </>
              )}

              {status === "authenticated" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-9 w-9 rounded-full"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="" alt={name || email || "User"} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel className="truncate">
                      {name || email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profil
                      </DropdownMenuItem>
                    </Link>
                    {isAdmin && (
                      <Link href="/admin">
                        <DropdownMenuItem className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Odjava
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-9 w-9 p-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur-sm">
            <div className="py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}

              {/* Auth controls (mobile) */}
              <div className="px-4 pt-2 space-y-2">
                {status === "loading" && (
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-full rounded-md" />
                  </div>
                )}

                {status === "unauthenticated" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signIn(undefined, { callbackUrl: "/" });
                      }}
                    >
                      Prijava
                    </Button>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        size="sm"
                        className="w-full bg-sport-green-500 hover:bg-sport-green-600 text-black font-medium"
                      >
                        Registracija
                      </Button>
                    </Link>
                  </>
                )}

                {status === "authenticated" && (
                  <>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button size="sm" variant="outline" className="w-full">
                          <Shield className="h-4 w-4 mr-2" />
                          Admin
                        </Button>
                      </Link>
                    )}
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Odjava
                    </Button>
                  </>
                )}

                {/* CTA */}
                <Button
                  size="sm"
                  className="w-full bg-sport-green-500 hover:bg-sport-green-600 text-black font-medium"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.location.href = "/kvote";
                  }}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Pogledaj sve kvote
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
