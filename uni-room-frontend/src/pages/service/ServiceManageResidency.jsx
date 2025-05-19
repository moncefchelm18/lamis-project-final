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
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Search as SearchIcon,
  AlertTriangle,
  Eye,
  ImageIcon,
  ArrowLeft,
  ImagePlus, // Using for general dropzone icon
  X as XIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import axios from "axios";

// Mock Image Placeholders
import r1 from "@/assets/images/residencies/r1.png";
import r2 from "@/assets/images/residencies/r2.png";
import r3 from "@/assets/images/residencies/r3.png";
const placeholderImages = [r1, r2, r3];

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const getRandomPlaceholderImage = (id, index = 0) => {
  let hash = 0;
  const strId = String(id) + String(index);
  for (let i = 0; i < strId.length; i++) {
    const char = strId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return placeholderImages[Math.abs(hash) % placeholderImages.length];
};

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
  return predefinedAmenities.reduce(
    (acc, amenity) => ({ ...acc, [amenity]: false }),
    {}
  );
};

const initialFormData = {
  title: "",
  wilaya: "",
  type: "Room",
  amenities: getInitialAmenitiesState(),
  description: "",
  imageUrlsString: "", // Stores comma-separated URLs (pasted or dropped)
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedResidencyForDetails, setSelectedResidencyForDetails] =
    useState(null);
  const [currentDetailImageIndex, setCurrentDetailImageIndex] = useState(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const fetchResidencies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_URL, config);
      setResidencies(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch residencies");
      setResidencies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResidencies();
  }, [fetchResidencies, refreshTrigger]);

  const canAddResidency = useMemo(
    () => (residencies || []).length === 0,
    [residencies]
  );

  const filteredResidencies = useMemo(() => {
    if (!Array.isArray(residencies)) return [];
    return residencies.filter((res) => {
      if (!res) return false;
      const term = debouncedSearchTerm.toLowerCase();
      return (
        res.title?.toLowerCase().includes(term) ||
        res.wilaya?.toLowerCase().includes(term)
      );
    });
  }, [residencies, debouncedSearchTerm]);

  const handleOpenFormDialog = useCallback(
    (residencyToEdit = null) => {
      setFormError(null);
      if (residencyToEdit) {
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
          type: "Room",
          description: residencyToEdit.description || "",
          imageUrlsString: Array.isArray(residencyToEdit.images)
            ? residencyToEdit.images.join(", ")
            : "",
          totalRoomCount: residencyToEdit.totalRoomCount || 0,
          amenities: currentAmenitiesState,
        });
      } else {
        if (!canAddResidency) {
          toast({
            title: "Action Denied",
            description: "Only one residency can be managed.",
            variant: "warning",
          });
          return;
        }
        setEditingResidency(null);
        setFormData({
          ...initialFormData,
          amenities: getInitialAmenitiesState(),
        });
      }
      setIsFormDialogOpen(true);
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
      amenities: { ...prev.amenities, [amenityName]: checked },
    }));
  }, []);

  const handleFormSelectChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const isValidImageUrl = (url) => {
    if (typeof url !== "string") return false;
    return (
      url.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i) != null ||
      url.startsWith("data:image") ||
      url.includes("images.unsplash.com") ||
      url.includes("pexels.com") ||
      url.includes("picsum.photos") ||
      url.startsWith("http://") ||
      url.startsWith("https://")
    ); // General HTTP/HTTPS check
  };

  const handleImageDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
    let foundUrl = null;

    if (event.dataTransfer.types.includes("text/html")) {
      const html = event.dataTransfer.getData("text/html");
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const imgTag = tempDiv.querySelector("img");
      if (imgTag?.src) foundUrl = imgTag.src.trim();
    }
    if (!foundUrl && event.dataTransfer.types.includes("text/uri-list")) {
      const uriList = event.dataTransfer.getData("text/uri-list");
      if (uriList) {
        const urls = uriList.split(/[\r\n]+/);
        foundUrl = urls.find((url) => isValidImageUrl(url.trim()))?.trim();
      }
    }
    if (!foundUrl && event.dataTransfer.types.includes("text/plain")) {
      const plainText = event.dataTransfer.getData("text/plain").trim();
      if (isValidImageUrl(plainText)) foundUrl = plainText;
    }

    if (foundUrl && isValidImageUrl(foundUrl)) {
      setFormData((prev) => {
        const currentUrlsArray = prev.imageUrlsString
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (!currentUrlsArray.includes(foundUrl)) {
          const newUrlsString =
            currentUrlsArray.length > 0
              ? [...currentUrlsArray, foundUrl].join(", ")
              : foundUrl;
          return { ...prev, imageUrlsString: newUrlsString };
        }
        toast({
          title: "URL Already Added",
          description: "This image URL is already in the list.",
          variant: "info",
        });
        return prev;
      });
      toast({
        title: "Image URL Added",
        description: "Dropped image URL added to the list.",
      });
    } else if (
      event.dataTransfer.files?.length > 0 &&
      event.dataTransfer.files[0].type.startsWith("image/")
    ) {
      toast({
        title: "Local File Dropped",
        description:
          "Please drag images from websites to get their URL, or manually paste URLs.",
        variant: "warning",
        duration: 7000,
      });
    } else {
      toast({
        title: "Drop Unsuccessful",
        description:
          "Could not extract a valid image URL from the dropped item.",
        variant: "warning",
        duration: 7000,
      });
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(true);
  };
  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
  };

  const removeImageUrlFromString = (urlToRemove) => {
    setFormData((prev) => {
      const currentUrlsArray = prev.imageUrlsString
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const newUrlsArray = currentUrlsArray.filter(
        (url) => url !== urlToRemove
      );
      return { ...prev, imageUrlsString: newUrlsArray.join(", ") };
    });
  };

  const currentImageUrlsForPreview = useMemo(() => {
    return formData.imageUrlsString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [formData.imageUrlsString]);

  const handleFormSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError(null);
      if (!formData?.title || !formData?.wilaya) {
        setFormError("Title and Wilaya are required.");
        return;
      }
      setIsSubmitting(true);
      const selectedAmenities = Object.entries(formData?.amenities || {})
        .filter(([_, value]) => value)
        .map(([key]) => key);
      const finalImageUrls = formData.imageUrlsString
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((url) => {
          try {
            new URL(url);
            return true;
          } catch {
            toast({
              title: "Invalid URL Removed",
              description: `URL "${url.substring(0, 30)}..." was invalid.`,
              variant: "warning",
            });
            return false;
          }
        });

      const submissionData = {
        title: formData.title,
        wilaya: formData.wilaya,
        type: "Room",
        description: formData.description,
        totalRoomCount: formData.totalRoomCount,
        amenities: selectedAmenities,
        images:
          finalImageUrls.length > 0
            ? finalImageUrls
            : [
                getRandomPlaceholderImage(
                  formData.title || `new-${Date.now()}`
                ),
              ],
      };

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setFormError("Token not found");
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
          response = await axios.put(
            `${API_URL}/${editingResidency._id}`,
            submissionData,
            config
          );
          setResidencies((prev) =>
            prev.map((r) =>
              r._id === editingResidency._id ? response.data.data : r
            )
          );
          toast({ title: "Residency Updated" });
        } else {
          if (!canAddResidency) {
            toast({
              title: "Error",
              description: "One residency already exists.",
              variant: "destructive",
            });
            setIsSubmitting(false);
            return;
          }
          response = await axios.post(API_URL, submissionData, config);
          setResidencies([response.data.data]);
          toast({ title: "Residency Added" });
        }
        setIsFormDialogOpen(false);
        setRefreshTrigger((prev) => prev + 1);
      } catch (err) {
        const errMsg = err.response?.data?.message || "Failed to save.";
        setFormError(errMsg);
        toast({
          title: "Save Error",
          description: errMsg,
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
      if (!window.confirm("Delete this residency?")) return;
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast({
            title: "Error",
            description: "Token not found",
            variant: "destructive",
          });
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`${API_URL}/${residencyId}`, config);
        setResidencies([]);
        toast({ title: "Residency Deleted" });
        setRefreshTrigger((prev) => prev + 1);
      } catch (err) {
        toast({
          title: "Delete Error",
          description: err.response?.data?.message || "Failed to delete.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const viewResidencyDetails = (residency) => {
    setSelectedResidencyForDetails(residency);
    setCurrentDetailImageIndex(0);
    setIsDetailsDialogOpen(true);
  };

  const detailImages = useMemo(() => {
    if (!selectedResidencyForDetails?.images?.length)
      return [
        getRandomPlaceholderImage(
          selectedResidencyForDetails?._id || "default-detail"
        ),
      ];
    return selectedResidencyForDetails.images.map((imgUrl, index) =>
      imgUrl && typeof imgUrl === "string" && imgUrl.trim() !== ""
        ? imgUrl
        : getRandomPlaceholderImage(selectedResidencyForDetails._id, index)
    );
  }, [selectedResidencyForDetails]);

  const handlePrevDetailImage = useCallback(() => {
    if (!detailImages?.length) return;
    setCurrentDetailImageIndex(
      (prev) => (prev - 1 + detailImages.length) % detailImages.length
    );
  }, [detailImages]);

  const handleNextDetailImage = useCallback(() => {
    if (!detailImages?.length) return;
    setCurrentDetailImageIndex((prev) => (prev + 1) % detailImages.length);
  }, [detailImages]);

  const amenitiesCheckboxes = useMemo(
    () => (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 border rounded-md">
        {predefinedAmenities.map((amenity) => (
          <div key={amenity} className="flex items-center space-x-2">
            <Checkbox
              id={`amenity-${amenity}`}
              checked={!!formData.amenities?.[amenity]}
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
            onClick={() => handleOpenFormDialog()}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Residency
          </Button>
        )}
      </div>
      <p className="text-muted-foreground mb-6">
        {canAddResidency ? "Add residency." : "Edit or remove."}
      </p>

      <Card>
        <CardHeader>
          <CardTitle>
            {canAddResidency ? "No Residency" : "Managed Residency"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Wilaya</TableHead>
                  <TableHead>Rooms</TableHead>
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
                      {canAddResidency ? "No residency added." : "No match."}
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  !error &&
                  filteredResidencies.map((res) => (
                    <TableRow key={res._id}>
                      <TableCell
                        className="font-medium hover:underline cursor-pointer"
                        onClick={() => viewResidencyDetails(res)}
                      >
                        {res.title}
                      </TableCell>
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
                              onClick={() => viewResidencyDetails(res)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenFormDialog(res)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteResidency(res._id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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
              {editingResidency ? "Update details." : "Enter details."}
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

              {/* Image URL Input Section with Drag and Drop for URLs */}
              <div
                className="sm:col-span-2 space-y-2 p-4 border border-dashed rounded-lg hover:border-rose-400 transition-colors relative bg-slate-50 dark:bg-slate-800"
                onDrop={handleImageDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Label
                  htmlFor="imageUrlsString"
                  className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  <ImagePlus className="h-5 w-5 mr-2 text-muted-foreground" />
                  Image URLs (comma-separated)
                </Label>
                <Textarea
                  id="imageUrlsString"
                  name="imageUrlsString"
                  value={formData.imageUrlsString}
                  onChange={handleFormChange}
                  placeholder="Paste image URLs here, or drag & drop images from web pages directly into this box."
                  rows={3}
                  className="w-full text-sm dark:bg-slate-700 dark:border-slate-600"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Drag images from other websites and drop them here. Ensure
                  URLs are public. Separate multiple URLs with a comma.
                </p>
                {isDraggingOver && (
                  <div className="absolute inset-0 bg-rose-500/10 backdrop-blur-sm flex items-center justify-center rounded-lg pointer-events-none">
                    <p className="text-rose-600 font-semibold">
                      Drop image here to add its URL!
                    </p>
                  </div>
                )}
              </div>

              {/* URL Previews Section */}
              {currentImageUrlsForPreview.length > 0 && (
                <div className="sm:col-span-2 mt-2 space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Image Previews (from URLs):
                  </Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 p-2 border rounded-md bg-slate-50 dark:bg-slate-800">
                    {currentImageUrlsForPreview.map((url, index) => (
                      <div
                        key={`url-preview-${index}-${url}`}
                        className="relative group aspect-square bg-muted/50 rounded overflow-hidden"
                      >
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = getRandomPlaceholderImage(
                              "url-error",
                              index
                            );
                            e.target.classList.add("opacity-50");
                          }} // Fallback
                        />
                        <button
                          type="button"
                          onClick={() => removeImageUrlFromString(url)}
                          className="absolute top-0.5 right-0.5 bg-red-600 text-white p-0.5 rounded-full shadow-md hover:bg-red-700 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                          aria-label="Remove image URL"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedResidencyForDetails?.title || "Details"}
            </DialogTitle>
            <DialogDescription>Info.</DialogDescription>
          </DialogHeader>
          {selectedResidencyForDetails ? (
            <div className="py-4 space-y-6">
              <div>
                {" "}
                {/* Gallery */}
                <h3 className="text-lg font-semibold mb-3">Gallery</h3>
                {detailImages?.length > 0 ? (
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden shadow-md">
                    <img
                      src={detailImages[currentDetailImageIndex]}
                      alt={`${selectedResidencyForDetails.title} ${
                        currentDetailImageIndex + 1
                      }`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getRandomPlaceholderImage(
                          selectedResidencyForDetails._id,
                          currentDetailImageIndex
                        );
                      }}
                    />
                    {detailImages.length > 1 && (
                      <>
                        <Button
                          onClick={handlePrevDetailImage}
                          variant="secondary"
                          size="icon"
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-9 w-9 shadow-lg"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          onClick={handleNextDetailImage}
                          variant="secondary"
                          size="icon"
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-9 w-9 shadow-lg"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </Button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 p-1.5 bg-black/40 backdrop-blur-sm rounded-full">
                          {detailImages.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentDetailImageIndex(idx)}
                              className={`h-2 w-2 rounded-full transition-all ${
                                currentDetailImageIndex === idx
                                  ? "bg-white scale-125"
                                  : "bg-white/60 hover:bg-white/80"
                              }`}
                            ></button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    <p className="ml-2 text-muted-foreground">No images.</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm mt-4">
                {" "}
                {/* Details Grid */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Wilaya
                  </Label>
                  <p className="font-semibold">
                    {selectedResidencyForDetails.wilaya}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Type
                  </Label>
                  <p>{selectedResidencyForDetails.type}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Status
                  </Label>
                  <p>
                    <Badge
                      variant={
                        selectedResidencyForDetails.status === "approved"
                          ? "success"
                          : "warning"
                      }
                      className="capitalize"
                    >
                      {selectedResidencyForDetails.status || "N/A"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Rooms
                  </Label>
                  <p>{selectedResidencyForDetails.totalRoomCount || "N/A"}</p>
                </div>
                <div className="md:col-span-2 lg:col-span-3 mt-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Description
                  </Label>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {selectedResidencyForDetails.description || "N/A"}
                  </p>
                </div>
                <div className="md:col-span-2 lg:col-span-3 mt-2">
                  <Label className="text-xs font-medium text-muted-foreground block mb-1">
                    Amenities
                  </Label>
                  {selectedResidencyForDetails.amenities?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedResidencyForDetails.amenities.map((a) => (
                        <Badge key={a} variant="outline">
                          {a}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic">N/A</p>
                  )}
                </div>
                <div className="md:col-span-2 lg:col-span-3 mt-2">
                  <Label className="text-xs font-medium text-muted-foreground block mb-1">
                    Room Types
                  </Label>
                  {selectedResidencyForDetails.roomTypesAvailable?.length >
                  0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedResidencyForDetails.roomTypesAvailable.map(
                        (t) => (
                          <Badge key={t} variant="secondary">
                            {t}
                          </Badge>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-xs italic">N/A</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="py-4 text-center text-muted-foreground">
              No details.
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </DashboardShell>
  );
}
// // Fix for immediate display of newly added residency

// import React, { useState, useCallback, useMemo, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import DashboardShell from "@/components/layout/DashboardShell";
// import {
//   Plus,
//   Edit,
//   Trash2,
//   MoreHorizontal,
//   Search as SearchIcon,
//   AlertTriangle,
//   Eye,
//   MapPin as MapPinIcon,
//   BedDouble as BedDoubleIcon,
//   Layers as LayersIcon,
//   ImageIcon,
//   ArrowLeft,
// } from "lucide-react";
// import { Badge } from "@/components/ui/badge"; // Added Badge

// import { useToast } from "@/hooks/use-toast";
// import { Toaster } from "@/components/ui/toaster";
// import axios from "axios";

// // Mock Image Placeholders
// import r1 from "@/assets/images/residencies/r1.png";
// import r2 from "@/assets/images/residencies/r2.png";
// import r3 from "@/assets/images/residencies/r3.png";
// const placeholderImages = [r1, r2, r3];

// // Custom hook for debouncing values
// function useDebounce(value, delay) {
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
// }

// // Memoize this function since it's only dependent on the id parameter
// const getRandomPlaceholderImage = (id) => {
//   let hash = 0;
//   if (typeof id !== "string") id = String(id);
//   for (let i = 0; i < id.length; i++) {
//     const char = id.charCodeAt(i);
//     hash = (hash << 5) - hash + char;
//     hash |= 0;
//   }
//   return placeholderImages[Math.abs(hash) % placeholderImages.length];
// };

// // Move constants outside the component to prevent recreating them on each render
// const allWilayas = [
//   "Adrar",
//   "Chlef",
//   "Laghouat",
//   "Oum El Bouaghi",
//   "Batna",
//   "Béjaïa",
//   "Biskra",
//   "Béchar",
//   "Blida",
//   "Bouira",
//   "Tamanrasset",
//   "Tébessa",
//   "Tlemcen",
//   "Tiaret",
//   "Tizi Ouzou",
//   "Alger",
//   "Djelfa",
//   "Jijel",
//   "Sétif",
//   "Saïda",
//   "Skikda",
//   "Sidi Bel Abbès",
//   "Annaba",
//   "Guelma",
//   "Constantine",
//   "Médéa",
//   "Mostaganem",
//   "M'Sila",
//   "Mascara",
//   "Ouargla",
//   "Oran",
//   "El Bayadh",
//   "Illizi",
//   "Bordj Bou Arréridj",
//   "Boumerdès",
//   "El Tarf",
//   "Tindouf",
//   "Tissemsilt",
//   "El Oued",
//   "Khenchela",
//   "Souk Ahras",
//   "Tipaza",
//   "Mila",
//   "Aïn Defla",
//   "Naâma",
//   "Aïn Témouchent",
//   "Ghardaïa",
//   "Relizane",
//   "Timimoun",
//   "Bordj Badji Mokhtar",
//   "Ouled Djellal",
//   "Béni Abbès",
//   "In Salah",
//   "In Guezzam",
//   "Touggourt",
//   "Djanet",
//   "El M'Ghair",
//   "El Meniaa",
// ];

// const predefinedAmenities = [
//   "WiFi",
//   "Kitchen",
//   "Laundry",
//   "Air Conditioning",
//   "Heating",
//   "Private Bathroom",
//   "Study Desk",
//   "Wardrobe",
//   "Security",
//   "Parking",
//   "Elevator",
//   "Common Room",
//   "Hot Water",
//   "Cleaning Service",
// ];

// const API_URL = "http://localhost:5000/api/residencies";

// const getInitialAmenitiesState = () => {
//   return predefinedAmenities.reduce((acc, amenity) => {
//     acc[amenity] = false;
//     return acc;
//   }, {});
// };

// const initialFormData = {
//   title: "",
//   wilaya: "",
//   type: "Room", // Fixed
//   amenities: getInitialAmenitiesState(),
//   description: "",
//   images: "",
//   totalRoomCount: 0,
// };

// export default function ServiceManageResidency() {
//   const { toast } = useToast();
//   const [residencies, setResidencies] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const debouncedSearchTerm = useDebounce(searchTerm, 300);

//   const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
//   const [editingResidency, setEditingResidency] = useState(null);
//   const [formData, setFormData] = useState(initialFormData);
//   const [formError, setFormError] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [refreshTrigger, setRefreshTrigger] = useState(0); // Add a refresh trigger
//   const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
//   const [selectedResidencyForDetails, setSelectedResidencyForDetails] =
//     useState(null);
//   const [currentDetailImageIndex, setCurrentDetailImageIndex] = useState(0);

//   // Function to fetch residencies
//   const fetchResidencies = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       // Get user's token from localStorage or your auth context
//       const token = localStorage.getItem("token");

//       if (!token) {
//         setError("Authentication token not found");
//         setIsLoading(false);
//         return;
//       }

//       const config = {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       };

//       // We'll fetch all residencies but only display those belonging to the current service provider
//       const response = await axios.get(API_URL, config);

//       // Filter for residencies belonging to the current user
//       // The backend might already filter these, but we can add extra filtering if needed
//       setResidencies(response.data.data || []);
//       setError(null);
//     } catch (err) {
//       console.error("Error fetching residencies:", err);
//       setError(err.response?.data?.message || "Failed to fetch residencies");
//       setResidencies([]); // Ensure residencies is always an array
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   // Fetch residencies on component mount and when refreshTrigger changes
//   useEffect(() => {
//     fetchResidencies();
//   }, [fetchResidencies, refreshTrigger]);

//   // Memoize the derived state to prevent recalculation on every render
//   const canAddResidency = useMemo(
//     () => (residencies || []).length === 0,
//     [residencies]
//   );

//   // Memoize filtered residencies to prevent recalculation on every render
//   // Fixed the filtering to safely handle undefined/null values
//   const filteredResidencies = useMemo(() => {
//     if (!Array.isArray(residencies)) return [];

//     return residencies.filter((res) => {
//       if (!res) return false;

//       const titleMatch =
//         res.title &&
//         res.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
//       const wilayaMatch =
//         res.wilaya &&
//         res.wilaya.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

//       return titleMatch || wilayaMatch;
//     });
//   }, [residencies, debouncedSearchTerm]);

//   const handleOpenFormDialog = useCallback(
//     (residencyToEdit = null) => {
//       setError(null);
//       setFormError(null);

//       if (residencyToEdit) {
//         // Editing existing
//         setEditingResidency(residencyToEdit);
//         const currentAmenitiesState = predefinedAmenities.reduce(
//           (acc, amenity) => {
//             acc[amenity] = (residencyToEdit.amenities || []).includes(amenity);
//             return acc;
//           },
//           {}
//         );
//         setFormData({
//           title: residencyToEdit.title || "",
//           wilaya: residencyToEdit.wilaya || "",
//           type: residencyToEdit.type || "Room", // Should always be "Room"
//           description: residencyToEdit.description || "",
//           images: Array.isArray(residencyToEdit.images)
//             ? residencyToEdit.images.join(", ")
//             : "",
//           totalRoomCount: residencyToEdit.totalRoomCount || 0,
//           amenities: currentAmenitiesState,
//         });
//         setIsFormDialogOpen(true); // Open dialog for editing
//       } else {
//         // Attempting to add
//         if (!canAddResidency) {
//           toast({
//             title: "Action Denied",
//             description:
//               "Only one residency can be managed. Please edit or delete the existing one to add a new one.",
//             variant: "warning",
//           });
//           return; // Do not open dialog
//         }
//         setEditingResidency(null);
//         setFormData({
//           ...initialFormData,
//           amenities: getInitialAmenitiesState(),
//         });
//         setIsFormDialogOpen(true); // Open dialog for adding
//       }
//     },
//     [canAddResidency, toast]
//   );

//   const handleFormChange = useCallback((e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]:
//         type === "checkbox"
//           ? checked
//           : type === "number"
//           ? parseFloat(value) || 0
//           : value,
//     }));
//   }, []);

//   const handleAmenityChange = useCallback((amenityName, checked) => {
//     setFormData((prev) => ({
//       ...prev,
//       amenities: {
//         ...prev.amenities,
//         [amenityName]: checked,
//       },
//     }));
//   }, []);

//   const handleFormSelectChange = useCallback((field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   }, []);

//   const handleFormSubmit = useCallback(
//     async (e) => {
//       e.preventDefault();
//       setFormError(null);
//       setIsSubmitting(true);
//       if (!formData?.title || !formData?.wilaya) {
//         setFormError("Title and Wilaya are required.");
//         setIsSubmitting(false);
//         return;
//       }

//       const selectedAmenities = Object.entries(formData?.amenities || {})
//         ?.filter(([_, value]) => value)
//         .map(([key]) => key);

//       const submissionData = {
//         title: formData.title,
//         wilaya: formData.wilaya,
//         type: "Room", // Fixed
//         description: formData.description,
//         totalRoomCount: formData.totalRoomCount,
//         amenities: selectedAmenities,
//         images: (formData.images || "")
//           .split(",")
//           .map((s) => s.trim())
//           .filter(Boolean),
//       };

//       // Ensure images get a placeholder if none provided
//       if (submissionData.images.length === 0) {
//         submissionData.images = [
//           getRandomPlaceholderImage(
//             submissionData.title || `new-${Date.now()}`
//           ),
//         ];
//       }

//       try {
//         // Get user's token from localStorage or your auth context
//         const token = localStorage.getItem("token");

//         if (!token) {
//           setFormError("Authentication token not found");
//           setIsSubmitting(false);
//           return;
//         }

//         const config = {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         };

//         let response;

//         if (editingResidency) {
//           // Editing existing residency
//           response = await axios.put(
//             `${API_URL}/${editingResidency._id}`,
//             submissionData,
//             config
//           );

//           console.log("Updated residency:", response.data.data);

//           // Immediately update the state with the updated residency
//           setResidencies((prev) =>
//             Array.isArray(prev)
//               ? prev.map((r) =>
//                   r._id === editingResidency._id ? response.data.data : r
//                 )
//               : [response.data.data]
//           );

//           toast({
//             title: "Residency Updated",
//             description:
//               "Your residency details have been updated successfully.",
//           });
//         } else {
//           // Adding new residency
//           if (!canAddResidency) {
//             setFormError("Cannot add residency. One already exists.");
//             toast({
//               title: "Error: Residency already exists",
//               variant: "destructive",
//             });
//             setIsFormDialogOpen(false);
//             setIsSubmitting(false);
//             return;
//           }

//           response = await axios.post(API_URL, submissionData, config);

//           // Immediately update the state with the new residency
//           setResidencies([response.data.data]);

//           toast({
//             title: "Residency Added",
//             description: "Your residency has been created successfully.",
//           });
//         }

//         setIsFormDialogOpen(false);

//         // Trigger a refresh to ensure the data is up-to-date
//         setRefreshTrigger((prev) => prev + 1);
//       } catch (err) {
//         console.error("Error saving residency:", err);
//         setFormError(
//           err.response?.data?.message ||
//             "Failed to save residency. Please try again."
//         );
//         toast({
//           title: "Error",
//           description:
//             err.response?.data?.message || "An error occurred while saving",
//           variant: "destructive",
//         });
//       } finally {
//         setIsSubmitting(false);
//       }
//     },
//     [formData, editingResidency, canAddResidency, toast]
//   );

//   const handleDeleteResidency = useCallback(
//     async (residencyId) => {
//       if (
//         !window.confirm(
//           "Are you sure you want to delete this residency? This will allow you to add a new one."
//         )
//       )
//         return;

//       try {
//         // Get user's token from localStorage or your auth context
//         const token = localStorage.getItem("token");

//         if (!token) {
//           toast({
//             title: "Error",
//             description: "Authentication token not found",
//             variant: "destructive",
//           });
//           return;
//         }

//         const config = {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         };

//         await axios.delete(`${API_URL}/${residencyId}`, config);

//         // Immediately update the state
//         setResidencies([]);

//         toast({
//           title: "Residency Deleted",
//           description: "Your residency has been removed successfully.",
//           variant: "default",
//         });

//         // Trigger a refresh to ensure the data is up-to-date
//         setRefreshTrigger((prev) => prev + 1);
//       } catch (err) {
//         console.error("Error deleting residency:", err);
//         toast({
//           title: "Error",
//           description:
//             err.response?.data?.message || "Failed to delete residency",
//           variant: "destructive",
//         });
//       }
//     },
//     [toast]
//   );

//   const viewResidencyDetails = (residency) => {
//     setSelectedResidencyForDetails(residency);
//     setCurrentDetailImageIndex(0);
//     setIsDetailsDialogOpen(true);
//   };

//   const detailImages = useMemo(() => {
//     if (
//       !selectedResidencyForDetails ||
//       !Array.isArray(selectedResidencyForDetails.images) ||
//       selectedResidencyForDetails.images.length === 0
//     ) {
//       return [
//         getRandomPlaceholderImage(
//           selectedResidencyForDetails?._id || "default-detail",
//           0
//         ),
//       ]; // Single placeholder
//     }
//     // If images are actual URLs from backend, use them. Otherwise, map to placeholders
//     return selectedResidencyForDetails.images.map(
//       (imgUrl, index) =>
//         imgUrl ||
//         getRandomPlaceholderImage(selectedResidencyForDetails._id, index)
//     );
//   }, [selectedResidencyForDetails]);

//   const handleNextDetailImage = () =>
//     setCurrentDetailImageIndex((prev) => (prev + 1) % detailImages.length);
//   const handlePrevDetailImage = () =>
//     setCurrentDetailImageIndex(
//       (prev) => (prev - 1 + detailImages.length) % detailImages.length
//     );

//   // Memoize the Amenities rendering to prevent recreating the checkboxes on every render
//   const amenitiesCheckboxes = useMemo(
//     () => (
//       <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 border rounded-md">
//         {predefinedAmenities.map((amenity) => (
//           <div key={amenity} className="flex items-center space-x-2">
//             <Checkbox
//               id={`amenity-${amenity}`}
//               checked={!!(formData.amenities && formData.amenities[amenity])}
//               onCheckedChange={(checked) =>
//                 handleAmenityChange(amenity, !!checked)
//               }
//             />
//             <Label
//               htmlFor={`amenity-${amenity}`}
//               className="font-normal text-sm"
//             >
//               {amenity}
//             </Label>
//           </div>
//         ))}
//       </div>
//     ),
//     [formData.amenities, handleAmenityChange]
//   );

//   // Memoize the Wilaya select options to prevent recreating them on every render
//   const wilayaOptions = useMemo(
//     () =>
//       allWilayas.map((w) => (
//         <SelectItem key={w} value={w}>
//           {w}
//         </SelectItem>
//       )),
//     []
//   );

//   return (
//     <DashboardShell role="service">
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-bold tracking-tight">Manage Residency</h1>
//         {canAddResidency && (
//           <Button
//             className="bg-rose-500 hover:bg-rose-600"
//             onClick={() => handleOpenFormDialog()} // No argument means "add" mode
//           >
//             <Plus className="mr-2 h-4 w-4" /> Add Residency
//           </Button>
//         )}
//       </div>
//       <p className="text-muted-foreground mb-6">
//         {canAddResidency
//           ? "Add the university residency you manage."
//           : "Edit or remove the university residency you manage."}
//       </p>

//       <Card>
//         <CardHeader>
//           <CardTitle>
//             {canAddResidency ? "No Residency Managed" : "Managed Residency"}
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Title</TableHead>
//                   <TableHead>Wilaya</TableHead>
//                   <TableHead>Number of Rooms</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {isLoading && (
//                   <TableRow>
//                     <TableCell colSpan={4} className="text-center h-24">
//                       Loading...
//                     </TableCell>
//                   </TableRow>
//                 )}
//                 {!isLoading && error && (
//                   <TableRow>
//                     <TableCell
//                       colSpan={4}
//                       className="text-center h-24 text-destructive"
//                     >
//                       {error}
//                     </TableCell>
//                   </TableRow>
//                 )}
//                 {!isLoading && !error && filteredResidencies.length === 0 && (
//                   <TableRow>
//                     <TableCell colSpan={4} className="text-center h-24">
//                       {canAddResidency
//                         ? "No residency has been added yet."
//                         : "No residency found matching search."}
//                     </TableCell>
//                   </TableRow>
//                 )}
//                 {!isLoading &&
//                   !error &&
//                   filteredResidencies.map((res) => (
//                     <TableRow key={res._id}>
//                       <TableCell
//                         className="font-medium hover:underline cursor-pointer"
//                         onClick={() => viewResidencyDetails(res)}
//                       >
//                         {res.title}
//                       </TableCell>
//                       <TableCell>{res.wilaya}</TableCell>
//                       <TableCell>{res.totalRoomCount}</TableCell>
//                       <TableCell className="text-right">
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               className="h-8 w-8"
//                             >
//                               <MoreHorizontal className="h-4 w-4" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end">
//                             <DropdownMenuItem
//                               onClick={() => viewResidencyDetails(res)}
//                             >
//                               <Eye className="mr-2 h-4 w-4" />
//                               View Details
//                             </DropdownMenuItem>
//                             <DropdownMenuItem
//                               onClick={() => handleOpenFormDialog(res)}
//                             >
//                               <Edit className="mr-2 h-4 w-4" />
//                               Edit
//                             </DropdownMenuItem>
//                             <DropdownMenuItem
//                               onClick={() => handleDeleteResidency(res.id)}
//                               className="text-destructive focus:text-destructive"
//                             >
//                               <Trash2 className="mr-2 h-4 w-4" />
//                               Delete
//                             </DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>

//       <Dialog
//         open={isFormDialogOpen}
//         onOpenChange={(open) => {
//           if (!open && !isSubmitting) setIsFormDialogOpen(false);
//         }}
//       >
//         <DialogContent className="sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>
//               {editingResidency ? "Edit" : "Add"} Residency
//             </DialogTitle>
//             <DialogDescription>
//               {editingResidency
//                 ? "Update the details of your managed residency."
//                 : "Enter the details for the residency you manage."}
//             </DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="title">Title*</Label>
//                 <Input
//                   id="title"
//                   name="title"
//                   value={formData.title}
//                   onChange={handleFormChange}
//                   required
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="wilaya">Wilaya*</Label>
//                 <Select
//                   name="wilaya"
//                   value={formData.wilaya}
//                   onValueChange={(val) => handleFormSelectChange("wilaya", val)}
//                 >
//                   <SelectTrigger id="wilaya">
//                     <SelectValue placeholder="Select Wilaya" />
//                   </SelectTrigger>
//                   <SelectContent>{wilayaOptions}</SelectContent>
//                 </Select>
//               </div>
//               <div className="sm:col-span-2">
//                 <Label htmlFor="totalRoomCount">Number of Rooms</Label>
//                 <Input
//                   id="totalRoomCount"
//                   name="totalRoomCount"
//                   type="number"
//                   value={formData.totalRoomCount}
//                   onChange={handleFormChange}
//                 />
//               </div>
//               <div className="sm:col-span-2">
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                   id="description"
//                   name="description"
//                   value={formData.description}
//                   onChange={handleFormChange}
//                   rows={3}
//                 />
//               </div>

//               <div className="sm:col-span-2">
//                 <Label>Amenities</Label>
//                 {amenitiesCheckboxes}
//               </div>

//               <div className="sm:col-span-2">
//                 <Label htmlFor="images">
//                   Image URLs (comma-separated, placeholder for now)
//                 </Label>
//                 <Textarea
//                   id="images"
//                   name="images"
//                   value={formData.images}
//                   onChange={handleFormChange}
//                   placeholder="http://example.com/img1.jpg, ..."
//                   rows={2}
//                 />
//               </div>
//             </div>
//             {formError && (
//               <p className="text-sm text-destructive">{formError}</p>
//             )}
//             <DialogFooter>
//               <Button
//                 type="button"
//                 variant="outline"
//                 disabled={isSubmitting}
//                 onClick={() => !isSubmitting && setIsFormDialogOpen(false)}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 className="bg-rose-500 hover:bg-rose-600"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting
//                   ? "Saving..."
//                   : editingResidency
//                   ? "Save Changes"
//                   : "Add Residency"}
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>
//       {/* --- NEW: Residency Details Dialog --- */}
//       <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
//         <DialogContent className="sm:max-w-xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>
//               {selectedResidencyForDetails?.title || "Residency Details"}
//             </DialogTitle>
//             <DialogDescription>
//               Comprehensive information about the residency.
//             </DialogDescription>
//           </DialogHeader>
//           {selectedResidencyForDetails ? (
//             <div className="py-4 space-y-6">
//               {/* Image Gallery Section */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-3">Gallery</h3>
//                 {detailImages.length > 0 ? (
//                   <div className="relative aspect-video bg-muted rounded-lg overflow-hidden shadow-md">
//                     <img
//                       src={detailImages[currentDetailImageIndex]}
//                       alt={`${selectedResidencyForDetails.title} ${
//                         currentDetailImageIndex + 1
//                       }`}
//                       className="w-full h-full object-cover transition-opacity duration-300"
//                     />
//                     {detailImages.length > 1 && (
//                       <>
//                         <Button
//                           onClick={handlePrevDetailImage}
//                           variant="secondary"
//                           size="icon"
//                           className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-9 w-9 shadow-lg"
//                         >
//                           <ArrowLeft className="h-5 w-5" />
//                         </Button>
//                         <Button
//                           onClick={handleNextDetailImage}
//                           variant="secondary"
//                           size="icon"
//                           className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-9 w-9 shadow-lg"
//                         >
//                           <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             width="20"
//                             height="20"
//                             viewBox="0 0 24 24"
//                             fill="none"
//                             stroke="currentColor"
//                             strokeWidth="2"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                           >
//                             <polyline points="9 18 15 12 9 6"></polyline>
//                           </svg>
//                         </Button>
//                         <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 p-1.5 bg-black/40 backdrop-blur-sm rounded-full">
//                           {detailImages.map((_, idx) => (
//                             <button
//                               key={idx}
//                               onClick={() => setCurrentDetailImageIndex(idx)}
//                               className={`h-2 w-2 rounded-full transition-colors ${
//                                 currentDetailImageIndex === idx
//                                   ? "bg-white scale-125"
//                                   : "bg-white/60 hover:bg-white/80"
//                               }`}
//                             ></button>
//                           ))}
//                         </div>
//                       </>
//                     )}
//                   </div>
//                 ) : (
//                   <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground">
//                     <ImageIcon className="h-12 w-12 mb-2" />
//                     <p>No images available.</p>
//                   </div>
//                 )}
//               </div>

//               {/* Details Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm mt-4">
//                 <div className="space-y-0.5">
//                   <Label className="text-xs font-medium text-muted-foreground">
//                     Wilaya
//                   </Label>
//                   <p className="font-semibold">
//                     {selectedResidencyForDetails.wilaya}
//                   </p>
//                 </div>
//                 <div className="space-y-0.5">
//                   <Label className="text-xs font-medium text-muted-foreground">
//                     Type
//                   </Label>
//                   <p>{selectedResidencyForDetails.type}</p>
//                 </div>
//                 <div className="space-y-0.5">
//                   <Label className="text-xs font-medium text-muted-foreground">
//                     Status
//                   </Label>
//                   <p>
//                     <Badge
//                       variant={
//                         selectedResidencyForDetails.status === "approved"
//                           ? "success"
//                           : "warning"
//                       }
//                       className="capitalize"
//                     >
//                       {selectedResidencyForDetails.status}
//                     </Badge>
//                   </p>
//                 </div>

//                 <div className="space-y-0.5">
//                   <Label className="text-xs font-medium text-muted-foreground">
//                     Total Rooms
//                   </Label>
//                   <p>{selectedResidencyForDetails.totalRoomCount || "N/A"}</p>
//                 </div>

//                 <div className="md:col-span-2 lg:col-span-3 mt-2 space-y-0.5">
//                   <Label className="text-xs font-medium text-muted-foreground">
//                     Description
//                   </Label>
//                   <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
//                     {selectedResidencyForDetails.description ||
//                       "No description."}
//                   </p>
//                 </div>

//                 <div className="md:col-span-2 lg:col-span-3 mt-2">
//                   <Label className="text-xs font-medium text-muted-foreground block mb-1">
//                     Amenities
//                   </Label>
//                   {selectedResidencyForDetails.amenities &&
//                   selectedResidencyForDetails.amenities.length > 0 ? (
//                     <div className="flex flex-wrap gap-2">
//                       {selectedResidencyForDetails.amenities.map((amenity) => (
//                         <Badge
//                           key={amenity}
//                           variant="outline"
//                           className="text-xs"
//                         >
//                           {amenity}
//                         </Badge>
//                       ))}
//                     </div>
//                   ) : (
//                     <p className="text-muted-foreground text-xs italic">
//                       No amenities listed.
//                     </p>
//                   )}
//                 </div>
//                 <div className="md:col-span-2 lg:col-span-3 mt-2">
//                   <Label className="text-xs font-medium text-muted-foreground block mb-1">
//                     Room Types Offered
//                   </Label>
//                   {selectedResidencyForDetails.roomTypesAvailable &&
//                   selectedResidencyForDetails.roomTypesAvailable.length > 0 ? (
//                     <div className="flex flex-wrap gap-2">
//                       {selectedResidencyForDetails.roomTypesAvailable.map(
//                         (type) => (
//                           <Badge
//                             key={type}
//                             variant="secondary"
//                             className="text-xs"
//                           >
//                             {type}
//                           </Badge>
//                         )
//                       )}
//                     </div>
//                   ) : (
//                     <p className="text-muted-foreground text-xs italic">
//                       No specific room types listed.
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <p className="text-muted-foreground py-4 text-center">
//               No residency details to display.
//             </p>
//           )}
//           <DialogFooter>
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => setIsDetailsDialogOpen(false)}
//             >
//               Close
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//       {/* --- End Details Dialog --- */}
//       <Toaster />
//     </DashboardShell>
//   );
// }
