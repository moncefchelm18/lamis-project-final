import React from "react";
import AdminDashboard from "@/components/admin/AdminDashboard";

const AdminPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Administrator Dashboard
      </h1>
      <AdminDashboard />
    </div>
  );
};

export default AdminPage;
