// import React, { useState, useCallback, useMemo, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Added CardFooter
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // DialogTrigger, DialogClose not explicitly needed here if controlled by state
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import DashboardShell from "@/components/layout/DashboardShell";
// import { Plus, Edit, Trash2, MoreHorizontal, Search as SearchIcon, AlertTriangle, Eye, MapPin as MapPinIcon, BedDouble as BedDoubleIcon, Layers as LayersIcon, ImageIcon } from "lucide-react"; // Renamed some icons
// import { useToast } from "@/hooks/use-toast";
// import { Toaster } from "@/components/ui/toaster";
// import { Badge } from "@/components/ui/badge"; // Added Badge
// import { Skeleton } from "@/components/ui/skeleton"; // For loading
// import axios from "axios";

// // --- Config ---
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
// const API_URL = `${API_BASE_URL}/api/residencies`; // Use API_BASE_URL
// const ITEMS_PER_PAGE = 5; // For pagination

// // --- Image Placeholders --- (Keep your imports)
// import r1 from "@/assets/images/residencies/r1.png";
// import r2 from "@/assets/images/residencies/r2.png";
// import r3 from "@/assets/images/residencies/r3.png";
// const placeholderImages = [r1, r2, r3];

// // Helper for placeholder image selection
// const getRandomPlaceholderImage = (id, index = 0) => {
//     let hash = 0; if (typeof id !== "string") id = String(id);
//     for (let i = 0; i < id.length; i++) { const char = id.charCodeAt(i); hash = (hash << 5) - hash + char; hash |= 0; }
//     return placeholderImages[Math.abs(hash + index) % placeholderImages.length];
// };

// // --- Constants ---
// const allWilayas = [ /* ... Your Wilayas List ... */ "Adrar", "Chlef", "Alger", "Oran", "Constantine"];
// const predefinedAmenities = [ /* ... Your Amenities List ... */ "WiFi", "Kitchen", "Laundry", "Security"];
// const residencyStatuses = ["pending", "approved", "rejected", "maintenance"]; // Add if residency has status

// // Helper to create Axios config
// const createAxiosConfig = (token) => {
//   if (!token) { console.error("Token missing"); return null; }
//   return { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
// };

// // Initial Form States
// const getInitialAmenitiesState = () => predefinedAmenities.reduce((acc, amenity) => { acc[amenity] = false; return acc; }, {});
// const initialFormData = { title: "", wilaya: "", type: "Multiple Room Types", amenities: getInitialAmenitiesState(), description: "", images: "", totalRoomCount: 0, status: "pending", /* add other fields from API like price, floorCount, roomTypesAvailable (as string) */ price: 0, floorCount: 0, roomTypesAvailable: ""};

// // Debounce Hook
// function useDebounce(value, delay) { /* ... Keep your debounce hook ... */ }

// export default function ServiceManageResidencies() {
//   const { toast } = useToast();
//   const [residencies, setResidencies] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const debouncedSearchTerm = useDebounce(searchTerm, 300);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   // Dialog states
//   const [isFormDialogOpen, setIsFormDialogOpen] = useState(false); // For Add/Edit
//   const [editingResidency, setEditingResidency] = useState(null);
//   const [formData, setFormData] = useState(initialFormData);
//   const [formError, setFormError] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // NEW: Details Dialog State
//   const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
//   const [selectedResidencyForDetails, setSelectedResidencyForDetails] = useState(null);
//   const [currentDetailImageIndex, setCurrentDetailImageIndex] = useState(0);

//   // Fetch residencies
//   const fetchResidencies = useCallback(async (page = 1, limit = ITEMS_PER_PAGE, search = "") => {
//     setIsLoading(true); setError(null);
//     const token = localStorage.getItem("token");
//     const config = createAxiosConfig(token);
//     if (!config) { setError("Authentication failed."); setIsLoading(false); return; }

//     // Construct query parameters for backend
//     const params = new URLSearchParams({ page: String(page), limit: String(limit) });
//     if (search.trim()) params.append('search', search.trim()); // Assuming backend uses 'search' param for title/wilaya

//     try {
//       const response = await axios.get(`${API_URL}?${params.toString()}`, config);
//       if (response.data && Array.isArray(response.data.data)) { // Adjusted based on your backend response for residencies
//         const fetchedData = response.data.data.map(res => ({ ...res, id: res._id })); // Map _id to id
//         setResidencies(fetchedData);
//         setTotalPages(response.data.pagination?.totalPages || 1);
//         setCurrentPage(response.data.pagination?.currentPage || 1);
//       } else {
//         throw new Error("Unexpected data structure from API.");
//       }
//     } catch (err) {
//       console.error("Error fetching residencies:", err);
//       const message = err.response?.data?.message || "Failed to fetch residencies.";
//       setError(message); setResidencies([]); setTotalPages(1);
//     } finally { setIsLoading(false); }
//   }, []);

