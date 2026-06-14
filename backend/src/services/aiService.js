/**
 * AI Service — Unified interface for AI model calls via OpenRouter.
 *
 * Uses the OpenAI SDK pointed at OpenRouter's API endpoint so any model
 * available on OpenRouter can be used by changing the `model` string.
 *
 * Environment variables:
 *   OPENROUTER_API_KEY  (required) — API key from openrouter.ai/keys
 *   OPENROUTER_MODEL    (optional) — Model identifier, default: deepseek/deepseek-chat-v3
 */

const OpenAI = require('openai');
const AppError = require('../utils/AppError');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DEFAULT_MODEL = 'deepseek/deepseek-chat-v3';
const TIMEOUT_MS = 60000;
const MAX_RETRIES = 3;
const BASE_URL = 'https://openrouter.ai/api/v1';

// ---------------------------------------------------------------------------
// OpenAI client (lazy-initialised so missing key only fails on first call)
// ---------------------------------------------------------------------------

let _client = null;

function getClient() {
  if (_client) return _client;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not set. ' +
      'Add it to your .env file: OPENROUTER_API_KEY=sk-or-...'
    );
  }

  _client = new OpenAI({
    baseURL: BASE_URL,
    apiKey,
    defaultHeaders: {
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:5173',
      'X-Title': 'NEXUS',
    },
  });

  console.log(`[AIService] OpenAI client initialised (base: ${BASE_URL})`);
  return _client;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Race a promise against a timeout so we don't hang forever.
 */
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms: ${label}`)), ms)
    ),
  ]);
}

/**
 * Build the messages array in OpenAI / OpenRouter format.
 *
 * Order: system prompt → conversation history → current user message.
 */
function buildMessages(userMessage, history, systemPrompt) {
  const messages = [];

  // 1. System prompt (personality / instructions)
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  // 2. Conversation history — keep only user and assistant turns
  const filtered = (history || []).filter(
    (m) => m.role === 'user' || m.role === 'assistant' || m.role === 'system'
  );
  for (const msg of filtered) {
    messages.push({ role: msg.role === 'assistant' ? 'assistant' : msg.role, content: msg.content });
  }

  // 3. Current user message
  messages.push({ role: 'user', content: userMessage });

  return messages;
}

// ---------------------------------------------------------------------------
// Exported API
// ---------------------------------------------------------------------------

/**
 * Send a message to the AI model and return the text response.
 *
 * @param {string}  userMessage   - The current user prompt
 * @param {Array}   [history=[]]  - Prior messages [{ role, content }, ...]
 * @param {string}  [systemPrompt] - System-level instructions
 * @param {string}  [reqId='?']   - Request identifier for logging
 * @returns {Promise<string>}
 * @throws {AppError} On non-retryable failures or after exhausting retries
 */
async function generateAIResponse(userMessage, history = [], systemPrompt, reqId = '?') {
  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const messages = buildMessages(userMessage, history, systemPrompt);

  console.log(`[AI:${reqId}] Request — model: ${model}, history: ${history.length} msgs, message: ${userMessage.substring(0, 80)}...`);

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const client = getClient();

      const completion = await withTimeout(
        client.chat.completions.create({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 8192,
        }),
        TIMEOUT_MS,
        `chat.completions(${model}) attempt ${attempt}`
      );

      // Validate the response structure
      const choice = completion.choices?.[0];
      const content = choice?.message?.content;

      if (!content || typeof content !== 'string') {
        throw new Error('AI returned an empty or malformed response');
      }

      const finishReason = choice.finish_reason;
      if (finishReason === 'length') {
        console.warn(`[AI:${reqId}] Response may be truncated (finish_reason: length)`);
      }

      console.log(`[AI:${reqId}] ✓ Response — ${content.length} chars, finish_reason: ${finishReason}`);
      return content;
    } catch (error) {
      lastError = error;

      // If the client itself failed to init (no API key), don't retry
      if (error.message && error.message.includes('OPENROUTER_API_KEY is not set')) {
        throw new AppError(error.message, 503);
      }

      const statusCode = error.status || error.statusCode || error.code;
      const errorMessage = error.message || String(error);

      console.error(`[AI:${reqId}] ✗ Attempt ${attempt}/${MAX_RETRIES} — [${statusCode}] ${errorMessage}`);

      // --- Non-retryable errors ---
      if (statusCode === 401 || statusCode === 403) {
        throw new AppError(`AI authentication failed. Check your OPENROUTER_API_KEY.`, statusCode);
      }

      if (errorMessage && errorMessage.includes('Insufficient') && errorMessage.includes('quota')) {
        throw new AppError('OpenRouter account has insufficient credits. Please top up your account.', 402);
      }

      if (statusCode === 400) {
        throw new AppError(`Invalid AI request: ${errorMessage}`, 400);
      }

      // --- Retryable errors ---
      if (statusCode === 429 && attempt < MAX_RETRIES) {
        const backoffMs = 2000 * attempt;
        console.log(`[AI:${reqId}] Rate limited (429), backing off ${backoffMs}ms`);
        await sleep(backoffMs);
        continue;
      }

      if (attempt < MAX_RETRIES) {
        const backoffMs = attempt * 1000;
        console.log(`[AI:${reqId}] Retrying in ${backoffMs}ms...`);
        await sleep(backoffMs);
        continue;
      }
    }
  }

  // All retries exhausted
  const lastMsg = lastError?.message || 'AI service failed after all retries';
  const lastStatus = lastError?.status || lastError?.statusCode || 503;
  console.error(`[AI:${reqId}] ✗ All ${MAX_RETRIES} attempts exhausted. Last: [${lastStatus}] ${lastMsg}`);
  throw new AppError(lastMsg, lastStatus);
}

/**
 * Simple health check — verifies the API key is present and the client can be built.
 * Does NOT call the API.
 */
function isConfigured() {
  try {
    getClient();
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  generateAIResponse,
  isConfigured,
};
