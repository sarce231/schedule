import React, { useEffect, useState } from 'react';
import {
  FaCalendarAlt,
  FaPhotoVideo,
  FaUsers,
  FaComments
} from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Beranda = () => {
  const [jumlahJadwal, setJumlahJadwal] = useState(0);
  const [jumlahMedia, setJumlahMedia] = useState(0);
  const [jumlahPengguna, setJumlahPengguna] = useState(0);
  const [jumlahChat, setJumlahChat] = useState(0);

  useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const [jadwalRes, mediaRes, penggunaRes, chatRes] = await Promise.all([
        fetch('http://localhost:5000/api/schedules'),
        fetch('http://localhost:5000/api/media'),
        fetch('http://localhost:5000/api/admin'),
        fetch('http://localhost:5000/api/chats')
      ]);

      const jadwalData = await jadwalRes.json();
      const mediaData = await mediaRes.json();
      const penggunaData = await penggunaRes.json();
      const chatData = await chatRes.json();

      setJumlahJadwal(jadwalData.length || 0);
      setJumlahMedia(mediaData.length || 0);
      setJumlahPengguna(penggunaData.length || 0);

      // Perhitungan total pesan dari semua chat
      const totalMessages = chatData.reduce((sum, chat) => sum + (chat.messages?.length || 0), 0);
      setJumlahChat(totalMessages);
      
    } catch (error) {
      console.error('Gagal mengambil data dashboard:', error);
    }
  };

  fetchDashboardData();
}, []);

  
  const chartData = {
    labels: ['Jadwal', 'Media', 'Pengguna', 'Chat'],
    datasets: [
      {
        label: 'Jumlah',
        data: [jumlahJadwal, jumlahMedia, jumlahPengguna, jumlahChat],
        backgroundColor: ['#3B82F6', '#22C55E', '#F59E0B', '#9B46D3'],
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Statistik Data Dashboard',
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="container mx-auto p-4 overflow-y-auto" style={{ height: '100vh' }}>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Selamat Datang</h2>

        {/* Ringkasan */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card
            icon={<FaCalendarAlt className="text-5xl text-white" />}
            title="Jadwal"
            value={jumlahJadwal}
            color="bg-blue-500"
          />
          <Card
            icon={<FaPhotoVideo className="text-5xl text-white" />}
            title="Media"
            value={jumlahMedia}
            color="bg-green-500"
          />
          <Card
            icon={<FaUsers className="text-5xl text-white" />}
            title="Pengguna"
            value={jumlahPengguna}
            color="bg-yellow-500"
          />
          <Card
            icon={<FaComments className="text-5xl text-white" />}
            title="Chat"
            value={jumlahChat}
            color="bg-purple-500"
          />
        </div>

        {/* Grafik */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

// Komponen Kartu Ringkasan
const Card = ({ icon, title, value, color }) => (
  <div className={`flex items-center p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 ${color}`}>
    <div className="mr-4">{icon}</div>
    <div>
      <h3 className="text-lg text-white font-semibold mb-1">{title}</h3>
      <p className="text-3xl text-white font-bold">{value}</p>
    </div>
  </div>
);

export default Beranda;

