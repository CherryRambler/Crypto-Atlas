const cron = require('node-cron');
const { getTopCoins } = require('../services/marketService');
const { getLatestNews } = require('../services/newsService');
const { evaluateAlerts } = require('../services/alertsService');
const { marketCache, newsCache } = require('../utils/cache');
const logger = require('../utils/logger');

// Track job health
const jobStatus = {
  marketRefresh: { lastRun: null, lastSuccess: null, errors: 0 },
  newsRefresh: { lastRun: null, lastSuccess: null, errors: 0 },
  alertCheck: { lastRun: null, lastSuccess: null, errors: 0, triggered: 0 },
};

/**
 * Job 1: Refresh market data every 90 seconds
 * Invalidates cache so next request gets fresh data
 */
async function refreshMarketData() {
  const job = jobStatus.marketRefresh;
  job.lastRun = new Date().toISOString();
  logger.debug('[Job] Refreshing market data...');

  try {
    // Bust the cache keys so next API call fetches fresh
    marketCache.del('market_usd_50_1');

    // Pre-warm the cache by fetching now
    await getTopCoins({ limit: 50 });

    job.lastSuccess = new Date().toISOString();
    job.errors = 0;
    logger.info('[Job] Market data refreshed successfully');
  } catch (err) {
    job.errors++;
    logger.error('[Job] Market data refresh failed', { message: err.message, consecutiveErrors: job.errors });
  }
}

/**
 * Job 2: Refresh news every 5 minutes
 */
async function refreshNews() {
  const job = jobStatus.newsRefresh;
  job.lastRun = new Date().toISOString();
  logger.debug('[Job] Refreshing news...');

  try {
    newsCache.flushAll();
    await getLatestNews({ limit: 30 });

    job.lastSuccess = new Date().toISOString();
    job.errors = 0;
    logger.info('[Job] News refreshed successfully');
  } catch (err) {
    job.errors++;
    logger.error('[Job] News refresh failed', { message: err.message });
  }
}

/**
 * Job 3: Check alert conditions every 60 seconds
 */
async function checkAlerts() {
  const job = jobStatus.alertCheck;
  job.lastRun = new Date().toISOString();

  try {
    const marketData = await getTopCoins({ limit: 50 });
    const triggered = evaluateAlerts(marketData);

    if (triggered.length > 0) {
      job.triggered += triggered.length;
      logger.info(`[Job] ${triggered.length} alert(s) triggered`, {
        alerts: triggered.map(a => ({ id: a.id, coinId: a.coinId, type: a.type })),
      });

      // NOTE: In production, emit events or call a notification service here
      // e.g.: notificationService.sendEmail(triggered)
      //       eventEmitter.emit('alerts:triggered', triggered)
    }

    job.lastSuccess = new Date().toISOString();
    job.errors = 0;
  } catch (err) {
    job.errors++;
    logger.error('[Job] Alert check failed', { message: err.message });
  }
}

/**
 * Start all background jobs
 */
function startJobs() {
  logger.info('Starting background jobs...');

  // Market data: every 90 seconds
  cron.schedule('*/1 * * * *', refreshMarketData); // every minute (90s not supported by cron)

  // News: every 5 minutes
  cron.schedule('*/5 * * * *', refreshNews);

  // Alert checks: every minute
  cron.schedule('* * * * *', checkAlerts);

  logger.info('✅ Background jobs started: [market refresh, news refresh, alert check]');

  // Run immediately on startup
  setTimeout(refreshMarketData, 5000);
  setTimeout(refreshNews, 8000);
}

function getJobStatus() {
  return jobStatus;
}

module.exports = { startJobs, getJobStatus };