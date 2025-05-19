"use client"; // Assuming this directive might be needed

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  // CardFooter, // Not used in the simplified version
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardShell from "@/components/layout/DashboardShell";
// import { useToast } from "@/hooks/use-toast"; // Not used in this simplified version
import { UserCheck, MessageSquareText } from "lucide-react"; // Icons for quick actions
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

// --- Configuration ---
const API_BASE_URL = "http://localhost:5000/api"; // Assuming /api prefix like the service manager

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default function AdminDashboard() {
  const [userData, setUserData] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userError, setUserError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoadingUser(true);
      setUserError(null);
      try {
        const userResponse = await apiClient.get("/auth/me");

        if (
          userResponse.data &&
          userResponse.data.success &&
          userResponse.data.user
        ) {
          setUserData(userResponse.data.user);
        } else {
          throw new Error(
            userResponse.data.message || "Admin data not found in response."
          );
        }
      } catch (err) {
        console.error("Failed to fetch admin user data:", err);
        setUserError(err.message || "Could not load admin information.");
        setUserData({ name: "Admin" }); // Fallback name
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  const userName = userData?.name || "Admin"; // Default to "Admin"

  return (
    <DashboardShell role="admin">
      {/* Header - Welcome Message */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {isLoadingUser ? (
            <Skeleton className="h-9 w-56 inline-block" />
          ) : (
            `Welcome back, ${userName}!`
          )}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isLoadingUser ? (
            <Skeleton className="h-5 w-80 mt-1" />
          ) : userError ? (
            <span className="text-red-500">{userError}</span>
          ) : (
            "Manage UniRoom operations and oversee activities."
          )}
        </p>
      </div>

      {/* Quick Actions Card */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Navigate to important administrative tasks.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button
              asChild
              variant="outline"
              className="w-full justify-start text-left"
            >
              <Link to="/dashboard/admin/user-approvals">
                <UserCheck className="mr-2 h-5 w-5 text-blue-600" />
                User Approvals
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start text-left"
            >
              <Link to="/dashboard/admin/messages">
                <MessageSquareText className="mr-2 h-5 w-5 text-green-600" />
                Residency Messages
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
