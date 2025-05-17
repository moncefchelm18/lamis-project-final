import React from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Home, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HousingDashboard() {
  // Placeholder: Fetch actual stats if needed (e.g., total residencies, pending booking requests)
  const stats = {
    totalResidencies: 12, // Mock
    pendingBookings: 5, // Mock
  };

  return (
    <DashboardShell role="service">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Service Manager Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of residencies and booking requests.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Residencies
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalResidencies}</div>
            <p className="text-xs text-muted-foreground">
              Managed university housing units
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/service/residencies">Manage Residencies</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Booking Requests
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground">
              Student applications awaiting review
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/service/booking-requests">Review Requests</Link>
            </Button>
          </CardFooter>
        </Card>
        {/* Add more relevant stats cards here */}
      </div>

      {/* Placeholder for recent activity or quick actions */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <Button asChild className="w-full bg-rose-500 hover:bg-rose-600">
              <Link to="/service/residencies">Add New Residency</Link>
            </Button>
            <Button asChild variant="secondary" className="w-full">
              <Link to="/service/booking-requests">
                View All Booking Requests
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import DashboardShell from "@/components/layout/DashboardShell";
// import { Building, FileText, Users } from "lucide-react";
// import { Link } from "react-router-dom";
// export default function HousingDashboard() {
//   return (
//     <DashboardShell role="service">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold tracking-tight">
//           Housing Manager Dashboard
//         </h1>
//       </div>
//       <div className="mt-2">
//         <p className="text-muted-foreground">
//           Welcome back, Housing Manager. Manage room assignments and student
//           requests.
//         </p>
//       </div>

//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Pending Requests
//             </CardTitle>
//             <FileText className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">18</div>
//             <p className="text-xs text-muted-foreground">
//               Requires your attention
//             </p>
//           </CardContent>
//           <CardFooter>
//             <Button variant="outline" size="sm" className="w-full" asChild>
//               <Link to="/dashboard/service/requests">View Requests</Link>
//             </Button>
//           </CardFooter>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Total Students
//             </CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">1,248</div>
//             <p className="text-xs text-muted-foreground">Currently housed</p>
//           </CardContent>
//           <CardFooter>
//             <Button variant="outline" size="sm" className="w-full" asChild>
//               <Link to="/dashboard/service/students">Manage Students</Link>
//             </Button>
//           </CardFooter>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Occupancy Rate
//             </CardTitle>
//             <Building className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">92%</div>
//             <p className="text-xs text-muted-foreground">
//               +2% from last semester
//             </p>
//           </CardContent>
//           <CardFooter>
//             <Button variant="outline" size="sm" className="w-full">
//               View Report
//             </Button>
//           </CardFooter>
//         </Card>
//       </div>

//       <div className="mt-8">
//         <Card>
//           <CardHeader>
//             <CardTitle>Building Occupancy</CardTitle>
//             <CardDescription>
//               Current occupancy rates by building
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               <div>
//                 <div className="flex items-center justify-between mb-1">
//                   <span className="text-sm font-medium">West Campus</span>
//                   <span className="text-sm text-muted-foreground">95%</span>
//                 </div>
//                 <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
//                   <div
//                     className="bg-rose-500 h-full rounded-full"
//                     style={{ width: "95%" }}
//                   ></div>
//                 </div>
//               </div>
//               <div>
//                 <div className="flex items-center justify-between mb-1">
//                   <span className="text-sm font-medium">East Hall</span>
//                   <span className="text-sm text-muted-foreground">88%</span>
//                 </div>
//                 <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
//                   <div
//                     className="bg-rose-500 h-full rounded-full"
//                     style={{ width: "88%" }}
//                   ></div>
//                 </div>
//               </div>
//               <div>
//                 <div className="flex items-center justify-between mb-1">
//                   <span className="text-sm font-medium">North Dorm</span>
//                   <span className="text-sm text-muted-foreground">92%</span>
//                 </div>
//                 <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
//                   <div
//                     className="bg-rose-500 h-full rounded-full"
//                     style={{ width: "92%" }}
//                   ></div>
//                 </div>
//               </div>
//               <div>
//                 <div className="flex items-center justify-between mb-1">
//                   <span className="text-sm font-medium">South Building</span>
//                   <span className="text-sm text-muted-foreground">85%</span>
//                 </div>
//                 <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
//                   <div
//                     className="bg-rose-500 h-full rounded-full"
//                     style={{ width: "85%" }}
//                   ></div>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="mt-8">
//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Activities</CardTitle>
//             <CardDescription>Latest actions in the system</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               <div className="flex items-start gap-4">
//                 <div className="rounded-full bg-rose-100 p-2">
//                   <Users className="h-4 w-4 text-rose-500" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium">Room Assignment Update</p>
//                   <p className="text-sm text-muted-foreground">
//                     Approved room change for David Miller from Room 205 to Room
//                     112.
//                   </p>
//                   <p className="text-xs text-muted-foreground mt-1">
//                     2 hours ago
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-4">
//                 <div className="rounded-full bg-rose-100 p-2">
//                   <Building className="h-4 w-4 text-rose-500" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium">Maintenance Request</p>
//                   <p className="text-sm text-muted-foreground">
//                     Scheduled maintenance for West Campus on May 15, 2025.
//                   </p>
//                   <p className="text-xs text-muted-foreground mt-1">
//                     1 day ago
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-4">
//                 <div className="rounded-full bg-rose-100 p-2">
//                   <FileText className="h-4 w-4 text-rose-500" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium">Profile Update</p>
//                   <p className="text-sm text-muted-foreground">
//                     Approved profile update for Michael Johnson.
//                   </p>
//                   <p className="text-xs text-muted-foreground mt-1">
//                     2 days ago
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </DashboardShell>
//   );
// }
