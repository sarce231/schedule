import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaUsers,
  FaBars,
  FaPhotoVideo,
  FaComment,
  FaTimes,
  FaEnvelope,  // <-- Import ikon pesan masuk
} from "react-icons/fa";
import io from "socket.io-client";

const socket = io("http://localhost:5000", { transports: ["websocket"] });

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hasNewComment, setHasNewComment] = useState(false);
  const location = useLocation();

  useEffect(() => {
    socket.on("new-comment", () => {
      if (location.pathname !== "/admin/dashboard/chat") {
        setHasNewComment(true);
      }
    });

    return () => {
      socket.off("new-comment");
    };
  }, [location]);

  useEffect(() => {
    if (location.pathname === "/admin/dashboard/chat") {
      setHasNewComment(false);
    }
  }, [location]);

  const menuItems = [
    {
      label: "Beranda",
      to: "/admin/dashboard",
      icon: <FaTachometerAlt className="mr-3" />,
    },
    {
      label: "Kelola Jadwal Ibadah",
      to: "/admin/dashboard/auto-schedule-form",
      icon: <FaCalendarAlt className="mr-3" />,
    },
    {
      label: "Media & Dokumentasi",
      to: "/admin/dashboard/media",
      icon: <FaPhotoVideo className="mr-3" />,
    },
    {
      label: (
        <span className="flex items-center relative">
          Komentar
          {hasNewComment && (
            <span className="absolute -top-1 right-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </span>
          )}
        </span>
      ),
      to: "/admin/dashboard/chat",
      icon: <FaComment className="mr-3" />,
    },
     // Tambahan menu Pesan Masuk
    {
      label: "Pesan Masuk",
      to: "/admin/dashboard/pesan-masuk",
      icon: <FaEnvelope className="mr-3" />,
    },
    {
      label: "Manajemen Pengguna",
      to: "/admin/dashboard/manajemen-pengguna",
      icon: <FaUsers className="mr-3" />,
    },
   
  ];

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileOpen]);

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 text-white bg-gray-800 p-2 rounded"
      >
        <FaBars />
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      <div
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white shadow-lg z-50 transform transition-transform duration-300
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static md:block w-64`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-20 bg-gray-900 px-4">
            <h2 className="text-2xl font-semibold">Dashboard Admin</h2>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden text-white"
            >
              <FaTimes />
            </button>
          </div>

          <ul className="mt-8 space-y-4 px-4">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.to}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center py-3 px-3 hover:bg-gray-700 rounded-lg transition duration-200 ${
                    location.pathname === item.to ? "bg-gray-700" : ""
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
