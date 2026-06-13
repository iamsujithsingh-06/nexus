const geminiConfig = require('../config/gemini');
const AppError = require('../utils/AppError');

const NEXUS_SYSTEM_PROMPT = `You are NEXUS, a Personal AI Operating System. You are a sophisticated, helpful, and knowledgeable AI assistant. You communicate with clarity, precision, and a touch of cosmic inspiration. You help users with a wide range of tasks including coding, writing, analysis, creative work, and problem-solving.

Core principles:
- Be concise but thorough in your responses
- Use markdown formatting for structured content
- Maintain a professional yet warm tone
- Admit when you don't know something
- Think step by step for complex problems`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_RETRIES_PER_MODEL = 2;

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

  // Auth errors won't be fixed by changing model — bail out immediately
  if (status === 401 || status === 403) {
    return { fallback: false };
  }

  // Any other error is worth trying with a different model
  return { fallback: true };
}

async function generateWithModel(userMessage, history, modelName) {
  console.log(`[Gemini] Model: ${modelName}`);
  console.log(`[Gemini] User message length: ${userMessage.length} chars`);
  console.log(`[Gemini] History messages: ${history.length}`);

  const model = geminiConfig.getGeminiModel(NEXUS_SYSTEM_PROMPT, modelName);

  const convertedHistory = history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  console.log(`[Gemini] Converted history entries: ${convertedHistory.length}`);

  let result;
  if (convertedHistory.length > 0) {
    console.log('[Gemini] Using startChat + sendMessage path');
    const chat = model.startChat({ history: convertedHistory });
    result = await chat.sendMessage(userMessage);
  } else {
    console.log('[Gemini] Using generateContent path (no history)');
    result = await model.generateContent(userMessage);
  }

  const response = result.response;
  const text = response.text();

  console.log(`[Gemini] ✓ Success — response length: ${text.length} chars`);
  console.log(`[Gemini] Response preview: ${text.substring(0, 100)}...`);

  return text;
}

exports.generateAIResponse = async (userMessage, history = []) => {
  const modelChain = geminiConfig.MODEL_FALLBACK_CHAIN;
  const attemptedModels = [];
  let lastError = null;

  for (const modelName of modelChain) {
    attemptedModels.push(modelName);
    console.log(`[Gemini] ═══ Switching to model: "${modelName}" ═══`);

    for (let attempt = 1; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
      try {
        console.log(`[Gemini] Attempt ${attempt}/${MAX_RETRIES_PER_MODEL} on ${modelName}`);
        const text = await generateWithModel(userMessage, history, modelName);
        console.log(`[Gemini] ✓ SUCCESS with model "${modelName}" on attempt ${attempt}`);
        return text;
      } catch (error) {
        lastError = error;

        const statusCode = error.status || error.statusCode || error.code;
        const statusText = error.statusText || '';
        const errorMessage = error.message || String(error);

        console.error(`[Gemini] ✗ Attempt ${attempt}/${MAX_RETRIES_PER_MODEL} FAILED on "${modelName}"`);
        console.error(`[Gemini] Status: ${statusCode} ${statusText}`);
        console.error(`[Gemini] Message: ${errorMessage}`);
        console.error(`[Gemini] Full error object:`, JSON.stringify(dumpErrorProperties(error), null, 2));
        console.error(`[Gemini] Error constructor name: ${error.constructor?.name}`);

        const quotaInfo = extractQuotaInfo(error);
        if (quotaInfo.violations.length > 0) {
          console.error(`[Gemini] QUOTA VIOLATIONS FOUND:`);
          quotaInfo.violations.forEach((v, i) => {
            console.error(`  [${i + 1}] Metric: ${v.quotaMetric}`);
            console.error(`      Quota ID: ${v.quotaId}`);
            if (v.dimensions) {
              console.error(`      Dimensions: ${JSON.stringify(v.dimensions)}`);
            }
          });
          if (quotaInfo.retryDelay) {
            console.error(`[Gemini] Retry delay from Google: ${quotaInfo.retryDelay}`);
          }
        }

        const { fallback } = isModelSpecificError(error);

        if (!fallback) {
          console.error(`[Gemini] Non-retryable error (auth). Aborting all fallback.`);
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
          console.log(`[Gemini] 429 received on "${modelName}". Backing off ${backoffMs}ms before retry ${attempt + 1}`);
          await sleep(backoffMs);
          continue;
        }

        if (attempt < MAX_RETRIES_PER_MODEL) {
          console.log(`[Gemini] Retrying on "${modelName}" in ${attempt * 500}ms...`);
          await sleep(attempt * 500);
          continue;
        }

        console.log(`[Gemini] Model "${modelName}" exhausted (${MAX_RETRIES_PER_MODEL} attempts). Moving to next model.`);
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
