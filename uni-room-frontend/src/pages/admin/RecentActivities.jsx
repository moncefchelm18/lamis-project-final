import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns"; // For relative time
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { AlertCircle, BedDouble, FileWarning } from "lucide-react"; // Icons
import { useToast } from "@/hooks/use-toast"; // Ensure path is correct
import { Badge } from "@/components/ui/badge"; // To show status

// --- Configuration ---
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = "http://localhost:5000";
const MAX_ACTIVITIES = 5; // Number of recent items to show

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

const RecentActivities = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecentActivities = async () => {
      setIsLoading(true);
      setError(null);

      if (!API_BASE_URL) {
        setError("API URL not configured.");
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const config = createAxiosConfig(token);

        // Fetch recent pending accommodations (sorted by creation date descending)
        const response = await axios.get(
          `${API_BASE_URL}/accommodations?status=pending&sortBy=createdAt:desc&limit=${MAX_ACTIVITIES}`,
          config
        );

        // Format the data for display
        if (response.data?.accommodations) {
          const formattedActivities = response.data.accommodations.map(
            (acc) => ({
              id: acc._id,
              type: "accommodation_pending",
              title: acc.title || `Accommodation #${acc._id.slice(-4)}`, // Use title or fallback
              status: acc.status,
              timestamp: acc.createdAt, // Use createdAt for submission time
              link: `/dashboard/admin/accommodations?status=pending&highlight=${acc._id}`, // Link to review, maybe highlight
            })
          );
          setActivities(formattedActivities);
        } else {
          setActivities([]); // Handle case where data might be missing
        }
      } catch (err) {
        console.error("Failed to fetch recent activities:", err);
        let errorMessage = "Could not load recent activities.";
        // Add specific error handling if needed (e.g., 401, 403)
        if (err.message === "Authentication token not found.") {
          errorMessage = err.message;
        } else if (err.response) {
          // ... handle specific status codes ...
        }
        setError(errorMessage);
        // Optional: Show toast on error
        // toast({ title: "Error", description: errorMessage, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const renderActivityItem = (activity) => {
    let icon;
    let description;

    switch (activity.type) {
      case "accommodation_pending":
        icon = <BedDouble className="h-4 w-4 text-blue-500" />;
        description = (
          <>
            New Accommodation{" "}
            <span className="font-medium">{activity.title}</span> requires
            approval.
          </>
        );
        break;
      // Add more cases here if you fetch other types of activities later
      default:
        icon = <FileWarning className="h-4 w-4 text-muted-foreground" />;
        description = <span className="italic">Unknown activity type</span>;
    }

    return (
      <li
        key={activity.id}
        className="flex items-start space-x-3 py-2 border-b last:border-b-0"
      >
        <span className="flex-shrink-0 mt-1">{icon}</span>
        <div className="flex-1 text-sm">
          <Link to={activity.link} className="hover:underline">
            {description}
          </Link>
          <div className="text-xs text-muted-foreground mt-1">
            Submitted{" "}
            {formatDistanceToNow(new Date(activity.timestamp), {
              addSuffix: true,
            })}
            <Badge variant="outline" className="ml-2">
              {activity.status}
            </Badge>
          </div>
        </div>
      </li>
    );
  };

  return (
    <div>
      {isLoading && (
        <div className="space-y-4">
          {[...Array(MAX_ACTIVITIES)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 py-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="flex items-center text-destructive p-4 border border-destructive/30 rounded-md bg-destructive/10">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {!isLoading && !error && activities.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No recent pending approvals found.
        </p>
      )}

      {!isLoading && !error && activities.length > 0 && (
        <ul className="space-y-1">{activities.map(renderActivityItem)}</ul>
      )}
    </div>
  );
};

export default RecentActivities;
