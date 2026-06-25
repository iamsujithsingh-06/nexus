const mongoose = require('mongoose');

const weeklyReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  weekStart: { type: String, required: true },
  weekEnd: { type: String, required: true },
  tasksCompleted: { type: Number, default: 0 },
  tasksCreated: { type: Number, default: 0 },
  progressGained: { type: Number, default: 0 },
  strongAreas: [{ type: String }],
  weakAreas: [{ type: String }],
  nextWeekFocus: [{ type: String }],
  summary: { type: String, default: '' },
  aiFeedback: { type: String, default: '' },
  dailyBreakdown: [{
    date: String,
    tasksCompleted: Number,
    score: Number,
  }],
}, { timestamps: true });

weeklyReportSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model('WeeklyReport', weeklyReportSchema);
