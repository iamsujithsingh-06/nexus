const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  phase: { type: String, default: '' },
  order: { type: Number, default: 0 },
  status: { type: String, default: 'pending', enum: ['pending', 'in_progress', 'completed'] },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  completedAt: { type: Date, default: null },
  tags: [{ type: String }],
}, { timestamps: true });

milestoneSchema.index({ userId: 1, goalId: 1, order: 1 });
milestoneSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Milestone', milestoneSchema);
