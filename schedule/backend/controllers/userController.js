import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';

const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Validasi password lama jika ada
    if (req.body.oldPassword) {
      const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect' });
      }
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Update password jika ada password baru yang diinputkan
    if (req.body.newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.newPassword, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

export { updateUserProfile };
