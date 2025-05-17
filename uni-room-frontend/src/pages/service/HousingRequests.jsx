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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";

// Mock data for profile change requests
const initialProfileRequests = [
  {
    id: 1,
    studentName: "John Doe",
    studentId: "S12345",
    requestType: "Profile Update",
    requestDate: "2025-04-01",
    status: "Pending",
    details: {
      oldPhone: "123-456-7890",
      newPhone: "987-654-3210",
      oldEmergencyContact: "Jane Doe",
      newEmergencyContact: "Richard Doe",
    },
  },
  {
    id: 2,
    studentName: "Emily Davis",
    studentId: "S54321",
    requestType: "Profile Update",
    requestDate: "2025-03-28",
    status: "Pending",
    details: {
      oldEmail: "emily.d@university.edu",
      newEmail: "emily.davis@gmail.com",
      oldPhone: "555-123-4567",
      newPhone: "555-987-6543",
    },
  },
  {
    id: 3,
    studentName: "Michael Johnson",
    studentId: "S67890",
    requestType: "Profile Update",
    requestDate: "2025-03-25",
    status: "Approved",
    details: {
      oldEmergencyContact: "Sarah Johnson",
      newEmergencyContact: "David Johnson",
      oldEmergencyPhone: "444-555-6666",
      newEmergencyPhone: "444-777-8888",
    },
  },
];

// Mock data for room change requests
const initialRoomRequests = [
  {
    id: 1,
    studentName: "Robert Wilson",
    studentId: "S24680",
    requestType: "Room Change",
    requestDate: "2025-04-02",
    status: "Pending",
    details: {
      currentRoom: "301",
      currentBuilding: "West Campus",
      requestedRoom: "215",
      requestedBuilding: "East Hall",
      reason: "Roommate compatibility issues",
    },
  },
  {
    id: 2,
    studentName: "Jennifer Taylor",
    studentId: "S97531",
    requestType: "Room Change",
    requestDate: "2025-03-30",
    status: "Pending",
    details: {
      currentRoom: "410",
      currentBuilding: "South Building",
      requestedRoom: "Any",
      requestedBuilding: "North Dorm",
      reason: "Closer to classes",
    },
  },
  {
    id: 3,
    studentName: "David Miller",
    studentId: "S86420",
    requestType: "Room Change",
    requestDate: "2025-03-27",
    status: "Approved",
    details: {
      currentRoom: "205",
      currentBuilding: "North Dorm",
      requestedRoom: "112",
      requestedBuilding: "North Dorm",
      reason: "Medical accommodation",
    },
  },
];

