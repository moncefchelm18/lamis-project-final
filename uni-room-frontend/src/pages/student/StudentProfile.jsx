"use client";

import { useState, useEffect, useCallback } from "react"; // Added useCallback
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
import { Label } from "@/components/ui/label";
import DashboardShell from "@/components/layout/DashboardShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Corrected import for toast if it's from useToast hook, otherwise adjust as per your setup
import { useToast } from "@/hooks/use-toast"; // Assuming useToast is the hook
import { Toaster } from "@/components/ui/toaster";
import axios from "axios"; // Import axios
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

// --- Axios API Client Setup ---
const API_BASE_URL = "http://localhost:5000/api"; // Ensure this matches your backend port

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
// --- End Axios API Client Setup ---

export default function StudentProfile() {
  const { toast } = useToast(); // Correct usage of the hook
  const [initialData, setInitialData] = useState({ name: "", email: "" });
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/users/profile");
      if (response.data.success) {
        const profileData = {
          name: response.data.data.name || "",
          email: response.data.data.email || "",
          // phone: response.data.data.phone || "", // Add if backend provides
        };
        setInitialData(profileData);
        setFormData(profileData);
      } else {
        toast({
          title: "Error fetching profile",
          description: response.data.message || "Could not load your profile.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "An error occurred while fetching your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    if (
      formData.name === initialData.name &&
      formData.email === initialData.email
    ) {
      toast({
        title: "No Changes",
        description: "You haven't made any changes to your profile.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
      };
      const response = await apiClient.put("/users/profile", payload);
      if (response.data.success) {
        toast({
          title: "Profile Updated",
          description:
            "Your profile information has been successfully updated.",
        });
        setInitialData(formData); // Update initialData to reflect saved changes
        // Optionally update localStorage if user data is stored there comprehensively
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            user.name = response.data.user.name;
            user.email = response.data.user.email;
            localStorage.setItem("user", JSON.stringify(user));
          } catch (e) {
            console.error("Failed to update user in localStorage", e);
          }
        }
      } else {
        throw new Error(response.data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Update Failed",
        description:
          error.response?.data?.message ||
          error.message ||
          "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast({
        title: "Missing Fields",
        description: "Please fill in current and new password.",
        variant: "destructive",
      });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "New password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsPasswordSubmitting(true);
    try {
      // Backend expects 'password' to be the new password.
      // It does not validate currentPassword in the provided route.
      // For a real app, you'd send currentPassword for validation.
      const payload = {
        password: passwordData.newPassword,
        // currentPassword: passwordData.currentPassword, // Send if backend handles it
      };
      const response = await apiClient.put("/users/profile", payload); // Same endpoint
      if (response.data.success) {
        toast({
          title: "Password Updated",
          description: "Your password has been successfully changed.",
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      } else {
        throw new Error(response.data.message || "Failed to update password.");
      }
    } catch (error) {
      console.error("Password update error:", error);
      toast({
        title: "Password Update Failed",
        description:
          error.response?.data?.message ||
          error.message ||
          "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardShell role="student">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-8 w-1/3" />
        </div>
        <Skeleton className="h-5 w-1/2 mb-6" />
        <Tabs defaultValue="profile" className="mt-6">
          <TabsList>
            <Skeleton className="h-10 w-32 mr-2" />
            <Skeleton className="h-10 w-32" />
          </TabsList>
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2 mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-28" />
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="student">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
      </div>
      <div className="mt-2">
        <p className="text-muted-foreground">
          View and update your personal information.
        </p>
      </div>

      <Tabs defaultValue="profile" className="mt-6">
        <TabsList>
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="security">Password & Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your name and email address.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleInfoSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInfoChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInfoChange}
                    />
                  </div>
                  {/* Phone field removed to match backend. Add back if backend supports it. */}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="bg-rose-500 hover:bg-rose-600"
                  disabled={
                    isSubmitting ||
                    (formData.name === initialData.name &&
                      formData.email === initialData.email)
                  }
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password. Choose a strong new password.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordSubmit}>
              <CardContent className="space-y-4">
                {/* Note: Your current backend PUT /users/profile does not validate currentPassword.
                             For a secure implementation, the backend should verify the current password
                             before allowing a change. This form includes it for UI completeness.
                         */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password (min. 6 characters)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    type="password"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="bg-rose-500 hover:bg-rose-600"
                  disabled={isPasswordSubmitting}
                >
                  {isPasswordSubmitting
                    ? "Updating Password..."
                    : "Change Password"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster />
    </DashboardShell>
  );
}
