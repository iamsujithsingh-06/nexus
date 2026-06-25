const mongoose = require('mongoose');

const revisionScheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
  pathId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningPath', required: true, index: true },
  dueDate: { type: Date, required: true, index: true },
  interval: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  note: { type: String, default: '' },
}, { timestamps: true });

revisionScheduleSchema.index({ userId: 1, dueDate: 1 });
revisionScheduleSchema.index({ userId: 1, topicId: 1, completed: 1 });
revisionScheduleSchema.index({ topicId: 1, dueDate: 1 });

module.exports = mongoose.model('RevisionSchedule', revisionScheduleSchema);
