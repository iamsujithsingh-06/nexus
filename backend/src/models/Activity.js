const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true },
  tasksCompleted: { type: Number, default: 0 },
  tasksCreated: { type: Number, default: 0 },
  focusMinutes: { type: Number, default: 0 },
  milestonesReached: { type: Number, default: 0 },
  goalsUpdated: { type: Number, default: 0 },
  score: { type: Number, default: 0, min: 0, max: 100 },
  summary: { type: String, default: '' },
}, { timestamps: true });

activitySchema.index({ userId: 1, date: 1 }, { unique: true });
activitySchema.index({ userId: 1, score: -1 });

module.exports = mongoose.model('Activity', activitySchema);
