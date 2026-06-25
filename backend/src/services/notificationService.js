const Notification = require('../models/Notification');
const Goal = require('../models/Goal');
const Milestone = require('../models/Milestone');

class NotificationService {

  async create(userId, type, title, message, options = {}) {
    return Notification.create({
      userId, type, title, message,
      goalId: options.goalId || null,
      milestoneId: options.milestoneId || null,
      priority: options.priority || 'medium',
      actionUrl: options.actionUrl || null,
      scheduledFor: options.scheduledFor || null,
    });
  }

  async getUnread(userId, limit = 20) {
    return Notification.find({ userId, read: false, dismissed: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async markRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { read: true, sentAt: new Date() } },
      { new: true }
    );
  }

  async markAllRead(userId) {
    return Notification.updateMany(
      { userId, read: false },
      { $set: { read: true, sentAt: new Date() } }
    );
  }

  async dismiss(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { dismissed: true } }
    );
  }

  async checkDeadlines(userId) {
    const goals = await Goal.find({
      userId,
      status: 'active',
      deadline: { $ne: null, $gte: new Date() },
    }).lean();

    const created = [];
    for (const goal of goals) {
      const daysLeft = Math.round((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 3 && daysLeft >= 0) {
        const existing = await Notification.findOne({
          userId, goalId: goal._id,
          type: 'deadline_approaching',
          dismissed: false,
        });
        if (!existing) {
          const notif = await this.create(
            userId, 'deadline_approaching',
            `Deadline approaching: ${goal.title}`,
            `Due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
            { goalId: goal._id, priority: daysLeft <= 1 ? 'high' : 'medium' }
          );
          created.push(notif);
        }
      }
    }
    return created;
  }

  async checkInactiveGoals(userId) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const goals = await Goal.find({
      userId,
      status: 'active',
      updatedAt: { $lte: sevenDaysAgo },
    }).lean();

    const created = [];
    for (const goal of goals) {
      const existing = await Notification.findOne({
        userId, goalId: goal._id,
        type: 'goal_inactive',
        dismissed: false,
      });
      if (!existing) {
        const notif = await this.create(
          userId, 'goal_inactive',
          `Goal inactive: ${goal.title}`,
          'No progress in 7 days. Let\'s get back on track!',
          { goalId: goal._id, priority: 'low' }
        );
        created.push(notif);
      }
    }
    return created;
  }
}

module.exports = new NotificationService();