//   useEffect(() => { fetchResidencies(currentPage, ITEMS_PER_PAGE, debouncedSearchTerm); }, [fetchResidencies, currentPage, debouncedSearchTerm]);

//   // Memoized filtered residencies (if still needed for client-side on top of backend search)
//   // For this example, backend search is primary, so filteredResidencies = residencies
//   const paginatedResidencies = residencies; // Or use a slice if backend doesn't paginate fully

//   const handleOpenFormDialog = useCallback((residencyToEdit = null) => { /* ... keep ... */ }, []);
//   const handleFormChange = useCallback((e) => { /* ... keep ... */ }, []);
//   const handleAmenityChange = useCallback((amenityName, checked) => { /* ... keep ... */ }, []);
//   const handleFormSelectChange = useCallback((field, value) => { /* ... keep ... */ }, []);

//   const handleFormSubmit = useCallback(async (e) => { /* ... Keep and adapt based on `API_URL` ... */ }, [formData, editingResidency, toast, fetchResidencies]);
//   const handleDeleteResidency = useCallback(async (residencyId) => { /* ... Keep and adapt based on `API_URL` ... */ }, [toast, fetchResidencies]);

//   // --- Details Dialog Logic ---
//   const viewResidencyDetails = (residency) => {
//     setSelectedResidencyForDetails(residency);
//     setCurrentDetailImageIndex(0);
//     setIsDetailsDialogOpen(true);
//   };

//   const detailImages = useMemo(() => {
//     if (!selectedResidencyForDetails || !Array.isArray(selectedResidencyForDetails.images) || selectedResidencyForDetails.images.length === 0) {
//         return [getRandomPlaceholderImage(selectedResidencyForDetails?._id || 'default-detail', 0)]; // Single placeholder
//     }
//     // If images are actual URLs from backend, use them. Otherwise, map to placeholders
//     return selectedResidencyForDetails.images.map((imgUrl, index) => imgUrl || getRandomPlaceholderImage(selectedResidencyForDetails._id, index));
//   }, [selectedResidencyForDetails]);

//   const handleNextDetailImage = () => setCurrentDetailImageIndex(prev => (prev + 1) % detailImages.length);
//   const handlePrevDetailImage = () => setCurrentDetailImageIndex(prev => (prev - 1 + detailImages.length) % detailImages.length);

//   const amenitiesCheckboxes = useMemo(() => ( /* ... keep ... */ ), [formData.amenities, handleAmenityChange]);
//   const wilayaOptions = useMemo(() => allWilayas.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>), []);

//   return (
//     <DashboardShell role="service">
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-bold tracking-tight">Manage Residencies</h1>
//          <Button className="bg-rose-500 hover:bg-rose-600" onClick={() => handleOpenFormDialog()}>
//           <Plus className="mr-2 h-4 w-4" /> Add Residency
//         </Button>
//       </div>
//       <p className="text-muted-foreground mb-6">Add, edit, or view details of university residencies.</p>

//       <Card>
//         <CardHeader>
//           <CardTitle>Residency List</CardTitle>
//           <div className="pt-2">
//              <Input type="search" placeholder="Search residencies..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="max-w-sm"/>
//           </div>
//            {error && !isLoading && ( /* Display list error */ )}
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Title</TableHead><TableHead>Wilaya</TableHead><TableHead>Rooms</TableHead>
//                   <TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {isLoading ? ([...Array(ITEMS_PER_PAGE)].map((_, i) => (<TableRow key={`skel-${i}`}><TableCell colSpan={5}><Skeleton className="h-8 w-full"/></TableCell></TableRow>)))
//                  : paginatedResidencies.length === 0 ? (<TableRow><TableCell colSpan={5} className="h-24 text-center">{searchTerm ? "No residencies match search." : "No residencies found."}</TableCell></TableRow>)
//                  : paginatedResidencies.map((res) => (
//                   <TableRow key={res.id}>
//                     <TableCell className="font-medium hover:underline cursor-pointer" onClick={() => viewResidencyDetails(res)}>{res.title}</TableCell>
//                     <TableCell>{res.wilaya}</TableCell>
//                     <TableCell>{res.totalRoomCount}</TableCell>
//                     <TableCell><Badge variant={res.status === 'approved' ? 'success' : (res.status === 'pending' ? 'warning' : 'secondary')} className="capitalize">{res.status || "N/A"}</Badge></TableCell>
//                     <TableCell className="text-right">
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
//                         <DropdownMenuContent align="end">
//                           <DropdownMenuItem onClick={() => viewResidencyDetails(res)}><Eye className="mr-2 h-4 w-4"/>View Details</DropdownMenuItem>
//                           <DropdownMenuItem onClick={() => handleOpenFormDialog(res)}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
//                           <DropdownMenuItem onClick={() => handleDeleteResidency(res.id)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//           {/* Pagination Controls (Based on fetched totalPages and currentPage) */}
//           {!isLoading && totalPages > 1 && (
//              <div className="flex items-center justify-center space-x-2 py-4">
//                 <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
//                 <span className="text-sm text-muted-foreground"> Page {currentPage} of {totalPages} </span>
//                 <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
//             </div>
//            )}
//         </CardContent>
//       </Card>

