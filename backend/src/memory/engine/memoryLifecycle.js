const Memory = require('../../models/Memory');
const logger = require('./memoryLogger');

const ARCHIVE_DAYS = 30;
const EXPIRE_DAYS = 7;
const PROMOTE_ACCESS_THRESHOLD = 5;
const PROMOTE_SCORE_THRESHOLD = 0.7;

async function runMaintenance(userId) {
  const start = Date.now();
  const actions = { archived: 0, expired: 0, promoted: 0, errors: 0 };

  try {
    const [arch, exp, prom] = await Promise.all([
      archiveOld(userId),
      expireTemporary(userId),
      promoteImportant(userId),
    ]);

    actions.archived = arch;
    actions.expired = exp;
    actions.promoted = prom;

    logger.log('MAINTENANCE', { userId, actions, elapsed: Date.now() - start });
  } catch (err) {
    actions.errors = 1;
    logger.log('MAINTENANCE_ERR', { userId, error: err.message });
  }

  return actions;
}

async function archiveOld(userId) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - ARCHIVE_DAYS);

  const result = await Memory.updateMany(
    {
      userId,
      lastAccessedAt: { $lte: cutoff },
      lifecycleStatus: { $nin: ['permanent', 'archived', 'expired'] },
      importanceScore: { $lt: 0.6 },
    },
    { $set: { lifecycleStatus: 'archived' } }
  );

  return result.modifiedCount;
}

async function expireTemporary(userId) {
  const result = await Memory.updateMany(
    {
      userId,
      expiresAt: { $lte: new Date() },
      lifecycleStatus: { $ne: 'permanent' },
    },
    { $set: { lifecycleStatus: 'expired', importanceScore: 0 } }
  );

  return result.modifiedCount;
}

async function promoteImportant(userId) {
  const result = await Memory.updateMany(
    {
      userId,
      accessCount: { $gte: PROMOTE_ACCESS_THRESHOLD },
      importanceScore: { $gte: PROMOTE_SCORE_THRESHOLD },
      lifecycleStatus: { $ne: 'permanent' },
    },
    { $set: { lifecycleStatus: 'permanent' } }
  );

  return result.modifiedCount;
}

async function getLifecycleStats(userId) {
  const stats = await Memory.aggregate([
    { $match: { userId: require('mongoose').Types.ObjectId(userId) } },
    { $group: { _id: '$lifecycleStatus', count: { $sum: 1 } } },
  ]);

  const result = { active: 0, archived: 0, expired: 0, permanent: 0 };
  for (const s of stats) {
    result[s._id] = s.count;
  }
  return result;
}

module.exports = { runMaintenance, archiveOld, expireTemporary, promoteImportant, getLifecycleStats };