export default function HousingRequests() {
  const [profileRequests, setProfileRequests] = useState(
    initialProfileRequests
  );
  const [roomRequests, setRoomRequests] = useState(initialRoomRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const handleApproveRequest = (type, id) => {
    if (type === "profile") {
      setProfileRequests(
        profileRequests.map((request) =>
          request.id === id ? { ...request, status: "Approved" } : request
        )
      );
    } else {
      setRoomRequests(
        roomRequests.map((request) =>
          request.id === id ? { ...request, status: "Approved" } : request
        )
      );
    }

    toast({
      title: "Request Approved",
      description: "The request has been approved successfully.",
    });
  };

  const handleRejectRequest = (type, id) => {
    if (type === "profile") {
      setProfileRequests(
        profileRequests.map((request) =>
          request.id === id ? { ...request, status: "Rejected" } : request
        )
      );
    } else {
      setRoomRequests(
        roomRequests.map((request) =>
          request.id === id ? { ...request, status: "Rejected" } : request
        )
      );
    }

    toast({
      title: "Request Rejected",
      description: "The request has been rejected.",
    });
  };

  const viewRequestDetails = (type, id) => {
    const request =
      type === "profile"
        ? profileRequests.find((r) => r.id === id)
        : roomRequests.find((r) => r.id === id);

    setSelectedRequest({ ...request, requestCategory: type });
    setIsDetailsDialogOpen(true);
  };

  return (
    <DashboardShell role="service">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Pending Requests</h1>
      </div>
      <div className="mt-2">
        <p className="text-muted-foreground">
          Review and manage student profile and room change requests.
        </p>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Change Requests</TabsTrigger>
            <TabsTrigger value="room">Room Change Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Change Requests</CardTitle>
                <CardDescription>
                  Review and approve or reject student profile change requests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profileRequests.length > 0 ? (
                      profileRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {request.studentName}
                          </TableCell>
                          <TableCell>{request.studentId}</TableCell>
                          <TableCell>{request.requestDate}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                request.status === "Approved"
                                  ? "default"
                                  : request.status === "Rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  viewRequestDetails("profile", request.id)
                                }
                              >
                                View
                              </Button>
                              {request.status === "Pending" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-green-500 text-white hover:bg-green-600"
                                    onClick={() =>
                                      handleApproveRequest(
                                        "profile",
                                        request.id
                                      )
                                    }
                                  >
                                    <CheckCircle className="mr-1 h-4 w-4" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-red-500 text-white hover:bg-red-600"
                                    onClick={() =>
                                      handleRejectRequest("profile", request.id)
                                    }
                                  >
                                    <XCircle className="mr-1 h-4 w-4" />
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No profile change requests found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="room">
            <Card>
              <CardHeader>
                <CardTitle>Room Change Requests</CardTitle>
                <CardDescription>
                  Review and approve or reject student room change requests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roomRequests.length > 0 ? (
                      roomRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {request.studentName}
                          </TableCell>
                          <TableCell>{request.studentId}</TableCell>
                          <TableCell>{request.requestDate}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                request.status === "Approved"
                                  ? "default"
                                  : request.status === "Rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  viewRequestDetails("room", request.id)
                                }
                              >
                                View
                              </Button>
                              {request.status === "Pending" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-green-500 text-white hover:bg-green-600"
                                    onClick={() =>
                                      handleApproveRequest("room", request.id)
                                    }
                                  >
                                    <CheckCircle className="mr-1 h-4 w-4" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-red-500 text-white hover:bg-red-600"
                                    onClick={() =>
                                      handleRejectRequest("room", request.id)
                                    }
                                  >
                                    <XCircle className="mr-1 h-4 w-4" />
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No room change requests found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Request Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              {selectedRequest?.requestType} request from{" "}
              {selectedRequest?.studentName}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium">Student Name</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.studentName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Student ID</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.studentId}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Request Date</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.requestDate}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge
                    variant={
                      selectedRequest.status === "Approved"
                        ? "default"
                        : selectedRequest.status === "Rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>

              <div className="border rounded-md p-4 mb-4">
                <h4 className="text-sm font-medium mb-2">Request Details</h4>
                {selectedRequest.requestCategory === "profile" ? (
                  <div className="space-y-2">
                    {Object.entries(selectedRequest.details).map(
                      ([key, value]) => (
                        <div key={key}>
                          <p className="text-sm font-medium capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {value}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Current Room</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedRequest.details.currentRoom}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Current Building</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedRequest.details.currentBuilding}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Requested Room</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedRequest.details.requestedRoom}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Requested Building
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedRequest.details.requestedBuilding}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Reason</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedRequest.details.reason}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsDialogOpen(false)}
            >
              Close
            </Button>
            {selectedRequest?.status === "Pending" && (
              <>
                <Button
                  className="bg-green-500 text-white hover:bg-green-600"
                  onClick={() => {
                    handleApproveRequest(
                      selectedRequest.requestCategory,
                      selectedRequest.id
                    );
                    setIsDetailsDialogOpen(false);
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  className="bg-red-500 text-white hover:bg-red-600"
                  onClick={() => {
                    handleRejectRequest(
                      selectedRequest.requestCategory,
                      selectedRequest.id
                    );
                    setIsDetailsDialogOpen(false);
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </DashboardShell>
  );
}
