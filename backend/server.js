require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./src/utils/logger');
const apiRoutes = require('./src/routes/api');
const { globalErrorHandler, notFoundHandler } = require('./src/middleware/errorHandler');
const { startJobs } = require('./src/jobs/scheduler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 429, message: 'Too many requests. Please slow down.' },
  },
});

const insightsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 429, message: 'AI insights rate limit reached. Please wait a moment.' },
  },
});

app.use('/api/', generalLimiter);
app.use('/api/insights', insightsLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level](`${req.method} ${req.path} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

app.get('/', (req, res) => {
  res.json({
    name: 'CryptoAtlas API',
    version: '1.0.0',
    description: 'Real-time cryptocurrency dashboard backend',
    endpoints: {
      market: 'GET  /api/market',
      coin: 'GET  /api/coin/:id',
      insights: 'GET  /api/insights/:id',
      news: 'GET  /api/news',
      alerts: {
        create: 'POST   /api/alerts',
        list: 'GET    /api/alerts',
        delete: 'DELETE /api/alerts/:id',
      },
      health: 'GET /api/health',
    },
    docs: 'https://github.com/your-org/cryptoatlas',
  });
});

app.use('/api', apiRoutes);
app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  logger.info(`CryptoAtlas API running on http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`CryptoCompare: ${process.env.CRYPTOCOMPARE_API_KEY ? 'configured' : 'using unauthenticated mode'}`);
  logger.info(`Groq AI: ${process.env.GROQ_API_KEY ? 'configured' : 'GROQ_API_KEY not set; insights will use fallback'}`);

  startJobs();
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { message: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: String(reason) });
});

module.exports = app;
