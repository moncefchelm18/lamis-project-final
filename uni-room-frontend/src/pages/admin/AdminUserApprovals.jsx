"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios"; // Use your apiClient
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
  UserCheck,
  UserX,
  AlertTriangle,
  RefreshCw,
  Search as SearchIcon,
  Filter as FilterIcon,
  CheckCircle,
  Clock,
  XCircle, // More status icons
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster"; // Ensure Toaster is in your layout or here
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, isValid } from "date-fns";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Alert,
  AlertTitle,
  AlertDescription, // Use the one from shadcn/ui directly
} from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger, // We might use this or control open state manually
  DialogClose, // To close the dialog
} from "@/components/ui/dialog";

const API_BASE_URL = "http://localhost:5000/api"; // Or from env

const apiClient = axios.create({ baseURL: API_BASE_URL });
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const formatDate = (dateString, dateFormat = "MMM dd, yyyy, HH:mm") => {
  if (!dateString) return "N/A";
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, dateFormat) : "Invalid Date";
  } catch (e) {
    return "Invalid Date";
  }
};

const userRoles = ["all", "student", "service", "admin"];
const userStatuses = ["all", "pending", "approved"]; // Added suspended

export default function AdminUserApprovals() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("pending"); // Default to pending
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState(null); // 'approve' or 'reject'
  const [dialogUser, setDialogUser] = useState(null); // { id, name } of the user for the dialog

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedStatus && selectedStatus !== "all")
        params.append("status", selectedStatus);
      if (selectedRole && selectedRole !== "all")
        params.append("role", selectedRole);
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      params.append("page", currentPage.toString());
      params.append("limit", usersPerPage.toString());
      params.append("sortBy", "createdAt");
      params.append("sortOrder", "desc");

      const response = await apiClient.get(`/admin/users?${params.toString()}`);
      if (response.data.success) {
        setUsers(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.currentPage || 1);
        setTotalUsers(response.data.totalUsers || 0);
      } else {
        throw new Error(response.data.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error("API Error fetchUsers:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unknown error occurred.";
      setError(errorMessage);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, selectedRole, debouncedSearchTerm, currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserAction = async (userId, userName, actionType) => {
    const endpoint = `/admin/users/${userId}/${actionType}`; // 'approve' or 'reject'
    let confirmMessage = `Are you sure you want to ${actionType} user ${userName}?`;
    if (actionType === "reject") {
      confirmMessage = `Are you sure you want to REJECT and DELETE the account for ${userName}? This action cannot be undone.`;
    }
    const confirmAction = window.confirm(confirmMessage);
    if (!confirmAction) return;
    try {
      setIsLoading(true); // Indicate loading during action
      let response;
      if (actionType === "approve") {
        response = await apiClient.patch(endpoint);
      } else if (actionType === "reject") {
        response = await apiClient.delete(endpoint.replace("/reject", "")); // Assuming reject means delete, so use DELETE on /admin/users/:userId
        // OR if your backend keeps /reject for DELETE:
        // response = await apiClient.patch(endpoint); // if your backend PATCH /reject still does a delete
      }
      // if (response.data.success) {
      //   toast({
      //     title: `User ${actionType === "approve" ? "Approved" : "Rejected"}`,
      //     description: `${userName} has been ${
      //       actionType === "approve" ? "approved" : "rejected"
      //     }.`,
      //   });
      //   // Refetch users to update the list, or update optimistically
      //   // Optimistic update:
      //   setUsers((prevUsers) =>
      //     prevUsers
      //       .map((user) =>
      //         user._id === userId
      //           ? {
      //               ...user,
      //               status: actionType === "approve" ? "approved" : "rejected",
      //             }
      //           : user
      //       )
      //       .filter((user) => {
      //         // If current filter is 'pending', remove the user after action
      //         if (selectedStatus === "pending") return false;
      //         return true;
      //       })
      //   );
      //   fetchUsers(); // Or refetch for guaranteed consistency
      // } else {
      //   throw new Error(
      //     response.data.message || `Failed to ${actionType} user.`
      //   );
      // }
      if (response.data.success) {
        toast({
          title: `User ${
            actionType === "approve" ? "Approved" : "Registration Rejected"
          }`,
          description:
            actionType === "approve"
              ? `${userName} has been approved.`
              : `${userName}'s registration has been rejected and their data deleted.`,
        });

        // Optimistic update or refetch
        // If rejecting, remove the user from the list
        if (actionType === "reject") {
          setUsers((prevUsers) =>
            prevUsers.filter((user) => user._id !== userId)
          );
          setTotalUsers((prevTotal) => prevTotal - 1); // Adjust total count
        } else {
          // If approving
          setUsers((prevUsers) =>
            prevUsers
              .map((user) =>
                user._id === userId ? { ...user, status: "approved" } : user
              )
              .filter((user) => {
                // Optionally remove from 'pending' list if that's the current filter
                if (selectedStatus === "pending") return false;
                return true;
              })
          );
        }
        // Consider a full refetch if optimistic updates become complex
        // fetchUsers();
      } else {
        throw new Error(
          response.data.message || `Failed to ${actionType} user.`
        );
      }
    } catch (err) {
      toast({
        title: `Error ${actionType}ing User`,
        description:
          err.response?.data?.message ||
          err.message ||
          "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      // No 'rejected' or 'suspended' icons needed if they are not persistent states
      default:
        return null;
    }
  };
  const openConfirmationDialog = (userId, userName, actionType) => {
    setDialogUser({ id: userId, name: userName });
    setDialogAction(actionType);
    setIsConfirmDialogOpen(true);
  };
  const performUserAction = async () => {
    if (!dialogUser || !dialogAction) return;

    const { id: userId, name: userName } = dialogUser;
    const actionType = dialogAction;

    // Close dialog first
    setIsConfirmDialogOpen(false);

    const endpoint = `/admin/users/${userId}/${actionType}`;

    try {
      // setIsLoading(true); // You might want a specific loading state for the dialog action
      let response;
      if (actionType === "approve") {
        response = await apiClient.patch(endpoint);
      } else if (actionType === "reject") {
        // Assuming reject means delete
        response = await apiClient.delete(`/admin/users/${userId}`); // DELETE /admin/users/:userId
      }

      if (response.data.success) {
        toast({
          title: `User ${
            actionType === "approve" ? "Approved" : "Registration Rejected"
          }`,
          description:
            actionType === "approve"
              ? `${userName} has been approved.`
              : `${userName}'s registration has been rejected and their data deleted.`,
        });

        if (actionType === "reject") {
          setUsers((prevUsers) =>
            prevUsers.filter((user) => user._id !== userId)
          );
          setTotalUsers((prevTotal) => prevTotal - 1);
        } else {
          setUsers((prevUsers) =>
            prevUsers
              .map((user) =>
                user._id === userId ? { ...user, status: "approved" } : user
              )
              .filter((user) => {
                if (selectedStatus === "pending") return false;
                return true;
              })
          );
        }
        // fetchUsers(); // Optionally refetch
      } else {
        throw new Error(
          response.data.message || `Failed to ${actionType} user.`
        );
      }
    } catch (err) {
      toast({
        title: `Error ${actionType}ing User`,
        description:
          err.response?.data?.message ||
          err.message ||
          "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      // setIsLoading(false);
      setDialogUser(null); // Reset dialog user
      setDialogAction(null); // Reset dialog action
    }
  };
  return (
    <DashboardShell role="admin">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            User Account Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Review, approve, or reject user registrations.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          disabled={isLoading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />{" "}
          Refresh
        </Button>
      </div>

      <Card className="mb-6 shadow-sm">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="user-search">Search Users</Label>
              <div className="relative mt-1">
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  id="user-search"
                  placeholder="Name, email, student ID..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role-filter">Filter by Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger id="role-filter" className="w-full mt-1">
                  <FilterIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  {userRoles.map((role) => (
                    <SelectItem key={role} value={role} className="capitalize">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value);
                  setCurrentPage(1); /* Reset page on filter change */
                }}
              >
                <SelectTrigger id="status-filter" className="w-full mt-1">
                  <FilterIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  {userStatuses.map(
                    (
                      status // Uses the simplified array
                    ) => (
                      <SelectItem
                        key={status}
                        value={status}
                        className="capitalize"
                      >
                        {status}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            {totalUsers > 0
              ? `Displaying ${users.length} of ${totalUsers} users.`
              : "No users to display."}
            Current filter:{" "}
            <Badge variant="outline" className="capitalize ml-1">
              {selectedStatus}
            </Badge>
            {selectedRole !== "all" && (
              <Badge variant="outline" className="capitalize ml-1">
                {selectedRole}
              </Badge>
            )}
          </CardDescription>
          {error && !isLoading && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Users</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email / Student ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(usersPerPage)].map((_, i) => (
                    <TableRow key={`skel-user-${i}`}>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-3 w-24 mt-1" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
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
                  ))
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>
                        <div>{user.email}</div>
                        {user.role === "student" && user.studentId && (
                          <div className="text-xs text-muted-foreground">
                            ID: {user.studentId}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "pending"
                              ? "warning"
                              : user.status === "approved"
                              ? "success"
                              : "destructive"
                          }
                          className="capitalize"
                        >
                          {getStatusIcon(user.status)}
                          <span className="ml-1">{user.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {user.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:bg-green-100 hover:text-green-700"
                                onClick={() =>
                                  openConfirmationDialog(
                                    user._id,
                                    user.name,
                                    "approve"
                                  )
                                }
                              >
                                <UserCheck className="mr-1 h-4 w-4" /> Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-100 hover:text-red-700"
                                onClick={() =>
                                  openConfirmationDialog(
                                    user._id,
                                    user.name,
                                    "reject"
                                  )
                                }
                              >
                                <UserX className="mr-1 h-4 w-4" /> Reject
                              </Button>
                            </>
                          )}
                          {user.status === "approved" &&
                            user.role !== "admin" && ( // Can't reject main admin, example
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-100 hover:text-red-700"
                                onClick={() =>
                                  handleUserAction(
                                    user._id,
                                    user.name,
                                    "reject"
                                  )
                                }
                              >
                                {" "}
                                {/* You'd need a 'suspend' or similar action */}
                                <UserX className="mr-1 h-4 w-4" /> Suspend
                              </Button>
                            )}
                          {/* Add more actions if needed, e.g., View Details, Edit User */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No users match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && !isLoading && (
            <div className="flex justify-center items-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage - 1);
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                    />
                  </PaginationItem>
                  {/* Simple Pagination Links - can be improved with ellipsis for many pages */}
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Basic logic to show limited page numbers (e.g., first, last, current, and some around current)
                    const showPage =
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 2 &&
                        pageNum <= currentPage + 2);
                    const showEllipsisBefore =
                      pageNum === currentPage - 3 && currentPage > 4;
                    const showEllipsisAfter =
                      pageNum === currentPage + 3 &&
                      currentPage < totalPages - 3;

                    if (showEllipsisBefore) {
                      return (
                        <PaginationItem key={`ellipsis-before-${pageNum}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    if (showEllipsisAfter) {
                      return (
                        <PaginationItem key={`ellipsis-after-${pageNum}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    if (showPage) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(pageNum);
                            }}
                            isActive={currentPage === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage + 1);
                      }}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Confirm Action:{" "}
              {dialogAction === "approve" ? "Approve" : "Reject"} User
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "reject"
                ? `Are you sure you want to REJECT and DELETE the account for "${dialogUser?.name}"? This action cannot be undone.`
                : `Are you sure you want to APPROVE the account for "${dialogUser?.name}"?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant={dialogAction === "reject" ? "destructive" : "default"}
              onClick={performUserAction}
            >
              {dialogAction === "approve"
                ? "Approve User"
                : "Yes, Reject & Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </DashboardShell>
  );
}
