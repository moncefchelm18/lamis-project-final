import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input as OriginalInput } from "@/components/ui/input";
import { Textarea as OriginalTextarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardShell from "@/components/layout/DashboardShell";
import {
  ArrowLeft,
  MessageCircle,
  BedDouble,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// --- Placeholder Image Handling ---
import r1 from "@/assets/images/residencies/r1.png";
import r2 from "@/assets/images/residencies/r2.png";
import r3 from "@/assets/images/residencies/r3.png";

const placeholderImages = [r1, r2, r3];

const getRandomPlaceholderImage = (id = "default") => {
  if (!id || typeof id !== "string") return placeholderImages[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return placeholderImages[Math.abs(hash) % placeholderImages.length];
};
// --- End Placeholder Image Handling ---

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

const initialBookingFormData = {
  matriculeBac: "",
  anneeBac: "",
  sex: "",
  dateNaissance: "",
  filiere: "",
  anneeEtude: "",
  wilayaResidenceStudent: "",
  notes: "",
};

const Input = React.memo(OriginalInput);
const Textarea = React.memo(OriginalTextarea);

const ROOMS_PER_PAGE_RANGE = 100; // Number of rooms per selectable range

export default function StudentResidencyDetail() {
  const { residencyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [residency, setResidency] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  // State for pagination approach
  const [selectedRoomRange, setSelectedRoomRange] = useState(""); // e.g., "1-100"
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(""); // Specific room number

  const [bookingFormData, setBookingFormData] = useState(
    initialBookingFormData
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchResidencyDetails = useCallback(async () => {
    if (!residencyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const residencyResponse = await apiClient.get(
        `/residencies/student/${residencyId}` // This endpoint must return residency.totalRoomCount and residency.bookedRoomNumbers
      );
      if (residencyResponse.data.success) {
        setResidency(residencyResponse.data.data);
      } else {
        throw new Error(
          residencyResponse.data.message || "Could not fetch residency details."
        );
      }
    } catch (err) {
      console.error("API Error fetchResidencyDetails:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unknown error occurred.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [residencyId, toast]);

  useEffect(() => {
    fetchResidencyDetails();
  }, [fetchResidencyDetails]);

  // Calculate room ranges for the first dropdown
  const roomRanges = useMemo(() => {
    if (!residency || !residency.totalRoomCount) return [];
    const total = parseInt(residency.totalRoomCount, 10);
    if (isNaN(total) || total <= 0) return [];
    const ranges = [];
    for (let i = 0; i < total; i += ROOMS_PER_PAGE_RANGE) {
      const start = i + 1;
      const end = Math.min(i + ROOMS_PER_PAGE_RANGE, total);
      ranges.push({ value: `${start}-${end}`, label: `Rooms ${start}-${end}` });
    }
    return ranges;
  }, [residency]);

  // Calculate specific available rooms within the selected range for the second dropdown
  const roomsInSelectedRange = useMemo(() => {
    if (!selectedRoomRange || !residency || !residency.totalRoomCount)
      return [];

    const [startStr, endStr] = selectedRoomRange.split("-");
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);

    if (isNaN(start) || isNaN(end)) return [];

    const bookedNumbers = residency.bookedRoomNumbers?.map(String) || [];
    const options = [];
    for (let i = start; i <= end; i++) {
      if (!bookedNumbers.includes(String(i))) {
        options.push({ value: String(i), label: `Room ${i}` });
      }
    }
    return options;
  }, [selectedRoomRange, residency]);

  const handleContactSubmit = useCallback(async () => {
    // ... (same as before)
    if (!contactMessage.trim() || !contactEmail.trim() || !residency) {
      toast({
        title: "Missing Information",
        description:
          "Please enter your email, a message, and ensure residency details are loaded.",
        variant: "destructive",
      });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(contactEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        residencyId: residency.id || residency._id,
        content: contactMessage,
        email: contactEmail,
      };
      const response = await apiClient.post(
        "/messages/contact-residency",
        payload
      );
      if (response.data.success) {
        toast({
          title: "Message Sent",
          description: "Your message has been sent successfully.",
        });
        setIsContactDialogOpen(false);
        setContactMessage("");
        setContactEmail("");
      } else {
        throw new Error(response.data.message || "Failed to send message.");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unknown error occurred.";
      toast({
        title: "Error Sending Message",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [contactMessage, contactEmail, residency, toast]);

  const handleBookingFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setBookingFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleBookingSelectChange = useCallback((field, value) => {
    setBookingFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleBookRoomSubmit = useCallback(async () => {
    // ... (same as before, uses selectedRoomForBooking)
    if (!selectedRoomForBooking || !residency) {
      toast({
        title: "Selection Missing",
        description: "Please select a specific room number.",
        variant: "destructive",
      });
      return;
    }
    for (const key in initialBookingFormData) {
      if (key !== "notes" && !bookingFormData[key]) {
        toast({
          title: "Incomplete Form",
          description: `Please fill in all required fields. Missing: ${key
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()}`,
          variant: "destructive",
        });
        return;
      }
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...bookingFormData,
        residencyId: residency.id || residency._id,
        roomNumber: selectedRoomForBooking,
      };
      const response = await apiClient.post(
        "/booking-requests/student",
        payload
      );
      if (response.data.success) {
        toast({
          title: "Booking Request Submitted",
          description:
            response.data.message || "Your application is being processed.",
        });
        setIsBookingDialogOpen(false);
        setSelectedRoomForBooking("");
        setSelectedRoomRange(""); // Reset range as well
        setBookingFormData(initialBookingFormData);
        fetchResidencyDetails(); // Re-fetch to update booked rooms
      } else {
        throw new Error(
          response.data.message || "Failed to submit booking application."
        );
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unknown error occurred.";
      toast({
        title: "Booking Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedRoomForBooking,
    residency,
    bookingFormData,
    toast,
    fetchResidencyDetails,
  ]);

  // --- Loading and Error States ---
  if (isLoading) {
    return (
      <DashboardShell role="student">
        <div className="container px-4 md:px-6 py-8">
          <Skeleton className="h-8 w-1/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error && !residency) {
    return (
      <DashboardShell role="student">
        <div className="container px-4 md:px-6 py-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Failed to Load Residency
          </h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild variant="outline">
            <Link to="/dashboard/student/residencies">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Residencies
            </Link>
          </Button>
        </div>
      </DashboardShell>
    );
  }

  if (!residency) {
    return (
      <DashboardShell role="student">
        <div className="container px-4 md:px-6 py-8 text-center">
          <p className="text-muted-foreground">
            Residency details not available or not found.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/dashboard/student/residencies">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Residencies
            </Link>
          </Button>
        </div>
      </DashboardShell>
    );
  }

  const mainImageId = residency.id || residency._id || "default_residency";

  return (
    <DashboardShell role="student">
      <div className="container px-4 md:px-6 py-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {/* --- Residency Info Cards (Images, Description) --- */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{residency.title}</CardTitle>
                <CardDescription className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" /> {residency.wilaya}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                  <img
                    src={
                      residency.images && residency.images.length > 0
                        ? residency.images[0]
                        : getRandomPlaceholderImage(mainImageId + "_main")
                    }
                    alt={`${residency.title} main`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = getRandomPlaceholderImage(
                        mainImageId + "_main_fallback"
                      );
                    }}
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Room Previews (Sample)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(residency.roomImages && residency.roomImages.length > 0
                    ? residency.roomImages
                    : [
                        getRandomPlaceholderImage(mainImageId + "_room1"),
                        getRandomPlaceholderImage(mainImageId + "_room2"),
                        getRandomPlaceholderImage(mainImageId + "_room3"),
                      ]
                  )
                    .slice(0, 3)
                    .map((imgSrc, idx) => (
                      <div
                        key={imgSrc + idx}
                        className="aspect-square bg-muted rounded overflow-hidden"
                      >
                        <img
                          src={imgSrc}
                          alt={`Room view ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = getRandomPlaceholderImage(
                              mainImageId + `_room_fallback${idx}`
                            );
                          }}
                        />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Description & Amenities</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p>{residency.description}</p>
                {residency.amenities && residency.amenities.length > 0 && (
                  <>
                    <h4 className="font-semibold mt-4">Amenities:</h4>
                    <ul className="list-disc list-inside">
                      {residency.amenities.map((amenity, index) => (
                        <li key={amenity + index}>{amenity}</li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* --- Book a Room Card with Paginated Selects --- */}
            <Card>
              <CardHeader>
                <CardTitle>Book a Room</CardTitle>
                <CardDescription>
                  Select a room range, then a specific room number.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* First Select: Room Range */}
                <div>
                  <Label htmlFor="room-range-select">Select Room Range</Label>
                  <Select
                    onValueChange={(value) => {
                      setSelectedRoomRange(value);
                      setSelectedRoomForBooking(""); // Reset specific room when range changes
                    }}
                    value={selectedRoomRange}
                    disabled={!residency || residency.totalRoomCount === 0}
                  >
                    <SelectTrigger id="room-range-select">
                      <SelectValue placeholder="Choose a room range..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roomRanges.length > 0 ? (
                        roomRanges.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                          No room ranges available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Second Select: Specific Room Number (conditional) */}
                {selectedRoomRange && (
                  <div>
                    <Label htmlFor="room-number-select">
                      Select Specific Room Number
                    </Label>
                    <Select
                      onValueChange={setSelectedRoomForBooking}
                      value={selectedRoomForBooking}
                    >
                      <SelectTrigger id="room-number-select">
                        <SelectValue placeholder="Choose a room number..." />
                      </SelectTrigger>
                      <SelectContent>
                        {roomsInSelectedRange.length > 0 ? (
                          roomsInSelectedRange.map((room) => (
                            <SelectItem key={room.value} value={room.value}>
                              {room.label}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                            No available rooms in this range
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {!selectedRoomForBooking &&
                  selectedRoomRange &&
                  roomsInSelectedRange.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Please select a specific room number to proceed.
                    </p>
                  )}
              </CardContent>
              <CardFooter>
                <Dialog
                  open={isBookingDialogOpen}
                  onOpenChange={setIsBookingDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white"
                      disabled={!selectedRoomForBooking || isSubmitting} // Disabled if no specific room is chosen
                    >
                      <BedDouble className="mr-2 h-4 w-4" /> Apply for Room{" "}
                      {selectedRoomForBooking}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md md:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Room Booking Application</DialogTitle>
                      <DialogDescription>
                        Provide your details to apply for Room Number:{" "}
                        {selectedRoomForBooking || "Selected Room"}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="matriculeBac">Matricule BAC*</Label>
                          <Input
                            id="matriculeBac"
                            name="matriculeBac"
                            value={bookingFormData.matriculeBac}
                            onChange={handleBookingFormChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="anneeBac">Année BAC*</Label>
                          <Input
                            id="anneeBac"
                            name="anneeBac"
                            type="text"
                            placeholder="YYYY or YYYY-YYYY"
                            value={bookingFormData.anneeBac}
                            onChange={handleBookingFormChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="sex">Sex*</Label>
                          <Select
                            name="sex"
                            value={bookingFormData.sex}
                            onValueChange={(val) =>
                              handleBookingSelectChange("sex", val)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select sex..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="dateNaissance">
                            Date de Naissance*
                          </Label>
                          <Input
                            id="dateNaissance"
                            name="dateNaissance"
                            type="date"
                            value={bookingFormData.dateNaissance}
                            onChange={handleBookingFormChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="filiere">Filière (Major)*</Label>
                          <Input
                            id="filiere"
                            name="filiere"
                            value={bookingFormData.filiere}
                            onChange={handleBookingFormChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="anneeEtude">Année d'Étude*</Label>
                          <Input
                            id="anneeEtude"
                            name="anneeEtude"
                            placeholder="e.g., 1st, L1, M2"
                            value={bookingFormData.anneeEtude}
                            onChange={handleBookingFormChange}
                            required
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor="wilayaResidenceStudent">
                            Wilaya de Résidence (Origin)*
                          </Label>
                          <Input
                            id="wilayaResidenceStudent"
                            name="wilayaResidenceStudent"
                            value={bookingFormData.wilayaResidenceStudent}
                            onChange={handleBookingFormChange}
                            required
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor="notes">
                            Additional Notes (Optional)
                          </Label>
                          <Textarea
                            id="notes"
                            name="notes"
                            value={bookingFormData.notes}
                            onChange={handleBookingFormChange}
                            placeholder="Any specific requests or information..."
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        type="button"
                        onClick={handleBookRoomSubmit}
                        className="bg-rose-500 hover:bg-rose-600 text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>

            {/* --- Contact Card --- */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Residence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Have questions? Get in touch directly.
                </p>
              </CardContent>
              <CardFooter>
                <Dialog
                  open={isContactDialogOpen}
                  onOpenChange={setIsContactDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full" disabled={isSubmitting}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Contact Residence
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Contact {residency.title}</DialogTitle>
                      <DialogDescription>
                        Send a message to the residence.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div>
                        <Label htmlFor="contactEmail">Your Email*</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactMessage">Your Message*</Label>
                        <Textarea
                          id="contactMessage"
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="Type your message here..."
                          rows={5}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" disabled={isSubmitting}>
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        onClick={handleContactSubmit}
                        disabled={
                          !contactMessage.trim() ||
                          !contactEmail.trim() ||
                          isSubmitting
                        }
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      <Toaster />
    </DashboardShell>
  );
}
