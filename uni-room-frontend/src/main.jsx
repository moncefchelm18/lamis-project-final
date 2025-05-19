import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // Your global styles
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx"; // Import AuthProvider
import { Toaster as ShadToaster } from "@/components/ui/toaster"; // Shadcn Toaster

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {" "}
        {/* Wrap App with AuthProvider */}
        <App />
        <ShadToaster /> {/* Ensure Toaster is accessible globally */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
