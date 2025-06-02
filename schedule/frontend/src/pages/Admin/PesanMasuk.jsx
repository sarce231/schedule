import React, { useEffect, useState } from "react";
import axios from "axios";

const PesanMasuk = () => {
  const [messages, setMessages] = useState([]); // inisialisasi sebagai array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/messages");
        // Cek apakah data benar berupa array
        if (Array.isArray(res.data)) {
          setMessages(res.data);
        } else {
          console.error("Data pesan bukan array:", res.data);
          setMessages([]); // set ke array kosong biar aman
        }
      } catch (err) {
        setError("Gagal mengambil data pesan");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Pesan Masuk</h2>
      {messages.length === 0 ? (
        <p>Tidak ada pesan.</p>
      ) : (
        <ul>
          {messages.map((msg) => (
            <li key={msg._id}>
              <p><strong>{msg.nama}</strong> ({msg.email}):</p>
              <p>{msg.pesan}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PesanMasuk;
