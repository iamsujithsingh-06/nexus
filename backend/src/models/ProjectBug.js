const mongoose = require('mongoose');

const projectBugSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  severity: {
    type: String,
    default: 'medium',
    enum: ['critical', 'high', 'medium', 'low'],
  },
  priority: {
    type: String,
    default: 'medium',
    enum: ['low', 'medium', 'high', 'critical'],
  },
  status: {
    type: String,
    default: 'open',
    enum: ['open', 'in_progress', 'resolved', 'closed'],
  },
  featureRef: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectFeature', default: null },
  assignedDate: { type: Date, default: Date.now },
  resolvedDate: { type: Date, default: null },
  notes: { type: String, default: '' },
}, { timestamps: true });

projectBugSchema.index({ projectId: 1, status: 1 });
projectBugSchema.index({ projectId: 1, severity: -1 });
projectBugSchema.index({ projectId: 1, priority: -1 });

module.exports = mongoose.model('ProjectBug', projectBugSchema);
