const aiService = require('./aiService');
const Goal = require('../models/Goal');
const Milestone = require('../models/Milestone');
const GoalTask = require('../models/GoalTask');
const Achievement = require('../models/Achievement');
const Activity = require('../models/Activity');
const WeeklyReport = require('../models/WeeklyReport');
const Streak = require('../models/Streak');

class GoalService {

  // ── AI-Powered Roadmap Generation ──

  async generateRoadmap(goalTitle, category) {
    const prompt = `You are a practical skill-building coach for a student. Given the goal "${goalTitle}" (category: ${category || 'general'}), generate a progressive roadmap with phases.

CRITICAL RULES:
- Return ONLY a JSON array of phase objects
- Each phase: { "phase": "Phase Name", "order": number, "topics": ["Topic1", "Topic2"] }
- Generate EXACTLY 4 phases ordered from foundational → intermediate → advanced → expert
- Phase 1: foundations & fundamentals (absolute basics, no prerequisites)
- Phase 2: practical skills & tools (projects, hands-on building)
- Phase 3: real-world application (competitions, contributions, showcases)
- Phase 4: advanced mastery (specialization, deeper topics)
- Topics MUST be concrete, learnable skills — NEVER research papers, academic theory, or abstract concepts
- NEVER include: "Research X", "Explore Y", "Study surveys", "Ethics papers", "Literature review"

Example for "Become the Best Coder in My College":
[
  { "phase": "Programming & DSA Foundations", "order": 1, "topics": ["Java/Python Mastery", "Data Structures & Algorithms"] },
  { "phase": "Project Building & Tools", "order": 2, "topics": ["Git & GitHub Workflow", "Web Development (HTML/CSS/JS/React)"] },
  { "phase": "Competitive Coding & Showcase", "order": 3, "topics": ["Competitive Programming", "Hackathons & Open Source"] },
  { "phase": "Advanced Development", "order": 4, "topics": ["System Design & Scalability", "AI/ML Applications"] }
]

Generate roadmap for: "${goalTitle}"`;

    try {
      const response = await aiService.generateAIResponse(prompt, [], null, 'goal-plan');
      const parsed = this._parseJSON(response);
      if (Array.isArray(parsed)) return parsed;
      const extracted = this._extractJSON(response);
      if (Array.isArray(extracted)) return extracted;
      return this._getDomainFallback(goalTitle, category);
    } catch {
      return this._getDomainFallback(goalTitle, category);
    }
  }

  async generateMilestones(phase, goalTitle) {
    const prompt = `You are a practical skill-building coach. Given phase "${phase}" for the goal "${goalTitle}", generate specific, learnable milestones.

RULES:
- Return ONLY a JSON array of milestone title strings
- Generate 4-6 milestones
- Each milestone must be a concrete, actionable topic you can learn in 1-3 days
- Milestones should build on each other sequentially
- NEVER include: "Research", "Survey", "Literature Review", "Ethics in X", "Future of X"
- Prefer milestones like: "Variables & Data Types", "Build a Calculator App", "Solve 10 Array Problems"

Example for phase "Programming & DSA Foundations":
["Variables, Data Types & Operators", "Control Flow (Loops & Conditionals)", "Functions & Scope", "Arrays & Strings", "Basic DSA Problems (Stacks & Queues)", "Recursion Basics"]

Generate milestones for phase "${phase}" under goal "${goalTitle}"`;

    try {
      const response = await aiService.generateAIResponse(prompt, [], null, 'goal-plan');
      const parsed = this._parseJSON(response);
      if (Array.isArray(parsed)) return parsed;
      const extracted = this._extractJSON(response);
      if (Array.isArray(extracted)) return extracted;
      return [];
    } catch {
      return [];
    }
  }

