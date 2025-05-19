import DashboardHeader from "@/components/layout/DashboardHeader";
import DashboardNav from "@/components/layout/DashboardNav";

function DashboardShell({ role, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <DashboardHeader
        role={role}
        className="h-16 fixed top-0 left-0 right-0 z-40 w-full bg-white shadow-sm"
      />

      <div className="flex flex-1 ">
        <aside
          className="fixed top-14 bottom-0 left-0 z-30 
                     w-[200px] lg:w-[240px] 
                     hidden flex-col overflow-y-auto 
                     bg-white px-2 py-2 shadow-lg md:flex"
        >
          <DashboardNav role={role} />
        </aside>

        <main
          className="flex-1 flex-col overflow-y-auto 
                     md:ml-[200px] lg:ml-[240px] 
                     px-8 py-6 sm:px-0 sm:pr-6 md:px-8 md:py-6"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
export default DashboardShell;
// import DashboardHeader from "@/components/layout/DashboardHeader";
// import DashboardNav from "@/components/layout/DashboardNav";

// function DashboardShell({ role, children }) {
//   return (
//     <div className="flex min-h-screen flex-col">
//       <DashboardHeader role={role} />
//       <div className="container grid flex-1 gap-8 md:grid-cols-[200px_1fr] bg-gray-50 bg-opacity-10 lg:grid-cols-[240px_1fr]">
//         <aside className="hidden w-[200px] flex-col bg-white shadow-lg px-2 py-2 md:flex lg:w-[240px] ">
//           <DashboardNav role={role} />
//         </aside>
//         <main className="flex w-full flex-1 flex-col overflow-hidden px-8 py-6  sm:px-0 sm:pr-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }
// export default DashboardShell;
