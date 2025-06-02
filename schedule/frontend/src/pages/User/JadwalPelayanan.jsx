import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const JadwalPelayanan = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // bisa diubah sesuai kebutuhan

  // Fungsi untuk format tanggal dengan validasi
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return "-";
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(date);
  };

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/schedules");
        if (!response.ok) throw new Error("Gagal mengambil data jadwal");
        const data = await response.json();
        setSchedules(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // Menghitung data yang akan ditampilkan di halaman sekarang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSchedules = schedules.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(schedules.length / itemsPerPage);

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    doc.setFontSize(16);
    doc.text("Jadwal Ibadah", 40, 40);

    const headers = [[
      "No", "Tempat Ibadah", "Hari", "Tanggal", "Lokasi", "Waktu",
      "WL", "P. Permainan", "Pelayan Firman", "Komentar", "Status Kehadiran"
    ]];

    const rows = schedules.map((s, i) => [
      i + 1,
      s.place,
      s.day,
      formatDate(s.date),
      s.location,
      s.time,
      s.wl,
      s.gamesLeader,
      s.preacher || "-", // Pelayan Firman
      s.comment || "-",
      s.attendance || "-"
    ]);

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 60,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 220, 220] },
      margin: { left: 40, right: 40 },
    });

    doc.save("jadwal_ibadah.pdf");
  };

  // Handler pagination
  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev === 1 ? prev : prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev === totalPages ? prev : prev + 1));
  };

  return (
    <div className="mt-6 bg-white p-6 rounded-lg shadow-lg max-w-6xl mx-auto overflow-x-auto">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Jadwal Ibadah Persekutuan</h2>
      {loading && <p className="text-blue-500">Memuat data...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <button
        onClick={exportPDF}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Export PDF
      </button>

      <table className="w-full border-collapse bg-white shadow-md text-sm md:text-base">
        <thead>
          <tr className="bg-gray-200 text-left text-gray-700">
            <th className="py-3 px-4">No</th>
            <th className="py-3 px-4">Tempat Ibadah</th>
            <th className="py-3 px-4">Hari</th>
            <th className="py-3 px-4">Tanggal</th>
            <th className="py-3 px-4">Lokasi</th>
            <th className="py-3 px-4">Waktu</th>
            <th className="py-3 px-4">WL</th>
            <th className="py-3 px-4">P. Permainan</th>
            <th className="py-3 px-4">Pelayan Firman</th>
          </tr>
        </thead>
        <tbody>
          {currentSchedules.map((s, index) => (
            <tr key={s._id || index} className="border-t hover:bg-gray-100">
              <td className="py-2 px-4">{indexOfFirstItem + index + 1}</td>
              <td className="py-2 px-4">{s.place}</td>
              <td className="py-2 px-4">{s.day}</td>
              <td className="py-2 px-4">{formatDate(s.date)}</td>
              <td className="py-2 px-4">{s.location}</td>
              <td className="py-2 px-4">{s.time}</td>
              <td className="py-2 px-4">{s.wl}</td>
              <td className="py-2 px-4">{s.gamesLeader}</td>
              <td className="py-2 px-4">{s.preacher || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${
            currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Previous
        </button>

        <span>
          Halaman {currentPage} dari {totalPages}
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default JadwalPelayanan;
