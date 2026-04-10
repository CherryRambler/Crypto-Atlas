import { ENDPOINTS, CACHE_TTL } from '@/constants'
import { cache } from './cache'
import {
  MOCK_COINS,
  MOCK_NEWS,
  MOCK_INSIGHTS,
  generateChartData,
} from './mockData'

const USE_MOCK = false
const MOCK_DELAY = 600

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function apiFetch(url, cacheKey, ttl) {
  if (cacheKey) {
    const cached = cache.get(cacheKey)
    if (cached) return cached
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()

  if (cacheKey && ttl) {
    cache.set(cacheKey, data, ttl)
  }

  return data
}

export async function fetchMarket() {
  if (USE_MOCK) {
    await delay(MOCK_DELAY)
    return MOCK_COINS
  }

  const data = await apiFetch(ENDPOINTS.market, 'market', CACHE_TTL.market)
  // Normalize: mapping 'image' from backend to 'logo' for frontend components
  return data.map((coin) => ({
    ...coin,
    logo: coin.image,
  }))
}

export async function fetchGlobalStats() {
  if (USE_MOCK) {
    await delay(200)
    const totalMarketCap = MOCK_COINS.reduce((sum, coin) => sum + coin.market_cap, 0)
    return {
      total_market_cap: totalMarketCap,
      market_cap_change_percentage_24h_usd: 1.5,
      active_cryptocurrencies: 9000,
    }
  }

  return apiFetch(`${ENDPOINTS.market}/global`, 'global-stats', CACHE_TTL.market)
}

export async function fetchCoin(id, timeframe = '24h') {
  if (USE_MOCK) {
    await delay(MOCK_DELAY)
    const coin = MOCK_COINS.find((item) => item.id === id) || MOCK_COINS[0]
    const chartData = generateChartData(timeframe, coin.price)

    return {
      ...coin,
      description: `${coin.name} is a leading cryptocurrency known for its security and adoption.`,
      max_supply: coin.circulating_supply * 1.05,
      fdv: coin.market_cap * 1.1,
      chartData,
      timeframe,
    }
  }

  const cacheKey = `coin-${id}-${timeframe}`
  const coin = await apiFetch(
    `${ENDPOINTS.coin(id)}?timeframe=${timeframe}`,
    cacheKey,
    CACHE_TTL.coin
  )

  // Normalize: mapping 'image' to 'logo' and 'time' to 'timestamp' in chartData
  return {
    ...coin,
    logo: coin.image,
    chartData: (coin.chartData || []).map((p) => ({
      ...p,
      timestamp: p.time,
    })),
  }
}

export async function fetchInsights(id) {
  if (USE_MOCK) {
    await delay(MOCK_DELAY * 2.5)
    return MOCK_INSIGHTS[id] || MOCK_INSIGHTS.default
  }

  const cacheKey = `insights-${id}`
  const data = await apiFetch(ENDPOINTS.insights(id), cacheKey, CACHE_TTL.insights)

  // Normalize backend insights to match AIInsights.jsx expectations
  // Backend provides { summary, signals, metrics }
  // Frontend expects { sentiment, movement, trend, risk }
  return {
    sentiment: data.summary?.toLowerCase().includes('bullish')
      ? 'bullish'
      : data.summary?.toLowerCase().includes('bearish')
      ? 'bearish'
      : 'neutral',
    movement: data.summary,
    trend: data.signals?.[0]?.detail || 'No clear trend detected.',
    risk: 'Market volatility remains a primary risk factor for this asset.',
  }
}

export async function fetchNews() {
  if (USE_MOCK) {
    await delay(MOCK_DELAY)
    return MOCK_NEWS
  }

  const data = await apiFetch(ENDPOINTS.news, 'news', CACHE_TTL.news)

  // Normalize: mapping backend properties to frontend NewsCard expectations
  return data.map((item) => ({
    ...item,
    time: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Just now',
    summary: item.body || item.title,
    tag: item.tags?.[0] || 'Market',
  }))
}

export async function fetchAlerts() {
  if (USE_MOCK) {
    await delay(200)
    return []
  }

  return apiFetch(ENDPOINTS.alerts, null, null)
}

export async function createAlert(alert) {
  if (USE_MOCK) {
    await delay(300)
    return { ...alert, id: Date.now().toString() }
  }

  const response = await fetch(ENDPOINTS.alerts, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alert),
  })

  if (!response.ok) {
    throw new Error('Failed to create alert')
  }

  return response.json()
}

export async function deleteAlert(id) {
  if (USE_MOCK) {
    await delay(200)
    return { success: true }
  }

  const response = await fetch(`${ENDPOINTS.alerts}/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error('Failed to delete alert')
  }

  return response.json()
}
