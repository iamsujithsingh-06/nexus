const mongoose = require('mongoose');

const learningNoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
  pathId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningPath', default: null, index: true },
  title: { type: String, default: 'Untitled Note' },
  content: { type: String, default: '' },
  snippets: [{
    language: String,
    code: String,
  }],
  links: [{ title: String, url: String }],
  tags: [{ type: String }],
  version: { type: Number, default: 1 },
}, { timestamps: true });

learningNoteSchema.index({ topicId: 1, createdAt: -1 });
learningNoteSchema.index({ userId: 1, tags: 1 });
learningNoteSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('LearningNote', learningNoteSchema);
