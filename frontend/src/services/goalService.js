import StorageService from './storage/StorageService';

const GOAL_CATEGORIES = ['Career', 'Health', 'Learning', 'Personal'];
const GOAL_PRIORITIES = ['High', 'Medium', 'Low'];
const GOAL_STATUSES = ['Active', 'Completed'];

let idCounter = Date.now();
function generateId() {
  return `goal_${++idCounter}`;
}

const store = new StorageService('nexus_goal');

export { GOAL_CATEGORIES, GOAL_PRIORITIES, GOAL_STATUSES };

// ─── AI Plan Generation ───────────────────────────────────────────

const DOMAIN_PLANS = {
  learning: {
    keywords: ['learn', 'study', 'master', 'understand', 'skill', 'course', 'training', 'programming', 'coding', 'python', 'javascript', 'react', 'machine learning', 'ai', 'data science', 'algorithm', 'web dev', 'software', 'computer', 'language', 'certification', 'certificate'],
    milestones: [
      {
        name: 'Foundation & Research',
        tasks: [
          'Research the best resources to achieve this goal',
          'Set up your development and learning environment',
          'Identify prerequisites and skill gaps',
          'Create a structured study plan with weekly targets',
          'Join relevant communities and follow experts',
        ],
      },
      {
        name: 'Core Fundamentals',
        tasks: [
          'Study the core concepts and first principles',
          'Complete an introductory structured course',
          'Work through official documentation and guides',
          'Build your first simple practice project',
          'Take notes and create a knowledge reference',
        ],
      },
      {
        name: 'Hands-On Practice',
        tasks: [
          'Solve progressively challenging exercises',
          'Build a mid-size practice project from scratch',
          'Participate in a coding challenge or hackathon',
          'Review and refactor your code for best practices',
          'Get feedback from peers or mentors',
        ],
      },
      {
        name: 'Advanced Topics',
        tasks: [
          'Dive into advanced concepts and specialized areas',
          'Study real-world architecture and patterns',
          'Work through advanced tutorials and case studies',
          'Optimize and performance-test your projects',
        ],
      },
      {
        name: 'Real-World Application',
        tasks: [
          'Identify a real problem to solve with your skills',
          'Plan and architect a complete real-world project',
          'Build, test, and deploy your solution',
          'Document your process and results',
          'Showcase your project in a portfolio or demo',
        ],
      },
      {
        name: 'Review, Share & Next Steps',
        tasks: [
          'Review everything you have learned end-to-end',
          'Identify remaining knowledge gaps',
          'Teach or explain concepts to someone else',
          'Set your next learning milestones',
          'Update your resume and portfolio with new skills',
        ],
      },
    ],
  },
  fitness: {
    keywords: ['run', 'marathon', 'fitness', 'workout', 'exercise', 'gym', 'weight', 'muscle', 'health', 'yoga', 'swim', 'cycle', 'endurance', 'strength', 'cardio', 'diet', 'nutrition', 'body', 'lose', 'gain'],
    milestones: [
      {
        name: 'Assessment & Planning',
        tasks: [
          'Get a health checkup and assess current fitness level',
          'Set specific, measurable fitness targets',
          'Research training programs that match your goal',
          'Create a weekly workout and nutrition plan',
          'Get proper gear and equipment',
        ],
      },
      {
        name: 'Foundation Building',
        tasks: [
          'Establish a consistent workout routine',
          'Build base endurance with steady-state training',
          'Learn proper form for key exercises',
          'Track your nutrition and adjust macros',
          'Rest and recover with proper sleep schedule',
        ],
      },
      {
        name: 'Progressive Training',
        tasks: [
          'Increase training intensity and volume gradually',
          'Incorporate interval training and variations',
          'Track and log all workouts and measurements',
          'Adjust nutrition plan based on energy needs',
          'Join a class or find a workout partner for accountability',
        ],
      },
      {
        name: 'Peak Preparation',
        tasks: [
          'Taper training to reach peak condition',
          'Optimize nutrition and hydration strategy',
          'Practice mental preparation and visualization',
          'Do a dress rehearsal or practice run',
          'Finalize logistics and plan for event day',
        ],
      },
      {
        name: 'Execute & Recover',
        tasks: [
          'Execute your goal event or milestone workout',
          'Log your results and celebrate the achievement',
          'Follow a structured recovery plan',
          'Reflect on what worked and what to improve',
          'Plan the next fitness goal',
        ],
      },
    ],
  },
  creative: {
    keywords: ['write', 'book', 'novel', 'blog', 'article', 'content', 'create', 'design', 'art', 'draw', 'paint', 'music', 'song', 'album', 'video', 'film', 'photography', 'portfolio', 'creative', 'invent'],
    milestones: [
      {
        name: 'Ideation & Planning',
        tasks: [
          'Brainstorm and collect all ideas in one place',
          'Research existing work in your creative domain',
          'Define your creative vision and scope',
          'Create an outline or storyboard',
          'Set deadlines for each creative phase',
        ],
      },
      {
        name: 'First Draft / Initial Creation',
        tasks: [
          'Create the first version without overthinking',
          'Focus on quantity over quality in this phase',
          'Establish a daily creative habit',
          'Reach the 50% completion milestone',
          'Complete the full first draft or initial version',
        ],
      },
      {
        name: 'Review & Refine',
        tasks: [
          'Take a break then review with fresh eyes',
          'Get feedback from trusted peers or beta readers',
          'Identify areas that need major revision',
          'Refine and improve based on feedback',
          'Do a second pass of detailed edits',
        ],
      },
      {
        name: 'Polish & Finalize',
        tasks: [
          'Do final proofreading and quality check',
          'Format and prepare for publishing or sharing',
          'Create supporting materials (cover, description, etc.)',
          'Do a final review of the complete work',
          'Prepare launch or release plan',
        ],
      },
      {
        name: 'Launch, Share & Reflect',
        tasks: [
          'Publish or release your creative work',
          'Share with your audience and promote',
          'Collect and respond to feedback',
          'Reflect on the creative process and lessons learned',
          'Plan your next creative project',
        ],
      },
    ],
  },
  career: {
    keywords: ['career', 'job', 'promotion', 'interview', 'resume', 'manager', 'lead', 'salary', 'negotiate', 'network', 'professional', 'work', 'corporate', 'industry', 'role', 'position', 'switch', 'transition'],
    milestones: [
      {
        name: 'Self-Assessment & Targeting',
        tasks: [
          'Evaluate your current skills and experience',
          'Identify your ideal next role or position',
          'Research market requirements and salary ranges',
          'Identify skill gaps between you and your target',
          'Define your personal brand and value proposition',
        ],
      },
      {
        name: 'Skill & Profile Development',
        tasks: [
          'Update your resume and LinkedIn profile',
          'Build or improve skills identified in the gap analysis',
          'Earn relevant certifications or credentials',
          'Create portfolio pieces or work samples',
          'Practice behavioral and technical interview questions',
        ],
      },
      {
        name: 'Networking & Outreach',
        tasks: [
          'Reconnect with your professional network',
          'Attend industry events, webinars, or meetups',
          'Reach out to people in your target companies',
          'Find mentors or sponsors in your field',
          'Engage with industry content and discussions',
        ],
      },
      {
        name: 'Application & Interviews',
        tasks: [
          'Apply to target positions with tailored applications',
          'Prepare stories and examples for common questions',
          'Complete technical assessments or case studies',
          'Do mock interviews with peers or coaches',
          'Follow up after every interview',
        ],
      },
      {
        name: 'Offer & Transition',
        tasks: [
          'Evaluate offers holistically (comp, culture, growth)',
          'Negotiate salary and benefits',
          'Plan your transition and notice period',
          'Set up for success in your first 90 days',
          'Close out your previous role professionally',
        ],
      },
    ],
  },
  business: {
    keywords: ['startup', 'business', 'company', 'launch', 'product', 'saas', 'entrepreneur', 'venture', 'start', 'side project', 'monetize', 'revenue', 'customer', 'market', 'sell', 'founder', 'co-founder'],
    milestones: [
      {
        name: 'Market Research & Validation',
        tasks: [
          'Identify a specific problem to solve',
          'Research target market size and competition',
          'Conduct customer interviews to validate demand',
          'Define your unique value proposition',
          'Analyze competitive landscape thoroughly',
        ],
      },
      {
        name: 'Planning & Strategy',
        tasks: [
          'Define your business model and revenue streams',
          'Create a minimum viable product specification',
          'Set up legal structure and necessary licenses',
          'Create financial projections and budget',
          'Develop a go-to-market strategy',
        ],
      },
      {
        name: 'Build & Develop',
        tasks: [
          'Build the minimum viable product',
          'Set up core business infrastructure',
          'Develop brand identity and messaging',
          'Create initial marketing materials',
          'Test MVP with early users',
        ],
      },
      {
        name: 'Launch & Initial Traction',
        tasks: [
          'Soft launch to a small audience',
          'Iterate based on early feedback',
          'Full public launch and announcement',
          'Run initial marketing and acquisition campaigns',
          'Acquire first paying customers',
        ],
      },
      {
        name: 'Growth & Iteration',
        tasks: [
          'Analyze user data and key metrics',
          'Prioritize and ship feature improvements',
          'Scale marketing channels that work',
          'Build customer support processes',
          'Plan next phase of growth and fundraising',
        ],
      },
    ],
  },
  academic: {
    keywords: ['exam', 'test', 'grade', 'gpa', 'degree', 'college', 'university', 'school', 'class', 'subject', 'math', 'science', 'history', 'paper', 'thesis', 'dissertation', 'graduate', 'phd', 'master'],
    milestones: [
      {
        name: 'Syllabus & Planning',
        tasks: [
          'Review full syllabus and exam requirements',
          'Break down topics into study units',
          'Create a study timetable leading to exam date',
          'Gather all required textbooks and resources',
          'Identify your strongest and weakest topics',
        ],
      },
      {
        name: 'Concept Mastery',
        tasks: [
          'Study and understand core concepts for each topic',
          'Take detailed notes and create summaries',
          'Complete all assigned readings and exercises',
          'Form or join a study group for discussion',
          'Create flashcards or mind maps for key concepts',
        ],
      },
      {
        name: 'Practice & Application',
        tasks: [
          'Solve past papers and practice questions',
          'Time yourself under exam conditions',
          'Identify recurring patterns and question types',
          'Work on your weakest areas intensively',
          'Review and learn from every mistake',
        ],
      },
      {
        name: 'Review & Consolidation',
        tasks: [
          'Do comprehensive review of all topics',
          'Create condensed revision notes',
          'Teach concepts to classmates to reinforce learning',
          'Take full-length mock exams',
          'Focus on memory retention techniques',
        ],
      },
      {
        name: 'Exam & Beyond',
        tasks: [
          'Rest and relax before the exam day',
          'Execute your exam strategy with confidence',
          'Review your performance post-exam',
          'Plan next academic steps based on results',
          'Celebrate your effort regardless of outcome',
        ],
      },
    ],
  },
  habit: {
    keywords: ['habit', 'routine', 'daily', 'consistent', 'build', 'develop', 'improve', 'quit', 'stop', 'reduce', 'increase', 'regular', 'discipline', 'productivity', 'focus', 'time management', 'morning', 'evening'],
    milestones: [
      {
        name: 'Define & Design',
        tasks: [
          'Clearly define the habit you want to build',
          'Identify your triggers and current patterns',
          'Design your environment for success',
          'Start with a small, easy version of the habit',
          'Define how you will track consistency',
        ],
      },
      {
        name: 'First 21 Days — Foundation',
        tasks: [
          'Perform the habit daily for the first week',
          'Use habit stacking — attach to existing routine',
          'Log your progress every single day',
          'Remove obstacles and friction points',
          'Celebrate small wins to build momentum',
        ],
      },
      {
        name: 'Building Consistency',
        tasks: [
          'Complete 30 consecutive days of the habit',
          'Gradually increase difficulty or duration',
          'Plan for disruptions and create backup plans',
          'Review what is working and refine your approach',
          'Share your progress for accountability',
        ],
      },
      {
        name: 'Integration & Identity',
        tasks: [
          'Reframe the habit as part of your identity',
          'Make the habit automatic without conscious effort',
          'Expand into related positive habits',
          'Track long-term trends and improvements',
          'Help someone else start the same habit',
        ],
      },
      {
        name: 'Maintenance & Growth',
        tasks: [
          'Review 90-day progress and adjust goals',
          'Set new challenge levels for the habit',
          'Build a second complementary habit',
          'Reflect on how the habit has changed your life',
          'Plan the next 90 days of habit growth',
        ],
      },
    ],
  },
  generic: {
    keywords: [],
    milestones: [
      {
        name: 'Research & Scope Definition',
        tasks: [
          'Research and understand what this goal requires',
          'Define clear success criteria and deliverables',
          'Break the goal down into manageable phases',
          'Create a timeline with milestone deadlines',
          'Identify resources and support needed',
        ],
      },
      {
        name: 'Foundation & Preparation',
        tasks: [
          'Gather all necessary tools and resources',
          'Set up systems to track your progress',
          'Build foundational knowledge or skills',
          'Create a detailed action plan for each phase',
          'Establish a consistent working schedule',
        ],
      },
      {
        name: 'Core Execution',
        tasks: [
          'Begin executing the first major phase',
          'Complete the critical path items first',
          'Track progress against your timeline',
          'Overcome obstacles and adjust as needed',
          'Reach the 50% completion milestone',
        ],
      },
      {
        name: 'Review & Refinement',
        tasks: [
          'Review progress and quality of work so far',
          'Get feedback from trusted advisors',
          'Make necessary adjustments to your approach',
          'Address any remaining challenges',
          'Push through to near-completion',
        ],
      },
      {
        name: 'Completion & Celebration',
        tasks: [
          'Complete all remaining tasks and deliverables',
          'Do a final quality review',
          'Share your accomplishment with others',
          'Reflect on lessons learned',
          'Set your next goal based on this experience',
        ],
      },
    ],
  },
};

