const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'user_profile',
        'preference',
        'goal',
        'skill',
        'project',
        'learning_progress',
        'conversation_insight',
        'fact',
        'decision',
      ],
    },
    key: {
      type: String,
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    priority: {
      type: Number,
      default: 0,
      min: -10,
      max: 10,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    source: {
      type: String,
      enum: ['auto', 'manual', 'system'],
      default: 'auto',
    },
  },
  {
    timestamps: true,
  }
);

memorySchema.index({ userId: 1, type: 1 });
memorySchema.index({ userId: 1, key: 1 }, { unique: true });
memorySchema.index({ userId: 1, tags: 1 });
memorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Memory', memorySchema);
