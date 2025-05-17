import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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

// Icons
import {
  Building,
  Menu,
  Bell, // Notification
  Settings, // Cog / Settings -> New Dropdown Trigger
  UserCircle, // Profile Item
  LogOut, // Logout Item
  Loader2, // Loading
} from "lucide-react";

// Navigation
import DashboardNav from "@/components/layout/DashboardNav"; // Ensure path is correct
import logo from "@/assets/logos/logo.png";
import { Toaster } from "../ui/toaster"; // Ensure path is correct

// Helper to get initials
const getInitials = (name = "") => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export default function DashboardHeader() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load user data from localStorage
  useEffect(() => {
    setIsLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      } else {
        console.warn("No user data in localStorage.");
      }
    } catch (error) {
      console.error("Error parsing localStorage user data:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Handle Logout
  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUserData(null);
    navigate("/login");
    toast({ title: "Logged Out" });
  };

  // Placeholder for notifications
  const showNotifications = () => {
    toast({
      title: "Notifications",
      description: "No new notifications (Placeholder).",
    });
  };

  // Loading State
  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <Building className="h-5 w-5 text-rose-500" />{" "}
            <span className="font-bold">UniRoom</span>
             */}
            <img src={logo} alt="UniRoom Logo" className="h-6" />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            {" "}
            <Loader2 className="h-4 w-4 animate-spin" /> <span>Loading...</span>{" "}
          </div>
        </div>
      </header>
    );
  }

  // Role extraction after loading and check
  const role = userData?.role || "unknown";

  return (
    <header className="sticky top-0 z-50 px-8 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* --- Mobile Menu (Sheet) - CORRECTED --- */}
        <div className="mr-4 flex md:hidden">
          <Sheet>
            {/* REMOVED asChild from SheetTrigger */}
            {/* Make SheetTrigger the button directly */}
            <SheetTrigger
              as={Button}
              variant="outline"
              size="icon"
              className="mr-2"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Menu</span>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[240px] sm:w-[280px] p-0 pt-6"
            >
              <div className="flex h-full flex-col">
                <div className="px-4 flex items-center gap-2 pb-4 border-b mb-4">
                  {/* <Building className="h-6 w-6 text-rose-500" />
                  <span className="text-lg font-bold">UniRoom</span> */}
                  <img src={logo} alt="UniRoom Logo" className="h-6 px-4" />
                </div>
                <div className="flex-1 px-4">
                  <DashboardNav role={role} isMobile={true} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* --- Left Side (Desktop) --- */}
        <div className="items-center gap-2 hidden md:flex">
          <Link to="/" className="flex items-center gap-2 mr-4">
            {/* <Building className="h-5 w-5 text-rose-500" />
            <span className="font-bold text-lg">UniRoom</span> */}

            <img src={logo} alt="UniRoom Logo" className="h-6 px-2" />
          </Link>
          <span className="text-sm font-medium text-muted-foreground capitalize border-l pl-4">
            {role || "Portal"}
          </span>
        </div>

        {/* === Right Side Actions === */}
        <div className="flex flex-1 items-center justify-end space-x-3 sm:space-x-4">
          {userData ? (
            <>
              {/* 1. Notification Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full relative"
                onClick={showNotifications}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-1 ring-background"></span>
                <span className="sr-only">Notifications</span>
              </Button>

              {/* 2. Settings Icon + Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {/* This button has a single Avatar child, usually OK */}
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">User Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  {/* 3a. User Name and Role Label */}
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userData.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {userData.role || "Unknown Role"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* 3b. Profile Item */}
                  <DropdownMenuItem
                    onSelect={() =>
                      navigate(
                        role === "admin"
                          ? "/dasboard/admin/profile"
                          : role === "service"
                          ? "/dasboard/service/profile"
                          : "/dashboard/student/profile"
                      )
                    }
                    className="cursor-pointer"
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* 3c. Logout Item */}
                  <DropdownMenuItem
                    onSelect={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 4. User Avatar */}
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={userData?.photo || userData?.profileImageUrl || ""}
                  alt={userData?.name || "User"}
                />
                <AvatarFallback>{getInitials(userData?.name)}</AvatarFallback>
              </Avatar>

              {/* 5. User Name and Role Text (Desktop only) */}
              <div className="hidden lg:flex flex-col items-start gap-2 -space-y-1 ml-0">
                <p className="text-sm font-medium leading-none">
                  {userData.name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground capitalize">
                  {userData.role || "Role"}
                </p>
              </div>
            </>
          ) : (
            // Fallback Login Button
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
        {/* ========================== */}
      </div>
      {/* <Toaster /> Ensure Toaster is present */}
    </header>
  );
}
