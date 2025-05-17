import React, { useContext } from "react";
import ProfileCard from "./ProfileCard";
import ContactUsForm from "./ContactUsForm";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { AuthContext } from "@/App"; // Adjust path if needed

const StudentDashboard = () => {
  const { user } = useContext(AuthContext); // Get logged-in user data
  const { toast } = useToast();

  // Placeholder function
  const handlePrintReceipt = () => {
    console.log("Placeholder: Initiating rent receipt printing...");
    toast({
      title: "Receipt Action",
      description: "Rent receipt generation initiated (Placeholder).",
    });
    // In a real app: Trigger API call to generate PDF or open a print dialog
  };

  // Placeholder function for profile update
  const handleUpdateProfile = () => {
    console.log(
      "Placeholder: Navigating to profile update page or opening modal..."
    );
    toast({
      title: "Profile Action",
      description: "Opening profile update form (Placeholder).",
    });
    // In a real app: Navigate to an edit page or open a Dialog/Modal
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Profile Section */}
      <div className="md:col-span-1 space-y-6">
        <ProfileCard user={user} onUpdateProfile={handleUpdateProfile} />
        <Button
          onClick={handlePrintReceipt}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Printer className="mr-2 h-4 w-4" /> Print Rent Receipt
        </Button>
      </div>

      {/* Contact Us Section */}
      <div className="md:col-span-2">
        <ContactUsForm />
      </div>
    </div>
  );
};

export default StudentDashboard;