//       {/* Add/Edit Residency Dialog */}
//       <Dialog open={isFormDialogOpen} onOpenChange={(open) => { if (!open && !isSubmitting) setIsFormDialogOpen(false); }}>
//         <DialogContent className="sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//                 <DialogTitle>{editingResidency ? "Edit" : "Add"} Residency</DialogTitle>
//                 <DialogDescription>{/* ... */}</DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
//                 {/* == Paste your existing Add/Edit Form JSX here from your prompt == */}
//                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div><Label htmlFor="title">Title*</Label><Input id="title" name="title" value={formData.title} onChange={handleFormChange} required/></div>
//                     <div><Label htmlFor="wilaya">Wilaya*</Label><Select name="wilaya" value={formData.wilaya} onValueChange={(val) => handleFormSelectChange("wilaya", val)}><SelectTrigger id="wilaya"><SelectValue placeholder="Select Wilaya" /></SelectTrigger><SelectContent>{wilayaOptions}</SelectContent></Select></div>
//                     <div className="sm:col-span-2"><Label htmlFor="totalRoomCount">Number of Rooms</Label><Input id="totalRoomCount" name="totalRoomCount" type="number" value={formData.totalRoomCount} onChange={handleFormChange}/></div>
//                     <div className="sm:col-span-2"><Label htmlFor="description">Description</Label><Textarea id="description" name="description" value={formData.description} onChange={handleFormChange} rows={3}/></div>
//                     <div className="sm:col-span-2"><Label>Amenities</Label>{amenitiesCheckboxes}</div>
//                     <div className="sm:col-span-2"><Label htmlFor="price">Base Price (DZD)</Label><Input id="price" name="price" type="number" value={formData.price} onChange={handleFormChange} /></div>
//                     <div className="sm:col-span-2"><Label htmlFor="floorCount">Number of Floors</Label><Input id="floorCount" name="floorCount" type="number" value={formData.floorCount} onChange={handleFormChange} /></div>
//                     <div className="sm:col-span-2"><Label htmlFor="roomTypesAvailable">Room Types Offered (comma-separated)</Label><Input id="roomTypesAvailable" name="roomTypesAvailable" value={formData.roomTypesAvailable} onChange={handleFormChange} placeholder="Single, Shared (2-person)..." /></div>
//                     <div className="sm:col-span-2"><Label htmlFor="status">Status</Label><Select name="status" value={formData.status} onValueChange={(val) => handleFormSelectChange('status', val)} required><SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger><SelectContent>{residencyStatuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent></Select></div>
//                     <div className="sm:col-span-2"><Label htmlFor="images">Image URLs (comma-separated)</Label><Textarea id="images" name="images" value={formData.images} onChange={handleFormChange} placeholder="http://example.com/img1.jpg, ..." rows={2}/></div>
//                 </div>
//                 {/* == End of Add/Edit Form JSX == */}
//                 {formError && (<p className="text-sm text-destructive">{formError}</p>)}
//                 <DialogFooter>
//                     <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => !isSubmitting && setIsFormDialogOpen(false)}>Cancel</Button>
//                     <Button type="submit" className="bg-rose-500 hover:bg-rose-600" disabled={isSubmitting}>{isSubmitting ? "Saving..." : (editingResidency ? "Save Changes" : "Add Residency")}</Button>
//                 </DialogFooter>
//             </form>
//         </DialogContent>
//       </Dialog>

