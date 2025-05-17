import React, { useContext } from "react";
import { NavLink, Link } from "react-router-dom"; // Use NavLink for active styling
import { AuthContext } from "@/App"; // Adjust path if needed
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, // Generic dashboard icon
  Users, // Admin: Manage Students
  UserPlus, // Admin: Add Student (Maybe link to section?)
  ShieldCheck, // Admin/Manager: Approvals
  Settings, // Placeholder
  MessageSquare, // Student: Contact Us
  UserCircle, // Student: Profile
  Printer, // Student: Print Receipt
  Building, // Manager: Housing Overview
} from "lucide-react";

// Helper function for NavLink className
const getNavLinkClass = ({ isActive }) =>
  cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
    {
      "bg-primary text-primary-foreground hover:text-primary-foreground":
        isActive, // Active state
    }
  );

const Sidebar = () => {
  const { userRole } = useContext(AuthContext);

  const renderNavLinks = () => {
    switch (userRole) {
      case "student":
        return (
          <>
            <NavLink to="/dashboard" className={getNavLinkClass} end>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
            {/* Add other student-specific links if needed */}
            {/* Example: Maybe link to sections within the dashboard? */}
            {/* <NavLink to="/dashboard#profile" className={getNavLinkClass}>
                           <UserCircle className="h-4 w-4" /> Profile
                         </NavLink>
                         <NavLink to="/dashboard#contact" className={getNavLinkClass}>
                            <MessageSquare className="h-4 w-4" /> Contact Us
                        </NavLink> */}
          </>
        );
      case "admin":
        return (
          <>
            <NavLink to="/admin" className={getNavLinkClass} end>
              <LayoutDashboard className="h-4 w-4" />
              Student Management
            </NavLink>
            <NavLink to="/admin/approvals" className={getNavLinkClass}>
              <ShieldCheck className="h-4 w-4" />
              Approval Queue
            </NavLink>
            {/* <NavLink to="/admin/settings" className={getNavLinkClass}> // Placeholder
                            <Settings className="h-4 w-4" />
                            System Settings
                        </NavLink> */}
          </>
        );
      case "manager":
        return (
          <>
            <NavLink to="/manager" className={getNavLinkClass} end>
              <Building className="h-4 w-4" />
              Housing Dashboard
            </NavLink>
            <NavLink to="/admin" className={getNavLinkClass}>
              {" "}
              {/* Manager might need student list too */}
              <Users className="h-4 w-4" />
              View Students
            </NavLink>
            {/* <NavLink to="/manager/reports" className={getNavLinkClass}> // Placeholder
                             <FileText className="h-4 w-4" />
                            Reports
                        </NavLink> */}
          </>
        );
      default:
        return null; // Should not happen in protected routes
    }
  };

  return (
    // Fixed sidebar styling
    <div className="fixed inset-y-0 left-0 z-30 w-64 bg-card border-r shadow-md hidden md:flex md:flex-col">
      {/* Sidebar Header/Logo */}
      <div className="flex h-16 items-center border-b px-6 shrink-0">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-red-500"
          >
            <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
            <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
          </svg>
          <span>UniRooms</span>
        </Link>
      </div>
      {/* Navigation Area */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {renderNavLinks()}
      </nav>
      {/* Optional Sidebar Footer */}
      {/* <div className="mt-auto p-4 border-t">
                 <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} UniRooms</p>
             </div> */}
    </div>
  );
};

export default Sidebar;
