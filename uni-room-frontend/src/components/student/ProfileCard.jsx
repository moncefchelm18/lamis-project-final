import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle, Mail, Home } from "lucide-react"; // Icons

const ProfileCard = ({ user, onUpdateProfile }) => {
  // Use placeholder data if user is not available (shouldn't happen in protected route)
  const profile = user || { name: "N/A", email: "N/A", room: "N/A" };

  return (
    <Card className="shadow-md border-t-4 border-red-500">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <UserCircle className="w-6 h-6 text-red-500" /> Personal Information
        </CardTitle>
        <CardDescription>Your current profile details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-gray-700">
        <p>
          <strong>Name:</strong> {profile.name}
        </p>
        <p className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-500" />
          <strong>Email:</strong> {profile.email}
        </p>
        <p className="flex items-center gap-2">
          <Home className="w-4 h-4 text-gray-500" />
          <strong>Room No:</strong> {profile.room}
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={onUpdateProfile} variant="outline" size="sm">
          Update Profile
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileCard;
