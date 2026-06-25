/**
 * CacheManager — in-memory cache with TTL for AI Brain retrievers.
 *
 * Caches user profile, goals, tasks, projects, and recent conversations
 * to avoid repeated database calls within short time windows.
 *
 * Future: replace with Redis for multi-process support.
 */

const CACHE_TTL = {
  profile: 5 * 60 * 1000,
  goals: 2 * 60 * 1000,
  tasks: 2 * 60 * 1000,
  projects: 2 * 60 * 1000,
  conversations: 30 * 1000,
  learning: 5 * 60 * 1000,
};

const store = new Map();

function cacheKey(userId, type) {
  return `${userId}:${type}`;
}

function get(userId, type) {
  const key = cacheKey(userId, type);
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > (CACHE_TTL[type] || 60000)) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

function set(userId, type, data) {
  const key = cacheKey(userId, type);
  store.set(key, { data, ts: Date.now() });
}

function invalidate(userId, type) {
  if (type) {
    store.delete(cacheKey(userId, type));
  } else {
    for (const key of store.keys()) {
      if (key.startsWith(`${userId}:`)) store.delete(key);
    }
  }
}

function clear() {
  store.clear();
}

module.exports = { get, set, invalidate, clear };
