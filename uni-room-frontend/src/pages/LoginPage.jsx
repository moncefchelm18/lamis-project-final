import React from "react";
import LoginForm from "@/components/auth/LoginForm"; // Adjust path

const LoginPage = () => {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 p-4">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
