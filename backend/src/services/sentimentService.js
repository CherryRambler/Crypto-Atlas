import axios from 'axios'
import { cache } from '../cache/index.js'
import config from '../config/index.js'

/**
 * Fetches the Crypto Fear & Greed Index from Alternative.me
 *
 * @param {number} limit - Number of historical days to fetch (defaults to 1)
 * @returns {Promise<Object>}
 */
export async function getSentiment(limit = 1) {
  const CACHE_KEY = `sentiment-${limit}`

  const cached = cache.get(CACHE_KEY)
  if (cached) return cached

  const { data } = await axios.get(config.alternativeMe.sentimentUrl, {
    params: { limit, format: 'json' },
  })

  // Normalize data
  const normalized = data.data.map((item) => ({
    value: parseInt(item.value, 10),
    value_classification: item.value_classification,
    timestamp: new Date(item.timestamp * 1000).toISOString(),
    time_until_update: parseInt(item.time_until_update, 10),
  }))

  const result = limit === 1 ? normalized[0] : normalized

  cache.set(CACHE_KEY, result, config.cache.sentiment)
  return result
}
