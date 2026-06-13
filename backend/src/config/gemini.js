const { GoogleGenerativeAI } = require('@google/generative-ai');
const { discoverModels } = require('../utils/modelDiscovery');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('[GeminiConfig] GEMINI_API_KEY is not set in environment variables');
} else {
  console.log(`[GeminiConfig] API key loaded: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)} (length: ${apiKey.length})`);
}

const genAI = new GoogleGenerativeAI(apiKey);

const PRIMARY_MODEL = 'gemini-2.5-flash-lite';
const MODEL_FALLBACK_CHAIN = [
  'gemini-2.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-2.0-flash',
];

let MODEL_NAME = process.env.GEMINI_MODEL || PRIMARY_MODEL;

if (!MODEL_NAME || MODEL_NAME === 'undefined' || MODEL_NAME === 'null') {
  console.warn(`[GeminiConfig] Invalid MODEL_NAME "${MODEL_NAME}", using primary: ${PRIMARY_MODEL}`);
  MODEL_NAME = PRIMARY_MODEL;
}

async function initializeModel() {
  console.log(`[GeminiConfig] Initial model from env/default: "${MODEL_NAME}"`);

  const discovery = await discoverModels(apiKey);
  const availableModels = discovery.models;
  const modelSource = discovery.source;

  console.log(`[GeminiConfig] Model source: ${modelSource}`);
  console.log(`[GeminiConfig] Available model count: ${availableModels.length}`);
  console.log(`[GeminiConfig] Fallback chain: ${MODEL_FALLBACK_CHAIN.join(' → ')}`);

  if (availableModels.includes(MODEL_NAME)) {
    console.log(`[GeminiConfig] Model "${MODEL_NAME}" is available ✓`);
    return MODEL_NAME;
  }

  const chosen = MODEL_FALLBACK_CHAIN.find((m) => availableModels.includes(m));

  if (chosen) {
    console.log(`[GeminiConfig] Switching from "${MODEL_NAME}" to available model: "${chosen}"`);
    MODEL_NAME = chosen;
  } else if (availableModels.length > 0) {
    console.log(`[GeminiConfig] Using first available model: "${availableModels[0]}"`);
    MODEL_NAME = availableModels[0];
  } else {
    console.warn(`[GeminiConfig] No models returned from API, keeping: "${MODEL_NAME}"`);
  }

  console.log(`[GeminiConfig] Active Gemini model: "${MODEL_NAME}"`);

  return MODEL_NAME;
}

const getGeminiModel = (systemInstruction, modelName) => {
  const modelToUse = modelName || MODEL_NAME || PRIMARY_MODEL;

  if (!modelToUse || modelToUse === 'undefined' || modelToUse === 'null') {
    const safeModel = PRIMARY_MODEL;
    console.error(`[GeminiConfig] CRITICAL: model is "${modelToUse}", forcing hardcoded fallback: "${safeModel}"`);
    return genAI.getGenerativeModel({ model: safeModel, systemInstruction });
  }

  console.log(`[GeminiConfig] Creating model instance: "${modelToUse}"${systemInstruction ? ' with systemInstruction' : ''}`);
  const config = { model: modelToUse };
  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }
  return genAI.getGenerativeModel(config);
};

module.exports = {
  genAI,
  getGeminiModel,
  MODEL_FALLBACK_CHAIN,
  get modelName() { return MODEL_NAME; },
  initializeModel,
};
