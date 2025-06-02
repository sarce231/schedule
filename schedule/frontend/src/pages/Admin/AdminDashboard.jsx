import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar tetap di sisi kiri */}
      <Sidebar />

      {/* Konten utama ditentukan oleh Outlet */}
      <div className="flex-1 p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
