import React from "react";
import { Outlet } from "react-router-dom";
import SidebarUser from "./SidebarUser";

const UserDashboard = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar user di kiri */}
      <SidebarUser />

      {/* Konten utama user */}
      <div className="flex-1 p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default UserDashboard;
