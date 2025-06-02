import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AutoScheduleForm = () => {
  const [preachersInput, setPreachersInput] = useState("");
  const [wlListInput, setWlListInput] = useState("");
  const [gamesLeaderListInput, setGamesLeaderListInput] = useState("");
  const [placeListInput, setPlaceListInput] = useState("");
  const [locationListInput, setLocationListInput] = useState("");
  const [generatedSchedule, setGeneratedSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getFridaysInMonth = (year, month) => {
    const fridays = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      if (date.getDay() === 5) fridays.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return fridays;
  };

  const createAutoSchedule = (preachers, wls, gamesLeaders, places, locations) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const fridays = getFridaysInMonth(year, month);

    return fridays.map((tanggal, index) => ({
      id: Date.now() + index,
      place: places[index % places.length],
      date: tanggal.toLocaleDateString("id-ID"),
      day: "Jumat",
      time: "16:30",
      location: locations[index % locations.length],
      preacher: preachers[index % preachers.length],
      wl: wls[index % wls.length],
      gamesLeader: gamesLeaders[index % gamesLeaders.length],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const preachers = preachersInput.split(",").map((name) => name.trim()).filter(Boolean);
    const wls = wlListInput.split(",").map((name) => name.trim()).filter(Boolean);
    const gamesLeaders = gamesLeaderListInput.split(",").map((name) => name.trim()).filter(Boolean);
    const places = placeListInput.split(",").map((item) => item.trim()).filter(Boolean);
    const locations = locationListInput.split(",").map((item) => item.trim()).filter(Boolean);

    if (places.length !== locations.length) {
      alert("Jumlah tempat ibadah dan lokasi harus sama.");
      setLoading(false);
      return;
    }

    const schedule = createAutoSchedule(preachers, wls, gamesLeaders, places, locations);

    try {
      const responses = await Promise.all(
        schedule.map((item) => axios.post("http://localhost:5000/api/schedules", item))
      );
      setGeneratedSchedule(responses.map((res) => res.data));
      alert("Jadwal berhasil dibuat!");
    } catch (error) {
      console.error("Gagal membuat jadwal:", error);
      alert("Terjadi kesalahan saat membuat jadwal.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/schedules");
      const sortedData = response.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setGeneratedSchedule(sortedData);
    } catch (error) {
      console.error("Gagal memuat jadwal:", error);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/schedules/${id}`);
      setGeneratedSchedule(generatedSchedule.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Gagal menghapus jadwal:", error);
      alert("Terjadi kesalahan saat menghapus jadwal.");
    }
  };

  const handleEdit = (item) => {
    setEditingItem({ ...item });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { _id, ...updateData } = editingItem;
      const response = await axios.put(`http://localhost:5000/api/schedules/${_id}`, updateData);
      setGeneratedSchedule((prev) =>
        prev.map((item) => (item._id === _id ? response.data : item))
      );
      setEditingItem(null);
      alert("Jadwal berhasil diperbarui!");
    } catch (error) {
      console.error("Gagal mengedit jadwal:", error);
      alert("Terjadi kesalahan saat mengedit jadwal.");
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Jadwal Ibadah", 14, 16);
    const tableData = generatedSchedule.map((item, index) => [
      index + 1,
      item.place,
      `${item.day}, ${item.date}`,
      item.location,
      item.preacher,
      item.wl,
      item.gamesLeader,
      item.time,
    ]);
    autoTable(doc, {
      head: [["No", "Tempat", "Hari, Tanggal", "Lokasi", "Pelayan Firman", "WL", "Games Leader", "Waktu"]],
      body: tableData,
      startY: 20,
    });
    doc.save("jadwal_ibadah.pdf");
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = generatedSchedule.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(generatedSchedule.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Form Jadwal Otomatis</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-xl p-6 space-y-4 mb-8">
        {[
          { label: "Daftar Pelayan Firman", value: preachersInput, setter: setPreachersInput, placeholder: "Contoh: Andi, Budi, Citra" },
          { label: "Daftar WL", value: wlListInput, setter: setWlListInput, placeholder: "Contoh: Dewi, Eka, Farhan" },
          { label: "Daftar Games Leader", value: gamesLeaderListInput, setter: setGamesLeaderListInput, placeholder: "Contoh: Gita, Hadi, Indra" },
          { label: "Daftar Tempat Ibadah", value: placeListInput, setter: setPlaceListInput, placeholder: "Contoh: Asrama A, Asrama B" },
          { label: "Daftar Lokasi", value: locationListInput, setter: setLocationListInput, placeholder: "Contoh: Lokasi A, Lokasi B" },
        ].map(({ label, value, setter, placeholder }, index) => (
          <div key={index}>
            <label className="block font-semibold mb-1">{label}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
              placeholder={placeholder}
              required
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700"
        >
          {loading ? "Membuat jadwal..." : "Buat Jadwal Otomatis"}
        </button>
      </form>

      {editingItem && (
        <form onSubmit={handleEditSubmit} className="bg-yellow-100 p-6 rounded-xl space-y-4 mb-8 shadow-inner">
          <h2 className="text-xl font-semibold mb-2">Edit Jadwal</h2>
          {["place", "location", "date", "day", "time", "preacher", "wl", "gamesLeader"].map((field) => (
            <div key={field}>
              <label className="block font-medium mb-1 capitalize">{field}</label>
              <input
                type="text"
                name={field}
                value={editingItem[field]}
                onChange={handleEditChange}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>
          ))}
          <div className="flex gap-4 justify-end">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Simpan</button>
            <button type="button" onClick={() => setEditingItem(null)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Batal</button>
          </div>
        </form>
      )}

      {generatedSchedule.length > 0 && (
        <div className="overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Jadwal Ibadah</h2>
            <button onClick={handleExportPDF} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Export PDF
            </button>
          </div>
          <table className="min-w-full bg-white shadow-md rounded-md overflow-hidden text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4">No</th>
                <th className="py-2 px-4">Tempat</th>
                <th className="py-2 px-4">Hari, Tanggal</th>
                <th className="py-2 px-4">Lokasi</th>
                <th className="py-2 px-4">Pelayan Firman</th>
                <th className="py-2 px-4">WL</th>
                <th className="py-2 px-4">Games Leader</th>
                <th className="py-2 px-4">Waktu</th>
                <th className="py-2 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={item._id}>
                  <td className="py-2 px-4">{indexOfFirstItem + index + 1}</td>
                  <td className="py-2 px-4">{item.place}</td>
                  <td className="py-2 px-4">{`${item.day}, ${item.date}`}</td>
                  <td className="py-2 px-4">{item.location}</td>
                  <td className="py-2 px-4">{item.preacher}</td>
                  <td className="py-2 px-4">{item.wl}</td>
                  <td className="py-2 px-4">{item.gamesLeader}</td>
                  <td className="py-2 px-4">{item.time}</td>
                  <td className="py-2 px-4">
  <div className="flex space-x-2">
    <button
      onClick={() => handleEdit(item)}
      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
    >
      Edit
    </button>
    <button
      onClick={() => handleDelete(item._id)}
      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
    >
      Hapus
    </button>
  </div>
</td>

                  
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoScheduleForm;
