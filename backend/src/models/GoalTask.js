const mongoose = require('mongoose');

const goalTaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null, index: true },
  milestoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone', default: null, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  priority: { type: String, default: 'medium', enum: ['low', 'medium', 'high', 'critical'] },
  status: { type: String, default: 'pending', enum: ['pending', 'in_progress', 'completed'] },
  dueDate: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  category: { type: String, default: 'general', enum: ['coding', 'learning', 'workout', 'reading', 'project', 'general'] },
  tags: [{ type: String }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

goalTaskSchema.index({ userId: 1, status: 1 });
goalTaskSchema.index({ userId: 1, goalId: 1, milestoneId: 1 });
goalTaskSchema.index({ dueDate: 1 }, { sparse: true });

module.exports = mongoose.model('GoalTask', goalTaskSchema);
