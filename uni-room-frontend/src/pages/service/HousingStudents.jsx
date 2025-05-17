"use client";

import { useState } from "react";
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
import DashboardShell from "@/components/layout/DashboardShell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Edit, MoreHorizontal, Search } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";

// Mock data for students
const initialStudents = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@university.edu",
    room: "304",
    building: "West Campus",
    paymentStatus: "Paid",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@university.edu",
    room: "215",
    building: "East Hall",
    paymentStatus: "Paid",
  },
  {
    id: 3,
    name: "Michael Johnson",
    email: "michael.j@university.edu",
    room: "112",
    building: "North Dorm",
    paymentStatus: "Pending",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.d@university.edu",
    room: "422",
    building: "South Building",
    paymentStatus: "Paid",
  },
  {
    id: 5,
    name: "Robert Wilson",
    email: "robert.w@university.edu",
    room: "301",
    building: "West Campus",
    paymentStatus: "Overdue",
  },
  {
    id: 6,
    name: "Sarah Brown",
    email: "sarah.b@university.edu",
    room: "118",
    building: "East Hall",
    paymentStatus: "Paid",
  },
  {
    id: 7,
    name: "David Miller",
    email: "david.m@university.edu",
    room: "205",
    building: "North Dorm",
    paymentStatus: "Pending",
  },
  {
    id: 8,
    name: "Jennifer Taylor",
    email: "jennifer.t@university.edu",
    room: "410",
    building: "South Building",
    paymentStatus: "Paid",
  },
  {
    id: 9,
    name: "James Anderson",
    email: "james.a@university.edu",
    room: "302",
    building: "West Campus",
    paymentStatus: "Paid",
  },
  {
    id: 10,
    name: "Lisa Thomas",
    email: "lisa.t@university.edu",
    room: "220",
    building: "East Hall",
    paymentStatus: "Overdue",
  },
];

export default function HousingStudents() {
  const [students, setStudents] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.room.includes(searchTerm) ||
      student.building.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handleEditStudent = () => {
    if (!editingStudent) return;

    setStudents(
      students.map((student) =>
        student.id === editingStudent.id ? editingStudent : student
      )
    );
    setIsEditDialogOpen(false);
    toast({
      title: "Student Updated",
      description: `${editingStudent.name}'s information has been updated.`,
    });
  };

  return (
    <DashboardShell role="service">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Student Management
        </h1>
      </div>
      <div className="mt-2">
        <p className="text-muted-foreground">
          View and edit student housing information.
        </p>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Records</CardTitle>
            <CardDescription>
              View and manage all student housing records.
            </CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search students..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Building</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.room}</TableCell>
                      <TableCell>{student.building}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            student.paymentStatus === "Paid"
                              ? "bg-green-100 text-green-800"
                              : student.paymentStatus === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {student.paymentStatus}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingStudent(student);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
      </div>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update the student's information.
            </DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingStudent.name}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      name: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingStudent.email}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      email: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-room" className="text-right">
                  Room
                </Label>
                <Input
                  id="edit-room"
                  value={editingStudent.room}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      room: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-building" className="text-right">
                  Building
                </Label>
                <Select
                  value={editingStudent.building}
                  onValueChange={(value) =>
                    setEditingStudent({ ...editingStudent, building: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select building" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="West Campus">West Campus</SelectItem>
                    <SelectItem value="East Hall">East Hall</SelectItem>
                    <SelectItem value="North Dorm">North Dorm</SelectItem>
                    <SelectItem value="South Building">
                      South Building
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-paymentStatus" className="text-right">
                  Payment Status
                </Label>
                <Select
                  value={editingStudent.paymentStatus}
                  onValueChange={(value) =>
                    setEditingStudent({
                      ...editingStudent,
                      paymentStatus: value,
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditStudent}
              className="bg-rose-500 hover:bg-rose-600"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </DashboardShell>
  );
}
