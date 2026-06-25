const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, required: true, enum: ['coding', 'learning', 'workout', 'general'] },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: String, default: '' },
  totalActiveDays: { type: Number, default: 0 },
}, { timestamps: true });

streakSchema.index({ userId: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Streak', streakSchema);
