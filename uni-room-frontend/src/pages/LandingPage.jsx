import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 p-6">
      <Card className="w-full max-w-4xl mb-12 shadow-lg border-none bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-12 h-12 text-red-500"
            >
              <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
              <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
            </svg>
          </div>
          <CardTitle className="text-3xl md:text-4xl font-bold text-gray-800">
            Welcome to UniRooms
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 mt-2">
            Your central hub for university housing management.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pt-2">
          <p className="mb-8 text-gray-700">
            Streamlining room assignments, profile updates, and communication
            for students, administrators, and housing managers.
          </p>
          <Link to="/login">
            <Button
              size="lg"
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 text-lg rounded-full shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              Get Started / Login
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          System Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/90 shadow-md border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-red-600">
                For Students
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 space-y-2">
              <p className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />{" "}
                View Profile & Room
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />{" "}
                Update Contact Info
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />{" "}
                Print Rent Receipts
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />{" "}
                Contact Support
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/90 shadow-md border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-red-600">
                For Administrators
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 space-y-2">
              <p className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />{" "}
                Manage Student Records
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />{" "}
                Add, Edit, Delete Students
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />{" "}
                Search & Filter Students
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />{" "}
                Validate Profile Changes
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/90 shadow-md border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-red-600">
                For Housing Managers
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 space-y-2">
              <p className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />{" "}
                Approve Room Requests
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />{" "}
                Approve Profile Updates
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />{" "}
                Edit Student Information
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />{" "}
                Oversee Housing Status
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
