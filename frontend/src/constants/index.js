export const TIMEFRAMES = [
  { label: '24H', value: '24h' },
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
]

export const MARKET_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Gainers', value: 'gainers' },
  { label: 'Losers', value: 'losers' },
  { label: 'Trending', value: 'trending' },
]

export const SORT_OPTIONS = [
  { label: 'Market Cap', value: 'market_cap' },
  { label: 'Price', value: 'price' },
  { label: '24h Change', value: 'change_24h' },
  { label: 'Volume', value: 'volume' },
]

export const CACHE_TTL = {
  market: 60 * 1000,
  coin: 60 * 1000,
  insights: 5 * 60 * 1000,
  news: 10 * 60 * 1000,
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const ENDPOINTS = {
  market: `${API_BASE_URL}/market`,
  coin: (id) => `${API_BASE_URL}/coins/${id}`,
  insights: (id) => `${API_BASE_URL}/coins/${id}/insights`,
  news: `${API_BASE_URL}/news`,
  alerts: `${API_BASE_URL}/alerts`,
}
