import React, { useState, useEffect } from 'react';

const ManajemenPengguna = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ name: '', email: '', role: '', _id: '' });
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengambil data pengguna.');
      }

      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setEditedUser(user);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    const { name, email, role, _id } = editedUser;
    if (!name || !email || !role) {
      setError('Semua field harus diisi.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${_id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan perubahan pengguna.');
      }

      const updatedUser = await response.json();
      setUsers(users.map((u) => (u._id === updatedUser._id ? updatedUser : u)));
      setIsEditing(false);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menghapus pengguna.');
      }

      setUsers(users.filter((user) => user._id !== userId));
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Manajemen Pengguna</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 mb-4 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center text-gray-500">Memuat data...</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3 capitalize">{user.role}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-3 text-center text-gray-500">
                    Tidak ada pengguna yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Edit */}
      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white w-96 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Pengguna</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nama</label>
              <input
                type="text"
                name="name"
                value={editedUser.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={editedUser.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                name="role"
                value={editedUser.role}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md"
              >
                <option value="">Pilih Role</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenPengguna;
