// Fix for immediate display of newly added residency

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import DashboardShell from "@/components/layout/DashboardShell";
import { Plus, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import axios from "axios";

// Mock Image Placeholders
import r1 from "@/assets/images/residencies/r1.png";
import r2 from "@/assets/images/residencies/r2.png";
import r3 from "@/assets/images/residencies/r3.png";
const placeholderImages = [r1, r2, r3];

// Custom hook for debouncing values
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Memoize this function since it's only dependent on the id parameter
const getRandomPlaceholderImage = (id) => {
  let hash = 0;
  if (typeof id !== "string") id = String(id);
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return placeholderImages[Math.abs(hash) % placeholderImages.length];
};

// Move constants outside the component to prevent recreating them on each render
const allWilayas = [
  "Adrar",
  "Chlef",
  "Laghouat",
  "Oum El Bouaghi",
  "Batna",
  "Béjaïa",
  "Biskra",
  "Béchar",
  "Blida",
  "Bouira",
  "Tamanrasset",
  "Tébessa",
  "Tlemcen",
  "Tiaret",
  "Tizi Ouzou",
  "Alger",
  "Djelfa",
  "Jijel",
  "Sétif",
  "Saïda",
  "Skikda",
  "Sidi Bel Abbès",
  "Annaba",
  "Guelma",
  "Constantine",
  "Médéa",
  "Mostaganem",
  "M'Sila",
  "Mascara",
  "Ouargla",
  "Oran",
  "El Bayadh",
  "Illizi",
  "Bordj Bou Arréridj",
  "Boumerdès",
  "El Tarf",
  "Tindouf",
  "Tissemsilt",
  "El Oued",
  "Khenchela",
  "Souk Ahras",
  "Tipaza",
  "Mila",
  "Aïn Defla",
  "Naâma",
  "Aïn Témouchent",
  "Ghardaïa",
  "Relizane",
  "Timimoun",
  "Bordj Badji Mokhtar",
  "Ouled Djellal",
  "Béni Abbès",
  "In Salah",
  "In Guezzam",
  "Touggourt",
  "Djanet",
  "El M'Ghair",
  "El Meniaa",
];

const predefinedAmenities = [
  "WiFi",
  "Kitchen",
  "Laundry",
  "Air Conditioning",
  "Heating",
  "Private Bathroom",
  "Study Desk",
  "Wardrobe",
  "Security",
  "Parking",
  "Elevator",
  "Common Room",
  "Hot Water",
  "Cleaning Service",
];

const API_URL = "http://localhost:5000/api/residencies";

const getInitialAmenitiesState = () => {
  return predefinedAmenities.reduce((acc, amenity) => {
    acc[amenity] = false;
    return acc;
  }, {});
};

const initialFormData = {
  title: "",
  wilaya: "",
  type: "Room", // Fixed
  amenities: getInitialAmenitiesState(),
  description: "",
  images: "",
  totalRoomCount: 0,
};

export default function ServiceManageResidency() {
  const { toast } = useToast();
  const [residencies, setResidencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingResidency, setEditingResidency] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add a refresh trigger

  // Function to fetch residencies
  const fetchResidencies = useCallback(async () => {
    try {
      setIsLoading(true);
      // Get user's token from localStorage or your auth context
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication token not found");
        setIsLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // We'll fetch all residencies but only display those belonging to the current service provider
      const response = await axios.get(API_URL, config);

      // Filter for residencies belonging to the current user
      // The backend might already filter these, but we can add extra filtering if needed
      setResidencies(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching residencies:", err);
      setError(err.response?.data?.message || "Failed to fetch residencies");
      setResidencies([]); // Ensure residencies is always an array
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch residencies on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchResidencies();
  }, [fetchResidencies, refreshTrigger]);

  // Memoize the derived state to prevent recalculation on every render
  const canAddResidency = useMemo(
    () => (residencies || []).length === 0,
    [residencies]
  );

  // Memoize filtered residencies to prevent recalculation on every render
  // Fixed the filtering to safely handle undefined/null values
  const filteredResidencies = useMemo(() => {
    if (!Array.isArray(residencies)) return [];

    return residencies.filter((res) => {
      if (!res) return false;

      const titleMatch =
        res.title &&
        res.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const wilayaMatch =
        res.wilaya &&
        res.wilaya.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      return titleMatch || wilayaMatch;
    });
  }, [residencies, debouncedSearchTerm]);

  const handleOpenFormDialog = useCallback(
    (residencyToEdit = null) => {
      setError(null);
      setFormError(null);

      if (residencyToEdit) {
        // Editing existing
        setEditingResidency(residencyToEdit);
        const currentAmenitiesState = predefinedAmenities.reduce(
          (acc, amenity) => {
            acc[amenity] = (residencyToEdit.amenities || []).includes(amenity);
            return acc;
          },
          {}
        );
        setFormData({
          title: residencyToEdit.title || "",
          wilaya: residencyToEdit.wilaya || "",
          type: residencyToEdit.type || "Room", // Should always be "Room"
          description: residencyToEdit.description || "",
          images: Array.isArray(residencyToEdit.images)
            ? residencyToEdit.images.join(", ")
            : "",
          totalRoomCount: residencyToEdit.totalRoomCount || 0,
          amenities: currentAmenitiesState,
        });
        setIsFormDialogOpen(true); // Open dialog for editing
      } else {
        // Attempting to add
        if (!canAddResidency) {
          toast({
            title: "Action Denied",
            description:
              "Only one residency can be managed. Please edit or delete the existing one to add a new one.",
            variant: "warning",
          });
          return; // Do not open dialog
        }
        setEditingResidency(null);
        setFormData({
          ...initialFormData,
          amenities: getInitialAmenitiesState(),
        });
        setIsFormDialogOpen(true); // Open dialog for adding
      }
    },
    [canAddResidency, toast]
  );

  const handleFormChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseFloat(value) || 0
          : value,
    }));
  }, []);

  const handleAmenityChange = useCallback((amenityName, checked) => {
    setFormData((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenityName]: checked,
      },
    }));
  }, []);

  const handleFormSelectChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleFormSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError(null);
      setIsSubmitting(true);
      if (!formData?.title || !formData?.wilaya) {
        setFormError("Title and Wilaya are required.");
        setIsSubmitting(false);
        return;
      }

      const selectedAmenities = Object.entries(formData?.amenities || {})
        ?.filter(([_, value]) => value)
        .map(([key]) => key);

      const submissionData = {
        title: formData.title,
        wilaya: formData.wilaya,
        type: "Room", // Fixed
        description: formData.description,
        totalRoomCount: formData.totalRoomCount,
        amenities: selectedAmenities,
        images: (formData.images || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      // Ensure images get a placeholder if none provided
      if (submissionData.images.length === 0) {
        submissionData.images = [
          getRandomPlaceholderImage(
            submissionData.title || `new-${Date.now()}`
          ),
        ];
      }

      try {
        // Get user's token from localStorage or your auth context
        const token = localStorage.getItem("token");

        if (!token) {
          setFormError("Authentication token not found");
          setIsSubmitting(false);
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

        let response;

        if (editingResidency) {
          // Editing existing residency
          response = await axios.put(
            `${API_URL}/${editingResidency._id}`,
            submissionData,
            config
          );

          console.log("Updated residency:", response.data.data);

          // Immediately update the state with the updated residency
          setResidencies((prev) =>
            Array.isArray(prev)
              ? prev.map((r) =>
                  r._id === editingResidency._id ? response.data.data : r
                )
              : [response.data.data]
          );

          toast({
            title: "Residency Updated",
            description:
              "Your residency details have been updated successfully.",
          });
        } else {
          // Adding new residency
          if (!canAddResidency) {
            setFormError("Cannot add residency. One already exists.");
            toast({
              title: "Error: Residency already exists",
              variant: "destructive",
            });
            setIsFormDialogOpen(false);
            setIsSubmitting(false);
            return;
          }

          response = await axios.post(API_URL, submissionData, config);

          // Immediately update the state with the new residency
          setResidencies([response.data.data]);

          toast({
            title: "Residency Added",
            description: "Your residency has been created successfully.",
          });
        }

        setIsFormDialogOpen(false);

        // Trigger a refresh to ensure the data is up-to-date
        setRefreshTrigger((prev) => prev + 1);
      } catch (err) {
        console.error("Error saving residency:", err);
        setFormError(
          err.response?.data?.message ||
            "Failed to save residency. Please try again."
        );
        toast({
          title: "Error",
          description:
            err.response?.data?.message || "An error occurred while saving",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, editingResidency, canAddResidency, toast]
  );

  const handleDeleteResidency = useCallback(
    async (residencyId) => {
      if (
        !window.confirm(
          "Are you sure you want to delete this residency? This will allow you to add a new one."
        )
      )
        return;

      try {
        // Get user's token from localStorage or your auth context
        const token = localStorage.getItem("token");

        if (!token) {
          toast({
            title: "Error",
            description: "Authentication token not found",
            variant: "destructive",
          });
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        await axios.delete(`${API_URL}/${residencyId}`, config);

        // Immediately update the state
        setResidencies([]);

        toast({
          title: "Residency Deleted",
          description: "Your residency has been removed successfully.",
          variant: "default",
        });

        // Trigger a refresh to ensure the data is up-to-date
        setRefreshTrigger((prev) => prev + 1);
      } catch (err) {
        console.error("Error deleting residency:", err);
        toast({
          title: "Error",
          description:
            err.response?.data?.message || "Failed to delete residency",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // Memoize the Amenities rendering to prevent recreating the checkboxes on every render
  const amenitiesCheckboxes = useMemo(
    () => (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 border rounded-md">
        {predefinedAmenities.map((amenity) => (
          <div key={amenity} className="flex items-center space-x-2">
            <Checkbox
              id={`amenity-${amenity}`}
              checked={!!(formData.amenities && formData.amenities[amenity])}
              onCheckedChange={(checked) =>
                handleAmenityChange(amenity, !!checked)
              }
            />
            <Label
              htmlFor={`amenity-${amenity}`}
              className="font-normal text-sm"
            >
              {amenity}
            </Label>
          </div>
        ))}
      </div>
    ),
    [formData.amenities, handleAmenityChange]
  );

  // Memoize the Wilaya select options to prevent recreating them on every render
  const wilayaOptions = useMemo(
    () =>
      allWilayas.map((w) => (
        <SelectItem key={w} value={w}>
          {w}
        </SelectItem>
      )),
    []
  );

  return (
    <DashboardShell role="service">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Manage Residency</h1>
        {canAddResidency && (
          <Button
            className="bg-rose-500 hover:bg-rose-600"
            onClick={() => handleOpenFormDialog()} // No argument means "add" mode
          >
            <Plus className="mr-2 h-4 w-4" /> Add Residency
          </Button>
        )}
      </div>
      <p className="text-muted-foreground mb-6">
        {canAddResidency
          ? "Add the university residency you manage."
          : "Edit or remove the university residency you manage."}
      </p>

      <Card>
        <CardHeader>
          <CardTitle>
            {canAddResidency ? "No Residency Managed" : "Managed Residency"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Wilaya</TableHead>
                  <TableHead>Number of Rooms</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      Loading...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && error && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center h-24 text-destructive"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && !error && filteredResidencies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      {canAddResidency
                        ? "No residency has been added yet."
                        : "No residency found matching search."}
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  !error &&
                  filteredResidencies.map((res) => (
                    <TableRow key={res._id}>
                      <TableCell className="font-medium">{res.title}</TableCell>
                      <TableCell>{res.wilaya}</TableCell>
                      <TableCell>{res.totalRoomCount}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleOpenFormDialog(res)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteResidency(res._id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isFormDialogOpen}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) setIsFormDialogOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingResidency ? "Edit" : "Add"} Residency
            </DialogTitle>
            <DialogDescription>
              {editingResidency
                ? "Update the details of your managed residency."
                : "Enter the details for the residency you manage."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title*</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="wilaya">Wilaya*</Label>
                <Select
                  name="wilaya"
                  value={formData.wilaya}
                  onValueChange={(val) => handleFormSelectChange("wilaya", val)}
                >
                  <SelectTrigger id="wilaya">
                    <SelectValue placeholder="Select Wilaya" />
                  </SelectTrigger>
                  <SelectContent>{wilayaOptions}</SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="totalRoomCount">Number of Rooms</Label>
                <Input
                  id="totalRoomCount"
                  name="totalRoomCount"
                  type="number"
                  value={formData.totalRoomCount}
                  onChange={handleFormChange}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                />
              </div>

              <div className="sm:col-span-2">
                <Label>Amenities</Label>
                {amenitiesCheckboxes}
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="images">
                  Image URLs (comma-separated, placeholder for now)
                </Label>
                <Textarea
                  id="images"
                  name="images"
                  value={formData.images}
                  onChange={handleFormChange}
                  placeholder="http://example.com/img1.jpg, ..."
                  rows={2}
                />
              </div>
            </div>
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => !isSubmitting && setIsFormDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-rose-500 hover:bg-rose-600"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : editingResidency
                  ? "Save Changes"
                  : "Add Residency"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Toaster />
    </DashboardShell>
  );
}
