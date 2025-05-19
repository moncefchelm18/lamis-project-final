// ProtectedRoutes.jsx
"use client"; // Keep if needed by components, context is client-side

import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext"; // Adjust path if necessary
import { useToast } from "@/hooks/use-toast";

// Simple loader animation (you can replace with a more sophisticated one or Skeleton)
const LoaderBar = () => (
  <div className="w-32 h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden mt-2">
    <div
      className="h-full bg-primary animate-pulse"
      style={{ width: "40%" }}
    ></div>{" "}
    {/* Basic pulse */}
  </div>
);

function ProtectedRoutes() {
  const { toast } = useToast();
  const location = useLocation();
  const { isAuthenticated, user, isLoadingAuth } = useContext(AuthContext);

  const checkRoleAccess = () => {
    const path = location.pathname.toLowerCase(); // Ensure consistent casing for checks
    const userRole = user?.role;

    // If somehow user is null here despite isAuthenticated being true (shouldn't happen with proper context logic)
    if (!userRole) {
      console.warn(
        "ProtectedRoutes: checkRoleAccess called, but user.role is undefined. isAuthenticated:",
        isAuthenticated
      );
      // This might indicate an issue where isAuthenticated is true, but user object is not fully populated.
      // Forcing a redirect to login might be safest here, or an error page.
      return false;
    }

    // Specific path checks
    if (path.startsWith("/dashboard/student") && userRole !== "student") {
      toast({
        title: "Access Denied",
        description: "You are not authorized to view student pages.",
        variant: "destructive",
      });
      return false;
    }
    if (path.startsWith("/dashboard/admin") && userRole !== "admin") {
      toast({
        title: "Access Denied",
        description: "You are not authorized to view admin pages.",
        variant: "destructive",
      });
      return false;
    }
    if (path.startsWith("/dashboard/service") && userRole !== "service") {
      toast({
        title: "Access Denied",
        description: "You are not authorized to view service manager pages.",
        variant: "destructive",
      });
      return false;
    }

    // Check if trying to access the generic /dashboard without a specific role path when they have one
    // This helps redirect users to their specific dashboard landing page if they just type /dashboard
    if (path === "/dashboard" || path === "/dashboard/") {
      if (userRole === "student" && !path.startsWith("/dashboard/student"))
        return "redirect_student";
      if (userRole === "admin" && !path.startsWith("/dashboard/admin"))
        return "redirect_admin";
      if (userRole === "service" && !path.startsWith("/dashboard/service"))
        return "redirect_service";
    }

    return true; // Access allowed
  };

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="flex flex-col items-center space-y-3">
          {/* You can add your logo here if you have it accessible */}
          {/* <img src="/path/to/your/logo.png" alt="Loading UniRoom" className="h-12 w-auto mb-3 animate-pulse" /> */}
          <svg
            className="animate-spin h-8 w-8 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-lg font-medium">Loading UniRoom...</p>
          <LoaderBar />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // User is not authenticated, redirect to login
    // Pass the current location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, now check role-based access
  const roleAccessResult = checkRoleAccess();

  if (roleAccessResult === true) {
    // Role access is granted, render the child route
    return <Outlet />;
  } else {
    // Role access denied or needs redirection
    // Redirect to the user's appropriate default dashboard based on their role
    // This also handles the "redirect_*" cases from checkRoleAccess
    let redirectTo = "/dashboard"; // Fallback, should be more specific
    if (user?.role === "student" || roleAccessResult === "redirect_student") {
      redirectTo = "/dashboard/student";
    } else if (
      user?.role === "admin" ||
      roleAccessResult === "redirect_admin"
    ) {
      redirectTo = "/dashboard/admin";
    } else if (
      user?.role === "service" ||
      roleAccessResult === "redirect_service"
    ) {
      redirectTo = "/dashboard/service";
    } else {
      // If role is somehow unknown or invalid even after authentication, redirect to login
      // This also handles if checkRoleAccess returns false explicitly without a specific redirect signal
      console.warn(
        "ProtectedRoutes: Role access denied and no specific redirect path determined. User role:",
        user?.role,
        "Path:",
        location.pathname
      );
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Only navigate if the current path is not already the target redirect path
    if (location.pathname.toLowerCase() !== redirectTo.toLowerCase()) {
      return <Navigate to={redirectTo} replace />;
    } else {
      // If already at the correct dashboard, but access was denied for a sub-route,
      // rendering Outlet might still be wrong. This scenario needs careful thought
      // based on your route structure. For now, if checkRoleAccess explicitly returned
      // false (not a redirect string), this would be an issue.
      // However, our checkRoleAccess is structured to return true or a redirect string if role is valid.
      // An explicit false means a role mismatch for a specific sub-path.
      // In such a case, redirecting them to their main dashboard is the intended behavior.
      return <Outlet />; // This should ideally not be reached if a redirect happened above
    }
  }
}

export default ProtectedRoutes;
