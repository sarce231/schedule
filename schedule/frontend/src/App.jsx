import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Header from "./components/Header";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import SettingsPage from "./pages/SettingsPage";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Beranda from "./pages/Admin/Beranda";
// import ManageSchedule from "./pages/Admin/ManageSchedule";
import AutoScheduleForm from "./pages/Admin/AutoScheduleForm";
import Media from "./pages/Admin/Media";
import Sidebar from "./pages/Admin/Sidebar";
import ManajemenPengguna from "./pages/Admin/ManajemenPengguna";
import PesanMasuk from "./pages/Admin/PesanMasuk";

// User Pages
import UserDashboard from "./pages/User/UserDashboard";
import BerandaUser from "./pages/User/BerandaUser";
import JadwalPelayanan from "./pages/User/JadwalPelayanan";
import MediaMateri from "./pages/User/MediaMateri";


// Shared Pages
import ChatPage from "./pages/ChatPage"; // ✅ Tambahkan import ini

const AppRoutes = () => {
  const location = useLocation();
  const hideHeaderPaths = ["/login", "/register"];

  return (
    <div className="w-full min-h-screen bg-gray-100">
      {/* Show Header except for login and register pages */}
      {!hideHeaderPaths.includes(location.pathname) && <Header />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ADMIN DASHBOARD ROUTES */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          {/* Sidebar dan konten Admin */}
          <Route index element={<Beranda />} />
          {/* <Route path="manage-schedule" element={<ManageSchedule />} /> */}
          <Route path="auto-schedule-form" element={<AutoScheduleForm />} />
          <Route path="media" element={<Media />} />
          <Route path="sidebar" element={<Sidebar />} />
          <Route path="manajemen-pengguna" element={<ManajemenPengguna />} />
          <Route path="chat" element={<ChatPage />} /> {/* ✅ Chat untuk Admin */}
          <Route path="pesan-masuk" element={<PesanMasuk />} /> {/* Tambahan baru */}
        </Route>

        {/* USER DASHBOARD ROUTES */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        >
          {/* Sidebar dan konten User */}
          <Route index element={<BerandaUser />} />
          <Route path="jadwal-pelayanan" element={<JadwalPelayanan />} />
          <Route path="media-materi" element={<MediaMateri />} />
          <Route path="chat" element={<ChatPage />} /> {/* ✅ Chat untuk User */}
          <Route path="/user/dashboard/settings" element={<SettingsPage />} />
        </Route>

        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
