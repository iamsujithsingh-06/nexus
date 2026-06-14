/**
 * Extraction Prompt Templates for AI-powered memory extraction.
 *
 * These prompts are sent to the AI model after each conversation turn to
 * extract structured memories from the conversation.
 */

const EXTRACTION_SYSTEM_PROMPT = `You are a memory extraction system for an AI companion. Your job is to analyze conversations and extract structured memories about the user.

Extract ONLY information that is:
1. Explicitly stated or clearly implied by the user
2. Factual and specific (not vague or generic)
3. Relevant to understanding the user as a person

Categories of information to extract:

- **profile**: Personal information (name, role, company, location, skills, experience level)
- **goal**: Goals, objectives, aspirations, things they want to achieve
- **preference**: Likes, dislikes, preferences (tools, languages, topics, styles)
- **project**: Current or past projects they're working on
- **interest**: Topics they're curious about, want to learn, enjoy discussing
- **insight**: Inferences about their working style, personality, communication patterns (with lower confidence)
- **fact**: A confirmed fact that doesn't fit other categories

Rules:
1. Only extract if confidence > 0.5. If unsure, don't extract.
2. Do NOT extract information the assistant said — only what the user said or clearly implied.
3. For "profile" and "fact", require high confidence (explicit statements).
4. For "insight", always include evidence from the conversation.
5. Return valid JSON only. No markdown, no explanations.
6. If nothing to extract, return { "memories": [] }`;

function buildExtractionPrompt(userMessage, assistantResponse, existingMemories = []) {
  const existingContext = existingMemories.length > 0
    ? `\nAlready known about this user:\n${JSON.stringify(existingMemories.slice(0, 10), null, 2)}`
    : '';

  return [
    {
      role: 'system',
      content: EXTRACTION_SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: `Extract memories from this conversation exchange:

User: ${userMessage}
Assistant: ${assistantResponse}${existingContext}

Respond with ONLY a JSON object: { "memories": [{ "type": "...", "value": { ... }, "confidence": 0.0-1.0, "source": "explicit|inference" }] }`,
    },
  ];
}

/**
 * Build a prompt to consolidate two potentially related memories.
 */
function buildConsolidationPrompt(memoryA, memoryB) {
  return [
    {
      role: 'system',
      content: `You are a memory consolidation system. Two memories may be related or contradictory. 
Determine if they refer to the same thing, and if so, what the merged version should be.
Return valid JSON only.`,
    },
    {
      role: 'user',
      content: `Memory A: ${JSON.stringify(memoryA)}
Memory B: ${JSON.stringify(memoryB)}

Are these about the same thing? If yes, provide the merged version.

Respond with ONLY: { "same": true|false, "merged": { ... } | null }`,
    },
  ];
}

module.exports = {
  EXTRACTION_SYSTEM_PROMPT,
  buildExtractionPrompt,
  buildConsolidationPrompt,
};