//       {/* --- NEW: Residency Details Dialog --- */}
//       <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
//         <DialogContent className="sm:max-w-xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>{selectedResidencyForDetails?.title || "Residency Details"}</DialogTitle>
//             <DialogDescription>Comprehensive information about the residency.</DialogDescription>
//           </DialogHeader>
//           {selectedResidencyForDetails ? (
//             <div className="py-4 space-y-6">
//               {/* Image Gallery Section */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-3">Gallery</h3>
//                 {detailImages.length > 0 ? (
//                   <div className="relative aspect-video bg-muted rounded-lg overflow-hidden shadow-md">
//                     <img src={detailImages[currentDetailImageIndex]} alt={`${selectedResidencyForDetails.title} ${currentDetailImageIndex + 1}`} className="w-full h-full object-cover transition-opacity duration-300" />
//                     {detailImages.length > 1 && (
//                       <>
//                         <Button onClick={handlePrevDetailImage} variant="secondary" size="icon" className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-9 w-9 shadow-lg"><ArrowLeft className="h-5 w-5"/></Button>
//                         <Button onClick={handleNextDetailImage} variant="secondary" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-9 w-9 shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></Button>
//                         <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 p-1.5 bg-black/40 backdrop-blur-sm rounded-full">
//                             {detailImages.map((_, idx) => (<button key={idx} onClick={() => setCurrentDetailImageIndex(idx)} className={`h-2 w-2 rounded-full transition-colors ${currentDetailImageIndex === idx ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white/80'}`}></button>))}
//                         </div>
//                       </>
//                     )}
//                   </div>
//                 ) : ( <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground"><ImageIcon className="h-12 w-12 mb-2" /><p>No images available.</p></div> )}
//               </div>

//               {/* Details Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm mt-4">
//                 <div className="space-y-0.5"><Label className="text-xs font-medium text-muted-foreground">Wilaya</Label><p className="font-semibold">{selectedResidencyForDetails.wilaya}</p></div>
//                 <div className="space-y-0.5"><Label className="text-xs font-medium text-muted-foreground">Type</Label><p>{selectedResidencyForDetails.type}</p></div>
//                 <div className="space-y-0.5"><Label className="text-xs font-medium text-muted-foreground">Status</Label><p><Badge variant={selectedResidencyForDetails.status === 'approved' ? 'success' : 'warning'} className="capitalize">{selectedResidencyForDetails.status}</Badge></p></div>
//                 <div className="space-y-0.5"><Label className="text-xs font-medium text-muted-foreground">Base Price</Label><p>DZD {selectedResidencyForDetails.price?.toLocaleString() || 'N/A'}</p></div>
//                 <div className="space-y-0.5"><Label className="text-xs font-medium text-muted-foreground">Total Rooms</Label><p>{selectedResidencyForDetails.totalRoomCount || 'N/A'}</p></div>
//                 <div className="space-y-0.5"><Label className="text-xs font-medium text-muted-foreground">Floors</Label><p>{selectedResidencyForDetails.floorCount || 'N/A'}</p></div>

//                 <div className="md:col-span-2 lg:col-span-3 mt-2 space-y-0.5"><Label className="text-xs font-medium text-muted-foreground">Description</Label><p className="text-muted-foreground whitespace-pre-line leading-relaxed">{selectedResidencyForDetails.description || 'No description.'}</p></div>

//                 <div className="md:col-span-2 lg:col-span-3 mt-2">
//                   <Label className="text-xs font-medium text-muted-foreground block mb-1">Amenities</Label>
//                   {selectedResidencyForDetails.amenities && selectedResidencyForDetails.amenities.length > 0 ? (
//                     <div className="flex flex-wrap gap-2">{selectedResidencyForDetails.amenities.map(amenity => <Badge key={amenity} variant="outline" className="text-xs">{amenity}</Badge>)}</div>
//                   ) : <p className="text-muted-foreground text-xs italic">No amenities listed.</p>}
//                 </div>
//                 <div className="md:col-span-2 lg:col-span-3 mt-2">
//                   <Label className="text-xs font-medium text-muted-foreground block mb-1">Room Types Offered</Label>
//                   {selectedResidencyForDetails.roomTypesAvailable && selectedResidencyForDetails.roomTypesAvailable.length > 0 ? (
//                     <div className="flex flex-wrap gap-2">{selectedResidencyForDetails.roomTypesAvailable.map(type => <Badge key={type} variant="secondary" className="text-xs">{type}</Badge>)}</div>
//                   ) : <p className="text-muted-foreground text-xs italic">No specific room types listed.</p>}
//                 </div>
//               </div>
//             </div>
//           ) : <p className="text-muted-foreground py-4 text-center">No residency details to display.</p>}
//           <DialogFooter><Button type="button" variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>Close</Button></DialogFooter>
//         </DialogContent>
//       </Dialog>
//       {/* --- End Details Dialog --- */}

//       <Toaster />
//     </DashboardShell>
//   );
// }
