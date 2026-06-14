const INDEX_KEY = 'nexus_sessions';
const SESSION_PREFIX = 'nexus_session_';

function nowISO() {
  return new Date().toISOString();
}

function migrateLegacySession() {
  try {
    const raw = localStorage.getItem('nexus_session');
    if (!raw) return;

    const data = JSON.parse(raw);
    if (!data || !data.currentChat || !data.currentChat._id) {
      localStorage.removeItem('nexus_session');
      return;
    }

    const id = data.currentChat._id;
    const existing = localStorage.getItem(SESSION_PREFIX + id);
    if (existing) {
      localStorage.removeItem('nexus_session');
      return;
    }

    const session = {
      _id: id,
      title: data.currentChat.title || 'New Chat',
      createdAt: data.currentChat.createdAt || nowISO(),
      updatedAt: data.currentChat.updatedAt || nowISO(),
      messages: Array.isArray(data.messages) ? data.messages : [],
    };

    localStorage.setItem(SESSION_PREFIX + id, JSON.stringify(session));
    localStorage.setItem(INDEX_KEY, JSON.stringify([{
      _id: id,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }]));
    localStorage.removeItem('nexus_session');
  } catch (err) {
    console.error('[Storage] migrateLegacySession failed:', err.message);
  }
}

migrateLegacySession();

export function listSessions() {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const sessions = JSON.parse(raw);
    return Array.isArray(sessions) ? sessions : [];
  } catch (err) {
    console.error('[Storage] listSessions failed:', err.message);
    return [];
  }
}

function writeIndex(sessions) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(sessions));
}

export function saveSession(session) {
  try {
    if (!session || !session._id) return;

    const full = {
      _id: session._id,
      title: session.title || 'New Chat',
      createdAt: session.createdAt || nowISO(),
      updatedAt: session.updatedAt || nowISO(),
      messages: Array.isArray(session.messages) ? session.messages : [],
    };

    localStorage.setItem(SESSION_PREFIX + session._id, JSON.stringify(full));

    const index = listSessions().filter((s) => s._id !== session._id);
    index.unshift({
      _id: full._id,
      title: full.title,
      createdAt: full.createdAt,
      updatedAt: full.updatedAt,
    });
    writeIndex(index);
  } catch (err) {
    console.error('[Storage] saveSession failed:', err.message);
  }
}

export function loadSession(id) {
  try {
    if (!id) return null;
    const raw = localStorage.getItem(SESSION_PREFIX + id);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !data._id) {
      console.warn('[Storage] loadSession: invalid data for', id);
      localStorage.removeItem(SESSION_PREFIX + id);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[Storage] loadSession failed:', err.message);
    return null;
  }
}

export function deleteSession(id) {
  try {
    localStorage.removeItem(SESSION_PREFIX + id);
    const index = listSessions().filter((s) => s._id !== id);
    writeIndex(index);
  } catch (err) {
    console.error('[Storage] deleteSession failed:', err.message);
  }
}

export function clearAllSessions() {
  try {
    const sessions = listSessions();
    sessions.forEach((s) => localStorage.removeItem(SESSION_PREFIX + s._id));
    localStorage.removeItem(INDEX_KEY);
  } catch (err) {
    console.error('[Storage] clearAllSessions failed:', err.message);
  }
}
