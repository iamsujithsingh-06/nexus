/**
 * Memory Category Value Schemas
 *
 * Each memory type has a structured `value` schema that defines what fields
 * are available for that category. These are NOT separate Mongoose schemas —
 * they live inside the Memory document's `value: Mixed` field. This file
 * documents the expected structure and provides factory functions.
 */

const CATEGORY_TYPES = [
  'profile',
  'goal',
  'preference',
  'project',
  'interest',
  'conversation',
  'insight',
  'fact',
];

const CATEGORY_META = {
  profile: {
    label: 'User Profile',
    description: 'Personal information about the user',
    defaultPriority: 8,
    fields: ['name', 'role', 'company', 'location', 'bio', 'skills', 'experienceLevel', 'socialLinks'],
  },
  goal: {
    label: 'Goal',
    description: 'A goal or objective the user wants to achieve',
    defaultPriority: 7,
    fields: ['title', 'description', 'status', 'priority', 'timeline', 'category', 'subgoals'],
  },
  preference: {
    label: 'Preference',
    description: 'A user preference, like or dislike',
    defaultPriority: 4,
    fields: ['type', 'subject', 'context', 'strength'],
  },
  project: {
    label: 'Project',
    description: 'A project the user is working on or has worked on',
    defaultPriority: 6,
    fields: ['name', 'description', 'status', 'techStack', 'role', 'url', 'startDate'],
  },
  interest: {
    label: 'Interest',
    description: 'A topic or activity the user is interested in',
    defaultPriority: 5,
    fields: ['topic', 'level', 'since'],
  },
  conversation: {
    label: 'Conversation Summary',
    description: 'A summary of a conversation for cross-session context',
    defaultPriority: 3,
    fields: ['summary', 'date', 'topics', 'sentiment', 'keyPoints'],
  },
  insight: {
    label: 'Insight',
    description: 'An inferred insight about the user',
    defaultPriority: 2,
    fields: ['observation', 'confidence', 'category', 'evidence'],
  },
  fact: {
    label: 'Fact',
    description: 'A confirmed fact about the user',
    defaultPriority: 3,
    fields: ['description', 'source', 'verified'],
  },
};

function createValue(type, data = {}) {
  const meta = CATEGORY_META[type];
  if (!meta) throw new Error(`Unknown memory category: ${type}`);

  const value = {};
  for (const field of meta.fields) {
    if (data[field] !== undefined) {
      value[field] = data[field];
    }
  }
  return value;
}

function validateValue(type, value) {
  const meta = CATEGORY_META[type];
  if (!meta) return false;
  if (!value || typeof value !== 'object') return false;
  return true;
}

module.exports = {
  CATEGORY_TYPES,
  CATEGORY_META,
  createValue,
  validateValue,
};
