import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: { type: String, unique: true, required: true },
  users: [{ type: String }],
});

export const Room = mongoose.model('Room', roomSchema);