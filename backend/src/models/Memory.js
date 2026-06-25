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
        'profile',
        'preference',
        'goal',
        'skill',
        'project',
        'learning_progress',
        'interest',
        'conversation',
        'conversation_insight',
        'fact',
        'decision',
        'insight',
        'achievement',
        'task',
        'relationship',
        'career',
        'ideas',
        'habits',
        'important_event',
        'custom',
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
    importance: {
      type: Number,
      default: 0,
      min: -10,
      max: 10,
    },
    confidence: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1,
    },
    source: {
      type: String,
      enum: ['inference', 'explicit', 'manual', 'imported', 'ai_extracted', 'system'],
      default: 'inference',
    },
    context: {
      type: String,
      default: '',
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    importanceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    lifecycleStatus: {
      type: String,
      enum: ['active', 'archived', 'expired', 'permanent'],
      default: 'active',
    },
    accessCount: {
      type: Number,
      default: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: null,
    },
    embedding: {
      type: [Number],
      default: [],
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    timesUsed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

memorySchema.index({ userId: 1, type: 1 });
memorySchema.index({ userId: 1, key: 1 }, { unique: true });
memorySchema.index({ userId: 1, tags: 1 });
memorySchema.index({ userId: 1, importanceScore: -1 });
memorySchema.index({ userId: 1, lifecycleStatus: 1 });
memorySchema.index({ userId: 1, lastAccessedAt: -1 });
memorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Memory', memorySchema);
