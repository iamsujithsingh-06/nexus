const geminiConfig = require('../config/gemini');
const AppError = require('../utils/AppError');
const { getPrompt } = require('../prompts');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_RETRIES_PER_MODEL = 2;
const GEMINI_TIMEOUT_MS = 45000;

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms: ${label}`)), ms)
    ),
  ]);
}

function extractQuotaInfo(error) {
  const info = { violations: [], retryDelay: null };

  if (error.errorDetails && Array.isArray(error.errorDetails)) {
    for (const detail of error.errorDetails) {
      if (detail.violations) {
        for (const v of detail.violations) {
          info.violations.push({
            quotaMetric: v.quotaMetric || 'unknown',
            quotaId: v.quotaId || '',
            dimensions: v.quotaDimensions || {},
          });
        }
      }
      if (detail.retryDelay) {
        info.retryDelay = detail.retryDelay;
      }
    }
  }

  return info;
}

function dumpErrorProperties(error) {
  const props = {};
  for (const key of Object.getOwnPropertyNames(error)) {
    try {
      props[key] = error[key];
    } catch {
      props[key] = '<unreadable>';
    }
  }
  return props;
}

function isModelSpecificError(error) {
  const status = error.status || error.statusCode || 0;

  if (status === 401 || status === 403) {
    return { fallback: false };
  }

  return { fallback: true };
}

async function generateWithModel(userMessage, history, modelName, systemPrompt, reqId = '?') {
  const effectivePrompt = systemPrompt || getPrompt('system');

  const model = geminiConfig.getGeminiModel(effectivePrompt, modelName);

  const MAX_CONTEXT_MESSAGES = 40;

  const convertedHistory = history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const limitedHistory = convertedHistory.slice(-MAX_CONTEXT_MESSAGES);

  console.log('[DEBUG] === GEMINI SERVICE: FINAL FORMATTED HISTORY ===');
  console.log('[DEBUG] Model:', modelName);
  console.log('[DEBUG] Raw history count (from executor):', history.length);
  console.log('[DEBUG] Converted history count (after role filter):', convertedHistory.length);
  console.log('[DEBUG] Limited history count (after slice):', limitedHistory.length);
  console.log('[DEBUG] MAX_CONTEXT_MESSAGES:', MAX_CONTEXT_MESSAGES);
  console.log('[DEBUG] Formatted history:', JSON.stringify(limitedHistory, null, 2));
  console.log('[DEBUG] Current user prompt:', userMessage);

  let result;
  if (limitedHistory.length > 0) {
    console.log('[DEBUG] → Calling chat.sendMessage() with history');
    const chat = model.startChat({ history: limitedHistory });
    result = await withTimeout(chat.sendMessage(userMessage), GEMINI_TIMEOUT_MS, `chat.sendMessage(${modelName})`);
  } else {
    console.log('[DEBUG] → Calling model.generateContent() (no history)');
    result = await withTimeout(model.generateContent(userMessage), GEMINI_TIMEOUT_MS, `generateContent(${modelName})`);
  }

  const response = result.response;
  const text = response.text();

  return text;
}

exports.generateAIResponse = async (userMessage, history = [], systemPrompt, reqId = '?') => {
  const modelChain = geminiConfig.MODEL_FALLBACK_CHAIN;
  const attemptedModels = [];
  let lastError = null;

  for (const modelName of modelChain) {
    attemptedModels.push(modelName);

    for (let attempt = 1; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
      try {
        const text = await generateWithModel(userMessage, history, modelName, systemPrompt, reqId);
        return text;
      } catch (error) {
        lastError = error;

        const statusCode = error.status || error.statusCode || error.code;
        const statusText = error.statusText || '';
        const errorMessage = error.message || String(error);

        console.error(`[Gemini] ✗ Attempt ${attempt}/${MAX_RETRIES_PER_MODEL} on "${modelName}" — [${statusCode}] ${errorMessage}`);

        const quotaInfo = extractQuotaInfo(error);
        if (quotaInfo.violations.length > 0) {
          console.error(`[Gemini] Quota violations on "${modelName}":`);
          quotaInfo.violations.forEach((v) => {
            console.error(`  Metric: ${v.quotaMetric} (${v.quotaId})`);
          });
        }

        const { fallback } = isModelSpecificError(error);

        if (!fallback) {
          console.error(`[Gemini] Non-retryable error on "${modelName}". Aborting fallback chain.`);
          const err = new AppError(errorMessage, statusCode || 503);
          err.originalError = error;
          err.googleStatus = statusCode;
          err.googleStatusText = statusText;
          err.googleErrorDetails = error.errorDetails;
          err.googleFullMessage = errorMessage;
          throw err;
        }

        if (statusCode === 429 && attempt < MAX_RETRIES_PER_MODEL) {
          const backoffMs = 2000 * attempt;
          console.log(`[Gemini] 429 on "${modelName}", backing off ${backoffMs}ms (attempt ${attempt}/${MAX_RETRIES_PER_MODEL})`);
          await sleep(backoffMs);
          continue;
        }

        if (attempt < MAX_RETRIES_PER_MODEL) {
          await sleep(attempt * 500);
          continue;
        }

        console.log(`[Gemini] Model "${modelName}" exhausted after ${MAX_RETRIES_PER_MODEL} attempts.`);
      }
    }
  }

  const lastStatus = lastError.status || lastError.statusCode || lastError.code;
  const lastMessage = lastError.message || String(lastError);
  console.error(`[Gemini] ✗ All models exhausted: [${attemptedModels.join(' → ')}]. Last: [${lastStatus}] ${lastMessage}`);

  const err = new AppError(lastMessage, lastStatus || 503);
  err.originalError = lastError;
  err.googleStatus = lastStatus;
  err.googleStatusText = lastError.statusText;
  err.googleErrorDetails = lastError.errorDetails;
  err.googleFullMessage = lastMessage;

  const quotaInfo = extractQuotaInfo(lastError);
  if (quotaInfo.violations.length > 0) {
    err.googleQuotaViolations = quotaInfo.violations;
    err.googleRetryDelay = quotaInfo.retryDelay;
  }
  err.attemptedModels = attemptedModels;

  throw err;
};
