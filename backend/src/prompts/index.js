const {
  NEXUS_SYSTEM_PROMPT,
  PLANNER_PROMPT,
  ANALYZER_PROMPT,
  EXECUTOR_PROMPT,
  REVIEWER_PROMPT,
  getResponseFormatInstructions,
} = require('./systemPrompts');

const PROMPT_CATEGORIES = {
  system: { prompt: NEXUS_SYSTEM_PROMPT, description: 'Main Nexus AI system prompt' },
  planner: { prompt: PLANNER_PROMPT, description: 'Agent: request planner' },
  analyzer: { prompt: ANALYZER_PROMPT, description: 'Agent: requirement analyzer' },
  executor: { prompt: EXECUTOR_PROMPT, description: 'Agent: solution executor' },
  reviewer: { prompt: REVIEWER_PROMPT, description: 'Agent: output reviewer' },
};

function getPrompt(name) {
  const entry = PROMPT_CATEGORIES[name];
  if (!entry) {
    console.warn(`[Prompts] Unknown prompt "${name}", returning default system prompt`);
    return NEXUS_SYSTEM_PROMPT;
  }
  return entry.prompt;
}

function getSystemPromptWithContext(userContext, formatType) {
  let prompt = NEXUS_SYSTEM_PROMPT;

  if (userContext) {
    prompt += `\n\n## User Context\n${userContext}`;
  }

  const formatInstructions = getResponseFormatInstructions(formatType);
  if (formatInstructions) {
    prompt += `\n\n## Response Format Instructions\n${formatInstructions}`;
  }

  return prompt;
}

module.exports = {
  getPrompt,
  getSystemPromptWithContext,
  PROMPT_CATEGORIES,
};