  async generateTasks(milestoneTitle, goalTitle) {
    const prompt = `You are a daily coding coach. Given the milestone "${milestoneTitle}" for the goal "${goalTitle}", generate concrete daily tasks.

RULES:
- Return ONLY a JSON array of task objects
- Each task: { "title": "string", "priority": "high|medium|low", "category": "coding|learning|reading|project|general" }
- Generate EXACTLY 3 tasks
- Tasks must be DOABLE in a single 1-2 hour study session
- Tasks should be specific actions, not topics
- PREFER task formats like: "Write a program that...", "Solve 5 problems on...", "Build a...", "Complete a tutorial on..."
- NEVER generate: "Research X", "Study the fundamentals of Y", "Explore Z", "Read academic papers"
- The title must be something a student can check off after 1-2 hours

Examples for "Control Flow (Loops & Conditionals)":
[
  { "title": "Write 5 programs using if-else and switch statements", "priority": "high", "category": "coding" },
  { "title": "Solve 3 loop pattern problems (pyramid, number triangle)", "priority": "high", "category": "coding" },
  { "title": "Build a simple calculator with menu-driven loop", "priority": "medium", "category": "project" }
]

Examples for "Build a Full-Stack Todo App":
[
  { "title": "Set up React project and create component tree", "priority": "high", "category": "coding" },
  { "title": "Implement CRUD API with Express and MongoDB", "priority": "high", "category": "coding" },
  { "title": "Connect frontend to backend and test full flow", "priority": "medium", "category": "project" }
]

Generate tasks for milestone "${milestoneTitle}" under goal "${goalTitle}"`;

    try {
      const response = await aiService.generateAIResponse(prompt, [], null, 'goal-plan');
      const parsed = this._parseJSON(response);
      if (Array.isArray(parsed)) return parsed;
      const extracted = this._extractJSON(response);
      if (Array.isArray(extracted)) return extracted;
      return [
        { title: `Write 3 programs practicing ${milestoneTitle}`, priority: 'medium', category: 'coding' },
        { title: `Solve 5 problems on ${milestoneTitle}`, priority: 'medium', category: 'coding' },
        { title: `Review and document ${milestoneTitle} concepts`, priority: 'low', category: 'learning' },
      ];
    } catch {
      return [
        { title: `Write 3 programs practicing ${milestoneTitle}`, priority: 'medium', category: 'coding' },
        { title: `Solve 5 problems on ${milestoneTitle}`, priority: 'medium', category: 'coding' },
        { title: `Review and document ${milestoneTitle} concepts`, priority: 'low', category: 'learning' },
      ];
    }
  }

  // ── Full AI Plan Generation ──

  async generateFullPlan(userId, goalTitle, category) {
    console.log(`[GOAL_SERVICE:generateFullPlan] userId=${userId} title="${goalTitle}" category="${category}"`);
    const roadmap = await this.generateRoadmap(goalTitle, category);
    console.log(`[GOAL_SERVICE:generateFullPlan] Roadmap generated: ${roadmap?.length || 0} phases`);

    const goal = await Goal.create({
      userId,
      title: goalTitle,
      category: category || 'general',
      roadmap: roadmap.map(r => ({ phase: r.phase, order: r.order })),
    });
    console.log(`[GOAL_SERVICE:generateFullPlan] Goal created: _id=${goal._id}`);

    const allMilestones = [];
    const allTasks = [];

    for (const phase of roadmap) {
      console.log(`[GOAL_SERVICE:generateFullPlan] Generating milestones for phase: "${phase.phase}"`);
      const milestones = await this.generateMilestones(phase.phase, goalTitle);
      console.log(`[GOAL_SERVICE:generateFullPlan] ${milestones.length} milestones generated`);
      for (let i = 0; i < milestones.length; i++) {
        const milestone = await Milestone.create({
          userId,
          goalId: goal._id,
          title: milestones[i],
          phase: phase.phase,
          order: i,
        });
        allMilestones.push(milestone);

        console.log(`[GOAL_SERVICE:generateFullPlan] Generating tasks for milestone: "${milestones[i]}"`);
        const tasks = await this.generateTasks(milestones[i], goalTitle);
        console.log(`[GOAL_SERVICE:generateFullPlan] ${tasks.length} tasks generated`);
        for (let j = 0; j < tasks.length; j++) {
          const task = await GoalTask.create({
            userId,
            goalId: goal._id,
            milestoneId: milestone._id,
            title: tasks[j].title,
            priority: tasks[j].priority || 'medium',
            category: tasks[j].category || 'general',
            order: j,
          });
          allTasks.push(task);
        }
      }
    }

    console.log(`[GOAL_SERVICE:generateFullPlan] Complete: ${allMilestones.length} milestones, ${allTasks.length} tasks`);
    return { goal, milestones: allMilestones, tasks: allTasks, roadmap };
  }

