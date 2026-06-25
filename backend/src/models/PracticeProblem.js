const mongoose = require('mongoose');

const practiceProblemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', default: null, index: true },
  pathId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningPath', default: null, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  platform: {
    type: String,
    enum: ['leetcode', 'hackerrank', 'codechef', 'geeksforgeeks', 'other'],
    default: 'other',
  },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  status: { type: String, enum: ['pending', 'solved', 'attempted', 'skipped'], default: 'pending' },
  acceptanceRate: { type: Number, default: 0, min: 0, max: 100 },
  timeTaken: { type: Number, default: 0 },
  mistakes: [{ type: String }],
  revisionNeeded: { type: Boolean, default: false },
  solution: { type: String, default: '' },
  notes: { type: String, default: '' },
  url: { type: String, default: '' },
  tags: [{ type: String }],
  solvedAt: { type: Date, default: null },
}, { timestamps: true });

practiceProblemSchema.index({ userId: 1, topicId: 1 });
practiceProblemSchema.index({ userId: 1, platform: 1 });
practiceProblemSchema.index({ userId: 1, status: 1 });
practiceProblemSchema.index({ userId: 1, difficulty: 1 });

module.exports = mongoose.model('PracticeProblem', practiceProblemSchema);
