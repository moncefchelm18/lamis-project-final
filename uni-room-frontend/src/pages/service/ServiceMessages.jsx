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
  Mail,
  MailOpen,
  Archive,
  Eye,
  RefreshCw,
  Search as SearchIcon,
  FilterIcon,
  Inbox,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, isValid } from "date-fns";
import { useDebounce } from "@/hooks/use-debounce"; // Your debounce hook
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
} from "@/components/ui/alert"; // Renamed to avoid conflict

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

const messageStatuses = ["all", "unread", "read", "archived"];

export default function ServiceMessages() {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("unread"); // Default to unread

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchMessages = useCallback(async () => {
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

      // Backend endpoint for service manager to get their messages
      const response = await apiClient.get(
        `/messages/my-residencies?${params.toString()}`
      );
      if (response.data.success) {
        setMessages(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch messages");
      }
    } catch (err) {
      console.error("API Error fetchMessages:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unknown error occurred.";
      setError(errorMessage);
      // toast({ title: "Error Fetching Messages", description: errorMessage, variant: "destructive" });
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatusFilter, debouncedSearchTerm]); // Removed toast to avoid spamming on initial load/filter changes

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    setMessageDialogOpen(true);
    // If the message is 'unread', mark it as 'read'
    if (message.status === "unread") {
      try {
        // Use message.id which should be the string version of _id
        const response = await apiClient.put(`/messages/${message.id}/status`, {
          status: "read",
        });
        if (response.data.success) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === message.id ? { ...msg, status: "read" } : msg
            )
          );
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
    messageId,
    newStatus,
    messageIdentifier
  ) => {
    try {
      const response = await apiClient.put(`/messages/${messageId}/status`, {
        status: newStatus,
      });
      if (response.data.success && response.data.data) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, status: newStatus } : msg
          )
        );
        toast({
          title: `Message ${newStatus === "read" ? "Read" : "Archived"}`,
          description: `Message from ${
            messageIdentifier || "student"
          } has been marked as ${newStatus}.`,
        });
        if (selectedMessage && selectedMessage.id === messageId) {
          setSelectedMessage((prev) => ({ ...prev, status: newStatus })); // Update selected message too
        }
        // If current filter is 'unread' and message is marked 'read', it might disappear from list.
        // Consider if a re-fetch is needed or if the list should update optimistically.
        // For now, optimistic update. If it was 'unread' and marked read, it stays visually until next filter change/refresh.
        // Or, if you want it to disappear immediately from 'unread' filter:
        if (selectedStatusFilter === "unread" && newStatus === "read") {
          setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        }
        if (selectedStatusFilter !== "all" && newStatus === "archived") {
          setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
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

  return (
    <DashboardShell role="service">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Student Messages
          </h1>
          <p className="text-muted-foreground mt-1">
            View and respond to inquiries from students regarding your
            residencies.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchMessages}
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
                  placeholder="Sender email, content..."
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
                  {messageStatuses.map((status) => (
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
            Message Inbox
          </CardTitle>
          <CardDescription>
            Messages for your managed residencies. Current filter:{" "}
            <Badge variant="outline" className="capitalize ml-1">
              {selectedStatusFilter}
            </Badge>
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
                  <TableHead className="w-[50px]">Status</TableHead>
                  <TableHead className="w-[250px]">
                    From (Student / Email)
                  </TableHead>
                  <TableHead>Subject/Preview</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Residency
                  </TableHead>
                  <TableHead className="hidden lg:table-cell w-[180px]">
                    Received
                  </TableHead>
                  <TableHead className="text-right w-[150px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading &&
                  [...Array(5)].map((_, i) => (
                    <TableRow key={`skel-msg-${i}`}>
                      <TableCell>
                        <Skeleton className="h-5 w-5 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-48" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Skeleton className="h-5 w-28" />
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Skeleton className="h-8 w-20 inline-block" />
                      </TableCell>
                    </TableRow>
                  ))}
                {!isLoading && !error && messages.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
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
                      key={msg.id}
                      className={`${
                        msg.status === "unread"
                          ? "bg-primary/5 dark:bg-primary/10 font-medium"
                          : ""
                      } hover:bg-muted/50`}
                    >
                      <TableCell className="text-center">
                        {msg.status === "unread" ? (
                          <Mail
                            className="h-5 w-5 text-blue-500"
                            title="Unread"
                          />
                        ) : msg.status === "read" ? (
                          <MailOpen
                            className="h-5 w-5 text-slate-500"
                            title="Read"
                          />
                        ) : (
                          <Archive
                            className="h-5 w-5 text-slate-400"
                            title="Archived"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="truncate">
                          {msg.studentName && msg.studentName !== "N/A"
                            ? msg.studentName
                            : msg.senderEmail}
                        </p>
                        {msg.studentName &&
                          msg.studentName !== "N/A" &&
                          msg.senderEmail !== msg.studentRegisteredEmail && (
                            <p className="text-xs text-muted-foreground truncate">
                              ({msg.senderEmail})
                            </p>
                          )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-left block"
                          onClick={() => handleViewMessage(msg)}
                        >
                          <p className="truncate font-normal max-w-xs">
                            {msg.content}
                          </p>
                        </Button>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                        {msg.residencyTitle}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                        {formatDate(msg.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewMessage(msg)}
                          className="mr-1"
                        >
                          <Eye className="mr-1 h-4 w-4" /> View
                        </Button>
                        {msg.status !== "archived" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() =>
                              handleUpdateMessageStatus(
                                msg.id,
                                "archived",
                                msg.studentName || msg.senderEmail
                              )
                            }
                          >
                            <Archive className="mr-1 h-3.5 w-3.5" /> Archive
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-lg md:max-w-xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">Message Details</DialogTitle>
            {selectedMessage && (
              <DialogDescription>
                From:{" "}
                {selectedMessage.studentName &&
                selectedMessage.studentName !== "N/A"
                  ? `${selectedMessage.studentName} (${selectedMessage.senderEmail})`
                  : selectedMessage.senderEmail}{" "}
                <br />
                For Residency: {selectedMessage.residencyTitle} | Received:{" "}
                {formatDate(selectedMessage.createdAt)}
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedMessage && (
            <>
              <Separator />
              <div className="py-2 pr-2 space-y-3 flex-grow overflow-y-auto">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Student Name (Registered)
                  </Label>
                  <p>
                    {selectedMessage.studentName &&
                    selectedMessage.studentName !== "N/A" ? (
                      selectedMessage.studentName
                    ) : (
                      <span className="italic text-sm">
                        Not a registered user or N/A
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Sender's Contact Email
                  </Label>
                  <p className="text-blue-600 dark:text-blue-400 hover:underline">
                    <a href={`mailto:${selectedMessage.senderEmail}`}>
                      {selectedMessage.senderEmail}
                    </a>
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Registered Email (if different)
                  </Label>
                  <p>
                    {selectedMessage.studentRegisteredEmail &&
                    selectedMessage.studentRegisteredEmail !== "N/A" &&
                    selectedMessage.studentRegisteredEmail !==
                      selectedMessage.senderEmail ? (
                      selectedMessage.studentRegisteredEmail
                    ) : (
                      <span className="italic text-sm">
                        Same as sender or N/A
                      </span>
                    )}
                  </p>
                </div>
                <Separator className="my-3" />
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Message Content
                  </Label>
                  <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-md border dark:border-slate-700 whitespace-pre-wrap text-sm min-h-[100px]">
                    {selectedMessage.content}
                  </div>
                </div>
              </div>
              <Separator />
              <DialogFooter className="pt-4">
                {selectedMessage.status !== "archived" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleUpdateMessageStatus(
                        selectedMessage.id,
                        "archived",
                        selectedMessage.studentName ||
                          selectedMessage.senderEmail
                      )
                    }
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Move to Archive
                  </Button>
                )}
                {selectedMessage.status === "unread" && ( // Should already be marked read on open, but as an explicit action
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleUpdateMessageStatus(
                        selectedMessage.id,
                        "read",
                        selectedMessage.studentName ||
                          selectedMessage.senderEmail
                      )
                    }
                  >
                    <MailOpen className="mr-2 h-4 w-4" />
                    Mark as Read
                  </Button>
                )}
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

// export default function ServiceMessages() {
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
//     <DashboardShell role="service">
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
