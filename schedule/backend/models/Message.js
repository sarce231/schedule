import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  email: { type: String, required: true },
  pesan: { type: String, required: true },
  phone: { type: String, required: true },
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;
