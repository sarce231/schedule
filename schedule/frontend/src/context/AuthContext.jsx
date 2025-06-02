// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Buat Context
const AuthContext = createContext();

// Provider untuk membungkus aplikasi
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Ambil data user dari localStorage saat komponen pertama kali dirender
    const storedUser = localStorage.getItem('userInfo');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Fungsi login
  const login = (userData) => {
    setUser(userData); // Set user di state
    localStorage.setItem('userInfo', JSON.stringify(userData)); // Simpan ke localStorage
  };

  // Fungsi logout
  const logout = () => {
    setUser(null); // Hapus user dari state
    localStorage.removeItem('userInfo'); // Hapus dari localStorage
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook khusus untuk mengakses AuthContext
export const useAuth = () => useContext(AuthContext);
