import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SettingPage = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setName(parsedUser.name);
      setEmail(parsedUser.email);
    }
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const updateData = { name, email };

      // Hanya kirim password baru jika diisi
     if (newPassword.trim() !== "") {
  updateData.newPassword = newPassword;
  updateData.oldPassword = oldPassword;
}


      const { data } = await axios.put("/api/users/profile", updateData, config);

      setMessage("Profil berhasil diperbarui");
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Error:", error);
      setMessage("Gagal memperbarui profil");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Edit Profil</h1>
      {message && <p className="mb-2 text-sm text-blue-600">{message}</p>}
      <form onSubmit={handleUpdate} className="space-y-4 relative">
        <div>
          <label className="block text-sm font-medium">Nama</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="relative">
          <label className="block text-sm font-medium">Password Lama</label>
          <input
            type={showPassword ? "text" : "password"}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Opsional"
            className="w-full px-3 py-2 border rounded"
          />
          <span
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-9 cursor-pointer"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <div className="relative">
          <label className="block text-sm font-medium">Password Baru</label>
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Kosongkan jika tidak mengubah password"
            className="w-full px-3 py-2 border rounded"
          />
          <span
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-9 cursor-pointer"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
};

export default SettingPage;
