// src/components/common/Header.jsx

import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/App"; // Adjust path if needed
import {
  Bell, // Notification icon
  UserCircle, // Profile icon
  LogOut, // Logout icon
  Settings, // Placeholder for dropdown
  LifeBuoy, // Placeholder for dropdown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // For Profile Picture
import { useToast } from "@/components/ui/toast"; // For placeholder notifications

// Helper to capitalize first letter
const capitalize = (s) => s && s[0].toUpperCase() + s.slice(1);

const Header = () => {
  const { userRole, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Placeholder for showing notifications
  const showNotifications = () => {
    toast({
      title: "Notifications",
      description: "No new notifications (Placeholder).",
    });
  };

  // Get initials for Avatar Fallback
  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2) // Get max 2 initials
      .join("")
      .toUpperCase();
  };

  return (
    // Header container adjusted for new layout
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background px-6">
      {/* Left Side: Role Display */}
      <div className="font-medium text-muted-foreground">
        Role:{" "}
        <span className="font-semibold text-foreground">
          {capitalize(userRole || "")}
        </span>
      </div>

      {/* Spacer to push right content */}
      <div className="flex-1"></div>

      {/* Right Side: Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Button */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={showNotifications}
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
          {/* Optional: Add a badge for notification count later */}
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                {/* Placeholder for profile image - replace src with actual user image URL */}
                <AvatarImage
                  src={user?.profileImageUrl || "/placeholder-user.jpg"}
                  alt={user?.name}
                />
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => alert("Navigate to Profile Page (Placeholder)")}
            >
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => alert("Navigate to Settings Page (Placeholder)")}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => alert("Navigate to Support Page (Placeholder)")}
            >
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              onSelect={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
