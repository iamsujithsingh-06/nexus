const DEFAULT_TTL = 5 * 60 * 1000;

const store = new Map();

function cacheKey(userId, type) {
  return `${userId}:${type}`;
}

function get(userId, type) {
  const key = cacheKey(userId, type);
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > DEFAULT_TTL) {
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
    for (const k of store.keys()) {
      if (k.startsWith(`${userId}:`)) store.delete(k);
    }
  }
}

function invalidateAll() {
  store.clear();
}

function stats() {
  return { size: store.size, keys: [...store.keys()] };
}

module.exports = { get, set, invalidate, invalidateAll, stats };
