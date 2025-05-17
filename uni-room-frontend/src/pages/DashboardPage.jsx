import React from "react";
import StudentDashboard from "@/components/student/StudentDashboard";

const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Student Dashboard
      </h1>
      <StudentDashboard />
    </div>
  );
};

export default DashboardPage;
