const NodeCache = require('node-cache');

// Market data: 60 seconds TTL
const marketCache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

// Coin detail: 90 seconds TTL
const coinCache = new NodeCache({ stdTTL: 90, checkperiod: 45 });

// News: 5 minutes TTL
const newsCache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

// AI insights: 3 minutes TTL (expensive to generate)
const insightsCache = new NodeCache({ stdTTL: 180, checkperiod: 60 });

/**
 * Generic cache wrapper
 * @param {NodeCache} cache
 * @param {string} key
 * @param {Function} fetchFn - async function to fetch data on cache miss
 */
async function getOrSet(cache, key, fetchFn) {
  const cached = cache.get(key);
  if (cached !== undefined) {
    return { data: cached, fromCache: true };
  }
  const data = await fetchFn();
  cache.set(key, data);
  return { data, fromCache: false };
}

module.exports = {
  marketCache,
  coinCache,
  newsCache,
  insightsCache,
  getOrSet,
};