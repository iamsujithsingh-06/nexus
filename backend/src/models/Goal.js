const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    default: 'general',
    enum: [
      'learning', 'fitness', 'creative', 'career', 'business', 'academic',
      'coding', 'habit', 'general', 'Career', 'Health', 'Learning', 'Personal',
      'Coding', 'Finance', 'Projects', 'Custom',
    ],
  },
  status: {
    type: String,
    default: 'active',
    enum: ['planned', 'active', 'paused', 'completed', 'archived', 'cancelled'],
  },
  priority: { type: Number, default: 3, min: 1, max: 5 },
  priorityLabel: {
    type: String,
    default: 'medium',
    enum: ['low', 'medium', 'high', 'critical'],
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  deadline: { type: Date, default: null },
  estimatedDuration: { type: Number, default: null },
  roadmap: [{
    phase: { type: String, required: true },
    order: { type: Number, required: true },
  }],
  tags: [{ type: String }],
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
  pausedAt: { type: Date, default: null },
  source: { type: String, default: 'manual', enum: ['manual', 'chat', 'imported'] },
}, { timestamps: true });

goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, category: 1 });
goalSchema.index({ userId: 1, priority: -1 });
goalSchema.index({ userId: 1, deadline: 1 });
goalSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Goal', goalSchema);
