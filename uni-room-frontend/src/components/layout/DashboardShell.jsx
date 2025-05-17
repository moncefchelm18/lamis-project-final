import DashboardHeader from "@/components/layout/DashboardHeader";
import DashboardNav from "@/components/layout/DashboardNav";

function DashboardShell({ role, children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader role={role} />
      <div className="container grid flex-1 gap-8 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex lg:w-[240px]">
          <DashboardNav role={role} />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden px-8 py-6 sm:px-0 sm:pr-6">
          {children}
        </main>
      </div>
    </div>
  );
}
export default DashboardShell;
