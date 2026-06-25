const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    default: 'Other',
    enum: ['Web Development', 'AI', 'Machine Learning', 'Mobile', 'Game Development', 'Research', 'Personal', 'Business', 'Open Source', 'Other'],
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'paused', 'completed', 'archived'],
  },
  priority: {
    type: String,
    default: 'medium',
    enum: ['low', 'medium', 'high', 'critical'],
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  startDate: { type: Date, default: null },
  targetDate: { type: Date, default: null },
  completionDate: { type: Date, default: null },
  version: { type: String, default: 'v1.0' },
  currentSprint: { type: String, default: '' },
  repoUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  docsUrl: { type: String, default: '' },
  techStack: [{ type: String }],
  estimatedHours: { type: Number, default: 0 },
  actualHours: { type: Number, default: 0 },
  owner: { type: String, default: '' },
  tags: [{ type: String }],
  notes: { type: String, default: '' },
  attachments: [{ name: String, url: String }],
  screenshots: [{ name: String, url: String }],
  colorTheme: { type: String, default: 'blue' },
  icon: { type: String, default: 'folder' },
  goalRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null },
}, { timestamps: true });

projectSchema.index({ userId: 1, status: 1 });
projectSchema.index({ userId: 1, category: 1 });
projectSchema.index({ userId: 1, priority: -1 });
projectSchema.index({ userId: 1, progress: -1 });
projectSchema.index({ userId: 1, targetDate: 1 });
projectSchema.index({ title: 'text', description: 'text', notes: 'text' });

module.exports = mongoose.model('Project', projectSchema);
