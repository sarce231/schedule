import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { FaMoon, FaSun, FaBell, FaComment } from "react-icons/fa";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:5000", { transports: ["websocket"] });

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [previousCount, setPreviousCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [unreadComments, setUnreadComments] = useState(0);
  const [showCommentDropdown, setShowCommentDropdown] = useState(false);
  const [previousCommentCount, setPreviousCommentCount] = useState(0);

  // Load read notifications and comments from localStorage
  const [readNotifications, setReadNotifications] = useState(() => {
    const saved = localStorage.getItem('readNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [readComments, setReadComments] = useState(() => {
    const saved = localStorage.getItem('readComments');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (location.pathname.startsWith("/admin")) {
      fetchNotifications();
      fetchComments();

      // Socket.io event listeners
      socket.on('initialMessages', (messages) => {
        if (Array.isArray(messages)) {
          const unreadMessages = messages
            .filter(msg => msg.sender === 'user' && !readComments.includes(msg._id))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          setComments(unreadMessages.slice(0, 5));
          setUnreadComments(unreadMessages.length);
        }
      });

      socket.on('newMessage', (message) => {
        if (message.sender === 'user' && !readComments.includes(message._id)) {
          setComments(prev => {
            const newComments = [message, ...prev].slice(0, 5);
            return newComments;
          });
          setUnreadComments(prev => prev + 1);
        }
      });

      socket.on('deletedMessage', (messageId) => {
        setComments(prev => prev.filter(msg => msg._id !== messageId));
        setUnreadComments(prev => Math.max(0, prev - 1));
      });

      const interval = setInterval(() => {
        fetchNotifications();
        fetchComments();
      }, 30000);

      return () => {
        clearInterval(interval);
        socket.off('initialMessages');
        socket.off('newMessage');
        socket.off('deletedMessage');
      };
    }
  }, [location.pathname, readComments]);

  // Save read notifications and comments to localStorage
  useEffect(() => {
    localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
  }, [readNotifications]);

  useEffect(() => {
    localStorage.setItem('readComments', JSON.stringify(readComments));
  }, [readComments]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const isDashboard =
    location.pathname.startsWith("/admin") || location.pathname.startsWith("/user");

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/messages");
      const messages = response.data;
      
      // Get the last 5 messages
      const recentMessages = messages.slice(0, 5);
      
      // Filter out read notifications
      const unreadMessages = recentMessages.filter(msg => !readNotifications.includes(msg._id));
      
      setNotifications(unreadMessages);
      setUnreadCount(unreadMessages.length);

      // Check for new notifications
      if (unreadMessages.length > previousCount) {
        if ("Notification" in window && Notification.permission === "granted") {
          const newMessages = unreadMessages.length - previousCount;
          new Notification("Pesan Baru", {
            body: `Anda memiliki ${newMessages} pesan baru`,
            icon: "/logo.png"
          });
        }
      }

      setPreviousCount(unreadMessages.length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/chat");
      const chatData = response.data;
      
      if (!chatData || !Array.isArray(chatData.messages)) {
        console.error("Invalid chat data structure:", chatData);
        return;
      }

      // Filter pesan yang belum dibaca (hanya pesan dari user)
      const unreadMessages = chatData.messages
        .filter(msg => msg.sender === 'user' && !readComments.includes(msg._id))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Ambil 5 pesan terbaru
      const recentUnreadMessages = unreadMessages.slice(0, 5);
      
      setComments(recentUnreadMessages);
      setUnreadComments(unreadMessages.length);

      // Check for new comments
      if (unreadMessages.length > previousCommentCount) {
        if ("Notification" in window && Notification.permission === "granted") {
          const newComments = unreadMessages.length - previousCommentCount;
          new Notification("Komentar Baru", {
            body: `Anda memiliki ${newComments} komentar baru`,
            icon: "/logo.png"
          });
        }
      }

      setPreviousCommentCount(unreadMessages.length);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
      setUnreadComments(0);
    }
  };

  const handleNotificationClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleMessageClick = (messageId) => {
    // Tambahkan ID notifikasi ke daftar yang sudah dibaca
    setReadNotifications(prev => [...prev, messageId]);
    
    // Hapus notifikasi yang diklik dari daftar
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification._id !== messageId)
    );
    
    // Kurangi jumlah notifikasi yang belum dibaca
    setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    
    // Tutup dropdown
    setShowDropdown(false);
    
    // Navigasi ke halaman pesan masuk
    navigate("/admin/dashboard/pesan-masuk");
  };

  const handleViewAllMessages = () => {
    // Tandai semua notifikasi sebagai sudah dibaca
    const allNotificationIds = notifications.map(n => n._id);
    setReadNotifications(prev => [...prev, ...allNotificationIds]);
    
    // Reset semua notifikasi
    setNotifications([]);
    setUnreadCount(0);
    setShowDropdown(false);
    navigate("/admin/dashboard/pesan-masuk");
  };

  const handleCommentClick = () => {
    setShowCommentDropdown(!showCommentDropdown);
  };

  const handleCommentItemClick = (commentId) => {
    // Tambahkan ID komentar ke daftar yang sudah dibaca
    setReadComments(prev => [...prev, commentId]);
    
    // Hapus komentar yang diklik dari daftar
    setComments(prevComments => 
      prevComments.filter(comment => comment._id !== commentId)
    );
    
    // Kurangi jumlah komentar yang belum dibaca
    setUnreadComments(prevCount => Math.max(0, prevCount - 1));
    
    // Tutup dropdown
    setShowCommentDropdown(false);
    
    // Navigasi ke halaman chat
    navigate("/admin/dashboard/chat");
  };

  const handleViewAllComments = () => {
    // Tandai semua komentar sebagai sudah dibaca
    const allCommentIds = comments.map(c => c._id);
    setReadComments(prev => [...prev, ...allCommentIds]);
    
    // Reset semua komentar
    setComments([]);
    setUnreadComments(0);
    setShowCommentDropdown(false);
    navigate("/admin/dashboard/chat");
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
    <>
      <header className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex justify-between items-center px-6 py-3 shadow-md fixed w-full top-0 left-0 z-50 h-16">
  {/* Kiri - Logo & Menu */}
  <div className="flex items-center gap-4 relative">
    <img
      src="/logo.jpg"
      alt="Logo"
            className="h-12 w-12 object-cover rounded-full shadow-md absolute md:relative left-0 z-60"
    />
    {location.pathname === "/" ? (
            <nav className="hidden md:flex gap-6 text-sm font-medium ml-16">
        <ScrollLink
          to="hero"
          smooth={true}
          duration={500}
          className="cursor-pointer hover:text-blue-500 transition"
        >
          Home
        </ScrollLink>
        <ScrollLink
          to="layanan"
          smooth={true}
          duration={500}
          className="cursor-pointer hover:text-blue-500 transition"
        >
          Layanan
        </ScrollLink>
        <ScrollLink
          to="kontak"
          smooth={true}
          duration={500}
          className="cursor-pointer hover:text-blue-500 transition"
        >
          Kontak
        </ScrollLink>
      </nav>
    ) : (
      <span className="text-lg font-semibold">
        {location.pathname === "/admin" && "Admin Dashboard"}
        {location.pathname === "/user" && "User Dashboard"}
      </span>
    )}
  </div>

        {/* Kanan - Avatar, Notifikasi, Tema, Logout */}
  <div className="flex items-center gap-4">
          {/* Notifikasi & Pesan hanya untuk admin dashboard */}
          {isDashboard && location.pathname.startsWith("/admin") && (
            <>
              {/* Icon Komentar */}
              <div className="relative">
                <button
                  onClick={handleCommentClick}
                  className="p-2 rounded-full text-gray-600 hover:text-gray-800 focus:outline-none relative flex items-center justify-center"
                  aria-label="Komentar"
                >
                  <FaComment size={24} />
                  {unreadComments > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-red-600 rounded-full">
                      {unreadComments}
                    </span>
                  )}
                </button>
                {/* Dropdown Komentar */}
                {showCommentDropdown && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900">Komentar Baru</h3>
                      </div>
                      {comments.length > 0 ? (
                        comments.map((comment) => (
                          <button
                            key={comment._id}
                            onClick={() => handleCommentItemClick(comment._id)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-100 focus:outline-none"
                          >
                            <div className="flex items-start">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {comment.userName}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  {comment.text}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatTimeAgo(comment.timestamp)}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          Tidak ada komentar baru
                        </div>
                      )}
                      <div className="border-t border-gray-200">
                        <button
                          onClick={handleViewAllComments}
                          className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                        >
                          Lihat semua komentar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Icon Notifikasi */}
              <div className="relative">
                <button
                  onClick={handleNotificationClick}
                  className="p-2 rounded-full text-gray-600 hover:text-gray-800 focus:outline-none flex items-center justify-center"
                  aria-label="Notifikasi"
                >
                  <FaBell size={24} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {/* Dropdown Notifikasi */}
                {showDropdown && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
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
                          onClick={handleViewAllMessages}
                          className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                        >
                          Lihat semua pesan
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

    {/* Avatar dengan Tooltip */}
    {isDashboard && user && (
      <div className="relative group" title={user.name}>
        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-base font-semibold uppercase shadow hover:scale-105 transition duration-200">
          {user.name.charAt(0)}
        </div>
      </div>
    )}

    {/* Tombol Tema */}
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300"
      aria-label="Toggle theme"
    >
      {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
    </button>

    {/* Logout */}
    {isDashboard && (
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition duration-300 text-sm font-medium"
      >
        Logout
      </button>
    )}
  </div>
</header>

      {/* Spacer */}
      <div className="h-16"></div>
    </>
  );
};

export default Header;
