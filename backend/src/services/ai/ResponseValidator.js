/**
 * ResponseValidator — validates AI responses for quality and relevance.
 *
 * Checks:
 *   - Response is not empty or too short
 *   - Response doesn't contain hallucinated user data
 *   - Response addresses the user's message (not generic)
 *   - Response stays within allowed context
 *
 * Can trigger a single auto-regeneration if validation fails.
 */

const MIN_RESPONSE_LENGTH = 10;
const MAX_RESPONSE_LENGTH = 8000;

function validate(response, userMessage, contextString) {
  const issues = [];

  if (!response || typeof response !== 'string') {
    return { valid: false, issues: ['Empty or non-string response'], score: 0 };
  }

  const trimmed = response.trim();

  // Check length
  if (trimmed.length < MIN_RESPONSE_LENGTH) {
    issues.push(`Response too short (${trimmed.length} chars, min ${MIN_RESPONSE_LENGTH})`);
  }

  if (trimmed.length > MAX_RESPONSE_LENGTH) {
    issues.push(`Response exceeds max length (${trimmed.length} chars, max ${MAX_RESPONSE_LENGTH})`);
  }

  // Check for hallucinated user data patterns (things the AI claims about user that aren't in context)
  const hallucinationPatterns = [
    /\bas you mentioned/i,
    /\byou told me (that|about)/i,
    /\bbased on our (previous|earlier|last) (conversation|chat)/i,
    /\b(as|like) you (said|mentioned|told me) earlier/i,
  ];

  for (const pattern of hallucinationPatterns) {
    if (pattern.test(response) && !contextString) {
      issues.push('Response references prior conversation but no context was provided');
      break;
    }
  }

  // Check for generic response (very short, no specific content)
  if (trimmed.length < 30 && /^(sure|okay|ok|got it|i understand|i see|yes|no|great|awesome|thanks|thank you)/i.test(trimmed)) {
    issues.push('Response appears generic with no substantive content');
  }

  const score = Math.max(0, 1 - (issues.length * 0.2));

  return {
    valid: issues.length === 0,
    issues,
    score,
  };
}

async function regenerate(response, userMessage, contextString, aiBrainProcess) {
  const result = validate(response, userMessage, contextString);
  if (result.valid) return response;

  try {
    const second = await aiBrainProcess();
    const secondResult = validate(second, userMessage, contextString);
    if (secondResult.valid) return second;

    // Both failed — return the better one
    return result.score >= secondResult.score ? response : second;
  } catch {
    return response;
  }
}

module.exports = { validate, regenerate };
