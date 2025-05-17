import React, { useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns"; // For relative time
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
import DashboardShell from "@/components/layout/DashboardShell"; // Ensure path is correct
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Send, Trash2, Eye, Check } from "lucide-react"; // Icons
import { toast } from "@/hooks/use-toast"; // Ensure path is correct for useToast
import { Toaster } from "@/components/ui/toaster";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// --- Mock Data (Replace with API Fetch later) ---
const initialMessages = [
  {
    id: "msg1",
    studentName: "Alice Smith",
    studentEmail: "student1@university.edu",
    subject: "Question about rent payment",
    message:
      "Hello, I have a question regarding the due date for next month's rent. Can you please clarify? Thanks!",
    receivedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: "New", // New, Read, Replied
  },
  {
    id: "msg2",
    studentName: "Bob Johnson",
    studentEmail: "student2@university.edu",
    subject: "Leaky faucet in Room C-110",
    message:
      "Hi Admin team, the faucet in my room (C-110) has been leaking for a few days. It's getting worse. Can someone please take a look? It's quite annoying.",
    receivedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    status: "Read",
  },
  {
    id: "msg3",
    studentName: "Charlie Brown",
    studentEmail: "student3@university.edu",
    subject: "Room change request follow-up",
    message:
      "Just wanted to follow up on the room change request I submitted last week. Haven't heard back yet. Any updates? My request ID was #RCR-456.",
    receivedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    status: "Replied",
  },
  {
    id: "msg4",
    studentName: "Emily Davis",
    studentEmail: "emily.d@university.edu",
    subject: "Internet connectivity issues",
    message:
      "The wifi in South Building seems really slow today, especially in the evening. Is there an ongoing issue?",
    receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: "New",
  },
];
// --- End Mock Data ---

// Helper function to format dates relatively
const formatRelativeTime = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch (e) {
    console.error("Error parsing date for relative time:", dateString, e);
    return "Invalid Date";
  }
};

