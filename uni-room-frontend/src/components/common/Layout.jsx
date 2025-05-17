// src/components/common/Layout.jsx

import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar"; // Import the new Sidebar

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen w-screen bg-muted/40">
      <Sidebar />
      <div className="flex flex-col flex-1 md:pl-64">
        <Header />
        <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
        <footer className="bg-background border-t text-center text-xs text-muted-foreground py-2">
          UniRooms © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
};

export default Layout;
