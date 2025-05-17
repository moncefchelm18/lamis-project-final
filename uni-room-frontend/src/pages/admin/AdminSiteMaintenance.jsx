import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardShell from "@/components/layout/DashboardShell"; // Adjust path if needed
import {
  FileEdit,
  DatabaseZap,
  SlidersHorizontal,
  AlertTriangle,
} from "lucide-react"; // Icons

export default function AdminSiteMaintenance() {
  // Placeholder function for button clicks
  const handlePlaceholderClick = (actionDescription) => {
    alert(
      `Placeholder Action: ${actionDescription}\n\nThis functionality requires backend integration.`
    );
  };

  return (
    <DashboardShell role="admin">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Site Maintenance & Configuration
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage website content, database operations, and system settings.
        </p>
      </div>

      {/* Grid Layout for Maintenance Sections */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {/* Card 1: Website Content */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Website Content
            </CardTitle>
            <FileEdit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Update text, images, or announcements displayed on public-facing
              pages like the Landing Page.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() =>
                handlePlaceholderClick("Navigate to Content Editor")
              }
            >
              Manage Content (Placeholder)
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: Database Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Database Management
            </CardTitle>
            <DatabaseZap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Access tools for database inspection, backup, or advanced data
              operations. Requires caution.
            </p>
            <div className="flex items-center p-2 rounded-md bg-destructive/10 border border-destructive/20 mb-4">
              <AlertTriangle className="h-4 w-4 text-destructive mr-2 flex-shrink-0" />
              <p className="text-xs text-destructive/80">
                Use database tools with extreme caution.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handlePlaceholderClick("Open Database Admin Tool")}
            >
              Database Tools (Placeholder)
            </Button>
          </CardContent>
        </Card>

        {/* Card 3: System/UI Configuration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              System Configuration
            </CardTitle>
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Adjust core site settings, user interface options, or application
              parameters (e.g., maintenance mode, email settings).
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() =>
                handlePlaceholderClick("Navigate to System Settings")
              }
            >
              Configure Settings (Placeholder)
            </Button>
            {/* Future: Link this to where GET/PUT /admin/settings is implemented */}
          </CardContent>
        </Card>
      </div>

      {/* Optional: Add more sections as needed */}
      {/*
      <div className="mt-8">
        <Card>
          <CardHeader><CardTitle>More Tools...</CardTitle></CardHeader>
          <CardContent>...</CardContent>
        </Card>
      </div>
      */}
    </DashboardShell>
  );
}
