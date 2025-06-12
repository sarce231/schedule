import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBell, FaEnvelope } from "react-icons/fa";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [previousCount, setPreviousCount] = useState(0);

  useEffect(() => {
    // Request permission for notifications
    if ("Notification" in window) {
      Notification.requestPermission();
    }

    // Fetch notifications when component mounts
    fetchNotifications();
    
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/messages");
      const messages = response.data;
      
      // Get the last 5 messages
      const recentMessages = messages.slice(0, 5);
      
      // Mark messages as unread if they're less than 24 hours old
      const now = new Date();
      const unread = recentMessages.filter(msg => {
        const messageDate = new Date(msg.createdAt);
        const hoursDiff = (now - messageDate) / (1000 * 60 * 60);
        return hoursDiff < 24;
      });
      
      setNotifications(recentMessages);
      setUnreadCount(unread.length);

      // Check for new notifications
      if (unread.length > previousCount) {
        // Show push notification
        if ("Notification" in window && Notification.permission === "granted") {
          const newMessages = unread.length - previousCount;
          new Notification("Pesan Baru", {
            body: `Anda memiliki ${newMessages} pesan baru`,
            icon: "/logo.png"
          });
        }
      }

      setPreviousCount(unread.length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleNotificationClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleMessageClick = (messageId) => {
    setShowDropdown(false);
    navigate("/admin/pesan-masuk");
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return "Baru saja";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} menit yang lalu`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam yang lalu`;
    return `${Math.floor(seconds / 86400)} hari yang lalu`;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                Schedule App
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Message Icon */}
            <Link
              to="/admin/pesan-masuk"
              className="p-2 rounded-full text-gray-600 hover:text-gray-800 focus:outline-none relative flex items-center justify-center"
            >
              <FaEnvelope size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-red-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Notification Icon */}
            <div className="relative">
              <button
                onClick={handleNotificationClick}
                className="p-2 rounded-full text-gray-600 hover:text-gray-800 focus:outline-none flex items-center justify-center"
              >
                <FaBell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900">Notifikasi</h3>
                    </div>
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <button
                          key={notification._id}
                          onClick={() => handleMessageClick(notification._id)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 focus:outline-none"
                        >
                          <div className="flex items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.nama}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {notification.pesan}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatTimeAgo(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        Tidak ada notifikasi baru
                      </div>
                    )}
                    <div className="border-t border-gray-200">
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          navigate("/admin/pesan-masuk");
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                      >
                        Lihat semua pesan
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Existing Menu Button */}
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
              >
                Menu
              </button>

              {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg">
                  <div className="py-1 rounded-md bg-white shadow-xs">
                    <Link
                      to="/admin/beranda"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Beranda
                    </Link>
                    <Link
                      to="/admin/jadwal"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Jadwal
                    </Link>
                    <Link
                      to="/admin/pesan-masuk"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Pesan Masuk
                    </Link>
                    <Link
                      to="/admin/media"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Media
                    </Link>
                    <Link
                      to="/admin/chat"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Chat
                    </Link>
                    <Link
                      to="/"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 