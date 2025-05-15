import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  walletAddress: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  isStaked: { type: Boolean, default: false },
  kills: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  currentRoom: { type: String, default: '' },
});

export const User = mongoose.model('User', userSchema);