const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  pathId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningPath', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'beginner' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'skipped'], default: 'pending' },
  order: { type: Number, default: 0 },
  estimatedHours: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 },
  completionDate: { type: Date, default: null },
  revisionCount: { type: Number, default: 0 },
  confidenceScore: { type: Number, default: 0, min: 0, max: 100 },
  resources: [{
    title: String,
    url: String,
    type: { type: String, enum: ['article', 'video', 'book', 'course', 'documentation', 'other'], default: 'article' },
  }],
  practiceProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PracticeProblem' }],
  notes: { type: String, default: '' },
  codeSnippets: [{
    language: String,
    code: String,
    description: String,
  }],
  attachments: [{
    name: String,
    url: String,
    type: String,
  }],
}, { timestamps: true });

topicSchema.index({ pathId: 1, order: 1 });
topicSchema.index({ userId: 1, status: 1 });
topicSchema.index({ pathId: 1, status: 1 });

module.exports = mongoose.model('Topic', topicSchema);
