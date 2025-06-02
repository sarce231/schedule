
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaSignInAlt,
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClipboardList,
  FaComments,
  FaChurch,
  FaCalendarAlt,
  FaUserAlt,
  FaGamepad,
  FaBible
} from "react-icons/fa";

const Home = () => {
  const [jadwal, setJadwal] = useState([]);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [submitStatus, setSubmitStatus] = useState("");
  const [showJadwal, setShowJadwal] = useState(false);
  const [showForm, setShowForm] = useState(false); // <- ini untuk form interaksi jemaat

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
        const limited = sorted.slice(0, 2);

        setJadwal(limited);
      } catch (error) {
        console.error("Error fetching jadwal:", error);
      }
    };

    fetchSchedules();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });

      if (response.ok) {
        setSubmitStatus("Pesan berhasil dikirim!");
        setContactForm({ name: "", email: "", message: "" });
      } else {
        setSubmitStatus("Gagal mengirim pesan, coba lagi.");
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setSubmitStatus("Terjadi kesalahan, coba lagi nanti.");
    }

    setTimeout(() => setSubmitStatus(""), 5000);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 text-white px-6 py-12">
        <div className="container mx-auto flex flex-col md:flex-row items-center px-6 lg:px-20">
          <div className="text-left md:w-1/2 space-y-6">
            <h1 className="text-2xl sm:text-5xl font-extrabold leading-tight">
              Selamat Datang di <br />
              <span className="text-yellow-400">Sistem Pelayanan Ibadah</span>
              <br />
              Persekutuan Mahasiswa
            </h1>
            <p className="text-gray-300 text-lg">
              Sistem ini dibuat untuk membantu para pelayan dalam proses
              pelayanan ibadah.
            </p>
            <div className="flex space-x-4 mt-6">
              <Link
                to="/login"
                className="flex items-center bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-800 transition transform hover:scale-105 duration-300"
              >
                <FaSignInAlt className="mr-2" /> Login
              </Link>
              <Link
                to="/register"
                className="flex items-center bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-800 transition transform hover:scale-105 duration-300"
              >
                <FaUser className="mr-2" /> Buat Akun
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 mt-10 md:mt-2">
            <img
              src="/images/perse.jpg"
              alt="Pelayanan Ibadah"
              className="w-full max-w-md mx-auto transform hover:scale-105 transition duration-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Layanan Section */}
      <section id="layanan" className="container mx-auto py-16 px-6 text-center max-w-5xl">
        <h2 className="text-3xl font-bold mb-12">Layanan Kami</h2>
        <div className="flex flex-col md:flex-row justify-center items-start gap-10">
          {/* Jadwal Ibadah */}
          <div className="w-full md:w-96 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer">
            <FaClipboardList className="text-blue-500 text-5xl mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-4">Jadwal Ibadah</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Lihat jadwal pelayanan ibadah terbaru.
            </p>

            {!showJadwal ? (
              <button
                onClick={() => setShowJadwal(true)}
                className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
              >
                Lihat Jadwal
              </button>
            ) : (
              <>
                {jadwal.length === 0 ? (
                  <p className="text-gray-400 italic mb-4">Tidak ada jadwal terbaru.</p>
                ) : (
                  <div className="space-y-6 mb-4">
                    {jadwal.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow flex flex-col text-left"
                      >
                        <div className="flex items-center mb-2 text-indigo-600 font-bold text-lg">
                          <FaChurch className="mr-2" /> {item.place}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center mb-1">
                          <FaCalendarAlt className="mr-2" /> Tanggal: {formatDate(item.date)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center mb-1">
                          <FaMapMarkerAlt className="mr-2" /> Lokasi: {item.location}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center mb-1">
                          <FaBible className="mr-2" /> Pelayan Firman: {item.preacher || "-"}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center mb-1">
                          <FaUserAlt className="mr-2" /> WL: {item.wl || "-"}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                          <FaGamepad className="mr-2" /> Permainan: {item.gamesLeader || "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setShowJadwal(false)}
                  className="w-full bg-gray-500 text-white py-3 rounded hover:bg-gray-600 transition"
                >
                  Kembali
                </button>
              </>
            )}
          </div>

          {/* Interaksi Jemaat */}
          <div className="w-full md:w-96 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer">
            <FaComments className="text-blue-500 text-5xl mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-4">Interaksi Jemaat</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Kirim pesan atau pertanyaan ke admin.
            </p>

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
              >
                Kirim Pesan
              </button>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-5 text-left">
                  <input
                    type="text"
                    name="name"
                    placeholder="Nama"
                    value={contactForm.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={contactForm.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    name="message"
                    placeholder="Pesan"
                    value={contactForm.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
                  >
                    Kirim Pesan
                  </button>
                </form>

                {submitStatus && (
                  <p className="mt-4 text-center text-sm text-green-600">{submitStatus}</p>
                )}

                <button
                  onClick={() => setShowForm(false)}
                  className="w-full mt-4 bg-gray-500 text-white py-3 rounded hover:bg-gray-600 transition"
                >
                  Batal
                </button>
              </>
            )}
          </div>
        </div>
      </section>

       {/* Contact Section */}
      <section
        id="kontak"
        className="bg-blue-700 text-white py-16 px-6 text-center"
      >
        <div className="container mx-auto">
          <h2 className="text-3xl font-semibold mb-12">Hubungi Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <FaMapMarkerAlt className="text-4xl mb-4 text-yellow-400" />
              <h3 className="text-lg font-semibold mb-2">Alamat</h3>
              <p className="text-gray-300 text-center">Jo Studio, Bumi Marina</p>
            </div>
            <div className="flex flex-col items-center">
              <FaEnvelope className="text-4xl mb-4 text-yellow-400" />
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <p className="text-gray-300">persekutuanmhs@gmail.com</p>
            </div>
            <div className="flex flex-col items-center">
              <FaPhoneAlt className="text-4xl mb-4 text-yellow-400" />
              <h3 className="text-lg font-semibold mb-2">Telepon</h3>
              <p className="text-gray-300">+62 22367 8906</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
