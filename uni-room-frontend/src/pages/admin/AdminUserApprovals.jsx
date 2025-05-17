import React, { useState, useEffect, useCallback, useMemo } from "react";
// import axios from "axios"; // For future API integration
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
import { Input } from "@/components/ui/input"; // For Search
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // For Filters
import { Label } from "@/components/ui/label"; // For Filter Labels
import DashboardShell from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  UserX,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Search as SearchIcon,
  Filter as FilterIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { useDebounce } from "@/hooks/use-debounce"; // Assuming you have this

// Helper to format dates
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), "MMM dd, yyyy, HH:mm");
  } catch (e) {
    return "Invalid Date";
  }
};

// --- Mock Data (Pending Users) ---
const initialPendingUsers = [
  {
    id: "user001",
    _id: "user001",
    name: "New Student Alpha",
    email: "alpha.new@example.com",
    role: "student",
    status: "pending",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "user002",
    _id: "user002",
    name: "Another Applicant Beta",
    email: "beta.applicant@example.com",
    role: "student",
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "user003",
    _id: "user003",
    name: "Service Staff Gamma",
    email: "gamma.staff@example.com",
    role: "service",
    status: "pending",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "user004",
    _id: "user004",
    name: "Potential Admin Delta",
    email: "delta.admin@example.com",
    role: "admin",
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "user005",
    _id: "user005",
    name: "Approved Student Epsilon",
    email: "epsilon.approved@example.com",
    role: "student",
    status: "approved",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "user006",
    _id: "user006",
    name: "Rejected Service Zeta",
    email: "zeta.rejected@example.com",
    role: "service",
    status: "rejected",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
const userRoles = ["all", "student", "service", "admin"]; // For role filter
const userStatuses = ["all", "pending", "approved", "rejected"]; // For status filter
// --- End Mock Data ---

export default function AdminUserApprovals() {
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState(initialPendingUsers); // Store all users locally for mock
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Filter & Search States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all"); // Default to all roles
  const [selectedStatus, setSelectedStatus] = useState("pending"); // Default to 'pending' for this page
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // --- Simulate Fetching Users (mock) ---
  const fetchUsersMock = useCallback(() => {
    setIsLoading(true);
    setError(null);
    console.log(
      "Simulating: Fetching user accounts based on filters (mock)..."
    );
    setTimeout(() => {
      // No actual fetch, use allUsers state which is already initialPendingUsers
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    fetchUsersMock(); // Initial "fetch"
  }, [fetchUsersMock]);

  // --- Client-Side Filtering Logic ---
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const matchesSearch =
        !debouncedSearchTerm ||
        user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesRole = selectedRole === "all" || user.role === selectedRole;
      const matchesStatus =
        selectedStatus === "all" || user.status === selectedStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [allUsers, debouncedSearchTerm, selectedRole, selectedStatus]);

  // --- Action Handlers (Mocked: modify 'allUsers' state) ---
  const handleApproveUser = (userId, userName) => {
    console.log(`Mock: Approving user ${userId} - ${userName}`);
    setAllUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, status: "approved" } : user
      )
    );
    toast({
      title: "User Approved (Mock)",
      description: `${userName} has been approved.`,
    });
  };

  const handleRejectUser = (userId, userName) => {
    if (!window.confirm(`Reject account for ${userName}?`)) return;
    console.log(`Mock: Rejecting user ${userId} - ${userName}`);
    setAllUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, status: "rejected" } : user
      )
    );
    toast({
      title: "User Rejected (Mock)",
      description: `Account for ${userName} rejected.`,
      variant: "destructive",
    });
  };

  // --- Render Logic ---
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
          onClick={fetchUsersMock}
          disabled={isLoading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />{" "}
          Refresh
        </Button>
      </div>

      {/* --- Filters Card --- */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Search by Name/Email */}
            <div>
              <Label htmlFor="user-search">Search Users</Label>
              <div className="relative mt-1">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  id="user-search"
                  placeholder="Search by name or email..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {/* Filter by Role */}
            <div>
              <Label htmlFor="role-filter">Filter by Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger id="role-filter" className="w-full mt-1">
                  <FilterIcon className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
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
            {/* Filter by Status */}
            <div>
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="status-filter" className="w-full mt-1">
                  <FilterIcon className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  {userStatuses.map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                      className="capitalize"
                    >
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* --- End Filters Card --- */}

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            List of users based on selected filters. Default: Pending approvals.
          </CardDescription>
          {/* Corrected Error Display: Placed inside CardHeader or just before CardContent */}
          {error && !isLoading && (
            <Alert variant="destructive" className="mt-4">
              {" "}
              {/* Moved outside CardDescription for better layout */}
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
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={`skel-user-${i}`}>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Skeleton className="h-8 w-20 inline-block" />
                        <Skeleton className="h-8 w-20 inline-block" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
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
                              : user.status === "rejected"
                              ? "destructive"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {user.status === "pending" && ( // Only show actions for pending users
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:bg-green-100 hover:text-green-700"
                                onClick={() =>
                                  handleApproveUser(user.id, user.name)
                                }
                              >
                                <UserCheck className="mr-1 h-4 w-4" /> Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-100 hover:text-red-700"
                                onClick={() =>
                                  handleRejectUser(user.id, user.name)
                                }
                              >
                                <UserX className="mr-1 h-4 w-4" /> Reject
                              </Button>
                            </>
                          )}
                          {user.status ===
                            "approved" /* Example: placeholder for more actions */ && (
                            <span className="text-xs text-muted-foreground italic">
                              Approved
                            </span>
                          )}
                          {user.status === "rejected" && (
                            <span className="text-xs text-destructive italic">
                              Rejected
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No users match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Placeholder: Add Pagination if API supports it for /api/users and returns pagination info */}
        </CardContent>
      </Card>
      <Toaster />
    </DashboardShell>
  );
}
