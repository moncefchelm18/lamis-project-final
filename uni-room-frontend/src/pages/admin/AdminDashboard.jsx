import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardShell from "@/components/layout/DashboardShell";
import { useToast } from "@/hooks/use-toast"; // Ensure this path is correct
import {
  Building,
  FileText,
  Users,
  AlertCircle,
  BedDouble,
} from "lucide-react";
import { Link } from "react-router-dom";
import RecentActivities from "@/pages/admin/RecentActivities"; // <-- 1. Import the new component
// --- Configuration ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to create Axios config with Auth header
const createAxiosConfig = (token) => {
  if (!token) {
    throw new Error("Authentication token not found.");
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export default function AdminDashboard() {
  const { toast } = useToast();

  // State for dashboard data
  const [residentCount, setResidentCount] = useState(0);
  const [pendingAccommodationCount, setPendingAccommodationCount] = useState(0);
  const [totalAccommodationCount, setTotalAccommodationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setIsLoading(true);
      setError(null);

      if (!API_BASE_URL) {
        setError("API base URL is not configured. Check your .env file.");
        setIsLoading(false);
        toast({
          title: "Configuration Error",
          description: "API base URL is missing.",
          variant: "destructive",
        });
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const config = createAxiosConfig(token); // Get config with token

        // Use Promise.all to fetch data concurrently
        const [
          residentsResponse,
          pendingAccommodationsResponse,
          totalAccommodationsResponse,
        ] = await Promise.all([
          // ***** MODIFICATION HERE *****
          // Add the required 'query' parameter (even if empty) to satisfy backend validation
          // Using limit=1 to just get the total count efficiently from pagination data
          axios.get(`${API_BASE_URL}/residents?limit=1&query=`, config),
          axios.get(
            `${API_BASE_URL}/accommodations?status=pending&limit=1`,
            config
          ),
          axios.get(`${API_BASE_URL}/accommodations?limit=1`, config), // ***** END MODIFICATION *****

          axios.get(
            `${API_BASE_URL}/accommodations?status=pending&limit=1`,
            config
          ),
          axios.get(`${API_BASE_URL}/accommodations?limit=1`, config),
        ]);

        // Process responses and update state
        if (residentsResponse.data?.pagination) {
          setResidentCount(residentsResponse.data.pagination.total || 0);
        } else {
          console.warn(
            "Resident pagination data not found or backend response structure differs:",
            residentsResponse.data
          );
          // Attempt fallback if residents array exists directly (less ideal)
          setResidentCount(
            Array.isArray(residentsResponse.data?.residents)
              ? residentsResponse.data.residents.length
              : 0
          );
        }

        if (pendingAccommodationsResponse.data?.pagination) {
          setPendingAccommodationCount(
            pendingAccommodationsResponse.data.pagination.total || 0
          );
        } else {
          console.warn(
            "Pending accommodation pagination data not found:",
            pendingAccommodationsResponse.data
          );
          setPendingAccommodationCount(
            Array.isArray(pendingAccommodationsResponse.data?.accommodations)
              ? pendingAccommodationsResponse.data.accommodations.length
              : 0
          );
        }

        if (totalAccommodationsResponse.data?.pagination) {
          setTotalAccommodationCount(
            totalAccommodationsResponse.data.pagination.total || 0
          );
        } else {
          console.warn(
            "Total accommodation pagination data not found:",
            totalAccommodationsResponse.data
          );
          setTotalAccommodationCount(
            Array.isArray(totalAccommodationsResponse.data?.accommodations)
              ? totalAccommodationsResponse.data.accommodations.length
              : 0
          );
        }
      } catch (err) {
        console.error("Failed to fetch admin dashboard data:", err);
        let errorMessage = "Could not load dashboard data.";
        let errorTitle = "Error Loading Data";
        toast({
          title: "Stats Error",
          description: errorMessage,
          variant: "destructive",
        });

        // Check specifically for the 400 error on residents if needed
        if (
          err.response?.status === 400 &&
          err.config?.url?.includes("/residents")
        ) {
          errorMessage =
            "Failed to get residents count. " +
            (err.response.data?.errors?.[0]?.msg ||
              "Backend validation requires a search query.");
          errorTitle = "Residents Data Error";
        } // Keep the generic error handling as well
        else if (
          err.message === "Authentication token not found." ||
          err.message === "API base URL is not configured."
        ) {
          errorMessage = err.message;
          errorTitle = "Configuration Error";
        } else if (err.response) {
          const status = err.response.status;
          if (status === 401) {
            /*...*/
          } else if (status === 403) {
            /*...*/
          } else {
            errorMessage =
              err.response.data?.message || `Server error: ${status}`;
          }
        } else if (err.request) {
          /*...*/
        } else {
          /*...*/
        }

        setError(errorMessage);
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  // --- Render Loading State ---
  if (isLoading) {
    /* ... */
  }

  // --- Render Error State ---
  if (error) {
    /* ... */
  }

  // --- Render Dashboard with Data ---
  return (
    // JSX structure remains the same as the previous correct version
    // No changes needed in the return() block itself for this specific error
    <DashboardShell role="admin">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
      </div>
      <div className="mt-2 mb-6">
        <p className="text-muted-foreground">
          Welcome back, Admin. Overview of residents, accommodations, and
          pending tasks.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Residents Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Residents
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{residentCount}</div>
            <p className="text-xs text-muted-foreground">
              {" "}
              Total number of residents in UniRoom{" "}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/dashboard/admin/residents">Manage Residents</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Pending Accommodation Approvals Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {" "}
              Pending Approvals{" "}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingAccommodationCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {" "}
              Accommodations awaiting review{" "}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/dashboard/admin/accommodations?status=pending">
                Review Accommodations
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Total Accommodations Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {" "}
              Total Rooms / Units{" "}
            </CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAccommodationCount}</div>
            <p className="text-xs text-muted-foreground">
              {" "}
              Total number of rooms and units{" "}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/dashboard/admin/accommodations">
                Manage Accommodations
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activities (Static Placeholder) */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest actions (Static Data)</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Static content remains */}
            <div className="space-y-4">{/* ... static items ... */}</div>
            <RecentActivities />
            {/* <p className="mt-4 text-sm text-muted-foreground italic">
              Note: Recent activities display requires a dedicated API endpoint.
            </p> */}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
