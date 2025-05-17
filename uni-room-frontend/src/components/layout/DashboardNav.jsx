"use client";

import { Link, useLocation } from "react-router-dom";
import {
  Building,
  Home,
  LogOut,
  Settings,
  User,
  Users,
  UserCheck,
  Contact,
  Bed,
  ClipboardList,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function DashboardNav({ role }) {
  const location = useLocation(); // Get the location object
  const pathname = location.pathname;

  const studentItems = [
    {
      title: "Dashboard",
      href: "/dashboard/student",
      icon: Home,
    },
    {
      title: "Residencies",
      href: "/dashboard/student/residencies",
      icon: Building,
    },
    {
      title: "Room Request",
      href: "/dashboard/student/request",
      icon: Bed,
    },
    {
      title: "Profile",
      href: "/dashboard/student/profile",
      icon: User,
    },
  ];

  const adminItems = [
    {
      title: "Dashboard",
      href: "/dashboard/admin",
      icon: Home,
    },
    {
      title: "User Approvals",
      href: "/dashboard/admin/user-approvals",
      icon: UserCheck,
    },
    // {
    //   title: "Students",
    //   href: "/dashboard/admin/students",
    //   icon: Users,
    // },
    // {
    //   title: "Contact",
    //   href: "/dashboard/admin/requests",
    //   icon: Contact,
    // },
    // {
    //   title: "Site Maintenance",
    //   href: "/dashboard/admin/site-maintenance",
    //   icon: Settings,
    // },
  ];

  const housingItems = [
    {
      title: "Dashboard",
      href: "/dashboard/service",
      icon: Home,
    },
    {
      title: "Manage Residencies",
      href: "/dashboard/service/residencies",
      icon: Building2,
    },
    {
      title: "Booking Requests",
      href: "/dashboard/service/booking-requests",
      icon: ClipboardList,
    },

    // {
    //   title: "Room Requests",
    //   href: "/dashboard/service/requests",
    //   icon: Building,
    // },
    // {
    //   title: "Student Management",
    //   href: "/dashboard/service/students",
    //   icon: Users,
    // },
  ];

  const items =
    role === "student"
      ? studentItems
      : role === "admin"
      ? adminItems
      : housingItems;

  return (
    <nav className="grid items-start gap-2 ">
      {items.map((item, index) => (
        <Link key={index} to={item.href}>
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href
                ? "bg-accent text-accent-foreground"
                : "transparent"
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </span>
        </Link>
      ))}
    </nav>
  );
}
export default DashboardNav;
