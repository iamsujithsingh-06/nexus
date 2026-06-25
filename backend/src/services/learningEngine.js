const aiService = require('./aiService');

const DEFAULT_MODEL = 'deepseek/deepseek-chat-v3';

const ROADMAP_PROMPT = `You are a senior curriculum designer. Generate a detailed learning roadmap as JSON.

Input: { "title": "...", "category": "...", "difficulty": "beginner|intermediate|advanced|expert" }

Output a JSON object (NO markdown, NO code fences, pure JSON):
{
  "estimatedHours": <number>,
  "roadmap": ["Phase 1: ...", "Phase 2: ...", ...],
  "topics": [
    { "title": "...", "description": "...", "difficulty": "...", "estimatedHours": <number>, "order": <number> }
  ],
  "milestones": [
    { "title": "...", "order": <number> }
  ]
}

Generate 8-15 topics with progressive difficulty. Each phase in roadmap is a high-level stage. Milestones are key checkpoints (every 3-4 topics).`;

const RECOMMENDATION_PROMPT = `You are a personal learning mentor. Given a student's learning state (as JSON), generate 3-5 personalized recommendations as a JSON array.

Input: {
  "currentTopics": [{ "title": "...", "status": "in_progress", "confidence": 0-100 }],
  "completedTopics": ["..."],
  "pendingTopics": ["..."],
  "totalProgress": 0-100,
  "goals": ["..."],
  "weakAreas": ["..."]
}

Output a JSON array (NO markdown, NO code fences, pure JSON):
[
  { "type": "continue|practice|review|explore|focus", "title": "...", "description": "...", "priority": "high|medium|low" }
]

Be specific. Reference actual topic names. Suggest concrete actions.`;

const CONTINUE_PROMPT = `You are a learning continuity engine. Given a user's learning progress and their request, determine the exact next action.

Input: {
  "request": "...",
  "pathTitle": "...",
  "lastTopic": { "title": "...", "status": "...", "confidence": 0-100 } | null,
  "completedTopics": ["..."],
  "inProgressTopics": ["..."],
  "remainingTopics": ["..."],
  "progress": 0-100
}

Output JSON (NO markdown, NO code fences, pure JSON):
{
  "action": "continue|practice|review|start",
  "topicTitle": "...",
  "context": "Brief explanation of where user left off and what to do next",
  "estimatedMinutes": <number>,
  "suggestedFocus": "..."
}`;

async function generateRoadmap(title, category, difficulty) {
  const prompt = ROADMAP_PROMPT + `\n\nInput: ${JSON.stringify({ title, category, difficulty })}`;
  try {
    const response = await aiService.generateAIResponse(prompt, [], null, 'learning-roadmap');
    const json = JSON.parse(response.replace(/```json|```/g, '').trim());
    return json;
  } catch (err) {
    console.error('[LearningEngine] Roadmap generation failed:', err.message);
    return generateFallbackRoadmap(title, category, difficulty);
  }
}

async function generateRecommendations(state) {
  const prompt = RECOMMENDATION_PROMPT + `\n\nInput: ${JSON.stringify(state)}`;
  try {
    const response = await aiService.generateAIResponse(prompt, [], null, 'learning-recommendations');
    const json = JSON.parse(response.replace(/```json|```/g, '').trim());
    return Array.isArray(json) ? json : [];
  } catch (err) {
    console.error('[LearningEngine] Recommendation generation failed:', err.message);
    return [];
  }
}

async function generateContinueContext(request, pathTitle, state) {
  const prompt = CONTINUE_PROMPT + `\n\nInput: ${JSON.stringify({ request, pathTitle, ...state })}`;
  try {
    const response = await aiService.generateAIResponse(prompt, [], null, 'learning-continue');
    const json = JSON.parse(response.replace(/```json|```/g, '').trim());
    return json;
  } catch (err) {
    console.error('[LearningEngine] Continue context generation failed:', err.message);
    return {
      action: 'continue',
      topicTitle: state.remainingTopics?.[0] || state.lastTopic?.title || pathTitle,
      context: `Continue learning ${pathTitle}. You have completed ${state.completedTopics?.length || 0} topics.`,
      estimatedMinutes: 30,
      suggestedFocus: state.remainingTopics?.[0] || 'next topic',
    };
  }
}

function generateFallbackRoadmap(title, category, difficulty) {
  const topicCount = difficulty === 'beginner' ? 8 : difficulty === 'intermediate' ? 10 : 12;
  const topics = [];
  for (let i = 1; i <= topicCount; i++) {
    topics.push({
      title: `${title} — Topic ${i}`,
      description: `Learn about ${title} part ${i}`,
      difficulty: i <= topicCount / 3 ? 'beginner' : i <= (topicCount * 2) / 3 ? 'intermediate' : 'advanced',
      estimatedHours: 2,
      order: i,
    });
  }
  const milestoneCount = Math.ceil(topicCount / 4);
  const milestones = [];
  for (let i = 0; i < milestoneCount; i++) {
    milestones.push({ title: `Milestone ${i + 1}: Complete topics ${i * 4 + 1}-${Math.min((i + 1) * 4, topicCount)}`, order: i + 1 });
  }
  return {
    estimatedHours: topicCount * 2,
    roadmap: ['Introduction', 'Core Concepts', 'Intermediate Topics', 'Advanced Topics', 'Mastery'],
    topics,
    milestones,
  };
}

module.exports = { generateRoadmap, generateRecommendations, generateContinueContext };
