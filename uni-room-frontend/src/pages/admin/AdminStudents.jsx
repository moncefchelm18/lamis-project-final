import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios"; // Comment out for mock data
import { format, parseISO } from "date-fns"; // For date formatting
import { useDebounce } from "@/hooks/use-debounce"; // Ensure this hook exists in src/hooks/
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DashboardShell from "@/components/layout/DashboardShell"; // Ensure path is correct
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
  AlertCircle,
  Printer, // <-- Added Printer icon import
} from "lucide-react";
import { toast } from "@/hooks/use-toast"; // Ensure path is correct
import { Toaster } from "@/components/ui/toaster";
import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton"; // Can comment out if not using isLoading for mock

// --- Configuration ---
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"; // Not needed for mock
const ITEMS_PER_PAGE = 5; // Adjust items per page for mock data visibility

// --- Helper Functions ---
const formatDate = (dateString, outputFormat = "MMM dd, yyyy") => {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), outputFormat);
  } catch (e) {
    console.error("Error parsing date:", dateString, e);
    return "Invalid Date";
  }
};

// Debounce Hook (Keep or remove import based on whether you keep the local implementation)
// const useDebounce = (value, delay) => {
//   const [debouncedValue, setDebouncedValue] = useState(value);
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);
//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);
//   return debouncedValue;
// };

// --- Mock Data (Populated) ---
const mockResidentData = [
  {
    _id: "resid_01",
    id: "resid_01",
    studentId: {
      _id: "user_68192325",
      id: "user_68192325",
      name: "Wassim Oubaziz",
      email: "student@gmail.com",
      role: "student",
    },
    roomNumber: "101",
    enrollmentDate: new Date("2025-06-01T00:00:00Z").toISOString(),
    status: "active",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "resid_02",
    id: "resid_02",
    studentId: {
      _id: "user_6819239a",
      id: "user_6819239a",
      name: "Ikhekfoune Asil",
      email: "studenta@gmail.com",
      role: "student",
    },
    roomNumber: "102",
    enrollmentDate: new Date("2025-06-15T00:00:00Z").toISOString(),
    status: "active",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "resid_03",
    id: "resid_03",
    studentId: {
      _id: "user_abc1",
      id: "user_abc1",
      name: "Alice Johnson",
      email: "alice.j@example.edu",
      role: "student",
    },
    roomNumber: "205A",
    enrollmentDate: new Date("2024-09-01T00:00:00Z").toISOString(),
    status: "active",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "resid_04",
    id: "resid_04",
    studentId: {
      _id: "user_def2",
      id: "user_def2",
      name: "Bob Williams",
      email: "bob.w@sample.com",
      role: "student",
    },
    roomNumber: "205B",
    enrollmentDate: new Date("2024-09-01T00:00:00Z").toISOString(),
    status: "inactive",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "resid_05",
    id: "resid_05",
    studentId: {
      _id: "user_ghi3",
      id: "user_ghi3",
      name: "Charlie Davis",
      email: "charlie.d@mail.net",
      role: "student",
    },
    roomNumber: "310",
    enrollmentDate: new Date("2025-01-15T00:00:00Z").toISOString(),
    status: "active",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "resid_06",
    id: "resid_06",
    studentId: {
      _id: "user_jkl4",
      id: "user_jkl4",
      name: "Diana Miller",
      email: "diana.m@university.org",
      role: "student",
    },
    roomNumber: "311",
    enrollmentDate: new Date("2025-01-15T00:00:00Z").toISOString(),
    status: "active",
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
  },
  // Add more entries if you need > 5 for pagination testing
];

// Mock User Data for Add Dialog Dropdown
const mockStudentUsers = [
  {
    _id: "user_68192325",
    id: "user_68192325",
    name: "Wassim Oubaziz",
    email: "student@gmail.com",
    role: "student",
  },
  {
    _id: "user_6819239a",
    id: "user_6819239a",
    name: "Ikhekfoune Asil",
    email: "studenta@gmail.com",
    role: "student",
  },
  {
    _id: "user_abc1",
    id: "user_abc1",
    name: "Alice Johnson",
    email: "alice.j@example.edu",
    role: "student",
  },
  {
    _id: "user_def2",
    id: "user_def2",
    name: "Bob Williams",
    email: "bob.w@sample.com",
    role: "student",
  },
  {
    _id: "user_ghi3",
    id: "user_ghi3",
    name: "Charlie Davis",
    email: "charlie.d@mail.net",
    role: "student",
  },
  {
    _id: "user_jkl4",
    id: "user_jkl4",
    name: "Diana Miller",
    email: "diana.m@university.org",
    role: "student",
  },
  {
    _id: "user_mno5",
    id: "user_mno5",
    name: "Ethan Garcia",
    email: "ethan.g@campus.net",
    role: "student",
  }, // Example unassigned student
];

