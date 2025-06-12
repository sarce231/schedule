import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FaWhatsapp, FaTrash, FaEye } from "react-icons/fa";

const PesanMasuk = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

    const fetchMessages = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/messages");
        if (Array.isArray(res.data)) {
          setMessages(res.data);
        } else {
          console.error("Data pesan bukan array:", res.data);
        setMessages([]);
        }
      } catch (err) {
        setError("Gagal mengambil data pesan");
      } finally {
        setLoading(false);
      }
    };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pesan ini?")) {
      try {
        await axios.delete(`http://localhost:5000/api/messages/${id}`);
        setMessages(messages.filter(msg => msg._id !== id));
      } catch (err) {
        console.error("Gagal menghapus pesan:", err);
        alert("Gagal menghapus pesan");
      }
    }
  };

  const handleWhatsApp = (phone) => {
    // Hapus karakter non-numerik dari nomor telepon
    const cleanPhone = phone.replace(/\D/g, '');
    // Tambahkan kode negara jika belum ada
    const whatsappNumber = cleanPhone.startsWith('62') ? cleanPhone : `62${cleanPhone}`;
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };

  const handleViewDetail = (message) => {
    setSelectedMessage(message);
    setShowDetail(true);
  };

  const columns = [
    {
      name: "Nama",
      selector: row => row.nama,
      sortable: true,
    },
    {
      name: "Email",
      selector: row => row.email,
      sortable: true,
    },
    {
      name: "No. HP",
      selector: row => row.phone,
      sortable: true,
    },
    {
      name: "Pesan",
      selector: row => row.pesan,
      sortable: true,
      cell: row => (
        <div className="truncate max-w-xs">
          {row.pesan}
        </div>
      ),
    },
    {
      name: "Tanggal",
      selector: row => new Date(row.createdAt).toLocaleString(),
      sortable: true,
    },
    {
      name: "Aksi",
      cell: row => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDetail(row)}
            className="p-2 text-blue-600 hover:text-blue-800"
            title="Lihat Detail"
          >
            <FaEye />
          </button>
          <button
            onClick={() => handleWhatsApp(row.phone)}
            className="p-2 text-green-600 hover:text-green-800"
            title="Kirim WhatsApp"
          >
            <FaWhatsapp />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-2 text-red-600 hover:text-red-800"
            title="Hapus Pesan"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Pesan Masuk</h2>
      
      <DataTable
        columns={columns}
        data={messages}
        pagination
        highlightOnHover
        responsive
        striped
        className="bg-white rounded-lg shadow"
      />

      {/* Modal Detail Pesan */}
      {showDetail && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Detail Pesan</h3>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-semibold">Nama:</p>
                <p>{selectedMessage.nama}</p>
              </div>
              <div>
                <p className="font-semibold">Email:</p>
                <p>{selectedMessage.email}</p>
              </div>
              <div>
                <p className="font-semibold">No. HP:</p>
                <p>{selectedMessage.phone}</p>
              </div>
              <div>
                <p className="font-semibold">Pesan:</p>
                <p className="whitespace-pre-wrap">{selectedMessage.pesan}</p>
              </div>
    <div>
                <p className="font-semibold">Tanggal:</p>
                <p>{new Date(selectedMessage.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => handleWhatsApp(selectedMessage.phone)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <FaWhatsapp className="mr-2" />
                Kirim WhatsApp
              </button>
              <button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PesanMasuk;
