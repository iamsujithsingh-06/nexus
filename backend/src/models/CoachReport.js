const mongoose = require('mongoose');

const coachReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true, enum: ['daily_brief', 'daily_review', 'weekly_review', 'insight'] },
  date: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  cacheKey: { type: String, default: '' },
}, { timestamps: true });

coachReportSchema.index({ userId: 1, type: 1, date: 1 }, { unique: true });
coachReportSchema.index({ userId: 1, generatedAt: -1 });

module.exports = mongoose.model('CoachReport', coachReportSchema);
