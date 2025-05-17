import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns"; // For date formatting (optional)
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardShell from "@/components/layout/DashboardShell"; // Ensure path is correct
import { Building, FileText, User, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast"; // Ensure path is correct
import { Toaster } from "@/components/ui/toaster";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge"; // Import Badge

// --- Configuration ---
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"; // Default fallback

// Helper function to create Axios config with Auth header
const createAxiosConfig = (token) => {
  if (!token) {
    console.error("Authentication token is missing."); // Log error instead of throwing in helper
    return null; // Return null to indicate missing token
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Helper function to format dates or return placeholder
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    // Example format, adjust as needed (e.g., 'PP' for localized date)
    return format(parseISO(dateString), "MMM dd, yyyy");
  } catch (e) {
    console.error("Error parsing date:", dateString, e);
    return "Invalid Date";
  }
};

export default function StudentDashboard() {
  const { toast } = useToast();
  const [userData, setUserData] = useState(null);
  const [residentInfo, setResidentInfo] = useState(null); // Holds the resident record
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // --- Fetching Function ---
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    setUserData(null); // Reset states on fetch
    setResidentInfo(null);
    console.log("Fetching student dashboard data...");

    const token = localStorage.getItem("token");
    if (!token) {
      const errMsg = "Authentication token not found. Please log in.";
      setFetchError(errMsg);
      setIsLoading(false);
      toast({
        title: "Authentication Error",
        description: errMsg,
        variant: "destructive",
      });
      // Optionally redirect to login page here
      // history.push('/login');
      return;
    }

    const config = createAxiosConfig(token); // Now we know token exists here

    try {
      // 1. Fetch User Data
      console.log("Fetching /auth/me");
      const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, config);
      console.log("User Data Response:", userResponse.data);

      if (
        !(
          userResponse.data &&
          userResponse.data.success &&
          userResponse.data.user
        )
      ) {
        throw new Error("User data not found in response.");
      }
      const currentUserData = userResponse.data.user;
      setUserData(currentUserData); // Set user data immediately

      // 2. Fetch Resident Data using the new endpoint (assuming backend is updated)
      try {
        console.log("Fetching /residents/my-record");
        const residentResponse = await axios.get(
          `${API_BASE_URL}/residents/my-record`,
          config
        );
        console.log("Resident Data Response:", residentResponse.data);

        if (
          residentResponse.data &&
          residentResponse.data.success &&
          residentResponse.data.resident
        ) {
          // Ensure _id is mapped to id if needed by components downstream
          const fetchedResident = {
            ...residentResponse.data.resident,
            id: residentResponse.data.resident._id,
          };
          setResidentInfo(fetchedResident);
          console.log("Resident info set:", fetchedResident);
        } else {
          // Handle case where success is true, but resident is null (no record found)
          console.log("No resident record found for this user.");
          setResidentInfo(null); // Explicitly null if no record
        }
      } catch (residentErr) {
        // Don't treat failure to get resident info as a fatal dashboard error
        console.warn(
          "Could not fetch resident details:",
          residentErr.response?.data || residentErr.message
        );
        setResidentInfo(null);
        // Optional: Show a non-critical toast if needed
        // toast({ title: "Housing Info", description: "Could not load accommodation details.", variant: "default" });
      }
    } catch (err) {
      // Handle errors primarily from fetching user data (more critical)
      console.error("Failed to fetch dashboard data:", err);
      let message = "Could not load your dashboard data.";
      if (err.response) {
        message =
          err.response.data?.message || `Server error: ${err.response.status}`;
        if (err.response.status === 401)
          message = "Unauthorized. Please log in again.";
      } else if (err.request) {
        message = "No response from server.";
      } else {
        message = err.message;
      } // Handle non-Axios errors

      setFetchError(message);
      setUserData(null); // Clear potentially partial data
      setResidentInfo(null);
      toast({
        title: "Loading Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]); // Add toast as dependency

  // --- Initial Fetch ---
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]); // Correct dependency array

  // --- Render Loading State ---
  const renderLoadingState = () => (
    <DashboardShell role="student">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Student Dashboard</h1>
      </div>
      <div className="mt-2 mb-6">
        <Skeleton className="h-5 w-3/4" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {/* Skeleton for Accommodation Card */}
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-2/5 mb-1" />
            <Skeleton className="h-4 w-1/3" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
        {/* Skeleton for Profile Card */}
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-1/4 mb-2" />
            <Skeleton className="h-4 w-1/6" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-3/5 mb-1" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
        {/* Skeleton for Help Card */}
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      </div>
      {/* Skeleton for Notifications */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );

  // --- Render Error State ---
  const renderErrorState = () => (
    <DashboardShell role="student">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-destructive">
          Error
        </h1>
      </div>
      <div className="mt-6">
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader className="flex flex-row items-center space-x-3 space-y-0 pb-2">
            <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
            <CardTitle className="text-destructive">
              Could not load dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive/90">
              {fetchError || "An unknown error occurred."}
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={fetchDashboardData}
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );

  // --- Check Loading/Error ---
  if (isLoading) return renderLoadingState();
  // Handle critical case where user data fetch failed
  if (!isLoading && fetchError && !userData) return renderErrorState();
  // Handle unexpected case where user fetch succeeded but data is missing
  if (!isLoading && !userData)
    return (
      <div>
        Error: User data could not be loaded. Please try logging in again.
      </div>
    );

  // --- Render Main Content (Data is available) ---
  return (
    <DashboardShell role="student">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Student Dashboard</h1>
      </div>
      <div className="mt-2">
        <p className="text-muted-foreground">
          Welcome back, {userData?.name || "Student"}. Manage your housing
          information and requests.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {/* Accommodation Info Card (Uses residentInfo) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              My Accommodation
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {residentInfo ? (
              <>
                <div className="text-2xl font-bold">
                  Room {residentInfo.roomNumber || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Status:{" "}
                  <Badge
                    variant={
                      residentInfo.status === "active" ? "success" : "secondary"
                    }
                  >
                    {residentInfo.status}
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Resident Since:{" "}
                  {residentInfo.enrollmentDate
                    ? formatDate(residentInfo.enrollmentDate)
                    : "N/A"}
                </p>
              </>
            ) : (
              <>
                {/* Case where API returned success but resident: null */}
                <div className="text-md font-medium text-muted-foreground">
                  No Record Found
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Your housing assignment details are not currently available.
                </p>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/dashboard/student/room">View Housing</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Profile Card (Uses User Data) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Profile</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{userData.name}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {userData.email}
            </p>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              Role: {userData.role}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/dashboard/student/profile">Update Profile</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Contact Card (Static/Placeholder) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Help?</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Contact support or administration for any housing inquiries or
              issues.
            </p>
          </CardContent>
          <CardFooter>
            {/* You could make this link to a contact page or trigger a modal */}
            <Button variant="outline" size="sm" className="w-full">
              <Link to="/dashboard/student/contact">Contact Support</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Notifications (Static Placeholder - Needs API endpoint) */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications (Placeholder)</CardTitle>
            <CardDescription>
              Stay updated with the latest important information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Example Static Notification Item */}
              <div className="flex items-start gap-4 p-3 border rounded-md bg-muted/50">
                <div className="rounded-full bg-rose-100 p-2 flex-shrink-0">
                  <Building className="h-4 w-4 text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Room Maintenance Notice</p>
                  <p className="text-sm text-muted-foreground">
                    Scheduled maintenance in your building on May 15, 2025.
                    Access may be limited between 9 AM and 1 PM.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    2 days ago
                  </p>
                </div>
              </div>
              {/* Another Example */}
              <div className="flex items-start gap-4 p-3 border rounded-md bg-muted/50">
                <div className="rounded-full bg-green-100 p-2 flex-shrink-0">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Payment Processed</p>
                  <p className="text-sm text-muted-foreground">
                    Your monthly housing payment has been successfully
                    processed.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    1 week ago
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-center text-muted-foreground italic">
              Real notifications require a backend system.
            </p>
          </CardContent>
        </Card>
      </div>

      <Toaster />
    </DashboardShell>
  );
}
