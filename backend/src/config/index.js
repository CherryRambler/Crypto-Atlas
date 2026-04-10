/**
 * Central configuration loaded from environment variables.
 * Import this everywhere instead of reading process.env directly.
 */
const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  coinmarketcap: {
    baseUrl: process.env.COINMARKETCAP_BASE_URL || 'https://pro-api.coinmarketcap.com/v1',
    apiKey: process.env.COINMARKETCAP_API_KEY || '',
  },

  binance: {
    baseUrl: 'https://api.binance.com/api/v3',
  },

  cryptocompare: {
    apiKey: process.env.CRYPTOCOMPARE_API_KEY || '',
    newsUrl: 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN',
  },

  newsapi: {
    apiKey: process.env.NEWS_API_KEY || '',
    baseUrl: 'https://newsapi.org/v2',
  },

  cache: {
    // seconds
    market: 60,
    coin: 60,
    insights: 5 * 60,
    news: 10 * 60,
    sentiment: 60 * 60, // 1 hour
    global: 10 * 60,    // 10 mins
  },

  alternativeMe: {
    sentimentUrl: 'https://api.alternative.me/fng/',
  },
}

export default config
