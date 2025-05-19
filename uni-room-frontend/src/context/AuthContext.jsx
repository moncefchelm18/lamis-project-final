import React, { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true); // To manage initial auth check
  const navigate = useNavigate();

  // Function to set user and token (e.g., after login/signup)
  const login = (userData, userToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
    setUser(userData);
    setToken(userToken);
    // Redirect based on role after successful login
    if (userData.role === "student") navigate("/dashboard/student");
    else if (userData.role === "admin") navigate("/dashboard/admin");
    else if (userData.role === "service") navigate("/dashboard/service");
    else navigate("/dashboard"); // Fallback
  };

  // Function to clear user and token (e.g., after logout)
  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    navigate("/login"); // Redirect to login page
  }, [navigate]);

  // Check for existing user and token on initial app load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken && storedToken !== "null") {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.role && parsedUser.status === "approved") {
          // Check for status
          setUser(parsedUser);
          setToken(storedToken);
        } else {
          // Invalid user data or not approved, clear storage
          logout();
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        logout(); // Clear storage if parsing fails
      }
    }
    setIsLoading(false);
  }, [logout]); // Added logout to dependency array

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token && user.status === "approved", // More precise auth check
    isLoadingAuth: isLoading, // Renamed to avoid conflict if page also has isLoading
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