export default function AdminContactMessages() {
  // --- State ---
  const [messages, setMessages] = useState(initialMessages); // Use mock data initially
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Placeholder for future API loading
  const [error, setError] = useState(null); // Placeholder for future API errors

  // --- Handlers (Placeholders) ---

  // Opens the details/reply dialog
  const viewMessageDetails = (message) => {
    setSelectedMessage(message);
    setReplyContent(""); // Clear previous reply draft
    setIsDetailsDialogOpen(true);

    // Placeholder: Mark as read - In real app, call API then update state
    if (message.status === "New") {
      handleMarkAsRead(message.id); // Simulate marking as read on view
    }
  };

  // Placeholder: Marks a message as read
  const handleMarkAsRead = (messageId) => {
    console.log(
      `Placeholder: Marking message ${messageId} as Read (API call needed)`
    );
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, status: "Read" } : msg
      )
    );
    toast({ title: "Status Updated", description: "Message marked as read." });
  };

  // Placeholder: Sends the reply
  const handleSendReply = () => {
    if (!selectedMessage || !replyContent.trim()) {
      toast({
        title: "Error",
        description: "Cannot send empty reply.",
        variant: "destructive",
      });
      return;
    }
    console.log(
      `Placeholder: Sending reply to ${selectedMessage.studentEmail}: "${replyContent}" (API call needed)`
    );

    // --- !!! Add API call here when backend exists !!! ---

    // Simulate success: Update message status and close dialog
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === selectedMessage.id ? { ...msg, status: "Replied" } : msg
      )
    );
    setIsDetailsDialogOpen(false);
    setSelectedMessage(null);
    setReplyContent("");
    toast({
      title: "Reply Sent",
      description: "Your reply has been sent (Placeholder).",
    });
  };

  // Placeholder: Deletes a message
  const handleDeleteMessage = (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;
    console.log(`Placeholder: Deleting message ${messageId} (API call needed)`);

    // --- !!! Add API call here when backend exists !!! ---

    // Simulate success: Remove message from state
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    toast({
      title: "Message Deleted",
      description: "The message has been deleted (Placeholder).",
    });

    // Close dialog if the deleted message was being viewed
    if (selectedMessage?.id === messageId) {
      setIsDetailsDialogOpen(false);
      setSelectedMessage(null);
    }
  };

  // Helper to get badge variant based on status
  const getStatusVariant = (status) => {
    switch (status) {
      case "New":
        return "destructive"; // Use destructive to highlight new messages
      case "Read":
        return "warning";
      case "Replied":
        return "success";
      default:
        return "secondary";
    }
  };

  // --- Render ---
  return (
    <DashboardShell role="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Contact Messages</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        View and respond to messages submitted by students via the Contact Us
        form.
      </p>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <CardTitle>Message Inbox</CardTitle>
          <CardDescription>
            Messages are sorted by received date (newest first).
            {/* Add filtering/sorting options here later */}
          </CardDescription>
          {/* Display Global Error (for future API fetch) */}
          {error && !isLoading && (
            <div className="mt-4 flex items-center text-destructive p-3 border border-destructive/30 rounded-md bg-destructive/10 text-sm">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" /> {error}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>{" "}
                  {/* Status Icon */}
                  <TableHead className="w-[200px]">From</TableHead>
                  <TableHead>Subject / Message Snippet</TableHead>
                  <TableHead className="w-[150px]">Received</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="text-right w-[150px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* // Placeholder: Add loading state when API exists */}
                {/* {isLoading ? (...) : ... } */}

                {messages.length > 0 ? (
                  messages
                    .sort(
                      (a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)
                    ) // Sort by date desc
                    .map((message) => (
                      <TableRow
                        key={message.id}
                        className={
                          message.status === "New"
                            ? "bg-muted/50 font-medium"
                            : ""
                        }
                      >
                        <TableCell>
                          {message.status === "New" ? (
                            <Mail className="h-4 w-4 text-destructive" />
                          ) : (
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>{message.studentName}</div>
                          <div className="text-xs text-muted-foreground">
                            {message.studentEmail}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {message.subject || "(No Subject)"}
                          </div>
                          <p className="text-sm text-muted-foreground truncate max-w-xs md:max-w-md lg:max-w-lg">
                            {message.message}
                          </p>
                        </TableCell>
                        <TableCell className="text-xs">
                          {formatRelativeTime(message.receivedAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(message.status)}>
                            {message.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewMessageDetails(message)}
                            >
                              <Eye className="mr-1 h-4 w-4" /> View
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteMessage(message.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  // Empty state
                  // !error && ( // Add this check when error state is dynamic
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No contact messages found.
                    </TableCell>
                  </TableRow>
                  // )
                )}
              </TableBody>
            </Table>
          </div>
          {/* Placeholder: Add Pagination when API exists */}
        </CardContent>
      </Card>

      {/* View/Reply Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-lg md:max-w-2xl">
          {" "}
          {/* Make dialog wider */}
          <DialogHeader>
            <DialogTitle>
              Message from: {selectedMessage?.studentName || "N/A"}
            </DialogTitle>
            <DialogDescription>
              <span className="block">
                Subject: {selectedMessage?.subject || "(No Subject)"}
              </span>
              <span className="block text-xs text-muted-foreground">
                Received: {formatRelativeTime(selectedMessage?.receivedAt)}
              </span>
              <span className="block text-xs text-muted-foreground">
                From: {selectedMessage?.studentEmail}
              </span>
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {" "}
              {/* Allow scrolling for long content */}
              {/* Message Content */}
              <div className="border rounded-md p-4 bg-muted/30">
                <Label className="font-semibold">Message Content</Label>
                <p className="mt-1 text-sm whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>
              {/* Reply Section */}
              <div className="space-y-2">
                <Label htmlFor="replyContent">Your Reply</Label>
                <Textarea
                  id="replyContent"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Type your reply to ${selectedMessage.studentName}...`}
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  Note: Replying is currently a placeholder. No email will be
                  sent.
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
            {" "}
            {/* Improved footer layout */}
            <div className="flex gap-2">
              {selectedMessage?.status !== "Read" &&
                selectedMessage?.status !== "Replied" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleMarkAsRead(selectedMessage.id)}
                  >
                    <Check className="mr-1 h-4 w-4" /> Mark as Read
                  </Button>
                )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteMessage(selectedMessage.id)}
              >
                <Trash2 className="mr-1 h-4 w-4" /> Delete Message
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDetailsDialogOpen(false)}
              >
                {" "}
                Close{" "}
              </Button>
              <Button
                className="bg-rose-500 hover:bg-rose-600"
                onClick={handleSendReply}
                disabled={!replyContent.trim()}
              >
                <Send className="mr-2 h-4 w-4" /> Send Reply (Placeholder)
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </DashboardShell>
  );
}
