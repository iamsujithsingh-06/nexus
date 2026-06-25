/**
 * AIBrain — single entry point before every LLM request.
 *
 * Flow:
 *   1. Classify user intent (IntentClassifier)
 *   2. Retrieve relevant context in parallel (Memory, Goal, Task, Learning, Project, Conversation)
 *   3. Build user profile from memories
 *   4. Merge everything into a single optimized context string (ContextBuilder)
 *   5. Return { enrichedContent, intent, profile, metadata }
 *
 * Designed so new AI agents (Career, Finance, Fitness, etc.) can inject
 * their own retrievers and context without modifying core code.
 */

const IntentClassifier = require('./IntentClassifier');
const MemoryRetriever = require('./MemoryRetriever');
const GoalRetriever = require('./GoalRetriever');
const TaskRetriever = require('./TaskRetriever');
const LearningRetriever = require('./LearningRetriever');
const ProjectRetriever = require('./ProjectRetriever');
const CoachRetriever = require('./CoachRetriever');
const ConversationRetriever = require('./ConversationRetriever');
const ContextBuilder = require('./ContextBuilder');
const MemoryExtractor = require('./MemoryExtractor');
const ResponseValidator = require('./ResponseValidator');
const CacheManager = require('./CacheManager');

const MemoryEngine = require('../../memory/engine/MemoryEngine');

/**
 * Build a user profile from memory system.
 */
async function buildUserProfile(userId, memories) {
  const profile = {};

  try {
    // Try MemoryEngine for rich profile (v2)
    const engineProfile = await MemoryEngine.getProfileSummary(userId);
    if (engineProfile) {
      if (engineProfile.name) profile.name = engineProfile.name;
      if (engineProfile.role) profile.role = engineProfile.role;
      if (engineProfile.company) profile.company = engineProfile.company;
      if (engineProfile.location) profile.location = engineProfile.location;
    }

    // Supplement with inline memories (for already-loaded context)
    if (memories && memories.length > 0) {
      for (const m of memories) {
        if (m.type === 'user_profile' || m.type === 'profile') {
          const val = m.value || {};
          if (val.name && !profile.name) profile.name = val.name;
          if (val.communicationStyle && !profile.communicationStyle) profile.communicationStyle = val.communicationStyle;
          if (val.experienceLevel && !profile.experienceLevel) profile.experienceLevel = val.experienceLevel;
        }
      }
    }
  } catch { /* silent */ }

  return profile;
}

class AIBrain {
  /**
   * Process a user message through the AI Brain pipeline.
   *
   * @param {string} userId - MongoDB ObjectId of the user
   * @param {string} message - The raw user message
   * @param {Array} [history] - Recent conversation history
   * @param {Object} [options] - Optional overrides
   * @returns {Object} { enrichedContent, intent, profile, memoryResult, metadata }
   */
  async process(userId, message, history = [], options = {}) {
    const start = Date.now();
    const metadata = { steps: {} };

    // Step 1: Classify intent
    const intentStart = Date.now();
    const classification = IntentClassifier.classify(message);
    metadata.steps.classify = Date.now() - intentStart;

    // Step 2: Retrieve all context in parallel
    const retrieveStart = Date.now();
    const retrievers = {
      memories: options.memories || MemoryRetriever.retrieve(userId, message),
      goals: options.goals || GoalRetriever.retrieve(userId),
      tasks: options.tasks || TaskRetriever.retrieve(userId),
      learning: options.learning || LearningRetriever.retrieve(userId, message),
      projects: options.projects || ProjectRetriever.retrieve(userId),
      coach: options.coach || CoachRetriever.retrieve(userId),
      conversations: options.conversations || ConversationRetriever.retrieve(userId),
    };

    const results = await Promise.allSettled(
      Object.entries(retrievers).map(([key, promise]) =>
        promise.then(value => ({ key, value })).catch(err => ({ key, error: err.message }))
      )
    );

    const context = { memories: [], goals: [], tasks: [], learning: {}, projects: [], coach: {}, conversations: [] };
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value && !result.value.error) {
        const { key, value } = result.value;
        if (key === 'memories' && value.memories) context.memories = value.memories;
        else if (key === 'goals' && value.goals) context.goals = value.goals;
        else if (key === 'tasks' && value.tasks) context.tasks = value.tasks;
        else if (key === 'learning') context.learning = value;
        else if (key === 'projects' && value.projects) context.projects = value.projects;
        else if (key === 'coach') context.coach = value;
        else if (key === 'conversations' && value.conversations) context.conversations = value.conversations;
      }
    }
    metadata.steps.retrieve = Date.now() - retrieveStart;

    // Step 3: Build user profile
    const profileStart = Date.now();
    const userProfile = await buildUserProfile(userId, context.memories);
    metadata.steps.profile = Date.now() - profileStart;

    // Step 4: Build context string
    const contextStart = Date.now();
    const contextString = ContextBuilder.buildContext(
      classification,
      context.memories,
      context.goals,
      context.tasks,
      context.learning,
      context.projects,
      context.conversations,
      userProfile,
      context.coach
    );
    const enrichedContent = ContextBuilder.serialize(contextString, message);
    metadata.steps.context = Date.now() - contextStart;

    // Step 5: Extract memory (if storable)
    let memoryResult = null;
    if (classification.intent !== 'greeting') {
      memoryResult = await MemoryExtractor.extract(userId, message, classification.intent);
    }

    metadata.total = Date.now() - start;

    return {
      enrichedContent,
      intent: classification.intent,
      classification,
      userProfile,
      memoryResult,
      metadata,
      rawContext: context,
    };
  }
}

module.exports = new AIBrain();
