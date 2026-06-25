const mongoose = require('mongoose');

const projectFeatureSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status: {
    type: String,
    default: 'backlog',
    enum: ['backlog', 'planned', 'in_progress', 'completed', 'rejected'],
  },
  priority: {
    type: String,
    default: 'medium',
    enum: ['low', 'medium', 'high', 'critical'],
  },
  estimatedHours: { type: Number, default: 0 },
  actualHours: { type: Number, default: 0 },
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProjectFeature' }],
  notes: { type: String, default: '' },
  completedAt: { type: Date, default: null },
  order: { type: Number, default: 0 },
}, { timestamps: true });

projectFeatureSchema.index({ projectId: 1, status: 1 });
projectFeatureSchema.index({ projectId: 1, priority: -1 });
projectFeatureSchema.index({ projectId: 1, order: 1 });

module.exports = mongoose.model('ProjectFeature', projectFeatureSchema);
