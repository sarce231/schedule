import React from "react";
import { useAuth } from "../context/AuthContext"; // Import useAuth
import AdminChat from "../components/AdminChat";
import UserChat from "../components/UserChat";

const ChatPage = () => {
  const { user } = useAuth(); // Ambil user dari AuthContext

  // Jika user belum ada (misalnya saat loading atau belum login)
  if (!user) return <p>Loading...</p>;

  // Render berdasarkan role
  return (
    <div className="p-4">
      {user.role === "admin" ? <AdminChat /> : <UserChat />}
    </div>
  );
};

export default ChatPage;
