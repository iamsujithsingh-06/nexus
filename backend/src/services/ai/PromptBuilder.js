/**
 * PromptBuilder — builds the full system prompt dynamically.
 *
 * Constructs a structured system prompt including:
 *   - Agent role / persona
 *   - User context (profile, goals, tasks, learning, projects)
 *   - Relevant memories
 *   - Response rules based on intent
 *
 * Designed so new AI agents can inject their own role and rules
 * without modifying core code.
 */

const BASE_ROLE = `You are Nexus — a focused, intelligent personal AI operating system. You help users achieve their goals, learn new skills, manage projects, and stay productive. You are direct, practical, and avoid unnecessary fluff.`;

const RESPONSE_RULES = [
  'Keep responses concise and actionable',
  'Use bullet points or numbered lists when presenting multiple items',
  'For advice: give specific, practical steps — not generic encouragement',
  'For knowledge: be accurate, cite principles not opinions',
  'For analysis: consider pros/cons, alternatives, and trade-offs',
  'For planning: propose a clear sequence of next actions',
  'NEVER make up facts about the user — only mention information from the provided context',
  'If you lack context about something, say so rather than guess',
];

const INTENT_INSTRUCTIONS = {
  greeting: 'Respond warmly and briefly. Ask how you can help today.',
  goal_related: 'Help the user define, refine, or track their goals. Be specific and structured.',
  task_related: 'Help organize, prioritize, or track tasks. Be practical.',
  learning: 'Suggest learning resources and paths. Focus on actionable next steps.',
  project: 'Provide project guidance, architecture advice, or implementation steps.',
  career: 'Offer career advice, skill gap analysis, or job search strategies.',
  personal: 'Be empathetic and supportive. Offer practical suggestions.',
  knowledge: 'Provide clear, accurate explanations. Use examples where helpful.',
  analysis: 'Provide structured analysis with evidence and reasoning.',
  planning: 'Help create actionable plans with clear timelines.',
  motivational: 'Be encouraging and empathetic. Offer perspective and actionable reassurance.',
  general: 'Be helpful and conversational. Ask clarifying questions when needed.',
};

function buildSystemPrompt(intent, userProfile) {
  const intentInstruction = INTENT_INSTRUCTIONS[intent] || INTENT_INSTRUCTIONS.general;

  const parts = [
    BASE_ROLE,
    '',
    '## Instructions',
    intentInstruction,
    '',
    ...RESPONSE_RULES.map((r, i) => `${i + 1}. ${r}`),
  ];

  if (userProfile && userProfile.communicationStyle) {
    parts.push('', `## Communication Preference`, `The user prefers a ${userProfile.communicationStyle} communication style.`);
  }

  parts.push('', '## Context');
  parts.push('Below is the relevant user context followed by the user\'s message. Use this context to personalize your response.');

  return parts.join('\n');
}

function buildFullPrompt(systemPrompt, contextString, userMessage) {
  return {
    systemPrompt,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: contextString || userMessage },
    ],
  };
}

module.exports = { buildSystemPrompt, buildFullPrompt, INTENT_INSTRUCTIONS };
