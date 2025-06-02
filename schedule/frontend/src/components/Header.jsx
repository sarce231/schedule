import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { FaMoon, FaSun } from "react-icons/fa";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);

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
  }, []);

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

  return (
    <>
      <header className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex justify-between items-center px-6 py-3 shadow-md fixed w-full top-0 left-0 z-50 h-16">
  {/* Kiri - Logo & Menu */}
  <div className="flex items-center gap-4 relative">
    <img
      src="/logo.jpg"
      alt="Logo"
      className="h-12 w-12 object-cover rounded-full shadow-md absolute md:relative left-0 z-60" // Menambahkan 'absolute' dan 'left-0' untuk posisi logo
    />
    {location.pathname === "/" ? (
      <nav className="hidden md:flex gap-6 text-sm font-medium ml-16"> {/* Menambahkan margin kiri (ml-16) agar tidak tertimpa */}
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

  {/* Kanan - Avatar, Tema, Logout */}
  <div className="flex items-center gap-4">
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
      <div className="h-16"></div> {/* Spacer untuk memberi ruang pada konten di bawah header */}
    </>
  );
};

export default Header;
