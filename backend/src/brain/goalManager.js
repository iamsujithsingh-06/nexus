/**
 * Goal Manager — In-memory goal storage with full CRUD operations.
 *
 * Architecture Note:
 *   All storage access goes through internal helper functions (_store, _load, etc.)
 *   so the underlying implementation can be swapped from Map → MongoDB without
 *   changing the exported API signatures. To migrate, replace the bodies of the
 *   four internal helpers while keeping the exported function contracts identical.
 */

// ---------------------------------------------------------------------------
// Internal storage (swappable)
// ---------------------------------------------------------------------------

const _store = new Map();
let _nextId = 1;

// ---------------------------------------------------------------------------
// Internal helpers (replace these when migrating to MongoDB)
// ---------------------------------------------------------------------------

function _generateId() {
  return _nextId++;
}

function _saveToStore(id, goal) {
  _store.set(id, goal);
}

function _removeFromStore(id) {
  return _store.delete(id);
}

function _findAll() {
  return Array.from(_store.values());
}

function _findById(id) {
  return _store.get(id) || null;
}

function _findByTitle(normalizedTitle) {
  for (const goal of _store.values()) {
    if (_normalize(goal.title) === normalizedTitle) {
      return goal;
    }
  }
  return null;
}

function _clearAll() {
  _store.clear();
  _nextId = 1;
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function _normalize(text) {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Extracts a plausible goal title from a user message.
 * Tries GOAL_PATTERNS first; falls back to the full message.
 * @param {string} message
 * @returns {string}
 */
function extractTitle(message) {
  if (!message || typeof message !== 'string') return '';

  const GOAL_PATTERNS = [
    /i (?:want|need|plan|hope|aim|aspire|intend) to (.+)/i,
    /my goal (?:is|should be) to (.+)/i,
    /i (?:will|shall|should|must|have to) (.+)/i,
    /i[''](?:m|am) going to (.+)/i,
    /i[''](?:d|would) like to (?:start|begin) (.+)/i,
    /help me (?:achieve|reach|accomplish|complete) (.+)/i,
    /(?:track|monitor|measure) my (.+)/i,
  ];

  for (const pattern of GOAL_PATTERNS) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim().replace(/\.$/, '');
    }
  }

  return message.trim().substring(0, 120);
}

// ---------------------------------------------------------------------------
// Exported API (preserve these signatures when swapping storage)
// ---------------------------------------------------------------------------

/**
 * Save a new goal. Duplicate titles (case-insensitive) are rejected.
 *
 * @param {string}  title       - Goal title
 * @param {string}  [description=''] - Optional description
 * @param {string}  [category='general'] - Goal category
 * @param {string}  [source='manual'] - Origin: 'manual' | 'chat' | 'ai'
 * @returns {object|null} The saved goal, or null if duplicate / invalid input
 */
function saveGoal(title, description = '', category = 'general', source = 'manual') {
  if (!title || typeof title !== 'string' || !title.trim()) {
    return null;
  }

  const normalized = _normalize(title);

  // Duplicate prevention
  if (_findByTitle(normalized)) {
    return null;
  }

  const goal = {
    id: _generateId(),
    title: title.trim(),
    description: description.trim() || '',
    category,
    source,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  _saveToStore(goal.id, goal);
  return goal;
}

/**
 * Retrieve all saved goals, optionally filtered by status.
 * Returns a shallow copy so callers cannot mutate internal storage.
 *
 * @param {string} [status] - Optional filter: 'active' | 'completed' | 'archived'
 * @returns {Array<object>}
 */
function getGoals(status) {
  const all = _findAll();
  if (status) {
    return all.filter((g) => g.status === status);
  }
  return all;
}

/**
 * Update an existing goal by ID.
 *
 * @param {number} id
 * @param {object} updates - Fields to merge (title, description, category, status, etc.)
 * @returns {object|null} The updated goal, or null if not found / duplicate title
 */
function updateGoal(id, updates) {
  const goal = _findById(id);
  if (!goal) return null;

  // If the title is changing, check for duplicates (skip if unchanged)
  if (updates.title && _normalize(updates.title) !== _normalize(goal.title)) {
    if (_findByTitle(_normalize(updates.title))) {
      return null;
    }
  }

  const updated = {
    ...goal,
    ...updates,
    id: goal.id, // id is immutable
    createdAt: goal.createdAt, // createdAt is immutable
    updatedAt: new Date().toISOString(),
  };

  _saveToStore(id, updated);
  return updated;
}

/**
 * Delete a goal by ID.
 *
 * @param {number} id
 * @returns {boolean} true if a goal was deleted, false if not found
 */
function deleteGoal(id) {
  return _removeFromStore(id);
}

/**
 * Remove all goals and reset ID counter (useful for testing).
 */
function clearGoals() {
  _clearAll();
}

/**
 * Count goals, optionally filtered by status.
 *
 * @param {string} [status]
 * @returns {number}
 */
function countGoals(status) {
  return getGoals(status).length;
}

module.exports = {
  saveGoal,
  getGoals,
  updateGoal,
  deleteGoal,
  clearGoals,
  countGoals,
  extractTitle,
};