function detectDomain(text) {
  const lower = text.toLowerCase();
  for (const [domain, config] of Object.entries(DOMAIN_PLANS)) {
    if (domain === 'generic') continue;
    if (config.keywords.some((kw) => lower.includes(kw))) {
      return domain;
    }
  }
  return 'generic';
}

export function generateAIPlan({ title, description, targetDate }) {
  const text = `${title} ${description || ''}`;
  const domain = detectDomain(text);
  const plan = DOMAIN_PLANS[domain] || DOMAIN_PLANS.generic;

  const milestones = plan.milestones.map((m) => ({
    name: m.name,
    taskTitles: [...m.tasks],
  }));

  return { milestones, domain };
}

export function saveAIPlan(goalData, plan, taskService) {
  const goal = createGoal(goalData);

  const milestones = plan.milestones.map((m, i) => ({
    id: `ms_${Date.now()}_${i}`,
    name: m.name,
    completed: false,
  }));
  updateGoal(goal.id, { milestones });

  const taskIds = [];
  plan.milestones.forEach((m, mi) => {
    m.taskTitles.forEach((title) => {
      const task = taskService.createTask({
        title,
        description: '',
        category: goalData.category || 'Learning',
        dueDate: null,
        goalId: goal.id,
        milestoneId: milestones[mi].id,
      });
      taskIds.push(task.id);
    });
  });
  updateGoal(goal.id, { taskIds });

  const updated = getGoal(goal.id);
  return { goal: updated, taskIds };
}

