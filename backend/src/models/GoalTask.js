const mongoose = require('mongoose');

const goalTaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null, index: true },
  learningPathId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningPath', default: null, index: true },
  milestoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone', default: null, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  priority: { type: String, default: 'medium', enum: ['low', 'medium', 'high', 'critical'] },
  status: { type: String, default: 'pending', enum: ['pending', 'in_progress', 'completed'] },
  category: { type: String, default: 'general', enum: ['coding', 'learning', 'workout', 'reading', 'project', 'career', 'health', 'finance', 'general'] },
  dueDate: { type: Date, default: null },
  estimatedTime: { type: Number, default: 0 },
  actualTime: { type: Number, default: 0 },
  completedAt: { type: Date, default: null },
  tags: [{ type: String }],
  notes: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isToday: { type: Boolean, default: false },
  focusArea: { type: String, default: '' },
  recurrence: { type: String, default: '' },
  suggestedOrder: { type: Number, default: 0 },
}, { timestamps: true });

goalTaskSchema.index({ userId: 1, status: 1 });
goalTaskSchema.index({ userId: 1, goalId: 1, milestoneId: 1 });
goalTaskSchema.index({ dueDate: 1 }, { sparse: true });
goalTaskSchema.index({ userId: 1, isToday: 1 });
goalTaskSchema.index({ userId: 1, learningPathId: 1 });
goalTaskSchema.index({ userId: 1, priority: -1, dueDate: 1 });
goalTaskSchema.index({ title: 'text', description: 'text', notes: 'text' });

module.exports = mongoose.model('GoalTask', goalTaskSchema);