// --- Component ---
export default function AdminStudents() {
  // Initialize with mock data
  const [residents, setResidents] = useState(mockResidentData);
  const [isLoading, setIsLoading] = useState(false); // Start as false for mock data
  const [listError, setListError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Dialog States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Form/Selection States
  const [newResidentData, setNewResidentData] = useState({
    studentId: "",
    roomNumber: "",
    enrollmentDate: "",
  });
  const [editingResident, setEditingResident] = useState(null);
  const [selectedResidentForDetails, setSelectedResidentForDetails] =
    useState(null);
  const [formError, setFormError] = useState(null);
  const [userList, setUserList] = useState([]); // For Add Dialog Dropdown
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Filter residents based on search term (client-side)
  const filteredResidents = residents.filter((res) => {
    const searchTermLower = debouncedSearchTerm.toLowerCase();
    // Use ?. optional chaining for safety as studentId might be just an ID in some states
    const name = res.studentId?.name || "N/A";
    const email = res.studentId?.email || "N/A";
    return (
      name.toLowerCase().includes(searchTermLower) ||
      email.toLowerCase().includes(searchTermLower) ||
      res.roomNumber.toLowerCase().includes(searchTermLower)
    );
  });

  // Pagination calculation for filtered mock data
  const totalPages = Math.ceil(filteredResidents.length / ITEMS_PER_PAGE) || 1;
  const paginatedResidents = filteredResidents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // --- Mock User Fetch for Add Dialog ---
  const fetchStudentUsersMock = useCallback(() => {
    setIsLoadingUsers(true);
    setFormError(null);
    console.log("Simulating fetch student users...");
    // Filter mock users to show only those NOT already in the residents list
    const assignedStudentIds = new Set(
      residents.map((r) => r.studentId?._id || r.studentId)
    );
    const availableStudents = mockStudentUsers.filter(
      (user) => user.role === "student" && !assignedStudentIds.has(user._id)
    );

    setTimeout(() => {
      // Simulate network delay
      setUserList(availableStudents);
      if (availableStudents.length === 0) {
        setFormError(
          "No available students found to assign (all might be assigned)."
        );
      }
      setIsLoadingUsers(false);
    }, 500);
  }, [residents]); // Depend on residents to refilter available students

  // Trigger mock user fetch when Add dialog opens
  useEffect(() => {
    if (isAddDialogOpen) {
      fetchStudentUsersMock();
    }
  }, [isAddDialogOpen, fetchStudentUsersMock]);

  // --- Mock CRUD Handlers (Operate on local 'residents' state) ---

  const handleAddSubmit = (e) => {
    e?.preventDefault();
    setFormError(null);
    if (
      !newResidentData.studentId ||
      !newResidentData.roomNumber ||
      !newResidentData.enrollmentDate
    ) {
      toast({ title: "Missing Info", variant: "destructive" });
      setFormError("Required fields missing.");
      return;
    }
    const selectedUser = mockStudentUsers.find(
      (u) => u._id === newResidentData.studentId
    ); // Find from mock list
    const newEntry = {
      _id: `mock_resid_${Date.now()}`,
      id: `mock_resid_${Date.now()}`,
      studentId: selectedUser || {
        _id: newResidentData.studentId,
        name: "Unknown",
        email: "N/A",
      },
      roomNumber: newResidentData.roomNumber,
      enrollmentDate: new Date(
        newResidentData.enrollmentDate + "T00:00:00Z"
      ).toISOString(),
      status: "active",
      createdAt: new Date().toISOString(),
    };
    setResidents((prev) => [...prev, newEntry]);
    toast({ title: "Success (Mock)", description: "Resident assigned." });
    setIsAddDialogOpen(false);
    setNewResidentData({ studentId: "", roomNumber: "", enrollmentDate: "" });
    setCurrentPage(1); // Reset to page 1 after adding
  };

  const handleEditSubmit = (e) => {
    e?.preventDefault();
    if (!editingResident?._id) return;
    setFormError(null);
    // Update the entry in the residents state array
    setResidents((prev) =>
      prev.map((res) =>
        res._id === editingResident._id
          ? {
              ...res,
              ...editingResident,
              enrollmentDate: new Date(
                editingResident.enrollmentDate + "T00:00:00Z"
              ).toISOString(),
            } // Re-format date on save
          : res
      )
    );
    toast({ title: "Success (Mock)", description: "Resident updated." });
    setIsEditDialogOpen(false);
    setEditingResident(null);
  };

  const handleDeleteConfirm = (id) => {
    if (!id || !window.confirm("Remove resident assignment? (Mock)")) return;
    setResidents((prev) => prev.filter((res) => res.id !== id));
    toast({ title: "Success (Mock)", description: "Assignment removed." });
    // Adjust current page if needed after deletion
    const newTotalPages =
      Math.ceil((residents.length - 1) / ITEMS_PER_PAGE) || 1;
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  };

  // --- Dialog Open/Close & Detail View Handlers ---
  const openEditDialog = (resident) => {
    setEditingResident({
      _id: resident._id,
      id: resident.id,
      studentId: resident.studentId?._id || resident.studentId,
      studentName: resident.studentId?.name || "N/A",
      email: resident.studentId?.email || "N/A",
      roomNumber: resident.roomNumber || "",
      enrollmentDate: resident.enrollmentDate
        ? format(parseISO(resident.enrollmentDate), "yyyy-MM-dd")
        : "",
      status: resident.status || "active",
    });
    setFormError(null);
    setIsEditDialogOpen(true);
  };

  const viewDetails = (resident) => {
    setSelectedResidentForDetails({
      ...resident,
      studentName: resident.studentId?.name || "N/A",
      studentEmail: resident.studentId?.email || "N/A",
    });
    setIsDetailsDialogOpen(true);
  };

  const handlePrintReceipt = (residentId) => {
    if (!residentId) return;
    toast({
      title: "Print Receipt (Placeholder)",
      description: `Receipt for resident ID ${residentId} initiated.`,
    });
  };

  // Form Input Handlers
  const handleNewResidentChange = (e) => {
    const { id, value } = e.target;
    setNewResidentData((prev) => ({ ...prev, [id]: value }));
  };
  const handleNewResidentSelectChange = (field, value) => {
    setNewResidentData((prev) => ({ ...prev, [field]: value }));
  };
  const handleEditingResidentChange = (e) => {
    const { id, value } = e.target;
    const fieldName = id.replace("edit-", "");
    setEditingResident((prev) => ({ ...prev, [fieldName]: value }));
  };
  const handleEditingResidentSelectChange = (field, value) => {
    setEditingResident((prev) => ({ ...prev, [field]: value }));
  };

  // --- Render Logic ---
  return (
    <DashboardShell role="admin">
      {/* Page Header & Add Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Resident Management
        </h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-rose-500 hover:bg-rose-600">
              <Plus className="mr-2 h-4 w-4" /> Assign Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            {/* --- Add Resident Dialog Form (Uses mock user list) --- */}
            <form onSubmit={handleAddSubmit}>
              <DialogHeader>
                <DialogTitle>Assign Room to Student</DialogTitle>
                <DialogDescription>
                  Select student & assign details.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="studentId" className="text-right">
                    Student*
                  </Label>
                  <Select
                    value={newResidentData.studentId}
                    onValueChange={(value) =>
                      handleNewResidentSelectChange("studentId", value)
                    }
                    required
                  >
                    <SelectTrigger
                      className="col-span-3"
                      disabled={isLoadingUsers}
                    >
                      <SelectValue
                        placeholder={
                          isLoadingUsers ? "Loading..." : "Select student..."
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingUsers ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : userList.length > 0 ? (
                        userList.map((user) => (
                          <SelectItem
                            key={user._id || user.id}
                            value={user._id || user.id}
                          >
                            {user.name} ({user.email})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-users" disabled>
                          No available students
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="roomNumber" className="text-right">
                    Room No.*
                  </Label>
                  <Input
                    id="roomNumber"
                    value={newResidentData.roomNumber}
                    onChange={handleNewResidentChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="enrollmentDate" className="text-right">
                    Enrollment*
                  </Label>
                  <Input
                    id="enrollmentDate"
                    type="date"
                    value={newResidentData.enrollmentDate}
                    onChange={handleNewResidentChange}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              {formError && (
                <p className="text-sm text-red-600 px-1 pb-2">{formError}</p>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="bg-rose-500 hover:bg-rose-600"
                  disabled={isLoadingUsers || !newResidentData.studentId}
                >
                  Assign Room
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-muted-foreground mb-6">
        Manage resident records, room assignments, and status (using mock data).
      </p>

      {/* Resident List Card */}
      <Card>
        <CardHeader>
          <CardTitle>Resident Records (Mock Data)</CardTitle>
          <CardDescription>
            View and manage resident assignments.
          </CardDescription>
          {/* Search Input */}
          <div className="pt-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search residents..."
                className="pl-8 w-full md:w-1/3"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          {/* List Error (won't trigger with mock data unless manually set) */}
          {listError && (
            <div className="mt-4 flex items-center text-destructive p-3 border border-destructive/30 rounded-md bg-destructive/10 text-sm">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" /> {listError}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Display Paginated Mock Data */}
                {paginatedResidents.length > 0 ? (
                  paginatedResidents.map((resident) => (
                    <TableRow
                      key={resident.id}
                      onClick={() => viewDetails(resident)}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">
                        {resident.studentId?.name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {resident.studentId?.email || "N/A"}
                      </TableCell>
                      <TableCell>{resident.roomNumber}</TableCell>
                      <TableCell>
                        {formatDate(resident.enrollmentDate)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            resident.status === "active"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {resident.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openEditDialog(resident)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteConfirm(resident.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {searchTerm
                        ? "No mock residents match search."
                        : "No mock residents."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination for Mock Data */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog (Structure remains, operates on mock data state) */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {/* ... Edit Dialog Content ... */}
        <DialogContent>
          {editingResident ? (
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle>Edit Resident Assignment</DialogTitle>
                <DialogDescription>
                  Update room or status for {editingResident?.studentName}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Display Name/Email (non-editable) */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Student</Label>
                  <div className="col-span-3 text-sm text-muted-foreground">
                    {editingResident?.studentName} ({editingResident?.email})
                  </div>
                </div>
                {/* Room Number */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-roomNumber" className="text-right">
                    Room No.*
                  </Label>
                  <Input
                    id="edit-roomNumber"
                    value={editingResident.roomNumber}
                    onChange={handleEditingResidentChange}
                    className="col-span-3"
                    required
                  />
                </div>
                {/* Enrollment Date */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-enrollmentDate" className="text-right">
                    Enrollment*
                  </Label>
                  <Input
                    id="edit-enrollmentDate"
                    type="date"
                    value={editingResident.enrollmentDate}
                    onChange={handleEditingResidentChange}
                    className="col-span-3"
                    required
                  />
                </div>
                {/* Status */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">
                    Status*
                  </Label>
                  <Select
                    value={editingResident.status}
                    onValueChange={(value) =>
                      handleEditingResidentSelectChange("status", value)
                    }
                    required
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {formError && (
                <p className="text-sm text-red-600 px-1 pb-2">{formError}</p>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" className="bg-rose-500 hover:bg-rose-600">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <p>Loading data...</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Details Dialog (Structure remains, shows selected mock data) */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        {/* ... Details Dialog Content ... */}
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resident Details</DialogTitle>
            <DialogDescription>Assignment information.</DialogDescription>
          </DialogHeader>
          {selectedResidentForDetails ? (
            <div className="py-4 space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                <span className="font-medium text-muted-foreground col-span-1">
                  Name:
                </span>
                <span className="col-span-2">
                  {selectedResidentForDetails.studentName}
                </span>
                <span className="font-medium text-muted-foreground col-span-1">
                  Email:
                </span>
                <span className="col-span-2">
                  {selectedResidentForDetails.studentEmail}
                </span>
                <span className="font-medium text-muted-foreground col-span-1">
                  Room No:
                </span>
                <span className="col-span-2">
                  {selectedResidentForDetails.roomNumber}
                </span>
                <span className="font-medium text-muted-foreground col-span-1">
                  Enrollment:
                </span>
                <span className="col-span-2">
                  {formatDate(selectedResidentForDetails.enrollmentDate)}
                </span>
                <span className="font-medium text-muted-foreground col-span-1">
                  Status:
                </span>
                <span className="col-span-2">
                  <Badge
                    variant={
                      selectedResidentForDetails.status === "active"
                        ? "success"
                        : "secondary"
                    }
                  >
                    {selectedResidentForDetails.status}
                  </Badge>
                </span>
                <span className="font-medium text-muted-foreground col-span-1">
                  Resident ID:
                </span>
                <span className="col-span-2 text-xs font-mono">
                  {selectedResidentForDetails.id}
                </span>
                <span className="font-medium text-muted-foreground col-span-1">
                  User ID:
                </span>
                <span className="col-span-2 text-xs font-mono">
                  {selectedResidentForDetails.studentId?._id ||
                    selectedResidentForDetails.studentId}
                </span>
                <span className="font-medium text-muted-foreground col-span-1">
                  Assigned At:
                </span>
                <span className="col-span-2">
                  {formatDate(
                    selectedResidentForDetails.createdAt,
                    "MMM dd, yyyy HH:mm"
                  )}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground py-4">No details selected.</p>
          )}
          <DialogFooter className="sm:justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => handlePrintReceipt(selectedResidentForDetails?.id)}
              disabled={!selectedResidentForDetails}
            >
              <Printer className="mr-2 h-4 w-4" /> Print Receipt (Placeholder)
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </DashboardShell>
  );
}
