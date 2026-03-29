const express = require('express');
const router = express.Router();

const { getTopCoins, getCoinDetail, getGlobalStats } = require('../services/marketService');
const { getCoinInsights } = require('../services/insightsService');
const { getLatestNews } = require('../services/newsService');
const { createAlert, listAlerts, deleteAlert } = require('../services/alertsService');
const { getJobStatus } = require('../jobs/scheduler');
const { successResponse, errorResponse, asyncHandler } = require('../middleware/errorHandler');

// ─── Market ──────────────────────────────────────────────────────────────────

/**
 * GET /api/market
 * Query params: limit (default 50), currency (default usd), page (default 1)
 */
router.get('/market', asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 250);
  const currency = req.query.currency || 'usd';
  const page = parseInt(req.query.page) || 1;

  const coins = await getTopCoins({ limit, currency, page });
  const global = await getGlobalStats().catch(() => null);

  successResponse(res, { coins, global }, {
    count: coins.length,
    currency,
    page,
  });
}));

// ─── Coin Detail ──────────────────────────────────────────────────────────────

/**
 * GET /api/coin/:id
 * Path: coinId (e.g. "bitcoin", "ethereum")
 * Query: currency (default usd)
 */
router.get('/coin/:id', asyncHandler(async (req, res) => {
  const coinId = req.params.id.toLowerCase().trim();
  const currency = req.query.currency || 'usd';

  if (!coinId || coinId.length > 64) {
    return errorResponse(res, 400, 'Invalid coin ID');
  }

  const coin = await getCoinDetail(coinId, currency);
  successResponse(res, coin, { coinId, currency });
}));

// ─── AI Insights ──────────────────────────────────────────────────────────────

/**
 * GET /api/insights/:id
 * Query: beginner=true for beginner-friendly mode
 */
router.get('/insights/:id', asyncHandler(async (req, res) => {
  const coinId = req.params.id.toLowerCase().trim();
  const beginnerMode = req.query.beginner === 'true';

  if (!coinId) return errorResponse(res, 400, 'Invalid coin ID');

  // Need full coin data to analyze
  const coin = await getCoinDetail(coinId);
  const insights = await getCoinInsights(coin, { beginnerMode });

  successResponse(res, insights, { coinId, beginnerMode });
}));

// ─── News ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/news
 * Query: limit (default 30, max 100), category (optional)
 */
router.get('/news', asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 30, 100);
  const category = req.query.category || null;

  const articles = await getLatestNews({ limit, category });

  successResponse(res, articles, { count: articles.length, category: category || 'all' });
}));

// ─── Alerts ───────────────────────────────────────────────────────────────────

/**
 * POST /api/alerts
 * Body: { coinId, coinName?, type, threshold, direction, email? }
 *   type: "price" | "percent_change"
 *   direction: "above" | "below"
 */
router.post('/alerts', asyncHandler(async (req, res) => {
  const { coinId, coinName, type, threshold, direction, email } = req.body;

  const alert = createAlert({
    coinId,
    coinName,
    type,
    threshold: parseFloat(threshold),
    direction,
    email,
  });

  res.status(201).json({
    success: true,
    data: alert,
    meta: { timestamp: new Date().toISOString() },
  });
}));

/**
 * GET /api/alerts
 */
router.get('/alerts', asyncHandler(async (req, res) => {
  const alerts = listAlerts();
  successResponse(res, alerts, { count: alerts.length });
}));

/**
 * DELETE /api/alerts/:id
 */
router.delete('/alerts/:id', asyncHandler(async (req, res) => {
  const result = deleteAlert(req.params.id);
  successResponse(res, result);
}));

// ─── Health / Status ──────────────────────────────────────────────────────────

/**
 * GET /api/health
 * Returns service health and background job status
 */
router.get('/health', (req, res) => {
  const jobStatus = getJobStatus();
  res.json({
    status: 'ok',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    jobs: jobStatus,
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
    },
  });
});

module.exports = router;