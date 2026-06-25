const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['deadline_approaching', 'milestone_due', 'goal_inactive', 'milestone_completed', 'goal_completed', 'suggestion', 'system'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null },
  milestoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone', default: null },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  read: { type: Boolean, default: false },
  dismissed: { type: Boolean, default: false },
  actionUrl: { type: String, default: null },
  scheduledFor: { type: Date, default: null },
  sentAt: { type: Date, default: null },
}, { timestamps: true });

notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ userId: 1, scheduledFor: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
