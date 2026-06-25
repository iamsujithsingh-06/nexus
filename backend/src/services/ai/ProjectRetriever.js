/**
 * ProjectRetriever — fetches active projects and recent project memories.
 *
 * Returns top 2 active projects from the memory system.
 * Uses CacheManager for 2-minute TTL.
 */

const MemoryManager = require('../../memory/manager/memoryManager');
const CacheManager = require('./CacheManager');

const MAX_PROJECTS = 2;

async function retrieve(userId) {
  const start = Date.now();

  const cached = CacheManager.get(userId, 'projects');
  if (cached) return { ...cached, elapsed: Date.now() - start, cached: true };

  try {
    const projects = await MemoryManager.getActiveProjects(userId);
    const enriched = Array.isArray(projects)
      ? projects.slice(0, MAX_PROJECTS).map(p => ({
          name: p.name || p.title || p.key || 'Untitled',
          status: p.status || 'active',
          description: p.description || '',
        }))
      : [];

    const result = { projects: enriched, count: enriched.length };
    CacheManager.set(userId, 'projects', result);
    return { ...result, elapsed: Date.now() - start, cached: false };
  } catch (err) {
    return { projects: [], count: 0, elapsed: Date.now() - start, error: err.message };
  }
}

module.exports = { retrieve };
