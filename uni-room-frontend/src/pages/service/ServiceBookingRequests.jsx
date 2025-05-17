"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import DashboardShell from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Search as SearchIcon,
  FilterIcon,
  DollarSign,
  User,
  FileText, // For application details
  GraduationCap, // For academic info
  Briefcase, // For student info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, isValid } from "date-fns"; // Added isValid
import { useDebounce } from "@/hooks/use-debounce";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter, // Added for close button
  DialogClose, // Added for close button
} from "@/components/ui/dialog";

// Helper function to format dates
const formatDate = (dateString, dateFormat = "dd/MM/yyyy HH:mm") => {
  if (!dateString) return "N/A";
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      // Check if date is valid after parsing
      // console.warn("formatDate received an invalid date string:", dateString);
      return "Invalid Date";
    }
    return format(date, dateFormat);
  } catch (error) {
    // console.warn("Error in formatDate for:", dateString, error);
    return "Invalid Date";
  }
};

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

const requestStatuses = ["all", "pending", "approved", "rejected", "paid"];

export default function ServiceBookingRequests() {
  const { toast } = useToast();
  const [allBookingRequests, setAllBookingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("pending");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchBookingRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedStatusFilter && selectedStatusFilter !== "all") {
        params.append("status", selectedStatusFilter);
      }
      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }

      const response = await apiClient.get(
        `/booking-requests?${params.toString()}`
      );
      if (response.data.success) {
        setAllBookingRequests(response.data.data || []);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch booking requests"
        );
      }
    } catch (err) {
      console.error("API Error fetchBookingRequests:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unknown error occurred while fetching requests.";
      setError(errorMessage);
      toast({
        title: "Error Fetching Data",
        description: errorMessage,
        variant: "destructive",
      });
      setAllBookingRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatusFilter, debouncedSearchTerm, toast]);

  useEffect(() => {
    fetchBookingRequests();
  }, [fetchBookingRequests]);

  // No need for client-side filtering if backend handles it all
  const displayedBookingRequests = allBookingRequests;

  const handleViewStudentDetails = (request) => {
    setSelectedStudent(request);
    setStudentDialogOpen(true);
  };

  const updateRequestInList = (updatedRequest) => {
    setAllBookingRequests((prev) =>
      prev.map((req) =>
        req.id === updatedRequest.id || req._id === updatedRequest._id
          ? { ...req, ...updatedRequest }
          : req
      )
    );
  };

  const handleApproveBooking = async (requestId, studentName) => {
    try {
      const payload = {
        notes: `Approved by service on ${new Date().toLocaleDateString()}. Advised student to proceed with payment.`,
      };
      const response = await apiClient.put(
        `/booking-requests/${requestId}/approve`,
        payload
      );
      if (response.data.success && response.data.data) {
        updateRequestInList(response.data.data);
        toast({
          title: "Booking Approved",
          description: `Request for ${studentName} approved.`,
        });
      } else {
        throw new Error(response.data.message || "Failed to approve booking");
      }
    } catch (err) {
      console.error("API Error handleApproveBooking:", err);
      toast({
        title: "Approval Failed",
        description:
          err.response?.data?.message ||
          err.message ||
          "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleRejectBooking = async (requestId, studentName) => {
    const reason = prompt(
      `Enter reason for rejecting booking for ${studentName}:`
    );
    if (reason === null) return;
    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await apiClient.put(
        `/booking-requests/${requestId}/reject`,
        { rejectionReason: reason }
      );
      if (response.data.success && response.data.data) {
        updateRequestInList(response.data.data);
        toast({
          title: "Booking Rejected",
          description: `Request for ${studentName} rejected.`,
        });
      } else {
        throw new Error(response.data.message || "Failed to reject booking");
      }
    } catch (err) {
      console.error("API Error handleRejectBooking:", err);
      toast({
        title: "Rejection Failed",
        description:
          err.response?.data?.message ||
          err.message ||
          "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsPaid = async (requestId, studentName) => {
    try {
      // Your backend for mark-paid might expect payment details,
      // but for simplicity here, we assume it just updates status and adds a note.
      // Adjust payload if your backend needs more.
      const payload = {
        notes: `Payment confirmed by service on ${new Date().toLocaleDateString()}.`,
        // If your backend expects a payment object:
        // payment: {
        //   status: "paid",
        //   date: new Date().toISOString(),
        //   amount: "300 DZD", // Example
        //   method: "Office Payment" // Example
        // }
      };
      const response = await apiClient.put(
        `/booking-requests/${requestId}/mark-paid`,
        payload
      );

      if (response.data.success && response.data.data) {
        updateRequestInList(response.data.data);
        toast({
          title: "Payment Recorded",
          description: `Payment from ${studentName} has been recorded.`,
          variant: "success",
        });
      } else {
        throw new Error(response.data.message || "Failed to mark as paid");
      }
    } catch (err) {
      console.error("API Error handleMarkAsPaid:", err);
      toast({
        title: "Payment Update Failed",
        description:
          err.response?.data?.message ||
          err.message ||
          "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardShell role="service">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Student Booking Requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and manage student applications for rooms.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchBookingRequests}
          disabled={isLoading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh List
        </Button>
      </div>

      <Card className="mb-6 shadow-sm">
        <CardHeader>
          <CardTitle>Filter Booking Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="booking-search" className="font-medium">
                Search Requests
              </Label>
              <div className="relative mt-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  id="booking-search"
                  placeholder="Student name, room number..."
                  className="pl-10 w-full" // Increased padding for icon
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="booking-status-filter" className="font-medium">
                Filter by Status
              </Label>
              <Select
                value={selectedStatusFilter}
                onValueChange={setSelectedStatusFilter}
              >
                <SelectTrigger
                  id="booking-status-filter"
                  className="w-full mt-1"
                >
                  <div className="flex items-center">
                    <FilterIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="All Statuses" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {requestStatuses.map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                      className="capitalize"
                    >
                      {status === "approved_awaiting_payment"
                        ? "Approved (Awaiting Pay)"
                        : status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Booking Applications</CardTitle>
          <CardDescription>
            List of student requests for room accommodation. Current filter:{" "}
            <Badge variant="outline" className="capitalize ml-1">
              {selectedStatusFilter}
            </Badge>
          </CardDescription>
          {error && !isLoading && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Student</TableHead>
                  <TableHead>Room / Residency</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Applied On
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right w-[250px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading &&
                  [...Array(5)].map((_, i) => (
                    <TableRow key={`skel-bk-${i}`}>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-40" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-5 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Skeleton className="h-8 w-20 inline-block" />
                        <Skeleton className="h-8 w-20 inline-block" />
                      </TableCell>
                    </TableRow>
                  ))}
                {!isLoading &&
                  !error &&
                  displayedBookingRequests.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No booking requests match the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                {/* Error message for empty table due to error is now handled by the general error Alert above the table */}
                {!isLoading &&
                  !error &&
                  displayedBookingRequests.map((req) => (
                    <TableRow key={req.id || req._id}>
                      <TableCell className="font-medium">
                        <Button
                          variant="link"
                          className="p-0 h-auto font-medium text-primary hover:underline"
                          onClick={() => handleViewStudentDetails(req)}
                        >
                          {req.studentName || "N/A"}
                        </Button>
                        {req.studentIdentifier &&
                          req.studentIdentifier !== "N/A" && (
                            <p className="text-xs text-muted-foreground">
                              ID: {req.studentIdentifier}
                            </p>
                          )}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{req.roomNumber || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">
                          {req.residencyTitle || "N/A"}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                        {formatDate(req.applicationDate)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            req.status === "pending"
                              ? "warning"
                              : req.status === "approved"
                              ? "default" // "Approved (awaiting payment)"
                              : req.status === "paid"
                              ? "success"
                              : req.status === "rejected"
                              ? "destructive"
                              : req.status === "cancelled"
                              ? "outline"
                              : "secondary"
                          }
                          className="capitalize whitespace-nowrap"
                        >
                          {req.status === "approved"
                            ? "Approved (Awaiting Pay)"
                            : req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {req.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600 hover:bg-green-100 hover:text-green-700"
                                onClick={() =>
                                  handleApproveBooking(req.id, req.studentName)
                                }
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:bg-red-100 hover:text-red-700"
                                onClick={() =>
                                  handleRejectBooking(req.id, req.studentName)
                                }
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}
                          {req.status === "approved" && ( // Assuming 'approved' means awaiting payment
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-sky-600 border-sky-500 hover:bg-sky-100 hover:text-sky-700"
                              onClick={() =>
                                handleMarkAsPaid(req.id, req.studentName)
                              }
                            >
                              <DollarSign className="mr-1 h-4 w-4" />
                              Mark Paid
                            </Button>
                          )}
                          {(req.status === "rejected" ||
                            req.status === "paid" ||
                            req.status === "cancelled") && (
                            <span className="text-xs italic text-muted-foreground px-2 py-1">
                              Processed
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Student & Application Details
            </DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="p-6 space-y-6">
              {/* Section 1: Student Information */}
              <div className="border rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200 flex items-center">
                  <Briefcase className="inline-block mr-2 h-5 w-5 text-primary" />
                  Student Profile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground block mb-0.5">
                      Full Name
                    </Label>
                    <p className="font-medium">
                      {selectedStudent.studentName || "N/A"}
                    </p>
                  </div>
                  {selectedStudent.studentIdentifier &&
                    selectedStudent.studentIdentifier !== "N/A" && (
                      <div>
                        <Label className="text-xs text-muted-foreground block mb-0.5">
                          University ID
                        </Label>
                        <p>{selectedStudent.studentIdentifier}</p>
                      </div>
                    )}
                  {selectedStudent.studentEmail &&
                    selectedStudent.studentEmail !== "N/A" && (
                      <div>
                        <Label className="text-xs text-muted-foreground block mb-0.5">
                          Email
                        </Label>
                        <p>{selectedStudent.studentEmail}</p>
                      </div>
                    )}
                  <div>
                    <Label className="text-xs text-muted-foreground block mb-0.5">
                      Sex
                    </Label>
                    <p className="capitalize">{selectedStudent.sex || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground block mb-0.5">
                      Date of Birth
                    </Label>
                    <p>
                      {selectedStudent.dateNaissance
                        ? formatDate(selectedStudent.dateNaissance, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground block mb-0.5">
                      Wilaya of Origin
                    </Label>
                    <p>{selectedStudent.wilayaResidenceStudent || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Academic Information (from User model's universityInfo or BookingRequest) */}
              <div className="border rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200 flex items-center">
                  <GraduationCap className="inline-block mr-2 h-5 w-5 text-primary" />
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground block mb-0.5">
                      BAC Matricule
                    </Label>
                    <p>{selectedStudent.matriculeBac || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground block mb-0.5">
                      BAC Year
                    </Label>
                    <p>{selectedStudent.anneeBac || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground block mb-0.5">
                      Major (Filière)
                    </Label>
                    <p>{selectedStudent.filiere || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground block mb-0.5">
                      Year of Study
                    </Label>
                    <p>{selectedStudent.anneeEtude || "N/A"}</p>
                  </div>
                  {/* Display universityInfo if available */}
                  {selectedStudent.universityInfo &&
                    Object.keys(selectedStudent.universityInfo).length > 0 && (
                      <>
                        <div className="sm:col-span-2 pt-2 mt-2 border-t">
                          <p className="text-xs text-muted-foreground font-semibold mb-1">
                            University Details (from User Profile):
                          </p>
                        </div>
                        {selectedStudent.universityInfo.university && (
                          <div>
                            <Label className="text-xs text-muted-foreground block mb-0.5">
                              University
                            </Label>
                            <p>{selectedStudent.universityInfo.university}</p>
                          </div>
                        )}
                        {selectedStudent.universityInfo.faculty && (
                          <div>
                            <Label className="text-xs text-muted-foreground block mb-0.5">
                              Faculty
                            </Label>
                            <p>{selectedStudent.universityInfo.faculty}</p>
                          </div>
                        )}
                        {selectedStudent.universityInfo.year && (
                          <div>
                            <Label className="text-xs text-muted-foreground block mb-0.5">
                              Academic Year (Profile)
                            </Label>
                            <p>{selectedStudent.universityInfo.year}</p>
                          </div>
                        )}
                        {selectedStudent.universityInfo.admissionId && (
                          <div>
                            <Label className="text-xs text-muted-foreground block mb-0.5">
                              Admission ID
                            </Label>
                            <p className="font-mono text-xs">
                              {selectedStudent.universityInfo.admissionId}
                            </p>
                          </div>
                        )}
                        {typeof selectedStudent.universityInfo
                          .admissionConfirmed === "boolean" && (
                          <div>
                            <Label className="text-xs text-muted-foreground block mb-0.5">
                              Admission Status
                            </Label>
                            <Badge
                              variant={
                                selectedStudent.universityInfo
                                  .admissionConfirmed
                                  ? "success"
                                  : "destructive"
                              }
                            >
                              {selectedStudent.universityInfo.admissionConfirmed
                                ? "Confirmed"
                                : "Unconfirmed"}
                            </Badge>
                          </div>
                        )}
                      </>
                    )}
                </div>
              </div>

              {/* Section 3: Residency Application Details */}
              <div className="border rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200 flex items-center">
                  <FileText className="inline-block mr-2 h-5 w-5 text-primary" />
                  Residency Application
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground block mb-0.5">
                      Target Residency
                    </Label>
                    <p>{selectedStudent.residencyTitle || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground block mb-0.5">
                      Requested Room Number
                    </Label>
                    <p>{selectedStudent.roomNumber || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground block mb-0.5">
                      Application Date
                    </Label>
                    <p>{formatDate(selectedStudent.applicationDate)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground block mb-0.5">
                      Current Status
                    </Label>
                    <Badge
                      variant={
                        selectedStudent.status === "pending"
                          ? "warning"
                          : selectedStudent.status === "approved"
                          ? "default"
                          : selectedStudent.status === "paid"
                          ? "success"
                          : selectedStudent.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                      className="capitalize"
                    >
                      {selectedStudent.status === "approved"
                        ? "Approved (Awaiting Pay)"
                        : selectedStudent.status}
                    </Badge>
                  </div>
                </div>
                {selectedStudent.notes && (
                  <div className="mt-4">
                    <Label className="text-xs text-muted-foreground block mb-1">
                      Student Notes
                    </Label>
                    <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded text-sm whitespace-pre-wrap border border-slate-200 dark:border-slate-600">
                      {selectedStudent.notes}
                    </div>
                  </div>
                )}
                {selectedStudent.status === "rejected" &&
                  selectedStudent.rejectionReason && ( // Assuming rejectionReason comes from backend
                    <div className="mt-4">
                      <Label className="text-xs text-muted-foreground text-destructive block mb-1">
                        Rejection Reason
                      </Label>
                      <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 p-3 rounded text-sm border border-red-200 dark:border-red-700">
                        {selectedStudent.rejectionReason}
                      </div>
                    </div>
                  )}
              </div>

              {selectedStudent.status === "paid" && (
                <div className="border rounded-lg p-4 shadow-sm border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/40">
                  <h3 className="font-semibold text-lg mb-3 text-green-700 dark:text-green-300 flex items-center">
                    <DollarSign className="inline-block mr-2 h-5 w-5" />
                    Payment Confirmation
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div>
                      <Label className="text-xs text-green-600 dark:text-green-400 block mb-0.5">
                        Payment Status
                      </Label>
                      <p className="font-medium text-green-800 dark:text-green-200">
                        Paid
                      </p>
                    </div>
                    {/* Add more payment details if your backend provides them for "paid" status */}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="p-6 pt-4 border-t">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </DashboardShell>
  );
}
