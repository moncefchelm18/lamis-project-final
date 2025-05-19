// DashboardHeader.jsx
"use client";

import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "@/context/AuthContext"; // Ensure this path is correct

// Icons
import {
  // Building, // Original icon for logo, replaced by img
  Menu,
  Bell,
  Settings,
  UserCircle,
  LogOut,
  Loader2,
  ChevronDown, // For dropdown indicator
} from "lucide-react";

import DashboardNav from "@/components/layout/DashboardNav"; // Ensure path is correct
import logo from "@/assets/logos/logo.png"; // Ensure path is correct

const getInitials = (name = "") => {
  if (!name || typeof name !== "string") return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean) // Ensure no empty strings if there are multiple spaces
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export default function DashboardHeader() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation(); // To close mobile sheet on navigation

  const authContext = useContext(AuthContext);

  // This component should not render if AuthContext is not available.
  // This typically means AuthProvider is not wrapping this part of the app.
  if (!authContext) {
    console.error(
      "DashboardHeader: AuthContext is missing. Ensure this component is wrapped by AuthProvider."
    );
    // Render a minimal or error header
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-center text-destructive">
          Auth Context Error
        </div>
      </header>
    );
  }

  const {
    user: contextUser,
    logout: contextLogout,
    isLoadingAuth,
  } = authContext;

  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // Derived display values from contextUser
  const displayName = contextUser?.name || "User";
  const displayRole = contextUser?.role || "guest"; // Default to 'guest' or similar if no role
  const displayInitials = getInitials(contextUser?.name);
  const userAvatarUrl =
    contextUser?.photo || contextUser?.profileImageUrl || ""; // Example properties for avatar

  // Close mobile sheet on route change
  useEffect(() => {
    setIsMobileSheetOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    contextLogout(); // This will navigate to /login via AuthContext
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handleNavigateToProfile = () => {
    if (!contextUser?.role) {
      navigate("/dashboard/student/profile"); // Fallback
      return;
    }
    navigate(`/dashboard/${contextUser.role}/profile`);
  };

  const showNotifications = () => {
    toast({
      title: "Notifications",
      description: "No new notifications (Placeholder).",
    });
  };

  if (isLoadingAuth && !contextUser) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur px-4 sm:px-8">
        <div className="container mx-auto flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="UniRoom Logo" className="h-7" />
          </Link>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-8">
      <div className="container mx-auto flex h-14 items-center">
        {/* Mobile Menu Trigger */}
        <div className="md:hidden mr-2">
          <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[250px] sm:w-[280px] p-0 pt-6 flex flex-col"
            >
              <div className="px-4 pb-4 border-b mb-4">
                <Link
                  to="/"
                  className="flex items-center gap-2"
                  onClick={() => setIsMobileSheetOpen(false)}
                >
                  <img src={logo} alt="UniRoom Logo" className="h-7" />
                  <span className="font-bold text-lg">UniRoom</span>
                </Link>
              </div>
              <div className="flex-1 px-2 overflow-y-auto">
                <DashboardNav
                  role={displayRole}
                  isMobile={true}
                  onNavigate={() => setIsMobileSheetOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Logo and Role */}
        <Link to="/" className="items-center gap-2 hidden md:flex mr-6">
          <img src={logo} alt="UniRoom Logo" className="h-7" />
          <span className="sr-only">UniRoom</span>
        </Link>
        <div className="hidden md:flex items-center border-l border-border pl-4">
          <span className="text-sm font-medium text-muted-foreground capitalize">
            {displayRole}
          </span>
        </div>

        {/* Right Side Actions */}
        <div className="ml-auto flex items-center space-x-2 sm:space-x-3">
          {contextUser ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full relative hidden sm:flex"
                onClick={showNotifications}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-rose-500 ring-1 ring-background animate-pulse"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-auto px-2 sm:px-3 flex items-center gap-2 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userAvatarUrl} alt={displayName} />
                      <AvatarFallback>{displayInitials}</AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:flex flex-col items-start -space-y-1">
                      <span className="text-xs font-medium">{displayName}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {displayRole}
                      </span>
                    </div>
                    <ChevronDown className="ml-1 h-4 w-4 text-muted-foreground hidden lg:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal lg:hidden">
                    {" "}
                    {/* Show this only if name/role text above is hidden */}
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {displayName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {displayRole}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="lg:hidden" />
                  <DropdownMenuItem
                    onSelect={handleNavigateToProfile}
                    className="cursor-pointer"
                  >
                    <UserCircle className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem
                    onSelect={() => navigate("/dashboard/settings")}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            // This case should ideally not be reached if ProtectedRoutes works correctly,
            // but as a fallback or if user somehow gets to a dashboard page without contextUser
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
