const Memory = require('../../models/Memory');
const EmbeddingService = require('../services/embeddingService');
const logger = require('./memoryLogger');

async function search(userId, options = {}) {
  const start = logger.timeStart();
  const {
    category,
    keyword,
    semantic,
    dateFrom,
    dateTo,
    minImportance,
    minScore,
    limit = 20,
    includeArchived = false,
  } = options;

  const query = { userId };

  if (category) {
    query.type = category;
  }

  if (!includeArchived) {
    query.lifecycleStatus = { $ne: 'archived' };
  }

  if (minImportance !== undefined) {
    query.importanceScore = { $gte: minImportance };
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  if (minScore !== undefined) {
    query.importanceScore = { ...(query.importanceScore || {}), $gte: minScore };
  }

  let results = [];

  if (semantic) {
    results = await EmbeddingService.hybridSearch(userId, semantic, limit);
  } else if (keyword) {
    const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [
      { key: regex },
      { 'value.title': regex },
      { 'value.name': regex },
      { 'value.description': regex },
      { tags: regex },
    ];
    results = await Memory.find(query)
      .sort({ importanceScore: -1, lastAccessedAt: -1 })
      .limit(limit)
      .lean();
  } else {
    results = await Memory.find(query)
      .sort({ importanceScore: -1, lastAccessedAt: -1 })
      .limit(limit)
      .lean();
  }

  logger.timeEnd('SEARCH', { userId, category, keyword: !!keyword, semantic: !!semantic, count: results.length });

  return results;
}

module.exports = { search };