  // ── Progress Calculation ──

  async recalculateProgress(goalId) {
    const goal = await Goal.findById(goalId);
    if (!goal) return 0;

    const milestones = await Milestone.find({ goalId });
    if (!milestones.length) return 0;

    let totalProgress = 0;
    for (const ms of milestones) {
      const tasks = await GoalTask.find({ milestoneId: ms._id });
      if (tasks.length) {
        const completed = tasks.filter(t => t.status === 'completed').length;
        ms.progress = Math.round((completed / tasks.length) * 100);
        await ms.save();
      }
      totalProgress += ms.progress;
    }

    goal.progress = Math.round(totalProgress / milestones.length);
    await goal.save();

    if (goal.progress === 100 && goal.status === 'active') {
      goal.status = 'completed';
      goal.completedAt = new Date();
      await goal.save();
      await this._checkAchievements(goal.userId);
    }

    return goal.progress;
  }

  // ── Streak Management ──

  async updateStreak(userId, category) {
    const today = new Date().toISOString().split('T')[0];
    let streak = await Streak.findOne({ userId, category });
    if (!streak) {
      streak = await Streak.create({ userId, category, currentStreak: 1, longestStreak: 1, lastActiveDate: today, totalActiveDays: 1 });
      return streak;
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (streak.lastActiveDate === today) return streak;

    if (streak.lastActiveDate === yesterday) {
      streak.currentStreak += 1;
      streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
    } else {
      streak.currentStreak = 1;
    }

    streak.lastActiveDate = today;
    streak.totalActiveDays += 1;
    await streak.save();
    return streak;
  }

  // ── Activity Tracking ──

  async trackActivity(userId, updates = {}) {
    const today = new Date().toISOString().split('T')[0];
    let activity = await Activity.findOne({ userId, date: today });
    if (!activity) {
      activity = new Activity({ userId, date: today });
    }

    if (updates.tasksCompleted) activity.tasksCompleted += updates.tasksCompleted;
    if (updates.tasksCreated) activity.tasksCreated += updates.tasksCreated;
    if (updates.milestonesReached) activity.milestonesReached += updates.milestonesReached;
    if (updates.goalsUpdated) activity.goalsUpdated += updates.goalsUpdated;

    const totalActions = activity.tasksCompleted + activity.milestonesReached + activity.goalsUpdated;
    activity.score = Math.min(100, totalActions * 10);
    await activity.save();
    return activity;
  }

  // ── Weekly Report ──

  async generateWeeklyReport(userId) {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const startStr = weekStart.toISOString().split('T')[0];
    const endStr = weekEnd.toISOString().split('T')[0];

    const existing = await WeeklyReport.findOne({ userId, weekStart: startStr });
    if (existing) return existing;

    const activities = await Activity.find({
      userId,
      date: { $gte: startStr, $lte: endStr },
    });

    const tasksCompleted = activities.reduce((s, a) => s + a.tasksCompleted, 0);
    const tasksCreated = activities.reduce((s, a) => s + a.tasksCreated, 0);
    const totalScore = activities.reduce((s, a) => s + a.score, 0);
    const avgScore = activities.length ? Math.round(totalScore / activities.length) : 0;

    const dailyBreakdown = activities.map(a => ({
      date: a.date,
      tasksCompleted: a.tasksCompleted,
      score: a.score,
    }));

    const goals = await Goal.find({ userId, status: { $ne: 'archived' } });
    const completedMilestones = await Milestone.countDocuments({ userId, status: 'completed' });

    const strongAreas = [];
    const weakAreas = [];
    for (const goal of goals) {
      const goalActivities = activities.filter(a => a.goalsUpdated > 0);
      if (goal.progress >= 50) strongAreas.push(goal.title);
      else weakAreas.push(goal.title);
    }

    const report = await WeeklyReport.create({
      userId,
      weekStart: startStr,
      weekEnd: endStr,
      tasksCompleted,
      tasksCreated,
      progressGained: avgScore,
      strongAreas: strongAreas.slice(0, 3),
      weakAreas: weakAreas.slice(0, 3),
      nextWeekFocus: weakAreas.slice(0, 3),
      summary: `Completed ${tasksCompleted} tasks across ${goals.length} goals. ${completedMilestones} milestones reached.`,
      dailyBreakdown,
    });

    return report;
  }

  // ── AI Coach Insights ──

  async generateCoachInsights(userId) {
    const goals = await Goal.find({ userId, status: { $ne: 'archived' } }).sort({ createdAt: -1 });
    const tasks = await GoalTask.find({ userId }).sort({ createdAt: -1 }).limit(50);
    const streaks = await Streak.find({ userId });
    const activity = await Activity.find({ userId }).sort({ date: -1 }).limit(7);

    const activeGoals = goals.filter(g => g.status === 'active' || g.status === 'paused');
    const tasksToday = tasks.filter(t => {
      if (!t.dueDate) return false;
      const today = new Date().toISOString().split('T')[0];
      return t.dueDate.toISOString().split('T')[0] === today;
    });
    const completedToday = tasksToday.filter(t => t.status === 'completed');

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalGoals = activeGoals.length;
    const avgProgress = totalGoals ? Math.round(activeGoals.reduce((s, g) => s + g.progress, 0) / totalGoals) : 0;

    const bestStreak = streaks.length ? Math.max(...streaks.map(s => s.currentStreak)) : 0;

    const strengths = [];
    const weaknesses = [];
    const recommendations = [];

    for (const goal of activeGoals) {
      if (goal.progress >= 50) strengths.push(`${goal.title} (${goal.progress}%) — good progress`);
      else weaknesses.push(`${goal.title} (${goal.progress}%) — needs attention`);
    }

    if (completionRate >= 70) strengths.push(`Task completion rate is strong at ${completionRate}%`);
    else weaknesses.push(`Task completion rate is ${completionRate}% — try completing more tasks`);

    if (bestStreak >= 7) strengths.push(`🔥 ${bestStreak}-day streak! Outstanding consistency`);
    else if (bestStreak >= 3) strengths.push(`${bestStreak}-day streak — building momentum`);
    else recommendations.push(`Try to build a streak by being active daily`);

    if (weaknesses.length > 0) {
      for (const w of weaknesses.slice(0, 2)) {
        recommendations.push(`Focus on improving: ${w}`);
      }
    }

    if (tasksToday.length > completedToday.length) {
      recommendations.push(`Complete ${tasksToday.length - completedToday.length} remaining task(s) for today`);
    }

    const weeklyActivity = activity.length ? activity.map(a => a.score) : [];
    const avgWeeklyScore = weeklyActivity.length ? Math.round(weeklyActivity.reduce((s, v) => s + v, 0) / weeklyActivity.length) : 0;

    return {
      totalGoals,
      avgProgress,
      completionRate,
      bestStreak,
      avgWeeklyScore,
      strengths: strengths.slice(0, 3),
      weaknesses: weaknesses.slice(0, 3),
      recommendations: recommendations.slice(0, 3),
      todaysTasks: tasksToday.length,
      completedToday: completedToday.length,
    };
  }

  // ── Achievements ──

  async _checkAchievements(userId) {
    const definitions = [
      { code: 'first_goal', title: 'First Goal Created', condition: async () => (await Goal.countDocuments({ userId })) >= 1, icon: '🎯', rarity: 'common' },
      { code: 'goal_completed', title: 'Goal Crusher', condition: async () => (await Goal.countDocuments({ userId, status: 'completed' })) >= 1, icon: '🏆', rarity: 'uncommon' },
      { code: 'seven_day_streak', title: 'Week Warrior', condition: async () => { const s = await Streak.findOne({ userId, currentStreak: { $gte: 7 } }); return !!s; }, icon: '🔥', rarity: 'rare' },
      { code: 'thirty_day_streak', title: 'Monthly Legend', condition: async () => { const s = await Streak.findOne({ userId, currentStreak: { $gte: 30 } }); return !!s; }, icon: '💎', rarity: 'epic' },
      { code: 'hundred_tasks', title: 'Century Club', condition: async () => (await GoalTask.countDocuments({ userId, status: 'completed' })) >= 100, icon: '💯', rarity: 'epic' },
      { code: 'fifty_tasks', title: 'Half Century', condition: async () => (await GoalTask.countDocuments({ userId, status: 'completed' })) >= 50, icon: '⭐', rarity: 'rare' },
      { code: 'ten_milestones', title: 'Milestone Master', condition: async () => (await Milestone.countDocuments({ userId, status: 'completed' })) >= 10, icon: '📌', rarity: 'uncommon' },
      { code: 'three_goals', title: 'Goal Getter', condition: async () => (await Goal.countDocuments({ userId })) >= 3, icon: '🎯', rarity: 'uncommon' },
      { code: 'five_tasks_day', title: 'Productivity Burst', condition: async () => { const a = await Activity.findOne({ userId }).sort({ tasksCompleted: -1 }); return a && a.tasksCompleted >= 5; }, icon: '⚡', rarity: 'rare' },
    ];

    for (const def of definitions) {
      const existing = await Achievement.findOne({ userId, code: def.code });
      if (existing) continue;
      try {
        if (await def.condition()) {
          await Achievement.create({
            userId, code: def.code, title: def.title,
            description: def.title, icon: def.icon, rarity: def.rarity,
          });
        }
      } catch { /* skip */ }
    }
  }

  async getUserAchievements(userId) {
    return Achievement.find({ userId }).sort({ earnedAt: -1 });
  }

  // ── Goal Statistics ──

  async getStats(userId) {
    const goals = await Goal.find({ userId, status: { $ne: 'archived' } }).lean();
    const milestones = await Milestone.find({ userId }).lean();
    const tasks = await GoalTask.find({ userId }).lean();

    const totalGoals = goals.length;
    const activeGoals = goals.filter(g => g.status === 'active').length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const pausedGoals = goals.filter(g => g.status === 'paused').length;
    const plannedGoals = goals.filter(g => g.status === 'planned').length;
    const overdueGoals = goals.filter(g => {
      if (!g.deadline || g.status === 'completed') return false;
      return new Date(g.deadline) < new Date();
    }).length;

    const overallProgress = activeGoals + completedGoals > 0
      ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / Math.max(1, goals.filter(g => g.status !== 'archived').length))
      : 0;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;

    // Average completion time for completed goals
    const completedGoalDocs = goals.filter(g => g.status === 'completed' && g.completedAt && g.createdAt);
    const avgCompletionTime = completedGoalDocs.length > 0
      ? Math.round(completedGoalDocs.reduce((s, g) => {
          const days = (new Date(g.completedAt) - new Date(g.createdAt)) / (1000 * 60 * 60 * 24);
          return s + days;
        }, 0) / completedGoalDocs.length)
      : 0;

    // Longest running goal
    let longestRunningGoal = null;
    let longestDays = 0;
    for (const g of goals) {
      if (g.status === 'active' || g.status === 'paused') {
        const days = Math.round((Date.now() - new Date(g.createdAt)) / (1000 * 60 * 60 * 24));
        if (days > longestDays) {
          longestDays = days;
          longestRunningGoal = { _id: g._id, title: g.title, days };
        }
      }
    }

    // Most productive category
    const catProgress = {};
    for (const g of goals) {
      const cat = g.category || 'general';
      if (!catProgress[cat]) catProgress[cat] = { count: 0, totalProgress: 0 };
      catProgress[cat].count++;
      catProgress[cat].totalProgress += g.progress;
    }
    let bestCategory = null;
    let bestCatScore = 0;
    for (const [cat, data] of Object.entries(catProgress)) {
      const avg = data.totalProgress / data.count;
      if (avg > bestCatScore && data.count >= 1) {
        bestCatScore = avg;
        bestCategory = { category: cat, avgProgress: Math.round(avg), count: data.count };
      }
    }

    return {
      totalGoals,
      activeGoals,
      completedGoals,
      pausedGoals,
      plannedGoals,
      overdueGoals,
      overallProgress,
      totalMilestones,
      completedMilestones,
      completionRate,
      avgCompletionTime,
      longestRunningGoal,
      mostProductiveCategory: bestCategory,
    };
  }

