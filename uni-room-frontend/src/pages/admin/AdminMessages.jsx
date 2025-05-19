"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Mail,
  MailOpen,
  Archive,
  Eye,
  RefreshCw,
  Search as SearchIcon,
  FilterIcon,
  Inbox,
  AlertTriangle,
  MessageSquareReply, // Icon for "Replied"
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, isValid } from "date-fns";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Alert,
  AlertTitle,
  AlertDescription as AlertDescriptionComponent,
} from "@/components/ui/alert";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"; // Import Pagination components

// Helper function to format dates
const formatDate = (dateString, dateFormat = "dd/MM/yyyy HH:mm") => {
  if (!dateString) return "N/A";
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return "Invalid Date";
    return format(date, dateFormat);
  } catch (error) {
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

// Updated statuses for admin messages
const adminMessageStatuses = ["all", "unread", "read", "replied", "archived"];

export default function AdminMessages() {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("unread");

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const messagesPerPage = 10;

  const fetchAdminMessages = useCallback(async () => {
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
      params.append("page", currentPage.toString());
      params.append("limit", messagesPerPage.toString());
      params.append("sort", "createdAt"); // Or allow user to sort
      params.append("order", "desc");

      // Use the new endpoint for admin contact messages
      const response = await apiClient.get(
        `/messages/contact-admins?${params.toString()}`
      );

      if (response.data.success) {
        setMessages(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.currentPage || 1);
        setTotalMessages(response.data.totalMessages || 0);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch admin messages"
        );
      }
    } catch (err) {
      console.error("API Error fetchAdminMessages:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unknown error occurred.";
      setError(errorMessage);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatusFilter, debouncedSearchTerm, currentPage]);

  useEffect(() => {
    fetchAdminMessages();
  }, [fetchAdminMessages]);

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    setMessageDialogOpen(true);
    // If the message is 'unread', mark it as 'read' when viewed
    if (message.status === "unread") {
      try {
        const response = await apiClient.put(
          `/messages/contact-admins/${message._id}/status`, // Use _id for general messages
          { status: "read" }
        );
        if (response.data.success) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg._id === message._id ? { ...msg, status: "read" } : msg
            )
          );
          // Optionally update selectedMessage as well if it's open
          if (selectedMessage && selectedMessage._id === message._id) {
            setSelectedMessage((prev) => ({ ...prev, status: "read" }));
          }
        } else {
          toast({
            title: "Error",
            description: "Could not mark message as read.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error marking message as read:", error);
        toast({
          title: "Error",
          description: "Failed to update message status.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdateMessageStatus = async (
    messageId, // This will be _id from the message object
    newStatus
  ) => {
    try {
      const response = await apiClient.put(
        `/messages/contact-admins/${messageId}/status`,
        { status: newStatus }
      );

      if (response.data.success && response.data.data) {
        const updatedMessage = response.data.data;
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === messageId ? { ...msg, status: newStatus } : msg
          )
        );
        toast({
          title: `Message Status Updated`,
          description: `Message from ${updatedMessage.firstName} ${
            updatedMessage.lastName || ""
          } (${updatedMessage.senderEmail}) has been marked as ${newStatus}.`,
        });

        if (selectedMessage && selectedMessage._id === messageId) {
          setSelectedMessage((prev) => ({ ...prev, status: newStatus }));
        }

        // Optimistic update for filters
        if (
          selectedStatusFilter === "unread" &&
          (newStatus === "read" || newStatus === "replied")
        ) {
          setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        }
        if (selectedStatusFilter !== "all" && newStatus === "archived") {
          setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        }
      } else {
        throw new Error(
          response.data.message || `Failed to mark message as ${newStatus}`
        );
      }
    } catch (err) {
      console.error(
        `API Error handleUpdateMessageStatus to ${newStatus}:`,
        err
      );
      toast({
        title: "Update Failed",
        description:
          err.response?.data?.message ||
          err.message ||
          "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <DashboardShell role="admin">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Contact Form Messages
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage messages submitted through the website contact form.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAdminMessages}
          disabled={isLoading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh Messages
        </Button>
      </div>

      <Card className="mb-6 shadow-sm">
        <CardHeader>
          <CardTitle>Filter Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="message-search" className="font-medium">
                Search Messages
              </Label>
              <div className="relative mt-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  id="message-search"
                  placeholder="Name, email, content..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="message-status-filter" className="font-medium">
                Filter by Status
              </Label>
              <Select
                value={selectedStatusFilter}
                onValueChange={setSelectedStatusFilter}
              >
                <SelectTrigger
                  id="message-status-filter"
                  className="w-full mt-1"
                >
                  <div className="flex items-center">
                    <FilterIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="All Statuses" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {adminMessageStatuses.map((status) => (
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

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Inbox className="mr-2 h-6 w-6 text-primary" />
            General Inquiry Inbox
          </CardTitle>
          <CardDescription>
            Messages from the public contact form. Current filter:{" "}
            <Badge variant="outline" className="capitalize ml-1">
              {selectedStatusFilter}
            </Badge>
            {totalMessages > 0 &&
              ` | Showing ${messages.length} of ${totalMessages} total`}
          </CardDescription>
          {error && !isLoading && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Messages</AlertTitle>
              <AlertDescriptionComponent>{error}</AlertDescriptionComponent>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Status</TableHead>
                  <TableHead className="w-[250px]">
                    From (Name / Email)
                  </TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead className="hidden lg:table-cell w-[180px]">
                    Received
                  </TableHead>
                  <TableHead className="text-right w-[200px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading &&
                  [...Array(messagesPerPage)].map((_, i) => (
                    <TableRow key={`skel-msg-${i}`}>
                      <TableCell>
                        <Skeleton className="h-5 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-3 w-32 mt-1" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Skeleton className="h-5 w-28" />
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Skeleton className="h-8 w-20 inline-block" />
                        <Skeleton className="h-8 w-20 inline-block" />
                      </TableCell>
                    </TableRow>
                  ))}
                {!isLoading && !error && messages.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5} // Adjusted colspan
                      className="h-24 text-center text-muted-foreground"
                    >
                      No messages match the current filters.
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  !error &&
                  messages.map((msg) => (
                    <TableRow
                      key={msg._id} // Use _id for these messages
                      className={`${
                        msg.status === "unread"
                          ? "bg-primary/5 dark:bg-primary/10 font-medium"
                          : ""
                      } hover:bg-muted/50`}
                    >
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            msg.status === "unread"
                              ? "default"
                              : msg.status === "read"
                              ? "secondary"
                              : msg.status === "replied"
                              ? "outline" // Example: outline for replied
                              : msg.status === "archived"
                              ? "destructive"
                              : "secondary" // Destructive for archived
                          }
                          className="capitalize text-xs px-2 py-0.5"
                        >
                          {msg.status === "unread" ? (
                            <Mail className="mr-1 h-3 w-3 inline-block" />
                          ) : msg.status === "read" ? (
                            <MailOpen className="mr-1 h-3 w-3 inline-block" />
                          ) : msg.status === "replied" ? (
                            <MessageSquareReply className="mr-1 h-3 w-3 inline-block" />
                          ) : (
                            <Archive className="mr-1 h-3 w-3 inline-block" />
                          )}
                          {msg.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="truncate font-semibold">
                          {msg.firstName} {msg.lastName || ""}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {msg.senderEmail}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-left block"
                          onClick={() => handleViewMessage(msg)}
                        >
                          <p className="truncate font-normal max-w-md">
                            {msg.content}
                          </p>
                        </Button>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                        {formatDate(msg.createdAt)}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewMessage(msg)}
                          className="text-xs"
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" /> View
                        </Button>
                        {msg.status !== "archived" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() =>
                              handleUpdateMessageStatus(msg._id, "archived")
                            }
                          >
                            <Archive className="mr-1 h-3.5 w-3.5" /> Archive
                          </Button>
                        )}
                        {/* Add Mark as Replied if applicable */}
                        {msg.status === "read" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs text-green-600 border-green-500 hover:bg-green-50"
                            onClick={() =>
                              handleUpdateMessageStatus(msg._id, "replied")
                            }
                          >
                            <MessageSquareReply className="mr-1 h-3.5 w-3.5" />{" "}
                            Replied
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          {/* Pagination Controls */}
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
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Logic to show limited page numbers (e.g., first, last, current, and some around current)
                    const showPage =
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 &&
                        pageNum <= currentPage + 1);
                    const showEllipsis =
                      (pageNum === currentPage - 2 && currentPage > 3) ||
                      (pageNum === currentPage + 2 &&
                        currentPage < totalPages - 2);

                    if (showEllipsis) {
                      return (
                        <PaginationItem key={`ellipsis-${pageNum}`}>
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
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Contact Message Details
            </DialogTitle>
            {selectedMessage && (
              <DialogDescription>
                From: {selectedMessage.firstName}{" "}
                {selectedMessage.lastName || ""} ({selectedMessage.senderEmail})
                <br />
                Received: {formatDate(selectedMessage.createdAt)} | Status:{" "}
                <Badge variant="outline" className="capitalize">
                  {selectedMessage.status}
                </Badge>
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedMessage && (
            <>
              <Separator />
              <div className="py-3 pr-2 space-y-4 flex-grow overflow-y-auto">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Sender's Full Name
                  </Label>
                  <p className="text-base">
                    {selectedMessage.firstName} {selectedMessage.lastName || ""}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Sender's Contact Email
                  </Label>
                  <p className="text-base text-blue-600 dark:text-blue-400 hover:underline">
                    <a href={`mailto:${selectedMessage.senderEmail}`}>
                      {selectedMessage.senderEmail}
                    </a>
                  </p>
                </div>
                <Separator className="my-3" />
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Message Content
                  </Label>
                  <div className="mt-1 p-4 bg-slate-50 dark:bg-slate-800 rounded-md border dark:border-slate-700 whitespace-pre-wrap text-sm min-h-[150px]">
                    {selectedMessage.content}
                  </div>
                </div>
              </div>
              <Separator />
              <DialogFooter className="pt-4 flex flex-col sm:flex-row sm:justify-between gap-2">
                <div className="flex gap-2">
                  {selectedMessage.status !== "archived" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateMessageStatus(
                          selectedMessage._id,
                          "archived"
                        )
                      }
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Move to Archive
                    </Button>
                  )}
                  {selectedMessage.status === "read" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-500 hover:bg-green-50"
                      onClick={() =>
                        handleUpdateMessageStatus(
                          selectedMessage._id,
                          "replied"
                        )
                      }
                    >
                      <MessageSquareReply className="mr-2 h-4 w-4" />
                      Mark as Replied
                    </Button>
                  )}
                  {selectedMessage.status === "unread" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateMessageStatus(selectedMessage._id, "read")
                      }
                    >
                      <MailOpen className="mr-2 h-4 w-4" />
                      Mark as Read
                    </Button>
                  )}
                </div>
                <DialogClose asChild>
                  <Button variant="default" size="sm">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Toaster />
    </DashboardShell>
  );
}

// import React, { useState, useEffect, useCallback, useMemo } from "react";
// // import axios from "axios";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
//   CardFooter,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"; // DialogClose might not be needed if using onOpenChange
// import DashboardShell from "@/components/layout/DashboardShell";
// import { Badge } from "@/components/ui/badge";
// import {
//   Mail as MailIcon,
//   MessageSquare,
//   Send,
//   Trash2,
//   Eye,
//   Check,
//   AlertTriangle,
//   RefreshCw,
//   Search as SearchIcon,
//   Filter as FilterIcon,
//   Home as HomeIcon,
// } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { Toaster } from "@/components/ui/toaster";
// import { Skeleton } from "@/components/ui/skeleton";
// import { formatDistanceToNow, parseISO } from "date-fns";
// import { useDebounce } from "@/hooks/use-debounce";

// // Helper function to format dates relatively
// const formatRelativeTime = (dateString) => {
//   console.log("formatRelativeTime called with:", dateString, typeof dateString); // <--- ADD THIS LOG
//   if (!dateString) {
//     console.log("formatRelativeTime returning N/A for undefined/null input");
//     return "N/A";
//   }
//   try {
//     return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
//   } catch (e) {
//     console.error("Error parsing date for relative time:", dateString, e);
//     return "Invalid Date";
//   }
// };

// // --- Mock Data: Messages related to specific residencies ---
// const initialResidencyMessages = [
//   {
//     id: "rmsg001",
//     studentName: "Wassim Oubaziz",
//     studentEmail: "student@gmail.com",
//     residencyId: "r-001",
//     residencyTitle: "Cité El Alia - Alger Centre",
//     subject: "Inquiry about A-101 availability",
//     message:
//       "Hello, I saw room A-101 listed. Is it still available for the upcoming semester? I am very interested.",
//     receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
//     status: "New",
//   },
//   {
//     id: "rmsg002",
//     studentName: "Ikhekfoune Asil",
//     studentEmail: "studenta@gmail.com",
//     residencyId: "r-002",
//     residencyTitle: "Résidence Taleb Abderrahmane - Oran",
//     subject: "Question about studio amenities",
//     message:
//       "Does the Studio 01 come with a microwave? The listing mentions kitchenette but not specifically a microwave. Thanks!",
//     receivedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
//     status: "Read",
//   },
//   {
//     id: "rmsg003",
//     studentName: "Alice Johnson",
//     studentEmail: "alice.j@example.edu",
//     residencyId: "r-001",
//     residencyTitle: "Cité El Alia - Alger Centre",
//     subject: "Booking Confirmation Timeframe",
//     message:
//       "I submitted my booking application for B-203 yesterday. When can I expect to hear back about the confirmation?",
//     receivedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
//     status: "Replied",
//     reply:
//       "Hi Alice, booking confirmations are typically processed within 3-5 business days. You will be notified via email.",
//   },
//   {
//     id: "rmsg004",
//     studentName: "Charlie Davis",
//     studentEmail: "charlie.d@mail.net",
//     residencyId: "r-004",
//     residencyTitle: "Résidence Universitaire Constantine",
//     subject: "Can I view a room?",
//     message:
//       "Is it possible to schedule a viewing for a single room at the Constantine residence before I apply?",
//     receivedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
//     status: "New",
//   },
// ];
// // Unique residency titles from mock messages for the filter
// const uniqueResidencyTitlesForFilter = [
//   "all",
//   ...new Set(initialResidencyMessages.map((msg) => msg.residencyTitle)),
// ];
// const messageStatuses = ["all", "New", "Read", "Replied"];
// // --- End Mock Data ---

// export default function AdminMessages() {
//   const { toast } = useToast();
//   const [allMessages, setAllMessages] = useState(initialResidencyMessages);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Filter & Search States
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedResidencyFilter, setSelectedResidencyFilter] = useState("all");
//   const [selectedStatusFilter, setSelectedStatusFilter] = useState("New"); // Default to New
//   const debouncedSearchTerm = useDebounce(searchTerm, 300);

//   // Dialog States
//   const [selectedMessage, setSelectedMessage] = useState(null);
//   const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
//   const [replyContent, setReplyContent] = useState("");

//   // Simulate Fetching Messages (mock)
//   const fetchMessagesMock = useCallback(() => {
//     setIsLoading(true);
//     setError(null);
//     console.log("Simulating: Fetching residency messages...");
//     setTimeout(() => {
//       // In real app, API call with filters: GET /api/residency-messages?residencyId=...&status=...&search=...
//       setAllMessages(initialResidencyMessages); // Use the full initial list for client-side filtering
//       setIsLoading(false);
//     }, 500);
//   }, []);

//   useEffect(() => {
//     fetchMessagesMock();
//   }, [fetchMessagesMock]);

//   // Client-Side Filtering Logic
//   const filteredMessages = useMemo(() => {
//     return allMessages.filter((msg) => {
//       const searchTermLower = debouncedSearchTerm.toLowerCase();
//       const matchesSearch =
//         !debouncedSearchTerm ||
//         msg.studentName.toLowerCase().includes(searchTermLower) ||
//         msg.studentEmail.toLowerCase().includes(searchTermLower) ||
//         msg.subject.toLowerCase().includes(searchTermLower) ||
//         msg.message.toLowerCase().includes(searchTermLower);
//       const matchesResidency =
//         selectedResidencyFilter === "all" ||
//         msg.residencyTitle === selectedResidencyFilter;
//       const matchesStatus =
//         selectedStatusFilter === "all" || msg.status === selectedStatusFilter;
//       return matchesSearch && matchesResidency && matchesStatus;
//     });
//   }, [
//     allMessages,
//     debouncedSearchTerm,
//     selectedResidencyFilter,
//     selectedStatusFilter,
//   ]);

//   // Handlers (Placeholders - modify `allMessages` state)
//   const viewMessageDetails = (message) => {
//     setSelectedMessage(message);
//     setReplyContent("");
//     setIsDetailsDialogOpen(true);
//     if (message.status === "New") handleMarkAsRead(message.id);
//   };
//   const handleMarkAsRead = (messageId) => {
//     console.log(`Mock: Marking message ${messageId} as Read`);
//     setAllMessages((prev) =>
//       prev.map((msg) =>
//         msg.id === messageId ? { ...msg, status: "Read" } : msg
//       )
//     );
//     // toast({ title: "Status Updated", description: "Message marked as read." });
//   };
//   const handleSendReply = () => {
//     if (!selectedMessage || !replyContent.trim()) {
//       toast({ title: "Empty Reply", variant: "destructive" });
//       return;
//     }
//     console.log(`Mock: Replying to ${selectedMessage.id}: ${replyContent}`);
//     setAllMessages((prev) =>
//       prev.map((msg) =>
//         msg.id === selectedMessage.id
//           ? {
//               ...msg,
//               status: "Replied",
//               reply: replyContent /* Store mock reply */,
//             }
//           : msg
//       )
//     );
//     toast({ title: "Reply Sent (Mock)" });
//     setIsDetailsDialogOpen(false);
//     setSelectedMessage(null);
//     setReplyContent("");
//   };
//   const handleDeleteMessage = (messageId) => {
//     if (!window.confirm("Delete this message?")) return;
//     console.log(`Mock: Deleting message ${messageId}`);
//     setAllMessages((prev) => prev.filter((msg) => msg.id !== messageId));
//     toast({ title: "Message Deleted (Mock)", variant: "destructive" });
//     if (selectedMessage?.id === messageId) {
//       setIsDetailsDialogOpen(false);
//       setSelectedMessage(null);
//     }
//   };
//   const getStatusVariant = (status) => {
//     switch (status) {
//       case "New":
//         return "destructive"; // Use destructive to highlight new messages
//       case "Read":
//         return "warning";
//       case "Replied":
//         return "success";
//       default:
//         return "secondary";
//     }
//   };

//   // Render Logic
//   return (
//     <DashboardShell role="admin">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">
//             Residency Contact Messages
//           </h1>
//           <p className="text-muted-foreground mt-1">
//             Student inquiries related to specific residencies.
//           </p>
//         </div>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={fetchMessagesMock}
//           disabled={isLoading}
//         >
//           <RefreshCw
//             className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
//           />
//           Refresh
//         </Button>
//       </div>

//       {/* --- Filters Card --- */}
//       <Card className="mb-6">
//         <CardHeader>
//           <CardTitle>Filter Messages</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             <div>
//               <Label htmlFor="msg-search">Search</Label>
//               <div className="relative mt-1">
//                 <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   type="search"
//                   id="msg-search"
//                   placeholder="Name, email, subject..."
//                   className="pl-8 w-full"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//             </div>
//             <div>
//               <Label htmlFor="msg-residency-filter">Residency</Label>
//               <Select
//                 value={selectedResidencyFilter}
//                 onValueChange={setSelectedResidencyFilter}
//               >
//                 <SelectTrigger
//                   id="msg-residency-filter"
//                   className="w-full mt-1"
//                 >
//                   <FilterIcon className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
//                   <SelectValue placeholder="All Residencies" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {uniqueResidencyTitlesForFilter.map((title) => (
//                     <SelectItem
//                       key={title}
//                       value={title}
//                       className="capitalize"
//                     >
//                       {title}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div>
//               <Label htmlFor="msg-status-filter">Status</Label>
//               <Select
//                 value={selectedStatusFilter}
//                 onValueChange={setSelectedStatusFilter}
//               >
//                 <SelectTrigger id="msg-status-filter" className="w-full mt-1">
//                   <FilterIcon className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
//                   <SelectValue placeholder="All Statuses" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {messageStatuses.map((status) => (
//                     <SelectItem
//                       key={status}
//                       value={status}
//                       className="capitalize"
//                     >
//                       {status}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//       {/* --- End Filters Card --- */}

//       <Card>
//         <CardHeader>
//           <CardTitle>Message Inbox</CardTitle>
//           <CardDescription>Messages are sorted newest first.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="w-[40px]"></TableHead>
//                   <TableHead className="w-[200px]">From</TableHead>
//                   <TableHead className="w-[250px]">Residency</TableHead>
//                   <TableHead>Message</TableHead>
//                   <TableHead className="w-[150px]">Received</TableHead>
//                   <TableHead className="w-[100px]">Status</TableHead>
//                   <TableHead className="text-right w-[100px]">
//                     Actions
//                   </TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {isLoading &&
//                   [...Array(5)].map((_, i) => (
//                     <TableRow key={`skel-msg-${i}`}>
//                       <TableCell>
//                         <Skeleton className="h-5 w-5 rounded-full" />
//                       </TableCell>
//                       <TableCell>
//                         <Skeleton className="h-5 w-24" />
//                         <Skeleton className="h-4 w-32 mt-1" />
//                       </TableCell>
//                       <TableCell>
//                         <Skeleton className="h-5 w-32" />
//                       </TableCell>
//                       <TableCell>
//                         <Skeleton className="h-5 w-40" />
//                         <Skeleton className="h-4 w-48 mt-1" />
//                       </TableCell>
//                       <TableCell>
//                         <Skeleton className="h-5 w-24" />
//                       </TableCell>
//                       <TableCell>
//                         <Skeleton className="h-6 w-20 rounded-full" />
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <Skeleton className="h-8 w-20" />
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 {!isLoading && error && (
//                   <TableRow>
//                     <TableCell
//                       colSpan={7}
//                       className="h-24 text-center text-destructive"
//                     >
//                       {error}
//                     </TableCell>
//                   </TableRow>
//                 )}
//                 {!isLoading && !error && filteredMessages.length === 0 && (
//                   <TableRow>
//                     <TableCell colSpan={7} className="h-24 text-center">
//                       No messages match filters.
//                     </TableCell>
//                   </TableRow>
//                 )}
//                 {!isLoading &&
//                   !error &&
//                   filteredMessages
//                     .sort(
//                       (a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)
//                     )
//                     .map((msg) => (
//                       <TableRow
//                         key={msg.id}
//                         className={
//                           msg.status === "New" ? "bg-muted/50 font-medium" : ""
//                         }
//                       >
//                         <TableCell>
//                           {msg.status === "New" ? (
//                             <MailIcon className="h-4 w-4 text-destructive" />
//                           ) : (
//                             <MessageSquare className="h-4 w-4 text-muted-foreground" />
//                           )}
//                         </TableCell>
//                         <TableCell>
//                           <div className="font-medium">{msg.studentName}</div>
//                           <div className="text-xs text-muted-foreground">
//                             {msg.studentEmail}
//                           </div>
//                         </TableCell>
//                         <TableCell className="text-sm">
//                           {msg.residencyTitle}
//                         </TableCell>
//                         <TableCell>
//                           <div className="font-medium">
//                             {msg.subject || "(No Subject)"}
//                           </div>
//                           <p className="text-sm text-muted-foreground truncate max-w-xs">
//                             {msg.message}
//                           </p>
//                         </TableCell>
//                         <TableCell className="text-xs">
//                           {formatRelativeTime(msg.receivedAt)}
//                         </TableCell>
//                         <TableCell>
//                           <Badge variant={getStatusVariant(msg.status)}>
//                             {msg.status}
//                           </Badge>
//                         </TableCell>
//                         <TableCell className="text-right">
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => viewMessageDetails(msg)}
//                           >
//                             <Eye className="mr-1 h-4 w-4" /> View
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//               </TableBody>
//             </Table>
//           </div>
//           {/* Placeholder: Pagination */}
//         </CardContent>
//       </Card>

//       {/* View/Reply Details Dialog */}
//       <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
//         <DialogContent className="sm:max-w-lg md:max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Message Description:</DialogTitle>
//             <DialogDescription>
//               From: {selectedMessage?.studentName} (
//               {selectedMessage?.studentEmail}) <br />
//               Regarding: {selectedMessage?.residencyTitle} <br />
//               Received: {formatRelativeTime(selectedMessage?.receivedAt)}
//             </DialogDescription>
//           </DialogHeader>
//           {selectedMessage && (
//             <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
//               <div className="border rounded-md p-4 bg-muted/30">
//                 <Label className="font-semibold text-sm">
//                   Student's Message
//                 </Label>
//                 <p className="mt-1 text-sm whitespace-pre-wrap">
//                   {selectedMessage.message}
//                 </p>
//               </div>
//               {selectedMessage.status === "Replied" &&
//                 selectedMessage.reply && (
//                   <div className="border rounded-md p-4 bg-green-50 border-green-200">
//                     <Label className="font-semibold text-sm text-green-700">
//                       Your Previous Reply
//                     </Label>
//                     <p className="mt-1 text-sm whitespace-pre-wrap">
//                       {selectedMessage.reply}
//                     </p>
//                   </div>
//                 )}
//               {selectedMessage.status !== "Replied" && (
//                 <div className="space-y-2">
//                   <Label htmlFor="replyContent">Your Reply</Label>
//                   <Textarea
//                     id="replyContent"
//                     value={replyContent}
//                     onChange={(e) => setReplyContent(e.target.value)}
//                     placeholder={`Type your reply to ${selectedMessage.studentName}...`}
//                     rows={5}
//                   />
//                 </div>
//               )}
//             </div>
//           )}
//           <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
//             <Button
//               variant="destructive"
//               size="sm"
//               onClick={() => handleDeleteMessage(selectedMessage.id)}
//               disabled={!selectedMessage}
//             >
//               <Trash2 className="mr-1 h-4 w-4" /> Delete
//             </Button>
//             <div className="flex gap-2">
//               <Button
//                 variant="outline"
//                 onClick={() => setIsDetailsDialogOpen(false)}
//               >
//                 Close
//               </Button>
//               {selectedMessage?.status !== "Replied" && (
//                 <Button
//                   className="bg-rose-500 hover:bg-rose-600"
//                   onClick={handleSendReply}
//                   disabled={!replyContent.trim() || !selectedMessage}
//                 >
//                   <Send className="mr-2 h-4 w-4" /> Send Reply
//                 </Button>
//               )}
//             </div>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       <Toaster />
//     </DashboardShell>
//   );
// }
