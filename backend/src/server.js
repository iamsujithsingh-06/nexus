const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const { initializeModel } = require('./config/gemini');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const AppError = require('./utils/AppError');

const memoryManager = require('./memory/manager/memoryManager');
const prompts = require('./prompts');

const app = express();

connectDB();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use('/api', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chats', chatRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'NEXUS API is running' });
});

app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use((err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
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

        try {
          const activeModel = await initializeModel();
          console.log(`Active Gemini model: ${activeModel}`);
        } catch (err) {
          console.error(`[Startup] Model initialization warning (non-fatal): ${err.message}`);
        }

        console.log('[Phase2] Memory engine: ready');
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
