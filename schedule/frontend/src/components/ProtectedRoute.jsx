// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth(); // Ambil informasi user dari context

  if (!user || user.role !== role) {
    return <Navigate to="/login" replace />; // Arahkan ke login jika tidak terotorisasi
  }

  return children; // Jika user sesuai role, tampilkan halaman
};

export default ProtectedRoute;
