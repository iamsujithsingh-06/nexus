const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: [
      'Programming', 'Web Development', 'Artificial Intelligence', 'Machine Learning',
      'Data Structures', 'Algorithms', 'System Design', 'Cloud Computing',
      'DevOps', 'Database', 'Soft Skills', 'Career', 'Custom',
    ],
    default: 'Custom',
  },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'beginner' },
  status: { type: String, enum: ['planned', 'active', 'paused', 'completed', 'archived'], default: 'planned' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  targetCompletionDate: { type: Date, default: null },
  estimatedHours: { type: Number, default: 0 },
  actualHoursStudied: { type: Number, default: 0 },
  learningGoal: { type: String, default: '' },
  relatedGoalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null },
  relatedProjectId: { type: mongoose.Schema.Types.ObjectId, default: null },
  relatedMemoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Memory' }],
  roadmap: [{ type: String }],
  milestones: [{
    title: String,
    completed: { type: Boolean, default: false },
    completedAt: Date,
  }],
}, { timestamps: true });

learningPathSchema.index({ userId: 1, status: 1 });
learningPathSchema.index({ userId: 1, category: 1 });
learningPathSchema.index({ userId: 1, difficulty: 1 });
learningPathSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('LearningPath', learningPathSchema);
