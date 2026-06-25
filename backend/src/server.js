const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const aiService = require('./services/aiService');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const { goalRoutes } = require('./routes/goalRoutes');
const taskRoutes = require('./routes/taskRoutes');
const learningRoutes = require('./routes/learningRoutes');
const projectRoutes = require('./routes/projectRoutes');
const coachRoutes = require('./routes/coachRoutes');
const AppError = require('./utils/AppError');

const memoryManager = require('./memory/manager/memoryManager');
const prompts = require('./prompts');

const app = express();

// TRUST PROXY — required so req.ip resolves to the real client IP behind Vite proxy
app.set('trust proxy', 1);

connectDB();

function extractReqId(req) {
  return req.headers['x-request-id'] || `be-${Date.now()}`;
}

const IS_DEV = process.env.NODE_ENV !== 'production';

const limiter = rateLimit({
  windowMs: IS_DEV ? 60 * 1000 : 15 * 60 * 1000,
  max: IS_DEV ? 300 : 100,
  message: { success: false, message: 'Too many requests, please try again later' },
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.ip || req.socket?.remoteAddress || 'unknown';
  },
  handler: (req, res, _next, options) => {
    const reqId = extractReqId(req);
    console.log(`[RATE_LIMIT:${reqId}] ⛔ BLOCKED ${req.method} ${req.originalUrl} — IP: ${req.ip}, realIP: ${req.headers['x-forwarded-for'] || req.ip}, remaining 0 of ${options.max} per ${options.windowMs}ms`);
    res.status(options.statusCode).json(options.message);
  },
  skipSuccessfulRequests: false,
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '100kb' }));

// Attach request ID from frontend for cross-reference in logs
app.use('/api', (req, _res, next) => {
  req._reqId = extractReqId(req);
  next();
});

app.use('/api', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/coach', coachRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'NEXUS API is running' });
});

app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use((err, req, res, _next) => {
  const reqId = req._reqId || 'no-id';
  let statusCode = err.statusCode || 500;
  if (err.name === 'ValidationError') statusCode = 400;
  if (err.name === 'CastError') statusCode = 400;
  if (err.code === 11000) statusCode = 409;
  console.error(`[ERROR:${reqId}] ${statusCode} ${req.method} ${req.originalUrl} — ${err.message}`);
  if (process.env.NODE_ENV !== 'production') console.error(`[ERROR:${reqId}] Stack:`, err.stack);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = parseInt(process.env.PORT, 10) || 5000;
const MAX_PORT_ATTEMPTS = 5;

console.log(`[Startup] PORT env: ${process.env.PORT || '(not set)'}`);
console.log(`[Startup] Process PID: ${process.pid}`);
console.log(`[Startup] Attempting to listen on port: ${PORT}`);

async function startServer(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port)
      .on('listening', async () => {
        const addr = server.address();
        const actualPort = addr.port;
        console.log(`[Startup] ✓ Server listening on port ${actualPort} (PID: ${process.pid})`);
        console.log(`[Startup] Environment: ${process.env.NODE_ENV || 'development'}`);

        if (aiService.isConfigured()) {
          const model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3';
          console.log(`[OpenRouter] AI service configured — default model: ${model}`);
        } else {
          console.warn('[OpenRouter] OPENROUTER_API_KEY not set — AI calls will fail until configured');
        }

        console.log('[Phase2] Memory engine: ready');
        console.log('  └─ Storage: MongoDB (8 categories)');
        console.log('  └─ Extraction: regex + AI-powered');
        console.log('  └─ Retrieval: keyword + semantic (embeddings)');
        console.log('  └─ Consolidation: merge + decay + promote');
        console.log('  └─ API: /api/memory (CRUD + search + summary)');
        console.log(`[Phase2] Prompt categories: ${Object.keys(prompts.PROMPT_CATEGORIES).length} loaded`);
        console.log(`[Phase2] Pipeline: Planner → Analyzer → Executor → Reviewer → Formatter`);
        console.log(`[Phase2] Personality engine: active (${Object.keys(require('./personality/engine')).length > 0 ? 'language detection + tone + emoji' : 'loaded'})`);
        console.log('[Startup] NEXUS API ready');

        resolve(server);
      })
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`[Startup] ✗ Port ${port} is in use`);
          reject(err);
        } else {
          console.error(`[Startup] ✗ Failed to start on port ${port}:`, err.message);
          reject(err);
        }
      });
  });
}

(async () => {
  let chosenPort = PORT;

  for (let attempt = 1; attempt <= MAX_PORT_ATTEMPTS; attempt++) {
    try {
      const server = await startServer(chosenPort);
      return;
    } catch (err) {
      if (err.code !== 'EADDRINUSE' || attempt === MAX_PORT_ATTEMPTS) {
        console.error(`[Startup] Could not start server after ${attempt} attempt(s). Exiting.`);
        process.exit(1);
      }
      const nextPort = chosenPort + 1;
      console.warn(`[Startup] Falling back to port ${nextPort} (attempt ${attempt + 1}/${MAX_PORT_ATTEMPTS})`);
      chosenPort = nextPort;
    }
  }
})();
