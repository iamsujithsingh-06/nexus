const EVENTS = {
  RETRIEVED: 'RETRIEVED',
  SAVED: 'SAVED',
  UPDATED: 'UPDATED',
  IGNORED: 'IGNORED',
  MERGED: 'MERGED',
  DELETED: 'DELETED',
  ARCHIVED: 'ARCHIVED',
  EXPIRED: 'EXPIRED',
  PROMOTED: 'PROMOTED',
  MAINTENANCE: 'MAINTENANCE',
  MAINTENANCE_ERR: 'MAINTENANCE_ERR',
  SEARCH: 'SEARCH',
  CACHE_HIT: 'CACHE_HIT',
  CACHE_MISS: 'CACHE_MISS',
  ERROR: 'ERROR',
};

function log(event, details = {}) {
  const entry = {
    event,
    ts: new Date().toISOString(),
    ...details,
  };

  const elapsed = details.elapsed ? ` ${details.elapsed}ms` : '';
  const extra = details.count ? ` count=${details.count}` : '';
  const reason = details.reason ? ` reason="${details.reason}"` : '';
  const key = details.key ? ` key="${details.key}"` : '';
  const type = details.type ? ` type=${details.type}` : '';

  console.log(`[Memory] ${event}${key}${type}${extra}${reason}${elapsed}`);
}

function timeStart() {
  return Date.now();
}

function timeEnd(start, event, details = {}) {
  const elapsed = Date.now() - start;
  log(event, { ...details, elapsed });
  return elapsed;
}

module.exports = { log, timeStart, timeEnd, EVENTS };