  // ── Goal Timeline ──

  async getTimeline(goalId) {
    const goal = await Goal.findById(goalId).lean();
    if (!goal) return [];

    const events = [];

    // Created
    events.push({
      type: 'created',
      label: 'Goal Created',
      date: goal.createdAt,
      description: `"${goal.title}" was created`,
    });

    // Milestones
    const milestones = await Milestone.find({ goalId }).sort({ order: 1 }).lean();
    for (const ms of milestones) {
      events.push({
        type: ms.status === 'completed' ? 'milestone_completed' : 'milestone',
        label: ms.status === 'completed' ? 'Milestone Completed' : 'Milestone Added',
        date: ms.completedAt || ms.createdAt,
        description: ms.title,
        milestoneId: ms._id,
        completed: ms.status === 'completed',
      });
    }

    // Status changes
    if (goal.status === 'active' && goal.startedAt) {
      events.push({
        type: 'started',
        label: 'Work Started',
        date: goal.startedAt,
        description: 'Started working on this goal',
      });
    }
    if (goal.status === 'paused' && goal.pausedAt) {
      events.push({
        type: 'paused',
        label: 'Paused',
        date: goal.pausedAt,
        description: 'Goal was paused',
      });
    }
    if (goal.status === 'completed' && goal.completedAt) {
      events.push({
        type: 'completed',
        label: 'Completed',
        date: goal.completedAt,
        description: `Goal completed at ${goal.progress}%`,
      });
    }

    // Deadline
    if (goal.deadline) {
      events.push({
        type: 'deadline',
        label: 'Deadline',
        date: goal.deadline,
        description: `Due by ${new Date(goal.deadline).toLocaleDateString()}`,
      });
    }

    // Tasks completed
    const completedTasks = await GoalTask.find({
      goalId,
      status: 'completed',
      completedAt: { $ne: null },
    }).sort({ completedAt: -1 }).limit(5).lean();

    for (const t of completedTasks) {
      events.push({
        type: 'task_completed',
        label: 'Task Completed',
        date: t.completedAt,
        description: t.title,
        taskId: t._id,
      });
    }

    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    return events;
  }

