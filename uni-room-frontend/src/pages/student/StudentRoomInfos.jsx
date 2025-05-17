import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Keep existing imports
import { Label } from "@/components/ui/label"; // Keep existing imports
import DashboardShell from "@/components/layout/DashboardShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast"; // Corrected path based on example
import { Toaster } from "@/components/ui/toaster"; // Corrected path based on example
import {
  Dialog, // Added for Room Change Request
  DialogContent, // Added for Room Change Request
  DialogDescription, // Added for Room Change Request
  DialogFooter, // Added for Room Change Request
  DialogHeader, // Added for Room Change Request
  DialogTitle, // Added for Room Change Request
  DialogTrigger, // Added for Room Change Request
  DialogClose, // Added for closing dialog
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea"; // Added for Room Change Reason
import { MoveRight, CreditCard } from "lucide-react"; // Added Icons

export default function StudentRoomInfos() {
  // Keep the existing formData state if this component still handles profile info,
  // otherwise, it can be removed if this page is *only* for Room/Payment.
  // For this example, let's assume profile form might still be added back or managed elsewhere.
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john.doe@university.edu",
    phone: "123-456-7890",
    emergencyContact: "Jane Doe",
    emergencyPhone: "987-654-3210",
  });

  // State for Room Change Dialog
  const [isRoomChangeDialogOpen, setIsRoomChangeDialogOpen] = useState(false);
  const [roomChangeReason, setRoomChangeReason] = useState("");
  const [requestedRoom, setRequestedRoom] = useState(""); // Optional: field for desired room

  // This handler might not be needed if the profile form isn't on this specific page
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // This handler might not be needed if the profile form isn't on this specific page
  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Profile update requested (Placeholder)",
      description: "Profile updates require approval.",
    });
  };

  // --- Placeholder Handlers for New Buttons ---

  const handleRoomChangeRequestSubmit = () => {
    if (!roomChangeReason.trim()) {
      toast({
        title: "Missing Reason",
        description: "Please provide a reason for your room change request.",
        variant: "destructive",
      });
      return;
    }
    console.log(
      `Placeholder: Submitting Room Change Request - Reason: ${roomChangeReason}, Requested Room: ${
        requestedRoom || "Any"
      }`
    );
    // --- API call would go here ---
    toast({
      title: "Room Change Requested",
      description: "Your request has been submitted for review (Placeholder).",
    });
    setIsRoomChangeDialogOpen(false); // Close dialog
    setRoomChangeReason(""); // Reset reason
    setRequestedRoom(""); // Reset requested room
  };

  const handleMakePayment = () => {
    console.log(
      "Placeholder: Redirecting to Payment Gateway or Opening Payment Modal"
    );
    toast({
      title: "Make Payment",
      description: "Initiating payment process (Placeholder).",
    });
    // Example: window.location.href = '/payment-gateway';
  };

  // --- Render ---
  return (
    <DashboardShell role="student">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Housing & Payment Information {/* Updated title slightly */}
        </h1>
      </div>
      <div className="mt-2 mb-6">
        {" "}
        {/* Added margin-bottom */}
        <p className="text-muted-foreground">
          View your current room details and payment status.
        </p>
      </div>

      {/* Keep existing Tabs structure */}
      <Tabs defaultValue="room" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          {" "}
          {/* Using 2 columns: Room, Payment */}
          <TabsTrigger value="room">Room Details</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          {/* Keep profile trigger commented if it's on another page */}
          {/* <TabsTrigger value="profile">Profile Information</TabsTrigger> */}
        </TabsList>

        {/* --- Room Details Tab --- */}
        <TabsContent value="room" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Room Information</CardTitle>
              <CardDescription>
                Details about your current housing assignment.
              </CardDescription>
            </CardHeader>
            {/* Keep existing static room details */}
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium">Room Number</h3>
                  <p className="text-sm text-muted-foreground">304</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Building</h3>
                  <p className="text-sm text-muted-foreground">
                    West Campus Dormitory
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Room Type</h3>
                  <p className="text-sm text-muted-foreground">
                    Double Occupancy
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Floor</h3>
                  <p className="text-sm text-muted-foreground">3rd Floor</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Move-in Date</h3>
                  <p className="text-sm text-muted-foreground">
                    September 1, 2024
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Contract End Date</h3>
                  <p className="text-sm text-muted-foreground">May 31, 2025</p>
                </div>
              </div>
            </CardContent>
            {/* --- Updated CardFooter --- */}
            <CardFooter className="flex justify-between">
              {" "}
              {/* Adjust alignment */}
              <Button variant="outline">
                Print Room Assignment (Placeholder)
              </Button>{" "}
              {/* Kept original button */}
              {/* NEW: Room Change Request Button + Dialog */}
              <Dialog
                open={isRoomChangeDialogOpen}
                onOpenChange={setIsRoomChangeDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="secondary">
                    {" "}
                    {/* Changed variant */}
                    <MoveRight className="mr-2 h-4 w-4" />
                    Request Room Change
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px]">
                  <DialogHeader>
                    <DialogTitle>Request Room Change</DialogTitle>
                    <DialogDescription>
                      Please state your reason for requesting a change. You can
                      specify a preferred room/building, but availability is not
                      guaranteed. Requests are subject to review.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="requestedRoom">
                        Preferred Room/Building (Optional)
                      </Label>
                      <Input
                        id="requestedRoom"
                        value={requestedRoom}
                        onChange={(e) => setRequestedRoom(e.target.value)}
                        placeholder="e.g., Room 210, East Hall"
                      />
                    </div>
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="roomChangeReason">
                        Reason for Request*
                      </Label>
                      <Textarea
                        id="roomChangeReason"
                        value={roomChangeReason}
                        onChange={(e) => setRoomChangeReason(e.target.value)}
                        placeholder="Please explain why you need to change rooms..."
                        required
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      type="button"
                      onClick={handleRoomChangeRequestSubmit}
                      className="bg-rose-500 hover:bg-rose-600"
                    >
                      Submit Request
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* --- Payment Tab --- */}
        <TabsContent value="payment" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History & Status</CardTitle>{" "}
              {/* Adjusted title */}
              <CardDescription>
                View your payment history and make upcoming payments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Keep existing static payment history */}
              <div className="space-y-4">
                <div className="rounded-md border">
                  <div className="grid grid-cols-3 gap-4 p-4 font-medium">
                    <div>Date</div>
                    <div>Amount</div>
                    <div>Status</div>
                  </div>
                  <div className="divide-y">
                    <div className="grid grid-cols-3 gap-4 p-4">
                      <div className="text-sm">April 1, 2025</div>
                      <div className="text-sm">$750.00</div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Paid
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 p-4">
                      <div className="text-sm">March 1, 2025</div>
                      <div className="text-sm">$750.00</div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Paid
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 p-4">
                      <div className="text-sm">February 1, 2025</div>
                      <div className="text-sm">$750.00</div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Paid
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            {/* --- Updated CardFooter --- */}
            <CardFooter className="justify-between">
              {" "}
              {/* Justify between */}
              <Button
                variant="outline"
                onClick={() => alert("Print Statement (Placeholder)")}
              >
                Print Full Statement
              </Button>{" "}
              {/* Example: Print Statement */}
              {/* NEW: Make Payment Button */}
              <Button
                className="bg-rose-500 hover:bg-rose-600"
                onClick={handleMakePayment}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Make Payment
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Keep Profile tab commented out if not used here */}
        {/* <TabsContent value="profile" className="space-y-4"> ... </TabsContent> */}
      </Tabs>
      <Toaster />
    </DashboardShell>
  );
}
