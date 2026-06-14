// Abstraction layer for all persistence operations.
// Currently backed by localStorage; swap the adapter to migrate to MongoDB.
// Every data module (goals, tasks, streaks) goes through this service.

export default class StorageService {
  constructor(prefix) {
    this.prefix = prefix;
  }

  _key(id) {
    return `${this.prefix}_${id}`;
  }

  _indexKey() {
    return `${this.prefix}_index`;
  }

  _now() {
    return new Date().toISOString();
  }

  _today() {
    return new Date().toISOString().slice(0, 10);
  }

  list() {
    try {
      const raw = localStorage.getItem(this._indexKey());
      if (!raw) return [];
      const items = JSON.parse(raw);
      return Array.isArray(items) ? items : [];
    } catch (err) {
      console.error(`[StorageService] list (${this.prefix}):`, err.message);
      return [];
    }
  }

  get(id) {
    try {
      if (!id) return null;
      const raw = localStorage.getItem(this._key(id));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.error(`[StorageService] get (${this.prefix}):`, err.message);
      return null;
    }
  }

  save(item) {
    try {
      if (!item || !item.id) return;
      const full = { ...item };
      localStorage.setItem(this._key(item.id), JSON.stringify(full));
      const index = this.list().filter((i) => i.id !== item.id);
      index.unshift({ id: full.id, updatedAt: full.updatedAt || this._now() });
      localStorage.setItem(this._indexKey(), JSON.stringify(index));
    } catch (err) {
      console.error(`[StorageService] save (${this.prefix}):`, err.message);
    }
  }

  delete(id) {
    try {
      localStorage.removeItem(this._key(id));
      const index = this.list().filter((i) => i.id !== id);
      localStorage.setItem(this._indexKey(), JSON.stringify(index));
    } catch (err) {
      console.error(`[StorageService] delete (${this.prefix}):`, err.message);
    }
  }

  getAll() {
    return this.list()
      .map((entry) => this.get(entry.id))
      .filter(Boolean);
  }

  clear() {
    try {
      const all = this.list();
      all.forEach((entry) => localStorage.removeItem(this._key(entry.id)));
      localStorage.removeItem(this._indexKey());
    } catch (err) {
      console.error(`[StorageService] clear (${this.prefix}):`, err.message);
    }
  }
}