export function createGoal({ title, description, category, priority, targetDate }) {
  const goal = {
    id: generateId(),
    title,
    description: description || '',
    category: category || 'Personal',
    priority: priority || 'Medium',
    progress: 0,
    createdAt: new Date().toISOString(),
    targetDate: targetDate || null,
    milestones: [],
    taskIds: [],
    status: 'Active',
    updatedAt: new Date().toISOString(),
  };
  store.save(goal);
  return goal;
}

export function updateGoal(id, updates) {
  const goal = store.get(id);
  if (!goal) return null;
  const updated = { ...goal, ...updates, updatedAt: new Date().toISOString() };
  store.save(updated);
  return updated;
}

export function deleteGoal(id) {
  store.delete(id);
}

export function getGoal(id) {
  return store.get(id);
}

export function getAllGoals() {
  return store.getAll();
}

export function getActiveGoals() {
  return store.getAll().filter((g) => g.status === 'Active');
}

export function getCompletedGoals() {
  return store.getAll().filter((g) => g.status === 'Completed');
}

export function completeGoal(id) {
  return updateGoal(id, { status: 'Completed', progress: 100 });
}

export function reactivateGoal(id) {
  return updateGoal(id, { status: 'Active' });
}

// Progress = weighted average of milestone completion (70%) + linked task completion (30%)
export function recalculateProgress(goalId, allTasks) {
  const goal = store.get(goalId);
  if (!goal || goal.status === 'Completed') return goal;

  const milestoneScore = goal.milestones.length > 0
    ? (goal.milestones.filter((m) => m.completed).length / goal.milestones.length) * 70
    : 0;

  const linkedTasks = allTasks.filter((t) => goal.taskIds.includes(t.id));
  const taskScore = linkedTasks.length > 0
    ? (linkedTasks.filter((t) => t.status === 'Completed').length / linkedTasks.length) * 30
    : goal.milestones.length > 0 ? 0 : 0;

  const progress = Math.min(100, Math.round(milestoneScore + taskScore));
  return updateGoal(goalId, { progress });
}

