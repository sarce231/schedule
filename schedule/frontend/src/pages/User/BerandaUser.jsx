import React, { useEffect, useState } from "react";
import {
  FaClipboardList,
  FaCheckCircle,
  FaChurch,
  FaMapMarkerAlt,
  FaUserAlt,
  FaGamepad,
  FaComments,
  FaCalendarAlt,
  FaBible, // ikon untuk pelayan firman
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const BerandaUser = () => {
  const navigate = useNavigate();
  const [jadwal, setSchedules] = useState([]);
  const [mediaMateri, setMediaMateri] = useState([]);
  const [totalChat, setTotalChat] = useState(0);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/schedules");
        const data = await response.json();

        const today = new Date();
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfNextWeek = new Date(startOfWeek);
        endOfNextWeek.setDate(endOfNextWeek.getDate() + 13);
        endOfNextWeek.setHours(23, 59, 59, 999);

        const filtered = data.filter((item) => {
          const scheduleDate = new Date(item.date);
          return scheduleDate >= startOfWeek && scheduleDate <= endOfNextWeek;
        });

        const sorted = filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        setSchedules(sorted);
      } catch (error) {
        console.error("Error fetching jadwal:", error);
      }
    };

    const fetchMedia = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/media");
        const data = await response.json();
        setMediaMateri(data);
      } catch (error) {
        console.error("Error fetching media materi:", error);
      }
    };

    const fetchChat = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/chats");
        const data = await response.json();
        
        if (data && Array.isArray(data.messages)) {
          // Ambil 3 pesan terbaru
          const latestMessages = data.messages
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 3);
          
          setChats(latestMessages);
          setTotalChat(data.messages.length);
        }
      } catch (error) {
        console.error("Gagal mengambil data chat:", error);
      }
    };

    fetchSchedules();
    fetchMedia();
    fetchChat();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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
    <div className="px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">👋 Selamat Datang di Dashboard Anda</h1>

      {/* Statistik Singkat */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition duration-300 flex items-center space-x-4">
          <FaClipboardList className="text-blue-500 text-4xl" />
          <div>
            <p className="text-gray-600">Jadwal Minggu Ini & Minggu Depan </p>
            <p className="text-2xl font-bold text-blue-700">{jadwal.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition duration-300 flex items-center space-x-4">
          <FaClipboardList className="text-indigo-500 text-4xl" />
          <div>
            <p className="text-gray-600">Media & Materi Ibadah</p>
            <p className="text-2xl font-bold text-indigo-700">{mediaMateri.length}</p>
          </div>
        </div>

        <div 
          className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition duration-300 flex items-center space-x-4 cursor-pointer"
          onClick={() => navigate("/user/dashboard/chat")}
        >
          <FaComments className="text-purple-500 text-4xl" />
          <div>
            <p className="text-gray-600">Komentar / Chat</p>
            <p className="text-2xl font-bold text-purple-700">{totalChat}</p>
          </div>
        </div>
      </div>

      {/* Daftar Jadwal */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">📅 Jadwal Ibadah</h2>
        {jadwal.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {jadwal.map((item) => (
              <div key={item._id} className="bg-white rounded-xl p-6 shadow hover:shadow-md transition">
                <div className="flex items-center mb-3 text-indigo-600 font-bold text-lg">
                  <FaChurch className="mr-2" />
                  {item.place}
                </div>
                <div className="text-sm text-gray-600 flex items-center mb-1">
                  <FaCalendarAlt className="mr-2 text-gray-500" />
                  <span>Tanggal: {formatDate(item.date)}</span>
                </div>
                <div className="text-sm text-gray-600 flex items-center mb-1">
                  <FaMapMarkerAlt className="mr-2 text-gray-500" />
                  <span>Lokasi: {item.location}</span>
                </div>
                <div className="text-sm text-gray-600 flex items-center mb-1">
                  <FaUserAlt className="mr-2 text-gray-500" />
                  <span>WL: {item.wl}</span>
                </div>
                <div className="text-sm text-gray-600 flex items-center mb-1">
                  <FaGamepad className="mr-2 text-gray-500" />
                  <span>Permainan: {item.gamesLeader}</span>
                </div>
                <div className="text-sm text-gray-600 flex items-center">
                  <FaBible className="mr-2 text-gray-500" />
                  <span>Pelayan Firman: {item.preacher || "-"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg shadow">
            Tidak ada jadwal ibadah untuk minggu ini dan minggu depan.
          </div>
        )}
      </div>

      {/* Komentar Terbaru */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">💬 Komentar Terbaru</h2>
        {chats.length > 0 ? (
          <div className="grid gap-4">
            {chats.map((chat) => (
              <div key={chat._id} className="bg-white rounded-xl p-4 shadow hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{chat.userName}</p>
                    <p className="text-gray-600 mt-1">{chat.text}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {formatTimeAgo(chat.timestamp)}
                    </p>
                  </div>
                  {chat.sender === 'admin' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            ))}
            <button
              onClick={() => navigate("/user/dashboard/chat")}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Lihat semua komentar →
            </button>
          </div>
        ) : (
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg shadow">
            Belum ada komentar.
          </div>
        )}
      </div>
    </div>
  );
};

export default BerandaUser;