  // ── AI Suggestions for a goal ──

  async getSuggestions(goalId) {
    const goal = await Goal.findById(goalId).lean();
    if (!goal || goal.status === 'completed' || goal.status === 'archived') return [];

    const milestones = await Milestone.find({ goalId, status: { $ne: 'completed' } })
      .sort({ order: 1 }).limit(3).lean();

    const suggestions = [];

    if (milestones.length > 0) {
      suggestions.push({
        type: 'next_milestone',
        text: `Work on "${milestones[0].title}"`,
        icon: '🎯',
      });
    }

    if (goal.deadline) {
      const daysLeft = Math.round((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft > 0 && daysLeft <= 7) {
        suggestions.push({
          type: 'deadline_approaching',
          text: `Deadline in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
          icon: '⏰',
        });
      }
    }

    if (goal.progress < 25) {
      suggestions.push({
        type: 'start',
        text: `Take the first step: ${milestones[0]?.title || 'begin working on this goal'}`,
        icon: '🚀',
      });
    } else if (goal.progress < 50) {
      suggestions.push({
        type: 'momentum',
        text: `${100 - goal.progress}% to go — keep the momentum!`,
        icon: '💪',
      });
    } else if (goal.progress < 75) {
      suggestions.push({
        type: 'halfway',
        text: `Over halfway there! Focus on the next milestone.`,
        icon: '🔥',
      });
    } else {
      suggestions.push({
        type: 'closing',
        text: `Almost done! Finish the remaining milestones.`,
        icon: '🏁',
      });
    }

    return suggestions;
  }

  // ── Enhanced Search ──

  async search(userId, filters = {}) {
    const query = { userId, status: { $ne: 'archived' } };

    if (filters.status) {
      if (filters.status === 'active') query.status = 'active';
      else if (filters.status === 'completed') query.status = 'completed';
      else if (filters.status === 'paused') query.status = 'paused';
      else if (filters.status === 'planned') query.status = 'planned';
    }

    if (filters.category) query.category = filters.category;
    if (filters.priority) query.priority = parseInt(filters.priority);

    if (filters.search) {
      const regex = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { tags: regex },
      ];
    }

    if (filters.deadlineBefore) query.deadline = { $lte: new Date(filters.deadlineBefore) };
    if (filters.deadlineAfter) query.deadline = { ...query.deadline, $gte: new Date(filters.deadlineAfter) };
    if (filters.overdue === 'true') {
      query.deadline = { ...query.deadline, $lt: new Date() };
      query.status = { $nin: ['completed', 'archived'] };
    }

    const sort = {};
    if (filters.sort === 'deadline') sort.deadline = 1;
    else if (filters.sort === 'priority') sort.priority = -1;
    else if (filters.sort === 'progress') sort.progress = -1;
    else sort.createdAt = -1;

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const [goals, total] = await Promise.all([
      Goal.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Goal.countDocuments(query),
    ]);

    return { goals, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Dashboard Data ──

  async getDashboard(userId) {
    const goals = await Goal.find({ userId, status: { $ne: 'archived' } }).sort({ createdAt: -1 });
    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');

    const tasks = await GoalTask.find({ userId });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const todayTasks = tasks.filter(t => {
      if (!t.dueDate) return false;
      const today = new Date().toISOString().split('T')[0];
      return t.dueDate.toISOString().split('T')[0] === today;
    });

    const activity = await Activity.find({ userId }).sort({ date: -1 }).limit(30);
    const weeklyActivity = activity.slice(0, 7);
    const focusScore = weeklyActivity.length ? Math.round(weeklyActivity.reduce((s, a) => s + a.score, 0) / weeklyActivity.length) : 0;

    const streaks = await Streak.find({ userId });
    const bestStreak = streaks.length ? Math.max(...streaks.map(s => s.currentStreak)) : 0;

    const achievements = await Achievement.find({ userId }).sort({ earnedAt: -1 }).limit(5);

    const currentGoal = activeGoals.length > 0 ? {
      _id: activeGoals[0]._id,
      title: activeGoals[0].title,
      progress: activeGoals[0].progress,
    } : null;

    return {
      currentGoal,
      totalGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      progress: currentGoal ? currentGoal.progress : 0,
      tasksCompleted: completedTasks,
      totalTasks,
      currentStreak: bestStreak,
      focusScore,
      todayTasks: todayTasks.filter(t => t.status !== 'completed').slice(0, 10),
      streaks,
      achievements,
      activity: activity.slice(0, 7),
    };
  }

  // ── Helpers ──

  _parseJSON(text) {
    try { return JSON.parse(text); } catch { return null; }
  }

  _extractJSON(text) {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      try { return JSON.parse(match[1]); } catch { return null; }
    }
    const braceMatch = text.match(/\[[\s\S]*?\]/);
    if (braceMatch) {
      try { return JSON.parse(braceMatch[0]); } catch { return null; }
    }
    return null;
  }

  _getDomainFallback(goalTitle, category) {
    const fallbacks = {
      learning: [
        { phase: 'Fundamentals', order: 1, topics: ['Core Concepts & Terminology', 'First Principles & Basics'] },
        { phase: 'Practical Application', order: 2, topics: ['Hands-on Exercises', 'Real-world Examples'] },
        { phase: 'Skill Building', order: 3, topics: ['Small Projects', 'Problem Solving'] },
        { phase: 'Mastery & Portfolio', order: 4, topics: ['Capstone Project', 'Knowledge Review'] },
      ],
      coding: [
        { phase: 'Programming & DSA Foundations', order: 1, topics: ['Language Mastery (Java/Python)', 'Data Structures & Algorithms'] },
        { phase: 'Project Building & Tools', order: 2, topics: ['Git & GitHub', 'Web Development Basics'] },
        { phase: 'Competitive Coding & Showcase', order: 3, topics: ['Competitive Programming', 'Hackathons & Open Source'] },
        { phase: 'Advanced Development', order: 4, topics: ['System Design', 'AI/ML Applications'] },
      ],
    };

    if (fallbacks[category]) return fallbacks[category];
    return [
      { phase: 'Foundation', order: 1, topics: ['Core Basics', 'First Principles'] },
      { phase: 'Skill Building', order: 2, topics: ['Practical Exercises', 'Hands-on Practice'] },
      { phase: 'Real-world Application', order: 3, topics: ['Small Projects', 'Problem Solving'] },
      { phase: 'Mastery', order: 4, topics: ['Capstone Project', 'Portfolio & Review'] },
    ];
  }
}

module.exports = new GoalService();
