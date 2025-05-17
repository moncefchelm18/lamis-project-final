import React, { useState, useEffect, useCallback } from "react";
import axios from "axios"; // Import Axios
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, MapPin, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardShell from "@/components/layout/DashboardShell";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce"; // Assuming you have this

// --- Placeholder Image Imports (can keep for fallback or initial display) ---
import r1 from "@/assets/images/residencies/r1.png";
import r2 from "@/assets/images/residencies/r2.png";
import r3 from "@/assets/images/residencies/r3.png";

const placeholderImages = [r1, r2, r3];
const getRandomPlaceholderImage = (id) => {
  if (!id) return placeholderImages[0]; // Fallback for undefined id
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return placeholderImages[Math.abs(hash) % placeholderImages.length];
};
// --- End Placeholder Image Imports ---

const API_BASE_URL = "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Optional: Add interceptor if student routes require auth
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // REPLACE with your actual token key
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Mock Wilayas - you might fetch this from an API too eventually
const mockWilayas = [
  "All",
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
  "Bordj Bou Arreridj",
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

const ITEMS_PER_PAGE = 6;

export default function StudentResidencies() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [accommodations, setAccommodations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWilaya, setSelectedWilaya] = useState("All");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAccommodations = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", ITEMS_PER_PAGE.toString());
      if (debouncedSearchQuery) {
        params.append("search", debouncedSearchQuery);
      }
      if (selectedWilaya && selectedWilaya.toLowerCase() !== "all") {
        params.append("wilaya", selectedWilaya);
      }

      const response = await apiClient.get(
        `/residencies/student?${params.toString()}`
      );
      if (response.data.success) {
        setAccommodations(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch accommodations"
        );
      }
    } catch (err) {
      console.error("API Error fetchAccommodations:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unknown error occurred.";
      setFetchError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setAccommodations([]); // Clear data on error
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearchQuery, selectedWilaya, toast]);

  useEffect(() => {
    fetchAccommodations();
  }, [fetchAccommodations]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedWilaya]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // setCurrentPage(1) is handled by the useEffect above
  };

  const handleWilayaChange = (value) => {
    setSelectedWilaya(value);
    // setCurrentPage(1) is handled by the useEffect above
  };

  const handleViewDetails = (residencyId) => {
    navigate(`/dashboard/student/residencies/${residencyId}`);
  };

  const renderLoadingSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
        <Card key={`skel-${i}`} className="flex flex-col">
          <Skeleton className="aspect-[16/9] w-full rounded-t-lg" />
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-3/4 mb-1" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="flex-grow">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
          <CardFooter className="pt-2">
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <DashboardShell role="student">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          University Residencies
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          Browse and discover available accommodations.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filter Residencies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search-residencies" className="sr-only">
                Search by Name
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  id="search-residencies"
                  placeholder="Search by residence name, city..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="wilaya-filter-page" className="sr-only">
                Filter by Wilaya
              </Label>
              <Select value={selectedWilaya} onValueChange={handleWilayaChange}>
                <SelectTrigger id="wilaya-filter-page" className="w-full">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter by Wilaya" />
                </SelectTrigger>
                <SelectContent>
                  {mockWilayas.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <section>
        {isLoading && renderLoadingSkeletons()}
        {!isLoading && fetchError && (
          <div className="text-center py-10">
            <p className="text-destructive mb-4">{fetchError}</p>
            <Button onClick={fetchAccommodations} variant="outline">
              Try Again
            </Button>
          </div>
        )}
        {!isLoading && !fetchError && accommodations.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            No accommodations found matching your criteria.
          </div>
        )}

        {!isLoading && !fetchError && accommodations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accommodations.map((acc) => (
              <Card
                key={acc.id || acc._id}
                className="flex flex-col hover:shadow-lg transition-shadow duration-200"
              >
                <div className="aspect-[16/9] bg-muted rounded-t-lg overflow-hidden">
                  <img
                    // Use API image if available, otherwise fallback
                    src={
                      acc.images && acc.images.length > 0
                        ? acc.images[0]
                        : getRandomPlaceholderImage(acc.id || acc._id)
                    }
                    alt={acc.title || "Residence"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = getRandomPlaceholderImage(
                        acc.id || acc._id
                      );
                    }} // Fallback if API image fails
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle
                    className="text-lg truncate"
                    title={acc.title || "Unnamed Residence"}
                  >
                    {acc.title || "Unnamed Residence"}
                  </CardTitle>
                  <CardDescription className="flex items-center text-sm">
                    <MapPin className="mr-1 h-3.5 w-3.5" />{" "}
                    {acc.wilaya || "N/A"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground flex-grow">
                  <p className="line-clamp-3">
                    {acc.description || "No description available."}
                  </p>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white" // Explicitly set text color if needed
                    onClick={() => handleViewDetails(acc.id || acc._id)}
                  >
                    <Eye className="mr-2 h-4 w-4" /> View Details & Book
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!isLoading &&
          !fetchError &&
          accommodations.length > 0 &&
          totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 py-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {/* Optional: Page number display */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                // Limit number of page buttons shown for very large totalPages
                .filter((pageNumber) => {
                  if (totalPages <= 5) return true;
                  const distance = Math.abs(pageNumber - currentPage);
                  const isFirstOrLast =
                    pageNumber === 1 || pageNumber === totalPages;
                  const isNearCurrent = distance <= 1;
                  return (
                    isFirstOrLast ||
                    isNearCurrent ||
                    (distance === 2 &&
                      (currentPage === 1 ||
                        currentPage === totalPages ||
                        currentPage === 2 ||
                        currentPage === totalPages - 1))
                  );
                })
                .map((pageNumber, index, arr) => (
                  <React.Fragment key={pageNumber}>
                    {/* Add ellipsis if there's a gap to the next shown page number */}
                    {index > 0 && pageNumber - arr[index - 1] > 1 && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={
                        currentPage === pageNumber ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  </React.Fragment>
                ))}
              {totalPages > 5 &&
                currentPage < totalPages - 2 &&
                totalPages - (currentPage + 1) > 1 && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
              {totalPages > 5 &&
                currentPage < totalPages - 2 &&
                !Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((pageNumber) => {
                    /* same filter as above */ const distance = Math.abs(
                      pageNumber - currentPage
                    );
                    const isFirstOrLast =
                      pageNumber === 1 || pageNumber === totalPages;
                    const isNearCurrent = distance <= 1;
                    return isFirstOrLast || isNearCurrent;
                  })
                  .includes(totalPages) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                )}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
      </section>
      <Toaster />
    </DashboardShell>
  );
}
