import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { FaHome, FaCalendarAlt, FaPhotoVideo, FaComment, FaBars, FaCog } from "react-icons/fa";

const SidebarUser = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const location = useLocation();

  const toggleSidebar = () => setShowMobileSidebar(!showMobileSidebar);

  useEffect(() => {
    const fetchNewCount = async () => {
      try {
        const { data } = await axios.get("/api/media/unread-count");
        setNewCount(data.count);
      } catch (err) {
        console.error("Error fetching media count:", err);
      }
    };

    fetchNewCount();
    const interval = setInterval(fetchNewCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { label: "Beranda", to: "/user/dashboard", icon: <FaHome className="mr-3" /> },
    { label: "Jadwal Pelayanan", to: "/user/dashboard/jadwal-pelayanan", icon: <FaCalendarAlt className="mr-3" /> },
    {
      label: "Media & Dokumentasi",
      to: "/user/dashboard/media-materi",
      icon: <FaPhotoVideo className="mr-3" />,
      badge: newCount,
    },
    { label: "Komentar", to: "/user/dashboard/chat", icon: <FaComment className="mr-3" /> },
    // Menambahkan item Pengaturan
    { label: "Pengaturan", to: "/user/dashboard/settings", icon: <FaCog className="mr-3" /> },
  ];

  return (
    <>
      {/* Toggle Button (Mobile only) */}
      <button
        onClick={toggleSidebar}
        className="text-white bg-blue-800 p-3 fixed top-4 left-4 z-50 rounded-full shadow-md md:hidden"
        aria-label="Toggle Sidebar"
      >
        <FaBars />
      </button>

      {/* Overlay when sidebar is open on mobile */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-50 bg-blue-800 text-white shadow-lg transition-transform duration-300
        ${showMobileSidebar ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:relative md:flex md:flex-col
        ${isCollapsed ? "w-20" : "w-64"}
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-center h-20 bg-blue-900">
          {!isCollapsed && <h2 className="text-2xl font-semibold">User Dashboard</h2>}
        </div>

        {/* Menu Items */}
        <ul className="mt-8 space-y-2 px-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.to}
                onClick={() => setShowMobileSidebar(false)} // Close on mobile when clicking
                className={`flex items-center py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 ${
                  location.pathname === item.to ? "bg-blue-700" : ""
                }`}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default SidebarUser;
