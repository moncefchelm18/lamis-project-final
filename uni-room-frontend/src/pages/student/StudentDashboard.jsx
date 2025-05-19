import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";
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
import {
  Building,
  FileText,
  User,
  AlertCircle,
  MapPin,
  Eye,
  BarChart3,
  Calendar,
  Bell,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

// --- Placeholder Image Imports ---
import r1 from "@/assets/images/residencies/r1.png";
import r2 from "@/assets/images/residencies/r2.png";
import r3 from "@/assets/images/residencies/r3.png";

const placeholderImages = [r1, r2, r3];
const getRandomPlaceholderImage = (id) => {
  if (!id) return placeholderImages[0];
  let hash = 0;
  for (let i = 0; i < String(id).length; i++) {
    const char = String(id).charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return placeholderImages[Math.abs(hash) % placeholderImages.length];
};

// --- Configuration ---
const API_BASE_URL_FROM_ENV =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// --- API Client Setup ---
const apiClient = axios.create({
  baseURL: `${API_BASE_URL_FROM_ENV}/api`, // Assuming /api is part of the base for most calls
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
// --- End API Client Setup ---

const createAxiosConfig = (token) => {
  // This might be redundant if apiClient is used everywhere
  if (!token) {
    console.warn("Authentication token is missing for creating Axios config.");
    return {};
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const formatDate = (dateString, formatStr = "MMM dd, yyyy") => {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), formatStr);
  } catch (e) {
    console.error("Error parsing date:", dateString, e);
    return "Invalid Date";
  }
};

// Helper to determine badge variant based on status
const getStatusBadgeVariant = (status) => {
  const s = status?.toLowerCase();
  if (s === "paid" || s === "approved" || s === "active" || s === "confirmed")
    return "success";
  if (s === "pending" || s === "submitted") return "default";
  if (s === "rejected" || s === "cancelled") return "destructive";
  return "secondary"; // Default fallback
};

// Animation variants for staggered card appearance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

// Notification bell animation
const bellVariants = {
  idle: { rotate: 0 },
  ring: {
    rotate: [0, 15, -15, 10, -10, 5, -5, 0],
    transition: { duration: 0.5 },
  },
};

export default function StudentDashboard() {
  const { toast } = useToast();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [featuredAccommodations, setFeaturedAccommodations] = useState([]);
  const [isLoadingAccommodations, setIsLoadingAccommodations] = useState(true);
  const [fetchAccommodationsError, setFetchAccommodationsError] =
    useState(null);

  // --- State for "My Accommodation" card data ---
  const [currentRequest, setCurrentRequest] = useState(null);
  const [isLoadingRequest, setIsLoadingRequest] = useState(true);
  const [requestError, setRequestError] = useState(null);

  // State for notifications animation
  const [bellAnimating, setBellAnimating] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true); // This controls overall dashboard loading
    setFetchError(null);
    setUserData(null);
    // setResidentInfo(null); // If you are fully replacing its use for the card

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
      return;
    }
    // apiClient will use the interceptor for the token
    try {
      const userResponse = await apiClient.get("/auth/me"); // Uses apiClient
      if (
        !(
          userResponse.data &&
          userResponse.data.success &&
          userResponse.data.user
        )
      ) {
        throw new Error("User data not found in response.");
      }
      setUserData(userResponse.data.user);
      // }
    } catch (err) {
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
      }
      setFetchError(message);
      setUserData(null);
      toast({
        title: "Loading Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Overall dashboard loading finished
    }
  }, [toast]);

  // --- Fetching Function for "My Accommodation" data ---
  const fetchMyAccommodationRequest = useCallback(async () => {
    if (!userData || userData.role !== "student") {
      // Don't set loading to true if userData is not yet available or not a student
      // Let the card show its own loading or default state until userData is ready
      if (userData && userData.role !== "student") {
        setIsLoadingRequest(false); // Not a student, so no request to load
        setCurrentRequest(null);
      }
      return;
    }

    setIsLoadingRequest(true);
    setRequestError(null);
    try {
      // Uses the global apiClient which has the token interceptor
      const response = await apiClient.get(
        "/booking-requests/student/my-request"
      );
      if (response.data.success && response.data.data) {
        setCurrentRequest(response.data.data);
        console.log("Current Accommodation Request:", response.data.data);
      } else if (response.data.success && !response.data.data) {
        // Success but no data means no active request
        setCurrentRequest(null);
        console.log("No active accommodation request found.");
      } else {
        throw new Error(
          response.data.message ||
            "Failed to fetch accommodation request status."
        );
      }
    } catch (err) {
      console.error("Fetch accommodation request error:", err);
      let friendlyMessage =
        "Could not load your accommodation details. Please try again later.";
      if (err.response?.status === 401 || err.response?.status === 403) {
        friendlyMessage = "Authentication error. Please log in again.";
      } else if (err.response?.data?.message) {
        friendlyMessage = err.response.data.message;
      } else if (err.message) {
        friendlyMessage = err.message;
      }
      setRequestError(friendlyMessage);
      setCurrentRequest(null); // Clear data on error
      // Optional: Toast for this specific error
      // toast({ title: "Accommodation Info Error", description: friendlyMessage, variant: "destructive" });
    } finally {
      setIsLoadingRequest(false);
    }
  }, [userData, toast]); // apiClient is stable, toast for notifications

  const fetchFeaturedAccommodations = useCallback(async () => {
    // ... (your existing fetchFeaturedAccommodations function - uses apiClient or axios with createAxiosConfig)
    // Make sure it uses `apiClient` or correctly sets up token if using raw axios
    setIsLoadingAccommodations(true);
    setFetchAccommodationsError(null);

    try {
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("limit", "3");

      const response = await apiClient.get(
        // Using apiClient here
        `/residencies/student?${params.toString()}`
      );

      if (response.data && response.data.success) {
        setFeaturedAccommodations(response.data.data || []);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch featured accommodations"
        );
      }
    } catch (err) {
      console.error("API Error fetchFeaturedAccommodations:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Could not load featured residencies.";
      setFetchAccommodationsError(errorMessage);
      setFeaturedAccommodations([]);
    } finally {
      setIsLoadingAccommodations(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData(); // Fetches userData first
    fetchFeaturedAccommodations();

    // Animate bell notification every 30 seconds
    const bellInterval = setInterval(() => {
      setBellAnimating(true);
      setTimeout(() => setBellAnimating(false), 1000);
    }, 30000);

    // Initial bell animation after 2 seconds
    const initialBellTimeout = setTimeout(() => {
      setBellAnimating(true);
      setTimeout(() => setBellAnimating(false), 1000);
    }, 2000);

    return () => {
      clearInterval(bellInterval);
      clearTimeout(initialBellTimeout);
    };
  }, [fetchDashboardData, fetchFeaturedAccommodations]); // Initial fetches

  // Fetch accommodation request once userData is available
  useEffect(() => {
    if (userData) {
      fetchMyAccommodationRequest();
    }
  }, [userData, fetchMyAccommodationRequest]);

  const renderLoadingState = () => (
    <DashboardShell role="student">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Student Dashboard</h1>
      </div>
      <div className="mt-2 mb-6">
        <Skeleton className="h-5 w-3/4" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {/* Skeleton for My Accommodation Card */}
        <Card className="backdrop-blur-sm bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-70 shadow-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-3/4 mb-2" /> {/* Title */}
            <Skeleton className="h-4 w-1/2" /> {/* Icon or Sub-description */}
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-2/5 mb-1" /> {/* Room number */}
            <Skeleton className="h-4 w-1/3 mb-1" /> {/* Status */}
            <Skeleton className="h-4 w-1/2" /> {/* Date */}
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
        {/* Skeleton for Profile Card */}
        <Card className="backdrop-blur-sm bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-70 shadow-lg border border-gray-200 dark:border-gray-700">
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
        <Card className="backdrop-blur-sm bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-70 shadow-lg border border-gray-200 dark:border-gray-700">
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
      {/* Skeleton for Featured Residencies Section during main load */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card
              key={`feat-skel-main-${i}`}
              className="backdrop-blur-sm bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-70 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <Skeleton className="aspect-[16/9] w-full rounded-t-lg" />
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="flex-grow">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
              </CardContent>
              <CardFooter className="pt-2">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  );

  const renderErrorState = () => (
    /* ... your existing main error state ... */
    <DashboardShell role="student">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-destructive">
          Error
        </h1>
      </div>
      <div className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 border-destructive/50 bg-destructive/10 shadow-lg">
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
                onClick={() => {
                  fetchDashboardData();
                  fetchFeaturedAccommodations();
                  if (userData) fetchMyAccommodationRequest();
                }}
                className="mt-4 hover:bg-destructive/80"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardShell>
  );

  if (isLoading && !userData) return renderLoadingState(); // Show main loading skeleton if user data isn't even there yet
  if (!isLoading && fetchError && !userData) return renderErrorState();
  if (!isLoading && !userData)
    return (
      <DashboardShell role="student">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-6 bg-destructive/10 rounded-lg border-2 border-destructive/50"
        >
          Error: User data could not be loaded. Please try logging in again.
          <Button
            onClick={() => {
              fetchDashboardData();
              fetchFeaturedAccommodations();
            }}
            className="mt-4 bg-red-600 hover:bg-red-700"
          >
            Retry
          </Button>
        </motion.div>
      </DashboardShell>
    );

  return (
    <DashboardShell role="student">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6 rounded-lg shadow-lg mb-6"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Student Dashboard
          </h1>
          <p className="text-white/90 mt-1">
            Welcome back, {userData?.name || "Student"}! Manage your housing
            information and requests.
          </p>
        </div>
        <motion.div
          animate={bellAnimating ? "ring" : "idle"}
          variants={bellVariants}
          className="relative"
        >
          <Bell className="h-6 w-6 text-white" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
        </motion.div>
      </motion.div>

      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* --- Updated My Accommodation Info Card --- */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 h-full bg-gradient-to-br from-white to-red-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-red-100 to-red-50 dark:from-red-900/20 dark:to-red-800/20">
              <CardTitle className="text-sm font-medium flex items-center">
                {/* <Building className="h-4 w-4 mr-2 text-red-600 dark:text-red-400" /> */}
                My Accommodation
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Building className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoadingRequest ? (
                <>
                  <Skeleton className="h-7 w-2/5 mb-2" /> {/* Room number */}
                  <Skeleton className="h-4 w-1/3 mb-1" /> {/* Status */}
                  <Skeleton className="h-4 w-1/2" /> {/* Date/Title */}
                </>
              ) : requestError ? (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  <p>{requestError}</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={fetchMyAccommodationRequest}
                    className="p-0 h-auto mt-1 text-destructive hover:text-destructive/80"
                  >
                    Try again
                  </Button>
                </div>
              ) : currentRequest ? (
                <>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {currentRequest.residencyTitle || "N/A Residence"}
                  </div>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="text-sm font-medium">
                      Room: {currentRequest.roomNumber || "N/A"}
                    </span>
                    <div className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    <span className="text-sm">Status: </span>
                    <Badge
                      variant={getStatusBadgeVariant(currentRequest.status)}
                      className="transform hover:scale-105 transition-transform"
                    >
                      {currentRequest.status || "N/A"}
                    </Badge>
                  </div>

                  <div className="flex items-center text-xs text-muted-foreground mt-3">
                    <Calendar className="h-3 w-3 mr-1" />
                    {currentRequest.status?.toLowerCase() === "paid" ||
                    currentRequest.status?.toLowerCase() === "approved" ||
                    currentRequest.status?.toLowerCase() === "active"
                      ? "Effective Since: "
                      : "Application Date: "}
                    {formatDate(currentRequest.applicationDate)}
                  </div>
                  {currentRequest.notes && (
                    <div className="mt-3 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                      <div className="flex items-start">
                        <Info className="h-3 w-3 mr-1 mt-0.5 text-pink-500" />
                        <p className="text-xs text-muted-foreground">
                          {currentRequest.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-md font-medium text-red-600 dark:text-red-400">
                    No Active Accommodation
                  </div>
                  <div className="flex items-center mt-2">
                    <Info className="h-4 w-4 mr-1 text-pink-500" />
                    <p className="text-xs text-muted-foreground">
                      You do not have an active accommodation record or request.
                    </p>
                  </div>
                  <Button
                    variant="link"
                    asChild
                    size="sm"
                    className="mt-3 p-0 h-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-semibold"
                  >
                    <Link
                      to="/dashboard/student/residencies"
                      className="flex items-center"
                    >
                      <MapPin className="mr-1 h-3.5 w-3.5" />
                      Browse Residencies
                    </Link>
                  </Button>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-colors"
                asChild
              >
                <Link
                  to="/dashboard/student/request"
                  className="flex items-center justify-center"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Profile Card (Uses User Data) */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 h-full bg-gradient-to-br from-white to-rose-50 dark:from-gray-900 dark:to-rose-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-rose-100 to-rose-50 dark:from-rose-900/20 dark:to-rose-800/20">
              <CardTitle className="text-sm font-medium flex items-center">
                My Profile
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <User className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center mb-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg">
                  {userData.name?.charAt(0) || "S"}
                </div>
                <div className="ml-3">
                  <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {userData.name}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {userData.email}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Role:</span>
                  <Badge
                    variant="outline"
                    className="capitalize bg-rose-100 text-rose-700 dark:bg-purple-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                  >
                    {userData.role}
                  </Badge>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">Status:</span>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
                  >
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-900/30 dark:hover:text-rose-300 transition-colors"
                asChild
              >
                <Link
                  to="/dashboard/student/profile"
                  className="flex items-center justify-center"
                >
                  <User className="mr-2 h-4 w-4" />
                  Update Profile
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Help Card */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 h-full bg-gradient-to-br from-white to-pink-50 dark:from-gray-900 dark:to-pink-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-pink-100 to-pink-50 dark:from-pink-900/20 dark:to-pink-800/20">
              <CardTitle className="text-sm font-medium flex items-center">
                Need Help?
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                <FileText className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center mb-3">
                <AlertCircle className="h-10 w-10 text-pink-500 mr-3" />
                <div>
                  <h3 className="font-medium text-pink-700 dark:text-pink-300">
                    Need Assistance?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    We're here to help with any questions or concerns.
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                <div className="flex items-start mb-2">
                  <MapPin className="h-4 w-4 mr-2 text-pink-500 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Housing and accommodation inquiries
                  </p>
                </div>
                <div className="flex items-start mb-2">
                  <BarChart3 className="h-4 w-4 mr-2 text-pink-500 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Billing and payment questions
                  </p>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 mr-2 text-pink-500 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Move-in dates and scheduling
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full hover:bg-pink-50 hover:text-pink-700 dark:hover:bg-pink-900/30 dark:hover:text-pink-300 transition-colors"
                asChild
              >
                <Link
                  to="/dashboard/student/residencies"
                  className="flex items-center justify-center"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Contact Support
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>

      {/* Featured Residencies Section */}
      <section className="mt-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-between items-center mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
            <Building className="mr-2 h-6 w-6 text-red-600 dark:text-red-400" />
            Featured Residencies
          </h2>
          <Button
            variant="link"
            asChild
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-semibold"
          >
            <Link
              to="/dashboard/student/residencies"
              className="flex items-center"
            >
              See More <Eye className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        {isLoadingAccommodations && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div key={`skel-feat-${i}`} variants={itemVariants}>
                <Card className="overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                  <Skeleton className="aspect-[16/9] w-full" />
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6 mb-2" />
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isLoadingAccommodations && fetchAccommodationsError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-center"
          >
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
            <p className="text-destructive font-medium mb-4">
              {fetchAccommodationsError}
            </p>
            <Button
              onClick={fetchFeaturedAccommodations}
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              Try Again
            </Button>
          </motion.div>
        )}

        {!isLoadingAccommodations &&
          !fetchAccommodationsError &&
          featuredAccommodations.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-8 text-center"
            >
              <Building className="h-16 w-16 text-red-400 mx-auto mb-4 opacity-70" />
              <p className="text-red-600 dark:text-red-300 text-lg font-medium mb-2">
                No Featured Residencies
              </p>
              <p className="text-red-500/80 dark:text-red-400/80 text-sm max-w-md mx-auto">
                No featured residencies are available at the moment. Please
                check back later or browse all residencies.
              </p>
              <Button
                className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                asChild
              >
                <Link to="/dashboard/student/residencies">
                  Browse All Residencies
                </Link>
              </Button>
            </motion.div>
          )}

        {!isLoadingAccommodations &&
          !fetchAccommodationsError &&
          featuredAccommodations.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {featuredAccommodations.map((acc) => (
                <motion.div key={acc.id || acc._id} variants={itemVariants}>
                  <Card className="overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-white dark:bg-gray-800">
                    <div className="aspect-[16/9] bg-red-50 dark:bg-red-900/20 overflow-hidden relative group">
                      <img
                        src={
                          acc.images && acc.images.length > 0
                            ? acc.images[0]
                            : getRandomPlaceholderImage(acc.id || acc._id)
                        }
                        alt={acc.title || "Residence"}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = getRandomPlaceholderImage(
                            acc.id || acc._id
                          );
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-red-600 hover:bg-red-700">
                          Featured
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle
                        className="text-lg truncate text-red-700 dark:text-red-300"
                        title={acc.title || "Unnamed Residence"}
                      >
                        {acc.title || "Unnamed Residence"}
                      </CardTitle>
                      <CardDescription className="flex items-center text-sm">
                        <MapPin className="mr-1 h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                        {acc.wilaya || "N/A Location"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground flex-grow">
                      <p className="line-clamp-3">
                        {acc.description ||
                          "No description available for this residence. Please check the details page for more information."}
                      </p>
                      <div className="flex items-center justify-between mt-4 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                        <span className="text-xs flex items-center">
                          <Building className="h-3 w-3 mr-1 text-red-500" />
                          {acc.totalRoomCount || "N/A"} Rooms
                        </span>
                        <span className="text-xs flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-red-500" />
                          Available Now
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button
                        className="w-full bg-red-600 hover:bg-red-700 transition-colors"
                        asChild
                      >
                        <Link
                          to={`/dashboard/student/residencies/${
                            acc.id || acc._id
                          }`}
                        >
                          View Details
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
      </section>
      <Toaster />
    </DashboardShell>
  );
}