export function addMilestone(goalId, name) {
  const goal = store.get(goalId);
  if (!goal) return null;
  const milestone = { id: `ms_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name, completed: false };
  const updated = { ...goal, milestones: [...goal.milestones, milestone], updatedAt: new Date().toISOString() };
  store.save(updated);
  return updated;
}

export function toggleMilestone(goalId, milestoneId) {
  const goal = store.get(goalId);
  if (!goal) return null;
  const milestones = goal.milestones.map((m) =>
    m.id === milestoneId ? { ...m, completed: !m.completed } : m
  );
  const updated = { ...goal, milestones, updatedAt: new Date().toISOString() };
  store.save(updated);
  return updated;
}

export function removeMilestone(goalId, milestoneId) {
  const goal = store.get(goalId);
  if (!goal) return null;
  const updated = { ...goal, milestones: goal.milestones.filter((m) => m.id !== milestoneId), updatedAt: new Date().toISOString() };
  store.save(updated);
  return updated;
}

export function linkTaskToGoal(goalId, taskId) {
  const goal = store.get(goalId);
  if (!goal || goal.taskIds.includes(taskId)) return goal;
  const updated = { ...goal, taskIds: [...goal.taskIds, taskId], updatedAt: new Date().toISOString() };
  store.save(updated);
  return updated;
}

export function unlinkTaskFromGoal(goalId, taskId) {
  const goal = store.get(goalId);
  if (!goal) return null;
  const updated = { ...goal, taskIds: goal.taskIds.filter((id) => id !== taskId), updatedAt: new Date().toISOString() };
  store.save(updated);
  return updated;
}
