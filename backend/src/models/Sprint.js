const mongoose = require('mongoose');

const sprintSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  name: { type: String, required: true, trim: true },
  goal: { type: String, default: '' },
  status: {
    type: String,
    default: 'planned',
    enum: ['planned', 'active', 'completed', 'cancelled'],
  },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GoalTask' }],
  progress: { type: Number, default: 0, min: 0, max: 100 },
  notes: { type: String, default: '' },
  review: { type: String, default: '' },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

sprintSchema.index({ projectId: 1, status: 1 });
sprintSchema.index({ projectId: 1, startDate: 1 });

module.exports = mongoose.model('Sprint', sprintSchema);
