import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Edit, UserCog, BedDouble } from "lucide-react"; // Icons
import { useToast } from "@/components/ui/toast";

// Dummy data for demonstration
const initialRequests = [
  {
    id: "req1",
    type: "Room Change",
    studentName: "David Lee",
    details: "Requesting move from C-110 to B-201",
    status: "Pending",
  },
  {
    id: "req2",
    type: "Profile Update",
    studentName: "Eva Green",
    details: "Updated phone number",
    status: "Pending",
  },
  {
    id: "req3",
    type: "New Application",
    studentName: "Frank White",
    details: "Applying for room A-105",
    status: "Pending",
  },
];

const ManagerDashboard = () => {
  const [requests, setRequests] = useState(initialRequests);
  const { toast } = useToast();

  // --- Placeholder Functions for Approvals ---
  const handleApprove = (requestId) => {
    console.log(`Placeholder: Approving request ${requestId}`);
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "Approved" } : req
      )
    );
    toast({
      title: "Action Completed",
      description: `Request ${requestId} approved (Placeholder).`,
      variant: "success",
    });
  };

  const handleReject = (requestId) => {
    console.log(`Placeholder: Rejecting request ${requestId}`);
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "Rejected" } : req
      )
    );
    toast({
      title: "Action Completed",
      description: `Request ${requestId} rejected (Placeholder).`,
      variant: "destructive",
    });
  };

  const handleEditStudentInfo = (studentName) => {
    console.log(`Placeholder: Opening edit form for student: ${studentName}`);
    toast({
      title: "Action Required",
      description: `Navigating to edit form for ${studentName} (Placeholder).`,
    });
    // In a real app: Navigate to an admin-like edit page or open a comprehensive modal
    alert(`Placeholder: Edit info for ${studentName}`);
  };

  const pendingRequests = requests.filter((req) => req.status === "Pending");

  return (
    <div className="space-y-6">
      <Card className="shadow-md border-t-4 border-red-500">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-red-500" /> Pending Requests &
            Approvals
          </CardTitle>
          <CardDescription>
            Review room requests and profile changes requiring approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length > 0 ? (
            <ul className="space-y-4">
              {pendingRequests.map((req) => (
                <li
                  key={req.id}
                  className="p-4 border rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {req.type} - {req.studentName}
                    </p>
                    <p className="text-sm text-gray-600">{req.details}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 mt-2 sm:mt-0">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleApprove(req.id)}
                    >
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(req.id)}
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No pending requests.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md border-t-4 border-blue-500">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <UserCog className="w-6 h-6 text-blue-500" /> Student Information
            Management
          </CardTitle>
          <CardDescription>
            Access and modify student details as needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            As a Housing Manager, you have the ability to view and edit
            information for any student in the system. Use this capability
            responsibly for administrative purposes.
          </p>
          {/* Example: Button to trigger edit for a specific student (could be linked from a search/list) */}
          <Button
            variant="outline"
            onClick={() => handleEditStudent("Alice Smith")}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit Student Info (Example)
          </Button>
          {/* In a real app, you'd likely have a search bar here or link to the full student list (like the Admin's view) */}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerDashboard;
