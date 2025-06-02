import React, { useState } from "react";
import axios from "axios";

const FeedbackSaran = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/feedback",
        { name, message }, // Kirim data dalam format JSON
        { headers: { "Content-Type": "application/json" } }
      );

      alert("Saran berhasil dikirim!");
      setName("");
      setMessage(""); // Reset form setelah berhasil
    } catch (error) {
      console.error("Gagal mengirim feedback:", error.response?.data || error.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Feedback & Saran</h1>
      <form onSubmit={handleSubmit}>
        <input
          className="w-full p-2 border rounded"
          type="text"
          placeholder="Nama Anda"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="w-full p-2 border rounded mt-2"
          placeholder="Tulis saran atau feedback Anda di sini..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className="mt-4 p-2 bg-blue-700 text-white rounded">
          Kirim
        </button>
      </form>
    </div>
  );
};

export default FeedbackSaran;
