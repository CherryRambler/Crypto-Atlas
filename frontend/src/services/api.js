import { ENDPOINTS, CACHE_TTL } from '@/constants'
import { cache } from './cache'
import {
  MOCK_COINS,
  MOCK_NEWS,
  MOCK_INSIGHTS,
  generateChartData,
} from './mockData'

const USE_MOCK = true
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

  return apiFetch(ENDPOINTS.market, 'market', CACHE_TTL.market)
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
  return apiFetch(`${ENDPOINTS.coin(id)}?timeframe=${timeframe}`, cacheKey, CACHE_TTL.coin)
}

export async function fetchInsights(id) {
  if (USE_MOCK) {
    await delay(MOCK_DELAY * 2.5)
    return MOCK_INSIGHTS[id] || MOCK_INSIGHTS.default
  }

  const cacheKey = `insights-${id}`
  return apiFetch(ENDPOINTS.insights(id), cacheKey, CACHE_TTL.insights)
}

export async function fetchNews() {
  if (USE_MOCK) {
    await delay(MOCK_DELAY)
    return MOCK_NEWS
  }

  return apiFetch(ENDPOINTS.news, 'news', CACHE_TTL.news)
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
