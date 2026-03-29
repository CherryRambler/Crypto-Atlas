const store = require('../db/store');
const logger = require('../utils/logger');

/**
 * Validate alert creation payload
 */
function validateAlertPayload({ coinId, type, threshold, direction }) {
  const errors = [];
  if (!coinId || typeof coinId !== 'string') errors.push('coinId is required');
  if (!['price', 'percent_change'].includes(type)) errors.push('type must be "price" or "percent_change"');
  if (typeof threshold !== 'number' || isNaN(threshold)) errors.push('threshold must be a number');
  if (!['above', 'below'].includes(direction)) errors.push('direction must be "above" or "below"');
  return errors;
}

/**
 * POST /api/alerts
 * Create a new price or % change alert
 */
function createAlert(payload) {
  const errors = validateAlertPayload(payload);
  if (errors.length > 0) {
    const err = new Error('Validation failed');
    err.statusCode = 400;
    err.details = errors;
    throw err;
  }

  const alert = store.createAlert(payload);
  logger.info('Alert created', { alertId: alert.id, coinId: alert.coinId });
  return alert;
}

/**
 * GET /api/alerts
 * List all alerts
 */
function listAlerts() {
  return store.getAlerts();
}

/**
 * DELETE /api/alerts/:id
 * Delete an alert by ID
 */
function deleteAlert(id) {
  const exists = store.getAlertById(id);
  if (!exists) {
    const err = new Error(`Alert ${id} not found`);
    err.statusCode = 404;
    throw err;
  }
  store.deleteAlert(id);
  logger.info('Alert deleted', { alertId: id });
  return { deleted: true, id };
}

/**
 * Check if a specific alert condition is met given current market data
 */
function checkCondition(alert, coinData) {
  if (alert.triggered) return false; // already fired, skip

  const { type, threshold, direction } = alert;
  let currentValue;

  if (type === 'price') {
    currentValue = coinData.price;
  } else if (type === 'percent_change') {
    currentValue = coinData.change24h;
  }

  if (currentValue == null) return false;

  return direction === 'above'
    ? currentValue >= threshold
    : currentValue <= threshold;
}

/**
 * Evaluate all alerts against freshly fetched market data.
 * Called by the background job.
 * Returns list of triggered alerts.
 */
function evaluateAlerts(marketData) {
  const allAlerts = store.getAlerts().filter(a => !a.triggered);
  if (allAlerts.length === 0) return [];

  // Build quick lookup by coinId
  const coinMap = {};
  for (const coin of marketData) {
    coinMap[coin.id] = coin;
  }

  const triggered = [];

  for (const alert of allAlerts) {
    const coin = coinMap[alert.coinId];
    if (!coin) continue;

    if (checkCondition(alert, coin)) {
      store.markAlertTriggered(alert.id);
      const triggeredAlert = { ...alert, triggered: true, currentValue: alert.type === 'price' ? coin.price : coin.change24h };
      triggered.push(triggeredAlert);

      logger.info('🔔 Alert triggered!', {
        alertId: alert.id,
        coinId: alert.coinId,
        type: alert.type,
        direction: alert.direction,
        threshold: alert.threshold,
        currentValue: triggeredAlert.currentValue,
      });
    }
  }

  return triggered;
}

module.exports = { createAlert, listAlerts, deleteAlert, evaluateAlerts };