// Layout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar />
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />
        {/* Main content */}
        <main className="pt-16 md:pl-64 p-4 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
