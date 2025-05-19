import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import DashboardShell from "@/components/layout/DashboardShell";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Hourglass,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Home,
  Banknote,
  SearchCode,
  Printer,
  // Edit2, // Removed Edit2 icon
  Trash2,
  Info,
} from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import jsPDF from "jspdf";
import axios from "axios";

// --- Axios API Client Setup ---
const API_BASE_URL = "http://localhost:5000/api";

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
// --- End Axios API Client Setup ---

const formatDate = (dateString, options) => {
  if (!dateString) return "N/A";
  try {
    const defaultOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(
      undefined,
      options || defaultOptions
    );
  } catch (e) {
    console.error("Error parsing date:", dateString, e);
    return "Invalid Date";
  }
};

export default function StudentRoomRequest() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [currentRequest, setCurrentRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        if (!parsedUser || parsedUser.role !== "student") {
          toast({
            title: "Access Denied",
            description:
              "You must be logged in as a student to view this page.",
            variant: "destructive",
          });
          navigate("/login");
        }
      } else {
        toast({
          title: "Authentication Error",
          description: "Please log in to view your requests.",
          variant: "destructive",
        });
        navigate("/login");
      }
    } catch (e) {
      console.error("Failed to parse user data from localStorage", e);
      toast({
        title: "Application Error",
        description: "Could not load user session.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [navigate, toast]);

  const fetchRequest = useCallback(async () => {
    if (!userData || userData.role !== "student") {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(
        "/booking-requests/student/my-request"
      );
      if (response.data.success) {
        setCurrentRequest(response.data.data);
        console.log("Current Request:", response.data.data);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch request status."
        );
      }
    } catch (err) {
      console.error("Fetch request error:", err);
      let friendlyMessage =
        "Could not load your room request. Please try again later.";
      if (err.response?.status === 401 || err.response?.status === 403) {
        friendlyMessage = "Authentication error. Please log in again.";
      } else if (err.response?.data?.message) {
        friendlyMessage = err.response.data.message;
      } else if (err.message) {
        friendlyMessage = err.message;
      }
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    if (userData && userData.role === "student") {
      fetchRequest();
    }
  }, [userData, fetchRequest]);

  const handleCancelRequest = async (requestId) => {
    if (!requestId) return;
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this room request?"
    );
    if (!confirmCancel) return;

    setIsCancelling(true);
    try {
      const response = await apiClient.delete(
        `/booking-requests/student/my-request/${requestId}`
      );
      if (response.data.success) {
        toast({
          title: "Request Cancelled",
          description: "Your room request has been successfully cancelled.",
        });
        setCurrentRequest(null);
      } else {
        throw new Error(response.data.message || "Could not cancel request.");
      }
    } catch (err) {
      console.error("Cancel request error:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Could not cancel the request.";
      toast({
        title: "Cancellation Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // REMOVED handleEditRequest function

  const generatePaymentReceipt = (request) => {
    if (!request || !userData) {
      toast({
        title: "Error",
        description: "Missing request or user data for receipt.",
        variant: "destructive",
      });
      return;
    }
    const paymentDate = request.confirmationDate || request.updatedAt;

    setIsPrinting(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(
        "University Housing Payment Receipt",
        doc.internal.pageSize.getWidth() / 2,
        20,
        { align: "center" }
      );

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Date Issued: ${formatDate(new Date().toISOString(), {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        20,
        30
      );
      doc.text(
        `Receipt ID: PAY-${request.id.slice(-6)}`,
        doc.internal.pageSize.getWidth() - 20,
        30,
        { align: "right" }
      );

      doc.setLineWidth(0.5);
      doc.line(20, 35, doc.internal.pageSize.getWidth() - 20, 35);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Student Information:", 20, 45);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Name: ${userData.name || "N/A"}`, 25, 52);
      doc.text(`Role: ${userData.role || "Student"}`, 25, 59);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Accommodation Details:", 20, 70);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Residency: ${request.residencyTitle || "N/A"}`, 25, 77);
      doc.text(`Room Number: ${request.roomNumber || "N/A"}`, 25, 84);

      let yPos = 84 + 13;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Payment Details:", 20, yPos);
      yPos += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Payment Confirmed On: ${formatDate(paymentDate)}`, 25, yPos);
      yPos += 7;
      doc.text("Payment Method: Assumed via University Office", 25, yPos);
      yPos += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Amount Paid: 300.00 DZD", 25, yPos);
      yPos += 7;
      doc.setFont("helvetica", "normal");
      doc.text("(Three Hundred Algerian Dinars)", 25, yPos);
      yPos += 7;
      doc.text("Purpose: University Housing Fee (Academic Year)", 25, yPos);

      doc.setLineWidth(0.5);
      doc.line(
        20,
        doc.internal.pageSize.getHeight() - 40,
        doc.internal.pageSize.getWidth() - 20,
        doc.internal.pageSize.getHeight() - 40
      );
      doc.setFontSize(10);
      doc.text(
        "University Administration Stamp & Signature:",
        20,
        doc.internal.pageSize.getHeight() - 30
      );
      doc.text(
        "This receipt confirms payment. Please keep for your records.",
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 15,
        { align: "center" }
      );

      doc.output("dataurlnewwindow");
      toast({
        title: "Receipt Generated",
        description: "Your payment receipt is ready.",
      });
    } catch (e) {
      console.error("Error generating PDF:", e);
      toast({
        title: "PDF Error",
        description: "Could not generate the receipt.",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const renderRequestDetails = () => {
    if (!currentRequest) return null;

    const { id, residencyTitle, roomNumber, status, applicationDate, notes } =
      currentRequest;

    let statusIcon = <FileText className="mr-2 h-6 w-6 text-primary" />;
    let badgeVariant = "secondary";
    let alertIcon = <Info className="h-4 w-4" />;
    let alertClasses = "";

    if (status === "Confirmed & Paid" || status === "paid") {
      statusIcon = <CheckCircle className="mr-2 h-6 w-6 text-green-600" />;
      badgeVariant = "success";
      alertIcon = (
        <CheckCircle className="h-4 w-4 !text-green-700 dark:!text-green-400" />
      );
      alertClasses =
        "border-green-500 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700";
    } else if (status === "Pending Review" || status === "pending") {
      statusIcon = <Hourglass className="mr-2 h-6 w-6 text-yellow-500" />;
      badgeVariant = "warning";
      alertIcon = (
        <Hourglass className="h-4 w-4 !text-yellow-700 dark:!text-yellow-400" />
      );
      alertClasses =
        "border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700";
    } else if (
      status === "Approved - Awaiting Payment" ||
      status === "approved"
    ) {
      statusIcon = <CheckCircle className="mr-2 h-6 w-6 text-blue-500" />;
      badgeVariant = "default";
      alertIcon = (
        <Info className="h-4 w-4 !text-blue-700 dark:!text-blue-400" />
      );
      alertClasses =
        "border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";
    } else if (status === "Rejected" || status === "rejected") {
      statusIcon = <XCircle className="mr-2 h-6 w-6 text-destructive" />;
      badgeVariant = "destructive";
      alertIcon = <XCircle className="h-4 w-4" />;
    } else if (status === "Cancelled" || status === "cancelled") {
      statusIcon = <Trash2 className="mr-2 h-6 w-6 text-muted-foreground" />;
      badgeVariant = "outline";
      alertIcon = <Info className="h-4 w-4" />;
    }

    return (
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-2xl font-semibold">
            {statusIcon}
            Room Booking Request
          </CardTitle>
          <CardDescription className="text-sm flex items-center gap-2 pt-1">
            Request ID:{" "}
            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
              {id}
            </span>
            - Status:{" "}
            <Badge variant={badgeVariant} className="text-sm px-2.5 py-1">
              {status}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-2 pb-6 text-base">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">
                Residency:
              </p>
              <p className="text-gray-900 dark:text-gray-100">
                {residencyTitle || "N/A"}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">
                Requested Room Number:
              </p>
              <p className="text-gray-900 dark:text-gray-100">
                {roomNumber || "N/A"}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">
                Application Date:
              </p>
              <p className="text-gray-900 dark:text-gray-100">
                {formatDate(applicationDate)}
              </p>
            </div>
            {status === "rejected" &&
              currentRequest.rejectionReason && ( // Assuming rejectionReason might come from backend
                <div className="md:col-span-2">
                  <p className="font-medium text-destructive">
                    Reason for Rejection:
                  </p>
                  <p className="text-destructive-foreground">
                    {currentRequest.rejectionReason}
                  </p>
                </div>
              )}
          </div>

          {notes && (
            <Alert className={`mt-6 ${alertClasses}`}>
              {React.cloneElement(alertIcon, {
                className: `h-5 w-5 ${alertIcon.props.className || ""}`,
              })}
              <AlertTitle className="font-semibold text-lg">
                {status === "rejected"
                  ? "Rejection Notice"
                  : "Important Information"}
              </AlertTitle>
              <AlertDescription className="whitespace-pre-wrap text-base pt-1">
                {notes}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-5 border-t bg-slate-50 dark:bg-slate-800/30 p-5 rounded-b-lg">
          {(status === "pending" || status === "Pending Review") && (
            <Button
              variant="destructive"
              size="lg"
              onClick={() => handleCancelRequest(id)}
              disabled={isCancelling}
              className="w-full sm:w-auto"
            >
              <Trash2 className="mr-2 h-5 w-5" />
              {isCancelling ? "Cancelling..." : "Cancel Request"}
            </Button>
          )}
          {(status === "approved" ||
            status === "Approved - Awaiting Payment") && (
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-white"
              // Potentially link to a page with payment instructions or disable if no action
              // onClick={() => alert("Please proceed to the administration office for payment details.")}
            >
              <Info className="mr-2 h-5 w-5" /> Awaiting Payment (Contact Admin)
            </Button>
          )}
          {(status === "paid" || status === "Confirmed & Paid") && (
            <Button
              variant="default"
              size="lg"
              onClick={() => generatePaymentReceipt(currentRequest)}
              disabled={isPrinting}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
            >
              <Printer className="mr-2 h-5 w-5" />
              {isPrinting ? "Generating..." : "Print Payment Receipt"}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <DashboardShell role="student">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            My Room Request
          </h1>
          <p className="text-lg text-muted-foreground mt-1">
            View and manage your current housing application status.
          </p>
        </div>
      </div>
      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-16 w-3/4 mb-4 rounded-md" />
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      )}
      {!isLoading && !currentRequest && !error && (
        <Card className="text-center py-16 shadow-md">
          <CardHeader className="items-center">
            <div className="mx-auto bg-primary/10 text-primary rounded-full p-4 w-fit mb-6">
              <SearchCode className="h-12 w-12" />
            </div>
            <CardTitle className="text-2xl font-semibold">
              No Active Room Request
            </CardTitle>
            <CardDescription className="text-md text-muted-foreground mt-2">
              You currently do not have an active housing application.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-2">
            <p className="text-md text-muted-foreground mb-6">
              Ready to find your university accommodation?
            </p>
            <Button
              asChild
              size="lg"
              className="bg-rose-500 hover:bg-rose-600 text-lg px-8 py-6 text-white"
            >
              <Link to="/dashboard/student/residencies">
                <Home className="mr-2.5 h-5 w-5" /> Explore Residencies
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
      {!isLoading && error && (
        <Alert variant="destructive" className="text-lg p-6">
          <AlertTriangle className="h-6 w-6" />
          <AlertTitle className="font-semibold text-xl">
            Error Loading Request
          </AlertTitle>
          <AlertDescription className="mt-1">{error}</AlertDescription>
        </Alert>
      )}
      {!isLoading && currentRequest && renderRequestDetails()}
      <Toaster />
    </DashboardShell>
  );
}
