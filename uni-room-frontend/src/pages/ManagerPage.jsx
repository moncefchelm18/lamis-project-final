import React from "react";
import ManagerDashboard from "@/components/manager/ManagerDashboard";

const ManagerPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Housing Manager Dashboard
      </h1>
      <ManagerDashboard />
    </div>
  );
};

export default ManagerPage;
