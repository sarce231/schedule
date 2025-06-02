import User from '../models/userModel.js';
import mongoose from 'mongoose';

// ✅ Fungsi untuk menghapus pengguna
export const deleteUser = async (req, res) => {
  console.log("ID yang diminta untuk dihapus:", req.params.id);

  try {
    const targetUserId = req.params.id;
    const currentAdminId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'ID tidak valid' });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    if (user._id.toString() === currentAdminId.toString()) {
      return res.status(400).json({ message: 'Tidak dapat menghapus akun Anda sendiri' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Tidak dapat menghapus akun admin lain' });
    }

    await User.findByIdAndDelete(targetUserId);
    console.log("User berhasil dihapus:", user);
    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    console.error("Error saat menghapus user:", error.message);
    res.status(500).json({ message: 'Gagal menghapus user' });
  }
};

// ✅ Fungsi untuk memperbarui user oleh admin/superadmin
export const updateUserByAdmin = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const { name, email, role } = req.body;

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Cek apakah email baru sudah digunakan oleh user lain
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists && emailExists._id.toString() !== targetUserId) {
        return res.status(400).json({ message: 'Email sudah digunakan oleh pengguna lain' });
      }
    }

    // Update data user
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    const updatedUser = await user.save();
    res.status(200).json({ message: 'Data user berhasil diperbarui', user: updatedUser });
  } catch (error) {
    console.error("Error saat mengupdate user:", error.message);
    res.status(500).json({ message: 'Gagal memperbarui user' });
  }
};
