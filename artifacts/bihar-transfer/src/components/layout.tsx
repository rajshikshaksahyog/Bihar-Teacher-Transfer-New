import { Link, useLocation } from "wouter";
import { useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, LayoutDashboard, Users, FileText, UserCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();
  const logout = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/");
      },
    });
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/teachers", label: "Find Partners", icon: Users },
    { href: "/transfers", label: "My Requests", icon: FileText },
    { href: "/profile", label: "My Profile", icon: UserCircle },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="h-16 border-b border-border bg-card px-6 flex items-center">
          <Skeleton className="h-8 w-48" />
        </header>
        <main className="flex-1 p-6">
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  // Allow rendering unauthenticated states implicitly for routes that handle it,
  // but Layout usually wraps protected routes. We'll let App.tsx handle redirects.
  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Portal logo */}
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              SSP
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-foreground leading-tight">
                Shikshak Sahyog Portal
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Teacher Mutual Transfer Network
              </p>
            </div>
            <div className="block md:hidden font-bold text-foreground">
              Shikshak Sahyog
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location === link.href || location.startsWith(link.href + "/");
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href} className="outline-none">
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
                      isActive ? "bg-accent text-secondary font-semibold" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 text-sm text-right">
              <div>
                <p className="font-semibold text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.employeeId}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logout.isPending}
              className="hidden md:flex gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-2 flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = location === link.href || location.startsWith(link.href + "/");
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <div
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors hover:bg-accent",
                      isActive ? "bg-accent text-secondary" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </div>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              className="justify-start px-3 py-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
              disabled={logout.isPending}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {!user.isProfileComplete && location !== "/profile" && (
          <div className="mb-6 bg-warning text-white p-4 rounded-lg shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-top-4">
            <div>
              <h3 className="font-bold">Profile Incomplete</h3>
              <p className="text-sm text-white/90">You must complete your profile to request transfers.</p>
            </div>
            <Link href="/profile">
              <Button variant="outline" className="bg-white/20 text-white border-white/40 hover:bg-white/30">
                Complete Profile
              </Button>
            </Link>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
