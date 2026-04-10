import axios from 'axios'
import { cache } from '../cache/index.js'
import config from '../config/index.js'

const { baseUrl: cmcBase, apiKey: cmcKey } = config.coinmarketcap
const { baseUrl: binanceBase } = config.binance

function cmcHeaders() {
  return { 'X-CMC_PRO_API_KEY': cmcKey }
}

/**
 * Mapping our timeframe (24h, 7d, etc) to Binance intervals.
 */
const BINANCE_INTERVALS = {
  '24h': '1h',
  '7d': '4h',
  '30d': '1d',
  '90d': '1d',
}

/**
 * Fetches detailed information for a single coin using CMC and charts from Binance.
 *
 * @param {string} id - The slug or symbol of the coin.
 * @param {string} timeframe - 24h|7d|30d|90d
 * @returns {Promise<Object>}
 */
export async function getCoin(id, timeframe = '24h') {
  const CACHE_KEY = `coin-v3-${id}-${timeframe}`
  const cached = cache.get(CACHE_KEY)
  if (cached) return cached

  // 1. Fetch metadata and latest quotes from CMC
  // Using 'slug' as the identifier
  const { data: cmcData } = await axios.get(`${cmcBase}/cryptocurrency/quotes/latest`, {
    headers: cmcHeaders(),
    params: { slug: id.toLowerCase(), convert: 'USD' },
  })

  // CMC returns an object keyed by ID, so we get the first value
  const coinId = Object.keys(cmcData.data)[0]
  const d = cmcData.data[coinId]
  const q = d.quote.USD

  // 2. Fetch Chart Data from Binance
  // Note: Binance requires symbol pairs like BTCUSDT
  const binanceSymbol = `${d.symbol}USDT`
  const interval = BINANCE_INTERVALS[timeframe] || '1h'

  let chartData = []
  try {
    const { data: binanceData } = await axios.get(`${binanceBase}/klines`, {
      params: {
        symbol: binanceSymbol,
        interval: interval,
        limit: 100,
      },
    })

    chartData = binanceData.map((k) => ({
      time: k[0], // Open time
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      price: parseFloat(k[4]),
    }))
  } catch (error) {
    console.warn(`Binance chart fetch failed for ${binanceSymbol}:`, error.message)
    // Fallback or empty chart if Binance doesn't support the pair
  }

  const coin = {
    id: d.slug,
    symbol: d.symbol,
    name: d.name,
    image: `https://s2.coinmarketcap.com/static/img/coins/64x64/${d.id}.png`,
    description: `Leading cryptocurrency ${d.name} listed on major exchanges.`,
    rank: d.cmc_rank,
    price: q.price,
    change_1h: q.percent_change_1h,
    change_24h: q.percent_change_24h,
    change_7d: q.percent_change_7d,
    market_cap: q.market_cap,
    volume: q.volume_24h,
    circulating_supply: d.circulating_supply,
    max_supply: d.max_supply,
    fdv: q.fully_diluted_market_cap,
    chartData,
    timeframe,
  }

  cache.set(CACHE_KEY, coin, config.cache.coin)
  return coin
}

/**
 * Generates rule-based insights (maintained from previous version).
 */
export async function getCoinInsights(id) {
  const CACHE_KEY = `insights-v3-${id}`
  const cached = cache.get(CACHE_KEY)
  if (cached) return cached

  const coin = await getCoin(id, '24h')

  const trend = coin.change_24h >= 0 ? 'bullish' : 'bearish'
  const momentum = Math.abs(coin.change_24h) > 5 ? 'strong' : 'moderate'

  const insights = {
    coinId: id,
    generatedAt: new Date().toISOString(),
    summary: `${coin.name} is showing ${momentum} ${trend} momentum with a ${coin.change_24h.toFixed(2)}% price change.`,
    signals: [
      {
        type: trend === 'bullish' ? 'positive' : 'negative',
        label: 'Trend',
        detail: `Price moved ${coin.change_24h >= 0 ? 'up' : 'down'} ${Math.abs(coin.change_24h).toFixed(2)}%.`,
      },
    ],
    metrics: {
      price: coin.price,
      market_cap: coin.market_cap,
    },
  }

  cache.set(CACHE_KEY, insights, config.cache.insights)
  return insights
}
