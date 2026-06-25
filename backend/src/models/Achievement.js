const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  code: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '🏆' },
  category: { type: String, default: 'general', enum: ['milestone', 'streak', 'tasks', 'goals', 'general'] },
  rarity: { type: String, default: 'common', enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'] },
  earnedAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 100, min: 0, max: 100 },
}, { timestamps: true });

achievementSchema.index({ userId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);
