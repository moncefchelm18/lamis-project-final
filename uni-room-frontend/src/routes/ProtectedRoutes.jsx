"use client";

import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

/**
 * Protected routes component that handles authentication and authorization
 * @returns {React.ReactElement} Protected routes component
 */
function ProtectedRoutes() {
  const { toast } = useToast();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("ProtectedRoutes: useEffect running");
    const userString = localStorage.getItem("user");
    const token = localStorage.getItem("token"); // Also check token maybe?
    console.log("ProtectedRoutes: User string from localStorage:", userString);
    const user = userString ? JSON.parse(userString) : null;

    // More robust check
    if (user && token && user.role) {
      // Check user.role exists!
      console.log("ProtectedRoutes: Setting authenticated, role:", user.role);
      setIsAuthenticated(true);
      setUserRole(user.role);
    } else {
      console.log(
        "ProtectedRoutes: Setting NOT authenticated (user/token/role missing)"
      );
      setIsAuthenticated(false);
      setUserRole(null); // Explicitly set role to null
    }

    setIsLoading(false);
    console.log("ProtectedRoutes: Loading finished");
  }, []); // Empty dependency array - runs only on mount

  const checkRoleAccess = () => {
    const path = location.pathname;
    // Log BEFORE checking
    console.log(
      `ProtectedRoutes: checkRoleAccess for path "${path}" with current state role: "${userRole}"`
    );

    // Check if role exists before proceeding with checks
    if (!userRole) {
      console.log(
        "ProtectedRoutes: Role not yet set or invalid, denying access implicitly."
      );
      // Depending on desired behaviour, you might return false or handle differently
      // If loading isn't finished, it shouldn't reach here anyway.
      // If loading is finished and role is still null/undefined, it means auth failed or role is missing.
      return false; // Deny access if role isn't validly set
    }

    // ... rest of the checks ...
    if (path.startsWith("/dashboard/student") && userRole !== "student") {
      console.log(
        "ProtectedRoutes: Denying access to student route for role:",
        userRole
      );
      toast({
        /* ... */
      });
      return false;
    }
    // ... other role checks
    console.log("ProtectedRoutes: Allowing access.");
    return true;
  };

  // Add logs in the return statement logic too
  if (isLoading) {
    console.log("ProtectedRoutes: Rendering Loading...");
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }
  console.log("ProtectedRoutes: Not loading. Authenticated:", isAuthenticated);

  if (!isAuthenticated) {
    console.log("ProtectedRoutes: Not authenticated, redirecting to login.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("ProtectedRoutes: Authenticated. Checking role access...");
  if (!checkRoleAccess()) {
    console.log(
      "ProtectedRoutes: Role access check failed. Redirecting based on role:",
      userRole
    );
    // Redirect logic...
    // Consider what happens if userRole is still null here - maybe redirect to login again?
    if (userRole === "student")
      return <Navigate to="/dashboard/student" replace />;
    if (userRole === "admin") return <Navigate to="/dashboard/admin" replace />;
    if (userRole === "service")
      return <Navigate to="/dashboard/service" replace />;
    // Fallback if role is somehow invalid after being authenticated
    console.log(
      "ProtectedRoutes: Invalid role after auth, redirecting to login."
    );
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("ProtectedRoutes: Role access OK. Rendering Outlet.");

  return <Outlet />;
}

export default ProtectedRoutes;
