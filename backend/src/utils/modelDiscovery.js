const https = require('https');

const FALLBACK_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-pro',
];

async function fetchJson(url, apiKey) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { 'x-goog-api-key': apiKey } },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function discoverModels(apiKey) {
  if (!apiKey) {
    console.log('[ModelDiscovery] No API key provided, using fallback models');
    return { source: 'fallback (no key)', models: FALLBACK_MODELS };
  }

  try {
    console.log('[ModelDiscovery] Fetching available models from Gemini API...');
    const result = await fetchJson(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
      apiKey
    );

    if (result.status !== 200) {
      console.error(`[ModelDiscovery] API returned status ${result.status}`);
      if (typeof result.body === 'object') {
        console.error(`[ModelDiscovery] Error:`, JSON.stringify(result.body));
        const errMsg = result.body?.error?.message || result.body?.message || '';
        if (errMsg) {
          console.error(`[ModelDiscovery] Google error message: "${errMsg}"`);
        }
      } else {
        console.error(`[ModelDiscovery] Response body:`, String(result.body).substring(0, 500));
      }
      console.log('[ModelDiscovery] Falling back to hardcoded model list');
      return { source: `fallback (API ${result.status})`, models: FALLBACK_MODELS };
    }

    const models = result.body.models || [];
    if (models.length === 0) {
      console.log('[ModelDiscovery] API returned 200 but no models in response');
      return { source: 'fallback (empty response)', models: FALLBACK_MODELS };
    }

    const generateModels = models.filter(
      (m) =>
        m.supportedGenerationMethods &&
        m.supportedGenerationMethods.includes('generateContent')
    );

    console.log(`[ModelDiscovery] API returned ${models.length} total models, ${generateModels.length} support generateContent`);

    generateModels.forEach((m) => {
      const shortName = m.name.replace('models/', '');
      const methods = (m.supportedGenerationMethods || []).join(', ');
      console.log(`  ✓ ${shortName} [${methods}]`);
    });

    models
      .filter((m) => !m.supportedGenerationMethods?.includes('generateContent'))
      .forEach((m) => {
        const shortName = m.name.replace('models/', '');
        console.log(`  - ${shortName} [no generateContent]`);
      });

    const displayNames = generateModels.map((m) => m.name.replace('models/', ''));
    return { source: 'API', models: displayNames.length > 0 ? displayNames : FALLBACK_MODELS };
  } catch (error) {
    console.error(`[ModelDiscovery] Network error: "${error.message}"`);
    console.log('[ModelDiscovery] Falling back to hardcoded model list');
    return { source: 'fallback (network error)', models: FALLBACK_MODELS };
  }
}

module.exports = { discoverModels, FALLBACK_MODELS };
